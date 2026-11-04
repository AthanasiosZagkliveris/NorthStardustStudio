/**
 * THE SEGMENT CARD'S QUESTIONS (design document 28, 6.3 and 8.2, as the owner revised them on 2026-11-01): the choice questions asked in each of the card's five boxes, and in the user block of a Proxy or
 * Dual-Intent buyer. Pure data and rules, so the card, the saved answer and the documents read the same words: which questions a Segment is asked, which options each offers, what a choice clears.
 * The words are the owner's. Where a list names platforms or brands they stand in the question's "i" as examples, never in the option.
 */

export type SegmentBox = "demographics" | "geographics" | "business-data" | "purchasing" | "market-size" | "user";

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
    /** A degree, asked as a rating from 1 to 5 (RatingField): the words over its ends and, where one helps, its middle (doc 35, owner 2026-11-04). The answer is the point, "1" to "5". */
    rating?: { low: string; mid?: string; high: string };
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
 * A RATING'S POINTS as options, so a rating is saved and settled as every choice is: the ids "1" to "5" ("3 of 5"). Its end and middle words are added where it is printed (ratingWords).
 * Degree and comfort questions are ratings unless named ranges exist (doc 35, owner 2026-11-04).
 */
export function ratingOptions(_rating: { low: string; mid?: string; high: string }): SegmentOption[] {
    return ["1", "2", "3", "4", "5"].map(point => ({ id: point, label: point + " of 5" }));
}

/** A rating as a document prints it: "3 of 5 (Fairly comfortable)", the words only at an end or the middle. */
export function ratingWords(point: string, rating: { low: string; mid?: string; high: string }): string {
    const word = point === "1" ? rating.low : point === "3" ? rating.mid : point === "5" ? rating.high : undefined;
    return point + " of 5" + (word ? " (" + word + ")" : "");
}

const COMFORT_RATING = { low: "Not comfortable", mid: "Fairly comfortable", high: "Very comfortable" };

