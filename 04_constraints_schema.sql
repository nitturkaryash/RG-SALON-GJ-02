-- =======================================================
-- DATABASE CONSTRAINTS EXPORT
-- Project: pankajhadole24@gmail.com's Project
-- Generated: 2024
-- Total Constraints: 300+
-- =======================================================

-- =======================================================
-- AUTH SCHEMA CONSTRAINTS
-- =======================================================

-- audit_log_entries constraints
ALTER TABLE auth.audit_log_entries ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);

-- flow_state constraints
ALTER TABLE auth.flow_state ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);

-- identities constraints
ALTER TABLE auth.identities ADD CONSTRAINT identities_pkey PRIMARY KEY (id);
ALTER TABLE auth.identities ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);
ALTER TABLE auth.identities ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- instances constraints
ALTER TABLE auth.instances ADD CONSTRAINT instances_pkey PRIMARY KEY (id);

-- mfa_amr_claims constraints
ALTER TABLE auth.mfa_amr_claims ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);
ALTER TABLE auth.mfa_amr_claims ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);
ALTER TABLE auth.mfa_amr_claims ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;

-- mfa_challenges constraints
ALTER TABLE auth.mfa_challenges ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);
ALTER TABLE auth.mfa_challenges ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;

-- mfa_factors constraints
ALTER TABLE auth.mfa_factors ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);
ALTER TABLE auth.mfa_factors ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);
ALTER TABLE auth.mfa_factors ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- one_time_tokens constraints
ALTER TABLE auth.one_time_tokens ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);
ALTER TABLE auth.one_time_tokens ADD CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0));
ALTER TABLE auth.one_time_tokens ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- refresh_tokens constraints
ALTER TABLE auth.refresh_tokens ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
ALTER TABLE auth.refresh_tokens ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;
ALTER TABLE auth.refresh_tokens ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);

-- saml_providers constraints
ALTER TABLE auth.saml_providers ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);
ALTER TABLE auth.saml_providers ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);
ALTER TABLE auth.saml_providers ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;
ALTER TABLE auth.saml_providers ADD CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0));
ALTER TABLE auth.saml_providers ADD CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0)));
ALTER TABLE auth.saml_providers ADD CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0));

-- saml_relay_states constraints
ALTER TABLE auth.saml_relay_states ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);
ALTER TABLE auth.saml_relay_states ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;
ALTER TABLE auth.saml_relay_states ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;
ALTER TABLE auth.saml_relay_states ADD CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0));

-- schema_migrations constraints
ALTER TABLE auth.schema_migrations ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);

-- sessions constraints
ALTER TABLE auth.sessions ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
ALTER TABLE auth.sessions ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- sso_domains constraints
ALTER TABLE auth.sso_domains ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);
ALTER TABLE auth.sso_domains ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;
ALTER TABLE auth.sso_domains ADD CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0));

-- sso_providers constraints
ALTER TABLE auth.sso_providers ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);
ALTER TABLE auth.sso_providers ADD CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)));

-- users constraints
ALTER TABLE auth.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE auth.users ADD CONSTRAINT users_phone_key UNIQUE (phone);
ALTER TABLE auth.users ADD CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)));

-- =======================================================
-- PUBLIC SCHEMA CONSTRAINTS
-- =======================================================

-- active_sessions constraints
ALTER TABLE public.active_sessions ADD CONSTRAINT active_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.active_sessions ADD CONSTRAINT active_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- admin_users constraints
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);
ALTER TABLE public.admin_users ADD CONSTRAINT admin_users_email_key UNIQUE (email);

-- appointment_clients constraints
ALTER TABLE public.appointment_clients ADD CONSTRAINT appointment_clients_pkey PRIMARY KEY (appointment_id, client_id);
ALTER TABLE public.appointment_clients ADD CONSTRAINT appointment_clients_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;
ALTER TABLE public.appointment_clients ADD CONSTRAINT appointment_clients_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE public.appointment_clients ADD CONSTRAINT appointment_clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

