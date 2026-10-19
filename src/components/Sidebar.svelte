<script lang="ts">
  let {currentMode, onNavigate, onJump, totalQuestions} = $props<{
    currentMode: 'welcome' | 'test' | 'real';
    onNavigate: (mode: 'welcome' | 'test' | 'real') => void;
    onJump: (num: number) => void;
    totalQuestions: number;
  }>();

  let jumpValue = $state<number | ''>('');

  function handleJump() {
    if (
      typeof jumpValue === 'number' &&
      jumpValue >= 1 &&
      jumpValue <= totalQuestions
    ) {
      onJump(jumpValue);
      jumpValue = ''; // reset after jump
    }
  }
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
      Jump to Question
    </label>

    <div class="flex gap-2">
      <!-- Number Input -->
      <input
        id="jump-input"
        type="number"
        bind:value={jumpValue}
        min="1"
        max={totalQuestions}
        disabled={currentMode === 'real' || currentMode === 'welcome'}
        placeholder="e.g. 5"
        class="w-full min-w-0 bg-white border border-slate-300 rounded-md px-3 py-2 text-[16px] text-slate-700 outline-none focus:border-[#0C66E4] focus:ring-1 focus:ring-[#0C66E4] disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
      />
      <!-- Go Button -->
      <button
        onclick={handleJump}
        disabled={currentMode === 'real' ||
          currentMode === 'welcome' ||
          !jumpValue}
        class="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        Go
      </button>
    </div>
    {#if currentMode === 'real'}
      <p class="text-[12px] text-slate-500 mt-1">
        Navigation disabled in Real Mode.
      </p>
    {/if}
  </div>
</aside>
