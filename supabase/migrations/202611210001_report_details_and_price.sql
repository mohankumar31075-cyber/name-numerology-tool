-- Preserve the accepted amount at purchase time so price changes and expiring
-- coupons do not alter an existing order. Old rows intentionally remain NULL.
alter table public.report_orders add column if not exists quoted_amount integer;
alter table public.report_orders add column if not exists report_details jsonb;
