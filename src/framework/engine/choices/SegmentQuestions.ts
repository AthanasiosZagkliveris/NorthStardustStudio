/**
 * THE SEGMENT CARD'S QUESTIONS (design Questions 2, 6.3 and 8.2, as the owner revised them on 2026-11-01): the choice questions asked in each of the card's five boxes, and in the user block of a Proxy or
 * Dual-Intent buyer. Pure data and rules, so the card, the saved answer and the documents read the same words: which questions a Segment is asked, which options each offers, what a choice clears.
 * The words are the owner's. Where a list names platforms or brands they stand in the question's "i" as examples, never in the option.
 */

import { DIFFERENTIATION_WORDS, OUTCOME_USER_WORDS } from "../ActivityClassification.ts";
import { choiceLimit } from "../PositioningIds.ts";
import { onlyPlanning } from "../BusinessStage.ts";
import { paymentServiceName, providerOffered } from "../channels/ChannelFeeData.ts";

/** The boxes of the Segment's Description, its user block, and "competitors": a question of the Segment asked once in its Competitors column, after the Competitor cards (Questions 14, K14). */
export type SegmentBox = "demographics" | "geographics" | "business-data" | "purchasing" | "market-size" | "user" | "competitors";

export interface SegmentOption {
    id: string;
    label: string;
    /** The heading of the group this option opens, where a long list is grouped (owner, 2026-11-17). */
    heading?: string;
    /** Said under it, small: a saved answer kept outside the options the answers above give (owner, 2026-11-17). */
    note?: string;
}

/** Each marketplace option's provider in the Channel Fee data (providerOffered). */
const MARKETPLACE_PROVIDER: Readonly<Record<string, string>> = {
    etsy: "Etsy", amazon: "Amazon", ebay: "eBay", noths: "Not On The High Street", folksy: "Folksy", gumroad: "Gumroad", fiverr: "Fiverr", upwork: "Upwork"
};

/** The marketplaces each Offering form sells on (owner, 2026-11-17): a physical item, a digital file, a service. */
const MARKETPLACES_OF_FORM: Readonly<Record<string, readonly string[]>> = {
    physical: ["etsy", "folksy", "noths", "amazon", "ebay"],
    digital: ["gumroad", "etsy"],
    live: ["fiverr", "upwork"], inperson: ["fiverr", "upwork"], project: ["fiverr", "upwork"], ongoing: ["fiverr", "upwork"]
};

/** Discover's two groups (owner, 2026-11-17): the online ways, then those in person, in print and on air; Other after them. */
const DISCOVER_ONLINE: readonly string[] = ["communities", "creators", "media", "algorithmic", "search", "affiliates"];

export interface SegmentQuestion {
    id: string;
    box: SegmentBox;
    label: string;
    /** Ticks (one or more) rather than a radio (one). */
    many: boolean;
    /** The most ticks allowed. */
    max?: number;
    options: readonly SegmentOption[];
    /** The list ends with an Other that the user writes in (as a Profile's): its words are kept as the answer `<id>-other`, while Other is ticked. */
    other?: boolean;
    /** The section of its box it opens or stands in (Box 4: Finding & Choosing, Buying & Paying; owner, 2026-11-16 16:31): a heading where the section changes. */
    group?: string;
    /** What its "i" says. */
    info: readonly string[];
    /** A short name for the notes that say what Positioning or the answers above set ("Size: Medium-sized business"). */
    name?: string;
    /** A degree, asked as a rating from 1 to 5 (RatingScale): the words over its ends (Questions 12, owner 2026-11-04). The answer is the point, "1" to "5". */
    rating?: { low: string; high: string };
    /**
     * A question that left Positioning for the Segment (owner, 2026-11-08): its limit is the business stage's (Positioning's outcome limit, `choiceLimit`), an answer over it goes back to
     * empty, and an answer cleared stays cleared (saved as an empty list), so the Positioning answer saved before, its start, does not come back (`segmentPositioningShown`).
     */
    fromPositioning?: boolean;
    /**
     * Moved on to the Profile (owner, 2026-11-08: the end user's outcome is asked in each Profile's end-user part, Questions 13, E4): not shown on the Segment and not printed with its
     * answers; a saved answer stays readable and settled, as the Profile's start.
     */
    startsProfile?: boolean;
}

/** What a Segment's questions follow: Identity's answers and the business stage. */
export interface SegmentContext {
    /** The Organisation's country (ISO code): the marketplaces and payment services offered are those that sell there (providerOffered; owner, 2026-11-17). */
    country?: string;
    /** Who the buyer is: people (Box 1), businesses (Box 3), or not known / both. */
    frame: "people" | "business" | "open";
    /** "plan", "launch", "manage" or "grow" (empty: not known, as planning). */
    stage: string;
    /** The buyer's life stages chosen in Positioning (young, adult, senior). */
    lifeStages: readonly string[];
    /** Whether the buyer is a Proxy or Dual-Intent buyer, so the user is described too. */
    endsUser: boolean;
    /** Whether that buyer is Dual-Intent: the buyer also uses it, so the end user's part is the others who use it (2026-11-09). */
    dual?: boolean;
    /** The user's life stages chosen in Positioning (age:minor, age:young, age:adult, age:senior). */
    userStages: readonly string[];
    /** The buyer and user relationships chosen in Positioning (rel:parent and so on). */
    relations: readonly string[];
    /** The scales of a business buyer chosen in Positioning (solo, smb, mid, enterprise). */
    scales: readonly string[];
    /** The ways the Segment's Offerings can be tried first (segmentTrials: sample, trial, demo, taster, catalogue); not given, every way is offered. */
    trials?: readonly string[];
    /** The forms of the Segment's Offerings (O1; segmentForms): the marketplaces offered follow them (owner, 2026-11-17); not given, every one. */
    forms?: readonly string[];
}

/** One saved answer: question id to the ids chosen. */
export type SegmentAnswers = Record<string, string[]>;

/** The work situation is asked in two steps: working or not, then what the non-working situation is. */
const WORKING = [
    { id: "working", label: "Yes" },
    { id: "notworking", label: "No" }
] as const;

const NOT_WORKING = [
    { id: "student", label: "Student" },
    { id: "homemaker", label: "Homemaker or carer" },
    { id: "seeking", label: "Looking for work" },
    { id: "retired", label: "Retired" },
    { id: "unable", label: "Unable to work" }
] as const;

const WORKING_INFO = ["Yes includes working full-time, part-time, on contract or self-employed.", "No opens a second question about why they are not working."];
const NOT_WORKING_INFO = ["Choose the main reason.", "Unable to work: sidelined from the workforce by a chronic medical condition, long-term illness or disability. They typically live on fixed support incomes."];

/**
 * A RATING'S POINTS as options, so a rating is saved and settled as every choice is: the ids "1" to "5" ("3 of 5"). Its end words (at 1 and 5) are added where it is printed (ratingWords).
 * Degree and comfort questions are ratings unless named ranges exist (Questions 12, owner 2026-11-04).
 */
export function ratingOptions(_rating: { low: string; high: string }): SegmentOption[] {
    return ["1", "2", "3", "4", "5"].map(point => ({ id: point, label: point + " of 5" }));
}

/** A rating as a document prints it: "1 of 5 (Uneasy)", the word only at an end. */
export function ratingWords(point: string, rating: { low: string; high: string }): string {
    const word = point === "1" ? rating.low : point === "5" ? rating.high : undefined;
    return point + " of 5" + (word ? " (" + word + ")" : "");
}

const COMFORT_RATING = { low: "Uneasy", high: "Confident" };
/** The household income, the gender mix and the kind of place, rated 1 to 5 at the owner's request (2026-11-04), the meaning of each end in the "i". */
const INCOME_RATING = { low: "Low", high: "High" };
const GENDER_RATING = { low: "Mostly men", high: "Mostly women" };
const AREA_RATING = { low: "Rural", high: "Urban" };

/** The answers saved before a question became a rating, and the point each now is (Questions 12). */
const RATED_BEFORE: Record<string, Record<string, string>> = {
    comfort: { averse: "1", moderate: "3", savvy: "5" },
    "u-comfort": { averse: "1", moderate: "3", savvy: "5" },
    trajectory: { declining: "1", flat: "3", growing: "4", expanding: "5" },
    competition: { blue: "1", fragmented: "3", red: "5" },
    income: { low: "1", "lower-middle": "2", middle: "3", "upper-middle": "4", high: "5" },
    gender: { men: "1", "leans-men": "2", balanced: "3", "leans-women": "4", women: "5" },
    area: { rural: "1", suburban: "3", urban: "5" }
};