/** The answers saved before a question became a rating, and the point each now is (doc 35). */
const RATED_BEFORE: Record<string, Record<string, string>> = {
    comfort: { averse: "1", moderate: "3", savvy: "5" },
    "u-comfort": { averse: "1", moderate: "3", savvy: "5" },
    trajectory: { declining: "1", flat: "3", growing: "4", expanding: "5" },
    competition: { blue: "1", fragmented: "3", red: "5" }
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
            { id: "salary", label: "Fixed salary (Predictable monthly/bi-weekly paycheck)" },
            { id: "hourly", label: "Hourly wage (Fluctuating based on scheduled shifts)" },
            { id: "variable", label: "Variable pay (Freelance invoices, commission, seasonal contracts)" }
        ],
        info: ["How steady their pay is, not how much it is (that is the household income below).", "A fixed salary suits regular subscriptions; variable or hourly earners feel sudden cash-flow dips."]
    },
    {
        id: "income", box: "demographics", label: "How high is your customers' household income?", many: false,
        options: [
            { id: "low", label: "Low" },
            { id: "lower-middle", label: "Lower-middle" },
            { id: "middle", label: "Middle" },
            { id: "upper-middle", label: "Upper-middle" },
            { id: "high", label: "High" }
        ],
        info: ["Compare with the typical household income in their country: Middle is around the median, Low and High are the ends.", "Household income is what the home earns together, not one person's pay."]
    },
    {
        id: "gender", box: "demographics", label: "What is the gender mix of your customers?", many: false,
        options: [
            { id: "men", label: "Mostly men (80%+)" },
            { id: "leans-men", label: "Leans men (60–80%)" },
            { id: "balanced", label: "Balanced mix (40–60%)" },
            { id: "leans-women", label: "Leans women (60–80%)" },
            { id: "women", label: "Mostly women (80%+)" }
        ],
        info: ["The share of your customers who are men or women. Choose Balanced mix when it does not matter for what you sell."]
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
        options: [
            { id: "urban", label: "Urban (High-density city centre)" },
            { id: "suburban", label: "Suburban (Residential towns surrounding a city)" },
            { id: "rural", label: "Rural / remote (Low-density countryside or isolated areas)" }
        ],
        info: ["The kind of place they live or work in. Asked once the business is managing or growing, and only for customers in one place or one country."]
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
        info: ["The EU's definition of small and medium-sized enterprises: micro under 10 employees, small under 50, medium-sized under 250.", "Countries define them a little differently; the United States and Canada use other limits.", "The sizes follow the scale chosen in Positioning."]
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
            "Government and public administration includes embassies and international bodies. Other services includes households that employ staff, such as cleaners and nannies."
        ]
    },

    /* ---- Box 4, Purchasing Power & Behaviour ---- */

    {
        id: "comfort", box: "purchasing", label: "How comfortable are your customers online?", many: false,
        rating: COMFORT_RATING, options: ratingOptions(COMFORT_RATING),
        info: ["How easily they use websites, apps and online payment, not whether they own a device."]
    },
    {
        id: "discover", box: "purchasing", label: "Where do your customers discover new products?", many: true, max: 3,
        options: [
            { id: "peers", label: "Friends, family and colleagues" },
            { id: "communities", label: "Online communities / forums" },
            { id: "creators", label: "Creators / influencers / experts" },
            { id: "media", label: "Media, reviews and comparison sites" },
            { id: "algorithmic", label: "Feeds, ads and marketplace suggestions" }
        ],
        info: [
            "Examples: communities such as Reddit, Discord and Facebook Groups; creators on TikTok, Instagram, YouTube and LinkedIn.",
            "What you tick here is offered on the Profile as related platforms to choose from.",
            "Choose up to three."
        ]
    },
    {
        id: "social", box: "purchasing", label: "How do your customers like to socialise?", many: false,
        options: [
            { id: "digital", label: "Mostly online (gaming, community servers, chat apps)" },
            { id: "mixed", label: "Online and in person" },
            { id: "inperson", label: "Mostly in person (events, hospitality, clubs, sports)" },
            { id: "independent", label: "Mostly on their own" }
        ],
        info: ["Where they spend their free time. It decides how they meet brands and products."]
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
        id: "path", box: "purchasing", label: "How do your customers usually decide to buy?", many: false,
        options: [
            { id: "impulse", label: "On impulse: They see it, like it and buy it at once" },
            { id: "researcher", label: "After research: They compare at length before buying" },
            { id: "validator", label: "After asking others: They ask a friend or check reviews first" }
        ],
        info: ["Their usual way of buying, the one that fits most of them."]
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
        id: "authorise", name: "Decision", box: "purchasing", label: "Who decides to buy?", many: true,
        options: [
            { id: "solo", label: "One person decides: The person who uses it has the budget and the final say." },
            { id: "champions", label: "The team agrees: The people who use it try it and push it upward." },
            { id: "executive", label: "A manager signs off: Needs formal approval from a manager or executive." },
            { id: "multi", label: "Several departments check: IT or security, legal and finance." },
            { id: "procurement", label: "Formal procurement: A tender or a request for proposals (RFP), with strict compliance." }
        ],
        info: ["Asked for business customers only. A formal procurement loop reveals the tender row on the Customer Engagement page.", "Select all that apply."]
    },

    /* ---- Box 5, Market Size & Industry Outlook ---- */

    {
        id: "trajectory", box: "market-size", label: "Is your market growing or shrinking?", many: false,
        rating: { low: "Shrinking", mid: "Flat", high: "Growing fast" },
        options: ratingOptions({ low: "Shrinking", mid: "Flat", high: "Growing fast" }),
        info: [
            "Where the market is heading, apart from its size: a market can be large and declining, or small and expanding fast.",
            "1 Shrinking: a shrinking market, or one undergoing severe structural changes.",
            "3 Flat: a saturated market, consistent volume but low growth.",
            "4: a mature market with a predictable upward trend.",
            "5 Growing fast: an emerging market, high year-on-year growth."
        ]
    },
    {
        id: "tam", box: "market-size", label: "How many potential customers are there?", many: false,
        options: [
            { id: "micro", label: "Very small niche, under 1,000" },
            { id: "boutique", label: "Specialist, 1,000–49,999" },
            { id: "mid", label: "Mid-market, 50,000–499,999" },
            { id: "mass", label: "Mass market, 500,000 or more" }
        ],
        info: ["The total number of potential buyers if you had 100% of the market, in the area you serve: the total addressable market (TAM)."]
    },
    {
        id: "trends", box: "market-size", label: "What is changing most for your customers?", many: true, max: 2,
        options: [
            { id: "technology", label: "Technology: Automation, AI, old systems being replaced" },
            { id: "regulation", label: "Rules and law: New compliance, tax changes, environmental mandates" },
            { id: "economy", label: "The economy: Inflation, budget cuts, shifts in spending power" },
            { id: "society", label: "Society and lifestyle: Remote work, sustainability, changing habits" },
            { id: "supply", label: "Supply and delivery: Material shortages, logistics costs, local sourcing" }
        ],
        info: ["Choose up to two."]
    },
    {
        id: "competition", box: "market-size", label: "How crowded is your market?", many: false,
        rating: { low: "Open", mid: "Fragmented", high: "Crowded" },
        options: ratingOptions({ low: "Open", mid: "Fragmented", high: "Crowded" }),
        info: [
            "Red Ocean and Blue Ocean are the strategy terms of Kim and Mauborgne: a crowded market against an uncontested one.",
            "1 Open: Blue Ocean. Very few direct competitors; the niche is new.",
            "3 Fragmented: many small and medium players; none controls the market.",
            "5 Crowded: Red Ocean. Dominated by big established players; price wars are common."
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
        case "u-age":
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
            const scales = context.scales;
            const sizes = scales.flatMap(id => SIZES_OF_SCALE[id] ?? []);
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
            return USER_AGES.filter(option => keep(option, context.userStages.length === 0 || context.userStages.includes(option.stage)))
                .map(({ id, label }) => ({ id, label }));
        default:
            return question.options;
    }

}

/** Whether a radio's options are short enough to stand in a row (they wrap onto the next line where the column is narrow): the card draws the others one under the other. */
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
    return QUESTIONS.filter(question => question.box === box && segmentQuestionAsked(question, answers, context)
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

    if (chosen.length > 0) {
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

            if (!chosen || chosen.length === 0) {
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

        if (known.length > 0) {
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

    return QUESTIONS.flatMap(question => {

        const chosen = answers[question.id] ?? [];
        const words = question.rating
            ? chosen.slice(0, 1).map(point => ratingWords(point, question.rating!))
            : question.options.filter(option => chosen.includes(option.id)).map(option => option.label);

        return words.length > 0
            ? [{ label: question.label.replace(/ \(Select all that apply\)$/, ""), value: words.join("; ") }]
            : [];

    });

}
