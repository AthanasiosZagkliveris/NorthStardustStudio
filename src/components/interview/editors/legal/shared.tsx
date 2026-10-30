import type { StageKey } from "../../../../framework/engine/BusinessStage.ts";
import { ReactNode } from "react";
import { SCHEME_CODE_LABEL, schemeKeyOf } from "../../../../framework/engine/ActivityClassification.ts";
import { isoToDisplay } from "../../fields/DateCellInput.tsx";
import { PreferencesService } from "../../../../services/PreferencesService.ts";
import { FoundersProfileValue, LegalEntityValue, todayIsoDate, createLegalEntityExpense } from "../../../../framework/engine/AnswerUtils.ts";
import { InfoPoint } from "../../fields/InfoNote.tsx";
import { SOURCES } from "../../../../framework/engine/Sources.ts";
import { FIRST_VERSION_COUNTRIES } from "../../../../framework/engine/LegalEntityJurisdictions.ts";
import { categoryOfModel, relationshipFits, relationshipFitsBuyerStage, userStageFits } from "../../../../framework/engine/RelationshipFit.ts";

/**
 * The last entry in every Legal Form list. The brief forbids
 * prescribing a legal form, and a list of them goes stale the
 * moment a country adds one -- so the way out is always on offer,
 * inside the list rather than as a second field beside it.
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

/** Seller and Buyer Relationship (design document 28, 8.2): the owner's words as written, one choice. */
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

/** Audience Specialization & Scale (a business or public buyer), one choice. */
export const AUDIENCE_SCALES = [
    { id: "solo", label: "Solopreneurs & Freelancers" },
    { id: "smb", label: "Startups & SMBs" },
    { id: "mid", label: "Mid-Market" },
    { id: "enterprise", label: "Enterprise / Public Sector" }
] as const;

/** Buyer's Life-Stage (a consumer buyer), one choice. The buyer's category (direct, proxy, dual-intent) is a question of its own. */
export const LIFE_STAGES = [
    { id: "young", label: "Students / Young Adults" },
    { id: "adult", label: "Workers / Professionals / Adults" },
    { id: "senior", label: "Seniors" }
] as const;

/** Administrative Level (Jurisdiction Scale) of a public buyer (B2G). */
export const JURISDICTIONS = [
    { id: "local", label: "Local Government" },
    { id: "regional", label: "Regional Administration" },
    { id: "central", label: "Central Government & Ministries" },
    { id: "institutional", label: "Institutional / Public Organizations" }
] as const;

/** Regulatory Intensity of the target industry (G2B context). */
export const REGULATORY_INTENSITIES = [
    { id: "lowreg", label: "General Commerce / Mass Market" },
    { id: "specialized", label: "Specialized Sectors" },
    { id: "heavy", label: "Heavily Regulated Markets" },
    { id: "crossborder", label: "Cross-border Trade" }
] as const;

/**
 * THE FIRST VERSION (design document 33, section 4): a single-sided market, and the seller and buyer relationships B2C and B2B. B2G and G2B, and the multi-sided market, are built and hidden:
 * they are a future feature (document 34), and an older answer that holds them is read without them (AnswerLegal.ts).
 */
export const FIRST_VERSION_CUSTOMER_TYPES = CUSTOMER_TYPES.filter(type => type.id === "b2c" || type.id === "b2b");

/** The buyer's category (document 33, section 5): what the buyer buys for. One choice for each relationship, saved as "b2c:proxy". */
export const BUYER_CATEGORIES = [
    { id: "direct", label: "Direct Buyers" },
    { id: "proxy", label: "Proxy Buyers" },
    { id: "dual", label: "Dual-Intent Buyers" }
] as const;

/** The End User, asked when the buyer's category is Proxy or Dual-Intent: the buyer and user relationship of the model, and (a consumer buyer) the user's life stage. */
export const BUYER_USER_RELATIONS = {
    b2c: [
        { id: "rel:parent", label: "Parent or legal guardian" },
        { id: "rel:caregiver", label: "Caregiver or person responsible for their care" },
        { id: "rel:family", label: "Family member or relative" },
        { id: "rel:partner", label: "Spouse or romantic partner" },
        { id: "rel:friend", label: "Friend or acquaintance" },
        { id: "rel:commercial", label: "Commercial & Professional relationship" },
        { id: "rel:otherpersonal", label: "Other personal relationship" }
    ],
    b2b: [
        { id: "rel:employer", label: "Employer providing for employees" },
        { id: "rel:copartner", label: "Business partner or co-owner" },
        { id: "rel:serving", label: "Business serving its clients or customers" },
        { id: "rel:intermediary", label: "Professional intermediary acting for a client" },
        { id: "rel:sponsor", label: "Sponsor or funder" },
        { id: "rel:otherbusiness", label: "Other business relationship" }
    ]
} as const;
export const USER_LIFE_STAGES = [
    { id: "age:minor", label: "Minors" },
    { id: "age:young", label: "Young Adults" },
    { id: "age:adult", label: "Adults" },
    { id: "age:senior", label: "Seniors" }
] as const;

