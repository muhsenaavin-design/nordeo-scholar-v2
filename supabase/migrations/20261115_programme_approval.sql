-- Academy programmes follow Draft -> In review -> Published, and only the Owner publishes (15 Nov 2026).
-- The programmes live in one site_content row (key 'programs'). A trigger rejects any write by a
-- signed-in non-Owner that publishes a programme or changes one that is already published.
-- The Owner gets write access to 'programs' so that the approval can be saved.

create or replace function private.can_write_content(k text)
returns boolean language sql stable security definer set search_path = public, private as $$
  select case private.current_role_name()
    when 'owner' then k in ('pages', 'profile', 'site', 'programs')
    when 'admin' then k in ('pages', 'ecosystems', 'profile', 'programs', 'partnerships', 'contact', 'navigation', 'media', 'site', 'promo', 'journals')
    when 'marketing' then k in ('programs', 'partnerships', 'media', 'promo')
    else false end
$$;

create or replace function private.guard_programs_publish()
returns trigger language plpgsql security definer set search_path = public, private as $$
declare
  item jsonb;
  before_item jsonb;
begin
  if new.key <> 'programs' or auth.uid() is null or private.current_role_name() = 'owner' then
    return new;
  end if;
  for item in select value from jsonb_array_elements(coalesce(new.value, '[]'::jsonb)) loop
    if coalesce(item->>'status', 'published') = 'published' then
      before_item := null;
      if tg_op = 'UPDATE' then
        select o.value into before_item from jsonb_array_elements(coalesce(old.value, '[]'::jsonb)) o where o.value->>'id' = item->>'id';
      end if;
      if before_item is null or coalesce(before_item->>'status', 'published') <> 'published' or before_item <> item then
        raise exception 'Only the Owner can publish a programme';
      end if;
    end if;
  end loop;
  return new;
end $$;

drop trigger if exists guard_programs_publish on public.site_content;
create trigger guard_programs_publish before insert or update on public.site_content
  for each row execute function private.guard_programs_publish();
