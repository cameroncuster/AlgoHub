<script lang="ts">
// Common styling classes
export const tableWrapperClass = 'mt-4 w-full';
export const tableContainerClass = 'table-wrapper rounded-lg bg-[var(--color-secondary)] shadow-sm';
export const tableClass =
  'w-full min-w-[900px] table-fixed border-collapse overflow-hidden bg-[var(--color-secondary)]';
export const headerCellClass = 'sticky top-0 z-10 bg-[var(--color-tertiary)] p-3 font-bold';
export const headerCellClickableClass = `${headerCellClass} cursor-pointer transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--color-tertiary)_90%,var(--color-accent)_10%,transparent)]`;
export const rowClass =
  'relative border-b border-[var(--color-border)] transition-colors duration-200 last:border-b-0';
export const solvedRowClass = 'border-l-4 border-l-[rgb(34_197_94)] bg-[var(--color-solved-row)]';
export const unsolvedRowClass = 'hover:bg-black/5';
export const cellClass = 'p-3';
</script>

<div class={tableWrapperClass}>
  <div class={tableContainerClass}>
    <table class={tableClass}>
      <thead>
        <tr>
          <!-- Header slot -->
          <slot name="header"></slot>
        </tr>
      </thead>
      <tbody>
        <!-- Body slot -->
        <slot name="body"></slot>
      </tbody>
    </table>
  </div>
</div>

<style>
/* Ensure the table is responsive */
.table-wrapper {
  overflow-x: auto;
  position: relative;
  -webkit-overflow-scrolling: touch;
  width: 100%;
}

/* Add smooth transitions for solved button */
:global(.solved-button) {
  transition: all 0.3s ease;
}

/* Add hover effects */
:global(tr:hover .solved-button:not(:hover)) {
  transform: scale(1.05);
}

/* Ensure feedback buttons don't get cut off */
:global(td:last-child) {
  min-width: 140px;
}

/* Ensure table fits within container */
.w-full {
  max-width: 100%;
}

/* Add subtle animation for solved problems */
:global(tr) {
  overflow: hidden;
}

/* Checkmark animation */
:global(.solved-button) {
  animation: pulse 1.5s infinite alternate;
}

:global(.checkmark-icon) {
  transition: transform 0.3s ease;
}

:global(.solved-button .checkmark-icon) {
  transform: scale(1.1);
}

/* Sortable header styles */
:global(th) {
  transition: background-color 0.2s ease;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 5px rgba(34, 197, 94, 0.4);
  }
  100% {
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.7);
  }
}

/* Ensure username is always purple */
:global(a[href*='github.com']) {
  color: var(--color-username) !important;
}

:global(a[href*='github.com']:hover) {
  color: color-mix(in oklab, var(--color-username) 80%, white) !important;
}
</style>
