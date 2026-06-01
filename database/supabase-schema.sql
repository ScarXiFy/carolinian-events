-- Carolinian Events Supabase/Postgres schema.
-- Run this in Supabase SQL Editor for a fresh project.

create table if not exists events (
  id bigserial primary key,
  event_name text not null,
  organizer text not null,
  description text not null,
  event_date date not null,
  event_time time not null,
  event_end_time time,
  location text not null,
  category text not null default 'Academic',
  status text not null default 'Upcoming',
  participant_limit integer,
  event_image_path text,
  contact_email text,
  contact_phone text,
  created_by_user_id text,
  approval_status text not null default 'Approved' check (approval_status in ('Pending', 'Approved', 'Rejected')),
  approved_by_user_id text,
  approved_at timestamptz,
  rejected_by_user_id text,
  rejected_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists users (
  id text primary key,
  name text,
  email text unique,
  password_hash text,
  role text not null default 'Student' check (role in ('Student', 'Organizer', 'Admin')),
  github_id text unique,
  google_id text unique,
  email_verified_at timestamptz,
  created_at timestamptz default now()
);

alter table events add column if not exists created_by_user_id text;
alter table events add column if not exists contact_email text;
alter table events add column if not exists contact_phone text;
alter table events add column if not exists approval_status text not null default 'Approved';
alter table events add column if not exists approved_by_user_id text;
alter table events add column if not exists approved_at timestamptz;
alter table events add column if not exists rejected_by_user_id text;
alter table events add column if not exists rejected_at timestamptz;
alter table events drop constraint if exists events_approval_status_check;
alter table events add constraint events_approval_status_check check (approval_status in ('Pending', 'Approved', 'Rejected'));
update events set approval_status = 'Approved' where approval_status is null;
alter table users add column if not exists google_id text unique;
alter table users add column if not exists github_id text unique;
alter table users add column if not exists email_verified_at timestamptz;
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in ('Student', 'Organizer', 'Admin'));
update users set email_verified_at = now() where email_verified_at is null;

create table if not exists event_participants (
  event_id bigint not null references events(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (event_id, user_id)
);

create table if not exists organizer_requests (
  id bigserial primary key,
  user_id text not null references users(id) on delete cascade,
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected')),
  requested_at timestamptz default now(),
  reviewed_by_user_id text references users(id) on delete set null,
  reviewed_at timestamptz
);

create unique index if not exists organizer_requests_one_pending_per_user
  on organizer_requests(user_id)
  where status = 'Pending';

create table if not exists email_verification_tokens (
  id bigserial primary key,
  user_id text not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists event_images (
  id bigserial primary key,
  event_id bigint not null references events(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

create index if not exists event_images_event_sort
  on event_images(event_id, sort_order, id);

create index if not exists events_approval_status_created
  on events(approval_status, created_at, id);

create table if not exists notifications (
  id bigserial primary key,
  recipient_user_id text not null references users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  event_id bigint references events(id) on delete set null,
  actor_user_id text references users(id) on delete set null,
  read_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists notifications_recipient_read_created
  on notifications(recipient_user_id, read_at, created_at);

create index if not exists notifications_event_type
  on notifications(event_id, type);

create table if not exists rate_limits (
  rate_key text primary key,
  count integer not null default 0,
  reset_at timestamptz not null,
  updated_at timestamptz default now()
);

create index if not exists rate_limits_reset_at
  on rate_limits(reset_at);

create or replace function enforce_event_capacity()
returns trigger as $$
declare
  current_count integer;
  max_count integer;
begin
  select participant_limit into max_count
  from events
  where id = new.event_id;

  if max_count is null then
    return new;
  end if;

  select count(*) into current_count
  from event_participants
  where event_id = new.event_id;

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

insert into events (
  event_name,
  organizer,
  description,
  event_date,
  event_time,
  event_end_time,
  location,
  category,
  status,
  participant_limit
)
select
  'Mock Presentation',
  'GROUP F',
  'A practice presentation session for CPE students.',
  '2026-06-05',
  '14:00',
  '16:00',
  'NCR Lab',
  'Academic',
  'Upcoming',
  80
where not exists (
  select 1 from events where event_name = 'Mock Presentation'
);
