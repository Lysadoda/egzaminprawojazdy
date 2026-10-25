<script lang="ts">
  import { db } from '../lib/store.svelte';

  let { onJump } = $props<{ onJump: (id: number) => void }>();

  let isOpen = $state(false);
</script>

<div
  class="fixed top-0 right-0 h-full w-80 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] transition-transform duration-300 z-50 flex flex-col border-l border-slate-200 {isOpen
    ? 'translate-x-0'
    : 'translate-x-full'}"
>
  <button
    onclick={() => (isOpen = !isOpen)}
    class="absolute top-24 -left-12 w-12 h-16 bg-red-600 text-white rounded-l-lg shadow-[-4px_4px_10px_rgba(0,0,0,0.1)] flex items-center justify-center hover:bg-red-700 transition-colors"
  >
    <div class="flex flex-col items-center">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        ><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg
      >
      {#if db.mistakes.length > 0}
        <span class="absolute -top-2 -left-2 bg-[#172B4D] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
          {db.mistakes.length}
        </span>
      {/if}
    </div>
  </button>

  <div class="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
    <h2 class="font-bold text-[#172B4D] text-lg">Mistakes Bank</h2>
    {#if db.mistakes.length > 0}
      <button onclick={() => db.clearMistakes()} class="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wide"> Clear All </button>
    {/if}
  </div>

  <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
    {#if db.mistakes.length === 0}
      <div class="text-slate-400 text-center mt-10 text-sm">No mistakes yet. Great job!</div>
    {:else}
      {#each db.mistakes as mistakeId}
        <!-- Changed from a single <button> to a <div> container to avoid nested buttons -->
        <div class="w-full p-3 rounded border border-red-200 bg-red-50 hover:bg-red-100 transition-colors group flex flex-col">
          <div class="flex justify-between items-start mb-1">
            <!-- Click Question ID to jump -->
            <button
              onclick={() => {
                onJump(mistakeId);
                isOpen = false;
              }}
              class="text-xs font-bold text-red-600 hover:underline outline-none text-left flex-1"
            >
              Question {mistakeId}
            </button>

            <!-- X in circle delete button -->
            <button
              onclick={() => db.removeMistake(mistakeId)}
              class="text-red-400 hover:text-red-700 outline-none transition-colors ml-2"
              title="Remove from list"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Click Question Text to jump -->
          <button
            onclick={() => {
              onJump(mistakeId);
              isOpen = false;
            }}
            class="text-sm text-red-900 truncate text-left outline-none w-full"
          >
            {db.questions.find((q) => q.id === mistakeId)?.question || 'Unknown Question'}
          </button>
        </div>
      {/each}
    {/if}
  </div>
</div>
