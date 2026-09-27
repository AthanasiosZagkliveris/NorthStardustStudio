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
    businessFounderResponsibilities,
    BRAND_COLOUR_SLOTS,
    BRAND_TYPEFACE_SLOTS
} from "./AnswerUtils.ts";
import type { ExportContent, ExportSectionContent } from "./ExportContentBuilder.ts";
import { sessionExportContext } from "./ExportContentBuilder.ts";
import { financialForecast } from "./FinancialForecast.ts";
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
    sustainability,
    withPlanStart
} from "./FinancialModel.ts";
import { COUNTRIES, countryCurrency } from "./LegalEntityJurisdictions.ts";

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

    return {
        legalEntity, currency, format, business, strategy, foundationValue, segments,
        capability, engagement, financial, lines, position, revenuePage, outlook, name,
        definition: responseByTitle(sessions.identity, /^definition$/i),
        ethics: responseByTitle(sessions.identity, /^ethics$/i),
        ambassador: responseByTitle(sessions.brand, /ambassador/i),
        brandStyle: asBrandStyleValue(responseByType(sessions.brand, AnswerType.BrandStyle)),
        strategyFoundation: asStrategyFoundationValue(strategy.responseOf?.(AnswerType.StrategyFoundation)),
        strategicPeriod: asStrategicPeriodValue(strategy.responseOf?.(AnswerType.StrategicPeriod))
    };

}

type Foundation = ReturnType<typeof readFoundation>;

