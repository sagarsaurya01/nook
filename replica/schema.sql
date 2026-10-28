-- Sorti clone — initial schema (Postgres / Supabase)
-- Clean-room: our own model inferred from recon, not Sorti's.
-- Money = integer minor units + currency. Times = timestamptz (UTC).
-- Access = Postgres Row Level Security; a user sees only their own rows
--          unless a row is shared with them via a membership/share token.

-- ---------- profiles (mirrors auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  biometric_lock boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- collections ----------
create table collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  kind text,                              -- ai category label (recipes, places, products...)
  cover_item_id uuid,                     -- FK added after items (deferrable)
  is_shared boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on collections (user_id);

create table sub_collections (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);
create index on sub_collections (collection_id);

-- ---------- items (one saved thing) ----------
create table items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  collection_id uuid references collections(id) on delete set null,
  sub_collection_id uuid references sub_collections(id) on delete set null,
  type text not null default 'link'
    check (type in ('reel','post','story','tiktok','screenshot',
                    'link','recipe','product','place','pdf','photo')),
  title text,
  source_url text,                        -- original source, always preserved
  image_url text,                         -- thumbnail / uploaded screenshot (Supabase Storage)
  ai_category text,                       -- what the classifier decided
  ai_tags jsonb not null default '[]',
  embedding vector(1536),                 -- pgvector, for semantic search (nullable until computed)
  notes text,
  status text not null default 'ready'
    check (status in ('processing','ready','failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on items (user_id, created_at desc);
create index on items (collection_id);
create index on items (user_id, type);
-- dedup: same source saved twice by same user
create unique index items_user_source_uniq
  on items (user_id, source_url) where source_url is not null;

alter table collections
  add constraint collections_cover_fk
  foreign key (cover_item_id) references items(id) on delete set null;

-- ---------- type-specific metadata (1:1 with item) ----------
create table product_meta (
  item_id uuid primary key references items(id) on delete cascade,
  price_minor bigint,                     -- integer minor units
  currency text,
  brand text,
  promo_code text,
  store_url text,
  track_price boolean not null default false
);

create table place_meta (
  item_id uuid primary key references items(id) on delete cascade,
  lat double precision,
  lng double precision,
  address text,
  creator_handle text,
  booking_url text
);

create table recipe_meta (
  item_id uuid primary key references items(id) on delete cascade,
  ingredients jsonb not null default '[]',
  steps jsonb not null default '[]'
);

-- ---------- price alerts ----------
create table price_alerts (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  target_minor bigint not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index on price_alerts (active) where active;

-- ---------- sharing & collaboration ----------
create table shares (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  created_by uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('link','folder')),
  token text not null unique,             -- opaque share token
  created_at timestamptz not null default now()
);
create index on shares (collection_id);

create table memberships (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references collections(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner','member','viewer')),
  created_at timestamptz not null default now(),
  unique (collection_id, user_id)
);
create index on memberships (user_id);

-- ---------- RLS ----------
alter table profiles        enable row level security;
alter table collections     enable row level security;
alter table sub_collections enable row level security;
alter table items           enable row level security;
alter table product_meta    enable row level security;
alter table place_meta      enable row level security;
alter table recipe_meta     enable row level security;
alter table price_alerts    enable row level security;
alter table shares          enable row level security;
alter table memberships     enable row level security;

-- own profile
create policy own_profile on profiles
  using (id = auth.uid()) with check (id = auth.uid());

-- a collection is visible to its owner or any member
create policy collection_read on collections for select
  using (user_id = auth.uid()
     or exists (select 1 from memberships m
                where m.collection_id = collections.id and m.user_id = auth.uid()));
create policy collection_write on collections for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- items: owner, or member of the item's collection
create policy item_read on items for select
  using (user_id = auth.uid()
     or exists (select 1 from memberships m
                where m.collection_id = items.collection_id and m.user_id = auth.uid()));
create policy item_write on items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- meta tables follow their item
create policy product_meta_rw on product_meta for all
  using (exists (select 1 from items i where i.id = product_meta.item_id and i.user_id = auth.uid()))
  with check (exists (select 1 from items i where i.id = product_meta.item_id and i.user_id = auth.uid()));
create policy place_meta_rw on place_meta for all
  using (exists (select 1 from items i where i.id = place_meta.item_id and i.user_id = auth.uid()))
  with check (exists (select 1 from items i where i.id = place_meta.item_id and i.user_id = auth.uid()));
create policy recipe_meta_rw on recipe_meta for all
  using (exists (select 1 from items i where i.id = recipe_meta.item_id and i.user_id = auth.uid()))
  with check (exists (select 1 from items i where i.id = recipe_meta.item_id and i.user_id = auth.uid()));

create policy sub_coll_rw on sub_collections for all
  using (exists (select 1 from collections c where c.id = sub_collections.collection_id and c.user_id = auth.uid()))
  with check (exists (select 1 from collections c where c.id = sub_collections.collection_id and c.user_id = auth.uid()));

create policy alerts_rw on price_alerts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy shares_rw on shares for all
  using (created_by = auth.uid()) with check (created_by = auth.uid());
create policy memberships_read on memberships for select
  using (user_id = auth.uid()
     or exists (select 1 from collections c where c.id = memberships.collection_id and c.user_id = auth.uid()));
