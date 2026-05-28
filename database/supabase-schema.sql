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
  created_at timestamptz default now()
);

create table if not exists users (
  id text primary key,
  name text,
  email text unique,
  password_hash text,
  role text default 'Student',
  github_id text unique,
  google_id text unique,
  created_at timestamptz default now()
);

create table if not exists event_participants (
  event_id bigint not null references events(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (event_id, user_id)
);

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
