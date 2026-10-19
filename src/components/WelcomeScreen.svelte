<script lang="ts">
  let {onSelectMode} = $props<{
    onSelectMode: (mode: 'test' | 'real') => void;
  }>();
</script>

<div class="w-full max-w-[70rem] mx-auto mt-4 md:mt-12">
  <!-- Responsive Large Header -->
  <h1
    class="text-[2.5rem] md:text-[4vw] max-text-[4.5rem] font-extrabold text-[#172B4D] tracking-tight leading-tight mb-10 md:mb-16"
  >
    Welcome to the exam.
  </h1>

  <!-- Card Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
    <!-- Test Mode Card -->
    <button
      onclick={() => onSelectMode('test')}
      class="group flex flex-col text-left p-6 md:p-8 rounded-2xl border border-slate-200 bg-white hover:border-[#0C66E4] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 outline-none focus:ring-2 focus:ring-[#0C66E4]"
    >
      <div
        class="w-12 h-12 bg-slate-100 group-hover:bg-[#E9F2FF] rounded-lg flex items-center justify-center mb-6 transition-colors"
      >
        <svg
          class="w-6 h-6 text-[#172B4D] group-hover:text-[#0C66E4]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          ></path></svg
        >
      </div>
      <h3
        class="text-[1.5rem] font-bold text-[#172B4D] group-hover:text-[#0C66E4] mb-3 transition-colors"
      >
        Test Mode
      </h3>
      <p class="text-[16px] text-slate-600 leading-relaxed">
        Practice freely. You can navigate back to previous questions, review
        your answers, and learn at your own pace.
      </p>
    </button>

    <!-- Real Mode Card -->
    <button
      onclick={() => onSelectMode('real')}
      class="group flex flex-col text-left p-6 md:p-8 rounded-2xl border border-slate-200 bg-white hover:border-[#0C66E4] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 outline-none focus:ring-2 focus:ring-[#0C66E4]"
    >
      <div
        class="w-12 h-12 bg-slate-100 group-hover:bg-[#E9F2FF] rounded-lg flex items-center justify-center mb-6 transition-colors"
      >
        <svg
          class="w-6 h-6 text-[#172B4D] group-hover:text-[#0C66E4]"
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
      </div>
      <h3
        class="text-[1.5rem] font-bold text-[#172B4D] group-hover:text-[#0C66E4] mb-3 transition-colors"
      >
        Real Mode
      </h3>
      <p class="text-[16px] text-slate-600 leading-relaxed">
        Simulate the actual state exam environment. Strict timers apply and you
        cannot go back to change answers.
      </p>
    </button>
  </div>
</div>
