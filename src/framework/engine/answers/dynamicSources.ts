import { AnswerType } from "../../enums/AnswerType.ts";
import { asFinancialSustainabilityValue } from "../financial/revenueStored.ts";
import { offeringName } from "../export/ExportRenderers.ts";

/**
 * The names a `Dynamic Field` can read from a page built by its own
 * editor rather than from a Markdown Card List or Table
 * (`ai/07-framework-dsl-grammar.md`, the suffixes). Keyed by the
 * page's Answer Structure, as its Answer file writes it
 * (`**Structure:** Financial Sustainability`); each name is what goes
 * after the colon: `Dynamic Field (Business System / Revenue & Pricing: Revenue Streams)`.
 */
export const BESPOKE_DYNAMIC_SOURCES: Readonly<Record<string, readonly string[]>> = {
    "Financial Sustainability": ["Revenue Streams"]
};

/** A page title without the period placeholder Strategy and Financials pages carry ("Revenue & Pricing MM/YY - MM/YY"). */
export function sectionName(title: string): string {
    return title.replace(/\s*MM\/YY\s*-\s*MM\/YY\s*$/i, "").trim();
}

/**
 * The options a bespoke page gives a `Dynamic Field`: Revenue & Pricing's
 * Revenue Streams are named by their Offering (Foundation), in order, each
 * once. `responseOf` reads another page of the same System by its Answer
 * Structure. Any other page or name gives none.
 */
export function bespokeDynamicOptions(
    type: AnswerType,
    value: unknown,
    name: string,
    responseOf: (type: AnswerType) => unknown
): string[] {

    const wanted = name.trim().toLowerCase();

    if (type === AnswerType.FinancialSustainability && (wanted === "revenue streams" || wanted === "revenue stream")) {
        const foundation = responseOf(AnswerType.BusinessFoundation);
        const names = asFinancialSustainabilityValue(value).streams
            .map(stream => offeringName(foundation, stream.offeringId))
            .filter(text => text.length > 0);
        return Array.from(new Set(names));
    }

    return [];

}
