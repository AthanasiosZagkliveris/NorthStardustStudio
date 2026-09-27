import { AnswerType } from "../../../framework/enums/AnswerType";
import type { AnswerDefinition } from "../../../framework/model/AnswerDefinition";
import {
    BRAND_INVENTORY_SECTIONS,
    BRAND_STYLE_SECTIONS,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_ENGAGEMENT_SECTIONS,
    BUSINESS_FOUNDATION_SUBSECTIONS,
    LEGAL_ENTITY_SECTIONS,
    STRATEGY_FOUNDATION_SECTIONS,
    titleWithPeriod,
    type StrategyThemeValue
} from "../../../framework/engine/AnswerUtils";
import {
    FINANCIAL_FOUNDATION_SECTIONS,
    FINANCIAL_SUSTAINABILITY_SECTIONS
} from "../../../framework/engine/FinancialModel";

/** One bullet on a rail. `id` matches a `data-rail` marker on the page. */
export interface RailItem {
    id: string;
    label: string;
}

/**
 * A stable, attribute-safe id from a sub-section label. The editors
 * use the same function on the same constants for their `data-rail`
 * markers, so the two can never drift apart.
 */
export function railId(label: string): string {

    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

}

const EMPTY_PERIOD = { start: { month: "", year: "" }, end: { month: "", year: "" } };

/** The left rail: every page of the System, "N. Title". */
export function pageRailItems(sections: readonly { number: number; title: string }[]): RailItem[] {

    return sections.map(section => ({
        id: "page-" + section.number,
        // An empty period drops the Strategy pages' "MM/YY - MM/YY"
        // placeholder: the rail is a table of contents, not a header.
        label: section.number + ". " + titleWithPeriod(section.title, EMPTY_PERIOD).trim()
    }));

}

/** The 0-based page index a page rail id ("page-N") points at. */
export function pageIndexFromRailId(id: string): number {

    return Number(id.replace("page-", "")) - 1;

}

const FIXED_SECTIONS: Partial<Record<AnswerType, readonly string[]>> = {
    [AnswerType.LegalEntity]: LEGAL_ENTITY_SECTIONS,
    [AnswerType.BrandStyle]: BRAND_STYLE_SECTIONS,
    [AnswerType.BrandInventory]: BRAND_INVENTORY_SECTIONS,
    [AnswerType.BusinessFoundation]: BUSINESS_FOUNDATION_SUBSECTIONS,
    [AnswerType.BusinessEngagement]: BUSINESS_ENGAGEMENT_SECTIONS,
    [AnswerType.BusinessCapability]: BUSINESS_CAPABILITY_SECTIONS,
    [AnswerType.FinancialFoundation]: FINANCIAL_FOUNDATION_SECTIONS,
    [AnswerType.FinancialSustainability]: FINANCIAL_SUSTAINABILITY_SECTIONS,
    [AnswerType.StrategyFoundation]: STRATEGY_FOUNDATION_SECTIONS
};

/** The right rail: the current page's sub-sections. */
export function sectionRailItems(
    answer: AnswerDefinition | undefined,
    themes: readonly StrategyThemeValue[] = []
): RailItem[] {

    if (!answer) {
        return [];
    }

    if (answer.type === AnswerType.MultiPart && answer.parts) {
        return answer.parts.map(part => ({ id: part.id, label: part.label }));
    }

    if (answer.type === AnswerType.StrategicPeriod || answer.type === AnswerType.StrategicRoadmap) {
        return themes.map((theme, index) => ({
            id: theme.id,
            label: theme.name.trim() || "Theme " + (index + 1)
        }));
    }

    return (FIXED_SECTIONS[answer.type] ?? []).map(label => ({ id: railId(label), label }));

}

/**
 * Which sub-section the reader is in, from each section's top edge
 * (viewport px) and the line just under the fixed header. Sections
 * on one row (a columns page) share a top, and the first of them
 * wins -- otherwise a four-column page would always report its last
 * column.
 */
export function pickActiveRail(tops: readonly number[], threshold: number): number {

    let active = 0;

    tops.forEach((top, index) => {
        if (top <= threshold && top > tops[active] + 1) {
            active = index;
        }
    });

    return active;

}
