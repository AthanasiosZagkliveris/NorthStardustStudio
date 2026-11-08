/**
 * THE SEGMENT CARD'S QUESTIONS (design document 28, 6.3 and 8.2, as the owner revised them on 2026-11-01): the choice questions asked in each of the card's five boxes, and in the user block of a Proxy or
 * Dual-Intent buyer. Pure data and rules, so the card, the saved answer and the documents read the same words: which questions a Segment is asked, which options each offers, what a choice clears.
 * The words are the owner's. Where a list names platforms or brands they stand in the question's "i" as examples, never in the option.
 */

import { DIFFERENTIATION_WORDS, OUTCOME_USER_WORDS } from "./ActivityClassification.ts";
import { choiceLimit } from "./PositioningIds.ts";

/** The boxes of the Segment's Description, its user block, and "competitors": a question of the Segment asked once in its Competitors column, after the Competitor cards (doc 41, K14). */
export type SegmentBox = "demographics" | "geographics" | "business-data" | "purchasing" | "market-size" | "user" | "competitors";

export interface SegmentOption {
    id: string;
    label: string;
}

export interface SegmentQuestion {
    id: string;
    box: SegmentBox;
    label: string;
    /** Ticks (one or more) rather than a radio (one). */
    many: boolean;
    /** The most ticks allowed. */
    max?: number;
    options: readonly SegmentOption[];
    /** What its "i" says. */
    info: readonly string[];
    /** A short name for the notes that say what Positioning or the answers above set ("Size: Medium-sized business"). */
    name?: string;
    /** A degree, asked as a rating from 1 to 5 (RatingScale): the words over its ends (doc 35, owner 2026-11-04). The answer is the point, "1" to "5". */
    rating?: { low: string; high: string };
    /**
     * A question that left Positioning for the Segment (owner, 2026-11-08): its limit is the business stage's (Positioning's outcome limit, `choiceLimit`), an answer over it goes back to
     * empty, and an answer cleared stays cleared (saved as an empty list), so the Positioning answer saved before, its start, does not come back (`segmentPositioningShown`).
     */
    fromPositioning?: boolean;
    /**
     * Moved on to the Profile (owner, 2026-11-08: the end user's outcome is asked in each Profile's end-user part, doc 36, E4): not shown on the Segment and not printed with its
     * answers; a saved answer stays readable and settled, as the Profile's start.
     */
    startsProfile?: boolean;
}

/** What a Segment's questions follow: Identity's answers and the business stage. */
export interface SegmentContext {
    /** Who the buyer is: people (Box 1), businesses (Box 3), or not known / both. */
    frame: "people" | "business" | "open";
    /** "plan", "launch", "manage" or "grow" (empty: not known, as planning). */
    stage: string;
    /** The buyer's life stages chosen in Positioning (young, adult, senior). */
    lifeStages: readonly string[];
    /** Whether the buyer is a Proxy or Dual-Intent buyer, so the user is described too. */
    endsUser: boolean;
    /** The user's life stages chosen in Positioning (age:minor, age:young, age:adult, age:senior). */
    userStages: readonly string[];
    /** The buyer and user relationships chosen in Positioning (rel:parent and so on). */
    relations: readonly string[];
    /** The scales of a business buyer chosen in Positioning (solo, smb, mid, enterprise). */
    scales: readonly string[];
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
 * Degree and comfort questions are ratings unless named ranges exist (doc 35, owner 2026-11-04).
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

/** The answers saved before a question became a rating, and the point each now is (doc 35). */
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

/** The six classes of industries, each over the industries of document 28 (G15) that sit in it. */
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

/** The buyer's age terms (document 31, 10.1: the term leads, the age defines it), and the Positioning life stage each belongs to. */
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
    "Professional: for example a teacher, nurse, engineer or lawyer. Skilled trade: for example an electrician, plumber or chef.",
    "Someone who owns and runs a business: Manager / director. Armed forces: choose the group that fits the role."
] as const;

