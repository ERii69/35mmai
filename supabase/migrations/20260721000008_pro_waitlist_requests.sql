-- Private-beta access requests. Server/service-role only; no browser access.
create table if not exists public.pro_waitlist_requests (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  note text check (note is null or char_length(note) <= 500),
  source text not null default '35mmai-pro',
  status text not null default 'pending'
    check (status in ('pending', 'invited', 'declined')),
  requested_at timestamptz not null default now(),
  notified_at timestamptz,
  constraint pro_waitlist_requests_email_normalized
    check (email = lower(trim(email)))
);

create index if not exists pro_waitlist_requests_requested_at_idx
  on public.pro_waitlist_requests (requested_at desc);

alter table public.pro_waitlist_requests enable row level security;

-- No policies: anon/authenticated users cannot read or write request emails.
revoke all on table public.pro_waitlist_requests from anon, authenticated;

comment on table public.pro_waitlist_requests is
  'Private-beta access requests submitted from /pro. Service-role access only.';
