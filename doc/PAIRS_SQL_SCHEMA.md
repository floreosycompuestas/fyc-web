# Pairs Module SQL Schema & Additional Notes

## Complete Pairs Table SQL

```sql
-- Create PAIRS table for tracking bird breeding pairs
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
    CONSTRAINT fk_cock FOREIGN KEY (cock) REFERENCES bird(id) ON DELETE RESTRICT,
    CONSTRAINT fk_hen FOREIGN KEY (hen) REFERENCES bird(id) ON DELETE RESTRICT,
    UNIQUE(cock, hen, season, round)
);

-- Create index for better query performance
CREATE INDEX idx_pairs_season ON pairs(season);
CREATE INDEX idx_pairs_round ON pairs(round);
CREATE INDEX idx_pairs_cock ON pairs(cock);
CREATE INDEX idx_pairs_hen ON pairs(hen);
CREATE INDEX idx_pairs_season_round ON pairs(season, round);
```

## Add Update Trigger for Pairs

```sql
-- Trigger for auto-updating pairs.updated_at
CREATE TRIGGER update_pairs_timestamp BEFORE UPDATE ON pairs
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

## Relationships

### Foreign Keys
- `cock` → `bird.id` - Male bird in the pair
- `hen` → `bird.id` - Female bird in the pair
- Cascade behavior: RESTRICT (prevent deletion of bird if it has active pairs)

### Unique Constraint
- `(cock, hen, season, round)` - Composite unique constraint
- Ensures same pair cannot be created twice in same season/round
- Allows same pair to be recorded in different seasons/rounds

## Field Explanations

### Required Fields
- **season** (INT) - Breeding season identifier (e.g., 2025)
- **round** (INT) - Round number within season (e.g., 1st round, 2nd round)
- **cock** (INT) - ID of male bird (FK to bird table)
- **hen** (INT) - ID of female bird (FK to bird table)

### Optional Tracking Fields
- **number_eggs** (INT) - Total eggs laid by pair
- **number_fertile_eggs** (INT) - Eggs that were fertile/viable
- **incubation_start** (TIMESTAMP) - When incubation period began
- **incubation_end** (TIMESTAMP) - When incubation period ended
- **band_date** (TIMESTAMP) - Date offspring were banded/marked
- **number_of_offspring** (INT) - Successful offspring from this pair

### Automatic Fields
- **date_paired** - Auto-set to current timestamp when pair is created
- **created_at** - Auto-set to current timestamp when record is created
- **updated_at** - Auto-set on creation and updated on every modification

## Integration with Other Tables

### Bird Table Relationship
```
BIRD (parent table)
  ↑
  │ cock_id
  │ hen_id
  │
PAIRS (child table)
```

### Complete System Relationships
```
┌─────────────────┐
│ ORGANIZATION    │
├─────────────────┤
│ id (PK)         │
└────────┬────────┘
         │ 1:N
         │
    ┌────▼────────────┐
    │ BREEDER         │
    ├─────────────────┤
    │ id (PK)         │
    │ org_id (FK)     │
    └────────┬────────┘
             │ 1:N
             │
    ┌────────▼──────────┐
    │ BIRD              │
    ├───────────────────┤
    │ id (PK)           │
    │ breeder_id (FK)   │
    │ owner_id (FK)     │
    │ father_id (self)  │
    │ mother_id (self)  │
    └────┬────────┬─────┘
         │ cock   │ hen
         │        │
         └────┬───┘
              │
         ┌────▼─────────┐
         │ PAIRS        │
         ├──────────────┤
         │ id (PK)      │
         │ cock (FK)    │
         │ hen (FK)     │
         │ season       │
         │ round        │
         │ ...tracking..│
         └──────────────┘