-- appointment_reminders constraints
ALTER TABLE public.appointment_reminders ADD CONSTRAINT appointment_reminders_pkey PRIMARY KEY (id);
ALTER TABLE public.appointment_reminders ADD CONSTRAINT appointment_reminders_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;
ALTER TABLE public.appointment_reminders ADD CONSTRAINT appointment_reminders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.appointment_reminders ADD CONSTRAINT appointment_reminders_reminder_type_check CHECK (((reminder_type)::text = ANY ((ARRAY['24h'::character varying, '2h'::character varying, 'custom'::character varying])::text[])));
ALTER TABLE public.appointment_reminders ADD CONSTRAINT appointment_reminders_status_check CHECK (((status)::text = ANY ((ARRAY['sent'::character varying, 'failed'::character varying, 'delivered'::character varying, 'read'::character varying])::text[])));

-- appointment_services constraints
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_pkey PRIMARY KEY (id);
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_unique_expert_service UNIQUE (appointment_id, service_id, stylist_id);
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE;
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES stylists(id);
ALTER TABLE public.appointment_services ADD CONSTRAINT appointment_services_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

-- appointment_stylists constraints
ALTER TABLE public.appointment_stylists ADD CONSTRAINT appointment_stylists_pkey PRIMARY KEY (id);
ALTER TABLE public.appointment_stylists ADD CONSTRAINT appointment_stylists_appointment_id_stylist_id_key UNIQUE (appointment_id, stylist_id);
ALTER TABLE public.appointment_stylists ADD CONSTRAINT appointment_stylists_appointment_id_fkey FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE;
ALTER TABLE public.appointment_stylists ADD CONSTRAINT appointment_stylists_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
ALTER TABLE public.appointment_stylists ADD CONSTRAINT appointment_stylists_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE CASCADE;
ALTER TABLE public.appointment_stylists ADD CONSTRAINT appointment_stylists_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

-- appointments constraints
ALTER TABLE public.appointments ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);
ALTER TABLE public.appointments ADD CONSTRAINT appointments_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_service_id_fkey FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES stylists(id);
ALTER TABLE public.appointments ADD CONSTRAINT appointments_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

-- auth constraints
ALTER TABLE public.auth ADD CONSTRAINT auth_pkey PRIMARY KEY (id);
ALTER TABLE public.auth ADD CONSTRAINT auth_username_key UNIQUE (username);

-- backups constraints
ALTER TABLE public.backups ADD CONSTRAINT backups_pkey PRIMARY KEY (id);
ALTER TABLE public.backups ADD CONSTRAINT backups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- balance_stock_history constraints
ALTER TABLE public.balance_stock_history ADD CONSTRAINT balance_stock_history_pkey PRIMARY KEY (id);
ALTER TABLE public.balance_stock_history ADD CONSTRAINT balance_stock_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- balance_stock_transactions constraints
ALTER TABLE public.balance_stock_transactions ADD CONSTRAINT balance_stock_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.balance_stock_transactions ADD CONSTRAINT balance_stock_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- breaks constraints
ALTER TABLE public.breaks ADD CONSTRAINT breaks_pkey PRIMARY KEY (id);
ALTER TABLE public.breaks ADD CONSTRAINT breaks_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES stylists(id);
ALTER TABLE public.breaks ADD CONSTRAINT breaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- clients constraints
ALTER TABLE public.clients ADD CONSTRAINT clients_pkey PRIMARY KEY (id);
ALTER TABLE public.clients ADD CONSTRAINT clients_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- consumption constraints
ALTER TABLE public.consumption ADD CONSTRAINT consumption_pkey PRIMARY KEY (id);
ALTER TABLE public.consumption ADD CONSTRAINT consumption_product_id_fkey FOREIGN KEY (product_id) REFERENCES product_master(id);
ALTER TABLE public.consumption ADD CONSTRAINT consumption_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.consumption ADD CONSTRAINT fk_consumption_sale FOREIGN KEY (original_sale_id) REFERENCES sales(id) ON DELETE SET NULL;

