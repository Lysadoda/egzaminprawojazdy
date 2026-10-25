// src/lib/store.svelte.ts
import type { Question, ExplanationsDB } from './types';

class DatabaseStore {
  questions = $state<Question[]>([]);
  explanations = $state<ExplanationsDB>({});

  // NEW: Mistakes Memory
  mistakes = $state<number[]>([]);

  isLoaded = $state(false);
  hasError = $state(false);

  async initialize() {
    const qFile = import.meta.env.VITE_QUESTIONS_FILE || 'mockup_exam.json';
    const eFile = import.meta.env.VITE_EXPLANATIONS_FILE || 'explanations.json';

    try {
      const [qRes, eRes] = await Promise.all([fetch(`/data/${qFile}`), fetch(`/data/${eFile}`)]);

      if (!qRes.ok || !eRes.ok) throw new Error('Failed to load JSON files');

      this.questions = await qRes.json();
      this.explanations = await eRes.json();

      // Load mistakes from sessionStorage (Survives F5)
      const savedMistakes = sessionStorage.getItem('exam_mistakes');
      if (savedMistakes) {
        this.mistakes = JSON.parse(savedMistakes);
      }

      this.isLoaded = true;
    } catch (error) {
      console.error('Database Initialization Error:', error);
      this.hasError = true;
    }
  }

  // Methods to manage mistakes
  addMistake(id: number) {
    if (!this.mistakes.includes(id)) {
      this.mistakes.push(id);
      sessionStorage.setItem('exam_mistakes', JSON.stringify(this.mistakes));
    }
  }

  // Remove a specific mistake
  removeMistake(id: number) {
    this.mistakes = this.mistakes.filter((mId) => mId !== id);
    if (this.mistakes.length > 0) {
      sessionStorage.setItem('exam_mistakes', JSON.stringify(this.mistakes));
    } else {
      sessionStorage.removeItem('exam_mistakes'); // Clean up if empty
    }
  }

  clearMistakes() {
    this.mistakes = [];
    sessionStorage.removeItem('exam_mistakes');
  }
}

export const db = new DatabaseStore();
