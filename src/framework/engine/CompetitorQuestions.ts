/**
 * THE COMPETITOR CARD'S QUESTIONS (design document 41, K1 to K10): pure data and rules, so the card, the saved answer and the documents read the same words. Which
 * questions a type of competitor is asked and in which words, the option lists, the review platforms in the order of the App User's industry and country (doc 34,
 * L18), and the openings of K10, built from the card's own answers. The answers are kept as the Segment's and the Profile's are: question id to the ids chosen, a
 * rating as "option:point" under "<id>-rating" (K6 to K9) or as the point itself (K4).
 */

import { BUSINESS_JOURNEY_STAGES } from "./AnswerBusinessFoundation.ts";
import { schemeKeyOf } from "./ActivityClassification.ts";
import { PROFILE_QUESTIONS } from "./ProfileQuestions.ts";
import { SEGMENT_QUESTIONS, type SegmentOption } from "./SegmentQuestions.ts";

/** One saved answer: question id to the ids chosen. */
export type CompetitorAnswers = Record<string, string[]>;

export type CompetitorQuestionId = "k1" | "k2" | "k3" | "k4" | "k5" | "k6" | "k7" | "k8" | "k9" | "k10";

/** The five types of competitor (BUSINESS_COMPETITOR_TYPES' ids); no type chosen is asked as a direct competitor. */
type TypeId = "direct" | "indirect" | "substitutes" | "internal" | "status-quo";

const RIVALS: readonly TypeId[] = ["direct", "indirect"];
const SOLD: readonly TypeId[] = ["direct", "indirect", "substitutes"];
const ALL: readonly TypeId[] = ["direct", "indirect", "substitutes", "internal", "status-quo"];

/** Which types are asked each question (doc 41, "What the type asks"). */
const ASKED: Record<CompetitorQuestionId, readonly TypeId[]> = {
    k1: SOLD, k2: SOLD, k3: RIVALS, k4: SOLD, k5: RIVALS, k6: SOLD, k7: SOLD, k8: ALL, k9: ALL, k10: ALL
};

const typeOf = (type: string): TypeId => (ALL as readonly string[]).includes(type) ? type as TypeId : "direct";

/** Whether a type of competitor is asked a question. */
export function competitorAsks(type: string, id: CompetitorQuestionId): boolean {
    return ASKED[id].includes(typeOf(type));
}

/** K7's loyalty ticks, under Support & Follow Up: asked of a direct or indirect competitor only. */
export function competitorAsksLoyalty(type: string): boolean {
    return RIVALS.includes(typeOf(type));
}

/** Each question's words, by type: the first entry is a direct or indirect competitor's (doc 41, "What the type asks"). */
const WORDING: Record<CompetitorQuestionId, Partial<Record<TypeId, string>> & { direct: string }> = {
    k1: { direct: "What do they offer?", substitutes: "What form does this alternative take?" },
    k2: { direct: "Where do they sell?", substitutes: "Where can customers get this alternative?" },
    k3: { direct: "How big is their organisation?" },
    k4: { direct: "Is their business growing?", substitutes: "Is this alternative growing?" },
    k5: { direct: "How do they reach customers?" },
    k6: { direct: "Where are they reviewed, and how are they rated?", substitutes: "Where is this alternative reviewed, and how is it rated?" },
    k7: { direct: "How easy do they make each stage for customers?", substitutes: "How easy does this alternative make each stage for customers?" },
    k8: {
        direct: "How do they do on what customers value?",
        substitutes: "How does this alternative do on what customers value?",
        internal: "How does doing it themselves do on what customers value?",
        "status-quo": "How does doing nothing do on what customers value?"
    },
    k9: {
        direct: "How could each change affect them?",
        substitutes: "How could each change affect this alternative?",
        internal: "How could each change affect customers doing it themselves?",
        "status-quo": "How could each change affect customers who do nothing?"
    },
    k10: { direct: "What could you do differently?" }
};