const ORG_TYPES = [
    { id: "private", label: "Private business (For-profit)" },
    { id: "public", label: "Public body / Government agency" },
    { id: "nonprofit", label: "Non-profit / charity / NGO" },
    { id: "self", label: "Self-employed / freelancer / sole trader" }
] as const;

const ORG_SIZES = [
    { id: "micro", label: "Micro, 1–9 employees" },
    { id: "small", label: "Small, 10–49 employees" },
    { id: "medium", label: "Medium-sized, 50–249 employees" },
    { id: "large", label: "Large, 250+ employees" }
] as const;

/** The six classes of industries, each over the industries of Questions 2 (G15) that sit in it. */
export const SEGMENT_SECTORS = [
    { id: "resources", label: "Resource extraction & energy" },
    { id: "making", label: "Manufacturing & construction" },
    { id: "consumer", label: "Consumer goods & retail" },
    { id: "infrastructure", label: "Infrastructure & finance" },
    { id: "tech", label: "Tech, data & media, and business services" },
    { id: "human", label: "Human services & public sector, and other services" }
] as const;

export const SEGMENT_INDUSTRIES: readonly (SegmentOption & { sector: string })[] = [
    { id: "farming", sector: "resources", label: "Farming, forestry and fishing" },
    { id: "mining", sector: "resources", label: "Mining, oil, gas and quarrying" },
    { id: "utilities", sector: "resources", label: "Energy, water and waste" },
    { id: "manufacturing", sector: "making", label: "Manufacturing" },
    { id: "construction", sector: "making", label: "Construction" },
    { id: "trade", sector: "consumer", label: "Wholesale and retail trade" },
    { id: "hospitality", sector: "consumer", label: "Hospitality" },
    { id: "arts", sector: "consumer", label: "Arts, sport and recreation" },
    { id: "transport", sector: "infrastructure", label: "Transport, postal and logistics" },
    { id: "finance", sector: "infrastructure", label: "Finance and insurance" },
    { id: "property", sector: "infrastructure", label: "Real estate and property" },
    { id: "software", sector: "tech", label: "Software, IT, media and telecoms" },
    { id: "professional", sector: "tech", label: "Professional, scientific and technical services" },
    { id: "admin", sector: "tech", label: "Administrative and support services" },
    { id: "government", sector: "human", label: "Government and public administration" },
    { id: "education", sector: "human", label: "Education" },
    { id: "health", sector: "human", label: "Health and social care" },
    { id: "other", sector: "human", label: "Other services" }
];

/** The buyer's age terms (Research 5, 10.1: the term leads, the age defines it), and the Positioning life stage each belongs to. */
const BUYER_AGES = [
    { id: "minor", stage: "young", label: "Minors, semi-dependent 13–17" },
    { id: "young", stage: "young", label: "Young adults 18–24" },
    { id: "established", stage: "adult", label: "Established 25–39" },
    { id: "peak", stage: "adult", label: "Peak 40–54" },
    { id: "mature", stage: "adult", label: "Mature 55–64" },
    { id: "active", stage: "senior", label: "Active Retirees 65–74" },
    { id: "dependent", stage: "senior", label: "Dependent seniors 75+" }
] as const;

/** The user's age terms, and the Positioning user stage each belongs to. */
const USER_AGES = [
    { id: "baby", stage: "age:minor", label: "Baby 0–2" },
    { id: "child", stage: "age:minor", label: "Child 3–10" },
    { id: "teen", stage: "age:minor", label: "Teenager 11–17" },
    { id: "young", stage: "age:young", label: "Young adult 18–24" },
    { id: "established", stage: "age:adult", label: "Established 25–39" },
    { id: "peak", stage: "age:adult", label: "Peak 40–54" },
    { id: "mature", stage: "age:adult", label: "Mature 55–64" },
    { id: "active", stage: "age:senior", label: "Active Retirees 65–74" },
    { id: "dependent", stage: "age:senior", label: "Dependent seniors 75+" }
] as const;

/**
 * The kinds of work: the nine ISCO-08 major groups (ILO) in plain words, in their order (owner, 2026-11-03). The Segment's end-user question and the Profile's A3 (a B2C Profile)
 * take this one list, so the words are written once. Ids kept from the six groups before, where the meaning is closest; "owner" (an employment status, not an occupation) now
 * reads as Manager / director (JOB_RENAMED).
 */
export const JOB_LEVELS = [
    { id: "manager", label: "Manager / director" },
    { id: "professional", label: "Professional" },
    { id: "technician", label: "Technician / associate professional" },
    { id: "office", label: "Office / administrative work" },
    { id: "service", label: "Service, care or sales work" },
    { id: "farming", label: "Farming, forestry or fishing" },
    { id: "trade", label: "Skilled trade" },
    { id: "operator", label: "Machine operator / driver" },
    { id: "routine", label: "Routine / manual work" }
] as const;

/** A kind of work saved under an id since retired, and the id it reads as now. */
export const JOB_RENAMED: Record<string, string> = { owner: "manager" };

/** What the kinds of work say in the "i" (one owner for the Segment's and the Profile's question). */
export const JOB_INFO = [
    "Based on: the ISCO-08 major groups (ILO).",
    "Professional: for example a teacher, nurse, engineer or lawyer.", "Skilled trade: for example an electrician, plumber or chef.",
    "Someone who owns and runs a business: Manager / director. Armed forces: choose the group that fits the role."
] as const;

const AGE_NOTE = "Each age group holds the years from its first number to its last, both included, so each age is in one group only (25–39, then 40–54).";

