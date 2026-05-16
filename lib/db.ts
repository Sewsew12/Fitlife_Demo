import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-only client using the service role key (bypasses RLS — fine for a demo backend)
export function getDb() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  });
}
