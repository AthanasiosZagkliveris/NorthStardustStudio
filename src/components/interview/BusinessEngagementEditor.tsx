import { CSSProperties, FocusEvent, Fragment, ReactNode, useEffect, useMemo, useRef, useState } from "react";

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
    channelCategoryHelp,
    channelOptionHelp,
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
import { SOURCES } from "../../framework/engine/Sources.ts";

import {
    BusinessAddButton,
    BusinessEmpty,
    BusinessField,
    BusinessNote,
    OptionalField,
    OptionalNote,
    BusinessRemove,
    BusinessStep,
    BusinessTickOption,
    BusinessTicks,
    uniqueChoices
} from "./BusinessCardFields.tsx";
import { consumeKey } from "./consumeKey.ts";
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
import ChannelResources, { ActionPicker, ActionPickService, useLatestEngagement } from "./ChannelResources.tsx";
import { jumpTo } from "./jumpTo.ts";
import { rowActions, withChosenAction, withRowLines } from "../../framework/engine/ChannelActions.ts";
import {
    actionAtOrder,
    actionPlacements,
    actionRows,
    channelNamesOf,
    connectionPaint,
    markTint,
    orderAt,
    orderIn,
    parseOrderReference,
    resourceColours,
    sharedColours
} from "../../framework/engine/ActionOrder.ts";
import { journeyStageLabels } from "../../framework/engine/ChannelTableColumns.ts";
import { useChannelColumns } from "./useChannelColumns.ts";
import { type CostCard, actionResourceLinks, capabilityCards, costCardName } from "../../framework/engine/ChannelResources.ts";
import { type ActionIsolation, type ActionLit, IsolationNote, ResourceSymbol, SharedSymbol } from "./ActionMarkers.tsx";
import SectionTiles, { DialogHeading, OPEN_EVENT, type OpenRequest, type SectionTile } from "./SectionTiles.tsx";
import CardBoxes, { type CardBox } from "./CardBoxes.tsx";
import ChannelResourceTable from "./ChannelResourceTable.tsx";
import { buildChannelResourceTable } from "../../framework/engine/ChannelResourceTable.ts";
import { asBusinessCapabilityValue, equalOfferingShares } from "../../framework/engine/AnswerUtils.ts";
import { useItemFolds } from "./useItemFolds.ts";
import FoldArrow from "./FoldArrow.tsx";
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
const DEMAND_ACTIVE_CLIENTS_HELP: InfoPoint[] = [
    { title: "Formula", text: "Active clients = New clients a month ÷ Cancel%" },
    "At the steady level, clients joining each month equal clients leaving. Average client lifetime ≈ 1 ÷ Cancel%.",
    { title: "Based on", source: SOURCES.customerLifetime }
];

