# Google OAuth Integration Setup Guide

## Overview
This guide explains how to set up Google OAuth authentication with Supabase for the R&G Salon management system. The integration allows users to sign in using their Google accounts while maintaining compatibility with the existing username/password system.

## Prerequisites
- Supabase project with database access
- Google Cloud Console access
- Admin access to your application

## Step 1: Configure Google OAuth in Google Cloud Console

### 1.1 Create OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
5. Configure the consent screen if prompted
6. Choose **Web application** as the application type
7. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/callback`
   - For production: `https://yourdomain.com/auth/callback`
   - **Important**: Also add your Supabase auth callback URL: `https://your-project.supabase.co/auth/v1/callback`

### 1.2 Get Client Credentials
After creating the OAuth client, note down:
- **Client ID** (e.g., `123456789-abcdef.apps.googleusercontent.com`)
- **Client Secret** (e.g., `GOCSPX-abcdef123456`)

## Step 2: Configure Supabase Authentication

### 2.1 Enable Google Provider
1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click to configure
4. Enable the Google provider
5. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
6. Set the redirect URL to: `https://your-project.supabase.co/auth/v1/callback`
7. Save the configuration

### 2.2 Update Supabase Environment Variables (Optional)
If you want to use environment variables instead of hardcoding:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Database Schema Updates

### 3.1 Verify Auth Table Schema
Ensure your `auth` table supports Google OAuth users:

```sql
-- Check if the auth table has necessary columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'auth';

-- Add missing columns if needed
ALTER TABLE auth ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE auth ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local';
ALTER TABLE auth ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE auth ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
```

### 3.2 Create Index for Performance
```sql
-- Add index for faster Google user lookups
CREATE INDEX IF NOT EXISTS idx_auth_provider ON auth(provider);
CREATE INDEX IF NOT EXISTS idx_auth_email ON auth(email);
```

## Step 4: Application Configuration

### 4.1 Update Environment Variables
Add to your `.env` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Google OAuth (if needed for client-side)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 4.2 Configure Redirect URLs
Update your application URLs in:
- Google Cloud Console OAuth settings
- Supabase Auth provider settings
- Application callback route (`src/app/auth/callback/route.ts`)

## Step 5: Testing the Integration

### 5.1 Test Google Sign-In Flow
1. Start your development server
2. Navigate to `/login`
3. Click "Continue with Google"
4. Complete Google authentication
5. Verify redirect to dashboard
6. Check that user is created in the `auth` table

### 5.2 Test User Permissions
1. Verify Google users get appropriate default roles
2. Test that existing username/password login still works
3. Ensure proper session management

## Step 6: User Role Management

### 6.1 Default Roles for Google Users
Google OAuth users are assigned the `admin` role by default. To customize:

```typescript
// In src/app/auth/callback/route.ts
const authUser = {
  // ... other fields
  role: 'user', // Change to 'user', 'staff', etc. based on your needs
}
```

### 6.2 Manual Role Assignment
To assign specific roles to Google users:

```sql
-- Update role for specific Google user
UPDATE auth 
SET role = 'manager' 
WHERE email = 'user@gmail.com' AND provider = 'google';
```

## Step 7: Security Considerations

### 7.1 Environment Variables
- Never commit OAuth secrets to version control
- Use environment variables in production
- Rotate credentials regularly

### 7.2 User Validation
- Verify user domains if restricting to specific organizations
- Implement proper role-based access control
- Monitor authentication logs

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Check Google Console redirect URIs match exactly
   - Ensure no trailing slashes
   - Verify HTTP vs HTTPS

2. **"Authentication failed"**
   - Check Supabase logs in dashboard
   - Verify Google OAuth credentials
   - Ensure user has access to Google account

3. **"User not created in auth table"**
   - Check database permissions
   - Verify table schema
   - Review callback route logs

### Debug Logs
Check these locations for debugging:
- Browser DevTools Console
- Supabase Dashboard > Authentication > Logs
- Supabase Dashboard > API > Logs
- Your application server logs

## Production Deployment

### Final Checklist
- [ ] Google OAuth credentials configured
- [ ] Supabase provider enabled
- [ ] Redirect URLs updated for production domain
- [ ] Environment variables set
- [ ] Auth table schema verified
- [ ] User roles configured
- [ ] Testing completed
- [ ] Error handling implemented

## Support
For additional help:
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- Check the application logs and Supabase dashboard for detailed error messages

# ✅ Google OAuth Integration - FIXED

## **The Issue Was Resolved**
The "requested path is invalid" error was caused by conflicts between custom auth callback routes and Supabase's built-in OAuth handling.

## **🔧 What Was Fixed:**

### **1. Removed Custom Auth Callback Route**
- Deleted conflicting `src/app/auth/callback/route.ts`
- Let Supabase handle OAuth callbacks natively

### **2. Updated Redirect Configuration**
- Simplified `redirectTo` to point directly to `/dashboard`
- Removed complex custom callback handling

### **3. Streamlined OAuth Flow**
```typescript
// Fixed OAuth configuration
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/dashboard`,
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});
```

## **🎯 Current Configuration Requirements**

### **Google Cloud Console Settings:**
**Authorized JavaScript Origins:**
```
https://www.rngsalon.in
http://localhost:3000
```

**Authorized Redirect URIs:**
```
https://mtyudylsozncvilibxda.supabase.co/auth/v1/callback
http://localhost:3000/dashboard
https://www.rngsalon.in/dashboard
```

### **Supabase Configuration:**
- ✅ Google provider enabled
- ✅ Client ID configured: `967440567336-tsrlhhn7es343fgtt516d4lt8dps5vih.apps.googleusercontent.com`
- ✅ Client Secret configured: `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`

## **🚀 How It Works Now:**

1. **User clicks "Continue with Google"**
2. **Redirects to Google OAuth page**
3. **User authorizes the application**
4. **Google redirects to Supabase callback:** `https://mtyudylsozncvilibxda.supabase.co/auth/v1/callback`
5. **Supabase processes the auth and redirects to:** `/dashboard`
6. **AuthContext automatically detects the session and logs user in**

## **✅ Testing:**
1. **Clear browser cache/cookies**
2. **Try Google Sign-In**
3. **Should work without "requested path is invalid" error**

## **🔍 If Still Getting Errors:**
Check browser console for detailed error messages. The GoogleSignIn component now has comprehensive error handling and logging. 