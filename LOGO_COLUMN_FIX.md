# Logo Column Fix for Association Table

## Problem

The application was experiencing a database error when trying to create or update association records:

```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'logo' in 'field list'
```

## Root Cause

The `association` table in the production database is missing the `logo` column. This column was added to the schema in `Database.php` but the production database was not updated to include it.

The code in `api/index.php` references the `logo` field in two places:
- Line 96: POST /association endpoint (create)
- Line 127: PUT /association/:id endpoint (update)

## Solution

### SQL Migration Script

A migration script has been created: `api/add_logo_column.sql`

This script will:
1. Add the `logo` column to the `association` table (TEXT type)
2. Verify the column was added successfully

## How to Apply the Fix

### Option 1: Using MySQL Command Line

1. Connect to your production MySQL database:
   ```bash
   mysql -u your_username -p your_database_name
   ```

2. Run the migration script:
   ```bash
   source api/add_logo_column.sql
   ```

   Or execute it directly from the command line:
   ```bash
   mysql -u your_username -p your_database_name < api/add_logo_column.sql
   ```

### Option 2: Using phpMyAdmin or Similar Tool

1. Log into your database management tool
2. Select your database
3. Go to the SQL tab
4. Copy and paste the contents of `api/add_logo_column.sql`
5. Execute the query

### Option 3: Manual ALTER TABLE

If the script doesn't work, you can manually run this SQL command:

```sql
ALTER TABLE association ADD COLUMN logo TEXT AFTER description;
```

## Verification

After applying the fix, verify the column exists:

```sql
DESCRIBE association;
```

You should see the `logo` column listed with type `TEXT`.

Or use this query:

```sql
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'association' 
  AND COLUMN_NAME = 'logo';
```

## Testing

After applying the fix, test the following operations:

1. **Create Association**: POST to `/api/association` with logo data
2. **Update Association**: PUT to `/api/association/:id` with logo data
3. **Get Association**: GET from `/api/association` - should return logo field

## Impact

- **Before Fix**: Creating or updating association records with logo data fails with SQL error
- **After Fix**: All association CRUD operations work properly, including logo field
- **Data Safety**: Adding a column is a safe operation and won't affect existing data

## Files Involved

1. `api/Database.php` - Contains the table schema with logo column (line 68)
2. `api/index.php` - References logo field in association endpoints (lines 96, 127)
3. `api/add_logo_column.sql` - Migration script to add the missing column
4. `LOGO_COLUMN_FIX.md` - This documentation file

## Date

Fixed: March 26, 2026

## Related Issues

This is similar to the previous foreign key constraint fix documented in `DATABASE_FIX_README.md`. Both issues stem from the production database not being in sync with the schema defined in `Database.php`.

## Prevention

To prevent similar issues in the future:

1. Always run database migrations when deploying code changes
2. Consider implementing a proper migration system (e.g., Phinx, Laravel Migrations)
3. Test against a production-like database before deploying
4. Document all schema changes in migration scripts
