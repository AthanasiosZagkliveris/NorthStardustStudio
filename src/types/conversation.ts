export interface ConversationState {
    interviewTitle: string;
    currentQuestion: number;
    totalQuestions: number;
    completed: boolean;
    questions: ConversationQuestion[];
}

export interface ConversationQuestion {
    id: string;
    section: string;
    question: string;
    answer: string;
}