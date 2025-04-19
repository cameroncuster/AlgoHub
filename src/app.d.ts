// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
import type { SupabaseClient, Session } from '@supabase/supabase-js';

declare namespace App {
  interface Locals {
    userid: string;
    supabase: SupabaseClient;
    session: Session | null;
  }

  // interface Platform {}

  // interface PrivateEnv {}

  // interface PublicEnv {}
}
