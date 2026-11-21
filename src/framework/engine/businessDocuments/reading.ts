/* Part of BusinessDocuments.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; BusinessDocuments.ts re-exports every part). */

import { stageOf } from "../BusinessStage.ts";
import { AnswerType } from "../../enums/AnswerType.ts";
import { type InterviewSession } from "../../interview";
import { STRATEGY_MONTH_NAMES, type ExportBlock, type ExportContext, type ExportImage, type LegalEntityValue, type StrategyMonthValue, asBrandInventoryValue, asBrandStyleValue, asBusinessEngagementValue, asLegalEntityValue, asStrategicPeriodValue, asStrategyFoundationValue, brandMarkFile, businessFoundationSegments, isExportableImage } from "../answers/AnswerUtils.ts";
import { type ExportSectionContent } from "../export/ExportContentBuilder.ts";
import { sessionExportContext } from "../export/ExportContentBuilder.ts";
import { ownersTakeDrawings } from "../financial/FinancialForecast.ts";
import { capabilityOf, costLines, heading, labelled } from "../export/ExportRenderers.ts";
import { planLength, withDemand, allFunding, asFinancialFoundationValue, asFinancialSustainabilityValue, financialPosition, fundingType, isNonCash, statusStanding, parseAmount, moneyFormatter, planMonthLabel, incomeTaxRate, assetUnitCostsOf, sustainability, withPlanStart, derivedPlanStart, legalExpenseDates, costStartDates, type CostLine, type RevenueStreamValue } from "../financial/FinancialModel.ts";
import { calculatedLines } from "../financial/CalculatedLines.ts";
import { contingencyFunds, launchNeedOf } from "../financial/ContingencyFunds.ts";
import { asGlobalSettings, capitalisationLimitOf, stageDurationsOf } from "../GlobalSettings.ts";
import { countryCurrency } from "../legal/LegalEntityJurisdictions.ts";
import { joinNames, preparedMonth, websiteOf } from "./plan.ts";
import { segmentIdentityOf, settledSegmentAnswers } from "../SegmentContext.ts";
import { effectiveOfferingAnswers, effectiveProfileAnswers } from "../answers/EffectiveAnswers.ts";
import { openItemObjective, valuePropositionOpenItems } from "../choices/OfferingQuestions.ts";
import { neededSkills } from "../capability/skills.ts";
import { asFoundersProfileValue } from "../answers/AnswerUtils.ts";
import { changeEffectLines, type StrategyChoiceContext } from "../choices/StrategyChoices.ts";
import { asVisionReach, reachRank, widestSegmentReach } from "../choices/VisionChoices.ts";
import { DIFFERENTIATION_PHRASES } from "../choices/AmbassadorChoices.ts";

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

    /* THE MARKET, THE COMPETITION AND THE READINESS (doc 49, sections 2.3 and 10; the round of 2026-11-20 18:35 UTC+2, approved at 22:08): each Segment's market
       growth and crowding, its named competitors and what it stands out for (K14), and, from Launching on, each Offering not ready to sell (O2). */
    const identity = segmentIdentityOf(f.legalEntity.organisation, f.stage);
    const market = f.segments.flatMap(segment => {
        const answers = settledSegmentAnswers(segment, f.legalEntity.organisation);
        const growth = Number(answers.trajectory?.[0] ?? 0);
        const crowded = Number(answers.competition?.[0] ?? 0);
        const traits = [growth >= 4 ? "is growing" : growth >= 1 && growth <= 2 ? "is shrinking" : "", crowded >= 4 ? "is crowded, with established players" : crowded >= 1 && crowded <= 2 ? "has few competitors yet" : ""].filter(Boolean);
        const name = segment.name.trim();
        const rivals = segment.competitors.filter(competitor => competitor.name.trim()).length;
        const standOut = (answers.differentiation ?? []).map(id => DIFFERENTIATION_PHRASES[id] ?? "").filter(Boolean);
        return [
            traits.length > 0 ? (name ? "The market for " + name : "Our customers' market") + " " + joinNames(traits) + "." : "",
            rivals > 0 ? "We have named " + rivals + (rivals === 1 ? " competitor" : " competitors") + (name ? " for " + name : "") + (standOut.length > 0 ? "; we stand out for " + joinNames(standOut) : "") + "." : ""
        ].filter(Boolean);
    });
    const notReady = f.stage === "plan" ? [] : f.segments.flatMap(segment => segment.offerings
        .filter(offering => offering.name.trim() && ["building", "idea"].includes(effectiveOfferingAnswers(offering, segment, identity).o2?.[0] ?? ""))
        .map(offering => offering.name.trim() + " is still being built."));

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

    return [...selling, ...market, ...notReady, ...reach, finance.join(" ")].filter(Boolean).join("\n");

}

