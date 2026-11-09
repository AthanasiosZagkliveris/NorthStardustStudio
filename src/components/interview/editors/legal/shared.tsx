import type { StageKey } from "../../../../framework/engine/BusinessStage.ts";
import { ReactNode } from "react";
import { BUSINESS_STAGE_WORDS, SCHEME_CODE_LABEL, schemeKeyOf } from "../../../../framework/engine/ActivityClassification.ts";
import { choiceLimit } from "../../../../framework/engine/PositioningIds.ts";
import { isoToDisplay } from "../../fields/DateCellInput.tsx";
import { PreferencesService } from "../../../../services/PreferencesService.ts";
import { FoundersProfileValue, LegalEntityValue, todayIsoDate, createLegalEntityExpense } from "../../../../framework/engine/AnswerUtils.ts";
import { InfoPoint } from "../../fields/InfoNote.tsx";
import { SOURCES } from "../../../../framework/engine/Sources.ts";
import { FIRST_VERSION_COUNTRIES } from "../../../../framework/engine/LegalEntityJurisdictions.ts";
import { categoryOfModel, orderedByCategory, relationshipFits, relationshipFitsBuyerStage, userStageFits } from "../../../../framework/engine/RelationshipFit.ts";
import { differentiationByLifeStage, differentiationByPurpose, differentiationByRelationship, differentiationRelevance, orderedByRelevance, outcomesByLifeStage, userOutcomeByPurpose } from "../../../../framework/engine/PurposeRelevance.ts";

/**
 * A Legal Form saved as "Other (not listed)" before 2026-10-30. The list no
 * longer offers it (doc 33, section 9; the owner): an older answer still
 * shows, with its typed name, until it is changed.
 */
export const LEGAL_FORM_OTHER = "Other (not listed)";

/**
 * How LEGAL_FORM_OTHER is SHOWN: a picker option holds no bracketed
 * note (docs/ai/layout-rules.md), and the field that follows it names
 * the form. What is saved stays LEGAL_FORM_OTHER.
 */
export const OTHER_OPTION = "Other";

/** A saved value as its picker shows it, and back. */
export function shownOther(value: string): string {
    return value === LEGAL_FORM_OTHER ? OTHER_OPTION : value;
}

export function savedOther(value: string): string {
    return value === OTHER_OPTION ? LEGAL_FORM_OTHER : value;
}

/** Why ownership must total 100%, the "i" beside the running total. */
export const TOTAL_OWNERSHIP_HELP: InfoPoint[] = [
    {
        title: "Formula",
        text: "Each owner's % = their shares ÷ total shares, so the total must be 100%"
    }
];

/** How many further numbers a list takes after its first (the registrations, the tax registrations): enough for any real organization, not an invitation to type more. */
export const MAX_MORE_NUMBERS = 5;

/** The longest further number (a trade mark, a licence): any characters, no more than this. */
export const MAX_OTHER_NUMBER_LENGTH = 30;

/**
 * The seven answers on this page a founder cannot be expected to
 * know cold, and the most anyone needs to be told about each (see
 * InfoNote). Three points is the cap, and most take fewer: this is
 * a footnote, not a manual.
 *
 * Each one says what the field IS. Not what it is not -- a note
 * that spends a line ruling something out has spent it on the
 * reader's wrong guess rather than on the answer -- and not which
 * answer to give, which is theirs and their jurisdiction's.
 */
/** The four stages of the US Small Business Administration's business guide (design document 28, I8), in its order: its headings (Plan, Launch, Manage, Grow your business) said as the stage a business is in. */
export const BUSINESS_STAGES = [
    { id: "plan", label: "Planning" },
    { id: "launch", label: "Launching" },
    { id: "manage", label: "Managing" },
    { id: "grow", label: "Growing" }
] as const;

export type CustomerType = "b2c" | "b2b" | "b2g" | "g2b" | "both" | "";
export type MarketType = "single" | "multi" | "";

/** Seller & Buyer Relationship (design document 28, 8.2): the owner's words as written, one choice. */
export const CUSTOMER_TYPES = [
    { id: "b2c", label: "B2C (Business-to-Consumer)" },
    { id: "b2b", label: "B2B (Business-to-Business)" },
    { id: "b2g", label: "B2G (Business-to-Government)" },
    { id: "g2b", label: "G2B Context (Regulatory/Compliance)" }
] as const;

/** Market Structure: the owner's words as written, one choice. */
export const MARKET_TYPES = [
    { id: "single", label: "Single-sided Market" },
    { id: "multi", label: "Multi-sided Market / Platform" }
] as const;

