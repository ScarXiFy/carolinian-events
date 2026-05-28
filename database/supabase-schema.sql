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
  created_by_user_id text,
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
  created_at timestamptz default now()
);

alter table events add column if not exists created_by_user_id text;
alter table users add column if not exists google_id text unique;
alter table users add column if not exists github_id text unique;
alter table users drop constraint if exists users_role_check;
alter table users add constraint users_role_check check (role in ('Student', 'Organizer', 'Admin'));

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