const RAW_QUESTIONS: readonly SegmentQuestion[] = [

    /* ---- Box 1, Demographics ---- */

    {
        id: "age", box: "demographics", label: "How old are your customers?", many: false,
        options: BUYER_AGES.map(({ id, label }) => ({ id, label })),
        info: [
            "Minors, semi-dependent: Mid and Late Adolescence, with limited buying power; mostly cash, wallets and gift cards.",
            "Credit and long contracts are for adults. Look up the country's online-consent age and its minimum working age.",
            "Choose the group that pays, even when another group uses it.",
            AGE_NOTE
        ]
    },
    {
        id: "education", box: "demographics", label: "What is their highest level of education?", many: false,
        options: [
            { id: "school", label: "School" },
            { id: "college", label: "College or vocational" },
            { id: "degree", label: "University degree" },
            { id: "postgraduate", label: "Postgraduate degree (master's or doctorate)" }
        ],
        info: [
            "Each level includes the ones below it: someone with a postgraduate degree has a university degree.",
            "School: A-levels or the Leaving Certificate (UK, Ireland), a high school diploma (USA, Canada), Year 12 (Australia, New Zealand).",
            "College or vocational: a qualification after school such as a BTEC, a trade certificate or an associate degree."
        ]
    },
    {
        id: "work", name: "Work status", box: "demographics", label: "Are your customers working?", many: false,
        options: WORKING,
        info: [...WORKING_INFO, "Choosing an age group starts this with the one that goes with it; change it freely."]
    },
    {
        id: "work2", name: "Non-working situation", box: "demographics", label: "Why are your customers not working?", many: false,
        options: NOT_WORKING,
        info: NOT_WORKING_INFO
    },
    {
        id: "workenv", box: "demographics", label: "Where do your customers mainly work?", many: false,
        options: [
            { id: "remote", label: "At home (Desk-based, remote)" },
            { id: "office", label: "In an office" },
            { id: "onsite", label: "On site (Retail, hospitality, healthcare, construction)" },
            { id: "field", label: "On the road (Logistics, sales, field engineering)" }
        ],
        info: ["Where they spend most of their working hours.", "Remote workers are online through the day; frontline and field workers are mobile, with little screen time on shift."]
    },
    {
        id: "workschedule", box: "demographics", label: "What is your customers' work schedule?", many: false,
        options: [
            { id: "standard", label: "Standard daytime hours (Traditional 9-to-5, fixed weekdays)" },
            { id: "shift", label: "Shifts / varying hours (Nights, weekends, rotating rosters)" },
            { id: "flexible", label: "Flexible / their own hours (Freelancers, business owners, autonomous professionals)" }
        ],
        info: ["When they are free to shop and to be reached. Standard daytime workers shop at lunch and in the evening; shift workers have a very different daily routine."]
    },
    {
        id: "workincome", box: "demographics", label: "How are your customers paid?", many: false,
        options: [
            { id: "salary", label: "Fixed salary (Predictable monthly or fortnightly pay)" },
            { id: "hourly", label: "Hourly wage (Fluctuating based on scheduled shifts)" },
            { id: "variable", label: "Variable pay (Freelance invoices, commission, seasonal contracts)" }
        ],
        info: ["How steady their pay is; how much they earn is the household income below.", "A fixed salary suits regular subscriptions; variable or hourly earners feel sudden cash-flow dips."]
    },
    {
        id: "income", box: "demographics", label: "How high is your customers' household income?", many: false,
        rating: INCOME_RATING, options: ratingOptions(INCOME_RATING),
        info: ["Compare with the typical household income in their country: 3 is around the median.", "Household income is what everyone in the home earns together."]
    },
    {
        id: "gender", box: "demographics", label: "What is the gender mix of your customers?", many: false,
        rating: GENDER_RATING, options: ratingOptions(GENDER_RATING),
        info: ["1 is 80% or more men, 2 is 60 to 80%, 3 a balanced mix (40 to 60%), 4 is 60 to 80% women, 5 is 80% or more.", "Choose 3 when what you sell suits everyone alike."]
    },

    /* ---- Box 2, Geographics ---- */

    {
        id: "reach", box: "geographics", label: "Where are your customers?", many: false,
        options: [
            { id: "city", label: "In my city / town" },
            { id: "region", label: "In my state / region" },
            { id: "country", label: "Across my country" },
            { id: "countries", label: "In several countries" },
            { id: "online", label: "Anywhere online" }
        ],
        info: ["The widest area most of your customers are spread over, now or as you plan it. If it is more than one, make another Segment."]
    },
    {
        id: "area", box: "geographics", label: "Where do your customers live or work?", many: false,
        rating: AREA_RATING, options: ratingOptions(AREA_RATING),
        info: ["1 is countryside or remote places, 3 the suburbs and towns around a city, 5 a city centre."]
    },

    /* ---- Box 3, Business Data ---- */

    {
        id: "orgtype", name: "Type of organisation", box: "business-data", label: "What kind of organisation are your customers?", many: false,
        options: ORG_TYPES,
        info: [
            "Private business includes co-operatives. A social enterprise belongs here or under non-profit, by how it is owned.",
            "Non-profit includes membership and professional bodies and religious organisations.",
            "A public body is for example a government department, council, school or hospital.",
            "Self-employed skips the question about size."
        ]
    },
    {
        id: "size", name: "Size", box: "business-data", label: "How big are your customers' organisations?", many: false,
        options: ORG_SIZES,
        info: ["The EU's definition of small and medium-sized enterprises: micro under 10 employees, small under 50, medium-sized under 250.", "Countries define them a little differently; the United States and Canada use other limits.", "The sizes follow the scale chosen in Positioning.", "A public body can be of any size, so every size is offered for one."]
    },
    {
        // (A RECORD OF THE INDUSTRY'S SECTOR (1.1, the second batch of the review; owner, 2026-11-18 00:46): never asked; the industry below carries its sector, so the one choice sets both.)
        id: "sector", box: "business-data", label: "Which sector are your customers in?", many: false,
        options: SEGMENT_SECTORS,
        info: ["The sector of the industry chosen."]
    },
    {
        id: "industry", box: "business-data", label: "Which industry are your customers in?", many: false,
        options: SEGMENT_INDUSTRIES,
        info: [
            "Each industry under its sector, as the official schemes (SIC and NACE, NAICS, ANZSIC) name their sections. The sector follows from the industry. If they work in more than one industry, make another Segment.",
            "Government and public administration includes embassies and international bodies.", "Other services includes households that employ staff, such as cleaners and nannies."
        ]
    },

    /* ---- Box 4, Purchasing Power & Behaviour ----
       In the order of a purchase (owner, 2026-11-08, P3): online comfort and how they socialise, what makes them shop, where they discover, how they decide (a business:
       who decides), where they shop, how they pay, then how they share it. The codes stay Box 4, 1 to 9 (Questions 6: codes are ids, not positions). */

    {
        id: "comfort", box: "purchasing", group: "Finding & Choosing", label: "How comfortable are your customers online?", many: false,
        rating: COMFORT_RATING, options: ratingOptions(COMFORT_RATING),
        info: ["How easily they use websites, apps and online payment."]
    },
    {
        id: "social", box: "purchasing", group: "Finding & Choosing", label: "How do your customers like to socialise?", many: false,
        options: [
            { id: "digital", label: "Mostly online (gaming, community servers, chat apps)" },
            { id: "mixed", label: "Online & in person" },
            { id: "inperson", label: "Mostly in person (events, hospitality, clubs, sports)" }
            // ("Mostly on their own" removed, owner 2026-11-04: it contradicted the question and fed nothing; a saved answer of it is dropped when read.)
        ],
        info: ["Where they spend their free time. It decides how they meet brands and products."]
    },
    {
        id: "trigger", box: "purchasing", group: "Finding & Choosing", label: "What makes your customers go shopping?", many: true, max: 2,
        options: [
            { id: "boredom", label: "Boredom or entertainment (browsing feeds, window shopping)" },
            { id: "proof", label: "Seeing a friend or creator use it" },
            { id: "need", label: "A need / problem to solve" },
            { id: "seasonal", label: "Sales, seasons or planned gifts" }
        ],
        info: ["Choose up to two."]
    },
    {
        // (Asked before where they discover, whose order it sets: 1.6, the second batch of the review; owner, 2026-11-18 00:46. Its code stays Box 4, 4.)
        id: "share", box: "purchasing", group: "Finding & Choosing", label: "How do your customers share what they like?", many: true,
        options: [
            { id: "public", label: "They post it publicly on social media" },
            { id: "friends", label: "They tell friends and family" },
            { id: "none", label: "They keep what they buy to themselves" }
        ],
        info: ["Telling friends and family includes private chat apps such as WhatsApp and iMessage.", "They keep what they buy to themselves stands alone: choosing it clears the other two."]
    },
    {
        id: "discover", box: "purchasing", group: "Finding & Choosing", label: "Where do your customers discover new products?", many: true, max: 3,
        options: [
            { id: "peers", label: "Friends, family & colleagues" },
            { id: "communities", label: "Online communities / forums" },
            { id: "creators", label: "Creators / influencers / experts" },
            { id: "media", label: "Media, reviews & comparison sites" },
            { id: "algorithmic", label: "Feeds, ads & marketplace suggestions" },
            // (Added 2026-11-08, the research; "Sales calls or tenders" is offered for business customers only, segmentOptions.)
            { id: "search", label: "Search engines / maps" },
            { id: "passing", label: "Seeing it in person / passing by" },
            { id: "events", label: "Events / trade shows" },
            { id: "sales", label: "Sales calls or tenders" },
            // (Owner, 2026-11-16 16:31: the referral and affiliate channels, and an Other written in, each a Discover channel.)
            { id: "partners", label: "Partner businesses" },
            { id: "affiliates", label: "Affiliate sites / blogs" },
            // (Owner, 2026-11-16 17:38: the traditional ways, and trying it first; each a channel of Advertising, Print & Mail or Samples & Trials.)
            { id: "adverts", label: "Adverts in newspapers, magazines, radio or TV" },
            { id: "flyers", label: "Flyers or posters" },
            { id: "post", label: "Letters or catalogues in the post" },
            { id: "samples", label: "Free samples, tasters or trials" },
            { id: "other", label: "Other" }
        ],
        other: true,
        info: [
            "Examples: communities such as Reddit, Discord and Facebook Groups; creators on TikTok, Instagram, YouTube and LinkedIn.",
            "Partner businesses: a shop, venue or firm that sends its customers to you.",
            "Seeing it in person / passing by: a shop window, a stall, a sign or a vehicle.",
            "Flyers or posters: handed out, through the door or on a noticeboard.",
            "Free samples, tasters or trials: a sample, a free class or a trial period that lets them try it first.",
            "Choose up to three."
        ]
    },
    {
        // (Box 4, 3a; owner, 2026-11-16 17:38: asked where adverts are where they discover; each tick its Advertising subchannel at Discover.)
        id: "advertising", box: "purchasing", group: "Finding & Choosing", label: "Where do they see adverts?", many: true,
        options: [
            { id: "press", label: "Newspapers / magazines" },
            { id: "radio", label: "Radio" },
            { id: "tv", label: "TV" },
            { id: "outdoor", label: "Billboards / outdoor" }, { id: "journals", label: "Journals / trade magazines" }
        ],
        info: ["The adverts that reach them: each becomes a channel on Foundation & Engagement."]
    },
    {
        id: "path", box: "purchasing", group: "Finding & Choosing", label: "How do your customers usually decide to buy?", many: false,
        options: [
            // (2026-11-08, the research: "Straight away" reworded as an impulse, its id kept; habit and urgent need added.)
            { id: "impulse", label: "On impulse: They see it, like it and buy it there and then" },
            { id: "researcher", label: "After comparing options: They weigh prices, features and reviews first" },
            { id: "validator", label: "On a recommendation: They buy what friends, family or colleagues suggest" },
            { id: "habit", label: "Out of habit: They buy again what they bought before, as a routine" },
            { id: "urgent", label: "When they urgently need it: They buy what solves it now" }
        ],
        info: ["Their usual way of buying, the one that fits most of them. Reviews read online count as comparing; advice from people they know is a recommendation.",
            "On impulse or when they urgently need it, their Profiles skip the question of how they compare options."]
    },
    {
        id: "authorise", name: "Decision", box: "purchasing", group: "Finding & Choosing", label: "Who decides to buy?", many: true,
        options: [
            { id: "solo", label: "One person decides: The person who uses it has the budget and the final say." },
            { id: "champions", label: "The team agrees: The people who use it try it and push it upward." },
            { id: "executive", label: "A manager signs off: Needs formal approval from a manager or executive." },
            { id: "multi", label: "Several departments check: IT or security, legal and finance." },
            { id: "procurement", label: "Formal procurement: A tender or a request for proposals (RFP), with strict compliance." }
        ],
        info: ["Select all that apply."]
    },
    {
        id: "setting", box: "purchasing", group: "Buying & Paying", label: "Where do your customers usually shop?", many: false,
        options: [
            { id: "mobile", label: "Online, on a phone" },
            { id: "desktop", label: "Online, on a computer" },
            { id: "store", label: "In a shop" },
            { id: "multi", label: "Both online & in shops" },
            { id: "marketplace", label: "On a marketplace, such as Etsy or Amazon" }
        ],
        info: ["Where most of their purchases start and finish. Choose Both online & in shops when they mix the two about equally.", "A marketplace is a site that sells many sellers' goods, such as Etsy, Amazon or eBay."]
    },
    // WHICH MARKETPLACES AND WHICH SHOPS (owner, 2026-11-15 16:08: "skip the + add, by shaping the channels to previous sections"): the follow-ups of Where do your
    // customers usually shop?, each tick the subchannel of that name on Customer Engagement (JourneySuggestions.ts).
    {
        id: "marketplaces", box: "purchasing", group: "Buying & Paying", label: "Which marketplaces do your customers shop on?", many: true,
        options: [
            { id: "etsy", label: "Etsy" },
            { id: "amazon", label: "Amazon" },
            { id: "ebay", label: "eBay" },
            { id: "noths", label: "Not On The High Street" },
            { id: "folksy", label: "Folksy" },
            { id: "gumroad", label: "Gumroad" },
            { id: "fiverr", label: "Fiverr" },
            { id: "upwork", label: "Upwork" },
            { id: "other", label: "Other" }
        ],
        other: true,
        info: ["The marketplaces where they find and buy what you sell: each becomes a channel on Foundation & Engagement, with its fees.", "Tick Other to write another."]
    },
    {
        id: "shops", box: "purchasing", group: "Buying & Paying", label: "Which shops or sellers do they buy from?", many: true,
        options: [
            { id: "own", label: "Your own shop or studio" },
            { id: "stockists", label: "Shops that stock your products" },
            { id: "concession", label: "A space inside another shop" },
            { id: "distributors", label: "Distributors or wholesalers" },
            { id: "resellers", label: "Resellers, online or in shops" }
        ],
        info: ["The shops where they buy what you sell: each becomes a channel on Foundation & Engagement.", "A space inside another shop is a concession or shop-in-shop."]
    },
    {
        id: "pay", box: "purchasing", group: "Buying & Paying", label: "How do your customers pay?", many: true,
        options: [
            { id: "card", label: "Credit / debit card" },
            { id: "wallet", label: "Digital wallets" },
            { id: "cash", label: "Cash" },
            { id: "bnpl", label: "Buy Now, Pay Later or financing" },
            // (Owner, 2026-11-15 16:26: "Invoice, bank transfer or purchase order" split in two, so a bank transfer is its own channel; a saved "invoice" reads as both, asSegmentAnswers.)
            { id: "invoicepo", label: "Invoice or purchase order" },
            { id: "transfer", label: "Bank transfer" }
        ],
        info: [
            "Digital wallets are for example Apple Pay, Google Pay and PayPal. Buy Now, Pay Later is for example Klarna and Afterpay.",
            "Cash is still about one payment in ten in the UK (UK Finance, 2024).",
            "Invoice or purchase order is offered for business customers only. Credit and Buy Now, Pay Later are for adults.",
            "Choosing a phone as where they buy starts Digital wallets here; change it freely.",
            "Select all that apply."
        ]
    },
    // WHICH PAYMENT SERVICES (owner, 2026-11-15 16:26): asked where they pay by card or a digital wallet; each service names the fees its payments take (the Channel
    // Fee Table's row for the Legal Entity's country), a service written in under Other its own row, "Entered by you".
    {
        id: "providers", box: "purchasing", group: "Buying & Paying", label: "Which payment services do you take payments with?", many: true,
        options: [
            { id: "stripe", label: "Stripe" },
            { id: "sumup", label: "SumUp" },
            { id: "square", label: "Square" },
            { id: "zettle", label: "Zettle" },
            { id: "paypal", label: "PayPal" },
            { id: "shopify", label: "Shopify Payments" },
            { id: "other", label: "Other" }
        ],
        other: true,
        info: ["The services that take the card and wallet payments: each one's fees come from the Global Settings' Channel Fee Table for your country.", "Tick Other to write another."]
    },

    /* ---- Box 5, Market Size & Industry Outlook ---- */

    {
        id: "tam", box: "market-size", label: "How many potential customers are there?", many: false,
        options: [
            { id: "micro", label: "Very small niche, under 1,000" },
            { id: "boutique", label: "Specialist, 1,000–49,999" },
            { id: "mid", label: "Mid-market, 50,000–499,999" },
            { id: "mass", label: "Mass market, 500,000 or more" }
        ],
        info: ["Everyone in the area you serve who could buy it, if every one of them chose you (the total addressable market).", "For a Segment of businesses, count each organisation once."]
    },
    {
        id: "trajectory", box: "market-size", label: "Is your market growing or shrinking?", many: false,
        rating: { low: "Shrinking", high: "Booming" },
        options: ratingOptions({ low: "Shrinking", high: "Booming" }),
        info: [
            "Where the market is heading, apart from its size: a market can be large and declining, or small and expanding fast.",
            "1: falling demand, or deep structural change. 3: flat, a saturated market. 5: an emerging market, growing fast every year."
        ]
    },
    {
        id: "trends", box: "market-size", label: "What is changing most for your customers?", many: true, max: 2,
        options: [
            { id: "technology", label: "Technology: Automation, AI, old systems being replaced" },
            { id: "regulation", label: "Rules & law: New compliance, tax changes" },
            { id: "economy", label: "The economy: Inflation, budget cuts, shifts in spending power" },
            { id: "society", label: "Society & lifestyle: Remote work, changing habits" },
            { id: "supply", label: "Supply & delivery: Material shortages, logistics costs, local sourcing" },
            // (Added 2026-11-08, the research: the E of PESTLE. The environmental mandates and sustainability moved here from Rules & law and Society, so nothing overlaps.)
            { id: "environment", label: "Environment & climate: Extreme weather, sustainability, environmental mandates" }
        ],
        info: ["The changes that affect your customers most. Choose up to two.", "Each Competitor is rated on how every one of these could affect it, the ones ticked here first."]
    },
    {
        id: "competition", box: "market-size", label: "How crowded is your market?", many: false,
        rating: { low: "Open", high: "Crowded" },
        options: ratingOptions({ low: "Open", high: "Crowded" }),
        info: [
            "Red Ocean and Blue Ocean are the strategy terms of Kim and Mauborgne: a crowded market against an uncontested one.",
            "1: very few direct competitors; the niche is new. 3: many small players, none in control. 5: big established players and price wars."
        ]
    },

    /* ---- The user (a Proxy or Dual-Intent buyer) ---- */

    {
        id: "u-age", name: "User's life stage", box: "user", label: "How old are your customers?", many: false,
        options: USER_AGES.map(({ id, label }) => ({ id, label })),
        info: [
            "Teenager covers Early Adolescence (11 to 13), Mid (13 to 16) and Late (16 to 18).",
            AGE_NOTE
        ]
    },
    {
        id: "u-school", name: "School stage", box: "user", label: "Which school stage are your customers in?", many: false,
        options: [
            { id: "early", label: "Early years" },
            { id: "primary", label: "Primary school" },
            { id: "secondary", label: "Secondary school" }
        ],
        info: ["Asked when the buyer buys for a child: a parent or guardian, a caregiver, a family member, or an institution such as a school.", "Secondary school is offered for a Teenager."]
    },
    {
        id: "u-comfort", box: "user", label: "How comfortable are your customers online?", many: false,
        rating: COMFORT_RATING, options: ratingOptions(COMFORT_RATING),
        info: ["How easily they use websites, apps and online payment."]
    },
    // Positioning's question 10, moved here on 2026-11-08 (owner: "Move all three"), its options and "i" as built; moved on the same day to each Profile's end-user part (Questions 13, E4),
    // where a saved answer here is the start: kept and settled, no longer shown.
    {
        id: "u-outcome", box: "user", label: "Outcome for the end user", many: true, fromPositioning: true, startsProfile: true,
        options: Object.entries(OUTCOME_USER_WORDS).map(([id, label]) => ({ id, label })),
        info: [
            "What matters most to the end user, apart from the buyer's own reasons for paying: the result the end user gets. It starts the end user's Profile.",
            "Enjoyment & fun. Comfort & ease. Safety & care. Learning & growth. Looks & belonging (fitting in with friends, a style). Practical use."
        ]
    },

    /* ---- Asked once in the Segment's Competitors column, after its Competitors (Questions 14, K14) ---- */

    // Positioning's question 8, moved here on 2026-11-08 (owner: "Move all three"; differentiation is set against the alternatives, Dunford): its options as built; its "i" and its order
    // are the Positioning ones (`INFO.differentiation`, `differentiationOptionsFor` in legal/shared.tsx), drawn by the card.
    {
        id: "differentiation", box: "competitors", label: "Differentiation", many: true, fromPositioning: true,
        options: Object.entries(DIFFERENTIATION_WORDS).map(([id, label]) => ({ id, label })),
        info: []
    }

];

