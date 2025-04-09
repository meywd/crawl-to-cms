-- Update convertedSites table to add progressPercent and ensure status has all the values we need
ALTER TABLE converted_sites ADD COLUMN IF NOT EXISTS progress_percent INTEGER DEFAULT 0;

-- Update status to support all the needed values
COMMENT ON COLUMN converted_sites.status IS 'Status can be: started, processing, in_progress, completed, failed';

-- Update any existing in-progress items to have a progress percentage
UPDATE converted_sites SET progress_percent = 50 WHERE status = 'in_progress' AND progress_percent = 0;

-- Update any existing completed items to have 100% progress
UPDATE converted_sites SET progress_percent = 100 WHERE status = 'completed' AND progress_percent = 0;

-- Make sure session table is preserved
-- This is a no-op but ensures we don't try to delete the session table
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'session'
);