/** Audience Specialisation & Scale (a business or public buyer), one choice. */
export const AUDIENCE_SCALES = [
    { id: "solo", label: "Solopreneurs & Freelancers" },
    { id: "smb", label: "Startups & SMBs" },
    { id: "mid", label: "Mid-Market" },
    { id: "enterprise", label: "Enterprise or Public Sector" }
] as const;

/** Buyer's Life-Stage (a consumer buyer), one choice. The buyer's category (direct, proxy, dual-intent) is a question of its own. */
export const LIFE_STAGES = [
    { id: "young", label: "Students / Young Adults" },
    { id: "adult", label: "Workers / Professionals" },
    { id: "senior", label: "Seniors" }
] as const;

/** Administrative Level (Jurisdiction Scale) of a public buyer (B2G). */
export const JURISDICTIONS = [
    { id: "local", label: "Local Government" },
    { id: "regional", label: "Regional Administration" },
    { id: "central", label: "Central Government & Ministries" },
    { id: "institutional", label: "Institutional / Public Organisations" }
] as const;

/** Regulatory Intensity of the target industry (G2B context). */
export const REGULATORY_INTENSITIES = [
    { id: "lowreg", label: "General Commerce / Mass Market" },
    { id: "specialized", label: "Specialised Sectors" },
    { id: "heavy", label: "Heavily Regulated Markets" },
    { id: "crossborder", label: "Cross-border Trade" }
] as const;

/**
 * THE FIRST VERSION (design document 33, section 4): a single-sided market, and the seller and buyer relationships B2C and B2B. B2G and G2B, and the multi-sided market, are built and hidden:
 * they are a future feature (document 33), and an older answer that holds them is read without them (AnswerLegal.ts).
 */
export const FIRST_VERSION_CUSTOMER_TYPES = CUSTOMER_TYPES.filter(type => type.id === "b2c" || type.id === "b2b");

/** The buyer's category (document 33, section 5): what the buyer buys for. One choice for each relationship, saved as "b2c:proxy". */
export const BUYER_CATEGORIES = [
    { id: "direct", label: "Direct Buyers" },
    { id: "proxy", label: "Proxy Buyers" },
    { id: "dual", label: "Dual-Intent Buyers" }
] as const;

/**
 * The End User, asked when the buyer's category is Proxy or Dual-Intent: the buyer and user relationship of the model, and (a consumer buyer) the user's life stage. The two "Other" rows are
 * no longer offered (owner, 2026-11-09: they record nothing the app can use); they stay in the lists so that a saved one still reads, shows until it is unticked and opens the same questions.
 */
export const BUYER_USER_RELATIONS = {
    b2c: [
        { id: "rel:parent", label: "Parent or guardian" },
        { id: "rel:caregiver", label: "Caregiver" },
        { id: "rel:family", label: "Family member" },
        { id: "rel:partner", label: "Spouse or partner" },
        { id: "rel:friend", label: "Friend or acquaintance" },
        { id: "rel:commercial", label: "Commercial & Professional" },
        { id: "rel:otherpersonal", label: "Other" }
    ],
    b2b: [
        { id: "rel:employer", label: "Employer" },
        { id: "rel:copartner", label: "Business partner" },
        { id: "rel:serving", label: "Business serving clients" },
        { id: "rel:intermediary", label: "Professional intermediary" },
        { id: "rel:sponsor", label: "Sponsor or funder" },
        { id: "rel:institution", label: "Institution or membership body" },
        { id: "rel:otherbusiness", label: "Other" }
    ]
} as const;
/** The relationships kept for a saved answer only, never offered to a new choice (owner, 2026-11-09). */
export const RELATIONS_NOT_OFFERED: readonly string[] = ["rel:otherpersonal", "rel:otherbusiness"];
export const USER_LIFE_STAGES = [
    { id: "age:minor", label: "Minors" },
    { id: "age:young", label: "Young Adults" },
    { id: "age:adult", label: "Adults" },
    { id: "age:senior", label: "Seniors" }
] as const;

/** The purpose of the offering: the twelve of document 31, section 7. */
export const PURPOSES = [
    { id: "learning", label: "Learning & Development" },
    { id: "health", label: "Health, Care & Wellbeing" },
    { id: "gifting", label: "Gifting & Appreciation" },
    { id: "entertainment", label: "Entertainment & Enjoyment" },
    { id: "social", label: "Social Connection & Relationships" },
    { id: "productivity", label: "Productivity & Efficiency" },
    { id: "growth", label: "Business Growth & Performance" },
    { id: "creation", label: "Creation & Expression" },
    { id: "everyday", label: "Everyday Needs & Convenience" },
    { id: "protection", label: "Protection & Risk Reduction" },
    { id: "compliance", label: "Compliance & Obligations" },
    { id: "access", label: "Access & Social Support" }
] as const;

