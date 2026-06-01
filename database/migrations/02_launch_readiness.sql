-- 02_launch_readiness.sql
-- Critical launch hardening for event approvals, rate limits, and event capacity.

-- Postgres/Supabase
alter table events add column if not exists approval_status text not null default 'Approved';
alter table events add column if not exists approved_by_user_id text;
alter table events add column if not exists approved_at timestamptz;
alter table events add column if not exists rejected_by_user_id text;
alter table events add column if not exists rejected_at timestamptz;
alter table events drop constraint if exists events_approval_status_check;
alter table events add constraint events_approval_status_check check (approval_status in ('Pending', 'Approved', 'Rejected'));
update events set approval_status = 'Approved' where approval_status is null;
create index if not exists events_approval_status_created on events(approval_status, created_at, id);

create table if not exists rate_limits (
  rate_key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz default now()
);
create index if not exists rate_limits_reset_at on rate_limits(reset_at);

create or replace function enforce_event_capacity()
returns trigger as $$
declare
  current_count integer;
  max_count integer;
begin
  select participant_limit into max_count from events where id = new.event_id;
  if max_count is null then
    return new;
  end if;
  select count(*) into current_count from event_participants where event_id = new.event_id;
  if current_count >= max_count then
    raise exception 'Event Full';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists event_capacity_before_insert on event_participants;
create trigger event_capacity_before_insert
before insert on event_participants
for each row execute function enforce_event_capacity();

-- MySQL equivalent
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS approval_status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Approved';
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS approved_by_user_id VARCHAR(255) DEFAULT NULL;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP NULL DEFAULT NULL;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS rejected_by_user_id VARCHAR(255) DEFAULT NULL;
-- ALTER TABLE events ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP NULL DEFAULT NULL;
-- UPDATE events SET approval_status = 'Approved' WHERE approval_status IS NULL;
-- CREATE TABLE IF NOT EXISTS rate_limits (
--   rate_key VARCHAR(255) NOT NULL,
--   count INT NOT NULL DEFAULT 0,
--   reset_at TIMESTAMP NOT NULL,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--   PRIMARY KEY (rate_key),
--   KEY rate_limits_reset_at (reset_at)
-- );
-- DROP TRIGGER IF EXISTS event_capacity_before_insert;
-- CREATE TRIGGER event_capacity_before_insert
-- BEFORE INSERT ON event_participants
-- FOR EACH ROW
-- BEGIN
--   DECLARE current_count INT DEFAULT 0;
--   DECLARE max_count INT DEFAULT NULL;
--   SELECT participant_limit INTO max_count FROM events WHERE id = NEW.event_id;
--   IF max_count IS NOT NULL THEN
--     SELECT COUNT(*) INTO current_count FROM event_participants WHERE event_id = NEW.event_id;
--     IF current_count >= max_count THEN
--       SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Event Full';
--     END IF;
--   END IF;
-- END;
