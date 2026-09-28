/*
    The two documents the Foundation capability adds up to, built from
    what has been answered -- nothing is asked again:

    - the BUSINESS MODEL CANVAS, the nine blocks of the Business System
      read straight off its five pages;
    - the BUSINESS PLAN, a conventional plan drawn from all four
      Foundation Systems: Identity, Brand, Business and Strategy.

    Both are ExportContent, so Markdown and PDF write them exactly as
    they write a System, and the Business Documents page previews them
    with the same HTML the PDF prints.

    Assembled from fixed templates rather than written: every line can
    be traced to the answer it came from.
*/

import { AnswerType } from "../enums/AnswerType.ts";
import { demandResult, hasDemand } from "./DemandCapacity.ts";
import type { InterviewSession } from "../interview";
import {
    BUSINESS_ACTIVITY_CATEGORIES,
    BUSINESS_CHANNEL_ALL_OFFERINGS,
    BUSINESS_COMPETITOR_TYPES,
    BUSINESS_RELATIONSHIP_TYPES,
    BUSINESS_RESOURCE_GROUPS,
    BUSINESS_RESOURCE_STATUSES,
    BUSINESS_WORKSPACE_KINDS,
    STRATEGY_MONTH_NAMES,
    type BusinessPartnerValue,
    type ExportBlock,
    type ExportContext,
    type LegalEntityValue,
    type StrategyMonthValue,
    asBrandStyleValue,
    asBusinessEngagementValue,
    asLegalEntityValue,
    asStrategicPeriodValue,
    asStrategyFoundationValue,
    businessFoundationSegments,
    type StrategyMetricValue,
    businessFounderResponsibilities
} from "./AnswerUtils.ts";
import type { ExportContent, ExportSectionContent } from "./ExportContentBuilder.ts";
import { sessionExportContext } from "./ExportContentBuilder.ts";
import { financialForecast, forecastView, ownersTakeDrawings, type ForecastPeriod, type ForecastViewTable } from "./FinancialForecast.ts";
import {
    capabilityOf,
    costLines,
    demandBasis,
    details,
    financialFoundationBlocks,
    financialSustainabilityBlocks,
    heading,
    list,
    offeringName,
    offeringNames,
    capacityBlocks,
    brandInventoryBlocks,
    brandStyleBlocks,
    paragraph,
    table,
    titled
} from "./ExportRenderers.ts";
import {
    FUNDING_STATUSES,
    planLength,
    revenueModelLabel,
    planYears,
    withDemand,
    salesCapacity,
    allFunding,
    asFinancialFoundationValue,
    asFinancialSustainabilityValue,
    financialPosition,
    fundingStanding,
    fundingType,
    isNonCash,
    isScheduled,
    paidBeforePlan,
    scheduledAmount,
    statusStanding,
    monthlyEquivalent,
    parseAmount,
    moneyFormatter,
    planMonthLabel,
    spentBeforePlan,
    sustainability,
    withPlanStart,
    type CostLine,
    type RevenueStreamValue
} from "./FinancialModel.ts";
import { COUNTRIES, countryCurrency, jurisdictionProfile } from "./LegalEntityJurisdictions.ts";

/** The four Foundation Systems as saved -- any may be missing. */
export interface FoundationSessions {
    identity?: InterviewSession | null;
    brand?: InterviewSession | null;
    business?: InterviewSession | null;
    strategy?: InterviewSession | null;
    /** The Organization's name as the app lists it. */
    organisationName: string;
}

/* ==========================================================
   Reading the four Systems
========================================================== */

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

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
export function readFoundation(sessions: FoundationSessions) {

    const legalEntity: LegalEntityValue = asLegalEntityValue(responseByType(sessions.identity, AnswerType.LegalEntity));
    const currency = countryCurrency(legalEntity.organisation.country);
    const format = moneyFormatter(currency);

    const business: ExportContext = sessions.business
        ? sessionExportContext(sessions.business, { legalEntity, currency })
        : { legalEntity, currency };

    const strategy: ExportContext = sessions.strategy
        ? sessionExportContext(sessions.strategy, { legalEntity, currency })
        : { legalEntity, currency };

    const foundationValue = business.responseOf?.(AnswerType.BusinessFoundation);
    const segments = businessFoundationSegments(foundationValue);
    const capability = capabilityOf(business.responseOf?.(AnswerType.BusinessCapability), business);
    const engagement = asBusinessEngagementValue(business.responseOf?.(AnswerType.BusinessEngagement));

    const financial = withPlanStart(asFinancialFoundationValue(business.responseOf?.(AnswerType.FinancialFoundation)));
    const lines = costLines(financial, business);
    const revenuePage = withDemand(
        asFinancialSustainabilityValue(business.responseOf?.(AnswerType.FinancialSustainability)),
        asBusinessEngagementValue(business.responseOf?.(AnswerType.BusinessEngagement)).demand
    );
    const position = financialPosition(financial, lines, legalEntity, currency, format, revenuePage);
    const outlook = sustainability(revenuePage, financial, lines, legalEntity, format);

    const name = text(legalEntity.organisation.name) || text(sessions.organisationName) || "The organization";

    // Where the owners take drawings rather than a salary, as the
    // forecast counts them (see FinancialForecast.ts).
    const drawings = ownersTakeDrawings(legalEntity.organisation.legalForm);

    return {
        legalEntity, currency, format, drawings, business, strategy, foundationValue, segments,
        capability, engagement, financial, lines, position, revenuePage, outlook, name,
        definition: responseByTitle(sessions.identity, /^definition$/i),
        ethics: responseByTitle(sessions.identity, /^ethics$/i),
        ambassador: responseByTitle(sessions.brand, /ambassador/i),
        brandStyle: asBrandStyleValue(responseByType(sessions.brand, AnswerType.BrandStyle)),
        brandStyleValue: responseByType(sessions.brand, AnswerType.BrandStyle),
        brandInventoryValue: responseByType(sessions.brand, AnswerType.BrandInventory),
        strategyFoundation: asStrategyFoundationValue(strategy.responseOf?.(AnswerType.StrategyFoundation)),
        strategicPeriod: asStrategicPeriodValue(strategy.responseOf?.(AnswerType.StrategicPeriod))
    };

}

