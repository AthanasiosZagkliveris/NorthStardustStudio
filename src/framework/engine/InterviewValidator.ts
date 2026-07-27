import {
    Section,
    ValidationIssue,
    ValidationResult
} from "../model";

import { InterviewSession } from "../interview";
import { isAnswerEmpty } from "./AnswerUtils.ts";

/**
 * Validates a completed Interview Session.
 *
 * Completeness is determined per-Section, in a way
 * that is aware of that Section's Answer Structure
 * (Free Text, Fixed Variant Text, or Table).
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

            if (this.isSectionComplete(session, section)) {
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
     */
    private isSectionComplete(
        session: InterviewSession,
        section: Section
    ): boolean {

        const response = session.getResponse(section.number);

        return !isAnswerEmpty(section.answer, response);

    }

}
