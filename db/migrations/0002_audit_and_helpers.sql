-- 0002_audit_and_helpers.sql
-- 監査ログ, トリガー, および public_id 生成ヘルパー

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL,
  record_id uuid,
  performed_by text, -- auth0 sub or 'service'
  performed_at timestamptz DEFAULT now(),
  payload jsonb
);

-- audit trigger function (簡易)
CREATE OR REPLACE FUNCTION public.audit_changes() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  -- Record performed_by as the jwt.claims.sub when present, otherwise mark as 'service'
  INSERT INTO public.audit_logs(table_name, operation, record_id, performed_by, payload)
  VALUES (
    TG_TABLE_NAME,
    TG_OP,
    COALESCE(NEW.id, OLD.id),
    COALESCE(current_setting('jwt.claims.sub', true), 'service'),
    row_to_json(COALESCE(NEW, OLD))::jsonb
  );
  RETURN NEW;
END;
$$;

-- attach audit trigger to tables where we want to log changes
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN (
    'users','companies','favorites','user_profiles','user_details'
  ) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS audit_%s_trigger ON public.%s;', tbl, tbl);
    EXECUTE format('CREATE TRIGGER audit_%s_trigger AFTER INSERT OR UPDATE OR DELETE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.audit_changes();', tbl, tbl);
  END LOOP;
END;
$$;

-- Secure public_id generator using gen_random_bytes and base62 mapping.
-- This uses cryptographic random bytes to avoid predictable public IDs.
CREATE OR REPLACE FUNCTION public.generate_public_id(length integer DEFAULT 10)
RETURNS text AS $$
DECLARE
  chars text := '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  res text := '';
  rnd bytea;
  b int;
BEGIN
  IF length <= 0 THEN
    RETURN '';
  END IF;
  -- generate length random bytes and map each byte to one of 62 chars
  rnd := gen_random_bytes(length);
  FOR i IN 0..(length - 1) LOOP
    b := get_byte(rnd, i) % 62;
    res := res || substr(chars, b + 1, 1);
  END LOOP;
  RETURN res;
END;
$$ LANGUAGE plpgsql VOLATILE;