type Foundation = ReturnType<typeof readFoundation>;

/** What one unit of a stream is: "project", "client". */
function streamUnit(stream: RevenueStreamValue): string {
    return (text(stream.unit === "Other" ? stream.unitOther : stream.unit) || "unit").toLowerCase();
}

/** "per project", "per client a month": how a stream is charged. */
function perUnit(stream: RevenueStreamValue): string {
    const every = stream.frequency === "monthly" ? " a month"
        : stream.frequency === "quarterly" ? " a quarter"
            : stream.frequency === "annually" ? " a year" : "";
    return "per " + streamUnit(stream) + every;
}

/** "$2,500 per project"; "" without a price. */
function priceText(stream: RevenueStreamValue | undefined, format: (amount: number) => string): string {
    const price = stream ? parseAmount(stream.price) : null;
    return stream && price !== null ? format(price) + " " + perUnit(stream) : "";
}

/** Founders' pay, as the documents name it: drawings for an owner who takes them. */
function payWord(f: Foundation): string {
    return f.drawings ? "Owner's drawings" : "Salary";
}

/** A cost line's name, with founders' pay named as the forecast counts it. */
function costName(f: Foundation, line: CostLine): string {
    return f.drawings && line.sourcePath.includes("resource-group-founders")
        ? line.name.replace(/^Salary: /, "Owner's drawings: ")
        : line.name;
}

/** "Jan": every date in the documents is written "Jan 2027". */
function shortMonth(month: number): string {
    return (STRATEGY_MONTH_NAMES[month - 1] ?? "").slice(0, 3);
}

function monthName(value: StrategyMonthValue): string {
    const m = Number(value.month);
    return m >= 1 && m <= 12 && value.year ? shortMonth(m) + " " + value.year : "";
}

/** The cover: who the document is for, when it was prepared, and where to find them. */
function coverLines(f: Foundation): string[] {
    const website = websiteOf(f);
    return [
        "Organization: " + f.name,
        "Prepared: " + preparedMonth(),
        ...(website ? ["Website: " + website] : [])
    ];
}

function section(number: number, title: string, blocks: ExportBlock[]): ExportSectionContent {
    return { number, title, blocks };
}

/** "Numbered list" answers ("1. Craft over speed\n2. …") as items. */
function listItems(value: unknown): string[] {
    return text(value).split(/\r?\n/)
        .map(line => line.replace(/^\s*(\d+[.)]|[-•*])\s*/, "").trim())
        .filter(Boolean);
}

/* ==========================================================
   The Business Model Canvas
========================================================== */

export const CANVAS_BLOCKS = [
    { id: "partners", title: "Key Partners" },
    { id: "activities", title: "Key Activities" },
    { id: "resources", title: "Key Resources" },
    { id: "propositions", title: "Value Propositions" },
    { id: "relationships", title: "Customer Relationships" },
    { id: "channels", title: "Channels" },
    { id: "segments", title: "Customer Segments" },
    { id: "costs", title: "Cost Structure" },
    { id: "revenue", title: "Revenue Streams" }
] as const;

type CanvasBlockId = typeof CANVAS_BLOCKS[number]["id"];

