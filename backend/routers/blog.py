from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import get_db
from auth import get_current_admin

router = APIRouter()

# --- Public Endpoints ---
@router.get("/blog", response_model=List[schemas.BlogPostResponse])
def get_blog_posts(db: Session = Depends(get_db)):
    return db.query(models.BlogPost).filter(models.BlogPost.is_published == True).order_by(models.BlogPost.created_at.desc()).all()

@router.get("/blog/{post_id}", response_model=schemas.BlogPostResponse)
def get_blog_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id, models.BlogPost.is_published == True).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    return db_post

# --- Admin Endpoints ---
@router.get("/admin/blog", response_model=List[schemas.BlogPostResponse], dependencies=[Depends(get_current_admin)])
def get_all_blog_posts(db: Session = Depends(get_db)):
    return db.query(models.BlogPost).order_by(models.BlogPost.created_at.desc()).all()

@router.post("/admin/blog", response_model=schemas.BlogPostResponse, dependencies=[Depends(get_current_admin)])
def create_blog_post(post: schemas.BlogPostCreate, db: Session = Depends(get_db)):
    db_post = models.BlogPost(**post.model_dump())
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    return db_post

@router.put("/admin/blog/{post_id}", response_model=schemas.BlogPostResponse, dependencies=[Depends(get_current_admin)])
def update_blog_post(post_id: int, post: schemas.BlogPostUpdate, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    update_data = post.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_post, key, value)
        
    db.commit()
    db.refresh(db_post)
    return db_post

@router.delete("/admin/blog/{post_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_blog_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db.delete(db_post)
    db.commit()
    return None
