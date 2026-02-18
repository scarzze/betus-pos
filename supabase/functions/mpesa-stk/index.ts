import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getMpesaToken() {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY")!;
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET")!;
  const auth = btoa(`${consumerKey}:${consumerSecret}`);

  const res = await fetch(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  const data = await res.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split("/").pop();

  try {
    // STK Push endpoint
    if (path === "mpesa-stk" && req.method === "POST") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace("Bearer ", "");
      const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
      if (claimsError || !claims?.claims) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { phone, amount, sale_id } = await req.json();
      if (!phone || !amount) {
        return new Response(JSON.stringify({ error: "Phone and amount required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const accessToken = await getMpesaToken();
      const shortcode = Deno.env.get("MPESA_SHORTCODE") || "174379";
      const passkey = Deno.env.get("MPESA_PASSKEY") || "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";
      const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);
      const password = btoa(`${shortcode}${passkey}${timestamp}`);

      const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mpesa-stk/callback`;

      // Format phone: 07xxx -> 2547xxx
      let formattedPhone = phone.replace(/\s+/g, "");
      if (formattedPhone.startsWith("0")) {
        formattedPhone = "254" + formattedPhone.slice(1);
      } else if (formattedPhone.startsWith("+")) {
        formattedPhone = formattedPhone.slice(1);
      }

      const stkRes = await fetch(
        "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            BusinessShortCode: shortcode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: Math.round(amount),
            PartyA: formattedPhone,
            PartyB: shortcode,
            PhoneNumber: formattedPhone,
            CallBackURL: callbackUrl,
            AccountReference: "VinLexPOS",
            TransactionDesc: "Payment for goods",
          }),
        }
      );

      const stkData = await stkRes.json();

      // Log to mpesa_logs using service role
      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await adminClient.from("mpesa_logs").insert({
        sale_id: sale_id || null,
        phone_number: formattedPhone,
        amount,
        merchant_request_id: stkData.MerchantRequestID,
        checkout_request_id: stkData.CheckoutRequestID,
        status: stkData.ResponseCode === "0" ? "pending" : "failed",
        result_desc: stkData.ResponseDescription || stkData.errorMessage,
      });

      return new Response(JSON.stringify(stkData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Callback endpoint (from Safaricom)
    if (path === "callback" && req.method === "POST") {
      const body = await req.json();
      const callback = body.Body?.stkCallback;

      if (!callback) {
        return new Response("OK", { status: 200 });
      }

      const adminClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const checkoutRequestId = callback.CheckoutRequestID;
      const resultCode = callback.ResultCode;
      const resultDesc = callback.ResultDesc;

      let receiptNumber = "";
      let transactionDate = "";

      if (resultCode === 0 && callback.CallbackMetadata?.Item) {
        for (const item of callback.CallbackMetadata.Item) {
          if (item.Name === "MpesaReceiptNumber") receiptNumber = item.Value;
          if (item.Name === "TransactionDate") transactionDate = String(item.Value);
        }
      }

      // Update mpesa_logs
      const { data: logEntry } = await adminClient
        .from("mpesa_logs")
        .update({
          result_code: resultCode,
          result_desc: resultDesc,
          mpesa_receipt_number: receiptNumber,
          transaction_date: transactionDate,
          status: resultCode === 0 ? "completed" : "failed",
        })
        .eq("checkout_request_id", checkoutRequestId)
        .select("sale_id")
        .single();

      // Update sale status if payment succeeded
      if (resultCode === 0 && logEntry?.sale_id) {
        await adminClient
          .from("sales")
          .update({ status: "paid" })
          .eq("id", logEntry.sale_id);
      }

      return new Response("OK", { status: 200 });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
