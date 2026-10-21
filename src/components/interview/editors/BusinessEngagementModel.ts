import { BUSINESS_CHANNEL_CATEGORIES, BUSINESS_CHANNEL_OTHER, BUSINESS_JOURNEY_STAGES, BUSINESS_RELATIONSHIP_GOALS, BUSINESS_RELATIONSHIP_TYPES, BusinessChannelValue } from "../../../framework/engine/AnswerUtils.ts";
import { SOURCES } from "../../../framework/engine/Sources.ts";
import { BusinessTickOption, uniqueChoices } from "../cards/BusinessCardFields.tsx";
import { InfoPoint } from "../fields/InfoNote.tsx";
import { NUMBER_LIMITS, NumberLimit } from "../fields/numberInput.ts";

/** The pure part of the Customer Engagement page (page 2): its texts, limits and the functions that read a channel; the editor (BusinessEngagementEditor.tsx) draws it. */


/** How high each of Demand's counts can go; its percentages stop at 100. */
export const DEMAND_COUNT_LIMITS: Record<string, NumberLimit> = {
    prospects: NUMBER_LIMITS.perMonth,
    referrals: NUMBER_LIMITS.perMonth,
    visitors: NUMBER_LIMITS.perMonth,
    bids: NUMBER_LIMITS.bidsPerYear,
    times: NUMBER_LIMITS.perItem,
    units: NUMBER_LIMITS.perItem
};

/**
 * The questions this page asks, and the help behind its "i"s.
 *
 * The specifications for this page
 * (docs/specifications/business-system/page-2-section-1-channels.md
 * and page-2-section-2-customer-relationships.md) dictate the
 * wording of the HELP: the five relationship type explanations, the
 * three goal meanings, the Purpose and Approach questions, the
 * three "Relative Information" lists and the definition of an
 * Action are all given verbatim there, and are quoted here rather
 * than rewritten.
 *
 * The guidance above the process line is this page's own, the way
 * every page writes its own: the specifications are development
 * prompts rather than content to display, and neither carries the
 * "do not alter the wording" instruction Page 1's does.
 */
export const SECTIONS = {

    channels: {
        instructions: [
            "Decide which channels are relevant, and which offerings each one supports.",
            "Record where in the customer journey each channel is used.",
            "Describe what is done through the channel at each of those stages, and what it is for."
        ],
        // "Help text for the top information icon."
        /* The three "Relative Information" lists, verbatim, each
           paired with the Page 1 parameters that answer it -- and
           with the PAGE 1 HEADING those parameters are written
           under, which is what each answer is filed under here.

           The heading is the label rather than the question: a
           question is a sentence, and three sentences down the side
           of a card is another paragraph to read. The questions
           stay behind the "i". */
        profileInformation: [
            {
                label: "Personal & Psychographics",
                question: "Who are they, and what are their education, interests and background?",
                parts: ["personal", "psychographics"]
            },
            {
                label: "Social & Interest Hubs",
                question: "Where do they look for activities and connect with others?",
                parts: ["hubs"]
            },
            {
                label: "Information & Shopping Habits",
                question: "How do they discover, compare and choose solutions?",
                parts: ["habits"]
            }
        ],
        offeringInformation: [
            {
                label: "Content & Scope",
                question: "What does the customer need to know before choosing the offering?",
                parts: ["scope"]
            },
            {
                label: "Purchase & Delivery",
                question: "Where and how will the customer purchase, pay for, and receive it?",
                parts: ["delivery"]
            },
            {
                label: "Support & Communication",
                question: "What support or communication will the customer need afterwards?",
                parts: ["support"]
            }
        ],
        stages: [
            "Journey Stage determines where in the customer journey the channel is relevant.",
            "Do not combine Purchase and Delivery. Payment and delivery may happen through completely different channels."
        ],
        actions: [
            "What is done through this channel at the selected Journey Stage, and what it is intended to achieve.",
            "Actions should explain enough to understand both what happens and why it happens."
        ]
    },

    relationships: {
        instructions: [
            "Choose the kind of relationship you maintain with each Customer Profile, and say why you maintain it.",
            "For each Offering, record when in the journey you interact and through which of your channels.",
            "Describe how you conduct that interaction, and what it should achieve.",
            "For each Offering, estimate under Demand & Conversion where its customers come from and how many buy."
        ],
        // "The ⓘ should explain the available options."
        types: BUSINESS_RELATIONSHIP_TYPES.map(type => ({
            title: type.label,
            text: type.explanation
        })),
        purpose: [
            "Why do you maintain this type of relationship with this customer?"
        ],
        offerings: [
            "Which of this Segment's Offerings is this relationship maintained for? Each one chosen is answered separately, because the interaction can differ between them."
        ],
        stages: [
            "When in the customer journey does the interaction take place? Each stage chosen is answered separately, because the Approach is individual to each."
        ],
        channelAction: [
            "Recorded against that Channel in 1. Customer Channel, and shown here so the Approach can build on it rather than repeat it."
        ],
        approach: [
            "How will you use this interaction to maintain the relationship with the customer?"
        ],
        // "Goals describe what the organisation wants the
        // relationship to achieve", with the meanings given so the
        // terms are usable by someone who has not met them before.
        goals: BUSINESS_RELATIONSHIP_GOALS.map(goal => ({
            title: goal.label,
            text: goal.explanation
        }))
    }

};


