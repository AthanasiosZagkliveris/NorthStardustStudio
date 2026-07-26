import { FrameworkDocument, Section } from "../model";

/**
 * Stores the user's response for one Framework Section.
 */
export interface SectionResponse {
    sectionNumber: number;
    value: string;
}

/**
 * Stores the user's response for one Framework Question.
 *
 * This keeps the session compatible with the current section-based
 * workflow while allowing the interview to grow into a question-driven
 * flow later.
 */
export interface QuestionResponse {
    questionId: string;
    value: string;
}

/**
 * Serializable InterviewSession state.
 */
export interface InterviewSessionState {
    framework: FrameworkDocument;
    responses: SectionResponse[];
    questionResponses: QuestionResponse[];
    currentSectionIndex: number;
    capability: string;
    interviewStarted: boolean;
}

export class InterviewSession {

    private readonly framework: FrameworkDocument;

    private readonly responses = new Map<number, string>();

    private readonly questionResponses = new Map<string, string>();

    private currentSectionIndex = 0;

    private capability = "";

    private interviewStarted = false;

    constructor(framework: FrameworkDocument) {
        this.framework = framework;
    }

    /**
     * Serializes the session while preserving Map contents.
     */
    public toJSON(): InterviewSessionState {
        return {
            framework: this.framework,
            responses: this.getResponses(),
            questionResponses: this.getQuestionResponses(),
            currentSectionIndex: this.currentSectionIndex,
            capability: this.capability,
            interviewStarted: this.interviewStarted
        };
    }

    /**
     * Restores a session from serialized state.
     */
    public static fromJSON(state: InterviewSessionState): InterviewSession {
        const session = new InterviewSession(state.framework);

        session.currentSectionIndex = state.currentSectionIndex ?? 0;
        session.capability = state.capability ?? "";
        session.interviewStarted = state.interviewStarted ?? false;

        for (const response of state.responses ?? []) {
            session.responses.set(response.sectionNumber, response.value);
        }

        for (const response of state.questionResponses ?? []) {
            session.questionResponses.set(response.questionId, response.value);
        }

        return session;
    }

    public getFramework(): FrameworkDocument {
        return this.framework;
    }

    public getSections(): readonly Section[] {
        return this.framework.sections;
    }

    public getCurrentSection(): Section {
        const section = this.framework.sections[this.currentSectionIndex];

        if (!section) {
            throw new Error("Current section is unavailable.");
        }

        return section;
    }

    public getCurrentSectionIndex(): number {
        return this.currentSectionIndex;
    }

    public getCurrentSectionNumber(): number {
        return this.getCurrentSection().number;
    }

    public getTotalSections(): number {
        return this.framework.sections.length;
    }

    public getCurrentResponse(): string {
        return this.getResponse(this.getCurrentSectionNumber());
    }

    public saveCurrentResponse(value: string): void {
        this.saveResponse(this.getCurrentSectionNumber(), value);
    }

    public saveResponse(sectionNumber: number, value: string): void {
        this.responses.set(sectionNumber, value);
    }

    public getResponse(sectionNumber: number): string {
        return this.responses.get(sectionNumber) ?? "";
    }

    public getResponses(): SectionResponse[] {
        return this.framework.sections.map(section => ({
            sectionNumber: section.number,
            value: this.getResponse(section.number)
        }));
    }

    public saveQuestionResponse(questionId: string, value: string): void {
        this.questionResponses.set(questionId, value);
    }

    public getQuestionResponse(questionId: string): string {
        return this.questionResponses.get(questionId) ?? "";
    }

    public getQuestionResponses(): QuestionResponse[] {
        return Array.from(this.questionResponses.entries()).map(
            ([questionId, value]) => ({
                questionId,
                value
            })
        );
    }

    public startInterview(): void {
        this.interviewStarted = true;
    }

    public hasStartedInterview(): boolean {
        return this.interviewStarted;
    }

    public resetInterview(): void {
        this.interviewStarted = false;
        this.currentSectionIndex = 0;
        this.responses.clear();
        this.questionResponses.clear();
    }

    public nextSection(): boolean {
        if (!this.interviewStarted) {
            this.interviewStarted = true;
        }

        if (this.isLastSection()) {
            return false;
        }

        this.currentSectionIndex++;
        return true;
    }

    public previousSection(): boolean {
        if (this.isFirstSection()) {
            return false;
        }

        this.currentSectionIndex--;
        return true;
    }

    public goToSection(index: number): boolean {
        if (index < 0 || index >= this.getTotalSections()) {
            return false;
        }

        this.currentSectionIndex = index;
        return true;
    }

    public isFirstSection(): boolean {
        return this.currentSectionIndex === 0;
    }

    public isLastSection(): boolean {
        return this.currentSectionIndex === this.getTotalSections() - 1;
    }

    public getProgress(): number {
        const total = this.getTotalSections();

        if (!this.interviewStarted || total === 0) {
            return 0;
        }

        return (this.currentSectionIndex + 1) / total;
    }

    public isComplete(): boolean {
        const sectionsComplete = this.framework.sections.every(
            section => this.getResponse(section.number).trim().length > 0
        );

        if (this.questionResponses.size === 0) {
            return sectionsComplete;
        }

        const questionsComplete = Array.from(this.questionResponses.values())
            .every(value => value.trim().length > 0);

        return sectionsComplete && questionsComplete;
    }

    public setCapability(capability: string): void {
        this.capability = capability;
    }

    public getCapability(): string {
        return this.capability;
    }
}
