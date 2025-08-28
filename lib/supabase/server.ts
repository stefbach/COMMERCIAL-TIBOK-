import { createClient as createSupabaseClient } from "@supabase/supabase-js"

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(`Missing Supabase environment variables. Please check your Project Settings.
    Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
    Available: ${Object.keys(process.env)
      .filter((key) => key.includes("SUPABASE"))
      .join(", ")}`)
  }

  return createSupabaseClient(supabaseUrl, supabaseKey)
}
