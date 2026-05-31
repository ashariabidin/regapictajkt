CREATE DATABASE IF NOT EXISTS apicta_2026
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE apicta_2026;

CREATE TABLE IF NOT EXISTS registrations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reference_code VARCHAR(32) NOT NULL,
  registration_type VARCHAR(32) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  country VARCHAR(100) NULL,
  organization VARCHAR(190) NULL,
  position VARCHAR(190) NULL,
  phone_whatsapp VARCHAR(50) NULL,
  passport_or_id VARCHAR(80) NULL,
  arrival_date DATE NULL,
  role_name VARCHAR(120) NULL,
  division VARCHAR(120) NULL,
  team_name VARCHAR(190) NULL,
  project_title VARCHAR(190) NULL,
  category VARCHAR(120) NULL,
  notes TEXT NULL,
  attachments_json JSON NULL,
  raw_payload JSON NOT NULL,
  qr_token VARCHAR(64) NOT NULL,
  status ENUM('pending', 'approved', 'needs_review', 'rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_registrations_reference_code (reference_code),
  KEY idx_registrations_type (registration_type),
  KEY idx_registrations_email (email),
  KEY idx_registrations_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
