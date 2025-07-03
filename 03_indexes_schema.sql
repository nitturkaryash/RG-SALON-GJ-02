-- =======================================================
-- DATABASE INDEXES EXPORT
-- Project: pankajhadole24@gmail.com's Project
-- Generated: 2024
-- Total Indexes: 200+
-- =======================================================

-- =======================================================
-- AUTH SCHEMA INDEXES
-- =======================================================

-- audit_log_entries indexes
CREATE UNIQUE INDEX audit_log_entries_pkey ON auth.audit_log_entries USING btree (id);
CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);

-- flow_state indexes
CREATE UNIQUE INDEX flow_state_pkey ON auth.flow_state USING btree (id);
CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);
CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);
CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);

-- identities indexes
CREATE UNIQUE INDEX identities_pkey ON auth.identities USING btree (id);
CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);
CREATE UNIQUE INDEX identities_provider_id_provider_unique ON auth.identities USING btree (provider_id, provider);
CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);

-- instances indexes
CREATE UNIQUE INDEX instances_pkey ON auth.instances USING btree (id);

-- mfa_amr_claims indexes
CREATE UNIQUE INDEX amr_id_pk ON auth.mfa_amr_claims USING btree (id);
CREATE UNIQUE INDEX mfa_amr_claims_session_id_authentication_method_pkey ON auth.mfa_amr_claims USING btree (session_id, authentication_method);

-- mfa_challenges indexes
CREATE UNIQUE INDEX mfa_challenges_pkey ON auth.mfa_challenges USING btree (id);
CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);

-- mfa_factors indexes
CREATE UNIQUE INDEX mfa_factors_pkey ON auth.mfa_factors USING btree (id);
CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);
CREATE UNIQUE INDEX mfa_factors_last_challenged_at_key ON auth.mfa_factors USING btree (last_challenged_at);
CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);
CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);
CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);

-- one_time_tokens indexes
CREATE UNIQUE INDEX one_time_tokens_pkey ON auth.one_time_tokens USING btree (id);
CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);
CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);
CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);

-- refresh_tokens indexes
CREATE UNIQUE INDEX refresh_tokens_pkey ON auth.refresh_tokens USING btree (id);
CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);
CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);
CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);
CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);
CREATE UNIQUE INDEX refresh_tokens_token_unique ON auth.refresh_tokens USING btree (token);
CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);

-- saml_providers indexes
CREATE UNIQUE INDEX saml_providers_pkey ON auth.saml_providers USING btree (id);
CREATE UNIQUE INDEX saml_providers_entity_id_key ON auth.saml_providers USING btree (entity_id);
CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);

-- saml_relay_states indexes
CREATE UNIQUE INDEX saml_relay_states_pkey ON auth.saml_relay_states USING btree (id);
CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);
CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);
CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);

-- schema_migrations indexes
CREATE UNIQUE INDEX schema_migrations_pkey ON auth.schema_migrations USING btree (version);

-- sessions indexes
CREATE UNIQUE INDEX sessions_pkey ON auth.sessions USING btree (id);
CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);
CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);
CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);

-- sso_domains indexes
CREATE UNIQUE INDEX sso_domains_pkey ON auth.sso_domains USING btree (id);
CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));
CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);

-- sso_providers indexes
CREATE UNIQUE INDEX sso_providers_pkey ON auth.sso_providers USING btree (id);
CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));

-- users indexes
CREATE UNIQUE INDEX users_pkey ON auth.users USING btree (id);
CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);
CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);
CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);
CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);
CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);
CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);
CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));
CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);
CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);
CREATE UNIQUE INDEX users_phone_key ON auth.users USING btree (phone);

-- =======================================================
-- PUBLIC SCHEMA INDEXES
-- =======================================================

-- active_sessions indexes
CREATE UNIQUE INDEX active_sessions_pkey ON public.active_sessions USING btree (id);
CREATE INDEX idx_active_sessions_is_active ON public.active_sessions USING btree (is_active);
CREATE INDEX idx_active_sessions_user_id ON public.active_sessions USING btree (user_id);

