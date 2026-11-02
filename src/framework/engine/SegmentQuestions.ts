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
    { id: "working", label: "Working" },
    { id: "notworking", label: "Not currently working" }
] as const;

const NOT_WORKING = [
    { id: "student", label: "Student" },
    { id: "homemaker", label: "Homemaker / carer" },
    { id: "seeking", label: "Looking for work" },
    { id: "retired", label: "Retired" },
    { id: "unable", label: "Unable to work (illness / disability)" }
] as const;

const WORKING_INFO = ["Working includes full-time, part-time, contract and self-employed roles.", "Not currently working opens a second question about their main daily role."];
const NOT_WORKING_INFO = ["Choose their dominant daily role.", "Unable to work: sidelined from the workforce by a chronic medical condition, long-term illness or disability. They typically live on fixed support incomes."];

const COMFORT = [
    { id: "averse", label: "Not comfortable / Traditional" },
    { id: "moderate", label: "Comfortable" },
    { id: "savvy", label: "Very comfortable / Digital native" }
] as const;

const ORG_TYPES = [
    { id: "private", label: "Private business (For-profit)" },
    { id: "public", label: "Public body / Government agency" },
    { id: "nonprofit", label: "Non-profit / charity / NGO" },
    { id: "self", label: "Self-employed / freelancer / sole trader" }
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

/** The job levels (the ISCO-08 major groups in plain words): the Segment's user question and the Profile's "What kind of work do they do?" take this one list, so the words are written once. */
export const JOB_LEVELS = [
    { id: "owner", label: "Owner / senior executive" },
    { id: "manager", label: "Manager" },
    { id: "professional", label: "Professional / specialist" },
    { id: "technician", label: "Technician / skilled trade" },
    { id: "service", label: "Administrative / sales / service" },
    { id: "operator", label: "Operator / labourer" }
] as const;

const AGE_NOTE = "The ages are approximate (~): each runs from the first number up to, but not including, the second.";

const RAW_QUESTIONS: readonly SegmentQuestion[] = [

    /* ---- Box 1, Demographics ---- */

    {
        id: "age", box: "demographics", label: "What age group are the people who pay?", many: false,
        options: BUYER_AGES.map(({ id, label }) => ({ id, label })),
        info: [
            "Minors, semi-dependent: Mid and Late Adolescence, with limited buying power; mostly cash, wallets and gift cards.",
            "Credit and long contracts are not open to them. Look up the country's online-consent age and its minimum working age.",
            "Choose the group that pays, not the one that uses it.",
            AGE_NOTE
        ]
    },
    {
        id: "education", box: "demographics", label: "What is the highest level of education most of them have reached?", many: false,
        options: [
            { id: "school", label: "Did not finish high school" },
            { id: "highschool", label: "High school" },
            { id: "vocational", label: "Vocational / technical diploma" },
            { id: "bachelor", label: "Bachelor's degree" },
            { id: "master", label: "Master's degree" },
            { id: "doctorate", label: "Doctorate" }
        ],
        info: [
            "Each level includes the ones below it: someone with a Master has a Bachelor.",
            "High school: A-levels or the Leaving Certificate (UK, Ireland), a diploma (USA, Canada), Year 12 (Australia, New Zealand).",
            "Vocational or technical diploma: a post-school qualification such as a BTEC, a trade certificate or an associate degree."
        ]
    },
    {
        id: "work", name: "Work status", box: "demographics", label: "Are they working?", many: false,
        options: WORKING,
        info: [...WORKING_INFO, "Choosing an age group starts this with the one that goes with it; change it freely."]
    },
    {
        id: "work2", name: "Non-working situation", box: "demographics", label: "What best describes their situation?", many: false,
        options: NOT_WORKING,
        info: NOT_WORKING_INFO
    },
    {
        id: "workenv", box: "demographics", label: "Where do they mainly work?", many: false,
        options: [
            { id: "remote", label: "At home (Desk-based, remote)" },
            { id: "office", label: "In an office" },
            { id: "onsite", label: "On site (Retail, hospitality, healthcare, construction)" },
            { id: "field", label: "On the road (Logistics, sales, field engineering)" }
        ],
        info: ["Where they spend most of their working hours.", "Remote workers are online through the day; frontline and field workers are mobile, with little screen time on shift."]
    },
    {
        id: "workschedule", box: "demographics", label: "When do they work?", many: false,
        options: [
            { id: "standard", label: "Standard daytime hours (Traditional 9-to-5, fixed weekdays)" },
            { id: "shift", label: "Shifts / varying hours (Nights, weekends, rotating rosters)" },
            { id: "flexible", label: "Flexible / their own hours (Freelancers, business owners, autonomous professionals)" }
        ],
        info: ["When they are free to shop and to be reached. Standard daytime workers shop at lunch and in the evening; shift workers have a very different daily routine."]
    },
    {
        id: "workincome", box: "demographics", label: "How is their income paid?", many: false,
        options: [
            { id: "salary", label: "Fixed salary (Predictable monthly/bi-weekly paycheck)" },
            { id: "hourly", label: "Hourly wage (Fluctuating based on scheduled shifts)" },
            { id: "variable", label: "Variable (Freelance invoices, commission, seasonal contracts)" }
        ],
        info: ["How steady their pay is, not how much it is (that is the household income below).", "A fixed salary suits regular subscriptions; variable or hourly earners feel sudden cash-flow dips."]
    },
    {
        id: "income", box: "demographics", label: "How would you describe their household income?", many: false,
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
            { id: "city", label: "In my city / town" },
            { id: "region", label: "In my state / region" },
            { id: "country", label: "Across my country" },
            { id: "countries", label: "In several countries" },
            { id: "online", label: "Anywhere online" }
        ],
        info: ["The widest area most of your customers are spread over, now or as you plan it. If it is more than one, make another Segment."]
    },
    {
        id: "area", box: "geographics", label: "Where do they live or work?", many: false,
        options: [
            { id: "urban", label: "Urban (High-density city center)" },
            { id: "suburban", label: "Suburban (Residential towns surrounding a city)" },
            { id: "rural", label: "Rural / Remote (Low-density countryside or isolated areas)" }
        ],
        info: ["The kind of place they live or work in. Asked once the business is managing or growing, and only for customers in one place or one country."]
    },

    /* ---- Box 3, Business Data ---- */

    {
        id: "orgtype", name: "Type of organisation", box: "business-data", label: "What type of organisation are they?", many: false,
        options: ORG_TYPES,
        info: [
            "Private business includes co-operatives. A social enterprise belongs here or under non-profit, by how it is owned.",
            "Non-profit includes membership and professional bodies and religious organisations.",
            "A public body is for example a government department, council, school or hospital.",
            "Self-employed skips the question about size."
        ]
    },
    {
        id: "size", name: "Size", box: "business-data", label: "How big are these organisations?", many: false,
        options: ORG_SIZES,
        info: ["The EU's definition of small and medium-sized enterprises: micro under 10 employees, small under 50, medium-sized under 250.", "Countries define them a little differently; the United States and Canada use other limits.", "The sizes follow the scale chosen in Positioning."]
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
        id: "discover", box: "purchasing", label: "Where do they find and check new products?", many: true, max: 3,
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
        id: "social", box: "purchasing", label: "How do they spend their social time?", many: false,
        options: [
            { id: "digital", label: "Mostly online (Gaming, community servers, chat apps)" },
            { id: "mixed", label: "Online and in person" },
            { id: "inperson", label: "Mostly in person (Events, hospitality, clubs, sports)" },
            { id: "independent", label: "Not very social / independent" }
        ],
        info: ["Where they spend their free time. It decides how they meet brands and products."]
    },
    {
        id: "share", box: "purchasing", label: "How do they share what they like?", many: true,
        options: [
            { id: "public", label: "They post it publicly on social media" },
            { id: "private", label: "They send it to friends in private chats" },
            { id: "verbal", label: "They tell people in person" },
            { id: "none", label: "They rarely share what they buy" }
        ],
        info: ["Private chat apps are for example WhatsApp and iMessage. \"They rarely share what they buy\" excludes the other three."]
    },
    {
        id: "trigger", box: "purchasing", label: "What usually starts them shopping?", many: true, max: 2,
        options: [
            { id: "boredom", label: "Boredom / Entertainment (Browsing feeds, window shopping)" },
            { id: "proof", label: "Seeing a friend or creator use it" },
            { id: "need", label: "Immediate necessity / specific problem" },
            { id: "seasonal", label: "Seasonal trends / sales / planned gifts" }
        ],
        info: ["Choose up to two."]
    },
    {
        id: "path", box: "purchasing", label: "How do they usually decide to buy?", many: false,
        options: [
            { id: "impulse", label: "Impulse buyer: Sees it, likes it, buys it at once" },
            { id: "researcher", label: "Researcher: Compares at length before buying" },
            { id: "validator", label: "Validator: Asks a friend or checks reviews before paying" }
        ],
        info: ["Their usual way of buying, the one that fits most of them."]
    },
    {
        id: "setting", box: "purchasing", label: "Where do they usually buy?", many: false,
        options: [
            { id: "mobile", label: "On a phone" },
            { id: "desktop", label: "On a computer" },
            { id: "store", label: "In a shop" },
            { id: "multi", label: "Online and in shops" }
        ],
        info: ["Where most of their purchases start and finish. Choose Online and in shops when they mix the two about equally."]
    },
    {
        id: "pay", box: "purchasing", label: "How do they prefer to pay?", many: true,
        options: [
            { id: "card", label: "Credit / debit card" },
            { id: "wallet", label: "Digital wallets" },
            { id: "bnpl", label: "Buy Now, Pay Later / financing" },
            { id: "invoice", label: "Invoice / bank transfer / purchase order" }
        ],
        info: [
            "Digital wallets are for example Apple Pay, Google Pay and PayPal. Buy Now, Pay Later is for example Klarna and Afterpay.",
            "Invoicing is asked for business customers only. Credit and Buy Now, Pay Later are not open to minors.",
            "Choosing a phone as where they buy starts Digital wallets here; change it freely.",
            "Select all that apply."
        ]
    },
    {
        id: "authorise", name: "Decision", box: "purchasing", label: "How is the decision to buy made?", many: true,
        options: [
            { id: "solo", label: "One person decides: The user has the budget and the final say." },
            { id: "champions", label: "The team agrees: Users try it and push it upward." },
            { id: "executive", label: "A manager signs off: Needs formal approval from a manager or executive." },
            { id: "multi", label: "Several departments check: IT or security, legal and finance." },
            { id: "procurement", label: "Formal procurement: A tender or a request for proposals (RFP), with strict compliance." }
        ],
        info: ["Asked for business customers only. A formal procurement loop reveals the tender row on the Customer Engagement page.", "Select all that apply."]
    },

    /* ---- Box 5, Market Size & Industry Outlook ---- */

    {
        id: "trajectory", box: "market-size", label: "Where is their industry or niche heading?", many: false,
        options: [
            { id: "expanding", label: "Growing fast (Emerging market, high year-on-year growth)" },
            { id: "growing", label: "Growing steadily (Mature market, predictable upward trend)" },
            { id: "flat", label: "Flat / stable (Saturated market, consistent volume but low growth)" },
            { id: "declining", label: "Shrinking / disrupted (Shrinking market or undergoing severe structural changes)" }
        ],
        info: ["Where the market is heading, apart from its size: a market can be large and declining, or small and expanding fast."]
    },
    {
        id: "tam", box: "market-size", label: "How many potential customers are there in all (your Total Addressable Market, TAM)?", many: false,
        options: [
            { id: "micro", label: "Very small niche (Fewer than 1,000 potential customers)" },
            { id: "boutique", label: "Specialist (1,000 to 50,000 potential customers)" },
            { id: "mid", label: "Mid-market (50,000 to 500,000 potential customers)" },
            { id: "mass", label: "Mass market (500,000+ potential customers)" }
        ],
        info: ["The total number of potential buyers if you had 100% of the market, in the area you serve."]
    },
    {
        id: "trends", box: "market-size", label: "Which trends affect your buyers most right now?", many: true, max: 2,
        options: [
            { id: "technology", label: "Technology: Automation, AI, old systems being replaced" },
            { id: "regulation", label: "Rules and law: New compliance, tax changes, environmental mandates" },
            { id: "economy", label: "Money: Inflation, budget cuts, shifts in spending power" },
            { id: "society", label: "Society and lifestyle: Remote work, sustainability, changing habits" },
            { id: "supply", label: "Supply and delivery: Material shortages, logistics costs, local sourcing" }
        ],
        info: ["Choose up to two."]
    },
    {
        id: "competition", box: "market-size", label: "How crowded is their market?", many: false,
        options: [
            { id: "red", label: "Crowded (Red Ocean): Dominated by big established players; price wars are common." },
            { id: "fragmented", label: "Fragmented: Many small and medium players; none controls the market." },
            { id: "blue", label: "Open (Blue Ocean): Very few direct competitors; the niche is new." }
        ],
        info: ["Red Ocean and Blue Ocean are the strategy terms of Kim and Mauborgne: a crowded market against an uncontested one."]
    },

    /* ---- The user (a Proxy or Dual-Intent buyer) ---- */

    {
        id: "u-age", name: "User's life stage", box: "user", label: "What life stage is the user in?", many: false,
        options: USER_AGES.map(({ id, label }) => ({ id, label })),
        info: [
            "Teenager covers Early Adolescence (11 to 13), Mid (13 to 16) and Late (16 to 18).",
            AGE_NOTE
        ]
    },
    {
        id: "u-school", name: "School stage", box: "user", label: "What school stage are they at?", many: false,
        options: [
            { id: "early", label: "Early years" },
            { id: "primary", label: "Primary school" },
            { id: "secondary", label: "Secondary school" }
        ],
        info: ["Asked of a parent or guardian, and of a caregiver, who buy for a child. Secondary school is not offered for a Baby or a Child."]
    },
    {
        id: "u-work", box: "user", label: "Are they working?", many: false,
        options: WORKING,
        info: ["The same question as for the buyer, asked of the user: an adult the buyer is related to, or sponsors.", ...WORKING_INFO]
    },
    {
        id: "u-work2", box: "user", label: "What best describes their situation?", many: false,
        options: NOT_WORKING,
        info: NOT_WORKING_INFO
    },
    {
        id: "u-job", box: "user", label: "What kind of work do they do?", many: false,
        options: JOB_LEVELS,
        info: ["The ISCO-08 major groups, in plain words."]
    },
    {
        id: "u-orgtype", box: "user", label: "What type of organisation are their clients?", many: false,
        options: ORG_TYPES,
        info: ["Asked of a business serving clients and of a professional intermediary."]
    },
    {
        id: "u-size", box: "user", label: "How big are the clients' organisations?", many: false,
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
            // The scales chosen in Positioning: Solopreneurs & Freelancers are self-employed; a public body goes with Enterprise / Public Sector.
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
