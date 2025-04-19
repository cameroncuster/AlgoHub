import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  // Get the session from the locals object
  const { supabase } = locals;
  const { data } = await supabase.auth.getSession();
  
  // If there's no session, redirect to the home page
  if (!data.session) {
    throw redirect(303, '/');
  }
  
  // Return the session data to the page
  return {
    session: data.session
  };
};
