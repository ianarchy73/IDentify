/**
 * MySQL/MariaDB Migration: Create Initial Schema (for Laragon)
 * 
 * Usage: 
 * 1. Open MySQL console in Laragon or use:
 *    mysql -u root -p identify_db < backend/migrations/001_initial_schema_mysql.sql
 * 
 * 2. Or copy-paste the contents into phpMyAdmin SQL tab
 */

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS identify_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE identify_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  email VARCHAR(255) UNIQUE NOT NULL COMMENT 'Unique email address',
  password_hash VARCHAR(255) COMMENT 'Hashed password for email login',
  facebook_id VARCHAR(255) UNIQUE COMMENT 'Facebook ID for OAuth',
  name VARCHAR(255) COMMENT 'User display name',
  avatar LONGTEXT COMMENT 'Profile avatar URL',
  verified BOOLEAN DEFAULT false COMMENT 'Email verification status',
  status VARCHAR(50) DEFAULT 'active' COMMENT 'active, suspended, deleted',
  last_login TIMESTAMP NULL COMMENT 'Last login timestamp',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_facebook_id (facebook_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email Verification Codes Table
CREATE TABLE IF NOT EXISTS email_verifications (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL COMMENT '6-digit verification code',
  expires_at TIMESTAMP NOT NULL COMMENT 'Code expiration time',
  attempts INT DEFAULT 0 COMMENT 'Failed attempt counter',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id CHAR(36) NOT NULL COMMENT 'Foreign key to users',
  access_token LONGTEXT NOT NULL COMMENT 'JWT access token',
  refresh_token LONGTEXT NOT NULL UNIQUE COMMENT 'JWT refresh token',
  access_token_expires_at TIMESTAMP NOT NULL,
  refresh_token_expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent LONGTEXT,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_sessions_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_refresh_token (refresh_token(100)),
  INDEX idx_is_revoked (is_revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Cases Table
CREATE TABLE IF NOT EXISTS cases (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL COMMENT 'Case title',
  description LONGTEXT COMMENT 'Case description',
  url LONGTEXT COMMENT 'URL related to impersonation',
  risk VARCHAR(50) DEFAULT 'medium' COMMENT 'high, medium, resolved',
  status VARCHAR(50) DEFAULT 'open' COMMENT 'open, investigating, closed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  closed_at TIMESTAMP NULL,
  
  CONSTRAINT fk_cases_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_risk (risk),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Timeline Events Table
CREATE TABLE IF NOT EXISTS timeline_events (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  case_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  detail LONGTEXT NOT NULL,
  event_type VARCHAR(50) DEFAULT 'update' COMMENT 'update, evidence, contact, resolution',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_timeline_events_case_id FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  INDEX idx_case_id (case_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Evidence Table
CREATE TABLE IF NOT EXISTS evidence (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  case_id CHAR(36) NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'image, url, document, video',
  file_url LONGTEXT COMMENT 'URL to uploaded file',
  file_name VARCHAR(255),
  file_size INT COMMENT 'File size in bytes',
  uploaded_by CHAR(36) NOT NULL COMMENT 'User who uploaded',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_evidence_case_id FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  CONSTRAINT fk_evidence_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_case_id (case_id),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id CHAR(36) NOT NULL,
  action VARCHAR(255) NOT NULL COMMENT 'Action performed',
  resource_type VARCHAR(50) NOT NULL COMMENT 'Type of resource',
  resource_id VARCHAR(255) NOT NULL,
  changes JSON COMMENT 'Before/after values',
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_resource_type (resource_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id CHAR(36) UNIQUE NOT NULL,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  theme VARCHAR(50) DEFAULT 'auto' COMMENT 'light, dark, auto',
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_settings_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id CHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL COMMENT 'summary, detailed, evidence',
  case_ids JSON NOT NULL COMMENT 'Array of case IDs',
  status VARCHAR(50) DEFAULT 'generating' COMMENT 'generating, ready, error',
  file_url LONGTEXT COMMENT 'URL to generated report',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  
  CONSTRAINT fk_reports_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Monitoring Alerts Table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  user_id CHAR(36) NOT NULL,
  monitored_item VARCHAR(255) NOT NULL COMMENT 'Email, username, etc.',
  platform VARCHAR(50) NOT NULL COMMENT 'facebook, twitter, google, etc.',
  alert_type VARCHAR(50) DEFAULT 'custom' COMMENT 'new_account, activity, mention, custom',
  is_active BOOLEAN DEFAULT true,
  last_checked TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_monitoring_alerts_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_platform (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
