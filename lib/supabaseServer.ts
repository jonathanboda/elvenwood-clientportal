import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a singleton instance for server-side use
let supabaseClientInstance: any = null;

export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }

  if (!supabaseClientInstance) {
    supabaseClientInstance = createSupabaseClient(supabaseUrl, supabaseKey);
  }

  return supabaseClientInstance;
}
