import uuid
from datetime import datetime, timezone
from loguru import logger
from app.database import db

DEFAULT_LABELS = {
    "HEADER_CORAM": "Header / Coram",
    "FACTS": "Facts",
    "ARGUMENTS": "Arguments",
    "LEGAL_ISSUES": "Legal Issues",
    "ANALYSIS_RATIO": "Analysis / Ratio",
    "FINAL_ORDER": "Final Decision"
}

async def build_and_save_tree(pdf_id: str, parsed_data: dict) -> str:
    """
    Builds a hierarchical tree from parsed judgment sections and saves it to MongoDB.
    The parent node is the context case heading with context summary as text.
    The child nodes are the 6 structural sections.
    """
    if db.database is None or db.nodes is None or db.documents is None:
        logger.error(f"[{pdf_id}] Database not connected - cannot save tree")
        raise RuntimeError("Database connection not initialized")

    tree_id = str(uuid.uuid4())
    parent_node_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    context_heading = parsed_data.get("context_heading") or "Unknown Case"
    context_summary = parsed_data.get("context_summary") or ""

    # 1. Create child nodes from sections
    child_nodes = []
    tree_children_meta = []
    child_node_ids = []

    sections = parsed_data.get("sections", [])
    for sec in sections:
        section_type = sec.get("section_type")
        text = sec.get("text", "") or ""
        heading_found = sec.get("heading_found")

        # Skip sections that are completely empty
        if not text.strip():
            continue

        child_node_id = str(uuid.uuid4())
        child_node_ids.append(child_node_id)

        title = heading_found or DEFAULT_LABELS.get(section_type, section_type)

        child_node = {
            "node_id": child_node_id,
            "pdf_id": pdf_id,
            "tree_id": tree_id,
            "type": "child",
            "section_type": section_type,
            "title": title,
            "text": text,
            "parent_node_id": parent_node_id,
            "child_node_ids": [],
            "created_at": now
        }
        child_nodes.append(child_node)

        tree_children_meta.append({
            "node_id": child_node_id,
            "section_type": section_type,
            "title": title,
            "type": "child"
        })

    # 2. Create parent (root) node
    parent_node = {
        "node_id": parent_node_id,
        "pdf_id": pdf_id,
        "tree_id": tree_id,
        "type": "parent",
        "section_type": "ROOT",
        "title": context_heading,
        "text": context_summary,
        "parent_node_id": None,
        "child_node_ids": child_node_ids,
        "created_at": now
    }

    # 3. Create tree structure document
    tree_document = {
        "tree_id": tree_id,
        "pdf_id": pdf_id,
        "root_node_id": parent_node_id,
        "structure": {
            "node_id": parent_node_id,
            "title": context_heading,
            "type": "parent",
            "children": tree_children_meta
        },
        "created_at": now
    }

    # 4. Save nodes to MongoDB
    logger.info(f"[{pdf_id}] Inserting root node and {len(child_nodes)} child nodes into MongoDB")
    await db.nodes.insert_one(parent_node)
    if child_nodes:
        await db.nodes.insert_many(child_nodes)

    # 5. Save tree to document_trees collection in MongoDB
    logger.info(f"[{pdf_id}] Saving tree structure to document_trees collection")
    await db.database.document_trees.insert_one(tree_document)

    # 6. Update document metadata in db.documents
    total_nodes = len(child_nodes) + 1
    await db.documents.update_one(
        {"pdf_id": pdf_id},
        {"$set": {
            "tree_id": tree_id,
            "root_node_id": parent_node_id,
            "total_nodes": total_nodes,
            "status": "complete"  # Move status to complete since parsing + tree building is finished
        }}
    )
    logger.info(f"[{pdf_id}] Tree build completed. Total nodes: {total_nodes}")
    return tree_id