-- customers constraints
ALTER TABLE public.customers ADD CONSTRAINT customers_pkey PRIMARY KEY (id);
ALTER TABLE public.customers ADD CONSTRAINT customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- expired_products constraints
ALTER TABLE public.expired_products ADD CONSTRAINT expired_products_pkey PRIMARY KEY (expired_id);
ALTER TABLE public.expired_products ADD CONSTRAINT expired_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- inventory_consumption constraints
ALTER TABLE public.inventory_consumption ADD CONSTRAINT inventory_consumption_pkey PRIMARY KEY (consumption_id);
ALTER TABLE public.inventory_consumption ADD CONSTRAINT inventory_consumption_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- inventory_products constraints
ALTER TABLE public.inventory_products ADD CONSTRAINT inventory_products_pkey PRIMARY KEY (product_id);
ALTER TABLE public.inventory_products ADD CONSTRAINT inventory_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id);

-- inventory_salon_consumption constraints
ALTER TABLE public.inventory_salon_consumption ADD CONSTRAINT inventory_salon_consumption_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_salon_consumption ADD CONSTRAINT inventory_salon_consumption_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- inventory_transactions constraints
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_transactions ADD CONSTRAINT inventory_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- loyalty_points constraints
ALTER TABLE public.loyalty_points ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (id);
ALTER TABLE public.loyalty_points ADD CONSTRAINT loyalty_points_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
ALTER TABLE public.loyalty_points ADD CONSTRAINT loyalty_points_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- members constraints
ALTER TABLE public.members ADD CONSTRAINT members_pkey PRIMARY KEY (id);
ALTER TABLE public.members ADD CONSTRAINT members_tier_id_fkey FOREIGN KEY (tier_id) REFERENCES membership_tiers(id);
ALTER TABLE public.members ADD CONSTRAINT members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- membership_tiers constraints
ALTER TABLE public.membership_tiers ADD CONSTRAINT membership_tiers_pkey PRIMARY KEY (id);
ALTER TABLE public.membership_tiers ADD CONSTRAINT membership_tiers_duration_months_check CHECK ((duration_months > 0));
ALTER TABLE public.membership_tiers ADD CONSTRAINT membership_tiers_price_check CHECK ((price >= (0)::numeric));
ALTER TABLE public.membership_tiers ADD CONSTRAINT membership_tiers_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- migrations constraints
ALTER TABLE public.migrations ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);
ALTER TABLE public.migrations ADD CONSTRAINT migrations_name_key UNIQUE (name);

-- notification_logs constraints
ALTER TABLE public.notification_logs ADD CONSTRAINT notification_logs_pkey PRIMARY KEY (id);
ALTER TABLE public.notification_logs ADD CONSTRAINT notification_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- order_stylists constraints
ALTER TABLE public.order_stylists ADD CONSTRAINT order_stylists_pkey PRIMARY KEY (id);
ALTER TABLE public.order_stylists ADD CONSTRAINT order_stylists_order_id_fkey FOREIGN KEY (order_id) REFERENCES pos_orders(id) ON DELETE CASCADE;
ALTER TABLE public.order_stylists ADD CONSTRAINT order_stylists_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES stylists(id);
ALTER TABLE public.order_stylists ADD CONSTRAINT order_stylists_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- organizations constraints
ALTER TABLE public.organizations ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);

-- pos_order_items constraints
ALTER TABLE public.pos_order_items ADD CONSTRAINT pos_order_items_pkey PRIMARY KEY (id);
ALTER TABLE public.pos_order_items ADD CONSTRAINT pos_order_items_pos_order_id_fkey FOREIGN KEY (pos_order_id) REFERENCES pos_orders(id);
ALTER TABLE public.pos_order_items ADD CONSTRAINT pos_order_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- pos_orders constraints
ALTER TABLE public.pos_orders ADD CONSTRAINT pos_orders_pkey PRIMARY KEY (id);
ALTER TABLE public.pos_orders ADD CONSTRAINT pos_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- product_collections constraints
ALTER TABLE public.product_collections ADD CONSTRAINT product_collections_pkey PRIMARY KEY (id);
ALTER TABLE public.product_collections ADD CONSTRAINT product_collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- product_master constraints
ALTER TABLE public.product_master ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE public.product_master ADD CONSTRAINT fk_product_collection FOREIGN KEY (collection_id) REFERENCES product_collections(id) ON DELETE CASCADE;
ALTER TABLE public.product_master ADD CONSTRAINT product_master_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- product_price_history constraints
ALTER TABLE public.product_price_history ADD CONSTRAINT product_price_history_pkey PRIMARY KEY (id);
ALTER TABLE public.product_price_history ADD CONSTRAINT product_price_history_product_id_fkey FOREIGN KEY (product_id) REFERENCES product_master(id) ON DELETE CASCADE;