/** A question's words for a type of competitor. */
export function competitorWording(type: string, id: CompetitorQuestionId): string {
    const words = WORDING[id];
    const kind = typeOf(type);
    return words[kind] ?? words.direct;
}

/** The words over a rating's ends, and its middle where one helps (doc 41). */
export const COMPETITOR_RATINGS = {
    k4: { low: "Declining", high: "Growing" },
    k6: { low: "Poor", high: "Excellent" },
    k7: { low: "Hard", high: "Easy" },
    k8: { low: "Weak", high: "Strong" },
    k9: { low: "Threat", high: "Opportunity" }
} as const;

/** What each question's "i" says (doc 41). */
export const COMPETITOR_INFO: Record<CompetitorQuestionId, readonly string[]> = {
    k1: ["The kinds the app uses for Offerings. A product and a service sold together is a Hybrid."],
    k2: ["The widest area they sell in. Write the industries they serve in the note."],
    k3: ["The EU's sizes, as on your Segment. A sole trader is Micro."],
    k4: ["From what you can see: more branches, staff, products or reviews, or fewer."],
    k5: [
        "Where they find their customers. Write the names of their accounts, shops and partners in the note.",
        "Payment and delivery channels are not listed: they do not reach new customers.",
        "Select all that apply."
    ],
    k6: [
        "Google is where most people read reviews of local businesses (71% in 2026). Most people only use a business with 4 stars or more.",
        "Tick each place they are reviewed, then give their average there, rounded to the nearest star. Read the lowest reviews: they show where customers are let down."
    ],
    k7: [
        "Where their customers are let down along the way, and where it goes smoothly. The values below say what falls short; this says where.",
        "Under Support & Follow Up, what they do to bring customers back. Look at their website and social media, sign up to their newsletter, or buy from them once. Reviews that mention coming back again also show it."
    ],
    k8: ["Rate each from what their customers say and what you have seen. 1 is a clear weakness and 5 a clear strength."],
    k9: ["How each change could help or hurt them. The examples of each change, as on your Segment."],
    k10: ["Openings drawn from what you answered above. Tick the ones you will act on, then write how in the text."]
};

/** What the Customer Experience box's "i" adds: how to find out (doc 41). */
export const COMPETITOR_EXPERIENCE_HOW = "Read their reviews, buy from them or ask for a quote yourself, and ask people who use them.";

/* ---- The option lists ---- */

const segmentOptions = (id: string): readonly SegmentOption[] => SEGMENT_QUESTIONS.find(question => question.id === id)?.options ?? [];

/** K1: the Offering's Type list, without Other (doc 43). */
export const COMPETITOR_OFFER_OPTIONS: readonly SegmentOption[] = [
    { id: "Product", label: "Product" }, { id: "Service", label: "Service" }, { id: "Hybrid", label: "Hybrid" }
];

/** K2: the Segment's "Where are your customers?" (`reach`). */
export const COMPETITOR_REACH_OPTIONS = segmentOptions("reach");

/** K3: the Segment's "How big are your customers' organisations?" (`size`). */
export const COMPETITOR_SIZE_OPTIONS = segmentOptions("size");

/** K5: the channel categories of page 2 that reach customers, by id, in plain words (doc 41). */
export const COMPETITOR_CHANNEL_OPTIONS: readonly SegmentOption[] = [
    { id: "social-media", label: "Social media" }, { id: "community", label: "Community" }, { id: "website", label: "Website" },
    { id: "marketplace", label: "Marketplace" }, { id: "in-person", label: "In person" }, { id: "email", label: "Email" },
    { id: "online-live", label: "Online / live" }, { id: "retail-wholesale", label: "Shops or wholesalers" }, { id: "referral-affiliates", label: "Referrals or affiliates" }
];

