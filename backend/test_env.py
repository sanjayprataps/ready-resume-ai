"""
Test script to verify environment variables are loaded correctly
"""

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("GROQ_API_KEY")

print("\n=== Environment Variable Check ===")
if api_key:
    print(f"API Key found: {api_key[:8]}...")
    print(f"API Key length: {len(api_key)}")
    print(f"API Key contains quotes: {api_key.startswith('\"') or api_key.startswith('\'')}")
    print(f"API Key contains whitespace: {api_key.strip() != api_key}")
else:
    print("No API key found in environment variables!")

# Print current working directory and .env file info
print(f"\n=== File System Check ===")
print(f"Current working directory: {os.getcwd()}")
env_path = os.path.join(os.getcwd(), '.env')
print(f"Looking for .env file in: {env_path}")
print(f".env file exists: {os.path.exists(env_path)}")

# Try to read .env file directly
if os.path.exists(env_path):
    print("\n=== .env File Contents ===")
    with open(env_path, 'r') as f:
        for line in f:
            if 'GROQ_API_KEY' in line:
                # Mask the key but show the format
                masked_line = line.replace(api_key, '********') if api_key else line
                print(f"Found API key line: {masked_line.strip()}") 