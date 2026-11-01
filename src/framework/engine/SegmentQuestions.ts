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
}

/** One saved answer: question id to the ids chosen. */
export type SegmentAnswers = Record<string, string[]>;

/** The work situation is asked in two steps: working or not, then what the non-working situation is. */
const WORKING = [
    { id: "working", label: "Working / Employed" },
    { id: "notworking", label: "Not currently working" }
] as const;

const NOT_WORKING = [
    { id: "student", label: "Student" },
    { id: "homemaker", label: "Homemaker / Full-time caregiver" },
    { id: "seeking", label: "Unemployed / Seeking work" },
    { id: "retired", label: "Retired" },
    { id: "unable", label: "Unable to work / long-term illness / disability" }
] as const;

const WORKING_INFO = ["Working includes full-time, part-time, contract and self-employed roles.", "Not currently working opens a second question about their main daily role."];
const NOT_WORKING_INFO = ["Choose their dominant daily role.", "Unable to work: sidelined from the workforce by a chronic medical condition, long-term illness or disability. They typically live on fixed support incomes."];

const COMFORT = [
    { id: "averse", label: "Tech-averse / Traditional" },
    { id: "moderate", label: "Moderately comfortable" },
    { id: "savvy", label: "Tech-savvy / Digital native" }
] as const;

const ORG_TYPES = [
    { id: "private", label: "Private business (For-profit)" },
    { id: "public", label: "Public body / Government agency" },
    { id: "nonprofit", label: "Non-profit, charity, or NGO" },
    { id: "self", label: "Self-employed, freelancer, or sole trader" }
] as const;

const ORG_SIZES = [
    { id: "micro", label: "Micro business (1 to 9 employees)" },
    { id: "small", label: "Small business (10 to 49 employees)" },
    { id: "medium", label: "Medium-sized business (50 to 249 employees)" },
    { id: "large", label: "Large enterprise (250+ employees)" }
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
    { id: "education", sector: "human", label: "Education and training" },
    { id: "health", sector: "human", label: "Health and social care" },
    { id: "other", sector: "human", label: "Other services" }
];

/** The buyer's age terms (document 31, 10.1: the term leads, the age defines it), and the Positioning life stage each belongs to. */
const BUYER_AGES = [
    { id: "minor", stage: "young", label: "Minors, semi-dependent ~13–18" },
    { id: "young", stage: "young", label: "Young adults ~18–25" },
    { id: "established", stage: "adult", label: "Established ~25–40" },
    { id: "peak", stage: "adult", label: "Peak ~40–55" },
    { id: "mature", stage: "adult", label: "Mature ~55–65" },
    { id: "active", stage: "senior", label: "Active Retirees ~65–75" },
    { id: "dependent", stage: "senior", label: "Dependent seniors ~75+" }
] as const;

/** The user's age terms, and the Positioning user stage each belongs to. */
const USER_AGES = [
    { id: "baby", stage: "age:minor", label: "Baby ~0–3" },
    { id: "child", stage: "age:minor", label: "Child ~3–11" },
    { id: "teen", stage: "age:minor", label: "Teenager ~11–18" },
    { id: "young", stage: "age:young", label: "Young adult ~18–25" },
    { id: "established", stage: "age:adult", label: "Established ~25–40" },
    { id: "peak", stage: "age:adult", label: "Peak ~40–55" },
    { id: "mature", stage: "age:adult", label: "Mature ~55–65" },
    { id: "active", stage: "age:senior", label: "Active Retirees ~65–75" },
    { id: "dependent", stage: "age:senior", label: "Dependent seniors ~75+" }
] as const;

/** The job levels (the ISCO-08 major groups in plain words): the Segment's user question and the Profile's "What kind of work do they do?" take this one list, so the words are written once. */
export const JOB_LEVELS = [
    { id: "owner", label: "Owner or senior executive" },
    { id: "manager", label: "Manager" },
    { id: "professional", label: "Professional or specialist" },
    { id: "technician", label: "Technician or skilled trade" },
    { id: "service", label: "Administrative, sales or service" },
    { id: "operator", label: "Operator or labourer" }
] as const;

const AGE_NOTE = "The ages are approximate (~): each runs from the first number up to, but not including, the second.";