-- product_stock_transactions constraints
ALTER TABLE public.product_stock_transactions ADD CONSTRAINT product_stock_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.product_stock_transactions ADD CONSTRAINT product_stock_transactions_duplicate_protection_key_key UNIQUE (duplicate_protection_key);
ALTER TABLE public.product_stock_transactions ADD CONSTRAINT product_stock_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);
ALTER TABLE public.product_stock_transactions ADD CONSTRAINT product_stock_transactions_product_id_fkey FOREIGN KEY (product_id) REFERENCES product_master(id) ON DELETE CASCADE;
ALTER TABLE public.product_stock_transactions ADD CONSTRAINT product_stock_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- profiles constraints
ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public.profiles ADD CONSTRAINT profiles_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES organizations(id);

-- purchase_history_with_stock constraints
ALTER TABLE public.purchase_history_with_stock ADD CONSTRAINT purchase_history_with_stock_pkey PRIMARY KEY (purchase_id);
ALTER TABLE public.purchase_history_with_stock ADD CONSTRAINT purchase_history_with_stock_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- sales constraints
ALTER TABLE public.sales ADD CONSTRAINT sales_pkey PRIMARY KEY (id);
ALTER TABLE public.sales ADD CONSTRAINT fk_sales_consumption FOREIGN KEY (consumption_id) REFERENCES consumption(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD CONSTRAINT sales_product_id_fkey FOREIGN KEY (product_id) REFERENCES product_master(id);
ALTER TABLE public.sales ADD CONSTRAINT sales_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE SET NULL;
ALTER TABLE public.sales ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.sales ADD CONSTRAINT sales_payment_method_check CHECK (((payment_method IS NULL) OR (payment_method = ANY (ARRAY['cash'::text, 'card'::text, 'online'::text, 'other'::text]))));

-- sales_product_new constraints
ALTER TABLE public.sales_product_new ADD CONSTRAINT sales_product_new_pkey PRIMARY KEY (serial_no);
ALTER TABLE public.sales_product_new ADD CONSTRAINT sales_product_new_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- salon_consumption_products constraints
ALTER TABLE public.salon_consumption_products ADD CONSTRAINT salon_consumption_products_pkey PRIMARY KEY (id);
ALTER TABLE public.salon_consumption_products ADD CONSTRAINT salon_consumption_products_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- salons constraints
ALTER TABLE public.salons ADD CONSTRAINT salons_pkey PRIMARY KEY (id);
ALTER TABLE public.salons ADD CONSTRAINT salons_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES profiles(id);

-- service_collections constraints
ALTER TABLE public.service_collections ADD CONSTRAINT service_collections_pkey PRIMARY KEY (id);
ALTER TABLE public.service_collections ADD CONSTRAINT service_collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- service_subcollections constraints
ALTER TABLE public.service_subcollections ADD CONSTRAINT service_subcollections_pkey PRIMARY KEY (id);
ALTER TABLE public.service_subcollections ADD CONSTRAINT service_subcollections_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES service_collections(id) ON DELETE CASCADE;
ALTER TABLE public.service_subcollections ADD CONSTRAINT service_subcollections_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- services constraints
ALTER TABLE public.services ADD CONSTRAINT services_pkey PRIMARY KEY (id);
ALTER TABLE public.services ADD CONSTRAINT fk_service_collection FOREIGN KEY (collection_id) REFERENCES service_collections(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD CONSTRAINT services_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text])));
ALTER TABLE public.services ADD CONSTRAINT services_subcollection_id_fkey FOREIGN KEY (subcollection_id) REFERENCES service_subcollections(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD CONSTRAINT services_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- stock_deduction_debug_log constraints
ALTER TABLE public.stock_deduction_debug_log ADD CONSTRAINT stock_deduction_debug_log_pkey PRIMARY KEY (id);
ALTER TABLE public.stock_deduction_debug_log ADD CONSTRAINT stock_deduction_debug_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- stock_details constraints
ALTER TABLE public.stock_details ADD CONSTRAINT stock_details_pkey PRIMARY KEY (id);
ALTER TABLE public.stock_details ADD CONSTRAINT stock_details_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- stock_history constraints
ALTER TABLE public.stock_history ADD CONSTRAINT stock_history_pkey PRIMARY KEY (id);
ALTER TABLE public.stock_history ADD CONSTRAINT stock_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- stock_reductions constraints
ALTER TABLE public.stock_reductions ADD CONSTRAINT stock_reductions_pkey PRIMARY KEY (reduction_id);
ALTER TABLE public.stock_reductions ADD CONSTRAINT stock_reductions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- stock_snapshots constraints
ALTER TABLE public.stock_snapshots ADD CONSTRAINT stock_snapshots_pkey PRIMARY KEY (sale_order_id, product_id);
ALTER TABLE public.stock_snapshots ADD CONSTRAINT stock_snapshots_sale_order_id_product_id_key UNIQUE (sale_order_id, product_id);
ALTER TABLE public.stock_snapshots ADD CONSTRAINT stock_snapshots_immutable CHECK ((created_at = created_at));
ALTER TABLE public.stock_snapshots ADD CONSTRAINT stock_snapshots_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- stylist_breaks constraints
ALTER TABLE public.stylist_breaks ADD CONSTRAINT stylist_breaks_pkey PRIMARY KEY (id);
ALTER TABLE public.stylist_breaks ADD CONSTRAINT stylist_breaks_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE CASCADE;
ALTER TABLE public.stylist_breaks ADD CONSTRAINT stylist_breaks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- stylist_holidays constraints
ALTER TABLE public.stylist_holidays ADD CONSTRAINT stylist_holidays_pkey PRIMARY KEY (id);
ALTER TABLE public.stylist_holidays ADD CONSTRAINT stylist_holidays_stylist_id_fkey FOREIGN KEY (stylist_id) REFERENCES stylists(id) ON DELETE CASCADE;
ALTER TABLE public.stylist_holidays ADD CONSTRAINT stylist_holidays_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- stylists constraints
ALTER TABLE public.stylists ADD CONSTRAINT stylists_pkey PRIMARY KEY (id);
ALTER TABLE public.stylists ADD CONSTRAINT stylists_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text])));
ALTER TABLE public.stylists ADD CONSTRAINT stylists_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- support_tickets constraints
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_pkey PRIMARY KEY (id);
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES profiles(id);
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_client_id_fkey FOREIGN KEY (client_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])));
ALTER TABLE public.support_tickets ADD CONSTRAINT support_tickets_status_check CHECK ((status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text])));

