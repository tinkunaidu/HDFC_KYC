# KYC Database CLI

A simple command-line interface to manage the KYC applications database.

## Quick Start

The database file (`kyc.db`) will be automatically created in the `database/` directory when you first run any command.

## Usage

### Using npm script (recommended):
```bash
npm run db <command> [arguments]
```

### Direct execution:
```bash
node database/db.js <command> [arguments]
```

## Commands

### List Applications
```bash
npm run db list [limit]
```
List all KYC applications (default limit: 50)

**Example:**
```bash
npm run db list
npm run db list 10
```

### Get Application
```bash
npm run db get <id|mobile|document_number>
```
Get details of a specific application by ID, mobile number, or document number.

**Example:**
```bash
npm run db get KYC-1234567890
npm run db get 9876543210
npm run db get "1234-5678-9012"
```

### Add Application
```bash
npm run db add <name> <mobile> <email> <document_type> <document_number> [status]
```
Add a new KYC application to the database.

**Document Types:** `aadhaar`, `pan`, `voter_id`, `passport`  
**Status:** `pending`, `approved`, `rejected`, `locked` (default: `pending`)

**Example:**
```bash
npm run db add "John Doe" "9876543210" "john@example.com" "aadhaar" "1234-5678-9012"
npm run db add "Jane Smith" "9999888877" "jane@example.com" "pan" "ABCDE1234F" "approved"
```

### Update Application
```bash
npm run db update <id> <field> <value>
```
Update a specific field of an application.

**Allowed Fields:** `name`, `mobile`, `email`, `document_type`, `document_number`, `status`, `attempts_count`

**Example:**
```bash
npm run db update KYC-1234567890 status approved
npm run db update KYC-1234567890 attempts_count 2
```

### Delete Application
```bash
npm run db delete <id>
```
Delete an application from the database.

**Example:**
```bash
npm run db delete KYC-1234567890
```

### Search Applications
```bash
npm run db search <query>
```
Search applications by name, mobile, email, or document number.

**Example:**
```bash
npm run db search "John"
npm run db search "9876543210"
npm run db search "@example.com"
```

### Show Statistics
```bash
npm run db stats
```
Display database statistics (total, approved, rejected, pending, locked).

**Example:**
```bash
npm run db stats
```

### Help
```bash
npm run db help
```
Show help message with all available commands.

## Database Schema

The database contains a single table `kyc_applications` with the following fields:

- `id` - Unique application ID (TEXT, PRIMARY KEY)
- `name` - Applicant name (TEXT, NOT NULL)
- `mobile` - Mobile number (TEXT, NOT NULL, UNIQUE)
- `email` - Email address (TEXT, NOT NULL)
- `document_type` - Type of document (TEXT, NOT NULL)
- `document_number` - Document number (TEXT, NOT NULL, UNIQUE)
- `document_file_path` - Path to uploaded document file (TEXT)
- `photo_file_path` - Path to uploaded photo file (TEXT)
- `status` - Application status (TEXT, NOT NULL, DEFAULT 'pending')
- `attempts_count` - Number of attempts (INTEGER, DEFAULT 0)
- `created_at` - Creation timestamp (DATETIME)
- `updated_at` - Last update timestamp (DATETIME)

## Database File Location

The SQLite database file is stored at:
```
database/kyc.db
```

## Direct SQLite Access

You can also access the database directly using the SQLite command-line tool:

```bash
sqlite3 database/kyc.db
```

Once in SQLite, you can run SQL queries:
```sql
-- View all applications
SELECT * FROM kyc_applications;

-- Count by status
SELECT status, COUNT(*) FROM kyc_applications GROUP BY status;

-- Find by mobile
SELECT * FROM kyc_applications WHERE mobile = '9876543210';

-- Exit
.quit
```

## Examples

### Complete Workflow Example

```bash
# 1. Check current statistics
npm run db stats

# 2. Add a new application
npm run db add "John Doe" "9876543210" "john@example.com" "aadhaar" "1234-5678-9012"

# 3. List all applications
npm run db list

# 4. Get specific application
npm run db get 9876543210

# 5. Update status to approved
npm run db update KYC-<id> status approved

# 6. Search for applications
npm run db search "John"

# 7. View updated statistics
npm run db stats
```

## Notes

- The database is automatically initialized on first use
- Mobile numbers and document numbers must be unique
- The database file is created in the `database/` directory
- All timestamps are stored in UTC

