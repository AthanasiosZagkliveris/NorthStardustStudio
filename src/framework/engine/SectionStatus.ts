import type { AnswerDefinition } from "../model";
import { AnswerType } from "../enums/AnswerType.ts";
import {
    asBrandInventoryValue,
    asBrandStyleValue,
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    asFoundersProfileValue,
    asLegalEntityValue,
    asStrategicPeriodValue,
    asStrategyFoundationValue,
    brandInventorySectionsEmpty,
    brandStyleSectionsEmpty,
    businessCapabilitySectionsEmpty,
    businessEngagementSectionsEmpty,
    businessFoundationSubsectionsEmpty,
    isAnswerEmpty,
    legalEntitySectionsEmpty,
    strategyFoundationSectionsEmpty,
    strategyGoalsForTheme,
    strategyObjectiveIncomplete,
    type StrategyThemeValue
} from "./AnswerUtils.ts";
import {
    asFinancialFoundationValue,
    asFinancialSustainabilityValue,
    financialFoundationSectionsEmpty,
    financialSustainabilitySectionsEmpty
} from "./FinancialModel.ts";
import { differsFromDefault, hasAnyAnswer, type PageStatus } from "./PageStatus.ts";

/**
 * A page's SECTIONS each in the same four states as the page itself
 * (PageStatus.ts), for the Sections rail's bullets -- in the order
 * sectionRailItems lists them:
 *
 * - `not-started`  -- nothing in that section differs from its
 *                     untouched default;
 * - `in-progress`  -- something answered, but a required answer in it
 *                     still missing (InterviewValidator's rules, per
 *                     section: the column's own answer, or the
 *                     bespoke page's *SectionsEmpty entry);
 * - `defined`      -- every required answer in it given.
 *
 * A section that asks nothing required (Additional Legal Requirements,
 * Legal Entity Expenses, both of the Founders Profile's, the Funding
 * Need and Financial Position worked out from other answers, Break
 * Even) is OPTIONAL: defined once anything is answered in it, or once
 * the rest of its page is defined -- never "in progress" merely for
 * being empty.
 */

/** A bespoke page's sections: its value's parts, which it requires, and which are optional. */
interface BespokeSections {
    /** Each section's part of the (normalised) value, in rail order. */
    slices: (value: unknown) => unknown[];
    /** The page's own validator rule: which sections still miss a required answer. */
    empty: (value: unknown) => boolean[];
    /** The sections that ask nothing required. */
    optional: readonly number[];
}

const BESPOKE: Partial<Record<AnswerType, BespokeSections>> = {

    [AnswerType.LegalEntity]: {
        slices: raw => {
            const v = asLegalEntityValue(raw);
            return [v.organisation, v.founders, v.formation, v.tax, v.requirements, v.expenses];
        },
        empty: legalEntitySectionsEmpty,
        optional: [4, 5]
    },

    [AnswerType.FoundersProfile]: {
        slices: raw => {
            const v = asFoundersProfileValue(raw);
            return [v.founders, [v.teamGaps, v.teamCover]];
        },
        empty: () => [false, false],
        optional: [0, 1]
    },

    [AnswerType.BrandStyle]: {
        slices: raw => {
            const v = asBrandStyleValue(raw);
            return [v.colours, v.typefaces, v.hierarchy, [v.inventory.icon, v.inventory.logo, v.inventory.markDescription], v.inventory.images];
        },
        empty: brandStyleSectionsEmpty,
        optional: []
    },

    [AnswerType.BrandInventory]: {
        slices: raw => {
            const v = asBrandInventoryValue(raw);
            return [[v.icon, v.logo, v.markDescription], v.images];
        },
        empty: brandInventorySectionsEmpty,
        optional: []
    },

    [AnswerType.BusinessFoundation]: {
        slices: raw => {
            const segments = asBusinessFoundationValue(raw).segments;
            return [
                segments.map(segment => [segment.name, segment.profiles]),
                segments.map(segment => segment.competitors),
                segments.map(segment => segment.valueProposition),
                segments.map(segment => segment.offerings)
            ];
        },
        empty: businessFoundationSubsectionsEmpty,
        optional: []
    },

    [AnswerType.BusinessEngagement]: {
        slices: raw => {
            const v = asBusinessEngagementValue(raw);
            return [
                v.segments.map(segment => segment.channels),
                [v.segments.map(segment => segment.offerings), v.demand]
            ];
        },
        empty: businessEngagementSectionsEmpty,
        optional: []
    },

    [AnswerType.BusinessCapability]: {
        slices: raw => {
            const { offering, delivery, ...infrastructure } = asBusinessCapabilityValue(raw);
            return [infrastructure, [offering, delivery]];
        },
        empty: businessCapabilitySectionsEmpty,
        optional: []
    },

    [AnswerType.FinancialFoundation]: {
        slices: raw => {
            const v = asFinancialFoundationValue(raw);
            return [
                [v.planStart, v.planYears, v.vatBasis, v.incomeTax, v.incomeTaxRate, v.classified, v.costs],
                v.needs,
                [v.funding, v.founderCapital],
                []
            ];
        },
        empty: financialFoundationSectionsEmpty,
        optional: [1, 3]
    },

    [AnswerType.FinancialSustainability]: {
        slices: raw => [asFinancialSustainabilityValue(raw).streams, []],
        empty: financialSustainabilitySectionsEmpty,
        optional: [1]
    },

    [AnswerType.StrategyFoundation]: {
        slices: raw => {
            const v = asStrategyFoundationValue(raw);
            return [v.situation, v.swot, v.compass, [v.period, v.themes]];
        },
        empty: strategyFoundationSectionsEmpty,
        optional: []
    }

};

