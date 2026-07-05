-- Migration 007 — supporting indexes for tables added in 005/006
-- Safe to re-run (idempotent)

-- The Edge Function and the app both look up a user's push subscriptions by
-- user_id (to fan out notifications and to toggle the enable/disable state).
create index if not exists idx_push_subscriptions_user_id
  on push_subscriptions(user_id);

-- case_photos(case_id) is already indexed in 006. Add user_id for the RLS
-- select path and any per-user photo aggregation.
create index if not exists idx_case_photos_user_id
  on case_photos(user_id);
