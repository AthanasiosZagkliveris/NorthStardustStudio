import { FrameworkDocument, Section } from "../model";

/**
 * Stores one answer for one interview question.
 */
export interface QuestionResponse {
    questionId: string;
    value: string;
}

/**
 * Stores the interview state for one Framework Section.
 */
export interface SectionInterviewState {
    sectionNumber: number;
    sectionTitle: string;
    questionResponses: QuestionResponse[];
    generatedAnswer?: string;
    completed: boolean;
}

/**
 * Serializable InterviewSession state.
 */
export interface InterviewSessionState {
    framework: FrameworkDocument;
    sections: SectionInterviewState[];
    currentSectionIndex: number;
    capability: string;
    interviewStarted: boolean;
}

export class InterviewSession {

    private readonly framework: FrameworkDocument;

    private readonly sections = new Map<number, SectionInterviewState>();

    private currentSectionIndex = 0;

    private capability = "";

    private interviewStarted = false;

    constructor(framework: FrameworkDocument) {
        this.framework = framework;

        for (const section of framework.sections) {
            this.sections.set(section.number, {
                sectionNumber: section.number,
                sectionTitle: section.title,
                questionResponses: [],
                generatedAnswer: "",
                completed: false
            });
        }
    }

    public toJSON(): InterviewSessionState {
        return {
            framework: this.framework,
            sections: [...this.sections.values()],
            currentSectionIndex: this.currentSectionIndex,
            capability: this.capability,
            interviewStarted: this.interviewStarted
        };
    }

    public static fromJSON(state: InterviewSessionState): InterviewSession {
        const session = new InterviewSession(state.framework);

        session.currentSectionIndex = state.currentSectionIndex ?? 0;
        session.capability = state.capability ?? "";
        session.interviewStarted = state.interviewStarted ?? false;

        session.sections.clear();

        for (const section of state.sections ?? []) {
            session.sections.set(section.sectionNumber, section);
        }

        return session;
    }

    public startInterview(): void {
        this.interviewStarted = true;
    }

    public hasInterviewStarted(): boolean {
        return this.interviewStarted;
    }

    public getFramework(): FrameworkDocument {
        return this.framework;
    }

    public getSections(): readonly Section[] {
        return this.framework.sections;
    }

    public getCurrentSection(): Section {
        return this.framework.sections[this.currentSectionIndex];
    }

    public getCurrentSectionState(): SectionInterviewState {
        return this.sections.get(this.getCurrentSection().number)!;
    }

    public saveQuestionResponse(questionId: string, value: string): void {
        const state = this.getCurrentSectionState();
        const existing = state.questionResponses.find(q => q.questionId === questionId);

        if (existing) {
            existing.value = value;
        } else {
            state.questionResponses.push({ questionId, value });
        }
    }

    public getQuestionResponse(questionId: string): string {
        return (
            this.getCurrentSectionState()
                .questionResponses
                .find(q => q.questionId === questionId)
                ?.value ?? ""
        );
    }

    public setGeneratedAnswer(answer: string): void {
        this.getCurrentSectionState().generatedAnswer = answer;
    }

    public getGeneratedAnswer(): string {
        return this.getCurrentSectionState().generatedAnswer ?? "";
    }

    public markCurrentSectionCompleted(): void {
        this.getCurrentSectionState().completed = true;
    }

    public getCurrentSectionIndex(): number {
        return this.currentSectionIndex;
    }

    public getTotalSections(): number {
        return this.framework.sections.length;
    }

    public nextSection(): boolean {
        if (this.currentSectionIndex >= this.getTotalSections() - 1) return false;
        this.currentSectionIndex++;
        return true;
    }

    public previousSection(): boolean {
        if (this.currentSectionIndex <= 0) return false;
        this.currentSectionIndex--;
        return true;
    }

    public getProgress(): number {
        const completed =
            [...this.sections.values()].filter(s => s.completed).length;

        return this.getTotalSections() === 0
            ? 0
            : completed / this.getTotalSections();
    }

    public setCapability(capability: string): void {
        this.capability = capability;
    }

    public getCapability(): string {
        return this.capability;
    }
}
