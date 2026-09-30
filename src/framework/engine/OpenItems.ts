import type { AnswerDefinition, Section } from "../model";
import type { InterviewSession } from "../interview";
import { AnswerType } from "../enums/AnswerType.ts";
import {
    asBrandInventoryValue,
    asBrandStyleValue,
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    asLegalEntityValue,
    asStrategicPeriodValue,
    asStrategyFoundationValue,
    brandMarkFile,
    BRAND_COLOUR_SLOTS,
    BRAND_HIERARCHY_LEVELS,
    BRAND_IMAGE_MIN,
    BRAND_INVENTORY_SECTIONS,
    BRAND_STYLE_SECTIONS,
    BRAND_TYPEFACE_SLOTS,
    BUSINESS_CAPABILITY_SECTIONS,
    BUSINESS_ENGAGEMENT_SECTIONS,
    BUSINESS_FOUNDATION_SUBSECTIONS,
    businessResponsibleId,
    isAnswerEmpty,
    isRangeSet,
    LEGAL_ENTITY_SECTIONS,
    normalizeHex,
    STRATEGY_FOUNDATION_SECTIONS,
    STRATEGY_SWOT_QUADRANTS,
    strategyGoalsForTheme
} from "./AnswerUtils.ts";
import {
    asFinancialFoundationValue,
    asFinancialSustainabilityValue,
    FINANCIAL_FOUNDATION_SECTIONS,
    FINANCIAL_SUSTAINABILITY_SECTIONS,
    incomeTaxMissing
} from "./FinancialModel.ts";
import { fieldKey, sectionSegment } from "./FieldKeys.ts";
import { InterviewValidator } from "./InterviewValidator.ts";
import { monthOrdinal } from "./FinancialModel.ts";
import { parseAmount } from "./Amounts.ts";
import { pageStatus } from "./PageStatus.ts";

/*
    STILL OPEN: what is missing, by the CARD (or, where a page has no
    cards, the section) it is missing from -- "Warp & Weft Throw: value
    proposition" -- by the same rules the validator applies, so a page
    the rail calls defined has nothing here. Plus every activity with
    no responsible founder where there are several to choose from.

    Each item names where to go: the card (its anchor, and its key) or
    the section.
*/

export interface OpenPlace {
    systemNumber: number;
    sectionNumber: number;
    key?: string;
    anchors?: string[];
}

export interface OpenItem {
    /** "<Card or section>: <what is missing>." */
    text: string;
    place: OpenPlace;
}

const validator = new InterviewValidator();

/** "a, b and c". */
function list(words: string[]): string {
    return words.length <= 1 ? words.join("") : words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
}

function blank(value: unknown): boolean {
    return typeof value !== "string" || value.trim().length === 0;
}

/**
 * What is missing on one page of a System, by card or section, each
 * sentence led by where it is ("3. Business System → 1. Foundation").
 */
