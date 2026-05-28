-- Migration 003 — lead outcome tracking
alter table cases add column if not exists lead_outcome text
  check (lead_outcome in ('converted', 'lost', 'no_interest'));
