from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct


client = QdrantClient(":memory:")

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

    points = []

    for i, embedding in enumerate(embeddings):

        points.append(
            PointStruct(
                id=(doc_id * 1000) + i,

                vector=embedding.tolist(),

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