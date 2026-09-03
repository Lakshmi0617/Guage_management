from sqlalchemy import Column, Integer, String, DateTime, Date, Boolean, Text, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from .database import Base


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(100), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=False), server_default=func.now(), onupdate=func.now())


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    employee_id = Column(String(50), unique=True, nullable=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class EquipmentUsedForCalibration(Base):
    __tablename__ = "equipment_used_for_calibration"

    gauge_id = Column(Integer, primary_key=True, index=True)
    name_of_the_equipment = Column(String(100), nullable=False)
    location = Column(String(100))
    receipt_date = Column(Date)
    make_model = Column(String(100))
    idfn_no = Column(String(100))
    overall_measurement_uncertainty = Column(String(100))
    calibration_freq_months = Column(Integer)
    date_of_last_calibration = Column(Date)
    calibration_due = Column(Date)
    pcr_number = Column(Integer)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class Gauge(Base):
    __tablename__ = "gauges"

    gauge_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    serial_number = Column(String(100))
    manufacturer = Column(String(100))
    location = Column(String(100))
    status = Column(String(20))
    added_by = Column(Integer, ForeignKey("users.id"))
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    
    # Relationships
    added_by_user = relationship("User", foreign_keys=[added_by])
    company = relationship("Company", foreign_keys=[company_id])


class CalibrationSchedule(Base):
    __tablename__ = "calibration_schedule"

    schedule_id = Column(Integer, primary_key=True, index=True)
    gauge_id = Column(Integer, ForeignKey("gauges.gauge_id"), nullable=False)
    last_calibration = Column(Date)
    next_due_date = Column(Date)
    frequency_type = Column(String(20))
    frequency_value = Column(Integer)
    notification_sent = Column(Boolean, default=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    gauge = relationship("Gauge", foreign_keys=[gauge_id])
    company = relationship("Company", foreign_keys=[company_id])


class CalibrationHistory(Base):
    __tablename__ = "calibration_history"

    calibration_id = Column(Integer, primary_key=True, index=True)
    gauge_id = Column(Integer, ForeignKey("gauges.gauge_id"), nullable=False)
    calibration_date = Column(Date)
    status = Column(String(20))
    comments = Column(Text)
    approved_by = Column(Integer, ForeignKey("users.id"))
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    gauge = relationship("Gauge", foreign_keys=[gauge_id])
    approver = relationship("User", foreign_keys=[approved_by])
    company = relationship("Company", foreign_keys=[company_id])


class GaugeTracker(Base):
    __tablename__ = "gauge_tracker"

    transaction_id = Column(Integer, primary_key=True, index=True)
    gauge_id = Column(Integer, ForeignKey("gauges.gauge_id"), nullable=False)
    issued_to = Column(Integer, ForeignKey("users.id"))
    issued_at = Column(DateTime(timezone=False))
    returned_at = Column(DateTime(timezone=False))
    status = Column(String(20))
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    gauge = relationship("Gauge", foreign_keys=[gauge_id])
    issued_user = relationship("User", foreign_keys=[issued_to])
    company = relationship("Company", foreign_keys=[company_id])


class Notification(Base):
    __tablename__ = "notifications"

    notification_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    gauge_id = Column(Integer, ForeignKey("gauges.gauge_id"), nullable=False)
    message = Column(Text)
    sent_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    read_status = Column(Boolean, default=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    gauge = relationship("Gauge", foreign_keys=[gauge_id])
    company = relationship("Company", foreign_keys=[company_id])


class GaugeRequest(Base):
    __tablename__ = "gauge_requests"

    id = Column(Integer, primary_key=True, index=True)
    gauge_id = Column(Integer, nullable=False)
    requested_by = Column(String(100))
    requested_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    status = Column(String(20), default="requested")
    accepted_by = Column(String(100))
    accepted_at = Column(DateTime(timezone=False))
    returned_by = Column(String(100))
    returned_at = Column(DateTime(timezone=False))
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class GaugeRange(Base):
    __tablename__ = "gauge_ranges"

    id = Column(Integer, primary_key=True, index=True)
    gauge_id = Column(Integer, nullable=False)
    label = Column(Text, nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class EmailLog(Base):
    __tablename__ = "email_logs"

    id = Column(Integer, primary_key=True, index=True)
    sent_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    to_email = Column(Text)
    subject = Column(Text)
    body = Column(Text)
    status = Column(Text)
    error = Column(Text)
    context = Column(Text)  # JSON stored as text
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class CalibrationReport(Base):
    __tablename__ = "calibration_reports"

    gauge_id = Column(Integer, primary_key=True)
    idfn_no = Column(Text)
    object_key = Column(Text, nullable=False)
    bucket = Column(Text)
    content_type = Column(Text)
    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    created_by = Column(Text)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class ToolRequest(Base):
    __tablename__ = "tool_requests"

    id = Column(Integer, primary_key=True, index=True)
    gauge_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False)
    requested_by = Column(String(100))
    requested_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    status = Column(String(20), default="requested")
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class ImportPayloadCache(Base):
    __tablename__ = "import_payload_cache"

    id = Column(String, primary_key=True)  # UUID
    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    kind = Column(Text, nullable=False)
    payload = Column(Text)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class AuditImport(Base):
    __tablename__ = "audit_imports"

    id = Column(String, primary_key=True)  # UUID
    user_name = Column(Text)
    file_name = Column(Text)
    status = Column(Text)
    started_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=False))
    created_count = Column(Integer, nullable=False, default=0)
    updated_count = Column(Integer, nullable=False, default=0)
    skipped_count = Column(Integer, nullable=False, default=0)
    error_count = Column(Integer, nullable=False, default=0)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class AuditImportRow(Base):
    __tablename__ = "audit_import_rows"

    import_id = Column(String, primary_key=True)  # UUID
    row_index = Column(Integer, primary_key=True)
    pcr_number = Column(Integer)
    status = Column(Text)
    error_message = Column(Text)
    raw_data = Column(Text)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    gauge_id = Column(Integer, nullable=False)
    title = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    created_by = Column(Text)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])


class ReportFile(Base):
    __tablename__ = "report_files"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    bucket = Column(Text)
    object_key = Column(Text, nullable=False)
    filename = Column(Text)
    content_type = Column(Text)
    size_bytes = Column(Integer)
    created_at = Column(DateTime(timezone=False), server_default=func.now(), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    # Relationships
    company = relationship("Company", foreign_keys=[company_id])
