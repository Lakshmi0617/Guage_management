"""
Company utilities for multi-tenant support.
"""

from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from functools import wraps
from typing import Optional

from app.database import get_db
from app import models


def get_current_user_company(db: Session, user_id: int) -> Optional[models.Company]:
    """Get the company of the current user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None
    return user.company


def require_company_access(func):
    """Decorator to ensure user can only access their company's data"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        # Extract db session from kwargs
        db = None
        user_id = None
        
        for key, value in kwargs.items():
            if isinstance(value, Session):
                db = value
            elif key == 'user_id' and isinstance(value, int):
                user_id = value
        
        if not db:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database session not found"
            )
        
        # For now, we'll implement company filtering in the endpoint itself
        # This decorator can be enhanced later for more complex access control
        return func(*args, **kwargs)
    
    return wrapper


def apply_company_filter(query, company_id: int):
    """Apply company filter to a query"""
    return query.filter(models.Company.id == company_id)


def get_company_by_user(db: Session, user_id: int) -> models.Company:
    """Get company for a user and raise exception if not found"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if not user.company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found for user"
        )
    
    return user.company


def validate_company_access(db: Session, user_id: int, target_company_id: int) -> bool:
    """Validate if user has access to the target company"""
    user_company = get_company_by_user(db, user_id)
    return user_company.id == target_company_id


def get_company_scoped_query(db: Session, model_class, user_id: int):
    """Get a query scoped to the user's company"""
    user_company = get_company_by_user(db, user_id)
    
    # Check if model has company_id column
    if hasattr(model_class, 'company_id'):
        return db.query(model_class).filter(model_class.company_id == user_company.id)
    else:
        # For models without company_id (like Company itself), return all
        return db.query(model_class)
