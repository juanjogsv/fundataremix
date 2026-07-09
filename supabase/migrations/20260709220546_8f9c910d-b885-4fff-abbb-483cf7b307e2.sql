
REVOKE EXECUTE ON FUNCTION public.sync_legacy_from_dama() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_legacy_from_dama() FROM anon;
REVOKE EXECUTE ON FUNCTION public.sync_legacy_from_dama() FROM authenticated;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;
