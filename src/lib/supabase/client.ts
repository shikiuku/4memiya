import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types'

export function createClient() {
    return createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                fetch: (url, options) => {
                    return fetch(url, { ...options, signal: AbortSignal.timeout(600000) }) // 10 minutes
                }
            }
        }
    )
}