/**
 * An option says its few words; what is added in brackets or after a colon (an example, a range, an explanation) stands in the question's "i", under the option's name.
 */
function splitOption(option: SegmentOption): { option: SegmentOption; note?: string } {

    const colon = option.label.match(/^([^:]+): (.+)$/);
    const head = colon ? colon[1] : option.label;
    const bracket = head.match(/^(.*?)\s*\((.+)\)$/);
    const label = bracket ? bracket[1] : head;
    const notes = [bracket?.[2], colon?.[2]].filter((note): note is string => !!note);

    return notes.length === 0
        ? { option }
        : { option: { ...option, label }, note: notes.join(". ") };

}

const QUESTIONS: readonly SegmentQuestion[] = RAW_QUESTIONS.map(question => {

    const split = question.options.map(splitOption);

    return {
        ...question,
        options: split.map(entry => entry.option),
        info: [...question.info, ...split.filter(entry => entry.note).map(entry => entry.option.label + ": " + entry.note)]
    };

});

export const SEGMENT_QUESTIONS = QUESTIONS;

/** The sizes each Positioning scale of a business buyer holds (the mapping of Questions 2, 8.2; the owner approved it 2026-11-01): a solo buyer has no employees, so no size is asked. */
const SIZES_OF_SCALE: Record<string, readonly string[]> = { solo: [], smb: ["micro", "small"], mid: ["medium"], enterprise: ["large"] };