/** K7's loyalty ticks, under Support & Follow Up. */
export const COMPETITOR_LOYALTY_OPTIONS: readonly SegmentOption[] = [
    { id: "loyalty", label: "Loyalty scheme / rewards" }, { id: "subscription", label: "Subscription / membership" }, { id: "emails", label: "Regular emails or offers" },
    { id: "aftercare", label: "Aftercare / follow-up" }, { id: "community", label: "Community or events" }
];

/** K7's rows: the Journey Stages of page 2. */
export const COMPETITOR_STAGES: readonly SegmentOption[] = BUSINESS_JOURNEY_STAGES.map(stage => ({ id: stage.id, label: stage.label }));

/** A stage in plain words, for "Make [stage] easier". */
const STAGE_WORDS: Record<string, string> = {
    discovery: "finding out", evaluation: "choosing", purchase: "buying", delivery: "getting it", support: "getting help afterwards"
};

/** K8's rows: the list L1, in the Profile's own words (B1). */
export const COMPETITOR_VALUES: readonly SegmentOption[] = PROFILE_QUESTIONS.find(question => question.id === "b1")?.options ?? [];

/** K9's rows: the Segment's changes (`trends`), their short words (the examples stay in the Segment's "i"). */
export const COMPETITOR_CHANGES: readonly SegmentOption[] = segmentOptions("trends").map(option => ({ id: option.id, label: option.label.split(":")[0].trim() }));

/* ---- K6: the review platforms (L18) and their order ---- */

export interface ReviewPlatform extends SegmentOption {
    /** The industries (SEGMENT_INDUSTRIES' ids) it comes first for. */
    industries?: readonly string[];
    /** The countries (ISO codes; "other" for every country outside the six) it comes first for. */
    countries?: readonly string[];
    /** The industry order holds only in these countries. */
    onlyIn?: readonly string[];
}

/** L18 (doc 34, 5.2b), in its order. */
export const REVIEW_PLATFORMS: readonly ReviewPlatform[] = [
    { id: "google", label: "Google" },
    { id: "facebook", label: "Facebook" },
    { id: "apple-maps", label: "Apple Maps", countries: ["US"] },
    { id: "yelp", label: "Yelp", countries: ["US", "CA"] },
    { id: "bbb", label: "Better Business Bureau", countries: ["US", "CA"] },
    { id: "trustpilot", label: "Trustpilot", industries: ["trade", "professional"], countries: ["GB", "IE", "AU", "NZ", "other"] },
    { id: "productreview", label: "ProductReview.com.au", countries: ["AU"] },
    { id: "tripadvisor", label: "Tripadvisor", industries: ["hospitality", "arts"] },
    { id: "booking", label: "Booking.com", industries: ["hospitality"] },
    { id: "airbnb", label: "Airbnb", industries: ["hospitality"] },
    { id: "opentable", label: "OpenTable", industries: ["hospitality"] },
    { id: "food-delivery", label: "Food delivery app", industries: ["hospitality"] },
    { id: "marketplace", label: "Marketplace", industries: ["trade", "manufacturing"] },
    { id: "houzz", label: "Houzz", industries: ["construction"] },
    { id: "trade-directory", label: "Trade directory", industries: ["construction"] },
    { id: "g2", label: "G2", industries: ["software"] },
    { id: "capterra", label: "Capterra", industries: ["software"] },
    { id: "app-store", label: "App store", industries: ["software"] },
    { id: "clutch", label: "Clutch", industries: ["professional"] },
    { id: "omr", label: "OMR Reviews", industries: ["software"], onlyIn: ["DE"], countries: ["DE"] },
    { id: "tabelog", label: "Tabelog", industries: ["hospitality"], onlyIn: ["JP"], countries: ["JP"] }
];

/** The examples behind the catch-all platforms, for K6's "i" (doc 34, 5.2b). */
export const REVIEW_PLATFORM_EXAMPLES = [
    "Marketplace: where they sell, such as Etsy, Amazon or eBay.",
    "App store: Apple's App Store or Google Play.",
    "Trade directory: Checkatrade or TrustATrader in the UK, Angi or HomeAdvisor in the US, HomeStars in Canada.",
    "Food delivery app: Just Eat or Deliveroo in the UK, Grubhub in the US, SkipTheDishes in Canada, Menulog in Australia."
];

