import httpx
import asyncio

async def test_backend():
    base_url = "http://localhost:8000"
    async with httpx.AsyncClient(base_url=base_url) as client:
        # Create a new HR user
        res = await client.post("/auth/signup", json={
            "email": "hr_test_profile@example.com",
            "password": "testpassword",
            "role": "hr"
        })
        if res.status_code == 400:
            pass # Already exists
            
        # Login
        res = await client.post("/auth/login", json={
            "email": "hr_test_profile@example.com",
            "password": "testpassword"
        })
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Check profile status
        res = await client.get("/user/profile-status", headers=headers)
        print("Initial HR Profile:", res.json())
        
        # Update profile
        res = await client.post("/user/update-profile", json={
            "company_name": "Test Company",
            "phone": "1234567890"
        }, headers=headers)
        print("Update profile res:", res.json())
        
        # Check profile status again
        res = await client.get("/user/profile-status", headers=headers)
        print("Final HR Profile:", res.json())
        
if __name__ == "__main__":
    asyncio.run(test_backend())
