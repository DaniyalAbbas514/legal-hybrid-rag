from datetime import datetime, timezone
import hashlib
import asyncio
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile
from loguru import logger

from app.database import db
from app.ingestion.detector import detect_pdf_type
from app.ingestion.extractor import extract
from app.ingestion.parser import parse_sections

router = APIRouter(prefix="/api/admin", tags=["admin"])

UPLOADS_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)


async def run_extraction(pdf_id: str, pdf_path: str, detected_type: str) -> None:
    if db.jobs is None or db.documents is None:
        logger.error(f"[{pdf_id}] Skipping extraction: database is not connected")
        return

    logger.info(f"[{pdf_id}] Extraction started")
    await db.jobs.update_one(
        {"job_id": pdf_id},
        {"$set": {"status": "extracting"}},
    )

    try:
        text = extract(pdf_path=pdf_path, pdf_id=pdf_id, detected_type=detected_type)
        now = datetime.now(timezone.utc)
        await db.jobs.update_one(
            {"job_id": pdf_id},
            {"$set": {"status": "extracted", "char_count": len(text), "extracted_at": now}},
        )
        await db.documents.update_one(
            {"pdf_id": pdf_id},
            {"$set": {"status": "extracted"}},
        )
        logger.info(f"[{pdf_id}] Extraction completed (chars={len(text)})")

        await db.jobs.update_one(
            {"job_id": pdf_id},
            {"$set": {"status": "parsing"}},
        )
        logger.info(f"[{pdf_id}] Parsing started")
        try:
            await asyncio.wait_for(
                parse_sections(pdf_id=pdf_id, extracted_text=text),
                timeout=600,
            )
            parsed_at = datetime.now(timezone.utc)
            await db.jobs.update_one(
                {"job_id": pdf_id},
                {"$set": {"status": "parsed", "parsed_at": parsed_at}},
            )
            await db.documents.update_one(
                {"pdf_id": pdf_id},
                {"$set": {"status": "parsed"}},
            )
            logger.info(f"[{pdf_id}] Parsing completed")
        except asyncio.TimeoutError:
            failed_at = datetime.now(timezone.utc)
            error_message = "Parsing timed out after 240 seconds."
            await db.jobs.update_one(
                {"job_id": pdf_id},
                {"$set": {"status": "parse_failed", "error": error_message, "failed_at": failed_at}},
            )
            await db.documents.update_one(
                {"pdf_id": pdf_id},
                {"$set": {"status": "failed"}},
            )
            logger.error(f"[{pdf_id}] {error_message}")
        except Exception as e:
            failed_at = datetime.now(timezone.utc)
            await db.jobs.update_one(
                {"job_id": pdf_id},
                {"$set": {"status": "parse_failed", "error": str(e), "failed_at": failed_at}},
            )
            await db.documents.update_one(
                {"pdf_id": pdf_id},
                {"$set": {"status": "failed"}},
            )
            logger.exception(f"[{pdf_id}] Parsing failed: {e}")
    except Exception as e:
        now = datetime.now(timezone.utc)
        await db.jobs.update_one(
            {"job_id": pdf_id},
            {"$set": {"status": "extraction_failed", "error": str(e), "failed_at": now}},
        )
        await db.documents.update_one(
            {"pdf_id": pdf_id},
            {"$set": {"status": "failed"}},
        )
        logger.exception(f"[{pdf_id}] Extraction failed: {e}")


