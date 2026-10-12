import { AnswerType } from "../../../framework/enums/AnswerType";
import type { AnswerDefinition } from "../../../framework/model/AnswerDefinition";
import type { PageStatus } from "../../../framework/engine/PageStatus";
import {
    BRAND_INVENTORY_SECTIONS,
    BRAND_STYLE_PAGE_SECTIONS,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_ENGAGEMENT_SECTIONS,
    BUSINESS_FOUNDATION_SUBSECTIONS,
    FOUNDERS_PROFILE_SECTIONS,
    LEGAL_ENTITY_SECTIONS,
    STRATEGY_FOUNDATION_SECTIONS,
    titleWithPeriod,
    type StrategyThemeValue
} from "../../../framework/engine/AnswerUtils";
import {
    FINANCIAL_FOUNDATION_SECTIONS,
    FINANCIAL_SUSTAINABILITY_SECTIONS
} from "../../../framework/engine/FinancialModel";
import { fieldKey, sectionSegment, type FieldEntry } from "../../../framework/engine/FieldKeys";

/**
 * One bullet on a rail. `id` matches a `data-rail` marker on the
 * page. `status`, on the Pages rail only, is the page's status
 * (PageStatus.ts), drawn as the bullet's shape.
 */
export interface RailItem {
    id: string;
    label: string;
    status?: PageStatus;
    /** Shown in capitals (the Introduction, which heads the pages rather than being one). */
    capitals?: boolean;
}

/**
 * A stable, attribute-safe id from a sub-section label. The editors
 * use the same function on the same constants for their `data-rail`
 * markers, so the two can never drift apart.
 */
export function railId(label: string): string {

    return sectionSegment(label);

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
    [AnswerType.FoundersProfile]: FOUNDERS_PROFILE_SECTIONS,
    [AnswerType.BrandStyle]: BRAND_STYLE_PAGE_SECTIONS,
    [AnswerType.BrandInventory]: BRAND_INVENTORY_SECTIONS,
    [AnswerType.BusinessFoundation]: BUSINESS_FOUNDATION_SUBSECTIONS,
    [AnswerType.BusinessEngagement]: BUSINESS_ENGAGEMENT_SECTIONS,
    [AnswerType.BusinessCapability]: BUSINESS_CAPABILITY_SECTIONS,
    [AnswerType.FinancialFoundation]: FINANCIAL_FOUNDATION_SECTIONS,
    [AnswerType.FinancialSustainability]: FINANCIAL_SUSTAINABILITY_SECTIONS,
    [AnswerType.StrategyFoundation]: STRATEGY_FOUNDATION_SECTIONS
};

/**
 * The pages drawn as TILES (each section a tile of its own, or inside one) show no Sections rail: the tiles are the way to the sections. (The sections
 * themselves are still the page's: the rail's items are what names and numbers them elsewhere.)
 * (The Legal Entity, the Founders Profile, the Style page, the Strategy Foundation, Infrastructure & Capability, and the four-column pages -- Definition, Ethics, Ambassador.)
 */
const DRAWN_AS_TILES: ReadonlySet<AnswerType> = new Set([
    AnswerType.LegalEntity,
    AnswerType.FoundersProfile,
    AnswerType.BrandStyle,
    AnswerType.BrandInventory,
    AnswerType.StrategyFoundation,
    AnswerType.BusinessFoundation,
    AnswerType.BusinessCapability,
    AnswerType.StrategicRoadmap
]);

/**
 * The bespoke pages that, like a columns page, can carry on a
 * System's running count (see BrandStyleEditor.startNumber). Every
 * other bespoke page numbers its sections from 1.
 */
const CONTINUES_COUNT: ReadonlySet<AnswerType> = new Set([
    AnswerType.BrandStyle,
    AnswerType.BrandInventory,
    AnswerType.StrategyFoundation
]);

/**
 * The right rail: the current page's sub-sections, "N. Title", with
 * the number the page itself gives each one. `firstNumber` is what
 * the page's first section carries: 1 on a page that numbers its
 * own sections (see AnswerDefinition.nestedNumbering), otherwise
 * where the System's running count has got to.
 */
export function sectionRailItems(
    answer: AnswerDefinition | undefined,
    themes: readonly StrategyThemeValue[] = [],
    firstNumber = 1
): RailItem[] {

    if (!answer) {
        return [];
    }

    if (answer.type === AnswerType.MultiPart) {

        // Only the columns layout marks its parts with `data-rail`
        // (AnswerRenderer checks `tabbed` first, so a Section that
        // declares both renders as tabs and has no markers). An
        // unlabeled part has nothing to show on a bullet, but still
        // takes its number on the page, so it is counted first.
        if (!answer.columns || answer.tabbed || !answer.parts) {
            return [];
        }


        return answer.parts
            .map((part, index) => ({ id: part.id, label: part.label, number: firstNumber + index }))
            .filter(part => part.label.trim().length > 0)
            .map(part => ({ id: part.id, label: part.number + ". " + part.label }));

    }

    // Numbered by Theme order, whatever the Themes' own pages number
    // them.
    if (answer.type === AnswerType.StrategicPeriod || answer.type === AnswerType.StrategicRoadmap) {
        return themes.map((theme, index) => ({
            id: theme.id,
            label: (index + 1) + ". " + (theme.name.trim() || "Theme " + (index + 1))
        }));
    }

    const first = CONTINUES_COUNT.has(answer.type) ? firstNumber : 1;

    return (FIXED_SECTIONS[answer.type] ?? []).map((label, index) => ({
        id: railId(label),
        label: (first + index) + ". " + label
    }));

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

/**
 * The page's own sections as fields (see FieldKeys.ts): a columns
 * page's columns, a bespoke page's sections, the Themes of the
 * Strategy pages -- each addressed by its rail id, named by its rail
 * label. What the field registry knows about a page without
 * rendering it; the fields inside are registered as they render.
 */
export function pageFields(
    systemNumber: number,
    section: { number: number; title: string; answer?: AnswerDefinition },
    answer: AnswerDefinition | undefined = section.answer,
    themes: readonly StrategyThemeValue[] = []
): FieldEntry[] {

    const pageTitle = pageRailItems([section])[0].label;

    return sectionRailItems(answer, themes).map(item => ({
        key: fieldKey({ systemNumber, sectionNumber: section.number, path: [item.id] }),
        label: item.label.replace(/^\d+\.\s+/, ""),
        pageTitle
    }));

}

/** Whether a page is drawn as tiles, with no Sections rail: a four-column page, the Legal Entity, the Founders Profile, the Style page, the Strategy Foundation. */
export function drawnAsTiles(answer: AnswerDefinition | undefined): boolean {
    return !!answer && (DRAWN_AS_TILES.has(answer.type) || (answer.type === AnswerType.MultiPart && !!answer.columns && !answer.tabbed && answer.parts?.length === 4));
}
