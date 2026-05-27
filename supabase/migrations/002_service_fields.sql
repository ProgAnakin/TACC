-- Migration 002 — service fields
-- Run this if you already executed 001_initial.sql

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
