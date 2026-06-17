import torch
from sentence_transformers import SentenceTransformer
from loguru import logger

class EmbeddingGenerator:
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(EmbeddingGenerator, cls).__new__(cls)
            cls._instance._model = None
        return cls._instance
        
    @property
    def model(self) -> SentenceTransformer:
        if self._model is None:
            device = "cuda" if torch.cuda.is_available() else "cpu"
            logger.info(f"Loading SentenceTransformer model 'BAAI/bge-small-en-v1.5' on {device}...")
            try:
                # Load the model BAAI/bge-small-en-v1.5
                self._model = SentenceTransformer("BAAI/bge-small-en-v1.5", device=device)
                logger.info("SentenceTransformer model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load SentenceTransformer model: {e}")
                raise e
        return self._model
        
    def generate_embeddings(self, texts: list[str], batch_size: int = 32) -> list[list[float]]:
        if not texts:
            return []
            
        try:
            # Batch encode texts
            embeddings = self.model.encode(
                texts,
                batch_size=batch_size,
                show_progress_bar=False,
                convert_to_numpy=True
            )
            return embeddings.tolist()
        except Exception as e:
            logger.error(f"Error during embedding generation: {e}")
            raise e