const AGE_NOTE = "Each age group holds the years from its first number to its last, both included, so no age is in two groups (25–39, then 40–54).";

const RAW_QUESTIONS: readonly SegmentQuestion[] = [

    /* ---- Box 1, Demographics ---- */

    {
        id: "age", box: "demographics", label: "How old are your customers?", many: false,
        options: BUYER_AGES.map(({ id, label }) => ({ id, label })),
        info: [
            "Minors, semi-dependent: Mid and Late Adolescence, with limited buying power; mostly cash, wallets and gift cards.",
            "Credit and long contracts are not open to them. Look up the country's online-consent age and its minimum working age.",
            "Choose the group that pays, not the one that uses it.",
            AGE_NOTE
        ]
    },
    {
        id: "education", box: "demographics", label: "What is their highest level of education?", many: false,
        options: [
            { id: "school", label: "Did not finish secondary school" },
            { id: "highschool", label: "Secondary school" },
            { id: "vocational", label: "Vocational / technical diploma" },
            { id: "bachelor", label: "Bachelor's degree" },
            { id: "master", label: "Master's degree" },
            { id: "doctorate", label: "Doctorate" }
        ],
        info: [
            "Each level includes the ones below it: someone with a Master has a Bachelor.",
            "Secondary school: A-levels or the Leaving Certificate (UK, Ireland), a diploma (USA, Canada), Year 12 (Australia, New Zealand).",
            "Vocational or technical diploma: a post-school qualification such as a BTEC, a trade certificate or an associate degree."
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
        info: ["How steady their pay is, not how much it is (that is the household income below).", "A fixed salary suits regular subscriptions; variable or hourly earners feel sudden cash-flow dips."]
    },
    {
        id: "income", box: "demographics", label: "How high is your customers' household income?", many: false,
        rating: INCOME_RATING, options: ratingOptions(INCOME_RATING),
        info: ["Compare with the typical household income in their country: 3 is around the median.", "Household income is what the home earns together, not one person's pay."]
    },
    {
        id: "gender", box: "demographics", label: "What is the gender mix of your customers?", many: false,
        rating: GENDER_RATING, options: ratingOptions(GENDER_RATING),
        info: ["1 is 80% or more men, 2 is 60 to 80%, 3 a balanced mix (40 to 60%), 4 is 60 to 80% women, 5 is 80% or more.", "Choose 3 when it does not matter for what you sell."]
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
        info: ["1 is countryside or remote places, 3 the suburbs and towns around a city, 5 a city centre.", "Asked once the business is managing or growing, and only for customers in one place or one country."]
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
        id: "sector", box: "business-data", label: "Which sector are your customers in?", many: false,
        options: SEGMENT_SECTORS,
        info: ["Six classes over the industries below. If they work in more than one industry, make another Segment."]
    },
    {
        id: "industry", box: "business-data", label: "Which industry are your customers in?", many: false,
        options: SEGMENT_INDUSTRIES,
        info: [
            "The industries of the sector chosen, as the official schemes (SIC and NACE, NAICS, ANZSIC) name their sections.",
            "Government and public administration includes embassies and international bodies.", "Other services includes households that employ staff, such as cleaners and nannies."
        ]
    },

    /* ---- Box 4, Purchasing Power & Behaviour ----
       In the order of a purchase (owner, 2026-11-08, P3): online comfort and how they socialise, what makes them shop, where they discover, how they decide (a business:
       who decides), where they shop, how they pay, then how they share it. The codes stay Box 4, 1 to 9 (doc 44: codes are ids, not positions). */

    {
        id: "comfort", box: "purchasing", label: "How comfortable are your customers online?", many: false,
        rating: COMFORT_RATING, options: ratingOptions(COMFORT_RATING),
        info: ["How easily they use websites, apps and online payment, not whether they own a device."]
    },
    {
        id: "social", box: "purchasing", label: "How do your customers like to socialise?", many: false,
        options: [
            { id: "digital", label: "Mostly online (gaming, community servers, chat apps)" },
            { id: "mixed", label: "Online and in person" },
            { id: "inperson", label: "Mostly in person (events, hospitality, clubs, sports)" }
            // ("Mostly on their own" removed, owner 2026-11-04: it contradicted the question and fed nothing; a saved answer of it is dropped when read.)
        ],
        info: ["Where they spend their free time. It decides how they meet brands and products."]
    },
    {
        id: "trigger", box: "purchasing", label: "What makes your customers go shopping?", many: true, max: 2,
        options: [
            { id: "boredom", label: "Boredom or entertainment (browsing feeds, window shopping)" },
            { id: "proof", label: "Seeing a friend or creator use it" },
            { id: "need", label: "A need / problem to solve" },
            { id: "seasonal", label: "Sales, seasons or planned gifts" }
        ],
        info: ["Choose up to two."]
    },
    {
        id: "discover", box: "purchasing", label: "Where do your customers discover new products?", many: true, max: 3,
        options: [
            { id: "peers", label: "Friends, family and colleagues" },
            { id: "communities", label: "Online communities / forums" },
            { id: "creators", label: "Creators / influencers / experts" },
            { id: "media", label: "Media, reviews and comparison sites" },
            { id: "algorithmic", label: "Feeds, ads and marketplace suggestions" },
            // (Added 2026-11-08, the research; "Sales calls or tenders" is offered for business customers only, segmentOptions.)
            { id: "search", label: "Search engines / maps" },
            { id: "passing", label: "Seeing it in person / passing by" },
            { id: "events", label: "Events / trade shows" },
            { id: "sales", label: "Sales calls or tenders" }
        ],
        info: [
            "Examples: communities such as Reddit, Discord and Facebook Groups; creators on TikTok, Instagram, YouTube and LinkedIn.",
            "Seeing it in person / passing by: a shop window, a stall, a sign or a vehicle. Sales calls or tenders: asked for business customers only.",
            "Choose up to three."
        ]
    },
    {
        id: "path", box: "purchasing", label: "How do your customers usually decide to buy?", many: false,
        options: [
            // (2026-11-08, the research: "Straight away" reworded as an impulse, its id kept; habit and urgent need added.)
            { id: "impulse", label: "On impulse: They see it, like it and buy it there and then" },
            { id: "researcher", label: "After comparing options: They weigh prices, features and reviews first" },
            { id: "validator", label: "On a recommendation: They buy what friends, family or colleagues suggest" },
            { id: "habit", label: "Out of habit: They buy again what they bought before, as a routine" },
            { id: "urgent", label: "When they urgently need it: They buy what solves it now" }
        ],
        info: ["Their usual way of buying, the one that fits most of them. Reviews read online count as comparing; advice from people they know is a recommendation.",
            "On impulse or when they urgently need it, their Profiles are not asked how they compare options."]
    },
    {
        id: "authorise", name: "Decision", box: "purchasing", label: "Who decides to buy?", many: true,
        options: [
            { id: "solo", label: "One person decides: The person who uses it has the budget and the final say." },
            { id: "champions", label: "The team agrees: The people who use it try it and push it upward." },
            { id: "executive", label: "A manager signs off: Needs formal approval from a manager or executive." },
            { id: "multi", label: "Several departments check: IT or security, legal and finance." },
            { id: "procurement", label: "Formal procurement: A tender or a request for proposals (RFP), with strict compliance." }
        ],
        info: ["Asked for business customers only.", "Select all that apply."]
    },
    {
        id: "setting", box: "purchasing", label: "Where do your customers usually shop?", many: false,
        options: [
            { id: "mobile", label: "Online, on a phone" },
            { id: "desktop", label: "Online, on a computer" },
            { id: "store", label: "In a shop" },
            { id: "multi", label: "Both online and in shops" }
        ],
        info: ["Where most of their purchases start and finish. Choose Both online and in shops when they mix the two about equally."]
    },
    {
        id: "pay", box: "purchasing", label: "How do your customers pay?", many: true,
        options: [
            { id: "card", label: "Credit / debit card" },
            { id: "wallet", label: "Digital wallets" },
            { id: "cash", label: "Cash" },
            { id: "bnpl", label: "Buy Now, Pay Later or financing" },
            { id: "invoice", label: "Invoice, bank transfer or purchase order" }
        ],
        info: [
            "Digital wallets are for example Apple Pay, Google Pay and PayPal. Buy Now, Pay Later is for example Klarna and Afterpay.",
            "Cash is still about one payment in ten in the UK (UK Finance, 2024).",
            "Invoicing is asked for business customers only. Credit and Buy Now, Pay Later are not open to minors.",
            "Choosing a phone as where they buy starts Digital wallets here; change it freely.",
            "Select all that apply."
        ]
    },
    {
        id: "share", box: "purchasing", label: "How do your customers share what they like?", many: true,
        options: [
            { id: "public", label: "They post it publicly on social media" },
            { id: "private", label: "They send it to friends in private chats" },
            { id: "verbal", label: "They tell people in person" },
            { id: "none", label: "They rarely share what they buy" }
        ],
        info: ["Private chat apps are for example WhatsApp and iMessage. \"They rarely share what they buy\" excludes the other three."]
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
        info: ["Everyone in the area you serve who could buy it, if every one of them chose you (the total addressable market).", "For a Segment of businesses, count the organisations, not the people in them."]
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
            { id: "regulation", label: "Rules and law: New compliance, tax changes" },
            { id: "economy", label: "The economy: Inflation, budget cuts, shifts in spending power" },
            { id: "society", label: "Society and lifestyle: Remote work, changing habits" },
            { id: "supply", label: "Supply and delivery: Material shortages, logistics costs, local sourcing" },
            // (Added 2026-11-08, the research: the E of PESTLE. The environmental mandates and sustainability moved here from Rules and law and Society, so nothing overlaps.)
            { id: "environment", label: "Environment and climate: Extreme weather, sustainability, environmental mandates" }
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
        info: ["Asked of a parent or guardian, and of a caregiver, who buy for a child. Secondary school is not offered for a Baby or a Child."]
    },
    {
        id: "u-work", box: "user", label: "Are your customers working?", many: false,
        options: WORKING,
        info: ["The same question as for the buyer, asked of the end user: an adult the buyer is related to, or sponsors.", ...WORKING_INFO]
    },
    {
        id: "u-work2", box: "user", label: "Why are your customers not working?", many: false,
        options: NOT_WORKING,
        info: NOT_WORKING_INFO
    },
    {
        id: "u-job", box: "user", label: "What kind of work do your customers do?", many: false,
        options: JOB_LEVELS,
        info: JOB_INFO
    },
    {
        id: "u-orgtype", box: "user", label: "What kind of organisation are their clients?", many: false,
        options: ORG_TYPES,
        info: ["Asked of a business serving clients and of a professional intermediary."]
    },
    {
        id: "u-size", box: "user", label: "How big are their clients' organisations?", many: false,
        options: ORG_SIZES,
        info: ["Skipped for self-employed clients."]
    },
    {
        id: "u-comfort", box: "user", label: "How comfortable are your customers online?", many: false,
        rating: COMFORT_RATING, options: ratingOptions(COMFORT_RATING),
        info: ["How easily they use websites, apps and online payment, not whether they own a device."]
    },
    // Positioning's question 10, moved here on 2026-11-08 (owner: "Move all three"), its options and "i" as built; moved on the same day to each Profile's end-user part (doc 36, E4),
    // where a saved answer here is the start: kept and settled, no longer shown.
    {
        id: "u-outcome", box: "user", label: "Outcome for the end user", many: true, fromPositioning: true, startsProfile: true,
        options: Object.entries(OUTCOME_USER_WORDS).map(([id, label]) => ({ id, label })),
        info: [
            "What matters most to the end user, apart from the buyer's own reasons for paying: the result the end user gets. It starts the end user's Profile.",
            "Enjoyment & fun. Comfort & ease. Safety & care. Learning & growth. Looks & belonging (fitting in with friends, a style). Practical use."
        ]
    },

    /* ---- Asked once in the Segment's Competitors column, after its Competitors (doc 41, K14) ---- */

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

/** The sizes each Positioning scale of a business buyer holds (the mapping of doc 28, 8.2; the owner approved it 2026-11-01): a solo buyer has no employees, so no size is asked. */
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

const PERSONAL = ["rel:parent", "rel:caregiver"];
const ADULT_PERSONAL = ["rel:family", "rel:partner", "rel:friend", "rel:otherpersonal", "rel:commercial", "rel:sponsor"];
const JOB = ["rel:employer", "rel:copartner", "rel:otherbusiness"];
const CLIENTS = ["rel:serving", "rel:intermediary"];

/** Whether the business stage is still planning or launching: the checks are held back. */
export function segmentEarly(stage: string): boolean {
    return stage !== "manage" && stage !== "grow";
}

function has(answers: SegmentAnswers, id: string, option: string): boolean {
    return (answers[id] ?? []).includes(option);
}

/** Whether a question is asked of a Segment, given its answers so far. */
export function segmentQuestionAsked(question: SegmentQuestion, answers: SegmentAnswers, context: SegmentContext): boolean {

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
            return !segmentEarly(context.stage) && ["city", "region", "country"].some(id => has(answers, "reach", id));
        case "orgtype": case "sector":
            return business;
        case "size":
            return business && !has(answers, "orgtype", "self") && !onlySolo(context);
        case "industry":
            return business && (answers.sector ?? []).length > 0;
        case "social": case "share": case "trigger": case "path":
            return people;
        case "authorise":
            return business;
        case "u-age": case "u-outcome":
            return context.endsUser;
        case "u-comfort":
            // A baby does not use online tools.
            return context.endsUser && !has(answers, "u-age", "baby");
        case "u-school":
            // No school stage for a user of 18 or more.
            return context.endsUser && context.relations.some(id => PERSONAL.includes(id)) && !ADULT_USER_AGES.some(id => has(answers, "u-age", id));
        case "u-work":
            // No work status for a baby or a child.
            return context.endsUser && context.relations.some(id => ADULT_PERSONAL.includes(id)) && !has(answers, "u-age", "baby") && !has(answers, "u-age", "child");
        case "u-work2":
            return context.endsUser && context.relations.some(id => ADULT_PERSONAL.includes(id)) && has(answers, "u-work", "notworking");
        case "u-job":
            return context.endsUser && context.relations.some(id => JOB.includes(id));
        case "u-orgtype":
            return context.endsUser && context.relations.some(id => CLIENTS.includes(id));
        case "u-size":
            return context.endsUser && context.relations.some(id => CLIENTS.includes(id)) && !has(answers, "u-orgtype", "self");
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
        case "authorise":
            // A self-employed customer, or one who is only a freelancer, decides alone.
            return question.options.filter(option => keep(option, !(has(answers, "orgtype", "self") || onlySolo(context)) || option.id === "solo"));
        case "u-work2":
            return question.options.filter(option => keep(option, !(option.id === "retired" && (has(answers, "u-age", "baby") || has(answers, "u-age", "child") || has(answers, "u-age", "teen")))));
        case "industry":
            return SEGMENT_INDUSTRIES.filter(option => keep(option, (answers.sector ?? []).includes(option.sector)))
                .map(({ id, label }) => ({ id, label }));
        case "discover":
            // Sales calls or tenders: how a business finds a supplier, not a person (2026-11-08).
            return question.options.filter(option => keep(option, option.id !== "sales" || context.frame === "business"));
        case "pay":
            return question.options.filter(option => keep(option,
                !(option.id === "bnpl" && has(answers, "age", "minor"))
                && !(option.id === "invoice" && context.frame === "people")));
        case "u-school":
            // A baby is in the early years, a child in the early years or primary school, a teenager at secondary school.
            return question.options.filter(option => keep(option,
                has(answers, "u-age", "baby") ? option.id === "early"
                    : has(answers, "u-age", "child") ? option.id !== "secondary"
                        : has(answers, "u-age", "teen") ? option.id === "secondary"
                            : true));
        case "u-age":
            // A business Segment's end user (staff, a partner, clients) is an adult: no age under 18 is offered (owner, 2026-11-08).
            return USER_AGES.filter(option => keep(option, !(context.frame === "business" && option.stage === "age:minor")
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
 * end user says "your end users". The questions are written for customers; the documents and the answers' lines keep that word.
 */
export function segmentWho(label: string, box: SegmentBox, context: SegmentContext): string {
    return context.endsUser ? label.replace(/your customers/g, box === "user" ? "your end users" : "your buyers") : label;
}

/** The answers after one question's choice changed: "They don't typically share" and the other ways exclude each other; ticks stay within their limit. */
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
    if (chosen.length > 0 || question.fromPositioning) {
        settled[question.id] = chosen;
    } else {
        delete settled[question.id];
    }

    // A starting value the user can change (owner, 2026-11-01): Digital wallets, where they buy on a phone and no way of paying is chosen yet.
    if (question.id === "setting" && chosen.includes("mobile") && !settled.pay) {
        settled.pay = ["wallet"];
    }

    // A starting value the user confirms: the work situation that goes with the age term, where none is chosen yet.
    if (question.id === "age" && chosen.length > 0 && !settled.work) {
        const age = chosen[0];
        if (age === "established" || age === "peak" || age === "mature") {
            settled.work = ["working"];
        } else {
            settled.work = ["notworking"];
            settled.work2 = [age === "active" || age === "dependent" ? "retired" : "student"];
        }
    }

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
                continue;
            }

            const kept = chosen.map(id => question.id === "u-job" ? JOB_RENAMED[id] ?? id : id).filter(id => offered.includes(id));

            if (kept.length > 0) {
                next[question.id] = kept;
            }

        }

        if (JSON.stringify(next) === JSON.stringify(current)) {
            return next;
        }

        current = next;

    }

    return current;

}

/** The saved answers as read from an older or hand-edited answer: only known questions, only their options, as lists of ids. */
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

    // A degree saved before it became a rating (doc 35, 2026-11-04): the old answer is the point it now is.
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

        // (A question moved from Positioning keeps an answer cleared: an empty list saved.)
        if (known.length > 0 || (question.fromPositioning && Array.isArray(entry))) {
            answers[question.id] = question.many ? known : known.slice(0, 1);
        }

    }

    return answers;

}

/** Whether any question of a box has an answer. */
export function segmentBoxAnswered(answers: SegmentAnswers, box: SegmentBox): boolean {
    return QUESTIONS.some(question => question.box === box && (answers[question.id] ?? []).length > 0);
}

/** Each answered question as its label and the words chosen, for the documents. */
export function segmentAnswerLines(answers: SegmentAnswers): { label: string; value: string }[] {

    // (A question moved on to the Profile is printed there: doc 36, E4.)
    return QUESTIONS.filter(question => !question.startsProfile).flatMap(question => {

        const chosen = answers[question.id] ?? [];
        const words = question.rating
            ? chosen.slice(0, 1).map(point => ratingWords(point, question.rating!))
            : question.options.filter(option => chosen.includes(option.id)).map(option => option.label);

        return words.length > 0
            ? [{ label: question.label.replace(/ \(Select all that apply\)$/, ""), value: words.join("; ") }]
            : [];

    });

}