const SIX = ["GB", "IE", "US", "CA", "AU", "NZ"];

/** A division (two digits) of an industry scheme, as the industry of the Segment's list it falls in (the crosswalk L7, doc 34, 5.3). */
function industryOfDivision(scheme: "sic" | "naics" | "anzsic", division: number): string | undefined {
    const ranges: Record<typeof scheme, readonly [number, number, string][]> = {
        sic: [
            [1, 3, "farming"], [5, 9, "mining"], [10, 33, "manufacturing"], [35, 39, "utilities"], [41, 43, "construction"], [45, 47, "trade"], [49, 53, "transport"],
            [55, 56, "hospitality"], [58, 63, "software"], [64, 66, "finance"], [68, 68, "property"], [69, 75, "professional"], [77, 82, "admin"], [84, 84, "government"],
            [85, 85, "education"], [86, 88, "health"], [90, 93, "arts"], [94, 99, "other"]
        ],
        naics: [
            [11, 11, "farming"], [21, 21, "mining"], [22, 22, "utilities"], [23, 23, "construction"], [31, 33, "manufacturing"], [41, 42, "trade"], [44, 45, "trade"],
            [48, 49, "transport"], [51, 51, "software"], [52, 52, "finance"], [53, 53, "property"], [54, 55, "professional"], [56, 56, "admin"], [61, 61, "education"],
            [62, 62, "health"], [71, 71, "arts"], [72, 72, "hospitality"], [81, 81, "other"], [91, 92, "government"]
        ],
        anzsic: [
            [1, 5, "farming"], [6, 10, "mining"], [11, 25, "manufacturing"], [26, 29, "utilities"], [30, 32, "construction"], [33, 43, "trade"], [44, 45, "hospitality"],
            [46, 53, "transport"], [54, 60, "software"], [62, 64, "finance"], [66, 67, "property"], [69, 70, "professional"], [72, 73, "admin"], [75, 77, "government"],
            [80, 82, "education"], [84, 87, "health"], [89, 92, "arts"], [94, 96, "other"]
        ]
    };
    return ranges[scheme].find(([from, to]) => division >= from && division <= to)?.[2];
}

/** The App User's industry (SEGMENT_INDUSTRIES' id) from the Organisation's first activity code and country, through the crosswalk L7 (doc 34, 5.3). */
export function industryOfActivity(country: string, code: string): string | undefined {
    const digits = (code ?? "").replace(/[^0-9]/g, "");
    if (digits.length < 2) {
        return undefined;
    }
    const division = Number(digits.slice(0, 2));
    const key = schemeKeyOf(country);
    const scheme = key === "us" || key === "ca" ? "naics" : key === "au" || key === "nz" ? "anzsic" : "sic";
    return industryOfDivision(scheme, division);
}

/** K6's rows in their order (doc 34, 5.2b): Google and Facebook, the industry's, the country's; the rest behind "Show all". A platform is never shown twice. */
export function reviewPlatformOrder(country: string, activityCode: string): { first: readonly ReviewPlatform[]; rest: readonly ReviewPlatform[] } {
    const industry = industryOfActivity(country, activityCode);
    const place = country && !SIX.includes(country) ? "other" : country;
    const core = REVIEW_PLATFORMS.filter(platform => platform.id === "google" || platform.id === "facebook");
    const byIndustry = REVIEW_PLATFORMS.filter(platform => industry && platform.industries?.includes(industry) && (!platform.onlyIn || platform.onlyIn.includes(country)));
    const byCountry = REVIEW_PLATFORMS.filter(platform => place && (platform.countries?.includes(place) || platform.countries?.includes(country)));
    const first: ReviewPlatform[] = [];
    for (const platform of [...core, ...byIndustry, ...byCountry]) {
        if (!first.includes(platform)) {
            first.push(platform);
        }
    }
    return { first, rest: REVIEW_PLATFORMS.filter(platform => !first.includes(platform)) };
}

