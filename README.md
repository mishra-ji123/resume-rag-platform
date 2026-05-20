# 📄 Resume RAG Platform

An end-to-end Retrieval-Augmented Generation (RAG) platform designed to parse, index, and semantically search resume documents. The platform uses a hybrid database structure consisting of MySQL for metadata and operational logging, and Qdrant for fast vector similarity search.

---

## 🚀 System Architecture & Project Flow

The system features two main pipeline flows: the **Upload & Indexing Flow** and the **Semantic Search Flow**.

### 1. Project Flow Diagram
```mermaid
sequenceDiagram
    autonumber
    actor User
    participant FE as Frontend (Next.js)
    participant BE as Backend (FastAPI)
    participant DB as MySQL Database
    participant QS as Qdrant Vector DB (In-Memory)
    participant LLM as SentenceTransformer

    Note over User, BE: Upload & Indexing Flow
    User->>FE: Select and upload PDF Resume
    FE->>BE: POST /api/v1/upload/ (multipart/form-data)
    BE->>BE: Save file locally under app/uploads/resumes/
    BE->>DB: Insert Document record (upload_status="SUCCESS", processing_status="PROCESSING")
    BE->>BE: Extract text using pdfplumber
    BE->>BE: Chunk text (sliding window: size 500, overlap 200)
    BE->>LLM: Encode chunks (all-MiniLM-L6-v2) to 384-dim vectors
    BE->>QS: Store embeddings (upsert vectors + payload metadata)
    BE->>DB: Update Document (processing_status="SUCCESS", total_chunks, processed_at)
    BE->>FE: Return status, extracted characters, chunks, and metadata
    FE->>User: Display processing success status

    Note over User, BE: Semantic Search Flow
    User->>FE: Input search query (e.g., "Python Developer with SQL experience")
    FE->>BE: POST /api/v1/search/ (SearchQuery JSON)
    BE->>LLM: Encode query string into vector
    BE->>QS: Search embeddings using Cosine similarity
    QS-->>BE: Return top matching points (scores, chunk text, filenames)
    BE->>FE: Return formatted SearchResult list
    FE->>User: Display matching resume sections with similarity scores
```

---

## 🛠️ Technology Stack

### Backend
- **Core Framework**: [FastAPI](https://fastapi.tiangolo.com/) (v0.136.1)
- **Database (RDBMS)**: [MySQL](https://www.mysql.com/) via [SQLAlchemy](https://www.sqlalchemy.org/) ORM & `PyMySQL` driver
- **Vector Database**: [Qdrant](https://qdrant.tech/) (In-memory client configuration)
- **Text Embedding Model**: `all-MiniLM-L6-v2` via [SentenceTransformers](https://sbert.net/) (384 dimensions)
- **PDF Text Extractor**: `pdfplumber` (v0.11.9)
- **Server**: Uvicorn (v0.46.0)

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (v16.2.6) & [React](https://react.dev/) (v19.2.4)
- **Language**: TypeScript (v5)
- **Styling**: TailwindCSS (v4)

---

## 📁 Directory Structure

```text
resume-rag-platform/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── upload.py         # PDF parsing, chunking, and embedding generation
│   │   │   ├── search.py         # Semantic search query execution
│   │   │   └── resume.py         # [Placeholder] Endpoints for resume lifecycle management
│   │   ├── core/
│   │   │   └── database.py       # MySQL connection setup & DB session management
│   │   ├── models/
│   │   │   └── document.py       # SQLAlchemy database model for Document metadata
│   │   ├── schemas/
│   │   │   └── search.py         # Pydantic schemas for search query and response
│   │   ├── services/
│   │   │   └── qdrant_service.py # Qdrant collection setup, insertion, and querying
│   │   └── uploads/
│   │       └── resumes/          # Local directory where uploaded PDF files are stored
│   ├── main.py                   # Backend entrypoint and router registration
│   └── requirements.txt          # Python dependency list
├── frontend/
│   ├── src/
│   │   └── app/
│   │       ├── layout.tsx        # Next.js root layout
│   │       ├── globals.css       # Tailwind configuration and global styles
│   │       └── page.tsx          # Next.js main UI (Next.js boilerplate)
│   ├── package.json              # Frontend Node dependencies & scripts
│   └── tsconfig.json             # TypeScript configuration
└── docker/                       # Docker deployment configurations
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+ installed
- Node.js 18+ & npm installed
- MySQL Server running locally or in a container

### 1. Database Setup
1. Create a database named `resume_rag` in your local MySQL instance:
   ```sql
   CREATE DATABASE resume_rag;
   ```
2. The SQLAlchemy ORM automatically handles table generation (`documents` table) on backend application startup.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows (PowerShell)
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux
   source venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables (if any) or ensure your local MySQL credentials match the configuration in `backend/app/core/database.py`:
   `mysql+pymysql://root:12345@localhost/resume_rag`
5. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload
   ```
   The backend API will run at `http://localhost:8000`. You can access the Swagger interactive documentation at `http://localhost:8000/docs`.

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   The frontend application will start at `http://localhost:3000`.

---

## 🔌 API Documentation & Endpoints

### 1. Document Upload
- **Endpoint**: `POST /api/v1/upload/`
- **Content-Type**: `multipart/form-data`
- **Request Body**:
  - `file`: PDF file containing the resume
- **Response Format (`200 OK`)**:
  ```json
  {
    "filename": "john_doe_resume.pdf",
    "characters_extracted": 3450,
    "total_chunks": 10,
    "sample_chunks": [
      {
        "chunk_number": 1,
        "chunk_length": 500,
        "chunk_text": "...extracted resume text..."
      }
    ],
    "embedding_dimension": 384,
    "processing_status": "SUCCESS",
    "first_embedding_preview": [0.012, -0.045, 0.089, ...]
  }
  ```

### 2. Semantic Search
- **Endpoint**: `POST /api/v1/search/`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "query": "React and TypeScript developer with AWS experience",
    "limit": 5
  }
  ```
- **Response Format (`200 OK`)**:
  ```json
  [
    {
      "chunk_id": 2,
      "chunk_text": "Work Experience: Front-end developer specialized in building React and TypeScript apps...",
      "file_name": "john_doe_resume.pdf",
      "doc_id": 1,
      "score": 0.8421
    }
  ]
  ```

---

## 📝 Key System Mechanics

### Text Chunking Details
- **Algorithm**: Sliding window character chunking.
- **Parameters**: `chunk_size = 500` characters, `overlap = 200` characters.
- **Process**: Ensures keywords and context are preserved across chunk boundaries without losing vital semantic relationships.

### Vector Similarity Setup
- **Model**: `all-MiniLM-L6-v2` maps raw text chunks to a 384-dimensional continuous vector space.
- **Metric**: **Cosine Similarity** is used to rank chunks relative to user queries.

---

## ⚠️ Known Limitations & Roadmaps

1. **In-Memory Vector DB**: The current Qdrant database is using `":memory:"`. Consequently, all indexes and embeddings are cleared whenever the backend process is restarted.
   * *Roadmap*: Configure Qdrant with a persistent local directory or host a persistent Dockerized Qdrant container.
2. **Hardcoded Credentials**: MySQL credentials are hardcoded in `database.py`.
   * *Roadmap*: Introduce `dotenv` loading inside the FastAPI startup routine to source credentials from a `.env` configuration file.
3. **Empty Frontend Interface**: The frontend currently serves default boilerplate template logic and does not communicate with the backend.
   * *Roadmap*: Implement an interactive dashboard for resume upload status and a search field/chat component for querying resumes.
