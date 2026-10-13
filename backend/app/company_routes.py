from __future__ import annotations
"""
Company-related API endpoints.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.database import get_db
from app import models, schemas
from app.company_utils import get_company_scoped_query

router = APIRouter(prefix="/companies", tags=["companies"])


@router.post("/", response_model=schemas.CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(payload: schemas.CreateCompanyRequest, db: Session = Depends(get_db)):
    """Create a new company"""
    company = models.Company(
        name=payload.name,
        address=payload.address,
        phone=payload.phone,
        email=payload.email
    )
    
    try:
        db.add(company)
        db.commit()
        db.refresh(company)
        return company
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig) if hasattr(e, 'orig') else "Unknown error"
        if 'name' in error_msg.lower():
            raise HTTPException(status_code=400, detail="Company name already exists")
        elif 'email' in error_msg.lower():
            raise HTTPException(status_code=400, detail="Company email already exists")
        else:
            raise HTTPException(status_code=400, detail="Company creation failed")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create company: {str(e)}")


@router.get("/", response_model=List[schemas.CompanyResponse])
def list_companies(db: Session = Depends(get_db)):
    """List all companies (admin only)"""
    companies = db.query(models.Company).filter(models.Company.is_active == True).all()
    return companies


@router.get("/{company_id}", response_model=schemas.CompanyResponse)
def get_company(company_id: int, db: Session = Depends(get_db)):
    """Get company by ID"""
    company = db.query(models.Company).filter(
        models.Company.id == company_id,
        models.Company.is_active == True
    ).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    return company


@router.put("/{company_id}", response_model=schemas.CompanyResponse)
def update_company(company_id: int, payload: schemas.UpdateCompanyRequest, db: Session = Depends(get_db)):
    """Update company details"""
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Update fields
    if payload.name is not None:
        company.name = payload.name
    if payload.address is not None:
        company.address = payload.address
    if payload.phone is not None:
        company.phone = payload.phone
    if payload.email is not None:
        company.email = payload.email
    if payload.is_active is not None:
        company.is_active = payload.is_active
    
    try:
        db.commit()
        db.refresh(company)
        return company
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig) if hasattr(e, 'orig') else "Unknown error"
        if 'name' in error_msg.lower():
            raise HTTPException(status_code=400, detail="Company name already exists")
        elif 'email' in error_msg.lower():
            raise HTTPException(status_code=400, detail="Company email already exists")
        else:
            raise HTTPException(status_code=400, detail="Company update failed")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update company: {str(e)}")


@router.delete("/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_company(company_id: int, db: Session = Depends(get_db)):
    """Soft delete company (set is_active to False)"""
    company = db.query(models.Company).filter(models.Company.id == company_id).first()
    
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    # Soft delete
    company.is_active = False
    db.commit()
    return None
