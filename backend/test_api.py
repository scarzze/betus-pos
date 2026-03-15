import requests

try:
    print('Testing STK Push')
    res = requests.post('http://localhost:8000/api/mpesa/test-credentials')
    print('Test Credentials:', res.status_code, res.text)
except Exception as e:
    print('Err:', e)