/** Differentiation: what the OFFERING does differently from the competitors (the owner's words). */
export const DIFFERENTIATIONS = [
    { id: "cost", label: "Cost-driven" },
    { id: "convenience", label: "Convenience-driven" },
    { id: "compliance", label: "Compliance, Risk & Security" },
    { id: "premium", label: "Status & Premium" },
    { id: "performance", label: "Performance & Innovation" },
    { id: "ecosystem", label: "Ecosystem & Integration" },
    { id: "personal", label: "Personal Service & Relationship" }
] as const;

/* (The Outcome for the buyer left Positioning on 2026-11-08, owner: the Offering's O4 owns it; a saved answer starts O4 through the crosswalk, doc 34, 5.2a. Its words stay
   for the saved answer: OUTCOME_WORDS, ActivityClassification.ts.) */

/** Outcome for the user, asked of a Proxy or Dual-Intent Buyer: what matters most to the user. Asked on the Segment's End user part since 2026-11-08 (SegmentQuestions.ts, `u-outcome`); the order below. */
export const USER_OUTCOMES = [
    { id: "enjoy", label: "Enjoyment & fun" },
    { id: "comfort", label: "Comfort & ease" },
    { id: "safety", label: "Safety & care" },
    { id: "learning", label: "Learning & growth" },
    { id: "belong", label: "Looks & belonging" },
    { id: "practical", label: "Practical use" }
] as const;

/** The Positioning answers that order the Differentiation and the end user's outcome (asked on the Business System since 2026-11-08, ordered as they were on Positioning). */
export interface PositioningOrder {
    customerType: readonly string[];
    audience: readonly string[];
    buyerCategory: readonly string[];
    endUser: readonly string[];
    purpose: readonly string[];
}

/** Whether a relationship's buyer is a Proxy or Dual-Intent buyer (an end user follows). */
function endsUserOf(order: PositioningOrder, model: string): boolean {
    return order.buyerCategory.includes(model + ":proxy") || order.buyerCategory.includes(model + ":dual");
}

/** The buyer's and the user's life stages, once a consumer buyer has an end user: the first key of the differentiations and of the outcomes (the owner's precedence, 2026-10-30). */
function lifeStagesOf(order: PositioningOrder): { buyer: string[]; user: string[] } {
    const consumer = order.customerType.includes("b2c") && endsUserOf(order, "b2c");
    return {
        buyer: consumer ? order.audience.filter(id => ["young", "adult", "senior"].includes(id)) : [],
        user: consumer ? order.endUser.filter(id => id.startsWith("age:")) : []
    };
}

/**
 * THE DIFFERENTIATIONS IN THEIR ORDER (as built on Positioning; doc 31, the owner's tables): a business buyer's audience scale and category order them (a blank of the scale's table is not
 * offered; one already chosen stays), otherwise the buyer's category does; the business relationships, the purposes chosen and the life stages come before them, in that precedence.
 */
export function differentiationOptionsFor(order: PositioningOrder, chosen: readonly string[]): { id: string; label: string }[] {
    const models = [...order.customerType];
    const scales = models.includes("b2b") ? order.audience.filter(id => ["solo", "smb", "mid", "enterprise"].includes(id)) : [];
    const about = differentiationRelevance({ models, categories: [...order.buyerCategory], relationships: [], businessScales: scales });
    const first = about ? orderedByRelevance(DIFFERENTIATIONS, about).filter(option => about[option.id] > 0 || chosen.includes(option.id)) : orderedByCategory(DIFFERENTIATIONS, order.buyerCategory);
    const options = orderedByRelevance(orderedByRelevance(first, differentiationByRelationship(order.endUser)), differentiationByPurpose(order.purpose));
    const life = lifeStagesOf(order);
    return orderedByRelevance(options, differentiationByLifeStage(life.buyer, life.user));
}

/** THE END USER'S OUTCOMES IN THEIR ORDER (as built on Positioning): the purposes chosen, then the life stages. */
export function userOutcomeOptionsFor(order: PositioningOrder): { id: string; label: string }[] {
    const life = lifeStagesOf(order);
    return orderedByRelevance(orderedByRelevance(USER_OUTCOMES, userOutcomeByPurpose(order.purpose)), outcomesByLifeStage(life.buyer, life.user)?.user ?? null);
}

