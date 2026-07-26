import {
    ValidationIssue,
    ValidationResult
} from "../model";

import { InterviewSession } from "../interview";

/**
 * Validates a completed Interview Session.
 *
 * This validator remains backward-compatible with the
 * current section-based session model, while also being
 * tolerant of future session implementations that may
 * expose section answers through alternative methods.
 */
export class InterviewValidator {

    /**
     * Validates every Framework Section response.
     */
    public validate(
        session: InterviewSession
    ): ValidationResult {

        const framework = session.getFramework();
        const issues: ValidationIssue[] = [];

        for (const section of framework.sections) {

            if (this.isSectionComplete(session, section.number)) {
                continue;
            }

            issues.push({
                sectionNumber: section.number,
                sectionTitle: section.title
            });

        }

        return {
            valid: issues.length === 0,
            issues
        };

    }

    /**
     * Determines whether a section has a completed answer.
     *
     * This method prefers the current section response API, but
     * falls back safely if a future session shape exposes a
     * different section-answer accessor.
     */
    private isSectionComplete(
        session: InterviewSession,
        sectionNumber: number
    ): boolean {

        const response = this.getSectionResponse(session, sectionNumber);

        return response.trim().length > 0;

    }

    /**
     * Reads a section response from the InterviewSession.
     *
     * The current implementation uses `getResponse(sectionNumber)`.
     * The fallback branches allow the validator to remain usable
     * while the interview runtime evolves.
     */
    private getSectionResponse(
        session: InterviewSession,
        sectionNumber: number
    ): string {

        const typedSession = session as InterviewSession & {
            getResponse?: (sectionNumber: number) => string;
            getSectionResponse?: (sectionNumber: number) => string;
            getAnswerForSection?: (sectionNumber: number) => string;
        };

        if (typeof typedSession.getResponse === "function") {
            return typedSession.getResponse(sectionNumber) ?? "";
        }

        if (typeof typedSession.getSectionResponse === "function") {
            return typedSession.getSectionResponse(sectionNumber) ?? "";
        }

        if (typeof typedSession.getAnswerForSection === "function") {
            return typedSession.getAnswerForSection(sectionNumber) ?? "";
        }

        return "";

    }

}