function monthName(value: StrategyMonthValue): string {
    const m = Number(value.month);
    return m >= 1 && m <= 12 && value.year ? STRATEGY_MONTH_NAMES[m - 1] + " " + value.year : "";
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

export type CanvasBlockId = typeof CANVAS_BLOCKS[number]["id"];

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
        ...largest.map(entry => entry.line.name + " (" + format(entry.monthly) + " a month)"),
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

function companyBlocks(f: Foundation): ExportBlock[] {
    const organisation = f.legalEntity.organisation;
    return [
        ...paragraph(text(f.definition.description)),
        ...titled("Legal Structure", details([
            ["Legal name", organisation.name],
            ["Legal form", legalFormOf(f.legalEntity)],
            // Registered once a number or a date says so; the authority
            // alone is only where it would be registered.
            ["Registered", text(f.legalEntity.formation.registrationNumber) || text(f.legalEntity.formation.date)
                ? [f.legalEntity.formation.authority, f.legalEntity.formation.registrationNumber].filter(Boolean).join(" ")
                : ""],
            ["Registration", f.legalEntity.formation.status === "planned"
                ? "Not yet registered" + (text(f.legalEntity.formation.authority) ? "; to be registered with " + text(f.legalEntity.formation.authority) : "")
                : ""],
            ["Address", [organisation.addressLine1, organisation.addressLine2, organisation.city, organisation.postalCode].map(text).filter(Boolean).join(", ")],
            ["Main activity", organisation.mainActivity]
        ])),
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
        ...table(["Offering", "Type", "What it does", "Customer benefit"], segment.offerings.map(offering => [
            offering.name, offering.category, offering.description.function ?? "", offering.description.benefit ?? ""
        ]))
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
        ...(forecast.length > 0 ? [heading("Expected Sales"), ...list(forecast)] : [])
    ];
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
    const capacity = capacityBlocks(salesCapacity(f.revenuePage, f.financial, capability), f.financial.planStart);
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
    return table(["Founder", "Ownership", "Roles", "Responsible for"], f.legalEntity.founders
        .filter(founder => founder.name.trim())
        .map(founder => {
            const salary = capability.founders.find(entry => entry.id === founder.id)?.salary ?? "";
            return [
                founder.name + (parseAmount(salary) !== null ? " (" + format(parseAmount(salary) ?? 0) + " a month)" : ""),
                founder.ownership ? founder.ownership + "%" : "",
                founder.roles.filter(Boolean).join(", "),
                businessFounderResponsibilities(capability, founder.id)
                    .filter(entry => !entry.completed).map(entry => entry.name).join("; ")
            ];
        }));
}

function strategyBlocks(f: Foundation): ExportBlock[] {
    const period = f.strategyFoundation.period;
    const owners = (id: string) => f.legalEntity.founders.find(founder => founder.id === id)?.name ?? "";
    return [
        ...paragraph([monthName(period.start), monthName(period.end)].filter(Boolean).join(" – "), "Strategic period"),
        ...paragraph(f.strategyFoundation.compass, "Strategic compass"),
        ...table(["Theme", "Objective", "When", "Owner"], f.strategyFoundation.themes.flatMap((theme, themeIndex) =>
            (f.strategicPeriod.goalsByTheme[theme.id] ?? []).flatMap((goal, goalIndex) => goal.objectives.map((objective, objectiveIndex) => [
                (themeIndex + 1) + ". " + theme.name,
                (themeIndex + 1) + "." + (goalIndex + 1) + "." + (objectiveIndex + 1) + " " + objective.name,
                [monthName(objective.period.start), monthName(objective.period.end)].filter(Boolean).join(" – "),
                owners(objective.ownerId)
            ]))))
    ];
}

function riskBlocks(f: Foundation): ExportBlock[] {
    const signals = [...f.position.signals, ...f.outlook.signals]
        .filter(signal => signal.tone === "risk" || signal.tone === "caution");
    return [
        ...titled("External Threats", list(f.strategyFoundation.swot.threats ?? [])),
        ...titled("Internal Weaknesses", list(f.strategyFoundation.swot.weaknesses ?? [])),
        ...titled("Financial Signals", list([...new Set(signals.map(signal => signal.title + ": " + signal.text))]))
    ];
}

function fundingRequestBlocks(f: Foundation): ExportBlock[] {
    const { format, position } = f;
    const sought = allFunding(f.financial, f.legalEntity)
        .filter(source => !isNonCash(source))
        .map(source => ({ source, standing: fundingStanding(source, f.financial.planStart) }))
        .filter(entry => entry.standing.pending > 0);
    return [
        ...paragraph(position.gap > 0.005
            ? f.name + " is seeking " + format(position.gap) + " of additional funding to cover its identified requirement of " + format(position.need) + "."
            : "The identified funding requirement of " + format(position.need) + " is covered by available and confirmed funding."),
        ...table(["Source being pursued", "Type", "Amount", "Status"], sought.map(entry => [
            entry.source.name || entry.source.provider,
            fundingType(entry.source.type)?.label ?? "",
            format(entry.standing.pending),
            FUNDING_STATUSES.find(status => status.id === entry.source.status)?.label ?? entry.source.status
        ]))
    ];
}

function brandBlocks(f: Foundation): ExportBlock[] {
    const imprint = text(f.ambassador.imprint);
    const voice = text(f.ambassador["communication-voice"]);
    return [
        // The answers are free text that may carry labels of their own
        // ("First impression: …"), so each goes under a heading.
        ...(imprint ? [heading("Brand Impression")] : []),
        ...paragraph(imprint),
        ...(voice ? [heading("Voice")] : []),
        ...paragraph(voice),
        ...(f.brandStyle.colours.some(colour => colour.enabled && colour.hex) ||
            f.brandStyle.typefaces.some(typeface => typeface.enabled && typeface.font) ? [heading("Style")] : []),
        ...list(f.brandStyle.colours
            .map((colour, index) => ({ colour, slot: BRAND_COLOUR_SLOTS[index]?.label ?? "" }))
            .filter(entry => entry.colour.enabled && entry.colour.hex)
            .map(({ colour, slot }) => slot + ": " + colour.name + " " + colour.hex)),
        ...list(f.brandStyle.typefaces
            .map((typeface, index) => ({ typeface, slot: BRAND_TYPEFACE_SLOTS[index]?.label ?? "" }))
            .filter(entry => entry.typeface.enabled && entry.typeface.font)
            .map(({ typeface, slot }) => slot + " typeface: " + typeface.font))
    ];
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

    const financialFoundation = financialFoundationBlocks(f.business.responseOf?.(AnswerType.FinancialFoundation), f.business);

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
                financialSustainabilityBlocks(f.business.responseOf?.(AnswerType.FinancialSustainability), f.business),
                financialFoundation)
        ]],
        ["Funding Request", fundingRequestBlocks(f)],
        ["Strategy and Milestones", strategyBlocks(f)],
        ["Risks", riskBlocks(f)],
        ["Brand", brandBlocks(f)]
    ];

    return {
        systemNumber: "",
        // Also the download's file name, so no colon.
        systemName: "Business Plan " + f.name,
        capability: "Foundation",
        documentTitle: "Business Plan: " + f.name,
        documentSubtitle: "Drawn from the Foundation capability: Identity, Brand, Business and Strategy. " +
            "Figures are estimates over a " + planLength(f.financial) + "-month plan from " + planMonthLabel(f.financial.planStart, 1) + ".",
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
