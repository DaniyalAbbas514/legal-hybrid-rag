import sys
import asyncio
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path("c:/Projects/legal-hybrid-rag/backend")
sys.path.append(str(backend_path))

from app.database import db, connect_db, close_db

async def main():
    await connect_db()
    node = await db.nodes.find_one({"node_id": "d6eafe81-e0b7-4a00-9903-a693de812bf8"})
    print("\n=== RETRIEVED NODE ===")
    print(f"node_id: {node.get('node_id')}")
    print(f"type: {node.get('type')}")
    print(f"section_type: {node.get('section_type')}")
    print(f"title: '{node.get('title')}'")
    print(f"text: '{node.get('text')}'")
    await close_db()

if __name__ == "__main__":
    asyncio.run(main())
