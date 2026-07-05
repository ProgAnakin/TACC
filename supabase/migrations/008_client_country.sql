-- Migration 008 — client phone country
-- Stores the ISO 3166-1 alpha-2 code chosen for the client's phone number so
-- the app can format the number and build correct WhatsApp/tel links for any
-- nationality. Safe to re-run (idempotent).

alter table cases
  add column if not exists client_country text;