/** One section's status from what it holds, what it requires, and whether it is optional. */
function statusOf(answered: boolean, complete: boolean, optional: boolean, pageDefined: boolean): PageStatus {

    if (optional) {
        return answered || pageDefined ? "defined" : "not-started";
    }

    if (complete) {
        return "defined";
    }

    return answered ? "in-progress" : "not-started";

}

/**
 * Every section's status on a page, keyed by the section's rail id
 * (sectionRailItems): its columns, a bespoke page's own sections, or
 * the Strategic Period's and Roadmap's Themes.
 *
 * `answer` is what the page renders (a Shared Answer's mirrored
 * definition) and `value` what it holds. `pageDefined` is the page's
 * own status being defined, for the optional sections. The Themes
 * pages take the Themes, and `periodValue` -- the Strategic Period
 * page's value, which the Roadmap draws its Themes from.
 */
export function sectionStatuses(
    answer: AnswerDefinition | undefined,
    value: unknown,
    options: {
        pageDefined?: boolean;
        themes?: readonly StrategyThemeValue[];
        periodValue?: unknown;
        railIds?: readonly string[];
    } = {}
): Map<string, PageStatus> {

    const statuses = new Map<string, PageStatus>();

    if (!answer) {
        return statuses;
    }

    const set = (id: string, status: PageStatus) => statuses.set(id, status);

    if (answer.type === AnswerType.MultiPart) {

        if (!answer.columns || answer.tabbed || !answer.parts) {
            return statuses;
        }

        const values = value && typeof value === "object" && !Array.isArray(value)
            ? value as Record<string, unknown>
            : {};

        for (const part of answer.parts) {
            const partValue = values[part.id];
            set(part.id, statusOf(
                hasAnyAnswer(part.answer, partValue),
                !isAnswerEmpty(part.answer, partValue),
                false,
                false
            ));
        }

        return statuses;

    }

    if (answer.type === AnswerType.StrategicPeriod || answer.type === AnswerType.StrategicRoadmap) {

        const period = asStrategicPeriodValue(answer.type === AnswerType.StrategicPeriod ? value : options.periodValue);
        const untouched = asStrategicPeriodValue(undefined);

        for (const theme of options.themes ?? []) {
            const goals = strategyGoalsForTheme(period, theme.id);
            const complete = goals.every(goal =>
                goal.name.trim().length > 0 && !goal.objectives.some(strategyObjectiveIncomplete));
            set(theme.id, statusOf(
                differsFromDefault(strategyGoalsForTheme(untouched, theme.id), goals),
                complete,
                false,
                false
            ));
        }

        return statuses;

    }

    const bespoke = BESPOKE[answer.type];

    if (!bespoke || !options.railIds) {
        return statuses;
    }

    const slices = bespoke.slices(value);
    const defaults = bespoke.slices(undefined);
    const empty = bespoke.empty(value);

    options.railIds.forEach((id, index) => {
        set(id, statusOf(
            differsFromDefault(defaults[index], slices[index]),
            !(empty[index] ?? false),
            bespoke.optional.includes(index),
            options.pageDefined ?? false
        ));
    });

    return statuses;

}
