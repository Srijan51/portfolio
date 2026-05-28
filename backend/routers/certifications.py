from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List
import os
from pathlib import Path
from uuid import uuid4

import aiofiles

import models
import schemas
from database import get_db
from auth import get_current_admin

router = APIRouter()

UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads" / "certificates"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# --- Public Endpoints ---
@router.get("/certifications", response_model=List[schemas.CertificationResponse])
def get_certifications(db: Session = Depends(get_db)):
    return db.query(models.Certification).order_by(models.Certification.display_order.asc(), models.Certification.created_at.desc()).all()


async def _save_certificate_file(file: UploadFile, request: Request) -> str:
    allowed_types = {"application/pdf", "application/octet-stream"}
    suffix = Path(file.filename or "").suffix.lower()
    if file.content_type not in allowed_types or suffix != ".pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    safe_name = Path(file.filename).stem.replace(" ", "_") if file.filename else "certificate"
    unique_name = f"{safe_name}_{uuid4().hex}.pdf"
    destination = UPLOAD_DIR / unique_name

    async with aiofiles.open(destination, "wb") as out_file:
        while chunk := await file.read(1024 * 1024):
            await out_file.write(chunk)

    return f"{str(request.base_url).rstrip('/')}/uploads/certificates/{unique_name}"

# --- Admin Endpoints ---
@router.post("/admin/certifications/upload", dependencies=[Depends(get_current_admin)])
async def upload_certificate_pdf(request: Request, file: UploadFile = File(...)):
    certificate_url = await _save_certificate_file(file, request)
    return {
        "filename": Path(certificate_url).name,
        "certificate_url": certificate_url
    }

@router.post("/admin/certifications", response_model=schemas.CertificationResponse, dependencies=[Depends(get_current_admin)])
async def create_certification(request: Request, db: Session = Depends(get_db)):
    content_type = request.headers.get("content-type", "")

    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        file = form.get("file")
        certificate_url = str(form.get("certificate_url") or "").strip() or None

        if file and getattr(file, "filename", None):
            certificate_url = await _save_certificate_file(file, request)

        cert = schemas.CertificationCreate(
            title=str(form.get("title") or "").strip(),
            issuer=str(form.get("issuer") or "").strip(),
            year=str(form.get("year") or "").strip(),
            description=str(form.get("description") or "").strip(),
            icon_emoji=str(form.get("icon_emoji") or "📜"),
            certificate_url=certificate_url,
            display_order=int(form.get("display_order") or 0),
        )
    else:
        payload = await request.json()
        cert = schemas.CertificationCreate(**payload)

    db_cert = models.Certification(**cert.model_dump())
    db.add(db_cert)
    db.commit()
    db.refresh(db_cert)
    return db_cert

@router.put("/admin/certifications/{cert_id}", response_model=schemas.CertificationResponse, dependencies=[Depends(get_current_admin)])
def update_certification(cert_id: int, cert: schemas.CertificationUpdate, db: Session = Depends(get_db)):
    db_cert = db.query(models.Certification).filter(models.Certification.id == cert_id).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    
    update_data = cert.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_cert, key, value)
        
    db.commit()
    db.refresh(db_cert)
    return db_cert

@router.delete("/admin/certifications/{cert_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_certification(cert_id: int, db: Session = Depends(get_db)):
    db_cert = db.query(models.Certification).filter(models.Certification.id == cert_id).first()
    if not db_cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    
    db.delete(db_cert)
    db.commit()
    return None