/** How many choices a question allows at the business stage (defined in the engine, where the Segment's questions read it too). */
export { choiceLimit, type PositioningQuestion } from "../../../../framework/engine/PositioningIds.ts";

/**
 * What the business stage allows in a question, for its "i" (before its sources): "At this stage (Planning): choose one. When the stage changes (the Opening Date), an answer over the
 * limit goes back to empty." One sentence for Positioning's questions and for the ones that left it for the Business System (2026-11-08).
 */
export function stageLimitLine(stage: string, limit: number | null): string {
    return "At this stage (" + (BUSINESS_STAGE_WORDS[stage] ?? "Planning") + "): "
        + (limit === null ? "choose as many as apply." : limit === 1 ? "choose one." : "choose up to " + limit + ".")
        + " When the stage changes (the Opening Date), an answer over the limit goes back to empty.";
}

/** An "i" with the stage's line added before its sources. */
export function withStageLine(info: readonly InfoPoint[], line: string): InfoPoint[] {
    const sourceAt = info.findIndex(point => typeof point !== "string" && "source" in point);
    return sourceAt < 0 ? [...info, line] : [...info.slice(0, sourceAt), line, ...info.slice(sourceAt)];
}

/**
 * WHAT A STAGE LOCKS for a public buyer or the compliance context (the owner's framework, 2026-10-24): the central government and the heavily regulated markets are not open while planning
 * and launching; the beachhead (local government, general commerce) is. Returns the ids locked.
 */
export function lockedAudience(stage: string, model: string): string[] {
    const early = stage !== "manage" && stage !== "grow";
    if (!early) {
        return [];
    }
    return model === "b2g" ? ["central"] : model === "g2b" ? ["heavy"] : [];
}

/**
 * THE ANSWERS FOLLOW THE STAGE (owner, 2026-10-25): when the Opening Date, or a duration, moves the business into another stage, the questions of Early Positioning take that stage's set-up. A question whose answers do not fit
 * it (more than the stage allows, or a choice the stage locks) goes back to its default, empty; a question that fits keeps its answers. The last question is asked once, or once for each side of a platform
 * (while managing or growing, with several relationships chosen), so answers of the other form go. Returns the organisation itself where nothing changes.
 */
