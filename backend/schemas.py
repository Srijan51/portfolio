"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── Projects ─────────────────────────────────────────

class ProjectBase(BaseModel):
    title: str
    description: str
    tags: list[str] = []
    live_url: Optional[str] = None
    github_url: Optional[str] = None
    icon_emoji: str = "🚀"
    gradient_colors: str = "linear-gradient(135deg, #6c63ff33, #00d4ff22)"
    display_order: int = 0
    is_featured: bool = False

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Blog Posts ───────────────────────────────────────

class BlogPostBase(BaseModel):
    title: str
    excerpt: str
    content: Optional[str] = None
    category: str
    published_date: str
    is_published: bool = True

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostUpdate(BlogPostBase):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    category: Optional[str] = None
    published_date: Optional[str] = None

class BlogPostResponse(BlogPostBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Certifications ───────────────────────────────────

class CertificationBase(BaseModel):
    title: str
    issuer: str
    year: str
    description: str
    icon_emoji: str = "📜"
    certificate_url: Optional[str] = None
    display_order: int = 0

class CertificationCreate(CertificationBase):
    pass

class CertificationUpdate(CertificationBase):
    title: Optional[str] = None
    issuer: Optional[str] = None
    year: Optional[str] = None
    description: Optional[str] = None

class CertificationResponse(CertificationBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Skills ───────────────────────────────────────────

class SkillBase(BaseModel):
    name: str
    category: str
    icon_emoji: str = "💻"
    proficiency_percent: int = 50
    display_order: int = 0

class SkillCreate(SkillBase):
    pass

class SkillUpdate(SkillBase):
    name: Optional[str] = None
    category: Optional[str] = None

class SkillResponse(SkillBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Contact Messages ─────────────────────────────────

class ContactMessageCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str

class ContactMessageResponse(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    is_read: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Auth ─────────────────────────────────────────────

class LoginRequest(BaseModel):
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
