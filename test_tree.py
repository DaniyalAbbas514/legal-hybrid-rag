import sys
from pathlib import Path
import asyncio
import json

# Add backend directory to sys.path
backend_path = Path("c:/Projects/legal-hybrid-rag/backend")
sys.path.append(str(backend_path))

from app.database import db, connect_db, close_db
from app.ingestion.tree_builder import build_and_save_tree

async def test_tree_construction():
    print("Testing Hierarchical Document Tree Building and Storage...")

    # Initialize DB connection
    await connect_db()
    if not db.is_connected:
        print("Error: MongoDB is not connected. Make sure MongoDB is running.")
        sys.exit(1)
        
    print("Connected to MongoDB successfully.")

    # 1. Load a known parsed sections JSON file from backend/uploads
    # We will look for any sections.json file in uploads
    uploads_dir = backend_path / "uploads"
    sections_files = list(uploads_dir.glob("*_sections.json"))
    if not sections_files:
        print("Error: No parsed sections.json files found in uploads. Run test_runner.py first.")
        await close_db()
        sys.exit(1)

    test_file = sections_files[0]
    # Extract the pdf_id from the filename (e.g. prefix before '_sections.json')
    pdf_id = test_file.name.replace("_sections.json", "")
    print(f"Using test file: {test_file.name} (pdf_id: {pdf_id})")

    parsed_data = json.loads(test_file.read_text(encoding="utf-8", errors="ignore"))

    # Ensure document entry exists in db.documents so update_one doesn't fail silently
    doc_entry = await db.documents.find_one({"pdf_id": pdf_id})
    if not doc_entry:
        print(f"Creating mock document entry for pdf_id {pdf_id} in db.documents...")
        await db.documents.insert_one({
            "pdf_id": pdf_id,
            "filename": f"{pdf_id}.pdf",
            "status": "parsing"
        })

    # 2. Build the tree
    print("Building and saving tree...")
    try:
        # Delete any existing tree/nodes for this pdf_id first to clean the test state
        await db.nodes.delete_many({"pdf_id": pdf_id})
        await db.database.document_trees.delete_many({"pdf_id": pdf_id})

        tree_id = await build_and_save_tree(pdf_id, parsed_data)
        print(f"Tree built and saved! tree_id: {tree_id}")

        # 3. Retrieve and verify tree document
        tree_doc = await db.database.document_trees.find_one({"tree_id": tree_id})
        assert tree_doc is not None, "Tree document not found in document_trees collection!"
        print("\nVerified Tree Document:")
        print(f"  pdf_id: {tree_doc.get('pdf_id')}")
        print(f"  root_node_id: {tree_doc.get('root_node_id')}")
        print(f"  Structure root title: {tree_doc.get('structure', {}).get('title')}")
        print(f"  Structure children count: {len(tree_doc.get('structure', {}).get('children', []))}")

        # 4. Retrieve and verify nodes
        root_node = await db.nodes.find_one({"node_id": tree_doc.get("root_node_id")})
        assert root_node is not None, "Root node not found in nodes collection!"
        print("\nVerified Root Node:")
        print(f"  title: {root_node.get('title')}")
        print(f"  type: {root_node.get('type')}")
        print(f"  child_node_ids: {root_node.get('child_node_ids')}")

        child_nodes = await db.nodes.find({"parent_node_id": root_node.get("node_id")}).to_list(length=None)
        print(f"\nVerified {len(child_nodes)} Child Nodes:")
        for idx, child in enumerate(child_nodes):
            print(f"  Child {idx+1}: type={child.get('type')}, section_type={child.get('section_type')}, title='{child.get('title')}', char_count={len(child.get('text', ''))}")

        # 5. Check db.documents is updated
        updated_doc = await db.documents.find_one({"pdf_id": pdf_id})
        print("\nVerified Updated Document entry:")
        print(f"  status: {updated_doc.get('status')}")
        print(f"  tree_id: {updated_doc.get('tree_id')}")
        print(f"  root_node_id: {updated_doc.get('root_node_id')}")
        print(f"  total_nodes: {updated_doc.get('total_nodes')}")
        
        assert updated_doc.get("status") == "complete", "Document status should be complete"
        assert updated_doc.get("total_nodes") == len(child_nodes) + 1, "total_nodes count mismatch"

        print("\nAll database checks passed successfully! Tree and nodes linked correctly.")

    except Exception as e:
        print(f"Test failed with exception: {e}")
        import traceback
        traceback.print_exc()
    finally:
        await close_db()

if __name__ == "__main__":
    asyncio.run(test_tree_construction())
