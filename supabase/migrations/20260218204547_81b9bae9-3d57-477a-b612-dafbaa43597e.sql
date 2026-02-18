
-- M-Pesa logs table
CREATE TABLE public.mpesa_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id),
  phone_number TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  merchant_request_id TEXT,
  checkout_request_id TEXT,
  mpesa_receipt_number TEXT,
  transaction_date TEXT,
  result_code INTEGER,
  result_desc TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mpesa_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view mpesa logs" ON public.mpesa_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can insert mpesa logs" ON public.mpesa_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update mpesa logs" ON public.mpesa_logs
  FOR UPDATE TO authenticated
  USING (true);

CREATE TRIGGER update_mpesa_logs_updated_at BEFORE UPDATE ON public.mpesa_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
