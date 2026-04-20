from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db
from auth import get_current_admin

router = APIRouter()

# --- Public Endpoints ---
@router.get("/projects", response_model=List[schemas.ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).order_by(models.Project.display_order).all()

@router.get("/projects/featured", response_model=List[schemas.ProjectResponse])
def get_featured_projects(db: Session = Depends(get_db)):
    return db.query(models.Project).filter(models.Project.is_featured == True).order_by(models.Project.display_order).all()

# --- Admin Endpoints ---
@router.post("/admin/projects", response_model=schemas.ProjectResponse, dependencies=[Depends(get_current_admin)])
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(**project.model_dump())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.put("/admin/projects/{project_id}", response_model=schemas.ProjectResponse, dependencies=[Depends(get_current_admin)])
def update_project(project_id: int, project: schemas.ProjectUpdate, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
        
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/admin/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(db_project)
    db.commit()
    return None
