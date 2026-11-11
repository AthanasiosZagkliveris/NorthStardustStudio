/*
    WHAT THE STRATEGY SYSTEM'S PAGES READ FROM EACH OTHER AND FROM THE BUSINESS SYSTEM, AND WHAT THEY ASK BEFORE A CHANGE (Conversation.tsx): the
    Strategic Period's answer and its numbering, the Current Situation drafted from the Business System and the financial plan's dates, and the
    three questions asked first (removing a Theme with work under it, narrowing the Period past an Objective, refreshing the Current
    Situation). Moved out of Conversation.tsx as it was (2026-11-11, the owner: "Go on, do all together"): the same code, run in the same place
    on every draw; Conversation.tsx calls readStrategy and uses what it returns. The pages are pinned by examplePages.test.tsx.
*/
import type { InterviewSession } from "../framework/interview";
import { AnswerType } from "../framework/enums/AnswerType";
import { asStrategicPeriodValue, formatRangeShort, isRangeSet, monthIndex, numberedUnitCount, strategyGoalsForTheme, strategyThemeHasContent, type StrategyFoundationValue, type StrategyRangeValue, type StrategyThemeValue } from "../framework/engine/AnswerUtils.ts";
import { currentSituationDraft, financialPlanRange } from "../framework/engine/BusinessDocuments.ts";
import { StorageService } from "../services/StorageService";
import { IDENTITY_SYSTEM_NUMBER, BUSINESS_SYSTEM_NUMBER } from "./conversationHelpers";

/** A held-back Strategy change and what it would cost: the page shows it in its own dialog, and `apply` runs it. */
export type StrategyPrompt = { title: string; message: string; apply: () => void };

export interface StrategyInput {
    session: InterviewSession;
    system: { id?: string } | undefined;
    organizationId: string | null;
    organizationName: string;
    strategyFoundationValue: StrategyFoundationValue | undefined;
    setStrategyPrompt: (prompt: StrategyPrompt | null) => void;
}

export function readStrategy({ session, system, organizationId, organizationName, strategyFoundationValue, setStrategyPrompt }: StrategyInput) {

    const framework = session.getFramework();

    /*
        The Strategy System's three pages read forward: the Strategic
        Period page develops the Themes the Foundation page defines,
        and the Roadmap draws both. A Section can only see its own
        response, so the other pages' answers are resolved here, once,
        and handed down.

        Resolved by Answer Structure rather than by System number, so
        this stays correct if the Strategy pages are ever reordered.
    */
    const strategyFoundationSection = framework.sections.find(candidate => candidate.answer?.type === AnswerType.StrategyFoundation);

    const strategicPeriodSection = framework.sections.find(
        candidate => candidate.answer?.type === AnswerType.StrategicPeriod
    );

    // strategyFoundationValue itself is resolved above the early
    // returns (resolveStrategyFoundationValue), for the section rail.

    const strategicPeriodValue = strategicPeriodSection
        ? asStrategicPeriodValue(session.getResponse(strategicPeriodSection.number))
        : undefined;

    /*
        Every number on the Strategic Period page hangs off the
        Strategic Period's own number, which is the LAST of the
        Foundation page's four columns -- not the Foundation
        Section's number, which is 1.
    */
    const strategyThemeNumberPrefix = String(
        numberedUnitCount(strategyFoundationSection?.answer)
    );

    /**
     * Removing a Theme takes everything written under it on the
     * Strategic Period page with it, so this asks first -- but only
     * when there is something to lose. A Theme with nothing recorded
     * against it goes without a dialog, because confirming an
     * inconsequential action just teaches people to dismiss dialogs.
     */
    function guardThemeRemoval(theme: StrategyThemeValue, apply: () => void) {

        if (!strategicPeriodValue || !strategyThemeHasContent(strategicPeriodValue, theme.id)) {
            apply();
            return;
        }

        setStrategyPrompt({
            title: "Remove this Theme?",
            message:
                `"${theme.name.trim() || "Untitled Theme"}" has Goals, Objectives and ` +
                "Initiatives recorded against it on the Strategic Period page. Removing " +
                "the Theme removes all of them, and this cannot be undone.",
            apply
        });

    }

    /**
     * An Objective can only be placed inside the Strategic Period,
     * so narrowing the Period can strand one that was planned in the
     * part being cut away. Rather than silently leaving it outside
     * (where the Roadmap could not draw it), this names the
     * Objectives that would be stranded so the user knows exactly
     * which ones to move.
     */
    function guardPeriodChange(period: StrategyRangeValue, apply: () => void) {

        if (!strategyFoundationValue || !strategicPeriodValue || !isRangeSet(period)) {
            apply();
            return;
        }

        const first = monthIndex(period.start);
        const last = monthIndex(period.end);

        const stranded: string[] = [];

        strategyFoundationValue.themes.forEach((theme, themeIndex) => {

            strategyGoalsForTheme(strategicPeriodValue, theme.id).forEach((goal, goalIndex) => {

                goal.objectives.forEach((objective, objectiveIndex) => {

                    if (!isRangeSet(objective.period)) {
                        return;
                    }

                    const start = monthIndex(objective.period.start);
                    const end = monthIndex(objective.period.end);

                    if (start >= first && end <= last) {
                        return;
                    }

                    // Named as the page shows it, in words, so the
                    // user can find it: "Theme 1, Goal 2, Objective 1".
                    const number =
                        `Theme ${themeIndex + 1}, Goal ${goalIndex + 1}, Objective ${objectiveIndex + 1}:`;

                    stranded.push(
                        `${number} ${objective.name.trim() || "Untitled Objective"} ` +
                        `(${formatRangeShort(objective.period)})`
                    );

                });

            });

        });

        if (stranded.length === 0) {
            apply();
            return;
        }

        setStrategyPrompt({
            title: "Objectives fall outside this period",
            message:
                `${formatRangeShort(period)} leaves out ` +
                `${stranded.length === 1 ? "this Objective" : "these Objectives"}: ` +
                `${stranded.join("; ")}. Change ` +
                `${stranded.length === 1 ? "its period" : "their periods"} on the ` +
                "Strategic Period page first, or continue and set " +
                `${stranded.length === 1 ? "it" : "them"} again.`,
            apply
        });

    }

    /*
        The Current Situation drafted from the Business System, which
        is answered before Strategy: read from what is saved, on the
        Strategy System only.
    */
    const businessSessions = system?.id === "strategy" && organizationId
        ? {
            identity: StorageService.loadInterview(organizationId, IDENTITY_SYSTEM_NUMBER),
            business: StorageService.loadInterview(organizationId, BUSINESS_SYSTEM_NUMBER),
            organisationName: organizationName
        }
        : null;
    const situationDraft = businessSessions ? currentSituationDraft(businessSessions) : "";

    /* The financial plan's dates, for the Strategic Period to be compared with. */
    const financialPlan = businessSessions ? financialPlanRange(businessSessions) : null;

    /** Refreshing replaces the founder's own words: asked first. */
    function guardSituationRefresh(apply: () => void) {
        setStrategyPrompt({
            title: "Replace your Current Situation?",
            message: "Refresh replaces the text with a new draft from the Business System. " +
                "The changes you made to it will be lost.",
            apply
        });
    }

    return {
        strategicPeriodSection,
        strategicPeriodValue,
        strategyThemeNumberPrefix,
        guardThemeRemoval,
        guardPeriodChange,
        situationDraft,
        financialPlan,
        guardSituationRefresh
    };

}