const RAW_QUESTIONS: readonly SegmentQuestion[] = [

    /* ---- Box 1, Demographics ---- */

    {
        id: "age", box: "demographics", label: "What age group are the people who pay?", many: false,
        options: BUYER_AGES.map(({ id, label }) => ({ id, label })),
        info: [
            "Minors, semi-dependent: Mid and Late Adolescence. They have limited buying power and mostly use cash, wallets and gift cards; credit and long contracts are not open to them. Look up the country's online-consent age and its minimum working age.",
            "Choose the group that pays, not the one that uses it.",
            AGE_NOTE
        ]
    },
    {
        id: "education", box: "demographics", label: "What is the highest level of education they have reached?", many: false,
        options: [
            { id: "school", label: "Less than high school" },
            { id: "highschool", label: "High school" },
            { id: "vocational", label: "Vocational or technical diploma" },
            { id: "bachelor", label: "Bachelor" },
            { id: "master", label: "Postgraduate (Master)" },
            { id: "doctorate", label: "Doctorate" }
        ],
        info: [
            "Each level includes the ones below it: someone with a Master has a Bachelor.",
            "Examples: High school is A-levels or the Leaving Certificate (UK, Ireland), a high school diploma (USA, Canada) and Year 12 (Australia, New Zealand). A vocational or technical diploma is a post-school qualification such as a BTEC, a trade certificate or an associate degree."
        ]
    },
    {
        id: "work", box: "demographics", label: "What is their primary work status?", many: false,
        options: WORKING,
        info: WORKING_INFO
    },
    {
        id: "work2", box: "demographics", label: "Which best describes their non-working situation?", many: false,
        options: NOT_WORKING,
        info: NOT_WORKING_INFO
    },
    {
        id: "workenv", box: "demographics", label: "What is their primary working environment?", many: false,
        options: [
            { id: "remote", label: "Desk-based / Remote (Work from home)" },
            { id: "office", label: "Desk-based / Corporate office" },
            { id: "onsite", label: "On-site / Frontline (Retail, hospitality, healthcare, construction)" },
            { id: "field", label: "Field-based / On-the-road (Logistics, sales, field engineering)" }
        ],
        info: ["Where they spend most of their working hours. Remote workers are online through the day; frontline and field workers are highly mobile but have little screen time during shifts."]
    },
    {
        id: "workschedule", box: "demographics", label: "How is their working schedule structured?", many: false,
        options: [
            { id: "standard", label: "Standard daytime hours (Traditional 9-to-5, fixed weekdays)" },
            { id: "shift", label: "Shift work / Variable hours (Nights, weekends, rotating rosters)" },
            { id: "flexible", label: "Flexible / Self-directed hours (Freelancers, business owners, autonomous professionals)" }
        ],
        info: ["When they are free to shop and to be reached. Standard daytime workers shop at lunch and in the evening; shift workers have a very different daily routine."]
    },
    {
        id: "workincome", box: "demographics", label: "What is the stability or structure of their income?", many: false,
        options: [
            { id: "salary", label: "Fixed salary (Predictable monthly/bi-weekly paycheck)" },
            { id: "hourly", label: "Hourly wage (Fluctuating based on scheduled shifts)" },
            { id: "variable", label: "Variable / Performance-based (Freelance invoices, commission, seasonal contracts)" }
        ],
        info: ["How steady their pay is, not how much it is (that is the household income below). A fixed salary suits regular subscriptions; variable or hourly earners are sensitive to sudden cash-flow dips."]
    },
    {
        id: "income", box: "demographics", label: "What is their household income?", many: false,
        options: [
            { id: "low", label: "Low" },
            { id: "lower-middle", label: "Lower-middle" },
            { id: "middle", label: "Middle" },
            { id: "upper-middle", label: "Upper-middle" },
            { id: "high", label: "High" }
        ],
        info: ["Compare with the typical household income in their country: Middle is around the median, Low and High are the two ends, and Lower-middle and Upper-middle lie between.", "Household income is what the home earns together, not one person's pay."]
    },
    {
        id: "gender", box: "demographics", label: "What is the usual gender mix of your customers?", many: false,
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
            { id: "city", label: "In my city or town" },
            { id: "region", label: "In my state or region" },
            { id: "country", label: "Across my country" },
            { id: "countries", label: "In several countries" },
            { id: "online", label: "Anywhere online" }
        ],
        info: ["The widest area most of your customers are spread over, now or as you plan it. If it is more than one, make another Segment."]
    },
    {
        id: "area", box: "geographics", label: "What environment best describes where they physically spend most of their time?", many: false,
        options: [
            { id: "urban", label: "Urban (High-density city center)" },
            { id: "suburban", label: "Suburban (Residential towns surrounding a city)" },
            { id: "rural", label: "Rural / Remote (Low-density countryside or isolated areas)" }
        ],
        info: ["The kind of place they live or work in. Asked once the business is managing or growing, and only for customers in one place or one country."]
    },

    /* ---- Box 3, Business Data ---- */

    {
        id: "orgtype", box: "business-data", label: "What type of organisation are they?", many: false,
        options: ORG_TYPES,
        info: [
            "Private business includes co-operatives. A social enterprise belongs here or under non-profit, by how it is owned.",
            "Non-profit includes membership and professional bodies and religious organisations.",
            "A public body is for example a government department, council, school or hospital.",
            "Self-employed skips the question about size."
        ]
    },
    {
        id: "size", box: "business-data", label: "What is the size of the target organization?", many: false,
        options: ORG_SIZES,
        info: ["The EU's definition of small and medium-sized enterprises: micro under 10 employees, small under 50, medium-sized under 250. Countries define them a little differently (the United States and Canada by other limits)."]
    },
    {
        id: "sector", box: "business-data", label: "Which sector are they in?", many: false,
        options: SEGMENT_SECTORS,
        info: ["Six classes over the industries below. If they work in more than one industry, make another Segment."]
    },
    {
        id: "industry", box: "business-data", label: "Which industry are they in?", many: false,
        options: SEGMENT_INDUSTRIES,
        info: [
            "The industries of the sector chosen, as the official schemes (SIC and NACE, NAICS, ANZSIC) name their sections.",
            "Government and public administration includes embassies and international bodies. Other services includes households that employ staff, such as cleaners and nannies."
        ]
    },

    /* ---- Box 4, Purchasing Power & Behaviour ---- */

    {
        id: "comfort", box: "purchasing", label: "How comfortable are they with online tools?", many: false,
        options: COMFORT,
        info: ["How easily they use websites, apps and online payment, not whether they own a device."]
    },
    {
        id: "discover", box: "purchasing", label: "Where do they discover and validate new ideas?", many: true, max: 3,
        options: [
            { id: "peers", label: "Direct recommendations from close peers (friends, family, colleagues)" },
            { id: "communities", label: "Niche online communities or forums" },
            { id: "creators", label: "Social media creators, influencers, or industry experts" },
            { id: "media", label: "Traditional media, reviews, and independent comparison sites" },
            { id: "algorithmic", label: "Algorithmic discovery (Feeds, targeted ads, marketplace recommendations)" }
        ],
        info: [
            "Examples: communities such as Reddit, Discord and Facebook Groups; creators on TikTok, Instagram, YouTube and LinkedIn. What you tick here is offered on the Profile as related platforms to choose from.",
            "Choose up to three."
        ]
    },
    {
        id: "social", box: "purchasing", label: "What does their primary social environment look like?", many: false,
        options: [
            { id: "digital", label: "Mostly digital/virtual (online gaming, community servers, chat apps)" },
            { id: "mixed", label: "Mix of online messaging and weekend in-person meetups" },
            { id: "inperson", label: "High-frequency in-person socializing (events, hospitality, clubs, sports)" },
            { id: "independent", label: "Low-frequency socializer/highly independent" }
        ],
        info: ["Where they spend their free time. It decides how they meet brands and products."]
    },
    {
        id: "share", box: "purchasing", label: "How do they share their favorite finds or experiences?", many: true,
        options: [
            { id: "public", label: "Posting publicly on personal social media feeds" },
            { id: "private", label: "Sending direct links to close friends via private chat apps" },
            { id: "verbal", label: "Verbally during face-to-face conversations" },
            { id: "none", label: "They don't typically share or discuss purchases" }
        ],
        info: ["Private chat apps are for example WhatsApp and iMessage. \"They don't typically share\" excludes the other three."]
    },
    {
        id: "trigger", box: "purchasing", label: "What triggers a typical shopping session?", many: true, max: 2,
        options: [
            { id: "boredom", label: "Boredom/Entertainment (Browsing feeds, window shopping)" },
            { id: "proof", label: "Social proof (Seeing a friend or creator use a product)" },
            { id: "need", label: "Immediate necessity or resolving a specific problem" },
            { id: "seasonal", label: "Seasonal trends, sales events, or planned gift-giving" }
        ],
        info: ["Choose up to two."]
    },
    {
        id: "path", box: "purchasing", label: "What is their typical path to purchase?", many: false,
        options: [
            { id: "impulse", label: "Impulse buyer: See it, like it, buy it immediately" },
            { id: "researcher", label: "The Researcher: Extensive comparison window before finalizing" },
            { id: "validator", label: "Social validator: Needs to ask a friend or check reviews before paying" }
        ],
        info: ["Their usual way of buying, the one that fits most of them."]
    },
    {
        id: "setting", box: "purchasing", label: "What platform or setting do they usually buy on?", many: false,
        options: [
            { id: "mobile", label: "Mobile app / Smartphone website" },
            { id: "desktop", label: "Desktop / Laptop computer" },
            { id: "store", label: "In-person / Physical storefront" },
            { id: "multi", label: "Multi-channel (Mix of online and offline retail)" }
        ],
        info: ["Where most of their purchases start and finish. Choose Multi-channel when they mix online and in-person about equally."]
    },
    {
        id: "pay", box: "purchasing", label: "How do they prefer to pay?", many: true,
        options: [
            { id: "card", label: "Traditional credit / debit card" },
            { id: "wallet", label: "Digital wallets" },
            { id: "bnpl", label: "Buy Now, Pay Later or financing" },
            { id: "invoice", label: "Invoicing, bank transfers, or corporate purchase orders" }
        ],
        info: [
            "Digital wallets are for example Apple Pay, Google Pay and PayPal. Buy Now, Pay Later is for example Klarna and Afterpay.",
            "Invoicing is asked for business customers only. Credit and Buy Now, Pay Later are not open to minors.",
            "Select all that apply."
        ]
    },
    {
        id: "authorise", box: "purchasing", label: "How is the purchase decision authorized?", many: true,
        options: [
            { id: "solo", label: "Sole practitioner decision: The end-user has full purchasing autonomy and budget." },
            { id: "champions", label: "End-user champions / Department consensus: Teams test the solution and push it upward." },
            { id: "executive", label: "Executive / Budget-holder sign-off: Requires formal approval from a manager or C-level executive." },
            { id: "multi", label: "Multi-department evaluation: Involves separate checks from IT/Security, Legal, and Finance." },
            { id: "procurement", label: "Formal procurement loop: Strict compliance pathway via requests for proposals (RFPs) or tenders." }
        ],
        info: ["Asked for business customers only. A formal procurement loop reveals the tender row on the Customer Engagement page.", "Select all that apply."]
    },

    /* ---- Box 5, Market Size & Industry Outlook ---- */

    {
        id: "trajectory", box: "market-size", label: "How would you describe the current trajectory of the target industry/niche?", many: false,
        options: [
            { id: "expanding", label: "Rapidly expanding (Emerging market, high year-on-year growth)" },
            { id: "growing", label: "Steady growth (Mature market, predictable upward trend)" },
            { id: "flat", label: "Flat / Stable (Saturated market, consistent volume but low growth)" },
            { id: "declining", label: "Declining / Disrupting (Shrinking market or undergoing severe structural changes)" }
        ],
        info: ["Where the market is heading, apart from its size: a market can be large and declining, or small and expanding fast."]
    },
    {
        id: "tam", box: "market-size", label: "What is the approximate size of your Total Addressable Market (TAM)?", many: false,
        options: [
            { id: "micro", label: "Micro / Hyper-niche (Fewer than 1,000 potential customers globally/locally)" },
            { id: "boutique", label: "Boutique / Specialized (1,000 to 50,000 potential customers)" },
            { id: "mid", label: "Mid-Market (50,000 to 500,000 potential customers)" },
            { id: "mass", label: "Mass Market (500,000+ potential customers)" }
        ],
        info: ["The total number of potential buyers if you had 100% of the market, in the area you serve."]
    },
    {
        id: "trends", box: "market-size", label: "What is the biggest macro trend impacting your buyers right now?", many: true, max: 2,
        options: [
            { id: "technology", label: "Technological changes: Automation, AI integration, legacy systems updating" },
            { id: "regulation", label: "Regulatory/Legal shifts: New compliance, tax changes, environmental mandates" },
            { id: "economy", label: "Economic pressures: Inflation, budget cuts, shifts in consumer spending power" },
            { id: "society", label: "Socio-cultural changes: Remote work preferences, sustainability demands, lifestyle shifts" },
            { id: "supply", label: "Supply chain & infrastructure: Material shortages, logistics costs, local sourcing needs" }
        ],
        info: ["Choose up to two."]
    },
    {
        id: "competition", box: "market-size", label: "How competitive is this market environment?", many: false,
        options: [
            { id: "red", label: "Red Ocean (Highly saturated): Dominated by massive legacy players; price wars are common." },
            { id: "fragmented", label: "Fragmented: Many small-to-medium players; no single company controls the market." },
            { id: "blue", label: "Blue Ocean (Underserved): Very few direct competitors; the solution or niche is highly novel." }
        ],
        info: ["Red Ocean and Blue Ocean are the strategy terms of Kim and Mauborgne: a crowded market against an uncontested one."]
    },

    /* ---- The user (a Proxy or Dual-Intent buyer) ---- */

    {
        id: "u-age", box: "user", label: "What life stage is the user in?", many: false,
        options: USER_AGES.map(({ id, label }) => ({ id, label })),
        info: [
            "Teenager covers Early Adolescence (11 to 13), Mid (13 to 16) and Late (16 to 18).",
            AGE_NOTE
        ]
    },
    {
        id: "u-school", box: "user", label: "What school stage are they at?", many: false,
        options: [
            { id: "early", label: "Early years" },
            { id: "primary", label: "Primary school" },
            { id: "secondary", label: "Secondary school" }
        ],
        info: ["Asked of a parent or guardian, and of a caregiver, who buy for a child. Secondary school is not offered for a Baby or a Child."]
    },
    {
        id: "u-work", box: "user", label: "What is their primary work status?", many: false,
        options: WORKING,
        info: ["The same question as for the buyer, asked of the user: an adult the buyer is related to, or sponsors.", ...WORKING_INFO]
    },
    {
        id: "u-work2", box: "user", label: "Which best describes their non-working situation?", many: false,
        options: NOT_WORKING,
        info: NOT_WORKING_INFO
    },
    {
        id: "u-job", box: "user", label: "What job level do they have?", many: false,
        options: JOB_LEVELS,
        info: ["The ISCO-08 major groups, in plain words."]
    },
    {
        id: "u-orgtype", box: "user", label: "What type of organisation are the clients?", many: false,
        options: ORG_TYPES,
        info: ["Asked of a business serving clients and of a professional intermediary."]
    },
    {
        id: "u-size", box: "user", label: "What is the size of the clients' organization?", many: false,
        options: ORG_SIZES,
        info: ["Skipped for self-employed clients."]
    },
    {
        id: "u-comfort", box: "user", label: "How comfortable are they with online tools?", many: false,
        options: COMFORT,
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
            return people && has(answers, "work", "notworking");
        case "workenv": case "workschedule": case "workincome":
            return people && has(answers, "work", "working");
        case "education": case "income":
            return people && !has(answers, "age", "minor");
        case "area":
            return !segmentEarly(context.stage) && ["city", "region", "country"].some(id => has(answers, "reach", id));
        case "orgtype": case "sector":
            return business;
        case "size":
            return business && !has(answers, "orgtype", "self");
        case "industry":
            return business && (answers.sector ?? []).length > 0;
        case "social": case "share": case "trigger": case "path":
            return people;
        case "authorise":
            return business;
        case "u-age": case "u-comfort":
            return context.endsUser;
        case "u-school":
            return context.endsUser && context.relations.some(id => PERSONAL.includes(id));
        case "u-work":
            return context.endsUser && context.relations.some(id => ADULT_PERSONAL.includes(id));
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
        case "work2":
            return question.options.filter(option => keep(option, !(option.id === "retired" && has(answers, "age", "minor"))));
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
            // A baby or a child (up to 11) is not at secondary school.
            return question.options.filter(option => keep(option, !(option.id === "secondary" && (has(answers, "u-age", "baby") || has(answers, "u-age", "child")))));
        case "u-age":
            return USER_AGES.filter(option => keep(option, context.userStages.length === 0 || context.userStages.includes(option.stage)))
                .map(({ id, label }) => ({ id, label }));
        default:
            return question.options;
    }

}

/** The questions of one box a Segment is asked and shows, in order: a question with only one option left is not shown (there is nothing to choose); its answer is that option (see segmentSettle). */
export function segmentQuestionsOf(box: SegmentBox, answers: SegmentAnswers, context: SegmentContext): SegmentQuestion[] {
    return QUESTIONS.filter(question => question.box === box && segmentQuestionAsked(question, answers, context)
        && segmentOptions(question, answers, context, false).length !== 1);
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

            const kept = chosen.filter(id => offered.includes(id));

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
        const words = question.options.filter(option => chosen.includes(option.id)).map(option => option.label);

        return words.length > 0
            ? [{ label: question.label.replace(/ \(Select all that apply\)$/, ""), value: words.join("; ") }]
            : [];

    });

}
