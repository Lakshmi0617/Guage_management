from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()

try:
    db.execute(text("ALTER TABLE public.gauge_requests ADD COLUMN IF NOT EXISTS return_status VARCHAR(50);"))
    db.execute(text("ALTER TABLE public.gauge_requests ADD COLUMN IF NOT EXISTS return_remarks TEXT;"))
    db.commit()
    print("Successfully added return_status and return_remarks columns to gauge_requests")
except Exception as e:
    db.rollback()
    print("Error altering gauge_requests:", e)

cols = db.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'gauge_requests'")).all()
print("Updated gauge_requests columns:", [c[0] for c in cols])
db.close()
