# Bird Model Implementation Summary

## Overview
Updated the Bird model to match the database schema with proper foreign key relationships and correct timestamp handling.

## File Updates

### 1. Bird Model (`api/app/models/bird.py`)

**Key Changes:**
- Removed unused `declarative_base` import
- Fixed `owner_id` foreign key (changed from `breeder.id` to `owner.id`)
- Updated timestamp defaults from `datetime.utcnow` to `func.now()` for database-level timestamp handling
- Added `func` import from sqlalchemy

**Current Fields:**
```python
id                  INT PRIMARY KEY (auto-generated)
band_id            VARCHAR(100) - UNIQUE, NOT NULL
name               VARCHAR(80) - nullable
dob                TIMESTAMP - nullable
sex                VARCHAR(1) - nullable (M/F)
father_id          INT FOREIGN KEY (bird.id) - nullable
mother_id          INT FOREIGN KEY (bird.id) - nullable
breeder_id         INT FOREIGN KEY (breeder.id) - nullable
owner_id           INT FOREIGN KEY (owner.id) - nullable
created_at         TIMESTAMP - default NOW()
updated_at         TIMESTAMP - default NOW()
```

### 2. Bird Schema (`api/app/schemas/bird.py`)

**Schemas Available:**
- `BirdBase`: Base model with all bird fields
- `BirdCreate`: For creating new birds (inherits from BirdBase)
- `BirdUpdate`: For updating birds (all fields optional)
- `BirdResponse`: For API responses (includes id and timestamps)
- `BirdDetailResponse`: Extended response with parent information

**Field Validation:**
- `band_id`: 1-100 characters, required, unique
- `name`: max 80 characters, optional
- `dob`: datetime, optional
- `sex`: single character pattern `^[MF]?$` (M/F), optional
- `father_id`: integer, optional
- `mother_id`: integer, optional
- `breeder_id`: integer, optional
- `owner_id`: integer, optional

### 3. Bird CRUD (`api/app/crud/bird_crud.py`)

**Available Methods:**
- `create_bird()` - Create new bird
- `get_bird_by_id()` - Get by ID
- `get_bird_by_band_id()` - Get by band ID (unique)
- `get_all_birds()` - List all with pagination
- `get_birds_by_breeder()` - Get all birds for a breeder
- `get_birds_by_owner()` - Get all birds for an owner
- `get_offspring()` - Get all offspring of a bird
- `get_birds_by_sex()` - Filter by sex
- `update_bird()` - Update bird information
- `delete_bird()` - Delete bird by ID
- `bird_exists_by_band_id()` - Check if band ID exists
- `count_birds()` - Total count
- `count_birds_by_sex()` - Count by sex

### 4. Bird Router (`api/app/routers/bird.py`)

**API Endpoints:**
- `POST /birds/` - Create new bird (authenticated)
- `GET /birds/` - List all birds (authenticated)
- `GET /birds/stats/total` - Get bird statistics (authenticated)
- `GET /birds/breeder/{breeder_id}` - Get birds by breeder (authenticated)
- `GET /birds/owner/{owner_id}` - Get birds by owner (authenticated)
- `GET /birds/offspring/{parent_id}` - Get offspring of a bird (authenticated)
- `GET /birds/band/{band_id}` - Get by band ID (authenticated)
- `GET /birds/{bird_id}` - Get by ID (authenticated)
- `PUT /birds/{bird_id}` - Update bird (authenticated)
- `DELETE /birds/{bird_id}` - Delete bird (authenticated)

All endpoints require authentication.

## Database Schema

```sql
CREATE TABLE bird (
    id SERIAL PRIMARY KEY,
    band_id varchar(100) not null,
    name VARCHAR(80),
    dob TIMESTAMP,
    sex varchar(1),
    father_id INT,
    mother_id INT,
    breeder_id INT,
    owner_id INT,
    unique(band_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_breeder FOREIGN KEY (breeder_id) REFERENCES breeder(id),
    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES owner(id),
    CONSTRAINT fk_father FOREIGN KEY (father_id) REFERENCES bird(id),
    CONSTRAINT fk_mother FOREIGN KEY (mother_id) REFERENCES bird(id)
);
```

## Usage Examples

### Create a Bird
```bash
POST /birds/
{
    "band_id": "BAND001",
    "name": "Tweety",
    "dob": "2023-01-15T00:00:00",
    "sex": "M",
    "breeder_id": 1,
    "owner_id": 5
}
```

### Get Bird by Band ID
```bash
GET /birds/band/BAND001
```

### Get Birds by Breeder
```bash
GET /birds/breeder/1
```

### Get Bird Statistics
```bash
GET /birds/stats/total
```

Response:
```json
{
    "total_birds": 100,
    "males": 45,
    "females": 55
}
```

### Get Offspring of a Parent Bird
```bash
GET /birds/offspring/10
```

### Update a Bird
```bash
PUT /birds/1
{
    "name": "New Name",
    "owner_id": 6
}
```

## Key Features
- ✅ Proper foreign key relationships to breeder, owner, and self-references for parents
- ✅ Unique band ID constraint at database level
- ✅ Support for genealogy tracking (father/mother relationships)
- ✅ Database-level timestamp management using `func.now()`
- ✅ Complete CRUD operations
- ✅ Advanced queries (by breeder, owner, offspring, sex)
- ✅ RESTful API endpoints
- ✅ Full authentication required for all endpoints
- ✅ Comprehensive error handling

## Notes
- Bird can reference itself through `father_id` and `mother_id` for genealogy tracking
- Both `breeder_id` and `owner_id` are optional, allowing birds to exist without explicit assignment
- Band ID is the unique identifier for each bird (equivalent to a leg band in real-world bird breeding)
- Sex field accepts 'M' or 'F' values

