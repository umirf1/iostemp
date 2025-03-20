export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  deckId: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  count: number;
  isDefault: boolean;
  enableForQuiz: boolean; // Whether this deck is used in the delay screen quiz
}

export interface FlashcardStats {
  totalAnswered: number;
  correct: number;
  incorrect: number;
  lastAnswered: Date | null;
} 