export function fitPositioningToStage<T extends { customerType: string[]; marketType: string; audience: string[]; outcome: string[]; differentiation?: string[]; outcomeUser?: string[]; buyerCategory?: string[]; purpose?: string[]; endUser?: string[] }>(organisation: T, stage: string): T {
    const relationship = choiceLimit(stage, "relationship");
    const customerType = relationship !== null && organisation.customerType.length > relationship ? [] : organisation.customerType;
    // The audience question of each relationship: its options.
    const audienceOptions: Record<string, readonly { id: string }[]> = { b2b: AUDIENCE_SCALES, b2c: LIFE_STAGES };
    const audienceLimit = choiceLimit(stage, "audience");
    let audience = organisation.audience;
    for (const options of Object.values(audienceOptions)) {
        const ids = options.map(option => option.id);
        if (audienceLimit !== null && audience.filter(id => ids.includes(id)).length > audienceLimit) {
            audience = audience.filter(id => !ids.includes(id));
        }
    }
    // The outcome and the purpose: one question each, up to the stage's limit.
    const outcomeLimit = choiceLimit(stage, "outcome");
    const outcome = outcomeLimit !== null && organisation.outcome.length > outcomeLimit ? [] : organisation.outcome;
    const differentiationBefore = organisation.differentiation ?? [];
    const differentiation = outcomeLimit !== null && differentiationBefore.length > outcomeLimit ? [] : differentiationBefore;
    const purposeBefore = organisation.purpose ?? [];
    const purpose = outcomeLimit !== null && purposeBefore.length > outcomeLimit ? [] : purposeBefore;
    // The buyer's category is asked for a relationship that is chosen; the End User for a relationship whose category is Proxy or Dual-Intent.
    const categoryBefore = organisation.buyerCategory ?? [];
    const buyerCategory = categoryBefore.filter(id => customerType.includes(id.split(":")[0]));
    const endUserBefore = organisation.endUser ?? [];
    const endsUser = (model: string) => buyerCategory.some(id => id === model + ":proxy" || id === model + ":dual");
    const groups: [readonly { id: string }[], string, number | null][] = [
        [BUYER_USER_RELATIONS.b2c, "b2c", audienceLimit], [BUYER_USER_RELATIONS.b2b, "b2b", audienceLimit], [USER_LIFE_STAGES, "b2c", audienceLimit]
    ];
    // The user has an outcome of their own only where some buyer is a Proxy or Dual-Intent Buyer.
    const outcomeUserBefore = organisation.outcomeUser ?? [];
    const outcomeUser = !(endsUser("b2c") || endsUser("b2b")) || (outcomeLimit !== null && outcomeUserBefore.length > outcomeLimit) ? [] : outcomeUserBefore;
    let endUser = endUserBefore;
    for (const [options, model, limit] of groups) {
        const ids = options.map(option => option.id);
        if (!endsUser(model) || (limit !== null && endUser.filter(id => ids.includes(id)).length > limit)) {
            endUser = endUser.filter(id => !ids.includes(id));
        }
        // (A Student or Young Adult buyer is not a Commercial & Professional buyer.)
        endUser = endUser.filter(id => relationshipFitsBuyerStage(id, audience));
        // (A user's life stage the buyer's life stage and the relationship leave blank goes: RelationshipFit.ts.)
        endUser = endUser.filter(id => userStageFits(endUser, id, audience));
        // (A relationship that cannot be the chosen category goes with the change of category.)
        const category = categoryOfModel(buyerCategory, model);
        endUser = endUser.filter(id => !ids.includes(id) || relationshipFits(id, category));
    }
    const same = (one: string[], other: string[]) => one.length === other.length && one.every((id, index) => id === other[index]);
    return same(customerType, organisation.customerType) && same(audience, organisation.audience) && same(outcome, organisation.outcome) && same(differentiation, differentiationBefore) && same(outcomeUser, outcomeUserBefore) && same(purpose, purposeBefore) && same(buyerCategory, categoryBefore) && same(endUser, endUserBefore)
        ? organisation
        : {
            ...organisation, customerType, audience, outcome,
            ...(organisation.buyerCategory !== undefined || buyerCategory.length > 0 ? { buyerCategory } : {}),
            ...(organisation.differentiation !== undefined || differentiation.length > 0 ? { differentiation } : {}),
            ...(organisation.outcomeUser !== undefined || outcomeUser.length > 0 ? { outcomeUser } : {}),
            ...(organisation.purpose !== undefined || purpose.length > 0 ? { purpose } : {}),
            ...(organisation.endUser !== undefined || endUser.length > 0 ? { endUser } : {})
        };
}

/** The name of the positioning tile follows the business stage (defined with the exports' words). */
export { positioningName } from "../../../../framework/engine/ActivityClassification.ts";

/** The "i" of the Activities: the first is the primary one, others may be added, and each ends in the code the country's register uses. */
export function activitiesInfo(country: string): string {
    if (!FIRST_VERSION_COUNTRIES.includes(country)) {
        return "The first is the primary activity; add others, up to four in all. Type each activity and its code: the official code your country's register uses.";
    }
    return "The first is the primary activity; add others, up to four in all. Each one ends in one official code of your country (the " + SCHEME_CODE_LABEL[schemeKeyOf(country)] + " code).";
}