/**
 * Get, Keep and Grow -- THE NAMES ONLY, on one line.
 *
 * Each was drawn with its meaning beside it, which is what the
 * specification asks of a dropdown with nothing else to explain it.
 * In a table cell it was three wrapped sentences under every
 * Approach, and the "i" on the Goal title above them already gives
 * the meanings to anyone who wants them.
 */
export const GOAL_OPTIONS: BusinessTickOption[] = BUSINESS_RELATIONSHIP_GOALS.map(goal => ({
    id: goal.id,
    label: goal.label
}));

/** What the "carries everything" mark is called in the list. */
export const ALL_OFFERINGS_LABEL = "All Offerings";

export const STAGE_LABELS: Record<string, string> = Object.fromEntries(
    BUSINESS_JOURNEY_STAGES.map(stage => [stage.id, stage.label])
);

export const TYPE_LABELS: Record<string, string> = Object.fromEntries(
    BUSINESS_RELATIONSHIP_TYPES.map(type => [type.id, type.label])
);

/* How an Offering is bought: once, or every month until cancelled. */
export const DEMAND_BUY_ONCE = "One sale at a time";
export const DEMAND_BUY_MONTHLY = "Every month, until they cancel";

export const DEMAND_BUYING_HELP: InfoPoint[] = [
    { title: DEMAND_BUY_ONCE, text: "Each sale is paid for once: a product, a session, a project." },
    {
        title: DEMAND_BUY_MONTHLY,
        text: "A subscription, membership or retainer. The sources give the new clients joining each month; the share cancelling gives the active clients at the normal level."
    }
];

/* How one source's sales are estimated. */
export const DEMAND_BY_FIGURE = "Enter a figure";
export const DEMAND_BY_CALCULATION = "Calculate";

export const DEMAND_CALCULATION_HELP: InfoPoint[] = [
    { title: DEMAND_BY_FIGURE, text: "The sales (for an Offering bought every month, the new clients) you expect from this source in a normal month, with its basis." },
    { title: DEMAND_BY_CALCULATION, text: "Worked out from a few inputs, such as the prospects reached and the share who buy." }
];

export const DEMAND_ASSUMPTIONS_PLACEHOLDER =
    "e.g. slower in the first months while the website launches";

/**
 * The formula behind one source's calculated result, its "i" beside
 * the figure once it counts. Keyed by the DEMAND_SOURCES id; "other"
 * has no fixed formula, so it carries none.
 */
export const DEMAND_SOURCE_FORMULA_HELP: Record<string, InfoPoint[]> = {
    funnel: [
        { title: "Formula", text: "Sales / month = Prospects × Qualified% × Buy%" },
        "Not every prospect is a real buyer. Multiply prospects by the share who qualify, then by the share of those you close.",
    ],
    referrals: [
        { title: "Formula", text: "Referrals × Buy%" },
        "Of the people referred to you, only some buy. Referred customers tend to stay longer and be worth more than customers from other sources.",
        { title: "Based on", source: SOURCES.referrals }
    ],
    marketplace: [
        { title: "Formula", text: "Visitors × Buy%" },
        "Conversion rate is the share of visitors who buy: 5 purchases from 100 visitors is 5%.",
        { title: "Based on", source: SOURCES.websiteConversion }
    ],
    contracts: [
        { title: "Formula", text: "Bids per year × Won% × Units per contract ÷ 12" },
        "Win rate is the share of bids you win. Dividing by 12 gives contracts a month."
    ],
    repeat: [
        { title: "Formula", text: "Sales from other sources × Buy again% × Times each" },
        "Repeat rate is the share of customers who buy again; only their extra purchases are counted, never the customers twice.",
        { title: "Based on", source: SOURCES.repeatCustomers }
    ]
};