/** The canvas as its nine lists -- for the page's own nine-box drawing. */
export function businessModelCanvasData(sessions: FoundationSessions): {
    name: string;
    blocks: Record<CanvasBlockId, string[]>;
} {

    const f = readFoundation(sessions);
    const { capability, format } = f;

    const partners = [
        ...capability.professionals.filter(isEngaged).map(partner => partner.name + " (professional)"),
        ...capability.providers.filter(isEngaged).map(partner => partner.name + " (provider)"),
        ...capability.offering.professionals.map(partner =>
            partner.name + " (for " + (offeringNames(f.foundationValue, partner.offeringIds) || "an Offering") + ")"),
        ...capability.offering.providers.map(partner =>
            partner.name + " (for " + (offeringNames(f.foundationValue, partner.offeringIds) || "an Offering") + ")")
    ].filter(entry => !entry.startsWith(" "));

    const activities = [
        ...capability.activities.flatMap(category => category.activities
            .filter(activity => !activity.completed && activity.name.trim())
            .map(activity => activity.name.trim() + " (" +
                (BUSINESS_ACTIVITY_CATEGORIES.find(entry => entry.id === category.id)?.label ?? "Other") + ")")),
        ...capability.offering.activities
            .filter(activity => !activity.completed && activity.name.trim())
            .map(activity => activity.name.trim())
    ];

    const resourceNames = BUSINESS_RESOURCE_GROUPS.flatMap(group => (capability.resources[group.id] ?? [])
        .flatMap(subsection => subsection.slots.map(slot => slot.name.trim())).filter(Boolean));

    const resources = [
        ...capability.founders.map(founder =>
            founder.name + (founder.roles.filter(Boolean).length ? " (" + founder.roles.filter(Boolean).join(", ") + ")" : "")),
        ...(capability.workspace.kind
            ? [BUSINESS_WORKSPACE_KINDS.find(kind => kind.id === capability.workspace.kind)?.label ?? capability.workspace.kindOther]
            : []),
        ...resourceNames,
        ...capability.offering.resources.map(slot => slot.name.trim()).filter(Boolean)
    ];

    const propositions = f.segments
        .filter(segment => text(segment.valueProposition))
        .map(segment => (f.segments.length > 1 ? segment.name.trim() + ": " : "") + text(segment.valueProposition));

    const relationships = f.engagement.segments.flatMap(entry => {
        const segment = f.segments.find(candidate => candidate.id === entry.segmentId);
        return entry.offerings.flatMap(relationship => relationship.types.map(typeId => {
            const offering = segment?.offerings.find(candidate => candidate.id === relationship.offeringId)?.name.trim() ?? "";
            const type = BUSINESS_RELATIONSHIP_TYPES.find(candidate => candidate.id === typeId)?.label ?? typeId;
            return offering + ": " + type;
        })).filter(line => !line.startsWith(": "));
    });

    const channels = [...new Set(f.engagement.segments.flatMap(entry =>
        entry.channels.filter(channel => channel.name.trim()).map(channel => channel.name.trim() + " (" + channel.category + ")")))];

    const segments = f.segments.map(segment =>
        segment.name.trim() + (segment.profiles.some(profile => profile.name.trim())
            ? ": " + segment.profiles.map(profile => profile.name.trim()).filter(Boolean).join(", ")
            : ""));

    const counted = f.lines.filter(line => line.counted && line.amount !== null);
    // One-time costs within the plan, as the Funding Need counts them:
    // what was paid before it is already spent.
    const oneTime = counted
        .filter(line => line.frequency === "one-time" && !paidBeforePlan(line, f.financial.planStart))
        .reduce((sum, line) => sum + scheduledAmount(line), 0);
    const largest = [...counted]
        .filter(line => isScheduled(line))
        .map(line => ({ line, monthly: line.frequency === "one-time" ? 0 : monthlyEquivalent(line.amount ?? 0, line.frequency) }))
        .filter(entry => entry.monthly > 0)
        .sort((a, b) => b.monthly - a.monthly)
        .slice(0, 5);

    const costs = [
        "Fixed costs: " + format(f.outlook.inputs.fixed) + " a month",
        ...(oneTime > 0 ? ["One-time costs in the plan: " + format(oneTime)] : []),
        ...largest.map(entry => costName(f, entry.line) + " (" + format(entry.monthly) + " a month)"),
        ...f.outlook.streams.filter(entry => entry.variable > 0.005)
            .map(entry => "Variable costs: " + format(entry.variable) + " per unit (" + (offeringName(f.foundationValue, entry.stream.offeringId) || "an Offering") + ")")
    ];

    const revenue = [
        ...f.outlook.streams.map(entry =>
            (offeringName(f.foundationValue, entry.stream.offeringId) || "Revenue stream") + ": " +
            (revenueModelLabel(entry.stream) || "model not set") +
            ", " + format(entry.revenue) + " a month"),
        ...(f.outlook.streams.length > 0 ? ["Expected revenue: " + format(f.outlook.expectedRevenue) + " a month at the normal level"] : [])
    ];

    return {
        name: f.name,
        blocks: {
            partners, activities, resources, propositions, relationships,
            channels, segments, costs, revenue
        }
    };

}

export function businessModelCanvas(sessions: FoundationSessions): ExportContent {

    const data = businessModelCanvasData(sessions);

    return {
        systemNumber: "3",
        // Also the download's file name, so no colon.
        systemName: "Business Model Canvas " + data.name,
        capability: "Foundation",
        documentTitle: "Business Model Canvas: " + data.name,
        documentSubtitle: "Drawn from the Business System: Foundation, Customer Engagement, Infrastructure & Capability, Financial Foundation and Financial Sustainability.",
        sections: CANVAS_BLOCKS.map((block, index) => section(index + 1, block.title,
            data.blocks[block.id].length > 0 ? list(data.blocks[block.id]) : paragraph("Not answered yet.")))
    };

}

/* ==========================================================
   The Business Plan
========================================================== */

function executiveSummary(f: Foundation): ExportBlock[] {

    const organisation = f.legalEntity.organisation;
    const country = COUNTRIES.find(entry => entry.code === organisation.country)?.name ?? "";
    const place = [text(organisation.city), country].filter(Boolean).join(", ");
    const founders = f.legalEntity.founders.filter(founder => founder.name.trim()).map(founder => founder.name.trim());
    const offerings = f.segments.flatMap(segment => segment.offerings.map(offering => offering.name.trim())).filter(Boolean);
    const segments = f.segments.map(segment => segment.name.trim()).filter(Boolean);
    const { format, position, outlook } = f;

    const form = legalFormOf(f.legalEntity) ? legalFormPhrase(legalFormOf(f.legalEntity)) : "";

    // "X, a private company, based in London, was founded by A and B."
    // or, with no founders named, "X is a private company based in London."
    const opening = founders.length
        ? f.name + (form ? ", " + form : "") + (place ? ", based in " + place : "") + (form || place ? "," : "") +
            " was founded by " + joinNames(founders) + "."
        : form || place
            ? f.name + " is " + (form ? form + (place ? " based in " + place : "") : "based in " + place) + "."
            : "";

    const offer = offerings.length
        ? (opening ? "It" : f.name) + " offers " + joinNames(offerings) + (segments.length ? " to " + joinNames(segments) : "") + "."
        : "";

    const money = position.need > 0
        ? "The plan needs " + format(position.need) + " of funding; " + format(position.availableNow + position.confirmedFuture) +
            " is available or confirmed" + (position.gap > 0.005 ? ", leaving a gap of " + format(position.gap) + "." : ", covering the requirement.")
        : "";

    const revenue = outlook.expectedRevenue > 0
        ? "Revenue is expected to reach " + format(outlook.expectedRevenue) + " a month against fixed costs of " +
            format(outlook.inputs.fixed) + " a month" +
            (outlook.breakEvenMonth !== null ? ", breaking even in " + planMonthLabel(f.financial.planStart, outlook.breakEvenMonth) + "." : ".")
        : "";

    return [
        ...paragraph([opening, offer].filter(Boolean).join(" ")),
        ...paragraph(text(f.definition.mission), "Mission"),
        ...paragraph(text(f.definition.vision), "Vision"),
        ...paragraph([money, revenue].filter(Boolean).join(" "), "Financial outlook"),
        ...paragraph(outlook.signals[0] ? outlook.signals[0].text : "", outlook.signals[0]?.title),
        ...paragraph(f.strategyFoundation.compass, "Direction")
    ];

}

