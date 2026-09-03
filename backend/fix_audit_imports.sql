-- SQL script to fix the audit_imports table structure
-- Run this script directly in your PostgreSQL database

-- Drop old columns if they exist
DO $$
BEGIN
    -- Drop old columns
    ALTER TABLE audit_imports DROP COLUMN IF EXISTS rows_total;
    ALTER TABLE audit_imports DROP COLUMN IF EXISTS rows_processed;
    ALTER TABLE audit_imports DROP COLUMN IF EXISTS rows_failed;
    ALTER TABLE audit_imports DROP COLUMN IF EXISTS error_message;
    
    -- Add new columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_imports' AND column_name = 'created_count') THEN
        ALTER TABLE audit_imports ADD COLUMN created_count INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_imports' AND column_name = 'updated_count') THEN
        ALTER TABLE audit_imports ADD COLUMN updated_count INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_imports' AND column_name = 'skipped_count') THEN
        ALTER TABLE audit_imports ADD COLUMN skipped_count INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'audit_imports' AND column_name = 'error_count') THEN
        ALTER TABLE audit_imports ADD COLUMN error_count INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    RAISE NOTICE 'audit_imports table updated successfully';
END $$;
