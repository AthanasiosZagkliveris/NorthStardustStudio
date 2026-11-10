/* Part of BusinessDocuments.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; BusinessDocuments.ts re-exports every part). */

import { stageOf } from "../BusinessStage.ts";
import { AnswerType } from "../../enums/AnswerType.ts";
import { type InterviewSession } from "../../interview";
import { STRATEGY_MONTH_NAMES, type ExportBlock, type ExportContext, type ExportImage, type LegalEntityValue, type StrategyMonthValue, asBrandInventoryValue, asBrandStyleValue, asBusinessEngagementValue, asLegalEntityValue, asStrategicPeriodValue, asStrategyFoundationValue, brandMarkFile, businessFoundationSegments, isExportableImage } from "../AnswerUtils.ts";
import { type ExportSectionContent } from "../ExportContentBuilder.ts";
import { sessionExportContext } from "../ExportContentBuilder.ts";
import { ownersTakeDrawings } from "../FinancialForecast.ts";
import { capabilityOf, costLines, heading, labelled } from "../ExportRenderers.ts";
import { planLength, withDemand, allFunding, asFinancialFoundationValue, asFinancialSustainabilityValue, financialPosition, fundingType, isNonCash, statusStanding, parseAmount, moneyFormatter, planMonthLabel, incomeTaxRate, assetUnitCostsOf, sustainability, withPlanStart, derivedPlanStart, legalExpenseDates, costStartDates, type CostLine, type RevenueStreamValue } from "../FinancialModel.ts";
import { calculatedLines } from "../CalculatedLines.ts";
import { launchNeedOf } from "../ContingencyFunds.ts";
import { asGlobalSettings, capitalisationLimitOf, stageDurationsOf } from "../GlobalSettings.ts";
import { countryCurrency } from "../LegalEntityJurisdictions.ts";
import { joinNames, preparedMonth, websiteOf } from "./plan.ts";

/** The four Foundation Systems as saved -- any may be missing. */
export interface FoundationSessions {
    identity?: InterviewSession | null;
    brand?: InterviewSession | null;
    business?: InterviewSession | null;
    strategy?: InterviewSession | null;
    /** The Organization's name as the app lists it. */
    organisationName: string;
    /** Its Global Settings as saved (the Opening Date is one): given, the forecast uses the calculated lines (CalculatedLines.ts); not given, it is as it was. */
    globalSettings?: unknown;
}

/* ==========================================================
   Reading the four Systems
========================================================== */

export const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function responseByType(session: InterviewSession | null | undefined, type: AnswerType): unknown {
    const section = session?.getFramework().sections.find(candidate => candidate.answer?.type === type);
    return section && session ? session.getResponse(section.number) : undefined;
}

