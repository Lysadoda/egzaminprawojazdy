<script lang="ts">
  import {untrack} from 'svelte';
  import {db} from '../lib/store.svelte'; // Needed to fetch the explanations
  import type {Question} from '../lib/types';

  let {
    question,
    mode,
    currentQuestionIndex,
    totalQuestions,
    onNext,
    onPrev,
    onFinish,
    isFirst,
    isLast,
    currentAnswer,
    onAnswer,
  } = $props<{
    question: Question;
    mode: 'test' | 'real';
    currentQuestionIndex: number;
    totalQuestions: number;
    onNext: () => void;
    onPrev: () => void;
    onFinish: () => void;
    isFirst: boolean;
    isLast: boolean;
    currentAnswer: string | null;
    onAnswer: (ans: string) => void;
  }>();

  let isVideo = $derived(
    question.media ? question.media.toLowerCase().endsWith('.mp4') : false,
  );

  let optionsToRender = $derived(
    question.type === 'YN' ? {Y: 'Yes', N: 'No'} : question.options || {},
  );

  let phase = $state<'combined' | 'read' | 'answer'>('combined');
  let timeLeft = $state<number>(0);

  let timerInterval: ReturnType<typeof setInterval> | undefined;
  let videoTimeout: ReturnType<typeof setTimeout> | undefined;

  // Bind the video element so we can control it via JS
  let videoEl = $state<HTMLVideoElement>();

  $effect(() => {
    let qId = question.id;

    untrack(() => {
      if (currentAnswer && question.type === 'YN') {
        phase = 'answer';
        timeLeft = 0;
        return;
      }

      if (question.type === 'YN') {
        phase = 'read';
        timeLeft = 20;

        // Wait 1 second before playing the video
        clearTimeout(videoTimeout);
        videoTimeout = setTimeout(() => {
          if (videoEl) {
            videoEl
              .play()
              .catch(err => console.error('Video autoplay blocked:', err));
          }
        }, 1000);
      } else {
        phase = 'combined';
        timeLeft = 50;
      }

      clearInterval(timerInterval);

      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
        } else {
          if (phase === 'read') {
            phase = 'answer';
            timeLeft = 15;
          } else {
            clearInterval(timerInterval);
            if (mode === 'real') {
              if (!isLast) onNext();
              else onFinish();
            }
          }
        }
      }, 1000);
    });

    return () => {
      clearInterval(timerInterval);
      clearTimeout(videoTimeout);
    };
  });

  let formattedTime = $derived(`00:${timeLeft.toString().padStart(2, '0')}`);
  let isTimeCritical = $derived(
    timeLeft <= 5 && phase !== 'read' && timeLeft > 0,
  );
  let answersLocked = $derived(phase === 'read');
</script>

<div
  class="flex flex-row gap-8 items-stretch w-full animate-in fade-in duration-300"
