import os
from datetime import datetime, timedelta
from typing import Optional, List
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
from models import User

SECRET_KEY = os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY") or "super-secret-lms-jwt-token-key-2026-secure"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not plain_password or not hashed_password:
        return False
    try:
        clean_hash = hashed_password.strip()
        return bcrypt.checkpw(plain_password.encode("utf-8"), clean_hash.encode("utf-8"))
    except Exception:
        # Fallback to plain equality for backwards compatibility
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        if sub is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = None
    try:
        user_id = int(sub)
        user = db.query(User).filter(User.id == user_id).first()
    except (ValueError, TypeError):
        user = db.query(User).filter(User.email == str(sub).lower().strip()).first()

    if user is None:
        email_claim = payload.get("email")
        if email_claim:
            user = db.query(User).filter(User.email == str(email_claim).lower().strip()).first()

    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user account")
    return user

def require_role(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role.lower()
        # Map teacher to faculty if needed
        normalized_allowed = [r.lower() for r in allowed_roles]
        if "faculty" in normalized_allowed and "teacher" not in normalized_allowed:
            normalized_allowed.append("teacher")
        if "teacher" in normalized_allowed and "faculty" not in normalized_allowed:
            normalized_allowed.append("faculty")

        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {allowed_roles} role, current role is {current_user.role}"
            )
        return current_user
    return role_checker
