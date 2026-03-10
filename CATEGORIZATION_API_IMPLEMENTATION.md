# Categorization API Implementation for LW001 Association

## Overview
This document describes the implementation of the categorization system API endpoints for the LW001 Association project, matching the functionality available in LW002 Market.

## Changes Made

### 1. API Endpoints Added (`api/index.php`)

Added generic CRUD routes for three categorization entities:
- `category_types` - Types of categories (e.g., "Veranstaltungsart", "Zielgruppe")
- `categories` - Individual categories within a type
- `categorization` - Junction table linking categories to entities

#### Supported Operations:

**GET Requests:**
- `GET /category_types` - Get all category types
- `GET /category_types/{id}` - Get single category type by ID
- `GET /categories` - Get all categories (with JOIN to include typeName and applicableEntities)
- `GET /categories/{id}` - Get single category by ID
- `GET /categorization` - Get all categorizations
- `GET /categorization/{id}` - Get single categorization by ID

**POST Requests (requires authentication):**
- `POST /category_types` - Create new category type
- `POST /categories` - Create new category
- `POST /categorization` - Create new categorization

**PUT Requests (requires authentication):**
- `PUT /category_types/{id}` - Update category type
- `PUT /categories/{id}` - Update category
- `PUT /categorization/{id}` - Update categorization

**DELETE Requests (requires authentication):**
- `DELETE /category_types/{id}` - Delete category type
- `DELETE /categories/{id}` - Delete category
- `DELETE /categorization/{id}` - Delete categorization

### 2. Database Class Updates (`api/Database.php`)

Added the following methods:
- `getAll($table)` - Retrieve all records from a table
- `getConnection()` - Get the PDO connection object for complex queries

Added table creation for categorization system:
- `category_types` table with columns: id, name, applicableEntities, created_at
- `categories` table with columns: id, typeId, name, created_at
- `categorization` table with columns: id, entityType, entityId, categoryId, created_at

### 3. Database Schema

**category_types:**
```sql
CREATE TABLE IF NOT EXISTS category_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applicableEntities TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

**categories:**
```sql
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    typeId VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (typeId) REFERENCES category_types(id) ON DELETE CASCADE
)
```

**categorization:**
```sql
CREATE TABLE IF NOT EXISTS categorization (
    id VARCHAR(50) PRIMARY KEY,
    entityType VARCHAR(50) NOT NULL,
    entityId VARCHAR(50) NOT NULL,
    categoryId VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_categorization (entityType, entityId, categoryId)
)
```

## Testing

### Prerequisites
1. Ensure `api/config.php` exists with valid database credentials
2. The database tables will be created automatically on first API access

### Test the API Endpoints

1. **Test GET /categorization:**
   ```
   https://lwtest.lillco.de/association/api/index.php/categorization
   ```
   Should return: `[]` (empty array) or existing categorizations

2. **Test GET /category_types:**
   ```
   https://lwtest.lillco.de/association/api/index.php/category_types
   ```
   Should return: `[]` (empty array) or existing category types

3. **Test GET /categories:**
   ```
   https://lwtest.lillco.de/association/api/index.php/categories
   ```
   Should return: `[]` (empty array) or existing categories

4. **Test POST /category_types (requires authentication):**
   ```bash
   curl -X POST https://lwtest.lillco.de/association/api/index.php/category_types \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "id": "ct_test_001",
       "name": "Veranstaltungsart",
       "applicableEntities": "events,activities"
     }'
   ```

## Frontend Integration

The frontend components already exist in the project:
- `src/components/forms/CategoryTypeForm.jsx`
- `src/components/forms/CategoryForm.jsx`
- `src/components/forms/CategorizationForm.jsx`
- `src/components/tables/CategoryTypesTable.jsx`
- `src/components/tables/CategoriesTable.jsx`
- `src/components/tables/CategorizationsTable.jsx`

These components should now work correctly with the new API endpoints.

## Error Resolution

The original error was:
```
GET https://lwtest.lillco.de/association/api/index.php/categorization 404 (Not Found)
GET https://lwtest.lillco.de/association/api/index.php/category_types 404 (Not Found)
GET https://lwtest.lillco.de/association/api/index.php/categories 404 (Not Found)
```

This has been resolved by:
1. Adding the missing API routes in `api/index.php`
2. Adding the required database methods in `api/Database.php`
3. Creating the database tables automatically on connection

## Deployment

To deploy these changes to the test server:
1. Upload the updated `api/index.php` file
2. Upload the updated `api/Database.php` file
3. The database tables will be created automatically on first access
4. Test the endpoints as described above

## Notes

- All POST, PUT, and DELETE operations require authentication
- GET operations are public (no authentication required)
- The `categories` GET endpoint includes a JOIN with `category_types` to provide additional context
- Foreign key constraints ensure data integrity
- The unique constraint on categorization prevents duplicate category assignments