export const INFO = {

    activityCode: [
        "The official code for the organisation's main activity: it classifies what the organisation does.",
        "Asked for when the organisation is registered, and on its annual filings where they apply."
    ],

    requirements: [
        "What else the law asks of this organisation, if anything applies: for example a licence, a professional registration, or a named officer.",
        "Add one if it applies to your activity, your legal form, or where you are registered. If none does, add none."
    ],

    expenses: [
        "What it costs to register and keep registered: filing, renewal and agent fees. Each pays for one registration.",
        "Insurance, licences and certificates are recorded in Documents & Rights, on 3. Infrastructure & Capability.",
        "Add the ones that apply. If there are none, add none."
    ],

    mainActivity: [
        "Who are you, and what do you do? What do you create or provide?",
        "Write it as a registry or a bank would expect to read it.",
        "Name, country, address and legal form are above."
    ],

    registrationDate: [
        "The day the organisation was registered with the registry of its country.",
        "It cannot be later than today, nor later than the Opening Date: the business cannot open before the company exists."
    ],

    openingDate: [
        "The day the business opens and issues its first receipt. It sets the stage: planning before it, launching from it.",
        "The stage also sets Positioning's name and how many choices each of its questions allows; an answer that no longer fits a new stage goes back to empty.",
        "The days from the plan's start to the day before it are the pre-operational period: every cost is split around it by its own dates."
    ],

    businessStage: [
        "Set by the Opening Date and the durations below: planning before the opening, then launching, managing and growing, each for the time set here. Change the Opening Date, or a duration, to change the stage.",
        "The four stages are those of the US Small Business Administration's business guide."
    ],

    customerType: [
        "Who pays: the buyer who approves the budget, who may not be the person who uses it.",
        "The positioning statement is written for the buyers; each distinct group of them may need its own.",
        "B2C (Business-to-Consumer): individuals or consumers who pay for personal or family use.",
        "B2B (Business-to-Business): businesses, companies, freelancers or public bodies.",
        { title: "Based on", source: SOURCES.positioningStatement },
        { title: "Also", source: SOURCES.positioningTemplate }
    ],

    marketType: [
        "Determines whether your product operates autonomously or requires the creation of a two-sided ecosystem.",
        "Single-sided Market: we sell a product or service directly to a specific audience of buyers. One group pays, and the product does not need another group to be worth buying.",
        "Multi-sided Market / Platform: we build a platform/marketplace that connects and facilitates direct transaction between two or more distinct groups (e.g. drivers and passengers).",
        "Multi-sided while planning or launching: choose the most critical side for the startup (usually the one that pays) and answer the questions below only for that side.",
        "Multi-sided while managing or growing: you can choose several sides in the seller and buyer relationship; each side opens its own questions, and the last question is asked for each side."
    ],

    audienceScale: [
        "Limits the target group to a specific niche, aligning the startup with the corresponding sales cycle and the buyer's daily life.",
        "Solopreneurs & Freelancers: individual professionals (immediate decision, need for low cost or self-service).",
        "Startups & SMBs: small and medium-sized or rapidly growing companies (need for speed, flexibility and an immediate solution).",
        "Mid-Market: medium-sized businesses with structured departments (need for workflows, roles and scale).",
        "Enterprise or Public Sector: multinationals or public bodies (multi-month sales or tender cycle, need for maximum security).",
        { title: "Based on", source: SOURCES.marketResearch }
    ],

    lifeStage: [
        "Limits the target group to a specific niche, aligning the startup with the corresponding sales cycle and the buyer's daily life.",
        "Students / Young Adults: they buy for themselves; tech-savvy, low budget, sensitive to trends.",
        "Workers / Professionals: they buy for themselves, with their own income; they seek time savings, convenience or status and decide inside a busy working life.",
        "Seniors: they buy for themselves, often on a fixed income and with time to compare; they look for accessibility, simplicity, trust and health support.",
        "Where a family member buys for them, the buyer's category below is Proxy or Dual-Intent.",
        { title: "Based on", source: SOURCES.marketResearch },
        { title: "Also", source: SOURCES.brandPositioningStatement }
    ],

    jurisdiction: [
        "What is the jurisdiction scale of the target public entity?",
        "Local Government: municipalities, communities, local municipal enterprises. The ideal beachhead while planning and launching.",
        "Regional Administration: regions and regional development organisations.",
        "Central Government & Ministries: ministry, national services, security forces. Locked while planning and launching.",
        "Institutional / Public Organisations: public hospitals, universities, ports, public utilities."
    ],

    regulatory: [
        "What is the regulatory intensity of the target industry?",
        "General Commerce / Mass Market (low regulation): e-commerce, retail, catering (basic obligations such as myDATA or a POS interface). The ideal beachhead.",
        "Specialised Sectors (medium regulation): logistics, construction, real estate (environmental permits, special registers).",
        "Heavily Regulated Markets (high regulation): FinTech, pharma, medical centers, banks. Locked while planning and launching.",
        "Cross-border Trade (customs and cross-border compliance): import/export companies (customs, international duties, cross-border compliance)."
    ],

    buyerCategory: [
        "What the buyer buys for. It tells the buyer who pays from the person who uses it, whatever the buyer's life stage or scale.",
        "Direct Buyers: purchasing exclusively for their own personal use.",
        "Proxy Buyers: purchasing exclusively on behalf of someone else (a gift, a parent buying for a child, an employer buying for its staff).",
        "Dual-Intent Buyers: purchasing a single offering to be used by themselves and their dependents (a family plan, a shared tier).",
        "For Proxy and Dual-Intent Buyers the questions about the end user follow.",
        { title: "Based on", source: SOURCES.buyingRoles }
    ],

    buyerUserRelation: [
        "How is the buyer related to the person who will use it? It shapes the message: a parent is reached by safety and trust, an employer by compliance and duty of care.",
        "Only the relationships that fit the buyer's category above are offered.",
        "Institution or membership body: a school for its pupils, a care home for its residents, a club or union for its members, a council for its residents."
    ],

    userLifeStage: [
        "The life stage of the person who will use it. A broad group is enough to give the end user's Profile its first shape; the exact age comes later, on the Profile.",
        "Minors: under 18; some goods and online services have extra rules for them. Young Adults: 18 to 24. Adults: 25 to 64. Seniors: 65 and over.",
        "The Segment then asks the end user's stage within it (Baby, Child, Teenager and so on)."
    ],

    purpose: [
        "Why the offering is bought: the purpose it serves for the person who gets it. Choose the ones that fit best.",
        "Only the purposes that fit your answers above are offered: the primary ones first, then the possible ones."
    ],

    differentiation: [
        "What the offering does differently from the competitors: where it hits exactly the blind spot they leave.",
        "It is about the offering; the result the buyer gets from it is asked on each Offering.",
        "Cost-driven (saving resources): targets the blind spot of expensive competitors with a budget-friendly alternative.",
        "Convenience-driven (speed and ease): targets the blind spot of complex or slow solutions.",
        "Compliance, Risk & Security: targets the blind spot of uncertified or questionable alternatives.",
        "Status & Premium (exclusivity): targets the blind spot of mass-market or cheap products with top quality and custom service.",
        "Performance & Innovation (product superiority): targets the blind spot of dated or underpowered alternatives with better results and newer methods.",
        "Ecosystem & Integration (fits what they already use): targets the blind spot of standalone tools that do not connect to the buyer's other systems and workflows.",
        "Personal Service & Relationship (customer intimacy): targets the blind spot of impersonal providers with a service shaped around each customer.",
        { title: "Based on", source: SOURCES.strategicPositioning },
        { title: "Also", source: SOURCES.positioningTemplate }
    ],

    legalForm: [
        "Decides who is liable for the organisation's debts: the organisation, or you personally.",
        "Decides how it is taxed, and whether it must hold share capital."
    ],

    capital: [
        "Capital is what the founders put into the organisation to start it.",
        "Some legal forms set a minimum amount; many set none.",
        "Tick it to record how much each founder put in."
    ],

    registrationStatus: [
        "Registered: the organisation exists in the public register, with a date and a number.",
        "Not yet registered: you are planning it. Choose the legal form you intend to use; the date, the registration number and the tax numbers can wait until it is registered."
    ],
    registrationAuthority: [
        "The body that keeps the public register your organisation is listed on.",
        "Filled in from the country you chose. Change it to match yours."
    ],

    taxNumber: [
        "The number the tax office knows the organisation by.",
        "In some countries it is the registration number; in others it is issued separately when you register for tax."
    ],

    links: [
        "Says which registration or requirement this expense pays for. Only one can be chosen.",
        "Lists what you have already recorded further up the page."
    ]

};

