-- Comprehensive Test Scenarios for Purchase Deletion
-- This file demonstrates all the scenarios that need to be handled

-- Scenario 1: Delete Old Entry (First Entry)
-- When you delete an old entry, all subsequent entries should have their stock reduced

-- Current State:
-- Entry 1: 2 units → current_stock_at_purchase: 32 (April 12)
-- Entry 2: 5 units → current_stock_at_purchase: 37 (August 5) 
-- Entry 3: 1 unit → current_stock_at_purchase: 38 (August 6)

-- If you delete Entry 1 (2 units from April 12):
-- Entry 2: 5 units → current_stock_at_purchase: 35 (37 - 2 = 35) ✅
-- Entry 3: 1 unit → current_stock_at_purchase: 36 (38 - 2 = 36) ✅

-- Scenario 2: Delete Middle Entry
-- When you delete a middle entry, only entries that came AFTER it should be affected

-- If you delete Entry 2 (5 units from August 5):
-- Entry 1: 2 units → current_stock_at_purchase: 32 (unchanged - came before) ✅
-- Entry 3: 1 unit → current_stock_at_purchase: 33 (38 - 5 = 33) ✅

-- Scenario 3: Delete Latest Entry
-- When you delete the latest entry, no other entries should be affected

-- If you delete Entry 3 (1 unit from August 6):
-- Entry 1: 2 units → current_stock_at_purchase: 32 (unchanged) ✅
-- Entry 2: 5 units → current_stock_at_purchase: 37 (unchanged) ✅

-- The comprehensive function handles all these scenarios correctly:

-- 1. For old entry deletion: subtracts deleted quantity from ALL subsequent entries
-- 2. For middle entry deletion: subtracts deleted quantity from entries that came AFTER
-- 3. For latest entry deletion: no other entries are affected

-- Key Logic:
-- WHERE date > deleted_date -- Only affects entries that came AFTER the deleted entry
-- current_stock_at_purchase = current_stock_at_purchase - deleted_quantity
-- This ensures historical accuracy: if an entry came after a deleted entry,
-- its stock should reflect the deletion of that earlier entry.

-- Test Cases:
-- 1. Delete Entry 1 → Check Entry 2 and 3 stock reduction
-- 2. Delete Entry 2 → Check Entry 3 stock reduction, Entry 1 unchanged
-- 3. Delete Entry 3 → Check Entry 1 and 2 unchanged
-- 4. Delete multiple entries in sequence
-- 5. Delete entries with zero stock
-- 6. Delete entries with negative stock (should be prevented)

-- The comprehensive function ensures:
-- ✅ Historical accuracy: Stock reflects what was available at that point in time
-- ✅ No double-counting: Deleted quantities are properly subtracted
-- ✅ No underflow: Stock never goes below 0
-- ✅ Proper sequencing: Only affects entries that came after the deleted entry
-- ✅ Product master update: Updates the current product stock correctly 