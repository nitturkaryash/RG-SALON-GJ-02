-- Get the first admin user to assign to existing records
DO $$
DECLARE
    first_admin_id uuid;
BEGIN
    -- Get the first admin user's ID
    SELECT id INTO first_admin_id
    FROM auth.users
    WHERE role = 'admin'
    ORDER BY created_at
    LIMIT 1;

    -- If no admin found, use the first user
    IF first_admin_id IS NULL THEN
        SELECT id INTO first_admin_id
        FROM auth.users
        ORDER BY created_at
        LIMIT 1;
    END IF;

    -- Update all tables with the admin user ID
    IF first_admin_id IS NOT NULL THEN
        -- Update all tables
        UPDATE public.balance_stock_transactions SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE public.breaks SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE public.inventory_purchases SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE public.inventory_sales SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE public.inventory_consumption SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE public.pos_orders SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE public.pos_order_items SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE public.product_master SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE public.services SET user_id = first_admin_id WHERE user_id IS NULL;
        UPDATE public.stylists SET user_id = first_admin_id WHERE user_id IS NULL;
    ELSE
        RAISE EXCEPTION 'No users found in the system to backfill user_id';
    END IF;
END $$; 