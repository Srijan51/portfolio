from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db
from auth import get_current_admin

router = APIRouter()

# --- Public Endpoints ---
@router.get("/skills", response_model=List[schemas.SkillResponse])
def get_skills(db: Session = Depends(get_db)):
    return db.query(models.Skill).order_by(models.Skill.category, models.Skill.display_order).all()

# --- Admin Endpoints ---
@router.post("/admin/skills", response_model=schemas.SkillResponse, dependencies=[Depends(get_current_admin)])
def create_skill(skill: schemas.SkillCreate, db: Session = Depends(get_db)):
    db_skill = models.Skill(**skill.model_dump())
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.put("/admin/skills/{skill_id}", response_model=schemas.SkillResponse, dependencies=[Depends(get_current_admin)])
def update_skill(skill_id: int, skill: schemas.SkillUpdate, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    update_data = skill.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_skill, key, value)
        
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/admin/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    db_skill = db.query(models.Skill).filter(models.Skill.id == skill_id).first()
    if not db_skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    db.delete(db_skill)
    db.commit()
    return None