/** The purpose of the offering: the twelve of document 31, section 7. */
export const PURPOSES = [
    { id: "learning", label: "Learning and Development" },
    { id: "health", label: "Health, Care and Wellbeing" },
    { id: "gifting", label: "Gifting and Appreciation" },
    { id: "entertainment", label: "Entertainment and Enjoyment" },
    { id: "social", label: "Social Connection and Relationships" },
    { id: "productivity", label: "Productivity and Efficiency" },
    { id: "growth", label: "Business Growth and Performance" },
    { id: "creation", label: "Creation and Expression" },
    { id: "everyday", label: "Everyday Needs and Convenience" },
    { id: "protection", label: "Protection and Risk Reduction" },
    { id: "compliance", label: "Compliance and Obligations" },
    { id: "access", label: "Access and Social Support" }
] as const;

/** Differentiation: what the OFFERING does differently from the competitors (the owner's words). */
export const DIFFERENTIATIONS = [
    { id: "cost", label: "Cost-driven" },
    { id: "convenience", label: "Convenience-driven" },
    { id: "compliance", label: "Compliance, Risk & Security" },
    { id: "premium", label: "Status & Premium" }
] as const;

/** Outcome for the buyer: the measurable result the buyer gets (the results the differentiation text names: lower costs, time saved, legal cover, prestige). */
export const OUTCOMES = [
    { id: "savings", label: "Lower costs" },
    { id: "time", label: "Time saved" },
    { id: "assurance", label: "Legal and data-protection cover" },
    { id: "prestige", label: "Higher quality and prestige" }
] as const;

/** Outcome for the user, asked of a Proxy or Dual-Intent Buyer: what matters most to the user. */
export const USER_OUTCOMES = [
    { id: "enjoy", label: "Enjoyment and fun" },
    { id: "comfort", label: "Comfort and ease" },
    { id: "safety", label: "Safety and care" },
    { id: "learning", label: "Learning and growth" },
    { id: "belong", label: "Looks and belonging" },
    { id: "practical", label: "Practical use" }
] as const;

/**
 * HOW MANY CHOICES EACH QUESTION OF EARLY POSITIONING ALLOWS follows the business stage (design document 28, 8.2, the owner's matrix): the earlier the business, the narrower the focus.
 * Planning (and no stage yet): one everywhere. Launching: one, except two in the outcome. Managing: two in each. Growing: free (null).
 */
