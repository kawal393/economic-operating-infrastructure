// The generated Supabase client throws when the browser build was published
// without SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY. A missing optional client
// config must never white-screen a public page: consumers degrade to a
// signed-out, read-only state instead.
import { supabase } from "./client";

let cached: boolean | null = null;

export function supabaseAvailable(): boolean {
  if (cached === null) {
    try {
      void supabase.auth;
      cached = true;
    } catch {
      cached = false;
    }
  }
  return cached;
}
