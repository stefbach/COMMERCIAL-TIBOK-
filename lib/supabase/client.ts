import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Mock client for demo mode with chainable methods
const createMockClient = () => {
  const mockQueryBuilder = {
    select: () => mockQueryBuilder,
    insert: () => mockQueryBuilder,
    update: () => mockQueryBuilder,
    delete: () => mockQueryBuilder,
    eq: () => mockQueryBuilder,
    order: () => mockQueryBuilder,
    single: () => Promise.resolve({ data: null, error: null }),
    then: (resolve: any) => resolve({ data: [], error: null }),
  }

  return {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({
        data: {
          user: {
            id: "demo-user-123",
            email: "demo@example.com",
          },
        },
        error: null,
      }),
    },
    from: () => mockQueryBuilder,
  }
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.log("[v0] Missing Supabase environment variables, using mock client for demo mode")
    return createMockClient() as any
  }

  return createSupabaseClient(url, key)
}