@router.post("/upload")
async def upload_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    original_filename = file.filename or "uploaded.pdf"
    if (file.content_type or "").lower() != "application/pdf" and not original_filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    pdf_id = str(uuid4())
    job_id = pdf_id
    filename = original_filename
    saved_path = UPLOADS_DIR / f"{pdf_id}.pdf"

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    file_hash = hashlib.sha256(file_bytes).hexdigest()

    if db.jobs is None or db.documents is None:
        raise HTTPException(status_code=503, detail="Database is not connected.")

    existing_doc = await db.documents.find_one(
        {"file_hash": file_hash},
        {"_id": 0, "pdf_id": 1, "filename": 1, "status": 1},
    )
    if existing_doc:
        raise HTTPException(
            status_code=409,
            detail=f"Duplicate PDF detected. Already uploaded as '{existing_doc.get('filename', 'unknown')}'.",
        )

    saved_path.write_bytes(file_bytes)

    detected_type = detect_pdf_type(str(saved_path))
    now = datetime.now(timezone.utc)

    await db.jobs.insert_one(
        {
            "job_id": job_id,
            "pdf_id": pdf_id,
            "filename": filename,
            "detected_type": detected_type,
            "status": "uploaded",
            "created_at": now,
            "file_hash": file_hash,
        }
    )

    await db.documents.insert_one(
        {
            "pdf_id": pdf_id,
            "filename": filename,
            "detected_type": detected_type,
            "status": "uploaded",
            "upload_date": now,
            "total_nodes": 0,
            "file_hash": file_hash,
        }
    )
    background_tasks.add_task(run_extraction, pdf_id, str(saved_path), detected_type)
    logger.info(f"[{pdf_id}] Upload saved and extraction task queued")

    return {
        "pdf_id": pdf_id,
        "filename": filename,
        "detected_type": detected_type,
        "job_id": job_id,
        "status": "uploaded",
        "message": "PDF received. Use job_id to track progress.",
    }


@router.get("/jobs/{job_id}")
async def get_job(job_id: str):
    if db.jobs is None:
        raise HTTPException(status_code=503, detail="Database is not connected.")

    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    return job


@router.get("/jobs")
async def list_jobs():
    if db.jobs is None:
        raise HTTPException(status_code=503, detail="Database is not connected.")

    cursor = db.jobs.find({}, {"_id": 0}).sort("created_at", -1)
    jobs = await cursor.to_list(length=None)
    return {"jobs": jobs}


@router.get("/extracted/{pdf_id}")
async def get_extracted(pdf_id: str):
    txt_path = UPLOADS_DIR / f"{pdf_id}.txt"
    if not txt_path.exists():
        raise HTTPException(status_code=404, detail="Extracted text not found.")

    text = txt_path.read_text(encoding="utf-8", errors="ignore")
    return {"pdf_id": pdf_id, "char_count": len(text), "preview": text[:500]}


@router.get("/parsed/{pdf_id}")
async def get_parsed(pdf_id: str):
    parsed_path = UPLOADS_DIR / f"{pdf_id}_sections.json"
    if not parsed_path.exists():
        raise HTTPException(status_code=404, detail="Parsed sections not found.")

    import json

    parsed = json.loads(parsed_path.read_text(encoding="utf-8", errors="ignore"))
    sections = []
    for section in parsed.get("sections", []):
        text = section.get("text", "") or ""
        sections.append(
            {
                "section_type": section.get("section_type"),
                "heading_found": section.get("heading_found"),
                "char_count": len(text),
                "confidence": section.get("confidence", 0.0),
                "preview": text[:300],
            }
        )

    return {
        "pdf_id": pdf_id,
        "parse_mode": parsed.get("parse_mode", "unknown"),
        "context_heading": parsed.get("context_heading", ""),
        "context_summary": parsed.get("context_summary", ""),
        "sections": sections,
    }


@router.delete("/jobs/{job_id}")
async def delete_job(job_id: str):
    if db.jobs is None or db.documents is None:
        raise HTTPException(status_code=503, detail="Database is not connected.")

    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0, "pdf_id": 1, "job_id": 1})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found.")

    pdf_id = job.get("pdf_id")
    if pdf_id:
        await db.documents.delete_many({"pdf_id": pdf_id})
        await db.jobs.delete_many({"pdf_id": pdf_id})
        for suffix in [".pdf", ".txt", "_sections.json", "_summary.md"]:
            file_path = UPLOADS_DIR / f"{pdf_id}{suffix}"
            if file_path.exists():
                file_path.unlink()
    else:
        await db.jobs.delete_one({"job_id": job_id})

    return {"message": "Case deleted successfully.", "job_id": job_id}


@router.get("/status")
async def admin_status():
    if db.documents is None or db.jobs is None:
        raise HTTPException(status_code=503, detail="Database is not connected.")

    total_documents = await db.documents.count_documents({})

    statuses = ["complete", "failed", "uploaded", "processing"]
    by_status = {}
    for status in statuses:
        by_status[status] = await db.documents.count_documents({"status": status})

    cursor = db.jobs.find({}, {"_id": 0}).sort("created_at", -1).limit(5)
    recent_jobs = await cursor.to_list(length=5)

    return {
        "total_documents": total_documents,
        "by_status": by_status,
        "recent_jobs": recent_jobs,
    }
