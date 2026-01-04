"""
ROLE ENUM IMPLEMENTATION SUMMARY

This document describes the enum-based role system implemented in the application.
"""

# ============================================================================
# OVERVIEW
# ============================================================================

The role system now uses an Enum (RoleEnum) for type-safe role management instead of plain strings.

Benefits:
- Type safety: Compile-time checking of valid role names
- IDE autocomplete: Better development experience
- Prevents typos: Invalid role names are caught immediately
- Centralized role definition: All valid roles in one place

# ============================================================================
# AVAILABLE ROLES
# ============================================================================

from api.app.core.enums import RoleEnum

Valid roles (in api/app/core/enums.py):
- RoleEnum.ADMIN = "admin"
- RoleEnum.USER = "user"
- RoleEnum.MODERATOR = "moderator"
- RoleEnum.BREEDER = "breeder"
- RoleEnum.OWNER = "owner"

# ============================================================================
# USAGE EXAMPLES
# ============================================================================

Example 1: Check if user has admin role
from api.app.core.enums import RoleEnum
from api.app.crud.role_crud import RoleCRUD

if RoleCRUD.user_has_role(db, user_id, RoleEnum.ADMIN):
    # User is admin
    pass

Example 2: Create a role
from api.app.core.enums import RoleEnum
from api.app.schemas.role import RoleCreate
from api.app.crud.role_crud import RoleCRUD

role_data = RoleCreate(
    role_name=RoleEnum.MODERATOR,
    description="Moderator role"
)
role = RoleCRUD.create_role(db, role_data)

Example 3: Get role by name
from api.app.core.enums import RoleEnum
from api.app.crud.role_crud import RoleCRUD

role = RoleCRUD.get_role_by_name(db, RoleEnum.ADMIN)

Example 4: Admin check in dependencies
from api.app.core.enums import RoleEnum
from api.app.crud.role_crud import RoleCRUD

def check_admin_role(current_user: TokenData, db: Session):
    if not RoleCRUD.user_has_role(db, current_user.user_id, RoleEnum.ADMIN):
        raise HTTPException(status_code=403, detail="Admin role required")
    return current_user

# ============================================================================
# DATABASE SCHEMA
# ============================================================================

The role_name column in the database stores the string value:
- Database stores: "admin", "user", "moderator", etc.
- Python enum converts: RoleEnum.ADMIN -> "admin" -> stored in DB
- Retrieved from DB: "admin" -> RoleEnum.ADMIN for type safety

# ============================================================================
# API ENDPOINT USAGE
# ============================================================================

Create role with enum value:
POST /roles/
Content-Type: application/json

{
  "role_name": "admin",
  "description": "Administrator role"
}

Valid role_name values:
- "admin"
- "user"
- "moderator"
- "breeder"
- "owner"

# ============================================================================
# ADDING NEW ROLES
# ============================================================================

To add a new role to the system:

1. Add to RoleEnum in api/app/core/enums.py:
   class RoleEnum(str, Enum):
       ADMIN = "admin"
       USER = "user"
       NEW_ROLE = "new_role"  # Add new role here

2. Create the role in database:
   POST /roles/
   {
     "role_name": "new_role",
     "description": "Description of new role"
   }

3. Use in code:
   from api.app.core.enums import RoleEnum
   
   if RoleCRUD.user_has_role(db, user_id, RoleEnum.NEW_ROLE):
       # Handle new role logic

# ============================================================================
# UPDATED FILES
# ============================================================================

1. api/app/core/enums.py (NEW)
   - RoleEnum class with all valid role names
   - Inherits from (str, Enum) for string compatibility

2. api/app/models/role.py (UPDATED)
   - role_name column now uses Enum(RoleEnum) type
   - Database enforces only valid enum values

3. api/app/schemas/role.py (UPDATED)
   - RoleCreate and RoleBase use role_name: RoleEnum
   - API only accepts valid enum values

4. api/app/crud/role_crud.py (UPDATED)
   - Methods accept RoleEnum parameters
   - Type hints ensure compile-time checking
   - get_role_by_name(db, role_name: RoleEnum)
   - user_has_role(db, user_id, role_name: RoleEnum)

5. api/app/internal/admin.py (UPDATED)
   - check_admin_role() uses RoleEnum.ADMIN
   - Type-safe admin role verification

# ============================================================================
# TYPE SAFETY BENEFITS
# ============================================================================

Before (vulnerable to typos):
```python
if RoleCRUD.user_has_role(db, user_id, "adminn"):  # Typo!
    # This would fail silently at runtime
```

After (caught immediately):
```python
if RoleCRUD.user_has_role(db, user_id, RoleEnum.ADMINN):  # IDE error!
    # Won't even run - IDE catches the typo
```

# ============================================================================
# MIGRATION NOTES
# ============================================================================

If you have existing data:
1. Backup your database
2. The enum values ("admin", "user", etc.) match string values
3. No data migration needed - enum stores same strings as before
4. Existing role_name values will work with new enum system

# ============================================================================
# TESTING
# ============================================================================

Test creating roles with valid enum values:
curl -X POST "http://localhost:8000/roles/" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"role_name": "admin", "description": "Admin role"}'

Test checking user roles:
curl -X GET "http://localhost:8000/roles/1/user-roles" \
  -H "Authorization: Bearer {token}"

Test invalid role (should fail):
curl -X POST "http://localhost:8000/roles/" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"role_name": "invalid_role", "description": "Invalid"}'
# Returns 422 Unprocessable Entity - invalid enum value
"""