-- admin_users indexes
CREATE UNIQUE INDEX admin_users_pkey ON public.admin_users USING btree (id);
CREATE UNIQUE INDEX admin_users_email_key ON public.admin_users USING btree (email);
CREATE INDEX idx_admin_users_user_id ON public.admin_users USING btree (user_id);

-- appointment_clients indexes
CREATE UNIQUE INDEX appointment_clients_pkey ON public.appointment_clients USING btree (appointment_id, client_id);
CREATE INDEX idx_appointment_clients_appointment_id ON public.appointment_clients USING btree (appointment_id);
CREATE INDEX idx_appointment_clients_client_id ON public.appointment_clients USING btree (client_id);

-- appointment_reminders indexes
CREATE UNIQUE INDEX appointment_reminders_pkey ON public.appointment_reminders USING btree (id);
CREATE INDEX idx_appointment_reminders_appointment_id ON public.appointment_reminders USING btree (appointment_id);
CREATE INDEX idx_appointment_reminders_reminder_type ON public.appointment_reminders USING btree (reminder_type);
CREATE INDEX idx_appointment_reminders_sent_at ON public.appointment_reminders USING btree (sent_at);
CREATE INDEX idx_appointment_reminders_status ON public.appointment_reminders USING btree (status);
CREATE UNIQUE INDEX idx_appointment_reminders_unique ON public.appointment_reminders USING btree (appointment_id, reminder_type) WHERE ((status)::text = 'sent'::text);

-- appointment_services indexes
CREATE UNIQUE INDEX appointment_services_pkey ON public.appointment_services USING btree (id);
CREATE UNIQUE INDEX appointment_services_unique_expert_service ON public.appointment_services USING btree (appointment_id, service_id, stylist_id);

-- appointment_stylists indexes
CREATE UNIQUE INDEX appointment_stylists_pkey ON public.appointment_stylists USING btree (id);
CREATE UNIQUE INDEX appointment_stylists_appointment_id_stylist_id_key ON public.appointment_stylists USING btree (appointment_id, stylist_id);
CREATE INDEX idx_appointment_stylists_appointment_id ON public.appointment_stylists USING btree (appointment_id);
CREATE INDEX idx_appointment_stylists_is_primary ON public.appointment_stylists USING btree (is_primary);
CREATE INDEX idx_appointment_stylists_stylist_id ON public.appointment_stylists USING btree (stylist_id);

-- appointments indexes
CREATE UNIQUE INDEX appointments_pkey ON public.appointments USING btree (id);
CREATE INDEX idx_appointments_checked_in ON public.appointments USING btree (checked_in);
CREATE INDEX idx_appointments_client_id ON public.appointments USING btree (client_id);
CREATE INDEX idx_appointments_paid ON public.appointments USING btree (paid);
CREATE INDEX idx_appointments_reminder ON public.appointments USING btree (start_time, reminder_sent, status);
CREATE INDEX idx_appointments_reminder_24h ON public.appointments USING btree (start_time, reminder_24h_sent, status);
CREATE INDEX idx_appointments_reminder_2h ON public.appointments USING btree (start_time, reminder_2h_sent, status);
CREATE INDEX idx_appointments_start_time ON public.appointments USING btree (start_time);
CREATE INDEX idx_appointments_status ON public.appointments USING btree (status);
CREATE INDEX idx_appointments_stylist_id ON public.appointments USING btree (stylist_id);
CREATE INDEX idx_appointments_user_id ON public.appointments USING btree (user_id);

-- auth indexes
CREATE UNIQUE INDEX auth_pkey ON public.auth USING btree (id);
CREATE UNIQUE INDEX auth_username_key ON public.auth USING btree (username);

-- backups indexes
CREATE UNIQUE INDEX backups_pkey ON public.backups USING btree (id);

-- balance_stock_history indexes
CREATE UNIQUE INDEX balance_stock_history_pkey ON public.balance_stock_history USING btree (id);
CREATE INDEX idx_balance_stock_history_date ON public.balance_stock_history USING btree (transaction_time);
CREATE INDEX idx_balance_stock_history_product ON public.balance_stock_history USING btree (product_name);