/* ---- Ratings ---- */

export type Point = 1 | 2 | 3 | 4 | 5;

/** The ratings kept under "<id>-rating", by option id. */
export function competitorRatings(answers: CompetitorAnswers, id: CompetitorQuestionId): Partial<Record<string, Point>> {
    const ratings: Partial<Record<string, Point>> = {};
    for (const entry of answers[id + "-rating"] ?? []) {
        const [option, point] = entry.split(":");
        const value = Number(point);
        if (value >= 1 && value <= 5) {
            ratings[option] = value as Point;
        }
    }
    return ratings;
}

/** A row rated, or its rating cleared (`undefined`). */
export function competitorRate(answers: CompetitorAnswers, id: CompetitorQuestionId, option: string, point: number | undefined): CompetitorAnswers {
    const others = (answers[id + "-rating"] ?? []).filter(entry => entry.split(":")[0] !== option);
    const next = point === undefined ? others : [...others, option + ":" + point];
    const result = { ...answers };
    if (next.length > 0) {
        result[id + "-rating"] = next;
    } else {
        delete result[id + "-rating"];
    }
    return result;
}

/* ---- Settling against the type ---- */

const IDS = (list: readonly SegmentOption[]) => list.map(option => option.id);
const OPTIONS: Partial<Record<CompetitorQuestionId, readonly string[]>> = {
    k1: IDS(COMPETITOR_OFFER_OPTIONS), k2: IDS(COMPETITOR_REACH_OPTIONS), k3: IDS(COMPETITOR_SIZE_OPTIONS), k4: ["1", "2", "3", "4", "5"],
    k5: IDS(COMPETITOR_CHANNEL_OPTIONS), k6: IDS(REVIEW_PLATFORMS), k7: IDS(COMPETITOR_LOYALTY_OPTIONS)
};
const ROWS: Partial<Record<CompetitorQuestionId, readonly string[]>> = {
    k6: IDS(REVIEW_PLATFORMS), k7: IDS(COMPETITOR_STAGES), k8: IDS(COMPETITOR_VALUES), k9: IDS(COMPETITOR_CHANGES)
};
const SINGLE: readonly CompetitorQuestionId[] = ["k1", "k2", "k3", "k4"];

/**
 * A Competitor's answers settled against its type: a question the type no longer asks loses its answer (doc 41: removed on the next choice), as does an option
 * or a row not offered; a platform's rating goes with its tick; K10's ticks are settled against its options by the card (competitorOpenings).
 */
export function competitorSettle(answers: CompetitorAnswers, type: string): CompetitorAnswers {
    const settled: CompetitorAnswers = {};
    for (const id of Object.keys(ASKED) as CompetitorQuestionId[]) {
        if (!competitorAsks(type, id)) {
            continue;
        }
        const offered = OPTIONS[id];
        const chosen = (answers[id] ?? []).filter((entry, at, all) => all.indexOf(entry) === at && (!offered || offered.includes(entry)));
        if (id === "k7" && !competitorAsksLoyalty(type)) {
            // (The loyalty ticks are asked of a rival only.)
        } else if (id === "k10") {
            if ((answers.k10 ?? []).length > 0) {
                settled.k10 = (answers.k10 ?? []).slice(0, 3);
            }
        } else if (chosen.length > 0) {
            settled[id] = SINGLE.includes(id) ? chosen.slice(0, 1) : chosen;
        }
        const rows = ROWS[id];
        if (rows) {
            const rated = (answers[id + "-rating"] ?? []).filter(entry => {
                const [row, point] = entry.split(":");
                return rows.includes(row) && ["1", "2", "3", "4", "5"].includes(point) && (id !== "k6" || (settled.k6 ?? []).includes(row));
            });
            if (rated.length > 0) {
                settled[id + "-rating"] = rated;
            }
        }
    }
    return settled;
}

