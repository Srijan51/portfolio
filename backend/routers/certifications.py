from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db
from auth import get_current_admin

router = APIRouter()

# --- Public Endpoints ---
@router.get("/certifications", response_model=List[schemas.CertificationResponse])
def get_certifications(db: Session = Depends(get_db)):
    return db.query(models.Certification).order_by(models.Certification.display_order.asc(), models.Certification.created_at.desc()).all()

# --- Admin Endpoints ---
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