/** The months to reach that steady level, its "i" beside "months". */
const DEMAND_MONTHS_TO_NORMAL_HELP: InfoPoint[] = [
    { title: "Formula", text: "Months to 90% = ln(10) ÷ −ln(1 − Cancel%)" },
    "The gap to the steady level shrinks by the same share every month, so growth slows as you approach it.",
    { title: "Based on", source: SOURCES.geometricSeries }
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

interface BusinessEngagementEditorProps {

    /** The Customer Channel section as a tile for each channel (each opening its table in a dialog), as the other pages are drawn. */
    asTiles?: boolean;

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

    /**
     * 3. Infrastructure & Capability's answer: the Resource cards a
     * channel's resources are (ChannelResources.ts), read by id.
     */
    capability?: unknown;

    /** Writes 3. Infrastructure & Capability (a channel's resource made, renamed or taken away). */
    onChangeCapability?: (value: unknown) => void;

    /** Opens 3. Infrastructure & Capability, at a resource's card. */
    onOpenCapability?: OpenPage;

    /** The organisation's currency, for what a channel's resources cost. */
    currency?: string;

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
/**
 * What is NOT empty space while the Customer Channel table isolates something
 * (a click on it keeps the isolation): any control, a field, a line of an
 * action list (its number, text and symbols), a resource card or chip, a
 * floating list, tooltip or note, and a label.
 */
const CONTENT_OF_THE_TABLE = [
    "button", "a", "input", "textarea", "select", "label", "summary",
    "[role='button']", "[role='option']", "[role='listbox']", "[role='tooltip']", "[role='dialog']", "[role='status']", "[role='alert']",
    "[contenteditable='true']",
    ".numbered-list-row", ".business-channel-resource", ".notepad-chip", ".option-picker", ".app-tooltip", ".info-note"
].join(", ");

/** What the Demand & Conversion block is for, and where its result goes: its title's "i". */
const DEMAND_BLOCK_HELP: InfoPoint[] = [
    "Where this Offering\u2019s customers come from, and so how many sales to expect. One source with a figure is enough; add more, or calculate them, as the business develops.",
    "The Expected Sales are used for Delivery on Infrastructure & Capability and for this Offering\u2019s revenue on Sustainability."
];

/**
 * The narrowest width step that holds a number's largest value (its
 * digits, and its decimals with their point): XS to six characters
 * ("33.333"), Code to ten, S beyond.
 */
function numberStep(limits: NumberLimit): "xs" | "code" | "s" {
    const characters = String(Math.floor(limits.max)).length + ((limits.decimals ?? 0) > 0 ? (limits.decimals ?? 0) + 1 : 0);
    return characters <= 6 ? "xs" : characters <= 10 ? "code" : "s";
}

export default function BusinessEngagementEditor({

    value,

    onChange,

    disabled = false,

    columnsDivider,

    foundation,

    onOpenFoundation,

    capability,

    onChangeCapability,

    onOpenCapability,

    currency = "",

    asTiles = false

}: BusinessEngagementEditorProps) {

    const engagement = asBusinessEngagementValue(value);

    /* THE RESOURCE CARDS of 3. Infrastructure & Capability a channel's
       resources are, read by id (ChannelResources.ts). */
    const capabilityValue = useMemo(() => asBusinessCapabilityValue(capability), [capability]);
    const cards = useMemo(() => capabilityCards(capabilityValue), [capabilityValue]);
    useLatestEngagement(engagement);
    // The Journey Stage and Channel columns of the Customer Channel table fit their dropdowns.
    useChannelColumns();

    /** What pointing at an action or a resource lights (its twins; a resource's actions), and what
     *  the Customer Channel table isolates (a symbol's click: the others dim). View state: never saved. */
    const [lit, setLit] = useState<ActionLit>(null);
    const [isolated, setIsolated] = useState<ActionIsolation>(null);

    /** The symbol that isolated, to give the keyboard back to when everything is restored. */
    const isolator = useRef<HTMLElement | null>(null);

    /** Isolates (or, given null, restores everything). Starting an isolation takes the top of
     *  that Segment's Customer Channel section (its title row, with the note) to the top of the
     *  window, under the app header -- smoothly, unless motion is reduced; ending one scrolls nothing. */
    function toggleIsolation(next: ActionIsolation, symbol?: HTMLElement) {
        if (symbol) {
            isolator.current = symbol;
        }
        if (next) {
            // Nothing is created while the table is isolated: a "Link an action" click-to-pick in progress ends.
            ActionPickService.finish(null);
        }
        if (next && !isolated) {
            const head = document.querySelector<HTMLElement>(
                '[data-anchor~="engagement-section-' + CSS.escape(next.segmentId + "-channels") + '"] > .business-engagement-section-head'
            );
            if (head) {
                const header = document.querySelector<HTMLElement>(".app-header")?.getBoundingClientRect().height ?? 0;
                // The rows above the window that close would move the page under the scroll (scroll
                // anchoring): off while it settles, so the scroll lands where it was aimed.
                const root = document.documentElement;
                root.style.overflowAnchor = "none";
                window.setTimeout(() => { root.style.overflowAnchor = ""; }, 900);
                window.scrollTo({
                    top: Math.max(0, head.getBoundingClientRect().top + window.scrollY - header),
                    left: 0,
                    behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
                });
            }
        }
        setIsolated(next);
    }

    /** Restores everything (Escape, the title row's note) and puts the keyboard back on the symbol. */
    function clearIsolation() {
        setIsolated(null);
        const symbol = isolator.current;
        window.setTimeout(() => {
            if (symbol?.isConnected) {
                // The keyboard goes back to the symbol; the page does not move to it.
                symbol.focus({ preventScroll: true });
            }
        }, 0);
    }

    useEffect(() => {
        if (!isolated) {
            return;
        }
        const clear = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape" && !event.defaultPrevented) {
                // Escape is Back for the page (consumeKey): this press only restores the rows.
                consumeKey(event);
                clearIsolation();
            }
        };
        document.addEventListener("keydown", clear);
        // A click on EMPTY SPACE -- the page's background, a table's blank area, anywhere that is not a
        // control or a cell's content -- restores everything too. It must also have PRESSED on empty
        // space, so a drag that began in a text and ended outside it is not a click on empty space.
        let pressedOnEmpty = false;
        const emptySpace = (target: EventTarget | null) => target instanceof Element && target.closest(CONTENT_OF_THE_TABLE) === null;
        const press = (event: MouseEvent) => {
            pressedOnEmpty = event.button === 0 && emptySpace(event.target);
        };
        const click = (event: MouseEvent) => {
            if (pressedOnEmpty && !event.defaultPrevented && emptySpace(event.target)) {
                pressedOnEmpty = false;
                clearIsolation();
            }
        };
        document.addEventListener("mousedown", press, true);
        document.addEventListener("click", click);
        return () => {
            document.removeEventListener("keydown", clear);
            document.removeEventListener("mousedown", press, true);
            document.removeEventListener("click", click);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isolated]);

    /** Goes to an action's first line in the table, and puts the caret in it. */
    function openAction(segmentId: string, actionId: string) {
        const answers = engagement.segments.find(entry => entry.segmentId === segmentId);
        const channel = answers?.channels.find(candidate => Object.values(candidate.actionIds).some(ids => ids.includes(actionId)));
        if (!answers || !channel) {
            return;
        }
        const first = answers.channels.find(candidate => candidate.category === channel.category);
        if (asTiles) {
            // The channel's table is in its tile's dialog: open that first.
            document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segmentId, first?.id ?? channel.id), box: "open" } }));
            window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea[data-field-id="' + actionId + '"]')?.focus(), 700);
            return;
        }
        jumpTo(["channel-" + channel.id, "channel-category-" + (first?.id ?? channel.id), "engagement-segment-" + segmentId]);
        window.setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea[data-field-id="' + actionId + '"]')?.focus(), 400);
    }

    /**
     * A CHANNEL AND THE CARDS IT MADE SHARE ITS OFFERINGS: when the channel's Offerings change, the Resource, Partner or Provider cards it made in
     * Offering's Capability take the same ones ("All Offerings" is every Offering), with their shares started equal; on those cards the ticks are locked.
     */
    function offeringsOfMadeCards(channelId: string, offerings: readonly string[], every: readonly string[]) {
        const ids = offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) ? [...every] : [...offerings];
        const made = new Set(engagement.channelResources.filter(link => link.channelId === channelId).map(link => link.resourceId));
        if (!onChangeCapability || made.size === 0) {
            return;
        }
        const retag = <T extends { id: string; offeringIds: string[]; offeringShares: Record<string, string> }>(card: T): T => made.has(card.id) ? { ...card, offeringIds: ids, offeringShares: equalOfferingShares(ids) } : card;
        onChangeCapability({
            ...capabilityValue,
            offering: {
                ...capabilityValue.offering,
                resources: capabilityValue.offering.resources.map(retag),
                professionals: capabilityValue.offering.professionals.map(retag),
                providers: capabilityValue.offering.providers.map(retag)
            }
        });
    }

    /** A channel's resources, in its cell: its small cards, its summary and "+ Add resource". */
    function channelResources(answers: BusinessSegmentEngagementValue, channelId: string, what: string, heading?: string) {
        return (
            <ChannelResources
                heading={heading}
                segment={answers}
                channelId={channelId}
                what={what}
                engagement={engagement}
                capability={capabilityValue}
                cards={cards}
                currency={currency}
                disabled={disabled || !onChangeCapability}
                onWrite={(next) => {
                    if (next.capability) {
                        onChangeCapability?.(next.capability);
                    }
                    if (next.engagement) {
                        onChange(next.engagement);
                    }
                }}
                actionOrder={(actionId, channelId) => orderIn(actionPlacements(answers), actionId, channelId)}
                lit={lit}
                onLit={setLit}
                isolated={isolated}
                onIsolate={toggleIsolation}
                onOpenCard={onOpenCapability ? (card: CostCard) => onOpenCapability(card.anchors) : undefined}
                onOpenAction={(actionId) => openAction(answers.segmentId, actionId)}
            />
        );
    }

    /** Page 1's Segments, read for reference only. */
    const segments = businessFoundationSegments(foundation);

    /** The cards folded away, by key. Not stored with the answer:
     *  which cards a reader has closed is how they are looking at
     *  the page, not part of what they have said. */
    const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

    /**
     * Which reference headers, Offering reference entries, Channel
     * Categories, per-Offering relationship blocks, Demand &
     * Conversion blocks and Engagement Strategy Journey Stage bands are
     * open. These start CLOSED -- see useItemFolds -- unlike the
     * structural sections and per-type folds around them, which are on
     * `expanded` and start closed too (every fold arrow starts closed).
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

    function toggle(key: string) {
        setExpanded(current => toggledIn(current, key));
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

    /** The Customer Channel table is isolating something of this Segment. */
    function isolatingSegment(segmentId: string): boolean {
        return isolated !== null && isolated.segmentId === segmentId;
    }

    /** Whether an action is part of what is isolated (everything is, while nothing is). */
    function isRelated(segmentId: string, actionId: string): boolean {
        if (!isolated || isolated.segmentId !== segmentId) {
            return true;
        }
        if (isolated.kind === "action") {
            return isolated.actionId === actionId;
        }
        return actionResourceLinks(engagement, segmentId, actionId, cards)
            .some(entry => isolated.resourceIds.includes(entry.link.resourceId));
    }

    /** The note's names: the channels that hold the shared action, or the isolated resources, each once. */
    function isolationNames(): string[] {
        if (!isolated) {
            return [];
        }
        if (isolated.kind === "action") {
            const answers = segmentOf(isolated.segmentId);
            return channelNamesOf(answers, actionPlacements(answers), isolated.actionId);
        }
        return [...new Set(isolated.resourceIds
            .flatMap(id => cards.filter(card => card.id === id))
            .map(card => costCardName(card)))];
    }

    /** The stages of a channel that hold an isolated action. */
    function relatedStages(answers: BusinessSegmentEngagementValue, segmentId: string, channel: BusinessChannelValue): string[] {
        return channel.stages.filter(stage => rowActions(answers, channel.id, stage).ids
            .some(actionId => isRelated(segmentId, actionId)));
    }

    /**
     * A row's actions (a channel at one stage): the Segment's shared
     * actions it holds, one per line (ChannelActions.ts). Typing edits
     * the action in every row; choosing one of the Segment's others as
     * it is offered puts the same action on the line; the line's ×
     * takes it out of this row only. An action another row holds too
     * says where, quietly.
     */
    function channelActions(
        segmentId: string,
        answers: BusinessSegmentEngagementValue,
        channelId: string,
        stageId: string,
        label: string
    ) {
        const row = rowActions(answers, channelId, stageId);
        const items = row.texts.length > 0 ? row.texts : [""];
        // The table read down: each line's total order number, the shared actions' and the resources' colours.
        const placements = actionPlacements(answers);
        const sharedColour = sharedColours(placements);
        const resourceColour = resourceColours(engagement, segmentId);
        const others = answers.actions.filter(action => !row.ids.includes(action.id) && action.text.trim().length > 0);
        const write = (next: BusinessSegmentEngagementValue) =>
            updateSegment(segmentId, { channels: next.channels, actions: next.actions });
        return (
            <NumberedListInput
                label={label}
                items={items}
                lineIds={row.ids}
                /* Isolating: Enter opens no new line (nothing is created); a line's text stays editable. */
                maxItems={isolatingSegment(segmentId) ? items.length : undefined}
                disabled={disabled}
                suggestions={[...new Set(others.map(action => action.text))]}
                /* "#12" typed in a line offers action number 12 (its total order number) as the one
                   suggestion -- unless it is on this row already, has no words yet or there is no 12 --
                   and choosing it shares that very action here, as choosing any other suggestion does.
                   Anything else typed stays as typed. */
                reference={(typed) => {
                    const number = parseOrderReference(typed);
                    const id = number === undefined ? undefined : actionAtOrder(placements, number);
                    const action = id === undefined || row.ids.includes(id) ? undefined : answers.actions.find(entry => entry.id === id);
                    return action && action.text.trim().length > 0 ? action.text : undefined;
                }}
                dropEmptyOnBlur
                onAccept={(line, text, typed) => {
                    const number = parseOrderReference(typed);
                    const chosenId = number !== undefined
                        ? actionAtOrder(placements, number)
                        : others.find(action => action.text === text)?.id;
                    if (chosenId) {
                        write(withChosenAction(answers, channelId, stageId, line, chosenId));
                    }
                }}
                onChange={(next, origins) => write(withRowLines(answers, channelId, stageId, next, origins))}
                lineOrder={(line) => {
                    const order = orderAt(placements, channelId, stageId, line);
                    return order === undefined ? null : "#" + order;
                }}
                rowProps={(line) => {
                    const id = row.ids[line];
                    const classes: string[] = ["is-action-line"];
                    // Isolating: the lines that are not part of it collapse away.
                    if (isolatingSegment(segmentId)) {
                        if (!id || !isRelated(segmentId, id)) {
                            classes.push("is-collapsed");
                        } else if (row.ids.slice(0, line).length > 0) {
                            // The first line left standing has no hairline above it (the box's border is there).
                            if (row.ids.slice(0, line).every(earlier => !isRelated(segmentId, earlier))) {
                                classes.push("is-first-shown");
                            }
                        }
                    }
                    if (!id) {
                        return { className: classes.join(" ") };
                    }
                    const sharedAt = sharedColour.get(id);
                    const linked = actionResourceLinks(engagement, segmentId, id, cards);
                    const hues = [...new Set(linked.map(entry => resourceColour.get(entry.link.resourceId) ?? 0))];
                    // The connection lines: a resource's colour(s) down the cell's left edge (split into equal
                    // segments, top to bottom, when there are two or more), a shared action's down its right.
                    const style: Record<string, string> = {};
                    if (hues.length > 0) {
                        // One part of the line per resource; past six resources the hues come round in stripes, then a cross-hatch.
                        const paint = connectionPaint("resource", hues);
                        classes.push("has-line-left");
                        style["--line-left"] = paint.image;
                        style["--line-left-size"] = paint.size;
                        style["--line-left-position"] = paint.position;
                    }
                    if (sharedAt !== undefined) {
                        const paint = connectionPaint("shared", [sharedAt]);
                        classes.push("has-line-right");
                        style["--line-right"] = paint.image;
                        style["--line-right-size"] = paint.size;
                        style["--line-right-position"] = paint.position;
                    }
                    const litResource = lit?.kind === "resources"
                        ? engagement.channelResources.find(entry => lit.ids.includes(entry.id) && entry.actionIds.includes(id))
                        : undefined;
                    const lighting = litResource !== undefined || (lit?.kind === "action" && lit.id === id);
                    if (lighting) {
                        classes.push("is-lit", litResource
                            ? markTint("resource", resourceColour.get(litResource.resourceId) ?? 0)
                            : markTint("shared", sharedAt ?? 0));
                    }
                    return {
                        className: classes.join(" "),
                        style: style as CSSProperties,
                        "data-action-id": id,
                        ...(sharedAt !== undefined
                            ? {
                                onMouseEnter: () => setLit({ kind: "action", id }),
                                onMouseLeave: () => setLit(null),
                                onFocus: () => setLit({ kind: "action", id }),
                                onBlur: (event: FocusEvent<HTMLDivElement>) => {
                                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                                        setLit(null);
                                    }
                                }
                            }
                            : {})
                    };
                }}
                lineEnd={(line) => {
                    const id = row.ids[line];
                    if (!id) {
                        return null;
                    }
                    const rowsHolding = actionRows(placements, id).length;
                    const sharedAt = sharedColour.get(id);
                    const linked = actionResourceLinks(engagement, segmentId, id, cards);
                    const linkIds = linked.map(entry => entry.link.id);
                    const resourceIds = [...new Set(linked.map(entry => entry.link.resourceId))];
                    const resourceNames = [...new Set(linked.map(entry => costCardName(entry.card)))];
                    const sharedPressed = isolated?.kind === "action" && isolated.actionId === id;
                    const resourcePressed = isolated?.kind === "resource" && isolated.segmentId === segmentId
                        && isolated.resourceIds.length === resourceIds.length
                        && resourceIds.every(resourceId => isolated.resourceIds.includes(resourceId));
                    return (
                        <>
                            {(sharedAt !== undefined || linked.length > 0) && (
                                <span className="action-marks">
                                    {sharedAt !== undefined && (
                                        <SharedSymbol
                                            places={rowsHolding}
                                            colour={sharedAt}
                                            pressed={sharedPressed}
                                            onToggle={(symbol) => toggleIsolation(
                                                sharedPressed ? null : { kind: "action", segmentId, actionId: id },
                                                symbol
                                            )}
                                        />
                                    )}
                                    {linked.length > 0 && (
                                        <ResourceSymbol
                                            names={resourceNames}
                                            colour={resourceColour.get(linked[0].link.resourceId) ?? 0}
                                            pressed={resourcePressed}
                                            onHover={(on) => setLit(on ? { kind: "resources", ids: linkIds } : null)}
                                            onToggle={(symbol) => toggleIsolation(
                                                resourcePressed ? null : { kind: "resource", segmentId, resourceIds, fromActionId: id },
                                                symbol
                                            )}
                                        />
                                    )}
                                </span>
                            )}
                            <button
                                type="button"
                                className="strategy-box-remove numbered-list-remove"
                                aria-label={"Remove action " + (line + 1) + " from " + label}
                                title={"Remove action " + (line + 1) + " from this row"}
                                disabled={disabled}
                                onClick={() => write(withRowLines(
                                    answers, channelId, stageId,
                                    items.filter((_text, index) => index !== line),
                                    items.map((_text, index) => index).filter(index => index !== line)
                                ))}
                            />
                        </>
                    );
                }}
            />
        );
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
         * nine open. The Segment column's one entry folds too, and
         * starts folded like the others.
         */
        _foldable: boolean | "open" = false,
        /** The card's number, written before the column's label
         *  ("1. SEGMENT") on the Segment column only. */
        number?: number,
        /** The Segment card's fold arrow, hung in the card's arrow
         *  column before the number (the Segment column only). */
        cardArrow?: ReactNode
    ) {

        return (
            <div className="business-engagement-reference-column">

                <span className="business-foundation-label-info">
                    <span className="field-group-title business-foundation-subhead">
                        {cardArrow}
                        {number !== undefined && (
                            <span className="business-engagement-reference-number">
                                {number + "."}
                            </span>
                        )}
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

                        return (
                            <div
                                className="business-engagement-reference-entry"
                                key={source.key}
                            >

                                <div className="business-engagement-reference-name-row">

                                    {foundationLink(source.name, what, source.key)}

                                    {/* What Page 1 says about it opens in a pop-up window (the "i"), not folded down inside the column. */}
                                    {sections.length > 0 && (
                                        <InfoNote
                                            label={source.name.trim() || what}
                                            points={sections.map(section => ({ title: section.label, text: section.text }))}
                                            fullList
                                        />
                                    )}

                                </div>

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

        const open = expanded.has(key);

        return (
            <div
                className="business-engagement-section"
                data-anchor={"engagement-section-" + key}
                data-rail={railId(BUSINESS_ENGAGEMENT_SECTIONS[sectionIndex])}
            >

                <div className="business-engagement-section-head fold-group-head">

                    <FoldArrow open={open} label={title} onToggle={() => toggle(key)} />

                    {/* The section's guidance is its "i", a pop-up window (there is no Hide Help button). */}
                    <span className="field-group-title business-foundation-subhead">
                        <InfoText text={title}>
                            <InfoNote label={title} points={sectionIndex === 0 ? SECTIONS.channels.instructions : SECTIONS.relationships.instructions} fullList />
                        </InfoText>
                    </span>

                    {titleExtra}

                </div>

                {open && body()}

            </div>
        );

    }

    /**
     * CHANNEL RESOURCES: the Segment's channel resources as one
     * read-only, auto-generated table under its Customer Channel table
     * (ChannelResourceTable.ts). A fold of its own, open until folded;
     * not drawn while the Segment has none. Pointing at it lights, and
     * what the Customer Channel table isolates leaves it as it is: it
     * lists every resource, whatever the rows above show.
     */
    function channelResourceTable(segment: BusinessCustomerSegmentValue) {

        const answers = segmentOf(segment.id);
        const table = buildChannelResourceTable(
            engagement,
            answers,
            cards,
            currency,
            segments.flatMap(entry => entry.offerings)
        );

        if (table.rows.length === 0) {
            return null;
        }

        const key = segment.id + "-channel-resources";
        const open = expanded.has(key);

        return (
            <div className="business-engagement-section business-channel-resources-section" data-anchor={"engagement-section-" + key}>

                <div className="business-engagement-section-head fold-group-head">

                    <FoldArrow open={open} label="channel expenses" onToggle={() => toggle(key)} />

                    <span className="field-group-title business-foundation-subhead">Channel expenses</span>

                </div>

                {open && (
                    <ChannelResourceTable
                        table={table}
                        segmentName={segment.name.trim() || "this Segment"}
                        onOpenCard={onOpenCapability ? (row) => onOpenCapability(row.anchors) : undefined}
                        onOpenAction={(actionId) => openAction(answers.segmentId, actionId)}
                        onLit={setLit}
                    />
                )}

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
    function channelsFor(segment: BusinessCustomerSegmentValue, only?: string, sub?: string) {

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

        /* THE HEAD OF A SUBCHANNEL'S CARD: its name (typed, with the category's own places offered), its "i" and its x -- said once, here. */
        const subchannelHead = () => {
            const channel = answers.channels.find(entry => entry.id === sub);
            if (!channel) {
                return "Subchannel";
            }
            return (
                <div className="strategy-box-head business-subchannel-head">
                    {/* (No order number: it is for the code, not for the user.) */}
                    {/* A CHANNEL (Social Media) HAS SUBCHANNELS (LinkedIn, Facebook ...). A new card's top cell is a DROP-DOWN of its channel's subchannels; "Other" turns it into a TEXT HOLDER for the user's own name. A name from the list is said, not asked again. */}
                    {(() => {
                        const known = channelNameOptions(channel.category, answers.channels.filter(candidate => candidate.id !== channel.id)).filter(option => option !== BUSINESS_CHANNEL_OTHER);
                        const typed = channel.name.trim() !== "" && channel.name !== BUSINESS_CHANNEL_OTHER && !known.some(option => option.toLocaleLowerCase() === channel.name.trim().toLocaleLowerCase());
                        if (channel.name.trim() !== "" && channel.name !== BUSINESS_CHANNEL_OTHER && !typed && channel.category !== BUSINESS_CHANNEL_OTHER) {
                            return <span className="business-subchannel-name">{channel.name}</span>;
                        }
                        if (typed || channel.name === BUSINESS_CHANNEL_OTHER || channel.category === BUSINESS_CHANNEL_OTHER) {
                            return (
                                <SuggestedInput
                                    label="Subchannel name"
                                    placeholder="Name this subchannel"
                                    options={[]}
                                    disabled={disabled}
                                    autoFocus={channel.name === BUSINESS_CHANNEL_OTHER}
                                    value={channel.name === BUSINESS_CHANNEL_OTHER ? "" : channel.name}
                                    onChange={(next) => updateChannel(segment.id, channel.id, { name: next })}
                                />
                            );
                        }
                        // (A DROP-DOWN ONLY: nothing is typed here; "Other" is the way to a name of the user's own.)
                        return (
                            <OptionPicker
                                label="Subchannel name"
                                placeholder="Select a subchannel"
                                // (A subchannel that is already used -- it has a card -- is not offered again: its Offerings are added on its own card.)
                                options={channelNameOptions(channel.category, answers.channels.filter(candidate => candidate.id !== channel.id))
                                    .filter(option => option === BUSINESS_CHANNEL_OTHER || !answers.channels.some(other => other.id !== channel.id && other.category === channel.category && other.name.trim().toLocaleLowerCase() === option.toLocaleLowerCase()))}
                                disabled={disabled}
                                value={channel.name}
                                onChange={(next) => updateChannel(segment.id, channel.id, { name: next })}
                            />
                        );
                    })()}
                    {/* The x, in the head, as every card's. */}
                    <BusinessRemove
                        what="Subchannel"
                        disabled={disabled}
                        onRemove={() => updateSegment(segment.id, { channels: answers.channels.filter(candidate => candidate.id !== channel.id) })}
                    />
                </div>
            );
        };

        // Numbered down the table as it is actually drawn, so a
        // channel's number is its own position.
        let position = 0;

        /* ISOLATING (a symbol's click): the categories and channels with
           no isolated action are not drawn, a channel's stage rows with
           none are not drawn, and no "+ Channel" row stands. A category
           folded shut stays folded (the fold states are not touched). */
        // (With `only`, the table of ONE channel -- a tile's dialog: its group is drawn open, no other, and no "add" under it.)
        const isolating = isolatingSegment(segment.id);
        const keeps = (channel: BusinessChannelValue) => relatedStages(answers, segment.id, channel).length > 0;
        const keptGroups = groups.filter(group => group.label.trim().length > 0 && group.channels.some(keeps));
        const lastKept = keptGroups[keptGroups.length - 1];
        const lastKeptChannel = lastKept && (isolating || folds.isOpen(channelCategoryFoldKey(segment.id, lastKept.key)))
            ? lastKept.channels.filter(keeps).pop()
            : undefined;

        return (
            <>

                {/* The table scrolls sideways inside its own box
                    rather than making the page do it: five columns
                    have a width below which they stop being five
                    columns, and the rest of the page has no reason
                    to move with them. */}
                {sub !== undefined && subchannelHead()}
                <div className="business-channel-table-wrap">

                    <table className={"business-channel-table" + (isolatingSegment(segment.id) ? " is-isolating" : "")}>

                        <thead>
                            <tr>
                                {/* The channel, and under it where it
                                    is: a Links column of its own held
                                    nothing on most rows and put a
                                    destination as far from its channel
                                    as an Action is. */}
                                <th scope="col" className="business-channel-th-name">
                                    {sub !== undefined ? null : "Channel"}
                                </th>
                                <th scope="col" className="business-channel-th-offerings">{sub === undefined && "Offerings"}</th>
                                <th scope="col" className="business-channel-th-stage">
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
                                <th scope="col" className="business-channel-th-action">
                                    {sub !== undefined && (
                                        <span className="business-foundation-label-info business-channel-th-actions-per-stage">
                                            <InfoText text="Actions">
                                                <InfoNote label="Action" points={SECTIONS.channels.actions} fullList />
                                            </InfoText>
                                            {" per "}
                                            <InfoText text="Journey Stage">
                                                <InfoNote label="Journey Stage" points={SECTIONS.channels.stages} fullList />
                                            </InfoText>
                                        </span>
                                    )}
                                    {sub === undefined && <span className="business-foundation-label-info">
                                        <span>
                                            <InfoText text="Action">
                                                <InfoNote
                                                    label="Action"
                                                    points={SECTIONS.channels.actions}
                                                    fullList
                                                />
                                            </InfoText>
                                        </span>
                                    </span>}
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
                        {!isolating && groups.length === 0 && (
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

                          /* Isolating shows every category that holds a related row, open
                             whatever its fold (the folds themselves are untouched). */
                          const categoryOpen = isolating || only !== undefined || folds.isOpen(categoryFoldKey);

                          if (only !== undefined && group.key !== only) {
                              position += group.label.trim().length > 0 ? group.channels.length : 0;
                              return null;
                          }

                          if (isolating && !keptGroups.includes(group)) {
                              // Counted all the same: the numbers after it stay their own.
                              position += group.label.trim().length > 0 ? group.channels.length : 0;
                              return null;
                          }

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
                                    <th scope="rowgroup" data-anchor={"channel-category-" + group.key}>
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
                                            {/* In a channel's tile the channel is named by its tile: no dropdown. */}
                                            {only !== undefined && group.label.trim() !== ""
                                                ? <span className="business-channel-category-static">{group.label}</span>
                                                : (
                                            <SuggestedInput
                                                label={
                                                    "Channel for " +
                                                    group.channels
                                                        .map(channel =>
                                                            channel.name.trim() ||
                                                            "an unnamed subchannel")
                                                        .join(", ")
                                                }
                                                placeholder="Channel"
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
                                                        // "Other" last, once: the entry that lets a category be typed.
                                                        .filter(category => category.label !== BUSINESS_CHANNEL_OTHER)
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
                                                )}

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
                                            {/* What the categories are, the chosen one first. */}
                                            <InfoNote
                                                label="Channel"
                                                points={channelCategoryHelp(group.label)}
                                                fullList
                                                size="wide"
                                            />

                                            <BusinessRemove
                                                what={
                                                    "Channel " +
                                                    (group.label.trim() ||
                                                        "with no name yet") +
                                                    (group.channels.length > 0
                                                        ? " and its " +
                                                            group.channels.length +
                                                            " subchannel" +
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
                                                        ? " subchannel"
                                                        : " subchannels")}
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

                                    // (With `sub`, the one subchannel: its card.)
                                    if (sub !== undefined && channel.id !== sub) {
                                        return null;
                                    }

                                    if (!categoryOpen || (isolating && !keeps(channel))) {
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
                                    const stageRows = isolating
                                        ? relatedStages(answers, segment.id, channel)
                                        : channel.stages.length > 0
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

                                    /* A SUBCHANNEL IS USED ONCE BY AN OFFERING (but may have many cards, each with its own actions and costs): the Offerings another card of this subchannel already serves are blocked here. */
                                    const TAKEN_NOTE = "Already uses this subchannel";
                                    const takenByOthers = new Set<string>(
                                        channel.name.trim() === ""
                                            ? []
                                            : answers.channels
                                                .filter(other => other.id !== channel.id && other.category === channel.category && other.name.trim().toLocaleLowerCase() === channel.name.trim().toLocaleLowerCase())
                                                .flatMap(other => other.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) ? offeringOptions.map(option => option.id) : other.offerings)
                                                .filter(id => !channel.offerings.includes(id) && !carriesAll)
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
                                                className={"business-channel-cell business-channel-cell-nested business-channel-td-name" + (lastKeptChannel === channel ? " business-channel-corner-bl" : "")}
                                                data-anchor={"channel-" + channel.id}
                                            >

                                                <div className="business-channel-name">

                                                    {/* (A subchannel's own card names it in its table's head, once: the name is typed there.) */}
                                                    {sub === undefined && (
                                                        <>
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
                                                            "Subchannel " + number + " name"
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

                                                    {/* What its category's channels are, the chosen one first. */}
                                                    {channelOptionHelp(channel.category, channel.name).length > 0 && (
                                                        <InfoNote
                                                            label="Subchannel"
                                                            points={channelOptionHelp(channel.category, channel.name)}
                                                            fullList
                                                            size="wide"
                                                        />
                                                    )}

                                                    {(answers.channels.length > 1 || sub !== undefined) && (
                                                        <BusinessRemove
                                                            what={"Subchannel " + number}
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

                                                        </>
                                                    )}

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
                                                        {/* While the table isolates nothing is created: no new Links box, no new line. */}
                                                        <OptionalField
                                                            label="Links"
                                                            inline={sub !== undefined}
                                                            filled={channel.links.some(link => link.trim() !== "")}
                                                            onClear={() => change({ links: [] })}
                                                            disabled={disabled || (isolating && !channel.links.some(link => link.trim() !== ""))}
                                                        >
                                                            <NumberedListInput
                                                                label={"Links for Subchannel " + number}
                                                                placeholder="Link"
                                                                items={channel.links}
                                                                maxItems={isolating ? channel.links.length : undefined}
                                                                disabled={disabled}
                                                                onChange={(items) => change({ links: items })}
                                                            />
                                                        </OptionalField>
                                                    </div>

                                                    {/* What it needs: its resources, made in
                                                        3. Offering's Capability. */}
                                                    {/* (In a channel's card the section has its own heading, "Expenses", with its "+", and a regular x beside each expense.) */}
                                                    {sub !== undefined
                                                        ? <div className="business-channel-expenses">{channelResources(answers, channel.id, "Subchannel " + number, "Expenses")}</div>
                                                        : channelResources(answers, channel.id, "Subchannel " + number)}

                                                </div>

                                            </td>

                                            {/* ONE DROPDOWN PER OFFERING, with
                                                the small + and × that add and
                                                take one away. A cell that holds
                                                several values grows a line at a
                                                time, and every line is the same
                                                control. */}
                                            <td rowSpan={span} className="business-channel-cell business-channel-td-offerings">
                                                {sub !== undefined && <span className="business-channel-field-label">Offerings</span>}
                                                {offeringOptions.length === 0
                                                    ? (
                                                        <BusinessEmpty>
                                                            Add an Offering to this Segment on
                                                            the Foundation page.
                                                        </BusinessEmpty>
                                                    )
                                                    : sub !== undefined
                                                        // A channel's CARD lists its Offerings as tick boxes (a set, not one value): "All Offerings" first -- one choice for the lot --, then each Offering; at least one stays ticked.
                                                        ? (
                                                            <BusinessTicks
                                                                name={"Offerings of Subchannel " + number}
                                                                disabled={disabled}
                                                                options={[
                                                                    { id: BUSINESS_CHANNEL_ALL_OFFERINGS, label: ALL_OFFERINGS_LABEL, blocked: takenByOthers.size > 0 ? TAKEN_NOTE : undefined },
                                                                    ...offeringOptions.map(option => ({ id: option.id, label: option.label, blocked: takenByOthers.has(option.id) ? TAKEN_NOTE : undefined }))
                                                                ]}
                                                                // ("All Offerings" is ticked whenever every Offering is: carried as all, or each one ticked.)
                                                                chosen={carriesAll || (offeringOptions.length > 0 && offeringOptions.every(option => channel.offerings.includes(option.id))) ? [BUSINESS_CHANNEL_ALL_OFFERINGS, ...offeringOptions.map(option => option.id)] : channel.offerings}
                                                                onChange={(next) => {
                                                                    // (Some Offerings already use this subchannel on another card: only the free ones can be chosen here.)
                                                                    if (takenByOthers.size > 0) {
                                                                        const free = next.filter(id => id !== BUSINESS_CHANNEL_ALL_OFFERINGS && !takenByOthers.has(id));
                                                                        if (free.length > 0) {
                                                                            change({ offerings: free });
                                                                            offeringsOfMadeCards(channel.id, free, offeringOptions.map(option => option.id));
                                                                        }
                                                                        return;
                                                                    }
                                                                    const every = offeringOptions.map(option => option.id);
                                                                    const put = (offerings: string[]) => {
                                                                        change({ offerings });
                                                                        offeringsOfMadeCards(channel.id, offerings, every);
                                                                    };
                                                                    const allShown = carriesAll || (every.length > 0 && every.every(id => channel.offerings.includes(id)));
                                                                    if (allShown) {
                                                                        if (!next.includes(BUSINESS_CHANNEL_ALL_OFFERINGS)) {
                                                                            // "All Offerings" unticked: the first Offering stays.
                                                                            put(every.slice(0, 1));
                                                                        } else {
                                                                            // One Offering unticked while all were carried: all the others.
                                                                            const left = every.filter(id => next.includes(id));
                                                                            if (left.length > 0) {
                                                                                put(left);
                                                                            }
                                                                        }
                                                                        return;
                                                                    }
                                                                    if (next.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) || (every.length > 0 && every.every(id => next.includes(id)))) {
                                                                        // (Ticking the last one is ticking "All Offerings": one value, true as Offerings are added.)
                                                                        put([BUSINESS_CHANNEL_ALL_OFFERINGS]);
                                                                        return;
                                                                    }
                                                                    if (next.length > 0) {
                                                                        put(next);
                                                                    }
                                                                }}
                                                            />
                                                        )
                                                        : offeringRows.map((offeringId, index) => (

                                                        <div
                                                            className="business-channel-pick"
                                                            key={offeringId || "unchosen"}
                                                        >

                                                            <OptionPicker
                                                                label={
                                                                    "Offering " + (index + 1) +
                                                                    " for Subchannel " + number
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

                                                            {/* Never the last one: a channel
                                                                cannot be without Offerings,
                                                                so the only one left is
                                                                changed, not removed. */}
                                                            {!carriesAll && channel.offerings.length > 1 && (
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
                                                                !isolating &&
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

                                    /* "+ Add Journey Stage": under the last stage -- in a subchannel's card, after the last action, outside the section of the stages. */
                                    const addStageOk = !isolating &&
                                        channel.stages.length > 0 &&
                                        channel.stages.length < stageOptionsFor(channel.category, channel).length;
                                    const addStage = () => {
                                        const free = stageOptionsFor(channel.category, channel)
                                            .find(stage => !channel.stages.includes(stage.id));
                                        if (free) {
                                            change({ stages: [...channel.stages, free.id] });
                                        }
                                    };
                                    const addStageButton = (
                                        <BusinessStep
                                            kind="add"
                                            what="Journey Stage"
                                            disabled={disabled}
                                            onClick={addStage}
                                        />
                                    );
                                    // (In a channel's card the "+" stands in the heading's row, above the stages' x column; it is not drawn once every stage is placed.)
                                    const addStagePlus = (
                                        <button
                                            type="button"
                                            className="strategy-box-add"
                                            aria-label="Add Journey Stage"
                                            title="Add Journey Stage"
                                            disabled={disabled}
                                            onClick={addStage}
                                        >
                                            +
                                        </button>
                                    );

                                    return (
                                        <Fragment key={channel.id}>

                                            {stageRows.map((stageId, shown) => ({
                                                stageId,
                                                shown,
                                                // The stage's own place in the channel (the rows drawn may be fewer).
                                                index: isolating ? channel.stages.indexOf(stageId) : shown
                                            })).map(({ stageId, shown, index }) => (

                                                <tr key={channel.id + "-" + (stageId || "unchosen")}>

                                                    {shown === 0 && channelCells}

                                                    <td className="business-channel-cell business-channel-td-stage">

                                                        <div className="business-channel-pick business-channel-pick-stage">

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
                                                                    " for Subchannel " + number
                                                                }
                                                                placeholder="Select a stage"
                                                                hug
                                                                /* It fills the track from the cell's
                                                                   left padding to the x (the width of
                                                                   the Add Journey Stage button under
                                                                   it), never narrower than the longest
                                                                   stage ("Support & Follow Up"): its
                                                                   column is at least that wide
                                                                   (useChannelColumns). */
                                                                sizeFor={journeyStageLabels()}
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

                                                            {/* A stage recorded that its category
                                                                does not usually take: kept, and said
                                                                so quietly (stageIsUsual). */}
                                                            {stageId && !stageIsUsual(channel.category, stageId) && (
                                                                <span className="business-channel-stage-note">
                                                                    Not usual for this category
                                                                </span>
                                                            )}

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
                                                            {sub === undefined && shown === stageRows.length - 1 && addStageOk && addStageButton}

                                                        </div>

                                                    </td>

                                                    <td className="business-channel-cell business-channel-td-action">
                                                        {/* Nothing to record until the
                                                            stage beside it is chosen --
                                                            an Action belongs to a stage,
                                                            and the dropdown says so. More
                                                            than one is allowed once it
                                                            is: a stage can involve
                                                            several things done through
                                                            the same channel. */}
                                                        {stageId.length > 0 && channelActions(
                                                            segment.id,
                                                            answers,
                                                            channel.id,
                                                            stageId,
                                                            (STAGE_LABELS[stageId] ?? "Stage") + " actions for Subchannel " + number
                                                        )}
                                                    </td>

                                                </tr>

                                            ))}

                                            {sub !== undefined && addStageOk && (
                                                <tr>
                                                    <td className="business-channel-td-addstage">{addStagePlus}</td>
                                                </tr>
                                            )}

                                        </Fragment>
                                    );

                                })}

                                {/* ANOTHER CHANNEL UNDER THIS
                                    CATEGORY, without going back
                                    through choosing one. The button
                                    below the table starts a new
                                    category; this one adds to the
                                    category it sits in. */}
                                {group.label.trim().length > 0 && categoryOpen && !isolating && only === undefined && (
                                    <tr>
                                        <td className="business-channel-cell">
                                            <BusinessAddButton
                                                label="Subchannel"
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

                    {/* A NEW CATEGORY, which is what this button now
                        makes: it adds a channel with no category yet, so
                        the table grows a category row for it to be filed
                        under. Adding another channel to a category that
                        already exists is done from inside that category,
                        where the button that does it sits. */}
                    {!isolating && only === undefined && (
                        <BusinessAddButton
                            label="Channel"
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
                    )}

                </div>

            </>
        );

    }

    /** The id of the tile of one channel (the group of subchannels of a category), for opening it. */
    const channelTileId = (segmentId: string, groupKey: string) => "channel-tile-" + segmentId + "-" + groupKey;

    /**
     * 1. CUSTOMER CHANNEL AS TILES: a tile for each channel (the group of subchannels under one category), listing its subchannels; pressing it opens that channel's
     * table in a dialog. A new channel is added under the tiles.
     */
    function channelTiles(segment: BusinessCustomerSegmentValue) {
        const answers = segmentOf(segment.id);
        const groups: { key: string; label: string; channels: BusinessChannelValue[] }[] = [];
        for (const channel of answers.channels) {
            const group = groups.find(entry => entry.label === channel.category);
            if (group) {
                group.channels.push(channel);
            } else {
                groups.push({ key: channel.id, label: channel.category, channels: [channel] });
            }
        }
        // A subchannel of a channel (named, when it is one the category offers).
        const addSub = (category: string, name = "") => {
            const channel = { ...createBusinessChannel(), category, name };
            updateSegment(segment.id, { channels: [...answers.channels, channel] });
            return channel;
        };
        const addChannel = (category: string) => {
            const channel = { ...createBusinessChannel(), category };
            updateSegment(segment.id, { channels: [...answers.channels, channel] });
            folds.expand(channelCategoryFoldKey(segment.id, channel.id));
            return channel;
        };
        const tiles: SectionTile[] = groups.map(group => {
            const names = group.channels.map(channel => channel.name.trim()).filter(name => name.length > 0);
            return {
                id: channelTileId(segment.id, group.key),
                title: group.label.trim() || "New channel",
                view: true,
                items: names,
                itemMarks: names.map(() => ({ bullet: true })),
                // (The "+" adds a subchannel to this channel and opens its card.)
                plus: () => {
                    const made = addSub(group.label);
                    window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, group.key), card: made.id, fresh: true } })), 80);
                },
                holds: group.channels.map(channel => channel.id),
                note: channelCategoryHelp(group.label),
                cardFor: (id: string) => answers.channels.some(channel => channel.id === id)
                    ? <div className="column-tile-content" style={{ "--strategy-theme-hue": segmentHue(segment) } as CSSProperties}><div className="business-foundation-input business-foundation-card business-subchannel-card">{channelsFor(segment, group.key, id)}</div></div>
                    : null,
                // The channel's dialog: a tile for each subchannel, and, faded, the ones its category offers that are not used yet.
                content: () => {
                    const category = BUSINESS_CHANNEL_CATEGORIES.find(entry => entry.label === group.label);
                    // A SUBCHANNEL'S TILE lists ALL the Offerings, each a LINK: the ones a card of this subchannel serves open that card (numbered 1., 2. ... where the subchannel has several cards, the Offerings of one card sharing its number); the others are half transparent, and pressing one makes a card of this subchannel for it.
                    const openCardOf = (cardId: string) => window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, group.key), card: cardId } })), 80);
                    const every = segment.offerings.map(offering => offering.id);
                    const offeringLabel = (position: number) => segment.offerings[position].name.trim() || "Offering " + (position + 1) + ", not named yet";
                    const served = (channel: BusinessChannelValue) => channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS) ? every : channel.offerings;
                    const seen = new Set<string>();
                    const tileOf = (channel: BusinessChannelValue, at: number): CardBox | null => {
                        const key = channel.name.trim().toLocaleLowerCase();
                        if (key !== "") {
                            if (seen.has(key)) {
                                return null;
                            }
                            seen.add(key);
                        }
                        const cards = key === "" ? [channel] : group.channels.filter(candidate => candidate.name.trim().toLocaleLowerCase() === key);
                        const cardFor = (offeringId: string) => cards.findIndex(card => served(card).includes(offeringId));
                        return {
                            id: channel.id,
                            number: at + 1,
                            plain: true,
                            name: channel.name,
                            unnamed: "Unnamed subchannel",
                            lines: key === "" ? undefined : every.map((id, position) => {
                                const owner = cardFor(id);
                                return (cards.length > 1 && owner >= 0 ? (owner + 1) + ". " : "") + offeringLabel(position);
                            }),
                            marks: key === "" ? undefined : every.map(id => cardFor(id) >= 0 ? undefined : { empty: true }),
                            linkedLines: key === "" ? undefined : every.map(() => true),
                            onLine: (index: number) => {
                                const owner = cardFor(every[index]);
                                if (owner >= 0) {
                                    openCardOf(cards[owner].id);
                                } else {
                                    const made = { ...createBusinessChannel(), category: group.label, name: channel.name, offerings: [every[index]] };
                                    updateSegment(segment.id, { channels: [...answers.channels, made] });
                                    openCardOf(made.id);
                                }
                            },
                            own: true,
                            content: () => null
                        };
                    };
                    const spare: CardBox[] = (category?.channels ?? [])
                        .filter(entry => !names.includes(entry.label))
                        .map((entry, at) => ({
                            id: "subchannel-inactive-" + group.key + "-" + at,
                            number: group.channels.length + at + 1,
                            plain: true,
                            name: entry.label,
                            unnamed: entry.label,
                            own: true,
                            faded: true,
                            press: () => {
                                const made = addSub(group.label, entry.label);
                                window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, group.key), card: made.id } })), 80);
                            },
                            content: () => null
                        }));
                    return (
                        <div className="column-tile-content">
                            <div className="business-engagement-section-head"><DialogHeading title={group.label.trim() || "New channel"} info={channelCategoryHelp(group.label)} /></div>
                            <CardBoxes
                                label={"Subchannels of " + (group.label.trim() || "this channel")}
                                what="Subchannel"
                                autoStart={false}
                                items={[...group.channels.map(tileOf).filter((entry): entry is CardBox => entry !== null), ...spare]}
                                add={{
                                    label: "subchannel",
                                    disabled,
                                    onAdd: () => addSub(group.label).id,
                                    isBlank: (id: string) => {
                                        const found = segmentOf(segment.id).channels.find(entry => entry.id === id);
                                        return !found || found.name.trim() === "";
                                    },
                                    onRemove: (ids: string[]) => updateSegment(segment.id, { channels: segmentOf(segment.id).channels.filter(entry => !ids.includes(entry.id)) })
                                }}
                            />
                        </div>
                    );
                }
            };
        });
        // The channels the page offers that this Segment does not use yet: tiles, faded; pressing one makes it (and opens it).
        const unused: SectionTile[] = BUSINESS_CHANNEL_CATEGORIES
            .filter(category => category.label !== BUSINESS_CHANNEL_OTHER && !groups.some(group => group.label === category.label))
            .map(category => ({
                id: channelTileId(segment.id, "inactive-" + category.id),
                title: category.label,
                inactive: true,
                items: [],
                press: () => {
                    const channel = addChannel(category.label);
                    window.setTimeout(() => document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { tile: channelTileId(segment.id, channel.id), card: channel.id, fresh: true } })), 80);
                },
                plus: () => { addChannel(category.label); },
                content: () => null
            }));
        return (
            <>
                <SectionTiles
                    label={"Channels of " + (segment.name.trim() || "this Segment")}
                    hue={segmentHue(segment)}
                    tiles={[...tiles, ...unused]}
                    // (A subchannel made a moment ago and left with no name, no link and no stage is taken away when its card is closed.)
                    blank={{
                        isBlank: (id: string) => {
                            const found = segmentOf(segment.id).channels.find(entry => entry.id === id);
                            return !found || (found.name.trim() === "" && found.links.every(link => link.trim() === "") && found.stages.length === 0);
                        },
                        onRemove: (ids: string[]) => updateSegment(segment.id, { channels: segmentOf(segment.id).channels.filter(entry => !ids.includes(entry.id)) })
                    }}
                />
                <BusinessAddButton
                    label="Channel"
                    disabled={disabled}
                    onAdd={() => {
                        const channel = createBusinessChannel();
                        updateSegment(segment.id, { channels: [...answers.channels, channel] });
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
                                            {/* The name is the link to the Offering
                                                on the Foundation page, as a
                                                Profile's name is; its "i" stays
                                                with it as one run. */}
                                            <span>
                                                {foundationLink(
                                                    offeringName(offeringId), "Offering", offeringId
                                                )}
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
                                        <span className="business-relationship-profiles business-relationship-band-profiles">

                                                {/* ON ONE LINE WITH ITS LABEL.
                                                    Three names are a line, not a
                                                    list under a heading -- and
                                                    the row is reference, so it
                                                    should take one row. */}
                                                <span className="business-engagement-reference-label">
                                                    Profiles:
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

                                        </span>
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
                                                {/* The Offering and, next to it, the Profiles it is sold to. */}
                                                <span className="business-relationship-band">
                                                    {offeringHead}
                                                    {offeringShown && profilesRow}
                                                </span>
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

                                            {/* HOW THE RELATIONSHIP IS KEPT, one block for each type: the type (its dropdown beside its label), its Purpose, then the
                                                Engagement Strategy -- the journey stages side by side, each with its Goal (the ticks under the label) and its Approach --
                                                and, after the last, the one "+ Add Relationship Type". Nothing folds. */}
                                            <tr>
                                                <td colSpan={3} className="business-channel-cell business-relationship-blocks-cell">

                                                    {typeRows.map(typeId => {

                                                        const type = typeOf(segment.id, offeringId, typeId);

                                                        return (
                                                            <div className="business-relationship-block" key={offeringId + "-" + (typeId || "unchosen")}>

                                                                {/* The type's x, in the block's top right corner. */}
                                                                {kept.types.length > 0 && (
                                                                    <span className="business-relationship-block-remove">
                                                                        <BusinessStep
                                                                            kind="remove"
                                                                            what={(typeId.length > 0 ? TYPE_LABELS[typeId] + " " : "") + "Relationship Type for " + offeringName(offeringId)}
                                                                            disabled={disabled}
                                                                            onClick={() => updateOfferingRelationships(segment.id, offeringId, {
                                                                                types: kept.types.filter(candidate => candidate !== typeId)
                                                                            })}
                                                                        />
                                                                    </span>
                                                                )}

                                                                {/* THE TYPE (its dropdown under its label) and, next to it, its Purpose. */}
                                                                <div className="business-relationship-type-row">

                                                                    <div className="business-relationship-type-field">
                                                                        <span className="business-foundation-label-info business-relationship-type-label">
                                                                            <InfoText text="Relationship Type">
                                                                                <InfoNote label="Relationship Type" points={SECTIONS.relationships.types} fullList />
                                                                            </InfoText>
                                                                        </span>
                                                                        <div className="business-relationship-type-pick">
                                                                            <OptionPicker
                                                                                label={"Relationship Type for " + offeringName(offeringId)}
                                                                                placeholder="Select a type"
                                                                                hug
                                                                                options={BUSINESS_RELATIONSHIP_TYPES
                                                                                    .filter(entryType => entryType.id === typeId || !kept.types.includes(entryType.id))
                                                                                    .map(entryType => entryType.label)}
                                                                                disabled={disabled}
                                                                                value={TYPE_LABELS[typeId] ?? ""}
                                                                                onChange={(next) => {
                                                                                    const picked = BUSINESS_RELATIONSHIP_TYPES.find(entryType => entryType.label === next)?.id ?? "";
                                                                                    updateOfferingRelationships(segment.id, offeringId, {
                                                                                        types: kept.types.length === 0
                                                                                            ? [picked]
                                                                                            : kept.types.map(candidate => candidate === typeId ? picked : candidate)
                                                                                    });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    {typeId.length > 0 && (
                                                                        <div className="business-relationship-purpose">
                                                                            <BusinessNote
                                                                                label="Purpose"
                                                                                ariaLabel={"Purpose of " + TYPE_LABELS[typeId] + " for " + offeringName(offeringId)}
                                                                                info={SECTIONS.relationships.purpose}
                                                                                disabled={disabled}
                                                                                value={type.purpose}
                                                                                onChange={(next) => updateType(segment.id, offeringId, typeId, { purpose: next })}
                                                                            />
                                                                        </div>
                                                                    )}

                                                                </div>

                                                                {typeId.length > 0 && (
                                                                    <>
                                                                        <span className="field-group-title business-foundation-subhead business-relationship-strategy-title">
                                                                            <InfoText text="Goal">
                                                                                <InfoNote label="Goal" points={SECTIONS.relationships.goals} fullList />
                                                                            </InfoText>
                                                                            {" & "}
                                                                            <InfoText text="Approach">
                                                                                <InfoNote label="Approach" points={SECTIONS.relationships.approach} fullList />
                                                                            </InfoText>
                                                                        </span>

                                                                        {/* THE ENGAGEMENT STRATEGY AS A TABLE: a column for each journey stage, a row for the Goal and one for the Approach (each label said once). */}
                                                                        <table className="business-relationship-strategy-table">
                                                                            <thead>
                                                                                <tr>
                                                                                    {offeringRows.map(interaction => (
                                                                                        <th scope="col" key={interaction.key + "-" + typeId} style={{ width: (100 / Math.max(offeringRows.length, 1)) + "%" }}>
                                                                                            <span className="business-relationship-stage-title">
                                                                                                {STAGE_LABELS[interaction.stageId]}
                                                                                                {/* What happens at this stage, and through which channels: in the stage's "i". */}
                                                                                                {interaction.groups.length > 0 && (
                                                                                                    <InfoNote
                                                                                                        label={STAGE_LABELS[interaction.stageId] + ": the channels"}
                                                                                                        points={interaction.groups.map(group => ({
                                                                                                            title: group.category.trim().length ? group.category : "No category",
                                                                                                            text: group.channelIds.map(id => channelName(id)).join(", ")
                                                                                                        }))}
                                                                                                        fullList
                                                                                                    />
                                                                                                )}
                                                                                            </span>
                                                                                        </th>
                                                                                    ))}
                                                                                </tr>
                                                                            </thead>
                                                                            <tbody>
                                                                                <tr>
                                                                                {offeringRows.map(interaction => {
                                                                                        const answersFor = interactionOf(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys);
                                                                                        const about = (STAGE_LABELS[interaction.stageId] ?? "") + ", " + offeringName(offeringId) + ", " + TYPE_LABELS[typeId];
                                                                                        return (
                                                                                            <td key={interaction.key + "-" + typeId}>
                                                                                                <div className="business-engagement-goal-ticks">
                                                                                                    <BusinessTicks
                                                                                                        name={"Goals for " + about}
                                                                                                        options={GOAL_OPTIONS}
                                                                                                        chosen={answersFor.goals}
                                                                                                        disabled={disabled}
                                                                                                        onChange={(next) => updateInteraction(
                                                                                                            segment.id, offeringId, typeId,
                                                                                                            interaction.key, interaction.legacyKeys,
                                                                                                            { goals: next }
                                                                                                        )}
                                                                                                    />
                                                                                                </div>
                                                                                            </td>
                                                                                        );
                                                                                    })}
                                                                                </tr>
                                                                                <tr>
                                                                                {offeringRows.map(interaction => {
                                                                                        const answersFor = interactionOf(segment.id, offeringId, typeId, interaction.key, interaction.legacyKeys);
                                                                                        const about = (STAGE_LABELS[interaction.stageId] ?? "") + ", " + offeringName(offeringId) + ", " + TYPE_LABELS[typeId];
                                                                                        return (
                                                                                            <td key={interaction.key + "-" + typeId}>
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
                                                                                            </td>
                                                                                        );
                                                                                    })}
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </>
                                                                )}

                                                            </div>
                                                        );

                                                    })}

                                                    {kept.types.length < BUSINESS_RELATIONSHIP_TYPES.length && (
                                                        <div className="business-relationship-add">
                                                            <BusinessStep
                                                                kind="add"
                                                                what={"Relationship Type for " + offeringName(offeringId)}
                                                                label="Relationship Type"
                                                                disabled={disabled}
                                                                onClick={() => {
                                                                    const free = BUSINESS_RELATIONSHIP_TYPES.find(entryType => !kept.types.includes(entryType.id));
                                                                    if (free) {
                                                                        updateOfferingRelationships(segment.id, offeringId, { types: [...kept.types, free.id] });
                                                                    }
                                                                }}
                                                            />
                                                        </div>
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
                        data-size={numberStep(limits)}
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
                <div className="business-demand-source" key={source.id} data-anchor={"demand-source-" + source.id}>

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
                                hug
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
                                    hug
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
                        {/* What the block is for, and where its result is
                            used: one "i" on the title rather than two
                            paragraphs around the fields. */}
                        <span className="field-group-title business-foundation-subhead business-demand-title">
                            <InfoText text={offeringLabel}>
                                <InfoNote label="Demand & Conversion" points={DEMAND_BLOCK_HELP} fullList />
                            </InfoText>
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
                </div>

                {open && (<>

                <div className="business-demand-sources">
                    {demand.sources.map(sourceCard)}
                    <BusinessAddButton
                        label="Customer Source"
                        disabled={disabled}
                        onAdd={() => updateDemand(offeringId, {
                            sources: [...demand.sources, createDemandSource()]
                        })}
                    />
                </div>

                {/* HOW IT IS BOUGHT, UNDER THE SOURCES: Customers Buy and,
                    for an Offering kept until cancelled, the share
                    cancelling a month -- one row, labels above. */}
                <div className="business-demand-fields business-demand-buying">
                    <BusinessField label="Customers Buy" info={DEMAND_BUYING_HELP}>
                        <OptionPicker
                            label={"How customers buy " + offeringLabel}
                            placeholder={DEMAND_BUY_ONCE}
                            hug
                            options={[DEMAND_BUY_ONCE, DEMAND_BUY_MONTHLY]}
                            disabled={disabled}
                            value={demand.recurring ? DEMAND_BUY_MONTHLY : DEMAND_BUY_ONCE}
                            onChange={(next) => updateDemand(offeringId, {
                                recurring: next === DEMAND_BUY_MONTHLY
                            })}
                        />
                    </BusinessField>
                    {demand.recurring && demand.sources.length > 0 && numberField(
                        "Cancel / Month (%)",
                        "The share of active clients who cancel each month. At 5%, a client stays about 20 months on average.",
                        "Share of clients cancelling a month, " + offeringLabel,
                        "e.g. 5",
                        demand.cancel,
                        (next) => updateDemand(offeringId, { cancel: next }),
                        NUMBER_LIMITS.cancelPercent
                    )}
                </div>

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

                <OptionalNote
                    label="Assumptions"
                    info={["Anything else the figures rest on, beyond each source's basis."]}
                    ariaLabel={"Demand assumptions for " + offeringLabel}
                    placeholder={DEMAND_ASSUMPTIONS_PLACEHOLDER}
                    disabled={disabled}
                    value={demand.assumptions}
                    onChange={(next) => updateDemand(offeringId, {
                        assumptions: next
                    })}
                />

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

            {/* A resource waiting for one of its channel's actions: the table's action lines take a click. */}
            <ActionPicker />

            {/* Row 1: the two section titles. */}
            {/* (As tiles, each section carries its own title inside the Segment's frame: the same two titles are not said again above it.) */}
            {!asTiles && heads.map(head => (
                <h3 className="answer-column-label" key={"title-" + head.number}>
                    <span className="answer-column-label-number">
                        {head.number + "."}
                    </span>
                    <span className="answer-column-label-text">{head.title}</span>
                </h3>
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

                const open = expanded.has(key);

                const segmentArrow = (
                    <FoldArrow
                        open={open}
                        label={"Segment " + (segmentIndex + 1)}
                        onToggle={() => toggle(key)}
                    />
                );

                return (
                    <div
                        className="business-foundation-input business-foundation-card business-engagement-input"
                        key={segment.id}
                        data-anchor={"engagement-segment-" + segment.id}
                        role="group"
                        aria-label={"Segment " + (segmentIndex + 1) + ": " +
                            (segment.name.trim().length > 0 ? segment.name.trim() : "Not named yet")}
                        /* The Segment's OWN colour, chosen on Page 1
                           and carried here: the same Segment is the
                           same colour on both pages, which is most
                           of what makes this read as the next page
                           rather than a different feature. */
                        style={{ "--strategy-theme-hue": segmentHue(segment) } as CSSProperties}
                    >

                        {/* NO HEAD ROW OF ITS OWN: the card's fold arrow
                            stands next to "1. SEGMENT", the first
                            column's heading, in the card's arrow
                            column. Folded, that heading stands alone
                            with the Segment's name, as a folded card
                            shows its name. */}
                        {open ? (
                            <div className="business-engagement-references">

                                <div className="business-engagement-reference-columns">

                                    {referenceColumn(
                                        "Segment",
                                        "Segment",
                                        segmentQuestions,
                                        [{
                                            key: segment.id,
                                            name: segment.name,
                                            description: segment.description
                                        }],
                                        true,
                                        segmentIndex + 1,
                                        segmentArrow
                                    )}

                                    {referenceColumn(
                                        "Profiles",
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

                            </div>
                        ) : (
                            <div className="business-engagement-references business-engagement-segment-folded">
                                <span className="business-foundation-label-info">
                                    <span className="field-group-title business-foundation-subhead">
                                        {segmentArrow}
                                        <span className="business-engagement-reference-number">
                                            {(segmentIndex + 1) + "."}
                                        </span>
                                        Segment
                                    </span>
                                </span>
                                <span className="strategy-name-static">
                                    {segment.name.trim().length > 0
                                        ? segment.name
                                        : "Not named yet"}
                                </span>
                            </div>
                        )}

                        {open && (
                        <>

                                {/* Each section folds away. Both of
                                    them run to a table, and a founder
                                    working on one has no use for the
                                    other underfoot. */}
                                {foldingSection(
                                    segment.id + "-channels",
                                    "1. Customer Channel",
                                    () => (
                                        <>
                                            {asTiles ? channelTiles(segment) : channelsFor(segment)}
                                            {channelResourceTable(segment)}
                                        </>
                                    ),
                                    0,
                                    <>
                                        {isolated && isolated.segmentId === segment.id && (
                                            <IsolationNote
                                                kind={isolated.kind === "action" ? "shared" : "linked"}
                                                names={isolationNames()}
                                                onClear={clearIsolation}
                                            />
                                        )}
                                        <FoldAllToggle
                                            ids={channelCategoryFoldKeys(segment.id)}
                                            folds={folds}
                                            label="channel categories"
                                        />
                                    </>
                                )}

                                <>
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


                                {/* DEMAND & CONVERSION, a section of its own after the table: for each Offering, how its customers come, and so how many sales to expect. */}
                                {foldingSection(
                                    segment.id + "-demand",
                                    "3. Demand & Conversion",
                                    () => (
                                        <div className="business-demand-section">
                                            {engagedOfferingIds(segment).map(offeringId => (
                                                <div className="business-demand-cell" key={offeringId} data-anchor={"demand-section-" + offeringId}>
                                                    {demandFor(segment, offeringId, segment.offerings.find(offering => offering.id === offeringId)?.name.trim() || "Offering")}
                                                </div>
                                            ))}
                                        </div>
                                    ),
                                    1
                                )}
                                </>
                        </>
                        )}

                    </div>
                );

            })}

        </div>

    );

}
