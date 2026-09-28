import {
    AnswerDefinition,
    Section,
    ValidationIssue,
    ValidationResult
} from "../model";

import { systems } from "../../data/systems";
import { frameworkRegistry } from "./FrameworkRegistry";

import { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import {
    BRAND_INVENTORY_SECTIONS,
    BRAND_STYLE_SECTIONS,
    STRATEGY_FOUNDATION_SECTIONS,
    asStrategicPeriodValue,
    asStrategyFoundationValue,
    brandInventorySectionsEmpty,
    brandStyleSectionsEmpty,
    isAnswerEmpty,
    LEGAL_ENTITY_SECTIONS,
    legalEntitySectionsEmpty,
    numberedUnitCount,
    strategyFoundationSectionsEmpty,
    strategyGoalsForTheme,
    strategyObjectiveIncomplete,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_ENGAGEMENT_SECTIONS,
    BUSINESS_FOUNDATION_SUBSECTIONS,
    businessCapabilitySectionsEmpty,
    businessEngagementSectionsEmpty,
    businessFoundationSubsectionsEmpty
} from "./AnswerUtils.ts";
import {
    FINANCIAL_FOUNDATION_SECTIONS,
    FINANCIAL_SUSTAINABILITY_SECTIONS,
    financialFoundationSectionsEmpty,
    financialSustainabilitySectionsEmpty
} from "./FinancialModel.ts";

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
        session: InterviewSession,
        /**
         * Returns the stored value behind a Shared Answer -- which
         * lives in ANOTHER System's session, so only the caller can
         * reach it (see Conversation.tsx).
         *
         * Without it a shared page can't be judged and is simply
         * skipped; with it, the Brand System reports its own
         * Sections 1-4 rather than staying silent about four pages
         * the user still has to fill in.
         */
        resolveSharedValue?: (answer: AnswerDefinition) => unknown
    ): ValidationResult {

        const framework = session.getFramework();
        const issues: ValidationIssue[] = [];

        // Column-layout Sections are reported one COLUMN at a time
        // rather than one page at a time, numbered continuously
        // across the System (the Identity System's three pages of
        // four columns report as 1-12). Reporting the page alone
        // would tell the user a page is unfinished without saying
        // which of its columns is actually empty.
        let columnNumber = 0;

        for (const section of framework.sections) {

            if (section.answer?.columns && section.answer.parts) {

                const response = session.getResponse(section.number);

                const values =
                    response && typeof response === "object" && !Array.isArray(response)
                        ? response as Record<string, unknown>
                        : {};

                const nested = section.answer.nestedNumbering;

                for (const [index, part] of section.answer.parts.entries()) {

                    columnNumber++;

                    if (isAnswerEmpty(part.answer, values[part.id])) {

                        issues.push({
                            sectionNumber: columnNumber,
                            sectionTitle: part.label,
                            // A Section numbering its own units
                            // reports them the way it shows them
                            // (see AnswerDefinition.nestedNumbering).
                            // The running count still advances, so a
                            // System mixing the two conventions stays
                            // correct either way.
                            pageNumber: nested ? section.number : undefined,
                            label: nested ? (index + 1) + "." : undefined
                        });

                    }

                }

                continue;

            }

            // The Brand System's Style and Inventory pages each hold
            // several named sections of their own, counted in the
            // System's running count (1-4 Brand Foundation, 5-7
            // Style, 8-9 Inventory) and, on a Section that numbers
            // its own units, reported under the page as it shows
            // them (1-3, 1-2). Reporting the page as one line would
            // name it "Style" and leave the user hunting for which
            // of its three parts is actually unfinished.
            if (section.answer?.type === AnswerType.BrandStyle) {

                const nested = section.answer.nestedNumbering;

                brandStyleSectionsEmpty(session.getResponse(section.number))
                    .forEach((empty, index) => {
                        columnNumber++;
                        if (empty) {
                            issues.push({
                                sectionNumber: columnNumber,
                                sectionTitle: BRAND_STYLE_SECTIONS[index],
                                pageNumber: nested ? section.number : undefined,
                                label: nested ? (index + 1) + "." : undefined
                            });
                        }
                    });

                continue;

            }

            // The Foundation section reports its four SUBSECTIONS,
            // not itself, so the dialog names the subsection the user
            // has to go back to, under the page it is on. Numbered
            // 1-4 as the page shows them, the way the Definition and
            // Ethics pages number theirs.
            if (section.answer?.type === AnswerType.BusinessFoundation) {

                columnNumber++;

                const pageNumber = columnNumber;

                businessFoundationSubsectionsEmpty(session.getResponse(section.number))
                    .forEach((empty, index) => {
                        if (empty) {
                            issues.push({
                                sectionNumber: pageNumber,
                                sectionTitle: BUSINESS_FOUNDATION_SUBSECTIONS[index],
                                pageNumber: section.number,
                                label: (index + 1) + "."
                            });
                        }
                    });

                continue;

            }

            // The Customer Engagement page reports its TWO sections
            // the same way, for the same reason: "1. Customer Channel"
            // on page 2 is where the user has to go back to, not "2".
            if (section.answer?.type === AnswerType.BusinessEngagement) {

                columnNumber++;

                const pageNumber = columnNumber;

                businessEngagementSectionsEmpty(session.getResponse(section.number))
                    .forEach((empty, index) => {
                        if (empty) {
                            issues.push({
                                sectionNumber: pageNumber,
                                sectionTitle: BUSINESS_ENGAGEMENT_SECTIONS[index],
                                pageNumber: section.number,
                                label: (index + 1) + "."
                            });
                        }
                    });

                continue;

            }

            // And the Infrastructure & Capability page its two, the
            // same way again.
            if (section.answer?.type === AnswerType.BusinessCapability) {

                columnNumber++;

                const pageNumber = columnNumber;

                businessCapabilitySectionsEmpty(session.getResponse(section.number))
                    .forEach((empty, index) => {
                        if (empty) {
                            issues.push({
                                sectionNumber: pageNumber,
                                sectionTitle: BUSINESS_CAPABILITY_SECTIONS[index],
                                pageNumber: section.number,
                                label: (index + 1) + "."
                            });
                        }
                    });

                continue;

            }

            // And the two Financial pages theirs.
            if (
                section.answer?.type === AnswerType.FinancialFoundation ||
                section.answer?.type === AnswerType.FinancialSustainability
            ) {

                columnNumber++;

                const pageNumber = columnNumber;

                const foundationPage = section.answer.type === AnswerType.FinancialFoundation;

                const titles: readonly string[] = foundationPage
                    ? FINANCIAL_FOUNDATION_SECTIONS
                    : FINANCIAL_SUSTAINABILITY_SECTIONS;

                (foundationPage
                    ? financialFoundationSectionsEmpty
                    : financialSustainabilitySectionsEmpty)(session.getResponse(section.number))
                    .forEach((empty, index) => {
                        if (empty) {
                            issues.push({
                                sectionNumber: pageNumber,
                                sectionTitle: titles[index],
                                pageNumber: section.number,
                                label: (index + 1) + "."
                            });
                        }
                    });

                continue;

            }

            // The Legal Entity page takes ONE number of its own and
            // numbers its six subsections 1-6 inside it, so an
            // unfinished part is reported by its own number, under
            // the page, rather than by the page's.
            if (section.answer?.type === AnswerType.LegalEntity) {

                columnNumber++;

                const pageNumber = columnNumber;

                const page = section.answer.nestedNumbering
                    ? section.number
                    : pageNumber;

                legalEntitySectionsEmpty(session.getResponse(section.number))
                    .forEach((empty, index) => {
                        if (empty) {
                            issues.push({
                                sectionNumber: pageNumber,
                                sectionTitle: LEGAL_ENTITY_SECTIONS[index],
                                pageNumber: page,
                                label: (index + 1) + "."
                            });
                        }
                    });

                continue;

            }

            if (section.answer?.type === AnswerType.BrandInventory) {

                const nested = section.answer.nestedNumbering;

                brandInventorySectionsEmpty(session.getResponse(section.number))
                    .forEach((empty, index) => {
                        columnNumber++;
                        if (empty) {
                            issues.push({
                                sectionNumber: columnNumber,
                                sectionTitle: BRAND_INVENTORY_SECTIONS[index],
                                pageNumber: nested ? section.number : undefined,
                                label: nested ? (index + 1) + "." : undefined
                            });
                        }
                    });

                continue;

            }

            // The Strategy System's Foundation page holds four
            // columns of its own, numbered 1-4 like any other column
            // page.
            if (section.answer?.type === AnswerType.StrategyFoundation) {

                const nested = section.answer.nestedNumbering;

                strategyFoundationSectionsEmpty(session.getResponse(section.number))
                    .forEach((empty, index) => {
                        columnNumber++;
                        if (empty) {
                            issues.push({
                                sectionNumber: columnNumber,
                                sectionTitle: STRATEGY_FOUNDATION_SECTIONS[index],
                                pageNumber: nested ? section.number : undefined,
                                label: nested ? (index + 1) + "." : undefined
                            });
                        }
                    });

                continue;

            }

            // The Strategic Period page develops the Themes defined
            // on the Foundation page, so what is unfinished is a
            // Theme, a Goal or an Objective -- not "page 2". Each is
            // reported under the nested number the page itself shows
            // (4.1, 4.1.1, 4.1.1.1), which is why these carry a
            // `label` rather than an integer.
            if (section.answer?.type === AnswerType.StrategicPeriod) {

                issues.push(...this.strategicPeriodIssues(session, section));

                continue;

            }

            // Nothing on the Roadmap is editable -- it is drawn from
            // the other two pages, so it can never be the thing
            // holding an interview up.
            if (section.answer?.type === AnswerType.StrategicRoadmap) {
                continue;
            }

            // A Shared Answer holds no value of its own, but the page
            // is still one the user has to complete HERE -- so its
            // parts are reported under this System's own numbering
            // (the Brand System's four shared Brand Foundation
            // columns are its Sections 1-4). The value comes from the
            // mirrored System via `resolveSharedValue`; without that
            // the page can only be counted, not judged.
            if (section.answer?.type === AnswerType.SharedAnswer) {

                const mirrored = this.resolveSharedAnswer(section.answer);

                if (!mirrored) {
                    continue;
                }

                if (mirrored.columns && mirrored.parts) {

                    const shared = resolveSharedValue?.(section.answer);

                    const values =
                        shared && typeof shared === "object" && !Array.isArray(shared)
                            ? shared as Record<string, unknown>
                            : {};

                    for (const part of mirrored.parts) {

                        columnNumber++;

                        // Only judged when the caller could actually
                        // supply the mirrored value -- otherwise the
                        // part is counted (so later numbering stays
                        // right) but never reported as incomplete on
                        // no evidence.
                        if (resolveSharedValue && isAnswerEmpty(part.answer, values[part.id])) {

                            issues.push({
                                sectionNumber: columnNumber,
                                sectionTitle: part.label
                            });

                        }

                    }

                    continue;

                }

                columnNumber += numberedUnitCount(
                    mirrored,
                    (answer) => this.resolveSharedAnswer(answer)
                );

                continue;

            }

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
     * What is still unfinished on the Strategic Period page.
     *
     * The Themes it develops belong to the Foundation page, so they
     * are read from there -- this page stores only the Goals hung
     * off each Theme id. A Theme with no Foundation entry cannot be
     * reported, because it does not exist.
     *
     * Reported at the deepest level that is actually incomplete: a
     * Goal with no name is one issue, whereas a named Goal whose
     * second Objective is missing its dates reports that Objective
     * rather than the whole Goal. Anything coarser would leave the
     * user opening boxes to find out what is meant.
     */
    private strategicPeriodIssues(
        session: InterviewSession,
        section: Section
    ): ValidationIssue[] {

        const issues: ValidationIssue[] = [];

        const foundationSection = session.getFramework().sections.find(
            candidate => candidate.answer?.type === AnswerType.StrategyFoundation
        );

        if (!foundationSection) {
            return issues;
        }

        const foundation = asStrategyFoundationValue(
            session.getResponse(foundationSection.number)
        );

        const period = asStrategicPeriodValue(session.getResponse(section.number));

        // Named as the page names them ("1. Theme", "1. Goal", "1.
        // Objective"), in words: "Theme 1, Goal 2, Objective 1". A
        // Theme keeps its own place, even when one before it has no
        // name yet (the Foundation page reports those).
        foundation.themes.forEach((theme, themeIndex) => {

            if (theme.name.trim().length === 0) {
                return;
            }

            const themeLabel = `Theme ${themeIndex + 1}`;

            strategyGoalsForTheme(period, theme.id).forEach((goal, goalIndex) => {

                const goalLabel = `${themeLabel}, Goal ${goalIndex + 1}`;

                if (goal.name.trim().length === 0) {

                    issues.push({
                        sectionNumber: section.number,
                        sectionTitle: `${theme.name}: Goal`,
                        label: goalLabel
                    });

                    return;

                }

                goal.objectives.forEach((objective, objectiveIndex) => {

                    if (!strategyObjectiveIncomplete(objective)) {
                        return;
                    }

                    issues.push({
                        sectionNumber: section.number,
                        sectionTitle: objective.name.trim().length > 0
                            ? objective.name
                            : `${goal.name}: Objective`,
                        label: `${goalLabel}, Objective ${objectiveIndex + 1}`
                    });

                });

            });

        });

        return issues;

    }

    /**
     * Resolves a Shared Answer's mirrored Section definition, so its
     * parts can be counted toward this System's running number.
     *
     * Reads the shared Framework registry directly rather than
     * taking a resolver parameter: this is a pure structural lookup
     * (which Section does that reference name?), it needs no session
     * or Organization, and threading a callback through
     * ReviewManager for it would be more plumbing than the lookup is
     * worth.
     */
    private resolveSharedAnswer(answer: AnswerDefinition): AnswerDefinition | undefined {

        const reference = answer.sharedSource;

        if (!reference) {
            return undefined;
        }

        const normalize = (text: string) => text.trim().toLowerCase();

        const sourceSystem = systems.find(
            candidate => normalize(candidate.title) === normalize(reference.systemTitle)
        );

        if (!sourceSystem) {
            return undefined;
        }

        return frameworkRegistry
            .getFramework(sourceSystem.id)
            .sections
            .find(candidate => normalize(candidate.title) === normalize(reference.sectionTitle))
            ?.answer;

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
