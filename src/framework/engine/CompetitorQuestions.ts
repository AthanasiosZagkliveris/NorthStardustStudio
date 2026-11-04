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

/** The one word at each end of a rating (doc 41; owner 2026-11-04: single words, at the sides only). */
export const COMPETITOR_RATINGS = {
    k4: { low: "Declining", high: "Growing" },
    k5: { low: "Low", high: "High" },
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
        "Tick each channel they use to find customers, then rate how active they are there: posting weekly on Instagram is High.",
        "Write their account and shop names in the note. Payment and delivery channels are not listed: they do not reach new customers."
    ],
    k6: [
        "Tick each place they are reviewed and give their average there, to the nearest star. Most people only use a business with 4 stars or more.",
        "Not listed? Tick Other and write it. Google is where most people read reviews of local businesses (71% in 2026)."
    ],
    k7: [
        "Where their customers are let down along the way, and where it goes smoothly. The values below say what falls short; this says where.",
        "Under Support & Follow Up, tick what they do to bring customers back.",
        "To find out, look at their website and social media, sign up to their newsletter or buy from them once."
    ],
    k8: ["Rate each from what their customers say and what you have seen: 1 is a clear weakness, 5 a clear strength."],
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

/** K7's loyalty ticks, under Support & Follow Up (Aftercare is that stage itself: owner, 2026-11-04). */
export const COMPETITOR_LOYALTY_OPTIONS: readonly SegmentOption[] = [
    { id: "loyalty", label: "Loyalty scheme / rewards" }, { id: "subscription", label: "Subscription / membership" }, { id: "emails", label: "Regular emails or offers" },
    { id: "community", label: "Community or events" }
];

/** A channel in a sentence, for "Reach customers [where]" (K10). */
const CHANNEL_WORDS: Record<string, string> = {
    "social-media": "on social media", community: "in communities", website: "through a website", marketplace: "on marketplaces", "in-person": "in person",
    email: "by email", "online-live": "in live online sessions", "retail-wholesale": "through shops or wholesalers", "referral-affiliates": "through referrals or affiliates"
};

/** K7's rows: the Journey Stages of page 2. */
export const COMPETITOR_STAGES: readonly SegmentOption[] = BUSINESS_JOURNEY_STAGES.map(stage => ({ id: stage.id, label: stage.label }));

/** K10's option for a stage they make hard (K7 rated 1 or 2), in plain words (owner, 2026-11-04). */
const STAGE_OPENINGS: Record<string, string> = {
    discovery: "Make it easier to find you", evaluation: "Make it easier to compare and choose", purchase: "Make buying easier", delivery: "Make delivery smoother",
    support: "Give better help after the sale"
};

