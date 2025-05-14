# Stylist Holiday Tracking System

This system implements SQL-based holiday tracking for stylists, ensuring stylists are automatically marked as unavailable on their holiday dates.

## Setup Instructions

### 1. Database Setup

Run the SQL script to create the necessary tables and functions:

1. Log in to your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `sql/holiday_management.sql`
4. Run the script

Alternatively, you can use the migration script:

```bash
node src/utils/migration.js
```

### 2. Implementation Details

The holiday tracking system consists of:

- A `stylist_holidays` database table to store holiday information
- SQL functions to manage availability based on holidays
- A React hook (`useStylistHolidays`) to interact with the holiday system
- UI components in the Stylists page to manage holidays

### 3. Key Features

- **Automatic Availability Management**: Stylists are automatically marked as unavailable on their holiday dates
- **SQL-Based Storage**: Holiday data is stored in a dedicated SQL table with proper foreign key relationships
- **Holiday Management UI**: Add, edit, and remove holidays through the UI
- **Holiday Reports**: View monthly reports of stylist holidays

### 4. API Reference

#### Database Tables

**stylist_holidays**
- `id`: UUID (Primary Key)
- `stylist_id`: UUID (Foreign Key to stylists)
- `holiday_date`: DATE
- `reason`: TEXT (optional)
- `created_at`: TIMESTAMPTZ

#### SQL Functions

- `create_stylist_holidays_table()`: Creates the table if it doesn't exist
- `update_stylists_on_holiday()`: Updates stylists who have a holiday today to be unavailable
- `reset_stylists_not_on_holiday()`: Resets availability for stylists who don't have holidays today
- `is_stylist_on_holiday(stylist_id, date)`: Checks if a stylist is on holiday for a given date
- `add_stylist_holiday(stylist_id, date, reason)`: Adds a holiday for a stylist
- `remove_stylist_holiday(holiday_id)`: Removes a holiday
- `update_stylist_availability_on_holiday_change()`: Trigger function to automatically update availability

#### JavaScript Hook (useStylistHolidays)

```typescript
const { 
  holidays,              // All holidays
  getStylistHolidays,    // Get holidays for a specific stylist
  addHoliday,            // Add a new holiday
  updateHoliday,         // Update an existing holiday
  deleteHoliday,         // Delete a holiday
  isStylistOnHoliday,    // Check if a stylist is on holiday
  updateStylistAvailability // Manually update availability
} = useStylistHolidays();
```

### 5. Usage Examples

#### Adding a Holiday

```typescript
await addHoliday({
  stylistId: "3b4eaf2b-acb9-4119-a2ba-0a8abb1b76ab", 
  holidayDate: "2025-05-20",
  reason: "Vacation"
});
```

#### Checking if a Stylist is on Holiday

```typescript
const isOnHoliday = await isStylistOnHoliday("3b4eaf2b-acb9-4119-a2ba-0a8abb1b76ab");
if (isOnHoliday) {
  console.log("Stylist is on holiday today");
}
```

#### Removing a Holiday

```typescript
await deleteHoliday("e5c34d0e-8f1b-4a5c-9d12-3a4b5c6d7e8f");
```

### 6. Troubleshooting

If stylists are not being automatically marked as unavailable:

1. Check if the SQL trigger is correctly set up by running:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trg_update_stylist_availability_on_holiday_change';
   ```

2. Manually update stylist availability:
   ```typescript
   await updateStylistAvailability();
   ```

3. Check the logs for any errors during holiday operations. 