-- balance_stock_transactions indexes
CREATE UNIQUE INDEX balance_stock_transactions_pkey ON public.balance_stock_transactions USING btree (id);
CREATE INDEX idx_balance_stock_transactions_user_id ON public.balance_stock_transactions USING btree (user_id);

-- breaks indexes
CREATE UNIQUE INDEX breaks_pkey ON public.breaks USING btree (id);
CREATE INDEX idx_breaks_start_time ON public.breaks USING btree (start_time);
CREATE INDEX idx_breaks_stylist_id ON public.breaks USING btree (stylist_id);

-- clients indexes
CREATE UNIQUE INDEX clients_pkey ON public.clients USING btree (id);
CREATE INDEX idx_clients_profile_id ON public.clients USING btree (profile_id);
CREATE INDEX idx_clients_user_id ON public.clients USING btree (profile_id);

-- consumption indexes
CREATE UNIQUE INDEX consumption_pkey ON public.consumption USING btree (id);
CREATE INDEX idx_consumption_product_id ON public.consumption USING btree (product_id);
CREATE INDEX idx_consumption_user_id ON public.consumption USING btree (user_id);

-- customers indexes
CREATE UNIQUE INDEX customers_pkey ON public.customers USING btree (id);

-- expired_products indexes
CREATE UNIQUE INDEX expired_products_pkey ON public.expired_products USING btree (expired_id);
CREATE INDEX idx_expired_products_user_id ON public.expired_products USING btree (user_id);

-- inventory_consumption indexes
CREATE UNIQUE INDEX inventory_consumption_pkey ON public.inventory_consumption USING btree (consumption_id);

-- inventory_products indexes
CREATE UNIQUE INDEX inventory_products_pkey ON public.inventory_products USING btree (product_id);
CREATE INDEX idx_inventory_products_hsn_code ON public.inventory_products USING btree (hsn_code);
CREATE INDEX idx_inventory_products_name ON public.inventory_products USING btree (product_name);
CREATE INDEX idx_inventory_products_status ON public.inventory_products USING btree (status);

-- inventory_salon_consumption indexes
CREATE UNIQUE INDEX inventory_salon_consumption_pkey ON public.inventory_salon_consumption USING btree (id);
CREATE INDEX idx_inventory_salon_consumption_user_id ON public.inventory_salon_consumption USING btree (user_id);
CREATE INDEX idx_salon_consumption_date ON public.inventory_salon_consumption USING btree (date);
CREATE INDEX idx_salon_consumption_product ON public.inventory_salon_consumption USING btree (product_name);

-- inventory_transactions indexes
CREATE UNIQUE INDEX inventory_transactions_pkey ON public.inventory_transactions USING btree (id);

-- loyalty_points indexes
CREATE UNIQUE INDEX loyalty_points_pkey ON public.loyalty_points USING btree (id);
CREATE INDEX idx_loyalty_points_user_id ON public.loyalty_points USING btree (user_id);

-- members indexes
CREATE UNIQUE INDEX members_pkey ON public.members USING btree (id);
CREATE INDEX idx_members_client_id ON public.members USING btree (client_id);
CREATE INDEX idx_members_expiry ON public.members USING btree (expires_at);
CREATE INDEX idx_members_profile_id ON public.members USING btree (client_id);
CREATE INDEX idx_members_tier_id ON public.members USING btree (tier_id);
CREATE INDEX idx_members_user_id ON public.members USING btree (user_id);

-- membership_tiers indexes
CREATE UNIQUE INDEX membership_tiers_pkey ON public.membership_tiers USING btree (id);
CREATE INDEX idx_membership_tiers_user_id ON public.membership_tiers USING btree (user_id);

-- migrations indexes
CREATE UNIQUE INDEX migrations_pkey ON public.migrations USING btree (id);
CREATE UNIQUE INDEX migrations_name_key ON public.migrations USING btree (name);

