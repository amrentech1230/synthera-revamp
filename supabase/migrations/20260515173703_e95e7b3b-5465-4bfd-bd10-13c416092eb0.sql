
-- Fix function search_path
create or replace function public.touch_updated_at() returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Lock down SECURITY DEFINER functions from being called via PostgREST
revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Replace overly permissive insert policies with column-checked ones
drop policy if exists "newsletter public insert" on public.newsletter_subscribers;
create policy "newsletter public insert" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (char_length(email) between 3 and 320 and email like '%@%');

drop policy if exists "contact public insert" on public.contact_submissions;
create policy "contact public insert" on public.contact_submissions
  for insert to anon, authenticated
  with check (
    char_length(name) between 1 and 200 and
    char_length(email) between 3 and 320 and email like '%@%' and
    char_length(message) between 1 and 5000
  );