/** What a saved Competitor's questions keep: lists of words only. */
export function asCompetitorAnswers(source: unknown): CompetitorAnswers {
    const answers: CompetitorAnswers = {};
    if (!source || typeof source !== "object" || Array.isArray(source)) {
        return answers;
    }
    for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
        if (Array.isArray(value) && value.every(entry => typeof entry === "string") && value.length > 0) {
            answers[key] = value as string[];
        }
    }
    return answers;
}

/* ---- K10: the openings, from the card's own answers ---- */

/** What K10 reads besides the card itself: the Segment's Profiles' B1 and its other competitors. */
export interface OpeningContext {
    /** Each Profile's answers (b1 and b1-rating). */
    profiles: readonly CompetitorAnswers[];
    /** The Segment's other competitors' answers, for ties (how many rate a value low). */
    others: readonly CompetitorAnswers[];
}

export interface Opening extends SegmentOption {
    /** For the draft: the value it comes from, where it comes from one. */
    value?: string;
}

/** A value's weight: the Profiles' highest rating of it (doc 36, section 11), 2 where it is ticked but not rated, 1 where no Profile ticks it. */
function weightOf(value: string, context: OpeningContext): number {
    let weight = 1;
    for (const profile of context.profiles) {
        if ((profile.b1 ?? []).includes(value)) {
            const rated = (profile["b1-rating"] ?? []).find(entry => entry.split(":")[0] === value);
            weight = Math.max(weight, rated ? Number(rated.split(":")[1]) : 2);
        }
    }
    return weight;
}

/** Whether a Profile of the Segment ticks a value in B1. */
export function valueOfProfiles(value: string, context: OpeningContext): boolean {
    return context.profiles.some(profile => (profile.b1 ?? []).includes(value));
}

const labelOf = (list: readonly SegmentOption[], id: string) => list.find(option => option.id === id)?.label ?? id;
/** Words inside a sentence: the first letter small ("Be ready where the economy hurts them"). */
const inSentence = (words: string) => words.charAt(0).toLowerCase() + words.slice(1);

/**
 * K10's options, in their order, each by its rule (doc 41): the values by their opening score, (5 − rating) × weight, ties broken by how many of the Segment's
 * competitors rate the value low; then the stages, the reviews, the loyalty, the growth, the changes. An option shows only once its source is answered.
 */
