import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

const globalForSupabase = globalThis as typeof globalThis & {
  __atlasSupabaseClient?: SupabaseClient;
};

export const supabase = isSupabaseConfigured
  ? (globalForSupabase.__atlasSupabaseClient ??= createClient(supabaseUrl!, supabaseKey!, {
    auth: {
      persistSession: false,
    },
  }))
  : null;
