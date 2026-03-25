-- Fix for foreign key constraint issue in contacts table
-- This script removes the problematic foreign key if it exists and recreates the contacts table properly

-- Drop the contacts table and related tables to recreate them properly
DROP TABLE IF EXISTS contact_communication;
DROP TABLE IF EXISTS contacts;

-- Recreate contacts table without the problematic foreign key
CREATE TABLE contacts (
    id VARCHAR(50) PRIMARY KEY,
    contact_type VARCHAR(50) NOT NULL,
    location_category_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    entry_date DATE,
    company_name VARCHAR(255),
    salutation VARCHAR(50),
    contact_person VARCHAR(255),
    street VARCHAR(255),
    zip VARCHAR(10),
    city VARCHAR(255),
    alt_street VARCHAR(255),
    alt_zip VARCHAR(10),
    alt_city VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate contact communication channels table
CREATE TABLE contact_communication (
    id VARCHAR(50) PRIMARY KEY,
    contact_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    label VARCHAR(255),
    value VARCHAR(500),
    is_primary BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE
);
