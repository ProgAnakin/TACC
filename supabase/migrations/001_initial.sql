-- Enable UUID extension
create extension if not exists "pgcrypto";

-- =====================
-- CASES TABLE
-- =====================
create table if not exists cases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  client_name text not null,
  client_phone text,
  client_email text,
  shopify_order text,
  product_name text,
  category text not null check (category in ('arrival', 'assistance', 'lead', 'problem')),
  status text not null default 'open' check (status in ('open', 'resolved')),
  urgency text not null default 'normal' check (urgency in ('low', 'normal', 'high', 'critical')),
  cause text,
  notes text,
  call_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- =====================
-- CALL_LOGS TABLE
-- =====================
create table if not exists call_logs (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references cases(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  logged_at timestamptz not null default now(),
  notes text
);

-- =====================
-- REMINDERS TABLE
-- =====================
create table if not exists reminders (
  id uuid default gen_random_uuid() primary key,
  case_id uuid references cases(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  remind_at timestamptz not null,
  title text not null,
  sent boolean not null default false,
  created_at timestamptz not null default now()
);

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_cases_updated_at
  before update on cases
  for each row execute procedure update_updated_at_column();

-- =====================
-- RPC: increment call count
-- =====================
create or replace function increment_call_count(case_id uuid)
returns void as $$
begin
  update cases
  set call_count = call_count + 1,
      updated_at = now()
  where id = case_id;
end;
$$ language plpgsql security definer;

-- =====================
-- ROW LEVEL SECURITY
-- =====================
alter table cases enable row level security;
alter table call_logs enable row level security;
alter table reminders enable row level security;

-- Cases policies
create policy "cases_select_own" on cases
  for select using (auth.uid() = user_id);

create policy "cases_insert_own" on cases
  for insert with check (auth.uid() = user_id);

create policy "cases_update_own" on cases
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "cases_delete_own" on cases
  for delete using (auth.uid() = user_id);

-- Call logs policies
create policy "call_logs_select_own" on call_logs
  for select using (auth.uid() = user_id);

create policy "call_logs_insert_own" on call_logs
  for insert with check (auth.uid() = user_id);

create policy "call_logs_delete_own" on call_logs
  for delete using (auth.uid() = user_id);

-- Reminders policies
create policy "reminders_select_own" on reminders
  for select using (auth.uid() = user_id);

create policy "reminders_insert_own" on reminders
  for insert with check (auth.uid() = user_id);

create policy "reminders_update_own" on reminders
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reminders_delete_own" on reminders
  for delete using (auth.uid() = user_id);

-- =====================
-- INDEXES FOR PERFORMANCE
-- =====================
create index idx_cases_user_id on cases(user_id);
create index idx_cases_status on cases(user_id, status);
create index idx_cases_category on cases(user_id, category);
create index idx_call_logs_case_id on call_logs(case_id);
create index idx_reminders_user_id on reminders(user_id);
create index idx_reminders_remind_at on reminders(user_id, remind_at) where sent = false;
