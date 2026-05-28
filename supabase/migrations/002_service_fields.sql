-- Migration 002 — service fields + missing RLS policy
-- Safe to re-run (idempotent)

alter table cases add column if not exists expected_date    date;
alter table cases add column if not exists service_status   text
  check (service_status in ('sent','evaluation','in_repair','ready','delivered'));
alter table cases add column if not exists last_contact_at  timestamptz;

-- Auto-update last_contact_at when a call_log is inserted
create or replace function update_last_contact()
returns trigger as $$
begin
  update cases set last_contact_at = new.logged_at
  where id = new.case_id;
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_call_log_insert on call_logs;
create trigger on_call_log_insert
  after insert on call_logs
  for each row execute procedure update_last_contact();

-- Missing UPDATE policy on call_logs (migration 001 only had select/insert/delete)
drop policy if exists "call_logs_update_own" on call_logs;
create policy "call_logs_update_own" on call_logs
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
