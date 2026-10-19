<script lang="ts">
  import examData from '../data/mockup_exam.json';

  let {userAnswers} = $props<{userAnswers: Record<number, string | null>}>();

  let selectedPreviewIndex = $state<number | null>(null);

  // Score Calculation
  let totalPoints = $derived(examData.reduce((sum, q) => sum + q.points, 0));
  let earnedPoints = $derived(
    examData.reduce((sum, q, index) => {
      return sum + (userAnswers[index] === q.correct ? q.points : 0);
    }, 0),
  );
  let percentage = $derived(Math.round((earnedPoints / totalPoints) * 100));

  // Organize questions by status
  let resultsList = $derived(
    examData.map((q, index) => {
      const isAnswered = !!userAnswers[index];
      const isCorrect = userAnswers[index] === q.correct;
      return {index, q, isAnswered, isCorrect};
    }),
  );

  let previewQ = $derived(
    selectedPreviewIndex !== null ? resultsList[selectedPreviewIndex] : null,
  );
</script>

<div
  class="flex flex-row gap-8 items-stretch w-full animate-in fade-in duration-300"
>
  <!-- LEFT COLUMN (Replaces 1024px Media Area): Results Dashboard -->
  <div
    class="w-[1024px] min-h-[576px] shrink-0 bg-white rounded-lg shadow-sm border border-slate-200 p-10 flex flex-col"
  >
    <div
      class="flex items-center justify-between border-b border-slate-200 pb-8 mb-8"
    >
      <div>
        <h1 class="text-4xl font-extrabold text-[#172B4D] mb-2">
          Test Results
        </h1>
        <p class="text-lg text-slate-500">
          Select a question number to review your answer.
        </p>
      </div>
      <div class="text-right">
        <div
          class="text-5xl font-black {percentage >= 90
            ? 'text-green-600'
            : 'text-[#0C66E4]'}"
        >
          {percentage}%
        </div>
        <div class="text-xl font-bold text-slate-600 mt-1">
          {earnedPoints} / {totalPoints} Points
        </div>
      </div>
    </div>

    <!-- Question Numbers Grid -->
    <div class="grid grid-cols-10 gap-3">
      {#each resultsList as res}
        <button
          onclick={() => (selectedPreviewIndex = res.index)}
          class="aspect-square flex items-center justify-center rounded-lg text-lg font-bold border-2 transition-all outline-none
            {selectedPreviewIndex === res.index ? 'ring-4 ring-[#E9F2FF] ' : ''}
            {!res.isAnswered
            ? 'bg-slate-100 border-slate-300 text-slate-500'
            : res.isCorrect
              ? 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100'
              : 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100'}"
        >
          {res.index + 1}
        </button>
      {/each}
    </div>

    <div class="mt-auto pt-8 flex gap-6 text-sm font-semibold text-slate-500">
      <div class="flex items-center gap-2">
        <div
          class="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"
        ></div>
         Correct
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-red-50 border-2 border-red-500 rounded"></div>
         Wrong
      </div>
      <div class="flex items-center gap-2">
        <div
          class="w-4 h-4 bg-slate-100 border-2 border-slate-300 rounded"
        ></div>
         No Answer
      </div>
    </div>
  </div>

  <!-- RIGHT COLUMN: Quick Question Preview -->
  <div
    class="flex-1 min-h-[576px] flex flex-col min-w-[400px] bg-slate-50 border border-slate-200 rounded-lg p-8 overflow-y-auto"
  >
    {#if previewQ}
      <div class="mb-4 flex justify-between items-start">
        <span
          class="bg-[#172B4D] text-white px-3 py-1 rounded text-sm font-bold tracking-wide"
          >Question {previewQ.index + 1}</span
        >
        <span class="font-bold text-slate-500">{previewQ.q.points} Points</span>
      </div>

      <h3 class="text-xl font-bold text-[#172B4D] mb-6">
        {previewQ.q.question}
      </h3>

      <!-- Shrunk Media for Preview Only -->
      {#if previewQ.q.media}
        <div
          class="w-full bg-black rounded overflow-hidden mb-6 flex justify-center max-h-[200px]"
        >
          {#if previewQ.q.media.endsWith('.mp4')}
            <video
              class="h-[200px] w-auto object-contain"
              src="/media/{previewQ.q.media}"
              controls
            ></video>
          {:else}
            <img
              class="h-[200px] w-auto object-contain"
              src="/media/{previewQ.q.media}"
              alt="Media"
            />
          {/if}
        </div>
      {/if}

      <div class="flex flex-col gap-3">
        {#each Object.entries(previewQ.q.options) as [key, value]}
          {@const isThisCorrect = key === previewQ.q.correct}
          {@const isThisUserSelected = key === userAnswers[previewQ.index]}

          <div
            class="flex items-center p-4 rounded-lg border-2
            {isThisCorrect
              ? 'border-green-500 bg-green-50 text-green-900'
              : isThisUserSelected
                ? 'border-red-500 bg-red-50 text-red-900'
                : 'border-slate-200 bg-white text-slate-400'}"
          >
            <span
              class="w-8 h-8 rounded bg-white border-2 border-current flex items-center justify-center font-bold mr-4 shrink-0"
              >{key}</span
            >
            <span class="font-medium flex-1">{value}</span>

            {#if isThisCorrect}
              <svg
                class="w-6 h-6 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M5 13l4 4L19 7"
                ></path></svg
              >
            {:else if isThisUserSelected}
              <svg
                class="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M6 18L18 6M6 6l12 12"
                ></path></svg
              >
            {/if}
          </div>
        {/each}
      </div>
    {:else}
      <div
        class="h-full flex flex-col items-center justify-center text-slate-400"
      >
        <svg
          class="w-16 h-16 mb-4 opacity-50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          ></path></svg
        >
        <p class="text-lg font-medium">Select a question to see details</p>
      </div>
    {/if}
  </div>
</div>
