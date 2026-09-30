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
import { WEEKS_PER_MONTH, demandResult, founderMonthlySalary, founderWorkingHours, hasDemand } from "./DemandCapacity.ts";
import type { InterviewSession } from "../interview";
import {
    BUSINESS_ACTIVITY_CATEGORIES,
    BUSINESS_CHANNEL_ALL_OFFERINGS,
    BUSINESS_JOURNEY_STAGES,
    BUSINESS_COMPETITOR_TYPES,
    BUSINESS_RELATIONSHIP_TYPES,
    BUSINESS_RESOURCE_GROUPS,
    BUSINESS_RESOURCE_STATUSES,
    BUSINESS_WORKSPACE_KINDS,
    STRATEGY_MONTH_NAMES,
    type BusinessPartnerValue,
    type ExportBlock,
    type ExportContext,
    type ExportImage,
    type LegalEntityValue,
    type StrategyMonthValue,
    asBrandInventoryValue,
    asBrandStyleValue,
    asBusinessEngagementValue,
    asFoundersProfileValue,
    asLegalEntityValue,
    asStrategicPeriodValue,
    asStrategyFoundationValue,
    brandMarkFile,
    businessFoundationSegments,
    isExportableImage,
    type StrategyMetricValue,
    founderProfileHasText,
    founderProfileOf,
    founderProfiles,
    founderSkillLines
} from "./AnswerUtils.ts";
import type { ExportContent, ExportSectionContent } from "./ExportContentBuilder.ts";
import { sessionExportContext } from "./ExportContentBuilder.ts";
import {
    financialForecast,
    forecastView,
    ownersTakeDrawings,
    splitMonthlyTableByYear,
    type ForecastPeriod,
    type ForecastViewTable
} from "./FinancialForecast.ts";
import {
    capabilityOf,
    costLines,
    demandBasis,
    details,
    financialFoundationBlocks,
    financialSustainabilityBlocks,
    heading,
    labelled,
    labelledList,
    list,
    offeringName,
    offeringNames,
    capacityBlocks,
    brandStyleBlocks,
    paragraph,
    table,
    titled
} from "./ExportRenderers.ts";
import {
    COST_FREQUENCIES,
    COST_GROUPS,
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
    isLoan,
    isNonCash,
    loanSchedule,
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
export function readFoundation(sessions: FoundationSessions, options?: { wholeOnly?: boolean }) {

    const legalEntity: LegalEntityValue = asLegalEntityValue(responseByType(sessions.identity, AnswerType.LegalEntity));
    // Each founder's roles and profile: read through founderProfiles,
    // so a Legal Entity saved before the Founders Profile page existed
    // still gives its roles and experience.
    const foundersProfile = responseByType(sessions.identity, AnswerType.FoundersProfile);
    const currency = countryCurrency(legalEntity.organisation.country);
    // The documents are in whole amounts throughout.
    const format = moneyFormatter(currency, options);

    const business: ExportContext = sessions.business
        ? sessionExportContext(sessions.business, { legalEntity, foundersProfile, currency })
        : { legalEntity, foundersProfile, currency };

    const strategy: ExportContext = sessions.strategy
        ? sessionExportContext(sessions.strategy, { legalEntity, foundersProfile, currency })
        : { legalEntity, foundersProfile, currency };

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
        legalEntity, foundersProfile, currency, format, drawings, business, strategy, foundationValue, segments,
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

/**
 * A cost line's name, with founders' pay named as the forecast counts
 * it: "Founder pay (owner's drawings)" -- a cost of running the model
 * on the canvas and in the costs, the owner's drawings in the
 * statements, and the one wording says both.
 */
function costName(f: Foundation, line: CostLine): string {
    return f.drawings && line.sourcePath.includes("resource-group-founders")
        ? line.name.replace(/^Salary: /, "Founder pay (owner's drawings): ")
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
function brandGuidePictures(f: Foundation): ExportBlock[] {
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

/**
 * A name with a note in brackets, as one pair of brackets: "Freelance
 * developer (overflow)" and "for Automation Build" make "Freelance
 * developer (overflow, for Automation Build)".
 */
function withBrackets(name: string, note: string): string {
    const base = name.trim();
    if (!note) {
        return base;
    }
    return /\)$/.test(base) ? base.slice(0, -1) + ", " + note + ")" : base + " (" + note + ")";
}

/** A cost paid per unit sold: part of the cost of sales, not a resource the business keeps. */
function isPerUse(frequency: string): boolean {
    return frequency === "per-unit" || frequency === "per-order" || frequency === "per-project";
}

/** The canvas as its nine lists -- for the page's own nine-box drawing. */
export function businessModelCanvasData(sessions: FoundationSessions): {
    name: string;
    blocks: Record<CanvasBlockId, string[]>;
} {

    const f = readFoundation(sessions, { wholeOnly: true });
    const { capability } = f;
    const format = moneyFormatter(f.currency, { wholeOnly: true });
    const offeringsFor = (ids: string[]) => offeringNames(f.foundationValue, ids) || "an Offering";

    const engaged = [...capability.professionals, ...capability.providers].filter(isEngaged);
    const partners = [
        ...capability.professionals.filter(isEngaged).map(partner => withBrackets(partner.name, "professional")),
        ...capability.providers.filter(isEngaged).map(partner => withBrackets(partner.name, "provider")),
        ...capability.offering.professionals.map(partner => withBrackets(partner.name, "for " + offeringsFor(partner.offeringIds))),
        ...capability.offering.providers.map(partner => withBrackets(partner.name, "for " + offeringsFor(partner.offeringIds)))
    ].filter(entry => entry && !entry.startsWith("("));
    const partnerIds = new Set([...engaged, ...capability.offering.professionals, ...capability.offering.providers].map(partner => partner.id));
    const partnerNames = [...engaged, ...capability.offering.professionals, ...capability.offering.providers]
        .map(partner => partner.name.trim().toLowerCase()).filter(Boolean);
    // Already under Key Partners: provided by one, or named as one.
    const isPartner = (name: string, providerId: string) => partnerIds.has(providerId) ||
        partnerNames.some(partner => partner === name.trim().toLowerCase());

    /* Key Activities: the crucial work that goes on -- delivering each
       Offering, and marketing and selling it through the channels.
       How customers are kept is the Customer Relationships block, and
       one-off setup tasks are the plan's (Operations: Launch and Setup
       Tasks). */
    const offerings = f.segments.flatMap(segment => segment.offerings).filter(offering => offering.name.trim());
    // By kind of channel, as the Channels block names each one; a
    // payment channel is how a sale is taken, not how it is made.
    const channelKinds = [...new Set(f.engagement.segments.flatMap(entry => entry.channels)
        .filter(channel => channel.name.trim())
        .map(channel => channel.category.trim().toLowerCase())
        .filter(category => category && category !== "other" && !/payment/.test(category)))];
    const hasChannels = f.engagement.segments.some(entry => entry.channels.some(channel => channel.name.trim()));
    const activities = [
        ...offerings.map(offering => "Deliver " + offering.name.trim()),
        ...(hasChannels
            ? ["Marketing and sales" + (channelKinds.length > 0 ? " through " + joinNames(channelKinds) : "")]
            : [])
    ];

    /* Key Resources, by Strategyzer's four kinds: human, physical,
       intellectual and financial. What the business keeps and relies
       on, not a partner's, not a utility it is simply provided with,
       nor a per-use cost of sales. */
    const kept = (group: string, slot: { name: string; status: string; providerId: string; cost: { frequency: string } }) =>
        !!slot.name.trim() &&
        !(group === "utilities" && (slot.status === "provided" || slot.status === "exists")) &&
        !isPerUse(slot.cost.frequency) &&
        !isPartner(slot.name, slot.providerId);
    const workspace = capability.workspace.kind && !(capability.workspace.status === "provided" && partnerIds.has(capability.workspace.providerId))
        ? BUSINESS_WORKSPACE_KINDS.find(kind => kind.id === capability.workspace.kind)?.label ?? capability.workspace.kindOther
        : "";
    const namesIn = (groups: string[]) => BUSINESS_RESOURCE_GROUPS.filter(group => groups.includes(group.id))
        .flatMap(group => (capability.resources[group.id] ?? [])
            .flatMap(subsection => subsection.slots.filter(slot => kept(group.id, slot)).map(slot => slot.name.trim())));
    const physical = [
        ...(workspace ? [workspace] : []),
        ...namesIn(BUSINESS_RESOURCE_GROUPS.map(group => group.id).filter(id => id !== "digital")),
        ...capability.offering.resources.filter(slot => kept("offering", slot)).map(slot => slot.name.trim())
    ];
    // The software, as its essentials: the first few, and how many more.
    const systems = namesIn(["digital"]);
    const website = websiteOf(f);
    const trademark = [...f.lines.map(line => line.name), ...f.legalEntity.requirements.map(requirement => requirement.name)]
        .some(name => /trade ?mark/i.test(name));
    const intellectual = [
        "the " + f.name + " brand" + (trademark ? " (trade mark)" : ""),
        ...(website ? ["the website " + website] : [])
    ];
    const sought = allFunding(f.financial, f.legalEntity)
        .filter(source => !isNonCash(source) && statusStanding(source.status || "planned") !== "confirmed")
        .filter(source => (parseAmount(source.amount) ?? 0) > 0);
    const financial = [
        ...(f.position.availableNow > 0.5 ? [format(f.position.availableNow) + " in hand"] : []),
        ...(f.position.confirmedFuture > 0.5 ? [format(f.position.confirmedFuture) + " confirmed, still to arrive"] : []),
        ...(f.position.pending > 0.5
            ? [format(f.position.pending) + " sought" + (sought.length > 0
                ? " (" + joinNames(sought.map(source => source.name.trim() || fundingType(source.type)?.label || "funding")) + ")"
                : "")]
            : [])
    ];
    const resources = [
        ...(capability.founders.length > 0 ? ["Human: " + capability.founders.map(founder =>
            withBrackets(founder.name, founder.roles.filter(Boolean).join(", "))).join("; ")] : []),
        ...(physical.length > 0 ? ["Physical: " + physical.join("; ")] : []),
        ...(systems.length > 0
            ? ["Physical (systems): " + systems.slice(0, 3).join("; ") + (systems.length > 3 ? " and " + (systems.length - 3) + " more" : "")]
            : []),
        "Intellectual: " + intellectual.join("; "),
        ...(financial.length > 0 ? ["Financial: " + financial.join("; ")] : [])
    ];

    const propositions = f.segments
        .filter(segment => text(segment.valueProposition))
        .map(segment => (f.segments.length > 1 ? segment.name.trim() + ": " : "") + text(segment.valueProposition));

    // With more than one segment, each relationship names the segment it is with.
    const relationshipLines = f.engagement.segments.flatMap(entry => {
        const segment = f.segments.find(candidate => candidate.id === entry.segmentId);
        return entry.offerings.flatMap(relationship => relationship.types.map(typeId => {
            const offering = segment?.offerings.find(candidate => candidate.id === relationship.offeringId)?.name.trim() ?? "";
            const type = BUSINESS_RELATIONSHIP_TYPES.find(candidate => candidate.id === typeId)?.label ?? typeId;
            return offering ? withBrackets(offering, f.segments.length > 1 ? segment?.name.trim() ?? "" : "") + ": " + type : "";
        })).filter(Boolean);
    });

    const channelLines = [...new Set(f.engagement.segments.flatMap(entry =>
        entry.channels.filter(channel => channel.name.trim()).map(channel => withBrackets(channel.name, channel.category))))];

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
        ...largest.map(entry => withBrackets(costName(f, entry.line), format(entry.monthly) + " a month")),
        ...f.outlook.streams.filter(entry => entry.variable > 0.005)
            .map(entry => "Variable costs: " + format(entry.variable) + " " + perUnit(entry.stream) +
                " (" + (offeringName(f.foundationValue, entry.stream.offeringId) || "an Offering") + ")")
    ];

    /* Revenue: each stream, from the segment it comes from, as it is
       charged. The working (price times volume) is the plan's. */
    const revenue = [
        ...f.outlook.streams.map(entry => {
            const name = offeringName(f.foundationValue, entry.stream.offeringId) || "Revenue stream";
            const segment = f.segments.find(candidate => candidate.offerings.some(offering => offering.id === entry.stream.offeringId));
            const price = priceText(entry.stream, format);
            const recurring = entry.stream.frequency === "monthly" || entry.stream.frequency === "quarterly" || entry.stream.frequency === "annually";
            return withBrackets(name, segment?.name.trim() ?? "") + ": " + (price || "price not set") + ", " + (recurring ? "recurring" : "one-time");
        }),
        ...(f.outlook.streams.length > 0 ? ["Expected revenue: " + format(f.outlook.expectedRevenue) + " a month at the normal level"] : [])
    ];

    return {
        name: f.name,
        blocks: {
            partners, activities, resources, propositions, relationships: relationshipLines,
            channels: channelLines, segments, costs, revenue
        }
    };

}

export function businessModelCanvas(sessions: FoundationSessions, capability = "Foundation"): ExportContent {

    const data = businessModelCanvasData(sessions);

    return {
        systemNumber: "",
        // Also the download's file name, so no colon.
        systemName: "Business Model Canvas " + data.name,
        capability,
        documentTitle: "Business Model Canvas: " + data.name,
        documentSubtitle: "Drawn from the Business System: Foundation, Customer Engagement, Infrastructure & Capability, Financial Foundation and Sustainability.",
        // Drawn as the nine-block grid by the PDF and the Markdown.
        canvas: CANVAS_BLOCKS.map(block => ({ id: block.id, title: block.title, items: data.blocks[block.id] })),
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
        ? (opening ? "It" : f.name) + " offers " + joinNames(offerings) + (segments.length ? " to " + joinNames(segments.map(midSentence)) : "") + "."
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
        ...labelled("Mission", text(f.definition.mission)),
        ...labelled("Vision", text(f.definition.vision)),
        ...labelled("Financial outlook", [money, revenue].filter(Boolean).join(" ")),
        ...(outlook.signals[0] ? labelled(outlook.signals[0].title, outlook.signals[0].text) : []),
        ...labelled("Direction", f.strategyFoundation.compass)
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

/** Several items in one table cell: one a line, each with its bullet. */
function bulletCell(items: string[] | undefined): string {
    return (items ?? []).map(text).filter(Boolean).map(item => "• " + item).join("\n");
}

/** A level-2 heading and what is under it, or nothing when nothing is. */
function titled2(title: string, blocks: ExportBlock[]): ExportBlock[] {
    return blocks.length === 0 ? [] : [heading(title, 2), ...blocks];
}

/**
 * A name as it reads mid-sentence: "Small professional-services firms"
 * becomes "small professional-services firms"; a word in capitals
 * (NYC, UK) or a proper name after the first word keeps them.
 */
function midSentence(name: string): string {
    const trimmed = name.trim();
    return /^[A-Z][a-z]/.test(trimmed) ? trimmed.charAt(0).toLowerCase() + trimmed.slice(1) : trimmed;
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
    return [
        ...paragraph(text(f.definition.description)),
        ...titled("Manifesto", paragraphs(f.ethics.manifesto)),
        ...titled("Values and Principles", [
            ...labelled("Philosophy", text(f.ethics.philosophy)),
            ...titled2("Values", list(listItems(f.ethics.values))),
            ...titled2("Principles", list(listItems(f.ethics.principles), true))
        ])
    ];
}

function marketBlocks(f: Foundation): ExportBlock[] {
    return [
        ...labelled("Positioning", text(f.definition.positioning)),
        ...f.segments.flatMap((segment, index) => [
            heading("Segment " + (index + 1) + ": " + (segment.name.trim() || "Unnamed segment")),
            ...labelled("Who", segment.description.demographics ?? ""),
            ...labelled("Where", segment.description.geographics ?? ""),
            ...labelled("Market size and outlook", segment.description["market-size"] ?? ""),
            ...titled2("Customer Profiles", table(["Profile", "Goals", "Challenges", "Needs"], segment.profiles.map(profile => [
                profile.name,
                profile.goals,
                profile.challenges,
                bulletCell(profile.needs.functional)
            ]))),
            ...titled2("Competitors", table(["Competitor", "Type", "Strengths", "Weaknesses", "Insights"], segment.competitors.map(competitor => [
                competitor.name,
                BUSINESS_COMPETITOR_TYPES.find(type => type.id === competitor.type)?.label ?? "",
                competitor.strengths,
                competitor.weaknesses,
                competitor.insights
            ])))
        ]),
        // Each segment's market size and outlook is under it; said to
        // be missing only when no segment has one.
        ...(f.segments.some(segment => text(segment.description["market-size"]))
            ? []
            : notCovered("Market Size and Industry Outlook"))
    ];
}

function offeringBlocks(f: Foundation): ExportBlock[] {
    return [
        ...f.segments.flatMap(segment => [
            heading("For " + (midSentence(segment.name) || "an unnamed segment")),
            ...labelled("Value proposition", segment.valueProposition),
            ...table(["Offering", "Type", "What it does", "Customer benefit", "Price", "Pricing model"], segment.offerings.map(offering => {
                const stream = f.revenuePage.streams.find(entry => entry.offeringId === offering.id);
                return [
                    offering.name, offering.category, offering.description.function ?? "", offering.description.benefit ?? "",
                    priceText(stream, f.format), stream ? revenueModelLabel(stream) : ""
                ];
            }))
        ]),
        // Intellectual property and where each Offering is in its life: not asked for.
        ...notCovered("Intellectual Property and Product Lifecycle")
    ];
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
                // The stages by their names ("Discover", "Support & Follow Up"), as the page says them.
                channel.stages.map(stage => BUSINESS_JOURNEY_STAGES.find(candidate => candidate.id === stage)?.label ?? stage).join(", ")
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
                slot.name.trim() + (slot.status === "costs" && slot.quantity ? " × " + slot.quantity : "") + " (" +
                (BUSINESS_RESOURCE_STATUSES.find(status => status.id === slot.status)?.label ?? "status not set") + ")"))))),
        ...titled("Launch and Setup Tasks", table(["Task", "Category", "State"], [
            ...capability.activities.flatMap(category => category.activities
                .filter(activity => activity.name.trim())
                .map(activity => [
                    activity.name,
                    BUSINESS_ACTIVITY_CATEGORIES.find(entry => entry.id === category.id)?.label ?? "Other",
                    activity.completed ? "Completed" : "Planned"
                ])),
            ...capability.offering.activities
                .filter(activity => activity.name.trim())
                .map(activity => [
                    activity.name,
                    "For " + (offeringNames(f.foundationValue, activity.offeringIds) || "an Offering"),
                    activity.completed ? "Completed" : "Planned"
                ])
        ])),
        ...titled("Partners and Providers", list(people.filter(isEngaged)
            .map(person => person.name.trim() + (text(person.description) ? ": " + text(person.description) : "")))),
        // Tax and legal registrations: part of operating, as Start Up Loans has it.
        ...titled("Licences and Registrations", list(licenceItems(f))),
        ...capacity
    ];
}

