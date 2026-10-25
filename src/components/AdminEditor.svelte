<script lang="ts">
  import {db} from '../lib/store.svelte';
  import type {Question} from '../lib/types';
  import {renderSafeMarkdown} from '../lib/markdown';

  // Svelte 5 Props
  let {onExit} = $props<{onExit: () => void}>();

  let draftExplanations = $state<Record<string, string>>({...db.explanations});
  let selectedId = $state<number>(db.questions[0]?.id || 1);
  let currentQuestion = $derived(
    db.questions.find((q: Question) => q.id === selectedId),
  );

  let currentEditText = $state<string>(
    draftExplanations[String(selectedId)] || '',
  );

  // Live preview derived state
  let previewHtml = $derived(renderSafeMarkdown(currentEditText));

  $effect(() => {
    let _ = selectedId;
    currentEditText = draftExplanations[String(selectedId)] || '';
  });

  // Derived options to prevent crashing on YN questions (which lack the options object)
  let optionsToRender = $derived(
    currentQuestion?.type === 'YN'
      ? {T: 'Tak', N: 'Nie'}
      : currentQuestion?.options || {},
  );

  function saveToDraft() {
    if (!currentQuestion) return;

    // The security (DOMPurify) happens ONLY when rendering to the screen.
    const rawText = currentEditText.trim();
    const idStr = String(currentQuestion.id);

    if (rawText) {
      draftExplanations[idStr] = rawText;
    } else {
      delete draftExplanations[idStr];
    }
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

      <!-- Editor & Markdown Preview Layout -->
      <div class="flex gap-6 min-h-[400px]">
        <!-- Editor Input -->
        <div class="flex-1 flex flex-col">
          <label
            for="explanation"
            class="font-bold text-[#172B4D] mb-2 text-lg"
          >
            Write Explanation (Markdown Supported):
          </label>
          <textarea
            id="explanation"
            bind:value={currentEditText}
            onblur={saveToDraft}
            placeholder="Use Markdown:&#10;### Header&#10;* **Bold List Item**"
            class="flex-1 w-full p-4 font-mono text-sm border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-[#0C66E4] outline-none shadow-inner bg-slate-50"
          ></textarea>
        </div>

        <!-- Live Preview -->
        <div class="flex-1 flex flex-col">
          <label class="font-bold text-[#172B4D] mb-2 text-lg">
            Live Preview:
          </label>
          <div
            class="flex-1 w-full p-6 border border-slate-200 rounded-lg bg-white overflow-y-auto shadow-sm"
          >
            {#if previewHtml}
              <!-- Render the safe HTML using Tailwind Typography -->
              <div class="prose prose-sm max-w-none text-slate-800">
                {@html previewHtml}
              </div>
            {:else}
              <div
                class="h-full flex items-center justify-center text-slate-400 italic"
              >
                Preview will appear here...
              </div>
            {/if}
          </div>
        </div>
      </div>
    {:else}
      <div class="flex-1 flex items-center justify-center text-slate-400">
        Select a question from the left panel.
      </div>
    {/if}
  </div>
</div>
