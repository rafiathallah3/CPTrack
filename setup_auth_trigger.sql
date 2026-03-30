-- First, it's highly recommended to alter your "User" table to have userID as a SERIAL or IDENTITY auto-increment column
-- IF you haven't already. If userID is purely an INT and you don't provide a sequence, it will fail to insert.
-- We suggest altering it (only run this if you haven't added data or made it SERIAL yet):
-- ALTER TABLE "User" ALTER COLUMN "userID" ADD GENERATED ALWAYS AS IDENTITY;

-- 1. Create a function that runs when a user is registered through Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public."User" (username, email, role, rating)
  values (
    new.raw_user_meta_data->>'username',           -- Get username from OAuth or Email Sign up Metadata
    new.email,                                     -- Get email from Supabase Auth
    'Beginner',                                    -- Default Role
    0                                              -- Default Rating
  );
  return new;
end;
$$;

-- 2. Create the Trigger
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
