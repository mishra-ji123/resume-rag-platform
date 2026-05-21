import os
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct, Filter, FieldCondition, MatchValue

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
client = None

if QDRANT_URL:
    try:
        temp_client = QdrantClient(url=QDRANT_URL, timeout=1.0)
        temp_client.get_collections()
        client = temp_client
        print(f"Connected to remote Qdrant server at {QDRANT_URL}")
    except Exception:
        print(f"Failed to connect to remote Qdrant at {QDRANT_URL}. Falling back to local storage.")

if client is None:
    # Use local persistent storage if Qdrant URL is not specified or unreachable
    client = QdrantClient(path="qdrant_db")

COLLECTION_NAME = "resumes"

def create_collection():
    collections = client.get_collections().collections
    names = [c.name for c in collections]

    if COLLECTION_NAME not in names:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE
            )
        )

def store_embeddings(doc_id, file_name, chunks, embeddings):
    create_collection()
    points = []

    for i, embedding in enumerate(embeddings):
        points.append(
            PointStruct(
                id=(doc_id * 1000) + i,
                vector=embedding.tolist() if hasattr(embedding, "tolist") else embedding,
                payload={
                    "doc_id": doc_id,
                    "file_name": file_name,
                    "chunk_id": i,
                    "chunk_text": chunks[i]
                }
            )
        )

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=points
    )
    
    info = client.get_collection(COLLECTION_NAME)
    print("Stored vectors:", info.points_count)

def search_embeddings(query_vector, limit=5):
    create_collection()
    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector.tolist() if hasattr(query_vector, "tolist") else query_vector,
        limit=limit
    )
    return results.points

def get_chunks_by_doc_id(doc_id, limit=100):
    create_collection()
    results, _ = client.scroll(
        collection_name=COLLECTION_NAME,
        scroll_filter=Filter(
            must=[
                FieldCondition(
                    key="doc_id",
                    match=MatchValue(value=doc_id)
                )
            ]
        ),
        limit=limit,
        with_payload=True,
        with_vectors=False
    )
    return results

def delete_embeddings_by_doc_id(doc_id):
    create_collection()
    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="doc_id",
                    match=MatchValue(value=doc_id)
                )
            ]
        )
    )
