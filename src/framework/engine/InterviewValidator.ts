import {

    ValidationIssue,

    ValidationResult

} from "../model";

import { InterviewSession } from "../interview";

/**
 * Validates a completed
 * Interview Session.
 */
export class InterviewValidator {

    /**
     * Validates every Framework
     * Section response.
     */
    public validate(
        session: InterviewSession
    ): ValidationResult {

        const framework =
            session.getFramework();

        const issues: ValidationIssue[] = [];

        for (const section of framework.sections) {

            const response =
                session.getResponse(
                    section.number
                );

            if (
                response.trim().length === 0
            ) {

                issues.push({

                    sectionNumber:
                        section.number,

                    sectionTitle:
                        section.title

                });

            }

        }

        return {

            valid:
                issues.length === 0,

            issues

        };

    }

}