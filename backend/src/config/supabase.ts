import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  console.error(
    'Missing Supabase environment variables. Please set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env'
  );
}

/** Public (anon) client — respects RLS policies */
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

/** Service-role client — bypasses RLS for server-side admin operations */
export const supabaseAdmin = createClient(supabaseUrl ?? '', supabaseServiceKey ?? '');
