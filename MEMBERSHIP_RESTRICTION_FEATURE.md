# Membership Restriction Feature

## Overview

This feature allows salon administrators to control which services can be purchased using membership balance. Premium services can be restricted to regular payment methods only, preventing customers from using their membership balance for high-value or exclusive services.

## Features Implemented

### 1. Service Management
- **Membership Eligible Toggle**: Each service now has a "Membership Eligible" toggle in the service creation/edit form
- **Visual Indicators**: Services show their membership eligibility status with color-coded chips:
  - `Eligible` (Blue): Service can be purchased with membership balance
  - `Premium Only` (Orange): Service requires regular payment methods only

### 2. POS System Integration
- **Smart Payment Controls**: The membership payment toggle is automatically disabled for premium services
- **Clear Visual Feedback**: Premium services show a "Premium service - Regular payment only" indicator
- **Error Prevention**: System prevents users from accidentally trying to pay for premium services with membership

### 3. User Experience
- **Informative Messages**: Users see clear explanations when membership payment is not available
- **Balance Display**: Active membership balance is shown for eligible services
- **Toast Notifications**: Users receive helpful feedback when toggling membership payment

## Database Changes

### New Column: `membership_eligible`
- **Table**: `services`
- **Type**: `BOOLEAN`
- **Default**: `true` (for backward compatibility)
- **Purpose**: Controls whether a service can be purchased with membership balance

## Setup Instructions

### 1. Run Database Migration
Execute the SQL migration to add the new column:

```sql
-- Run this in your Supabase SQL editor or database client
ALTER TABLE services 
ADD COLUMN membership_eligible BOOLEAN DEFAULT true;

UPDATE services 
SET membership_eligible = true 
WHERE membership_eligible IS NULL;

COMMENT ON COLUMN services.membership_eligible IS 'Controls whether this service can be purchased using membership balance. Premium services should be set to false.';
```

### 2. Configure Premium Services
1. Navigate to Service Collections or Sub-Collections management
2. Edit services that should be premium-only
3. Toggle off "Membership Eligible" 
4. Save changes

### 3. Test the Feature
1. Go to POS system
2. Add both regular and premium services to an order
3. Select a client with active membership
4. Verify that:
   - Regular services show membership payment toggle
   - Premium services show "Premium service - Regular payment only"
   - Premium services cannot be paid with membership balance

## Technical Implementation

### Service Model Updates
```typescript
interface ServiceItem {
  // ... existing fields
  membership_eligible?: boolean; // New field
}
```

### POS Logic
- Checks `service.membership_eligible` before allowing membership payment
- Disables membership toggle for premium services
- Shows appropriate visual indicators and messages

### Admin Interface
- Service management forms include membership eligible toggle
- Service lists display membership eligibility status
- Clear documentation for administrators

## Benefits

1. **Revenue Protection**: Prevents high-value services from being discounted through membership
2. **Flexible Pricing**: Allows different pricing strategies for different service tiers
3. **Clear Communication**: Users understand which services are premium
4. **Error Prevention**: System prevents incorrect payment attempts
5. **Backward Compatibility**: Existing services remain membership-eligible by default

## Usage Examples

### Scenario 1: Hair Salon
- **Regular Services** (Membership Eligible): Basic haircut, wash, blow-dry
- **Premium Services** (Premium Only): Color correction, keratin treatment, wedding styling

### Scenario 2: Spa Services
- **Regular Services** (Membership Eligible): Basic facial, relaxation massage
- **Premium Services** (Premium Only): Anti-aging treatments, luxury spa packages

## Troubleshooting

### Issue: Membership toggle not showing
- **Check**: Ensure client has an active membership
- **Check**: Verify service is marked as membership eligible

### Issue: Cannot save service changes
- **Check**: Ensure database migration was run successfully
- **Check**: Verify user has admin permissions

### Issue: Premium services still showing membership option
- **Solution**: Edit the service and toggle off "Membership Eligible"
- **Solution**: Refresh the browser cache

## Future Enhancements

1. **Bulk Edit**: Allow bulk setting of membership eligibility for multiple services
2. **Percentage Restrictions**: Allow partial membership payment for premium services
3. **Time-based Rules**: Restrict membership usage during peak hours
4. **Tier-based Access**: Different membership tiers access different service levels 