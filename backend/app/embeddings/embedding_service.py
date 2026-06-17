from app.database import db
from app.embeddings.embedding_generator import EmbeddingGenerator
from app.vectorstore.chroma_store import chroma_store
from loguru import logger

class EmbeddingService:
    def __init__(self):
        self.generator = EmbeddingGenerator()
        
    def get_query_embedding(self, query: str) -> list[float]:
        return self.generator.generate_embeddings([query])[0]
        
    async def retrieve_semantic_context(self, query: str, limit: int = 5) -> list[dict]:
        """
        Flow:
        Query -> Embed query -> ChromaDB Search -> Mapping lookup -> MongoDB fetch -> Parent Traversal -> Context
        """
        if db.database is None:
            logger.error("MongoDB is not connected. Cannot perform semantic search.")
            return []
            
        # 1. Generate query embedding
        query_vector = self.get_query_embedding(query)
        
        # 2. ChromaDB Cosine Search
        chroma_results = chroma_store.similarity_search_by_vector(query_vector, limit=limit)
        
        results = []
        for result in chroma_results:
            node_id = result["node_id"]
            score = result["score"]
            
            # 3. Retrieve structural node from MongoDB (Source of Truth)
            node = await db.database.nodes.find_one({"node_id": node_id})
            if not node:
                logger.warning(f"Chroma returned node_id {node_id} but it was not found in MongoDB nodes collection.")
                continue
                
            # 4. Perform recursive parent traversal to recover context
            context_path = await self.get_recursive_parent_path(node)
            
            # Construct structured legal context text from path
            context_text_list = []
            for path_node in context_path:
                heading = path_node.get("heading") or ""
                content = path_node.get("content") or ""
                if content:
                    context_text_list.append(f"### {heading}\n{content}")
                else:
                    context_text_list.append(f"### {heading}")
            structured_context = "\n\n".join(context_text_list)
            
            results.append({
                "node_id": node_id,
                "score": score,
                "heading": node.get("title", ""),
                "content": node.get("text", ""),
                "file_id": node.get("pdf_id", ""),
                "context_path": context_path,
                "structured_context": structured_context
            })
            
        return results

    async def get_recursive_parent_path(self, node: dict) -> list[dict]:
        """
        Traverse upwards from the matched node to the root parent node.
        """
        path = []
        curr = node
        visited_nodes = set() # Prevent cyclic loops
        
        while curr:
            node_id = curr.get("node_id")
            if node_id in visited_nodes:
                logger.warning(f"Cyclic parent reference detected at node: {node_id}")
                break
            visited_nodes.add(node_id)
            
            level = 1 if curr.get("type") == "parent" else 2
            path.insert(0, {
                "node_id": node_id,
                "heading": curr.get("title") or "",
                "content": curr.get("text") or "",
                "level": level,
                "type": curr.get("type") or "child"
            })
            
            parent_id = curr.get("parent_node_id")
            if not parent_id:
                break
            curr = await db.database.nodes.find_one({"node_id": parent_id})
            
        return path