export interface LegalEntityEditorProps {

    value: unknown;

    /** The Opening Date of the Global Settings: the company cannot be formed after it. */
    openingDate?: string;
    /** The business stage the Opening Date and the Global Settings' durations give (BusinessStage.ts): the limits and the locks of Early Positioning follow it. Planning where none is given. */
    businessStage?: StageKey;
    /** Saves the Opening Date (kept in the Global Settings): its field is on the Organization tile. */
    onChangeOpeningDate?: (iso: string) => void;

    onChange: (value: LegalEntityValue) => void;

    disabled?: boolean;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

    /** The page drawn as four tiles (the page's tile system) instead of one long page; the app draws it so, the editor's own tests the whole page. */
    asTiles?: boolean;

    /** Only the floating cards of the page (a legal card called from another page, e.g. 3. Infrastructure & Capability): the tiles themselves are not drawn. */
    cardsOnly?: boolean;

    /** The frame's heading, on top of its tiles (a page of several sections). */
    frameTitle?: string;

    /** Only the Organization's dialog (the Organization tile of page 1, Definition): its fields, drawn as the tile's dialog body. */
    organizationOnly?: boolean;
    /** Only the Founders & Ownership tile's dialog (the tile stands on 1. Definition; its answer is this page's). */
    foundersOnly?: boolean;

    /** Only the Positioning questions (market structure, seller and buyer relationship, audience, outcome): the body of the Positioning tile's dialog, above its Notes (design document 28, 8.2). */
    audienceOnly?: boolean;