/** The legal form as chosen, or as typed when it is not listed. */
function legalFormOf(legalEntity: LegalEntityValue): string {
    const organisation = legalEntity.organisation;
    return text(organisation.legalForm === "Other (not listed)" ? organisation.legalFormOther : organisation.legalForm);
}

/** "Dedicated Workspace (Costs)", or whichever of the two is there. */
function withNote(main: string, note: string): string {
    return main && note ? main + " (" + note + ")" : main || note;
}

/**
 * A legal form as it reads mid-sentence, with its article: "a private
 * company limited by shares", "an LLC", "a GmbH". Words that are
 * capitalized only because the form is a title are lowercased;
 * abbreviations keep their capitals.
 */
function legalFormPhrase(legalForm: string): string {
    const form = legalForm.replace(/\s*\(.*\)$/, "")
        .replace(/\b([A-Z])([a-z]+)\b/g, (_, first: string, rest: string) => first.toLowerCase() + rest);
    const abbreviation = /^[A-Z]{2,}\b/.test(form);
    const vowelSound = abbreviation ? /^[AEFHILMNORSX]/.test(form) : /^[aeiou]/i.test(form);
    return (vowelSound ? "an " : "a ") + form;
}

function joinNames(names: string[]): string {
    return names.length <= 1 ? names.join("") : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
}

/** Prose that may run to several paragraphs, one block each. */
function paragraphs(value: unknown): ExportBlock[] {
    return text(value).split(/\r?\n\s*\n?/).flatMap(part => paragraph(part));
}

/** The whole address, state and country included. */
function fullAddress(f: Foundation): string {
    const organisation = f.legalEntity.organisation;
    const country = COUNTRIES.find(entry => entry.code === organisation.country)?.name ?? organisation.country;
    return [organisation.addressLine1, organisation.addressLine2, organisation.city,
        [organisation.subdivision, organisation.postalCode].map(text).filter(Boolean).join(" "), country]
        .map(text).filter(Boolean).join(", ");
}

/** "2026-08-17" as "Aug 2026", as every date in the documents is written. */
function isoMonth(value: string): string {
    const match = /^(\d{4})-(\d{2})/.exec(text(value));
    return match ? shortMonth(Number(match[2])) + " " + match[1] : text(value);
}

/** The licences and registrations the Legal Entity records: tax, sales tax, registration, requirements. */
function licenceItems(f: Foundation): string[] {
    const entity = f.legalEntity;
    const profile = jurisdictionProfile(entity.organisation.country);
    const taxName = profile.consumptionTax || "Consumption tax";
    return [
        text(entity.tax.identificationNumber)
            ? "Tax identification number" + (profile.taxIdName ? " (" + profile.taxIdName + ")" : "") + ": " + text(entity.tax.identificationNumber)
            : "",
        entity.tax.consumptionTaxStatus === "yes"
            ? taxName + ": registered" + (text(entity.tax.consumptionTaxNumber) ? " (" + text(entity.tax.consumptionTaxNumber) + ")" : "")
            : entity.tax.consumptionTaxStatus === "no" ? taxName + ": not registered" : "",
        text(entity.formation.registrationNumber)
            ? "Registration number: " + text(entity.formation.registrationNumber) +
                (text(entity.formation.authority) ? " (" + text(entity.formation.authority) + ")" : "")
            : "",
        ...entity.formation.additionalNumbers.map(entry => text(entry.number) ? (text(entry.label) || "Number") + ": " + text(entry.number) : ""),
        ...entity.tax.additionalRegistrations.map(entry => text(entry.number) ? (text(entry.label) || "Registration") + ": " + text(entry.number) : ""),
        ...entity.requirements.map(requirement => text(requirement.name)
            ? text(requirement.name) + (text(requirement.reference) ? ": " + text(requirement.reference) : "")
            : "")
    ].filter(Boolean);
}

function companyBlocks(f: Foundation): ExportBlock[] {
    const organisation = f.legalEntity.organisation;
    return [
        ...paragraph(text(f.definition.description)),
        ...titled("Manifesto", paragraphs(f.ethics.manifesto)),
        ...titled("Legal Structure", details([
            ["Legal name", organisation.name],
            ["Legal form", legalFormOf(f.legalEntity)],
            ["Formation date", isoMonth(f.legalEntity.formation.date)],
            // Registered once a number or a date says so; the authority
            // alone is only where it would be registered.
            ["Registered", text(f.legalEntity.formation.registrationNumber) || text(f.legalEntity.formation.date)
                ? [f.legalEntity.formation.authority, f.legalEntity.formation.registrationNumber].filter(Boolean).join(" ")
                : ""],
            ["Registration", f.legalEntity.formation.status === "planned"
                ? "Not yet registered" + (text(f.legalEntity.formation.authority) ? "; to be registered with " + text(f.legalEntity.formation.authority) : "")
                : ""],
            ["Address", fullAddress(f)],
            ["Main activity", organisation.mainActivity]
        ])),
        ...titled("Licences and Registrations", list(licenceItems(f))),
        ...titled("Values and Principles", [
            ...paragraph(text(f.ethics.philosophy), "Philosophy"),
            ...list(listItems(f.ethics.values)),
            ...list(listItems(f.ethics.principles), true)
        ])
    ];
}

