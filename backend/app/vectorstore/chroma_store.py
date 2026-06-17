import os
import chromadb
from pathlib import Path
from app.config import settings
from loguru import logger

class ChromaStore:
    def __init__(self):
        # Configure local persistent storage path
        db_path = getattr(settings, "CHROMA_DB_PATH", None)
        if not db_path:
            db_path = str(Path(__file__).resolve().parents[2] / "chroma_db")
            
        logger.info(f"Initializing persistent ChromaDB client at: {db_path}")
        try:
            self.client = chromadb.PersistentClient(path=db_path)
            self.collection = self.client.get_or_create_collection(
                name="legal_embeddings",
                metadata={"hnsw:space": "cosine"}
            )
            logger.info("ChromaDB persistent client collection 'legal_embeddings' initialized.")
        except Exception as e:
            logger.error(f"Error initializing ChromaDB PersistentClient: {e}")
            raise e
            
    def add_node_embeddings(
        self,
        node_ids: list[str],
        embeddings: list[list[float]],
        metadatas: list[dict],
        documents: list[str]
    ):
        if not node_ids:
            return
            
        try:
            # Ensure metadatas contain only strings, numbers or booleans
            sanitized_metadatas = []
            for meta in metadatas:
                sanitized = {
                    "node_id": str(meta.get("node_id", "")),
                    "file_id": str(meta.get("file_id", "")),
                    "parent_node_id": str(meta.get("parent_node_id", "") or ""),
                    "level": int(meta.get("level", 0)),
                    "heading": str(meta.get("heading", ""))
                }
                sanitized_metadatas.append(sanitized)
                
            self.collection.add(
                ids=node_ids,
                embeddings=embeddings,
                metadatas=sanitized_metadatas,
                documents=documents
            )
            logger.info(f"Successfully added {len(node_ids)} vectors to ChromaDB.")
        except Exception as e:
            logger.error(f"Error adding vectors to ChromaDB: {e}")
            raise e
            
    def similarity_search_by_vector(self, query_vector: list[float], limit: int = 5) -> list[dict]:
        try:
            results = self.collection.query(
                query_embeddings=[query_vector],
                n_results=limit
            )
            
            retrieved = []
            if not results or not results.get("ids") or len(results["ids"]) == 0:
                return retrieved
                
            ids = results["ids"][0]
            distances = results.get("distances", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            documents = results.get("documents", [[]])[0]
            
            for idx in range(len(ids)):
                # Chroma returns distance (e.g. L2 distance or 1 - cosine_similarity).
                # For cosine distance, similarity is 1.0 - distance.
                dist = distances[idx] if distances else 0.0
                score = 1.0 - dist
                
                retrieved.append({
                    "node_id": ids[idx],
                    "score": float(score),
                    "metadata": metadatas[idx] if metadatas else {},
                    "text": documents[idx] if documents else ""
                })
                
            return retrieved
        except Exception as e:
            logger.error(f"Error during similarity search in ChromaDB: {e}")
            raise e
            
    def delete_by_file_id(self, file_id: str):
        try:
            self.collection.delete(where={"file_id": file_id})
            logger.info(f"Deleted vector records in Chroma for file_id: {file_id}")
        except Exception as e:
            logger.error(f"Error deleting Chroma vectors for file_id {file_id}: {e}")
            raise e

    def delete_by_node_id(self, node_id: str):
        try:
            self.collection.delete(ids=[node_id])
            logger.info(f"Deleted vector record in Chroma for node_id: {node_id}")
        except Exception as e:
            logger.error(f"Error deleting Chroma vector for node_id {node_id}: {e}")
            raise e

chroma_store = ChromaStore()