/** Only Solopreneurs & Freelancers were chosen: the customers are self-employed, with no employees. */
function onlySolo(context: SegmentContext): boolean {
    return context.scales.length > 0 && context.scales.every(id => id === "solo");
}

/** The age terms of a retired buyer (Active Retirees, Dependent seniors): the work situation is implied by the term. */
function retiredByAge(answers: SegmentAnswers): boolean {
    return has(answers, "age", "active") || has(answers, "age", "dependent");
}

/** The user's age terms from 18 on: no school stage is asked of them. */
const ADULT_USER_AGES = ["young", "established", "peak", "mature", "active", "dependent"];

/** The relationships whose end user may be at school: a parent, a caregiver, a family member (a grandparent buying for a child) and an institution (a school for its pupils; 2026-11-09). */
const PERSONAL = ["rel:parent", "rel:caregiver", "rel:family", "rel:institution"];

/** Whether the end users are the people an institution or membership body serves: of any age, a business buyer's though they are (owner, 2026-11-09). */
export function segmentServesPeople(context: Pick<SegmentContext, "relations">): boolean {
    return context.relations.includes("rel:institution");
}

function has(answers: SegmentAnswers, id: string, option: string): boolean {
    return (answers[id] ?? []).includes(option);
}

/**
 * The questions held back while the business is only Planning (owner, 2026-11-08, P5: progressive disclosure): where they mainly work (Box 1, 5), how they are paid (Box 1, 7) and how they
 * share what they like (Box 4, 4). Shown from Launching; a saved answer is kept while they are held back (segmentSettle), never removed.
 */
const SEGMENT_HELD_WHILE_PLANNING: readonly string[] = ["workenv", "workincome", "share"];

/** Whether a question is held back by the stage alone: it would be asked from Launching, with the same answers. */
export function segmentHeldBack(question: SegmentQuestion, answers: SegmentAnswers, context: SegmentContext): boolean {
    return SEGMENT_HELD_WHILE_PLANNING.includes(question.id) && onlyPlanning(context.stage) && segmentQuestionAsked(question, answers, { ...context, stage: "launch" });
}

/** Whether a question is asked of a Segment, given its answers so far. */
export function segmentQuestionAsked(question: SegmentQuestion, answers: SegmentAnswers, context: SegmentContext): boolean {

    if (SEGMENT_HELD_WHILE_PLANNING.includes(question.id) && onlyPlanning(context.stage)) {
        return false;
    }

    const people = context.frame !== "business";
    const business = context.frame !== "people";

    switch (question.id) {
        case "age": case "work": case "gender":
            return people;
        case "work2":
            return people && (has(answers, "work", "notworking") || retiredByAge(answers));
        case "workenv": case "workschedule": case "workincome":
            return people && has(answers, "work", "working");
        case "education": case "income":
            return people && !has(answers, "age", "minor");
        case "area":
            // (From Planning: O20's order for the countryside reaches an early founder; 1.11, the second batch of the review; owner, 2026-11-18 00:46.)
            return ["city", "region", "country"].some(id => has(answers, "reach", id));
        case "sector":
            // (A record of the industry's sector: 1.1, the second batch of the review; owner, 2026-11-18 00:46.)
            return false;
        case "orgtype":
            return business;
        case "size":
            return business && !has(answers, "orgtype", "self") && !onlySolo(context);
        case "industry":
            return business;
        case "social": case "share": case "trigger": case "path":
            return people;
        case "authorise":
            return business;
        case "marketplaces":
            return has(answers, "setting", "marketplace");
        case "advertising":
            return has(answers, "discover", "adverts");
        case "shops":
            return has(answers, "setting", "store") || has(answers, "setting", "multi");
        case "providers":
            // (Where they shop on a marketplace, the marketplace takes the payment and its own fee: no payment service of yours; 2.8, the second batch of the review; owner, 2026-11-18 00:46.)
            return (has(answers, "pay", "card") || has(answers, "pay", "wallet")) && !has(answers, "setting", "marketplace");
        case "u-age": case "u-outcome":
            return context.endsUser;
        case "u-comfort":
            // A baby does not use online tools.
            return context.endsUser && !has(answers, "u-age", "baby");
        case "u-school":
            // No school stage for a user of 18 or more.
            return context.endsUser && context.relations.some(id => PERSONAL.includes(id)) && !ADULT_USER_AGES.some(id => has(answers, "u-age", id));
        default:
            return true;
    }

}