/** The steady-level active clients, its "i" beside "active clients". */
export const DEMAND_ACTIVE_CLIENTS_HELP: InfoPoint[] = [
    { title: "Formula", text: "Active clients = New clients a month ÷ Cancel%" },
    "At the steady level, clients joining each month equal clients leaving. Average client lifetime ≈ 1 ÷ Cancel%.",
    { title: "Based on", source: SOURCES.customerLifetime }
];

/** The months to reach that steady level, its "i" beside "months". */
export const DEMAND_MONTHS_TO_NORMAL_HELP: InfoPoint[] = [
    { title: "Formula", text: "Months to 90% = ln(10) ÷ −ln(1 − Cancel%)" },
    "The gap to the steady level shrinks by the same share every month, so growth slows as you approach it.",
    { title: "Based on", source: SOURCES.geometricSeries }
];

export function capitalized(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/** What a reference note says when the page it refers to is blank. */
export const NOTHING_RECORDED = "Nothing recorded yet.";

/** One thing a reference column asks about, and where Page 1
 *  answers it. */
export interface RelativeQuestion {
    /** The Page 1 heading the answer is written under. */
    label: string;
    question: string;
    parts: string[];
}

/**
 * What the Customer Segment column asks -- and its third question
 * depends on the Segment.
 *
 * Business Data is Page 1's one OPTIONAL parameter: it opens with
 * "If you sell to companies", and a founder selling to people
 * leaves it unticked. Asking an unticked parameter here would show
 * "Nothing recorded yet." against a question that does not apply.
 *
 * So when it is off, the column asks what it can usefully ask
 * about a Segment of people instead -- Market Size & Industry
 * Outlook, and a short form of Page 1's question for it. The tick is the presence of the key, the
 * same test Page 1 makes.
 */
export function segmentQuestions(
    description: Record<string, string>
): RelativeQuestion[] {

    return [
        {
            label: "Geographics",
            question: "Where do they live, work or operate?",
            parts: ["geographics"]
        },
        {
            label: "Purchasing Power & Behaviour",
            question: "What influences purchasing decisions?",
            parts: ["purchasing"]
        },
        description["business-data"] !== undefined
            ? {
                label: "Business Data",
                question: "What type and size of organization do they work in, if any?",
                parts: ["business-data"]
            }
            : {
                label: "Market Size & Industry Outlook",
                question: "How large is this group, and where is its market heading?",
                parts: ["market-size"]
            }
    ];

}

export function relativeInformation(
    questions: readonly RelativeQuestion[]
): InfoPoint[] {

    /* THE QUESTIONS ONLY. The answers are on the page now, under
       the names they belong to, and a note repeating them would be
       the same information twice -- which is the thing this page
       is meant not to do.

       So the "i" is what it is everywhere else in this System: what
       the field below it is asking for. */
    return questions.map(entry => entry.question);

}

/**
 * What one thing named in the reference header says, ON THE PAGE
 * rather than behind the "i".
 *
 * "The actual relevant information should be displayed underneath
 * the title where appropriate." A reference area whose content is
 * hidden behind an icon is one nobody reads while they work --
 * which is the only time it is any use.
 *
 * It is drawn DIRECTLY UNDER THE NAME IT BELONGS TO, so Maria's
 * answers sit under Maria and nothing has to be matched up by eye.
 *
 * The questions themselves stay behind the "i", where they say
 * which answer is which.
 */
export function relativeInformationFor(
    questions: readonly RelativeQuestion[],
    description: Record<string, string>
): { label: string; text: string }[] {

    /* ONE SECTION PER QUESTION, each under the Page 1 heading it
       comes from. It used to be all three run together on one line
       with middle dots between them, which read as a paragraph
       nobody could take anything out of at a glance.

       A question with nothing recorded is left out rather than
       shown empty: this is a reference, and a heading with no
       answer under it is a line to skip. */
    return questions
        .map(entry => ({
            label: entry.label,
            /* JOINED BY A LINE BREAK, and every break inside an
               answer kept. Page 1's boxes hold lists -- bulleted,
               numbered, or one item a line -- and running them
               together with middle dots turned a list into a
               sentence. The text is drawn `white-space:pre-line`,
               so what was written as a list reads as one here. */
            text: entry.parts
                .map(part => (description[part] ?? "").trim())
                .filter(text => text.length > 0)
                .join("\n")
        }))
        .filter(section => section.text.length > 0);

}

/** This Segment's channels, as the choices Section 2 picks from. */
export function channelChoices(
    channels: readonly BusinessChannelValue[]
): { id: string; label: string }[] {
    return uniqueChoices(channels, "Unnamed channel");
}

/**
 * What is worth offering for one channel's name.
 *
 * Two sources, then the escape:
 *
 *   1. The category's own well-known places -- Instagram and the
 *      rest under Social Media, Gumroad and the rest under
 *      Marketplace.
 *   2. EVERY CHANNEL ALREADY RECORDED UNDER THAT CATEGORY, so a
 *      second entry for the same place is chosen rather than typed
 *      again and spelled differently.
 *   3. "Other", which empties the box so a name can be typed
 *      straight into it.
 *
 * A CATEGORY WITH NO PLACES OF ITS OWN GETS NO LIST AT ALL --
 * Website, Email and Direct Payment are the organisation's own, and
 * a list of one obvious answer is worse than none. Those stay the
 * plain text box they were.
 */
export function channelNameOptions(
    category: string,
    siblings: readonly BusinessChannelValue[]
): string[] {

    const known = BUSINESS_CHANNEL_CATEGORIES.find(
        entry => entry.label === category
    );

    if (!known || known.channels.length === 0) {
        return [];
    }

    const offered: string[] = [];
    const seen = new Set<string>();

    const add = (name: string) => {

        const text = name.trim();

        if (text.length === 0 || text === BUSINESS_CHANNEL_OTHER) {
            return;
        }

        const key = text.toLocaleLowerCase();

        if (!seen.has(key)) {
            seen.add(key);
            offered.push(text);
        }

    };

    known.channels.forEach(channel => add(channel.label));

    siblings
        .filter(sibling => sibling.category === category)
        .forEach(sibling => add(sibling.name));

    return [...offered, BUSINESS_CHANNEL_OTHER];

}

/**
 * The journey stages worth offering for a channel of this kind.
 *
 * Narrowed by the category (see BUSINESS_CHANNEL_CATEGORIES.stages)
 * so a payment link is not asked whether it is used for Discovery
 * -- fewer options, and every one of them plausible.
 *
 * A stage ALREADY RECORDED is always offered, whatever the category
 * has since become. A rule about what usually fits must never hide
 * something a founder has actually said.
 */
export function stageOptionsFor(
    category: string,
    channel: BusinessChannelValue
): typeof BUSINESS_JOURNEY_STAGES[number][] {

    const known = BUSINESS_CHANNEL_CATEGORIES.find(
        entry => entry.label === category
    );

    if (!known) {
        return [...BUSINESS_JOURNEY_STAGES];
    }

    return BUSINESS_JOURNEY_STAGES.filter(stage =>
        (known.stages as readonly string[]).includes(stage.id) ||
        channel.stages.includes(stage.id)
    );

}

/**
 * Whether a channel of this category is usually used at this stage
 * (BUSINESS_CHANNEL_CATEGORIES.stages). A category the founder named
 * themselves takes any stage.
 */
export function stageIsUsual(category: string, stageId: string): boolean {

    const known = BUSINESS_CHANNEL_CATEGORIES.find(
        entry => entry.label === category
    );

    return !known || (known.stages as readonly string[]).includes(stageId);

}

/**
 * The narrowest width step that holds a number's largest value (its
 * digits, and its decimals with their point): XS to six characters
 * ("33.333"), Code to ten, S beyond.
 */
export function numberStep(limits: NumberLimit): "xs" | "code" | "s" {
    const characters = String(Math.floor(limits.max)).length + ((limits.decimals ?? 0) > 0 ? (limits.decimals ?? 0) + 1 : 0);
    return characters <= 6 ? "xs" : characters <= 10 ? "code" : "s";
}