export type PositioningQuestion = "relationship" | "audience" | "outcome";
export function choiceLimit(stage: string, question: PositioningQuestion): number | null {
    if (stage === "grow") {
        return null;
    }
    if (stage === "manage") {
        return 2;
    }
    if (stage === "launch") {
        return question === "outcome" ? 2 : 1;
    }
    return 1;
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
        // (A parent or legal guardian has a minor or a young adult as the user: an adult or a senior goes with it.)
        endUser = endUser.filter(id => userStageFits(endUser, id));
        // (A relationship that cannot be the chosen category goes with the change of category.)
        const category = categoryOfModel(buyerCategory, model);
        endUser = endUser.filter(id => !ids.includes(id) || relationshipFits(id, category));
        // (A Student or Young Adult buyer is not a Commercial & Professional buyer.)
        endUser = endUser.filter(id => relationshipFitsBuyerStage(id, audience));
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

/** The "i" of the Activities: the primary one is required, the others optional, and each ends in the code the country's register uses. */
export function activitiesInfo(country: string): string {
    if (!FIRST_VERSION_COUNTRIES.includes(country)) {
        return "The primary activity is required; the others are optional, up to four in all. Type each activity and its code: the official code your country's register uses.";
    }
    return "The primary activity is required; the others are optional, up to four in all. Each one ends in one official code of your country (the " + SCHEME_CODE_LABEL[schemeKeyOf(country)] + " code).";
}

export const INFO = {

    activityCode: [
        "The official code for the organization's main activity: it classifies what the organization does.",
        "Asked for when the organization is registered, and on its annual filings where they apply."
    ],

    requirements: [
        "What else the law asks of this organization, if anything applies: for example a licence, a professional registration, or a named officer.",
        "Add one if it applies to your activity, your legal form, or where you are registered. If none does, add none."
    ],

    expenses: [
        "What it costs to register and keep registered: filing, renewal and agent fees. Each pays for one registration.",
        "Insurance, licences and certificates are cards of Documents & Rights on 3. Infrastructure & Capability.",
        "Add the ones that apply. If there are none, add none."
    ],

    mainActivity: [
        "Who are you, and what do you do? What do you create or provide?",
        "Write it as a registry or a bank would expect to read it.",
        "Name, country, address and legal form are above."
    ],

    registrationDate: [
        "The day the organization was registered with the registry of its country. It is its own date: it does not depend on the registration number, and the number does not depend on it.",
        "It cannot be later than today, nor later than the Opening Date: the business cannot open before the company exists."
    ],

    openingDate: [
        "The day the business opens and issues its first receipt. It sets the stage: planning before it, launching from it.",
        "The days from the plan's start to the day before it are the pre-operational period: every cost is split around it by its own dates.",
        "You can change it at any time."
    ],

    businessStage: [
        "Set by the Opening Date and the durations below: planning before the opening, then launching, managing and growing, each for the time set here. Change the Opening Date, or a duration, to change the stage.",
        "The four stages are those of the US Small Business Administration's business guide."
    ],

    customerType: [
        "Who pays: focuses on the Economic Buyer who approves the budget, separating them from the end user. The positioning statement is written for the target market, and each distinct segment may need its own.",
        "B2C (Business-to-Consumer): individuals or consumers who pay for personal/family use.",
        "B2B (Business-to-Business): businesses, companies or freelancers.",
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
        "Solopreneurs & Freelancers: individual professionals (immediate decision, need for low cost/self-service).",
        "Startups & SMBs: small and medium-sized or rapidly growing companies (need for speed, flexibility and immediate solution).",
        "Mid-Market: medium-sized businesses with structured departments (need for workflows, roles and scale).",
        "Enterprise / Public Sector: multinationals or public bodies (multi-month sales/tender cycle, need for maximum security).",
        { title: "Based on", source: SOURCES.marketResearch }
    ],

    lifeStage: [
        "Limits the target group to a specific niche, aligning the startup with the corresponding sales cycle and the buyer's daily life.",
        "Students / Young Adults (Gen Z, students): they buy for themselves. Tech-savvy, low budget, sensitive to trends.",
        "Workers / Professionals / Adults: they buy for themselves, with their own income. They seek time savings, convenience or status, and they decide inside a busy working life.",
        "Seniors: they buy for themselves, often with a fixed income and more time to compare. They have needs for accessibility, simplicity, trust and health support; a family member may help decide (then the buyer's category below is Proxy or Dual-Intent).",
        { title: "Based on", source: SOURCES.marketResearch },
        { title: "Also", source: SOURCES.brandPositioningStatement }
    ],

    jurisdiction: [
        "What is the jurisdiction scale of the target public entity?",
        "Local Government: municipalities, communities, local municipal enterprises. The ideal beachhead while planning and launching.",
        "Regional Administration: regions and regional development organizations.",
        "Central Government & Ministries: ministry, national services, security forces. Locked while planning and launching.",
        "Institutional / Public Organizations: public hospitals, universities, ports, public utilities."
    ],

    regulatory: [
        "What is the regulatory intensity of the target industry?",
        "General Commerce / Mass Market (low regulation): e-commerce, retail, catering (basic obligations such as myDATA or a POS interface). The ideal beachhead.",
        "Specialized Sectors (medium regulation): logistics, construction, real estate (environmental permits, special registers).",
        "Heavily Regulated Markets (high regulation): FinTech, pharma, medical centers, banks. Locked while planning and launching.",
        "Cross-border Trade (customs and cross-border compliance): import/export companies (customs, international duties, cross-border compliance)."
    ],

    buyerCategory: [
        "What the buyer buys for. It tells the buyer who pays from the person who uses it, whatever the buyer's life stage or scale.",
        "Direct Buyers: purchasing exclusively for their own personal use.",
        "Proxy Buyers: purchasing exclusively on behalf of someone else. The payer is not the user (a gift, a parent buying for a child, an employer buying for its staff).",
        "Dual-Intent Buyers: purchasing a single offering to be used by themselves and their dependents (a family plan, a shared tier).",
        "For Proxy and Dual-Intent Buyers the questions about the user follow.",
        { title: "Based on", source: SOURCES.buyingRoles }
    ],

    buyerUserRelation: [
        "How is the buyer related to the person who will use it? It shapes the message: a parent is reached by safety and trust, an employer by compliance and duty of care.",
        "A consumer buyer: parent or legal guardian, caregiver, family member, spouse or partner, friend, a commercial and professional relationship (a proxy buyer: someone buying for a client, a patient or a member), another personal relationship. A business buyer: employer, business partner, a business serving its clients, a professional intermediary, a sponsor or funder, another business relationship.",
        "A consumer buyer's relationship usually reads as proxy (the buyer buys for the other): parent or legal guardian, caregiver, friend or acquaintance, commercial and professional; as dual-intent (the purchase is for both): spouse or romantic partner; as either: family member or relative, another personal relationship.",
        "The relationship suggests the category above; the buyer's own answer decides it."
    ],

    userLifeStage: [
        "The life stage of the person who will use it. A broad group is enough to give the user's Profile its first shape; the exact age comes later, on the Profile.",
        "Minors: under 18 (online services and some goods have extra rules that differ by country: see the minimum ages in the documentation). Young Adults. Adults. Seniors."
    ],

    purpose: [
        "Why the offering is bought: the purpose it serves for the person who gets it. Choose the ones that fit best.",
        "Only the purposes that fit your answers above are offered: the primary ones first, then the possible ones. The ones that are generally less directly relevant to that buyer are left out.",
        "Learning and Development. Health, Care and Wellbeing. Gifting and Appreciation. Entertainment and Enjoyment. Social Connection and Relationships. Productivity and Efficiency. Business Growth and Performance. Creation and Expression. Everyday Needs and Convenience. Protection and Risk Reduction. Compliance and Obligations. Access and Social Support."
    ],

    differentiation: [
        "What the offering does differently from the competitors: where it hits exactly the blind spot they leave. It is about the offering; the result the buyer gets from it is the outcome, asked next.",
        "Cost-driven (saving resources): targets the blind spot of expensive competitors with a budget-friendly alternative.",
        "Convenience-driven (speed and ease): targets the blind spot of complex or slow solutions.",
        "Compliance, Risk & Security: targets the blind spot of uncertified or questionable alternatives.",
        "Status & Premium (exclusivity): targets the blind spot of mass-market or cheap products with top quality and custom service.",
        { title: "Based on", source: SOURCES.strategicPositioning },
        { title: "Also", source: SOURCES.positioningTemplate }
    ],

    outcome: [
        "The measurable result the buyer gets from the offering (Outcome / ROI): what the buyer is paying for.",
        "Lower costs: an immediate reduction in operating costs. Time saved: the execution time of a process cut to almost nothing, or the workflow drastically simplified. Legal and data-protection cover: absolute legal coverage and no risk of fines. Higher quality and prestige: top quality, custom service and an upgrade of the buyer's prestige.",
        "For a Proxy or Dual-Intent Buyer the user has an outcome of their own, asked next.",
        { title: "Based on", source: SOURCES.strategicPositioning },
        { title: "Also", source: SOURCES.positioningTemplate }
    ],

    outcomeUser: [
        "What matters most to the user, apart from the buyer's own reasons for paying: the result the user gets. It starts the user's Profile.",
        "Enjoyment and fun. Comfort and ease. Safety and care. Learning and growth. Looks and belonging (fitting in with friends, a style). Practical use."
    ],

    legalForm: [
        "Decides who is liable for the organization's debts: the organization, or you personally.",
        "Decides how it is taxed, and whether it must hold share capital.",
        "Choose Other to name a form the list does not carry."
    ],

    capital: [
        "Capital is what the founders put into the organization to start it.",
        "Some legal forms set a minimum amount; many set none.",
        "Tick it to record how much each founder put in."
    ],

    registrationStatus: [
        "Registered: the organization exists in the public register, with a date and a number.",
        "Not yet registered: you are planning it. Choose the legal form you intend to use; the date, the registration number and the tax numbers can wait until it is registered."
    ],
    registrationAuthority: [
        "The body that keeps the public register your organization is listed on.",
        "Filled in from the country you chose. Change it to match yours."
    ],

    taxNumber: [
        "The number the tax office knows the organization by.",
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