/**
 * Management and Organization: the legal structure (SBA puts it here),
 * the founders and what each is responsible for, and each founder's
 * profile -- experience, management, achievements, skills, expertise
 * and qualifications -- with the capabilities the team lacks and how
 * they are covered.
 */
function teamBlocks(f: Foundation): ExportBlock[] {
    const organisation = f.legalEntity.organisation;
    const profiled = founderProfiles(f.legalEntity.founders, f.foundersProfile).filter(founderProfileHasText);
    const teamGaps = asFoundersProfileValue(f.foundersProfile).teamGaps;
    return [
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
        ...titled("Founders", founderTable(f)),
        // Each founder's profile, where the Founders Profile page has
        // one; said to be missing only when no founder has.
        ...(profiled.length > 0
            ? titled("Founder Profiles", profiled.flatMap(founder => [
                heading(founder.name, 2),
                ...labelled("Relevant industry experience", text(founder.industryExperience)),
                ...labelled("Management experience", founder.managementExperience),
                ...labelledList("Key achievements", founder.achievements),
                ...labelledList("Skills, expertise and qualifications", founderSkillLines(founder.skills))
            ]))
            : notCovered("Experience and CVs")),
        ...(text(teamGaps)
            ? titled("Team Capability Gaps and Cover", paragraph(teamGaps))
            : notCovered("Team Capability Gaps and Cover"))
    ];
}