-- notification_logs indexes
CREATE UNIQUE INDEX notification_logs_pkey ON public.notification_logs USING btree (id);
CREATE INDEX idx_notification_logs_appointment_id ON public.notification_logs USING btree (appointment_id);
CREATE INDEX idx_notification_logs_sent_at ON public.notification_logs USING btree (sent_at);

-- order_stylists indexes
CREATE UNIQUE INDEX order_stylists_pkey ON public.order_stylists USING btree (id);

-- organizations indexes
CREATE UNIQUE INDEX organizations_pkey ON public.organizations USING btree (id);

-- pos_order_items indexes
CREATE UNIQUE INDEX pos_order_items_pkey ON public.pos_order_items USING btree (id);
CREATE INDEX idx_pos_order_items_order_id ON public.pos_order_items USING btree (order_id);
CREATE INDEX idx_pos_order_items_user_id ON public.pos_order_items USING btree (user_id);

-- pos_orders indexes
CREATE UNIQUE INDEX pos_orders_pkey ON public.pos_orders USING btree (id);
CREATE INDEX idx_pos_orders_client_name ON public.pos_orders USING btree (client_name);
CREATE INDEX idx_pos_orders_created_at ON public.pos_orders USING btree (created_at);
CREATE INDEX idx_pos_orders_customer_name ON public.pos_orders USING btree (customer_name);
CREATE INDEX idx_pos_orders_multi_expert ON public.pos_orders USING btree (multi_expert);
CREATE INDEX idx_pos_orders_multi_expert_group_id ON public.pos_orders USING btree (multi_expert_group_id);
CREATE INDEX idx_pos_orders_status ON public.pos_orders USING btree (status);
CREATE INDEX idx_pos_orders_user_id ON public.pos_orders USING btree (user_id);

-- product_collections indexes
CREATE UNIQUE INDEX product_collections_pkey ON public.product_collections USING btree (id);

-- product_master indexes
CREATE UNIQUE INDEX products_pkey ON public.product_master USING btree (id);
CREATE INDEX idx_product_master_user_id ON public.product_master USING btree (user_id);
CREATE INDEX idx_products_active ON public.product_master USING btree (active);
CREATE INDEX idx_products_name ON public.product_master USING btree (name);

-- product_price_history indexes
CREATE UNIQUE INDEX product_price_history_pkey ON public.product_price_history USING btree (id);
CREATE INDEX idx_product_price_history_changed_at ON public.product_price_history USING btree (changed_at);
CREATE INDEX idx_product_price_history_product_changed ON public.product_price_history USING btree (product_id, changed_at DESC);
CREATE INDEX idx_product_price_history_product_id ON public.product_price_history USING btree (product_id);
CREATE INDEX idx_product_price_history_source ON public.product_price_history USING btree (source_of_change);

-- product_stock_transactions indexes
CREATE UNIQUE INDEX product_stock_transactions_pkey ON public.product_stock_transactions USING btree (id);
CREATE UNIQUE INDEX idx_duplicate_protection ON public.product_stock_transactions USING btree (duplicate_protection_key) WHERE (duplicate_protection_key IS NOT NULL);
CREATE INDEX idx_product_id ON public.product_stock_transactions USING btree (product_id);
CREATE INDEX idx_product_stock_transactions_created_at ON public.product_stock_transactions USING btree (created_at);
CREATE INDEX idx_product_stock_transactions_order_id ON public.product_stock_transactions USING btree (order_id);
CREATE INDEX idx_product_stock_transactions_product_id ON public.product_stock_transactions USING btree (product_id);
CREATE INDEX idx_product_stock_transactions_user_id ON public.product_stock_transactions USING btree (user_id);
CREATE INDEX idx_reference_id ON public.product_stock_transactions USING btree (order_id);
CREATE UNIQUE INDEX idx_unique_duplicate_key ON public.product_stock_transactions USING btree (duplicate_protection_key);
CREATE UNIQUE INDEX product_stock_transactions_duplicate_protection_key_key ON public.product_stock_transactions USING btree (duplicate_protection_key);