```

## Query Examples

### Get all breeding pairs in 2025 season
```sql
SELECT * FROM pairs WHERE season = 2025;
```

### Get all pairs with their fertile egg counts
```sql
SELECT 
    p.id,
    p.season,
    p.round,
    b1.name as cock_name,
    b2.name as hen_name,
    p.number_eggs,
    p.number_fertile_eggs
FROM pairs p
JOIN bird b1 ON p.cock = b1.id
JOIN bird b2 ON p.hen = b2.id
WHERE p.season = 2025;
```

### Get breeding results (pairs with offspring)
```sql
SELECT 
    p.id,
    b1.name as cock_name,
    b2.name as hen_name,
    p.number_eggs,
    p.number_fertile_eggs,
    p.number_of_offspring,
    (p.number_of_offspring::float / p.number_fertile_eggs * 100)::int as hatch_rate_percent
FROM pairs p
JOIN bird b1 ON p.cock = b1.id
JOIN bird b2 ON p.hen = b2.id
WHERE p.number_of_offspring IS NOT NULL AND p.season = 2025
ORDER BY hatch_rate_percent DESC;
```

### Get pairs by male bird
```sql
SELECT * FROM pairs WHERE cock = 5 ORDER BY season DESC, round DESC;
```

### Get pairs by female bird
```sql
SELECT * FROM pairs WHERE hen = 7 ORDER BY season DESC, round DESC;
```

### Get productivity metrics for a cock bird
```sql
SELECT 
    p.cock,
    COUNT(*) as total_pairings,
    SUM(p.number_eggs) as total_eggs,
    SUM(p.number_fertile_eggs) as total_fertile,
    SUM(p.number_of_offspring) as total_offspring
FROM pairs p
WHERE p.cock = 5
GROUP BY p.cock;
```

## Constraints

### Primary Key
- `id` - Auto-incrementing primary key

### Foreign Keys
- `cock` FOREIGN KEY → `bird(id)` ON DELETE RESTRICT
- `hen` FOREIGN KEY → `bird(id)` ON DELETE RESTRICT
- RESTRICT prevents deletion of bird records with active pairs

### Unique Constraints
- `UNIQUE(cock, hen, season, round)` - Composite constraint
- Prevents duplicate pairings in same season/round
- Same pair can breed in multiple seasons/rounds

### NOT NULL
- `season` - Required
- `round` - Required
- `cock` - Required
- `hen` - Required

### Nullable Fields
- All optional tracking fields can be NULL until data is entered

## Indexes

Indexes created for performance optimization:
- `idx_pairs_season` - For filtering by season
- `idx_pairs_round` - For filtering by round
- `idx_pairs_cock` - For finding pairs with specific male
- `idx_pairs_hen` - For finding pairs with specific female
- `idx_pairs_season_round` - For combined season + round queries

## Data Types

- `SERIAL` - Auto-incrementing integer (for id)
- `INT` - Integer (season, round, counts, FK)
- `TIMESTAMP` - Date and time with timezone
- `VARCHAR` - String (inherited from bird references)

## Cascade & Referential Integrity

- **ON DELETE RESTRICT** - Cannot delete a bird that has pairs
  - If you need to retire a bird, ensure no active pairs exist
  - Or change the constraint to SET NULL if you allow orphaned records

## Default Values

- `date_paired` - CURRENT_TIMESTAMP (when pair is created)
- `created_at` - CURRENT_TIMESTAMP (when record is inserted)
- `updated_at` - CURRENT_TIMESTAMP (on insert, updated via trigger on update)

## Best Practices

1. **Always provide season and round** - These identify the breeding context
2. **Fill tracking data progressively** - Start with eggs, then fertile count, then offspring
3. **Use dates for key events** - Track incubation start/end and banding for timeline
4. **Keep bird references valid** - Don't delete birds with active pairs
5. **Query with season filter** - Most queries should include season filter for performance

## Migration Notes

1. Create the pairs table after the bird table
2. Set up the update trigger for automatic timestamp updates
3. Create all indexes for query performance
4. Test foreign key constraints before moving to production


