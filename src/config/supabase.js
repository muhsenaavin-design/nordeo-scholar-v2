// Supabase project for Nordeo Scholar (database, login, and file storage).
// The publishable key is meant for browser code: what each visitor may read or write is
// decided by row-level security in the database, not by hiding this key.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://hfqcrwcfjjnbnrqbpeea.supabase.co';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rW0DdLJ-gj012gm7iai41A_7-7zJ0li';
