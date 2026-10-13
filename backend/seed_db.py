#!/usr/bin/env python3
"""
Seed database with initial company, users, calibration equipment/tools, and gauges.
"""

from datetime import date, datetime, timedelta
from app.database import SessionLocal, engine, Base
from app import models
from app.auth import get_password_hash

def seed_database():
    print("Seeding database with initial workflow data...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Company
        company = db.query(models.Company).filter(models.Company.id == 1).first()
        if not company:
            company = models.Company(
                id=1,
                name="CMTI Gauge Calibration System",
                address="Central Manufacturing Technology Institute, Tumkur Road, Bengaluru",
                phone="+91-80-23370190",
                email="gagecalibrationcmti@gmail.com",
                is_active=True
            )
            db.add(company)
            db.commit()
            db.refresh(company)
            print("  [+] Created default company: CMTI Gauge Calibration System (ID: 1)")
        else:
            print("  [*] Default company already exists.")

        # 2. Users
        users_data = [
            {
                "username": "admin",
                "email": "admin@cmti.in",
                "role": "admin",
                "employee_id": "EMP001",
                "password": "adminpassword"
            },
            {
                "username": "operator1",
                "email": "operator1@cmti.in",
                "role": "operator",
                "employee_id": "EMP002",
                "password": "operatorpassword"
            },
            {
                "username": "operator2",
                "email": "operator2@cmti.in",
                "role": "operator",
                "employee_id": "EMP003",
                "password": "operatorpassword"
            }
        ]

        created_users = {}
        for udata in users_data:
            existing = db.query(models.User).filter(models.User.username == udata["username"]).first()
            if not existing:
                user = models.User(
                    username=udata["username"],
                    email=udata["email"],
                    role=udata["role"],
                    employee_id=udata["employee_id"],
                    password_hash=get_password_hash(udata["password"]),
                    company_id=company.id
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                created_users[udata["username"]] = user
                print(f"  [+] Created user: {user.username} ({user.role}) - Password: {udata['password']}")
            else:
                created_users[udata["username"]] = existing
                print(f"  [*] User already exists: {existing.username}")

        admin_user = created_users.get("admin")

        # 3. Calibration Equipment / Standard Tools
        equipments_data = [
            {
                "name_of_the_equipment": "Digital Micrometer Master Standard",
                "location": "Metrology Lab 1",
                "receipt_date": date(2025, 1, 15),
                "make_model": "Mitutoyo 293-240-30",
                "idfn_no": "EQ-MIC-001",
                "overall_measurement_uncertainty": "± 0.001 mm",
                "calibration_freq_months": 12,
                "date_of_last_calibration": date(2025, 6, 1),
                "calibration_due": date(2026, 6, 1),
                "pcr_number": 1001
            },
            {
                "name_of_the_equipment": "Master Vernier Caliper Standard",
                "location": "Quality Lab 2",
                "receipt_date": date(2025, 2, 10),
                "make_model": "Starrett 505-671",
                "idfn_no": "EQ-CAL-002",
                "overall_measurement_uncertainty": "± 0.02 mm",
                "calibration_freq_months": 12,
                "date_of_last_calibration": date(2025, 5, 15),
                "calibration_due": date(2026, 5, 15),
                "pcr_number": 1002
            },
            {
                "name_of_the_equipment": "Digital Pressure Gauge Calibrator",
                "location": "Standards Room",
                "receipt_date": date(2025, 3, 5),
                "make_model": "Fluke 700G31",
                "idfn_no": "EQ-PRS-003",
                "overall_measurement_uncertainty": "± 0.05 % FS",
                "calibration_freq_months": 6,
                "date_of_last_calibration": date(2025, 9, 1),
                "calibration_due": date(2026, 3, 1),
                "pcr_number": 1003
            },
            {
                "name_of_the_equipment": "Digital Torque Wrench Tester",
                "location": "Mechanical Testing Lab",
                "receipt_date": date(2025, 4, 1),
                "make_model": "Norbar TTT 550",
                "idfn_no": "EQ-TRQ-004",
                "overall_measurement_uncertainty": "± 0.5 %",
                "calibration_freq_months": 12,
                "date_of_last_calibration": date(2025, 4, 10),
                "calibration_due": date(2026, 4, 10),
                "pcr_number": 1004
            },
            {
                "name_of_the_equipment": "Master Setting Ring Set",
                "location": "Inspection Room",
                "receipt_date": date(2025, 1, 20),
                "make_model": "Carl Zeiss Master Ring",
                "idfn_no": "EQ-RNG-005",
                "overall_measurement_uncertainty": "± 0.0005 mm",
                "calibration_freq_months": 24,
                "date_of_last_calibration": date(2025, 1, 20),
                "calibration_due": date(2027, 1, 20),
                "pcr_number": 1005
            }
        ]

        for eq in equipments_data:
            existing_eq = db.query(models.EquipmentUsedForCalibration).filter(
                models.EquipmentUsedForCalibration.idfn_no == eq["idfn_no"]
            ).first()
            if not existing_eq:
                equipment = models.EquipmentUsedForCalibration(
                    company_id=company.id,
                    **eq
                )
                db.add(equipment)
                print(f"  [+] Added Calibration Equipment: {eq['name_of_the_equipment']} ({eq['idfn_no']})")

        db.commit()

        # 4. Gauges & Ranges
        gauges_data = [
            {
                "name": "Digital Outside Micrometer 0-25mm",
                "serial_number": "MIC-2026-01",
                "manufacturer": "Mitutoyo",
                "location": "Tool Room A",
                "status": "available",
                "ranges": ["0-25 mm", "0.001 mm resolution"]
            },
            {
                "name": "Dial Indicator Gauge 0-10mm",
                "serial_number": "IND-2026-02",
                "manufacturer": "Baker Gauges",
                "location": "Tool Room B",
                "status": "available",
                "ranges": ["0-10 mm", "0.01 mm resolution"]
            },
            {
                "name": "Hydraulic Pressure Gauge 0-500 Bar",
                "serial_number": "PRG-2026-03",
                "manufacturer": "WIKA",
                "location": "Hydraulics Section",
                "status": "available",
                "ranges": ["0-500 Bar", "0-7250 PSI"]
            },
            {
                "name": "Thread Plug Gauge M12x1.75 6H",
                "serial_number": "TPG-2026-04",
                "manufacturer": "JNS Precision",
                "location": "Calibration Room",
                "status": "under_calibration",
                "ranges": ["M12 x 1.75 6H"]
            },
            {
                "name": "Digital Height Gauge 0-300mm",
                "serial_number": "HGT-2026-05",
                "manufacturer": "Sylvac",
                "location": "Metrology Lab",
                "status": "available",
                "ranges": ["0-300 mm", "0.005 mm resolution"]
            }
        ]

        created_gauges = []
        for gdata in gauges_data:
            existing_gauge = db.query(models.Gauge).filter(models.Gauge.serial_number == gdata["serial_number"]).first()
            if not existing_gauge:
                ranges = gdata.pop("ranges")
                gauge = models.Gauge(
                    added_by=admin_user.id if admin_user else None,
                    company_id=company.id,
                    **gdata
                )
                db.add(gauge)
                db.commit()
                db.refresh(gauge)
                created_gauges.append(gauge)

                for r_label in ranges:
                    grange = models.GaugeRange(
                        gauge_id=gauge.gauge_id,
                        label=r_label,
                        company_id=company.id
                    )
                    db.add(grange)
                db.commit()
                print(f"  [+] Added Gauge: {gauge.name} (SN: {gauge.serial_number})")
            else:
                created_gauges.append(existing_gauge)

        # 5. Calibration Schedules & History
        today = date.today()
        for idx, g in enumerate(created_gauges):
            existing_sch = db.query(models.CalibrationSchedule).filter(models.CalibrationSchedule.gauge_id == g.gauge_id).first()
            if not existing_sch:
                last_cal = today - timedelta(days=90 + idx * 30)
                next_due = last_cal + timedelta(days=180)
                sch = models.CalibrationSchedule(
                    gauge_id=g.gauge_id,
                    last_calibration=last_cal,
                    next_due_date=next_due,
                    frequency_type="months",
                    frequency_value=6,
                    notification_sent=False,
                    company_id=company.id
                )
                db.add(sch)

                cal_hist = models.CalibrationHistory(
                    gauge_id=g.gauge_id,
                    calibration_date=last_cal,
                    status="Pass",
                    comments=f"Periodic calibration conducted. Accuracy within specified tolerance standards.",
                    approved_by=admin_user.id if admin_user else None,
                    company_id=company.id
                )
                db.add(cal_hist)
                print(f"  [+] Added Calibration Schedule & History for Gauge ID {g.gauge_id}")

        db.commit()

        # 6. Sample Gauge Checkout Requests
        if created_gauges:
            sample_gauge = created_gauges[0]
            existing_req = db.query(models.GaugeRequest).filter(models.GaugeRequest.gauge_id == sample_gauge.gauge_id).first()
            if not existing_req:
                g_req = models.GaugeRequest(
                    gauge_id=sample_gauge.gauge_id,
                    requested_by="operator1",
                    status="accepted",
                    accepted_by="admin",
                    accepted_at=datetime.now() - timedelta(days=2),
                    company_id=company.id
                )
                db.add(g_req)
                db.commit()
                print(f"  [+] Added Sample Gauge Request for {sample_gauge.name}")

        print("\n[SUCCESS] Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during database seeding: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
