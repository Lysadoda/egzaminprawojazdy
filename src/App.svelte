<script lang="ts">
  import {onMount} from 'svelte';
  import {db} from './lib/store.svelte';

  import TopBar from './components/TopBar.svelte';
  import Sidebar from './components/Sidebar.svelte';
  import WelcomeScreen from './components/WelcomeScreen.svelte';
  import QuestionView from './components/QuestionView.svelte';
  import ResultsView from './components/ResultsView.svelte';
  import AdminEditor from './components/AdminEditor.svelte';

  // Svelte 5 State Runes
  let appMode = $state<'welcome' | 'test' | 'real' | 'results' | 'admin'>(
    'welcome',
  );
  let currentQuestionIndex = $state(0);
  let userAnswers = $state<Record<number, string | null>>({});

  // Svelte 5 Derived Runes (Auto-updates when db or index changes)
  let totalQuestions = $derived(db.questions.length);
  let currentQuestion = $derived(db.questions[currentQuestionIndex]);
  let isFirst = $derived(currentQuestionIndex === 0);
  let isLast = $derived(
    totalQuestions > 0 && currentQuestionIndex === totalQuestions - 1,
  );

  // Initialize DB when app mounts in the browser
  onMount(() => {
    db.initialize();
  });

  function handleModeSelection(mode: 'welcome' | 'test' | 'real' | 'admin') {
    appMode = mode;
    currentQuestionIndex = 0;
    userAnswers = {}; // Reset answers on new exam
  }

  function handleAnswer(ans: string) {
    userAnswers[currentQuestionIndex] = ans;
  }

  function handleNext() {
    if (!isLast) currentQuestionIndex++;
  }

  function handlePrev() {
    if (!isFirst) currentQuestionIndex--;
  }

  function handleFinish() {
    appMode = 'results';
  }

  function handleJump(num: number) {
    const target = num - 1;
    if (target >= 0 && target < totalQuestions) {
      currentQuestionIndex = target;
    }
  }

  // Svelte 5 effect for global window events (cleaner and safer than <svelte:window>)
  $effect(() => {
    const handleGlobalKeydown = (event: KeyboardEvent) => {
      // Ctrl + Shift + A to open Admin Mode
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        handleModeSelection('admin');
      }
    };

    window.addEventListener('keydown', handleGlobalKeydown);
    return () => window.removeEventListener('keydown', handleGlobalKeydown);
  });
</script>

<!-- DB Loading / Error States -->
{#if !db.isLoaded}
  <div class="flex h-screen w-screen items-center justify-center bg-white">
    <div class="text-2xl font-bold text-[#172B4D] animate-pulse">
      Loading Database...
    </div>
  </div>
{:else if db.hasError}
  <div
    class="flex h-screen w-screen items-center justify-center bg-white text-red-600 flex-col gap-4"
  >
    <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"
      ><path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      ></path></svg
    >
    <div class="text-xl font-bold">Failed to load database.</div>
    <div class="text-slate-500">
      Check .env configuration and ensure files exist in public/data/.
    </div>
  </div>
{:else}
  <!-- Main Application Shell -->
  <div
    class="flex flex-col h-screen w-screen bg-white font-sans text-[16px] text-slate-800 overflow-hidden min-w-[1400px]"
  >
    <TopBar />

    <div class="flex flex-1 overflow-hidden">
      <!-- Hide standard sidebar during Admin Mode -->
      {#if appMode !== 'admin'}
        <Sidebar
          currentMode={appMode === 'results' ? 'test' : appMode}
          onNavigate={handleModeSelection}
          onJump={handleJump}
          {totalQuestions}
        />
      {/if}

      <main
        class="flex-1 overflow-hidden {appMode === 'admin'
          ? ''
          : 'p-6 bg-slate-50 flex items-center justify-center'}"
      >
        {#if appMode === 'welcome'}
          <WelcomeScreen onSelectMode={handleModeSelection} />
        {:else if appMode === 'admin'}
          <!-- Admin Mode receives an exit callback -->
          <AdminEditor onExit={() => handleModeSelection('welcome')} />
        {:else if appMode === 'results'}
          <div
            class="flex flex-col w-full max-w-[1600px] h-full justify-center"
          >
            <ResultsView {userAnswers} />
          </div>
        {:else}
          <div
            class="flex flex-col w-full max-w-[1600px] h-full justify-center"
          >
            <!-- {#key} forces re-render and animations when question changes -->
            {#key currentQuestion.id}
              <QuestionView
                question={currentQuestion}
                mode={appMode}
                currentQuestionIndex={currentQuestionIndex + 1}
                {totalQuestions}
                onNext={handleNext}
                onPrev={handlePrev}
                onFinish={handleFinish}
                {isFirst}
                {isLast}
                currentAnswer={userAnswers[currentQuestionIndex] || null}
                onAnswer={handleAnswer}
              />
            {/key}
          </div>
        {/if}
      </main>
    </div>
  </div>
{/if}
