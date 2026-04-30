-- You can run this in the Supabase SQL Editor to create an admin user
-- Password will be "admin123"

DO $$
DECLARE
  new_admin_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000', new_admin_id, 'authenticated', 'authenticated', 'admin@evalku.com', 
    crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"name":"Administrator"}', now(), now(), '', '', '', ''
  );

  -- Insert into auth.identities (required by Supabase to allow login)
  INSERT INTO auth.identities (
    provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id
  )
  VALUES (
    new_admin_id::text, new_admin_id, format('{"sub":"%s","email":"%s"}', new_admin_id::text, 'admin@evalku.com')::jsonb, 'email', now(), now(), now(), gen_random_uuid()
  );

  -- Insert into our custom ku_users table
  INSERT INTO public.ku_users (id, email, nama, nomor_telepon, role, is_active)
  VALUES (new_admin_id, 'admin@evalku.com', 'Administrator', '-', 'admin', true);
END $$;