/** The options a question offers a Segment: the ones that fit what it has answered and what Identity chose. An option already chosen stays. */
export function segmentOptions(question: SegmentQuestion, answers: SegmentAnswers, context: SegmentContext, keepChosen = true): readonly SegmentOption[] {

    const chosen = answers[question.id] ?? [];
    const keep = (option: SegmentOption, fits: boolean) => fits || (keepChosen && chosen.includes(option.id));

    switch (question.id) {
        case "age":
            return BUYER_AGES.filter(option => keep(option, context.lifeStages.length === 0 || context.lifeStages.includes(option.stage)))
                .map(({ id, label }) => ({ id, label }));
        case "work":
            // A retiree is not working.
            return question.options.filter(option => keep(option, !(retiredByAge(answers) && option.id !== "notworking")));
        case "work2":
            // A retiree is retired; a minor is not.
            return question.options.filter(option => keep(option, retiredByAge(answers)
                ? option.id === "retired"
                : !(option.id === "retired" && has(answers, "age", "minor"))));
        case "orgtype": {
            // The scales chosen in Positioning: Solopreneurs & Freelancers are self-employed; a public body goes with Enterprise or Public Sector.
            const scales = context.scales;
            const solo = scales.includes("solo");
            const bigger = scales.some(id => id !== "solo");
            return question.options.filter(option => keep(option, scales.length === 0
                || (option.id === "self" ? solo : option.id === "public" ? scales.includes("enterprise") : bigger)));
        }
        case "size": {
            // A public body (a school, a small council) can be of any size: for one, Enterprise or Public Sector holds every size (owner, 2026-11-08).
            const scales = context.scales;
            const sizes = scales.flatMap(id => id === "enterprise" && has(answers, "orgtype", "public") ? ORG_SIZES.map(size => size.id) : SIZES_OF_SCALE[id] ?? []);
            return question.options.filter(option => keep(option, scales.length === 0 || sizes.length === 0 || sizes.includes(option.id)));
        }
        case "path": {
            // ORDERED BY WHAT MAKES THEM GO SHOPPING (Box 4, 5; 2026-11-09), never locked: boredom or a friend or creator puts On impulse first; a need or problem, When they
            // urgently need it and After comparing options.
            const trigger = answers.trigger ?? [];
            const first = [...(trigger.includes("boredom") || trigger.includes("proof") ? ["impulse"] : []), ...(trigger.includes("need") ? ["urgent", "researcher"] : [])];
            const rank = (id: string) => first.includes(id) ? first.indexOf(id) : first.length;
            return [...question.options].sort((a, b) => rank(a.id) - rank(b.id));
        }
        case "authorise":
            // A self-employed customer, or one who is only a freelancer, decides alone.
            return question.options.filter(option => keep(option, !(has(answers, "orgtype", "self") || onlySolo(context)) || option.id === "solo"));
        case "industry":
            // (EVERY INDUSTRY UNDER ITS SECTOR'S HEADING (1.1, the second batch of the review; owner, 2026-11-18 00:46): one choice for both.)
            return SEGMENT_SECTORS.flatMap(sector => SEGMENT_INDUSTRIES.filter(option => option.sector === sector.id)
                .map(({ id, label }, at) => at === 0 ? { id, label, heading: sector.label } : { id, label }));
        case "discover": {
            // Sales calls or tenders: how a business finds a supplier, not a person (2026-11-08).
            const offered = question.options.filter(option => keep(option, option.id !== "sales" || context.frame === "business"));
            // ORDERED, never hidden (owner, 2026-11-16 17:38): customers not at ease online (1 or 2) meet the printed and in-person ways first; a city's Segment passing by,
            // flyers and events; a Segment anywhere online the online ways.
            const comfort = Number((answers.comfort ?? [])[0] ?? 0);
            const reach = answers.reach ?? [];
            // (Customers who keep what they buy to themselves: search, reviews and adverts first; owner, 2026-11-17.)
            const first = has(answers, "share", "none") ? ["search", "media", "adverts"]
                : comfort >= 1 && comfort <= 2 ? ["passing", "flyers", "post", "adverts", "events"]
                : reach.includes("city") ? ["passing", "flyers", "events"]
                    : reach.includes("online") ? ["communities", "creators", "media", "algorithmic", "search", "affiliates"]
                        : [];
            const rank = (id: string) => first.includes(id) ? first.indexOf(id) : first.length;
            // (TWO HEADED GROUPS, Online and In person, in print and on air, each in that order; the group holding the first-ranked way first; Other last. Owner, 2026-11-17.)
            const sorted = [...offered].filter(option => option.id !== "other").sort((a, b) => rank(a.id) - rank(b.id));
            const online = sorted.filter(option => DISCOVER_ONLINE.includes(option.id));
            const inPerson = sorted.filter(option => !DISCOVER_ONLINE.includes(option.id));
            const headed = (list: SegmentOption[], heading: string) => list.map((option, at) => at === 0 ? { ...option, heading } : option);
            const groups = sorted.length > 0 && !DISCOVER_ONLINE.includes(sorted[0].id) && rank(sorted[0].id) < first.length
                ? [...headed(inPerson, "In person, in print and on air"), ...headed(online, "Online")]
                : [...headed(online, "Online"), ...headed(inPerson, "In person, in print and on air")];
            return [...groups, ...offered.filter(option => option.id === "other")];
        }
        case "marketplaces": {
            // (FILTERED BY THE OFFERINGS' FORMS (O1; owner, 2026-11-17): a maker's marketplaces, a digital file's, a service's; Other always; every one while no form is known.)
            const fit = [...new Set((context.forms ?? []).flatMap(form => MARKETPLACES_OF_FORM[form] ?? []))];
            // (And those that sell in the Organisation's country: providerOffered; owner, 2026-11-17 07:16.)
            return question.options.filter(option => keep(option, (fit.length === 0 || option.id === "other" || fit.includes(option.id)) && providerOffered(MARKETPLACE_PROVIDER[option.id] ?? "", context.country)));
        }
        case "providers": {
            // (ORDERED BY WHERE THEY SHOP (owner, 2026-11-17): in a shop, the card readers first; online, the online payment services first; never locked.)
            const setting = answers.setting ?? [];
            const first = setting.includes("store") ? ["sumup", "square", "zettle"] : setting.some(id => ["mobile", "desktop", "marketplace", "multi"].includes(id)) ? ["stripe", "paypal", "shopify"] : [];
            const rank = (id: string) => id === "other" ? first.length + 1 : first.includes(id) ? first.indexOf(id) : first.length;
            // (Those that sell in the Organisation's country, each by its name there -- Zettle is PayPal Point of Sale in the US; owner, 2026-11-17 07:16.)
            return question.options
                .filter(option => keep(option, option.id === "other" || providerOffered(option.label, context.country)))
                .map(option => ({ ...option, label: paymentServiceName(option.label, context.country) }))
                .sort((a, b) => rank(a.id) - rank(b.id));
        }
        case "advertising":
            // (Journals and trade magazines: for customers with a postgraduate degree, and for a business Segment whose industry is chosen; owner, 2026-11-17.)
            return question.options.filter(option => keep(option, option.id !== "journals" || has(answers, "education", "postgraduate") || (context.frame === "business" && (answers.industry ?? []).length > 0)));
        case "pay":
            return question.options.filter(option => keep(option,
                !(option.id === "bnpl" && has(answers, "age", "minor"))
                && !(option.id === "invoicepo" && context.frame === "people")));
        case "u-school":
            // A baby is in the early years, a child in the early years or primary school, a teenager at secondary school.
            return question.options.filter(option => keep(option,
                has(answers, "u-age", "baby") ? option.id === "early"
                    : has(answers, "u-age", "child") ? option.id !== "secondary"
                        : has(answers, "u-age", "teen") ? option.id === "secondary"
                            : true));
        case "u-age":
            // A business Segment's end user (staff, a partner, clients) is of working age: no age under 18 (owner, 2026-11-08) and no retiree (phase 5, 2026-11-08), Young adult to Mature.
            // The people an institution serves are of any age (a school's pupils, a care home's residents; 2026-11-09).
            return USER_AGES.filter(option => keep(option, !(context.frame === "business" && !segmentServesPeople(context) && (option.stage === "age:minor" || option.stage === "age:senior"))
                && (context.userStages.length === 0 || context.userStages.includes(option.stage))))
                .map(({ id, label }) => ({ id, label }));
        default:
            return question.options;
    }

}

/** Whether a radio's options are short enough to stand in a row (2 to 6 options, each of 24 characters or fewer, 90 in all; the row never wraps): the card draws the others one under the other. */
export function segmentRowChoice(question: SegmentQuestion, options: readonly SegmentOption[]): boolean {
    // (The words an option shows: what stands in brackets or after a colon is in the question's "i".)
    const words = options.map(option => splitOption(option).option.label.length);
    return !question.many && options.length >= 2 && options.length <= 6 && words.every(length => length <= 24) && words.reduce((sum, length) => sum + length, 0) <= 90;
}

/**
 * What Positioning or the answers above have set in a box, in words, for the lines under its title ("From Positioning: Type of organisation: Self-employed"): a question asked of the Segment
 * whose one option left is its answer, and the size of customers who are only freelancers (no employees). Nothing the user chose is repeated here.
 */
