import motor.motor_asyncio
import asyncio
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

async def test_conn():
    uri = os.getenv("MONGO_URI")
    print(f"Testing URI: {uri}")
    try:
        # Try with certifi first (best practice)
        client = motor.motor_asyncio.AsyncIOMotorClient(uri, tlsCAFile=certifi.where())
        await client.admin.command('ping')
        print("SUCCESS! Connected with certifi.")
    except Exception as e:
        print(f"Certifi failed: {e}")
        try:
            # Fallback to no-verify (Windows hack)
            print("Retrying with tlsAllowInvalidCertificates=True...")
            client = motor.motor_asyncio.AsyncIOMotorClient(uri, tlsAllowInvalidCertificates=True)
            await client.admin.command('ping')
            print("SUCCESS! Connected with insecure TLS.")
        except Exception as e2:
            print(f"ALL FAIL: {e2}")

if __name__ == "__main__":
    asyncio.run(test_conn())
