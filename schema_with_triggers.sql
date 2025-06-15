--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.13 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: inventory; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA inventory;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: pgsodium; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgsodium;


--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;


--
-- Name: EXTENSION pgsodium; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgsodium IS 'Pgsodium is a modern cryptography library for Postgres.';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: appointment_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.appointment_status AS ENUM (
    'scheduled',
    'completed',
    'cancelled'
);


--
-- Name: transaction_display; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.transaction_display AS (
	type character varying,
	label character varying,
	color character varying
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    IF EXISTS (
      SELECT 1
      FROM pg_event_trigger_ddl_commands() AS ev
      JOIN pg_extension AS ext
      ON ev.objid = ext.oid
      WHERE ext.extname = 'pg_net'
    )
    THEN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = 'supabase_functions_admin'
      )
      THEN
        CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
      END IF;

      GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

      IF EXISTS (
        SELECT FROM pg_extension
        WHERE extname = 'pg_net'
        -- all versions in use on existing projects as of 2025-02-20
        -- version 0.12.0 onwards don't need these applied
        AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
      ) THEN
        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

        ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
        ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

        REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
        REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

        GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
        GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      END IF;
    END IF;
  END;
  $$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


--
-- Name: add_balance_stock_transaction(timestamp with time zone, text, text, text, text, text, text, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_balance_stock_transaction(p_date_time timestamp with time zone, p_product_name text, p_hsn_code text, p_units text, p_change_type text, p_source text, p_reference_id text, p_quantity_change numeric, p_quantity_after_change numeric) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO balance_stock_transactions (
        date_time,
        product_name,
        hsn_code,
        units,
        change_type,
        source,
        reference_id,
        quantity_change,
        quantity_after_change
    ) VALUES (
        p_date_time,
        p_product_name,
        p_hsn_code,
        p_units,
        p_change_type,
        p_source,
        p_reference_id,
        p_quantity_change,
        p_quantity_after_change
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;


--
-- Name: add_inventory_transaction(text, text, text, text, numeric, numeric); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_inventory_transaction(p_product_name text, p_hsn_code text, p_units text, p_change_type text, p_quantity_change numeric, p_current_balance numeric) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_id UUID;
BEGIN
    INSERT INTO inventory_transactions (
        product_name,
        hsn_code,
        units,
        change_type,
        quantity_change,
        quantity_after_change
    ) VALUES (
        p_product_name,
        p_hsn_code,
        p_units,
        p_change_type,
        p_quantity_change,
        p_current_balance
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;


--
-- Name: add_stylist_holiday(uuid, date, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.add_stylist_holiday(p_stylist_id uuid, p_holiday_date date, p_reason text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_holiday_id UUID;
BEGIN
  -- Generate a new UUID
  v_holiday_id := gen_random_uuid();
  
  -- Insert the holiday
  INSERT INTO public.stylist_holidays (id, stylist_id, holiday_date, reason)
  VALUES (v_holiday_id, p_stylist_id, p_holiday_date, p_reason);
  
  -- If holiday is today, update stylist availability
  IF p_holiday_date = CURRENT_DATE THEN
    UPDATE public.stylists
    SET available = false
    WHERE id = p_stylist_id;
  END IF;
  
  RETURN v_holiday_id;
END;
$$;


--
-- Name: adjust_product_stock(uuid, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.adjust_product_stock(p_product_id uuid, p_new_quantity integer, p_notes text DEFAULT NULL::text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  current_stock INTEGER;
  adjustment_amount INTEGER;
  transaction_type TEXT;
BEGIN
  -- Get current stock
  SELECT stock_quantity INTO current_stock
  FROM product_master
  WHERE id = p_product_id;
  
  IF current_stock IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product not found'
    );
  END IF;
  
  -- Calculate adjustment amount and type
  adjustment_amount := ABS(p_new_quantity - current_stock);
  IF p_new_quantity > current_stock THEN
    transaction_type := 'adjustment_increase';
  ELSIF p_new_quantity < current_stock THEN
    transaction_type := 'adjustment_decrease';
  ELSE
    RETURN jsonb_build_object(
      'success', true,
      'message', 'No change needed'
    );
  END IF;
  
  -- Update the stock
  UPDATE product_master
  SET stock_quantity = p_new_quantity
  WHERE id = p_product_id;
  
  -- Record the transaction
  INSERT INTO product_stock_transactions (
    product_id, 
    transaction_type, 
    quantity, 
    previous_stock, 
    new_stock,
    notes
  ) VALUES (
    p_product_id, 
    transaction_type, 
    adjustment_amount, 
    current_stock, 
    p_new_quantity,
    p_notes
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'old_stock', current_stock,
    'new_stock', p_new_quantity
  );
END;
$$;


--
-- Name: assign_user_role(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assign_user_role(target_user_id uuid, new_role text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  caller_role text;
BEGIN
  -- 1. Check if the user calling this function is an admin
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'User has no profile or role.';
  END IF;

  IF caller_role <> 'admin' THEN
    RAISE EXCEPTION 'Permission denied: Only admins can assign roles.';
  END IF;

  -- 2. Check if the target user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
     RAISE EXCEPTION 'Target user not found.';
  END IF;

  -- 3. Validate the role being assigned
  IF new_role NOT IN ('admin', 'member', 'stylist') THEN
    RAISE EXCEPTION 'Invalid role specified.';
  END IF;

  -- 4. If checks pass, update the target user's role in the profiles table
  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_user_id;

  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
    RETURN FALSE;
END;
$$;


--
-- Name: authenticate(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.authenticate(username_input text, password_input text) RETURNS TABLE(id uuid, username text, name text, role text, email text)
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT 
    id,
    username,
    name,
    role,
    email
  FROM public.users
  WHERE 
    username = username_input 
    AND password = password_input;
$$;


--
-- Name: avoid_duplicate_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.avoid_duplicate_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM product_stock_transactions
    WHERE duplicate_protection_key = NEW.duplicate_protection_key
  ) THEN
    RETURN NULL; -- Block insert if already exists
  END IF;

  RETURN NEW; -- Allow insert
END;
$$;


--
-- Name: avoid_multiple_product_order_entries(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.avoid_multiple_product_order_entries() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM product_stock_transactions
    WHERE product_id = NEW.product_id
      AND order_id = NEW.order_id
      AND source = NEW.source
  ) THEN
    RETURN NULL; -- Already inserted for this combination
  END IF;

  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    gst_percentage text,
    hsn_code text,
    igst text
);


--
-- Name: check_admin_login(text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_admin_login(email_input text, password_input text) RETURNS SETOF public.admin_users
    LANGUAGE sql SECURITY DEFINER
    AS $$
  SELECT * FROM admin_users
  WHERE email = email_input
  AND password = password_input;
$$;


--
-- Name: check_appointment_conflict(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_appointment_conflict() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM appointments
        WHERE stylist_id = NEW.stylist_id
        AND id != NEW.id
        AND status != 'cancelled'
        AND (
            (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time)
        )
    ) THEN
        RAISE EXCEPTION 'Appointment time conflicts with an existing appointment';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: check_debug_logs(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_debug_logs(order_id text) RETURNS TABLE("timestamp" timestamp without time zone, operation text, details text, error_message text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT dl.timestamp, dl.operation, dl.details, dl.error_message
  FROM trigger_debug_log dl
  WHERE dl.details LIKE '%' || order_id || '%'
  ORDER BY dl.id;
END;
$$;


--
-- Name: clean_duplicate_transactions(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.clean_duplicate_transactions() RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  deleted_count INTEGER;
  result JSONB;
BEGIN
  -- Create a temporary table to track duplicates for deletion
  CREATE TEMP TABLE duplicate_ids (id UUID);
  
  -- Insert the IDs of duplicate records (keeping the first one)
  INSERT INTO duplicate_ids
  WITH duplicates AS (
    SELECT 
      id,
      product_id,
      quantity,
      previous_stock,
      new_stock,
      created_at,
      ROW_NUMBER() OVER (
        PARTITION BY 
          product_id,
          quantity,
          previous_stock,
          new_stock,
          DATE_TRUNC('minute', created_at)
        ORDER BY created_at
      ) as row_num
    FROM product_stock_transactions
  )
  SELECT id FROM duplicates WHERE row_num > 1;

  -- Delete the duplicates
  DELETE FROM product_stock_transactions
  WHERE id IN (SELECT id FROM duplicate_ids);
  
  -- Get the count of deleted rows
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean up
  DROP TABLE duplicate_ids;
  
  -- Return results
  result := jsonb_build_object(
    'success', true,
    'duplicates_removed', deleted_count
  );
  
  RETURN result;
END;
$$;


--
-- Name: create_stylist_holidays_table(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.create_stylist_holidays_table() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Check if the table exists, create it if it doesn't
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'stylist_holidays'
  ) THEN
    CREATE TABLE public.stylist_holidays (
      id UUID PRIMARY KEY,
      stylist_id UUID REFERENCES public.stylists(id) ON DELETE CASCADE,
      holiday_date DATE NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Add indexes for performance
    CREATE INDEX idx_stylist_holidays_stylist_id ON public.stylist_holidays(stylist_id);
    CREATE INDEX idx_stylist_holidays_date ON public.stylist_holidays(holiday_date);
    
    -- Add RLS policies
    ALTER TABLE public.stylist_holidays ENABLE ROW LEVEL SECURITY;
    
    -- Create policies (adjust as needed based on your auth setup)
    CREATE POLICY "Enable read access for all users" ON public.stylist_holidays
      FOR SELECT USING (true);
      
    CREATE POLICY "Enable insert for authenticated users" ON public.stylist_holidays
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');
      
    CREATE POLICY "Enable update for authenticated users" ON public.stylist_holidays
      FOR UPDATE USING (auth.role() = 'authenticated');
      
    CREATE POLICY "Enable delete for authenticated users" ON public.stylist_holidays
      FOR DELETE USING (auth.role() = 'authenticated');
  END IF;
END;
$$;


--
-- Name: decrement_product_stock(jsonb[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.decrement_product_stock(product_updates jsonb[]) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  result JSONB := '{"success": true, "results": []}'::JSONB;
  update_item JSONB;
  product_id TEXT;
  quantity INTEGER;
  current_stock INTEGER;
  new_stock INTEGER;
  order_id UUID;
  notes TEXT;
BEGIN
  -- Extract order ID if present
  IF jsonb_array_length(product_updates) > 0 AND 
     product_updates[1] ? 'order_id' THEN
    order_id := (product_updates[1]->>'order_id')::UUID;
  END IF;

  -- Handle each product update
  FOREACH update_item IN ARRAY product_updates
  LOOP
    product_id := update_item->>'product_id';
    quantity := (update_item->>'quantity')::INTEGER;
    notes := update_item->>'notes';
    
    -- Skip invalid inputs
    IF product_id IS NULL OR quantity <= 0 THEN
      CONTINUE;
    END IF;
    
    -- Get current stock
    SELECT stock_quantity INTO current_stock
    FROM product_master
    WHERE id = product_id;
    
    IF current_stock IS NOT NULL THEN
      -- Calculate new stock (ensure not negative)
      new_stock := GREATEST(0, current_stock - quantity);
      
      -- Update the stock
      UPDATE product_master 
      SET stock_quantity = new_stock
      WHERE id = product_id;
      
      -- Record the transaction in history table
      INSERT INTO product_stock_transactions (
        product_id, 
        transaction_type, 
        quantity, 
        previous_stock, 
        new_stock, 
        order_id,
        notes
      ) VALUES (
        product_id::UUID, 
        'decrement', 
        quantity, 
        current_stock, 
        new_stock, 
        order_id,
        notes
      );
      
      -- Add to results
      result := jsonb_set(
        result, 
        '{results}', 
        (result->'results') || jsonb_build_object(
          'product_id', product_id,
          'old_stock', current_stock,
          'new_stock', new_stock
        )
      );
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;


--
-- Name: decrement_product_stock_compat(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.decrement_product_stock_compat(product_updates jsonb) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    result jsonb := '[]'::jsonb;
    update_record jsonb;
    product_id uuid;
    quantity integer;
    current_stock integer;
    new_stock integer;
BEGIN
    -- Process each update in a loop
    FOR update_record IN SELECT * FROM jsonb_array_elements(product_updates)
    LOOP
        product_id := (update_record->>'product_id')::uuid;
        quantity := (update_record->>'quantity')::integer;
        
        -- Get current stock
        SELECT stock_quantity INTO current_stock
        FROM products
        WHERE id = product_id;
        
        IF current_stock IS NOT NULL THEN
            -- Calculate new stock
            new_stock := current_stock - quantity;
            
            -- Update stock
            UPDATE products
            SET stock_quantity = new_stock,
                updated_at = NOW()
            WHERE id = product_id;
            
            -- Add to result
            result := result || jsonb_build_object(
                'product_id', product_id,
                'old_stock', current_stock,
                'new_stock', new_stock,
                'quantity_deducted', quantity
            );
        END IF;
    END LOOP;
    
    RETURN result;
END;
$$;


--
-- Name: delete_purchase_history_on_product_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_purchase_history_on_product_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM public.purchase_history_with_stock
  WHERE product_id = OLD.id;
  RETURN OLD;
END;
$$;


--
-- Name: delete_sales_item(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.delete_sales_item(item_id text) RETURNS jsonb
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  result        JSONB;
  affected_rows INT;
  order_uuid    UUID;
BEGIN
  RAISE NOTICE 'Attempting to delete sales item with ID: %', item_id;
  
  IF NOT EXISTS (SELECT 1 FROM pos_order_items WHERE id = item_id::UUID) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Item not found with ID: ' || item_id
    );
  END IF;

  -- Remove the JSON element from the parent order
  SELECT pos_order_id INTO order_uuid
    FROM pos_order_items
   WHERE id = item_id::UUID;

  UPDATE pos_orders
  SET services = (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
      FROM jsonb_array_elements(services) AS elem
     WHERE elem->>'id' != item_id
  )
  WHERE id = order_uuid;
  RAISE NOTICE 'Removed JSON element from pos_orders for order %', order_uuid;

  -- Now delete the actual row
  DELETE FROM pos_order_items
   WHERE id = item_id::UUID
  RETURNING count(*) INTO affected_rows;
  
  IF affected_rows > 0 THEN
    result := jsonb_build_object(
      'success', true,
      'message', 'Successfully deleted sales item and removed from order JSON',
      'affected_rows', affected_rows
    );
  ELSE
    result := jsonb_build_object(
      'success', false,
      'error',   'Failed to delete item. No rows affected.'
    );
  END IF;

  RETURN result;
END;
$$;


--
-- Name: ensure_inventory_sales_product_name(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ensure_inventory_sales_product_name() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- If product_name is NULL but product_id is not, try to get name from products
  IF NEW.product_name IS NULL AND NEW.product_id IS NOT NULL THEN
    -- Try to get name from products table
    SELECT name INTO NEW.product_name 
    FROM products 
    WHERE id::text = NEW.product_id;
    
    -- If still NULL, try from inventory_products
    IF NEW.product_name IS NULL THEN
      SELECT product_name INTO NEW.product_name 
      FROM inventory_products 
      WHERE product_id::text = NEW.product_id;
    END IF;
    
    -- If still NULL, set a default
    IF NEW.product_name IS NULL THEN
      NEW.product_name := 'Unknown Product (' || NEW.product_id || ')';
    END IF;
  END IF;
  
  -- Ensure other required fields are set with defaults
  IF NEW.date IS NULL THEN
    NEW.date := CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: exec_sql(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.exec_sql(sql text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  EXECUTE sql;
END;
$$;


--
-- Name: fn_insert_purchase_history_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.fn_insert_purchase_history_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO public.purchase_history_with_stock (
    purchase_id, date, product_id, product_name, hsn_code, units,
    purchase_invoice_number, purchase_qty, mrp_incl_gst, mrp_excl_gst,
    discount_on_purchase_percentage, gst_percentage, purchase_taxable_value,
    purchase_igst, purchase_cgst, purchase_sgst, purchase_invoice_value_rs,
    supplier, current_stock_at_purchase, computed_stock_taxable_value,
    computed_stock_igst, computed_stock_cgst, computed_stock_sgst,
    computed_stock_total_value, "Purchase_Cost/Unit(Ex.GST)", price_inlcuding_disc, 
    transaction_type, created_at, updated_at
  )
  SELECT
    NEW.purchase_id, NEW.date, NEW.product_id, NEW.product_name, NEW.hsn_code, NEW.units,
    NEW.purchase_invoice_number, NEW.purchase_qty, NEW.mrp_incl_gst, NEW.mrp_excl_gst,
    NEW.discount_on_purchase_percentage, NEW.gst_percentage, NEW.purchase_taxable_value,
    NEW.purchase_igst, NEW.purchase_cgst, NEW.purchase_sgst, NEW.purchase_invoice_value_rs,
    NEW."Vendor", -- FIXED: Changed from COALESCE(NEW."Vendor", NEW.supplier) to just NEW."Vendor"
    (
      (SELECT COALESCE(SUM(p2.purchase_qty),0)
       FROM public.inventory_purchases p2
       WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
      - (SELECT COALESCE(SUM(s.quantity),0)
         FROM public.inventory_sales_new s
         WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
      - (SELECT COALESCE(SUM(c.consumption_qty),0)
         FROM public.inventory_consumption c
         WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
    ) AS current_stock_at_purchase,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst
    ) AS computed_stock_taxable_value,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst * (NEW.gst_percentage/100.0)
    ) AS computed_stock_igst,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst * (NEW.gst_percentage/200.0)
    ) AS computed_stock_cgst,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst * (NEW.gst_percentage/200.0)
    ) AS computed_stock_sgst,
    (
      (
        (SELECT COALESCE(SUM(p2.purchase_qty),0) FROM public.inventory_purchases p2 WHERE p2.product_name = NEW.product_name AND p2.date <= NEW.date)
        - (SELECT COALESCE(SUM(s.quantity),0) FROM public.inventory_sales_new s WHERE s.product_name = NEW.product_name AND s.date <= NEW.date)
        - (SELECT COALESCE(SUM(c.consumption_qty),0) FROM public.inventory_consumption c WHERE c.product_name = NEW.product_name AND c.date <= NEW.date)
      ) * NEW.mrp_excl_gst * (1 + NEW.gst_percentage/100.0)
    ) AS computed_stock_total_value,
    CASE WHEN NEW.purchase_qty = 0 THEN NULL ELSE NEW.purchase_taxable_value / NEW.purchase_qty END AS "Purchase_Cost/Unit(Ex.GST)",
    CASE WHEN NEW.purchase_qty = 0 THEN NULL ELSE NEW.purchase_taxable_value / NEW.purchase_qty END AS price_inlcuding_disc,
    COALESCE(NEW.transaction_type, 'purchase') AS transaction_type,
    NOW(), NOW();
  RETURN NEW;
END;
$$;


--
-- Name: freeze_remaining_stock_on_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.freeze_remaining_stock_on_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Keep remaining_stock unchanged on update
    NEW.remaining_stock := OLD.remaining_stock;
    RETURN NEW;
END;
$$;


--
-- Name: generate_salon_consumption_serial(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_salon_consumption_serial() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  next_number INTEGER;
  serial_prefix VARCHAR := 'SC-';
BEGIN
  -- Get the highest current serial number
  SELECT COALESCE(MAX(NULLIF(REGEXP_REPLACE(serial_number, '^SC-', ''), '')::INTEGER), 0) + 1
  INTO next_number
  FROM inventory_salon_consumption;
  
  -- Format with leading zeros (4 digits)
  NEW.serial_number := serial_prefix || LPAD(next_number::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$;


--
-- Name: pos_orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pos_orders (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    client_name text,
    consumption_purpose text,
    consumption_notes text,
    total numeric DEFAULT 0 NOT NULL,
    type text DEFAULT 'sale'::text,
    is_salon_consumption boolean DEFAULT false,
    status text DEFAULT 'completed'::text,
    payment_method text DEFAULT 'cash'::text,
    stylist_id text,
    services jsonb,
    subtotal double precision,
    tax double precision,
    discount double precision,
    is_walk_in boolean,
    payments jsonb,
    pending_amount double precision,
    is_split_payment boolean,
    appointment_id text,
    is_salon_purchase boolean,
    stylist_name text,
    order_id text,
    customer_name text,
    date timestamp with time zone DEFAULT now(),
    total_amount numeric DEFAULT 0,
    appointment_time timestamp with time zone,
    discount_percentage numeric DEFAULT 0,
    requisition_voucher_no text,
    stock_snapshot jsonb DEFAULT '{}'::jsonb,
    current_stock text
);


--
-- Name: COLUMN pos_orders.current_stock; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.pos_orders.current_stock IS 'it will contain stock at the time of sale and it is different in different row';


--
-- Name: product_master; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_master (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    stock_quantity integer DEFAULT 0,
    category text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    collection_id uuid,
    hsn_code text,
    units text,
    mrp_incl_gst numeric(10,2),
    mrp_excl_gst numeric(10,2),
    gst_percentage integer DEFAULT 18,
    sku text,
    product_type text,
    "Purchase_Cost/Unit(Ex.GST)" numeric
);


--
-- Name: product_stock_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_stock_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    transaction_type character varying(50) NOT NULL,
    quantity integer NOT NULL,
    previous_stock integer NOT NULL,
    new_stock integer NOT NULL,
    order_id uuid,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    display_type character varying(50),
    source_type character varying(50),
    source character varying(50),
    duplicate_protection_key text,
    created_at_tz timestamp with time zone
);


--
-- Name: product_stock_transaction_history; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.product_stock_transaction_history AS
 SELECT t.id,
    to_char(((t.created_at AT TIME ZONE 'UTC'::text) AT TIME ZONE 'Asia/Kolkata'::text), 'MM/DD/YYYY, HH12:MI:SS AM'::text) AS "Date",
    p.name AS "Product Name",
    p.hsn_code AS "HSN Code",
    'pcs'::text AS "Units",
        CASE
            WHEN ((t.display_type)::text = 'reduction'::text) THEN 'reduction'::character varying
            WHEN ((t.display_type)::text = 'addition'::text) THEN 'addition'::character varying
            WHEN (t.display_type IS NOT NULL) THEN t.display_type
            ELSE t.transaction_type
        END AS "Change Type",
    COALESCE(t.source, 'inventory_update'::character varying) AS "Source",
    COALESCE((o.id)::text, '-'::text) AS "Reference ID",
    t.quantity AS "Quantity Change",
    t.new_stock AS "Quantity After Change"
   FROM ((public.product_stock_transactions t
     LEFT JOIN public.product_master p ON ((t.product_id = p.id)))
     LEFT JOIN public.pos_orders o ON ((t.order_id = o.id)))
  ORDER BY t.created_at DESC;


--
-- Name: get_balance_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_balance_stock() RETURNS SETOF public.product_stock_transaction_history
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM product_stock_transaction_history;
END;
$$;


--
-- Name: get_next_balance_stock_serial(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_next_balance_stock_serial() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  next_number INTEGER;
  serial_prefix VARCHAR := 'BS-';
BEGIN
  -- Use a separate counter table for balance stock numbers
  SELECT counter INTO next_number FROM serial_counters WHERE counter_name = 'balance_stock' FOR UPDATE;
  
  IF next_number IS NULL THEN
    INSERT INTO serial_counters (counter_name, counter) VALUES ('balance_stock', 1);
    next_number := 1;
  ELSE
    UPDATE serial_counters SET counter = counter + 1 WHERE counter_name = 'balance_stock';
  END IF;
  
  RETURN serial_prefix || LPAD(next_number::TEXT, 4, '0');
END;
$$;


--
-- Name: get_product_transaction_history(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_product_transaction_history(p_product_id uuid) RETURNS TABLE(id uuid, transaction_type character varying, quantity integer, previous_stock integer, new_stock integer, created_at timestamp with time zone, notes text, order_id uuid)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.transaction_type,
    t.quantity,
    t.previous_stock,
    t.new_stock,
    t.created_at,
    t.notes,
    t.order_id
  FROM 
    product_stock_transactions t
  WHERE 
    t.product_id = p_product_id
  ORDER BY 
    t.created_at DESC;
END;
$$;


--
-- Name: get_stock_transactions(integer, integer, timestamp with time zone, timestamp with time zone, uuid, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_stock_transactions(p_limit integer DEFAULT 20, p_offset integer DEFAULT 0, p_date_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_date_to timestamp with time zone DEFAULT NULL::timestamp with time zone, p_product_id uuid DEFAULT NULL::uuid, p_transaction_type character varying DEFAULT NULL::character varying) RETURNS TABLE(id uuid, transaction_type character varying, quantity integer, previous_stock integer, new_stock integer, created_at timestamp with time zone, notes text, product_name text, product_sku text, product_id uuid, order_id uuid, order_client text, created_by_email text)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM vw_stock_transactions
  WHERE 
    (p_date_from IS NULL OR created_at >= p_date_from) AND
    (p_date_to IS NULL OR created_at <= p_date_to) AND
    (p_product_id IS NULL OR product_id = p_product_id) AND
    (p_transaction_type IS NULL OR transaction_type = p_transaction_type)
  ORDER BY created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;


--
-- Name: get_stylist_holidays(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_stylist_holidays(p_stylist_id uuid) RETURNS TABLE(id uuid, stylist_id uuid, holiday_date date, reason text, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT h.id, h.stylist_id, h.holiday_date, h.reason, h.created_at
  FROM public.stylist_holidays h
  WHERE h.stylist_id = p_stylist_id
  ORDER BY h.holiday_date;
END;
$$;


--
-- Name: get_table_columns(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_table_columns(table_name text) RETURNS TABLE(column_name text, data_type text, is_nullable boolean)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text, 
    c.data_type::text, 
    (c.is_nullable = 'YES')::boolean
  FROM information_schema.columns c
  WHERE c.table_name = table_name
  AND c.table_schema = 'public';
END;
$$;


--
-- Name: get_transaction_display(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_transaction_display() RETURNS SETOF public.transaction_display
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY VALUES
    ('increment', 'Stock Added', 'green'),
    ('decrement', 'Stock Reduced', 'red'),
    ('adjustment_increase', 'Manual Increase', 'blue'),
    ('adjustment_decrease', 'Manual Decrease', 'orange');
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;


--
-- Name: handle_order_deletion_update_client_spent(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_order_deletion_update_client_spent() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  amount_to_decrement NUMERIC;
BEGIN
  -- Get the amount to decrement from the deleted order row.
  -- Using COALESCE to default to 0 if total_amount is NULL.
  -- *** IMPORTANT: If your order total column is named differently (e.g., 'total'), ***
  -- *** replace 'OLD.total_amount' with 'OLD.your_actual_total_column_name'. ***
  amount_to_decrement := COALESCE(OLD.total_amount, 0);

  -- Check if client_name is available and amount is greater than 0
  IF OLD.client_name IS NOT NULL AND OLD.client_name <> '' AND amount_to_decrement > 0 THEN
    -- Update the client's total_spent
    UPDATE public.clients
    SET total_spent = COALESCE(total_spent, 0) - amount_to_decrement
    WHERE full_name = OLD.client_name; -- Match client by full_name

    -- Ensure total_spent does not go below zero after the update
    UPDATE public.clients
    SET total_spent = 0
    WHERE full_name = OLD.client_name AND total_spent < 0;
  END IF;

  RETURN OLD; -- The result is ignored for AFTER DELETE triggers
END;
$$;


--
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;


--
-- Name: increment_product_stock(jsonb[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_product_stock(product_updates jsonb[]) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  result JSONB := '{"success": true, "results": []}'::JSONB;
  update_item JSONB;
  product_id TEXT;
  quantity INTEGER;
  current_stock INTEGER;
  new_stock INTEGER;
  notes TEXT;
BEGIN
  -- Handle each product update
  FOREACH update_item IN ARRAY product_updates
  LOOP
    product_id := update_item->>'product_id';
    quantity := (update_item->>'quantity')::INTEGER;
    notes := update_item->>'notes';
    
    -- Skip invalid inputs
    IF product_id IS NULL OR quantity <= 0 THEN
      CONTINUE;
    END IF;
    
    -- Get current stock
    SELECT stock_quantity INTO current_stock
    FROM product_master
    WHERE id = product_id;
    
    IF current_stock IS NOT NULL THEN
      -- Calculate new stock
      new_stock := current_stock + quantity;
      
      -- Update the stock
      UPDATE product_master
      SET stock_quantity = new_stock
      WHERE id = product_id;
      
      -- Record the transaction in history table
      INSERT INTO product_stock_transactions (
        product_id, 
        transaction_type, 
        quantity, 
        previous_stock, 
        new_stock,
        notes
      ) VALUES (
        product_id::UUID, 
        'increment', 
        quantity, 
        current_stock, 
        new_stock,
        notes
      );
      
      -- Add to results
      result := jsonb_set(
        result, 
        '{results}', 
        (result->'results') || jsonb_build_object(
          'product_id', product_id,
          'old_stock', current_stock,
          'new_stock', new_stock
        )
      );
    END IF;
  END LOOP;
  
  RETURN result;
END;
$$;


--
-- Name: increment_product_stock(uuid, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.increment_product_stock(p_product_id uuid, p_increment_quantity integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  current_stock INTEGER;
  product_name TEXT;
  hsn_code TEXT;
  units TEXT;
  gst_percentage INTEGER;
  price DECIMAL;
  new_stock INTEGER;
  timestamp TIMESTAMP;
BEGIN
  timestamp := NOW();

  -- Get product details and current stock
  SELECT 
    p.name,
    p.hsn_code,
    p.units,
    p.gst_percentage,
    p.price,
    COALESCE(ph.current_stock_at_purchase, p.stock_quantity, 0) as current_stock
  INTO 
    product_name,
    hsn_code,
    units,
    gst_percentage,
    price,
    current_stock
  FROM products p
  LEFT JOIN (
    SELECT DISTINCT ON (product_id) 
      product_id,
      current_stock_at_purchase
    FROM purchase_history_with_stock
    ORDER BY product_id, created_at DESC
  ) ph ON ph.product_id = p.id
  WHERE p.id = p_product_id;
  
  -- Exit if product not found
  IF product_name IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Product not found',
      'product_id', p_product_id
    );
  END IF;
  
  -- Calculate new stock
  new_stock := GREATEST(0, current_stock + p_increment_quantity);
  
  -- Calculate GST values
  DECLARE
    gst_amount DECIMAL;
    price_incl_gst DECIMAL;
  BEGIN
    gst_amount := (price * COALESCE(gst_percentage, 18)) / 100;
    price_incl_gst := price + gst_amount;
    
    -- Insert into purchase history
    INSERT INTO purchase_history_with_stock (
      purchase_id,
      date,
      product_id,
      product_name,
      hsn_code,
      units,
      purchase_invoice_number,
      purchase_qty,
      mrp_incl_gst,
      mrp_excl_gst,
      discount_on_purchase_percentage,
      gst_percentage,
      purchase_taxable_value,
      purchase_igst,
      purchase_cgst,
      purchase_sgst,
      purchase_invoice_value_rs,
      supplier,
      current_stock_at_purchase,
      computed_stock_taxable_value,
      computed_stock_igst,
      computed_stock_cgst,
      computed_stock_sgst,
      computed_stock_total_value,
      created_at,
      updated_at,
      "Purchase_Cost/Unit(Ex.GST)",
      price_inlcuding_disc,
      transaction_type
    ) VALUES (
      uuid_generate_v4(),
      timestamp,
      p_product_id,
      product_name,
      COALESCE(hsn_code, ''),
      COALESCE(units, 'UNITS'),
      'INV-UPDATE-' || extract(epoch from timestamp)::bigint,
      p_increment_quantity,
      price_incl_gst,
      price,
      0,
      COALESCE(gst_percentage, 18),
      price * p_increment_quantity,
      0,
      gst_amount / 2,
      gst_amount / 2,
      price_incl_gst * p_increment_quantity,
      'INVENTORY UPDATE',
      new_stock,
      0,
      0,
      0,
      0,
      0,
      timestamp,
      timestamp,
      price,
      price,
      'stock_increment'
    );
  END;

  -- Update products table stock
  UPDATE products
  SET 
    stock_quantity = new_stock,
    updated_at = timestamp
  WHERE id = p_product_id;
  
  -- Return success with details
  RETURN jsonb_build_object(
    'success', true,
    'product_id', p_product_id,
    'product_name', product_name,
    'previous_stock', current_stock,
    'incremented', p_increment_quantity,
    'new_stock', new_stock
  );
END;
$$;


--
-- Name: insert_sales_product_data(text, uuid, date, text, integer, numeric, numeric, numeric, numeric, text, text, numeric, numeric, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_sales_product_data(p_serial_no text, p_order_id uuid, p_date date, p_product_name text, p_quantity integer, p_unit_price_ex_gst numeric, p_gst_percentage numeric, p_discount numeric, p_tax numeric, p_hsn_code text, p_product_type text, p_mrp_incl_gst numeric, p_discounted_sales_rate_ex_gst numeric, p_current_stock integer, p_total_sold integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_initial_stock INTEGER;
    v_remaining_stock INTEGER;
BEGIN
    v_initial_stock := p_current_stock + p_total_sold;
    v_remaining_stock := v_initial_stock - p_quantity;

    INSERT INTO sales_product_data (
        serial_no, order_id, date, product_name, quantity, unit_price_ex_gst, gst_percentage,
        taxable_value, cgst_amount, sgst_amount, total_purchase_cost, discount, tax,
        hsn_code, product_type, mrp_incl_gst, discounted_sales_rate_ex_gst, invoice_value,
        igst_amount, initial_stock, remaining_stock, current_stock
    ) VALUES (
        p_serial_no, p_order_id, p_date, p_product_name, p_quantity, p_unit_price_ex_gst, p_gst_percentage,
        ROUND(p_unit_price_ex_gst * p_quantity, 2),
        ROUND(p_unit_price_ex_gst * p_quantity * p_gst_percentage / 100 / 2, 2),
        ROUND(p_unit_price_ex_gst * p_quantity * p_gst_percentage / 100 / 2, 2),
        ROUND(p_unit_price_ex_gst * p_quantity * (1 + p_gst_percentage / 100), 2),
        p_discount, p_tax, p_hsn_code, p_product_type, p_mrp_incl_gst, p_discounted_sales_rate_ex_gst,
        ROUND(p_quantity * p_unit_price_ex_gst * (1 + p_gst_percentage / 100), 2),
        0, v_initial_stock, v_remaining_stock, p_current_stock
    );
END;
$$;


--
-- Name: insert_salon_consumption_snapshot(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_salon_consumption_snapshot() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_product_id UUID;
    v_quantity INTEGER;
    v_stock_before_consumption BIGINT;
    v_total_consumed BIGINT;
    v_current_consumed BIGINT;
    v_product_name TEXT;
    v_product_record RECORD;
    v_product_quantities JSONB;
    v_master_stock BIGINT;
BEGIN
    -- Only process salon_consumption type
    IF NEW.type != 'salon_consumption' THEN
        RETURN NEW;
    END IF;
    
    -- First build a consolidated map of product quantities to ensure one entry per product
    v_product_quantities := '{}';
    
    -- Loop through each item and build aggregated quantities by product
    FOR v_product_record IN
        SELECT 
            (item->>'id')::UUID AS product_id,
            (item->>'quantity')::INTEGER AS quantity,
            item->>'name' AS product_name
        FROM jsonb_array_elements(NEW.services) AS item
        WHERE item->>'type' = 'product'
    LOOP
        -- Add quantity to the product's total
        IF v_product_quantities ? v_product_record.product_id::TEXT THEN
            v_product_quantities := jsonb_set(
                v_product_quantities,
                ARRAY[v_product_record.product_id::TEXT],
                (v_product_quantities->>v_product_record.product_id::TEXT)::JSONB || 
                jsonb_build_object(
                    'quantity', ((v_product_quantities->>v_product_record.product_id::TEXT)::JSONB->>'quantity')::INT + v_product_record.quantity,
                    'product_name', v_product_record.product_name
                )
            );
        ELSE
            v_product_quantities := jsonb_set(
                v_product_quantities,
                ARRAY[v_product_record.product_id::TEXT],
                jsonb_build_object(
                    'quantity', v_product_record.quantity,
                    'product_name', v_product_record.product_name
                )
            );
        END IF;
    END LOOP;
    
    -- Loop through each unique product and create one snapshot entry per product
    FOR v_product_id IN SELECT jsonb_object_keys(v_product_quantities)::UUID
    LOOP
        -- Extract product details
        v_quantity := (v_product_quantities->>v_product_id::TEXT)::JSONB->>'quantity';
        v_product_name := (v_product_quantities->>v_product_id::TEXT)::JSONB->>'product_name';
        
        -- Get stock from product_master if available
        SELECT stock_quantity INTO v_master_stock
        FROM product_master
        WHERE id = v_product_id;
        
        -- If product_master stock exists, use it, otherwise calculate from purchases
        IF v_master_stock IS NOT NULL THEN
            v_stock_before_consumption := v_master_stock;
        ELSE
            -- Calculate total stock from purchases up to this consumption
            SELECT COALESCE(SUM(pr.purchase_qty), 0) INTO v_stock_before_consumption
            FROM vw_purchase_recalc pr
            WHERE pr.product_name = v_product_name
            AND pr.date <= NEW.date;
        END IF;

        -- Calculate total consumed/sold for this product up to this consumption
        WITH all_usage AS (
            SELECT 
                SUM(CASE 
                    WHEN po.type = 'salon_consumption' THEN (item->>'quantity')::INTEGER
                    ELSE (item->>'quantity')::INTEGER
                END) AS qty_used,
                po.id = NEW.id AS is_current
            FROM pos_orders po
            CROSS JOIN LATERAL jsonb_array_elements(po.services) AS item
            WHERE (po.type = 'sale' OR po.type = 'salon_consumption')
            AND ((po.type = 'salon_consumption' AND (item->>'id')::UUID = v_product_id) OR 
                 (po.type != 'salon_consumption' AND (item->>'service_id')::UUID = v_product_id))
            AND po.date <= NEW.date
            GROUP BY po.id = NEW.id
        )
        SELECT 
            SUM(CASE WHEN NOT is_current THEN qty_used ELSE 0 END),
            SUM(qty_used)
        INTO v_total_consumed, v_current_consumed
        FROM all_usage;
        
        -- If values are NULL, set them to 0
        v_total_consumed := COALESCE(v_total_consumed, 0);
        v_current_consumed := COALESCE(v_current_consumed, 0);
        
        -- Insert into stock_snapshots with a single entry per product
        INSERT INTO stock_snapshots (
            sale_order_id, 
            product_id, 
            order_date, 
            initial_stock, 
            current_stock, 
            total_sold,
            quantity,
            order_type
        )
        VALUES (
            NEW.id,
            v_product_id,
            NEW.date,
            v_stock_before_consumption,
            v_stock_before_consumption - v_current_consumed,
            v_current_consumed,
            v_quantity,
            NEW.type
        )
        ON CONFLICT (sale_order_id, product_id) DO NOTHING;
    END LOOP;

    RETURN NEW;
END;
$$;


--
-- Name: insert_stock_snapshot(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.insert_stock_snapshot() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_product_id UUID;
    v_quantity INTEGER;
    v_stock_before_sale BIGINT;
    v_total_sold BIGINT;
    v_current_sold BIGINT;
    v_product_name TEXT;
    v_product_record RECORD;
    v_product_quantities JSONB;
BEGIN
    -- First build a consolidated map of product quantities to ensure one entry per product
    v_product_quantities := '{}';
    
    -- Loop through each item and build aggregated quantities by product
    FOR v_product_record IN
        SELECT 
            (item->>'service_id')::UUID AS product_id,
            (item->>'quantity')::INTEGER AS quantity,
            item->>'service_name' AS product_name
        FROM jsonb_array_elements(NEW.services) AS item
        WHERE NEW.type = 'sale' AND item->>'type' = 'product'
    LOOP
        -- Add quantity to the product's total
        IF v_product_quantities ? v_product_record.product_id::TEXT THEN
            v_product_quantities := jsonb_set(
                v_product_quantities,
                ARRAY[v_product_record.product_id::TEXT],
                (v_product_quantities->>v_product_record.product_id::TEXT)::JSONB || 
                jsonb_build_object(
                    'quantity', ((v_product_quantities->>v_product_record.product_id::TEXT)::JSONB->>'quantity')::INT + v_product_record.quantity,
                    'product_name', v_product_record.product_name
                )
            );
        ELSE
            v_product_quantities := jsonb_set(
                v_product_quantities,
                ARRAY[v_product_record.product_id::TEXT],
                jsonb_build_object(
                    'quantity', v_product_record.quantity,
                    'product_name', v_product_record.product_name
                )
            );
        END IF;
    END LOOP;
    
    -- Loop through each unique product and create one snapshot entry per product
    FOR v_product_id IN SELECT jsonb_object_keys(v_product_quantities)::UUID
    LOOP
        -- Extract product details
        v_quantity := (v_product_quantities->>v_product_id::TEXT)::JSONB->>'quantity';
        v_product_name := (v_product_quantities->>v_product_id::TEXT)::JSONB->>'product_name';
        
        -- Calculate total stock from purchases up to this sale
        SELECT COALESCE(SUM(pr.purchase_qty), 0) INTO v_stock_before_sale
        FROM vw_purchase_recalc pr
        WHERE pr.product_name = v_product_name
        AND pr.date <= NEW.date;

        -- Calculate total sold for this product up to this sale (including the current sale)
        WITH current_sales AS (
            SELECT 
                SUM((item->>'quantity')::INTEGER) AS qty_sold,
                po.id = NEW.id AS is_current_sale
            FROM pos_orders po
            CROSS JOIN LATERAL jsonb_array_elements(po.services) AS item
            WHERE po.type = 'sale'
            AND item->>'type' = 'product'
            AND (item->>'service_id')::UUID = v_product_id
            AND po.date <= NEW.date
            GROUP BY po.id = NEW.id
        )
        SELECT 
            SUM(CASE WHEN NOT is_current_sale THEN qty_sold ELSE 0 END),
            SUM(qty_sold)
        INTO v_total_sold, v_current_sold
        FROM current_sales;
        
        -- If v_total_sold is NULL, set it to 0
        v_total_sold := COALESCE(v_total_sold, 0);
        v_current_sold := COALESCE(v_current_sold, 0);
        
        -- Insert into stock_snapshots with a single entry per product
        INSERT INTO stock_snapshots (
            sale_order_id, 
            product_id, 
            order_date, 
            initial_stock, 
            current_stock, 
            total_sold,
            quantity
        )
        VALUES (
            NEW.id,
            v_product_id,
            NEW.date,
            v_stock_before_sale,
            v_stock_before_sale - v_current_sold,
            v_current_sold,
            v_quantity
        )
        ON CONFLICT (sale_order_id, product_id) DO NOTHING;
    END LOOP;

    RETURN NEW;
END;
$$;


--
-- Name: is_stylist_on_holiday(uuid, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_stylist_on_holiday(p_stylist_id uuid, p_date date DEFAULT CURRENT_DATE) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_is_on_holiday BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.stylist_holidays
    WHERE stylist_id = p_stylist_id
    AND holiday_date = p_date
  ) INTO v_is_on_holiday;
  
  RETURN v_is_on_holiday;
END;
$$;


--
-- Name: log_balance_stock_reduction(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_balance_stock_reduction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.balance_qty < OLD.balance_qty THEN
        INSERT INTO stock_history (
            product_id,
            product_name,
            previous_qty,
            current_qty,
            change_qty,
            change_type,
            source,
            notes,
            hsn_code,
            units
        ) VALUES (
            NEW.product_id,
            NEW.product_name,
            OLD.balance_qty,
            NEW.balance_qty,
            OLD.balance_qty - NEW.balance_qty,
            'reduction',
            'balance_stock_update',
            'Stock reduced from ' || OLD.balance_qty || ' to ' || NEW.balance_qty,
            NEW.hsn_code,
            NEW.units
        );
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: log_inventory_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_inventory_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insert a record into the transaction log for each balance change
    INSERT INTO inventory_transactions (
        product_name,
        hsn_code,
        units,
        change_type,
        source,
        reference_id,
        quantity_change,
        quantity_after_change
    ) VALUES (
        NEW.product_name,
        NEW.hsn_code,
        NEW.units,
        CASE 
            WHEN NEW.balance_quantity > OLD.balance_quantity THEN 'addition'
            ELSE 'reduction'
        END,
        'inventory_update',
        '-',
        ABS(NEW.balance_quantity - OLD.balance_quantity),
        NEW.balance_quantity
    );
    
    RETURN NEW;
END;
$$;


--
-- Name: log_new_inventory(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_new_inventory() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insert a record into the transaction log for new items
    INSERT INTO inventory_transactions (
        product_name,
        hsn_code,
        units,
        change_type,
        source,
        reference_id,
        quantity_change,
        quantity_after_change
    ) VALUES (
        NEW.product_name,
        NEW.hsn_code,
        NEW.units,
        'addition',
        'inventory_update',
        '-',
        NEW.balance_quantity,
        NEW.balance_quantity
    );
    
    RETURN NEW;
END;
$$;


--
-- Name: log_purchase_addition(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_purchase_addition() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  product_id_val TEXT;
  product_name_val TEXT;
  hsn_code_val TEXT;
  units_val TEXT;
  stock_after_update INTEGER; -- Renamed for clarity
  -- reference_id_val TEXT; -- Use COALESCE inline instead
BEGIN
  -- Fetch product details AND the stock quantity *after* it should have been updated
  SELECT p.id, p.name, p.hsn_code, p.units, p.stock_quantity
  INTO product_id_val, product_name_val, hsn_code_val, units_val, stock_after_update
  FROM products p -- Adjust table name if needed
  WHERE p.id = NEW.product_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE WARNING 'Product with ID % not found in products table for purchase logging.', NEW.product_id;
    RETURN NEW;
  END IF;

  -- Insert into stock_history
  INSERT INTO stock_history (
    product_id,
    product_name,
    -- previous_qty, -- Can calculate if needed, but focus on stock_after
    stock_after,  -- Populate the correct column
    change_qty,
    change_type,
    source,
    reference_id, -- Use COALESCE to handle NULL invoice_no
    notes,
    hsn_code,
    units,
    date
  ) VALUES (
    product_id_val,
    product_name_val,
    -- stock_after_update - NEW.qty, -- Previous stock calculation
    stock_after_update, -- Use the fetched stock quantity AFTER update
    NEW.qty,
    'addition',
    'Purchase',
    COALESCE(NEW.invoice_no, NEW.id::text), -- Use invoice_no, fallback to purchase id
    'Stock added via purchase',
    hsn_code_val,
    units_val,
    NEW.date::timestamptz
  );

  RETURN NEW;
END;
$$;


--
-- Name: log_remaining_stock_changes(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_remaining_stock_changes() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RAISE NOTICE 'remaining_stock changed: OLD = %, NEW = %', OLD.remaining_stock, NEW.remaining_stock;
    RETURN NEW;
END;
$$;


--
-- Name: log_sales_reduction(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_sales_reduction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  product_id_val TEXT;
  current_qty_val INTEGER;
  previous_qty_val INTEGER;
BEGIN
  -- Get product information from product_master
  SELECT id, stock_quantity INTO product_id_val, current_qty_val
  FROM product_master 
  WHERE name = NEW.product_name
  LIMIT 1;
  
  -- Calculate previous quantity
  previous_qty_val := current_qty_val + NEW.qty;
  
  -- Insert into stock_history
  INSERT INTO stock_history (
    product_id,
    product_name,
    previous_qty,
    current_qty,
    change_qty,
    change_type,
    source,
    reference_id,
    notes,
    hsn_code,
    units
  ) VALUES (
    product_id_val,
    NEW.product_name,
    previous_qty_val,
    current_qty_val,
    NEW.qty,
    'reduction',
    'sale',
    NEW.invoice_no,
    'Stock reduction from sale',
    NEW.hsn_code,
    NEW.units
  );
  
  RETURN NEW;
END;
$$;


--
-- Name: log_stock_change_from_product_master(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_stock_change_from_product_master() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  v_reason TEXT;
  v_source TEXT := 'inventory_update';
  v_source_type TEXT := 'manual';
  v_display_type TEXT := CASE
    WHEN NEW.stock_quantity > OLD.stock_quantity THEN 'addition'
    ELSE 'reduction'
  END;
BEGIN
  IF NEW.stock_quantity IS DISTINCT FROM OLD.stock_quantity THEN
    IF NEW.stock_quantity > OLD.stock_quantity THEN
      v_reason := 'Stock increased manually (purchase or stock update)';
    ELSE
      v_reason := 'Stock reduced (manual adjustment or untracked POS)';
    END IF;

    INSERT INTO product_stock_transactions (
      id,
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      notes,
      created_at,
      display_type,
      source_type,
      source,
      duplicate_protection_key
    ) VALUES (
      gen_random_uuid(),
      NEW.id,
      v_display_type,
      ABS(NEW.stock_quantity - OLD.stock_quantity),
      OLD.stock_quantity,
      NEW.stock_quantity,
      v_reason,
      NOW(),
      v_display_type,
      v_source_type,
      v_source,
      NEW.id || '_' || OLD.stock_quantity || '_' || NEW.stock_quantity || '_' || FLOOR(RANDOM()*100000)
    );
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: log_stock_increase(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_stock_increase() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_previous_stock INTEGER;
    v_new_stock INTEGER;
    v_transaction_type TEXT := 'addition';
    v_source_type TEXT := 'system';
    v_source TEXT;
    v_display_type TEXT := 'addition';
    v_duplicate_key TEXT;
    v_order_type TEXT;
    v_order_restoring BOOLEAN := false;
    v_is_manual_purchase BOOLEAN := false;
    v_pos_order_id UUID;
    v_product_name TEXT;
BEGIN
    -- Get old and new stock values
    v_previous_stock := OLD.stock_quantity;
    v_new_stock := NEW.stock_quantity;

    -- Only proceed if stock increased
    IF v_new_stock <= v_previous_stock THEN
        RETURN NEW;
    END IF;

    -- Debug: Log stock change details
    RAISE NOTICE 'Stock increase - Product ID: %, Previous Stock: %, New Stock: %', NEW.id, v_previous_stock, v_new_stock;

    -- Fetch the product name from product_master
    SELECT name INTO v_product_name
    FROM product_master
    WHERE id = NEW.id;

    RAISE NOTICE 'Product Name from product_master: %', v_product_name;

    -- Detect restoration context
    BEGIN
        v_order_restoring := current_setting('myapp.is_restoration', true)::BOOLEAN;
        v_order_type := current_setting('myapp.restore_order_type', true);
        RAISE NOTICE 'Restoration - is_restoration: %, restore_order_type: %', v_order_restoring, v_order_type;
    EXCEPTION WHEN OTHERS THEN
        v_order_restoring := false;
        v_order_type := NULL;
    END;

    -- Detect if inserted from inventory_purchases within last 2 mins
    SELECT EXISTS (
        SELECT 1 FROM inventory_purchases
        WHERE product_id = NEW.id
          AND created_at > now() - INTERVAL '2 minutes'
        LIMIT 1
    ) INTO v_is_manual_purchase;

    -- Determine transaction details
    IF v_order_restoring THEN
        -- Fetch the order being restored using product name and stock_snapshot
        SELECT id INTO v_pos_order_id
        FROM pos_orders
        WHERE (
            services @> jsonb_build_array(jsonb_build_object('name', v_product_name))
            OR
            services @> jsonb_build_array(jsonb_build_object('product_name', v_product_name))
        )
          AND stock_snapshot ? NEW.id::text
          AND created_at > now() - INTERVAL '3 hours'
        ORDER BY created_at DESC
        LIMIT 1;

        RAISE NOTICE 'Restoration - Found pos_order_id: %', v_pos_order_id;

        IF v_order_type = 'sale' THEN
            v_source := 'pos_restore';
        ELSIF v_order_type = 'salon_consumption' THEN
            v_source := 'restore_salon_consumption';
        ELSE
            v_source := 'unknown_restore';
            v_pos_order_id := NULL;
        END IF;
    ELSIF v_is_manual_purchase THEN
        v_source := 'manual_purchase';
        v_pos_order_id := NULL;
    ELSE
        v_source := 'pos_restore';
        -- For non-restoration pos_restore, try to find a related order
        SELECT id INTO v_pos_order_id
        FROM pos_orders
        WHERE (
            services @> jsonb_build_array(jsonb_build_object('name', v_product_name))
            OR
            services @> jsonb_build_array(jsonb_build_object('product_name', v_product_name))
        )
          AND stock_snapshot ? NEW.id::text
          AND created_at > now() - INTERVAL '3 hours'
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    -- Generate duplicate protection key
    v_duplicate_key := NEW.id || '_' || v_previous_stock || '_' || v_new_stock || '_' || EXTRACT(EPOCH FROM now());

    -- Insert log
    INSERT INTO product_stock_transactions (
        id,
        product_id,
        transaction_type,
        quantity,
        previous_stock,
        new_stock,
        order_id,
        notes,
        created_at,
        created_by,
        display_type,
        source_type,
        source,
        duplicate_protection_key,
        created_at_tz
    )
    VALUES (
        gen_random_uuid(),
        NEW.id,
        v_transaction_type,
        ABS(v_new_stock - v_previous_stock),
        v_previous_stock,
        v_new_stock,
        v_pos_order_id,
        CASE
            WHEN v_source = 'pos_restore' THEN 'Stock restored via POS'
            ELSE 'Stock added via ' || v_source
        END,
        now(),
        NULL,
        v_display_type,
        v_source_type,
        v_source,
        v_duplicate_key,
        NULL
    );

    RETURN NEW;
END;
$$;


--
-- Name: log_stock_reduction(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.log_stock_reduction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_previous_stock INTEGER;
    v_new_stock INTEGER;
    v_transaction_type TEXT := 'reduction';
    v_source_type TEXT := 'system';
    v_source TEXT;
    v_display_type TEXT := 'reduction';
    v_duplicate_key TEXT;
    v_order_type TEXT;
    v_order_restoring BOOLEAN := false;
    v_pos_order_type TEXT;
    v_pos_order_id UUID;
    v_product_name TEXT;
    v_current_order_id UUID;
    v_current_order_type TEXT;
    v_found_order_created_at TIMESTAMP;
BEGIN
    v_previous_stock := OLD.stock_quantity;
    v_new_stock := NEW.stock_quantity;

    IF v_new_stock >= v_previous_stock THEN
        RETURN NEW;
    END IF;

    RAISE NOTICE 'Stock reduction - Product ID: %, Previous Stock: %, New Stock: %', NEW.id, v_previous_stock, v_new_stock;

    SELECT name INTO v_product_name
    FROM product_master
    WHERE id = NEW.id;

    RAISE NOTICE 'Product Name from product_master: %', v_product_name;

    BEGIN
        v_order_restoring := current_setting('myapp.is_restoration', true)::BOOLEAN;
        v_order_type := current_setting('myapp.restore_order_type', true);
        RAISE NOTICE 'Restoration - is_restoration: %, restore_order_type: %', v_order_restoring, v_order_type;
    EXCEPTION WHEN OTHERS THEN
        v_order_restoring := false;
        v_order_type := NULL;
    END;

    BEGIN
        v_current_order_id := current_setting('myapp.current_order_id', true)::UUID;
        RAISE NOTICE 'Current Order ID from context: %', v_current_order_id;
    EXCEPTION WHEN OTHERS THEN
        v_current_order_id := NULL;
        RAISE NOTICE 'Current Order ID not set or invalid';
    END;

    BEGIN
        v_current_order_type := current_setting('myapp.current_order_type', true);
        RAISE NOTICE 'Current Order Type from context: %', v_current_order_type;
    EXCEPTION WHEN OTHERS THEN
        v_current_order_type := NULL;
        RAISE NOTICE 'Current Order Type not set';
    END;

    IF v_order_restoring THEN
        SELECT id, type INTO v_pos_order_id, v_pos_order_type
        FROM pos_orders
        WHERE (
            services @> jsonb_build_array(jsonb_build_object('id', NEW.id::text))
            OR services @> jsonb_build_array(jsonb_build_object('product_id', NEW.id::text))
            OR services @> jsonb_build_array(jsonb_build_object('name', v_product_name))
            OR services @> jsonb_build_array(jsonb_build_object('product_name', v_product_name))
            OR services @> jsonb_build_array(jsonb_build_object('name', lower(v_product_name)))
            OR services @> jsonb_build_array(jsonb_build_object('product_name', lower(v_product_name)))
        )
          AND created_at > now() - INTERVAL '3 hours'
        ORDER BY created_at DESC
        LIMIT 1;

        RAISE NOTICE 'Restoration - Found pos_order_id: %, pos_order_type: %', v_pos_order_id, v_pos_order_type;
        RAISE NOTICE 'Services JSONB content: %', (SELECT services FROM pos_orders WHERE id = v_pos_order_id);

        IF v_order_type = 'sale' THEN
            v_source := 'restore_pos_sale';
        ELSIF v_order_type = 'salon_consumption' THEN
            v_source := 'restore_salon_consumption';
        ELSE
            v_source := NULL;
            v_pos_order_id := NULL;
            RAISE NOTICE 'No valid restoration order type found';
        END IF;
    ELSE
        IF v_current_order_id IS NOT NULL THEN
            SELECT type, id, created_at INTO v_pos_order_type, v_pos_order_id, v_found_order_created_at
            FROM pos_orders
            WHERE id = v_current_order_id
              AND (
                  services @> jsonb_build_array(jsonb_build_object('id', NEW.id::text))
                  OR services @> jsonb_build_array(jsonb_build_object('product_id', NEW.id::text))
                  OR services @> jsonb_build_array(jsonb_build_object('name', v_product_name))
                  OR services @> jsonb_build_array(jsonb_build_object('product_name', v_product_name))
                  OR services @> jsonb_build_array(jsonb_build_object('name', lower(v_product_name)))
                  OR services @> jsonb_build_array(jsonb_build_object('product_name', lower(v_product_name)))
              )
            LIMIT 1;

            RAISE NOTICE 'Using current_order_id - Found pos_order_type: %, pos_order_id: %, created_at: %', v_pos_order_type, v_pos_order_id, v_found_order_created_at;
            RAISE NOTICE 'Services JSONB content: %', (SELECT services FROM pos_orders WHERE id = v_current_order_id);
        END IF;

        IF v_pos_order_id IS NULL THEN
            SELECT type, id, created_at INTO v_pos_order_type, v_pos_order_id, v_found_order_created_at
            FROM pos_orders
            WHERE (
                services @> jsonb_build_array(jsonb_build_object('id', NEW.id::text))
                OR services @> jsonb_build_array(jsonb_build_object('product_id', NEW.id::text))
                OR services @> jsonb_build_array(jsonb_build_object('name', v_product_name))
                OR services @> jsonb_build_array(jsonb_build_object('product_name', v_product_name))
                OR services @> jsonb_build_array(jsonb_build_object('name', lower(v_product_name)))
                OR services @> jsonb_build_array(jsonb_build_object('product_name', lower(v_product_name)))
            )
              AND created_at > now() - INTERVAL '1 minute'
            ORDER BY created_at DESC
            LIMIT 1;

            RAISE NOTICE 'Fallback - Found pos_order_type: %, pos_order_id: %, created_at: %', v_pos_order_type, v_pos_order_id, v_found_order_created_at;
            RAISE NOTICE 'Services JSONB content: %', (SELECT services FROM pos_orders WHERE id = v_pos_order_id);
        END IF;

        IF v_pos_order_type IS NULL AND v_current_order_type IS NOT NULL THEN
            v_pos_order_type := v_current_order_type;
            RAISE NOTICE 'Using current_order_type as fallback: %', v_pos_order_type;
        END IF;

        IF v_pos_order_type = 'sale' THEN
            v_source := 'pos_sale';
        ELSIF v_pos_order_type = 'salon_consumption' THEN
            v_source := 'pos_salon_consumption';
        ELSE
            v_source := 'manual_reduction';
            v_pos_order_id := NULL;
            RAISE NOTICE 'No matching order found; defaulting to manual_reduction';
        END IF;
    END IF;

    v_duplicate_key := NEW.id || '_' || v_previous_stock || '_' || v_new_stock || '_' || EXTRACT(EPOCH FROM now());

    INSERT INTO product_stock_transactions (
        id,
        product_id,
        transaction_type,
        quantity,
        previous_stock,
        new_stock,
        order_id,
        notes,
        created_at,
        created_by,
        display_type,
        source_type,
        source,
        duplicate_protection_key,
        created_at_tz
    )
    VALUES (
        gen_random_uuid(),
        NEW.id,
        v_transaction_type,
        ABS(v_new_stock - v_previous_stock),
        v_previous_stock,
        v_new_stock,
        v_pos_order_id,
        'Stock reduced via ' || COALESCE(v_source, 'manual_reduction'),
        now(),
        NULL,
        v_display_type,
        v_source_type,
        v_source,
        v_duplicate_key,
        NULL
    );

    RETURN NEW;
END;
$$;


--
-- Name: monitor_product_stock_transaction(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.monitor_product_stock_transaction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Example action: Log the inserted transaction to console
  RAISE NOTICE 'Stock % of quantity % for product % (from % to %)',
    NEW.transaction_type, NEW.quantity, NEW.product_id, NEW.previous_stock, NEW.new_stock;

  -- Example: Sync with external table or audit log
  -- INSERT INTO product_stock_audit (product_id, change_type, ...)
  -- VALUES (NEW.product_id, NEW.transaction_type, ...);

  RETURN NEW;
END;
$$;


--
-- Name: order_has_products(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.order_has_products(order_data jsonb) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if the order has any services with type 'product'
  RETURN EXISTS (
    SELECT 1 FROM jsonb_array_elements(
      CASE 
        WHEN order_data->>'services' IS NOT NULL THEN
          order_data->'services'
        ELSE
          '[]'::jsonb
      END
    ) AS service
    WHERE service->>'type' = 'product'
  );
END;
$$;


--
-- Name: prevent_remaining_stock_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_remaining_stock_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    RAISE NOTICE 'Trigger fired: OLD.remaining_stock = %, NEW.remaining_stock = %', OLD.remaining_stock, NEW.remaining_stock;
    IF NEW.remaining_stock IS DISTINCT FROM OLD.remaining_stock THEN
        RAISE EXCEPTION 'Updates to remaining_stock column are not allowed.';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: process_pos_order_with_duplicates(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.process_pos_order_with_duplicates() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
  service jsonb;
  product_id_text TEXT;
  product_id UUID;
  product_name TEXT;
  current_stock INTEGER;
  new_stock INTEGER;
  quantity INTEGER;
  total_quantity INTEGER;
  product_quantities JSONB := '{}'::JSONB;
BEGIN
  -- Skip if this isn't a sale or salon_consumption insertion
  IF TG_OP != 'INSERT' OR (NEW.type != 'sale' AND NEW.type != 'salon_consumption') THEN
    RETURN NEW;
  END IF;
  
  RAISE NOTICE 'Processing order % with % services', NEW.id, jsonb_array_length(NEW.services);

  -- First pass: Aggregate product quantities
  FOR service IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    IF service->>'type' = 'product' THEN
      product_id_text := service->>'product_id';
      IF product_id_text IS NULL THEN
        product_id_text := service->>'service_id';
      END IF;

      IF product_id_text IS NULL THEN
        CONTINUE;
      END IF;

      quantity := 1;
      IF service ? 'quantity' AND service->>'quantity' ~ '^[0-9]+$' THEN
        quantity := (service->>'quantity')::INTEGER;
      END IF;

      IF product_quantities ? product_id_text THEN
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id_text],
          to_jsonb((product_quantities->>product_id_text)::INTEGER + quantity)
        );
      ELSE
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id_text],
          to_jsonb(quantity)
        );
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE 'Aggregated product quantities: %', product_quantities;

  -- Second pass: Update stock based on unique product entries
  FOR product_id_text IN SELECT * FROM jsonb_object_keys(product_quantities)
  LOOP
    product_id := product_id_text::UUID;

    SELECT name, stock_quantity INTO product_name, current_stock
    FROM product_master
    WHERE id = product_id;

    IF product_name IS NULL THEN
      RAISE NOTICE 'Product with ID % not found, skipping', product_id;
      CONTINUE;
    END IF;

    total_quantity := (product_quantities->>product_id_text)::INTEGER;
    IF total_quantity < 1 THEN
      total_quantity := 1;
    END IF;

    RAISE NOTICE 'Processing product % (ID: %): deducting % units from stock of %', 
      product_name, product_id, total_quantity, current_stock;

    new_stock := GREATEST(0, current_stock - total_quantity);

    UPDATE product_master
    SET stock_quantity = new_stock,
        updated_at = NOW()
    WHERE id = product_id;

    INSERT INTO product_stock_transactions (
      id,
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      order_id,
      notes,
      display_type,
      source_type,
      source,
      duplicate_protection_key
    ) VALUES (
      gen_random_uuid(),
      product_id,
      'reduction',
      total_quantity,
      current_stock,
      new_stock,
      NEW.id,
      format('GROUPED: Stock reduced by %s units from %s entries', 
             total_quantity, total_quantity),
      CASE WHEN NEW.type = 'sale' THEN 'sale' ELSE 'salon_consumption' END,
      'order',
      CASE WHEN NEW.type = 'sale' THEN 'pos_sale' ELSE 'pos_salon_consumption' END,
      NEW.id || '_' || product_id || '_grouped_' || now()
    );

    RAISE NOTICE 'Updated stock for %: % -> % (deducted %)', 
      product_name, current_stock, new_stock, total_quantity;
  END LOOP;

  RETURN NEW;
END;
$_$;


--
-- Name: record_inventory_transaction(text, text, text, text, numeric, numeric, text, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_inventory_transaction(p_product_name text, p_hsn_code text, p_units text, p_change_type text, p_quantity_change numeric, p_current_balance numeric, p_source text DEFAULT 'inventory_update'::text, p_reference_id text DEFAULT '-'::text) RETURNS uuid
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_id UUID;
    new_balance NUMERIC;
BEGIN
    -- Calculate the new balance
    IF p_change_type = 'addition' THEN
        new_balance := p_current_balance + p_quantity_change;
    ELSE
        new_balance := p_current_balance - p_quantity_change;
    END IF;

    -- Record the transaction
    INSERT INTO balance_stock_history (
        product_name,
        hsn_code,
        units,
        change_type,
        source,
        reference_id,
        quantity_change,
        quantity_after_change
    ) VALUES (
        p_product_name,
        p_hsn_code,
        p_units,
        p_change_type,
        p_source,
        p_reference_id,
        p_quantity_change,
        new_balance
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$;


--
-- Name: record_order_item_stock_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_order_item_stock_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  product_record RECORD;
  current_stock INTEGER;
  new_stock INTEGER;
  order_type VARCHAR;
  is_salon_consumption BOOLEAN;
BEGIN
  -- Only process INSERTs
  IF TG_OP = 'INSERT' THEN
    -- Check if this is a salon consumption order
    SELECT type = 'salon_consumption' INTO is_salon_consumption
    FROM pos_orders
    WHERE id = NEW.order_id;
    
    -- Skip if this is a salon consumption order (handled by update_product_stock_after_consumption)
    IF is_salon_consumption THEN
      RETURN NEW;
    END IF;
    
    -- Get the product information
    SELECT * INTO product_record
    FROM product_master
    WHERE id = NEW.product_id;
    
    IF FOUND THEN
      -- Calculate stock change
      current_stock := product_record.stock_quantity;
      new_stock := GREATEST(0, current_stock - NEW.quantity);
      
      -- Get order type
      SELECT get_transaction_type_from_order(NEW.order_id) INTO order_type;
      
      -- Record the transaction
      INSERT INTO product_stock_transactions (
        product_id,
        transaction_type,
        display_type,
        source_type,
        quantity,
        previous_stock,
        new_stock,
        order_id,
        notes,
        source,
        duplicate_protection_key
      ) VALUES (
        NEW.product_id,
        'reduction',
        order_type,
        'order',
        NEW.quantity,
        current_stock,
        new_stock,
        NEW.order_id,
        'Stock reduction from order item',
        'pos_order',
        NEW.order_id || '_' || NEW.product_id || '_' || NEW.quantity
      )
      ON CONFLICT (duplicate_protection_key) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If any error occurs, log it but don't fail the insert
  RAISE NOTICE 'Error recording order stock transaction: %', SQLERRM;
  RETURN NEW;
END;
$$;


--
-- Name: record_pos_order_stock_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_pos_order_stock_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  product_quantities JSONB = '{}';
  item JSONB;
  product_id UUID;
  quantity INTEGER;
  product_name TEXT;
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Skip if this isn't a sale or insertion
  IF TG_OP != 'INSERT' OR (NEW.type != 'sale' AND NEW.type != 'salon_consumption') THEN
    RETURN NEW;
  END IF;
  
  -- First pass: aggregate quantities by product
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    -- Handle products in the services array
    IF (item->>'type') = 'product' THEN
      product_id := (item->>'id')::UUID;
      product_name := item->>'name';
      quantity := COALESCE((item->>'quantity')::INTEGER, 1);
      
      -- Add to aggregated quantities
      IF product_quantities ? product_id::TEXT THEN
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id::TEXT],
          to_jsonb((product_quantities->>product_id::TEXT)::INTEGER + quantity)
        );
      ELSE
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id::TEXT],
          to_jsonb(quantity)
        );
      END IF;
    END IF;
  END LOOP;

  -- Second pass: process each product once with aggregated quantity
  FOR product_id IN SELECT * FROM jsonb_object_keys(product_quantities)
  LOOP
    -- Get current stock
    SELECT stock_quantity, name INTO current_stock, product_name
    FROM product_master
    WHERE id = product_id::UUID;
    
    -- Calculate total quantity for this product
    quantity := (product_quantities->>product_id)::INTEGER;
    
    -- Ensure correct quantity is deducted (fix for issue #2)
    new_stock := GREATEST(0, current_stock - quantity);
    
    -- Update the stock (ensure ALL units are deducted)
    UPDATE product_master
    SET stock_quantity = new_stock
    WHERE id = product_id::UUID;
    
    -- Log a SINGLE transaction for the product (fix for issue #1)
    INSERT INTO product_stock_transactions (
      id,
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      order_id,
      notes,
      display_type,
      source_type,
      source,
      duplicate_protection_key
    ) VALUES (
      gen_random_uuid(),
      product_id::UUID,
      'reduction',
      quantity,
      current_stock,
      new_stock,
      NEW.id,
      format('Stock reduced by %s units via %s', quantity, NEW.type),
      CASE WHEN NEW.type = 'sale' THEN 'sale' ELSE 'salon_consumption' END,
      'order',
      CASE WHEN NEW.type = 'sale' THEN 'pos_sale' ELSE 'pos_salon_consumption' END,
      NEW.id || '_' || product_id || '_consolidated_' || now()
    );
    
    -- Save the stock snapshot in the order for future reference
    IF NEW.stock_snapshot IS NULL THEN
      NEW.stock_snapshot := '{}'::JSONB;
    END IF;
    
    NEW.stock_snapshot := jsonb_set(
      NEW.stock_snapshot,
      ARRAY[product_id],
      jsonb_build_object(
        'before', current_stock,
        'after', new_stock,
        'change', -quantity,
        'name', product_name
      )
    );
  END LOOP;
  
  -- Update the order with the stock snapshot
  UPDATE pos_orders
  SET stock_snapshot = NEW.stock_snapshot
  WHERE id = NEW.id;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in record_pos_order_stock_change: %', SQLERRM;
  RETURN NEW;
END;
$$;


--
-- Name: record_pos_order_stock_change_debug(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_pos_order_stock_change_debug() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  product_quantities JSONB = '{}';
  item JSONB;
  product_id UUID;
  quantity INTEGER;
  product_name TEXT;
  current_stock INTEGER;
  new_stock INTEGER;
  actual_deduction INTEGER;
  debug_id INTEGER;
BEGIN
  -- Skip if this isn't a sale or insertion
  IF TG_OP != 'INSERT' OR (NEW.type != 'sale' AND NEW.type != 'salon_consumption') THEN
    RETURN NEW;
  END IF;
  
  -- DEBUG: Log the start of processing for this order
  INSERT INTO stock_deduction_debug_log (order_id, notes, services_json) 
  VALUES (NEW.id, 'Started processing order', NEW.services::TEXT)
  RETURNING id INTO debug_id;
  
  -- First pass: aggregate quantities by product
  FOR item IN SELECT * FROM jsonb_array_elements(NEW.services)
  LOOP
    -- Handle products in the services array
    IF (item->>'type') = 'product' THEN
      product_id := (item->>'id')::UUID;
      product_name := item->>'name';
      
      -- CRITICAL FIX: Ensure we extract quantity correctly
      BEGIN
        -- Try different fields that might contain quantity
        IF item ? 'quantity' AND (item->>'quantity') IS NOT NULL AND (item->>'quantity') != '' THEN
          quantity := (item->>'quantity')::INTEGER;
        ELSIF item ? 'qty' AND (item->>'qty') IS NOT NULL AND (item->>'qty') != '' THEN
          quantity := (item->>'qty')::INTEGER;
        ELSE
          quantity := 1; -- Default to 1 if no quantity found
        END IF;
        
        -- DEBUG: Log the extracted product and quantity
        INSERT INTO stock_deduction_debug_log (
          order_id, product_id, product_name, requested_quantity, notes
        ) VALUES (
          NEW.id, product_id, product_name, quantity, 
          format('Extracted from services: %s with qty %s', product_name, quantity)
        );
      EXCEPTION WHEN OTHERS THEN
        -- If any error in parsing quantity, default to 1
        quantity := 1;
        
        INSERT INTO stock_deduction_debug_log (
          order_id, product_id, product_name, notes
        ) VALUES (
          NEW.id, product_id, product_name, 
          format('ERROR parsing quantity for %s: %s, defaulting to 1', product_name, SQLERRM)
        );
      END;
      
      -- Add to aggregated quantities
      IF product_quantities ? product_id::TEXT THEN
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id::TEXT],
          to_jsonb((product_quantities->>product_id::TEXT)::INTEGER + quantity)
        );
      ELSE
        product_quantities := jsonb_set(
          product_quantities,
          ARRAY[product_id::TEXT],
          to_jsonb(quantity)
        );
      END IF;
    END IF;
  END LOOP;

  -- Second pass: process each product once with aggregated quantity
  FOR product_id IN SELECT * FROM jsonb_object_keys(product_quantities)
  LOOP
    -- Get current stock
    SELECT stock_quantity, name INTO current_stock, product_name
    FROM product_master
    WHERE id = product_id::UUID;
    
    IF current_stock IS NULL THEN
      -- Handle case where product is not found
      INSERT INTO stock_deduction_debug_log (
        order_id, product_id, notes
      ) VALUES (
        NEW.id, product_id::UUID, 'ERROR: Product not found in product_master'
      );
      CONTINUE;
    END IF;
    
    -- Calculate total quantity for this product
    quantity := (product_quantities->>product_id)::INTEGER;
    
    -- CRITICAL FIX: Force exact deduction
    IF quantity <= 0 THEN 
      -- Skip if quantity is zero or negative
      INSERT INTO stock_deduction_debug_log (
        order_id, product_id, product_name, requested_quantity, notes
      ) VALUES (
        NEW.id, product_id::UUID, product_name, quantity, 'Skipped due to zero/negative quantity'
      );
      CONTINUE;
    END IF;
    
    -- Calculate new stock with floor of 0
    new_stock := GREATEST(0, current_stock - quantity);
    actual_deduction := current_stock - new_stock;
    
    -- DIRECT UPDATE: Ensure exact deduction by directly setting the new value
    UPDATE product_master
    SET 
      stock_quantity = new_stock,
      updated_at = NOW()
    WHERE id = product_id::UUID;
    
    -- DEBUG: Log what actually happened with the stock update
    INSERT INTO stock_deduction_debug_log (
      order_id, product_id, product_name, requested_quantity, 
      previous_stock, new_stock, actual_deduction, notes
    ) VALUES (
      NEW.id, product_id::UUID, product_name, quantity,
      current_stock, new_stock, actual_deduction,
      format('Updated stock for %s: %s -> %s (deducted %s of requested %s)', 
             product_name, current_stock, new_stock, actual_deduction, quantity)
    );
    
    -- Log a SINGLE transaction for the product (fix for issue #1)
    INSERT INTO product_stock_transactions (
      id,
      product_id,
      transaction_type,
      quantity,
      previous_stock,
      new_stock,
      order_id,
      notes,
      display_type,
      source_type,
      source,
      duplicate_protection_key
    ) VALUES (
      gen_random_uuid(),
      product_id::UUID,
      'reduction',
      actual_deduction, -- Use the actual amount deducted
      current_stock,
      new_stock,
      NEW.id,
      format('EXACT: Stock reduced by %s units via %s', actual_deduction, NEW.type),
      CASE WHEN NEW.type = 'sale' THEN 'sale' ELSE 'salon_consumption' END,
      'order',
      CASE WHEN NEW.type = 'sale' THEN 'pos_sale' ELSE 'pos_salon_consumption' END,
      NEW.id || '_' || product_id || '_exact_' || now()
    );
    
    -- Save the stock snapshot in the order for future reference
    IF NEW.stock_snapshot IS NULL THEN
      NEW.stock_snapshot := '{}'::JSONB;
    END IF;
    
    NEW.stock_snapshot := jsonb_set(
      NEW.stock_snapshot,
      ARRAY[product_id],
      jsonb_build_object(
        'before', current_stock,
        'after', new_stock,
        'change', -actual_deduction,
        'requested', quantity,
        'name', product_name
      )
    );
  END LOOP;
  
  -- Update the order with the stock snapshot
  UPDATE pos_orders
  SET 
    stock_snapshot = NEW.stock_snapshot,
    updated_at = NOW()
  WHERE id = NEW.id;
  
  -- DEBUG: Log completion of processing
  INSERT INTO stock_deduction_debug_log (
    order_id, notes
  ) VALUES (
    NEW.id, 'Completed processing order'
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log any errors that occur during processing
  INSERT INTO stock_deduction_debug_log (
    order_id, notes
  ) VALUES (
    NEW.id, 'ERROR in record_pos_order_stock_change_debug: ' || SQLERRM
  );
  RETURN NEW;
END;
$$;


--
-- Name: record_product_stock_on_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_product_stock_on_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  transaction_id UUID;
  duplicate_protection_key TEXT;
BEGIN
  IF NEW.stock_quantity IS NULL OR NEW.stock_quantity = 0 THEN
    RETURN NEW;
  END IF;

  transaction_id := uuid_generate_v4();
  duplicate_protection_key := NEW.id || '_0_' || NEW.stock_quantity || '_' || extract(epoch from now())::integer;

  INSERT INTO product_stock_transactions (
    id, product_id, transaction_type, quantity,
    previous_stock, new_stock, order_id, notes,
    created_at, created_by, display_type, source_type,
    source, duplicate_protection_key, created_at_tz
  ) VALUES (
    transaction_id, NEW.id, 'addition', NEW.stock_quantity,
    0, NEW.stock_quantity, NULL, 'Initial stock on product insert',
    NOW(), NULL, 'addition', 'system', 'product_insert',
    duplicate_protection_key, NULL
  );

  RETURN NEW;
END;
$$;


--
-- Name: record_product_stock_transaction(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_product_stock_transaction() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  transaction_id UUID;
  duplicate_protection_key TEXT;
BEGIN
  -- Generate a unique ID for the transaction
  transaction_id := uuid_generate_v4();

  -- Generate a unique key to prevent duplicate logs
  duplicate_protection_key := 
    NEW.id || '_' || OLD.stock_quantity || '_' || NEW.stock_quantity || '_' || extract(epoch from now())::integer;

  -- Insert record only when stock quantity changes
  IF NEW.stock_quantity > OLD.stock_quantity THEN
    -- Stock increased
    INSERT INTO product_stock_transactions (
      id, product_id, transaction_type, quantity,
      previous_stock, new_stock, order_id, notes,
      created_at, display_type, source_type, source,
      duplicate_protection_key
    ) VALUES (
      transaction_id,
      NEW.id,
      'addition',
      NEW.stock_quantity - OLD.stock_quantity,
      OLD.stock_quantity,
      NEW.stock_quantity,
      NULL,
      'Stock increased via trigger',
      NOW(),
      'addition',
      'system',
      'database_trigger',
      duplicate_protection_key
    );

  ELSIF NEW.stock_quantity < OLD.stock_quantity THEN
    -- Stock decreased
    INSERT INTO product_stock_transactions (
      id, product_id, transaction_type, quantity,
      previous_stock, new_stock, order_id, notes,
      created_at, display_type, source_type, source,
      duplicate_protection_key
    ) VALUES (
      transaction_id,
      NEW.id,
      'reduction',
      OLD.stock_quantity - NEW.stock_quantity,
      OLD.stock_quantity,
      NEW.stock_quantity,
      NULL,
      'Stock reduced via trigger',
      NOW(),
      'reduction',
      'system',
      'database_trigger',
      duplicate_protection_key
    );
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: record_purchase_stock_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_purchase_stock_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  current_stock INTEGER;
  new_stock INTEGER;
  tr_id UUID;
BEGIN
  -- Only process INSERTs
  IF TG_OP = 'INSERT' THEN
    -- Get the current stock
    SELECT stock_quantity INTO current_stock
    FROM product_master
    WHERE id = NEW.product_id;
    
    IF current_stock IS NULL THEN
      current_stock := 0;
    END IF;
    
    -- Calculate new stock
    new_stock := current_stock + NEW.quantity;
    
    -- Update product stock
    UPDATE product_master
    SET stock_quantity = new_stock
    WHERE id = NEW.product_id;
    
    -- Record the transaction with duplicate protection
    INSERT INTO product_stock_transactions (
      product_id,
      transaction_type,
      display_type,
      source_type,
      quantity,
      previous_stock,
      new_stock,
      notes,
      source,
      duplicate_protection_key
    ) VALUES (
      NEW.product_id,
      'addition',
      'addition',
      'purchase',
      NEW.quantity,
      current_stock,
      new_stock,
      'Stock addition from purchase',
      'purchase_history',
      NEW.product_id || '_purchase_' || NEW.quantity || '_' || 
        EXTRACT(EPOCH FROM NOW())::integer / 60 -- Minutely protection key
    )
    ON CONFLICT DO NOTHING
    RETURNING id INTO tr_id; -- Just for logging
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If any error occurs, log it but don't fail the insert
  RAISE NOTICE 'Error recording purchase stock transaction: %', SQLERRM;
  RETURN NEW;
END;
$$;


--
-- Name: record_stock_transactions_after_order(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.record_stock_transactions_after_order() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_product_id UUID;
    v_quantity INTEGER;
    v_current_stock INTEGER;
    v_product_name TEXT;
    v_found_product_id UUID;
BEGIN
    -- Only process salon_consumption type
    IF NEW.type != 'salon_consumption' THEN
        RETURN NEW;
    END IF;

    -- Process each product in the order
    FOR v_product_id, v_quantity, v_product_name IN
        SELECT 
            (item->>'id')::UUID AS product_id,
            (item->>'quantity')::INTEGER AS quantity,
            item->>'name' AS product_name
        FROM jsonb_array_elements(NEW.services) AS item
        WHERE item->>'type' = 'product'
    LOOP
        -- Find product by ID or name
        SELECT id, stock_quantity 
        INTO v_found_product_id, v_current_stock
        FROM product_master
        WHERE id = v_product_id;
        
        -- If not found by ID, use name
        IF v_found_product_id IS NULL THEN
            SELECT id, stock_quantity 
            INTO v_found_product_id, v_current_stock
            FROM product_master
            WHERE LOWER(name) = LOWER(v_product_name);
        END IF;

        -- Record the transaction in product_stock_transactions
        INSERT INTO product_stock_transactions (
            product_id,
            transaction_type,
            display_type,
            source_type,
            quantity,
            previous_stock,
            new_stock,
            order_id,
            notes,
            source,
            duplicate_protection_key
        )
        VALUES (
            v_found_product_id,
            'reduction',
            'salon_consumption',
            'order',
            v_quantity,
            v_current_stock,
            v_current_stock - v_quantity,
            NEW.id,
            'Stock reduction from salon consumption',
            'pos_order',
            NEW.id || '_' || v_found_product_id || '_' || v_quantity
        )
        ON CONFLICT (duplicate_protection_key) DO NOTHING;
    END LOOP;

    RETURN NEW;
END;
$$;


--
-- Name: reduce_balance_stock_on_order(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reduce_balance_stock_on_order() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Deduct stock quantity from balance_stock when a new order is placed
    UPDATE balance_stock
    SET 
        balance_qty = balance_qty - NEW.ordered_qty
    WHERE stock_id = NEW.stock_id;

    -- Prevent negative stock (optional safeguard)
    IF (SELECT balance_qty FROM balance_stock WHERE stock_id = NEW.stock_id) < 0 THEN
        RAISE EXCEPTION 'Stock quantity cannot be negative!';
    END IF;

    RETURN NEW;
END;
$$;


--
-- Name: reduce_stock_on_purchase_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reduce_stock_on_purchase_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE public.product_master
  SET stock_quantity = stock_quantity - OLD.purchase_qty::INTEGER
  WHERE id = OLD.product_id;

  RETURN OLD;
END;
$$;


--
-- Name: remove_stylist_holiday(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.remove_stylist_holiday(p_holiday_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_stylist_id UUID;
  v_holiday_date DATE;
BEGIN
  -- Get the stylist ID and holiday date before deleting
  SELECT stylist_id, holiday_date INTO v_stylist_id, v_holiday_date
  FROM public.stylist_holidays
  WHERE id = p_holiday_id;
  
  -- Delete the holiday
  DELETE FROM public.stylist_holidays
  WHERE id = p_holiday_id;
  
  -- If this was a holiday for today, check if there are other holidays for this stylist today
  IF v_holiday_date = CURRENT_DATE AND v_stylist_id IS NOT NULL THEN
    -- If no other holidays today, reset availability
    IF NOT EXISTS (
      SELECT 1 FROM public.stylist_holidays
      WHERE stylist_id = v_stylist_id
      AND holiday_date = CURRENT_DATE
    ) THEN
      -- You might want to consider if you should automatically set available back to true
      -- Uncomment the following if you want automatic reset
      /*
      UPDATE public.stylists
      SET available = true
      WHERE id = v_stylist_id;
      */
      NULL; -- Do nothing for now, manual reset required
    END IF;
  END IF;
  
  RETURN FOUND;
END;
$$;


--
-- Name: reset_stylists_not_on_holiday(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.reset_stylists_not_on_holiday() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Set stylists without holidays today to available
  UPDATE public.stylists
  SET available = true
  WHERE id NOT IN (
    SELECT stylist_id FROM public.stylist_holidays
    WHERE holiday_date = CURRENT_DATE
  );
END;
$$;


--
-- Name: restore_pos_orders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.restore_pos_orders() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  prod RECORD;
  stock_before INTEGER;
  stock_after INTEGER;
  order_type TEXT;
  product_id UUID;
  qty INTEGER;
  new_source TEXT;
BEGIN
  -- Determine order type (sale or salon_consumption)
  order_type := OLD.type;

  -- Loop through each product in the order's services JSON array
  FOR prod IN SELECT jsonb_array_elements(OLD.services) AS item
  LOOP
    -- Extract product_id and quantity based on order type
    IF order_type = 'sale' THEN
      product_id := (prod.item->>'product_id')::UUID;
      qty := (prod.item->>'quantity')::INTEGER;
      new_source := 'restore_pos_sale';
    ELSIF order_type = 'salon_consumption' THEN
      -- For salon_consumption, product_id must be fetched by product name from product_master
      SELECT id INTO product_id FROM product_master WHERE name = prod.item->>'name' LIMIT 1;
      qty := (prod.item->>'quantity')::INTEGER;
      new_source := 'restore_pos_salon_consumption';
    ELSE
      -- If order type is other, skip
      CONTINUE;
    END IF;

    IF product_id IS NULL THEN
      RAISE NOTICE 'Product not found for restoration in order %', OLD.id;
      CONTINUE;
    END IF;

    -- Get current stock before update
    SELECT stock_quantity INTO stock_before FROM product_master WHERE id = product_id;

    -- Update stock_quantity by adding qty
    UPDATE product_master SET stock_quantity = stock_quantity + qty WHERE id = product_id;

    -- Get stock after update
    SELECT stock_quantity INTO stock_after FROM product_master WHERE id = product_id;

    -- Insert into product_stock_transactions for restoration
    INSERT INTO product_stock_transactions(
      id, product_id, transaction_type, quantity, previous_stock, new_stock, order_id, 
      notes, created_at, created_by, display_type, source_type, source, duplicate_protection_key, created_at_tz)
    VALUES (
      gen_random_uuid(), 
      product_id, 
      'restoration', 
      qty, 
      stock_before, 
      stock_after, 
      OLD.id, 
      'Stock restored on order deletion', 
      now(), 
      null, 
      'restoration', 
      'manual', 
      new_source, 
      CONCAT(product_id::text, '_', stock_before::text, '_', stock_after::text, '_', OLD.id::text), 
      now()
    );
  END LOOP;

  RETURN OLD;
END;
$$;


--
-- Name: restore_stock_on_order_item_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.restore_stock_on_order_item_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  order_exists BOOLEAN;
  product_record RECORD;
  current_stock INTEGER;
  new_stock INTEGER;
BEGIN
  -- Only process product items
  IF OLD.type <> 'Product' THEN
    RETURN OLD;
  END IF;
  
  -- Check if the parent order still exists
  SELECT EXISTS(SELECT 1 FROM pos_orders WHERE order_id = OLD.order_id) INTO order_exists;
  
  -- Only run this if the parent order still exists (individual item deletion)
  IF order_exists THEN
    RAISE NOTICE 'Processing individual item deletion: % from order %', OLD.product_name, OLD.order_id;
    
    -- Try to find product in product_master with exact name match first
    SELECT * INTO product_record 
    FROM product_master 
    WHERE LOWER(name) = LOWER(OLD.product_name);
    
    -- If not found, try a more flexible match
    IF NOT FOUND THEN
      SELECT * INTO product_record 
      FROM product_master 
      WHERE LOWER(name) LIKE '%' || LOWER(OLD.product_name) || '%'
      LIMIT 1;
      
      IF FOUND THEN
        RAISE NOTICE 'Found product with fuzzy match: % for %', product_record.name, OLD.product_name;
      END IF;
    END IF;
    
    -- If we found the product, restore stock
    IF FOUND THEN
      -- Get current stock, calculate new stock
      current_stock := COALESCE(product_record.stock_quantity, 0);
      new_stock := current_stock + OLD.quantity;
      
      -- Update product_master stock
      UPDATE product_master
      SET 
        stock_quantity = new_stock,
        updated_at = NOW()
      WHERE id = product_record.id;
      
      RAISE NOTICE 'Updated product_master: % - stock changed from % to %', 
        product_record.name, current_stock, new_stock;
      
      -- Insert a record in the transaction history
      INSERT INTO product_stock_transaction_history(
        "Date",
        "Product Name",
        "HSN Code",
        "Units",
        "Change Type",
        "Source",
        "Reference ID",
        "Quantity Change",
        "Quantity After Change"
      ) VALUES (
        NOW(),
        product_record.name,
        product_record.hsn_code,
        product_record.units,
        'Order Item Deletion - Stock Restored',
        'POS Order Item Deleted: ' || OLD.order_id,
        'Restore-Item-' || OLD.id,
        OLD.quantity,
        new_stock
      );
      
      -- Try to delete from related inventory tables
      BEGIN
        DELETE FROM salon_consumption_new
        WHERE order_id = OLD.order_id AND "Product Name" = OLD.product_name;
        EXCEPTION WHEN OTHERS THEN
          -- Ignore errors
      END;
      
      BEGIN
        DELETE FROM inventory_consumption
        WHERE requisition_voucher_no = OLD.order_id AND product_name = OLD.product_name;
        EXCEPTION WHEN OTHERS THEN
          -- Ignore errors
      END;
      
      BEGIN
        DELETE FROM inventory_sales
        WHERE reference_id = OLD.order_id AND product_name = OLD.product_name;
        EXCEPTION WHEN OTHERS THEN
          -- Ignore errors
      END;
    ELSE
      RAISE NOTICE 'Could not find product % in product_master', OLD.product_name;
    END IF;
  END IF;
  
  RETURN OLD;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error in restore_stock_on_order_item_delete: %', SQLERRM;
  RETURN OLD;
END;
$$;


--
-- Name: safe_create_order(jsonb); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.safe_create_order(order_data jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  new_order_id UUID;
  result JSONB;
BEGIN
  -- Insert the order safely
  INSERT INTO pos_orders (
    id, client_name, customer_name, stylist_id, stylist_name,
    total, subtotal, tax, discount, payment_method,
    status, is_walk_in, is_split_payment, pending_amount
  ) VALUES (
    COALESCE((order_data->>'id')::UUID, gen_random_uuid()),
    order_data->>'client_name',
    order_data->>'customer_name',
    (order_data->>'stylist_id')::UUID,
    order_data->>'stylist_name',
    COALESCE((order_data->>'total')::NUMERIC, 0),
    COALESCE((order_data->>'subtotal')::NUMERIC, 0),
    COALESCE((order_data->>'tax')::NUMERIC, 0),
    COALESCE((order_data->>'discount')::NUMERIC, 0),
    COALESCE(order_data->>'payment_method', 'cash'),
    COALESCE(order_data->>'status', 'completed'),
    COALESCE((order_data->>'is_walk_in')::BOOLEAN, true),
    COALESCE((order_data->>'is_split_payment')::BOOLEAN, false),
    COALESCE((order_data->>'pending_amount')::NUMERIC, 0)
  )
  RETURNING id INTO new_order_id;
  
  -- Return success response
  result := jsonb_build_object(
    'success', true,
    'order_id', new_order_id
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  -- Return error response
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;


--
-- Name: sales_product_new_delete(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sales_product_new_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    DELETE FROM sales_product_new_table WHERE serial_no = OLD.serial_no;
    RETURN OLD;
END;
$$;


--
-- Name: sales_product_new_insert(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sales_product_new_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO sales_product_new_table VALUES (NEW.*);
    RETURN NEW;
END;
$$;


--
-- Name: sales_product_new_instead_of_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sales_product_new_instead_of_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Prevent updating remaining_stock
    IF NEW.remaining_stock IS DISTINCT FROM OLD.remaining_stock THEN
        RAISE EXCEPTION 'Updating remaining_stock is not allowed on sales_product_new view';
    END IF;

    -- If you want, update allowed columns in the base table(s) here
    -- For demo, just raise notice and skip update (or implement your own logic)
    RAISE NOTICE 'Update allowed on other columns except remaining_stock';

    RETURN NEW;
END;
$$;


--
-- Name: sales_product_new_update(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sales_product_new_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE sales_product_new_table
    SET
        order_id = NEW.order_id,
        date = NEW.date,
        product_name = NEW.product_name,
        quantity = NEW.quantity,
        unit_price_ex_gst = NEW.unit_price_ex_gst,
        gst_percentage = NEW.gst_percentage,
        taxable_value = NEW.taxable_value,
        cgst_amount = NEW.cgst_amount,
        sgst_amount = NEW.sgst_amount,
        total_purchase_cost = NEW.total_purchase_cost,
        discount = NEW.discount,
        tax = NEW.tax,
        hsn_code = NEW.hsn_code,
        product_type = NEW.product_type,
        mrp_incl_gst = NEW.mrp_incl_gst,
        discounted_sales_rate_ex_gst = NEW.discounted_sales_rate_ex_gst,
        invoice_value = NEW.invoice_value,
        igst_amount = NEW.igst_amount,
        initial_stock = NEW.initial_stock,
        remaining_stock = NEW.remaining_stock,
        current_stock = NEW.current_stock
    WHERE serial_no = OLD.serial_no;
    RETURN NEW;
END;
$$;


--
-- Name: sync_customer_names(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_customer_names() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.client_name IS NULL AND NEW.customer_name IS NOT NULL THEN
    NEW.client_name := NEW.customer_name;
  ELSIF NEW.customer_name IS NULL AND NEW.client_name IS NOT NULL THEN
    NEW.customer_name := NEW.client_name;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: sync_pos_salon_consumption(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_pos_salon_consumption() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
  records_synced INTEGER := 0;
BEGIN
  INSERT INTO inventory_salon_consumption (
    date, 
    product_name, 
    hsn_code, 
    units, 
    quantity, 
    purpose, 
    stylist_name, 
    notes, 
    price_per_unit, 
    gst_percentage
  )
  SELECT 
    o.created_at as date,
    i.service_name as product_name,
    i.hsn_code,
    'pcs' as units,
    i.quantity,
    COALESCE(o.consumption_purpose, 'Salon Use') as purpose,
    COALESCE(o.client_name, 'Staff') as stylist_name,
    o.consumption_notes as notes,
    i.price as price_per_unit,
    i.gst_percentage
  FROM 
    pos_orders o
  JOIN 
    pos_order_items i ON o.id = i.pos_order_id
  WHERE 
    o.is_salon_consumption = true
    AND NOT EXISTS (
      -- Avoid duplication
      SELECT 1 FROM inventory_salon_consumption sc 
      WHERE sc.product_name = i.service_name 
      AND DATE(sc.date) = DATE(o.created_at)
      AND sc.quantity = i.quantity
    );
    
  GET DIAGNOSTICS records_synced = ROW_COUNT;
  
  RETURN records_synced;
END;
$$;


--
-- Name: sync_product_to_inventory(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_product_to_inventory() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Check if product exists in inventory_products
  IF EXISTS (SELECT 1 FROM inventory_products WHERE product_id = NEW.id) THEN
    -- Update existing inventory product
    UPDATE inventory_products SET
      product_name = NEW.name,
      hsn_code = NEW.hsn_code,
      units = NEW.units,
      mrp_incl_gst = NEW.mrp_incl_gst,
      mrp_excl_gst = NEW.mrp_excl_gst,
      gst_percentage = NEW.gst_percentage,
      stock_quantity = NEW.stock_quantity,
      updated_at = NOW()
    WHERE product_id = NEW.id;
  ELSE
    -- Insert new inventory product
    INSERT INTO inventory_products (
      product_id,
      product_name,
      hsn_code,
      units,
      mrp_incl_gst,
      mrp_excl_gst,
      gst_percentage,
      stock_quantity
    ) VALUES (
      NEW.id,
      NEW.name,
      NEW.hsn_code,
      NEW.units,
      NEW.mrp_incl_gst,
      NEW.mrp_excl_gst,
      NEW.gst_percentage,
      NEW.stock_quantity
    );
  END IF;
  
  RETURN NEW;
END;
$$;


--
-- Name: sync_sales_product_table(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_sales_product_table() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Clear the target table
    DELETE FROM sales_product_table;

    -- Insert fresh data from view into target table
    INSERT INTO sales_product_table
    SELECT * FROM sales_product_new;

    RETURN NULL;
END;
$$;


--
-- Name: sync_service_prices(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_service_prices() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Notify clients about the update
    PERFORM pg_notify('service_updates', json_build_object(
        'id', NEW.id,
        'name', NEW.name,
        'price', NEW.price,
        'event', TG_OP
    )::text);
    RETURN NEW;
END;
$$;


--
-- Name: sync_total_amounts(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sync_total_amounts() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.total IS NULL AND NEW.total_amount IS NOT NULL THEN
    NEW.total := NEW.total_amount;
  ELSIF NEW.total_amount IS NULL AND NEW.total IS NOT NULL THEN
    NEW.total_amount := NEW.total;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: trigger_set_timestamp(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_set_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


--
-- Name: trigger_sync_salon_consumption(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_sync_salon_consumption() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW.is_salon_consumption = TRUE THEN
    PERFORM sync_pos_salon_consumption();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: update_balance_stock(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_balance_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Logic to update balance_stock based on the transaction
    -- This is a simplified example
    IF TG_TABLE_NAME = 'purchases' THEN
        -- Increase stock
        INSERT INTO balance_stock (product_name, hsn_code, units, balance_qty, taxable_value)
        SELECT p.name, p.hsn_code, p.units, NEW.qty, NEW.taxable_value
        FROM products p WHERE p.id = NEW.product_id
        ON CONFLICT (product_name) 
        DO UPDATE SET balance_qty = balance_stock.balance_qty + NEW.qty;
    ELSIF TG_TABLE_NAME IN ('sales', 'consumption') THEN
        -- Decrease stock
        UPDATE balance_stock bs
        SET balance_qty = bs.balance_qty - NEW.qty
        FROM products p
        WHERE p.name = bs.product_name AND p.id = NEW.product_id;
    END IF;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_balance_stock_data(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_balance_stock_data() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  sales_qty_exists BOOLEAN;
  consumption_qty_exists BOOLEAN;
BEGIN
  -- First, truncate the existing data
  TRUNCATE TABLE balance_stock_data;
  
  -- Step 1: Insert basic product data from purchases
  INSERT INTO balance_stock_data (
    product_name,
    hsn_code,
    units,
    purchased_quantity,
    balance_quantity,
    last_updated
  )
  SELECT 
    product_name,
    hsn_code,
    units,
    SUM(purchase_qty),
    SUM(purchase_qty), -- Initialize balance with purchase quantity
    CURRENT_TIMESTAMP
  FROM 
    inventory_purchases
  GROUP BY 
    product_name, hsn_code, units;

  -- Step 2: Check if sales_qty column exists in inventory_sales_new
  BEGIN
    PERFORM column_name 
    FROM information_schema.columns 
    WHERE table_name = 'inventory_sales_new' AND column_name = 'sales_qty';
    
    sales_qty_exists := FOUND;
  EXCEPTION
    WHEN OTHERS THEN
      sales_qty_exists := FALSE;
  END;

  -- Step 3: Update sold quantities based on available column
  IF sales_qty_exists THEN
    -- Update with sales_qty if it exists
    UPDATE balance_stock_data
    SET 
      sold_quantity = s.total_qty,
      balance_quantity = balance_stock_data.purchased_quantity - s.total_qty
    FROM (
      SELECT product_name, SUM(sales_qty) AS total_qty
      FROM inventory_sales_new
      GROUP BY product_name
    ) s
    WHERE balance_stock_data.product_name = s.product_name;
  ELSE
    -- Try with quantity instead
    BEGIN
      UPDATE balance_stock_data
      SET 
        sold_quantity = s.total_qty,
        balance_quantity = balance_stock_data.purchased_quantity - s.total_qty
      FROM (
        SELECT product_name, SUM(quantity) AS total_qty
        FROM inventory_sales_new
        GROUP BY product_name
      ) s
      WHERE balance_stock_data.product_name = s.product_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not update sales data';
    END;
  END IF;

  -- Step 4: Check if consumption_qty column exists in inventory_consumption
  BEGIN
    PERFORM column_name 
    FROM information_schema.columns 
    WHERE table_name = 'inventory_consumption' AND column_name = 'consumption_qty';
    
    consumption_qty_exists := FOUND;
  EXCEPTION
    WHEN OTHERS THEN
      consumption_qty_exists := FALSE;
  END;

  -- Step 5: Update consumed quantities based on available column
  IF consumption_qty_exists THEN
    -- Update with consumption_qty if it exists
    UPDATE balance_stock_data
    SET 
      consumed_quantity = c.total_qty,
      balance_quantity = balance_stock_data.purchased_quantity - balance_stock_data.sold_quantity - c.total_qty
    FROM (
      SELECT product_name, SUM(consumption_qty) AS total_qty
      FROM inventory_consumption
      GROUP BY product_name
    ) c
    WHERE balance_stock_data.product_name = c.product_name;
  ELSE
    -- Try with quantity instead
    BEGIN
      UPDATE balance_stock_data
      SET 
        consumed_quantity = c.total_qty,
        balance_quantity = balance_stock_data.purchased_quantity - balance_stock_data.sold_quantity - c.total_qty
      FROM (
        SELECT product_name, SUM(quantity) AS total_qty
        FROM inventory_consumption
        GROUP BY product_name
      ) c
      WHERE balance_stock_data.product_name = c.product_name;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Could not update consumption data';
    END;
  END IF;

  -- Step 6: Calculate average rate and financial values - correctly handles alias issue
  UPDATE balance_stock_data
  SET
    avg_rate = CASE 
      WHEN purchased_quantity > 0 THEN 
        (SELECT SUM(purchase_taxable_value) / SUM(purchase_qty) 
         FROM inventory_purchases 
         WHERE product_name = balance_stock_data.product_name)
      ELSE 0
    END;

  -- Step 7: Update taxable value and balance value based on average rate
  UPDATE balance_stock_data
  SET
    taxable_value = balance_quantity * avg_rate,
    balance_value = balance_quantity * avg_rate;

  -- Step 8: Update GST and invoice value based on proportion from purchases
  UPDATE balance_stock_data
  SET
    cgst = CASE 
      WHEN taxable_value > 0 THEN
        taxable_value * (
          SELECT AVG(COALESCE(purchase_cgst, 0)) / NULLIF(SUM(purchase_taxable_value), 0)
          FROM inventory_purchases
          WHERE product_name = balance_stock_data.product_name
        )
      ELSE 0
    END,
    sgst = CASE 
      WHEN taxable_value > 0 THEN
        taxable_value * (
          SELECT AVG(COALESCE(purchase_sgst, 0)) / NULLIF(SUM(purchase_taxable_value), 0)
          FROM inventory_purchases
          WHERE product_name = balance_stock_data.product_name
        )
      ELSE 0
    END,
    igst = CASE 
      WHEN taxable_value > 0 THEN
        taxable_value * (
          SELECT AVG(COALESCE(purchase_igst, 0)) / NULLIF(SUM(purchase_taxable_value), 0)
          FROM inventory_purchases
          WHERE product_name = balance_stock_data.product_name
        )
      ELSE 0
    END;

  -- Step 9: Calculate invoice value from taxable value + GST components
  UPDATE balance_stock_data
  SET invoice_value = taxable_value + cgst + sgst + igst;

  -- Step 10: Ensure no negative values
  UPDATE balance_stock_data
  SET 
    balance_quantity = GREATEST(balance_quantity, 0),
    taxable_value = GREATEST(taxable_value, 0),
    igst = GREATEST(igst, 0),
    cgst = GREATEST(cgst, 0),
    sgst = GREATEST(sgst, 0),
    invoice_value = GREATEST(invoice_value, 0),
    balance_value = GREATEST(balance_value, 0);

  -- Step 11: Remove rows with zero balance
  DELETE FROM balance_stock_data
  WHERE balance_quantity <= 0;

  -- Final step: Update the last_updated timestamp
  UPDATE balance_stock_data
  SET last_updated = CURRENT_TIMESTAMP;
END;
$$;


--
-- Name: update_balance_stock_on_orders(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_balance_stock_on_orders() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Deduct stock from balance_stock after order
    UPDATE balance_stock
    SET balance_qty = balance_qty - NEW.ordered_qty
    WHERE stock_id = NEW.stock_id;
    RETURN NEW;
END;
$$;


--
-- Name: update_balance_stock_on_purchase(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_balance_stock_on_purchase() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Insert or update balance_stock after purchase
    INSERT INTO balance_stock (stock_id, product_name, hsn_code, units, balance_qty, taxable_value, igst, cgst, sgst, invoice_value)
    VALUES (
        NEW.stock_id,
        (SELECT product_name FROM stock_details WHERE id = NEW.stock_id),
        (SELECT hsn_code FROM stock_details WHERE id = NEW.stock_id),
        (SELECT units FROM stock_details WHERE id = NEW.stock_id),
        NEW.purchase_qty,
        NEW.purchase_taxable_value,
        NEW.purchase_igst,
        NEW.purchase_cgst,
        NEW.purchase_sgst,
        NEW.purchase_invoice_value
    )
    ON CONFLICT (stock_id)
    DO UPDATE SET
        balance_qty = balance_stock.balance_qty + EXCLUDED.balance_qty,
        taxable_value = balance_stock.taxable_value + EXCLUDED.taxable_value,
        igst = balance_stock.igst + EXCLUDED.igst,
        cgst = balance_stock.cgst + EXCLUDED.cgst,
        sgst = balance_stock.sgst + EXCLUDED.sgst,
        invoice_value = balance_stock.invoice_value + EXCLUDED.invoice_value;
    RETURN NEW;
END;
$$;


--
-- Name: update_notification_logs_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_notification_logs_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_product_master_purchase_cost(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_product_master_purchase_cost() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Update the corresponding product_master entry
  UPDATE product_master
  SET "Purchase_Cost/Unit(Ex.GST)" = NEW."Purchase_Cost/Unit(Ex.GST)"
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$;


--
-- Name: update_product_stock_after_consumption(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_product_stock_after_consumption() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    item jsonb;
    product_id uuid;
    quantity integer;
BEGIN
    -- Loop through each product in the order's services array
    FOR item IN SELECT * FROM jsonb_array_elements(NEW.services)
    LOOP
        IF item->>'type' = 'product' THEN
            product_id := (item->>'service_id')::uuid;
            quantity := (item->>'quantity')::integer;

            -- Reduce stock in products
            UPDATE products
            SET stock_quantity = stock_quantity - quantity
            WHERE id = product_id;

            -- Reduce stock in product_master
            UPDATE product_master
            SET stock_quantity = stock_quantity - quantity
            WHERE id = product_id;
        END IF;
    END LOOP;
    RETURN NEW;
END;
$$;


--
-- Name: update_product_stock_on_sale(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_product_stock_on_sale() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Decrease the stock quantity in the products table
    UPDATE products
    SET 
        stock_quantity = GREATEST(stock_quantity - NEW.quantity, 0),
        updated_at = NOW()
    WHERE id = NEW.product_id;
    
    -- Mark the sale as stock-updated
    NEW.stock_updated = TRUE;
    
    RETURN NEW;
END;
$$;


--
-- Name: update_sales_history_product_name(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_sales_history_product_name() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Since products is a view, we'll need to handle this in the application layer
    -- This function will be called but won't update the product_name
    RETURN NEW;
END;
$$;


--
-- Name: update_stock_on_purchase(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_stock_on_purchase() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  last_stock integer;
  new_stock  integer;
BEGIN
  -- Look up the last stock for this product (or 0 if none)
  SELECT current_qty
    INTO last_stock
    FROM stock_history
   WHERE product_id = NEW.product_id::text
ORDER BY date DESC
   LIMIT 1;

  last_stock := COALESCE(last_stock, 0);
  new_stock  := last_stock + NEW.qty;

  -- Insert the corresponding stock_history row
  INSERT INTO stock_history (
    product_id, previous_qty, change_qty, current_qty,
    change_type, date, created_at
  )
  VALUES (
    NEW.product_id::text,
    last_stock,
    NEW.qty,
    new_stock,
    'addition',
    NOW(),
    NOW()
  );

  -- Stamp the purchase row so stock_balance_after_purchase != NULL
  NEW.stock_balance_after_purchase := new_stock;

  RETURN NEW;
END;
$$;


--
-- Name: update_stock_transaction_history(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_stock_transaction_history() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    -- Record stock reduction with detailed reason
    INSERT INTO product_stock_transaction_history(
      "Date", 
      "Product Name", 
      "HSN Code",
      "Units",
      "Change Type", 
      "Source", 
      "Reference ID", 
      "Quantity Change", 
      "Quantity After Change"
    )
    VALUES(
      NOW(),
      OLD.product_name,
      OLD.hsn_code,
      OLD.units,
      'stock_reduction_from_' || TG_TABLE_NAME,
      TG_TABLE_NAME || ' Record Deletion',
      OLD.id,
      -1 * OLD.quantity,
      (SELECT balance_qty FROM inventory_balance_stock WHERE product_name = OLD.product_name)
    );
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    -- Record stock addition with detailed reason
    INSERT INTO product_stock_transaction_history(
      "Date", 
      "Product Name", 
      "HSN Code",
      "Units",
      "Change Type", 
      "Source", 
      "Reference ID", 
      "Quantity Change", 
      "Quantity After Change"
    )
    VALUES(
      NOW(),
      NEW.product_name,
      (SELECT hsn_code FROM products WHERE name = NEW.product_name),
      (SELECT units FROM products WHERE name = NEW.product_name),
      'stock_addition_from_' || TG_TABLE_NAME,
      TG_TABLE_NAME || ' Record Creation',
      NEW.id,
      NEW.quantity,
      (SELECT balance_qty FROM inventory_balance_stock WHERE product_name = NEW.product_name)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;


--
-- Name: update_stylist_availability_on_holiday_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_stylist_availability_on_holiday_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- If a holiday is being added for today
  IF TG_OP = 'INSERT' AND NEW.holiday_date = CURRENT_DATE THEN
    UPDATE public.stylists
    SET available = false
    WHERE id = NEW.stylist_id;
  -- If a holiday is being updated
  ELSIF TG_OP = 'UPDATE' THEN
    -- If the holiday date is changing to or from today
    IF (OLD.holiday_date = CURRENT_DATE OR NEW.holiday_date = CURRENT_DATE) THEN
      -- Run the update function to ensure correct availability
      PERFORM update_stylists_on_holiday();
    END IF;
  -- If a holiday is being deleted
  ELSIF TG_OP = 'DELETE' AND OLD.holiday_date = CURRENT_DATE THEN
    -- Check if there are other holidays for this stylist today
    IF NOT EXISTS (
      SELECT 1 FROM public.stylist_holidays
      WHERE stylist_id = OLD.stylist_id
      AND holiday_date = CURRENT_DATE
      AND id != OLD.id
    ) THEN
      -- No other holidays today for this stylist, could reset availability
      -- But we'll leave it manual for now
      NULL; -- Do nothing, requires manual reset
    END IF;
  END IF;
  
  -- For INSERT and UPDATE, return NEW; for DELETE, return OLD
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;


--
-- Name: update_stylists_on_holiday(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_stylists_on_holiday() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Set stylists with holidays today to unavailable
  UPDATE public.stylists
  SET available = false
  WHERE id IN (
    SELECT stylist_id FROM public.stylist_holidays
    WHERE holiday_date = CURRENT_DATE
  );
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: verify_stock_recording(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.verify_stock_recording(product_id uuid) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
  product_record RECORD;
  current_stock INTEGER;
  test_record_id UUID;
  verification_result JSONB;
BEGIN
  -- Get product info
  SELECT * INTO product_record
  FROM product_master
  WHERE id = product_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Product not found'
    );
  END IF;
  
  -- Current stock
  current_stock := product_record.stock_quantity;
  
  -- Insert a test transaction
  INSERT INTO product_stock_transactions (
    product_id,
    transaction_type,
    display_type,
    source_type,
    quantity,
    previous_stock,
    new_stock,
    notes,
    source
  ) VALUES (
    product_id,
    'test',
    'Verification Test',
    'system',
    0,
    current_stock,
    current_stock,
    'Verification test transaction',
    'verify_function'
  ) RETURNING id INTO test_record_id;
  
  -- Check if transaction is visible in the view
  IF EXISTS (
    SELECT 1 FROM product_stock_transaction_history
    WHERE id = test_record_id
  ) THEN
    verification_result := jsonb_build_object(
      'success', true,
      'message', 'Stock recording is working correctly',
      'product_id', product_id,
      'product_name', product_record.name,
      'test_transaction_id', test_record_id
    );
  ELSE
    verification_result := jsonb_build_object(
      'success', false,
      'message', 'Transaction was recorded but not visible in view',
      'product_id', product_id,
      'product_name', product_record.name,
      'test_transaction_id', test_record_id
    );
  END IF;
  
  RETURN verification_result;
END;
$$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      PERFORM pg_notify(
          'realtime:system',
          jsonb_build_object(
              'error', SQLERRM,
              'function', 'realtime.send',
              'event', event,
              'topic', topic,
              'private', private
          )::text
      );
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


--
-- Name: secrets_encrypt_secret_secret(); Type: FUNCTION; Schema: vault; Owner: -
--

CREATE FUNCTION vault.secrets_encrypt_secret_secret() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
		BEGIN
		        new.secret = CASE WHEN new.secret IS NULL THEN NULL ELSE
			CASE WHEN new.key_id IS NULL THEN NULL ELSE pg_catalog.encode(
			  pgsodium.crypto_aead_det_encrypt(
				pg_catalog.convert_to(new.secret, 'utf8'),
				pg_catalog.convert_to((new.id::text || new.description::text || new.created_at::text || new.updated_at::text)::text, 'utf8'),
				new.key_id::uuid,
				new.nonce
			  ),
				'base64') END END;
		RETURN new;
		END;
		$$;


--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: purchases; Type: TABLE; Schema: inventory; Owner: -
--

CREATE TABLE inventory.purchases (
);


--
-- Name: admin_users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: admin_users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_users_id_seq OWNED BY public.admin_users.id;


--
-- Name: appointment_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_clients (
    appointment_id uuid NOT NULL,
    client_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE appointment_clients; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.appointment_clients IS 'Join table to link appointments to multiple clients.';


--
-- Name: COLUMN appointment_clients.appointment_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_clients.appointment_id IS 'Foreign key referencing the appointment.';


--
-- Name: COLUMN appointment_clients.client_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointment_clients.client_id IS 'Foreign key referencing the client.';


--
-- Name: appointment_services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_services (
    appointment_id uuid NOT NULL,
    service_id uuid NOT NULL,
    client_id uuid,
    start_time time without time zone,
    end_time time without time zone,
    stylist_id uuid,
    sequence_order integer,
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL
);


--
-- Name: appointment_stylists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointment_stylists (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    appointment_id uuid,
    stylist_id uuid,
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    client_id uuid
);


--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    client_id uuid,
    stylist_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled'::text,
    notes text,
    paid boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    billed boolean DEFAULT false,
    stylist_ids uuid[],
    service_ids uuid[] DEFAULT ARRAY[]::uuid[] NOT NULL,
    service_id uuid,
    reminder_sent boolean DEFAULT false,
    is_for_someone_else boolean DEFAULT false NOT NULL,
    reminder_24h_sent boolean DEFAULT false,
    reminder_2h_sent boolean DEFAULT false,
    booking_id uuid,
    checked_in boolean DEFAULT false,
    booker_name text,
    booker_phone text,
    booker_email text
);


--
-- Name: COLUMN appointments.booking_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.appointments.booking_id IS 'Identifier to group multiple appointment entries together';


--
-- Name: auth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.auth (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    username character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    email character varying(255),
    role character varying(50) DEFAULT 'admin'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp with time zone,
    is_active boolean DEFAULT true
);


--
-- Name: balance_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.balance_stock (
    id integer NOT NULL,
    stock_id integer NOT NULL,
    product_name character varying(100),
    hsn_code character varying(20),
    units character varying(20),
    balance_qty integer NOT NULL,
    taxable_value numeric(10,2),
    igst numeric(10,2),
    cgst numeric(10,2),
    sgst numeric(10,2),
    invoice_value numeric(10,2)
);


--
-- Name: balance_stock_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.balance_stock_data (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    purchased_quantity numeric DEFAULT 0,
    sold_quantity numeric DEFAULT 0,
    consumed_quantity numeric DEFAULT 0,
    balance_quantity numeric DEFAULT 0,
    taxable_value numeric DEFAULT 0,
    igst numeric DEFAULT 0,
    cgst numeric DEFAULT 0,
    sgst numeric DEFAULT 0,
    invoice_value numeric DEFAULT 0,
    avg_rate numeric DEFAULT 0,
    balance_value numeric DEFAULT 0,
    last_updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: balance_stock_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.balance_stock_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    transaction_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    change_type text NOT NULL,
    source text DEFAULT 'inventory_update'::text,
    reference_id text DEFAULT '-'::text,
    quantity_change numeric NOT NULL,
    quantity_after_change numeric NOT NULL,
    created_by text,
    transaction_id text
);


--
-- Name: balance_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.balance_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: balance_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.balance_stock_id_seq OWNED BY public.balance_stock.id;


--
-- Name: balance_stock_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.balance_stock_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    change_type text,
    source text DEFAULT 'inventory_update'::text,
    reference_id text DEFAULT '-'::text,
    quantity_change numeric DEFAULT 0,
    quantity_after_change numeric DEFAULT 0
);


--
-- Name: products; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.products AS
 SELECT pm.id,
    pm.name,
    pm.description,
    pm.price,
    pm.stock_quantity,
    pm.category,
    pm.active,
    pm.created_at,
    pm.updated_at,
    pm.collection_id,
    pm.hsn_code,
    pm.units,
    pm.mrp_incl_gst,
    pm.mrp_excl_gst,
    pm.gst_percentage,
    pm.sku,
    pm.product_type
   FROM public.product_master pm;


--
-- Name: balance_stock_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.balance_stock_view AS
 SELECT products.id AS product_id,
    products.name AS product_name,
    products.stock_quantity AS balance_qty,
    products.hsn_code,
    products.units
   FROM public.products
  WHERE (products.stock_quantity IS NOT NULL);


--
-- Name: breaks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.breaks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    stylist_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    full_name text NOT NULL,
    phone text,
    email text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_visit timestamp with time zone,
    notes text,
    total_spent numeric DEFAULT 0,
    pending_payment numeric DEFAULT 0,
    mobile_number character varying(20) DEFAULT ''::character varying NOT NULL,
    gender text,
    birth_date date,
    anniversary_date date,
    appointment_count integer DEFAULT 0
);


--
-- Name: consumption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.consumption (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    date text,
    qty numeric(10,2) DEFAULT 0 NOT NULL,
    purpose text,
    transaction_type text DEFAULT 'consumption'::text,
    original_sale_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: expired_products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.expired_products (
    expired_id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    quantity integer NOT NULL,
    expiry_date timestamp without time zone NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: g; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.g AS
 WITH pos_data AS (
         SELECT row_number() OVER (ORDER BY po.date) AS serial_no,
            po.id AS order_id,
            po.date,
            (svc.value ->> 'name'::text) AS product_name,
            ((svc.value ->> 'quantity'::text))::integer AS quantity,
            'product'::text AS product_type,
            ((svc.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            po.consumption_purpose,
            pm.id AS product_id
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) svc(value))
             JOIN public.product_master pm ON (((svc.value ->> 'name'::text) = pm.name)))
          WHERE (po.type = 'salon_consumption'::text)
        ), stock_with_prev AS (
         SELECT pst.product_id,
            pst.created_at_tz AS stock_date,
            pst.previous_stock,
            pst.new_stock
           FROM public.product_stock_transactions pst
          WHERE ((pst.transaction_type)::text = 'reduction'::text)
        ), latest_stock AS (
         SELECT DISTINCT ON (pd.serial_no) pd.serial_no,
            pd.order_id,
            pd.date,
            pd.product_name,
            pd.quantity,
            pd.product_type,
            pd.unit_price_ex_gst,
            pd.consumption_purpose,
            COALESCE(swp.previous_stock, 0) AS initial_stock,
            swp.new_stock AS current_stock
           FROM (pos_data pd
             LEFT JOIN stock_with_prev swp ON (((pd.product_id = swp.product_id) AND (swp.stock_date <= pd.date))))
          ORDER BY pd.serial_no, swp.stock_date DESC
        )
 SELECT latest_stock.serial_no,
    latest_stock.order_id,
    latest_stock.date,
    latest_stock.product_name,
    latest_stock.quantity,
    latest_stock.product_type,
    latest_stock.unit_price_ex_gst,
    latest_stock.consumption_purpose,
    latest_stock.initial_stock,
    latest_stock.current_stock
   FROM latest_stock
  ORDER BY latest_stock.serial_no;


--
-- Name: inventory_consumption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_consumption (
    consumption_id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    requisition_voucher_no text,
    consumption_qty integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    purchase_cost_per_unit_ex_gst double precision,
    purchase_gst_percentage double precision,
    purchase_taxable_value double precision,
    purchase_igst double precision,
    purchase_cgst double precision,
    purchase_sgst double precision,
    total_purchase_cost double precision,
    balance_qty integer,
    taxable_value double precision,
    igst_rs double precision,
    cgst_rs double precision,
    sgst_rs double precision,
    invoice_value double precision,
    current_stock integer,
    stock_taxable_value double precision,
    stock_igst double precision,
    stock_cgst double precision,
    stock_sgst double precision,
    stock_total_value double precision
);


--
-- Name: inventory_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_purchases (
    purchase_id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    purchase_invoice_number text,
    purchase_qty integer NOT NULL,
    mrp_incl_gst double precision,
    mrp_excl_gst double precision,
    discount_on_purchase_percentage double precision DEFAULT 0,
    gst_percentage double precision DEFAULT 18,
    purchase_taxable_value double precision,
    purchase_igst double precision DEFAULT 0,
    purchase_cgst double precision,
    purchase_sgst double precision,
    purchase_invoice_value_rs double precision,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    current_stock integer,
    product_id uuid,
    purchase_cost_per_unit_ex_gst double precision,
    "Vendor" text,
    transaction_type character varying(20) DEFAULT 'purchase'::character varying,
    CONSTRAINT inventory_purchases_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['purchase'::character varying, 'inventory_update'::character varying, 'stock_increment'::character varying, 'stock_decrement'::character varying, 'pos_sale'::character varying])::text[])))
);


--
-- Name: inventory_sales_new; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_sales_new (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date date NOT NULL,
    product_name text NOT NULL,
    hsn_code text NOT NULL,
    units text NOT NULL,
    quantity integer NOT NULL,
    mrp_incl_gst numeric(10,2) NOT NULL,
    mrp_excl_gst numeric(10,2) NOT NULL,
    discount_percentage numeric(5,2) NOT NULL,
    gst_percentage numeric(5,2) NOT NULL,
    taxable_value numeric(10,2) NOT NULL,
    igst numeric(10,2) NOT NULL,
    cgst numeric(10,2) NOT NULL,
    sgst numeric(10,2) NOT NULL,
    invoice_value numeric(10,2) NOT NULL,
    invoice_no text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: inventory_salon_consumption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_salon_consumption (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    product_name text,
    hsn_code text,
    quantity numeric,
    purpose text,
    price_per_unit numeric,
    gst_percentage numeric,
    current_stock numeric,
    current_stock_taxable_value numeric,
    current_stock_igst numeric,
    current_stock_cgst numeric,
    current_stock_sgst numeric,
    current_stock_total_value numeric,
    units text,
    notes text,
    stylist_name text,
    product_id uuid
);


--
-- Name: COLUMN inventory_salon_consumption.date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_salon_consumption.date IS 'Timestamp when the consumption event occurred (can be different from created_at)';


--
-- Name: COLUMN inventory_salon_consumption.created_at; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_salon_consumption.created_at IS 'Timestamp when the record was created in the database';


--
-- Name: COLUMN inventory_salon_consumption.price_per_unit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_salon_consumption.price_per_unit IS 'Purchase cost per unit excluding GST at the time of consumption calculation';


--
-- Name: COLUMN inventory_salon_consumption.current_stock; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_salon_consumption.current_stock IS 'Stock quantity *before* this consumption event';


--
-- Name: COLUMN inventory_salon_consumption.current_stock_taxable_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_salon_consumption.current_stock_taxable_value IS 'Taxable value of the stock *before* this consumption (current_stock * price_per_unit)';


--
-- Name: COLUMN inventory_salon_consumption.current_stock_igst; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_salon_consumption.current_stock_igst IS 'IGST component of the stock value before consumption';


--
-- Name: COLUMN inventory_salon_consumption.current_stock_cgst; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_salon_consumption.current_stock_cgst IS 'CGST component of the stock value before consumption';


--
-- Name: COLUMN inventory_salon_consumption.current_stock_sgst; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_salon_consumption.current_stock_sgst IS 'SGST component of the stock value before consumption';


--
-- Name: COLUMN inventory_salon_consumption.current_stock_total_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.inventory_salon_consumption.current_stock_total_value IS 'Total value (including tax) of the stock *before* this consumption';


--
-- Name: inventory_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.inventory_transactions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    transaction_time timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    product_name text NOT NULL,
    hsn_code text,
    units text,
    change_type text NOT NULL,
    source text DEFAULT 'inventory_update'::text,
    reference_id text DEFAULT '-'::text,
    quantity_change numeric NOT NULL,
    quantity_after_change numeric NOT NULL
);


--
-- Name: inventory_transaction_history; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_transaction_history AS
 SELECT row_number() OVER (ORDER BY inventory_transactions.transaction_time DESC) AS s_no,
    to_char(inventory_transactions.transaction_time, 'MM/DD/YYYY, HH:MI:SS PM'::text) AS date,
    inventory_transactions.product_name,
    inventory_transactions.hsn_code,
    inventory_transactions.units,
    inventory_transactions.change_type,
    inventory_transactions.source,
    inventory_transactions.reference_id,
    inventory_transactions.quantity_change,
    inventory_transactions.quantity_after_change
   FROM public.inventory_transactions
  ORDER BY inventory_transactions.transaction_time DESC;


--
-- Name: inventory_transaction_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.inventory_transaction_view AS
 SELECT row_number() OVER (ORDER BY balance_stock_history.transaction_time DESC) AS s_no,
    to_char(balance_stock_history.transaction_time, 'MM/DD/YYYY, HH12:MI:SS AM'::text) AS date_formatted,
    balance_stock_history.product_name,
    balance_stock_history.hsn_code,
    balance_stock_history.units,
    balance_stock_history.change_type,
    balance_stock_history.source,
    balance_stock_history.reference_id,
    balance_stock_history.quantity_change,
    balance_stock_history.quantity_after_change
   FROM public.balance_stock_history
  ORDER BY balance_stock_history.transaction_time DESC;


--
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_points (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    client_id uuid NOT NULL,
    points_earned numeric DEFAULT 0,
    points_redeemed numeric DEFAULT 0,
    points_balance numeric DEFAULT 0,
    last_transaction_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    client_name text NOT NULL,
    tier_id uuid NOT NULL,
    purchase_date date DEFAULT CURRENT_DATE NOT NULL,
    expires_at date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    current_balance numeric DEFAULT 0 NOT NULL,
    total_membership_amount numeric DEFAULT 0 NOT NULL,
    benefit_amount numeric DEFAULT 0
);


--
-- Name: COLUMN members.current_balance; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.members.current_balance IS 'Stores the remaining monetary value of the membership account';


--
-- Name: COLUMN members.total_membership_amount; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.members.total_membership_amount IS 'Stores the original total membership amount at time of purchase';


--
-- Name: membership_tiers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.membership_tiers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    price numeric(10,2) NOT NULL,
    duration_months integer NOT NULL,
    benefits text[] DEFAULT '{}'::text[],
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT membership_tiers_duration_months_check CHECK ((duration_months > 0)),
    CONSTRAINT membership_tiers_price_check CHECK ((price >= (0)::numeric))
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name text NOT NULL,
    applied_at timestamp with time zone DEFAULT now()
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: notification_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_logs (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    appointment_id uuid,
    notification_type character varying(50) NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    status character varying(20) NOT NULL,
    old_appointment_id uuid,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: TABLE notification_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notification_logs IS 'Tracks all WhatsApp notifications sent to customers';


--
-- Name: order_stylists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_stylists (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid,
    stylist_id uuid,
    share_percentage numeric,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pos_order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pos_order_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    service_id uuid,
    service_name text NOT NULL,
    service_type text DEFAULT 'service'::text,
    price numeric NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    gst_percentage numeric DEFAULT 18,
    hsn_code text,
    created_at timestamp with time zone DEFAULT now(),
    pos_order_id uuid,
    order_id text,
    product_id text,
    product_name text,
    unit_price numeric,
    total_price numeric,
    type text DEFAULT 'product'::text
);


--
-- Name: pos_product_sales_with_stoc; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.pos_product_sales_with_stoc AS
 WITH parsed_orders AS (
         SELECT po.id AS order_id,
            po.date AS sale_date,
            po.client_name,
            jsonb_array_elements(po.services) AS prod_data
           FROM public.pos_orders po
          WHERE (po.type = 'sale'::text)
        ), flattened_products AS (
         SELECT parsed_orders.order_id,
            parsed_orders.sale_date,
            parsed_orders.client_name,
            (parsed_orders.prod_data ->> 'product_id'::text) AS product_id,
            (parsed_orders.prod_data ->> 'product_name'::text) AS product_name,
            ((parsed_orders.prod_data ->> 'quantity'::text))::integer AS quantity_sold,
            ((parsed_orders.prod_data ->> 'price'::text))::numeric AS selling_price,
            ((parsed_orders.prod_data ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            (parsed_orders.prod_data ->> 'hsn_code'::text) AS hsn_code
           FROM parsed_orders
        ), sales_with_stock AS (
         SELECT fp.order_id,
            fp.sale_date,
            fp.client_name,
            fp.product_id,
            fp.product_name,
            fp.quantity_sold,
            fp.selling_price,
            fp.gst_percentage,
            fp.hsn_code,
            psth."Quantity After Change" AS remaining_stock_after_sale,
            psth."Date" AS stock_txn_date,
            psth.id AS stock_txn_id
           FROM (flattened_products fp
             JOIN public.product_stock_transaction_history psth ON (((fp.product_name = psth."Product Name") AND ((psth."Source")::text = 'pos_order'::text))))
          ORDER BY psth."Date"
        )
 SELECT row_number() OVER (ORDER BY sales_with_stock.stock_txn_date) AS serial_no,
    sales_with_stock.order_id,
    sales_with_stock.client_name,
    sales_with_stock.product_id,
    sales_with_stock.product_name,
    sales_with_stock.quantity_sold,
    sales_with_stock.selling_price,
    sales_with_stock.gst_percentage,
    sales_with_stock.hsn_code,
    sales_with_stock.remaining_stock_after_sale,
    sales_with_stock.stock_txn_date
   FROM sales_with_stock;


--
-- Name: product_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product_collections (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchases (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    date text,
    invoice_no text,
    qty numeric(10,2) DEFAULT 0 NOT NULL,
    incl_gst numeric(10,2) DEFAULT 0,
    ex_gst numeric(10,2) DEFAULT 0,
    taxable_value numeric(10,2) DEFAULT 0,
    igst numeric(10,2) DEFAULT 0,
    cgst numeric(10,2) DEFAULT 0,
    sgst numeric(10,2) DEFAULT 0,
    invoice_value numeric(10,2) DEFAULT 0,
    supplier text,
    transaction_type text DEFAULT 'purchase'::text,
    created_at timestamp with time zone DEFAULT now(),
    discount_percentage numeric DEFAULT 0,
    updated_at timestamp with time zone DEFAULT now(),
    stock_balance_after_purchase integer
);


--
-- Name: sales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales (
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    date text,
    invoice_no text,
    qty numeric(10,2) DEFAULT 0 NOT NULL,
    incl_gst numeric(10,2) DEFAULT 0,
    ex_gst numeric(10,2) DEFAULT 0,
    taxable_value numeric(10,2) DEFAULT 0,
    igst numeric(10,2) DEFAULT 0,
    cgst numeric(10,2) DEFAULT 0,
    sgst numeric(10,2) DEFAULT 0,
    invoice_value numeric(10,2) DEFAULT 0,
    customer text,
    payment_method text,
    transaction_type text DEFAULT 'sale'::text,
    converted_to_consumption boolean DEFAULT false,
    converted_at timestamp with time zone,
    consumption_id uuid,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    customer_name text,
    customer_id uuid,
    stylist_name text,
    stylist_id uuid,
    invoice_number text,
    order_id uuid,
    stock_updated boolean DEFAULT false,
    discount_percentage numeric(5,2) DEFAULT 0,
    gst_percentage numeric(5,2) DEFAULT 0,
    price_excl_gst numeric(10,2),
    total_value numeric(10,2),
    quantity integer DEFAULT 1,
    is_salon_consumption boolean DEFAULT false,
    mrp_incl_gst numeric,
    CONSTRAINT sales_payment_method_check CHECK (((payment_method IS NULL) OR (payment_method = ANY (ARRAY['cash'::text, 'card'::text, 'online'::text, 'other'::text]))))
)
WITH (autovacuum_enabled='true');


--
-- Name: product_inventory_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.product_inventory_summary AS
 SELECT p.id,
    p.name AS product_name,
    p.hsn_code,
    p.units,
    p.stock_quantity,
    p.price,
    p.mrp_incl_gst,
    p.mrp_excl_gst,
    p.gst_percentage,
    COALESCE(sum(pur.qty), (0)::numeric) AS total_purchased,
    COALESCE(sum(s.qty), (0)::numeric) AS total_sold,
    COALESCE(sum(c.qty), (0)::numeric) AS total_consumed
   FROM (((public.product_master p
     LEFT JOIN public.purchases pur ON ((p.id = pur.product_id)))
     LEFT JOIN public.sales s ON ((p.id = s.product_id)))
     LEFT JOIN public.consumption c ON ((p.id = c.product_id)))
  GROUP BY p.id, p.name, p.hsn_code, p.units, p.stock_quantity, p.price, p.mrp_incl_gst, p.mrp_excl_gst, p.gst_percentage;


--
-- Name: product_stock_status; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.product_stock_status AS
 WITH combined_events AS (
         SELECT po.id AS event_id,
            po.created_at AS event_date,
            po.id AS order_id,
            ((jsonb_array_elements(po.services) ->> 'product_id'::text))::uuid AS product_id,
            (((jsonb_array_elements(po.services) ->> 'quantity'::text))::integer * '-1'::integer) AS quantity_change
           FROM public.pos_orders po
          WHERE (po.type = 'sale'::text)
        UNION ALL
         SELECT psth.id AS event_id,
            to_timestamp(psth."Date", 'MM/DD/YYYY, HH12:MI:SS AM'::text) AS event_date,
            NULL::uuid AS order_id,
            NULL::uuid AS product_id,
                CASE
                    WHEN ((psth."Change Type")::text = 'addition'::text) THEN psth."Quantity Change"
                    WHEN ((psth."Change Type")::text = 'reduction'::text) THEN (- psth."Quantity Change")
                    ELSE 0
                END AS quantity_change
           FROM public.product_stock_transaction_history psth
        ), events_with_products AS (
         SELECT combined_events.event_id,
            combined_events.event_date,
            combined_events.order_id,
            combined_events.product_id,
            combined_events.quantity_change
           FROM combined_events
          WHERE (combined_events.product_id IS NOT NULL)
        ), running_stock AS (
         SELECT events_with_products.event_id,
            events_with_products.event_date,
            events_with_products.order_id,
            events_with_products.product_id,
            events_with_products.quantity_change,
            sum(events_with_products.quantity_change) OVER (PARTITION BY events_with_products.product_id ORDER BY events_with_products.event_date, events_with_products.event_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS remaining_stock
           FROM events_with_products
        )
 SELECT running_stock.event_id,
    running_stock.event_date,
    running_stock.order_id,
    running_stock.product_id,
    running_stock.quantity_change,
    running_stock.remaining_stock
   FROM running_stock
  ORDER BY running_stock.event_date, running_stock.event_id;


--
-- Name: purchase_history_with_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_history_with_stock (
    purchase_id uuid NOT NULL,
    date timestamp without time zone NOT NULL,
    product_id uuid,
    product_name text,
    hsn_code text,
    units text,
    purchase_invoice_number text,
    purchase_qty integer,
    mrp_incl_gst numeric,
    mrp_excl_gst numeric,
    discount_on_purchase_percentage numeric,
    gst_percentage numeric,
    purchase_taxable_value numeric,
    purchase_igst numeric,
    purchase_cgst numeric,
    purchase_sgst numeric,
    purchase_invoice_value_rs numeric,
    supplier text,
    current_stock_at_purchase integer,
    computed_stock_taxable_value numeric,
    computed_stock_igst numeric,
    computed_stock_cgst numeric,
    computed_stock_sgst numeric,
    computed_stock_total_value numeric,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    "Purchase_Cost/Unit(Ex.GST)" double precision,
    price_inlcuding_disc double precision,
    transaction_type character varying(20) DEFAULT 'purchase'::character varying,
    CONSTRAINT purchase_history_transaction_type_check CHECK (((transaction_type)::text = ANY ((ARRAY['purchase'::character varying, 'inventory_update'::character varying, 'stock_increment'::character varying, 'stock_decrement'::character varying, 'pos_sale'::character varying])::text[])))
);


--
-- Name: COLUMN purchase_history_with_stock."Purchase_Cost/Unit(Ex.GST)"; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.purchase_history_with_stock."Purchase_Cost/Unit(Ex.GST)" IS 'taxable value excluding gst';


--
-- Name: purchase_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.purchase_stock (
    id integer NOT NULL,
    stock_id integer NOT NULL,
    purchase_invoice_no character varying(50) NOT NULL,
    purchase_qty integer NOT NULL,
    mrp_incl_gst numeric(10,2),
    mrp_ex_gst numeric(10,2),
    discount_percentage numeric(5,2),
    purchase_cost_per_unit numeric(10,2),
    gst_percentage numeric(5,2),
    purchase_taxable_value numeric(10,2),
    purchase_igst numeric(10,2),
    purchase_cgst numeric(10,2),
    purchase_sgst numeric(10,2),
    purchase_invoice_value numeric(10,2)
);


--
-- Name: purchase_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.purchase_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: purchase_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.purchase_stock_id_seq OWNED BY public.purchase_stock.id;


--
-- Name: sale_product_vieww; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sale_product_vieww AS
 SELECT row_number() OVER (ORDER BY po.date, pm.name) AS "Serial No.",
    (po.date)::date AS "Date",
    pm.name AS "Product Name",
    pm.hsn_code AS "HSN Code",
    pm.units AS "Product Type/Units",
    ((prod_data.value ->> 'quantity'::text))::integer AS "Qty.",
    (pm.mrp_incl_gst)::numeric AS "Unit Price (Inc. GST Rs.)",
    (pm.mrp_excl_gst)::numeric AS "Unit Price (Ex. GST Rs.)",
    ((pm.mrp_excl_gst)::numeric * (((prod_data.value ->> 'quantity'::text))::integer)::numeric) AS "Taxable Value (Transaction Rs.)",
    pm.gst_percentage AS "GST %",
    po.discount_percentage AS "Discount %",
    round((((pm.mrp_excl_gst)::numeric * (((prod_data.value ->> 'quantity'::text))::integer)::numeric) * ((1)::numeric - (po.discount_percentage / (100)::numeric))), 2) AS "Taxable After Discount (Rs.)",
    round(((((pm.mrp_excl_gst)::numeric * (((prod_data.value ->> 'quantity'::text))::integer)::numeric) * ((1)::numeric - (po.discount_percentage / (100)::numeric))) * ((pm.gst_percentage)::numeric / (200)::numeric)), 2) AS "CGST (Transaction Rs.)",
    round(((((pm.mrp_excl_gst)::numeric * (((prod_data.value ->> 'quantity'::text))::integer)::numeric) * ((1)::numeric - (po.discount_percentage / (100)::numeric))) * ((pm.gst_percentage)::numeric / (200)::numeric)), 2) AS "SGST (Transaction Rs.)",
    po.total_amount AS "Total Value (Transaction Rs.)",
    (pm.stock_quantity + COALESCE(( SELECT sum(((pd2.value ->> 'quantity'::text))::integer) AS sum
           FROM public.pos_orders po2,
            LATERAL jsonb_array_elements(po2.services) pd2(value)
          WHERE ((((pd2.value ->> 'product_id'::text))::uuid = pm.id) AND (po2.date > po.date))), (0)::bigint)) AS "Initial Stock Before Sale",
    ((pm.stock_quantity + COALESCE(( SELECT sum(((pd2.value ->> 'quantity'::text))::integer) AS sum
           FROM public.pos_orders po2,
            LATERAL jsonb_array_elements(po2.services) pd2(value)
          WHERE ((((pd2.value ->> 'product_id'::text))::uuid = pm.id) AND (po2.date > po.date))), (0)::bigint)) - ((prod_data.value ->> 'quantity'::text))::integer) AS "Remaining Stock After Sale",
    pm.stock_quantity AS "Current Stock (Latest)",
    ((pm.mrp_excl_gst)::numeric * (pm.stock_quantity)::numeric) AS "Taxable Value (Current Stock Rs.)",
    0 AS "IGST (Current Stock Rs.)",
    round((((pm.mrp_excl_gst)::numeric * (pm.stock_quantity)::numeric) * ((pm.gst_percentage)::numeric / (200)::numeric)), 2) AS "CGST (Current Stock Rs.)",
    round((((pm.mrp_excl_gst)::numeric * (pm.stock_quantity)::numeric) * ((pm.gst_percentage)::numeric / (200)::numeric)), 2) AS "SGST (Current Stock Rs.)",
    round(((pm.mrp_incl_gst)::numeric * (pm.stock_quantity)::numeric), 2) AS "Total Value (Current Stock Rs.)",
    po.order_id AS "Order ID"
   FROM public.pos_orders po,
    (LATERAL jsonb_array_elements(po.services) prod_data(value)
     JOIN public.product_master pm ON ((pm.id = ((prod_data.value ->> 'product_id'::text))::uuid)));


--
-- Name: sale_stock_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sale_stock_view AS
 WITH combined_events AS (
         SELECT po.id AS event_id,
            po.created_at AS event_date,
            ((jsonb_array_elements(po.services) ->> 'product_id'::text))::uuid AS product_id,
            (((jsonb_array_elements(po.services) ->> 'quantity'::text))::integer * '-1'::integer) AS quantity_change
           FROM public.pos_orders po
          WHERE (po.type = 'sale'::text)
        UNION ALL
         SELECT psth.id AS event_id,
            to_timestamp(psth."Date", 'MM/DD/YYYY, HH12:MI:SS AM'::text) AS event_date,
            NULL::uuid AS product_id,
                CASE
                    WHEN ((psth."Change Type")::text = 'addition'::text) THEN psth."Quantity Change"
                    WHEN ((psth."Change Type")::text = 'reduction'::text) THEN (- psth."Quantity Change")
                    ELSE 0
                END AS quantity_change
           FROM public.product_stock_transaction_history psth
        ), stock_running_total AS (
         SELECT combined_events.event_id,
            combined_events.event_date,
            combined_events.product_id,
            sum(combined_events.quantity_change) OVER (PARTITION BY combined_events.product_id ORDER BY combined_events.event_date, combined_events.event_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS remaining_stock
           FROM combined_events
        )
 SELECT stock_running_total.event_id,
    stock_running_total.event_date,
    stock_running_total.product_id,
    stock_running_total.remaining_stock
   FROM stock_running_total
  ORDER BY stock_running_total.event_date, stock_running_total.event_id;


--
-- Name: sale_stock_view_new; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sale_stock_view_new AS
 SELECT row_number() OVER (ORDER BY po.date, po.id) AS "Serial No.",
    (po.date)::date AS "Date",
    pm.name AS "Product Name",
    pm.hsn_code AS "HSN Code",
    pm.units AS "Product Type/Units",
    ((prod_data.value ->> 'quantity'::text))::integer AS "Qty.",
    (pm.mrp_incl_gst)::numeric AS "Unit Price (Inc. GST Rs.)",
    (pm.mrp_excl_gst)::numeric AS "Unit Price (Ex. GST Rs.)",
    ((((prod_data.value ->> 'quantity'::text))::integer)::numeric * (pm.mrp_excl_gst)::numeric) AS "Taxable Value (Transaction Rs.)",
    (pm.gst_percentage)::numeric AS "GST %",
    0.00 AS "Discount %",
    ((((prod_data.value ->> 'quantity'::text))::integer)::numeric * (pm.mrp_excl_gst)::numeric) AS "Taxable After Discount (Rs.)",
    round(((((((prod_data.value ->> 'quantity'::text))::integer)::numeric * (pm.mrp_excl_gst)::numeric) * ((pm.gst_percentage)::numeric / (2)::numeric)) / (100)::numeric), 2) AS "CGST (Transaction Rs.)",
    round(((((((prod_data.value ->> 'quantity'::text))::integer)::numeric * (pm.mrp_excl_gst)::numeric) * ((pm.gst_percentage)::numeric / (2)::numeric)) / (100)::numeric), 2) AS "SGST (Transaction Rs.)",
    ((((prod_data.value ->> 'quantity'::text))::integer)::numeric * (pm.mrp_incl_gst)::numeric) AS "Total Value (Transaction Rs.)",
    ((pm.stock_quantity + sum(
        CASE
            WHEN ((psth."Date")::timestamp without time zone <= po.date) THEN 0
            ELSE psth."Quantity Change"
        END) OVER (PARTITION BY pm.id)) + ((prod_data.value ->> 'quantity'::text))::integer) AS "Initial Stock Before Sale",
    (pm.stock_quantity + sum(
        CASE
            WHEN ((psth."Date")::timestamp without time zone <= po.date) THEN 0
            ELSE psth."Quantity Change"
        END) OVER (PARTITION BY pm.id)) AS "Remaining Stock After Sale",
    pm.stock_quantity AS "Current Stock (Latest)",
    ((pm.stock_quantity)::numeric * (pm.mrp_excl_gst)::numeric) AS "Taxable Value (Current Stock Rs.)",
    0.00 AS "IGST (Current Stock Rs.)",
    round(((((pm.stock_quantity)::numeric * (pm.mrp_excl_gst)::numeric) * ((pm.gst_percentage)::numeric / (2)::numeric)) / (100)::numeric), 2) AS "CGST (Current Stock Rs.)",
    round(((((pm.stock_quantity)::numeric * (pm.mrp_excl_gst)::numeric) * ((pm.gst_percentage)::numeric / (2)::numeric)) / (100)::numeric), 2) AS "SGST (Current Stock Rs.)",
    ((pm.stock_quantity)::numeric * (pm.mrp_incl_gst)::numeric) AS "Total Value (Current Stock Rs.)",
    po.id AS "Order ID"
   FROM (((public.pos_orders po
     CROSS JOIN LATERAL jsonb_array_elements(po.services) prod_data(value))
     JOIN public.product_master pm ON (((pm.id)::text = (prod_data.value ->> 'product_id'::text))))
     LEFT JOIN public.product_stock_transaction_history psth ON ((psth."Product Name" = pm.name)))
  WHERE ((prod_data.value ->> 'type'::text) = 'product'::text)
  ORDER BY po.date, po.id;


--
-- Name: sales_history_fin; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_fin AS
 WITH sales_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            item.value AS item,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::integer AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            (item.value ->> 'service_name'::text) AS product_name,
            (COALESCE((po.current_stock)::integer, 0) - ((item.value ->> 'quantity'::text))::integer) AS current_stock
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), sales_with_serial AS (
         SELECT sales_data.order_id,
            sales_data.order_date,
            sales_data.item,
            sales_data.product_id,
            sales_data.quantity,
            sales_data.unit_price_ex_gst,
            sales_data.gst_percentage,
            sales_data.mrp_incl_gst,
            sales_data.discounted_sales_rate_ex_gst,
            sales_data.discount_percentage,
            sales_data.tax,
            sales_data.hsn_code,
            sales_data.product_type,
            sales_data.type,
            sales_data.product_name,
            sales_data.current_stock,
            row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
           FROM sales_data
        ), total_sold_per_product AS (
         SELECT sales_with_serial.product_id,
            sum(sales_with_serial.quantity) AS total_sold
           FROM sales_with_serial
          GROUP BY sales_with_serial.product_id
        ), cumulative_sales AS (
         SELECT s.order_id,
            s.order_date,
            s.item,
            s.product_id,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.product_name,
            s.current_stock,
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (sales_with_serial s
             JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
        ), purchase_data AS (
         SELECT purchase_history_with_stock.product_id,
            max(purchase_history_with_stock.purchase_taxable_value) AS purchase_taxable_value,
            max(purchase_history_with_stock.purchase_cgst) AS purchase_cgst,
            max(purchase_history_with_stock.purchase_sgst) AS purchase_sgst
           FROM public.purchase_history_with_stock
          GROUP BY purchase_history_with_stock.product_id
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY s.order_date))::text, 2, '0'::text)) AS serial_no,
            s.order_id,
            date(s.order_date) AS date,
            s.product_name,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            round((s.unit_price_ex_gst * (s.quantity)::numeric), 2) AS taxable_value,
            round(((((s.unit_price_ex_gst * (s.quantity)::numeric) * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((s.unit_price_ex_gst * (s.quantity)::numeric) * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((s.unit_price_ex_gst * (s.quantity)::numeric) * ((1)::numeric + (s.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            round((((s.quantity)::numeric * s.unit_price_ex_gst) * ((1)::numeric + (s.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            s.current_stock AS stock,
            round(((s.current_stock)::numeric * p.purchase_taxable_value), 2) AS stock_taxable_value,
            round(((s.current_stock)::numeric * p.purchase_cgst), 2) AS stock_cgst,
            round(((s.current_stock)::numeric * p.purchase_sgst), 2) AS stock_sgst,
            round(((s.current_stock)::numeric * ((p.purchase_taxable_value + p.purchase_cgst) + p.purchase_sgst)), 2) AS stock_total_value
           FROM (cumulative_sales s
             LEFT JOIN purchase_data p ON ((s.product_id = p.product_id)))
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount_percentage,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.stock,
    final_sales.stock_taxable_value,
    final_sales.stock_cgst,
    final_sales.stock_sgst,
    final_sales.stock_total_value
   FROM final_sales;


--
-- Name: sales_history_final; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_final AS
 WITH sales_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            (item.value ->> 'service_name'::text) AS product_name,
            sum(((item.value ->> 'quantity'::text))::integer) AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            COALESCE((po.current_stock)::integer, 0) AS stock_before_sale,
            pm."Purchase_Cost/Unit(Ex.GST)" AS purchase_cost_per_unit_ex_gst
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
          GROUP BY po.id, po.date, (item.value ->> 'service_id'::text), (item.value ->> 'service_name'::text), (item.value ->> 'price'::text), (item.value ->> 'gst_percentage'::text), (item.value ->> 'mrp_incl_gst'::text), (item.value ->> 'unit_price'::text), po.discount_percentage, po.tax, pm.hsn_code, pm.units, po.type, po.current_stock, pm."Purchase_Cost/Unit(Ex.GST)"
        ), sales_with_serial AS (
         SELECT sales_data.order_id,
            sales_data.order_date,
            sales_data.product_id,
            sales_data.product_name,
            sales_data.quantity,
            sales_data.unit_price_ex_gst,
            sales_data.gst_percentage,
            sales_data.mrp_incl_gst,
            sales_data.discounted_sales_rate_ex_gst,
            sales_data.discount_percentage,
            sales_data.tax,
            sales_data.hsn_code,
            sales_data.product_type,
            sales_data.type,
            sales_data.stock_before_sale,
            sales_data.purchase_cost_per_unit_ex_gst,
            row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
           FROM sales_data
        ), total_sold_per_product AS (
         SELECT sales_with_serial.product_id,
            sum(sales_with_serial.quantity) AS total_sold
           FROM sales_with_serial
          GROUP BY sales_with_serial.product_id
        ), cumulative_sales AS (
         SELECT s.order_id,
            s.order_date,
            s.product_id,
            s.product_name,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.stock_before_sale,
            s.purchase_cost_per_unit_ex_gst,
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (sales_with_serial s
             JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY cumulative_sales.order_date))::text, 2, '0'::text)) AS serial_no,
            cumulative_sales.order_id,
            date(cumulative_sales.order_date) AS date,
            cumulative_sales.product_name,
            cumulative_sales.quantity,
            cumulative_sales.unit_price_ex_gst,
            cumulative_sales.gst_percentage,
            round((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric), 2) AS taxable_value,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            cumulative_sales.discount_percentage,
            cumulative_sales.tax,
            cumulative_sales.hsn_code,
            cumulative_sales.product_type,
            cumulative_sales.mrp_incl_gst,
            cumulative_sales.discounted_sales_rate_ex_gst,
            round((((cumulative_sales.quantity)::numeric * cumulative_sales.unit_price_ex_gst) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            (cumulative_sales.stock_before_sale - cumulative_sales.quantity) AS stock,
            round((((cumulative_sales.stock_before_sale - cumulative_sales.quantity))::numeric * cumulative_sales.purchase_cost_per_unit_ex_gst), 2) AS stock_taxable_value
           FROM cumulative_sales
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount_percentage,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.stock,
    final_sales.stock_taxable_value
   FROM final_sales;


--
-- Name: sales_history_final_2; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_final_2 AS
 WITH sales_data_raw AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::integer AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.product_type,
            po.type,
            (item.value ->> 'service_name'::text) AS product_name,
            pm."Purchase_Cost/Unit(Ex.GST)" AS purchase_cost_per_unit_ex_gst,
            (po.current_stock)::integer AS current_stock
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), aggregated_sales AS (
         SELECT sales_data_raw.order_id,
            sales_data_raw.order_date,
            sales_data_raw.product_id,
            sales_data_raw.product_name,
            sum(sales_data_raw.quantity) AS quantity,
            max(sales_data_raw.unit_price_ex_gst) AS unit_price_ex_gst,
            max(sales_data_raw.gst_percentage) AS gst_percentage,
            max(sales_data_raw.mrp_incl_gst) AS mrp_incl_gst,
            max(sales_data_raw.discounted_sales_rate_ex_gst) AS discounted_sales_rate_ex_gst,
            max(sales_data_raw.discount_percentage) AS discount_percentage,
            max(sales_data_raw.tax) AS tax,
            max(sales_data_raw.hsn_code) AS hsn_code,
            max(sales_data_raw.product_type) AS product_type,
            max(sales_data_raw.purchase_cost_per_unit_ex_gst) AS purchase_cost_per_unit_ex_gst,
            (max(sales_data_raw.current_stock) - sum(sales_data_raw.quantity)) AS current_stock
           FROM sales_data_raw
          GROUP BY sales_data_raw.order_id, sales_data_raw.order_date, sales_data_raw.product_id, sales_data_raw.product_name
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY aggregated_sales.order_date))::text, 2, '0'::text)) AS serial_no,
            aggregated_sales.order_id,
            date(aggregated_sales.order_date) AS date,
            aggregated_sales.product_name,
            aggregated_sales.quantity,
            aggregated_sales.unit_price_ex_gst,
            aggregated_sales.gst_percentage,
            round((aggregated_sales.unit_price_ex_gst * (aggregated_sales.quantity)::numeric), 2) AS taxable_value,
            round(((((aggregated_sales.unit_price_ex_gst * (aggregated_sales.quantity)::numeric) * aggregated_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((aggregated_sales.unit_price_ex_gst * (aggregated_sales.quantity)::numeric) * aggregated_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((aggregated_sales.unit_price_ex_gst * (aggregated_sales.quantity)::numeric) * ((1)::numeric + (aggregated_sales.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            aggregated_sales.discount_percentage,
            aggregated_sales.tax,
            aggregated_sales.hsn_code,
            aggregated_sales.product_type,
            aggregated_sales.mrp_incl_gst,
            aggregated_sales.discounted_sales_rate_ex_gst,
            round((((aggregated_sales.quantity)::numeric * aggregated_sales.unit_price_ex_gst) * ((1)::numeric + (aggregated_sales.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            aggregated_sales.current_stock AS stock,
            round(((aggregated_sales.current_stock)::numeric * aggregated_sales.purchase_cost_per_unit_ex_gst), 2) AS stock_taxable_value
           FROM aggregated_sales
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount_percentage,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.stock,
    final_sales.stock_taxable_value
   FROM final_sales;


--
-- Name: sales_history_final_new_final; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_final_new_final AS
 WITH sales_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            (item.value ->> 'service_name'::text) AS product_name,
            sum(((item.value ->> 'quantity'::text))::integer) AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            COALESCE((po.current_stock)::integer, 0) AS stock_before_sale,
            pm."Purchase_Cost/Unit(Ex.GST)" AS purchase_cost_per_unit_ex_gst
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
          GROUP BY po.id, po.date, (item.value ->> 'service_id'::text), (item.value ->> 'service_name'::text), (item.value ->> 'price'::text), (item.value ->> 'gst_percentage'::text), (item.value ->> 'mrp_incl_gst'::text), (item.value ->> 'unit_price'::text), po.discount_percentage, po.tax, pm.hsn_code, pm.units, po.type, po.current_stock, pm."Purchase_Cost/Unit(Ex.GST)"
        ), sales_with_serial AS (
         SELECT sales_data.order_id,
            sales_data.order_date,
            sales_data.product_id,
            sales_data.product_name,
            sales_data.quantity,
            sales_data.unit_price_ex_gst,
            sales_data.gst_percentage,
            sales_data.mrp_incl_gst,
            sales_data.discounted_sales_rate_ex_gst,
            sales_data.discount_percentage,
            sales_data.tax,
            sales_data.hsn_code,
            sales_data.product_type,
            sales_data.type,
            sales_data.stock_before_sale,
            sales_data.purchase_cost_per_unit_ex_gst,
            row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
           FROM sales_data
        ), total_sold_per_product AS (
         SELECT sales_with_serial.product_id,
            sum(sales_with_serial.quantity) AS total_sold
           FROM sales_with_serial
          GROUP BY sales_with_serial.product_id
        ), cumulative_sales AS (
         SELECT s.order_id,
            s.order_date,
            s.product_id,
            s.product_name,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.stock_before_sale,
            s.purchase_cost_per_unit_ex_gst,
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (sales_with_serial s
             JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY cumulative_sales.order_date))::text, 2, '0'::text)) AS serial_no,
            cumulative_sales.order_id,
            date(cumulative_sales.order_date) AS date,
            cumulative_sales.product_name,
            cumulative_sales.quantity,
            cumulative_sales.unit_price_ex_gst,
            cumulative_sales.gst_percentage,
            round((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric), 2) AS taxable_value,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            cumulative_sales.discount_percentage,
            cumulative_sales.tax,
            cumulative_sales.hsn_code,
            cumulative_sales.product_type,
            cumulative_sales.mrp_incl_gst,
            cumulative_sales.discounted_sales_rate_ex_gst,
            round((((cumulative_sales.quantity)::numeric * cumulative_sales.unit_price_ex_gst) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            (cumulative_sales.stock_before_sale - cumulative_sales.quantity) AS stock,
            round((((cumulative_sales.stock_before_sale - cumulative_sales.quantity))::numeric * cumulative_sales.purchase_cost_per_unit_ex_gst), 2) AS stock_taxable_value
           FROM cumulative_sales
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount_percentage,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.stock,
    final_sales.stock_taxable_value
   FROM final_sales;


--
-- Name: sales_history_final_tes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_final_tes AS
 WITH sales_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            item.value AS item,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::bigint AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.product_type,
            po.type,
            (item.value ->> 'service_name'::text) AS product_name,
            (COALESCE((po.current_stock)::integer, 0) - ((item.value ->> 'quantity'::text))::integer) AS current_stock,
            pm."Purchase_Cost/Unit(Ex.GST)" AS purchase_cost_per_unit_ex_gst
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), sales_with_serial AS (
         SELECT sales_data.order_id,
            sales_data.order_date,
            sales_data.item,
            sales_data.product_id,
            sales_data.quantity,
            sales_data.unit_price_ex_gst,
            sales_data.gst_percentage,
            sales_data.mrp_incl_gst,
            sales_data.discounted_sales_rate_ex_gst,
            sales_data.discount_percentage,
            sales_data.tax,
            sales_data.hsn_code,
            sales_data.product_type,
            sales_data.type,
            sales_data.product_name,
            sales_data.current_stock,
            sales_data.purchase_cost_per_unit_ex_gst,
            row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
           FROM sales_data
        ), total_sold_per_product AS (
         SELECT sales_with_serial.product_id,
            sum(sales_with_serial.quantity) AS total_sold
           FROM sales_with_serial
          GROUP BY sales_with_serial.product_id
        ), cumulative_sales AS (
         SELECT s.order_id,
            s.order_date,
            s.item,
            s.product_id,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.product_name,
            s.current_stock,
            s.purchase_cost_per_unit_ex_gst,
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (sales_with_serial s
             JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY cumulative_sales.order_date))::text, 2, '0'::text)) AS serial_no,
            cumulative_sales.order_id,
            date(cumulative_sales.order_date) AS date,
            cumulative_sales.product_name,
            cumulative_sales.quantity,
            cumulative_sales.unit_price_ex_gst,
            cumulative_sales.gst_percentage,
            round((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric), 2) AS taxable_value,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            cumulative_sales.discount_percentage,
            cumulative_sales.tax,
            cumulative_sales.hsn_code,
            cumulative_sales.product_type,
            cumulative_sales.mrp_incl_gst,
            cumulative_sales.discounted_sales_rate_ex_gst,
            round((((cumulative_sales.quantity)::numeric * cumulative_sales.unit_price_ex_gst) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            cumulative_sales.current_stock AS stock,
            round(((cumulative_sales.current_stock)::numeric * cumulative_sales.purchase_cost_per_unit_ex_gst), 2) AS stock_taxable_value
           FROM cumulative_sales
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount_percentage,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.stock,
    final_sales.stock_taxable_value
   FROM final_sales;


--
-- Name: sales_history_final_test; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_final_test AS
 WITH sales_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            item.value AS item,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::integer AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            (item.value ->> 'service_name'::text) AS product_name,
            (COALESCE((po.current_stock)::integer, 0) - ((item.value ->> 'quantity'::text))::integer) AS current_stock_after_sale
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), sales_with_serial AS (
         SELECT sales_data.order_id,
            sales_data.order_date,
            sales_data.item,
            sales_data.product_id,
            sales_data.quantity,
            sales_data.unit_price_ex_gst,
            sales_data.gst_percentage,
            sales_data.mrp_incl_gst,
            sales_data.discounted_sales_rate_ex_gst,
            sales_data.discount_percentage,
            sales_data.tax,
            sales_data.hsn_code,
            sales_data.product_type,
            sales_data.type,
            sales_data.product_name,
            sales_data.current_stock_after_sale,
            row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
           FROM sales_data
        ), total_sold_per_product AS (
         SELECT sales_with_serial.product_id,
            sum(sales_with_serial.quantity) AS total_sold
           FROM sales_with_serial
          GROUP BY sales_with_serial.product_id
        ), cumulative_sales AS (
         SELECT s.order_id,
            s.order_date,
            s.item,
            s.product_id,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.product_name,
            s.current_stock_after_sale,
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (sales_with_serial s
             JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY cumulative_sales.order_date))::text, 2, '0'::text)) AS serial_no,
            cumulative_sales.order_id,
            date(cumulative_sales.order_date) AS date,
            cumulative_sales.product_name,
            cumulative_sales.quantity,
            cumulative_sales.unit_price_ex_gst,
            cumulative_sales.gst_percentage,
            round((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric), 2) AS taxable_value,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            cumulative_sales.discount_percentage,
            cumulative_sales.tax,
            cumulative_sales.hsn_code,
            cumulative_sales.product_type,
            cumulative_sales.mrp_incl_gst,
            cumulative_sales.discounted_sales_rate_ex_gst,
            round((((cumulative_sales.quantity)::numeric * cumulative_sales.unit_price_ex_gst) * ((1)::numeric + (cumulative_sales.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            cumulative_sales.current_stock_after_sale AS current_stock,
            round((((cumulative_sales.unit_price_ex_gst * (cumulative_sales.quantity)::numeric) * cumulative_sales.discount_percentage) / (100)::numeric), 2) AS discount_value
           FROM cumulative_sales
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount_percentage,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.current_stock,
    final_sales.discount_value
   FROM final_sales;


--
-- Name: sales_history_final_test2; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_final_test2 AS
 WITH sales_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            item.value AS item,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::integer AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            (item.value ->> 'service_name'::text) AS product_name,
            (COALESCE((po.current_stock)::integer, 0) - ((item.value ->> 'quantity'::text))::integer) AS current_stock_after_sale
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), sales_with_serial AS (
         SELECT sales_data.order_id,
            sales_data.order_date,
            sales_data.item,
            sales_data.product_id,
            sales_data.quantity,
            sales_data.unit_price_ex_gst,
            sales_data.gst_percentage,
            sales_data.mrp_incl_gst,
            sales_data.discounted_sales_rate_ex_gst,
            sales_data.discount_percentage,
            sales_data.tax,
            sales_data.hsn_code,
            sales_data.product_type,
            sales_data.type,
            sales_data.product_name,
            sales_data.current_stock_after_sale,
            row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
           FROM sales_data
        ), total_sold_per_product AS (
         SELECT sales_with_serial.product_id,
            sum(sales_with_serial.quantity) AS total_sold
           FROM sales_with_serial
          GROUP BY sales_with_serial.product_id
        ), cumulative_sales AS (
         SELECT s.order_id,
            s.order_date,
            s.item,
            s.product_id,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.product_name,
            s.current_stock_after_sale,
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (sales_with_serial s
             JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
        ), stock_data AS (
         SELECT purchase_history_with_stock.product_id,
            purchase_history_with_stock.computed_stock_taxable_value,
            purchase_history_with_stock.computed_stock_cgst,
            purchase_history_with_stock.computed_stock_sgst,
            purchase_history_with_stock.computed_stock_total_value
           FROM public.purchase_history_with_stock
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY cs.order_date))::text, 2, '0'::text)) AS serial_no,
            cs.order_id,
            date(cs.order_date) AS date,
            cs.product_name,
            cs.quantity,
            cs.unit_price_ex_gst,
            cs.gst_percentage,
            round((cs.unit_price_ex_gst * (cs.quantity)::numeric), 2) AS taxable_value,
            round(((((cs.unit_price_ex_gst * (cs.quantity)::numeric) * cs.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((cs.unit_price_ex_gst * (cs.quantity)::numeric) * cs.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((cs.unit_price_ex_gst * (cs.quantity)::numeric) * ((1)::numeric + (cs.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            round((((cs.unit_price_ex_gst * (cs.quantity)::numeric) * cs.discount_percentage) / (100)::numeric), 2) AS discount,
            cs.tax,
            cs.hsn_code,
            cs.product_type,
            cs.mrp_incl_gst,
            cs.discounted_sales_rate_ex_gst,
            round((((cs.quantity)::numeric * cs.unit_price_ex_gst) * ((1)::numeric + (cs.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            cs.current_stock_after_sale AS current_stock,
            sd.computed_stock_taxable_value AS taxable_value_current_stock,
            sd.computed_stock_cgst AS cgst_current_stock,
            sd.computed_stock_sgst AS sgst_current_stock,
            sd.computed_stock_total_value AS total_value_current_stock
           FROM (cumulative_sales cs
             LEFT JOIN stock_data sd ON ((sd.product_id = cs.product_id)))
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.current_stock,
    final_sales.taxable_value_current_stock,
    final_sales.cgst_current_stock,
    final_sales.sgst_current_stock,
    final_sales.total_value_current_stock
   FROM final_sales;


--
-- Name: sales_history_final_test3; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_final_test3 AS
 WITH sales_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            item.value AS item,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::integer AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            (item.value ->> 'service_name'::text) AS product_name,
            (COALESCE((po.current_stock)::integer, 0) - ((item.value ->> 'quantity'::text))::integer) AS current_stock_after_sale
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), sales_with_serial AS (
         SELECT sales_data.order_id,
            sales_data.order_date,
            sales_data.item,
            sales_data.product_id,
            sales_data.quantity,
            sales_data.unit_price_ex_gst,
            sales_data.gst_percentage,
            sales_data.mrp_incl_gst,
            sales_data.discounted_sales_rate_ex_gst,
            sales_data.discount_percentage,
            sales_data.tax,
            sales_data.hsn_code,
            sales_data.product_type,
            sales_data.type,
            sales_data.product_name,
            sales_data.current_stock_after_sale,
            row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
           FROM sales_data
        ), total_sold_per_product AS (
         SELECT sales_with_serial.product_id,
            sum(sales_with_serial.quantity) AS total_sold
           FROM sales_with_serial
          GROUP BY sales_with_serial.product_id
        ), cumulative_sales AS (
         SELECT s.order_id,
            s.order_date,
            s.item,
            s.product_id,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.product_name,
            s.current_stock_after_sale,
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (sales_with_serial s
             JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
        ), joined_with_purchase AS (
         SELECT c.order_id,
            c.order_date,
            c.item,
            c.product_id,
            c.quantity,
            c.unit_price_ex_gst,
            c.gst_percentage,
            c.mrp_incl_gst,
            c.discounted_sales_rate_ex_gst,
            c.discount_percentage,
            c.tax,
            c.hsn_code,
            c.product_type,
            c.type,
            c.product_name,
            c.current_stock_after_sale,
            c.rn,
            c.total_sold,
            c.cumulative_quantity_sold,
            p.purchase_taxable_value,
            p.current_stock_at_purchase,
            p.gst_percentage AS purchase_gst_percentage
           FROM (cumulative_sales c
             LEFT JOIN public.purchase_history_with_stock p ON ((c.product_id = p.product_id)))
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY joined_with_purchase.order_date))::text, 2, '0'::text)) AS serial_no,
            joined_with_purchase.order_id,
            date(joined_with_purchase.order_date) AS date,
            joined_with_purchase.product_name,
            joined_with_purchase.quantity,
            joined_with_purchase.unit_price_ex_gst,
            joined_with_purchase.gst_percentage,
            round(((joined_with_purchase.purchase_taxable_value / (NULLIF(joined_with_purchase.current_stock_at_purchase, 0))::numeric) * (joined_with_purchase.quantity)::numeric), 2) AS taxable_value,
            round((((((joined_with_purchase.purchase_taxable_value / (NULLIF(joined_with_purchase.current_stock_at_purchase, 0))::numeric) * (joined_with_purchase.quantity)::numeric) * joined_with_purchase.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round((((((joined_with_purchase.purchase_taxable_value / (NULLIF(joined_with_purchase.current_stock_at_purchase, 0))::numeric) * (joined_with_purchase.quantity)::numeric) * joined_with_purchase.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round((((joined_with_purchase.purchase_taxable_value / (NULLIF(joined_with_purchase.current_stock_at_purchase, 0))::numeric) * (joined_with_purchase.quantity)::numeric) * ((1)::numeric + (joined_with_purchase.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            joined_with_purchase.discount_percentage,
            joined_with_purchase.tax,
            joined_with_purchase.hsn_code,
            joined_with_purchase.product_type,
            joined_with_purchase.mrp_incl_gst,
            joined_with_purchase.discounted_sales_rate_ex_gst,
            round((((joined_with_purchase.quantity)::numeric * joined_with_purchase.unit_price_ex_gst) * ((1)::numeric + (joined_with_purchase.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            joined_with_purchase.current_stock_after_sale AS current_stock,
            joined_with_purchase.current_stock_after_sale AS stock,
            round(((joined_with_purchase.purchase_taxable_value / (NULLIF(joined_with_purchase.current_stock_at_purchase, 0))::numeric) * (joined_with_purchase.current_stock_after_sale)::numeric), 2) AS stock_taxable_value,
            round((((((joined_with_purchase.purchase_taxable_value / (NULLIF(joined_with_purchase.current_stock_at_purchase, 0))::numeric) * (joined_with_purchase.current_stock_after_sale)::numeric) * joined_with_purchase.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS stock_cgst,
            round((((((joined_with_purchase.purchase_taxable_value / (NULLIF(joined_with_purchase.current_stock_at_purchase, 0))::numeric) * (joined_with_purchase.current_stock_after_sale)::numeric) * joined_with_purchase.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS stock_sgst,
            round((((joined_with_purchase.purchase_taxable_value / (NULLIF(joined_with_purchase.current_stock_at_purchase, 0))::numeric) * (joined_with_purchase.current_stock_after_sale)::numeric) * ((1)::numeric + (joined_with_purchase.gst_percentage / (100)::numeric))), 2) AS stock_total_value
           FROM joined_with_purchase
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount_percentage,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.current_stock,
    final_sales.stock,
    final_sales.stock_taxable_value,
    final_sales.stock_cgst,
    final_sales.stock_sgst,
    final_sales.stock_total_value
   FROM final_sales;


--
-- Name: sales_history_fl; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_fl AS
 WITH sales_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            item.value AS item,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::integer AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'unit_price'::text))::numeric AS discounted_sales_rate_ex_gst,
            po.discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            (item.value ->> 'service_name'::text) AS product_name,
            COALESCE((po.current_stock)::integer, 0) AS current_stock
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), sales_with_serial AS (
         SELECT sales_data.order_id,
            sales_data.order_date,
            sales_data.item,
            sales_data.product_id,
            sales_data.quantity,
            sales_data.unit_price_ex_gst,
            sales_data.gst_percentage,
            sales_data.mrp_incl_gst,
            sales_data.discounted_sales_rate_ex_gst,
            sales_data.discount_percentage,
            sales_data.tax,
            sales_data.hsn_code,
            sales_data.product_type,
            sales_data.type,
            sales_data.product_name,
            sales_data.current_stock,
            row_number() OVER (PARTITION BY sales_data.product_id ORDER BY sales_data.order_date, sales_data.order_id) AS rn
           FROM sales_data
        ), total_sold_per_product AS (
         SELECT sales_with_serial.product_id,
            sum(sales_with_serial.quantity) AS total_sold
           FROM sales_with_serial
          GROUP BY sales_with_serial.product_id
        ), cumulative_sales AS (
         SELECT s.order_id,
            s.order_date,
            s.item,
            s.product_id,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.product_name,
            s.current_stock,
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (sales_with_serial s
             JOIN total_sold_per_product t ON ((s.product_id = t.product_id)))
        ), purchase_data AS (
         SELECT purchase_history_with_stock.product_id,
            max(purchase_history_with_stock.purchase_taxable_value) AS purchase_taxable_value,
            max(purchase_history_with_stock.purchase_cgst) AS purchase_cgst,
            max(purchase_history_with_stock.purchase_sgst) AS purchase_sgst
           FROM public.purchase_history_with_stock
          GROUP BY purchase_history_with_stock.product_id
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY s.order_date))::text, 2, '0'::text)) AS serial_no,
            s.order_id,
            date(s.order_date) AS date,
            s.product_name,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            round((s.unit_price_ex_gst * (s.quantity)::numeric), 2) AS taxable_value,
            round(((((s.unit_price_ex_gst * (s.quantity)::numeric) * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((s.unit_price_ex_gst * (s.quantity)::numeric) * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((s.unit_price_ex_gst * (s.quantity)::numeric) * ((1)::numeric + (s.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            round((((s.quantity)::numeric * s.unit_price_ex_gst) * ((1)::numeric + (s.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            s.current_stock AS stock,
            round(((s.current_stock)::numeric * p.purchase_taxable_value), 2) AS stock_taxable_value,
            round(((s.current_stock)::numeric * p.purchase_cgst), 2) AS stock_cgst,
            round(((s.current_stock)::numeric * p.purchase_sgst), 2) AS stock_sgst,
            round(((s.current_stock)::numeric * ((p.purchase_taxable_value + p.purchase_cgst) + p.purchase_sgst)), 2) AS stock_total_value
           FROM (cumulative_sales s
             LEFT JOIN purchase_data p ON ((s.product_id = p.product_id)))
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount_percentage,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.stock,
    final_sales.stock_taxable_value,
    final_sales.stock_cgst,
    final_sales.stock_sgst,
    final_sales.stock_total_value
   FROM final_sales;


--
-- Name: sales_history_grouped; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_history_grouped AS
 SELECT po.id AS order_id,
    row_number() OVER (ORDER BY po.created_at DESC) AS serial_no,
    (po.created_at)::date AS date,
    po.client_name,
    po.stylist_name,
    string_agg(DISTINCT (service_item.value ->> 'service_name'::text), ', '::text) AS combined_product_names,
    string_agg(DISTINCT (service_item.value ->> 'hsn_code'::text), ', '::text) FILTER (WHERE (((service_item.value ->> 'hsn_code'::text) IS NOT NULL) AND ((service_item.value ->> 'hsn_code'::text) <> ''::text))) AS combined_hsn_codes,
    sum(((service_item.value ->> 'quantity'::text))::numeric) AS total_quantity,
    sum((((service_item.value ->> 'price'::text))::numeric * ((service_item.value ->> 'quantity'::text))::numeric)) AS total_taxable_value,
    sum((((((service_item.value ->> 'price'::text))::numeric * ((service_item.value ->> 'quantity'::text))::numeric) * ((service_item.value ->> 'gst_percentage'::text))::numeric) / (200)::numeric)) AS total_cgst_amount,
    sum((((((service_item.value ->> 'price'::text))::numeric * ((service_item.value ->> 'quantity'::text))::numeric) * ((service_item.value ->> 'gst_percentage'::text))::numeric) / (200)::numeric)) AS total_sgst_amount,
    COALESCE(po.discount, (0)::double precision) AS total_discount,
    sum(((((service_item.value ->> 'price'::text))::numeric * ((service_item.value ->> 'quantity'::text))::numeric) * ((1)::numeric + (((service_item.value ->> 'gst_percentage'::text))::numeric / (100)::numeric)))) AS total_invoice_value,
    avg(((service_item.value ->> 'gst_percentage'::text))::numeric) AS gst_percentage,
    po.payment_method,
    po.status,
    po.total AS order_total
   FROM (public.pos_orders po
     CROSS JOIN LATERAL jsonb_array_elements(po.services) service_item(value))
  WHERE ((po.type = 'sale'::text) AND ((service_item.value ->> 'type'::text) = 'product'::text) AND (po.services IS NOT NULL) AND (jsonb_array_length(po.services) > 0))
  GROUP BY po.id, po.created_at, po.client_name, po.stylist_name, po.discount, po.payment_method, po.status, po.total
  ORDER BY po.created_at DESC;


--
-- Name: sales_product_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_product_data (
    serial_no text NOT NULL,
    order_id uuid,
    date date,
    product_name text,
    quantity integer,
    unit_price_ex_gst numeric,
    gst_percentage numeric,
    taxable_value numeric,
    cgst_amount numeric,
    sgst_amount numeric,
    total_purchase_cost numeric,
    discount numeric,
    tax numeric,
    hsn_code text,
    product_type text,
    mrp_incl_gst numeric,
    discounted_sales_rate_ex_gst numeric,
    invoice_value numeric,
    igst_amount numeric,
    initial_stock integer,
    remaining_stock integer,
    current_stock integer
);


--
-- Name: stock_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_snapshots (
    sale_order_id uuid NOT NULL,
    product_id uuid NOT NULL,
    order_date date NOT NULL,
    initial_stock bigint NOT NULL,
    current_stock bigint NOT NULL,
    total_sold bigint NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    quantity integer DEFAULT 1 NOT NULL,
    order_type character varying(20) DEFAULT 'sale'::character varying NOT NULL,
    CONSTRAINT stock_snapshots_immutable CHECK ((created_at = created_at))
);


--
-- Name: sales_product_new; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_product_new AS
 WITH base_sales AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            ((item.value ->> 'service_id'::text))::uuid AS product_id,
            sum(((item.value ->> 'quantity'::text))::integer) AS quantity,
            avg(((item.value ->> 'price'::text))::numeric) AS unit_price_ex_gst,
            avg(((item.value ->> 'gst_percentage'::text))::numeric) AS gst_percentage,
            avg(((item.value ->> 'mrp_incl_gst'::text))::numeric) AS mrp_incl_gst,
            avg(((item.value ->> 'unit_price'::text))::numeric) AS discounted_sales_rate_ex_gst,
            po.discount,
            po.tax,
            max(pm.hsn_code) AS hsn_code,
            max(pm.units) AS product_type,
            po.type,
            min((item.value ->> 'service_name'::text)) AS product_name
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
          WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
          GROUP BY po.id, po.date, ((item.value ->> 'service_id'::text))::uuid, po.discount, po.tax, po.type
        ), final_sales AS (
         SELECT ('SALES-'::text || lpad((row_number() OVER (ORDER BY s.order_date))::text, 2, '0'::text)) AS serial_no,
            s.order_id,
            date(s.order_date) AS date,
            s.product_name,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            round((s.unit_price_ex_gst * (s.quantity)::numeric), 2) AS taxable_value,
            round(((((s.unit_price_ex_gst * (s.quantity)::numeric) * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((s.unit_price_ex_gst * (s.quantity)::numeric) * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((s.unit_price_ex_gst * (s.quantity)::numeric) * ((1)::numeric + (s.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            s.discount,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            round((((s.quantity)::numeric * s.unit_price_ex_gst) * ((1)::numeric + (s.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            ss.initial_stock,
            ss.current_stock
           FROM (base_sales s
             JOIN public.stock_snapshots ss ON (((ss.sale_order_id = s.order_id) AND (ss.product_id = s.product_id))))
        )
 SELECT final_sales.serial_no,
    final_sales.order_id,
    final_sales.date,
    final_sales.product_name,
    final_sales.quantity,
    final_sales.unit_price_ex_gst,
    final_sales.gst_percentage,
    final_sales.taxable_value,
    final_sales.cgst_amount,
    final_sales.sgst_amount,
    final_sales.total_purchase_cost,
    final_sales.discount,
    final_sales.tax,
    final_sales.hsn_code,
    final_sales.product_type,
    final_sales.mrp_incl_gst,
    final_sales.discounted_sales_rate_ex_gst,
    final_sales.invoice_value,
    final_sales.igst_amount,
    final_sales.initial_stock,
    final_sales.current_stock
   FROM final_sales
  ORDER BY final_sales.date, final_sales.order_id;


--
-- Name: VIEW sales_product_new; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON VIEW public.sales_product_new IS 'View of product sales with additional fields for reporting including stock snapshots';


--
-- Name: sales_product_new_final_s; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_product_new_final_s AS
 SELECT po.id AS order_id,
    date(po.date) AS order_date,
    ((item.value ->> 'service_id'::text))::uuid AS product_id,
    (item.value ->> 'service_name'::text) AS product_name,
    ((item.value ->> 'quantity'::text))::integer AS quantity,
    ((item.value ->> 'unit_price'::text))::numeric AS unit_price,
    ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
    ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
    ((item.value ->> 'mrp_incl_gst'::text))::numeric AS mrp_incl_gst,
    NULL::numeric AS taxable_value,
    NULL::numeric AS cgst_amount,
    NULL::numeric AS sgst_amount,
    NULL::numeric AS igst_amount,
    NULL::numeric AS total_purchase_cost,
    NULL::numeric AS invoice_value,
    NULL::integer AS initial_stock,
    NULL::integer AS remaining_stock,
    po.discount,
    po.tax,
    pm.hsn_code,
    pm.units AS product_type,
    pm.stock_quantity AS current_stock,
    po.type
   FROM ((public.pos_orders po
     CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
     LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'service_id'::text))::uuid)))
  WHERE ((po.type = 'sale'::text) AND ((item.value ->> 'type'::text) = 'product'::text));


--
-- Name: sales_product_new_table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_product_new_table (
    serial_no text NOT NULL,
    order_id uuid,
    date date,
    product_name text,
    quantity integer,
    unit_price_ex_gst numeric,
    gst_percentage numeric,
    taxable_value numeric,
    cgst_amount numeric,
    sgst_amount numeric,
    total_purchase_cost numeric,
    discount numeric,
    tax numeric,
    hsn_code text,
    product_type text,
    mrp_incl_gst numeric,
    discounted_sales_rate_ex_gst numeric,
    invoice_value numeric,
    igst_amount numeric,
    initial_stock integer,
    remaining_stock integer,
    current_stock integer
);


--
-- Name: sales_product_stock_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.sales_product_stock_view AS
 WITH order_items AS (
         SELECT po.id AS order_id,
            po.created_at AS order_date,
            jsonb_array_elements(po.services) AS service_item
           FROM public.pos_orders po
          WHERE (po.type = 'sale'::text)
        ), extracted_items AS (
         SELECT order_items.order_id,
            order_items.order_date,
            (order_items.service_item ->> 'product_id'::text) AS product_id,
            ((order_items.service_item ->> 'quantity'::text))::numeric AS quantity
           FROM order_items
        ), stock_before_sale AS (
         SELECT ei.order_id,
            ei.product_id,
            ei.order_date,
            ei.quantity,
            ( SELECT (psth."Quantity After Change")::numeric AS "Quantity After Change"
                   FROM public.product_stock_transaction_history psth
                  WHERE ((psth."Reference ID" = ei.product_id) AND ((psth."Date")::timestamp without time zone <= ei.order_date))
                  ORDER BY (psth."Date")::timestamp without time zone DESC
                 LIMIT 1) AS stock_at_sale_time
           FROM extracted_items ei
        ), running_remaining_stock AS (
         SELECT sbs.order_id,
            sbs.product_id,
            sbs.order_date,
            sbs.quantity,
            sbs.stock_at_sale_time,
            (sbs.stock_at_sale_time - sbs.quantity) AS remaining_stock
           FROM stock_before_sale sbs
        )
 SELECT running_remaining_stock.order_id,
    running_remaining_stock.order_date,
    running_remaining_stock.product_id,
    running_remaining_stock.quantity,
    running_remaining_stock.stock_at_sale_time,
    running_remaining_stock.remaining_stock
   FROM running_remaining_stock
  ORDER BY running_remaining_stock.order_date DESC, running_remaining_stock.product_id;


--
-- Name: sales_product_table; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sales_product_table (
    serial_no character varying(20) NOT NULL,
    order_id uuid,
    date date,
    product_name text,
    quantity integer,
    unit_price_ex_gst numeric,
    gst_percentage numeric,
    taxable_value numeric,
    cgst_amount numeric,
    sgst_amount numeric,
    total_purchase_cost numeric,
    discount numeric,
    tax numeric,
    hsn_code text,
    product_type text,
    mrp_incl_gst numeric,
    discounted_sales_rate_ex_gst numeric,
    invoice_value numeric,
    igst_amount numeric,
    initial_stock numeric,
    remaining_stock numeric,
    current_stock numeric
);


--
-- Name: salon_consumption_final; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_consumption_final AS
 WITH consumption_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            item.value AS item,
            ((item.value ->> 'id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::integer AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'price'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'price'::text))::numeric AS discounted_sales_rate_ex_gst,
            COALESCE(po.discount_percentage, (0)::numeric) AS discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            (item.value ->> 'name'::text) AS product_name,
            (COALESCE((po.current_stock)::integer, 0) - ((item.value ->> 'quantity'::text))::integer) AS current_stock,
            pm."Purchase_Cost/Unit(Ex.GST)"
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'id'::text))::uuid)))
          WHERE ((po.type = 'salon_consumption'::text) AND (po.is_salon_consumption = true) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), consumption_with_serial AS (
         SELECT consumption_data.order_id,
            consumption_data.order_date,
            consumption_data.item,
            consumption_data.product_id,
            consumption_data.quantity,
            consumption_data.unit_price_ex_gst,
            consumption_data.gst_percentage,
            consumption_data.mrp_incl_gst,
            consumption_data.discounted_sales_rate_ex_gst,
            consumption_data.discount_percentage,
            consumption_data.tax,
            consumption_data.hsn_code,
            consumption_data.product_type,
            consumption_data.type,
            consumption_data.product_name,
            consumption_data.current_stock,
            consumption_data."Purchase_Cost/Unit(Ex.GST)",
            row_number() OVER (PARTITION BY consumption_data.product_id ORDER BY consumption_data.order_date, consumption_data.order_id) AS rn
           FROM consumption_data
        ), total_consumed_per_product AS (
         SELECT consumption_with_serial.product_id,
            sum(consumption_with_serial.quantity) AS total_sold
           FROM consumption_with_serial
          GROUP BY consumption_with_serial.product_id
        ), cumulative_consumption AS (
         SELECT s.order_id,
            s.order_date,
            s.item,
            s.product_id,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.product_name,
            s.current_stock,
            s."Purchase_Cost/Unit(Ex.GST)",
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (consumption_with_serial s
             JOIN total_consumed_per_product t ON ((s.product_id = t.product_id)))
        ), final_consumption AS (
         SELECT ('CONSUMPTION-'::text || lpad((row_number() OVER (ORDER BY cumulative_consumption.order_date))::text, 2, '0'::text)) AS serial_no,
            cumulative_consumption.order_id,
            date(cumulative_consumption.order_date) AS date,
            cumulative_consumption.product_name,
            cumulative_consumption.quantity,
            cumulative_consumption.unit_price_ex_gst,
            cumulative_consumption.gst_percentage,
            round((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric), 2) AS taxable_value,
            round(((((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * cumulative_consumption.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * cumulative_consumption.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * ((1)::numeric + (cumulative_consumption.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            cumulative_consumption.discount_percentage,
            cumulative_consumption.tax,
            cumulative_consumption.hsn_code,
            cumulative_consumption.product_type,
            cumulative_consumption.mrp_incl_gst,
            cumulative_consumption.discounted_sales_rate_ex_gst,
            round((((cumulative_consumption.quantity)::numeric * cumulative_consumption.unit_price_ex_gst) * ((1)::numeric + (cumulative_consumption.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            cumulative_consumption.current_stock AS stock,
            round(((cumulative_consumption.current_stock)::numeric * cumulative_consumption."Purchase_Cost/Unit(Ex.GST)"), 2) AS stock_taxable_value,
            round((((((cumulative_consumption.current_stock)::numeric * cumulative_consumption."Purchase_Cost/Unit(Ex.GST)") * cumulative_consumption.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount_stock,
            round((((((cumulative_consumption.current_stock)::numeric * cumulative_consumption."Purchase_Cost/Unit(Ex.GST)") * cumulative_consumption.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount_stock
           FROM cumulative_consumption
        )
 SELECT final_consumption.serial_no,
    final_consumption.order_id,
    final_consumption.date,
    final_consumption.product_name,
    final_consumption.quantity,
    final_consumption.unit_price_ex_gst,
    final_consumption.gst_percentage,
    final_consumption.taxable_value,
    final_consumption.cgst_amount,
    final_consumption.sgst_amount,
    final_consumption.total_purchase_cost,
    final_consumption.discount_percentage,
    final_consumption.tax,
    final_consumption.hsn_code,
    final_consumption.product_type,
    final_consumption.mrp_incl_gst,
    final_consumption.discounted_sales_rate_ex_gst,
    final_consumption.invoice_value,
    final_consumption.igst_amount,
    final_consumption.stock,
    final_consumption.stock_taxable_value,
    final_consumption.cgst_amount_stock,
    final_consumption.sgst_amount_stock
   FROM final_consumption;


--
-- Name: salon_consumption_history; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_consumption_history AS
 WITH consumption_data AS (
         SELECT po.id AS order_id,
            po.date AS order_date,
            item.value AS item,
            ((item.value ->> 'id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::integer AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            ((item.value ->> 'price'::text))::numeric AS mrp_incl_gst,
            ((item.value ->> 'price'::text))::numeric AS discounted_sales_rate_ex_gst,
            COALESCE(po.discount_percentage, (0)::numeric) AS discount_percentage,
            po.tax,
            pm.hsn_code,
            pm.units AS product_type,
            po.type,
            (item.value ->> 'name'::text) AS product_name,
            (COALESCE((po.current_stock)::integer, 0) - ((item.value ->> 'quantity'::text))::integer) AS current_stock,
            pm."Purchase_Cost/Unit(Ex.GST)"
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((item.value ->> 'id'::text))::uuid)))
          WHERE ((po.type = 'salon_consumption'::text) AND (po.is_salon_consumption = true) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), consumption_with_serial AS (
         SELECT consumption_data.order_id,
            consumption_data.order_date,
            consumption_data.item,
            consumption_data.product_id,
            consumption_data.quantity,
            consumption_data.unit_price_ex_gst,
            consumption_data.gst_percentage,
            consumption_data.mrp_incl_gst,
            consumption_data.discounted_sales_rate_ex_gst,
            consumption_data.discount_percentage,
            consumption_data.tax,
            consumption_data.hsn_code,
            consumption_data.product_type,
            consumption_data.type,
            consumption_data.product_name,
            consumption_data.current_stock,
            consumption_data."Purchase_Cost/Unit(Ex.GST)",
            row_number() OVER (PARTITION BY consumption_data.product_id ORDER BY consumption_data.order_date, consumption_data.order_id) AS rn
           FROM consumption_data
        ), total_consumed_per_product AS (
         SELECT consumption_with_serial.product_id,
            sum(consumption_with_serial.quantity) AS total_sold
           FROM consumption_with_serial
          GROUP BY consumption_with_serial.product_id
        ), cumulative_consumption AS (
         SELECT s.order_id,
            s.order_date,
            s.item,
            s.product_id,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.type,
            s.product_name,
            s.current_stock,
            s."Purchase_Cost/Unit(Ex.GST)",
            s.rn,
            t.total_sold,
            sum(s.quantity) OVER (PARTITION BY s.product_id ORDER BY s.order_date, s.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_sold
           FROM (consumption_with_serial s
             JOIN total_consumed_per_product t ON ((s.product_id = t.product_id)))
        ), final_consumption AS (
         SELECT ('CONSUMPTION-'::text || lpad((row_number() OVER (ORDER BY s.order_date))::text, 2, '0'::text)) AS serial_no,
            s.order_id,
            date(s.order_date) AS date,
            s.product_name,
            s.quantity,
            s.unit_price_ex_gst,
            s.gst_percentage,
            round((s.unit_price_ex_gst * (s.quantity)::numeric), 2) AS taxable_value,
            round(((((s.unit_price_ex_gst * (s.quantity)::numeric) * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((s.unit_price_ex_gst * (s.quantity)::numeric) * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((s.unit_price_ex_gst * (s.quantity)::numeric) * ((1)::numeric + (s.gst_percentage / (100)::numeric))), 2) AS total_purchase_cost,
            s.discount_percentage,
            s.tax,
            s.hsn_code,
            s.product_type,
            s.mrp_incl_gst,
            s.discounted_sales_rate_ex_gst,
            round((((s.quantity)::numeric * s.unit_price_ex_gst) * ((1)::numeric + (s.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            s.current_stock AS stock,
            round(((s.current_stock)::numeric * pm."Purchase_Cost/Unit(Ex.GST)"), 2) AS stock_taxable_value,
            round((((((s.current_stock)::numeric * pm."Purchase_Cost/Unit(Ex.GST)") * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount_stock,
            round((((((s.current_stock)::numeric * pm."Purchase_Cost/Unit(Ex.GST)") * s.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount_stock
           FROM (cumulative_consumption s
             LEFT JOIN public.product_master pm ON ((s.product_id = pm.id)))
        )
 SELECT final_consumption.serial_no,
    final_consumption.order_id,
    final_consumption.date,
    final_consumption.product_name,
    final_consumption.quantity,
    final_consumption.unit_price_ex_gst,
    final_consumption.gst_percentage,
    final_consumption.taxable_value,
    final_consumption.cgst_amount,
    final_consumption.sgst_amount,
    final_consumption.total_purchase_cost,
    final_consumption.discount_percentage,
    final_consumption.tax,
    final_consumption.hsn_code,
    final_consumption.product_type,
    final_consumption.mrp_incl_gst,
    final_consumption.discounted_sales_rate_ex_gst,
    final_consumption.invoice_value,
    final_consumption.igst_amount,
    final_consumption.stock,
    final_consumption.stock_taxable_value,
    final_consumption.cgst_amount_stock,
    final_consumption.sgst_amount_stock
   FROM final_consumption;


--
-- Name: salon_consumption_new; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_consumption_new AS
 WITH consumption_data AS (
         SELECT po.id AS order_id,
            (po.created_at)::timestamp without time zone AS order_date,
            service.value AS service,
            ((service.value ->> 'id'::text))::uuid AS product_id,
            COALESCE(((service.value ->> 'quantity'::text))::integer, 1) AS quantity,
            ((service.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric) AS gst_percentage,
            pm.hsn_code,
            pm.units AS product_type,
            (service.value ->> 'name'::text) AS product_name,
            (COALESCE((po.current_stock)::integer, 0) - COALESCE(((service.value ->> 'quantity'::text))::integer, 1)) AS current_stock_after_consumption
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) service(value))
             LEFT JOIN public.product_master pm ON ((pm.id = ((service.value ->> 'id'::text))::uuid)))
          WHERE (((service.value ->> 'type'::text) = 'product'::text) AND (po.client_name = 'Salon Consumption'::text))
        ), consumption_with_serial AS (
         SELECT consumption_data.order_id,
            consumption_data.order_date,
            consumption_data.service,
            consumption_data.product_id,
            consumption_data.quantity,
            consumption_data.unit_price_ex_gst,
            consumption_data.gst_percentage,
            consumption_data.hsn_code,
            consumption_data.product_type,
            consumption_data.product_name,
            consumption_data.current_stock_after_consumption,
            row_number() OVER (PARTITION BY consumption_data.product_id ORDER BY consumption_data.order_date, consumption_data.order_id) AS rn
           FROM consumption_data
        ), total_consumed_per_product AS (
         SELECT consumption_with_serial.product_id,
            sum(consumption_with_serial.quantity) AS total_consumed
           FROM consumption_with_serial
          GROUP BY consumption_with_serial.product_id
        ), cumulative_consumption AS (
         SELECT c.order_id,
            c.order_date,
            c.service,
            c.product_id,
            c.quantity,
            c.unit_price_ex_gst,
            c.gst_percentage,
            c.hsn_code,
            c.product_type,
            c.product_name,
            c.current_stock_after_consumption,
            c.rn,
            t.total_consumed,
            sum(c.quantity) OVER (PARTITION BY c.product_id ORDER BY c.order_date, c.order_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_quantity_consumed
           FROM (consumption_with_serial c
             JOIN total_consumed_per_product t ON ((c.product_id = t.product_id)))
        ), final_consumption AS (
         SELECT ('SALON-'::text || lpad((row_number() OVER (ORDER BY cumulative_consumption.order_date))::text, 2, '0'::text)) AS "Requisition Voucher No.",
            cumulative_consumption.order_id,
            date(cumulative_consumption.order_date) AS "Date",
            cumulative_consumption.product_name AS "Product Name",
            cumulative_consumption.quantity AS "Consumption Qty.",
            cumulative_consumption.hsn_code AS "HSN_Code",
            round(cumulative_consumption.unit_price_ex_gst, 2) AS "Purchase_Cost_per_Unit_Ex_GST_Rs",
            cumulative_consumption.gst_percentage AS "Purchase_GST_Percentage",
            round((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric), 2) AS "Purchase_Taxable_Value_Rs",
            0 AS "Purchase_IGST_Rs",
            round((((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * cumulative_consumption.gst_percentage) / (200)::numeric), 2) AS "Purchase_CGST_Rs",
            round((((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * cumulative_consumption.gst_percentage) / (200)::numeric), 2) AS "Purchase_SGST_Rs",
            round(((cumulative_consumption.unit_price_ex_gst * (cumulative_consumption.quantity)::numeric) * ((1)::numeric + (cumulative_consumption.gst_percentage / (100)::numeric))), 2) AS "Total_Purchase_Cost_Rs",
            round((cumulative_consumption.unit_price_ex_gst * ((1)::numeric + (cumulative_consumption.gst_percentage / (100)::numeric))), 2) AS "Discounted_Sales_Rate_Rs",
            cumulative_consumption.current_stock_after_consumption AS "Current_Stock"
           FROM cumulative_consumption
        )
 SELECT final_consumption."Requisition Voucher No.",
    final_consumption.order_id,
    final_consumption."Date",
    final_consumption."Product Name",
    final_consumption."Consumption Qty.",
    final_consumption."HSN_Code",
    final_consumption."Purchase_Cost_per_Unit_Ex_GST_Rs",
    final_consumption."Purchase_GST_Percentage",
    final_consumption."Purchase_Taxable_Value_Rs",
    final_consumption."Purchase_IGST_Rs",
    final_consumption."Purchase_CGST_Rs",
    final_consumption."Purchase_SGST_Rs",
    final_consumption."Total_Purchase_Cost_Rs",
    final_consumption."Discounted_Sales_Rate_Rs",
    final_consumption."Current_Stock"
   FROM final_consumption;


--
-- Name: salon_consumption_products; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_consumption_products AS
 SELECT ('SALON-'::text || lpad((row_number() OVER (ORDER BY po.created_at))::text, 2, '0'::text)) AS "Requisition Voucher No.",
    po.id AS order_id,
    (po.created_at)::timestamp without time zone AS "Date",
    (service.value ->> 'service_name'::text) AS "Product Name",
    pm.units AS "Product Type",
    COALESCE(((service.value ->> 'quantity'::text))::integer, 1) AS "Consumption Qty.",
    pm.hsn_code AS "HSN_Code",
    pm.mrp_incl_gst AS "MRP_Inclusive_GST_Rs",
    ((service.value ->> 'price'::text))::numeric AS "Purchase_Cost_per_Unit_Ex_GST_Rs",
    COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric) AS "Purchase_GST_Percentage",
    round((((service.value ->> 'price'::text))::numeric * (COALESCE(((service.value ->> 'quantity'::text))::integer, 1))::numeric), 2) AS "Purchase_Taxable_Value_Rs",
    0 AS "Purchase_IGST_Rs",
    round((((((service.value ->> 'price'::text))::numeric * (COALESCE(((service.value ->> 'quantity'::text))::integer, 1))::numeric) * COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric)) / (200)::numeric), 2) AS "Purchase_CGST_Rs",
    round((((((service.value ->> 'price'::text))::numeric * (COALESCE(((service.value ->> 'quantity'::text))::integer, 1))::numeric) * COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric)) / (200)::numeric), 2) AS "Purchase_SGST_Rs",
    round(((((service.value ->> 'price'::text))::numeric * (COALESCE(((service.value ->> 'quantity'::text))::integer, 1))::numeric) * ((1)::numeric + (COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric) / (100)::numeric))), 2) AS "Total_Purchase_Cost_Rs",
    round((((service.value ->> 'price'::text))::numeric * ((1)::numeric + (COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric) / (100)::numeric))), 2) AS "Discounted_Sales_Rate_Rs",
    pm.stock_quantity AS "Initial_Stock",
    pm.stock_quantity AS "Current_Stock",
    ((pm.stock_quantity + 1) - sum(COALESCE(((service.value ->> 'quantity'::text))::integer, 1)) OVER (PARTITION BY (service.value ->> 'service_name'::text) ORDER BY po.created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)) AS "Remaining_Stock",
    round(((((pm.stock_quantity + 1) - sum(COALESCE(((service.value ->> 'quantity'::text))::integer, 1)) OVER (PARTITION BY (service.value ->> 'service_name'::text) ORDER BY po.created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)))::numeric * ((((service.value ->> 'price'::text))::numeric * COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric)) / (200)::numeric)), 2) AS "Remaining_Stock_CGST_Rs",
    round(((((pm.stock_quantity + 1) - sum(COALESCE(((service.value ->> 'quantity'::text))::integer, 1)) OVER (PARTITION BY (service.value ->> 'service_name'::text) ORDER BY po.created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)))::numeric * ((((service.value ->> 'price'::text))::numeric * COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric)) / (200)::numeric)), 2) AS "Remaining_Stock_SGST_Rs",
    0 AS "Remaining_Stock_IGST_Rs",
    round(((((pm.stock_quantity + 1) - sum(COALESCE(((service.value ->> 'quantity'::text))::integer, 1)) OVER (PARTITION BY (service.value ->> 'service_name'::text) ORDER BY po.created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)))::numeric * (((service.value ->> 'price'::text))::numeric * ((1)::numeric + (COALESCE(((service.value ->> 'gst_percentage'::text))::numeric, (18)::numeric) / (100)::numeric)))), 2) AS "Total_Remaining_Stock_Value_Rs"
   FROM ((public.pos_orders po
     CROSS JOIN LATERAL jsonb_array_elements(
        CASE
            WHEN (jsonb_typeof(po.services) = 'array'::text) THEN po.services
            ELSE jsonb_build_array(po.services)
        END) service(value))
     JOIN public.product_master pm ON ((pm.name = (service.value ->> 'service_name'::text))))
  WHERE ((po.services IS NOT NULL) AND ((service.value ->> 'type'::text) = 'product'::text) AND (po.type = 'salon_consumption'::text) AND (po.status = 'completed'::text));


--
-- Name: salon_consumption_stock_viewh; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_consumption_stock_viewh AS
 WITH pos_data AS (
         SELECT row_number() OVER (ORDER BY po.date) AS serial_no,
            po.id AS order_id,
            po.date,
            (svc.value ->> 'name'::text) AS product_name,
            ((svc.value ->> 'quantity'::text))::integer AS quantity,
            'product'::text AS product_type,
            ((svc.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            po.consumption_purpose,
            pm.id AS product_id
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) svc(value))
             JOIN public.product_master pm ON (((svc.value ->> 'name'::text) = pm.name)))
          WHERE (po.type = 'salon_consumption'::text)
        ), stock_with_prev AS (
         SELECT pst.product_id,
            pst.created_at_tz AS stock_date,
            pst.previous_stock,
            pst.new_stock
           FROM public.product_stock_transactions pst
          WHERE ((pst.transaction_type)::text = 'reduction'::text)
        ), latest_stock AS (
         SELECT DISTINCT ON (pd.serial_no) pd.serial_no,
            pd.order_id,
            pd.date,
            pd.product_name,
            pd.quantity,
            pd.product_type,
            pd.unit_price_ex_gst,
            pd.consumption_purpose,
            COALESCE(swp.previous_stock, 0) AS initial_stock,
            swp.new_stock AS current_stock
           FROM (pos_data pd
             LEFT JOIN stock_with_prev swp ON (((pd.product_id = swp.product_id) AND (swp.stock_date <= pd.date))))
          ORDER BY pd.serial_no, swp.stock_date DESC
        )
 SELECT latest_stock.serial_no,
    latest_stock.order_id,
    latest_stock.date,
    latest_stock.product_name,
    latest_stock.quantity,
    latest_stock.product_type,
    latest_stock.unit_price_ex_gst,
    latest_stock.consumption_purpose,
    latest_stock.initial_stock,
    latest_stock.current_stock
   FROM latest_stock
  ORDER BY latest_stock.serial_no;


--
-- Name: salon_consumption_stock_views; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_consumption_stock_views AS
 WITH pos_data AS (
         SELECT row_number() OVER (ORDER BY po.date) AS serial_no,
            po.id AS order_id,
            po.date,
            (svc.value ->> 'name'::text) AS product_name,
            ((svc.value ->> 'quantity'::text))::integer AS quantity,
            'product'::text AS product_type,
            ((svc.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            po.consumption_purpose,
            pm.id AS product_id,
            pm.stock_quantity AS initial_master_stock
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) svc(value))
             JOIN public.product_master pm ON (((svc.value ->> 'name'::text) = pm.name)))
          WHERE (po.type = 'salon_consumption'::text)
        ), cumulative_consumption AS (
         SELECT pd.serial_no,
            pd.order_id,
            pd.date,
            pd.product_name,
            pd.quantity,
            pd.product_type,
            pd.unit_price_ex_gst,
            pd.consumption_purpose,
            pd.initial_master_stock,
            pd.product_id,
            sum(pd.quantity) OVER (PARTITION BY pd.product_id ORDER BY pd.date) AS total_consumed
           FROM pos_data pd
        ), latest_stock AS (
         SELECT cc.serial_no,
            cc.order_id,
            cc.date,
            cc.product_name,
            cc.quantity,
            cc.product_type,
            cc.unit_price_ex_gst,
            cc.consumption_purpose,
            (cc.initial_master_stock - sum(cc.quantity) OVER (PARTITION BY cc.product_id ORDER BY cc.date ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING)) AS initial_stock,
            (cc.initial_master_stock - cc.total_consumed) AS current_stock
           FROM cumulative_consumption cc
        )
 SELECT latest_stock.serial_no,
    latest_stock.order_id,
    latest_stock.date,
    latest_stock.product_name,
    latest_stock.quantity,
    latest_stock.product_type,
    latest_stock.unit_price_ex_gst,
    latest_stock.consumption_purpose,
    latest_stock.initial_stock,
    latest_stock.current_stock
   FROM latest_stock
  ORDER BY latest_stock.serial_no;


--
-- Name: salon_consumption_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_consumption_view AS
 WITH consumption_data AS (
         SELECT po.id AS order_id,
            po.date AS consumption_date,
            item.value AS item,
            ((item.value ->> 'id'::text))::uuid AS product_id,
            ((item.value ->> 'quantity'::text))::integer AS quantity,
            ((item.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            ((item.value ->> 'gst_percentage'::text))::numeric AS gst_percentage,
            (item.value ->> 'hsn_code'::text) AS hsn_code,
            po.type,
            (item.value ->> 'type'::text) AS product_type,
            (item.value ->> 'name'::text) AS product_name,
            (po.current_stock)::integer AS current_stock_after_consumption
           FROM (public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) item(value))
          WHERE ((po.type = 'salon_consumption'::text) AND ((item.value ->> 'type'::text) = 'product'::text))
        ), consumption_with_serial AS (
         SELECT consumption_data.order_id,
            consumption_data.consumption_date,
            consumption_data.item,
            consumption_data.product_id,
            consumption_data.quantity,
            consumption_data.unit_price_ex_gst,
            consumption_data.gst_percentage,
            consumption_data.hsn_code,
            consumption_data.type,
            consumption_data.product_type,
            consumption_data.product_name,
            consumption_data.current_stock_after_consumption,
            row_number() OVER (PARTITION BY consumption_data.product_id ORDER BY consumption_data.consumption_date, consumption_data.order_id) AS rn
           FROM consumption_data
        ), final_consumption AS (
         SELECT ('CONSUME-'::text || lpad((row_number() OVER (ORDER BY consumption_with_serial.consumption_date))::text, 2, '0'::text)) AS serial_no,
            consumption_with_serial.order_id,
            date(consumption_with_serial.consumption_date) AS date,
            consumption_with_serial.product_name,
            consumption_with_serial.quantity,
            consumption_with_serial.unit_price_ex_gst,
            consumption_with_serial.gst_percentage,
            round((consumption_with_serial.unit_price_ex_gst * (consumption_with_serial.quantity)::numeric), 2) AS taxable_value,
            round(((((consumption_with_serial.unit_price_ex_gst * (consumption_with_serial.quantity)::numeric) * consumption_with_serial.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS cgst_amount,
            round(((((consumption_with_serial.unit_price_ex_gst * (consumption_with_serial.quantity)::numeric) * consumption_with_serial.gst_percentage) / (100)::numeric) / (2)::numeric), 2) AS sgst_amount,
            round(((consumption_with_serial.unit_price_ex_gst * (consumption_with_serial.quantity)::numeric) * ((1)::numeric + (consumption_with_serial.gst_percentage / (100)::numeric))), 2) AS total_cost,
            0 AS discount,
            0 AS tax,
            consumption_with_serial.hsn_code,
            consumption_with_serial.product_type,
            NULL::numeric AS mrp_incl_gst,
            NULL::numeric AS discounted_sales_rate_ex_gst,
            round((((consumption_with_serial.quantity)::numeric * consumption_with_serial.unit_price_ex_gst) * ((1)::numeric + (consumption_with_serial.gst_percentage / (100)::numeric))), 2) AS invoice_value,
            0 AS igst_amount,
            consumption_with_serial.current_stock_after_consumption AS current_stock
           FROM consumption_with_serial
        )
 SELECT final_consumption.serial_no,
    final_consumption.order_id,
    final_consumption.date,
    final_consumption.product_name,
    final_consumption.quantity,
    final_consumption.unit_price_ex_gst,
    final_consumption.gst_percentage,
    final_consumption.taxable_value,
    final_consumption.cgst_amount,
    final_consumption.sgst_amount,
    final_consumption.total_cost,
    final_consumption.discount,
    final_consumption.tax,
    final_consumption.hsn_code,
    final_consumption.product_type,
    final_consumption.mrp_incl_gst,
    final_consumption.discounted_sales_rate_ex_gst,
    final_consumption.invoice_value,
    final_consumption.igst_amount,
    final_consumption.current_stock
   FROM final_consumption;


--
-- Name: salon_stock_tracking; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.salon_stock_tracking AS
 WITH pos_data AS (
         SELECT row_number() OVER (ORDER BY po.date) AS serial_no,
            po.id AS order_id,
            po.date,
            (svc.value ->> 'name'::text) AS product_name,
            ((svc.value ->> 'quantity'::text))::integer AS quantity,
            'product'::text AS product_type,
            ((svc.value ->> 'price'::text))::numeric AS unit_price_ex_gst,
            po.consumption_purpose,
            pm.stock_quantity AS initial_stock
           FROM ((public.pos_orders po
             CROSS JOIN LATERAL jsonb_array_elements(po.services) svc(value))
             JOIN public.product_master pm ON (((svc.value ->> 'name'::text) = pm.name)))
          WHERE (po.type = 'salon_consumption'::text)
        ), stock_with_prev AS (
         SELECT product_stock_transaction_history.id,
            product_stock_transaction_history."Date",
            product_stock_transaction_history."Product Name",
            product_stock_transaction_history."Quantity Change",
            product_stock_transaction_history."Quantity After Change"
           FROM public.product_stock_transaction_history
          WHERE ((product_stock_transaction_history."Change Type")::text = 'reduction'::text)
        ), ranked_stock AS (
         SELECT pd.serial_no,
            pd.order_id,
            pd.date,
            pd.product_name,
            pd.quantity,
            pd.product_type,
            pd.unit_price_ex_gst,
            pd.consumption_purpose,
            pd.initial_stock,
            swp."Quantity After Change" AS current_stock
           FROM (pos_data pd
             LEFT JOIN stock_with_prev swp ON (((pd.product_name = swp."Product Name") AND (pd.date = (to_timestamp(swp."Date", 'MM/DD/YYYY, HH12:MI:SS AM'::text) AT TIME ZONE 'UTC'::text)))))
        )
 SELECT ranked_stock.serial_no,
    ranked_stock.order_id,
    ranked_stock.date,
    ranked_stock.product_name,
    ranked_stock.quantity,
    ranked_stock.product_type,
    ranked_stock.unit_price_ex_gst,
    ranked_stock.consumption_purpose,
    ranked_stock.initial_stock,
    ranked_stock.current_stock
   FROM ranked_stock
  ORDER BY ranked_stock.serial_no;


--
-- Name: service_collections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_collections (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: service_subcollections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.service_subcollections (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    collection_id uuid,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: services; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.services (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    duration integer NOT NULL,
    collection_id uuid,
    type text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    subcollection_id uuid,
    gender text,
    CONSTRAINT services_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text])))
);


--
-- Name: stock_deduction_debug_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_deduction_debug_log (
    id integer NOT NULL,
    "timestamp" timestamp with time zone DEFAULT now(),
    order_id uuid,
    product_id uuid,
    product_name text,
    requested_quantity integer,
    previous_stock integer,
    new_stock integer,
    actual_deduction integer,
    services_json text,
    notes text
);


--
-- Name: stock_deduction_debug_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_deduction_debug_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_deduction_debug_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_deduction_debug_log_id_seq OWNED BY public.stock_deduction_debug_log.id;


--
-- Name: stock_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_details (
    id integer NOT NULL,
    product_name character varying(100) NOT NULL,
    hsn_code character varying(20),
    units character varying(20)
);


--
-- Name: stock_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stock_details_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stock_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stock_details_id_seq OWNED BY public.stock_details.id;


--
-- Name: stock_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_history (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    product_id text NOT NULL,
    product_name text NOT NULL,
    previous_qty integer NOT NULL,
    current_qty integer NOT NULL,
    change_qty integer NOT NULL,
    change_type text NOT NULL,
    source text NOT NULL,
    reference_id text,
    notes text,
    created_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    hsn_code text,
    units text,
    serial_no text,
    gst_percentage numeric(5,2),
    taxable_value numeric(12,2),
    igst_amount numeric(12,2),
    cgst_amount numeric(12,2),
    sgst_amount numeric(12,2),
    stock_value_incl_gst numeric(12,2),
    consumption_type text,
    qty_change integer,
    stock_after integer,
    type character varying(255),
    invoice_id character varying(255)
);


--
-- Name: stock_history_view; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.stock_history_view AS
 SELECT stock_history.id,
    stock_history.date,
    stock_history.product_id,
    stock_history.product_name,
    stock_history.hsn_code,
    stock_history.units,
    stock_history.previous_qty,
    stock_history.current_qty,
    stock_history.change_qty,
    stock_history.change_type,
    stock_history.source,
    stock_history.reference_id,
    stock_history.notes,
    stock_history.created_at,
    stock_history.serial_no,
    stock_history.gst_percentage,
    stock_history.taxable_value,
    stock_history.igst_amount,
    stock_history.cgst_amount,
    stock_history.sgst_amount,
    stock_history.stock_value_incl_gst,
    stock_history.consumption_type
   FROM public.stock_history
  ORDER BY stock_history.date DESC;


--
-- Name: stock_reductions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stock_reductions (
    reduction_id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    product_name text NOT NULL,
    product_id text,
    hsn_code text,
    units text,
    reduction_qty integer NOT NULL,
    reduction_type text NOT NULL,
    reference_id text,
    invoice_no text,
    purchase_cost_per_unit_ex_gst double precision,
    purchase_gst_percentage double precision DEFAULT 18,
    purchase_taxable_value double precision,
    purchase_igst double precision DEFAULT 0,
    purchase_cgst double precision,
    purchase_sgst double precision,
    total_purchase_cost double precision,
    balance_qty_after_reduction integer,
    taxable_value double precision,
    igst_rs double precision DEFAULT 0,
    cgst_rs double precision,
    sgst_rs double precision,
    invoice_value double precision,
    notes text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: stylist_breaks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stylist_breaks (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    stylist_id uuid,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: stylist_holidays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stylist_holidays (
    id uuid NOT NULL,
    stylist_id uuid,
    holiday_date date NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: stylists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stylists (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    bio text,
    gender text,
    available boolean DEFAULT true,
    image_url text,
    specialties text[] DEFAULT '{}'::text[],
    breaks jsonb DEFAULT '[]'::jsonb,
    holidays jsonb DEFAULT '[]'::jsonb,
    CONSTRAINT stylists_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])))
);


--
-- Name: trigger_debug_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.trigger_debug_log (
    id integer NOT NULL,
    "timestamp" timestamp without time zone DEFAULT now(),
    operation text,
    details text,
    error_message text
);


--
-- Name: trigger_debug_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.trigger_debug_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: trigger_debug_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.trigger_debug_log_id_seq OWNED BY public.trigger_debug_log.id;


--
-- Name: vw_purchase_recalc; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_purchase_recalc AS
 SELECT p.purchase_id,
    p.date,
    p.product_name,
    p.hsn_code,
    p.units,
    p.purchase_invoice_number,
    p.purchase_qty,
    p.mrp_incl_gst,
    p.mrp_excl_gst,
    p.discount_on_purchase_percentage AS discount_percentage,
    p.gst_percentage,
    p.purchase_taxable_value,
    p.purchase_igst,
    p.purchase_cgst,
    p.purchase_sgst,
    p.purchase_invoice_value_rs,
    p.created_at,
    p.updated_at,
    ((( SELECT COALESCE(sum(p2.purchase_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_purchases p2
          WHERE (p2.product_name = p.product_name)) - ( SELECT COALESCE(sum(s.quantity), (0)::bigint) AS "coalesce"
           FROM public.inventory_sales_new s
          WHERE (s.product_name = p.product_name))) - ( SELECT COALESCE(sum(c.consumption_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_consumption c
          WHERE (c.product_name = p.product_name))) AS current_stock,
    pr.stock_quantity AS current_stock_from_products,
    p.mrp_excl_gst AS unit_taxable_value,
    (p.mrp_excl_gst * (p.gst_percentage / (100.0)::double precision)) AS unit_igst,
    (p.mrp_excl_gst * (p.gst_percentage / (200.0)::double precision)) AS unit_cgst,
    (p.mrp_excl_gst * (p.gst_percentage / (200.0)::double precision)) AS unit_sgst,
    (p.mrp_excl_gst * ((1)::double precision + (p.gst_percentage / (100.0)::double precision))) AS unit_invoice_value,
    ((p.mrp_excl_gst * (p.purchase_qty)::double precision) * ((1)::double precision - (p.discount_on_purchase_percentage / (100.0)::double precision))) AS computed_taxable_value,
        CASE
            WHEN (p.purchase_igst > (0)::double precision) THEN (((p.purchase_qty)::double precision * p.mrp_excl_gst) * (p.gst_percentage / (100.0)::double precision))
            ELSE (0)::double precision
        END AS computed_igst_amt,
        CASE
            WHEN (p.purchase_igst = (0)::double precision) THEN (((p.purchase_qty)::double precision * p.mrp_excl_gst) * (p.gst_percentage / (200.0)::double precision))
            ELSE (0)::double precision
        END AS computed_cgst_amt,
        CASE
            WHEN (p.purchase_igst = (0)::double precision) THEN (((p.purchase_qty)::double precision * p.mrp_excl_gst) * (p.gst_percentage / (200.0)::double precision))
            ELSE (0)::double precision
        END AS computed_sgst_amt,
    (((p.mrp_excl_gst * (p.purchase_qty)::double precision) * ((1)::double precision - (p.discount_on_purchase_percentage / (100.0)::double precision))) * ((1)::double precision + (p.gst_percentage / (100.0)::double precision))) AS computed_invoice_value,
    ((((( SELECT COALESCE(sum(p2.purchase_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_purchases p2
          WHERE (p2.product_name = p.product_name)) - ( SELECT COALESCE(sum(s.quantity), (0)::bigint) AS "coalesce"
           FROM public.inventory_sales_new s
          WHERE (s.product_name = p.product_name))) - ( SELECT COALESCE(sum(c.consumption_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_consumption c
          WHERE (c.product_name = p.product_name))))::double precision * p.mrp_excl_gst) AS computed_stock_taxable_value,
    (((((( SELECT COALESCE(sum(p2.purchase_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_purchases p2
          WHERE (p2.product_name = p.product_name)) - ( SELECT COALESCE(sum(s.quantity), (0)::bigint) AS "coalesce"
           FROM public.inventory_sales_new s
          WHERE (s.product_name = p.product_name))) - ( SELECT COALESCE(sum(c.consumption_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_consumption c
          WHERE (c.product_name = p.product_name))))::double precision * p.mrp_excl_gst) * (p.gst_percentage / (100.0)::double precision)) AS computed_stock_igst,
    (((((( SELECT COALESCE(sum(p2.purchase_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_purchases p2
          WHERE (p2.product_name = p.product_name)) - ( SELECT COALESCE(sum(s.quantity), (0)::bigint) AS "coalesce"
           FROM public.inventory_sales_new s
          WHERE (s.product_name = p.product_name))) - ( SELECT COALESCE(sum(c.consumption_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_consumption c
          WHERE (c.product_name = p.product_name))))::double precision * p.mrp_excl_gst) * (p.gst_percentage / (200.0)::double precision)) AS computed_stock_cgst,
    (((((( SELECT COALESCE(sum(p2.purchase_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_purchases p2
          WHERE (p2.product_name = p.product_name)) - ( SELECT COALESCE(sum(s.quantity), (0)::bigint) AS "coalesce"
           FROM public.inventory_sales_new s
          WHERE (s.product_name = p.product_name))) - ( SELECT COALESCE(sum(c.consumption_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_consumption c
          WHERE (c.product_name = p.product_name))))::double precision * p.mrp_excl_gst) * (p.gst_percentage / (200.0)::double precision)) AS computed_stock_sgst,
    (((((( SELECT COALESCE(sum(p2.purchase_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_purchases p2
          WHERE (p2.product_name = p.product_name)) - ( SELECT COALESCE(sum(s.quantity), (0)::bigint) AS "coalesce"
           FROM public.inventory_sales_new s
          WHERE (s.product_name = p.product_name))) - ( SELECT COALESCE(sum(c.consumption_qty), (0)::bigint) AS "coalesce"
           FROM public.inventory_consumption c
          WHERE (c.product_name = p.product_name))))::double precision * p.mrp_excl_gst) * ((1)::double precision + (p.gst_percentage / (100.0)::double precision))) AS computed_stock_total_value
   FROM (public.inventory_purchases p
     LEFT JOIN public.products pr ON ((p.product_name = pr.name)));


--
-- Name: vw_stock_transactions; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.vw_stock_transactions AS
 SELECT t.id,
    t.product_id,
    p.name AS product_name,
    p.hsn_code,
    t.transaction_type,
    t.display_type,
    t.source_type,
    t.quantity,
    t.previous_stock,
    t.new_stock,
    t.order_id,
    o.client_name,
    o.customer_name,
    t.notes,
    t.source,
    t.created_at,
    t.created_by
   FROM ((public.product_stock_transactions t
     LEFT JOIN public.product_master p ON ((t.product_id = p.id)))
     LEFT JOIN public.pos_orders o ON ((t.order_id = o.id)))
  ORDER BY t.created_at DESC;


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_06_11; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_06_11 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_06_12; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_06_12 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_06_13; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_06_13 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_06_14; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_06_14 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_06_15; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_06_15 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_06_16; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_06_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_06_17; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_06_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text,
    created_by text,
    idempotency_key text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: decrypted_secrets; Type: VIEW; Schema: vault; Owner: -
--

CREATE VIEW vault.decrypted_secrets AS
 SELECT secrets.id,
    secrets.name,
    secrets.description,
    secrets.secret,
        CASE
            WHEN (secrets.secret IS NULL) THEN NULL::text
            ELSE
            CASE
                WHEN (secrets.key_id IS NULL) THEN NULL::text
                ELSE convert_from(pgsodium.crypto_aead_det_decrypt(decode(secrets.secret, 'base64'::text), convert_to(((((secrets.id)::text || secrets.description) || (secrets.created_at)::text) || (secrets.updated_at)::text), 'utf8'::name), secrets.key_id, secrets.nonce), 'utf8'::name)
            END
        END AS decrypted_secret,
    secrets.key_id,
    secrets.nonce,
    secrets.created_at,
    secrets.updated_at
   FROM vault.secrets;


--
-- Name: messages_2025_06_11; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_11 FOR VALUES FROM ('2025-06-11 00:00:00') TO ('2025-06-12 00:00:00');


--
-- Name: messages_2025_06_12; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_12 FOR VALUES FROM ('2025-06-12 00:00:00') TO ('2025-06-13 00:00:00');


--
-- Name: messages_2025_06_13; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_13 FOR VALUES FROM ('2025-06-13 00:00:00') TO ('2025-06-14 00:00:00');


--
-- Name: messages_2025_06_14; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_14 FOR VALUES FROM ('2025-06-14 00:00:00') TO ('2025-06-15 00:00:00');


--
-- Name: messages_2025_06_15; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_15 FOR VALUES FROM ('2025-06-15 00:00:00') TO ('2025-06-16 00:00:00');


--
-- Name: messages_2025_06_16; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_16 FOR VALUES FROM ('2025-06-16 00:00:00') TO ('2025-06-17 00:00:00');


--
-- Name: messages_2025_06_17; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_06_17 FOR VALUES FROM ('2025-06-17 00:00:00') TO ('2025-06-18 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: admin_users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users ALTER COLUMN id SET DEFAULT nextval('public.admin_users_id_seq'::regclass);


--
-- Name: balance_stock id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_stock ALTER COLUMN id SET DEFAULT nextval('public.balance_stock_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: purchase_stock id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_stock ALTER COLUMN id SET DEFAULT nextval('public.purchase_stock_id_seq'::regclass);


--
-- Name: stock_deduction_debug_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_deduction_debug_log ALTER COLUMN id SET DEFAULT nextval('public.stock_deduction_debug_log_id_seq'::regclass);


--
-- Name: stock_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_details ALTER COLUMN id SET DEFAULT nextval('public.stock_details_id_seq'::regclass);


--
-- Name: trigger_debug_log id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trigger_debug_log ALTER COLUMN id SET DEFAULT nextval('public.trigger_debug_log_id_seq'::regclass);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- Name: appointment_clients appointment_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_clients
    ADD CONSTRAINT appointment_clients_pkey PRIMARY KEY (appointment_id, client_id);


--
-- Name: appointment_services appointment_services_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_id_key UNIQUE (id);


--
-- Name: appointment_services appointment_services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_pkey PRIMARY KEY (appointment_id, service_id);


--
-- Name: appointment_stylists appointment_stylists_appointment_id_stylist_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_stylists
    ADD CONSTRAINT appointment_stylists_appointment_id_stylist_id_key UNIQUE (appointment_id, stylist_id);


--
-- Name: appointment_stylists appointment_stylists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_stylists
    ADD CONSTRAINT appointment_stylists_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: auth auth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_pkey PRIMARY KEY (id);


--
-- Name: auth auth_username_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.auth
    ADD CONSTRAINT auth_username_key UNIQUE (username);


--
-- Name: balance_stock_data balance_stock_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_stock_data
    ADD CONSTRAINT balance_stock_data_pkey PRIMARY KEY (id);


--
-- Name: balance_stock_history balance_stock_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_stock_history
    ADD CONSTRAINT balance_stock_history_pkey PRIMARY KEY (id);


--
-- Name: balance_stock balance_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_stock
    ADD CONSTRAINT balance_stock_pkey PRIMARY KEY (id);


--
-- Name: balance_stock balance_stock_stock_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_stock
    ADD CONSTRAINT balance_stock_stock_id_key UNIQUE (stock_id);


--
-- Name: balance_stock_transactions balance_stock_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_stock_transactions
    ADD CONSTRAINT balance_stock_transactions_pkey PRIMARY KEY (id);


--
-- Name: breaks breaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.breaks
    ADD CONSTRAINT breaks_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: consumption consumption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consumption
    ADD CONSTRAINT consumption_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: expired_products expired_products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.expired_products
    ADD CONSTRAINT expired_products_pkey PRIMARY KEY (expired_id);


--
-- Name: inventory_consumption inventory_consumption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_consumption
    ADD CONSTRAINT inventory_consumption_pkey PRIMARY KEY (consumption_id);


--
-- Name: inventory_purchases inventory_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_purchases
    ADD CONSTRAINT inventory_purchases_pkey PRIMARY KEY (purchase_id);


--
-- Name: inventory_sales_new inventory_sales_new_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_sales_new
    ADD CONSTRAINT inventory_sales_new_pkey PRIMARY KEY (id);


--
-- Name: inventory_salon_consumption inventory_salon_consumption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_salon_consumption
    ADD CONSTRAINT inventory_salon_consumption_pkey PRIMARY KEY (id);


--
-- Name: inventory_transactions inventory_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);


--
-- Name: loyalty_points loyalty_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: membership_tiers membership_tiers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.membership_tiers
    ADD CONSTRAINT membership_tiers_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: notification_logs notification_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);


--
-- Name: order_stylists order_stylists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_stylists
    ADD CONSTRAINT order_stylists_pkey PRIMARY KEY (id);


--
-- Name: pos_order_items pos_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_pkey PRIMARY KEY (id);


--
-- Name: pos_orders pos_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_orders
    ADD CONSTRAINT pos_orders_pkey PRIMARY KEY (id);


--
-- Name: product_collections product_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_collections
    ADD CONSTRAINT product_collections_pkey PRIMARY KEY (id);


--
-- Name: product_stock_transactions product_stock_transactions_duplicate_protection_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock_transactions
    ADD CONSTRAINT product_stock_transactions_duplicate_protection_key_key UNIQUE (duplicate_protection_key);


--
-- Name: product_stock_transactions product_stock_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock_transactions
    ADD CONSTRAINT product_stock_transactions_pkey PRIMARY KEY (id);


--
-- Name: product_master products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_master
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: purchase_history_with_stock purchase_history_with_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_history_with_stock
    ADD CONSTRAINT purchase_history_with_stock_pkey PRIMARY KEY (purchase_id);


--
-- Name: purchase_stock purchase_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_stock
    ADD CONSTRAINT purchase_stock_pkey PRIMARY KEY (id);


--
-- Name: purchase_stock purchase_stock_purchase_invoice_no_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_stock
    ADD CONSTRAINT purchase_stock_purchase_invoice_no_key UNIQUE (purchase_invoice_no);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- Name: sales_product_data sales_product_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_product_data
    ADD CONSTRAINT sales_product_data_pkey PRIMARY KEY (serial_no);


--
-- Name: sales_product_new_table sales_product_new_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_product_new_table
    ADD CONSTRAINT sales_product_new_table_pkey PRIMARY KEY (serial_no);


--
-- Name: sales_product_table sales_product_table_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales_product_table
    ADD CONSTRAINT sales_product_table_pkey PRIMARY KEY (serial_no);


--
-- Name: service_collections service_collections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_collections
    ADD CONSTRAINT service_collections_pkey PRIMARY KEY (id);


--
-- Name: service_subcollections service_subcollections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subcollections
    ADD CONSTRAINT service_subcollections_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: stock_deduction_debug_log stock_deduction_debug_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_deduction_debug_log
    ADD CONSTRAINT stock_deduction_debug_log_pkey PRIMARY KEY (id);


--
-- Name: stock_details stock_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_details
    ADD CONSTRAINT stock_details_pkey PRIMARY KEY (id);


--
-- Name: stock_history stock_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_history
    ADD CONSTRAINT stock_history_pkey PRIMARY KEY (id);


--
-- Name: stock_reductions stock_reductions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_reductions
    ADD CONSTRAINT stock_reductions_pkey PRIMARY KEY (reduction_id);


--
-- Name: stock_snapshots stock_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_snapshots
    ADD CONSTRAINT stock_snapshots_pkey PRIMARY KEY (sale_order_id, product_id);


--
-- Name: stock_snapshots stock_snapshots_sale_order_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stock_snapshots
    ADD CONSTRAINT stock_snapshots_sale_order_id_product_id_key UNIQUE (sale_order_id, product_id);


--
-- Name: stylist_breaks stylist_breaks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stylist_breaks
    ADD CONSTRAINT stylist_breaks_pkey PRIMARY KEY (id);


--
-- Name: stylist_holidays stylist_holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stylist_holidays
    ADD CONSTRAINT stylist_holidays_pkey PRIMARY KEY (id);


--
-- Name: stylists stylists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stylists
    ADD CONSTRAINT stylists_pkey PRIMARY KEY (id);


--
-- Name: trigger_debug_log trigger_debug_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.trigger_debug_log
    ADD CONSTRAINT trigger_debug_log_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_11 messages_2025_06_11_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_06_11
    ADD CONSTRAINT messages_2025_06_11_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_12 messages_2025_06_12_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_06_12
    ADD CONSTRAINT messages_2025_06_12_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_13 messages_2025_06_13_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_06_13
    ADD CONSTRAINT messages_2025_06_13_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_14 messages_2025_06_14_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_06_14
    ADD CONSTRAINT messages_2025_06_14_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_15 messages_2025_06_15_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_06_15
    ADD CONSTRAINT messages_2025_06_15_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_16 messages_2025_06_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_06_16
    ADD CONSTRAINT messages_2025_06_16_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_06_17 messages_2025_06_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_06_17
    ADD CONSTRAINT messages_2025_06_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_idempotency_key_key; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_idempotency_key_key UNIQUE (idempotency_key);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_appointment_clients_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_clients_appointment_id ON public.appointment_clients USING btree (appointment_id);


--
-- Name: idx_appointment_clients_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_clients_client_id ON public.appointment_clients USING btree (client_id);


--
-- Name: idx_appointment_stylists_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_stylists_appointment_id ON public.appointment_stylists USING btree (appointment_id);


--
-- Name: idx_appointment_stylists_is_primary; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_stylists_is_primary ON public.appointment_stylists USING btree (is_primary);


--
-- Name: idx_appointment_stylists_stylist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointment_stylists_stylist_id ON public.appointment_stylists USING btree (stylist_id);


--
-- Name: idx_appointments_checked_in; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_checked_in ON public.appointments USING btree (checked_in);


--
-- Name: idx_appointments_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_client_id ON public.appointments USING btree (client_id);


--
-- Name: idx_appointments_paid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_paid ON public.appointments USING btree (paid);


--
-- Name: idx_appointments_reminder; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_reminder ON public.appointments USING btree (start_time, reminder_sent, status);


--
-- Name: idx_appointments_reminder_24h; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_reminder_24h ON public.appointments USING btree (start_time, reminder_24h_sent, status);


--
-- Name: idx_appointments_reminder_2h; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_reminder_2h ON public.appointments USING btree (start_time, reminder_2h_sent, status);


--
-- Name: idx_appointments_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_start_time ON public.appointments USING btree (start_time);


--
-- Name: idx_appointments_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);


--
-- Name: idx_appointments_stylist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_appointments_stylist_id ON public.appointments USING btree (stylist_id);


--
-- Name: idx_balance_stock_data_product_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_balance_stock_data_product_name ON public.balance_stock_data USING btree (product_name);


--
-- Name: idx_balance_stock_history_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_balance_stock_history_date ON public.balance_stock_history USING btree (transaction_time);


--
-- Name: idx_balance_stock_history_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_balance_stock_history_product ON public.balance_stock_history USING btree (product_name);


--
-- Name: idx_breaks_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_breaks_start_time ON public.breaks USING btree (start_time);


--
-- Name: idx_breaks_stylist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_breaks_stylist_id ON public.breaks USING btree (stylist_id);


--
-- Name: idx_consumption_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_consumption_product_id ON public.consumption USING btree (product_id);


--
-- Name: idx_duplicate_protection; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_duplicate_protection ON public.product_stock_transactions USING btree (duplicate_protection_key) WHERE (duplicate_protection_key IS NOT NULL);


--
-- Name: idx_inventory_purchases_transaction_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_inventory_purchases_transaction_type ON public.inventory_purchases USING btree (transaction_type);


--
-- Name: idx_members_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_members_client_id ON public.members USING btree (client_id);


--
-- Name: idx_members_expiry; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_members_expiry ON public.members USING btree (expires_at);


--
-- Name: idx_members_tier_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_members_tier_id ON public.members USING btree (tier_id);


--
-- Name: idx_notification_logs_appointment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_logs_appointment_id ON public.notification_logs USING btree (appointment_id);


--
-- Name: idx_notification_logs_sent_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs USING btree (sent_at);


--
-- Name: idx_pos_order_items_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_order_items_order_id ON public.pos_order_items USING btree (order_id);


--
-- Name: idx_pos_orders_client_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_orders_client_name ON public.pos_orders USING btree (client_name);


--
-- Name: idx_pos_orders_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_orders_created_at ON public.pos_orders USING btree (created_at);


--
-- Name: idx_pos_orders_customer_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_orders_customer_name ON public.pos_orders USING btree (customer_name);


--
-- Name: idx_pos_orders_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pos_orders_status ON public.pos_orders USING btree (status);


--
-- Name: idx_product_stock_transactions_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_stock_transactions_created_at ON public.product_stock_transactions USING btree (created_at);


--
-- Name: idx_product_stock_transactions_order_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_stock_transactions_order_id ON public.product_stock_transactions USING btree (order_id);


--
-- Name: idx_product_stock_transactions_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_stock_transactions_product_id ON public.product_stock_transactions USING btree (product_id);


--
-- Name: idx_products_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_active ON public.product_master USING btree (active);


--
-- Name: idx_products_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_products_name ON public.product_master USING btree (name);


--
-- Name: idx_purchase_history_transaction_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchase_history_transaction_type ON public.purchase_history_with_stock USING btree (transaction_type);


--
-- Name: idx_purchases_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_purchases_product_id ON public.purchases USING btree (product_id);


--
-- Name: idx_sales_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_created_at ON public.sales USING btree (created_at);


--
-- Name: idx_sales_customer_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_customer_id ON public.sales USING btree (customer_id);


--
-- Name: idx_sales_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_product_id ON public.sales USING btree (product_id);


--
-- Name: idx_sales_salon_consumption; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_salon_consumption ON public.sales USING btree (is_salon_consumption);


--
-- Name: idx_sales_stylist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sales_stylist_id ON public.sales USING btree (stylist_id);


--
-- Name: idx_service_collections_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_collections_name ON public.service_collections USING btree (name);


--
-- Name: idx_service_subcollections_collection_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_service_subcollections_collection_id ON public.service_subcollections USING btree (collection_id);


--
-- Name: idx_services_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_active ON public.services USING btree (active);


--
-- Name: idx_services_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_services_category ON public.services USING btree (collection_id);


--
-- Name: idx_stock_history_change_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_history_change_type ON public.stock_history USING btree (change_type);


--
-- Name: idx_stock_history_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_history_date ON public.stock_history USING btree (date);


--
-- Name: idx_stock_history_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_history_product_id ON public.stock_history USING btree (product_id);


--
-- Name: idx_stock_history_product_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_history_product_name ON public.stock_history USING btree (product_name);


--
-- Name: idx_stock_history_source; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_history_source ON public.stock_history USING btree (source);


--
-- Name: idx_stock_reductions_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_reductions_date ON public.stock_reductions USING btree (date);


--
-- Name: idx_stock_reductions_product_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_reductions_product_name ON public.stock_reductions USING btree (product_name);


--
-- Name: idx_stock_reductions_reference_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_reductions_reference_id ON public.stock_reductions USING btree (reference_id);


--
-- Name: idx_stock_snapshots_order_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_snapshots_order_date ON public.stock_snapshots USING btree (order_date);


--
-- Name: idx_stock_snapshots_order_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_snapshots_order_type ON public.stock_snapshots USING btree (order_type);


--
-- Name: idx_stock_snapshots_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stock_snapshots_product_id ON public.stock_snapshots USING btree (product_id);


--
-- Name: idx_stylist_breaks_start_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stylist_breaks_start_time ON public.stylist_breaks USING btree (start_time);


--
-- Name: idx_stylist_breaks_stylist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stylist_breaks_stylist_id ON public.stylist_breaks USING btree (stylist_id);


--
-- Name: idx_stylist_holidays_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stylist_holidays_date ON public.stylist_holidays USING btree (holiday_date);


--
-- Name: idx_stylist_holidays_stylist_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stylist_holidays_stylist_id ON public.stylist_holidays USING btree (stylist_id);


--
-- Name: idx_unique_duplicate_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_unique_duplicate_key ON public.product_stock_transactions USING btree (duplicate_protection_key);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: messages_2025_06_11_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_11_pkey;


--
-- Name: messages_2025_06_12_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_12_pkey;


--
-- Name: messages_2025_06_13_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_13_pkey;


--
-- Name: messages_2025_06_14_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_14_pkey;


--
-- Name: messages_2025_06_15_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_15_pkey;


--
-- Name: messages_2025_06_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_16_pkey;


--
-- Name: messages_2025_06_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_06_17_pkey;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: balance_stock after_balance_stock_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_balance_stock_update AFTER UPDATE ON public.balance_stock FOR EACH ROW WHEN ((old.balance_qty IS DISTINCT FROM new.balance_qty)) EXECUTE FUNCTION public.log_balance_stock_reduction();


--
-- Name: product_stock_transactions after_insert_stock_transaction; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_insert_stock_transaction AFTER INSERT ON public.product_stock_transactions FOR EACH ROW EXECUTE FUNCTION public.monitor_product_stock_transaction();


--
-- Name: purchases after_purchase_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_purchase_insert AFTER INSERT ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.log_purchase_addition();


--
-- Name: sales after_sales_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_sales_insert AFTER INSERT ON public.sales FOR EACH ROW EXECUTE FUNCTION public.log_sales_reduction();


--
-- Name: balance_stock_data inventory_change_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER inventory_change_trigger AFTER UPDATE ON public.balance_stock_data FOR EACH ROW WHEN ((new.balance_quantity <> old.balance_quantity)) EXECUTE FUNCTION public.log_inventory_change();


--
-- Name: balance_stock_data new_inventory_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER new_inventory_trigger AFTER INSERT ON public.balance_stock_data FOR EACH ROW EXECUTE FUNCTION public.log_new_inventory();


--
-- Name: pos_orders process_pos_order_with_duplicates_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER process_pos_order_with_duplicates_trigger AFTER INSERT ON public.pos_orders FOR EACH ROW EXECUTE FUNCTION public.process_pos_order_with_duplicates();


--
-- Name: purchases purchases_stock_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER purchases_stock_update BEFORE INSERT ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_stock_on_purchase();


--
-- Name: product_master record_stock_on_product_insert_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER record_stock_on_product_insert_trigger AFTER INSERT ON public.product_master FOR EACH ROW EXECUTE FUNCTION public.record_product_stock_on_insert();


--
-- Name: pos_orders restore_pos_orders_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER restore_pos_orders_trigger BEFORE DELETE ON public.pos_orders FOR EACH ROW EXECUTE FUNCTION public.restore_pos_orders();


--
-- Name: pos_order_items restore_stock_on_order_item_delete_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER restore_stock_on_order_item_delete_trigger BEFORE DELETE ON public.pos_order_items FOR EACH ROW EXECUTE FUNCTION public.restore_stock_on_order_item_delete();


--
-- Name: members set_timestamp_members; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_members BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: membership_tiers set_timestamp_membership_tiers; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_timestamp_membership_tiers BEFORE UPDATE ON public.membership_tiers FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();


--
-- Name: consumption trg_consumption_update_stock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_consumption_update_stock AFTER INSERT ON public.consumption FOR EACH ROW EXECUTE FUNCTION public.update_balance_stock();


--
-- Name: product_master trg_delete_purchase_history; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_delete_purchase_history AFTER DELETE ON public.product_master FOR EACH ROW EXECUTE FUNCTION public.delete_purchase_history_on_product_delete();


--
-- Name: sales_product_data trg_freeze_remaining_stock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_freeze_remaining_stock BEFORE UPDATE ON public.sales_product_data FOR EACH ROW EXECUTE FUNCTION public.freeze_remaining_stock_on_update();


--
-- Name: product_master trg_log_stock_increase; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_log_stock_increase AFTER UPDATE OF stock_quantity ON public.product_master FOR EACH ROW WHEN ((new.stock_quantity > old.stock_quantity)) EXECUTE FUNCTION public.log_stock_increase();


--
-- Name: product_master trg_log_stock_reduction; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_log_stock_reduction AFTER UPDATE OF stock_quantity ON public.product_master FOR EACH ROW WHEN ((new.stock_quantity < old.stock_quantity)) EXECUTE FUNCTION public.log_stock_reduction();


--
-- Name: purchases trg_purchases_update_stock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_purchases_update_stock AFTER INSERT ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_balance_stock();

ALTER TABLE public.purchases DISABLE TRIGGER trg_purchases_update_stock;


--
-- Name: purchase_history_with_stock trg_reduce_stock_after_purchase_delete; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_reduce_stock_after_purchase_delete AFTER DELETE ON public.purchase_history_with_stock FOR EACH ROW EXECUTE FUNCTION public.reduce_stock_on_purchase_delete();


--
-- Name: pos_orders trg_reduce_stock_on_salon_consumption; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_reduce_stock_on_salon_consumption AFTER INSERT ON public.pos_orders FOR EACH ROW WHEN (((new.type = 'salon-consumption'::text) OR (new.is_salon_consumption = true))) EXECUTE FUNCTION public.update_product_stock_after_consumption();


--
-- Name: sales trg_sales_update_stock; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_sales_update_stock AFTER INSERT ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_balance_stock();


--
-- Name: purchase_stock trg_update_balance_stock_on_purchase; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_balance_stock_on_purchase AFTER INSERT ON public.purchase_stock FOR EACH ROW EXECUTE FUNCTION public.update_balance_stock_on_purchase();


--
-- Name: sales trg_update_product_stock_on_sale; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_product_stock_on_sale BEFORE INSERT ON public.sales FOR EACH ROW EXECUTE FUNCTION public.update_product_stock_on_sale();


--
-- Name: purchase_history_with_stock trg_update_purchase_cost_on_product_master; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_purchase_cost_on_product_master AFTER INSERT OR UPDATE ON public.purchase_history_with_stock FOR EACH ROW EXECUTE FUNCTION public.update_product_master_purchase_cost();


--
-- Name: purchases trg_update_stock_on_purchase; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_stock_on_purchase BEFORE INSERT ON public.purchases FOR EACH ROW EXECUTE FUNCTION public.update_stock_on_purchase();


--
-- Name: product_stock_transactions trig_avoid_duplicate_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trig_avoid_duplicate_insert BEFORE INSERT ON public.product_stock_transactions FOR EACH ROW EXECUTE FUNCTION public.avoid_duplicate_insert();


--
-- Name: product_stock_transactions trig_avoid_multiple_product_order_entries; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trig_avoid_multiple_product_order_entries BEFORE INSERT ON public.product_stock_transactions FOR EACH ROW EXECUTE FUNCTION public.avoid_multiple_product_order_entries();


--
-- Name: notification_logs update_notification_logs_timestamp; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notification_logs_timestamp BEFORE UPDATE ON public.notification_logs FOR EACH ROW EXECUTE FUNCTION public.update_notification_logs_updated_at();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: appointment_clients appointment_clients_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_clients
    ADD CONSTRAINT appointment_clients_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_clients appointment_clients_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_clients
    ADD CONSTRAINT appointment_clients_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: appointment_services appointment_services_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_services appointment_services_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: appointment_services appointment_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: appointment_services appointment_services_stylist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_services
    ADD CONSTRAINT appointment_services_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);


--
-- Name: appointment_stylists appointment_stylists_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_stylists
    ADD CONSTRAINT appointment_stylists_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id) ON DELETE CASCADE;


--
-- Name: appointment_stylists appointment_stylists_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_stylists
    ADD CONSTRAINT appointment_stylists_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: appointment_stylists appointment_stylists_stylist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointment_stylists
    ADD CONSTRAINT appointment_stylists_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: appointments appointments_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON DELETE CASCADE;


--
-- Name: appointments appointments_stylist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);


--
-- Name: balance_stock balance_stock_stock_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.balance_stock
    ADD CONSTRAINT balance_stock_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES public.stock_details(id) ON DELETE CASCADE;


--
-- Name: breaks breaks_stylist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.breaks
    ADD CONSTRAINT breaks_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);


--
-- Name: consumption consumption_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consumption
    ADD CONSTRAINT consumption_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_master(id);


--
-- Name: consumption fk_consumption_sale; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.consumption
    ADD CONSTRAINT fk_consumption_sale FOREIGN KEY (original_sale_id) REFERENCES public.sales(id) ON DELETE SET NULL;


--
-- Name: product_master fk_product_collection; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_master
    ADD CONSTRAINT fk_product_collection FOREIGN KEY (collection_id) REFERENCES public.product_collections(id) ON DELETE CASCADE;


--
-- Name: inventory_purchases fk_product_master; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_purchases
    ADD CONSTRAINT fk_product_master FOREIGN KEY (product_id) REFERENCES public.product_master(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: sales fk_sales_consumption; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT fk_sales_consumption FOREIGN KEY (consumption_id) REFERENCES public.consumption(id) ON DELETE SET NULL;


--
-- Name: inventory_salon_consumption fk_salon_consumption_product_master; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.inventory_salon_consumption
    ADD CONSTRAINT fk_salon_consumption_product_master FOREIGN KEY (product_id) REFERENCES public.product_master(id);


--
-- Name: services fk_service_collection; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT fk_service_collection FOREIGN KEY (collection_id) REFERENCES public.service_collections(id) ON DELETE SET NULL;


--
-- Name: loyalty_points loyalty_points_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: members members_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);


--
-- Name: members members_tier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES public.membership_tiers(id);


--
-- Name: notification_logs notification_logs_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES public.appointments(id);


--
-- Name: notification_logs notification_logs_old_appointment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_logs
    ADD CONSTRAINT notification_logs_old_appointment_id_fkey FOREIGN KEY (old_appointment_id) REFERENCES public.appointments(id);


--
-- Name: order_stylists order_stylists_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_stylists
    ADD CONSTRAINT order_stylists_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.pos_orders(id) ON DELETE CASCADE;


--
-- Name: order_stylists order_stylists_stylist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_stylists
    ADD CONSTRAINT order_stylists_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id);


--
-- Name: pos_order_items pos_order_items_pos_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pos_order_items
    ADD CONSTRAINT pos_order_items_pos_order_id_fkey FOREIGN KEY (pos_order_id) REFERENCES public.pos_orders(id);


--
-- Name: product_stock_transactions product_stock_transactions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock_transactions
    ADD CONSTRAINT product_stock_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: product_stock_transactions product_stock_transactions_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock_transactions
    ADD CONSTRAINT product_stock_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.pos_orders(id) ON DELETE CASCADE;


--
-- Name: product_stock_transactions product_stock_transactions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product_stock_transactions
    ADD CONSTRAINT product_stock_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_master(id) ON DELETE CASCADE;


--
-- Name: purchase_stock purchase_stock_stock_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchase_stock
    ADD CONSTRAINT purchase_stock_stock_id_fkey FOREIGN KEY (stock_id) REFERENCES public.stock_details(id) ON DELETE CASCADE;


--
-- Name: purchases purchases_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_master(id);


--
-- Name: sales sales_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: sales sales_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product_master(id);


--
-- Name: sales sales_stylist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id) ON DELETE SET NULL;


--
-- Name: service_subcollections service_subcollections_collection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.service_subcollections
    ADD CONSTRAINT service_subcollections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES public.service_collections(id) ON DELETE CASCADE;


--
-- Name: services services_subcollection_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_subcollection_id_fkey FOREIGN KEY (subcollection_id) REFERENCES public.service_subcollections(id) ON DELETE SET NULL;


--
-- Name: stylist_breaks stylist_breaks_stylist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stylist_breaks
    ADD CONSTRAINT stylist_breaks_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id) ON DELETE CASCADE;


--
-- Name: stylist_holidays stylist_holidays_stylist_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stylist_holidays
    ADD CONSTRAINT stylist_holidays_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES public.stylists(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: sales Allow all inserts to sales; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow all inserts to sales" ON public.sales FOR INSERT TO authenticated, anon WITH CHECK (true);


--
-- Name: inventory_salon_consumption Allow authenticated users full access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow authenticated users full access" ON public.inventory_salon_consumption TO authenticated USING (true) WITH CHECK (true);


--
-- Name: membership_tiers Allow delete for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow delete for authenticated users" ON public.membership_tiers FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: stock_history Allow full access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow full access" ON public.stock_history USING (true);


--
-- Name: membership_tiers Allow insert for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert for authenticated users" ON public.membership_tiers FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: membership_tiers Allow public delete membership_tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public delete membership_tiers" ON public.membership_tiers FOR DELETE USING (true);


--
-- Name: membership_tiers Allow public update membership_tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow public update membership_tiers" ON public.membership_tiers FOR UPDATE USING (true) WITH CHECK (true);


--
-- Name: membership_tiers Allow read access for all authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow read access for all authenticated users" ON public.membership_tiers FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: membership_tiers Allow update for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow update for authenticated users" ON public.membership_tiers FOR UPDATE USING ((auth.role() = 'authenticated'::text)) WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: stylist_holidays Enable delete for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for authenticated users" ON public.stylist_holidays FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: service_collections Enable delete for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable delete for authenticated users only" ON public.service_collections FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: stylist_holidays Enable insert for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users" ON public.stylist_holidays FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: service_collections Enable insert for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable insert for authenticated users only" ON public.service_collections FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: service_collections Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.service_collections FOR SELECT USING (true);


--
-- Name: stylist_holidays Enable read access for all users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable read access for all users" ON public.stylist_holidays FOR SELECT USING (true);


--
-- Name: stylist_holidays Enable update for authenticated users; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for authenticated users" ON public.stylist_holidays FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: service_collections Enable update for authenticated users only; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Enable update for authenticated users only" ON public.service_collections FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: inventory_salon_consumption allow_public_select_inventory_salon_consumption; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY allow_public_select_inventory_salon_consumption ON public.inventory_salon_consumption FOR SELECT USING (true);


--
-- Name: membership_tiers public select membership_tiers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "public select membership_tiers" ON public.membership_tiers FOR SELECT USING (true);


--
-- Name: sales; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

--
-- Name: sales sales_select_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sales_select_policy ON public.sales FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: stock_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;

--
-- Name: stock_history stock_history_policy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stock_history_policy ON public.stock_history USING ((auth.role() = 'authenticated'::text));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime sales; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.sales;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

