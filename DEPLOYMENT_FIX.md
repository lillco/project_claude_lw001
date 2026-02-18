# LW001 Association API - 500 Error Fix

## Problem Summary

The lw001 association API was returning 500 Internal Server Error due to two critical issues:

### Issue 1: Config Loading Mismatch
- `index.php` was doing `require_once 'config.php'` but not capturing the return value
- It expected a `$config` variable, but the config file uses `return [...]` syntax
- This caused `$config` to be undefined/null when passed to Database constructor

### Issue 2: Config Structure Mismatch
- `Database.php` expected a flat config array with keys: `host`, `port`, `database`, `user`, `password`
- The actual `config.php` on the server has a nested structure: `['database' => ['host', 'port', 'name', ...]]`
- The database name key is `'name'` not `'database'`

## Files Changed

### 1. `api/Database.php`
- ✅ Updated to load `config.php` internally (like lw000 does)
- ✅ Changed to use nested config structure: `$this->config['database']`
- ✅ Changed database name key from `$config['database']` to `$dbConfig['name']`
- ✅ Added proper error handling for missing config file
- ✅ Improved PDO connection with better options

### 2. `api/index.php`
- ✅ Removed `require_once 'config.php'` line
- ✅ Changed `new Database($config)` to `new Database()` (no parameter)
- ✅ Added comment explaining that Database loads config internally

### 3. `api/config.example.php`
- ✅ Updated to match the actual config structure used on the server
- ✅ Changed from flat array to nested structure with `'database'` key
- ✅ Changed `'database'` field to `'name'` for the database name
- ✅ Added `'cors'` configuration section

## Deployment Instructions

### Option 1: Manual FTP/SFTP Upload
Upload only these 2 files to the server at `https://lwtest.lillco.de/association/api/`:
- `api/Database.php`
- `api/index.php`

**DO NOT upload `config.example.php`** - the server already has a working `config.php` with credentials.

### Option 2: Using lftp (if configured)
```bash
cd e:\vscode-workspaces\project-claude-lw001_association
lftp -e "mirror -R --only-newer --exclude-glob .git* --exclude-glob node_modules/ --exclude-glob data/ --exclude-glob src/ --exclude-glob *.md --exclude-glob package*.json --exclude-glob *.config.js --exclude api/config.php . /association/; quit" sftp://your-server
```

### Option 3: Git Pull on Server (if git is set up)
```bash
ssh your-server
cd /path/to/association
git pull origin main
```

## Testing After Deployment

1. Open browser console at: `https://lwtest.lillco.de/association/`
2. The following should now work without 500 errors:
   - GET `/association/api/index.php/association` - Load association data
   - POST `/association/api/index.php/association` - Create/save association data

3. Expected behavior:
   - No more "500 Internal Server Error" messages
   - Association form should load existing data (if any)
   - Saving association data should work successfully

## Verification

After deployment, check:
- ✅ No 500 errors in browser console
- ✅ Association data loads successfully
- ✅ Association data can be saved
- ✅ Database table `association` is created automatically

## Rollback (if needed)

If something goes wrong, you can restore the old files from git:
```bash
git checkout HEAD~1 api/Database.php api/index.php
```

## Notes

- The `config.php` file on the server should NOT be changed - it already has the correct format
- The fix aligns lw001 with the lw000 (launchpad) pattern for consistency
- All modules (lw000, lw001, lw002, lw003) now use the same config structure
