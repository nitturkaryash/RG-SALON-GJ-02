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
-- Data for Name: membership_tiers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.membership_tiers (id, name, price, duration_months, benefits, description, created_at, updated_at) FROM stdin;
57df9f8b-424b-4861-b886-3042cfeffcbd	Gold	99999.00	12	{"20% discount on all purchases","Free access to premium events","Early access to new features"}	Access to exclusive content, priority customer support, and monthly premium features.	2025-05-25 11:13:22.215848+00	2025-05-25 11:16:27.201724+00
7a734dc2-1205-4658-9550-5be06785a192	Silver	25000.00	36	{}		2025-06-11 14:57:47.996081+00	2025-06-11 14:57:47.996081+00
\.


--
-- Data for Name: service_collections; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.service_collections (id, name, description, created_at, updated_at) FROM stdin;
c86f0db6-a024-43fb-990d-82863909b31f	hair 		2025-05-25 08:18:52.294+00	2025-05-25 08:18:52.400897+00
dcfb5660-d240-4378-ba70-0fbb016fd4f6	face		2025-05-25 12:30:07.625+00	2025-05-25 12:30:07.83101+00
\.


--
-- PostgreSQL database dump complete
--

