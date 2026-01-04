# Pairs Module Implementation

## Overview
Complete implementation of the Pairs module for tracking bird breeding pairs and their reproductive outcomes.

## Files Created

### 1. Schemas (`api/app/schemas/pairs.py`)
- **PairsBase**: Base schema with core pair data
- **PairsCreate**: Schema for creating new pairs
- **PairsUpdate**: Schema for updating existing pairs (all fields optional)
- **PairsResponse**: Schema for API responses

**Fields:**
- `season` (int, required) - Breeding season
- `round` (int, required) - Round number
- `cock` (int, required) - Male bird ID (FK to bird.id)
- `hen` (int, required) - Female bird ID (FK to bird.id)
- `date_paired` (datetime) - Auto-set on creation
- `number_eggs` (int, optional) - Total eggs produced
- `number_fertile_eggs` (int, optional) - Number of fertile eggs
- `incubation_start` (datetime, optional) - Start of incubation
- `incubation_end` (datetime, optional) - End of incubation
- `band_date` (datetime, optional) - Date offspring were banded
- `number_of_offspring` (int, optional) - Successful offspring count

### 2. Model (`api/app/models/pairs.py`)
- SQLAlchemy ORM model mapping to `pairs` table
- Composite unique constraint: (cock, hen, season, round)
- Foreign keys to bird table for cock and hen
- Automatic timestamps: created_at, updated_at

### 3. CRUD Operations (`api/app/crud/pairs_crud.py`)
**Basic Operations:**
- `get_pair(db, pair_id)` - Get by ID
- `get_pairs(db, skip, limit)` - List all with pagination
- `create_pair(db, pair)` - Create new pair
- `update_pair(db, pair_id, pair)` - Update pair
- `delete_pair(db, pair_id)` - Delete pair

**Advanced Queries:**
- `get_pairs_by_season(db, season)` - Get pairs in a breeding season
- `get_pairs_by_bird(db, bird_id)` - Get all pairs where bird is cock or hen
- `get_pairs_by_cock(db, cock_id)` - Get pairs where bird is male
- `get_pairs_by_hen(db, hen_id)` - Get pairs where bird is female
- `get_pairs_by_season_and_round(db, season, round)` - Get pairs by season and round
- `get_pair_by_composite_key(db, cock_id, hen_id, season, round)` - Get by composite key

**Statistics:**
- `count_pairs(db)` - Total pair count
- `count_pairs_by_season(db, season)` - Count pairs in season

### 4. Router (`api/app/routers/pairs.py`)
All endpoints follow REST conventions and require proper authentication.

**List & Search Endpoints:**
- `GET /pairs/` - List all pairs (paginated)
- `GET /pairs/stats` - Get pairs statistics
- `GET /pairs/season/{season}` - Get pairs in season
- `GET /pairs/season/{season}/round/{round}` - Get pairs by season and round
- `GET /pairs/bird/{bird_id}` - Get pairs involving a bird
- `GET /pairs/cock/{cock_id}` - Get pairs where bird is male
- `GET /pairs/hen/{hen_id}` - Get pairs where bird is female

**Detail Endpoints:**
- `GET /pairs/{pair_id}` - Get pair by ID

**Create/Update/Delete:**
- `POST /pairs/` - Create new pair
- `PUT /pairs/{pair_id}` - Update pair
- `DELETE /pairs/{pair_id}` - Delete pair

## Database Schema

```sql
CREATE TABLE pairs (
    id SERIAL PRIMARY KEY,
    season INT NOT NULL,
    round INT NOT NULL,
    cock INT NOT NULL,
    hen INT NOT NULL,
    date_paired TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    number_eggs INT,
    number_fertile_eggs INT,
    incubation_start TIMESTAMP,
    incubation_end TIMESTAMP,
    band_date TIMESTAMP,
    number_of_offspring INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cock FOREIGN KEY (cock) REFERENCES bird(id),
    CONSTRAINT fk_hen FOREIGN KEY (hen) REFERENCES bird(id),
    UNIQUE(cock, hen, season, round)
);
```

## Key Relationships

- **cock** → bird table (male)
- **hen** → bird table (female)
- **Composite Unique:** (cock, hen, season, round) - Same pair can be repeated in different seasons/rounds

## Usage Examples

### Create a Pair
```bash
POST /pairs/
{
    "season": 2025,
    "round": 1,
    "cock": 5,
    "hen": 7,
    "number_eggs": 6
}
```

### Get Pair by ID
```bash
GET /pairs/1
```

### Get Pairs in Season
```bash
GET /pairs/season/2025
```

### Get Pairs for a Specific Bird
```bash
GET /pairs/bird/5
```

### Get Pairs Where Bird is Cock (Male)
```bash
GET /pairs/cock/5
```

### Update Pair with Incubation Results
```bash
PUT /pairs/1
{
    "number_fertile_eggs": 5,
    "incubation_start": "2025-01-10T00:00:00",
    "incubation_end": "2025-01-24T00:00:00",
    "number_of_offspring": 5
}
```

### Get Statistics
```bash
GET /pairs/stats
```

Response:
```json
{
    "total_pairs": 42
}
```

## Workflow Example

1. **Create pair in season 2025, round 1**
   ```
   POST /pairs/
   ```

2. **Track eggs laid**
   ```
   PUT /pairs/1
   {
       "number_eggs": 6
   }
   ```

3. **Set incubation period and fertile egg count**
   ```
   PUT /pairs/1
   {
       "number_fertile_eggs": 5,
       "incubation_start": "2025-01-10T00:00:00"
   }
   ```

4. **Complete incubation and record offspring**
   ```
   PUT /pairs/1
   {
       "incubation_end": "2025-01-24T00:00:00",
       "band_date": "2025-02-01T00:00:00",
       "number_of_offspring": 4
   }
   ```

5. **Query all results for the cock bird**
   ```
   GET /pairs/cock/5
   ```

## Data Validation

- All integer fields accept positive values only (ge=0)
- season and round are required integers
- cock and hen are required bird IDs
- Dates are ISO 8601 format
- Composite uniqueness enforced: Cannot have duplicate (cock, hen, season, round)

## Error Handling

- **400 Bad Request**: Validation failed or duplicate pair
- **404 Not Found**: Pair doesn't exist
- **201 Created**: Successful creation
- **204 No Content**: Successful deletion

## Integration Points

The Pairs module integrates with:
- **Bird Module**: cock and hen are bird IDs with FK constraints
- **Main App**: Router registered in main.py for API access

## Features

- ✅ Full CRUD operations
- ✅ Composite unique constraint
- ✅ Advanced filtering (season, round, bird roles)
- ✅ Automatic timestamps
- ✅ Breeding season tracking
- ✅ Reproductive outcome tracking
- ✅ Incubation period tracking
- ✅ Offspring count tracking

## Status

- ✅ Schema created and validated
- ✅ Model implemented with constraints
- ✅ CRUD operations complete
- ✅ Router with all endpoints
- ✅ Integrated with main application
- ✅ Documentation complete
- ✅ Code compiled and verified