/*
 * How much of their working time a founder gives, from the working
 * hours on Business › Infrastructure & Capability › Founders: "Full-time
 * (about 37 hours a week)" from 35 hours a week, "Part-time (about 20
 * hours a week)" below it, or nothing where no hours are given.
 */
const FULL_TIME_HOURS_A_WEEK = 35;

function founderCommitment(hoursAMonth: number | null): string {
    if (hoursAMonth === null || hoursAMonth <= 0) {
        return "";
    }
    const week = Math.max(1, Math.round(hoursAMonth / WEEKS_PER_MONTH));
    return (week >= FULL_TIME_HOURS_A_WEEK ? "Full-time" : "Part-time") +
        " (about " + week + (week === 1 ? " hour" : " hours") + " a week)";
}

function founderTable(f: Foundation): ExportBlock[] {
    const { capability, format } = f;
    const withCapital = f.legalEntity.founders.some(founder => parseAmount(founder.capital) !== null);
    // A month's pay, whatever the founder's Frequency.
    const payOf = (id: string) => {
        const founder = capability.founders.find(entry => entry.id === id);
        return founder ? founderMonthlySalary(founder) : null;
    };
    const withPay = f.legalEntity.founders.some(founder => payOf(founder.id) !== null);
    return table(["Founder", "Ownership", ...(withCapital ? ["Capital"] : []), "Roles", "Commitment", ...(withPay ? ["Pay"] : [])], f.legalEntity.founders
        .filter(founder => founder.name.trim())
        .map(founder => {
            const working = capability.founders.find(entry => entry.id === founder.id);
            const pay = payOf(founder.id);
            return [
                founder.name,
                founder.ownership ? founder.ownership + "%" : "",
                ...(withCapital ? [parseAmount(founder.capital) !== null ? format(parseAmount(founder.capital) ?? 0) : ""] : []),
                founderProfileOf(founder, f.foundersProfile).roles.filter(Boolean).join(", "),
                founderCommitment(working ? founderWorkingHours(working) : null),
                // "$4,500 a month (owner's drawings)": the pay, then what the forecast counts it as.
                ...(withPay ? [pay !== null ? format(pay) + " a month (" + payWord(f).toLowerCase() + ")" : ""] : [])
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
    const bullets = bulletCell;

    /* Every Objective, numbered as the Strategy System numbers them. */
    const objectives = foundation.themes.flatMap((theme, themeIndex) =>
        (f.strategicPeriod.goalsByTheme[theme.id] ?? []).flatMap((goal, goalIndex) => goal.objectives.map((objective, objectiveIndex) => ({
            theme, goal, objective,
            number: (themeIndex + 1) + "." + (goalIndex + 1) + "." + (objectiveIndex + 1)
        }))));

    return [
        ...titled("Current Situation", paragraphs(foundation.situation)),
        ...labelled("Strategic period", range(period)),
        ...labelled("Strategic compass", foundation.compass),
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
                        ? labelled((themeIndex + 1) + "." + (goalIndex + 1) + " " + (goal.name || "Unnamed goal"), goal.description)
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
        // Each Theme's Objectives, numbered from 1 in each Theme as the
        // Roadmap page numbers them, with when each runs.
        ...titled("Roadmap", table(["Theme", "Objectives"], foundation.themes.map((theme, themeIndex) => [
            (themeIndex + 1) + ". " + theme.name,
            objectives.filter(entry => entry.theme.id === theme.id)
                .map((entry, index) => (index + 1) + ". " + entry.objective.name +
                    (range(entry.objective.period) ? " (" + range(entry.objective.period) + ")" : ""))
                .join("\n")
        ])))
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
    // The External Threats and Internal Weaknesses already read under
    // the SWOT table (Strategy and Milestones): pointed to, not repeated.
    const hasSwot = (f.strategyFoundation.swot.threats?.length ?? 0) > 0 ||
        (f.strategyFoundation.swot.weaknesses?.length ?? 0) > 0;
    return [
        ...(hasSwot ? paragraph("See SWOT: Weaknesses and Threats, under Strategy and Milestones.") : []),
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
    // Only a loan is repaid: with no loan among the funding sought (a
    // grant, equity), the line speaks of the funding, not repayments.
    const soughtRepaid = sought.some(entry => isLoan(entry.source));
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
            [soughtRepaid ? "Still short after repayments" : "Still short with the funding sought", position.sought && position.gap > 0.005
                ? position.sought.shortfall > 0.005
                    ? format(position.sought.shortfall) + " at the lowest point, in " + position.sought.lowestLabel +
                        (soughtRepaid ? ", once the funding sought is repaid" : ", even with the funding sought")
                    : "Nothing: with the funding sought, cash stays above zero" + (soughtRepaid ? ", its repayments included" : "")
                : ""]
        ]),
        ...titled("Use of Funds", table(["Need", "Amount", "When"], [
            ...position.needs.map(need => [need.label, format(need.amount), need.when]),
            ["Total", format(position.need), ""]
        ])),
        ...titled("Sources of Funds", [
            ...table(["Source", "Type", "Amount", "Status", "Received", "Terms"], cash.map(entry => [
                entry.source.name || entry.source.provider,
                fundingType(entry.source.type)?.label ?? "",
                format(entry.standing.total),
                FUNDING_STATUSES.find(status => status.id === entry.source.status)?.label ?? entry.source.status,
                format(entry.standing.received),
                fundingTerms(f, entry.source)
            ])),
            ...labelled("Debt and equity", financingMix(f, cash.map(entry => entry.source))),
            ...labelled("Period covered", "The plan's " + planLength(f.financial) + " months, " +
                planMonthLabel(start, 1) + " – " + planMonthLabel(start, planLength(f.financial)) + "."),
            ...labelled("Repayment", joinSentences(cash.map(entry => repaymentPlan(f, entry.source))))
        ])
    ];
}

type FundingSource = ReturnType<typeof allFunding>[number];

/**
 * What a source asks in return, from the figures the Financial
 * Foundation page records: a loan's rate and repayments, an investor's
 * share. "" when none is recorded.
 */
function fundingTerms(f: Foundation, source: FundingSource): string {
    const nature = fundingType(source.type)?.nature;
    const parts: string[] = [];
    if (nature === "debt") {
        const rate = text(source.loan.rate);
        if (rate) {
            parts.push(rate.replace(/%?$/, "%") + " a year" + (source.loan.interestType ? ", " + source.loan.interestType : ""));
        }
        const schedule = loanSchedule(source, f.financial.planStart);
        const repayments = schedule?.payments.filter(payment => payment.principal > 0) ?? [];
        if (schedule && repayments.length > 0) {
            const every = source.loan.frequency === "annually" ? "annual" : source.loan.frequency;
            parts.push(repayments.length + " " + every + " repayments of " + f.format(schedule.firstPayment) +
                " from " + planMonthLabel(f.financial.planStart, repayments[0].month));
        }
    }
    if (nature === "equity" && text(source.equity)) {
        parts.push(text(source.equity).replace(/%?$/, "%") + " of the business");
    }
    return parts.join("; ");
}

/** "Debt: $15,000; equity and owner's capital: $12,000", over every cash source. */
function financingMix(f: Foundation, sources: FundingSource[]): string {
    const total = (natures: string[]) => sources
        .filter(source => natures.includes(fundingType(source.type)?.nature ?? "other"))
        .reduce((sum, source) => sum + (parseAmount(source.amount) ?? 0), 0);
    return ([
        ["Debt", total(["debt"])],
        [f.drawings ? "Equity and owner's capital" : "Equity and share capital", total(["equity", "capital"])],
        ["Grants", total(["non-repayable"])],
        ["Other", total(["other"])]
    ] as [string, number][])
        .filter(([, amount]) => amount > 0.005)
        .map(([label, amount], index) => (index === 0 ? label : label.toLowerCase()) + ": " + f.format(amount))
        .join("; ");
}

/** How a loan is paid off: "SBA Microloan: repaid from the business's cash over 36 monthly repayments, the last in Feb 2030." */
function repaymentPlan(f: Foundation, source: FundingSource): string {
    if (fundingType(source.type)?.nature !== "debt") {
        return "";
    }
    const repayments = loanSchedule(source, f.financial.planStart)?.payments.filter(payment => payment.principal > 0) ?? [];
    if (repayments.length === 0) {
        return "";
    }
    return (text(source.name) || fundingType(source.type)?.label || "The loan") + ": repaid from the business's cash over " +
        repayments.length + " repayments, the last in " + planMonthLabel(f.financial.planStart, repayments[repayments.length - 1].month) + ".";
}

function joinSentences(parts: string[]): string {
    return parts.filter(Boolean).join(" ");
}

/** The forecast's tables as document tables, in whole amounts. */
export function forecastTableBlocks(table: ForecastViewTable, format: (amount: number) => string, currency: string): ExportBlock[] {
    return [{
        kind: "table",
        headers: [currency || "Amount", ...table.columns],
        rows: table.rows.map(row => row.heading
            ? [row.label, ...table.columns.map(() => "")]
            : row.text !== undefined
                // Words in place of figures: said once, in the first column.
                ? [row.label, row.text, ...table.columns.slice(1).map(() => "")]
                : [row.label, ...row.values.map(format)])
    }];
}

/**
 * The plan's financial projections, in the order the statements are
 * read: the first plan year by quarter, as lenders ask for it, then
 * each plan year; the capital-expenditure budget; and the assumptions
 * they rest on.
 */
function projectionBlocks(f: Foundation): ExportBlock[] {
    const forecast = financialForecast(f.financial, f.revenuePage, f.lines, f.legalEntity, f.format);
    const years = planYears(f.financial);
    const full = forecastView(forecast, "quarterly", years, { quarterlyYears: 1 });
    // Short column heads ("Q1", "Year 2") so the tables fit a page's
    // width; the months each covers are said once, above them.
    const periodOf = /^((?:Q[0-9]+)|(?:Year [0-9]+)) \((.+)\)$/;
    const periods = full.columns.map(column => periodOf.exec(column)).filter((match): match is RegExpExecArray => !!match)
        .map(match => match[1] + ": " + match[2]);
    const short = (table: ForecastViewTable): ForecastViewTable =>
        ({ ...table, columns: table.columns.map(column => column.replace(periodOf, "$1")) });
    const view = { ...full, tables: full.tables.map(short) };
    const whole = moneyFormatter(f.currency, { wholeOnly: true });
    const titles: Record<string, string> = {
        "Profit and Loss Forecast": "Profit and Loss",
        "Cash-Flow Forecast": "Cash Flow"
    };
    const capex = short(forecastView(forecast, "quarterly", years, { quarterlyYears: 1, tables: [forecast.capitalExpenditure] }).tables[0]);
    const anyCapex = capex.rows.some(row => !row.total && row.values.some(amount => Math.abs(amount) > 0.005));
    return [
        ...paragraph("Year 1 by quarter, then by plan year, from the Financial Forecast. Amounts are estimates" +
            (f.currency ? ", in " + f.currency : "") + "."),
        ...labelled("Periods", periods.join("; ") + "."),
        // Only the plan's own length: never extended beyond what was planned.
        ...(years < 5
            ? paragraph("The projections cover the plan's " + years + (years === 1 ? " year" : " years") +
                ", as set on the Financial Foundation page; they are not extended to five years.")
            : []),
        ...view.tables.flatMap(entry => [
            heading(titles[entry.title] ?? entry.title),
            ...(entry.note ? paragraph(entry.note) : []),
            ...forecastTableBlocks(entry, whole, f.currency)
        ]),
        heading("Capital Expenditure"),
        ...(anyCapex
            ? forecastTableBlocks(capex, whole, f.currency)
            : paragraph("No equipment purchases or deposits are planned.")),
        ...titled("Assumptions", list(forecast.notes))
    ];
}

/** What a standard plan section asks for and the Foundation answers do not collect: said, never made up. */
function notCovered(title: string): ExportBlock[] {
    return [heading(title), ...paragraph("Not covered by the Foundation answers.")];
}

/** The Appendix: the costs in full, and the brand's style guide -- its colours, type and hierarchy, then its pictures. */
function appendixBlocks(f: Foundation): ExportBlock[] {
    const frequencyOf = (line: CostLine) => line.frequency === "other"
        ? (line.frequencyOther || "Other")
        : COST_FREQUENCIES.find(entry => entry.id === line.frequency)?.label ?? line.frequency;
    const demote = (blocks: ExportBlock[]) => blocks.map(block => block.kind === "subheading" ? { ...block, level: 2 as const } : block);
    const style = [...demote(brandStyleBlocks(f.brandStyleValue)), ...brandGuidePictures(f)];
    return [
        ...titled("Costs", [
            ...paragraph("Subtotals count one-time costs once and recurring costs a month at a time; costs paid per unit or per project are in each Offering's cost of sales, not the totals."),
            ...COST_GROUPS.flatMap(group => {
                const lines = f.lines.filter(line => line.group === group.id);
                if (lines.length === 0) {
                    return [];
                }
                const sums = costSums(lines);
                return [
                    heading(group.label, 2),
                    ...table(["Cost", "Amount", "Frequency", "Offering"], [
                        ...lines.map(line => [
                            costName(f, line),
                            line.amount === null ? line.amountText : line.counted ? f.format(line.amount) : line.amountText + " " + line.currency + " (not counted)",
                            frequencyOf(line),
                            offeringNames(f.foundationValue, line.offeringIds)
                        ]),
                        ["Subtotal", sumText(f, sums), "", ""]
                    ])
                ];
            }),
            ...labelled("Total", sumText(f, costSums(f.lines)))
        ]),
        ...titled("Brand Style Guide", style)
    ];
}

/** What some costs add up to: once, and a month. */
function costSums(lines: CostLine[]): { oneTime: number; monthly: number } {
    const counted = lines.filter(line => line.counted && line.amount !== null && isScheduled(line));
    return {
        oneTime: counted.filter(line => line.frequency === "one-time").reduce((sum, line) => sum + (line.amount ?? 0), 0),
        monthly: counted.filter(line => line.frequency !== "one-time")
            .reduce((sum, line) => sum + monthlyEquivalent(line.amount ?? 0, line.frequency), 0)
    };
}

/** "$3,150 one-time; $5,396 a month". */
function sumText(f: Foundation, sums: { oneTime: number; monthly: number }): string {
    return [
        sums.oneTime > 0.005 ? f.format(sums.oneTime) + " one-time" : "",
        sums.monthly > 0.005 ? f.format(sums.monthly) + " a month" : ""
    ].filter(Boolean).join("; ") || f.format(0);
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
 * The Sustainability page's "1. Revenue", "2. Break Even"
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

    const f = readFoundation(sessions, { wholeOnly: true });

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
        ["Management and Organization", teamBlocks(f)],
        ["Strategy and Milestones", strategyBlocks(f)],
        ["Risks", riskBlocks(f)],
        // The request, then the financials that support it, then the
        // Appendix: the order SBA and SCORE give.
        ["Funding Request", fundingRequestBlocks(f)],
        ["Financial Plan", [
            ...financialFoundation,
            ...continueNumbering(
                financialSustainabilityBlocks(f.business.responseOf?.(AnswerType.FinancialSustainability), f.business, asDocument),
                financialFoundation)
        ]],
        ["Financial Projections", projectionBlocks(f)],
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
        documentLogo: brandPictures(f.brandInventoryValue).logo,
        sections: parts.map(([title, blocks], index) => section(index + 1, title,
            blocks.length > 0 ? blocks : paragraph("Not answered yet.")))
    };

}

/* ==========================================================
   The financial forecast
========================================================== */

/** The cash-flow and profit and loss forecast, and what labels it. */
export function businessForecast(sessions: FoundationSessions) {
    const f = readFoundation(sessions, { wholeOnly: true });
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
    const f = readFoundation(sessions, { wholeOnly: true });
    const forecast = financialForecast(f.financial, f.revenuePage, f.lines, f.legalEntity, f.format);
    const view = forecastView(forecast, period, untilYear);
    const whole = moneyFormatter(f.currency, { wholeOnly: true });
    // A monthly or quarterly forecast beyond one plan year is too wide
    // for one page -- every month or quarter of every year, side by
    // side -- so it is one table per plan year here, each with its own
    // year subtotal, rather than shrinking the text to fit (see
    // splitMonthlyTableByYear).
    const tables = period === "annual" ? view.tables : view.tables.flatMap(splitMonthlyTableByYear);
    return {
        systemNumber: "",
        // Also the download's file name, so no colon.
        systemName: "Financial Forecast " + f.name + " " + period,
        capability,
        documentTitle: "Financial Forecast: " + f.name,
        documentSubtitle: (period === "monthly" ? "Month by month" : period === "quarterly" ? "Quarter by quarter" : "By plan year") +
            ", from " + forecast.months[0] +
            (f.currency ? ". Amounts in " + f.currency + "." : "."),
        documentMeta: coverLines(f),
        documentLogo: brandPictures(f.brandInventoryValue).logo,
        // Wide tables: printed sideways, in the PDF.
        landscape: true,
        sections: [
            ...tables.map((entry, index) => section(index + 1, entry.title, [
                ...(entry.note ? paragraph(entry.note) : []),
                ...forecastTableBlocks(entry, whole, f.currency)
            ])),
            section(tables.length + 1, "Notes", list(forecast.notes))
        ]
    };
}
