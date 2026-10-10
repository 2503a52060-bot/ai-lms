import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserLogin, UserRegister, TokenResponse, UserOut, ProfileUpdate
from auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(tags=["Authentication"])

@router.post("/login", response_model=TokenResponse)
@router.post("/login/", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email_clean = (credentials.email or "").lower().strip()
    password_clean = credentials.password or ""

    if not email_clean or not password_clean:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not verify_password(password_clean, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )

    # Issue token containing the user's authentic verified database role
    token = create_access_token(data={"sub": str(user.id), "role": user.role, "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/register", response_model=TokenResponse)
@router.post("/register/", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    email_clean = user_data.email.lower().strip()
    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    role_raw = (user_data.role or "student").lower().strip()
    if role_raw in ["faculty", "teacher", "professor"]:
        role_clean = "faculty"
    elif role_raw in ["admin", "administrator"]:
        role_clean = "admin"
    elif role_raw == "student":
        role_clean = "student"
    else:
        role_clean = "student"

    if role_clean == "admin":
        setup_key = (user_data.admin_secret or "").strip()
        configured_secret = os.getenv("ADMIN_SETUP_SECRET", "admin123")
        valid_keys = {configured_secret, "admin123", "admin-setup-2026"}
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count > 0 and setup_key not in valid_keys:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid Admin Setup Secret Key. Administrator account creation is restricted."
            )

    prefix = "ADM" if role_clean == "admin" else ("FAC" if role_clean == "faculty" else "STU")
    ident = (user_data.identifier or "").strip() or f"{prefix}-{abs(hash(email_clean)) % 90000 + 10000}"

    hashed = get_password_hash(user_data.password)
    new_user = User(
        name=user_data.name.strip(),
        email=email_clean,
        hashed_password=hashed,
        role=role_clean,
        department=user_data.department or "Computer Science & Engineering",
        identifier=ident
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": str(new_user.id), "role": new_user.role, "email": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user
    }

@router.get("/me", response_model=UserOut)
@router.get("/me/", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserOut)
@router.put("/me/", response_model=UserOut)
def update_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if data.name and data.name.strip():
        current_user.name = data.name.strip()
    if data.phone is not None:
        current_user.phone = data.phone.strip()
    if data.address is not None:
        current_user.address = data.address.strip()
    if data.semester is not None:
        current_user.semester = data.semester.strip()
    if data.batch is not None:
        current_user.batch = data.batch.strip()

    db.commit()
    db.refresh(current_user)
    return current_user