/** K10's words for each value of L1: what to offer where they are weak (1 or 2), and the value as a noun ("Be known for ...", "Match them on ..."). */
const VALUE_OPENINGS: Record<string, { better: string; noun: string }> = {
    "lower-price": { better: "Offer lower prices", noun: "lower prices" },
    speed: { better: "Be faster", noun: "speed" },
    "ease-and-convenience": { better: "Make it easier and more convenient", noun: "ease and convenience" },
    "quality-and-results": { better: "Offer better quality and results", noun: "quality and results" },
    "trust-and-reputation": { better: "Earn more trust", noun: "trust and reputation" },
    "expert-knowledge": { better: "Offer more expert knowledge", noun: "expert knowledge" },
    "a-service-made-for-them": { better: "Offer a service made for them", noun: "a service made for them" },
    "good-support": { better: "Offer better support", noun: "good support" },
    "safety-and-low-risk": { better: "Make it safer and lower risk", noun: "safety and low risk" },
    "shared-values-or-identity": { better: "Show the values you share with them", noun: "shared values" }
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

/* ---- Other: a review platform not listed (K6) ---- */

/** The question whose list ends with Other: the names typed are kept as "<id>-other", each rated as "other-<n>" (owner, 2026-11-04, in place of "Show all").
    K8's values are the fixed list L1, as the Profiles use, with no Other (owner, 2026-11-04). */
export type OtherQuestion = "k6";

/** Names that mean a listed platform (doc 34, L18's examples): typed under Other, they become that platform. */
const PLATFORM_ALIASES: Record<string, string> = {
    "google reviews": "google", "google maps": "google", "google business": "google", "apple": "apple-maps", "maps": "apple-maps", "better business bureau": "bbb",
    "trip advisor": "tripadvisor", "booking": "booking", "productreview": "productreview", "product review": "productreview", "app store": "app-store", "google play": "app-store",
    "play store": "app-store", "etsy": "marketplace", "amazon": "marketplace", "ebay": "marketplace", "fiverr": "marketplace", "upwork": "marketplace",
    "checkatrade": "trade-directory", "trustatrader": "trade-directory", "angi": "trade-directory", "homeadvisor": "trade-directory", "homestars": "trade-directory",
    "just eat": "food-delivery", "deliveroo": "food-delivery", "uber eats": "food-delivery", "grubhub": "food-delivery", "skipthedishes": "food-delivery", "menulog": "food-delivery",
    "omr": "omr", "g2 crowd": "g2"
};

const plain = (text: string) => text.trim().toLowerCase().replace(/\s+/g, " ");

/** The listed item a name typed under Other means, if any: its words or a known other name, any case. */
export function otherMatch(id: OtherQuestion, name: string): string | undefined {
    const typed = plain(name);
    if (!typed) {
        return undefined;
    }
    const found = REVIEW_PLATFORMS.find(option => plain(option.label) === typed || plain(option.label.replace(/\s*\/\s*/g, " or ")) === typed || option.id === typed.replace(/ /g, "-"));
    return found?.id ?? (id === "k6" ? PLATFORM_ALIASES[typed] : undefined);
}

/** The names typed under Other. */
export function competitorOthers(answers: CompetitorAnswers, id: OtherQuestion): string[] {
    return answers[id + "-other"] ?? [];
}

/** Other ticked: one empty row to write in; unticked: every Other row and its rating go. */
export function competitorOtherTick(answers: CompetitorAnswers, id: OtherQuestion, on: boolean): CompetitorAnswers {
    const next = { ...answers };
    if (on) {
        next[id + "-other"] = [...competitorOthers(answers, id), ""];
    } else {
        delete next[id + "-other"];
        next[id + "-rating"] = (answers[id + "-rating"] ?? []).filter(entry => !entry.startsWith("other-"));
    }
    return next;
}

/** One more Other row ("Add another"). */
export function competitorOtherAdd(answers: CompetitorAnswers, id: OtherQuestion): CompetitorAnswers {
    return { ...answers, [id + "-other"]: [...competitorOthers(answers, id), ""] };
}

/** An Other row's name as it is typed. */
export function competitorOtherName(answers: CompetitorAnswers, id: OtherQuestion, at: number, name: string): CompetitorAnswers {
    const names = [...competitorOthers(answers, id)];
    names[at] = name;
    return { ...answers, [id + "-other"]: names };
}

/**
 * An Other row done with (its name left): a name that means a listed item becomes that item, its rating kept (a platform is ticked); the row goes. The rows after
 * it move up, their ratings with them.
 */
export function competitorOtherSettle(answers: CompetitorAnswers, id: OtherQuestion, at: number): CompetitorAnswers {
    const names = competitorOthers(answers, id);
    const match = otherMatch(id, names[at] ?? "");
    if (!match) {
        return answers;
    }
    const point = competitorRatings(answers, id)["other-" + at];
    let next = competitorOtherRemove(answers, id, at);
    if (id === "k6" && !(next.k6 ?? []).includes(match)) {
        next = { ...next, k6: [...(next.k6 ?? []), match] };
    }
    return point !== undefined && competitorRatings(next, id)[match] === undefined ? competitorRate(next, id, match, point) : next;
}

/** An Other row taken away. */
export function competitorOtherRemove(answers: CompetitorAnswers, id: OtherQuestion, at: number): CompetitorAnswers {
    const names = competitorOthers(answers, id).filter((_name, position) => position !== at);
    const ratings = (answers[id + "-rating"] ?? []).flatMap(entry => {
        const [row, point] = entry.split(":");
        if (!row.startsWith("other-")) {
            return [entry];
        }
        const n = Number(row.slice(6));
        return n === at ? [] : ["other-" + (n > at ? n - 1 : n) + ":" + point];
    });
    const next = { ...answers, [id + "-rating"]: ratings };
    if (names.length > 0) {
        next[id + "-other"] = names;
    } else {
        delete next[id + "-other"];
    }
    if (ratings.length === 0) {
        delete next[id + "-rating"];
    }
    return next;
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
    k5: IDS(COMPETITOR_CHANNEL_OPTIONS), k6: IDS(REVIEW_PLATFORMS), k7: IDS(COMPETITOR_STAGES), k8: IDS(COMPETITOR_VALUES), k9: IDS(COMPETITOR_CHANGES)
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
        // The names typed under Other (K6): kept while the question is asked.
        const others = id === "k6" ? answers[id + "-other"] ?? [] : [];
        if (others.length > 0) {
            settled[id + "-other"] = others;
        }
        const rows = ROWS[id];
        if (rows) {
            // A ticked row's rating (K5, K6) holds only while it is ticked; an Other row's while the row is there.
            const ticked = id === "k5" || id === "k6";
            const rated = (answers[id + "-rating"] ?? []).filter(entry => {
                const [row, point] = entry.split(":");
                const known = row.startsWith("other-") ? Number(row.slice(6)) < others.length : rows.includes(row) && (!ticked || (settled[id] ?? []).includes(row));
                return known && ["1", "2", "3", "4", "5"].includes(point);
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
    const values = listedValues(answers);
    const valueWords = valueNoun;
    const valueBetter = (value: string) => VALUE_OPENINGS[value]?.better ?? "Offer better " + valueWords(value);
    const valueId = (value: string) => value;
    const changes = competitorRatings(answers, "k9");

    if (kind === "status-quo") {
        for (const [value, point] of Object.entries(values)) {
            if (point && point <= 2) {
                openings.push({ id: "cost:" + valueId(value), label: "Show what doing nothing costs them in " + valueWords(value), value });
            }
        }
        for (const [change, point] of Object.entries(changes)) {
            if (point && point <= 2) {
                openings.push({ id: "act:" + change, label: "Use changes in " + inSentence(labelOf(COMPETITOR_CHANGES, change)) + " as a reason to act now" });
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
        const words = valueWords(value);
        if (point <= 2) {
            openings.push({ id: "better:" + valueId(value), label: valueBetter(value), value });
        } else if (point === 3) {
            openings.push({ id: "standout:" + valueId(value), label: "Be known for " + words, value });
        } else if (point === 4 && valueOfProfiles(value, context)) {
            openings.push({ id: "match:" + value, label: "Match them on " + words, value });
        }
    }
    if (kind === "internal" && Object.keys(values).length > 0) {
        openings.push({ id: "internal", label: "Make it easier than doing it themselves" });
    }

    // A channel they use but are little active on (K5 rated 1 or 2): customers they do not reach there.
    const channels = competitorRatings(answers, "k5");
    for (const channel of COMPETITOR_CHANNEL_OPTIONS) {
        const point = channels[channel.id];
        if (point !== undefined && point <= 2) {
            openings.push({ id: "reach:" + channel.id, label: "Reach customers " + CHANNEL_WORDS[channel.id] });
        }
    }

    const stages = competitorRatings(answers, "k7");
    for (const stage of COMPETITOR_STAGES) {
        const point = stages[stage.id];
        if (point !== undefined && point <= 2) {
            openings.push({ id: "stage:" + stage.id, label: STAGE_OPENINGS[stage.id] ?? "Make " + inSentence(stage.label) + " easier" });
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
        openings.push({ id: "losing", label: "Win the customers they are losing" });
    }
    for (const change of COMPETITOR_CHANGES) {
        const point = changes[change.id];
        if (point !== undefined && point >= 4) {
            openings.push({ id: "use:" + change.id, label: "Make the most of changes in " + inSentence(change.label) });
        } else if (point !== undefined && point <= 2) {
            openings.push({ id: "ready:" + change.id, label: "Prepare for changes in " + inSentence(change.label) });
        }
    }
    return openings;
}

/** A value of L1 inside a sentence ("quality and results"). */
const valueNoun = (value: string) => VALUE_OPENINGS[value]?.noun ?? inSentence(labelOf(COMPETITOR_VALUES, value));

/** K10's "i" line for each value rated 5: "[name] is hard to beat on [value], so compete elsewhere." */
export function hardToBeat(name: string, answers: CompetitorAnswers): string[] {
    const who = name.trim() || "This competitor";
    return Object.entries(listedValues(answers))
        .filter(([, point]) => point === 5)
        .map(([value]) => who + " is hard to beat on " + valueNoun(value) + ", so compete elsewhere.");
}

/** K8's ratings of the listed values (L1) only. */
function listedValues(answers: CompetitorAnswers): Partial<Record<string, Point>> {
    return Object.fromEntries(Object.entries(competitorRatings(answers, "k8")).filter(([value]) => COMPETITOR_VALUES.some(option => option.id === value))) as Partial<Record<string, Point>>;
}

/** The draft's lines not already in the text (compared trimmed, any spacing): "Add to text" adds only these, and is not offered when none is left. */
export function draftToAdd(text: string, draft: string): string {
    const said = text.replace(/\s+/g, " ").trim();
    return draft.split("\n").map(line => line.trim()).filter(line => line && !said.includes(line.replace(/\s+/g, " "))).join("\n");
}

/**
 * The draft added at the end of the Insights text when the App User asks (doc 41): "Customers want [value], and [name] falls short there.", one line for each value
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
        lines.push("Customers want " + valueNoun(value) + ", and " + (short.length > 0 ? short.join(", ") : "this competitor") + " " + (short.length > 1 ? "fall" : "falls") + " short there.");
    }
    for (const id of answers.k10 ?? []) {
        const opening = openings.find(entry => entry.id === id);
        if (opening) {
            lines.push("You could " + inSentence(opening.label) + ".");
        }
    }
    return lines.join("\n");
}
