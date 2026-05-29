-- Adds deal value field for lead cases (expected revenue)
alter table cases add column if not exists deal_value numeric(10,2);
