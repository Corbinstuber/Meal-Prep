-- Meal Prep — Supabase schema for the cloud-sync milestone.
-- Run this in the Supabase SQL editor after creating a project.
-- Every table is scoped to the signed-in user via Row Level Security so each
-- account only ever sees its own data.

create table if not exists ingredients (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null,
  dimension text not null check (dimension in ('mass', 'volume', 'count')),
  default_unit text not null,
  is_staple_default boolean not null default false,
  est_price numeric not null default 0,
  price_unit text not null,
  updated_at timestamptz not null default now()
);

create table if not exists recipes (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  servings integer not null default 1,
  notes text,
  -- recipe ingredient rows stored as JSON for simplicity:
  -- [{ ingredientId, quantity, unit, isStaple }]
  items jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

create table if not exists meal_plan_entries (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  slot text not null,
  recipe_id text not null,
  servings integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists manual_items (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  quantity numeric not null default 1,
  unit text not null,
  category text not null,
  est_price numeric not null default 0,
  updated_at timestamptz not null default now()
);

-- Enable RLS + per-user policies on every table.
do $$
declare t text;
begin
  foreach t in array array['ingredients', 'recipes', 'meal_plan_entries', 'manual_items']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format($f$
      create policy "own rows" on %I
        for all
        using (auth.uid() = user_id)
        with check (auth.uid() = user_id);
    $f$, t);
  end loop;
end $$;
