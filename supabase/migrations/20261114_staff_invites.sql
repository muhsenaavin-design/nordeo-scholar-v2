-- Staff accounts by invitation only (applied to project nordeo-scholar on 14 Nov 2026).
-- The Owner adds an email (and optionally a role) to staff_invites. A sign-up for any other email is
-- rejected by a trigger on auth.users, so closing the "Daftar" tab is enforced on the server, not only in the UI.

create table if not exists public.staff_invites (
  email text primary key check (email = lower(email) and position('@' in email) > 1),
  role text check (role in ('owner', 'admin', 'marketing')),
  invited_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  used_at timestamptz
);

alter table public.staff_invites enable row level security;

create policy "owner reads invites" on public.staff_invites
  for select to authenticated using (private.current_role_name() = 'owner');
create policy "owner adds invites" on public.staff_invites
  for insert to authenticated with check (private.current_role_name() = 'owner');
create policy "owner removes invites" on public.staff_invites
  for delete to authenticated using (private.current_role_name() = 'owner');

-- Reject sign-ups from emails without an open invitation.
create or replace function private.guard_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.staff_invites i where i.email = lower(new.email) and i.used_at is null) then
    raise exception 'Signup is by invitation only';
  end if;
  return new;
end $$;

drop trigger if exists before_auth_user_created on auth.users;
create trigger before_auth_user_created
  before insert on auth.users
  for each row execute function private.guard_signup();

-- The new profile takes the role from the invitation, and the invitation is marked as used.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invited_role text;
begin
  select i.role into invited_role from public.staff_invites i where i.email = lower(new.email);
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(invited_role, 'pending'))
  on conflict (id) do nothing;
  update public.staff_invites set used_at = now() where email = lower(new.email);
  return new;
end $$;