/**
 * THE SWOT'S STARTS FROM THE MARKET (owner, 2026-11-17): each Segment's market growth (trajectory) and how crowded it is (competition), both ratings, as an
 * Opportunity or a Threat line. A growing market (4 or 5) and an open one (1 or 2) are Opportunities; a shrinking market (1 or 2) and a crowded one (4 or 5) are
 * Threats. A quadrant shows them while it was never edited; once edited, the founder's own lines stand (as the Current Situation's draft does).
 */
export function swotStartsOf(f: Foundation): { opportunities: string[]; threats: string[] } {
    const opportunities: string[] = [];
    const threats: string[] = [];
    for (const segment of f.segments) {
        const answers = settledSegmentAnswers(segment, f.legalEntity.organisation);
        const name = segment.name.trim();
        const market = name ? "The market for " + name : "Your customers' market";
        const growth = Number(answers.trajectory?.[0] ?? 0);
        const crowded = Number(answers.competition?.[0] ?? 0);
        if (growth >= 4) {
            opportunities.push(market + " is growing.");
        } else if (growth >= 1 && growth <= 2) {
            threats.push(market + " is shrinking.");
        }
        if (crowded >= 4) {
            threats.push(market + " is crowded, with established players.");
        } else if (crowded >= 1 && crowded <= 2) {
            opportunities.push(market + " has few competitors yet.");
        }
    }
    // (SW1's lines, where the founder rated a change: doc 49, 2.3. The Strategy page adds them from its own open answer, as it is typed.)
    const changes = changeEffectLines(f.strategyFoundation.changeEffects);
    return { opportunities: [...opportunities, ...changes.opportunities], threats: [...threats, ...changes.threats] };
}

/**
 * WHAT THE STRATEGY PAGE'S CHOICES READ (doc 49, 2.3 and 2.4: SW1, SC1 to SC3): the business stage; each Segment's id, name and Differentiation (K14), as its card
 * shows them; the changes the Segments named, the most named first (SW1's start); whether the Vision's PB8 reaches wider than every Segment today (SC2's start).
 */
export function strategyChoiceContextOf(f: Foundation): StrategyChoiceContext {
    const settled = f.segments.map(segment => ({ segment, answers: settledSegmentAnswers(segment, f.legalEntity.organisation) }));
    const named = new Map<string, number>();
    settled.forEach(({ answers }) => (answers.trends ?? []).forEach(id => named.set(id, (named.get(id) ?? 0) + 1)));
    const changeStarts = [...named.entries()].map(([id, count], order) => ({ id, count, order })).sort((a, b) => b.count - a.count || a.order - b.order).map(entry => entry.id);
    const reach = asVisionReach((f.definition as Record<string, unknown> | undefined)?.visionReach);
    const today = widestSegmentReach(settled.map(({ segment, answers }) => ({ name: segment.name, questions: answers })));
    return {
        stage: f.stage,
        changeStarts,
        segments: settled.map(({ segment, answers }) => ({ id: segment.id, name: segment.name.trim(), differentiation: answers.differentiation ?? [] })),
        reachBeyond: !!reach && reachRank(reach) > (today?.rank ?? 0)
    };
}

/** What the Strategy page's choices read (strategyChoiceContextOf), from the sessions. */
export function strategyChoiceContext(sessions: FoundationSessions): StrategyChoiceContext {
    return strategyChoiceContextOf(readFoundation(sessions));
}

