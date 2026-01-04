# Remember Me Feature - Frontend Integration Guide

## Quick Start

### 1. Update Your Login Form

Add a checkbox for "remember me":

```typescript
// pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);  // ✅ NEW
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username_or_email: email,
                    password: password,
                    remember_me: rememberMe  // ✅ PASS REMEMBER_ME FLAG
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                setError(error.detail || 'Login failed');
                return;
            }

            const data = await response.json();
            console.log('Login successful:', data);
            
            // Show message based on remember_me status
            if (rememberMe) {
                console.log('Session will last 30 days');
            } else {
                console.log('Session will last 7 days');
            }
            
            router.push('/dashboard');
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleLogin}>
            <div>
                <label htmlFor="email">Email or Username:</label>
                <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                />
            </div>

            <div>
                <label htmlFor="password">Password:</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                />
            </div>

            {/* ✅ NEW: Remember Me Checkbox */}
            <div>
                <label>
                    <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me for 30 days
                </label>
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <button type="submit">Login</button>
        </form>
    );
}
```

### 2. With Chakra UI (Optional)

```typescript
import { Box, Button, Checkbox, FormControl, FormLabel, Input, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,  // ✅ NEW
    });

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username_or_email: formData.email,
                    password: formData.password,
                    remember_me: formData.rememberMe  // ✅ PASS REMEMBER_ME FLAG
                }),
            });

            if (!response.ok) throw new Error('Login failed');

            router.push('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <VStack spacing={4} p={6} maxW="md" mx="auto">
            <FormControl>
                <FormLabel>Email or Username</FormLabel>
                <Input
                    type="text"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                />
            </FormControl>

            <FormControl>
                <FormLabel>Password</FormLabel>
                <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                />
            </FormControl>

            {/* ✅ NEW: Remember Me Checkbox */}
            <Checkbox
                isChecked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
            >
                Remember me for 30 days
            </Checkbox>

            <Button w="full" colorScheme="blue" onClick={handleLogin}>
                Login
            </Button>
        </VStack>
    );
}
```

### 3. Update API Helper (Optional)

If you have a centralized API utility, ensure it includes `credentials: 'include'`:

```typescript
// lib/api.ts
export async function apiCall(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const fullUrl = `http://localhost:8000${url}`;

    let response = await fetch(fullUrl, {
        ...options,
        credentials: 'include',  // ✅ CRITICAL - Auto-sends cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    // Auto-refresh on 401
    if (response.status === 401) {
        const refreshResponse = await fetch(`${fullUrl.split('/').slice(0, -1).join('/')}/refresh`, {
            method: 'POST',
            credentials: 'include',
        });

        if (refreshResponse.ok) {
            // Retry original request
            response = await fetch(fullUrl, {
                ...options,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
        } else {
            // Redirect to login
            window.location.href = '/login';
        }
    }

    return response;
}
```

---

## What Changed

### Backend API

**Login Request** - Now accepts optional `remember_me` field:

```json
{
    "username_or_email": "user@example.com",
    "password": "password123",
    "remember_me": true  // ✅ NEW: Optional (defaults to false)
}
```

### Cookie Behavior

| Scenario | Access Token | Refresh Token |
|----------|--------------|---------------|
| Standard Login | 15 minutes | 7 days (604,800 seconds) |
| Remember Me Login | 15 minutes | 30 days (2,592,000 seconds) ✅ |

### Session Duration

| Scenario | Session Lasts | Until |
|----------|---------------|-------|
| Standard | ~7 days | Refresh token expires |
| Remember Me | ~30 days | Refresh token expires ✅ |

---

## How It Works

1. **User checks "Remember me" checkbox** and logs in
2. **Backend receives** `remember_me: true` in login request
3. **Backend creates refresh token** with 30-day expiration (instead of 7 days)
4. **Browser stores cookie** with `Max-Age=2,592,000` (30 days)
5. **User stays logged in** for 30 days as long as they use the app
6. **Auto-refresh works** - access token refreshes automatically when expired
7. **Remember me status persists** across token refreshes
8. **Logout immediately ends** session regardless of remember_me status

---

## Testing

### Manual Testing

1. **Open DevTools** (F12)
2. **Go to** Application → Cookies → localhost:8000
3. **Login with remember_me: false**
   - Check `refresh_token` cookie
   - Look for `Max-Age: 604800` (7 days)
4. **Logout**
5. **Login again with remember_me: true**
   - Check `refresh_token` cookie
   - Look for `Max-Age: 2592000` (30 days) ✅

### Test with cURL

```bash
# Standard login (7 days)
curl -c /tmp/cookies.txt \
  -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "admin@example.com",
    "password": "password",
    "remember_me": false
  }'

# Check cookie max-age
cat /tmp/cookies.txt
# Should show: max-age=604800

# Login with remember me (30 days)
curl -c /tmp/cookies.txt \
  -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username_or_email": "admin@example.com",
    "password": "password",
    "remember_me": true
  }'

# Check cookie max-age
cat /tmp/cookies.txt
# Should show: max-age=2592000
```

---

## Accessibility

### Label Best Practices

```typescript
// ✅ Good - Proper label association
<label htmlFor="remember-me">
    <input id="remember-me" type="checkbox" ... />
    Remember me for 30 days
</label>

// ❌ Avoid - Label not associated with input
<input type="checkbox" />
Remember me for 30 days
```

### Semantics

```typescript
// ✅ Good - Clear intent with explanatory text
<label>
    <input type="checkbox" checked={rememberMe} onChange={...} />
    Remember me for 30 days
</label>

// ⚠️ Confusing - No clarity on duration
<label>
    <input type="checkbox" checked={rememberMe} onChange={...} />
    Remember me
</label>
```

---

## Security Notes

### ✅ Safe
- HttpOnly cookies prevent JavaScript access
- Secure flag ensures HTTPS transmission
- SameSite prevents CSRF attacks
- Logout immediately revokes tokens

### ⚠️ User Guidelines
- **Public Devices**: Don't check "Remember me" on shared computers
- **Security Notice**: Display warning: "Only use on secure, personal devices"
- **Logout Reminder**: Always logout before leaving public device
- **Session Management**: Show option to logout on other devices

---

## Example: Full Login Page with Remember Me

```typescript
// pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';

interface LoginFormData {
    username_or_email: string;
    password: string;
    remember_me: boolean;
}

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginFormData>({
        username_or_email: '',
        password: '',
        remember_me: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, type, checked, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.detail || 'Login failed');
                return;
            }

            const data = await response.json();
            
            // Success - redirect to dashboard
            if (formData.remember_me) {
                // Show success message with extended session info
                console.log('✅ Logged in with 30-day session');
            } else {
                console.log('✅ Logged in with 7-day session');
            }
            
            router.push('/dashboard');
        } catch (err) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h1>Login</h1>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="username_or_email" style={{ display: 'block', marginBottom: '5px' }}>
                        Email or Username:
                    </label>
                    <input
                        id="username_or_email"
                        name="username_or_email"
                        type="text"
                        value={formData.username_or_email}
                        onChange={handleChange}
                        placeholder="user@example.com"
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
                        Password:
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>

                {/* Remember Me Checkbox */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                            name="remember_me"
                            type="checkbox"
                            checked={formData.remember_me}
                            onChange={handleChange}
                        />
                        Remember me for 30 days
                    </label>
                    <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                        Only check this on personal, secure devices
                    </small>
                </div>

                {error && (
                    <div style={{ color: 'red', marginBottom: '15px' }}>
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: isLoading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                    }}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
}
```

---

## Summary

✅ Add `remember_me` field to login request  
✅ Add checkbox to login form  
✅ Pass value to backend  
✅ Backend automatically extends refresh token to 30 days  
✅ Session persists across browser restarts (for 30 days)  
✅ Still secure - all protections remain active  

**That's it!** The feature is ready to use.