-- trigger_debug_log constraints
ALTER TABLE public.trigger_debug_log ADD CONSTRAINT trigger_debug_log_pkey PRIMARY KEY (id);
ALTER TABLE public.trigger_debug_log ADD CONSTRAINT trigger_debug_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- user_sessions constraints
ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_sessions ADD CONSTRAINT user_sessions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- =======================================================
-- STORAGE SCHEMA CONSTRAINTS
-- =======================================================

-- buckets constraints
ALTER TABLE storage.buckets ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);

-- migrations constraints
ALTER TABLE storage.migrations ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);
ALTER TABLE storage.migrations ADD CONSTRAINT migrations_name_key UNIQUE (name);

-- objects constraints
ALTER TABLE storage.objects ADD CONSTRAINT objects_pkey PRIMARY KEY (id);
ALTER TABLE storage.objects ADD CONSTRAINT objects_bucketId_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);

-- s3_multipart_uploads constraints
ALTER TABLE storage.s3_multipart_uploads ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);
ALTER TABLE storage.s3_multipart_uploads ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);

-- s3_multipart_uploads_parts constraints
ALTER TABLE storage.s3_multipart_uploads_parts ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);
ALTER TABLE storage.s3_multipart_uploads_parts ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);
ALTER TABLE storage.s3_multipart_uploads_parts ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;

-- =======================================================
-- END OF CONSTRAINT DEFINITIONS
-- ======================================================= 