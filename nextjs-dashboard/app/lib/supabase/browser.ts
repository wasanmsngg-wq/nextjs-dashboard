"use client";

import { createBrowserClient } from "@supabase/ssr";
import { readPublicEnv } from "@/app/lib/env";
import type { Database } from "@/app/lib/database.types";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createSupabaseBrowserClient() {
  const env = readPublicEnv();
  client ??= createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
  return client;
}
