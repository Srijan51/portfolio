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

# --- Admin Endpoints ---
@router.post("/admin/certifications/upload", dependencies=[Depends(get_current_admin)])
async def upload_certificate_pdf(request: Request, file: UploadFile = File(...)):
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

    return {
        "filename": unique_name,
        "certificate_url": f"{str(request.base_url).rstrip('/')}/uploads/certificates/{unique_name}"
    }

@router.post("/admin/certifications", response_model=schemas.CertificationResponse, dependencies=[Depends(get_current_admin)])
def create_certification(cert: schemas.CertificationCreate, db: Session = Depends(get_db)):
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