>
  <!-- LEFT COLUMN: Wrapper for Media + Explanation -->
  <div class="flex flex-col gap-4 w-[1024px] shrink-0">
    <!-- Media Container (Strictly 1024x576) -->
    <div
      class="w-[1024px] min-h-[576px] shrink-0 bg-black rounded-lg shadow-md overflow-hidden flex items-center justify-center border border-slate-300 relative"
    >
      {#if question.media}
        {#if isVideo}
          <!-- svelte-ignore a11y_media_has_caption -->
          <video
            bind:this={videoEl}
            class="w-[1024px] min-h-[576px] h-auto object-contain"
            src="/media/{question.media}"
            controls
            muted
          ></video>
        {:else}
          <img
            class="w-[1024px] min-h-[576px] h-auto object-contain"
            src="/media/{question.media}"
            alt="Question media"
          />
        {/if}
      {:else}
        <div class="text-slate-600 flex flex-col items-center">
          <svg
            class="w-16 h-16 mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path></svg
          >
          <p class="text-xl font-medium opacity-50">No media</p>
        </div>
      {/if}

      {#if answersLocked}
        <div
          class="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-md font-medium tracking-wide border border-white/20 shadow-lg"
        >
          Watching Media...
        </div>
      {/if}
    </div>

    {#if mode === 'test' && db.explanations}
      <div
        class="bg-blue-50 border border-blue-200 rounded-lg p-5 shadow-sm animate-in fade-in slide-in-from-top-2"
      >
        <div class="flex items-center gap-2 mb-2 font-bold text-blue-800">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path></svg
          >
          Explanation
        </div>
        <p class="text-[15px] text-blue-950 leading-relaxed">
          {db.explanations[String(question.id)] ||
            'No explanation available for this question.'}
        </p>
      </div>
    {/if}
  </div>

  <!-- RIGHT COLUMN: Dynamic Info, Question, Answers, Navigation -->
  <div class="flex-1 min-h-[576px] flex flex-col min-w-[400px]">
    <!-- Top Header -->
    <div class="flex justify-between items-start mb-6 shrink-0">
      <div>
        <div class="flex flex-wrap gap-2 mb-2">
          <span
            class="inline-block px-3 py-1 bg-[#E9F2FF] text-[#0C66E4] font-bold rounded-md text-sm uppercase tracking-wide"
          >
            {mode === 'test' ? 'Test Mode' : 'Real Exam'}
          </span>
          {#if question.cats}
            <span
              class="inline-block px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-md text-sm uppercase tracking-wide border border-slate-200"
            >
              {question.cats}
            </span>
          {/if}
        </div>

        <div class="text-slate-500 font-medium text-lg">
          Question {currentQuestionIndex} of {totalQuestions} (#{question.id})
        </div>
      </div>

      <!-- Smart Timer Display -->
      <div class="flex flex-col items-end">
        <div
          class="text-3xl font-mono font-bold border-2 px-4 py-2 rounded-lg shadow-sm flex items-center gap-3 transition-colors duration-300
                    {isTimeCritical
            ? 'text-red-600 border-red-300 bg-red-50'
            : 'text-[#172B4D] bg-white border-slate-200'}"
        >
          <svg
            class="w-6 h-6 {isTimeCritical ? 'text-red-500' : 'text-slate-400'}"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path></svg
          >
          {formattedTime}
        </div>

        {#if question.type === 'YN'}
          <div
            class="text-sm mt-1.5 font-bold uppercase tracking-wider
                      {phase === 'read' ? 'text-blue-600' : 'text-orange-600'}"
          >
            {phase === 'read' ? 'Reading Time' : 'Answer Now!'}
          </div>
        {/if}
      </div>
    </div>

    <!-- Question Text -->
    <h2
      class="text-[1.5rem] font-bold text-[#172B4D] mb-6 leading-snug shrink-0"
    >
      {question.question}
    </h2>

    <!-- Answers Grid -->
    <div class="flex flex-col gap-3 overflow-y-auto pr-2 pb-4">
      {#each Object.entries(optionsToRender) as [key, value]}
        <button
          onclick={() => onAnswer(key)}
          class="text-left flex items-center p-4 rounded-lg border-2 transition-all duration-150 outline-none
            {currentAnswer === key
            ? 'border-[#0C66E4] bg-[#E9F2FF] text-[#0C66E4] shadow-sm'
            : answersLocked
              ? 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 opacity-80'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm'}"
        >
          <span
            class="w-10 h-10 rounded bg-white border-2 border-current flex items-center justify-center font-bold text-lg mr-4 shrink-0"
          >
            {key}
          </span>
          <span class="text-[1.125rem] font-medium leading-tight">{value}</span>
        </button>
      {/each}
    </div>

    <div class="flex-1"></div>

    <!-- Bottom Navigation Footer -->
    <div
      class="flex items-center pt-4 shrink-0 {mode === 'real'
        ? 'justify-end'
        : 'justify-between'}"
    >
      {#if mode === 'test'}
        <button
          onclick={onPrev}
          disabled={isFirst}
          class="px-6 py-4 rounded-lg font-bold text-[1.125rem] transition-colors flex items-center gap-2
                 {isFirst
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
            : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            ></path></svg
          >
          Previous
        </button>
      {/if}

      {#if isLast}
        <button
          onclick={onFinish}
          class="px-8 py-4 rounded-lg font-bold text-[1.125rem] transition-colors flex items-center gap-2 shadow-md bg-green-600 text-white hover:bg-green-700"
        >
          Finish Exam
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path></svg
          >
        </button>
      {:else}
        <button
          onclick={onNext}
          class="px-8 py-4 rounded-lg font-bold text-[1.125rem] transition-colors flex items-center gap-2 shadow-md bg-[#0C66E4] text-white hover:bg-[#0052CC]"
        >
          Next
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            ><path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            ></path></svg
          >
        </button>
      {/if}
    </div>
  </div>
</div>
