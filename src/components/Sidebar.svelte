<script lang="ts">
  let {currentMode, onNavigate, onJump, totalQuestions} = $props<{
    currentMode: 'welcome' | 'test' | 'real' | 'admin' | 'results';
    onNavigate: (mode: 'welcome' | 'test' | 'real' | 'admin') => void;
    onJump: (id: number) => boolean; // Now expects a boolean return
    totalQuestions: number;
  }>();

  let jumpValue = $state<number | ''>('');
  let jumpError = $state<boolean>(false);

  function executeJump() {
    jumpError = false;
    if (typeof jumpValue === 'number') {
      const success = onJump(jumpValue);
      if (success) {
        jumpValue = ''; // Clear input on success
      } else {
        jumpError = true; // Show error if ID doesn't exist
      }
    }
  }

  // Clear error if user starts typing again
  $effect(() => {
    let _ = jumpValue;
    jumpError = false;
  });
</script>

<aside
  class="w-full max-w-[16rem] shrink-0 border-r border-slate-200 bg-slate-50 h-full hidden md:flex flex-col overflow-y-auto"
>
  <div
    class="p-4 md:p-6 flex flex-col gap-2 text-[16px] border-b border-slate-200"
  >
    <button
      onclick={() => onNavigate('welcome')}
      class="text-left px-4 py-2.5 rounded-md transition-colors {currentMode ===
      'welcome'
        ? 'bg-[#E9F2FF] text-[#0C66E4] font-semibold'
        : 'text-slate-700 hover:bg-slate-200'}">Start</button
    >
    <button
      onclick={() => onNavigate('test')}
      class="text-left px-4 py-2.5 rounded-md transition-colors {currentMode ===
      'test'
        ? 'bg-[#E9F2FF] text-[#0C66E4] font-semibold'
        : 'text-slate-700 hover:bg-slate-200'}">Test Exam</button
    >
    <button
      onclick={() => onNavigate('real')}
      class="text-left px-4 py-2.5 rounded-md transition-colors {currentMode ===
      'real'
        ? 'bg-[#E9F2FF] text-[#0C66E4] font-semibold'
        : 'text-slate-700 hover:bg-slate-200'}">Real Exam</button
    >
  </div>

  <!-- Jump to Question Section -->
  <div class="p-4 md:p-6 flex flex-col gap-3">
    <label
      for="jump-input"
      class="text-[14px] font-bold text-[#172B4D] uppercase tracking-wider"
    >
      Jump to Question ID
    </label>

    <div class="flex gap-2">
      <!-- Number Input (Removed max limit) -->
      <input
        id="jump-input"
        type="number"
        bind:value={jumpValue}
        min="1"
        disabled={currentMode !== 'test'}
        placeholder="e.g. 101"
        class="w-full min-w-0 bg-white border rounded-md px-3 py-2 text-[16px] text-slate-700 outline-none focus:ring-1 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors
               {jumpError
          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
          : 'border-slate-300 focus:border-[#0C66E4] focus:ring-[#0C66E4]'}"
        onkeydown={e => e.key === 'Enter' && executeJump()}
      />
      <!-- Go Button -->
      <button
        onclick={executeJump}
        disabled={currentMode !== 'test' || !jumpValue}
        class="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        Go
      </button>
    </div>

    <!-- Contextual Information / Errors -->
    {#if jumpError}
      <p class="text-[12px] font-bold text-red-600 mt-1 animate-in fade-in">
        ID not found in database.
      </p>
    {:else if currentMode !== 'test'}
      <p class="text-[12px] text-slate-500 mt-1">
        Only available in Test Mode.
      </p>
    {:else}
      <p class="text-[12px] text-slate-500 mt-1">
        Total questions: {totalQuestions}
      </p>
    {/if}
  </div>
</aside>
