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

alter publication supabase_realtime add table public.plans;

create table if not exists public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  drill_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, drill_id)
);

alter table public.favorites enable row level security;

drop policy if exists "Lire ses favoris" on public.favorites;
create policy "Lire ses favoris" on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Ajouter ses favoris" on public.favorites;
create policy "Ajouter ses favoris" on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Retirer ses favoris" on public.favorites;
create policy "Retirer ses favoris" on public.favorites for delete using (auth.uid() = user_id);

alter publication supabase_realtime add table public.favorites;

create table if not exists public.current_plans (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  plan jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.current_plans enable row level security;

drop policy if exists "Lire son plan en cours" on public.current_plans;
create policy "Lire son plan en cours" on public.current_plans for select using (auth.uid() = user_id);

drop policy if exists "Créer son plan en cours" on public.current_plans;
create policy "Créer son plan en cours" on public.current_plans for insert with check (auth.uid() = user_id);

drop policy if exists "Modifier son plan en cours" on public.current_plans;
create policy "Modifier son plan en cours" on public.current_plans for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter publication supabase_realtime add table public.current_plans;

create or replace function public.admin_list_users()
returns table (id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, plan_count bigint)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'martinantel@me.com' then
    raise exception 'Accès réservé à l''administrateur' using errcode = '42501';
  end if;
  return query
    select u.id, u.email::text, u.created_at, u.last_sign_in_at,
           (select count(*) from public.plans p where p.user_id = u.id)
    from auth.users u
    order by u.last_sign_in_at desc nulls last;
end;
$$;

revoke all on function public.admin_list_users() from public, anon;
grant execute on function public.admin_list_users() to authenticated;
