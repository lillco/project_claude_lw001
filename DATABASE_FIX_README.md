# Database Foreign Key Constraint Fix

## Problem

The application was experiencing a fatal error when trying to connect to the database:

```
PHP Fatal error: Database connection failed: SQLSTATE[HY000]: General error: 3780 
Referencing column 'location_category_id' and referenced column 'id' in foreign 
key constraint 'contacts_ibfk_1' are incompatible.
```

## Root Cause

The `contacts` table had a foreign key constraint `contacts_ibfk_1` that was incompatible with the referenced `categories` table. This occurred because:

1. The foreign key constraint was not properly defined in the original table creation
2. MySQL detected an incompatibility between the referencing and referenced columns
3. The `Database.php` class tries to create tables on every connection, and the incompatible constraint prevented the connection from succeeding

## Solution

### 1. Updated Database.php

Modified the `contacts` table creation in `api/Database.php` to include the proper foreign key constraint:

```sql
CREATE TABLE IF NOT EXISTS contacts (
    ...
    location_category_id VARCHAR(50),
    ...
    FOREIGN KEY (location_category_id) REFERENCES categories(id) ON DELETE SET NULL
)
```

### 2. SQL Fix Script

Created `fix_contacts_foreign_key.sql` to repair existing databases:

```sql
-- Drop the incompatible constraint
ALTER TABLE contacts DROP FOREIGN KEY IF EXISTS contacts_ibfk_1;

-- Recreate it properly
ALTER TABLE contacts 
ADD CONSTRAINT contacts_ibfk_1 
FOREIGN KEY (location_category_id) 
REFERENCES categories(id) 
ON DELETE SET NULL;
```

## How to Apply the Fix

### For Production Database

1. Connect to your MySQL database:
   ```bash
   mysql -u your_username -p your_database_name
   ```

2. Run the fix script:
   ```bash
   source fix_contacts_foreign_key.sql
   ```

   Or execute it directly:
   ```bash
   mysql -u your_username -p your_database_name < fix_contacts_foreign_key.sql
   ```

### For New Installations

No action needed - the updated `Database.php` will create tables with the correct constraints.

## Verification

After applying the fix, verify the constraint is correct:

```sql
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM
    INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'contacts'
    AND REFERENCED_TABLE_NAME IS NOT NULL;
```

Expected output should show:
- `CONSTRAINT_NAME`: contacts_ibfk_1
- `REFERENCED_TABLE_NAME`: categories
- `REFERENCED_COLUMN_NAME`: id

## Impact

- **Before Fix**: Application could not connect to database, all API requests failed with 500 errors
- **After Fix**: Database connections work properly, all CRUD operations function normally
- **Data Safety**: The fix uses `ON DELETE SET NULL`, so if a category is deleted, the contact's `location_category_id` will be set to NULL rather than causing a constraint violation

## Files Modified

1. `api/Database.php` - Added proper foreign key constraint to contacts table
2. `fix_contacts_foreign_key.sql` - SQL script to fix existing databases
3. `DATABASE_FIX_README.md` - This documentation file

## Date

Fixed: March 25, 2026