export function competitorOpenings(answers: CompetitorAnswers, type: string, context: OpeningContext): Opening[] {
    const kind = typeOf(type);
    const openings: Opening[] = [];
    const values = competitorRatings(answers, "k8");
    const changes = competitorRatings(answers, "k9");

    if (kind === "status-quo") {
        for (const [value, point] of Object.entries(values)) {
            if (point && point <= 2) {
                openings.push({ id: "cost:" + value, label: "Show what doing nothing costs: " + labelOf(COMPETITOR_VALUES, value), value });
            }
        }
        for (const [change, point] of Object.entries(changes)) {
            if (point && point <= 2) {
                openings.push({ id: "act:" + change, label: "Use " + inSentence(labelOf(COMPETITOR_CHANGES, change)) + " as a reason to act" });
            }
        }
        return openings;
    }

    const lowCount = (value: string) => context.others.filter(other => {
        const rated = competitorRatings(other, "k8")[value];
        return rated !== undefined && rated <= 2;
    }).length;
    const scored = Object.entries(values)
        .filter(([, point]) => point !== undefined && point < 5)
        .map(([value, point]) => ({ value, point: point as Point, score: (5 - (point as Point)) * weightOf(value, context), ties: lowCount(value) }))
        .sort((a, b) => b.score - a.score || b.ties - a.ties);
    for (const { value, point } of scored) {
        const words = labelOf(COMPETITOR_VALUES, value);
        if (point <= 2) {
            openings.push({ id: "better:" + value, label: "Offer better: " + words, value });
        } else if (point === 3) {
            openings.push({ id: "standout:" + value, label: "Stand out on: " + words, value });
        } else if (point === 4 && valueOfProfiles(value, context)) {
            openings.push({ id: "match:" + value, label: "Match them on: " + words, value });
        }
    }
    if (kind === "internal" && Object.keys(values).length > 0) {
        openings.push({ id: "internal", label: "Make it easier than doing it themselves" });
    }

    const stages = competitorRatings(answers, "k7");
    for (const stage of COMPETITOR_STAGES) {
        const point = stages[stage.id];
        if (point !== undefined && point <= 2) {
            openings.push({ id: "stage:" + stage.id, label: "Make " + STAGE_WORDS[stage.id] + " easier" });
        }
    }
    const reviews = competitorRatings(answers, "k6");
    if (Object.values(reviews).some(point => point !== undefined && point < 4)) {
        openings.push({ id: "unhappy", label: kind === "substitutes" ? "Win over this alternative's unhappy customers" : "Win over their unhappy customers" });
    }
    if (competitorAsksLoyalty(type) && Object.keys(stages).length > 0 && (answers.k7 ?? []).length === 0) {
        openings.push({ id: "loyalty", label: "Give customers a reason to come back" });
    }
    const growth = Number(answers.k4?.[0]);
    if (growth >= 1 && growth <= 2) {
        openings.push({ id: "losing", label: "Win customers they are losing" });
    }
    for (const change of COMPETITOR_CHANGES) {
        const point = changes[change.id];
        if (point !== undefined && point >= 4) {
            openings.push({ id: "use:" + change.id, label: "Use " + inSentence(change.label) + " too" });
        } else if (point !== undefined && point <= 2) {
            openings.push({ id: "ready:" + change.id, label: "Be ready where " + inSentence(change.label) + " hurts them" });
        }
    }
    return openings;
}

/** K10's "i" line for each value rated 5: "[name] is hard to beat on [value]; compete elsewhere." */
export function hardToBeat(name: string, answers: CompetitorAnswers): string[] {
    const who = name.trim() || "This competitor";
    return Object.entries(competitorRatings(answers, "k8"))
        .filter(([, point]) => point === 5)
        .map(([value]) => who + " is hard to beat on " + labelOf(COMPETITOR_VALUES, value) + "; compete elsewhere.");
}

/**
 * The draft added at the end of the Insights text when the App User asks (doc 41): "Customers want [value]; [name] falls short on it.", one line for each value
 * the Segment's Profiles tick that K8 rates 1 or 2, with every competitor of the Segment that falls short on it; then "You could [opening]." for each tick of K10.
 */
export function insightsDraft(name: string, answers: CompetitorAnswers, context: OpeningContext & { names: readonly { name: string; answers: CompetitorAnswers }[] }, openings: readonly Opening[]): string {
    const lines: string[] = [];
    for (const [value, point] of Object.entries(competitorRatings(answers, "k8"))) {
        if (point === undefined || point > 2 || !valueOfProfiles(value, context)) {
            continue;
        }
        const short = [name, ...context.names
            .filter(other => other.answers !== answers && (competitorRatings(other.answers, "k8")[value] ?? 5) <= 2)
            .map(other => other.name)]
            .map(entry => entry.trim())
            .filter((entry, at, all) => entry && all.indexOf(entry) === at);
        lines.push("Customers want " + inSentence(labelOf(COMPETITOR_VALUES, value)) + "; " + (short.length > 0 ? short.join(", ") : "this competitor") + " " + (short.length > 1 ? "fall" : "falls") + " short on it.");
    }
    for (const id of answers.k10 ?? []) {
        const opening = openings.find(entry => entry.id === id);
        if (opening) {
            lines.push("You could " + inSentence(opening.label) + ".");
        }
    }
    return lines.join("\n");
}
