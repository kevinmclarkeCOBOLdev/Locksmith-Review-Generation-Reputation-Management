-- ==============================================================================
-- LockReview — Phase 03 Database Migration: Core Reputation & Review Tables
-- ==============================================================================
-- Target Database: MySQL (Shared with LockQuote)
-- Mode: Additive Migration (CREATE TABLE IF NOT EXISTS)
-- ==============================================================================

-- 1. Create review_requests table
CREATE TABLE IF NOT EXISTS `review_requests` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `lead_id` VARCHAR(36) NOT NULL,
  `quote_id` VARCHAR(36) NULL,
  `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
  `channel` VARCHAR(20) NOT NULL DEFAULT 'sms',
  `secure_token` VARCHAR(64) NOT NULL,
  `token_hash` VARCHAR(64) NULL,
  `rating` TINYINT NULL,
  `sent_at` TIMESTAMP NULL DEFAULT NULL,
  `responded_at` TIMESTAMP NULL DEFAULT NULL,
  `expires_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_review_requests_token` (`secure_token`),
  INDEX `idx_review_requests_tenant` (`tenant_id`),
  INDEX `idx_review_requests_lead` (`lead_id`),
  INDEX `idx_review_requests_status` (`status`),
  INDEX `idx_review_requests_created_at` (`created_at`),
  CONSTRAINT `fk_review_req_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_req_lead` FOREIGN KEY (`lead_id`) REFERENCES `leads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_req_quote` FOREIGN KEY (`quote_id`) REFERENCES `quotes` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create review_feedback table
CREATE TABLE IF NOT EXISTS `review_feedback` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `review_request_id` VARCHAR(36) NOT NULL,
  `rating` TINYINT NOT NULL,
  `sentiment` VARCHAR(20) NOT NULL,
  `feedback_text` TEXT NULL,
  `public_platform_clicked` BOOLEAN NOT NULL DEFAULT FALSE,
  `public_platform_name` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_review_feedback_tenant` (`tenant_id`),
  INDEX `idx_review_feedback_request` (`review_request_id`),
  INDEX `idx_review_feedback_sentiment` (`sentiment`),
  CONSTRAINT `fk_review_feedback_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_feedback_request` FOREIGN KEY (`review_request_id`) REFERENCES `review_requests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create review_platform_settings table
CREATE TABLE IF NOT EXISTS `review_platform_settings` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `platform_name` VARCHAR(50) NOT NULL,
  `destination_url` TEXT NOT NULL,
  `is_enabled` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_review_platform_tenant` (`tenant_id`),
  INDEX `idx_review_platform_name` (`platform_name`),
  CONSTRAINT `fk_review_platform_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create review_templates table
CREATE TABLE IF NOT EXISTS `review_templates` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `channel` VARCHAR(20) NOT NULL,
  `template_name` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(255) NULL,
  `body_template` TEXT NOT NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_review_templates_tenant` (`tenant_id`),
  INDEX `idx_review_templates_channel` (`channel`),
  CONSTRAINT `fk_review_templates_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
