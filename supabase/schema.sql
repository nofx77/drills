create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null default '',
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists plans_user_updated on public.plans (user_id, updated_at desc);

alter table public.plans enable row level security;

drop policy if exists "Lire ses plans" on public.plans;
create policy "Lire ses plans" on public.plans for select using (auth.uid() = user_id);

drop policy if exists "Créer ses plans" on public.plans;
create policy "Créer ses plans" on public.plans for insert with check (auth.uid() = user_id);

drop policy if exists "Modifier ses plans" on public.plans;
create policy "Modifier ses plans" on public.plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Supprimer ses plans" on public.plans;
create policy "Supprimer ses plans" on public.plans for delete using (auth.uid() = user_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists plans_touch on public.plans;
create trigger plans_touch before update on public.plans for each row execute function public.touch_updated_at();