-- profiles indexes
CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);
CREATE INDEX profiles_auth_user_id_idx ON public.profiles USING btree (auth_user_id);
CREATE INDEX profiles_email_idx ON public.profiles USING btree (email);
CREATE INDEX profiles_is_active_idx ON public.profiles USING btree (is_active);
CREATE INDEX profiles_role_idx ON public.profiles USING btree (role);
CREATE INDEX profiles_username_idx ON public.profiles USING btree (username);

-- purchase_history_with_stock indexes
CREATE UNIQUE INDEX purchase_history_with_stock_pkey ON public.purchase_history_with_stock USING btree (purchase_id);

-- sales indexes
CREATE UNIQUE INDEX sales_pkey ON public.sales USING btree (id);
CREATE INDEX idx_sales_created_at ON public.sales USING btree (created_at);
CREATE INDEX idx_sales_customer_id ON public.sales USING btree (customer_id);
CREATE INDEX idx_sales_product_id ON public.sales USING btree (product_id);
CREATE INDEX idx_sales_salon_consumption ON public.sales USING btree (is_salon_consumption);
CREATE INDEX idx_sales_stylist_id ON public.sales USING btree (stylist_id);

-- sales_product_new indexes
CREATE UNIQUE INDEX sales_product_new_pkey ON public.sales_product_new USING btree (serial_no);
CREATE INDEX idx_sales_product_new_date ON public.sales_product_new USING btree (date);
CREATE INDEX idx_sales_product_new_order ON public.sales_product_new USING btree (order_id);
CREATE INDEX idx_sales_product_new_product ON public.sales_product_new USING btree (product_name);

-- salon_consumption_products indexes
CREATE UNIQUE INDEX salon_consumption_products_pkey ON public.salon_consumption_products USING btree (id);
CREATE INDEX idx_salon_consumption_products_date ON public.salon_consumption_products USING btree ("Date");
CREATE INDEX idx_salon_consumption_products_product ON public.salon_consumption_products USING btree ("Product Name");
CREATE INDEX idx_salon_consumption_products_voucher ON public.salon_consumption_products USING btree ("Requisition Voucher No.");

-- salons indexes
CREATE UNIQUE INDEX salons_pkey ON public.salons USING btree (id);

-- service_collections indexes
CREATE UNIQUE INDEX service_collections_pkey ON public.service_collections USING btree (id);
CREATE INDEX idx_service_collections_name ON public.service_collections USING btree (name);

-- service_subcollections indexes
CREATE UNIQUE INDEX service_subcollections_pkey ON public.service_subcollections USING btree (id);
CREATE INDEX idx_service_subcollections_collection_id ON public.service_subcollections USING btree (collection_id);

-- services indexes
CREATE UNIQUE INDEX services_pkey ON public.services USING btree (id);
CREATE INDEX idx_services_active ON public.services USING btree (active);
CREATE INDEX idx_services_category ON public.services USING btree (collection_id);
CREATE INDEX idx_services_user_id ON public.services USING btree (user_id);

-- stock_deduction_debug_log indexes
CREATE UNIQUE INDEX stock_deduction_debug_log_pkey ON public.stock_deduction_debug_log USING btree (id);

-- stock_details indexes
CREATE UNIQUE INDEX stock_details_pkey ON public.stock_details USING btree (id);

-- stock_history indexes
CREATE UNIQUE INDEX stock_history_pkey ON public.stock_history USING btree (id);
CREATE INDEX idx_stock_history_change_type ON public.stock_history USING btree (change_type);
CREATE INDEX idx_stock_history_date ON public.stock_history USING btree (date);
CREATE INDEX idx_stock_history_product_date ON public.stock_history USING btree (product_id, date DESC);
CREATE INDEX idx_stock_history_product_id ON public.stock_history USING btree (product_id);
CREATE INDEX idx_stock_history_product_name ON public.stock_history USING btree (product_name);
CREATE INDEX idx_stock_history_source ON public.stock_history USING btree (source);

