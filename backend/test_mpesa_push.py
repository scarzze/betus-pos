from app.services.mpesa_service import stk_push
import sys

def test_push(phone):
    print(f"Initiating STK Push to {phone}...")
    try:
        # Use a dummy reference
        response = stk_push(phone, 1, "TEST_REFERENCE")
        print("M-Pesa Response:")
        print(response)
        
        if response.get("ResponseCode") == "0":
            print("\n✅ SUCCESS: STK Push initiated. Check your phone!")
        else:
            print("\n❌ FAILED: Check your M-Pesa credentials in config.py")
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_mpesa_push.py 2547XXXXXXXX")
    else:
        test_push(sys.argv[1])
