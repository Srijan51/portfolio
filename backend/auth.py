"""
Simple JWT-based admin authentication.
Admin password is read from environment variable ADMIN_PASSWORD (default: admin123).
"""
import os
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Config — change these via environment variables in production
SECRET_KEY = os.getenv("SECRET_KEY", "portfolio-secret-key-change-in-production")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "dass*1234")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

security = HTTPBearer()


def verify_password(password: str) -> bool:
    """Check if the provided password matches the admin password."""
    return password == ADMIN_PASSWORD


def create_access_token() -> str:
    """Create a JWT access token for the admin."""
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    payload = {"sub": "admin", "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Dependency that validates the JWT token.
    Use this on any admin-only endpoint.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username != "admin":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
        return username
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
