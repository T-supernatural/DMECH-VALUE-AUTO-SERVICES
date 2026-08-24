alter table vehicles add column if not exists display_stamps text[] not null default '{}';
alter table vehicles add constraint vehicles_display_stamps_check check (display_stamps <@ array['verified','sold','reserved','inspected','delivered']);
