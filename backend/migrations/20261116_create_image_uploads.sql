-- HOLYMOLY image lifecycle tracking.
-- Existing referenced images are backfilled as attached.
-- Unreferenced legacy files are intentionally excluded.

CREATE TABLE image_uploads (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  image_path VARCHAR(500) NOT NULL,
  uploaded_by BIGINT UNSIGNED NULL,
  status ENUM('pending', 'attached', 'deleting') NOT NULL,
  pending_since DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_image_uploads_image_path (image_path),
  KEY idx_image_uploads_status_pending_since (status, pending_since),

  CONSTRAINT fk_image_uploads_uploaded_by
    FOREIGN KEY (uploaded_by)
    REFERENCES admin_users(id)
    ON DELETE SET NULL,

  CONSTRAINT chk_image_uploads_pending_since
    CHECK (
      (status = 'pending' AND pending_since IS NOT NULL)
      OR
      (status IN ('attached', 'deleting') AND pending_since IS NULL)
    )
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

-- Backfill all currently referenced image paths.
INSERT INTO image_uploads (
  image_path,
  uploaded_by,
  status,
  pending_since
)
SELECT DISTINCT
  referenced_images.image_path,
  NULL,
  'attached',
  NULL
FROM (
  SELECT image_path FROM home_content
  UNION ALL
  SELECT original_image_path FROM home_content
  UNION ALL
  SELECT image_path FROM home_services
  UNION ALL
  SELECT image_path FROM project_images
  UNION ALL
  SELECT image_path FROM workshop_images
  UNION ALL
  SELECT trophy_image_path FROM achievements
  UNION ALL
  SELECT vehicle_image_path FROM achievements
  UNION ALL
  SELECT image_path FROM media_coverage
  UNION ALL
  SELECT original_image_path FROM media_coverage
) AS referenced_images
WHERE referenced_images.image_path IS NOT NULL
  AND referenced_images.image_path <> '';
