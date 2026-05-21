from sentence_transformers import SentenceTransformer

# Initialize the embedding model once
model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embeddings(chunks: list[str]):
    """
    Generate embedding vectors for a list of text chunks.
    """
    return model.encode(chunks)

def get_model():
    """
    Get the underlying SentenceTransformer model instance.
    """
    return model
