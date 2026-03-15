import urllib.request
import urllib.error
import json

try:
    req = urllib.request.Request("http://localhost:8000/api/sales")
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req) as res:
        print("GET /api/sales:", res.status, res.read().decode())
except urllib.error.HTTPError as e:
    print("HTTPError:", e.code, e.read().decode())
except Exception as e:
    print("Error:", e)
