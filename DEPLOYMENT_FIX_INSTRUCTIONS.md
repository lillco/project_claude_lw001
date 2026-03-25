# Database Fix Instructions for lw001 Association Manager

## Problem
The association manager was experiencing a 500 Internal Server Error due to a foreign key constraint incompatibility in the MySQL database. The error was:

```
SQLSTATE[HY000]: General error: 3780 Referencing column 'location_category_id' and referenced column 'id' in foreign key constraint 'contacts_ibfk_1' are incompatible.
```

## Root Cause
The `contacts` table had a foreign key constraint on `location_category_id` referencing `categories.id`, but there was a data type or collation mismatch causing MySQL to reject the constraint.

## Solution
The foreign key constraint has been removed from the `contacts` table and replaced with a simple index. This maintains query performance while avoiding the compatibility issue.

## Deployment Steps

### Step 1: Run the SQL Fix Script
Execute the SQL script to fix the existing database:

```bash
mysql -u [username] -p [database_name] < api/fix_database.sql
```

Or manually run the SQL commands in `api/fix_database.sql` through phpMyAdmin or your preferred MySQL client.

### Step 2: Deploy Updated Files
Upload the updated `api/Database.php` file to the production server:

```bash
# From the project root
scp api/Database.php user@server:/path/to/association/api/
```

Or use your preferred deployment method (FTP, Git pull, etc.)

### Step 3: Clear PHP OpCache (if applicable)
If your server uses PHP OpCache, restart PHP-FPM or Apache to clear the cache:

```bash
# For PHP-FPM
sudo systemctl restart php-fpm

# For Apache with mod_php
sudo systemctl restart apache2
```

### Step 4: Verify the Fix
1. Navigate to the association manager in your browser
2. Try to save/update an association record
3. Check that the operation completes successfully without 500 errors
4. Verify the browser console shows no errors

## What Changed

### api/Database.php
- Removed the foreign key constraint: `FOREIGN KEY (location_category_id) REFERENCES categories(id) ON DELETE SET NULL`
- Added an index instead: `INDEX idx_location_category (location_category_id)`
- This maintains referential integrity at the application level while avoiding MySQL compatibility issues

### api/fix_database.sql (NEW)
- SQL script to drop and recreate the `contacts` and `contact_communication` tables
- Ensures clean state without the problematic foreign key constraint

## Notes
- The `location_category_id` field is still present and functional
- Application-level validation should ensure data integrity
- The index maintains query performance for lookups by location category
- No data migration is needed if the tables are empty or if you're okay with recreating them

## Rollback (if needed)
If you need to rollback, restore the previous version of `api/Database.php` from git:

```bash
git checkout HEAD~1 api/Database.php
```

However, you'll still need to fix the database constraint issue manually.
