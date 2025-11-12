'use client';

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a singleton instance
let supabaseClientInstance: any = null;

/**
 * Client-side Supabase client with optimizations
 *
 * Key optimizations:
 * 1. Singleton pattern to reuse connection
 * 2. Enables connection pooling
 * 3. Optimized for browser environments
 *
 * For server-side operations, use lib/supabase-server.ts instead
 */
export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials in environment variables');
  }

  if (!supabaseClientInstance) {
    supabaseClientInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-connection-pooling': 'true',
        },
      },
    });
  }

  return supabaseClientInstance;
}
