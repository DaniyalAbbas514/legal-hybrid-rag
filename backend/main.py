from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

frontend_dist = Path(__file__).resolve().parent / "static"

if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")


@app.get("/api/health")
def health():
    return {"message": "Legal Hybrid RAG Running"}


@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    if frontend_dist.exists():
        index_file = frontend_dist / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
    return {"message": "Frontend build not found. Deploy with frontend build included."}
