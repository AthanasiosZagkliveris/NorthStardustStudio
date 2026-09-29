import { CSSProperties, Fragment, ReactNode, useState } from "react";

import {
    BUSINESS_CHANNEL_ALL_OFFERINGS,
    BUSINESS_CHANNEL_CATEGORIES,
    BUSINESS_CHANNEL_OTHER,
    BUSINESS_ENGAGEMENT_SECTIONS,
    BUSINESS_JOURNEY_STAGES,
    BUSINESS_RELATIONSHIP_GOALS,
    BUSINESS_RELATIONSHIP_TYPES,
    BusinessChannelValue,
    BusinessCustomerSegmentValue,
    BusinessEngagementValue,
    BusinessOfferingRelationshipsValue,
    BusinessRelationshipInteractionValue,
    BusinessRelationshipTypeValue,
    BusinessSegmentEngagementValue,
    asBusinessEngagementValue,
    businessChannelNamePlaceholder,
    businessFoundationSegments,
    businessProfileOfferings,
    businessRelationshipInteractions,
    createBusinessChannel,
    createBusinessOfferingRelationships,
    createBusinessRelationshipInteraction,
    createBusinessRelationshipType,
    createBusinessSegmentEngagement,
    segmentHue
} from "../../framework/engine/AnswerUtils.ts";

import {
    DEMAND_SOURCES,
    DemandSource,
    DemandValue,
    createDemand,
    createDemandSource,
    demandResult
} from "../../framework/engine/DemandCapacity.ts";

import {
    BusinessAddButton,
    BusinessEmpty,
    BusinessField,
    BusinessNote,
    BusinessRemove,
    BusinessStep,
    BusinessTickOption,
    BusinessTicks,
    uniqueChoices
} from "./BusinessCardFields.tsx";
import { summaryText } from "./cardSummary.ts";
import FoldAllToggle from "./FoldAllToggle.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import NumberedListInput from "./NumberedListInput.tsx";
import { NUMBER_LIMITS, NumberLimit, limitedNumberText, numberInputMode } from "./numberInput.ts";
import OptionPicker from "./OptionPicker.tsx";
import { railId } from "./rails/railItems.ts";
import type { OpenPage } from "./jumpTo.ts";
import StrategyTextArea from "./StrategyTextArea.tsx";
import SuggestedInput from "./SuggestedInput.tsx";
import { useItemFolds } from "./useItemFolds.ts";
import FoldArrow from "./FoldArrow.tsx";
import CardNumber from "./CardNumber.tsx";
import { toggledIn } from "./toggledIn.ts";

import "../../styles/demand.css";

