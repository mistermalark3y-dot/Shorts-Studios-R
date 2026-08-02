create extension if not exists "pgcrypto";

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  youtube_channel_id text unique not null,
  title text not null,
  handle text,
  subscribers bigint default 0,
  total_views bigint default 0,
  video_count bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists content_jobs (
  id uuid primary key default gen_random_uuid(),
  channel_id uuid references channels(id) on delete cascade,
  title text not null,
  status text not null default 'idea',
  script text,
  video_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
