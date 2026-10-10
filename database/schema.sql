-- ============================================================================
-- VERITY: Next-Generation Smart Multi-Layer Attendance Verification System
-- Production Database Schema (MySQL 8.0+)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `verity_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `verity_db`;

-- 1. Users Table (Core Auth & Roles)
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL, -- Argon2id / bcrypt hash
  `role` ENUM('admin', 'faculty', 'student') NOT NULL,
  `account_status` ENUM('active', 'inactive', 'suspended', 'pending_enrolment') DEFAULT 'active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Students Table
CREATE TABLE IF NOT EXISTS `students` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL UNIQUE,
  `roll_number` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(128) NOT NULL,
  `department` VARCHAR(128) NOT NULL,
  `semester` INT NOT NULL DEFAULT 1,
  `enrolled_face_template` BOOLEAN DEFAULT FALSE,
  `trust_score` INT DEFAULT 100,
  `registered_device_id` VARCHAR(128),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Faculty Table
CREATE TABLE IF NOT EXISTS `faculty` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL UNIQUE,
  `employee_id` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(128) NOT NULL,
  `department` VARCHAR(128) NOT NULL,
  `designation` VARCHAR(128) NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Classrooms Table (Geofence Config)
CREATE TABLE IF NOT EXISTS `classrooms` (
  `id` VARCHAR(64) PRIMARY KEY,
  `code` VARCHAR(32) NOT NULL UNIQUE,
  `name` VARCHAR(128) NOT NULL,
  `building` VARCHAR(128) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `allowed_radius_meters` INT NOT NULL DEFAULT 25,
  `wifi_bssid` VARCHAR(64)
) ENGINE=InnoDB;

-- 5. Subjects Table
CREATE TABLE IF NOT EXISTS `subjects` (
  `id` VARCHAR(64) PRIMARY KEY,
  `code` VARCHAR(32) NOT NULL UNIQUE,
  `name` VARCHAR(128) NOT NULL,
  `department` VARCHAR(128) NOT NULL,
  `total_classes` INT DEFAULT 36,
  `faculty_id` VARCHAR(64),
  FOREIGN KEY (`faculty_id`) REFERENCES `faculty`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 6. Enrollments Table (Student-Subject Authorization)
CREATE TABLE IF NOT EXISTS `enrollments` (
  `id` VARCHAR(64) PRIMARY KEY,
  `student_id` VARCHAR(64) NOT NULL,
  `subject_id` VARCHAR(64) NOT NULL,
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_student_subject` (`student_id`, `subject_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Sessions Table (Class Attendance Sessions)
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `subject_id` VARCHAR(64) NOT NULL,
  `faculty_id` VARCHAR(64) NOT NULL,
  `classroom_id` VARCHAR(64) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `late_threshold_minutes` INT DEFAULT 10,
  `status` ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'active',
  `geofence_radius_meters` INT DEFAULT 25,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`),
  FOREIGN KEY (`faculty_id`) REFERENCES `faculty`(`id`),
  FOREIGN KEY (`classroom_id`) REFERENCES `classrooms`(`id`)
) ENGINE=InnoDB;

-- 8. Session Tokens / Challenges (Dynamic Rotating QR Tokens)
CREATE TABLE IF NOT EXISTS `session_tokens` (
  `id` VARCHAR(64) PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `challenge_token` VARCHAR(128) NOT NULL UNIQUE,
  `expires_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Face Templates Table (128-D Vector Embeddings)
CREATE TABLE IF NOT EXISTS `face_templates` (
  `id` VARCHAR(64) PRIMARY KEY,
  `student_id` VARCHAR(64) NOT NULL UNIQUE,
  `vector_embedding` JSON NOT NULL, -- 128 float array
  `enrolled_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `consent_version` VARCHAR(32) DEFAULT 'v1.0',
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Attendance Table (Transactional Final State)
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` VARCHAR(64) PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `student_id` VARCHAR(64) NOT NULL,
  `status` ENUM('present', 'late', 'pending_review', 'rejected') NOT NULL,
  `checkin_timestamp` DATETIME NOT NULL,
  `verified_by_engine` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `unique_session_student` (`session_id`, `student_id`), -- PREVENTS DUPLICATE CHECK-INS
  FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`)
) ENGINE=InnoDB;

-- 11. Verification Attempts Table (6-Layer Telemetry Audit)
CREATE TABLE IF NOT EXISTS `verification_attempts` (
  `id` VARCHAR(64) PRIMARY KEY,
  `session_id` VARCHAR(64) NOT NULL,
  `student_id` VARCHAR(64) NOT NULL,
  `overall_status` ENUM('verified', 'rejected', 'pending_review', 'incomplete') NOT NULL,
  `risk_score` INT DEFAULT 0,
  `face_match_score` DECIMAL(5,2),
  `liveness_score` DECIMAL(5,2),
  `gps_distance_meters` DECIMAL(8,2),
  `ip_address` VARCHAR(45),
  `device_id` VARCHAR(128),
  `attempt_timestamp` DATETIME NOT NULL,
  FOREIGN KEY (`session_id`) REFERENCES `sessions`(`id`),
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`)
) ENGINE=InnoDB;

-- 12. Risk Events Table (Suspicious Attempts Queue)
CREATE TABLE IF NOT EXISTS `risk_events` (
  `id` VARCHAR(64) PRIMARY KEY,
  `attempt_id` VARCHAR(64) NOT NULL,
  `risk_level` ENUM('high', 'medium', 'low') NOT NULL,
  `risk_score` INT NOT NULL,
  `primary_flag` TEXT NOT NULL,
  `status` ENUM('unresolved', 'approved', 'rejected') DEFAULT 'unresolved',
  `reviewed_by` VARCHAR(64),
  `reviewed_at` DATETIME,
  `review_reason` TEXT,
  FOREIGN KEY (`attempt_id`) REFERENCES `verification_attempts`(`id`)
) ENGINE=InnoDB;

-- 13. Audit Logs Table (Immutable Security Audit)
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `timestamp` DATETIME NOT NULL,
  `actor` VARCHAR(128) NOT NULL,
  `role` VARCHAR(32) NOT NULL,
  `action` VARCHAR(64) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NOT NULL
) ENGINE=InnoDB;

-- 14. Correction Requests Table (Appeals)
CREATE TABLE IF NOT EXISTS `correction_requests` (
  `id` VARCHAR(64) PRIMARY KEY,
  `attendance_id` VARCHAR(64) NOT NULL,
  `student_id` VARCHAR(64) NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students`(`id`)
) ENGINE=InnoDB;

-- 15. Refresh Sessions Table (JWT Revocation)
CREATE TABLE IF NOT EXISTS `refresh_sessions` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` VARCHAR(64) NOT NULL,
  `refresh_token_hash` VARCHAR(255) NOT NULL,
  `is_revoked` BOOLEAN DEFAULT FALSE,
  `expires_at` DATETIME NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
