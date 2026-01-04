"""
ADMIN ENDPOINTS DOCUMENTATION

All admin endpoints require:
- Authentication (valid JWT token)
- Admin role (user must not be disabled)

Base URL: /admin
"""

# ============================================================================
# SYSTEM STATISTICS
# ============================================================================

"""
GET /admin/stats

Description: Get system statistics for users, birds, and breeders
Auth: Required (Admin only)

Response:
{
  "users": {
    "total": 10,
    "active": 8,
    "disabled": 2
  },
  "birds": {
    "total": 45
  },
  "breeders": {
    "total": 5
  }
}
"""

# ============================================================================
# USER MANAGEMENT
# ============================================================================

"""
GET /admin/users?skip=0&limit=100

Description: List all users with pagination
Auth: Required (Admin only)
Query Parameters:
  - skip: Number of records to skip (default: 0)
  - limit: Maximum records to return (default: 100)

Response:
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "disabled": false
  },
  ...
]
"""

"""
POST /admin/users/{user_id}/disable

Description: Disable a user account
Auth: Required (Admin only)
Path Parameters:
  - user_id: ID of the user to disable

Response:
{
  "message": "User john_doe disabled successfully"
}

Errors:
  - 400: Cannot disable your own account
  - 404: User not found
  - 403: Admin access required
"""

"""
POST /admin/users/{user_id}/enable

Description: Enable a disabled user account
Auth: Required (Admin only)
Path Parameters:
  - user_id: ID of the user to enable

Response:
{
  "message": "User john_doe enabled successfully"
}

Errors:
  - 404: User not found
  - 403: Admin access required
"""

# ============================================================================
# REDIS/CACHE MANAGEMENT
# ============================================================================

"""
GET /admin/redis/info

Description: Check Redis server status
Auth: Required (Admin only)

Response:
{
  "status": "connected",
  "message": "Redis is operational"
}

Errors:
  - 503: Redis is not available
"""

"""
GET /admin/cache/stats

Description: Get detailed Redis statistics
Auth: Required (Admin only)

Response:
{
  "memory_used": "1.5M",
  "connected_clients": 2,
  "total_commands": 15234,
  "uptime_seconds": 3600
}

Errors:
  - 503: Could not retrieve cache stats
"""

"""
POST /admin/cache/flush

Description: Clear all revoked tokens from Redis
WARNING: This will invalidate all revoked tokens!
Auth: Required (Admin only)

Response:
{
  "message": "Cache flushed successfully",
  "revoked_tokens_deleted": 5
}

Errors:
  - 503: Could not flush cache
"""

# ============================================================================
# HEALTH & MONITORING
# ============================================================================

"""
GET /admin/health/detailed

Description: Get detailed system health information
Auth: Required (Admin only)

Response:
{
  "database": "healthy",
  "redis": "healthy",
  "timestamp": "2025-11-29T12:34:56.789123+00:00"
}

Possible values: "healthy" or "unhealthy"
"""

# ============================================================================
# USAGE EXAMPLES
# ============================================================================

"""
Example 1: Get system statistics
curl -X GET "http://localhost:8000/admin/stats" \
  -H "Authorization: Bearer {access_token}"

Example 2: List all users
curl -X GET "http://localhost:8000/admin/users?skip=0&limit=50" \
  -H "Authorization: Bearer {access_token}"

Example 3: Disable a user
curl -X POST "http://localhost:8000/admin/users/2/disable" \
  -H "Authorization: Bearer {access_token}"

Example 4: Get Redis statistics
curl -X GET "http://localhost:8000/admin/cache/stats" \
  -H "Authorization: Bearer {access_token}"

Example 5: Clear revoked tokens
curl -X POST "http://localhost:8000/admin/cache/flush" \
  -H "Authorization: Bearer {access_token}"

Example 6: Get detailed health
curl -X GET "http://localhost:8000/admin/health/detailed" \
  -H "Authorization: Bearer {access_token}"
"""

# ============================================================================
# IMPLEMENTATION NOTES
# ============================================================================

"""
Admin Access Control:
- Currently checks if user is not disabled
- In production, add 'is_admin' field to User model for proper RBAC
- Update check_admin_role() function to verify is_admin=True

Security Considerations:
- All endpoints require valid JWT token
- Admin role verification prevents unauthorized access
- Cache flush endpoint should be restricted (consider adding confirmation)
- Disable user endpoint prevents self-disable to avoid lockout

Future Improvements:
1. Add 'is_admin' field to User database model
2. Add audit logging for admin actions
3. Implement confirmation for destructive operations (cache flush)
4. Add rate limiting to admin endpoints
5. Add detailed audit trail for user enable/disable operations
6. Implement role-based permissions (RBAC)
"""

