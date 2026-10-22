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

// Explains what is wrong when SUPABASE_SERVICE_ROLE_KEY holds a public key, without printing the key.
export function serviceKeyProblem(key: string): string | null {
  if (key.startsWith("sb_secret_")) return null;
  if (key.startsWith("sb_publishable_")) return "it is the publishable key; use the service_role or secret key";
  const payload = key.split(".")[1];
  if (!payload) return "it is not a Supabase API key";
  try {
    const { role } = JSON.parse(Buffer.from(payload, "base64url").toString()) as { role?: string };
    return role === "service_role" ? null : `it is the "${role}" key; use the service_role key`;
  } catch {
    return "it is not a Supabase API key";
  }
}
