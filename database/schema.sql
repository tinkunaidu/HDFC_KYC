-- KYC Database Schema
CREATE TABLE IF NOT EXISTS kyc_applications (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT NOT NULL,
    document_type TEXT NOT NULL,
    document_number TEXT NOT NULL,
    document_file_path TEXT,
    photo_file_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    attempts_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(mobile),
    UNIQUE(document_number)
);

CREATE INDEX IF NOT EXISTS idx_mobile ON kyc_applications(mobile);
CREATE INDEX IF NOT EXISTS idx_document_number ON kyc_applications(document_number);
CREATE INDEX IF NOT EXISTS idx_status ON kyc_applications(status);
CREATE INDEX IF NOT EXISTS idx_created_at ON kyc_applications(created_at);