export function openItemsOf(
    systemNumber: number,
    session: InterviewSession,
    where: (section: Section) => string,
    resolveSharedValue?: (answer: AnswerDefinition) => unknown
): OpenItem[] {

    const items: OpenItem[] = [];

    for (const section of session.getSections()) {

        const answer = section.answer;
        const value = session.getResponse(section.number);
        const at = where(section);
        const key = (...path: string[]) => fieldKey({ systemNumber, sectionNumber: section.number, path });
        const add = (text: string, place: Partial<OpenPlace> = {}) =>
            items.push({ text: at + ": " + text, place: { systemNumber, sectionNumber: section.number, ...place } });
        const sectionItem = (title: string, what: string, anchors?: string[]) =>
            add(title + ": " + what + ".", { key: key(sectionSegment(title)), ...(anchors ? { anchors } : {}) });

        if (!answer || answer.type === AnswerType.StrategicRoadmap) {
            continue;
        }

        // A page of columns: each column left empty.
        const columns = answer.type === AnswerType.SharedAnswer ? validator.mirroredAnswer(answer) : answer;
        if (columns?.type === AnswerType.MultiPart && columns.columns && columns.parts) {
            const shown = answer.type === AnswerType.SharedAnswer ? resolveSharedValue?.(answer) : value;
            if (answer.type === AnswerType.SharedAnswer && shown === undefined) {
                continue;
            }
            const values = shown && typeof shown === "object" && !Array.isArray(shown) ? shown as Record<string, unknown> : {};
            for (const part of columns.parts) {
                if (isAnswerEmpty(part.answer, values[part.id])) {
                    add(part.label + ": not answered yet.", { key: key(part.id) });
                }
            }
            continue;
        }

        switch (answer.type) {

            case AnswerType.LegalEntity: {
                const entity = asLegalEntityValue(value);
                const organisation = entity.organisation;
                const missing = [
                    blank(organisation.name) && "name",
                    blank(organisation.mainActivity) && "main activity",
                    blank(organisation.country) && "country",
                    blank(organisation.city) && "city",
                    blank(organisation.addressLine1) && "address",
                    blank(organisation.legalForm) && blank(organisation.legalFormOther) && "legal form"
                ].filter((word): word is string => !!word);
                if (missing.length > 0) {
                    sectionItem(LEGAL_ENTITY_SECTIONS[0], list(missing), ["legal-section-0"]);
                }
                if (!entity.founders.some(founder => !blank(founder.name))) {
                    sectionItem(LEGAL_ENTITY_SECTIONS[1], "a founder's name", ["legal-section-1"]);
                }
                const planned = entity.formation.status === "planned";
                const formation = [
                    !planned && blank(entity.formation.date) && "formation date",
                    blank(entity.formation.authority) && "registration authority",
                    !planned && blank(entity.formation.registrationNumber) && "registration number"
                ].filter((word): word is string => !!word);
                if (formation.length > 0) {
                    sectionItem(LEGAL_ENTITY_SECTIONS[2], list(formation), ["legal-section-2"]);
                }
                const tax = [
                    !planned && blank(entity.tax.identificationNumber) && "tax identification number",
                    !planned && entity.tax.consumptionTaxStatus === "yes" && blank(entity.tax.consumptionTaxNumber) && "sales-tax registration number"
                ].filter((word): word is string => !!word);
                if (tax.length > 0) {
                    sectionItem(LEGAL_ENTITY_SECTIONS[3], list(tax), ["legal-section-3"]);
                }
                break;
            }

            case AnswerType.BrandStyle: {
                const style = asBrandStyleValue(value);
                const colours = style.colours.map((colour, index) => ({ colour, label: colour.name.trim() || BRAND_COLOUR_SLOTS[index]?.label || "Colour " + (index + 1) }))
                    .filter(entry => entry.colour.enabled);
                if (colours.length === 0) {
                    sectionItem(BRAND_STYLE_SECTIONS[0], "a colour");
                }
                colours.filter(entry => normalizeHex(entry.colour.hex) === undefined)
                    .forEach(entry => sectionItem(BRAND_STYLE_SECTIONS[0], entry.label + "'s HEX"));
                const typefaces = style.typefaces.map((typeface, index) => ({ typeface, label: BRAND_TYPEFACE_SLOTS[index]?.label ?? "Typeface " + (index + 1) }))
                    .filter(entry => entry.typeface.enabled);
                if (typefaces.length === 0) {
                    sectionItem(BRAND_STYLE_SECTIONS[1], "a typeface");
                }
                typefaces.filter(entry => blank(entry.typeface.font))
                    .forEach(entry => sectionItem(BRAND_STYLE_SECTIONS[1], entry.label + " font"));
                const levels = BRAND_HIERARCHY_LEVELS.map(level => ({ level: style.hierarchy[level.id], label: level.label }))
                    .filter(entry => entry.level?.enabled);
                if (levels.length === 0) {
                    sectionItem(BRAND_STYLE_SECTIONS[2], "a text level");
                }
                levels.filter(entry => !(/^\d+$/.test(entry.level.size.trim()) && Number(entry.level.size.trim()) >= 8))
                    .forEach(entry => sectionItem(BRAND_STYLE_SECTIONS[2], entry.label + " size"));
                break;
            }

            case AnswerType.BrandInventory: {
                const inventory = asBrandInventoryValue(value);
                const marks = [!brandMarkFile(inventory.icon) && "icon", !brandMarkFile(inventory.logo) && "logo"]
                    .filter((word): word is string => !!word);
                if (marks.length > 0) {
                    sectionItem(BRAND_INVENTORY_SECTIONS[0], list(marks));
                }
                const images = inventory.images.filter(image => !!image.dataUrl).length;
                if (images < BRAND_IMAGE_MIN) {
                    sectionItem(BRAND_INVENTORY_SECTIONS[1], "at least " + BRAND_IMAGE_MIN + " images (" + images + " so far)");
                }
                break;
            }

            case AnswerType.BusinessFoundation: {
                const foundation = asBusinessFoundationValue(value);
                const named = foundation.segments.filter(segment => !blank(segment.name));
                if (!named.some(segment => segment.profiles.some(profile => !blank(profile.name)))) {
                    sectionItem(BUSINESS_FOUNDATION_SUBSECTIONS[0], named.length === 0 ? "a named Segment with a named Profile" : "a named Profile");
                }
                if (!foundation.segments.some(segment => segment.competitors.some(competitor => !blank(competitor.name)))) {
                    sectionItem(BUSINESS_FOUNDATION_SUBSECTIONS[1], "a named competitor or alternative");
                }
                named.filter(segment => blank(segment.valueProposition)).forEach(segment =>
                    add(segment.name.trim() + ": value proposition.", { key: key(sectionSegment(BUSINESS_FOUNDATION_SUBSECTIONS[2])), anchors: [segment.id] }));
                if (!foundation.segments.some(segment => segment.offerings.some(offering => !blank(offering.name)))) {
                    sectionItem(BUSINESS_FOUNDATION_SUBSECTIONS[3], "a named Offering");
                }
                break;
            }

            case AnswerType.BusinessEngagement: {
                const engagement = asBusinessEngagementValue(value);
                if (!engagement.segments.some(segment => segment.channels.some(channel => !blank(channel.name)))) {
                    sectionItem(BUSINESS_ENGAGEMENT_SECTIONS[0], "a named channel");
                }
                if (!engagement.segments.some(segment => segment.offerings.some(offering =>
                    offering.types.some(type => !blank(offering.typeDetail[type]?.purpose))))) {
                    sectionItem(BUSINESS_ENGAGEMENT_SECTIONS[1], "a relationship type with its purpose");
                }
                break;
            }

            case AnswerType.BusinessCapability: {
                const capability = asBusinessCapabilityValue(value);
                const [infrastructure, offering] = BUSINESS_CAPABILITY_SECTIONS.map(sectionSegment);
                const founderIds = capability.founders.filter(founder => !blank(founder.name)).map(founder => founder.id);
                if (founderIds.length === 0) {
                    sectionItem(BUSINESS_CAPABILITY_SECTIONS[0], "a founder (named on the Legal Entity)");
                }
                const withOffering = (entry: { name: string; offeringIds: string[] }) => !blank(entry.name) && entry.offeringIds.length > 0;
                if (!(capability.offering.resources.some(withOffering) || capability.offering.activities.some(withOffering) ||
                    capability.offering.professionals.some(withOffering) || capability.offering.providers.some(withOffering))) {
                    sectionItem(BUSINESS_CAPABILITY_SECTIONS[1], "a named resource, activity or partner linked to an Offering");
                }
                // Several founders: every activity needs one of them responsible.
                if (founderIds.length > 1) {
                    const activities = [
                        ...capability.activities.flatMap(category => category.activities).map(activity => ({ activity, rail: infrastructure })),
                        ...capability.offering.activities.map(activity => ({ activity, rail: offering }))
                    ];
                    activities.forEach(({ activity, rail }, index) => {
                        if (!activity.completed && !blank(activity.name) && !businessResponsibleId(activity, founderIds)) {
                            add((activity.name.trim() || "Activity " + (index + 1)) + ": responsible founder.",
                                { key: key(rail, activity.id), anchors: [activity.id] });
                        }
                    });
                }
                break;
            }

            case AnswerType.FinancialFoundation: {
                const financial = asFinancialFoundationValue(value);
                if (monthOrdinal(financial.planStart) === null) {
                    add("Plan Start: not chosen yet.", { key: key("plan-start") });
                }
                if (incomeTaxMissing(financial)) {
                    add("Income Tax: " + (financial.incomeTax === "rate" ? "rate not given yet." : "not chosen yet."), { key: key("income-tax") });
                }
                if (financial.funding.every(source => (parseAmount(source.amount) ?? 0) === 0) && Object.keys(financial.founderCapital).length === 0) {
                    sectionItem(FINANCIAL_FOUNDATION_SECTIONS[2], "a funding source with its amount, or the founders' capital");
                }
                break;
            }

            case AnswerType.FinancialSustainability: {
                if (asFinancialSustainabilityValue(value).streams.length === 0) {
                    sectionItem(FINANCIAL_SUSTAINABILITY_SECTIONS[0], "a revenue stream");
                }
                break;
            }

            case AnswerType.StrategyFoundation: {
                const foundation = asStrategyFoundationValue(value);
                if (blank(foundation.situation)) {
                    sectionItem(STRATEGY_FOUNDATION_SECTIONS[0], "not answered yet");
                }
                const quadrants = STRATEGY_SWOT_QUADRANTS.filter(quadrant => !(foundation.swot[quadrant.id] ?? []).some(entry => !blank(entry)))
                    .map(quadrant => quadrant.label.toLowerCase());
                if (quadrants.length > 0) {
                    sectionItem(STRATEGY_FOUNDATION_SECTIONS[1], list(quadrants));
                }
                if (blank(foundation.compass)) {
                    sectionItem(STRATEGY_FOUNDATION_SECTIONS[2], "not answered yet");
                }
                if (!isRangeSet(foundation.period)) {
                    sectionItem(STRATEGY_FOUNDATION_SECTIONS[3], "its start and end");
                }
                break;
            }

            case AnswerType.StrategicPeriod: {
                const strategy = session.getSections().find(candidate => candidate.answer?.type === AnswerType.StrategyFoundation);
                if (!strategy) {
                    break;
                }
                const themes = asStrategyFoundationValue(session.getResponse(strategy.number)).themes;
                const period = asStrategicPeriodValue(value);
                themes.filter(theme => !blank(theme.name)).forEach(theme => {
                    strategyGoalsForTheme(period, theme.id).forEach((goal, goalIndex) => {
                        if (blank(goal.name)) {
                            add(theme.name.trim() + ", Goal " + (goalIndex + 1) + ": name.", { key: key(theme.id, goal.id), anchors: [goal.id] });
                            return;
                        }
                        goal.objectives.forEach((objective, objectiveIndex) => {
                            const missing = [
                                blank(objective.name) && "name",
                                !isRangeSet(objective.period) && "period",
                                !objective.initiatives.some(entry => !blank(entry)) && "an initiative",
                                !objective.metrics.some(metric => !blank(metric.name)) && "a metric"
                            ].filter((word): word is string => !!word);
                            if (missing.length > 0) {
                                add((objective.name.trim() || goal.name.trim() + ", Objective " + (objectiveIndex + 1)) + ": " + list(missing) + ".",
                                    { key: key(theme.id, objective.id), anchors: [objective.id, goal.id] });
                            }
                        });
                    });
                });
                break;
            }

            default:
                // Any other page (a System's own editors): answered or
                // not, as the validator judges it.
                if (!validator.isPageComplete(session, section, resolveSharedValue)) {
                    add(pageStatus(session, section, resolveSharedValue) === "not-started" ? "not answered yet." : "not finished.");
                }

        }

    }

    return items;

}
