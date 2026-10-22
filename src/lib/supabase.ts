import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

// Server-only client using the service role key. Never import this from client components.
export function supabaseAdmin(): SupabaseClient {
  client ??= createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
  return client;
}

export function serviceRoleKey(): string {
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}
