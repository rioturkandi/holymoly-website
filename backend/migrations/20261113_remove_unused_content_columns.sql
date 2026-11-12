-- Remove unused columns and table after database audit.
-- This migration has already been applied to the local database.
-- Run only against a database that still has the original schema.

ALTER TABLE about_content
  DROP COLUMN image_path,
  DROP COLUMN is_active;

ALTER TABLE workshop_content
  DROP COLUMN title,
  DROP COLUMN description;

DROP TABLE site_settings;
