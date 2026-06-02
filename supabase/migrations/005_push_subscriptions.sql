-- Push notification subscriptions (Web Push API)
create table if not exists push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  created_at  timestamptz not null default now(),
  unique(user_id, endpoint)
);

alter table push_subscriptions enable row level security;

create policy "users manage own push subscriptions"
  on push_subscriptions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional: schedule the Edge Function via pg_cron (run after enabling pg_cron extension)
-- select cron.schedule(
--   'send-push-reminders',
--   '* * * * *',
--   $$
--     select net.http_post(
--       url    := current_setting('app.supabase_url') || '/functions/v1/send-push-reminders',
--       headers := jsonb_build_object(
--         'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
--         'Content-Type', 'application/json'
--       ),
--       body   := '{}'::jsonb
--     )
--   $$
-- );
