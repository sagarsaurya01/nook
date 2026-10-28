-- Nook MVP schema. Paste into Supabase → SQL Editor → Run.
-- One table: items. Collections are derived by grouping on `category`,
-- so there is nothing to seed. RLS keeps every user to their own saves.

create table if not exists items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'link'
    check (type in ('reel','post','story','tiktok','screenshot',
                    'link','recipe','product','place','outfit','pdf','photo')),
  category text not null default 'Links',
  title text,
  summary text,
  source_url text,
  image_url text,
  tags jsonb not null default '[]',
  meta jsonb not null default '{}',     -- price/brand/promo/address/ingredients/steps
  notes text,
  status text not null default 'ready'
    check (status in ('processing','ready','failed')),
  created_at timestamptz not null default now()
);

create index if not exists items_user_created on items (user_id, created_at desc);
create index if not exists items_user_cat on items (user_id, category);
create unique index if not exists items_user_source
  on items (user_id, source_url) where source_url is not null;

alter table items enable row level security;

drop policy if exists items_select on items;
drop policy if exists items_write  on items;
create policy items_select on items for select using (user_id = auth.uid());
create policy items_write  on items for all    using (user_id = auth.uid())
                                               with check (user_id = auth.uid());

-- Storage bucket for uploaded screenshots (private; served via signed URLs).
insert into storage.buckets (id, name, public)
values ('saves', 'saves', false)
on conflict (id) do nothing;

drop policy if exists saves_rw on storage.objects;
create policy saves_rw on storage.objects for all
  using (bucket_id = 'saves' and owner = auth.uid())
  with check (bucket_id = 'saves' and owner = auth.uid());
