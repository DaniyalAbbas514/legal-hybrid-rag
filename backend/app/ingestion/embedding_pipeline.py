from datetime import datetime, timezone
from app.database import db
from app.embeddings.embedding_generator import EmbeddingGenerator
from app.vectorstore.chroma_store import chroma_store
from loguru import logger

async def run_embedding_pipeline(pdf_id: str = None, force_regenerate: bool = False) -> dict:
    """
    Idempotent embedding generation pipeline.
    Loads nodes from MongoDB nodes collection, batch generates embeddings,
    saves vectors in ChromaDB, and creates mapping database records in MongoDB.
    """
    if db.database is None:
        raise RuntimeError("Database connection not initialized")
        
    # 1. Clear database mappings & Chroma collections if force_regenerate is True
    if force_regenerate:
        logger.info(f"Force regenerate enabled. Clearing existing records for pdf_id={pdf_id}...")
        if pdf_id:
            await db.database.embedding_mappings.delete_many({"file_id": pdf_id})
            chroma_store.delete_by_file_id(pdf_id)
        else:
            await db.database.embedding_mappings.delete_many({})
            try:
                chroma_store.collection.delete() # Clears all
            except Exception as e:
                logger.warning(f"Error dropping Chroma collection during reset: {e}")
                
    # 2. Query nodes from MongoDB
    query = {}
    if pdf_id:
        query["pdf_id"] = pdf_id
        
    cursor = db.database.nodes.find(query)
    
    nodes_processed = 0
    embeddings_created = 0
    documents_processed_set = set()
    
    generator = EmbeddingGenerator()
    
    # Batch variables
    batch_nodes = []
    batch_texts = []
    batch_size = 32
    
    async def process_batch(nodes: list[dict], texts: list[str]):
        if not nodes:
            return
            
        logger.info(f"Processing batch of {len(nodes)} nodes...")
        # Generate batch embeddings
        vectors = generator.generate_embeddings(texts)
        
        node_ids = []
        metadatas = []
        documents = []
        mapping_docs = []
        
        for idx, node in enumerate(nodes):
            node_id = node["node_id"]
            file_id = node.get("pdf_id") or ""
            parent_node_id = node.get("parent_node_id") or ""
            
            # Level 1 for root parent node, level 2 for children structural nodes
            level = 1 if node.get("type") == "parent" else 2
            heading = node.get("title") or ""
            
            node_ids.append(node_id)
            metadatas.append({
                "node_id": node_id,
                "file_id": file_id,
                "parent_node_id": parent_node_id,
                "level": level,
                "heading": heading
            })
            documents.append(texts[idx])
            
            # Construct mapping record
            mapping = {
                "node_id": node_id,
                "file_id": file_id,
                "tree_id": node.get("tree_id") or "",
                "parent_node_id": parent_node_id,
                "level": level,
                "heading": heading,
                "vector_store": "chroma",
                "model": "BAAI/bge-small-en-v1.5",
                "vector_id": node_id,
                "created_at": datetime.now(timezone.utc)
            }
            mapping_docs.append(mapping)
            
        # Store in ChromaDB
        chroma_store.add_node_embeddings(
            node_ids=node_ids,
            embeddings=vectors,
            metadatas=metadatas,
            documents=documents
        )
        
        # Store mappings in MongoDB (idempotent upsert by node_id)
        for doc in mapping_docs:
            await db.database.embedding_mappings.update_one(
                {"node_id": doc["node_id"]},
                {"$set": doc},
                upsert=True
            )
            
    async for node in cursor:
        node_id = node["node_id"]
        file_id = node.get("pdf_id") or ""
        documents_processed_set.add(file_id)
        
        # Check existing map to avoid duplicates and support resume-on-interrupt
        existing = await db.database.embedding_mappings.find_one({"node_id": node_id})
        if existing:
            nodes_processed += 1
            continue
            
        heading = node.get("title") or ""
        content = node.get("text") or ""
        
        # STEP 2: Create Embedding Text format f"{heading}\n\n{content}"
        embedding_text = f"{heading}\n\n{content}" if content else heading
        
        batch_nodes.append(node)
        batch_texts.append(embedding_text)
        
        if len(batch_nodes) >= batch_size:
            await process_batch(batch_nodes, batch_texts)
            embeddings_created += len(batch_nodes)
            nodes_processed += len(batch_nodes)
            batch_nodes = []
            batch_texts = []
            
    # Process remaining batch
    if batch_nodes:
        await process_batch(batch_nodes, batch_texts)
        embeddings_created += len(batch_nodes)
        nodes_processed += len(batch_nodes)
        
    # Write connection mappings to JSON files in backend/app/connection
    import os
    import json
    from pathlib import Path
    
    connection_json_dir = Path("c:/Projects/legal-hybrid-rag/backend/app/connection")
    connection_json_dir.mkdir(parents=True, exist_ok=True)
    
    for doc_id in documents_processed_set:
        mappings_cursor = db.database.embedding_mappings.find({"file_id": doc_id})
        mappings_list = []
        vectors_list = []
        async for m in mappings_cursor:
            m["_id"] = str(m["_id"])
            if "created_at" in m and isinstance(m["created_at"], datetime):
                m["created_at"] = m["created_at"].isoformat()
            
            # Fetch corresponding node data to include full embedded text and tree details
            node_doc = await db.database.nodes.find_one({"node_id": m["node_id"]})
            embedding_text = ""
            if node_doc:
                heading = node_doc.get("title") or ""
                content = node_doc.get("text") or ""
                embedding_text = f"{heading}\n\n{content}" if content else heading
                m["embedding_text"] = embedding_text
                
                m["treeid"] = node_doc.get("tree_id") or ""
                m["pdfid"] = node_doc.get("pdf_id") or m.get("file_id") or ""
                m["nodeid"] = node_doc.get("node_id") or m.get("node_id") or ""
                m["embedding_id"] = m.get("vector_id") or m.get("node_id") or ""
            else:
                m["treeid"] = m.get("tree_id") or ""
                m["pdfid"] = m.get("file_id") or ""
                m["nodeid"] = m.get("node_id") or ""
                m["embedding_id"] = m.get("vector_id") or m.get("node_id") or ""
            
            # Provide exact field names for all mapping variants (dash, underscore, and space)
            m["embedding id"] = m["embedding_id"]
            m["pdf_id"] = m["pdfid"]
            m["node_id"] = m["nodeid"]
            m["tree_id"] = m["treeid"]
                
            mappings_list.append(m)
            
            # Retrieve the embedding vector from ChromaDB
            try:
                chroma_data = chroma_store.collection.get(ids=[m["node_id"]], include=["embeddings"])
                embeddings = chroma_data.get("embeddings") if chroma_data else None
                if embeddings is not None and len(embeddings) > 0:
                    vector = embeddings[0]
                    if hasattr(vector, "tolist"):
                        vector = vector.tolist()
                    elif not isinstance(vector, list):
                        vector = list(vector)
                else:
                    vector = []
            except Exception as e:
                logger.error(f"Failed to fetch vector from Chroma for node {m['node_id']}: {e}")
                vector = []
                
            vectors_list.append({
                "nodeid": m["node_id"],
                "text": embedding_text,
                "embedding": vector
            })
            
        json_file_path = connection_json_dir / f"{doc_id}_mappings.json"
        vector_file_path = connection_json_dir / f"{doc_id}_vectors.json"
        try:
            with open(json_file_path, "w", encoding="utf-8") as f:
                json.dump(mappings_list, f, indent=2, ensure_ascii=False)
            logger.info(f"Successfully generated connection mapping JSON: {json_file_path}")
        except Exception as e:
            logger.error(f"Failed to save connection mapping JSON to {connection_json_dir} for file {doc_id}: {e}")
            
        try:
            with open(vector_file_path, "w", encoding="utf-8") as f:
                json.dump(vectors_list, f, indent=2, ensure_ascii=False)
            logger.info(f"Successfully generated vector embedding JSON: {vector_file_path}")
        except Exception as e:
            logger.error(f"Failed to save vector embedding JSON to {connection_json_dir} for file {doc_id}: {e}")
            
    return {
        "documents_processed": len(documents_processed_set),
        "nodes_processed": nodes_processed,
        "embeddings_created": embeddings_created,
        "vector_store": "chroma",
        "status": "success"
    }