/** How high each of Demand's counts can go; its percentages stop at 100. */
const DEMAND_COUNT_LIMITS: Record<string, NumberLimit> = {
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
const SECTIONS = {

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
const GOAL_OPTIONS: BusinessTickOption[] = BUSINESS_RELATIONSHIP_GOALS.map(goal => ({
    id: goal.id,
    label: goal.label
}));

/** What the "carries everything" mark is called in the list. */
const ALL_OFFERINGS_LABEL = "All Offerings";

const STAGE_LABELS: Record<string, string> = Object.fromEntries(
    BUSINESS_JOURNEY_STAGES.map(stage => [stage.id, stage.label])
);

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
    BUSINESS_RELATIONSHIP_TYPES.map(type => [type.id, type.label])
);

/* How an Offering is bought: once, or every month until cancelled. */
const DEMAND_BUY_ONCE = "One sale at a time";
const DEMAND_BUY_MONTHLY = "Every month, until they cancel";

const DEMAND_BUYING_HELP: InfoPoint[] = [
    { title: DEMAND_BUY_ONCE, text: "Each sale is paid for once: a product, a session, a project." },
    {
        title: DEMAND_BUY_MONTHLY,
        text: "A subscription, membership or retainer. The sources give the new clients joining each month; the share cancelling gives the active clients at the normal level."
    }
];

/* How one source's sales are estimated. */
const DEMAND_BY_FIGURE = "Enter a figure";
const DEMAND_BY_CALCULATION = "Calculate";

const DEMAND_CALCULATION_HELP: InfoPoint[] = [
    { title: DEMAND_BY_FIGURE, text: "The sales (for an Offering bought every month, the new clients) you expect from this source in a normal month, with its basis." },
    { title: DEMAND_BY_CALCULATION, text: "Worked out from a few inputs, such as the prospects reached and the share who buy." }
];

const DEMAND_ASSUMPTIONS_PLACEHOLDER =
    "e.g. slower in the first months while the website launches";

/**
 * The formula behind one source's calculated result, its "i" beside
 * the figure once it counts. Keyed by the DEMAND_SOURCES id; "other"
 * has no fixed formula, so it carries none.
 */
const DEMAND_SOURCE_FORMULA_HELP: Record<string, InfoPoint[]> = {
    funnel: [
        { title: "Formula", text: "Sales / month = Prospects × Qualified% × Buy%" },
        "Not every prospect is a real buyer. Multiply prospects by the share who qualify, then by the share of those you close.",
        {
            title: "Based on",
            text: "CFI, “Lead-to-Customer Conversion Rate”",
            href: "https://corporatefinanceinstitute.com/resources/valuation/lead-to-customer-conversion-rate/"
        }
    ],
    referrals: [
        { title: "Formula", text: "Referrals × Buy%" },
        "Of the people referred to you, only some buy. Referred leads often convert better than cold ones.",
        {
            title: "Source",
            text: "Umbrex, “Referral Conversion Rate Analysis”",
            href: "https://umbrex.com/resources/ultimate-guide-to-company-analysis/ultimate-guide-to-marketing-analysis/referral-conversion-rate-analysis/"
        }
    ],
    marketplace: [
        { title: "Formula", text: "Visitors × Buy%" },
        "Conversion rate is the share of visitors who buy: 5 purchases from 100 visitors is 5%.",
        {
            title: "Source",
            text: "CFI, “Customer Conversion Rate”",
            href: "https://corporatefinanceinstitute.com/resources/valuation/customer-conversion-rate/"
        }
    ],
    contracts: [
        { title: "Formula", text: "Bids per year × Won% × Units per contract ÷ 12" },
        "Win rate is the share of bids you win (25–35% is typical in professional services and construction). Dividing by 12 gives contracts a month.",
        {
            title: "Based on",
            text: "Klipfolio, “Tender Win Rate”",
            href: "https://www.klipfolio.com/resources/kpi-examples/sales/successful-unsuccessful-tenders"
        }
    ],
    repeat: [
        { title: "Formula", text: "Sales from other sources × Buy again% × Times each" },
        "Repeat rate is the share of customers who buy again; only their extra purchases are counted, never the customers twice.",
        {
            title: "Based on",
            text: "Wall Street Prep, “Repeat Purchase Rate”",
            href: "https://www.wallstreetprep.com/knowledge/repeat-purchase-rate/"
        }
    ]
};

/** The steady-level active clients, its "i" beside "active clients". */
const DEMAND_ACTIVE_CLIENTS_HELP: InfoPoint[] = [
    { title: "Formula", text: "Active clients = New clients a month ÷ Cancel%" },
    "At the steady level, clients joining each month equal clients leaving. Average client lifetime ≈ 1 ÷ Cancel%.",
    {
        title: "Based on",
        text: "Wall Street Prep, “Churn Rate”",
        href: "https://www.wallstreetprep.com/knowledge/churn-rate/"
    }
];

/** The months to reach that steady level, its "i" beside "months". */
const DEMAND_MONTHS_TO_NORMAL_HELP: InfoPoint[] = [
    { title: "Formula", text: "Months to 90% = ln(10) ÷ −ln(1 − Cancel%)" },
    "The gap to the steady level shrinks by the same share every month, so growth slows as you approach it.",
    {
        title: "Based on",
        text: "geometric series (fraction reached after n months = 1 − (1 − c)ⁿ)",
        href: "https://en.wikipedia.org/wiki/Geometric_series"
    }
];

function capitalized(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

/** What a reference note says when the page it refers to is blank. */
const NOTHING_RECORDED = "Nothing recorded yet.";

/** One thing a reference column asks about, and where Page 1
 *  answers it. */
interface RelativeQuestion {
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
function segmentQuestions(
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

function relativeInformation(
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
function relativeInformationFor(
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
function channelChoices(
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
function channelNameOptions(
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

    known.channels.forEach(add);

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
function stageOptionsFor(
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

interface BusinessEngagementEditorProps {

    value: unknown;

    onChange: (value: BusinessEngagementValue) => void;

    disabled?: boolean;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

    /** See AnswerRendererProps.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * Page 1's answer: the Segments, Profiles and Offerings this
     * whole page is answered against.
     *
     * Everything drawn from it is a REFERENCE. Nothing here is
     * copied into this page's own value, which holds ids only -- so
     * renaming a Profile on Page 1 renames it here, and the two
     * pages cannot disagree about what exists.
     */
    foundation?: unknown;

    /**
     * Opens Page 1, for the reference links: "The user must be able
     * to access the relevant source information through links."
     */
    onOpenFoundation?: OpenPage;

}

/**
 * The Business System's Customer Engagement section (see
 * AnswerType.BusinessEngagement).
 *
 * Two sections, in the order the specifications set: how the
 * organization reaches and serves its customers, and what kind of
 * relationship it keeps with each of them. The second picks the
 * channels the first defines, which is why they are one page and
 * one editor rather than two.
 *
 * THE CUSTOMER SEGMENT OWNS BOTH, exactly as it owns all four of
 * Page 1's subsections. A channel card's reference header shows
 * "the selected Customer Segment", its Profiles and its Offerings;
 * a relationship is held with a Profile, whose Offerings and
 * Channels are that Segment's. So this page is one card per
 * Segment, drawn in that Segment's own colour -- the same card, on
 * the next page, continuing the same work.
 */
export default function BusinessEngagementEditor({

    value,

    onChange,

    disabled = false,

    showInstructions = true,

    columnsDivider,

    foundation,

    onOpenFoundation

}: BusinessEngagementEditorProps) {

    const engagement = asBusinessEngagementValue(value);

    /** Page 1's Segments, read for reference only. */
    const segments = businessFoundationSegments(foundation);

    /** The cards folded away, by key. Not stored with the answer:
     *  which cards a reader has closed is how they are looking at
     *  the page, not part of what they have said. */
    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

    /**
     * Which reference headers, Offering reference entries, Channel
     * Categories, per-Offering relationship blocks and Demand &
     * Conversion blocks are open. These five start CLOSED -- see useItemFolds
     * -- unlike the structural sections and per-type/per-stage
     * folds around them, which stay on `collapsed` and so start
     * open.
     */
    const folds = useItemFolds();

    /* A CATEGORY FOLDS ITS CHANNELS AWAY. Keyed by the group's first
       channel, for the same reason the group itself is (see
       channelsFor): a key made from the category would change with
       every keystroke typed into it, and the group would fold and
       unfold as it was named. */
    const channelCategoryFoldKey = (segmentId: string, groupKey: string) =>
        "channel-category-" + segmentId + "-" + groupKey;

    /** One Segment's named Channel Categories' fold keys, grouped
     *  exactly as channelsFor groups them -- for "Expand all". */
    function channelCategoryFoldKeys(segmentId: string): string[] {

        const seen = new Set<string>();

        const keys: string[] = [];

        for (const channel of segmentOf(segmentId).channels) {

            if (seen.has(channel.category)) {
                continue;
            }

            seen.add(channel.category);

            if (channel.category.trim().length > 0) {
                keys.push(channelCategoryFoldKey(segmentId, channel.id));
            }

        }

        return keys;

    }

    /** One Segment's reference header. Hidden until asked for, so
     *  it is kept with the item folds, which start closed. */
    const referencesFoldKey = (segmentId: string) =>
        "reference-header-" + segmentId;

    const referencesOpen = (segmentId: string) =>
        folds.isOpen(referencesFoldKey(segmentId));

    function toggle(key: string) {
        setCollapsed(current => toggledIn(current, key));
    }

    /* ---------- Reading and writing one Segment's answer ---------- */

    /**
     * What has been answered for a Segment, or an empty answer for
     * one that has not been touched. Never stored until something
     * is written into it, so opening the page records nothing.
     */
    function segmentOf(segmentId: string): BusinessSegmentEngagementValue {
        return engagement.segments.find(entry => entry.segmentId === segmentId)
            ?? createBusinessSegmentEngagement(segmentId);
    }

    function updateSegment(
        segmentId: string,
        patch: Partial<BusinessSegmentEngagementValue>
    ) {

        const known = engagement.segments.some(
            entry => entry.segmentId === segmentId
        );

        onChange({
            ...engagement,
            segments: known
                ? engagement.segments.map(entry => entry.segmentId === segmentId
                    ? { ...entry, ...patch }
                    : entry)
                : [
                    ...engagement.segments,
                    { ...createBusinessSegmentEngagement(segmentId), ...patch }
                ]
        });

    }

    function updateChannel(
        segmentId: string,
        channelId: string,
        patch: Partial<BusinessChannelValue>
    ) {
        updateSegment(segmentId, {
            channels: segmentOf(segmentId).channels.map(
                channel => channel.id === channelId
                    ? { ...channel, ...patch }
                    : channel
            )
        });
    }

    /*
        The two levels below an Offering are each stored as a chosen
        LIST plus a DETAIL MAP keyed by the same ids -- types and
        typeDetail.

        Two shapes rather than one because unticking must not
        destroy. Unticking is how a founder tries a relationship
        type on for size; it is not a request to throw away the
        Purpose, Approach or Goals written under it. The detail
        outlives the tick, so ticking again brings the work straight
        back -- the same thing Page 1 does with what is written
        under a competitor question its type later hides.
    */

    /** What is kept ABOUT ONE OFFERING, whoever it is sold to. */
    function offeringRelationshipsOf(
        segmentId: string,
        offeringId: string
    ): BusinessOfferingRelationshipsValue {
        return segmentOf(segmentId).offerings.find(
            entry => entry.offeringId === offeringId
        ) ?? createBusinessOfferingRelationships();
    }

    function updateOfferingRelationships(
        segmentId: string,
        offeringId: string,
        patch: Partial<BusinessOfferingRelationshipsValue>
    ) {

        const segment = segmentOf(segmentId);

        const known = segment.offerings.some(
            entry => entry.offeringId === offeringId
        );

        updateSegment(segmentId, {
            offerings: known
                ? segment.offerings.map(entry => entry.offeringId === offeringId
                    ? { ...entry, ...patch }
                    : entry)
                : [
                    ...segment.offerings,
                    {
                        offeringId,
                        ...createBusinessOfferingRelationships(),
                        ...patch
                    }
                ]
        });

    }

    function typeOf(
        segmentId: string,
        offeringId: string,
        typeId: string
    ): BusinessRelationshipTypeValue {
        return offeringRelationshipsOf(segmentId, offeringId)
            .typeDetail[typeId] ?? createBusinessRelationshipType();
    }

    function updateType(
        segmentId: string,
        offeringId: string,
        typeId: string,
        patch: Partial<BusinessRelationshipTypeValue>
    ) {

        const offering = offeringRelationshipsOf(segmentId, offeringId);

        updateOfferingRelationships(segmentId, offeringId, {
            typeDetail: {
                ...offering.typeDetail,
                [typeId]: {
                    ...typeOf(segmentId, offeringId, typeId),
                    ...patch
                }
            }
        });

    }

    /**
     * One interaction's answers, and how to change them.
     *
     * The Offering, the stage and the channel are not stored -- the
     * Channels table says which interactions exist, and this is
     * only what a person writes about each of them. `key` is what
     * businessInteractionKey makes of those three.
     */
    /**
     * One interaction's answers.
     *
     * `fallbacks` are the keys the same interaction's answers were
     * filed under before a row was one KIND of channel rather than
     * one channel. A row that has nothing of its own takes the
     * first of those that does, so an Approach written when
     * Instagram had a row of its own still shows now that Instagram
     * shares a row with TikTok. Only read, never written -- the
     * first edit files the answer under the current key.
     */
    function interactionOf(
        segmentId: string,
        offeringId: string,
        typeId: string,
        key: string,
        fallbacks: readonly string[] = []
    ): BusinessRelationshipInteractionValue {

        const kept = typeOf(segmentId, offeringId, typeId).interactions;

        if (kept[key]) {
            return kept[key];
        }

        for (const fallback of fallbacks) {

            const older = kept[fallback];

            if (older && (older.approach.trim().length > 0 || older.goals.length > 0)) {
                return older;
            }

        }

        return createBusinessRelationshipInteraction();

    }

    function updateInteraction(
        segmentId: string,
        offeringId: string,
        typeId: string,
        key: string,
        /* The same fallbacks the row is READ with. The first edit
           has to start from what the row is showing, or writing an
           Approach would silently drop the Goals shown beside it --
           they came from an older key, and a write that began from
           an empty answer would not carry them over. */
        fallbacks: readonly string[],
        patch: Partial<BusinessRelationshipInteractionValue>
    ) {

        const type = typeOf(segmentId, offeringId, typeId);

        updateType(segmentId, offeringId, typeId, {
            interactions: {
                ...type.interactions,
                [key]: {
                    ...interactionOf(
                        segmentId, offeringId, typeId, key, fallbacks
                    ),
                    ...patch
                }
            }
        });

    }

    /** The card on Page 1 with this id, and the Segment it is in. */
    function foundationPath(id: string): string[] {
        const segment = segments.find(entry => entry.id === id ||
            entry.profiles.some(profile => profile.id === id) ||
            entry.offerings.some(offering => offering.id === id) ||
            entry.competitors.some(competitor => competitor.id === id));
        return segment && segment.id !== id ? [id, segment.id] : [id];
    }

    /* ---------- Building blocks of this page ---------- */

    /**
     * A name answered on Page 1, drawn as the link that opens it.
     *
     * A button rather than an anchor: it moves the interview to
     * another Section rather than following a URL, and a control
     * that does not navigate the browser should not claim to.
     * Without somewhere to go it is plain text -- a link that leads
     * nowhere is worse than none.
     */
    function foundationLink(name: string, what: string, id?: string) {

        const shown = name.trim().length > 0 ? name.trim() : "Not named yet";

        if (!onOpenFoundation || name.trim().length === 0) {
            return (
                <span className="business-engagement-reference-name">
                    {shown}
                </span>
            );
        }

        return (
            <button
                type="button"
                className="business-engagement-link"
                aria-label={"Open the Foundation page, where the " + what +
                    " " + shown + " is defined"}
                onClick={() => onOpenFoundation(id ? foundationPath(id) : undefined)}
            >
                {shown}
            </button>
        );

    }

    /**
     * One column of the reference header: what Page 1 names, and
     * what it says about each of them.
     *
     * EACH NAME CARRIES ITS OWN INFORMATION, directly beneath it.
     * The two used to be separate lists -- every name, then every
     * fact prefixed with the name it belonged to -- which made the
     * reader match them up by eye and said each name twice.
     *
     * A "Relative Information" label sat between the title and the
     * entries, with the "i" on it. Both have gone: the label named
     * what the column's own title already names, and the column
     * carries the "i" itself.
     */
    function referenceColumn(
        title: string,
        what: string,
        /* A function rather than a list, because the Customer
           Segment's third question depends on the Segment -- see
           segmentQuestions. The other two columns ignore what they
           are handed. */
        questionsFor: (description: Record<string, string>) => RelativeQuestion[],
        sources: readonly {
            key: string;
            name: string;
            description: Record<string, string>;
        }[],
        /**
         * Whether each entry folds away.
         *
         * The Profiles and the Offerings do: a Segment can have
         * three of each, every one with three sections under it,
         * and a reader working on one channel does not need all
         * nine open. The Segment column holds one entry and has
         * nothing to fold past.
         */
        foldable = false
    ) {

        return (
            <div className="business-engagement-reference-column">

                <span className="business-foundation-label-info">
                    <span className="field-group-title business-foundation-subhead">
                        <InfoText text={title}>
                            <InfoNote
                                label={title}
                                points={relativeInformation(
                                    questionsFor(sources[0]?.description ?? {})
                                )}
                                fullList
                            />
                        </InfoText>
                    </span>
                </span>

                {sources.length === 0
                    ? (
                        <p className="business-engagement-reference-empty">
                            {NOTHING_RECORDED}
                        </p>
                    )
                    : sources.map(source => {

                        const sections = relativeInformationFor(
                            questionsFor(source.description), source.description
                        );

                        const foldKey = "reference-" + source.key;

                        const open = !foldable || folds.isOpen(foldKey);

                        return (
                            <div
                                className="business-engagement-reference-entry"
                                key={source.key}
                            >

                                <div className="business-engagement-reference-name-row">

                                    {foldable && sections.length > 0 && (
                                        <FoldArrow
                                            open={open}
                                            label={source.name.trim() || what}
                                            onToggle={() => folds.toggle(foldKey)}
                                        />
                                    )}

                                    {foundationLink(source.name, what, source.key)}

                                </div>

                                {open && sections.length > 0 && (
                                    <div className="business-engagement-reference-facts">
                                        {sections.map(section => (
                                            <div
                                                className="business-engagement-reference-section"
                                                key={section.label}
                                            >
                                                <span className="business-engagement-reference-label">
                                                    {section.label}
                                                </span>
                                                <p className="business-engagement-reference-text">
                                                    {section.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                            </div>
                        );

                    })}

            </div>
        );
    }

    /**
     * One of the card's two sections, with the arrow that folds it.
     *
     * The same arrow every card on this page and Page 1 carries
     * (.strategy-box-toggle), in front of the same subhead -- so a
     * section folds the way a card does, and the control is the one
     * already learned.
     *
     * The body is a function, not markup, so a folded section costs
     * nothing to draw: a Segment's whole Channels table is not
     * built to be hidden.
     *
     * `titleExtra` is drawn at the far end of the title row -- the
     * section's own "Expand all", for the item cards its body
     * holds. Given here rather than inside `body` so it still shows
     * while the section itself is folded shut.
     */
    function foldingSection(
        key: string,
        title: string,
        body: () => ReactNode,
        sectionIndex: number,
        titleExtra?: ReactNode
    ) {

        const open = !collapsed.has(key);

        return (
            <div
                className="business-engagement-section"
                data-anchor={"engagement-section-" + key}
                data-rail={railId(BUSINESS_ENGAGEMENT_SECTIONS[sectionIndex])}
            >

                <div className="business-engagement-section-head fold-group-head">

                    <FoldArrow open={open} label={title} onToggle={() => toggle(key)} />

                    <span className="field-group-title business-foundation-subhead">{title}</span>

                    {titleExtra}

                </div>

                {open && body()}

            </div>
        );

    }

    /* ---------- 1. Customer Channel ---------- */
    /**
     * The Channels table.
     *
     * A TABLE, not a stack of cards, because that is the shape the
     * specification draws twice -- once as the field list ("Channel,
     * Links, Offerings, Journey Stage, Action") and once as the
     * final UI. Five columns, and the reading it supports is across
     * rather than down: which channels reach this Segment, what each
     * one carries, and when.
     *
     * Two things span, and both come straight from that drawing:
     *
     * - THE CATEGORY is a row of its own across all five columns,
     *   with its channels beneath it. "The category is a container
     *   and should not be repeated for every row."
     * - A CHANNEL'S first three cells span its journey stages, so
     *   LinkedIn's name, links and offerings are written once and
     *   Discovery and Evaluation each get their own row beside
     *   them. One row is one interaction; one channel is as many
     *   rows as it has stages.
     */
    function channelsFor(segment: BusinessCustomerSegmentValue) {

        const answers = segmentOf(segment.id);

        // Unique labels, as every other picker has (see
        // uniqueChoices): two Offerings sharing a name are told apart,
        // and a label chosen maps back to exactly one id.
        const offeringOptions = uniqueChoices(
            segment.offerings.map((offering, index) => ({
                id: offering.id,
                name: offering.name.trim().length > 0
                    ? offering.name
                    : "Offering " + (index + 1) + ", not named yet"
            })),
            ""
        );

        /*
            Grouped by category, drawn in the fixed order the
            category list gives. A channel whose category has not
            been chosen yet is grouped at the end, under a heading
            that says so, and moves up into its category the moment
            one is picked -- which is the nesting rule making itself
            visible.
        */
        /*
            Grouped by category, IN THE ORDER THE CATEGORIES FIRST
            APPEAR rather than in the fixed list's order -- a
            category can now be one the founder named themselves,
            and a name has no place in a list it is not in.

            Each group is keyed by its FIRST CHANNEL, never by the
            category: the category is typed into, and a key that
            changed with every keystroke would rebuild the group and
            take the caret out of the box being typed into.
        */
        const groups: {
            key: string;
            label: string;
            channels: BusinessChannelValue[];
        }[] = [];

        for (const channel of answers.channels) {

            const group = groups.find(entry => entry.label === channel.category);

            if (group) {
                group.channels.push(channel);
            } else {
                groups.push({
                    key: channel.id,
                    label: channel.category,
                    channels: [channel]
                });
            }

        }

        // Numbered down the table as it is actually drawn, so a
        // channel's number is its own position.
        let position = 0;

        return (
            <>

                {/* The table scrolls sideways inside its own box
                    rather than making the page do it: five columns
                    have a width below which they stop being five
                    columns, and the rest of the page has no reason
                    to move with them. */}
                <div className="business-channel-table-wrap">

                    <table className="business-channel-table">

                        <thead>
                            <tr>
                                {/* The channel, and under it where it
                                    is: a Links column of its own held
                                    nothing on most rows and put a
                                    destination as far from its channel
                                    as an Action is. */}
                                <th scope="col">Channel</th>
                                <th scope="col">Offerings</th>
                                <th scope="col">
                                    <span className="business-foundation-label-info">
                                        <span>
                                            <InfoText text="Journey Stage">
                                                <InfoNote
                                                    label="Journey Stage"
                                                    points={SECTIONS.channels.stages}
                                                    fullList
                                                />
                                            </InfoText>
                                        </span>
                                    </span>
                                </th>
                                <th scope="col">
                                    <span className="business-foundation-label-info">
                                        <span>
                                            <InfoText text="Action">
                                                <InfoNote
                                                    label="Action"
                                                    points={SECTIONS.channels.actions}
                                                    fullList
                                                />
                                            </InfoText>
                                        </span>
                                    </span>
                                </th>
                            </tr>
                        </thead>

                        {/* A TABLE WITH NOTHING IN IT SAYS SO. Now
                            that a category can be removed, the last
                            one can be too -- and a head row with
                            nothing under it reads as broken rather
                            than as empty. It also gives the table a
                            last row to round its bottom corners
                            on. */}
                        {groups.length === 0 && (
                            <tbody>
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="business-channel-cell"
                                    >
                                        <BusinessEmpty>
                                            No channel yet. Add a Channel Category
                                            below, then name the channels filed
                                            under it.
                                        </BusinessEmpty>
                                    </td>
                                </tr>
                            </tbody>
                        )}

                        {groups.map(group => {

                          /* Folded by default, like the relationship
                             blocks -- see channelCategoryFoldKey. */
                          const categoryFoldKey =
                              channelCategoryFoldKey(segment.id, group.key);

                          const categoryOpen = folds.isOpen(categoryFoldKey);

                          return (

                            <tbody key={group.key}>

                                {/* THE CATEGORY, ONCE, ACROSS THE
                                    TABLE -- and it is chosen here,
                                    not inside the channels under
                                    it.

                                    The category is a container. It
                                    belongs at the head of the
                                    group it names, and a copy of it
                                    in every channel row was the
                                    same answer written twice.

                                    Changing it re-files everything
                                    in this group, which is what a
                                    container's own label does: the
                                    group becomes that category,
                                    channels and all. Picking one
                                    that already has a group merges
                                    the two. */}
                                <tr className="business-channel-category-row">
                                    {/* In the CHANNEL COLUMN'S OWN
                                        CELL, not spanning the table:
                                        the picker then lines up
                                        exactly with the channel
                                        names it heads, because it is
                                        in the same column they are.
                                        The other four columns are
                                        one empty cell carrying the
                                        row's ground. */}
                                    <th scope="rowgroup">
                                        <div className="business-channel-category">

                                            {/* THE ARROW BESIDE THE
                                                CATEGORY, folding the
                                                channels filed under
                                                it. Only once it has a
                                                name: an unnamed
                                                category has no
                                                channels drawn to
                                                fold. */}
                                            {group.label.trim().length > 0 && (
                                                <FoldArrow
                                                    open={categoryOpen}
                                                    label={group.label}
                                                    onToggle={() => folds.toggle(categoryFoldKey)}
                                                />
                                            )}

                                            {/* The seven, and "Other" --
                                                which empties the box so a
                                                category of the founder's
                                                own can be typed straight
                                                into it, exactly as a
                                                channel's name is. */}
                                            <SuggestedInput
                                                label={
                                                    "Channel Category for " +
                                                    group.channels
                                                        .map(channel =>
                                                            channel.name.trim() ||
                                                            "an unnamed channel")
                                                        .join(", ")
                                                }
                                                placeholder="Channel category"
                                                /* A CATEGORY ALREADY IN THE TABLE
                                                   IS NOT OFFERED AGAIN. Picking
                                                   one merges this group into that
                                                   one, which is never what the
                                                   reader means by choosing it from
                                                   a list of things to make. This
                                                   group's own category stays, so
                                                   the box can still show it. */
                                                options={[
                                                    ...BUSINESS_CHANNEL_CATEGORIES
                                                        .filter(category =>
                                                            category.label === group.label ||
                                                            !groups.some(other =>
                                                                other.label === category.label
                                                            )
                                                        )
                                                        .map(category => category.label),
                                                    BUSINESS_CHANNEL_OTHER
                                                ]}
                                                disabled={disabled}
                                                value={group.label}
                                                onChange={(category) => {

                                                    const moving = new Set(
                                                        group.channels.map(
                                                            channel => channel.id
                                                        )
                                                    );

                                                    updateSegment(segment.id, {
                                                        channels: answers.channels.map(
                                                            channel => moving.has(channel.id)
                                                                ? { ...channel, category }
                                                                : channel
                                                        )
                                                    });

                                                }}
                                            />

                                            {/* THE WHOLE GROUP, CHANNELS AND
                                                ALL. A category is not a label
                                                on top of the channels under it
                                                -- it IS them, and the table
                                                had no way to take one back:
                                                Add Channel Category made a
                                                group that nothing could
                                                remove.

                                                It says what it takes with it.
                                                A channel removed by mistake
                                                costs its links, its Offerings
                                                and its Actions, and a control
                                                that removes five of them at
                                                once should name them before
                                                it is pressed. */}
                                            <BusinessRemove
                                                what={
                                                    "Channel Category " +
                                                    (group.label.trim() ||
                                                        "with no name yet") +
                                                    (group.channels.length > 0
                                                        ? " and its " +
                                                            group.channels.length +
                                                            " channel" +
                                                            (group.channels.length === 1
                                                                ? "" : "s")
                                                        : "")
                                                }
                                                disabled={disabled}
                                                onRemove={() => updateSegment(
                                                    segment.id,
                                                    {
                                                        channels: answers.channels
                                                            .filter(candidate =>
                                                                candidate.category !==
                                                                    group.label
                                                            )
                                                    }
                                                )}
                                            />

                                        </div>

                                        {/* Folded, the category still
                                            says how much it holds -- on
                                            its own line under the select,
                                            so the select keeps its width. */}
                                        {group.label.trim().length > 0 && !categoryOpen && (
                                            <div className="business-card-summary business-channel-category-summary">
                                                {group.channels.length +
                                                    (group.channels.length === 1
                                                        ? " channel"
                                                        : " channels")}
                                            </div>
                                        )}

                                    </th>
                                    <td colSpan={3} />
                                </tr>

                                {/* NOTHING UNTIL THE CATEGORY IS
                                    CHOSEN. A channel's name list, its
                                    journey stages and its own prompt
                                    all come from its category, so a
                                    row offered before one is picked is
                                    a row that cannot be answered
                                    properly. The category row stands
                                    alone until it has an answer. */}
                                {group.label.trim().length > 0 &&
                                    group.channels.map(channel => {

                                    position += 1;

                                    /* COUNTED WHETHER IT IS DRAWN OR
                                       NOT, so folding a category does
                                       not renumber the channels under
                                       every category after it -- a
                                       channel's number is its own. */
                                    const number = position;

                                    if (!categoryOpen) {
                                        return null;
                                    }

                                    const change = (
                                        patch: Partial<BusinessChannelValue>
                                    ) => updateChannel(segment.id, channel.id, patch);

                                    /* The stages this channel is used at --
                                       and one empty row when it has none
                                       yet, so the Journey Stage column
                                       always shows the dropdown that
                                       chooses one rather than a bare
                                       button. */
                                    const stageRows = channel.stages.length > 0
                                        ? channel.stages
                                        : [""];

                                    const span = stageRows.length;

                                    /* The same, for the Offerings cell: one
                                       row per Offering carried, or one empty
                                       row to choose the first.

                                       A channel marked as carrying ALL of them
                                       is ONE row saying so, not one row per
                                       Offering -- and it keeps meaning all of
                                       them as Page 1 gains more. */
                                    const carriesAll = channel.offerings.includes(
                                        BUSINESS_CHANNEL_ALL_OFFERINGS
                                    );

                                    const offeringRows = carriesAll
                                        ? [BUSINESS_CHANNEL_ALL_OFFERINGS]
                                        : channel.offerings.length > 0
                                            ? channel.offerings
                                            : [""];

                                    /* The channel itself: its name,
                                       the category it is filed
                                       under, and the control that
                                       removes it. Written once and
                                       spanning its stages. */
                                    const channelCells = (
                                        <>

                                            {/* A step in from the category
                                                row above it, the way every
                                                level on this page sits in
                                                from the arrow that folds
                                                the one above. */}
                                            <td
                                                rowSpan={span}
                                                className="business-channel-cell business-channel-cell-nested"
                                            >

                                                <div className="business-channel-name">

                                                    <span
                                                        className="business-channel-nest"
                                                        aria-hidden="true"
                                                    >
                                                        ↳
                                                    </span>

                                                    {/* Typed straight in, with the
                                                        category's own places and
                                                        whatever is already recorded
                                                        under it offered beside it --
                                                        so the same place is named the
                                                        same way every time without
                                                        anything else having to be
                                                        chosen first. */}
                                                    <SuggestedInput
                                                        label={
                                                            "Channel " + number + " name"
                                                        }
                                                        /* What the category calls the
                                                           thing being named: a page, an
                                                           address, a way of being paid. */
                                                        placeholder={
                                                            businessChannelNamePlaceholder(
                                                                channel.category
                                                            )
                                                        }
                                                        options={channelNameOptions(
                                                            channel.category,
                                                            answers.channels.filter(
                                                                candidate =>
                                                                    candidate.id !== channel.id
                                                            )
                                                        )}
                                                        disabled={disabled}
                                                        value={channel.name}
                                                        onChange={(next) => change({
                                                            name: next
                                                        })}
                                                    />

                                                    {answers.channels.length > 1 && (
                                                        <BusinessRemove
                                                            what={"Channel " + number}
                                                            disabled={disabled}
                                                            onRemove={() => updateSegment(
                                                                segment.id,
                                                                {
                                                                    channels: answers.channels
                                                                        .filter(candidate =>
                                                                            candidate.id !== channel.id
                                                                        )
                                                                }
                                                            )}
                                                        />
                                                    )}

                                                </div>

                                                {/* No second box for "Other": the
                                                    name is typed into the one box
                                                    there is.

                                                    No category picker here either: the
                                                    category is chosen once, on
                                                    the row that names the group
                                                    this channel sits in. */}

                                                {/* WHERE THE CHANNEL IS, UNDER
                                                    WHAT IT IS CALLED. A column of
                                                    its own put a destination as far
                                                    from its channel as an Action is,
                                                    and left it holding nothing on
                                                    every row that had no link to
                                                    give -- which is most of them,
                                                    since a link is optional and the
                                                    box says so. */}
                                                <div className="business-channel-links">
                                                    <NumberedListInput
                                                        label={"Links for Channel " + number}
                                                        placeholder="Links (optional)"
                                                        items={channel.links}
                                                        disabled={disabled}
                                                        onChange={(items) => change({ links: items })}
                                                    />
                                                </div>

                                            </td>

                                            {/* ONE DROPDOWN PER OFFERING, with
                                                the small + and × that add and
                                                take one away. A cell that holds
                                                several values grows a line at a
                                                time, and every line is the same
                                                control. */}
                                            <td rowSpan={span} className="business-channel-cell">
                                                {offeringOptions.length === 0
                                                    ? (
                                                        <BusinessEmpty>
                                                            Add an Offering to this Segment on
                                                            the Foundation page.
                                                        </BusinessEmpty>
                                                    )
                                                    : offeringRows.map((offeringId, index) => (

                                                        <div
                                                            className="business-channel-pick"
                                                            key={offeringId || "unchosen"}
                                                        >

                                                            <OptionPicker
                                                                label={
                                                                    "Offering " + (index + 1) +
                                                                    " for Channel " + number
                                                                }
                                                                placeholder="Select offerings"
                                                                /* Everything still free,
                                                                   plus this row's own: an
                                                                   Offering cannot be
                                                                   carried twice by one
                                                                   channel.

                                                                   ALL leads, for the
                                                                   channel that carries
                                                                   the lot -- one choice
                                                                   instead of five, and it
                                                                   stays true as Page 1
                                                                   gains more. */
                                                                options={[
                                                                    ALL_OFFERINGS_LABEL,
                                                                    ...offeringOptions
                                                                        .filter(option =>
                                                                            option.id === offeringId ||
                                                                            !channel.offerings.includes(option.id)
                                                                        )
                                                                        .map(option => option.label)
                                                                ]}
                                                                disabled={disabled}
                                                                value={
                                                                    offeringId === BUSINESS_CHANNEL_ALL_OFFERINGS
                                                                        ? ALL_OFFERINGS_LABEL
                                                                        : offeringOptions.find(
                                                                            option => option.id === offeringId
                                                                        )?.label ?? ""
                                                                }
                                                                onChange={(next) => {

                                                                    if (next === ALL_OFFERINGS_LABEL) {
                                                                        change({
                                                                            offerings: [
                                                                                BUSINESS_CHANNEL_ALL_OFFERINGS
                                                                            ]
                                                                        });
                                                                        return;
                                                                    }

                                                                    const picked = offeringOptions.find(
                                                                        option => option.label === next
                                                                    )?.id ?? "";

                                                                    change({
                                                                        offerings: carriesAll ||
                                                                            channel.offerings.length === 0
                                                                            ? [picked]
                                                                            : channel.offerings.map(
                                                                                (candidate, at) =>
                                                                                    at === index ? picked : candidate
                                                                            )
                                                                    });

                                                                }}
                                                            />

                                                            {/* Stacked, not side by side:
                                                                two buttons in a row cost
                                                                a column its width, and
                                                                width is what this table
                                                                has least of. */}
                                                            <div className="business-channel-steps">

                                                            {channel.offerings.length > 0 && (
                                                                <BusinessStep
                                                                    kind="remove"
                                                                    what="Offering"
                                                                    disabled={disabled}
                                                                    onClick={() => change({
                                                                        offerings: channel.offerings.filter(
                                                                            (_candidate, at) => at !== index
                                                                        )
                                                                    })}
                                                                />
                                                            )}

                                                            </div>

                                                            {/* HIDDEN, not disabled,
                                                                when there is nothing
                                                                left to add: a control
                                                                that cannot be used is
                                                                a control asking to be
                                                                tried.
                                                                The add goes on its own line under the last pick,
                                                                as the app's labelled add button (BusinessStep). */}
                                                            {index === offeringRows.length - 1 &&
                                                                !carriesAll &&
                                                                channel.offerings.length > 0 &&
                                                                channel.offerings.length <
                                                                    offeringOptions.length && (
                                                                <BusinessStep
                                                                    kind="add"
                                                                    what="Offering"
                                                                    disabled={disabled}
                                                                    onClick={() => {

                                                                        const free = offeringOptions.find(
                                                                            option => !channel.offerings
                                                                                .includes(option.id)
                                                                        );

                                                                        if (free) {
                                                                            change({
                                                                                offerings: [
                                                                                    ...channel.offerings,
                                                                                    free.id
                                                                                ]
                                                                            });
                                                                        }

                                                                    }}
                                                                />
                                                            )}

                                                        </div>

                                                    ))}
                                            </td>

                                        </>
                                    );

                                    return (
                                        <Fragment key={channel.id}>

                                            {stageRows.map((stageId, index) => (

                                                <tr key={channel.id + "-" + (stageId || "unchosen")}>

                                                    {index === 0 && channelCells}

                                                    <td className="business-channel-cell">

                                                        <div className="business-channel-pick">

                                                            {/* Every stage still free,
                                                                plus this row's own: a
                                                                channel cannot be used
                                                                twice at the same stage,
                                                                and its actions are
                                                                filed by stage. */}
                                                            <OptionPicker
                                                                label={
                                                                    "Journey Stage " +
                                                                    (index + 1) +
                                                                    " for Channel " + number
                                                                }
                                                                placeholder="Select a stage"
                                                                /* Narrowed by what a
                                                                   channel of this kind
                                                                   is plausibly used
                                                                   for, then by what
                                                                   this channel already
                                                                   uses. */
                                                                options={stageOptionsFor(
                                                                    channel.category, channel
                                                                )
                                                                    .filter(stage =>
                                                                        stage.id === stageId ||
                                                                        !channel.stages.includes(stage.id)
                                                                    )
                                                                    .map(stage => stage.label)}
                                                                disabled={disabled}
                                                                value={STAGE_LABELS[stageId] ?? ""}
                                                                onChange={(next) => {

                                                                    const picked = BUSINESS_JOURNEY_STAGES
                                                                        .find(stage => stage.label === next)
                                                                        ?.id ?? "";

                                                                    change({
                                                                        stages: channel.stages.length === 0
                                                                            ? [picked]
                                                                            : channel.stages.map(
                                                                                (candidate, at) =>
                                                                                    at === index ? picked : candidate
                                                                            )
                                                                    });

                                                                }}
                                                            />

                                                            <div className="business-channel-steps">

                                                            {channel.stages.length > 0 && (
                                                                <BusinessStep
                                                                    kind="remove"
                                                                    what="Journey Stage"
                                                                    disabled={disabled}
                                                                    onClick={() => change({
                                                                        stages: channel.stages.filter(
                                                                            (_candidate, at) => at !== index
                                                                        )
                                                                    })}
                                                                />
                                                            )}


                                                            </div>

                                                            {/* The add goes on its own line under the
                                                                last pick, as the app's labelled add
                                                                button (BusinessStep). */}
                                                            {index === stageRows.length - 1 &&
                                                                channel.stages.length > 0 &&
                                                                channel.stages.length <
                                                                    stageOptionsFor(
                                                                        channel.category, channel
                                                                    ).length && (
                                                                <BusinessStep
                                                                    kind="add"
                                                                    what="Journey Stage"
                                                                    disabled={disabled}
                                                                    onClick={() => {

                                                                        const free = stageOptionsFor(
                                                                            channel.category, channel
                                                                        )
                                                                            .find(stage =>
                                                                                !channel.stages.includes(stage.id)
                                                                            );

                                                                        if (free) {
                                                                            change({
                                                                                stages: [
                                                                                    ...channel.stages,
                                                                                    free.id
                                                                                ]
                                                                            });
                                                                        }

                                                                    }}
                                                                />
                                                            )}

                                                        </div>

                                                    </td>

                                                    <td className="business-channel-cell">
                                                        {/* Nothing to record until the
                                                            stage beside it is chosen --
                                                            an Action belongs to a stage,
                                                            and the dropdown says so. More
                                                            than one is allowed once it
                                                            is: a stage can involve
                                                            several things done through
                                                            the same channel. */}
                                                        {stageId.length > 0 && (
                                                            <NumberedListInput
                                                                label={
                                                                    (STAGE_LABELS[stageId] ?? "Stage") +
                                                                    " actions for Channel " + number
                                                                }
                                                                items={channel.actions[stageId] ?? [""]}
                                                                disabled={disabled}
                                                                onChange={(items) => change({
                                                                    actions: {
                                                                        ...channel.actions,
                                                                        [stageId]: items
                                                                    }
                                                                })}
                                                            />
                                                        )}
                                                    </td>

                                                </tr>

                                            ))}

                                        </Fragment>
                                    );

                                })}

                                {/* ANOTHER CHANNEL UNDER THIS
                                    CATEGORY, without going back
                                    through choosing one. The button
                                    below the table starts a new
                                    category; this one adds to the
                                    category it sits in. */}
                                {group.label.trim().length > 0 && categoryOpen && (
                                    <tr>
                                        <td className="business-channel-cell">
                                            <BusinessAddButton
                                                label="Channel"
                                                disabled={disabled}
                                                onAdd={() => updateSegment(segment.id, {
                                                    channels: [
                                                        ...answers.channels,
                                                        {
                                                            ...createBusinessChannel(),
                                                            category: group.label
                                                        }
                                                    ]
                                                })}
                                            />
                                        </td>
                                        <td colSpan={3} className="business-channel-cell" />
                                    </tr>
                                )}

                            </tbody>

                          );

                        })}

                    </table>

                </div>

                {/* A NEW CATEGORY, which is what this button now
                    makes: it adds a channel with no category yet, so
                    the table grows a category row for it to be filed
                    under. Adding another channel to a category that
                    already exists is done from inside that category,
                    where the button that does it sits. */}
                <BusinessAddButton
                    label="Channel Category"
                    disabled={disabled}
                    onAdd={() => {

                        const channel = createBusinessChannel();

                        updateSegment(segment.id, {
                            channels: [...answers.channels, channel]
                        });

                        // Opened, so it can be filled in straight away.
                        folds.expand(channelCategoryFoldKey(segment.id, channel.id));

                    }}
                />

            </>
        );

    }

    /* ---------- 2. Customer Relationship ---------- */

    /**
     * The Offerings this Segment's Channels table records ANY
     * interaction for -- see relationshipsFor's own `offeringIds`,
     * which this is factored out of. Read independently of whether
     * "2. Customer Relationship" is open, so the section head's
     * "Expand all" can be given the right ids whether or not its
     * body is currently drawn.
     */
    function engagedOfferingIds(segment: BusinessCustomerSegmentValue): string[] {

        const interactions = businessRelationshipInteractions(
            segmentOf(segment.id).channels, segment.offerings, segment.offerings
        );

        const ids: string[] = [];

        for (const interaction of interactions) {
            if (!ids.includes(interaction.offeringId)) {
                ids.push(interaction.offeringId);
            }
        }

        return ids;

    }

    /**
     * The Customer Relationships table.
     *
     * FIVE COLUMNS, the shape the worked example draws:
     *
     *   Profile | Relationship Type / Purpose | Offering
     *           | Journey Stage / Channel | Approach
     *
     * ITS ROWS ARE NOT CHOSEN -- THEY ARE READ OFF 1. CUSTOMER
     * CHANNEL. That table already says which Offerings each channel
     * carries and at which stages it is used, and every one of
     * those is an interaction the organisation has. Choosing them
     * again here was asking the same question twice and inviting
     * the two answers to disagree.
     *
     * So the Offering and the Journey Stage / Channel columns are
     * read-only: add a stage to a channel above and the row appears
     * here; take it away and the row goes. What is asked here is
     * only what the Channels table cannot know -- the Relationship
     * Type, why it is maintained, and how each interaction is
     * conducted.
     *
     * Three things span what hangs off them: a Profile over all its
     * relationship types, a Type over all its interactions, an
     * Offering over the interactions that concern it. ONE ROW IS
     * ONE INTERACTION.
     *
     * The GOAL rides in the Approach cell rather than taking a
     * sixth column. It belongs to the same interaction, and it is
     * optional.
     */
    function relationshipsFor(segment: BusinessCustomerSegmentValue) {

        const answers = segmentOf(segment.id);

        const offeringName = (offeringId: string) => {

            const index = segment.offerings.findIndex(
                offering => offering.id === offeringId
            );

            const offering = segment.offerings[index];

            return offering?.name.trim().length
                ? offering.name.trim()
                : "Offering " + (index + 1) + ", not named yet";

        };

        const channelName = (channelId: string) =>
            channelChoices(answers.channels)
                .find(choice => choice.id === channelId)?.label ?? "";

        /**
         * Which Profiles an Offering is sold to, read off Page 1:
         * an Offering answers a Profile's Functional needs, or it
         * does not.
         *
         * Listed under the Offering rather than asked about. The
         * relationship is kept ABOUT THE OFFERING now -- three
         * Profiles buying the same thing are not three
         * relationships with it -- so who buys it is reference, the
         * way the channels that carry it are.
         */
        const profilesFor = (offeringId: string) =>
            segment.profiles.filter(profile =>
                businessProfileOfferings(profile, segment.offerings)
                    .some(offering => offering.id === offeringId)
            );

        /**
         * Every interaction the Channels table records for this
         * Segment: which channels carry which Offering, and at
         * which journey stages.
         */
        const interactions = businessRelationshipInteractions(
            answers.channels, segment.offerings, segment.offerings
        );

        /* The Offerings with any interaction at all, in the order
           the interaction list gives -- which is Page 1's own
           Offering order. */
        const offeringIds = engagedOfferingIds(segment);

        if (segment.offerings.length === 0) {
            return (
                <BusinessEmpty>
                    Add an Offering to this Segment on the Foundation page,
                    then describe the relationship you keep about it here.
                </BusinessEmpty>
            );
        }

        if (offeringIds.length === 0) {
            return (
                <BusinessEmpty>
                    Give a Channel in 1. Customer Channel one of this Segment&rsquo;s
                    Offerings and a Journey Stage, and the interactions appear here.
                </BusinessEmpty>
            );
        }

        const rowsOf = (offeringId: string) =>
            interactions.filter(entry => entry.offeringId === offeringId);

        const typesOf = (offeringId: string) => {

            const kept = offeringRelationshipsOf(segment.id, offeringId).types;

            return kept.length > 0 ? kept : [""];

        };

        /* THREE LEVELS FOLD on this table -- Offering, relationship
           type, journey stage -- and each key carries everything
           above it, so the same stage under two types closes
           separately. */
        const offeringFoldKey = (offeringId: string) =>
            "relationship-offering-" + offeringId;

        const offeringOpen = (offeringId: string) =>
            folds.isOpen(offeringFoldKey(offeringId));

        const typeFoldKey = (offeringId: string, typeId: string) =>
            "relationship-type-" + offeringId + "-" + (typeId || "unchosen");

        const typeOpen = (offeringId: string, typeId: string) =>
            !collapsed.has(typeFoldKey(offeringId, typeId));

        const stageFoldKey = (
            offeringId: string, typeId: string, stageId: string
        ) =>
            "relationship-stage-" + offeringId + "-" +
            (typeId || "unchosen") + "-" + stageId;

        const stageOpen = (
            offeringId: string, typeId: string, stageId: string
        ) => !collapsed.has(stageFoldKey(offeringId, typeId, stageId));

        /* HOW TALL A BLOCK IS, counted the way it is drawn. A folded
           level keeps one row and gives up everything under it, so
           every span above it has to shrink by the same amount or
           the table tears.

           A type open: one band row per stage, plus a row for each
           kind of channel under the stages still open. */
        const typeHeight = (offeringId: string, typeId: string) =>
            !typeOpen(offeringId, typeId)
                ? 1
                : rowsOf(offeringId).reduce(
                    (total, entry) => total + 1 + (
                        stageOpen(offeringId, typeId, entry.stageId)
                            ? entry.groups.length
                            : 0
                    ),
                    0
                );

        return (
            <div className="business-channel-table-wrap">

                <table className="business-channel-table business-relationship-table">

                    {/* Widths declared on the columns rather than on
                        the headings, because the Offering and the
                        journey stage are both bands spanning several
                        of them and a cell that spans cannot set a
                        width. */}
                    <colgroup>
                        <col className="business-relationship-col-type" />
                        <col className="business-relationship-col-channels" />
                        <col className="business-relationship-col-approach" />
                    </colgroup>

                    {/* NO HEAD ROW. The two headings belong UNDER the
                        Offering they describe, not once at the top of
                        a table that may run to a dozen Offerings --
                        what is answered here is answered about an
                        Offering, and the headings say so where the
                        answering starts. */}

                    {offeringIds.map((offeringId, offeringIndex) => {

                                    const offeringRows = rowsOf(offeringId);
                                    const typeRows = typesOf(offeringId);

                                    const kept = offeringRelationshipsOf(
                                        segment.id, offeringId
                                    );

                                    const offeringShown = offeringOpen(offeringId);

                                    /* WHICH CELLS SIT IN THE TABLE'S
                                       BOTTOM CORNERS, so they can be
                                       rounded. CSS cannot say it in a
                                       table of rowspans: the cell in
                                       the bottom-left may have started
                                       several rows higher up. Only the
                                       last Offering has any. */
                                    const lastOffering =
                                        offeringIndex === offeringIds.length - 1;

                                    const cornerLeft = lastOffering
                                        ? " business-relationship-corner-bl"
                                        : "";

                                    const cornerRight = lastOffering
                                        ? " business-relationship-corner-br"
                                        : "";

                                    /* WHAT PAGE 1 RECORDS ABOUT THIS
                                       OFFERING, behind the "i" beside
                                       its name -- the same note the
                                       Profile carries, for the same
                                       reason: the Approach is written
                                       about this thing, and what it is
                                       should be a click away rather
                                       than a scroll. */
                                    const offeringFacts = relativeInformationFor(
                                        SECTIONS.channels.offeringInformation,
                                        segment.offerings.find(
                                            entry => entry.id === offeringId
                                        )?.description ?? {}
                                    );

                                    /* THE OFFERING, read from the
                                       channel that carries it. Not
                                       chosen here -- and the thing the
                                       relationship is kept ABOUT, which
                                       is why it carries an arrow: one
                                       Offering can run to a dozen rows
                                       of its own. */
                                    const offeringHead = (
                                        <span className="business-engagement-reference-name-row">
                                            <FoldArrow
                                                open={offeringShown}
                                                label={offeringName(offeringId)}
                                                onToggle={() => folds.toggle(offeringFoldKey(offeringId))}
                                            />
                                            <span className="business-engagement-band-kind">
                                                {(offeringIndex + 1) + ". Offering -"}
                                            </span>
                                            <span className="business-engagement-derived">
                                                <InfoText text={offeringName(offeringId)}>
                                                    {offeringFacts.length > 0 && (
                                                        <InfoNote
                                                            label={offeringName(offeringId)}
                                                            points={offeringFacts.map(section => ({
                                                                title: section.label,
                                                                text: section.text
                                                            }))}
                                                            fullList
                                                            asReference
                                                        />
                                                    )}
                                                </InfoText>
                                            </span>
                                            {!offeringShown && (
                                                <span className="business-card-summary">
                                                    {summaryText(
                                                        kept.types.length
                                                            ? kept.types.length +
                                                                (kept.types.length === 1
                                                                    ? " relationship type"
                                                                    : " relationship types")
                                                            : ""
                                                    )}
                                                </span>
                                            )}
                                        </span>
                                    );

                                    /* WHO THIS OFFERING IS SOLD TO,
                                       read off Page 1 and listed under
                                       it: an Offering answers a
                                       Profile's Functional needs, or it
                                       does not.

                                       A DATA LIST, not an answer. The
                                       relationship is kept about the
                                       Offering, once, and three
                                       Profiles buying the same thing
                                       are not three relationships with
                                       it -- so the names are reference
                                       here, each with the "i" that
                                       opens what Page 1 records about
                                       them. */
                                    const served = profilesFor(offeringId);

                                    const profilesRow = (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="business-channel-cell business-channel-cell-derived business-relationship-profiles"
                                            >

                                                {/* ON ONE LINE WITH ITS LABEL.
                                                    Three names are a line, not a
                                                    list under a heading -- and
                                                    the row is reference, so it
                                                    should take one row. */}
                                                <span className="business-engagement-reference-label">
                                                    Customer Profiles
                                                </span>

                                                {served.length === 0
                                                    ? (
                                                        <BusinessEmpty>
                                                            No Customer Profile&rsquo;s Functional
                                                            Needs are answered by this Offering
                                                            yet. Tick them under it on the
                                                            Foundation page.
                                                        </BusinessEmpty>
                                                    )
                                                    : (
                                                        <ul className="business-relationship-profile-list">
                                                            {served.map((profile, index) => {

                                                                const facts = relativeInformationFor(
                                                                    SECTIONS.channels.profileInformation,
                                                                    profile.description
                                                                );

                                                                const shown = profile.name.trim() ||
                                                                    "Profile " + (index + 1);

                                                                return (
                                                                    <li key={profile.id}>
                                                                        {/* The link and its "i" as one run, so the
                                                                            row's own gap stays out of the "i"'s
                                                                            8px (see .info-note). */}
                                                                        <span className="business-engagement-reference-name-row">
                                                                            <span>
                                                                                {foundationLink(
                                                                                    profile.name, "Profile", profile.id
                                                                                )}
                                                                                {facts.length > 0 && (
                                                                                    <InfoNote
                                                                                        label={shown}
                                                                                        points={facts.map(section => ({
                                                                                            title: section.label,
                                                                                            text: section.text
                                                                                        }))}
                                                                                        fullList
                                                                                        asReference
                                                                                    />
                                                                                )}
                                                                            </span>
                                                                        </span>
                                                                    </li>
                                                                );

                                                            })}
                                                        </ul>
                                                    )}

                                            </td>
                                        </tr>
                                    );

                                    /* THE TWO HEADINGS, under the
                                       Offering they describe: what is
                                       kept about it, and how that is
                                       carried out.

                                       TWO, over three columns. The
                                       Interaction Context is not a
                                       third thing being answered --
                                       it is where the Engagement
                                       Strategy happens, read off the
                                       Channels table, so it sits under
                                       that heading rather than beside
                                       it. */
                                    const headings = (
                                        <tr>
                                            <th
                                                scope="col"
                                                className="business-channel-cell business-relationship-heading"
                                            >
                                                <span className="business-foundation-label-info">
                                                    <span>
                                                        <InfoText text="Relationship Type and Purpose">
                                                            <InfoNote
                                                                label="Relationship Type"
                                                                points={SECTIONS.relationships.types}
                                                                fullList
                                                            />
                                                        </InfoText>
                                                    </span>
                                                </span>
                                            </th>
                                            <th
                                                scope="colgroup"
                                                colSpan={2}
                                                className="business-channel-cell business-relationship-heading"
                                            >
                                                Engagement Strategy
                                            </th>
                                        </tr>
                                    );

                                    /* A BAND TOO, under the Profile's
                                       and one step in from it.

                                       The Relationship Types kept
                                       about it are what the first
                                       column now holds, each spanning
                                       its own rows -- which is what
                                       keeps a type beside the
                                       interactions written under it.
                                       An Offering written in the same
                                       column would have to share it
                                       with them, and one column cannot
                                       hold two cells over the same
                                       rows. */
                                    const offeringBand = (
                                        <tr>
                                            <th
                                                scope="rowgroup"
                                                colSpan={3}
                                                className="business-channel-cell business-engagement-band business-engagement-band-offering"
                                            >
                                                {offeringHead}
                                            </th>
                                        </tr>
                                    );

                                    if (!offeringShown) {
                                        return (
                                            <tbody key={offeringId} data-anchor={"relationship-offering-" + offeringId}>
                                                {offeringBand}

                                                {/* WHO IT IS SOLD TO, AND WHAT
                                                    IS KEPT ABOUT IT. Those two
                                                    are what a closed Offering is
                                                    worth showing: the stages and
                                                    what is written at them belong
                                                    to a relationship type, and a
                                                    type opens on its own arrow. */}
                                                <tr>

                                                    <td className={"business-channel-cell business-channel-cell-derived business-relationship-type-cell" + cornerLeft}>
                                                        {served.length === 0
                                                            ? (
                                                                <BusinessEmpty>
                                                                    No Customer Profile yet.
                                                                </BusinessEmpty>
                                                            )
                                                            : (
                                                                <ul className="business-engagement-channel-list">
                                                                    {served.map(profile => (
                                                                        <li key={profile.id}>
                                                                            {profile.name.trim() ||
                                                                                "Not named yet"}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                    </td>

                                                    <td
                                                        colSpan={2}
                                                        className={"business-channel-cell business-channel-cell-derived business-relationship-channels-cell" + cornerRight}
                                                    >
                                                        {kept.types.length === 0
                                                            ? (
                                                                <BusinessEmpty>
                                                                    No relationship type chosen yet.
                                                                </BusinessEmpty>
                                                            )
                                                            : (
                                                                <ul className="business-engagement-channel-list">
                                                                    {kept.types.map(typeId => (
                                                                        <li key={typeId}>
                                                                            {TYPE_LABELS[typeId] ?? typeId}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                    </td>

                                                </tr>

                                            </tbody>
                                        );
                                    }

                                    return (
                                        <tbody key={offeringId} data-anchor={"relationship-offering-" + offeringId}>

                                            {offeringBand}

                                            {profilesRow}

                                            {headings}

                                            {typeRows.map(typeId => {

                                                const type = typeOf(
                                                    segment.id, offeringId, typeId
                                                );

                                                const typeShown = typeOpen(
                                                    offeringId, typeId
                                                );

                                                /* No type cell rounds a corner: an
                                                   open Offering ends on its Demand &
                                                   Conversion row, which carries both. */

                                                /* THE RELATIONSHIP TYPE kept about THIS
                                                   Offering, and why -- the one thing on
                                                   the row that is chosen rather than
                                                   read, and the third of the four levels
                                                   that fold. */
                                                const typeCell = (
                                                    <td
                                                        rowSpan={typeHeight(
                                                            offeringId, typeId
                                                        )}
                                                        className="business-channel-cell business-relationship-type-cell"
                                                    >

                                                        <div className="business-channel-pick">

                                                            {/* THE ARROW BESIDE THE TYPE,
                                                                folding the journey stages
                                                                kept under it. One type can
                                                                run to five stages and a
                                                                dozen channels. */}
                                                            <FoldArrow
                                                                open={typeShown}
                                                                label={(typeId.length > 0 ? TYPE_LABELS[typeId] : "this relationship type") + " for " + offeringName(offeringId)}
                                                                onToggle={() => toggle(typeFoldKey(offeringId, typeId))}
                                                            />

                                                            <OptionPicker
                                                                label={
                                                                    "Relationship Type for " +
                                                                    offeringName(offeringId)
                                                                }
                                                                placeholder="Select a type"
                                                                options={BUSINESS_RELATIONSHIP_TYPES
                                                                    .filter(entryType =>
                                                                        entryType.id === typeId ||
                                                                        !kept.types.includes(entryType.id)
                                                                    )
                                                                    .map(entryType => entryType.label)}
                                                                disabled={disabled}
                                                                value={TYPE_LABELS[typeId] ?? ""}
                                                                onChange={(next) => {

                                                                    const picked =
                                                                        BUSINESS_RELATIONSHIP_TYPES
                                                                            .find(entryType =>
                                                                                entryType.label === next
                                                                            )?.id ?? "";

                                                                    updateOfferingRelationships(
                                                                        segment.id, offeringId,
                                                                        {
                                                                            types: kept.types.length === 0
                                                                                ? [picked]
                                                                                : kept.types.map(candidate =>
                                                                                    candidate === typeId
                                                                                        ? picked
                                                                                        : candidate
                                                                                )
                                                                        }
                                                                    );

                                                                }}
                                                            />

                                                            <div className="business-channel-steps">

                                                                {/* THE TYPE AND THE OFFERING
                                                                    ARE PART OF THE NAME. One
                                                                    Profile keeps several types
                                                                    about each of several
                                                                    Offerings, so "Remove this
                                                                    Relationship Type" alone
                                                                    would announce every one of
                                                                    these identically.

                                                                    The Add beside it needs
                                                                    only the Offering: it adds
                                                                    a type rather than another
                                                                    of this one, and there is
                                                                    one of it per Offering. */}
                                                                {kept.types.length > 0 && (
                                                                    <BusinessStep
                                                                        kind="remove"
                                                                        what={
                                                                            (typeId.length > 0
                                                                                ? TYPE_LABELS[typeId] + " "
                                                                                : "") +
                                                                            "Relationship Type for " +
                                                                            offeringName(offeringId)
                                                                        }
                                                                        disabled={disabled}
                                                                        onClick={() => updateOfferingRelationships(
                                                                            segment.id, offeringId,
                                                                            {
                                                                                types: kept.types.filter(
                                                                                    candidate => candidate !== typeId
                                                                                )
                                                                            }
                                                                        )}
                                                                    />
                                                                )}

                                                            </div>

                                                            {/* WHATEVER IS KEPT, INCLUDING
                                                                NOTHING. Removing the last
                                                                relationship type used to
                                                                take the Add away with it,
                                                                leaving a row that could
                                                                only be answered from the
                                                                dropdown and never grown
                                                                again -- the one state the
                                                                minus could get the table
                                                                into and not out of.
                                                                The add goes on its own line under the last pick,
                                                                as the app's labelled add button (BusinessStep). */}
                                                                {typeId === typeRows[typeRows.length - 1] &&
                                                                    kept.types.length <
                                                                        BUSINESS_RELATIONSHIP_TYPES.length && (
                                                                    <BusinessStep
                                                                        kind="add"
                                                                        what={
                                                                            "Relationship Type for " +
                                                                            offeringName(offeringId)
                                                                        }
                                                                        label="Relationship Type"
                                                                        disabled={disabled}
                                                                        onClick={() => {

                                                                            const free =
                                                                                BUSINESS_RELATIONSHIP_TYPES
                                                                                    .find(entryType =>
                                                                                        !kept.types.includes(entryType.id)
                                                                                    );

                                                                            if (free) {
                                                                                updateOfferingRelationships(
                                                                                    segment.id, offeringId,
                                                                                    { types: [...kept.types, free.id] }
                                                                                );
                                                                            }

                                                                        }}
                                                                    />
                                                                )}

                                                        </div>

                                                        {/* UNDER THE TYPE, NOT UNDER ITS
                                                            ARROW. The Purpose belongs to
                                                            the relationship type chosen
                                                            above it, so it starts where
                                                            that picker starts -- past the
                                                            arrow that folds them both. */}
                                                        {typeId.length > 0 && (
                                                            <div className="business-relationship-purpose">
                                                            <BusinessNote
                                                                label="Purpose"
                                                                ariaLabel={
                                                                    "Purpose of " +
                                                                    TYPE_LABELS[typeId] +
                                                                    " for " +
                                                                    offeringName(offeringId)
                                                                }
                                                                info={SECTIONS.relationships.purpose}
                                                                disabled={disabled}
                                                                value={type.purpose}
                                                                onChange={(next) => updateType(
                                                                    segment.id,
                                                                    offeringId, typeId,
                                                                    { purpose: next }
                                                                )}
                                                            />
                                                            </div>
                                                        )}

                                                    </td>
                                                );

                                                /* A FOLDED TYPE KEEPS ITS OWN CELL --
                                                   the type is still chosen and its
                                                   Purpose still written -- and gives
                                                   up the stages under it. */
                                                if (!typeShown) {
                                                    return (
                                                        <tr
                                                            key={offeringId + "-" +
                                                                (typeId || "unchosen")}
                                                        >

                                                            {typeCell}

                                                            {/* THE STRATEGY ITSELF,
                                                                STILL READABLE. A
                                                                folded type gives up
                                                                its channels and its
                                                                Goals -- where an
                                                                interaction happens
                                                                is not what anyone
                                                                closes a type to
                                                                skim -- and keeps
                                                                the journey and what
                                                                is done at each step
                                                                of it, which is the
                                                                answer itself. */}
                                                            <td
                                                                colSpan={2}
                                                                className="business-channel-cell business-channel-cell-derived"
                                                            >
                                                                {offeringRows.length === 0
                                                                    ? (
                                                                        <BusinessEmpty>
                                                                            No journey stage recorded yet.
                                                                        </BusinessEmpty>
                                                                    )
                                                                    : (
                                                                        <ul className="business-engagement-folded-stages">
                                                                            {offeringRows.map(entry => {

                                                                                const written = interactionOf(
                                                                                    segment.id, offeringId, typeId,
                                                                                    entry.key, entry.legacyKeys
                                                                                ).approach.trim();

                                                                                return (
                                                                                    <li key={entry.key}>
                                                                                        <span className="business-engagement-reference-label">
                                                                                            {STAGE_LABELS[entry.stageId]}
                                                                                        </span>
                                                                                        <p className="business-engagement-reference-text">
                                                                                            {written.length > 0
                                                                                                ? written
                                                                                                : "No approach written yet."}
                                                                                        </p>
                                                                                    </li>
                                                                                );

                                                                            })}
                                                                        </ul>
                                                                    )}
                                                            </td>

                                                        </tr>
                                                    );
                                                }

                                                return (
                                                    <Fragment
                                                        key={offeringId + "-" + (typeId || "unchosen")}
                                                    >

                                                        {offeringRows.map((interaction, index) => {

                                                            const answersFor = interactionOf(
                                                                segment.id,
                                                                offeringId, typeId, interaction.key,
                                                                interaction.legacyKeys
                                                            );

                                                            /* THE OFFERING AND THE
                                                               RELATIONSHIP TYPE ARE PART OF
                                                               THE NAME. The same stage is
                                                               written once per type kept
                                                               about each Offering, and every
                                                               one of those is its own
                                                               Approach -- the stage alone
                                                               would announce several
                                                               identically. */
                                                            const about =
                                                                (STAGE_LABELS[interaction.stageId] ?? "") +
                                                                ", " + offeringName(offeringId) +
                                                                (typeId.length > 0
                                                                    ? ", " + TYPE_LABELS[typeId]
                                                                    : "");

                                                            const stageShown = stageOpen(
                                                                offeringId, typeId,
                                                                interaction.stageId
                                                            );

                                                            return (
                                                                <Fragment
                                                                    key={interaction.key + "-" +
                                                                        (typeId || "t")}
                                                                >

                                                                    {/* 4a. THE JOURNEY STAGE,
                                                                        WRITTEN ABOVE the ways
                                                                        it happens rather than
                                                                        beside them. A band
                                                                        across the Interaction
                                                                        Context and its
                                                                        Approach: the reader
                                                                        meets "Discovery", then
                                                                        every kind of channel
                                                                        it happens through.

                                                                        It carries the Offering
                                                                        and the Relationship
                                                                        Type when this is the
                                                                        first row of their
                                                                        block, since the band is
                                                                        now that first row. */}
                                                                    <tr>

                                                                            {index === 0 && typeCell}

                                                                            <th
                                                                                scope="rowgroup"
                                                                                colSpan={2}
                                                                                className="business-channel-cell business-engagement-band"
                                                                            >

                                                                                {/* THE ARROW BESIDE
                                                                                    THE STAGE, the
                                                                                    same one a
                                                                                    Profile carries
                                                                                    and for the same
                                                                                    reason: a stage
                                                                                    can run to
                                                                                    several kinds of
                                                                                    channel, and a
                                                                                    reader working on
                                                                                    one journey stage
                                                                                    does not need the
                                                                                    others
                                                                                    underfoot. */}
                                                                                <span className="business-engagement-reference-name-row">
                                                                                    <FoldArrow
                                                                                        open={stageShown}
                                                                                        label={about}
                                                                                        onToggle={() => toggle(stageFoldKey(offeringId, typeId, interaction.stageId))}
                                                                                    />
                                                                                    <span>
                                                                                        {STAGE_LABELS[interaction.stageId]}
                                                                                    </span>
                                                                                </span>

                                                                            </th>

                                                                    </tr>

                                                                    {stageShown &&
                                                                        interaction.groups.map((group, groupIndex) => (
                                                                        <tr
                                                                            key={group.category ||
                                                                                "uncategorised"}
                                                                        >

                                                                            {/* 4b. WHERE IT HAPPENS:
                                                                                one kind of channel,
                                                                                and every channel of
                                                                                that kind used at this
                                                                                stage, as a list.

                                                                                The kinds come in the
                                                                                page's own order --
                                                                                Social Media before
                                                                                Website -- however the
                                                                                Channels table was
                                                                                filled in.

                                                                                NOT the Action. What is
                                                                                done through the
                                                                                channel is the Channels
                                                                                table's answer; this
                                                                                column gives the
                                                                                setting the Approach is
                                                                                written for. */}
                                                                            <td className="business-channel-cell business-channel-cell-derived business-relationship-channels-cell">

                                                                                <span className="business-engagement-derived-second">
                                                                                    {group.category.trim().length
                                                                                        ? group.category
                                                                                        : "No category"}
                                                                                </span>

                                                                                <ul className="business-engagement-channel-list">
                                                                                    {group.channelIds.map(id => (
                                                                                        <li key={id}>
                                                                                            {channelName(id)}
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>

                                                                            </td>

                                                                            {/* 5. WHAT IT SHOULD
                                                                                ACHIEVE, then how it
                                                                                is conducted -- ONE
                                                                                GOAL AND ONE APPROACH
                                                                                FOR THE WHOLE STAGE,
                                                                                beside every way it
                                                                                happens.

                                                                                An organisation does
                                                                                not approach being
                                                                                discovered one way on
                                                                                social media and
                                                                                another on its own
                                                                                site: it has an
                                                                                approach to being
                                                                                discovered, and these
                                                                                are where it puts it
                                                                                into practice. */}
                                                                            {groupIndex === 0 && (
                                                                            <td
                                                                                rowSpan={interaction.groups.length}
                                                                                className="business-channel-cell"
                                                                            >

                                                                                {typeId.length === 0 ? null : (
                                                                                    <>

                                                                                        <div className="business-engagement-goal">

                                                                                            <span className="business-foundation-label-info">
                                                                                                <span className="business-engagement-reference-label">
                                                                                                    <InfoText text="Goal">
                                                                                                        <InfoNote
                                                                                                            label="Goal"
                                                                                                            points={SECTIONS.relationships.goals}
                                                                                                            fullList
                                                                                                        />
                                                                                                    </InfoText>
                                                                                                </span>
                                                                                            </span>

                                                                                            <div className="business-engagement-goal-ticks">
                                                                                                <BusinessTicks
                                                                                                    name={"Goals for " + about}
                                                                                                    options={GOAL_OPTIONS}
                                                                                                    chosen={answersFor.goals}
                                                                                                    disabled={disabled}
                                                                                                    onChange={(next) => updateInteraction(
                                                                                                        segment.id,
                                                                                                        offeringId, typeId,
                                                                                                        interaction.key, interaction.legacyKeys,
                                                                                                        { goals: next }
                                                                                                    )}
                                                                                                />
                                                                                            </div>

                                                                                        </div>

                                                                                        {/* NAMED ABOVE THE BOX,
                                                                                            the way the Goal
                                                                                            above it is. The
                                                                                            column is called
                                                                                            Engagement Strategy
                                                                                            and holds two
                                                                                            answers, so neither
                                                                                            can take the
                                                                                            column's own name
                                                                                            for its label. */}
                                                                                        <span className="business-foundation-label-info">
                                                                                            <span className="business-engagement-reference-label">
                                                                                                <InfoText text="Approach">
                                                                                                    <InfoNote
                                                                                                        label="Approach"
                                                                                                        points={SECTIONS.relationships.approach}
                                                                                                        fullList
                                                                                                    />
                                                                                                </InfoText>
                                                                                            </span>
                                                                                        </span>

                                                                                        <StrategyTextArea
                                                                                            className="interview-input business-foundation-note"
                                                                                            ariaLabel={"Approach for " + about}
                                                                                            disabled={disabled}
                                                                                            value={answersFor.approach}
                                                                                            onChange={(next) => updateInteraction(
                                                                                                segment.id, offeringId, typeId,
                                                                                                interaction.key, interaction.legacyKeys,
                                                                                                { approach: next }
                                                                                            )}
                                                                                        />

                                                                                    </>
                                                                                )}

                                                                            </td>
                                                                            )}

                                                                        </tr>
                                                                    ))}

                                                                </Fragment>
                                                            );

                                                        })}

                                                    </Fragment>
                                                );

                                            })}

                                            {/* DEMAND & CONVERSION, the last
                                                row of the Offering's card: how
                                                its customers come, and so how
                                                many sales to expect. It ends
                                                the table for the last
                                                Offering, so it rounds both
                                                bottom corners. */}
                                            <tr>
                                                <td
                                                    colSpan={3}
                                                    className={"business-channel-cell business-demand-cell" +
                                                        cornerLeft + cornerRight}
                                                >
                                                    {demandFor(
                                                        segment, offeringId,
                                                        offeringName(offeringId)
                                                    )}
                                                </td>
                                            </tr>

                                        </tbody>
                                    );

                                })}


                </table>

            </div>
        );

    }

    /* ---------- Demand & Conversion ---------- */

    /**
     * What is recorded about how one Offering's customers come, or an
     * empty answer. Keyed by the Offering alone: an Offering belongs to
     * one Segment, so its id is enough.
     */
    function demandOf(offeringId: string): DemandValue {
        return engagement.demand[offeringId] ?? createDemand();
    }

    /* The whole engagement is spread, so the Segments' channels and
       relationships are carried through every demand edit. */
    function updateDemand(offeringId: string, patch: Partial<DemandValue>) {
        onChange({
            ...engagement,
            demand: {
                ...engagement.demand,
                [offeringId]: { ...demandOf(offeringId), ...patch }
            }
        });
    }

    /**
     * The Demand & Conversion group under one Offering's relationship:
     * how the Offering is bought, the sources its customers come from
     * (each with a figure, or a calculation), the Expected Sales they
     * add up to, the channels that bring them and what it rests on.
     *
     * All of it is optional. With no source, Sustainability
     * asks for the Offering's volume directly.
     */
    function demandFor(
        segment: BusinessCustomerSegmentValue,
        offeringId: string,
        offeringLabel: string
    ) {

        const demand = demandOf(offeringId);

        const result = demandResult(demand);

        /* Folded with the same arrow as the page's sections; folded,
           its head still says what it gives. Unlike the structural
           sections, this starts CLOSED -- see useItemFolds. */
        const foldKey = "demand-" + offeringId;
        const open = folds.isOpen(foldKey);

        const channelOptions: BusinessTickOption[] = channelChoices(
            segmentOf(segment.id).channels
        );

        /* A client on a subscription stays rather than buys again:
           repeat customers are offered only for one-off sales. */
        const available = DEMAND_SOURCES.filter(type =>
            !(demand.recurring && type.oneOffOnly)
        );

        const perMonth = demand.recurring ? " new a month" : " a month";

        /* The folded figure's "i": the one the same figure carries
           open -- the steady level of active clients for a
           subscription, or the formula of the one CALCULATED source
           the sales come from. A sum of several sources, or an
           entered figure, has no single formula to show. */
        const countedSources = demand.sources.filter(source => {
            const type = DEMAND_SOURCES.find(entry => entry.id === source.type);
            const part = result.sources.find(entry => entry.id === source.id);
            return type !== undefined &&
                !(demand.recurring && type.oneOffOnly) &&
                part?.expected !== null && part?.expected !== undefined;
        });
        const onlySource = countedSources.length === 1 ? countedSources[0] : null;
        const onlyType = onlySource
            ? DEMAND_SOURCES.find(entry => entry.id === onlySource.type)
            : undefined;
        const foldedInfo: InfoPoint[] | undefined = result.recurring
            ? DEMAND_ACTIVE_CLIENTS_HELP
            : onlySource?.calculate && onlyType && onlyType.fields.length > 0
                ? DEMAND_SOURCE_FORMULA_HELP[onlyType.id]
                : undefined;

        function changeSource(sourceId: string, patch: Partial<DemandSource>) {
            updateDemand(offeringId, {
                sources: demand.sources.map(source =>
                    source.id === sourceId ? { ...source, ...patch } : source
                )
            });
        }

        function numberField(
            label: string,
            help: string,
            ariaLabel: string,
            placeholder: string,
            value: string,
            onValue: (next: string) => void,
            limits: NumberLimit
        ) {
            return (
                <BusinessField key={label} label={label} info={[help]}>
                    <input
                        type="text"
                        inputMode={numberInputMode(limits)}
                        className="interview-input business-demand-number"
                        aria-label={ariaLabel}
                        placeholder={placeholder}
                        disabled={disabled}
                        value={value}
                        onChange={(event) => onValue(limitedNumberText(event.target.value, value, limits))}
                    />
                </BusinessField>
            );
        }

        function sourceCard(source: DemandSource, index: number) {

            const type = DEMAND_SOURCES.find(entry => entry.id === source.type);
            const what = "customer source " + (index + 1) + " for " + offeringLabel;
            const calculated = source.calculate && (type?.fields.length ?? 0) > 0;
            const part = result.sources.find(entry => entry.id === source.id);
            const excluded = demand.recurring && type?.oneOffOnly === true;

            const counted = !excluded && part?.expected !== null && part?.expected !== undefined;

            /* Why a source is not counted, when it needs saying. */
            const note = excluded
                ? "Not counted: a client who buys every month stays rather than buying again."
                : !counted && type?.id === "repeat" && calculated
                    ? "Repeat purchases come from the customers the other sources bring: complete one of them first."
                    : "";

            return (
                <div className="business-demand-source" key={source.id}>

                    {/* THE CARD'S HEAD: which source, and what it gives. */}
                    <div className="business-demand-source-head">
                        <span className="business-demand-source-title">
                            {"Source " + (index + 1)}
                        </span>
                        {/* The figure and its "i" as ONE unit at the far
                            end, 12px before the × (see
                            .business-demand-figure) -- the "i" never
                            splits the space between them. */}
                        {type && (
                            <span className="business-demand-figure">
                                <span className={"business-demand-pill" + (counted ? "" : " business-demand-pill-pending")}>
                                    {counted ? "About " + part!.expected + perMonth : "Not counted yet"}
                                </span>
                                {/* The formula behind a CALCULATED result,
                                    once it counts: an entered figure has
                                    none to show. */}
                                {counted && calculated && DEMAND_SOURCE_FORMULA_HELP[type.id] && (
                                    <InfoNote
                                        label={type.label + " result"}
                                        points={DEMAND_SOURCE_FORMULA_HELP[type.id]}
                                    />
                                )}
                            </span>
                        )}
                        <BusinessRemove
                            what={capitalized(what)}
                            disabled={disabled}
                            onRemove={() => updateDemand(offeringId, {
                                sources: demand.sources.filter(other => other.id !== source.id)
                            })}
                        />
                    </div>

                    {/* FOUR COLUMNS, labels above: the source and how it is
                        estimated, then its figure or its calculation. */}
                    <div className="business-demand-fields">

                        <BusinessField
                            label="Customer Source"
                            info={available.map(entry => ({ title: entry.label, text: entry.explanation }))}
                        >
                            <OptionPicker
                                label={capitalized(what)}
                                placeholder="Select"
                                options={available.map(entry => entry.label)}
                                disabled={disabled}
                                value={type?.label ?? ""}
                                /* The inputs are kept when the source
                                   changes: several share keys ("buy"). */
                                onChange={(next) => changeSource(source.id, {
                                    type: available.find(entry => entry.label === next)?.id ?? ""
                                })}
                            />
                        </BusinessField>

                        {type && type.fields.length > 0 && (
                            <BusinessField label="Estimated" info={DEMAND_CALCULATION_HELP}>
                                <OptionPicker
                                    label={"How the sales are estimated, " + what}
                                    placeholder={DEMAND_BY_FIGURE}
                                    options={[DEMAND_BY_FIGURE, DEMAND_BY_CALCULATION]}
                                    disabled={disabled}
                                    value={source.calculate ? DEMAND_BY_CALCULATION : DEMAND_BY_FIGURE}
                                    onChange={(next) => changeSource(source.id, {
                                        calculate: next === DEMAND_BY_CALCULATION
                                    })}
                                />
                            </BusinessField>
                        )}

                        {type && !excluded && (
                            <>
                                {/* A calculation starts on its own line, so
                                    its inputs sit together. */}
                                {calculated && <span className="business-demand-break" aria-hidden="true" />}
                                {calculated
                                    ? type.fields.map(field => numberField(
                                        field.label,
                                        field.help,
                                        field.label + ", " + what,
                                        field.placeholder,
                                        source.inputs[field.key] ?? "",
                                        (next) => changeSource(source.id, {
                                            inputs: { ...source.inputs, [field.key]: next }
                                        }),
                                        field.kind === "percent" ? NUMBER_LIMITS.percent : DEMAND_COUNT_LIMITS[field.key] ?? NUMBER_LIMITS.volume
                                    ))
                                    : numberField(
                                        type.id === "repeat"
                                            ? "Repeat Sales / Month"
                                            : demand.recurring ? "New Clients / Month" : "Sales / Month",
                                        demand.recurring
                                            ? "New clients expected to join from this source in a normal month."
                                            : "Sales expected from this source in a normal month.",
                                        "Expected" + perMonth + ", " + what,
                                        "e.g. 1",
                                        source.estimate,
                                        (next) => changeSource(source.id, { estimate: next }),
                                        NUMBER_LIMITS.volume
                                    )}
                            </>
                        )}

                    </div>

                    {note && <p className="business-demand-source-note">{note}</p>}

                    {type && !excluded && (
                        <BusinessField
                            label="Basis"
                            info={["What this source's figure rests on: a test, an enquiry, a promise, past sales."]}
                        >
                            <StrategyTextArea
                                className="interview-input business-demand-basis"
                                ariaLabel={"Basis, " + what}
                                placeholder="e.g. 3 of 20 test messages led to a call"
                                disabled={disabled}
                                value={source.basis}
                                onChange={(next) => changeSource(source.id, { basis: next })}
                            />
                        </BusinessField>
                    )}

                </div>
            );

        }

        return (
            <div
                className="business-demand"
                data-anchor={"demand-" + offeringId}
            >

                <div className="business-demand-head">
                    <div className="business-demand-title-row">
                        <FoldArrow
                            open={open}
                            label={"Demand & Conversion for " + offeringLabel}
                            onToggle={() => folds.toggle(foldKey)}
                        />
                        <span className="field-group-title business-foundation-subhead business-demand-title">
                            Demand &amp; Conversion
                        </span>
                        {!open && result.expected !== null && (
                            <span className="business-demand-figure">
                                <span className="business-demand-pill">
                                    {result.recurring
                                        ? "Expected Sales: about " + result.expected + " active clients"
                                        : "Expected Sales: about " + result.expected + " a month"}
                                </span>
                                {foldedInfo && (
                                    <InfoNote label="Expected Sales" points={foldedInfo} />
                                )}
                            </span>
                        )}
                    </div>
                    {open && (
                        <p className="business-demand-purpose">
                            Where this Offering&rsquo;s customers come from, and so how
                            many sales to expect. One source with a figure is enough;
                            add more, or calculate them, as the business develops.
                        </p>
                    )}
                </div>

                {open && (<>

                <div className="business-demand-fields">
                    <BusinessField label="Customers Buy" info={DEMAND_BUYING_HELP}>
                        <OptionPicker
                            label={"How customers buy " + offeringLabel}
                            placeholder={DEMAND_BUY_ONCE}
                            options={[DEMAND_BUY_ONCE, DEMAND_BUY_MONTHLY]}
                            disabled={disabled}
                            value={demand.recurring ? DEMAND_BUY_MONTHLY : DEMAND_BUY_ONCE}
                            onChange={(next) => updateDemand(offeringId, {
                                recurring: next === DEMAND_BUY_MONTHLY
                            })}
                        />
                    </BusinessField>
                </div>

                <div className="business-demand-sources">
                    {demand.sources.map(sourceCard)}
                    {demand.sources.length === 0 && (
                        <BusinessEmpty>
                            No customer source yet.
                        </BusinessEmpty>
                    )}
                    <BusinessAddButton
                        label="Customer Source"
                        disabled={disabled}
                        onAdd={() => updateDemand(offeringId, {
                            sources: [...demand.sources, createDemandSource()]
                        })}
                    />
                </div>

                {demand.recurring && demand.sources.length > 0 && (
                    <div className="business-demand-fields">
                        {numberField(
                            "Cancel / Month (%)",
                            "The share of active clients who cancel each month. At 5%, a client stays about 20 months on average.",
                            "Share of clients cancelling a month, " + offeringLabel,
                            "e.g. 5",
                            demand.cancel,
                            (next) => updateDemand(offeringId, { cancel: next }),
                            NUMBER_LIMITS.cancelPercent
                        )}
                    </div>
                )}

                {demand.sources.length > 0 && (
                    <div
                        className="business-demand-result"
                        role="status"
                        aria-label={"Expected sales for " + offeringLabel}
                    >
                        {result.expected === null
                            ? (
                                <p className="business-demand-result-empty">
                                    {result.joining !== null
                                        ? "About " + result.joining + " new clients a month. Enter the share cancelling a month to see the active clients."
                                        : "Complete a source above to see the expected sales."}
                                </p>
                            )
                            : (
                                <>
                                    <p className="business-demand-result-main">
                                        {result.recurring
                                            ? (
                                                <>
                                                    <InfoText text={"Expected Sales: about " + result.expected + " active clients"}>
                                                        <InfoNote label="Active clients" points={DEMAND_ACTIVE_CLIENTS_HELP} />
                                                    </InfoText>
                                                    {result.monthsToNormal !== null && (
                                                        <InfoText
                                                            text={", reached in about " + result.monthsToNormal +
                                                                (result.monthsToNormal === 1 ? " month" : " months")}
                                                        >
                                                            <InfoNote label="Months to level" points={DEMAND_MONTHS_TO_NORMAL_HELP} />
                                                        </InfoText>
                                                    )}
                                                </>
                                            )
                                            : "Expected Sales: about " + result.expected + " a month"}
                                    </p>
                                    <ul className="business-demand-working">
                                        {result.sources.filter(part => part.expected !== null).map(part => (
                                            <li key={part.id}>{part.label}: {part.working}.</li>
                                        ))}
                                        {result.recurring && result.joining !== null && (
                                            <li>
                                                {result.sources.filter(part => part.expected !== null).length > 1 ? "Together about " : "About "}{result.joining} new clients a month; with {demand.cancel}% cancelling a month, they level off at about {result.expected} active clients.
                                            </li>
                                        )}
                                    </ul>
                                </>
                            )}
                    </div>
                )}

                <div className="business-demand-channels">
                    <span className="field-label business-foundation-label">
                        Channels That Bring Them
                    </span>
                    {channelOptions.length === 0
                        ? (
                            <BusinessEmpty>
                                No channel recorded for this Segment yet.
                            </BusinessEmpty>
                        )
                        : (
                            <div className="business-demand-ticks">
                                <BusinessTicks
                                    name={"Channels that bring customers for " + offeringLabel}
                                    options={channelOptions}
                                    /* Only ids still on the page: a channel
                                       removed above is no longer offered. */
                                    chosen={demand.channelIds.filter(id =>
                                        channelOptions.some(option => option.id === id)
                                    )}
                                    disabled={disabled}
                                    onChange={(next) => updateDemand(offeringId, {
                                        channelIds: next
                                    })}
                                />
                            </div>
                        )}
                </div>

                <BusinessField
                    label="Assumptions"
                    info={["Anything else the figures rest on, beyond each source's basis."]}
                >
                    <StrategyTextArea
                        className="interview-input business-foundation-note"
                        ariaLabel={"Demand assumptions for " + offeringLabel}
                        placeholder={DEMAND_ASSUMPTIONS_PLACEHOLDER}
                        disabled={disabled}
                        value={demand.assumptions}
                        onChange={(next) => updateDemand(offeringId, {
                            assumptions: next
                        })}
                    />
                </BusinessField>

                <p className="business-demand-footnote">
                    The Expected Sales are used for Delivery on Infrastructure &amp;
                    Capability and for this Offering&rsquo;s revenue on Financial
                    Sustainability.
                </p>

                </>)}

            </div>
        );

    }

    /* ---------- The page ---------- */

    /**
     * The two section headings and their guidance -- the same for
     * every Segment, which is why they sit above the process line
     * and outside the input cards.
     *
     * Numbered 1 and 2 on this page, as Page 1's four subsections
     * are numbered 1 to 4: these two are worked in order -- where
     * you reach the customer, then how you keep the relationship
     * going there.
     */
    const heads = [
        {
            number: 1,
            title: "Customer Channel",
            instructions: SECTIONS.channels.instructions
        },
        {
            number: 2,
            title: "Customer Relationship",
            instructions: SECTIONS.relationships.instructions
        }
    ];

    return (

        <div
            className="answer-columns business-foundation business-engagement"
            style={{ "--answer-column-count": 2 } as CSSProperties}
        >

            {/* Row 1: the two section titles. */}
            {heads.map(head => (
                <h3 className="answer-column-label" key={"title-" + head.number}>
                    <span className="answer-column-label-number">
                        {head.number + "."}
                    </span>
                    <span className="answer-column-label-text">{head.title}</span>
                </h3>
            ))}

            {/* Row 2: the guidance, above the line. */}
            {showInstructions && heads.map(head => (
                <div
                    className="answer-column-questions"
                    key={"questions-" + head.number}
                >
                    {head.instructions.map(line => (
                        <span
                            className="answer-question-line answer-question-line-bullet"
                            key={line}
                        >
                            {"• " + line}
                        </span>
                    ))}
                </div>
            ))}

            {/* Row 3: the process line, the boundary between what
                the page says and what it asks. */}
            {columnsDivider && (
                <div className="answer-columns-divider">
                    {columnsDivider}
                </div>
            )}

            {/* Row 4: ONE INPUT CARD PER SEGMENT, in the Segment's
                own colour -- Page 1's card, continued.

                Both sections are answered about a Segment, so a
                Segment is what a card holds: the Foundation it
                refers to, the channels that reach it, and the
                relationships kept with its Profiles. */}
            {segments.length === 0 ? (
                <div className="business-engagement-page-empty">
                    <BusinessEmpty>
                        Define a Customer Segment on the Foundation page first.
                        Everything on this page is answered about one.
                    </BusinessEmpty>
                </div>
            ) : segments.map((segment, segmentIndex) => {

                const key = "engagement-" + segment.id;

                const open = !collapsed.has(key);

                return (
                    <div
                        className="business-foundation-input business-foundation-card business-engagement-input"
                        key={segment.id}
                        data-anchor={"engagement-segment-" + segment.id}
                        /* The Segment's OWN colour, chosen on Page 1
                           and carried here: the same Segment is the
                           same colour on both pages, which is most
                           of what makes this read as the next page
                           rather than a different feature. */
                        style={{ "--strategy-theme-hue": segmentHue(segment) } as CSSProperties}
                    >

                        <div className="strategy-box-head business-foundation-input-head fold-card-head">

                            <FoldArrow
                                open={open}
                                label={"Segment " + (segmentIndex + 1)}
                                onToggle={() => toggle(key)}
                            />

                            {/* A Segment holds cards of other kinds, so it
                                says what it is (see CardNumber). */}
                            <CardNumber number={segmentIndex + 1} kind="Segment" />

                            {/* Page 1's name, shown. This page adds
                                no Segments and renames none. */}
                            <span className="strategy-name-static">
                                {segment.name.trim().length > 0
                                    ? segment.name
                                    : "Not named yet"}
                            </span>

                        </div>

                        {open && (
                            <>

                                {/* The reference header: what Page 1
                                    already says about this Segment,
                                    linked rather than re-asked. */}
                                <div className="business-engagement-reference">

                                    {/* An "Information / References"
                                        heading and its "i" sat above
                                        these three. Both are gone:
                                        three columns of linked names
                                        under the Segment's own head
                                        are plainly references, and a
                                        heading that says so is a line
                                        spent saying nothing. */}
                                    <div
                                        className="business-engagement-reference-columns"
                                        hidden={!referencesOpen(segment.id)}
                                    >

                                        {referenceColumn(
                                            "Customer Segment",
                                            "Segment",
                                            segmentQuestions,
                                            [{
                                                key: segment.id,
                                                name: segment.name,
                                                description: segment.description
                                            }]
                                        )}

                                        {referenceColumn(
                                            "Customer Profiles",
                                            "Profile",
                                            () => SECTIONS.channels.profileInformation,
                                            segment.profiles.map(profile => ({
                                                key: profile.id,
                                                name: profile.name,
                                                description: profile.description
                                            })),
                                            true
                                        )}

                                        {referenceColumn(
                                            "Offerings",
                                            "Offering",
                                            () => SECTIONS.channels.offeringInformation,
                                            segment.offerings.map(offering => ({
                                                key: offering.id,
                                                name: offering.name,
                                                description: offering.description
                                            })),
                                            true
                                        )}

                                    </div>

                                    {/* UNDER THE THING IT HIDES, the
                                        way Need Help? sits under the
                                        guidance it hides -- the same
                                        control, so it is the one
                                        already learned. A founder who
                                        knows their Segment by heart
                                        can put the whole reference
                                        away and answer. */}
                                    <button
                                        type="button"
                                        className="interview-help-toggle business-engagement-reference-toggle"
                                        aria-expanded={referencesOpen(segment.id)}
                                        onClick={() => folds.toggle(
                                            referencesFoldKey(segment.id)
                                        )}
                                    >
                                        {referencesOpen(segment.id)
                                            ? "Hide References"
                                            : "Show References"}
                                    </button>

                                </div>

                                {/* Each section folds away. Both of
                                    them run to a table, and a founder
                                    working on one has no use for the
                                    other underfoot. */}
                                {foldingSection(
                                    segment.id + "-channels",
                                    "1. Customer Channel",
                                    () => channelsFor(segment),
                                    0,
                                    <FoldAllToggle
                                        ids={channelCategoryFoldKeys(segment.id)}
                                        folds={folds}
                                        label="channel categories"
                                    />
                                )}

                                {foldingSection(
                                    segment.id + "-relationships",
                                    "2. Customer Relationship",
                                    () => relationshipsFor(segment),
                                    1,
                                    <FoldAllToggle
                                        ids={engagedOfferingIds(segment).map(
                                            offeringId => "relationship-offering-" + offeringId
                                        )}
                                        /* Cascades into each Offering's
                                           Demand & Conversion block. */
                                        nested={engagedOfferingIds(segment).map(
                                            offeringId => "demand-" + offeringId
                                        )}
                                        folds={folds}
                                        label="offerings"
                                    />
                                )}

                            </>
                        )}

                    </div>
                );

            })}

        </div>

    );

}
