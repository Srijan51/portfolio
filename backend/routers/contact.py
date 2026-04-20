from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db
from auth import get_current_admin

router = APIRouter()

# --- Public Endpoints ---
@router.post("/contact", response_model=schemas.ContactMessageResponse)
def submit_contact_message(message: schemas.ContactMessageCreate, db: Session = Depends(get_db)):
    db_message = models.ContactMessage(**message.model_dump())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

# --- Admin Endpoints ---
@router.get("/admin/messages", response_model=List[schemas.ContactMessageResponse], dependencies=[Depends(get_current_admin)])
def get_contact_messages(db: Session = Depends(get_db)):
    return db.query(models.ContactMessage).order_by(models.ContactMessage.created_at.desc()).all()

@router.put("/admin/messages/{message_id}/read", response_model=schemas.ContactMessageResponse, dependencies=[Depends(get_current_admin)])
def mark_message_read(message_id: int, db: Session = Depends(get_db)):
    db_msg = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db_msg.is_read = True
    db.commit()
    db.refresh(db_msg)
    return db_msg

@router.delete("/admin/messages/{message_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_message(message_id: int, db: Session = Depends(get_db)):
    db_msg = db.query(models.ContactMessage).filter(models.ContactMessage.id == message_id).first()
    if not db_msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    db.delete(db_msg)
    db.commit()
    return None
