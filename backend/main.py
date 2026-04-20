from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine

# Make sure tables are created
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Portfolio API")

# Setup CORS for frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, adjust if needed in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import projects, blog, certifications, skills, contact
from schemas import LoginRequest, TokenResponse
from auth import verify_password, create_access_token

app.include_router(projects.router, prefix="/api", tags=["Projects"])
app.include_router(blog.router, prefix="/api", tags=["Blog"])
app.include_router(certifications.router, prefix="/api", tags=["Certifications"])
app.include_router(skills.router, prefix="/api", tags=["Skills"])
app.include_router(contact.router, prefix="/api", tags=["Contact"])

@app.post("/api/admin/login", response_model=TokenResponse, tags=["Admin"])
def login(request: LoginRequest):
    if not verify_password(request.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )
    access_token = create_access_token()
    return {"access_token": access_token, "token_type": "bearer"}
    
@app.get("/")
def read_root():
    return {"message": "Welcome to Srijan's Portfolio API"}
