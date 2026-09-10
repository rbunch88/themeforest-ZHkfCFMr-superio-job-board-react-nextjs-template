import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export const createServerSupabaseClient = (cookieStore = cookies()) =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => cookieStore.get(key)?.value,
        set: (key, value, options) => cookieStore.set({ name: key, value, ...options }),
        remove: (key, options) => cookieStore.delete({ name: key, ...options }),
      },
    }
  );



export default createServerSupabaseClient;
