# User Authentication Migration Guide

## Overview

The salon management system has been migrated from an admin-based multi-role system to a simplified user-focused authentication system. This change removes the complexity of admin panels and allows individual users to register, login, and manage their own salon data.

## Key Changes

### Before (Admin System)
- **Super Admin**: Could create and manage salon owners
- **Salon Owners**: Could access their salon dashboard
- **Complex Role Management**: Multiple user types with different permissions
- **Admin Panel**: Separate interface for user management

### After (User System)
- **Single User Role**: All users are equal with access to their own data
- **Self Registration**: Users can register themselves without admin approval
- **Direct Access**: Users login and immediately access their salon management dashboard
- **Simplified Authentication**: One login/registration interface

## New User Flow

### 1. Registration
- Users visit `/auth` (or get redirected there)
- Fill out registration form with:
  - Business/Salon Name
  - Email Address  
  - Password (minimum 6 characters)
  - Confirm Password
- System creates user account and profile automatically
- Email confirmation may be required (depending on Supabase settings)

### 2. Login
- Users visit `/auth` 
- Enter email and password
- Automatically redirected to their personal dashboard

### 3. Data Management
- Each user can only see and manage their own data
- Full CRUD operations on:
  - Appointments
  - Clients
  - Stylists
  - Services
  - Products/Inventory
  - Orders
  - POS transactions

## Database Changes

### New Table: `user_profiles`
Replaces the `admin_users` table:
```sql
- id (Primary Key)
- user_id (References auth.users)
- email
- is_active
- role (Always 'user')
- salon_name
- gst_percentage
- hsn_code
- igst
- created_at
- updated_at
```

### Row Level Security (RLS)
All tables now have RLS policies ensuring users can only access their own data:
- `appointments` - filtered by user_id
- `clients` - filtered by user_id  
- `stylists` - filtered by user_id
- `services` - filtered by user_id
- `products` - filtered by user_id
- `orders` - filtered by user_id

### Automatic user_id Assignment
Triggers automatically set `user_id` for new records based on the authenticated user.

## File Changes

### New Files
- `src/components/UserAuth.tsx` - Combined login/registration component
- `update_user_schema.sql` - Database migration script

### Modified Files
- `src/contexts/AuthContext.tsx` - Simplified for user-only authentication
- `src/components/ProtectedRoute.tsx` - Updated for user profiles
- `src/components/SalonDashboard.tsx` - Adapted for user profiles
- `src/App.tsx` - Updated routing to use /auth

### Removed Files
- `src/components/AdminPanel.tsx` - No longer needed
- `src/pages/AdminPage.tsx` - No longer needed  
- `src/pages/Login.tsx` - Replaced by UserAuth

## Migration Steps

### 1. Database Migration
Run the migration script to update your database:
```bash
# If using Supabase CLI
supabase db reset
# Then apply the new schema

# Or run the SQL directly
psql -d your_database -f update_user_schema.sql
```

### 2. Update Environment Variables
Ensure your Supabase configuration is properly set:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Deploy Application
Deploy the updated application code with the new authentication system.

### 4. User Migration (If Needed)
- Existing salon owners from the old system will be automatically migrated to user profiles
- They can login using their existing credentials
- Super admin accounts are not migrated (no longer needed)

## Usage Instructions

### For New Users
1. Visit the application URL
2. Click "Register" tab
3. Fill in business details and credentials
4. Confirm email if required
5. Login and start managing salon data

### For Existing Users
1. Visit the application URL  
2. Use existing email and password to login
3. Access dashboard and continue managing salon

### Key Features
- **Personal Dashboard**: Overview of appointments, clients, revenue
- **Appointment Management**: Schedule and manage appointments
- **Client Management**: Add, edit, and track client information
- **Staff Management**: Manage stylists and their schedules
- **Inventory Management**: Track products and supplies
- **POS System**: Process sales and transactions
- **Service Management**: Define and price services

## Security Features

### Data Isolation
- Complete data separation between users
- No user can access another user's data
- Enforced at database level with RLS

### Authentication
- Supabase Auth handles secure authentication
- Password requirements enforced
- Email verification available

### Authorization  
- All API calls automatically filtered by user_id
- Frontend components only show user's own data
- Protected routes ensure authenticated access

## Troubleshooting

### Common Issues

**"Profile Setup Required" Message**
- User account exists but profile not created
- Usually resolves automatically on first login
- If persists, check user_profiles table for user_id

**"Access Denied" Errors**
- User not properly authenticated
- Clear browser storage and login again
- Verify Supabase connection

**Data Not Appearing**
- Check if user_id is properly set on records
- Verify RLS policies are active
- Ensure triggers are working for auto-assignment

### Support
- Check browser console for error messages
- Verify database connections
- Review Supabase auth logs
- Ensure all migrations completed successfully

## Benefits of New System

### For Users
- **Simple Registration**: No waiting for admin approval
- **Immediate Access**: Start using the system right away
- **Data Privacy**: Complete isolation of salon data
- **Self-Service**: No dependency on administrators

### For Developers  
- **Simplified Codebase**: Removed complex role management
- **Better Security**: RLS ensures data isolation
- **Easier Maintenance**: Single authentication flow
- **Scalable**: Each user operates independently

### For Business
- **Faster Onboarding**: Users can start immediately
- **Reduced Support**: No admin management needed
- **Better Security**: Each salon's data is completely isolated
- **Cost Effective**: No need for admin oversight

This migration transforms the salon management system into a true SaaS application where each user manages their own salon independently and securely. 