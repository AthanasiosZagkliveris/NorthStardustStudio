import { FrameworkDocument, Section } from "../model";

/**
 * Stores the user's response for one Framework Section.
 */
export interface SectionResponse {

    /**
     * Section number.
     */
    sectionNumber: number;

    /**
     * User response.
     */
    value: string;

}

/**
 * Controls an Interview Session.
 *
 * A session is created from one immutable
 * FrameworkDocument and stores all user
 * responses independently.
 */
export class InterviewSession {

    /**
     * Immutable Framework.
     */
    private readonly framework: FrameworkDocument;

    /**
     * User responses.
     */
    private readonly responses =
        new Map<number, string>();

    /**
     * Current Section index.
     */
    private currentSectionIndex = 0;

    /**
     * Selected Capability.
     */
    private capability = "";

    constructor(
        framework: FrameworkDocument
    ) {

        this.framework = framework;

    }

    /**
     * Returns the Framework.
     */
    public getFramework(): FrameworkDocument {

        return this.framework;

    }

    /**
     * Returns every Framework Section.
     */
    public getSections(): readonly Section[] {

        return this.framework.sections;

    }

    /**
     * Returns the current Section.
     */
    public getCurrentSection(): Section {

        return this.framework.sections[
            this.currentSectionIndex
        ];

    }

    /**
     * Returns the current Section index.
     */
    public getCurrentSectionIndex(): number {

        return this.currentSectionIndex;

    }

    /**
     * Returns the current Section number.
     */
    public getCurrentSectionNumber(): number {

        return this.getCurrentSection().number;

    }

    /**
     * Returns the total number of Sections.
     */
    public getTotalSections(): number {

        return this.framework.sections.length;

    }

    /**
     * Returns the current response.
     */
    public getCurrentResponse(): string {

        return this.getResponse(
            this.getCurrentSectionNumber()
        );

    }

    /**
     * Saves the current response.
     */
    public saveCurrentResponse(
        value: string
    ): void {

        this.saveResponse(

            this.getCurrentSectionNumber(),

            value

        );

    }

    /**
     * Saves a response.
     */
    public saveResponse(

        sectionNumber: number,

        value: string

    ): void {

        this.responses.set(

            sectionNumber,

            value

        );

    }

    /**
     * Returns a response.
     */
    public getResponse(
        sectionNumber: number
    ): string {

        return (

            this.responses.get(
                sectionNumber
            ) ?? ""

        );

    }

    /**
     * Returns every response.
     */
    public getResponses(): SectionResponse[] {

        return this.framework.sections.map(

            section => ({

                sectionNumber:
                    section.number,

                value:
                    this.getResponse(
                        section.number
                    )

            })

        );

    }

    /**
     * Moves to the next Section.
     *
     * Returns true when successful.
     */
    public nextSection(): boolean {

        if (this.isLastSection()) {

            return false;

        }

        this.currentSectionIndex++;

        return true;

    }

    /**
     * Moves to the previous Section.
     *
     * Returns true when successful.
     */
    public previousSection(): boolean {

        if (this.isFirstSection()) {

            return false;

        }

        this.currentSectionIndex--;

        return true;

    }

    /**
     * Jumps to a specific Section.
     *
     * Returns true when successful.
     */
    public goToSection(
        index: number
    ): boolean {

        if (

            index < 0 ||

            index >= this.getTotalSections()

        ) {

            return false;

        }

        this.currentSectionIndex = index;

        return true;

    }

    /**
     * Returns true if the current
     * Section is the first.
     */
    public isFirstSection(): boolean {

        return this.currentSectionIndex === 0;

    }

    /**
     * Returns true if the current
     * Section is the last.
     */
    public isLastSection(): boolean {

        return (

            this.currentSectionIndex ===

            this.getTotalSections() - 1

        );

    }

    /**
     * Returns interview progress
     * as a value between 0 and 1.
     */
    public getProgress(): number {

        const total =
            this.getTotalSections();

        if (total === 0) {

            return 0;

        }

        return (

            this.currentSectionIndex + 1

        ) / total;

    }

    /**
     * Returns true when every
     * Section contains a response.
     */
    public isComplete(): boolean {

        return this.framework.sections.every(

            section =>

                this.getResponse(
                    section.number
                )

                    .trim()

                    .length > 0

        );

    }

    /**
     * Sets the selected Capability.
     */
    public setCapability(
        capability: string
    ): void {

        this.capability = capability;

    }

    /**
     * Returns the selected Capability.
     */
    public getCapability(): string {

        return this.capability;

    }

}