function marketBlocks(f: Foundation): ExportBlock[] {
    return [
        ...paragraph(text(f.definition.positioning), "Positioning"),
        ...f.segments.flatMap((segment, index) => [
            heading("Segment " + (index + 1) + ": " + (segment.name.trim() || "Unnamed segment")),
            ...paragraph(segment.description.demographics ?? "", "Who"),
            ...paragraph(segment.description.geographics ?? "", "Where"),
            ...paragraph(segment.description["market-size"] ?? "", "Market size"),
            ...table(["Profile", "Goals", "Challenges", "Needs"], segment.profiles.map(profile => [
                profile.name,
                profile.goals,
                profile.challenges,
                profile.needs.functional.filter(Boolean).join("; ")
            ])),
            ...table(["Competitor", "Type", "Strengths", "Weaknesses"], segment.competitors.map(competitor => [
                competitor.name,
                BUSINESS_COMPETITOR_TYPES.find(type => type.id === competitor.type)?.label ?? "",
                competitor.strengths,
                competitor.weaknesses
            ])),
            ...list(segment.competitors.map(competitor => text(competitor.insights)))
        ])
    ];
}

function offeringBlocks(f: Foundation): ExportBlock[] {
    return f.segments.flatMap(segment => [
        heading("For " + (segment.name.trim() || "Unnamed segment")),
        ...paragraph(segment.valueProposition, "Value proposition"),
        ...table(["Offering", "Type", "What it does", "Customer benefit", "Price", "Pricing model"], segment.offerings.map(offering => {
            const stream = f.revenuePage.streams.find(entry => entry.offeringId === offering.id);
            return [
                offering.name, offering.category, offering.description.function ?? "", offering.description.benefit ?? "",
                priceText(stream, f.format), stream ? revenueModelLabel(stream) : ""
            ];
        }))
    ]);
}

function marketingBlocks(f: Foundation): ExportBlock[] {
    const bySegment = f.engagement.segments.flatMap(entry => {
        const segment = f.segments.find(candidate => candidate.id === entry.segmentId);
        const offering = (id: string) => segment?.offerings.find(candidate => candidate.id === id)?.name.trim() ?? "";
        return [
            heading(segment?.name.trim() || "Segment"),
            ...table(["Channel", "Category", "Carries", "Used for"], entry.channels.filter(channel => channel.name.trim()).map(channel => [
                channel.name,
                channel.category,
                channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) ? "All Offerings" : channel.offerings.map(offering).filter(Boolean).join(", "),
                channel.stages.map(stage => stage.charAt(0).toUpperCase() + stage.slice(1)).join(", ")
            ])),
            ...list(entry.offerings.flatMap(relationship => relationship.types.map(typeId => {
                const type = BUSINESS_RELATIONSHIP_TYPES.find(candidate => candidate.id === typeId)?.label ?? typeId;
                const purpose = text(relationship.typeDetail[typeId]?.purpose);
                return purpose
                    ? offering(relationship.offeringId) + " (" + type + "): " + purpose
                    : offering(relationship.offeringId) + ": " + type;
            })))
        ];
    });

    /* The sales forecast's basis: how each Offering's customers come. */
    const forecast = Object.entries(f.engagement.demand).filter(([, entry]) => hasDemand(entry)).map(([offeringId, entry]) => {
        const result = demandResult(entry);
        const basis = demandBasis(result, entry.assumptions);
        return (offeringName(f.foundationValue, offeringId) || "An Offering") + ": " +
            (result.expected === null ? "demand not yet estimated." : result.working) +
            (basis ? " " + basis : "");
    });
    return [
        ...bySegment,
        ...(forecast.length > 0 ? [heading("Expected Sales"), ...list(forecast)] : []),
        ...brandVoiceBlocks(f)
    ];
}

/** The Brand Ambassador: how the brand looks, carries itself and speaks, and what it leaves behind. */
function brandVoiceBlocks(f: Foundation): ExportBlock[] {
    // The answers are free text that may carry labels of their own
    // ("First impression: …"), so each goes under a heading.
    const parts = ([
        ["Aesthetics", f.ambassador.aesthetics],
        ["Attitude & Body Language", f.ambassador["attitude-body-language"]],
        ["Communication & Voice", f.ambassador["communication-voice"]],
        ["Imprint", f.ambassador.imprint]
    ] as [string, unknown][]).flatMap(([title, value]) => text(value) ? [heading(title, 2), ...paragraphs(value)] : []);
    return parts.length > 0 ? [heading("Brand & Voice"), ...parts] : [];
}

/**
 * A partner the founder has actually taken on: named, and described,
 * priced or linked to an Offering. The template's named but untouched
 * cards (Accountant, Lawyer) are suggestions, not partners.
 */
function isEngaged(person: BusinessPartnerValue): boolean {
    return person.name.trim().length > 0 && (
        text(person.description).length > 0 ||
        parseAmount(person.cost.price) !== null ||
        person.offeringIds.length > 0
    );
}

function operationsBlocks(f: Foundation): ExportBlock[] {
    const { capability } = f;
    const people = [...capability.professionals, ...capability.providers, ...capability.offering.professionals, ...capability.offering.providers];
    // Once, here: the Financial Plan leaves it out.
    const capacity = capacityBlocks(salesCapacity(f.revenuePage, f.financial, capability), f.financial.planStart, 1);
    return [
        ...titled("Workspace", paragraph(withNote(
            BUSINESS_WORKSPACE_KINDS.find(kind => kind.id === capability.workspace.kind)?.label ?? "",
            BUSINESS_RESOURCE_STATUSES.find(status => status.id === capability.workspace.status)?.label ?? ""
        ))),
        ...titled("Key Resources", list(BUSINESS_RESOURCE_GROUPS.flatMap(group => (capability.resources[group.id] ?? [])
            .flatMap(subsection => subsection.slots.filter(slot => slot.name.trim()).map(slot =>
                slot.name.trim() + (slot.quantity ? " × " + slot.quantity : "") + " (" +
                (BUSINESS_RESOURCE_STATUSES.find(status => status.id === slot.status)?.label ?? "status not set") + ")"))))),
        ...titled("Key Activities", table(["Activity", "Category", "State"], capability.activities.flatMap(category => category.activities
            .filter(activity => activity.name.trim())
            .map(activity => [
                activity.name,
                BUSINESS_ACTIVITY_CATEGORIES.find(entry => entry.id === category.id)?.label ?? "Other",
                activity.completed ? "Completed" : "Planned"
            ])))),
        ...titled("Partners and Providers", list(people.filter(isEngaged)
            .map(person => person.name.trim() + (text(person.description) ? ": " + text(person.description) : "")))),
        ...capacity
    ];
}

