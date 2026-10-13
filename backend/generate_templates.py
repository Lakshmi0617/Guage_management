#!/usr/bin/env python3
"""
Generates CSV and Excel dummy import files for Equipment Upload testing.
"""

import os
import csv
import openpyxl
from openpyxl import Workbook

HEADERS = [
    "name_of_the_equipment",
    "location",
    "receipt_date",
    "make_model",
    "idfn_no",
    "overall_measurement_uncertainty",
    "calibration_freq_months",
    "date_of_last_calibration",
    "calibration_due",
    "pcr_number",
    "ranges"
]

DUMMY_ROWS = [
    [
        "Digital Height Gauge Master",
        "Metrology Lab 1",
        "2025-01-10",
        "Mitutoyo 570-312",
        "EQ-IMP-001",
        "± 0.002 mm",
        12,
        "2025-06-15",
        "2026-06-15",
        3001,
        "0-300 mm;0.001 mm resolution"
    ],
    [
        "Outside Micrometer Standard",
        "Quality Dept",
        "2025-02-15",
        "Starrett 436.1",
        "EQ-IMP-002",
        "± 0.001 mm",
        12,
        "2025-07-20",
        "2026-07-20",
        3002,
        "0-25 mm;0.001 mm resolution"
    ],
    [
        "Digital Pressure Calibrator",
        "Standards Room",
        "2025-03-20",
        "Fluke 700G",
        "EQ-IMP-003",
        "± 0.05%",
        6,
        "2025-08-10",
        "2026-02-10",
        3003,
        "0-400 bar;0-5800 PSI"
    ],
    [
        "Torque Wrench Tester Unit",
        "Shop Floor A",
        "2025-04-05",
        "Norbar TTT 550",
        "EQ-IMP-004",
        "± 0.5%",
        12,
        "2025-09-05",
        "2026-09-05",
        3004,
        "0-500 Nm"
    ],
    [
        "Master Setting Ring Standard",
        "Tool Room 2",
        "2025-05-12",
        "Carl Zeiss Master Ring",
        "EQ-IMP-005",
        "± 0.0005 mm",
        24,
        "2025-10-01",
        "2027-10-01",
        3005,
        "0-100 mm"
    ]
]

def generate_files():
    target_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # 1. Generate CSV
    csv_path = os.path.join(target_dir, "equipment_dummy_import.csv")
    with open(csv_path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(HEADERS)
        writer.writerows(DUMMY_ROWS)
    print(f"[+] Created CSV file: {csv_path}")

    # 2. Generate XLSX
    xlsx_path = os.path.join(target_dir, "equipment_dummy_import.xlsx")
    wb = Workbook()
    ws = wb.active
    ws.title = "EquipmentTemplate"
    ws.append(HEADERS)
    for r in DUMMY_ROWS:
        ws.append(r)
    wb.save(xlsx_path)
    print(f"[+] Created Excel file: {xlsx_path}")

if __name__ == "__main__":
    generate_files()
