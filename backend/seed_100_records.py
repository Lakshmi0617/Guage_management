#!/usr/bin/env python3
"""
Seed 100 realistic Gauges and 100 Calibration Standard Equipments into the database.
"""

from datetime import date, datetime, timedelta
import random
from app.database import SessionLocal, engine, Base
from app import models
from app.auth import get_password_hash

def seed_100():
    print("Generating and seeding 100 Gauges and 100 Calibration Equipments...")
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

        # 2. Get Admin User
        admin_user = db.query(models.User).filter(models.User.username == "admin").first()
        if not admin_user:
            admin_user = models.User(
                username="admin",
                email="admin@cmti.in",
                role="admin",
                employee_id="EMP001",
                password_hash=get_password_hash("adminpassword"),
                company_id=company.id
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        # Equipment Categories & Templates
        locations = [
            "Metrology Lab 1", "Metrology Lab 2", "Quality Control Dept", "Standards Room",
            "Shop Floor A", "Shop Floor B", "Tool Room 1", "Tool Room 2", "Assembly Bay 3",
            "Hydraulics Lab", "Pneumatics Section", "CNC Machining Center", "Inspection Room"
        ]

        eq_types = [
            ("Digital Micrometer Master Standard", "Mitutoyo 293- series", "± 0.001 mm"),
            ("Vernier Caliper Standard Gauge", "Starrett 1202F series", "± 0.02 mm"),
            ("Digital Pressure Calibrator Unit", "Fluke 700G series", "± 0.05 % FS"),
            ("Digital Torque Wrench Calibrator", "Norbar TTT series", "± 0.5 %"),
            ("Master Setting Ring Gauge Set", "Carl Zeiss Premium", "± 0.0005 mm"),
            ("Gauge Block Master Set Class 0", "Mitutoyo 516 series", "± 0.0001 mm"),
            ("Electronic Height Master Standard", "Sylvac Hi-Cal 300", "± 0.002 mm"),
            ("Bore Gauge Calibration Stand", "Mahr Digimar", "± 0.001 mm"),
            ("Surface Roughness Tester Calibrator", "Taylor Hobson Surtronic", "± 0.05 µm"),
            ("Digital Temperature Calibrator Bath", "Fluke 9142 Micro-Bath", "± 0.01 °C")
        ]

        # 3. Seed 100 Equipments
        print("  [+] Adding 100 Calibration Standard Equipments...")
        eq_count = 0
        today = date.today()

        for i in range(1, 101):
            idfn = f"EQ-CMTI-{i:03d}"
            existing = db.query(models.EquipmentUsedForCalibration).filter(
                models.EquipmentUsedForCalibration.idfn_no == idfn
            ).first()

            if not existing:
                eq_tmpl = eq_types[i % len(eq_types)]
                rec_date = today - timedelta(days=random.randint(200, 800))
                last_cal = today - timedelta(days=random.randint(10, 150))
                freq = random.choice([6, 12, 24])
                due_date = last_cal + timedelta(days=freq * 30)

                eq_obj = models.EquipmentUsedForCalibration(
                    name_of_the_equipment=f"{eq_tmpl[0]} #{i:03d}",
                    location=locations[i % len(locations)],
                    receipt_date=rec_date,
                    make_model=f"{eq_tmpl[1]} (Mod-{1000 + i})",
                    idfn_no=idfn,
                    overall_measurement_uncertainty=eq_tmpl[2],
                    calibration_freq_months=freq,
                    date_of_last_calibration=last_cal,
                    calibration_due=due_date,
                    pcr_number=2000 + i,
                    company_id=company.id
                )
                db.add(eq_obj)
                eq_count += 1

        db.commit()
        print(f"  [+] Successfully seeded {eq_count} new Calibration Equipments!")

        # 4. Seed 100 Gauges
        print("  [+] Adding 100 Gauges with Ranges, Schedules & Histories...")

        gauge_categories = [
            ("Digital Outside Micrometer", "Mitutoyo", ["0-25 mm", "25-50 mm", "50-75 mm", "75-100 mm"]),
            ("Vernier Caliper 0-150mm", "Starrett", ["0-150 mm", "0.02 mm resolution"]),
            ("Digital Dial Indicator", "Baker Gauges", ["0-10 mm", "0.001 mm resolution"]),
            ("Hydraulic Pressure Gauge", "WIKA", ["0-100 Bar", "0-250 Bar", "0-400 Bar", "0-600 Bar"]),
            ("Thread Plug Gauge 6H", "JNS Precision", ["M6x1.0", "M8x1.25", "M10x1.5", "M12x1.75", "M16x2.0"]),
            ("Thread Ring Gauge 6g", "Insize", ["M6x1.0", "M8x1.25", "M10x1.5", "M12x1.75"]),
            ("Digital Height Gauge 0-600mm", "Sylvac", ["0-300 mm", "0-600 mm", "0.001 mm resolution"]),
            ("Dial Bore Gauge 18-35mm", "Mahr", ["18-35 mm", "35-50 mm", "50-150 mm"]),
            ("Digital Torque Wrench 20-200Nm", "Norbar", ["20-200 Nm", "50-500 Nm"]),
            ("Bevel Protractor 0-360 Deg", "Mitutoyo", ["0-360 Degree", "5 arc-min resolution"]),
            ("Feeler Gauge Blade Set", "Kinex", ["0.05-1.00 mm", "13 blades"]),
            ("Pin Gauge Set Class Z", "Meyer", ["0.50-10.00 mm", "0.01 mm increments"]),
            ("Depth Vernier Caliper 0-200mm", "Baker Gauges", ["0-200 mm", "0.02 mm resolution"]),
            ("Vacuum Pressure Gauge", "Marshall", ["-1 to 0 Bar", "-30 to 0 inHg"]),
            ("Digital Thickness Gauge", "Elcometer", ["0-1000 µm", "1 µm resolution"])
        ]

        statuses = ["available", "available", "available", "issued", "under_calibration"]

        g_count = 0
        for i in range(1, 101):
            sn = f"SN-CMTI-{i:03d}"
            existing = db.query(models.Gauge).filter(models.Gauge.serial_number == sn).first()

            if not existing:
                cat_idx = (i - 1) % len(gauge_categories)
                cat_name, cat_mfr, cat_ranges = gauge_categories[cat_idx]
                g_status = statuses[i % len(statuses)]
                g_loc = locations[(i * 3) % len(locations)]

                gauge = models.Gauge(
                    name=f"{cat_name} #{i:03d}",
                    serial_number=sn,
                    manufacturer=cat_mfr,
                    location=g_loc,
                    status=g_status,
                    added_by=admin_user.id,
                    company_id=company.id
                )
                db.add(gauge)
                db.commit()
                db.refresh(gauge)
                g_count += 1

                # Ranges
                for r_label in cat_ranges:
                    grange = models.GaugeRange(
                        gauge_id=gauge.gauge_id,
                        label=r_label,
                        company_id=company.id
                    )
                    db.add(grange)

                # Schedule
                last_cal = today - timedelta(days=random.randint(15, 180))
                freq_val = random.choice([6, 12])
                next_due = last_cal + timedelta(days=freq_val * 30)

                sch = models.CalibrationSchedule(
                    gauge_id=gauge.gauge_id,
                    last_calibration=last_cal,
                    next_due_date=next_due,
                    frequency_type="months",
                    frequency_value=freq_val,
                    notification_sent=False,
                    company_id=company.id
                )
                db.add(sch)

                # History
                cal_hist = models.CalibrationHistory(
                    gauge_id=gauge.gauge_id,
                    calibration_date=last_cal,
                    status="Pass" if i % 15 != 0 else "Fail",
                    comments=f"Routine periodic calibration. Instrument verified against reference standard EQ-CMTI-{(i % 100) + 1:03d}.",
                    approved_by=admin_user.id,
                    company_id=company.id
                )
                db.add(cal_hist)

        db.commit()
        print(f"  [+] Successfully seeded {g_count} new Gauges with Ranges & Schedules!")
        print("\n[SUCCESS] 100 Gauges and 100 Equipments seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    seed_100()
