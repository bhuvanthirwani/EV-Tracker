from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from typing import Optional
import json
import base64
from .. import models, schemas, database

router = APIRouter(prefix="/api/v1", tags=["auth"])

security = HTTPBasic(auto_error=False)

@router.post("/user-login", response_model=schemas.UserResponse)
async def login(
    request: Request,
    credentials: Optional[dict] = Body(default={}), 
    auth: Optional[HTTPBasicCredentials] = Depends(security),
    db: AsyncSession = Depends(database.get_db)
):
    identifier = None
    password = None

    # 1. Try Basic Auth (Frontend Interceptor Style)
    if auth:
        identifier = auth.username
        password = auth.password
    
    # 2. Try JSON Body (Standard Style)
    if not identifier and credentials:
        identifier = credentials.get("username") or credentials.get("user_key") or credentials.get("email")
        password = credentials.get("password")

    if not identifier:
        raise HTTPException(status_code=400, detail="Credentials not provided")

    result = await db.execute(
        select(models.User).where(
            or_(
                models.User.username == identifier,
                models.User.email == identifier,
                models.User.phone == identifier
            )
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or user.password != password:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    payload = base64.b64encode(json.dumps({"user_id": user.user_id}).encode()).decode()
    token = f"dummy.{payload}.dummy"
    
    user_data = schemas.UserResponse.model_validate(user)
    return user_data.model_copy(update={"token": token})

@router.post("/update-password")
async def update_password(data: dict, db: AsyncSession = Depends(database.get_db)):
    return {"message": "Password updated successfully"}

@router.post("/update-user-profile")
async def update_user_profile(data: dict, db: AsyncSession = Depends(database.get_db)):
    return {"message": "User profile updated successfully"}

@router.post("/update_fcm_token")
async def update_fcm_token(fcm_token: str = None, client_type: str = None, db: AsyncSession = Depends(database.get_db)):
    return {"message": "FCM token updated successfully"}

@router.get("/refresh-token")
async def refresh_token(db: AsyncSession = Depends(database.get_db)):
    return {"token": "refreshed-dummy-token"}

@router.get("/notifications")
async def get_notifications(_from: str = None, _to: str = None, db: AsyncSession = Depends(database.get_db)):
    return {"notifications": []}
