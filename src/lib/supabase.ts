import { createClient } from "@supabase/supabase-js";
import { env } from "./env";
import type { Database } from "./types";

export const supabase = createClient<Database>(
  env.supabaseUrl || "https://placeholder.supabase.co",
  env.supabaseAnonKey || "placeholder-key"
);
