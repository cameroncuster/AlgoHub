<script>
  // This layout overrides the main layout for the contests page
</script>

<div class="contests-layout">
  <slot />
</div>

<style>
  /* Override the main layout padding for the contests page */
  :global(main) {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }
  
  .contests-layout {
    width: 100%;
  }
</style>