    /** The Description, which the Identity System's Definition keeps (its saved value); where it is given the Description box reads and writes it, else the organisation's own text (the old Main Activity). */
    description?: string;
    onDescriptionChange?: (next: string) => void;

    /**
     * What the app already knows about this organization and the
     * person filling the form in, used to answer the first fields
     * for them (see the prefill effect below). Every one of them is
     * an ordinary editable field afterwards.
     */
    prefill?: {
        organisationName: string;
        founderName: string;
    };

    /** Saves the Founders Profile: where the page holds the founders (the sub tiles of Founders & Ownership) and the Capability tile, not a page of their own. */
    onChangeFoundersProfile?: (value: FoundersProfileValue) => void;

    /**
     * 4. Founders Profile, as saved. A founder with a profile there
     * is never one of the empty rows a one-owner legal form clears
     * away (see founderIsEmpty).
     */
    foundersProfile?: unknown;

}

/** A stored day as the reader's date format shows it (day/month/year or month/day/year); the text itself where it is not a day. */
/** Today, `years` from now, as a date input's "YYYY-MM-DD". */
export function yearsAhead(years: number): string {
    const today = new Date();
    const date = new Date(today.getFullYear() + years, today.getMonth(), today.getDate());
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

/** THE DATE DEFINES THE ORDER (then the number): the expenses stand in the order of their Dates, the earliest first; the same date keeps its place, none goes last. */
export function withExpensesInOrder(entity: LegalEntityValue): LegalEntityValue {
    const key = (date: string) => date || "9999-99-99";
    const ordered = entity.expenses.map((expense, at) => ({ expense, at })).sort((a, b) => key(a.expense.date) < key(b.expense.date) ? -1 : key(a.expense.date) > key(b.expense.date) ? 1 : a.at - b.at).map(entry => entry.expense);
    return ordered.every((expense, at) => expense === entity.expenses[at]) ? entity : { ...entity, expenses: ordered };
}

/**
 * THE EXPENSES MADE BY REQUIREMENTS ("Add to Legal Entity Expenses"): a ticked requirement has one expense, named as the requirement is and linked to it; unticked
 * (or removed), its expense goes with it.
 */
export function withAutoExpenses(entity: LegalEntityValue, create = true): LegalEntityValue {
    const wanted = entity.requirements.filter(requirement => requirement.offerInExpenses);
    let changed = false;
    // (An expense a saved answer already linked to a ticked requirement becomes the one that requirement made.)
    const adopted = new Set<string>();
    const expenses = entity.expenses.map(expense => {
        if (expense.fromRequirement !== "") {
            return expense;
        }
        const parent = wanted.find(requirement => expense.links.includes(requirement.id)
            && !adopted.has(requirement.id)
            && !entity.expenses.some(other => other.fromRequirement === requirement.id));
        if (!parent) {
            return expense;
        }
        adopted.add(parent.id);
        changed = true;
        return { ...expense, fromRequirement: parent.id };
    });
    const kept = expenses.flatMap(expense => {
        if (expense.fromRequirement === "") {
            return [expense];
        }
        const parent = wanted.find(requirement => requirement.id === expense.fromRequirement);
        if (!parent) {
            changed = true;
            return [];
        }
        if (expense.name === parent.name && expense.links.length === 1 && expense.links[0] === parent.id) {
            return [expense];
        }
        changed = true;
        return [{ ...expense, name: parent.name, links: [parent.id] }];
    });
    const missing = !create ? [] : wanted.filter(requirement => !kept.some(expense => expense.fromRequirement === requirement.id));
    if (!changed && missing.length === 0) {
        return entity;
    }
    return {
        ...entity,
        expenses: [...kept, ...missing.map(requirement => ({ ...createLegalEntityExpense(), name: requirement.name, links: [requirement.id], fromRequirement: requirement.id }))]
    };
}

/** What is wrong with the Formation's date, in words (an empty list when nothing is). */
export function formationIssues(formation: { date: string }, openingDate = ""): string[] {
    if (formation.date === "") {
        return [];
    }
    const format = PreferencesService.getDateFormat();
    return [
        ...(formation.date > todayIsoDate() ? ["A registered company has already been formed, so its date cannot be later than today. Correct the date."] : []),
        ...(openingDate !== "" && formation.date > openingDate ? ["The company is formed (" + isoToDisplay(formation.date, format) + ") after the Opening Date (" + isoToDisplay(openingDate, format) + "): the business cannot open before the company exists. Change one of the two dates."] : [])
    ];
}

export const shownDay = (iso: string) => isoToDisplay(iso, PreferencesService.getDateFormat()) || iso;