function responseByTitle(session: InterviewSession | null | undefined, match: RegExp): Record<string, unknown> {
    const section = session?.getFramework().sections.find(candidate => match.test(candidate.title));
    const value = section && session ? session.getResponse(section.number) : undefined;
    return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

/**
 * The Strategy System's Current Situation, drafted from what the
 * Business System already records: what is sold and to whom, how
 * customers reach the organization, and how it is supported
 * financially. One line for each, in the founder's own figures and
 * names; "" when the Business System records none of it yet.
 */
export function currentSituationDraft(sessions: FoundationSessions): string {

    const f = readFoundation(sessions);
    const { format, outlook, position } = f;
    const joined = (items: string[]) => joinNames([...new Set(items.filter(Boolean))]);

    /* What is sold, and to whom: each Segment with its Offerings and prices. */
    const priced = (offeringId: string, name: string) => {
        const stream = f.revenuePage.streams.find(entry => entry.offeringId === offeringId);
        const price = stream ? parseAmount(stream.price) : null;
        if (!stream || price === null) {
            return name;
        }
        const per = stream.frequency === "monthly" ? "a month"
            : stream.frequency === "quarterly" ? "a quarter"
                : stream.frequency === "annually" ? "a year"
                    : "a " + (text(stream.unit === "Other" ? stream.unitOther : stream.unit) || "sale").toLowerCase();
        return name + " (" + format(price) + " " + per + ")";
    };
    const selling = f.segments
        .filter(segment => segment.offerings.some(offering => offering.name.trim()))
        .map(segment => "We sell " + joined(segment.offerings
            .filter(offering => offering.name.trim())
            .map(offering => priced(offering.id, offering.name.trim()))) +
            (segment.name.trim() ? " to " + segment.name.trim() : "") + ".");

    /* How customers find and reach it: the channels used for
       Discovery, Evaluation or Purchase (not delivery or support). */
    const reaching = ["discovery", "evaluation", "purchase"];
    const channels = joined(f.engagement.segments.flatMap(entry => entry.channels
        .filter(channel => channel.stages.length === 0 || channel.stages.some(stage => reaching.includes(stage)))
        .map(channel => channel.name.trim())));
    const reach = channels ? ["Customers find and reach us through " + channels + "."] : [];

    /* How it is supported financially. */
    const sought = allFunding(f.financial, f.legalEntity)
        .filter(source => !isNonCash(source) && statusStanding(source.status || "planned") !== "confirmed")
        .filter(source => (parseAmount(source.amount) ?? 0) > 0);
    const money: string[] = [];
    if (position.availableNow > 0.5) {
        money.push("We start with " + format(position.availableNow) + " in hand");
    }
    if (sought.length > 0) {
        money.push((money.length ? "and are seeking " : "We are seeking ") + joined(sought.map(source =>
            format(parseAmount(source.amount) ?? 0) + " (" + (source.name.trim() || fundingType(source.type)?.label || "funding") + ")")));
    }
    const finance: string[] = money.length ? [money.join(" ") + "."] : [];
    if (outlook.expectedRevenue > 0.5) {
        finance.push("At the normal level we expect " + format(outlook.expectedRevenue) + " a month in revenue, " +
            (outlook.breakEvenMonth === null
                ? "without breaking even within the plan."
                : "breaking even in " + planMonthLabel(f.financial.planStart, outlook.breakEvenMonth) + "."));
    }
    if (position.gap > 0.5) {
        finance.push("The plan still has a funding gap of " + format(position.gap) + ".");
    }

    return [...selling, ...reach, finance.join(" ")].filter(Boolean).join("\n");

}

/** The financial plan's first and last month, for the Strategic Period to be compared with. */
export function financialPlanRange(sessions: FoundationSessions): { start: StrategyMonthValue; end: StrategyMonthValue } | null {
    const f = readFoundation(sessions);
    const start = f.financial.planStart;
    const first = Number(start.year) * 12 + Number(start.month) - 1;
    if (!start.month || !start.year || !Number.isFinite(first)) {
        return null;
    }
    const last = first + planLength(f.financial) - 1;
    return {
        start: { month: start.month.padStart(2, "0"), year: start.year },
        end: { month: String(last % 12 + 1).padStart(2, "0"), year: String(Math.floor(last / 12)) }
    };
}

/** Everything the documents read, calculated once: also used by tests. */
export function readFoundation(sessions: FoundationSessions, options?: { wholeOnly?: boolean }) {

    const legalEntity: LegalEntityValue = asLegalEntityValue(responseByType(sessions.identity, AnswerType.LegalEntity));
    // Each founder's roles and profile: read through founderProfiles,
    // so a Legal Entity saved before the Founders Profile page existed
    // still gives its roles and experience.
    const foundersProfile = responseByType(sessions.identity, AnswerType.FoundersProfile);
    const currency = countryCurrency(legalEntity.organisation.country);
    // The documents are in whole amounts throughout.
    const format = moneyFormatter(currency, options);

    const settings = sessions.globalSettings === undefined ? undefined : asGlobalSettings(sessions.globalSettings);
    // The business stage: the documents' own, and what starts the Offering's O2 as its card shows it.
    const stage = stageOf(settings?.openingDate ?? "", new Date(), settings ? stageDurationsOf(settings) : undefined);

    const business: ExportContext = sessions.business
        ? sessionExportContext(sessions.business, { legalEntity, foundersProfile, currency, businessStage: stage })
        : { legalEntity, foundersProfile, currency, businessStage: stage };

    const strategy: ExportContext = sessions.strategy
        ? sessionExportContext(sessions.strategy, { legalEntity, foundersProfile, currency })
        : { legalEntity, foundersProfile, currency };

    const foundationValue = business.responseOf?.(AnswerType.BusinessFoundation);
    const segments = businessFoundationSegments(foundationValue);
    const capability = capabilityOf(business.responseOf?.(AnswerType.BusinessCapability), business);
    const engagement = asBusinessEngagementValue(business.responseOf?.(AnswerType.BusinessEngagement));

    const chosenFinancial = withPlanStart(asFinancialFoundationValue(business.responseOf?.(AnswerType.FinancialFoundation)));
    const financial = withPlanStart(chosenFinancial, undefined, derivedPlanStart(sessions.globalSettings === undefined ? "" : asGlobalSettings(sessions.globalSettings).openingDate, [...costStartDates(capability), ...legalExpenseDates(legalEntity)], chosenFinancial.planStart));
    const lines = costLines(financial, business);
    const revenuePage = withDemand(
        asFinancialSustainabilityValue(business.responseOf?.(AnswerType.FinancialSustainability)),
        asBusinessEngagementValue(business.responseOf?.(AnswerType.BusinessEngagement)).demand
    );
    // Where the owners take drawings rather than a salary, as the
    // forecast counts them (see FinancialForecast.ts).
    const drawings = ownersTakeDrawings(legalEntity.organisation.legalForm);

    const calculated = settings
        ? calculatedLines({ foundation: financial, revenuePage, lines, capability, settings, openingDate: settings.openingDate, drawings }, incomeTaxRate(financial))
        : undefined;
    // The cash to raise before the opening, which the Establishment need is (ContingencyFunds.ts).
    const launched = settings
        ? launchNeedOf(
            lines,
            { openingDate: settings.openingDate, capitalisationLimit: capitalisationLimitOf(settings), assetUnitCosts: assetUnitCostsOf(capability) },
            settings,
            Object.fromEntries(Object.entries(financial.classified).map(([id, entry]) => [id, entry.nature || undefined])),
            calculated
        )
        : undefined;

    const position = financialPosition(financial, lines, legalEntity, currency, format, revenuePage, launched?.launch);
    const outlook = sustainability(revenuePage, financial, lines, legalEntity, format);

    const name = text(legalEntity.organisation.name) || text(sessions.organisationName) || "The organisation";

    return {
        stage,
        legalEntity, foundersProfile, currency, format, drawings, business, strategy, foundationValue, segments,
        capability, engagement, financial, lines, position, revenuePage, outlook, name, calculated,
        definition: responseByTitle(sessions.identity, /^definition$/i),
        // (The six texts of Purpose, doc 45: the Values, Principles, Philosophy and Manifesto are saved in its section; the Mission and Vision in Definition.)
        ethics: responseByTitle(sessions.identity, /^purpose( & beliefs)?$/i),
        ambassador: responseByTitle(sessions.brand, /ambassador/i),
        brandStyle: asBrandStyleValue(responseByType(sessions.brand, AnswerType.BrandStyle)),
        brandStyleValue: responseByType(sessions.brand, AnswerType.BrandStyle),
        brandInventoryValue: asBrandStyleValue(responseByType(sessions.brand, AnswerType.BrandStyle)).inventory,
        strategyFoundation: asStrategyFoundationValue(strategy.responseOf?.(AnswerType.StrategyFoundation)),
        strategicPeriod: asStrategicPeriodValue(strategy.responseOf?.(AnswerType.StrategicPeriod))
    };

}

export type Foundation = ReturnType<typeof readFoundation>;

/** What one unit of a stream is: "project", "client". */
function streamUnit(stream: RevenueStreamValue): string {
    return (text(stream.unit === "Other" ? stream.unitOther : stream.unit) || "unit").toLowerCase();
}

/** "per project", "per client a month": how a stream is charged. */
export function perUnit(stream: RevenueStreamValue): string {
    const every = stream.frequency === "monthly" ? " a month"
        : stream.frequency === "quarterly" ? " a quarter"
            : stream.frequency === "annually" ? " a year" : "";
    return "per " + streamUnit(stream) + every;
}

/** "$2,500 per project"; "" without a price. */
export function priceText(stream: RevenueStreamValue | undefined, format: (amount: number) => string): string {
    const price = stream ? parseAmount(stream.price) : null;
    return stream && price !== null ? format(price) + " " + perUnit(stream) : "";
}

/** Founders' pay, as the documents name it: drawings for an owner who takes them. */
export function payWord(f: Foundation): string {
    return f.drawings ? "Owner's drawings" : "Salary";
}

/**
 * A cost line's name, with founders' pay named as the forecast counts
 * it: "Founder pay (owner's drawings)" -- a cost of running the model
 * on the canvas and in the costs, the owner's drawings in the
 * statements, and the one wording says both.
 */
export function costName(f: Foundation, line: CostLine): string {
    return f.drawings && line.sourcePath.includes("resource-group-founders")
        ? line.name.replace(/^Salary: /, "Founder pay (owner's drawings): ")
        : line.name;
}

/** "Jan": every date in the documents is written "Jan 2027". */
export function shortMonth(month: number): string {
    return (STRATEGY_MONTH_NAMES[month - 1] ?? "").slice(0, 3);
}

export function monthName(value: StrategyMonthValue): string {
    const m = Number(value.month);
    return m >= 1 && m <= 12 && value.year ? shortMonth(m) + " " + value.year : "";
}

/** The cover: who the document is for, when it was prepared, and where to find them. */
export function coverLines(f: Foundation): string[] {
    const website = websiteOf(f);
    return [
        "Organisation: " + f.name,
        "Prepared: " + preparedMonth(),
        ...(website ? ["Website: " + website] : [])
    ];
}

/**
 * The brand's pictures as the documents show them: the logo and the
 * icon (one file each, see brandMarkFile) and the brand images that
 * have a picture, each with what the Brand System says about it.
 * Only what was uploaded, and only as a data URL an export can carry
 * (isExportableImage) -- nothing, and no empty frame, where there is
 * nothing.
 */
export function brandPictures(inventoryValue: unknown): {
    logo?: ExportImage;
    icon?: ExportImage;
    markDescription: string;
    images: ExportImage[];
} {
    const inventory = asBrandInventoryValue(inventoryValue);
    const mark = (file: { dataUrl: string } | undefined, name: string): ExportImage | undefined =>
        file && isExportableImage(file.dataUrl) ? { src: file.dataUrl, alt: name, title: name } : undefined;
    return {
        logo: mark(brandMarkFile(inventory.logo), "Logo"),
        icon: mark(brandMarkFile(inventory.icon), "Icon"),
        markDescription: text(inventory.markDescription),
        images: inventory.images
            .filter(image => isExportableImage(image.dataUrl))
            .map((image, index) => ({
                src: image.dataUrl,
                alt: text(image.name) || "Brand image " + (index + 1),
                title: text(image.name) || undefined,
                caption: text(image.description) || undefined
            }))
    };
}

/**
 * The brand guide's pictures: the logo and icon side by side with
 * what they show beneath, then the brand images. A heading only over
 * pictures there are.
 */
export function brandGuidePictures(f: Foundation): ExportBlock[] {
    const pictures = brandPictures(f.brandInventoryValue);
    const marks = [pictures.logo, pictures.icon].filter((entry): entry is ExportImage => !!entry);
    return [
        ...(marks.length > 0 ? [
            heading("Logo & Icon", 2),
            { kind: "images" as const, items: marks, marks: true },
            ...labelled("Description", pictures.markDescription)
        ] : []),
        ...(pictures.images.length > 0 ? [
            heading("Brand Images", 2),
            { kind: "images" as const, items: pictures.images }
        ] : [])
    ];
}

export function section(number: number, title: string, blocks: ExportBlock[]): ExportSectionContent {
    return { number, title, blocks };
}

/** "Numbered list" answers ("1. Craft over speed\n2. …") as items. */
export function listItems(value: unknown): string[] {
    return text(value).split(/\r?\n/)
        .map(line => line.replace(/^\s*(\d+[.)]|[-•*])\s*/, "").trim())
        .filter(Boolean);
}