export function segmentSettledNotes(box: SegmentBox, answers: SegmentAnswers, context: SegmentContext): string[] {

    const notes = QUESTIONS
        .filter(question => question.box === box && segmentQuestionAsked(question, answers, context))
        .flatMap(question => {
            const options = segmentOptions(question, answers, context, false);
            return options.length === 1 ? [(question.name ?? question.label) + ": " + options[0].label] : [];
        });

    if (box === "business-data" && onlySolo(context)) {
        notes.push("Size: no employees");
    }
    // (The sector, a record of the industry chosen: 1.1, the second batch of the review.)
    const sector = SEGMENT_SECTORS.find(entry => (segmentSettle(answers, context).sector ?? []).includes(entry.id));
    if (box === "business-data" && sector && context.frame !== "people") {
        notes.push("Sector: " + sector.label);
    }

    return notes;

}

/** The questions of one box a Segment is asked and shows, in order: a question with only one option left is not shown (there is nothing to choose); its answer is that option (see segmentSettle). */
export function segmentQuestionsOf(box: SegmentBox, answers: SegmentAnswers, context: SegmentContext): SegmentQuestion[] {
    return QUESTIONS.filter(question => question.box === box && !question.startsProfile && segmentQuestionAsked(question, answers, context)
        && segmentOptions(question, answers, context, false).length !== 1)
        .map(question => ({ ...question, label: segmentWho(question.label, question.box, context) }));
}

/**
 * Who the questions are about: "your customers" for a direct buyer; for a Proxy or Dual-Intent buyer the buyer is told from the user, so the boxes of the buyer say "your buyers" and the box of the
 * end user says "your end users". The questions are written for customers; the documents word them the same way (segmentAnswerLines with the Segment's context).
 */
export function segmentWho(label: string, box: SegmentBox, context: SegmentContext): string {
    // ("How many potential customers are there?": the buyers too, as the rest of the buyer's boxes, 2026-11-09.)
    return context.endsUser ? label.replace(/your customers/g, box === "user" ? "your end users" : "your buyers").replace(/potential customers/g, box === "user" ? "potential end users" : "potential buyers") : label;
}

/** The answers after one question's choice changed: "They don't typically share" and the other ways exclude each other; ticks stay within their limit. */
/**
 * THE SEGMENT'S OWN STARTS (B4; owner, 2026-11-17 08:38; they were written into the saved answers when the source was chosen, so they stopped following it):
 * where a question was never answered (no key saved), its start from the answers it follows, worked out each time --
 * - Who decides to buy (Box 4, 9) from the kind and size of organisation (Box 3, 1 and 2): a public body or a large organisation, Formal procurement; a
 *   micro or self-employed one, One person decides (2026-11-09);
 * - How they pay: Digital wallets where they buy on a phone (owner, 2026-11-01);
 * - Are your customers working? from the age term: Established, Peak and Mature working; Minors, Active retirees and the Dependent not, with Why not
 *   working? Student for minors and Retired for the others. Young adults start nothing (owner, 2026-11-09: most of them work, BLS 67.5% of 20 to 24
 *   year-olds employed).
 * `saved` holds the keys answered; `shown` the answers as the card shows them (a source may itself be a start).
 */
export function segmentAnswerStarts(saved: SegmentAnswers, shown: SegmentAnswers): SegmentAnswers {
    const starts: SegmentAnswers = {};
    if (!("authorise" in saved)) {
        const formal = has(shown, "orgtype", "public") || has(shown, "size", "large");
        const alone = has(shown, "orgtype", "self") || has(shown, "size", "micro");
        if (formal || alone) {
            starts.authorise = [formal ? "procurement" : "solo"];
        }
    }
    // (And Invoice or purchase order where a manager signs off or a formal procurement decides: 2.8, the second batch of the review; owner, 2026-11-18 00:46.)
    const decides = starts.authorise ?? shown.authorise ?? [];
    const invoiced = decides.includes("procurement") || decides.includes("executive");
    if (!("pay" in saved) && (has(shown, "setting", "mobile") || invoiced)) {
        starts.pay = [...(has(shown, "setting", "mobile") ? ["wallet"] : []), ...(invoiced ? ["invoicepo"] : [])];
    }
    const age = (shown.age ?? [])[0];
    if (!("work" in saved) && age) {
        if (age === "established" || age === "peak" || age === "mature") {
            starts.work = ["working"];
        } else if (age === "minor" || age === "active" || age === "dependent") {
            starts.work = ["notworking"];
        }
    }
    const work = starts.work ?? shown.work ?? [];
    if (!("work2" in saved) && work.includes("notworking") && (age === "minor" || age === "active" || age === "dependent")) {
        starts.work2 = [age === "minor" ? "student" : "retired"];
    }
    return starts;
}

/**
 * THE STARTS A SAVED ANSWER ONCE COPIED (B4's migration, storageMigrations.followSegmentStarts): each saved answer equal to the start its source gives it now --
 * written there by the choice before 2026-11-17, never changed -- is taken out, so it follows its source again; an answer the founder changed is kept.
 */
export function withoutCopiedStarts(saved: SegmentAnswers): SegmentAnswers {
    const without: SegmentAnswers = { ...saved };
    const bare = Object.fromEntries(Object.entries(saved).filter(([key]) => !["authorise", "pay", "work", "work2"].includes(key)));
    const starts = segmentAnswerStarts(bare, saved);
    for (const key of ["authorise", "pay", "work", "work2"] as const) {
        if (starts[key] && saved[key] && JSON.stringify([...saved[key]!].sort()) === JSON.stringify([...starts[key]!].sort())) {
            delete without[key];
        }
    }
    return without;
}

/**
 * THE SAVED ANSWERS SETTLED AGAINST WHAT THE CARD SHOWS (B4; owner, 2026-11-17 08:38): a question its start makes asked (Where do they work?, under a started
 * Working) keeps its answer; the starts themselves stay unsaved. What every write of a Segment's answers settles with.
 */
export function segmentSettleSaved(saved: SegmentAnswers, context: SegmentContext): SegmentAnswers {
    const settled = segmentSettle({ ...saved, ...segmentAnswerStarts(saved, saved) }, context);
    return Object.fromEntries(Object.entries(settled).filter(([key]) => key in saved));
}

/** The ticks the answers start (segmentAnswerStarts): unticked to none, the empty answer is saved and kept, so the start does not come back (a start unticked is the founder's answer: owner, 2026-11-18). */
export const SEGMENT_TICK_STARTS: readonly string[] = ["authorise", "pay"];

export function segmentChoose(question: SegmentQuestion, answers: SegmentAnswers, next: string[]): SegmentAnswers {

    let chosen = next;

    if (question.id === "share") {
        const before = answers.share ?? [];
        chosen = next.includes("none") && !before.includes("none")
            ? ["none"]
            : next.filter(id => id !== "none" || next.length === 1);
    }

    if (question.max !== undefined) {
        chosen = chosen.slice(0, question.max);
    }

    const settled = { ...answers };

    // (A question moved from Positioning keeps an empty answer: cleared, it does not fall back to the Positioning answer saved before.)
    if (chosen.length > 0 || question.fromPositioning || SEGMENT_TICK_STARTS.includes(question.id)) {
        settled[question.id] = chosen;
    } else {
        delete settled[question.id];
    }

    // (The starts this choice gives -- Who decides to buy, How they pay, the work situation -- are no longer written here: they follow their source until
    // answered, segmentAnswerStarts; B4, owner, 2026-11-17 08:38.)

    return settled;

}

