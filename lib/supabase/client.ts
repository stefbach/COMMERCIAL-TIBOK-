import { createBrowserClient } from "@supabase/ssr"

let clientInstance: any = null
let hasLoggedEnvironment = false

export function createClient() {
  if (clientInstance) {
    return clientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!hasLoggedEnvironment) {
    console.log("[v0] Supabase client environment check:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : "undefined",
    })
    hasLoggedEnvironment = true
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Missing Supabase environment variables, returning mock client")
    clientInstance = {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: new Error("Supabase not configured") }),
        insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        delete: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error("Supabase not configured") }),
        signInWithPassword: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        signUp: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
        signOut: () => Promise.resolve({ error: new Error("Supabase not configured") }),
        onAuthStateChange: (callback: any) => {
          // Return a mock subscription object
          return {
            data: {
              subscription: {
                unsubscribe: () => {},
              },
            },
          }
        },
      },
    } as any
  } else {
    clientInstance = createBrowserClient(supabaseUrl, supabaseAnonKey)
  }

  return clientInstance
}
