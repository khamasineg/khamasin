import { createClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for use in Next.js server components / route handlers.
 * Forces cache: 'no-store' on every fetch so Next.js never serves stale data
 * from its internal data cache — product edits are always visible immediately.
 *
 * Call this INSIDE the async function (not at module level) so each request
 * gets its own fresh instance.
 */
export function createServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: 'no-store' }),
      },
    }
  )
}