/** What a Segment's saved answers keep once the questions are applied: an answer to a question no longer asked, or to an option no longer offered, goes. */
export function segmentSettle(answers: SegmentAnswers, context: SegmentContext): SegmentAnswers {

    let current = answers;

    // A question asked depends on another's answer, which may itself go: settle until nothing changes.
    for (let round = 0; round < QUESTIONS.length; round++) {

        const next: SegmentAnswers = {};

        for (const question of QUESTIONS) {

            const chosen = current[question.id];

            if (!segmentQuestionAsked(question, current, context)) {
                // Held back by the stage alone (while Planning): the saved answer is kept, to show again from Launching.
                if (chosen && segmentHeldBack(question, current, context)) {
                    next[question.id] = chosen;
                }
                continue;
            }

            const offered = segmentOptions(question, current, context, false).map(option => option.id);

            // The one option left is the answer, shown or not.
            if (offered.length === 1) {
                next[question.id] = [offered[0]];
                continue;
            }

            if (!chosen) {
                continue;
            }

            // A question moved from Positioning: kept even when empty (cleared), and back to empty when the stage allows fewer choices than it holds (as on Positioning).
            if (question.fromPositioning) {
                const limit = choiceLimit(context.stage, "outcome");
                const kept = chosen.filter(id => offered.includes(id));
                next[question.id] = limit !== null && kept.length > limit ? [] : kept;
                continue;
            }

            if (chosen.length === 0) {
                // (A start unticked to none stays none: SEGMENT_TICK_STARTS.)
                if (SEGMENT_TICK_STARTS.includes(question.id)) {
                    next[question.id] = [];
                }
                continue;
            }

            const kept = chosen.map(id => question.id === "u-job" ? JOB_RENAMED[id] ?? id : id).filter(id => offered.includes(id));

            if (kept.length > 0) {
                next[question.id] = kept;
                // (The words written in under Other stay while Other is ticked.)
                if (question.other && kept.includes("other") && current[question.id + "-other"]) {
                    next[question.id + "-other"] = current[question.id + "-other"];
                }
            }

        }

        // (THE SECTOR, A RECORD (1.1, the second batch of the review; owner, 2026-11-18 00:46): the industry's own; a sector saved with no industry yet stays, said under the box.)
        const industry = SEGMENT_INDUSTRIES.find(option => (next.industry ?? []).includes(option.id));
        if (industry) {
            next.sector = [industry.sector];
        } else if (current.sector && current.sector.length > 0 && context.frame !== "people") {
            next.sector = current.sector;
        }

        if (JSON.stringify(next) === JSON.stringify(current)) {
            return next;
        }

        current = next;

    }

    return current;

}

/** The saved answers as read from an older or hand-edited answer: only known questions, only their options, as lists of ids. */
/** Options merged into one (owner, 2026-11-17): the old id to the one it is now. */
const SEGMENT_MERGED: Readonly<Record<string, Readonly<Record<string, string>>>> = {
    education: { highschool: "school", vocational: "college", bachelor: "degree", master: "postgraduate", doctorate: "postgraduate" },
    share: { private: "friends", verbal: "friends" }
};

export function asSegmentAnswers(source: unknown): SegmentAnswers {

    const answers: SegmentAnswers = {};

    if (typeof source !== "object" || source === null || Array.isArray(source)) {
        return answers;
    }

    // An older answer held the work situation as one list: it is now working or not, and the non-working situation.
    const migrated: Record<string, unknown> = { ...(source as Record<string, unknown>) };
    for (const [main, sub] of [["work", "work2"], ["u-work", "u-work2"]]) {
        const old = Array.isArray(migrated[main]) ? (migrated[main] as unknown[])[0] : undefined;
        if (typeof old === "string" && !["working", "notworking"].includes(old)) {
            if (old === "employed") {
                migrated[main] = ["working"];
            } else {
                migrated[main] = ["notworking"];
                migrated[sub] = [old === "home" ? "homemaker" : old];
            }
        }
    }

    // How they pay, saved before the split (owner, 2026-11-15 16:26): "Invoice, bank transfer or purchase order" is both of its parts now.
    if (Array.isArray(migrated.pay) && (migrated.pay as unknown[]).includes("invoice")) {
        migrated.pay = [...new Set((migrated.pay as unknown[]).flatMap(id => id === "invoice" ? ["invoicepo", "transfer"] : [id]))];
    }

    // OPTIONS MERGED (owner, 2026-11-17): the education levels, and the ways of sharing, saved before.
    for (const [id, merged] of Object.entries(SEGMENT_MERGED)) {
        if (Array.isArray(migrated[id])) {
            migrated[id] = [...new Set((migrated[id] as unknown[]).map(old => typeof old === "string" ? merged[old] ?? old : old))];
        }
    }

    // A degree saved before it became a rating (Questions 12, 2026-11-04): the old answer is the point it now is.
    for (const [id, points] of Object.entries(RATED_BEFORE)) {
        const old = Array.isArray(migrated[id]) ? (migrated[id] as unknown[])[0] : undefined;
        if (typeof old === "string" && points[old]) {
            migrated[id] = [points[old]];
        }
    }

    for (const question of QUESTIONS) {

        const entry = migrated[question.id];
        const ids = (Array.isArray(entry) ? entry : []).filter((id): id is string => typeof id === "string");
        const known = ids.filter((id, at) => ids.indexOf(id) === at && question.options.some(option => option.id === id));

        // (A question moved from Positioning keeps an answer cleared: an empty list saved. So does a start unticked to none: SEGMENT_TICK_STARTS.)
        if (known.length > 0 || ((question.fromPositioning || SEGMENT_TICK_STARTS.includes(question.id)) && Array.isArray(entry))) {
            answers[question.id] = question.many ? known : known.slice(0, 1);
        }

        // (Its words written in under Other, as saved.)
        const written = migrated[question.id + "-other"];
        if (question.other && known.includes("other") && Array.isArray(written)) {
            answers[question.id + "-other"] = written.filter((text): text is string => typeof text === "string");
        }

    }

    return answers;

}

/**
 * THE NAMES WRITTEN IN UNDER AN OTHER (owner, 2026-11-15 16:43: "Other could be more than 1 channel!"): one name a row of its numbered list, each trimmed, the empty ones
 * and the repeats (whatever their case) left out. A text saved before the list -- one box -- is read once as its names, parted by commas, semicolons or new lines.
 */
export function writtenInNames(saved: readonly string[] | undefined): string[] {
    const list = saved ?? [];
    const names = (list.length === 1 ? list[0].split(/[,;\n]/) : list).map(name => name.trim()).filter(name => name !== "");
    return names.filter((name, at) => names.findIndex(other => other.toLocaleLowerCase() === name.toLocaleLowerCase()) === at);
}

/**
 * THE ROWS OF AN OTHER'S LIST AS THE SCREEN SHOWS THEM (owner, 2026-11-16 14:24: the name box was a bare line): as typed, an empty row kept so Enter opens the
 * next one, one empty row at least, ready to type in; a text saved before the list, in one box, read once as its names. The channels read writtenInNames.
 */
export function writtenInRows(saved: readonly string[] | undefined): string[] {
    const list = saved ?? [];
    const rows = list.length === 1 && /[,;\n]/.test(list[0]) ? writtenInNames(list) : [...list];
    return rows.length > 0 ? rows : [""];
}

/**
 * THE PAYMENT SERVICES A SEGMENT'S PAYMENTS GO THROUGH (Which payment services do you take payments with?): the names ticked, then those written in under Other (each
 * once, several parted by commas). The fees of its Direct Payment channels are read by these names (the Channel Fee Table), a name written in its own row.
 */
export function segmentPaymentServices(answers: SegmentAnswers, country?: string): string[] {
    const question = QUESTIONS.find(entry => entry.id === "providers")!;
    const chosen = answers.providers ?? [];
    // (Each by its name in the Organisation's country: Zettle is PayPal Point of Sale in the US; owner, 2026-11-17 07:16.)
    const ticked = question.options.filter(option => option.id !== "other" && chosen.includes(option.id)).map(option => paymentServiceName(option.label, country));
    const written = chosen.includes("other") ? writtenInNames(answers["providers-other"]) : [];
    const names = [...ticked, ...written];
    return names.filter((name, at) => names.findIndex(other => other.toLocaleLowerCase() === name.toLocaleLowerCase()) === at);
}

/** Whether any question of a box has an answer. */
export function segmentBoxAnswered(answers: SegmentAnswers, box: SegmentBox): boolean {
    return QUESTIONS.some(question => question.box === box && (answers[question.id] ?? []).length > 0);
}

/**
 * Each answered question as its label and the words chosen, for the documents. With the Segment's context, a Proxy or Dual-Intent Segment's questions are worded as its card
 * words them (segmentWho): the end user's "your end users", the buyer's "your buyers" (owner, 2026-11-16).
 */
export function segmentAnswerLines(answers: SegmentAnswers, context?: SegmentContext): { label: string; value: string }[] {

    // (A question moved on to the Profile is printed there: Questions 13, E4.)
    return QUESTIONS.filter(question => !question.startsProfile).flatMap(question => {

        const chosen = answers[question.id] ?? [];
        const words = question.rating
            ? chosen.slice(0, 1).map(point => ratingWords(point, question.rating!))
            : question.options.filter(option => chosen.includes(option.id)).map(option => option.label);

        return words.length > 0
            ? [{ label: (context ? segmentWho(question.label, question.box, context) : question.label).replace(/ \(Select all that apply\)$/, ""), value: words.join("; ") }]
            : [];

    });

}
