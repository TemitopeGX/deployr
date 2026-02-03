-- Deployr Database Setup Script
-- Run this in phpMyAdmin or MySQL CLI

-- Create database
CREATE DATABASE IF NOT EXISTS deployr CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE deployr;

-- Grant privileges (if needed)
-- GRANT ALL PRIVILEGES ON deployr.* TO 'root'@'localhost';
-- FLUSH PRIVILEGES;

-- Verify database is created
SHOW DATABASES LIKE 'deployr';
