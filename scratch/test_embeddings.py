import asyncio
import httpx
from pymongo import MongoClient

def check_mongo_indexes():
    print("Checking MongoDB indexes...")
    client = MongoClient("mongodb://localhost:27017")
    db = client["legal_rag"]
    
    # Check nodes indexes
    print("Nodes indexes:")
    for index in db.nodes.list_indexes():
        print(f"  - {index['name']}: keys={index['key']}")
        
    # Check embedding_mappings indexes
    print("Embedding Mappings indexes:")
    for index in db.embedding_mappings.list_indexes():
        print(f"  - {index['name']}: keys={index['key']}")

async def test_generate_and_search():
    async with httpx.AsyncClient(timeout=60.0) as client:
        # 1. Trigger generate endpoint
        print("\nTriggering /embeddings/generate with force_regenerate...")
        res = await client.post("http://localhost:5000/embeddings/generate", json={"force_regenerate": True})
        print("Status Code:", res.status_code)
        print("Response:", res.json())
        
        # 2. Trigger search endpoint
        print("\nTriggering /embeddings/search...")
        query = "What is the facts of the case or petition details?"
        res = await client.post("http://localhost:5000/embeddings/search", json={"query": query, "limit": 2})
        print("Status Code:", res.status_code)
        search_res = res.json()
        print("Search Results count:", len(search_res.get("results", [])))
        for idx, item in enumerate(search_res.get("results", [])):
            print(f"\nResult {idx+1}:")
            print(f"  Node ID: {item['node_id']}")
            print(f"  Score: {item['score']}")
            print(f"  Heading: {item['heading']}")
            print(f"  Structured Context Path:")
            for step in item.get("context_path", []):
                print(f"    - Level {step['level']} [{step['type']}]: {step['heading']}")

def main():
    check_mongo_indexes()
    asyncio.run(test_generate_and_search())

if __name__ == "__main__":
    main()
