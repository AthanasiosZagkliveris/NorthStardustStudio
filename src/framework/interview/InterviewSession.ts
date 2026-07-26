import { FrameworkDocument, Section } from "../model";

/**
 * Stores the user's response for one Framework Section.
 */
export interface SectionResponse {
    sectionNumber: number;
    value: string;
}

/**
 * Serializable InterviewSession state.
 */
export interface InterviewSessionState {
    framework: FrameworkDocument;
    responses: SectionResponse[];
    currentSectionIndex: number;
    capability: string;
}

export class InterviewSession {

    private readonly framework: FrameworkDocument;

    private readonly responses =
        new Map<number, string>();

    private currentSectionIndex = 0;

    private capability = "";

    constructor(
        framework: FrameworkDocument
    ) {
        this.framework = framework;
    }

    /**
     * Serializes the session while preserving Map contents.
     */
    public toJSON(): InterviewSessionState {

        return {
            framework: this.framework,
            responses: this.getResponses(),
            currentSectionIndex: this.currentSectionIndex,
            capability: this.capability
        };

    }

    /**
     * Restores a session from serialized state.
     */
    public static fromJSON(
        state: InterviewSessionState
    ): InterviewSession {

        const session =
            new InterviewSession(state.framework);

        session.currentSectionIndex =
            state.currentSectionIndex ?? 0;

        session.capability =
            state.capability ?? "";

        for (const response of state.responses ?? []) {
            session.responses.set(
                response.sectionNumber,
                response.value
            );
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
        return this.framework.sections[this.currentSectionIndex];
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

    public nextSection(): boolean {
        if (this.isLastSection()) return false;

        this.currentSectionIndex++;
        return true;
    }

    public previousSection(): boolean {
        if (this.isFirstSection()) return false;
        this.currentSectionIndex--;
        return true;
    }

    public goToSection(index: number): boolean {
        if (index < 0 || index >= this.getTotalSections()) return false;
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
        return total === 0 ? 0 : (this.currentSectionIndex + 1) / total;
    }

    public isComplete(): boolean {
        return this.framework.sections.every(
            section => this.getResponse(section.number).trim().length > 0
        );
    }

    public setCapability(capability: string): void {
        this.capability = capability;
    }

    public getCapability(): string {
        return this.capability;
    }
}
