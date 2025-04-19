<script>
// This page demonstrates the current theme
</script>

<div class="container mx-auto max-w-4xl px-4 py-8">
  <h1 class="mb-6 text-3xl font-bold">Theme Showcase</h1>

  <div class="card mb-6">
    <h2 class="mb-2 text-xl font-bold">Current Theme: Neumorph Future</h2>
    <p>
      This theme is a sleek, modern design inspired by neumorphism with futuristic elements,
      featuring soft shadows, subtle gradients, and smooth animations.
    </p>
  </div>

  <div class="card mb-8">
    <h2 class="mb-4 text-2xl font-bold">Theme Preview</h2>
    <p class="mb-4">
      This page demonstrates different theme options for gitgud.cc. Click on the theme buttons above
      to preview each theme.
    </p>

    <h3 class="mb-2 text-xl font-bold">UI Elements</h3>

    <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <h4 class="mb-2 font-bold">Buttons</h4>
        <div class="flex flex-wrap gap-2">
          <button
            class="rounded border-2 border-[var(--color-border)] bg-[var(--color-secondary)] px-3 py-2 text-sm font-bold shadow-[1px_1px_0_rgba(0,0,0,0.1)]"
          >
            Normal Button
          </button>
          <button
            class="rounded border-2 border-[var(--color-accent)] bg-[var(--color-accent)] px-3 py-2 text-sm font-bold text-white shadow-[1px_1px_0_rgba(0,0,0,0.1)]"
          >
            Accent Button
          </button>
        </div>
      </div>

      <div>
        <h4 class="mb-2 font-bold">Links</h4>
        <div class="flex flex-col gap-2">
          <button class="text-left text-[var(--color-link)]">Normal Link</button>
          <button class="text-left text-[var(--color-username)]">Username Link</button>
        </div>
      </div>
    </div>

    <h3 class="mb-2 text-xl font-bold">Problem Table Example</h3>
    <div
      class="table-wrapper rounded border-2 border-[var(--color-border)] bg-[var(--color-secondary)] shadow-[2px_2px_0_rgba(0,0,0,0.1)]"
    >
      <table class="w-full border-collapse font-mono text-sm">
        <thead>
          <tr>
            <th
              class="border-b-2 border-[var(--color-border)] bg-[var(--color-tertiary)] p-3 text-center font-bold"
              >Status</th
            >
            <th
              class="border-b-2 border-[var(--color-border)] bg-[var(--color-tertiary)] p-3 text-center font-bold"
              >Source</th
            >
            <th
              class="border-b-2 border-[var(--color-border)] bg-[var(--color-tertiary)] p-3 text-left font-bold"
              >Problem</th
            >
            <th
              class="border-b-2 border-[var(--color-border)] bg-[var(--color-tertiary)] p-3 text-center font-bold"
              >Difficulty</th
            >
            <th
              class="border-b-2 border-[var(--color-border)] bg-[var(--color-tertiary)] p-3 text-left font-bold"
              >Topic</th
            >
            <th
              class="border-b-2 border-[var(--color-border)] bg-[var(--color-tertiary)] p-3 text-left font-bold"
              >Added By</th
            >
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-[var(--color-border)] hover:bg-[var(--color-tertiary)]/30">
            <td class="p-3 text-center">
              <button
                class="flex h-8 w-8 items-center justify-center rounded border-2 border-[var(--color-border)] shadow-[1px_1px_0_rgba(0,0,0,0.1)]"
                aria-label="Mark as solved"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
            </td>
            <td class="p-3 text-center">
              <span class="inline-block h-6 w-6 rounded-full bg-[#3B5998]"></span>
            </td>
            <td class="p-3">
              <button
                class="text-left font-bold text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
              >
                Two Sum
              </button>
            </td>
            <td class="p-3 text-center">
              <span
                class="inline-block rounded border px-2 py-1 font-bold text-white"
                style="background-color: var(--color-pupil)"
              >
                1200
              </span>
            </td>
            <td class="p-3">
              <span
                class="inline-block rounded border border-[var(--color-border)] bg-[var(--color-tertiary)] px-2 py-1 text-sm"
              >
                array
              </span>
            </td>
            <td class="p-3">
              <button class="text-left text-[var(--color-username)] hover:underline">
                @johndoe
              </button>
            </td>
          </tr>
          <tr
            class="border-b border-l-4 border-[var(--color-border)] border-l-[rgb(34_197_94)] bg-[var(--color-solved-row)] hover:bg-[var(--color-tertiary)]/30"
          >
            <td class="p-3 text-center">
              <button
                class="flex h-8 w-8 items-center justify-center rounded bg-[rgb(34_197_94)] text-white shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                aria-label="Solved problem"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </button>
            </td>
            <td class="p-3 text-center">
              <span class="inline-block h-6 w-6 rounded-full bg-[#f2ae00]"></span>
            </td>
            <td class="p-3">
              <button
                class="text-left font-bold text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
              >
                Valid Parentheses
              </button>
            </td>
            <td class="p-3 text-center">
              <span
                class="inline-block rounded border px-2 py-1 font-bold text-white"
                style="background-color: var(--color-specialist)"
              >
                1400
              </span>
            </td>
            <td class="p-3">
              <span
                class="inline-block rounded border border-[var(--color-border)] bg-[var(--color-tertiary)] px-2 py-1 text-sm"
              >
                stack
              </span>
            </td>
            <td class="p-3">
              <button class="text-left text-[var(--color-username)] hover:underline">
                @janedoe
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <h3 class="mt-6 mb-2 text-xl font-bold">Code Example</h3>
    <pre
      class="rounded border-2 border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-primary)_80%,black)] p-4 font-mono text-sm">
<code
        >{@html `// Two Sum solution
function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }

  return null;
}`}</code
      ></pre>
  </div>
</div>

<style>
pre {
  overflow-x: auto;
}

code {
  color: var(--color-text);
}
</style>
