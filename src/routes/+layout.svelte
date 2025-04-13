<script lang="ts">
import Footer from '$lib/components/Footer.svelte';
import Header from '$lib/components/Header.svelte';
import '../app.css';
import { onMount } from 'svelte';
import { initAuth } from '$lib/services/auth';

let authSubscription: { subscription: { unsubscribe: () => void } } | null = null;

onMount(() => {
  // Initialize authentication
  const initializeAuth = async () => {
    authSubscription = await initAuth();
  };

  initializeAuth();

  // Clean up on component unmount
  return () => {
    if (authSubscription?.subscription) {
      authSubscription.subscription.unsubscribe();
    }
  };
});
</script>

<div class="flex min-h-screen flex-col overflow-hidden">
  <Header />

  <main
    class="relative mx-auto box-border flex w-full flex-1 flex-col overflow-x-hidden px-2 sm:px-3 md:px-4"
  >
    <slot />
  </main>

  <Footer />
</div>

<style>
/* Global styles that can't be handled with Tailwind directly */
:global(html),
:global(body) {
  overflow-x: hidden;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  overscroll-behavior-y: none;
  position: relative;
  height: 100%;
}

:global(.container) {
  width: 100%;
  box-sizing: border-box;
  padding-left: 1rem;
  padding-right: 1rem;
}

/* Ensure content is centered properly */
main {
  position: relative;
}

@media (min-width: 768px) {
  :global(.container) {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

@media (max-width: 768px) {
  :global(.container) {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

/* Ensure consistent max-width across components */
:global(.max-w-\[1200px\]) {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 0.5rem;
}

/* Ensure header and footer are at the ends */
:global(header),
:global(footer) {
  width: 100%;
  position: relative;
  z-index: 30;
}
</style>
