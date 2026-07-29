import { FrameworkDocument, Section } from "../model";
import { defaultAnswerValue, isAnswerEmpty } from "../engine/AnswerUtils.ts";

/**
 * Stores the user's response for one Framework Section.
 *
 * `value`'s shape depends on the Section's Answer
 * Structure: a string for Free Text, a
 * Record<string, string> keyed by variant id for
 * Fixed Variant Text, or an array of row objects
 * for Table.
 */
export interface SectionResponse {
    sectionNumber: number;
    value: unknown;
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
 *
 * Deliberately does NOT include the full FrameworkDocument
 * (Questions/Answers/Help text, table columns, card
 * definitions, and so on) -- only `systemNumber`, which
 * identifies *which* System this session belongs to.
 * Persisting the whole parsed framework used to mean a
 * session saved before a content or structure change (e.g.
 * a Table's columns being edited) would keep replaying that
 * stale structure from localStorage forever, even after the
 * app itself was updated: every reload re-read the same
 * frozen snapshot instead of the current Framework source.
 * Restoring a session now always re-resolves the *current*
 * framework for `systemNumber` (see StorageService.
 * loadInterview) and replays only the user's own responses
 * and progress on top of it.
 */
export interface InterviewSessionState {
    systemNumber: number;
    responses: SectionResponse[];
    questionResponses: QuestionResponse[];
    currentSectionIndex: number;
    capability: string;
    interviewStarted: boolean;
}

export class InterviewSession {

    private readonly framework: FrameworkDocument;

    private readonly responses = new Map<number, unknown>();

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
            systemNumber: this.framework.metadata.systemNumber,
            responses: this.getResponses(),
            questionResponses: this.getQuestionResponses(),
            currentSectionIndex: this.currentSectionIndex,
            capability: this.capability,
            interviewStarted: this.interviewStarted
        };
    }

    /**
     * Restores a session from serialized state.
     *
     * `framework` is supplied by the caller (see
     * StorageService.loadInterview) as the CURRENT, freshly
     * resolved Framework for `state.systemNumber` -- never
     * read from the serialized state itself, so a saved
     * session always picks up whatever the Framework's
     * Questions/Answers/Help content and structure currently
     * are, rather than replaying a frozen structure from
     * whenever the session was first saved.
     */
    public static fromJSON(
        state: InterviewSessionState,
        framework: FrameworkDocument
    ): InterviewSession {
        const session = new InterviewSession(framework);

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

    public getCurrentResponse(): unknown {
        return this.getResponse(this.getCurrentSectionNumber());
    }

    public saveCurrentResponse(value: unknown): void {
        this.saveResponse(this.getCurrentSectionNumber(), value);
    }

    public saveResponse(sectionNumber: number, value: unknown): void {
        this.responses.set(sectionNumber, value);
    }

    /**
     * Returns the stored response for a Section, or a
     * structure-appropriate empty value when nothing has
     * been saved yet.
     */
    public getResponse(sectionNumber: number): unknown {

        if (this.responses.has(sectionNumber)) {
            return this.responses.get(sectionNumber);
        }

        const section = this.framework.sections.find(
            candidate => candidate.number === sectionNumber
        );

        return section ? defaultAnswerValue(section.answer) : "";

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

    /**
     * Returns to the Introduction view without
     * losing any saved progress.
     *
     * Unlike `resetInterview()`, this preserves
     * `currentSectionIndex` and every saved
     * response, so resuming picks up exactly
     * where the user left off.
     */
    public viewIntroduction(): void {
        this.interviewStarted = false;
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
            (section: Section) =>
                !isAnswerEmpty(section.answer, this.getResponse(section.number))
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