-- stock_reductions indexes
CREATE UNIQUE INDEX stock_reductions_pkey ON public.stock_reductions USING btree (reduction_id);
CREATE INDEX idx_stock_reductions_date ON public.stock_reductions USING btree (date);
CREATE INDEX idx_stock_reductions_product_name ON public.stock_reductions USING btree (product_name);
CREATE INDEX idx_stock_reductions_reference_id ON public.stock_reductions USING btree (reference_id);
CREATE INDEX idx_stock_reductions_user_id ON public.stock_reductions USING btree (user_id);

-- stock_snapshots indexes
CREATE UNIQUE INDEX stock_snapshots_pkey ON public.stock_snapshots USING btree (sale_order_id, product_id);
CREATE UNIQUE INDEX stock_snapshots_sale_order_id_product_id_key ON public.stock_snapshots USING btree (sale_order_id, product_id);
CREATE INDEX idx_stock_snapshots_order_date ON public.stock_snapshots USING btree (order_date);
CREATE INDEX idx_stock_snapshots_order_type ON public.stock_snapshots USING btree (order_type);
CREATE INDEX idx_stock_snapshots_product_id ON public.stock_snapshots USING btree (product_id);

-- stylist_breaks indexes
CREATE UNIQUE INDEX stylist_breaks_pkey ON public.stylist_breaks USING btree (id);
CREATE INDEX idx_stylist_breaks_start_time ON public.stylist_breaks USING btree (start_time);
CREATE INDEX idx_stylist_breaks_stylist_id ON public.stylist_breaks USING btree (stylist_id);

-- stylist_holidays indexes
CREATE UNIQUE INDEX stylist_holidays_pkey ON public.stylist_holidays USING btree (id);
CREATE INDEX idx_stylist_holidays_date ON public.stylist_holidays USING btree (holiday_date);
CREATE INDEX idx_stylist_holidays_stylist_id ON public.stylist_holidays USING btree (stylist_id);

-- stylists indexes
CREATE UNIQUE INDEX stylists_pkey ON public.stylists USING btree (id);
CREATE INDEX idx_stylists_user_id ON public.stylists USING btree (user_id);

-- support_tickets indexes
CREATE UNIQUE INDEX support_tickets_pkey ON public.support_tickets USING btree (id);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets USING btree (assigned_to);
CREATE INDEX idx_support_tickets_client_id ON public.support_tickets USING btree (client_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets USING btree (status);

-- trigger_debug_log indexes
CREATE UNIQUE INDEX trigger_debug_log_pkey ON public.trigger_debug_log USING btree (id);

-- user_sessions indexes
CREATE UNIQUE INDEX user_sessions_pkey ON public.user_sessions USING btree (id);
CREATE INDEX user_sessions_auth_user_id_idx ON public.user_sessions USING btree (auth_user_id);
CREATE INDEX user_sessions_is_active_idx ON public.user_sessions USING btree (is_active);
CREATE INDEX user_sessions_last_active_idx ON public.user_sessions USING btree (last_active);
CREATE INDEX user_sessions_profile_id_idx ON public.user_sessions USING btree (profile_id);

-- =======================================================
-- STORAGE SCHEMA INDEXES
-- =======================================================

-- buckets indexes
CREATE UNIQUE INDEX buckets_pkey ON storage.buckets USING btree (id);
CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);

-- migrations indexes
CREATE UNIQUE INDEX migrations_pkey ON storage.migrations USING btree (id);
CREATE UNIQUE INDEX migrations_name_key ON storage.migrations USING btree (name);

-- objects indexes
CREATE UNIQUE INDEX objects_pkey ON storage.objects USING btree (id);
CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);
CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");
CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);

-- s3_multipart_uploads indexes
CREATE UNIQUE INDEX s3_multipart_uploads_pkey ON storage.s3_multipart_uploads USING btree (id);
CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);

-- s3_multipart_uploads_parts indexes
CREATE UNIQUE INDEX s3_multipart_uploads_parts_pkey ON storage.s3_multipart_uploads_parts USING btree (id);

-- =======================================================
-- END OF INDEX DEFINITIONS
-- ======================================================= 