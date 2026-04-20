"""
SQLAlchemy database models for all portfolio content.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    tags = Column(JSON, default=[])  # e.g. ["HTML", "CSS", "JavaScript"]
    live_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    icon_emoji = Column(String(10), default="🚀")
    gradient_colors = Column(String(200), default="linear-gradient(135deg, #6c63ff33, #00d4ff22)")
    display_order = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    excerpt = Column(Text, nullable=False)
    content = Column(Text, nullable=True)  # Full markdown content
    category = Column(String(100), nullable=False)
    published_date = Column(String(50), nullable=False)  # e.g. "Mar 2026"
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    issuer = Column(String(200), nullable=False)
    year = Column(String(20), nullable=False)
    description = Column(Text, nullable=False)
    icon_emoji = Column(String(10), default="📜")
    certificate_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(100), nullable=False)  # e.g. "Web Development", "Programming"
    icon_emoji = Column(String(10), default="💻")
    proficiency_percent = Column(Integer, default=50)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    email = Column(String(300), nullable=False)
    subject = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