/** The SWOT's starts from what the Business System records (swotStartsOf), for the Strategy page. */
export function strategySwotStarts(sessions: FoundationSessions): { opportunities: string[]; threats: string[] } {
    return swotStartsOf(readFoundation(sessions));
}

/**
 * AN OBJECTIVE'S DRAFTS (P9; owner, 2026-11-18 03:01, "All, P1 to P9"): from each Segment's Value Proposition, its open items in plain words -- a value no Offering does best, a need no Offering
 * addresses, a worry no Offering answers --, then each needed skill no one covers yet; each once.
 */
export function strategyObjectiveDrafts(sessions: FoundationSessions): string[] {
    const f = readFoundation(sessions);
    const drafts: string[] = [];
    for (const segment of f.segments) {
        const identity = segmentIdentityOf(f.legalEntity.organisation, f.stage);
        const offerings = segment.offerings.map(offering => effectiveOfferingAnswers(offering, segment, identity));
        const profiles = segment.profiles.map(profile => effectiveProfileAnswers(profile, segment, identity));
        drafts.push(...valuePropositionOpenItems(segment, offerings, profiles).map(openItemObjective).filter((text): text is string => text !== null));
    }
    const founderNames = Object.fromEntries(f.legalEntity.founders.map(founder => [founder.id, founder.name.trim()]));
    drafts.push(...neededSkills(f.capability, asFoundersProfileValue(f.foundersProfile), founderNames).filter(skill => skill.cover.length === 0).map(skill => "Bring in " + skill.label.charAt(0).toLowerCase() + skill.label.slice(1)));
    return [...new Set(drafts)];
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
        ? sessionExportContext(sessions.business, { legalEntity, foundersProfile, currency, businessStage: stage, globalSettings: settings })
        : { legalEntity, foundersProfile, currency, businessStage: stage, globalSettings: settings };

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
        asBusinessEngagementValue(business.responseOf?.(AnswerType.BusinessEngagement)).demand,
        business.responseOf?.(AnswerType.BusinessFoundation)
    );
    // Where the owners take drawings rather than a salary, as the
    // forecast counts them (see FinancialForecast.ts).
    const drawings = ownersTakeDrawings(legalEntity.organisation.legalForm);

    const calculated = settings
        ? calculatedLines({ foundation: financial, revenuePage, lines, capability, settings, openingDate: settings.openingDate, drawings, country: legalEntity.organisation.country, engagement }, incomeTaxRate(financial))
        : undefined;
    // The cash to raise before the opening, which the Establishment need is (ContingencyFunds.ts).
    const natureContext = settings ? { openingDate: settings.openingDate, capitalisationLimit: capitalisationLimitOf(settings), assetUnitCosts: assetUnitCostsOf(capability) } : undefined;
    const chosenNatures = Object.fromEntries(Object.entries(financial.classified).map(([id, entry]) => [id, entry.nature || undefined]));
    const launched = settings && natureContext ? launchNeedOf(lines, natureContext, settings, chosenNatures, calculated) : undefined;
    // The contingency funds, once there is an Opening Date (as the Funding tile showed them; the Funding Request says them now: doc 48, section 14).
    const funds = settings && natureContext && settings.openingDate.trim() !== ""
        ? launched?.funds ?? contingencyFunds(lines, natureContext, settings, chosenNatures, calculated)
        : undefined;

    const position = financialPosition(financial, lines, legalEntity, currency, format, revenuePage, launched?.launch);
    const outlook = sustainability(revenuePage, financial, lines, legalEntity, format, calculated);

    const name = text(legalEntity.organisation.name) || text(sessions.organisationName) || "The organisation";

    return {
        stage,
        legalEntity, foundersProfile, currency, format, drawings, business, strategy, foundationValue, segments,
        capability, engagement, financial, lines, position, revenuePage, outlook, name, calculated,
        // The contingency funds worked out from the Global Settings (the rates and the target are inputs there), for the Funding Request.
        funds,
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