function teamBlocks(f: Foundation): ExportBlock[] {
    const { capability, format } = f;
    const withCapital = f.legalEntity.founders.some(founder => parseAmount(founder.capital) !== null);
    return table(["Founder", "Ownership", ...(withCapital ? ["Capital"] : []), "Roles", "Responsible for"], f.legalEntity.founders
        .filter(founder => founder.name.trim())
        .map(founder => {
            const salary = capability.founders.find(entry => entry.id === founder.id)?.salary ?? "";
            return [
                founder.name + (parseAmount(salary) !== null
                    ? " (" + payWord(f).toLowerCase() + " " + format(parseAmount(salary) ?? 0) + " a month)"
                    : ""),
                founder.ownership ? founder.ownership + "%" : "",
                ...(withCapital ? [parseAmount(founder.capital) !== null ? format(parseAmount(founder.capital) ?? 0) : ""] : []),
                founder.roles.filter(Boolean).join(", "),
                businessFounderResponsibilities(capability, founder.id)
                    .filter(entry => !entry.completed).map(entry => entry.name).join("; ")
            ];
        }));
}

/** A Metric's figure in its unit: "$15,000", "40%", "12 clients". */
function metricValue(metric: StrategyMetricValue, value: string, format: (amount: number) => string): string {
    const amount = parseAmount(value);
    if (!text(value)) {
        return "";
    }
    if (metric.unit === "Currency" && amount !== null) {
        return format(amount);
    }
    if (metric.unit === "Percentage") {
        return text(value) + "%";
    }
    const unit = metric.unit === "Custom" ? text(metric.customUnit) : "";
    return text(value) + (unit ? " " + unit : "");
}

function strategyBlocks(f: Foundation): ExportBlock[] {
    const foundation = f.strategyFoundation;
    const period = foundation.period;
    const owner = (id: string) => f.legalEntity.founders.find(founder => founder.id === id)?.name ?? "";
    const range = (value: { start: StrategyMonthValue; end: StrategyMonthValue }) =>
        [monthName(value.start), monthName(value.end)].filter(Boolean).join(" – ");
    const bullets = (items: string[] | undefined) => (items ?? []).map(text).filter(Boolean).map(item => "• " + item).join("\n");

    /* Every Objective, numbered as the Strategy System numbers them. */
    const objectives = foundation.themes.flatMap((theme, themeIndex) =>
        (f.strategicPeriod.goalsByTheme[theme.id] ?? []).flatMap((goal, goalIndex) => goal.objectives.map((objective, objectiveIndex) => ({
            theme, goal, objective,
            number: (themeIndex + 1) + "." + (goalIndex + 1) + "." + (objectiveIndex + 1)
        }))));

    /* The Roadmap: Objectives by the quarter they start in. */
    const quarters = new Map<string, { order: number; items: string[] }>();
    objectives.forEach(({ objective, number }) => {
        const m = Number(objective.period.start.month);
        const y = Number(objective.period.start.year);
        if (!(m >= 1 && m <= 12 && y)) {
            return;
        }
        const q = Math.floor((m - 1) / 3);
        const key = shortMonth(q * 3 + 1) + " – " + shortMonth(q * 3 + 3) + " " + y;
        const entry = quarters.get(key) ?? { order: y * 4 + q, items: [] };
        entry.items.push(number + " " + objective.name + (monthName(objective.period.end) ? " (to " + monthName(objective.period.end) + ")" : ""));
        quarters.set(key, entry);
    });

    return [
        ...titled("Current Situation", paragraphs(foundation.situation)),
        ...paragraph(range(period), "Strategic period"),
        ...paragraph(foundation.compass, "Strategic compass"),
        ...titled("SWOT Analysis", table(["", "Helpful", "Harmful"], [
            ["Internal", bullets(foundation.swot.strengths), bullets(foundation.swot.weaknesses)],
            ["External", bullets(foundation.swot.opportunities), bullets(foundation.swot.threats)]
        ].filter(row => row[1] || row[2]))),
        ...titled("Strategic Themes", table(["Theme", "Description"], foundation.themes.map((theme, index) => [
            (index + 1) + ". " + theme.name, theme.description
        ]))),
        ...titled("Goals and Objectives", foundation.themes.flatMap((theme, themeIndex) => {
            const goals = f.strategicPeriod.goalsByTheme[theme.id] ?? [];
            return goals.length === 0 ? [] : [
                heading((themeIndex + 1) + ". " + (theme.name || "Unnamed theme"), 2),
                ...goals.flatMap((goal, goalIndex) => [
                    ...(text(goal.description)
                        ? paragraph(goal.description, (themeIndex + 1) + "." + (goalIndex + 1) + " " + (goal.name || "Unnamed goal"))
                        : paragraph((themeIndex + 1) + "." + (goalIndex + 1) + " " + (goal.name || "Unnamed goal"))),
                    ...table(["Objective", "When", "Owner", "Description", "Initiatives"], goal.objectives.map((objective, objectiveIndex) => [
                        (themeIndex + 1) + "." + (goalIndex + 1) + "." + (objectiveIndex + 1) + " " + objective.name,
                        range(objective.period),
                        owner(objective.ownerId),
                        objective.description,
                        bullets(objective.initiatives)
                    ]))
                ])
            ];
        })),
        ...titled("Key Performance Indicators", table(["Metric", "Baseline", "Target", "Frequency", "Owner"],
            objectives.flatMap(({ objective }) => objective.metrics.map(metric => [
                metric.name,
                metricValue(metric, metric.baseline, f.format),
                metricValue(metric, metric.target, f.format),
                metric.frequency,
                owner(objective.ownerId)
            ])))),
        ...titled("Roadmap", table(["Starting", "Objectives"], [...quarters.entries()]
            .sort((a, b) => a[1].order - b[1].order)
            .map(([key, entry]) => [key, entry.items.join("\n")])))
    ];
}

