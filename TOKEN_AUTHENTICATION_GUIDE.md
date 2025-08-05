# Token Authentication Guide

This guide explains how to use the token authentication system with the provided token: `3f4b718f-70cb-4873-a62c-b8806a92e25b`

## Overview

The token authentication system allows users to authenticate using a UUID token instead of traditional email/password authentication. This is useful for:

- API access
- Service-to-service authentication
- Quick access without remembering credentials
- Integration with external systems

## Provided Token

**Token:** `3f4b718f-70cb-4873-a62c-b8806a92e25b`

This token is pre-configured in the system and can be used immediately for authentication.

## How to Use

### 1. Via Login Page

1. Navigate to the login page (`/login`)
2. Click on the "Token Authentication" tab
3. The token field will be pre-filled with the provided token
4. Click "Authenticate with Token"
5. You will be redirected to the dashboard upon successful authentication

### 2. Programmatically

You can also authenticate programmatically using the utility functions:

```typescript
import { authenticateWithProvidedToken } from './src/utils/tokenAuth';

// Authenticate with the provided token
try {
  await authenticateWithProvidedToken();
  console.log('Successfully authenticated!');
} catch (error) {
  console.error('Authentication failed:', error);
}
```

### 3. Using Custom Tokens

You can also authenticate with custom tokens:

```typescript
import { authenticateWithToken } from './src/lib/auth';

// Authenticate with a custom token
try {
  await authenticateWithToken('your-custom-token-uuid');
  console.log('Successfully authenticated!');
} catch (error) {
  console.error('Authentication failed:', error);
}
```

## Authentication Status

### Check if User is Authenticated

```typescript
import { isTokenAuthenticated } from './src/utils/tokenAuth';

const isAuthenticated = isTokenAuthenticated();
console.log('User is authenticated:', isAuthenticated);
```

### Get Current User

```typescript
import { getTokenAuthenticatedUser } from './src/utils/tokenAuth';

const user = getTokenAuthenticatedUser();
if (user) {
  console.log('Current user:', user.name);
  console.log('User ID:', user.id);
  console.log('Provider:', user.provider);
}
```

## Logout

### Via AuthContext

```typescript
import { useAuthContext } from './src/contexts/AuthContext';

const { logout } = useAuthContext();

const handleLogout = async () => {
  await logout();
};
```

### Via Utility Function

```typescript
import { logoutTokenUser } from './src/utils/tokenAuth';

logoutTokenUser();
```

## Token Validation

The system validates that tokens are in proper UUID format:

```typescript
import { isValidTokenFormat } from './src/utils/tokenAuth';

const isValid = isValidTokenFormat('3f4b718f-70cb-4873-a62c-b8806a92e25b');
console.log('Token is valid:', isValid); // true
```

## Demo Component

A demo component is available at `src/components/TokenAuthDemo.tsx` that shows:

- Current authentication status
- Authentication with provided token
- Authentication with custom tokens
- Logout functionality
- Token validation

To use the demo component:

```typescript
import TokenAuthDemo from './src/components/TokenAuthDemo';

// In your component
<TokenAuthDemo />
```

## Integration with Existing Auth System

The token authentication system integrates seamlessly with the existing authentication system:

- Uses the same `AuthContext`
- Compatible with existing protected routes
- Works alongside Google OAuth and email/password authentication
- Stores authentication state in localStorage for persistence

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage for persistence
2. **Token Format**: Only valid UUID format tokens are accepted
3. **Session Management**: Tokens persist until explicitly logged out
4. **Compatibility**: Works with existing RLS policies and authentication checks

## File Structure

```
src/
├── lib/
│   └── auth.ts                    # Main authentication functions
├── contexts/
│   └── AuthContext.tsx            # Authentication context
├── utils/
│   └── tokenAuth.ts               # Token authentication utilities
├── components/
│   └── TokenAuthDemo.tsx          # Demo component
└── pages/
    └── Login.tsx                  # Updated login page with token auth
```

## Usage Examples

### Quick Authentication

```typescript
// One-liner to authenticate with provided token
import { authenticateWithProvidedToken } from './src/utils/tokenAuth';

authenticateWithProvidedToken().then(() => {
  // User is now authenticated
  window.location.href = '/dashboard';
});
```

### Check Authentication in Components

```typescript
import { useAuthContext } from './src/contexts/AuthContext';

function MyComponent() {
  const { user, loading } = useAuthContext();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return <div>Welcome, {user.name}!</div>;
}
```

### Automatic Authentication Setup

```typescript
import { setupTokenAuthentication } from './src/utils/tokenAuth';

// Call this in your main App component
useEffect(() => {
  setupTokenAuthentication();
}, []);
```

## Troubleshooting

### Common Issues

1. **Token not working**: Ensure the token is in valid UUID format
2. **Authentication not persisting**: Check localStorage permissions
3. **Redirect loops**: Ensure proper route protection logic

### Debug Information

```typescript
// Check localStorage
console.log('Auth token:', localStorage.getItem('auth_token'));
console.log('Auth user:', localStorage.getItem('auth_user'));

// Check authentication status
console.log('Is authenticated:', isTokenAuthenticated());
console.log('Current user:', getTokenAuthenticatedUser());
```

## API Integration

The token authentication system can be easily integrated with API calls:

```typescript
// Add token to API headers
const token = localStorage.getItem('auth_token');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

// Use in fetch requests
fetch('/api/protected-endpoint', {
  headers
});
```

This token authentication system provides a secure and flexible way to authenticate users in your R&G Salon application. 