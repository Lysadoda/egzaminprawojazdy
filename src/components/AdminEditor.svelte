<script lang="ts">
  import {db} from '../lib/store.svelte';
  import type {Question} from '../lib/types';

  // Svelte 5 Props
  let {onExit} = $props<{onExit: () => void}>();

  // Clone explanations to local state so we don't mutate the global DB directly
  let draftExplanations = $state<Record<string, string>>({...db.explanations});

  // Track selected question. Fallback to 1 if empty.
  let selectedId = $state<number>(db.questions[0]?.id || 1);

  // Derived current question
  let currentQuestion = $derived(
    db.questions.find((q: Question) => q.id === selectedId),
  );

  // Bound to the textarea
  let currentEditText = $state<string>(draftExplanations[selectedId] || '');

  // Sync textarea when the selected ID changes
  $effect(() => {
    let _ = selectedId; // Depend on selectedId
    currentEditText = draftExplanations[selectedId] || '';
  });

  // Derived options to prevent crashing on YN questions (which lack the options object)
  let optionsToRender = $derived(
    currentQuestion?.type === 'YN'
      ? {Y: 'Yes', N: 'No'}
      : currentQuestion?.options || {},
  );

  // Basic sanitization
  function sanitizeInput(text: string): string {
    let sanitized = text.replace(/<[^>]*>?/gm, ''); // Strip HTML
    sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Strip invisible chars
    return sanitized.trim();
  }

  function saveToDraft() {
    if (!currentQuestion) return;
    const cleanText = sanitizeInput(currentEditText);

    if (cleanText) {
      draftExplanations[currentQuestion.id] = cleanText;
    } else {
      delete draftExplanations[currentQuestion.id]; // Remove key if empty
    }

    // Update textarea to reflect sanitized state visually
    currentEditText = cleanText;
  }

  function exportChanges() {
    const dataStr = JSON.stringify(draftExplanations, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `explanations_draft_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
  }
</script>

<div class="flex h-full w-full bg-slate-50 text-slate-800 overflow-hidden">
  <!-- LEFT PANE: List of Questions -->
  <div
    class="w-80 bg-white border-r border-slate-200 flex flex-col h-full shrink-0"
  >
    <div
      class="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-100"
    >
      <h2 class="font-bold text-[#172B4D]">Admin: Explanations</h2>
      <button
        onclick={onExit}
        class="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors"
      >
        Exit
      </button>
    </div>

    <div class="overflow-y-auto flex-1 p-2 flex flex-col gap-1">
      {#each db.questions as q}
        {@const hasExplanation = !!draftExplanations[q.id]}
        <button
          onclick={() => (selectedId = q.id)}
          class="text-left px-3 py-2 rounded flex items-center justify-between text-sm transition-colors
            {selectedId === q.id
            ? 'bg-[#E9F2FF] text-[#0C66E4] font-bold'
            : 'hover:bg-slate-100'}"
        >
          <span>Question {q.id}</span>
          <div
            class="w-3 h-3 rounded-full {hasExplanation
              ? 'bg-green-500'
              : 'bg-red-500'}"
          ></div>
        </button>
      {/each}
    </div>

    <div class="p-4 border-t border-slate-200 bg-white">
      <button
        onclick={exportChanges}
        class="w-full py-3 bg-[#0C66E4] text-white font-bold rounded shadow-md hover:bg-[#0052CC] transition-colors"
      >
        Export Draft JSON
      </button>
    </div>
  </div>

  <!-- RIGHT PANE: Editor -->
  <div class="flex-1 p-8 flex flex-col h-full overflow-y-auto">
    {#if currentQuestion}
      <!-- Question Info & Preview -->
      <div
        class="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6 shrink-0"
      >
        <h3 class="text-xl font-bold text-[#172B4D] mb-4">
          Preview: Q{currentQuestion.id}
        </h3>

        {#if currentQuestion.kategorie}
          <div class="mb-3 flex items-center gap-2">
            <span
              class="text-[11px] font-bold text-slate-400 uppercase tracking-wider"
              >Categories:</span
            >
            <span
              class="text-[12px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200"
            >
              {currentQuestion.kategorie}
            </span>
          </div>
        {/if}

        <p class="text-lg text-slate-700 mb-6">{currentQuestion.question}</p>

        <div class="flex flex-wrap gap-2">
          {#each Object.entries(optionsToRender) as [k, v]}
            <span
              class="px-3 py-1 text-sm font-semibold rounded border
              {k === currentQuestion.correct
                ? 'bg-green-100 border-green-500 text-green-800'
                : 'bg-slate-100 border-slate-300'}"
            >
              {k}: {v}
            </span>
          {/each}
        </div>
      </div>

      <!-- Editor Textarea -->
      <div class="flex-1 flex flex-col min-h-[300px]">
        <label for="explanation" class="font-bold text-[#172B4D] mb-2 text-lg">
          Explanation Text:
        </label>
        <textarea
          id="explanation"
          bind:value={currentEditText}
          onblur={saveToDraft}
          placeholder="Write the explanation here. It will auto-save to draft when you click away..."
          class="flex-1 w-full p-4 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-[#0C66E4] focus:border-[#0C66E4] outline-none text-[16px] leading-relaxed shadow-inner"
        ></textarea>
        <p class="text-sm text-slate-500 mt-2">
          Basic HTML is stripped automatically for security. Content saves to
          draft automatically on blur.
        </p>
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center text-slate-400">
        Select a question from the left panel.
      </div>
    {/if}
  </div>
</div>
