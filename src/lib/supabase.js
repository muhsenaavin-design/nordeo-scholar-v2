import { createClient } from '@supabase/supabase-js';
import { SUPABASE_KEY, SUPABASE_URL } from '../config/supabase';

// Tests run without a network, so they keep the static data the site was built with.
const offline = import.meta.env.MODE === 'test' || import.meta.env.VITE_OFFLINE === '1';

export const supabase = offline ? null : createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, storageKey: 'nordeo-auth' },
});

export const hasDatabase = Boolean(supabase);