function riskBlocks(f: Foundation): ExportBlock[] {
    // Both Financial pages raise some of the same signals ("Funding
    // Dependency"): each is said once, here.
    const byTitle = new Map<string, { title: string; text: string }>();
    [...f.position.signals, ...f.outlook.signals]
        .filter(signal => signal.tone === "risk" || signal.tone === "caution")
        .forEach(signal => {
            if (!byTitle.has(signal.title)) {
                byTitle.set(signal.title, signal);
            }
        });
    const signals = [...byTitle.values()];
    return [
        ...titled("External Threats", list(f.strategyFoundation.swot.threats ?? [])),
        ...titled("Internal Weaknesses", list(f.strategyFoundation.swot.weaknesses ?? [])),
        ...titled("Financial Signals", list(signals.map(signal => signal.title + ": " + signal.text)))
    ];
}

/**
 * The Funding Request, as one account: what the plan needs and has,
 * the gap, what is being sought and what would still be short once it
 * is repaid; then what the money is for, and where it comes from.
 */
function fundingRequestBlocks(f: Foundation): ExportBlock[] {
    const { format, position } = f;
    const start = f.financial.planStart;
    const cash = allFunding(f.financial, f.legalEntity)
        .filter(source => !isNonCash(source))
        .map(source => ({ source, standing: fundingStanding(source, start) }));
    const received = cash.reduce((sum, entry) => sum + entry.standing.received, 0);
    const spentBefore = spentBeforePlan(f.lines, start);
    const sought = cash.filter(entry => entry.standing.pending > 0.005);
    const soughtNames = joinNames(sought.map(entry => entry.source.name.trim() || fundingType(entry.source.type)?.label || "funding"));

    return [
        ...paragraph(position.gap > 0.005
            ? f.name + " is seeking " + format(position.pending > 0.005 ? position.pending : position.gap) +
                " of additional funding towards a funding gap of " + format(position.gap) + "."
            : "The identified funding requirement of " + format(position.need) + " is covered by available and confirmed funding."),
        ...details([
            ["Funding need", format(position.need)],
            ["Available now", format(position.availableNow) + (spentBefore > 0.005
                ? " (" + format(received) + " received, less " + format(spentBefore) + " of costs paid before the plan)"
                : "")],
            ["Confirmed, still to arrive", position.confirmedFuture > 0.005 ? format(position.confirmedFuture) : ""],
            ["Funding gap", format(position.gap)],
            ["Amount sought", position.pending > 0.005 ? format(position.pending) + (soughtNames ? " (" + soughtNames + ")" : "") : ""],
            ["Still short after repayments", position.sought && position.gap > 0.005
                ? position.sought.shortfall > 0.005
                    ? format(position.sought.shortfall) + " at the lowest point, in " + position.sought.lowestLabel +
                        ", once the funding sought is repaid"
                    : "Nothing: with the funding sought, cash stays above zero, its repayments included"
                : ""]
        ]),
        ...titled("Use of Funds", table(["Need", "Amount", "When"], [
            ...position.needs.map(need => [need.label, format(need.amount), need.when]),
            ["Total", format(position.need), ""]
        ])),
        ...titled("Sources of Funds", table(["Source", "Type", "Amount", "Status", "Received"], cash.map(entry => [
            entry.source.name || entry.source.provider,
            fundingType(entry.source.type)?.label ?? "",
            format(entry.standing.total),
            FUNDING_STATUSES.find(status => status.id === entry.source.status)?.label ?? entry.source.status,
            format(entry.standing.received)
        ])))
    ];
}

/** The forecast's tables as document tables, in whole amounts. */
export function forecastTableBlocks(table: ForecastViewTable, format: (amount: number) => string, currency: string): ExportBlock[] {
    return [{
        kind: "table",
        headers: [currency || "Amount", ...table.columns],
        rows: table.rows.map(row => row.heading
            ? [row.label, ...table.columns.map(() => "")]
            : [row.label, ...row.values.map(format)])
    }];
}

/** The plan's financial projections: the forecast by plan year. */
function projectionBlocks(f: Foundation): ExportBlock[] {
    const forecast = financialForecast(f.financial, f.revenuePage, f.lines, f.legalEntity, f.format);
    const view = forecastView(forecast, "annual", planYears(f.financial));
    const whole = moneyFormatter(f.currency, { wholeOnly: true });
    const titles: Record<string, string> = {
        "Profit and Loss Forecast": "Profit and Loss",
        "Cash-Flow Forecast": "Cash Flow",
        "Balance Sheet": "Balance Sheet"
    };
    const ordered = ["Profit and Loss Forecast", "Cash-Flow Forecast", "Balance Sheet"]
        .map(title => view.tables.find(entry => entry.title === title))
        .filter((entry): entry is ForecastViewTable => !!entry);
    return [
        ...paragraph("By plan year, from the Financial Forecast. Amounts are estimates" + (f.currency ? ", in " + f.currency : "") + "."),
        ...ordered.flatMap(entry => [heading(titles[entry.title] ?? entry.title), ...forecastTableBlocks(entry, whole, f.currency)])
    ];
}

