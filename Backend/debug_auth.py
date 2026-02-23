import urllib.request
import urllib.error
import json
import traceback

BASE_URL = "http://localhost:8000"

def run_test():
    # 1. Signup HR
    hr_email = "debug_hr_test_v2@example.com" # v2 to avoid collision if run multiple times
    hr_password = "password123"
    
    signup_data = {
        "email": hr_email,
        "password": hr_password,
        "role": "hr"
    }

    token = None

    try:
        print("--- 1. Signing up HR ---")
        req = urllib.request.Request(f"{BASE_URL}/auth/signup", 
                                     data=json.dumps(signup_data).encode('utf-8'), 
                                     headers={'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req) as response:
                print(f"Signup Status: {response.status}")
                print(response.read().decode())
        except urllib.error.HTTPError as e:
            if e.code == 400: # Probably already exists
                print("User likely already exists, proceeding to login.")
            else:
                print(f"Signup Failed: {e.code} {e.read().decode()}")
                # Don't return, try login, maybe it was created
        
        # 2. Login
        print("\n--- 2. Logging in ---")
        login_data = {"email": hr_email, "password": hr_password}
        req = urllib.request.Request(f"{BASE_URL}/auth/login", 
                                     data=json.dumps(login_data).encode('utf-8'), 
                                     headers={'Content-Type': 'application/json'})
        
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            print("Login Success")
            token = data.get("access_token")
            print(f"Token received: {token[:20]}...")

        if not token:
            print("No token received!")
            return

        # 3. Create JD
        print("\n--- 3. Creating JD ---")
        jd_data = {
            "title": "Debug Job",
            "requirements": "Debug Requirements",
            "skills": ["Python", "Debugging"]
        }
        
        # Make sure to send the token in the Authorization header
        req = urllib.request.Request(f"{BASE_URL}/hr/create-jd", 
                                     data=json.dumps(jd_data).encode('utf-8'), 
                                     headers={
                                         'Content-Type': 'application/json',
                                         'Authorization': f'Bearer {token}'
                                     })
        
        with urllib.request.urlopen(req) as response:
            print(f"Create JD Status: {response.status}")
            print(response.read().decode())

    except urllib.error.HTTPError as e:
        print(f"Request Failed: {e.code}")
        print(e.read().decode())
    except Exception:
        traceback.print_exc()

if __name__ == "__main__":
    run_test()