/** The Appendix: the costs in full, and the brand's style guide. */
function appendixBlocks(f: Foundation): ExportBlock[] {
    const frequencyOf = (line: CostLine) => line.frequency === "other"
        ? (line.frequencyOther || "Other")
        : line.frequency.charAt(0).toUpperCase() + line.frequency.slice(1).replace(/-/g, " ");
    const demote = (blocks: ExportBlock[]) => blocks.map(block => block.kind === "subheading" ? { ...block, level: 2 as const } : block);
    const style = [...demote(brandStyleBlocks(f.brandStyleValue)), ...demote(brandInventoryBlocks(f.brandInventoryValue))];
    return [
        ...titled("Costs", table(["Group", "Cost", "Source", "Amount", "Frequency", "Offering"], f.lines.map(line => [
            line.group.charAt(0).toUpperCase() + line.group.slice(1),
            costName(f, line),
            line.sourceLabel,
            line.amount === null ? line.amountText : f.format(line.amount),
            frequencyOf(line),
            offeringNames(f.foundationValue, line.offeringIds)
        ]))),
        ...titled("Brand Style Guide", style)
    ];
}

/** Where the organization can be found online: its website channel, if it has one. */
function websiteOf(f: Foundation): string {
    const channels = f.engagement.segments.flatMap(entry => entry.channels);
    const site = channels.find(channel => /website/i.test(channel.category));
    const link = site?.links.map(text).find(Boolean) ?? "";
    return link.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** Today, as the documents write a month: "Sep 2026". */
function preparedMonth(today: Date = new Date()): string {
    return shortMonth(today.getMonth() + 1) + " " + today.getFullYear();
}

/**
 * The Financial Sustainability page's "1. Revenue", "2. Break Even"
 * numbered on from the Financial Foundation page's headings before
 * it ("5. Revenue", "6. Break Even"), as one Financial Plan.
 */
function continueNumbering(blocks: ExportBlock[], before: ExportBlock[]): ExportBlock[] {
    const numbered = /^(\d+)\. /;
    const offset = before.filter(block => block.kind === "subheading" && block.level !== 2 && numbered.test(block.text)).length;
    return blocks.map(block => block.kind === "subheading" && block.level !== 2 && numbered.test(block.text)
        ? { ...block, text: block.text.replace(numbered, (_, n: string) => (Number(n) + offset) + ". ") }
        : block);
}

export function businessPlan(sessions: FoundationSessions): ExportContent {

    const f = readFoundation(sessions);

    // The costs are in the Appendix.
    const asDocument = { costName: (line: CostLine) => costName(f, line), omitCosts: true };
    const financialFoundation = financialFoundationBlocks(f.business.responseOf?.(AnswerType.FinancialFoundation), f.business, asDocument);

    const parts: [string, ExportBlock[]][] = [
        ["Executive Summary", executiveSummary(f)],
        ["Company Description", companyBlocks(f)],
        ["Market Analysis", marketBlocks(f)],
        ["Products and Services", offeringBlocks(f)],
        ["Marketing and Sales", marketingBlocks(f)],
        ["Operations", operationsBlocks(f)],
        ["Management and Team", teamBlocks(f)],
        ["Financial Plan", [
            ...financialFoundation,
            ...continueNumbering(
                financialSustainabilityBlocks(f.business.responseOf?.(AnswerType.FinancialSustainability), f.business, asDocument),
                financialFoundation)
        ]],
        ["Financial Projections", projectionBlocks(f)],
        ["Funding Request", fundingRequestBlocks(f)],
        ["Strategy and Milestones", strategyBlocks(f)],
        ["Risks", riskBlocks(f)],
        ["Appendix", appendixBlocks(f)]
    ];

    return {
        systemNumber: "",
        // Also the download's file name, so no colon.
        systemName: "Business Plan " + f.name,
        capability: "Foundation",
        documentTitle: "Business Plan: " + f.name,
        documentSubtitle: "Drawn from the Foundation capability: Identity, Brand, Business and Strategy. " +
            "Figures are estimates over a " + planLength(f.financial) + "-month plan from " + planMonthLabel(f.financial.planStart, 1) + ".",
        documentMeta: coverLines(f),
        sections: parts.map(([title, blocks], index) => section(index + 1, title,
            blocks.length > 0 ? blocks : paragraph("Not answered yet.")))
    };

}

/* ==========================================================
   The financial forecast
========================================================== */

/** The cash-flow and profit and loss forecast, and what labels it. */
export function businessForecast(sessions: FoundationSessions) {
    const f = readFoundation(sessions);
    return {
        forecast: financialForecast(f.financial, f.revenuePage, f.lines, f.legalEntity, f.format),
        years: planYears(f.financial),
        currency: f.currency,
        format: f.format,
        name: f.name
    };
}

/** The Financial Forecast as a document, for Markdown and PDF: the same tables the page shows. */
export function businessForecastContent(
    sessions: FoundationSessions,
    period: ForecastPeriod,
    untilYear: number,
    capability = "Foundation"
): ExportContent {
    const f = readFoundation(sessions);
    const forecast = financialForecast(f.financial, f.revenuePage, f.lines, f.legalEntity, f.format);
    const view = forecastView(forecast, period, untilYear);
    const whole = moneyFormatter(f.currency, { wholeOnly: true });
    return {
        systemNumber: "",
        // Also the download's file name, so no colon.
        systemName: "Financial Forecast " + f.name + " " + (period === "monthly" ? "monthly" : "annual"),
        capability,
        documentTitle: "Financial Forecast: " + f.name,
        documentSubtitle: (period === "monthly" ? "Month by month" : "By plan year") + ", from " + forecast.months[0] +
            (f.currency ? ". Amounts in " + f.currency + "." : "."),
        documentMeta: coverLines(f),
        sections: [
            ...view.tables.map((entry, index) => section(index + 1, entry.title, forecastTableBlocks(entry, whole, f.currency))),
            section(view.tables.length + 1, "Notes", list(forecast.notes))
        ]
    };
}
