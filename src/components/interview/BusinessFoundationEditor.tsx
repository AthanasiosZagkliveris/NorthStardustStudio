import { CSSProperties, ReactNode, useRef, useState } from "react";

import FieldLabel from "../FieldLabel.tsx";
import { cardNameMissing } from "../../framework/engine/SystemCardCompleteness.ts";
import { workHue } from "../../framework/engine/WorkColours.ts";
import CardBoxes, { type CardBox } from "./CardBoxes.tsx";
import SectionTiles, { DialogHeading, type SectionTile, type TileAdd } from "./SectionTiles.tsx";

import {
    BUSINESS_COMPETITOR_TYPES,
    BUSINESS_FOUNDATION_SUBSECTIONS,
    BUSINESS_OFFERING_CATEGORIES,
    BusinessCompetitorValue,
    BusinessCustomerProfileValue,
    BusinessCustomerSegmentValue,
    BusinessDescriptionValue,
    BusinessFoundationValue,
    BusinessOfferingValue,
    BusinessProfileNeedsValue,
    asBusinessFoundationValue,
    businessSegmentNeeds,
    createBusinessCompetitor,
    createBusinessCustomerProfile,
    createBusinessCustomerSegment,
    createBusinessOffering,
    segmentHue
} from "../../framework/engine/AnswerUtils.ts";

import {
    BusinessAddButton,
    BusinessCard,
    BusinessField,
    BusinessGroup,
    BusinessNote,
    BusinessRemove,
    BusinessText
} from "./BusinessCardFields.tsx";
import { summaryText } from "./cardSummary.ts";
import FoldAllToggle from "./FoldAllToggle.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import NumberedListInput from "./NumberedListInput.tsx";
import OptionPicker from "./OptionPicker.tsx";
import { railId } from "./rails/railItems.ts";
import { FieldMark, FieldStatus } from "./fieldMarks.tsx";
import StrategyTextArea from "./StrategyTextArea.tsx";
import { useItemFolds } from "./useItemFolds.ts";
import { toggledIn } from "./toggledIn.ts";
import FoldArrow from "./FoldArrow.tsx";
import CardNumber from "./CardNumber.tsx";
import CardNameInput from "./CardNameInput.tsx";
import NumberedListStatic from "./NumberedListStatic.tsx";

/**
 * The instruction bullets for each subsection, and the parameter
 * lists its "i" notes carry.
 *
 * Every string here is the specification's own
 * (docs/specifications/business-system/page-1-foundation.md), which
 * says so twice: "Do not alter the wording of the provided texts"
 * and "must be used exactly as provided. Do not rewrite, shorten,
 * expand, reinterpret, replace, or add examples". So they are quoted
 * rather than written, and the lists run to five points where the
 * specification lists five (see InfoNote.fullList).
 */
const SUBSECTIONS = {

    segments: {
        instructions: [
            "Divide your Target Audience into 1 primary segment (maximum 2), focusing on the highest-value or easiest-to-reach groups.",
            "Define up to 3 customer profiles, including their problems, needs, and the best approach for reaching them."
        ],
        segmentDescription: [
            { id: "demographics", title: "Demographics", text: "What are their age range, education level, and income range?" },
            { id: "geographics", title: "Geographics", text: "Where do they live, work or operate?" },
            { id: "business-data", title: "Business Data", text: "If you sell to companies, what is their company type, size and industry?" },
            { id: "purchasing", title: "Purchasing Power & Behaviour", text: "What influences how much they spend, when they buy, and whether it is worthwhile?" },
            // The specification's Market Size, with Industry Outlook &
            // Trends asked in the same box: not the specification's,
            // added at the product owner's request for the Business
            // Plan's Market Analysis. Optional, like every Description
            // parameter.
            { id: "market-size", title: "Market Size & Industry Outlook", text: "How large is this group? Where this market is heading: growth, key trends, changes in technology or regulation, and what they mean for your customers." }
        ],
        profileDescription: [
            { id: "personal", title: "Specific Personal Information", text: "What are their exact age, gender, marital status, education and job title?" },
            { id: "psychographics", title: "Psychographics", text: "What do they value, believe in, enjoy and consider important?" },
            { id: "hubs", title: "Social & Interest Hubs", text: "Which communities, professional networks, events and other places do they regularly visit or take part in?" },
            { id: "habits", title: "Information & Shopping Habits", text: "How do they find, learn about, compare and buy products or services?" }
        ],
        // What the Profile wants and what stands in its way --
        // the three fields under Motivations, each with its "i".
        motivations: {
            goals: ["What does the customer want to achieve, experience, or have?"],
            challenges: ["What problems, difficulties, or frustrations does the customer face?"],
            objections: ["What concerns or reasons might stop the customer from choosing a solution?"]
        },
        // One list each, with the specification's own explanation
        // on each as its "i". The word "Needs" is dropped from
        // each: they sit under a Needs title, which says it once.
        needs: [
            { id: "functional", title: "Functional", text: "The practical task they need to accomplish." },
            { id: "emotional", title: "Emotional", text: "How they want to feel when using the solution." },
            { id: "social", title: "Social", text: "How they want others to see them." }
        ]
    },

    competitors: {
        // The five Types, each name with the explanation the
        // specification gives it. Shown behind the "i" rather
        // than inside the list, so choosing a Type is reading
        // five words rather than five sentences.
        type: BUSINESS_COMPETITOR_TYPES.map(entry => ({
            title: entry.label,
            text: entry.explanation
        })),
        instructions: [
            "Select 3–5 competitors and analyse them for each Customer Segment.",
            "Focus on a relevant product line, pricing tier, or geography."
        ],
        // The specification gives these four as bare questions.
        // The titles naming them are the product owner's, so each
        // gets a box of its own like every other Description's
        // parameters. The questions themselves are still the
        // specification's, word for word.
        description: [
            { id: "offerings", title: "Offerings", text: "What do they sell or provide?" },
            { id: "market", title: "Market", text: "Which areas and industries do they serve?" },
            { id: "acquisition", title: "Customer Acquisition", text: "How do they reach and attract customers?" },
            { id: "experience", title: "Customer Experience", text: "What do customers say about their experience?" }
        ],
        strengths: ["What does the competitor do particularly well?"],
        weaknesses: ["Where does the competitor fall short?"],
        opportunities: ["What changes in the market could benefit the competitor?"],
        threats: ["What could weaken the competitor's position?"],
        insights: [
            "What can you learn from competitors to make your offering more distinctive?"
        ]
    },

    valueProposition: {
        instructions: [
            "Define a clear, concise Value Proposition for each Customer Segment.",
            "State the specific problem you solve and the key benefits you provide.",
            "Explain what makes your offering different or better than competitors."
        ],
        note: [
            "Identify how the Value Proposition addresses each Customer Profile's emotional and social needs."
        ]
    },

    offerings: {
        instructions: [
            "Turn customer problems and functional needs into practical product features and solutions.",
            "Ensure every feature supports the Value Proposition."
        ],
        description: [
            { id: "function", title: "Function", text: "What does it do, and what result should it deliver?" },
            { id: "benefit", title: "Customer Benefit", text: "What problem does it solve, or what does the customer gain or achieve?" },
            { id: "scope", title: "Content & Scope", text: "What does it include, and what are its boundaries?" },
            { id: "delivery", title: "Purchase & Delivery", text: "How does the customer purchase, pay for, and receive the offering?" },
            { id: "support", title: "Support & Communication", text: "What support and communication does the customer receive?" },
            { id: "requirements", title: "Requirements & Conditions", text: "What does the customer need to provide or have, and what conditions apply?" }
        ]
    }

};

/**
 * One named parameter of a Description: its stored key, the name
 * shown as the box's label, and the question it asks -- which its
 * "i" carries.
 */
interface DescriptionPart {
    id: string;
    title: string;
    text: string;
}

/**
 * What a Competitor is asked, once its TYPE is known.
 *
 * The four questions under a competitor's Description are written
 * for a rival business, and three of the five types are not one.
 * A substitute has no customer acquisition to describe; a customer
 * doing the job themselves has no offering to price; the status
 * quo is not a solution at all. Asking those anyway is asking a
 * founder to answer about something that does not exist.
 *
 * So each type may rename a question, re-ask it, or drop it. Only
 * the departures are written here -- a type with nothing to say
 * takes the questions as they stand, which is what the two kinds
 * of actual competitor do.
 *
 * Renaming changes the LABEL, never the stored key: the same
 * answer is the same answer whether the box above it says
 * "Offerings" or "Alternative Solution", so switching the type
 * re-frames the question without losing what has been written
 * under it -- including under a question the new type hides.
 */
interface CompetitorTypeQuestions {
    /** By part id: a new title and/or question, or null to hide. */
    parts?: Record<string, { title?: string; text?: string } | null>;
    /** A new question behind Insights & Differentiation. */
    insights?: string;
}

const COMPETITOR_TYPE_QUESTIONS: Record<string, CompetitorTypeQuestions> = {

    /* A different way of meeting the same need. There is a thing
       to describe and people choosing it, but no rival marketing
       department to study. */
    substitutes: {
        parts: {
            offerings: { title: "Alternative Solution" },
            experience: {
                text: "Why do customers choose this alternative, and what do they value about it?"
            },
            acquisition: null
        },
        insights: "What could make customers switch from this alternative to your offering?"
    },

    /* The customer does it themselves. What matters is what that
       costs them in time and effort, which is where the opening
       is. */
    internal: {
        parts: {
            offerings: {
                title: "Self-Provided Solution",
                text: "How do customers solve or fulfil this need themselves?"
            },
            experience: {
                title: "Customer Experience & Effort",
                text: "What is it like for customers to provide this solution themselves, including the time, skills, resources and effort required?"
            },
            acquisition: null
        },
        insights: "What have you learned from customers solving this themselves, and how could your organization make it easier, better, faster, or more valuable?"
    },

    /* Nothing is being bought at all, so there is no solution to
       describe -- only a habit, and whatever would break it. */
    "status-quo": {
        parts: {
            offerings: null,
            acquisition: null,
            experience: {
                title: "Current Behaviour",
                text: "What do customers currently do, and what keeps them from changing?"
            }
        },
        insights: "What could trigger customers to change?"
    }

};

/** The questions one type of competitor is asked, in page order. */
function competitorParts(typeId: string): DescriptionPart[] {

    const changes = COMPETITOR_TYPE_QUESTIONS[typeId]?.parts;

    if (!changes) {
        return SUBSECTIONS.competitors.description;
    }

    const asked: DescriptionPart[] = [];

    for (const part of SUBSECTIONS.competitors.description) {

        // Absent from the map means unchanged; null means hidden.
        if (!(part.id in changes)) {
            asked.push(part);
            continue;
        }

        const change = changes[part.id];

        if (change === null) {
            continue;
        }

        asked.push({
            id: part.id,
            title: change.title ?? part.title,
            text: change.text ?? part.text
        });

    }

    return asked;

}

/**
 * The one Description parameter that asks whether it applies
 * before it asks anything else -- Business Data, which the
 * specification opens with "If you sell to companies".
 */
const OPTIONAL_DESCRIPTION_PART = "business-data";

/** Which of the three need lists a parameter names. */
type BusinessNeedKind = keyof BusinessProfileNeedsValue;

/**
 * What every OTHER Profile in a Segment has listed under one kind
 * of need, without repeats.
 *
 * Offered as a Profile is typed into, so the same need is recorded
 * in the same words across the Segment. Profiles in one Segment
 * share their needs -- see businessSegmentNeeds, which pools them
 * -- and two spellings of one need pool as two.
 *
 * The Profile being typed into is left out: a list does not
 * suggest itself back.
 */
function otherProfileNeeds(
    segment: BusinessCustomerSegmentValue,
    profileIndex: number,
    kind: BusinessNeedKind
): string[] {

    const offered: string[] = [];
    const seen = new Set<string>();

    segment.profiles.forEach((profile, position) => {

        if (position === profileIndex) {
            return;
        }

        for (const need of profile.needs[kind]) {

            const text = need.trim();

            if (text.length === 0) {
                continue;
            }

            const key = text.toLocaleLowerCase();

            if (!seen.has(key)) {
                seen.add(key);
                offered.push(text);
            }

        }

    });

    return offered;

}

/** The last entry of the Category/Format list. */
const CATEGORY_OTHER = "Other";

interface BusinessFoundationEditorProps {

    value: unknown;

    onChange: (value: BusinessFoundationValue) => void;

    disabled?: boolean;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

    /** See AnswerRendererProps.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * The Target Audience, answered under the Identity System's
     * Positioning subsection. Shown behind the "i" on the first
     * instruction of the first subsection -- the one that asks the
     * founder to divide it into Segments, which is hard to do
     * without being able to read it.
     */
    targetAudience?: string;

    /** The page as four tiles (Customers, Competitors, Value Proposition, Offerings), each opening its part of every Segment in its dialog. */
    asTiles?: boolean;

    /** With `asTiles`: the frame's title over the tiles. */
    frameTitle?: string;

}

/**
 * The Business System's Foundation section (see
 * AnswerType.BusinessFoundation).
 *
 * Four subsections, in the order the specification sets: who the
 * organization serves, who else serves them, what it promises each
 * of those segments, and what it actually sells.
 *
 * The CUSTOMER SEGMENT owns all four. Everything the section asks is
 * asked about a Segment, so every subsection is organised by one: a
 * Segment holds its Profiles, the competitors facing it, the one
 * promise made to it, and the Offerings sold to it -- whose Needs it
 * chooses from its own Profiles. Nothing is asked twice, and nothing
 * floats free of the Segment it concerns.
 */
export default function BusinessFoundationEditor({

    value,

    onChange,

    disabled = false,

    showInstructions = true,

    columnsDivider,

    targetAudience = "",

    asTiles = false

}: BusinessFoundationEditorProps) {

    const foundation = asBusinessFoundationValue(value);

    /**
     * The cards folded away, by key.
     *
     * Not stored with the answer: which cards a reader has closed
     * is how they are looking at the page, not part of what they
     * have said. Everything starts open.
     */
    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());

    // The groups folded inside the Profile, Competitor and Offering
    // cards (see groupFold): every group starts open.
    const [foldedGroups, setFoldedGroups] = useState<ReadonlySet<string>>(new Set());

    /**
     * Which Profile, Competitor and Offering cards are open. These
     * three item kinds start CLOSED -- see useItemFolds -- unlike
     * the Segment above them, which stays on `collapsed` and so
     * starts open.
     */
    const folds = useItemFolds();

    // The latest answer (a card made by a tile's "+" is judged blank, and removed, against the answer as it is by then), the cards as they are built (a tile
    // opens ONE of them floating) and whether the cards being built are opened for that (no fold arrow).
    const latest = useRef(foundation);
    latest.current = foundation;
    const built = new Map<string, ReactNode>();
    let forceOpen = false;

    function update(patch: Partial<BusinessFoundationValue>) {
        onChange({ ...foundation, ...patch });
    }

    function updateSegment(index: number, patch: Partial<BusinessCustomerSegmentValue>) {
        update({
            segments: foundation.segments.map(
                (segment, position) => position === index
                    ? { ...segment, ...patch }
                    : segment
            )
        });
    }

    function updateProfile(
        segmentIndex: number,
        profileIndex: number,
        patch: Partial<BusinessCustomerProfileValue>
    ) {
        updateSegment(segmentIndex, {
            profiles: foundation.segments[segmentIndex].profiles.map(
                (profile, position) => position === profileIndex
                    ? { ...profile, ...patch }
                    : profile
            )
        });
    }

    /* ---------- Building blocks ----------

       Every one of these is now a thin call on the shared pieces in
       BusinessCardFields, which is where they were moved when the
       Customer Engagement page (Page 2) turned out to be built from
       exactly the same ones. They are kept here as functions so
       that not one call site below had to change -- what moved is
       the markup, not the way this page reads. */

    /** A label, with its "i" note when the specification gives one. */
    function labelled(
        label: string,
        control: ReactNode,
        info?: InfoPoint[]
    ) {
        return (
            /* A single choice (a Competitor's or an Offering's Type): its
               label beside it, only as wide as its word, on the picker's
               line -- a compact run of its own, so the card's labels above
               do not pull it on top (.business-field-run-compact). */
            <div className="business-field-run business-field-run-compact">
                <BusinessField label={label} info={info} inline>
                    {control}
                </BusinessField>
            </div>
        );
    }

    function text(
        label: string,
        current: string,
        onNext: (next: string) => void,
        info?: InfoPoint[]
    ) {
        return (
            <BusinessText
                label={label}
                value={current}
                onChange={onNext}
                info={info}
                disabled={disabled}
            />
        );
    }

    function note(
        label: string,
        current: string,
        onNext: (next: string) => void,
        info?: InfoPoint[],
        /** Which Profile or Competitor this is, for assistive technology. */
        whose?: string
    ) {
        return (
            <BusinessNote
                label={label}
                ariaLabel={whose ? whose + " " + label : undefined}
                value={current}
                onChange={onNext}
                info={info}
                disabled={disabled}
            />
        );
    }

    /**
     * A named group of fields inside a card -- the treatment
     * "Competitors SWOT Analysis" already had. Its title is a
     * subhead rather than a field label, so several fields can
     * belong to it and read as one piece of work.
     */
    function group(
        title: string,
        children: ReactNode,
        info?: InfoPoint[],
        fold?: { open: boolean; label: string; onToggle: () => void }
    ) {
        return (
            <BusinessGroup title={title} info={info} fold={fold}>
                {children}
            </BusinessGroup>
        );
    }

    /**
     * A group inside a Profile, Competitor or Offering card that folds
     * (its Description, Motivations, Needs, SWOT): open until folded,
     * remembered while the page is open, as the cards' own folds are.
     */
    function groupFold(itemId: string, title: string, path: string) {
        const key = itemId + " " + title;
        return {
            open: !foldedGroups.has(key),
            label: path + " → " + title,
            onToggle: () => setFoldedGroups(current => toggledIn(current, key))
        };
    }

    /**
     * A Description: one box per named parameter, under one title.
     *
     * It used to be a single box with every parameter's name listed
     * in its placeholder. A box each is the same list made
     * answerable: the parameter names the box, and its "i" carries
     * the question. The question is not repeated inside the box --
     * a prompt that vanishes on the first keystroke is not where an
     * explanation belongs.
     *
     * `kind` only names the fields for a screen reader. Four cards
     * on this page each ask for a "Description", so "Segment
     * description: Demographics" says which one is being read out.
     *
     * `split` lays the parts out in two columns instead of one
     * stack -- for the Segment, whose Description runs the whole
     * width of the card and would otherwise be five boxes in a
     * very long line.
     */
    function description(
        kind: string,
        parts: DescriptionPart[],
        current: BusinessDescriptionValue,
        onNext: (next: BusinessDescriptionValue) => void,
        split = false,
        /** The card, for a Description that sits outside its card's section (the Segment's). */
        anchor?: string,
        /** Its fold, where the group folds (see groupFold). */
        fold?: { open: boolean; label: string; onToggle: () => void }
    ) {

        const box = (part: DescriptionPart) => {

            /*
                A parameter that only applies to some organizations
                asks whether it applies before asking anything else.
                Business Data is the one: "IF YOU SELL TO COMPANIES,
                what is their company type, size and industry?" --
                so a founder selling to people is asked one question
                rather than left looking at a box they should skip.

                The tick is the presence of the parameter's own key.
                Nothing extra is stored to remember it, and an
                answer that already has text reads as ticked.
            */
            const optional = part.id === OPTIONAL_DESCRIPTION_PART;

            const asked = !optional || current[part.id] !== undefined;

            return (
                <div className="business-foundation-field" key={part.id}>

                    <span className="business-foundation-label-info">

                        {optional ? (
                            /*
                                The tick and its name are one label,
                                so the name is clickable. The "i"
                                follows OUTSIDE it: anything inside a
                                label toggles the tick it belongs to,
                                so a button in there would tick the
                                box every time someone asked what it
                                meant.
                            */
                            <label className="business-foundation-tick business-foundation-tick-inline">
                                <input
                                    type="checkbox"
                                    className="brand-tick-box"
                                    disabled={disabled}
                                    checked={asked}
                                    onChange={(event) => {
                                        const next = { ...current };
                                        if (event.target.checked) {
                                            next[part.id] = "";
                                        } else {
                                            delete next[part.id];
                                        }
                                        onNext(next);
                                    }}
                                />
                                <FieldLabel className="business-foundation-label">
                                    {part.title}
                                </FieldLabel>
                            </label>
                        ) : (
                            /* Glued to the name's last word, as every
                               label's "i" is (see InfoText). */
                            <FieldLabel className="business-foundation-label">
                                <InfoText text={part.title}>
                                    <InfoNote
                                        label={part.title}
                                        points={[part.text]}
                                        fullList
                                    />
                                </InfoText>
                                <FieldMark label={part.title} anchor={anchor} />
                            </FieldLabel>
                        )}

                        {optional && (
                            <InfoNote
                                label={part.title}
                                points={[part.text]}
                                fullList
                            />
                        )}

                        {optional && <FieldMark label={part.title} anchor={anchor} />}

                        <FieldStatus label={part.title} anchor={anchor} />

                    </span>

                    {asked && (
                        <StrategyTextArea
                            className="interview-input business-foundation-note"
                            ariaLabel={kind + " description: " + part.title}
                            disabled={disabled}
                            value={current[part.id] ?? ""}
                            onChange={(next) => onNext({
                                ...current,
                                [part.id]: next
                            })}
                        />
                    )}

                </div>
            );

        };

        // Three then two, for the Segment's five: the first column
        // takes the larger half so the two read top-to-bottom,
        // left-to-right.
        const half = Math.ceil(parts.length / 2);

        // The rows of the one grid both columns fill: auto, but the last
        // flexible, so the shorter column's last field (it spans down to
        // it) never stretches a row it shares with the longer column's.
        const descriptionTemplate = half > 1
            ? "repeat(" + (half - 1) + ", auto) 1fr"
            : "auto";

        return group(
            "Description",
            split
                ? (
                    <div
                        className="business-foundation-description-split"
                        style={{
                            "--description-template": descriptionTemplate,
                            "--description-tail": half - (parts.length - half) + 1
                        } as CSSProperties}
                    >
                        <div className="business-foundation-description-column">
                            {parts.slice(0, half).map(box)}
                        </div>
                        <div className="business-foundation-description-column">
                            {parts.slice(half).map(box)}
                        </div>
                    </div>
                )
                : parts.map(box),
            undefined,
            fold
        );

    }

    /** The delete control every card on this page carries. */
    function remove(what: string, onRemove: () => void) {
        return (
            <BusinessRemove what={what} onRemove={onRemove} disabled={disabled} />
        );
    }

    /**
     * One input card: its head, and its fields when it is open.
     *
     * Built the way the Strategic Period page builds its Theme,
     * Goal and Objective boxes: the toggle, the number ("1.") in a
     * .strategy-box-number, THE NAME ASKED in the head itself
     * (CardNameInput), then the card's controls.
     *
     * The name is asked once, in the one place it is also read, and
     * stays legible while the card is folded shut.
     *
     * The Segment's own card is built inline in the render below --
     * it is a grid rather than a stack, because it holds the four
     * subsections side by side -- but its head is this same head.
     */
    function card(
        {
            kind,
            number,
            name,
            onName,
            key,
            actions = null,
            ariaPrefix,
            summary,
            headRow
        }: {
            kind: string;
            number: number;
            name: string;
            onName: (next: string) => void;
            key: string;
            actions?: ReactNode;
            /** "Segment 2": which Segment the card belongs to. */
            ariaPrefix?: string;
            /** The one line shown in the head while the card is folded. */
            summary?: string;
            /** A field under the name, from the name box's edge (see BusinessCard). */
            headRow?: ReactNode;
        },
        children: ReactNode
    ) {

        // Every card this helper builds is a Profile, Competitor or
        // Offering -- the three item kinds -- so all three fold
        // through the shared `folds` state (see useItemFolds). The
        // Segment card that holds them is built inline below and
        // stays on `collapsed`.
        const node = (
            <BusinessCard
                key={key}
                anchor={key}
                kind={kind}
                number={number}
                name={name}
                onName={onName}
                ariaPrefix={ariaPrefix}
                open={forceOpen || folds.isOpen(key)}
                onToggle={forceOpen ? undefined : () => folds.toggle(key)}
                actions={actions}
                disabled={disabled}
                summary={summary}
                headRow={headRow}
            >
                {children}
            </BusinessCard>
        );
        built.set(key, node);
        return node;

    }

    function addButton(label: string, onAdd: () => void, span = false) {
        return (
            <BusinessAddButton label={label} onAdd={onAdd} disabled={disabled} span={span} />
        );
    }

    /*
        What the "i" on the first instruction shows: the Target
        Audience as written, or where to go and write it. A note
        that opened empty would answer a question with silence.
    */
    const targetAudienceNote: InfoPoint[] = [
        targetAudience.trim().length > 0
            ? targetAudience.trim()
            : "Nothing recorded yet. Write it under 1. Identity System → 1. Definition → Positioning."
    ];

    /**
     * The four subsection headings and their guidance -- the same
     * for every Segment, which is why they sit above the process
     * line and outside the input cards.
     */
    const heads = [
        {
            number: 1,
            title: "Customer Segment and Profile",
            instructions: SUBSECTIONS.segments.instructions,
            note: { label: "Your Positioning (Identity)", points: targetAudienceNote }
        },
        {
            number: 2,
            title: "Competitor and Alternative",
            instructions: SUBSECTIONS.competitors.instructions,
            // Who you are compared with follows from where you stand.
            note: { label: "Your Positioning (Identity)", points: targetAudienceNote }
        },
        {
            number: 3,
            title: "Value Proposition",
            instructions: SUBSECTIONS.valueProposition.instructions,
            note: null
        },
        {
            number: 4,
            title: "Offering",
            instructions: SUBSECTIONS.offerings.instructions,
            note: null
        }
    ];

    /**
     * One Segment's answers, as the pieces its card lays out.
     *
     * Everything this section asks is asked about a Segment, so
     * this is the whole of the input: the Segment and its Profiles,
     * the competitors facing it, the one promise made to it, and
     * the Offerings sold to it.
     *
     * Named pieces rather than a list of four, because they are no
     * longer four equal columns: the Segment's own Description runs
     * the width of the card, and the promise made to a Segment sits
     * above the Offerings that have to keep it.
     */
    function subsectionsFor(
        segment: BusinessCustomerSegmentValue,
        segmentIndex: number
    ) {

        /* ---- The Segment's own Description ---- */

        const segmentPath = "Segment " + (segmentIndex + 1);

        const segmentDescription = description(
            segmentPath,
            SUBSECTIONS.segments.segmentDescription,
            segment.description,
            (next) => updateSegment(segmentIndex, { description: next }),
            true,
            segment.id
        );

        /* ---- 1. Its Profiles ---- */

        const profiles = (
            <>

                {segment.profiles.map((profile, profileIndex) => card(
                    {
                        kind: "Profile",
                        ariaPrefix: segmentPath,
                        number: profileIndex + 1,
                        name: profile.name,
                        onName: (next) => updateProfile(
                            segmentIndex, profileIndex, { name: next }
                        ),
                        key: profile.id,
                        // Folded, a Profile shows its number, name and x only.
                        // One Profile card must always exist.
                        actions: segment.profiles.length > 1 &&
                            remove(
                                "Profile " + (profileIndex + 1),
                                () => updateSegment(segmentIndex, {
                                    profiles: segment.profiles.filter(
                                        (_candidate, position) =>
                                            position !== profileIndex
                                    )
                                })
                            )
                    },
                    <>

                        {description(
                            segmentPath + ", Profile " + (profileIndex + 1),
                            SUBSECTIONS.segments.profileDescription,
                            profile.description,
                            (next) => updateProfile(
                                segmentIndex, profileIndex, { description: next }
                            ),
                            false,
                            undefined,
                            groupFold(profile.id, "Description", segmentPath + ", Profile " + (profileIndex + 1))
                        )}

                        {/* What the Profile wants and what stands in
                            the way -- questions about the same thing,
                            asked under one title rather than as three
                            unrelated boxes.

                            Named "Motivations" rather than
                            "Motivations and Needs": the needs now
                            have a titled section of their own just
                            below, and a section called "... and
                            Needs" containing a section called "Needs"
                            says it twice. */}
                        {group("Motivations", <>

                        {note(
                            "Goals & Desires",
                            profile.goals,
                            (next) => updateProfile(
                                segmentIndex, profileIndex, { goals: next }
                            ),
                            SUBSECTIONS.segments.motivations.goals,
                            segmentPath + ", Profile " + (profileIndex + 1)
                        )}

                        {note(
                            "Challenges & Problems",
                            profile.challenges,
                            (next) => updateProfile(
                                segmentIndex, profileIndex, { challenges: next }
                            ),
                            SUBSECTIONS.segments.motivations.challenges,
                            segmentPath + ", Profile " + (profileIndex + 1)
                        )}

                        {note(
                            "Objections",
                            profile.objections,
                            (next) => updateProfile(
                                segmentIndex, profileIndex, { objections: next }
                            ),
                            SUBSECTIONS.segments.motivations.objections,
                            segmentPath + ", Profile " + (profileIndex + 1)
                        )}

                        </>, undefined, groupFold(profile.id, "Motivations", segmentPath + ", Profile " + (profileIndex + 1)))}

                        {/* Three kinds of need under one title, a
                            numbered list each. The list needs no
                            Add button -- Enter opens the next line
                            and Backspace on an empty one takes it
                            away, the way every other list in this
                            Framework behaves (see
                            NumberedListInput) -- and a numbered
                            line is what the Offerings subsection
                            picks from. */}
                        {group("Needs", SUBSECTIONS.segments.needs.map(kind => (
                            <div
                                className="business-foundation-field"
                                key={kind.id}
                            >

                                <span className="business-foundation-label-info">
                                    <FieldLabel className="business-foundation-label">
                                        <InfoText text={kind.title}>
                                            <InfoNote
                                                label={kind.title}
                                                points={[kind.text]}
                                                fullList
                                            />
                                        </InfoText>
                                        <FieldMark label={kind.title} />
                                    </FieldLabel>
                                    <FieldStatus label={kind.title} />
                                </span>

                                <NumberedListInput
                                    label={
                                        kind.title +
                                        " needs for " + segmentPath + ", Profile " + (profileIndex + 1)
                                    }
                                    items={profile.needs[kind.id as BusinessNeedKind]}
                                    disabled={disabled}
                                    /* What the OTHER Profiles in this
                                       Segment have called this need,
                                       offered as it is typed. They
                                       share their needs, so the
                                       second Profile to want the same
                                       thing should be able to say so
                                       in the same words -- typing it
                                       afresh is how "Bill on time"
                                       and "Billing on time" become
                                       two needs that are one. */
                                    suggestions={otherProfileNeeds(
                                        segment,
                                        profileIndex,
                                        kind.id as BusinessNeedKind
                                    )}
                                    onChange={(items) => updateProfile(
                                        segmentIndex, profileIndex, {
                                            needs: {
                                                ...profile.needs,
                                                [kind.id]: items
                                            }
                                        }
                                    )}
                                />

                            </div>
                        )), undefined, groupFold(profile.id, "Needs", segmentPath + ", Profile " + (profileIndex + 1)))}

                    </>
                ))}

                {/* Always offered. The specification's "up to 3" is
                    advice, and it is given as advice in the guidance
                    above the line -- a founder with a fourth Profile
                    to describe is not served by the button quietly
                    going away. */}
                {addButton("Profile", () => {
                    const profile = createBusinessCustomerProfile();
                    updateSegment(segmentIndex, {
                        profiles: [...segment.profiles, profile]
                    });
                    folds.expand(profile.id);
                }, true)}

            </>
        );

        /* ---- 2. The competitors facing this Segment ---- */

        const competitors = (
            <>

                {segment.competitors.map((competitor, index) => {

                    const change = (
                        patch: Partial<BusinessCompetitorValue>
                    ) => updateSegment(segmentIndex, {
                        competitors: segment.competitors.map(
                            (candidate, position) => position === index
                                ? { ...candidate, ...patch }
                                : candidate
                        )
                    });

                    const chosen = BUSINESS_COMPETITOR_TYPES.find(
                        type => type.id === competitor.type
                    );

                    // What this type changes about the questions,
                    // if anything.
                    const asked = COMPETITOR_TYPE_QUESTIONS[competitor.type] ?? {};

                    return card(
                        {
                            kind: "Competitor",
                            ariaPrefix: segmentPath,
                            number: index + 1,
                            name: competitor.name,
                            onName: (next) => change({ name: next }),
                            key: competitor.id,
                            summary: summaryText(
                                chosen?.label
                            ),
                            // The five Types, each shown with the explanation the specification gives it. Under the name, from its box's edge.
                            headRow: labelled(
                                "Type",
                                <OptionPicker
                                    label={segmentPath + ", Competitor " + (index + 1) + " type"}
                                    hug
                                    options={BUSINESS_COMPETITOR_TYPES.map(
                                        type => type.label
                                    )}
                                    disabled={disabled}
                                    value={chosen ? chosen.label : ""}
                                    onChange={(next) => change({
                                        type: BUSINESS_COMPETITOR_TYPES.find(
                                            type => type.label === next
                                        )?.id ?? ""
                                    })}
                                />,
                                SUBSECTIONS.competitors.type
                            ),
                            actions: segment.competitors.length > 1 &&
                                remove(
                                    "Competitor " + (index + 1),
                                    () => updateSegment(segmentIndex, {
                                        competitors: segment.competitors.filter(
                                            (_candidate, position) =>
                                                position !== index
                                        )
                                    })
                                )
                        },
                        <>

                            {/* What this TYPE of competitor is
                                asked -- see
                                COMPETITOR_TYPE_QUESTIONS. */}
                            {description(
                                segmentPath + ", Competitor " + (index + 1),
                                competitorParts(competitor.type),
                                competitor.description,
                                (next) => change({ description: next }),
                                false,
                                undefined,
                                groupFold(competitor.id, "Description", segmentPath + ", Competitor " + (index + 1))
                            )}

                            {group("Competitors SWOT Analysis", <>

                            {note(
                                "Strengths",
                                competitor.strengths,
                                (next) => change({ strengths: next }),
                                SUBSECTIONS.competitors.strengths,
                                segmentPath + ", Competitor " + (index + 1)
                            )}

                            {note(
                                "Weaknesses",
                                competitor.weaknesses,
                                (next) => change({ weaknesses: next }),
                                SUBSECTIONS.competitors.weaknesses,
                                segmentPath + ", Competitor " + (index + 1)
                            )}

                            {note(
                                "Opportunities",
                                competitor.opportunities,
                                (next) => change({ opportunities: next }),
                                SUBSECTIONS.competitors.opportunities,
                                segmentPath + ", Competitor " + (index + 1)
                            )}

                            {note(
                                "Threats",
                                competitor.threats,
                                (next) => change({ threats: next }),
                                SUBSECTIONS.competitors.threats,
                                segmentPath + ", Competitor " + (index + 1)
                            )}

                            </>, undefined, groupFold(competitor.id, "Competitors SWOT Analysis", segmentPath + ", Competitor " + (index + 1)))}

                            {/* What the SWOT above it was for, so
                                it is titled like the SWOT rather
                                than labelled like one more field
                                inside it. */}
                            {group(
                                "Insights & Differentiation",
                                <StrategyTextArea
                                    className="interview-input business-foundation-note"
                                    ariaLabel={segmentPath + ", Competitor " + (index + 1) + " insights & differentiation"}
                                    disabled={disabled}
                                    value={competitor.insights}
                                    onChange={(next) => change({ insights: next })}
                                />,
                                asked.insights === undefined
                                    ? SUBSECTIONS.competitors.insights
                                    : [asked.insights]
                            )}

                        </>
                    );

                })}

                {addButton("Competitor", () => {
                    const competitor = createBusinessCompetitor();
                    updateSegment(segmentIndex, {
                        competitors: [...segment.competitors, competitor]
                    });
                    folds.expand(competitor.id);
                }, true)}

            </>
        );

        /* ---- 3. The one promise made to this Segment ---- */

        /*
            No card and no Add button: the card IS this Segment, and
            a Segment has exactly one Value Proposition.

            Titled the way every other group on the page is, with
            its "i" on the end of the title. There is one Value
            Proposition per Segment, so it carries no number of its
            own -- and no Segment name either: the card it sits in is
            that Segment, and its head says so.

            It sits in the card's UPPER RIGHT CORNER, spanning the
            head's row and the Description's, so it is read before
            the detail that has to serve it rather than after. The
            two kinds of need it exists to address are recalled
            beneath it.
        */
        const valueProposition = group(
            "Value Proposition",
            <div className="business-foundation-field">

                <StrategyTextArea
                    className="interview-input business-foundation-proposition-input"
                    ariaLabel={
                        "Value Proposition for " +
                        (segment.name.trim() || "Segment " + (segmentIndex + 1))
                    }
                    disabled={disabled}
                    value={segment.valueProposition}
                    onChange={(next) => updateSegment(segmentIndex, {
                        valueProposition: next
                    })}
                />

                {/* The two kinds of need this answer is the one
                    answer for: "Identify how the Value Proposition
                    addresses each Customer Profile's emotional and
                    social needs." They are read here and written in
                    the Profile, so this is a reminder of what has to
                    be addressed, not a second place to answer it --
                    nothing here can be typed in or ticked. */}
                {(() => {

                    const emotional = businessSegmentNeeds(segment, "emotional");
                    const social = businessSegmentNeeds(segment, "social");

                    /* Both headings stand whether or not anything
                       has been written under them. They say what
                       this answer has to address, so a Segment
                       with none recorded is the case where that
                       most needs saying -- and the panel keeps one
                       shape as the Profiles are filled in rather
                       than growing a new section part way
                       through. */

                    const entriesOf = (entries: string[]) => (
                        entries.length > 0 ? (
                            <NumberedListStatic
                                lines={entries.map(entry => ({ key: entry, text: entry }))}
                            />
                        ) : (
                            <p className="business-foundation-empty">
                                None recorded.
                            </p>
                        )
                    );

                    /*
                        Laid out flat rather than as two columns of
                        their own: the two titles, ONE RULE ACROSS
                        BOTH, then the two lists. A rule per column
                        was two rules with a gap between them, which
                        read as two of something rather than as the
                        single line the boxes opposite draw.
                    */
                    return (
                        <div className="business-foundation-needs-recall">

                            <FieldLabel className="business-foundation-label">
                                Emotional Needs
                            </FieldLabel>

                            <FieldLabel className="business-foundation-label">
                                Social Needs
                            </FieldLabel>

                            <div
                                className="business-foundation-needs-recall-rule"
                                aria-hidden="true"
                            />

                            {entriesOf(emotional)}
                            {entriesOf(social)}

                        </div>
                    );

                })()}

            </div>,
            SUBSECTIONS.valueProposition.note
        );

        /* ---- 4. The Offerings sold to this Segment ---- */

        const needs = businessSegmentNeeds(segment, "functional");

        const offerings = (
            <>

                {segment.offerings.map((offering, index) => {

                    const change = (
                        patch: Partial<BusinessOfferingValue>
                    ) => updateSegment(segmentIndex, {
                        offerings: segment.offerings.map(
                            (candidate, position) => position === index
                                ? { ...candidate, ...patch }
                                : candidate
                        )
                    });

                    return card(
                        {
                            kind: "Offering",
                            ariaPrefix: segmentPath,
                            number: index + 1,
                            name: offering.name,
                            onName: (next) => change({ name: next }),
                            key: offering.id,
                            summary: summaryText(
                                offering.category === CATEGORY_OTHER
                                    ? offering.categoryOther
                                    : offering.category,
                                offering.needsAddressed.length
                                    ? offering.needsAddressed.length +
                                        (offering.needsAddressed.length === 1 ? " need" : " needs")
                                    : ""
                            ),
                            // What kind of thing it is, before what it is for: an Offering is a product, a service or both, and that frames everything asked after it. Under the name, from its box's edge.
                            headRow: labelled(
                                "Type",
                                <OptionPicker
                                    label={segmentPath + ", Offering " + (index + 1) + " type"}
                                    hug
                                    options={[...BUSINESS_OFFERING_CATEGORIES]}
                                    disabled={disabled}
                                    value={offering.category}
                                    onChange={(next) => change({
                                        category: next,
                                        categoryOther: next === CATEGORY_OTHER
                                            ? offering.categoryOther
                                            : ""
                                    })}
                                />
                            ),
                            actions: segment.offerings.length > 1 &&
                                remove(
                                    "Offering " + (index + 1),
                                    () => updateSegment(segmentIndex, {
                                        offerings: segment.offerings.filter(
                                            (_candidate, position) =>
                                                position !== index
                                        )
                                    })
                                )
                        },
                        <>

                            {offering.category === CATEGORY_OTHER && text(
                                "Name the type",
                                offering.categoryOther,
                                (next) => change({ categoryOther: next })
                            )}

                            {/* The FUNCTIONAL needs typed into this
                                Segment's own Profiles, more than one
                                selectable. Tick boxes rather than a
                                list, because the choice is a set
                                rather than one value.

                                Functional only: an Offering is the
                                practical thing that gets a job done.
                                How the customer wants to feel about
                                it, and to be seen for it, is what the
                                Value Proposition answers -- and those
                                two are shown there, beneath it. */}
                            <div className="business-foundation-field">

                                <FieldLabel className="business-foundation-label">
                                    Functional Needs Addressed
                                </FieldLabel>

                                {needs.length === 0 ? (
                                    <p className="business-foundation-empty">
                                        Add Functional Needs to a Customer
                                        Profile first, then choose them here.
                                    </p>
                                ) : needs.map(need => (
                                    <label
                                        className="business-foundation-tick"
                                        key={need}
                                    >
                                        <input
                                            type="checkbox"
                                            className="brand-tick-box"
                                            disabled={disabled}
                                            checked={
                                                offering.needsAddressed.includes(need)
                                            }
                                            onChange={(event) => change({
                                                needsAddressed: event.target.checked
                                                    ? [...offering.needsAddressed, need]
                                                    : offering.needsAddressed.filter(
                                                        entry => entry !== need
                                                    )
                                            })}
                                        />
                                        <span className="business-foundation-tick-label">
                                            {need}
                                        </span>
                                    </label>
                                ))}

                            </div>

                            {description(
                                segmentPath + ", Offering " + (index + 1),
                                SUBSECTIONS.offerings.description,
                                offering.description,
                                (next) => change({ description: next }),
                                false,
                                undefined,
                                groupFold(offering.id, "Description", segmentPath + ", Offering " + (index + 1))
                            )}

                        </>
                    );

                })}

                {addButton("Offering", () => {
                    const offering = createBusinessOffering();
                    updateSegment(segmentIndex, {
                        offerings: [...segment.offerings, offering]
                    });
                    folds.expand(offering.id);
                }, true)}

            </>
        );

        return { segmentDescription, profiles, competitors, valueProposition, offerings };

    }

    /* THE PAGE AS TILES (the page's tile system): four tiles, two by two -- Customers (the Segments and their Profiles) and Value Proposition above, Competitors and
       Offerings under them. Everything this page asks is asked about a Segment, so each tile's dialog lists the Segments, each with its part: the Segment and its
       Profiles; what is promised to it; the competitors facing it; the Offerings sold to it. Only the first edits the Segment itself (its name, its x). */
    if (asTiles) {
        const rail = (section: number) => railId(BUSINESS_FOUNDATION_SUBSECTIONS[section]);
        const segmentAdd = (
            <div className="business-foundation-input-actions">
                {addButton("Segment", () => update({
                    segments: [...foundation.segments, createBusinessCustomerSegment(foundation.segments.map(segmentHue))]
                }))}
            </div>
        );
        /** One of a Segment's cards (a Profile, a Competitor, an Offering) as it floats over its tile: open, with no fold arrow. */
        const floatingOf = (segment: BusinessCustomerSegmentValue, index: number, id: string): ReactNode => {
            forceOpen = true;
            try {
                subsectionsFor(segment, index);
            } finally {
                forceOpen = false;
            }
            const node = built.get(id);
            return node ? <div className="column-tile-content" style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}>{node}</div> : null;
        };
        type Kind = "profiles" | "competitors" | "offerings";
        const listOf = (segment: BusinessCustomerSegmentValue, kind: Kind): { id: string; name: string }[] => segment[kind];
        const NOUN: Record<Kind, string> = { profiles: "Profile", competitors: "Competitor", offerings: "Offering" };
        // WHAT A CARD STILL LACKS (SystemCardCompleteness.ts): a card with something written but no name lights its tile, flashing red.
        const missingFoundation = new Map<string, readonly string[]>();
        foundation.segments.forEach(segment => (["profiles", "competitors", "offerings"] as const).forEach(kind => (segment[kind] as unknown as ({ id: string; name: string } & Record<string, unknown>)[]).forEach(entry => {
            const lacks = cardNameMissing(entry);
            if (lacks.length > 0) {
                missingFoundation.set(entry.id, lacks);
            }
        })));
        const addOf = (segmentId: string, kind: Kind): TileAdd => ({
            label: NOUN[kind],
            disabled,
            onAdd: () => {
                const made = kind === "profiles" ? createBusinessCustomerProfile() : kind === "competitors" ? createBusinessCompetitor() : createBusinessOffering();
                onChange({
                    ...latest.current,
                    segments: latest.current.segments.map(segment => segment.id === segmentId ? { ...segment, [kind]: [...segment[kind], made] } : segment)
                });
                return made.id;
            },
            isBlank: (id: string) => {
                const entry = latest.current.segments.flatMap(segment => listOf(segment, kind)).find(candidate => candidate.id === id);
                return !entry || entry.name.trim().length === 0;
            },
            onRemove: (ids: string[]) => onChange({
                ...latest.current,
                segments: latest.current.segments.map(segment => segment.id === segmentId ? { ...segment, [kind]: listOf(segment, kind).filter(entry => !ids.includes(entry.id)) } : segment)
            })
        });
        /** The floating card of a Segment's Description or of its Value Proposition (the cards of a Profile, a Competitor, an Offering come from floatingOf). */
        const ownCard = (segment: BusinessCustomerSegmentValue, index: number, which: "description" | "proposition"): ReactNode => (
            // (Only the section itself: the Segment's number, name and x are the frame's, outside the tiles.)
            <div className="column-tile-content" style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}>
                <div className="business-foundation-input business-foundation-card" data-anchor={segment.id + ":" + (which === "description" ? 0 : 2)}>
                    {which === "description"
                        ? <div className="business-foundation-description" data-rail={rail(0)}>{subsectionsFor(segment, index).segmentDescription}</div>
                        : <div className="business-foundation-proposition" data-rail={rail(2)}>{subsectionsFor(segment, index).valueProposition}</div>}
                </div>
            </div>
        );
        const DESCRIPTION = ":description";
        const PROPOSITION = ":proposition";
        const info = (section: number): InfoPoint[] => [...heads[section].instructions];
        const written = (names: readonly string[], count = 6) => names.map(name => name.trim()).filter(name => name.length > 0).slice(0, count);
        const boxesOf = (segment: BusinessCustomerSegmentValue, kind: Kind): CardBox[] => listOf(segment, kind).map((entry, at) => ({
            id: entry.id,
            missing: missingFoundation.get(entry.id),
            number: at + 1,
            name: entry.name,
            unnamed: "Unnamed " + NOUN[kind].toLowerCase(),
            own: true,
            content: () => null
        }));
        const dialog = (section: number, title: string, body: ReactNode) => (
            <div className="column-tile-content" data-rail={rail(section)}>
                <div className="business-engagement-section-head"><DialogHeading title={title} info={info(section)} /></div>
                {body}
            </div>
        );
        /**
         * A SEGMENT'S FOUR TILES, two by two, in its frame: Customers (its Description and its Profiles), Value Proposition, Competitors and Offerings. Customers, Competitors
         * and Offerings open the small tiles of their cards; every card -- the Description, a Profile, the Value Proposition, a Competitor, an Offering -- floats over its tile.
         */
        const tilesOf = (segment: BusinessCustomerSegmentValue, index: number): SectionTile[] => {
            const cardFor = (id: string): ReactNode => id === segment.id + DESCRIPTION
                ? ownCard(segment, index, "description")
                : id === segment.id + PROPOSITION ? ownCard(segment, index, "proposition") : floatingOf(segment, index, id);
            const listTile = (kind: Kind, section: number, title: string): SectionTile => {
                const add = addOf(segment.id, kind);
                return {
                    id: segment.id + ":" + kind,
                    title,
                    group: title,
                    large: true,
                    view: true,
                    rail: rail(section),
                    note: info(section),
                    holds: listOf(segment, kind).map(entry => entry.id),
                    items: written(listOf(segment, kind).map(entry => entry.name)),
                    itemMarks: listOf(segment, kind).map(() => ({ bullet: true })),
                    links: listOf(segment, kind).filter(entry => entry.name.trim()).slice(0, 6).map(entry => ({ card: entry.id })),
                    add,
                    cardFor,
                    content: () => dialog(section, title, <CardBoxes items={boxesOf(segment, kind)} label={title} what={NOUN[kind]} add={add} autoStart={false} />)
                };
            };
            const profileAdd = addOf(segment.id, "profiles");
            const profileNames = written(segment.profiles.map(profile => profile.name));
            return [
                {
                    id: segment.id + ":customers",
                    title: "Segment Description",
                    group: "Profiles",
                    large: true,
                    view: true,
                    rail: rail(0),
                    // Under the title's rule: PROFILES, centred in capitals with no bullet; the Profiles follow, bulleted.
                    items: ["PROFILES", ...profileNames],
                    itemMarks: [{ centre: true }, ...profileNames.map(() => ({ bullet: true }))],
                    links: [undefined, ...segment.profiles.filter(profile => profile.name.trim()).slice(0, 5).map(profile => ({ card: profile.id }))],
                    note: info(0),
                    holds: segment.profiles.map(profile => profile.id),
                    add: profileAdd,
                    cardFor,
                    // (The Description is the Segment's own, one each: a section of the dialog, not a card; the Profiles under it are the small tiles of their cards.)
                    content: () => dialog(0, "Segment Description", (
                        <>
                            <div className="business-foundation-description" data-rail={rail(0)}>{subsectionsFor(segment, index).segmentDescription}</div>
                            <span className="field-group-title business-foundation-subhead strategy-tiles-label">Profiles</span>
                            <CardBoxes
                                items={boxesOf(segment, "profiles")}
                                label="Profiles"
                                what="Profile"
                                add={profileAdd}
                                autoStart={false}
                            />
                        </>
                    ))
                },
                {
                    id: segment.id + ":value-proposition",
                    title: "Value Proposition",
                    group: "Value Proposition",
                    large: true,
                    rail: rail(2),
                    items: segment.valueProposition.trim() ? [segment.valueProposition.trim()] : [],
                    // (The Value Proposition is a section of the Segment, one each: it opens in the dialog, a tile the arrows go through.)
                    content: () => dialog(2, "Value Proposition", (
                        <div className="column-tile-content" style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}>
                            <div className="business-foundation-proposition" data-rail={rail(2)}>{subsectionsFor(segment, index).valueProposition}</div>
                        </div>
                    ))
                },
                listTile("competitors", 1, "Competitors"),
                listTile("offerings", 3, "Offerings")
            ];
        };
        /** A Segment's frame title: "Segment" until it has a name, then the name; with several Segments each is numbered. */
        const frameName = (segment: BusinessCustomerSegmentValue, index: number) => (foundation.segments.length > 1 ? (index + 1) + ". " : "") + (segment.name.trim() || "Segment");
        return (
            <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <div className="business-foundation-segment-frames">
                    {foundation.segments.map((segment, index) => (
                        <div
                            className="business-foundation-input business-foundation-card business-engagement-input"
                            key={segment.id}
                            data-anchor={segment.id}
                            style={{ "--strategy-theme-hue": workHue("discover") } as CSSProperties}
                        >
                            <div className="card-scroll">
                                <div className="business-capability-section business-capability-tiles-section">
                                    {/* The Segment's frame holds all its tiles: its title is the frame's, as Identity's and Brand's are -- centred, in capitals -- and is the Segment's name, edited right there. */}
                                    <div className="business-engagement-section-head tiles-frame-head business-foundation-frame-head">
                                        <span className="field-group-title business-foundation-subhead business-foundation-frame-title">
                                            {foundation.segments.length > 1 && <span className="business-foundation-frame-number">{(index + 1) + "."}</span>}
                                            <input
                                                type="text"
                                                className="business-foundation-frame-name"
                                                aria-label={"Segment " + (index + 1) + " name"}
                                                placeholder="Segment name"
                                                disabled={disabled}
                                                value={segment.name}
                                                onChange={(event) => updateSegment(index, { name: event.target.value })}
                                            />
                                        </span>
                                        {foundation.segments.length > 1 && remove(
                                            "Segment " + (index + 1),
                                            () => update({ segments: foundation.segments.filter((_candidate, position) => position !== index) })
                                        )}
                                    </div>
                                    <SectionTiles label={frameName(segment, index) + ": Customers, Value Proposition, Competitors, Offerings"} hue={workHue("discover")} tiles={tilesOf(segment, index)} incomplete={missingFoundation} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {segmentAdd}
            </div>
        );
    }

    return (

        <div
            className="answer-columns business-foundation"
            style={{ "--answer-column-count": 4 } as CSSProperties}
        >

            {/* Row 1: the four subsection titles, which a grid row
                sizes together so they share a baseline however long
                one of them runs. */}
            {/* Numbered 1 to 4, which is the order they are meant
                to be worked in: who you serve, who else serves
                them, what you promise them, what you sell them.
                Plain numbers counted on this page, not decimals
                under the page's own number: every level of the
                Foundation pages counts on its own. */}
            {heads.map(head => (
                <h3 className="answer-column-label" key={"title-" + head.number}>
                    <span className="answer-column-label-number">
                        {head.number + "."}
                    </span>
                    <span className="answer-column-label-text">{head.title}</span>
                </h3>
            ))}

            {/* Row 2: the instructions, above the line. */}
            {showInstructions && heads.map(head => (
                <div className="answer-column-questions" key={"questions-" + head.number}>
                    {head.instructions.map((line, index) => (
                        <span
                            className="answer-question-line answer-question-line-bullet"
                            key={line}
                        >
                            {/* The note sits at the end of the
                                instruction it belongs to, inline,
                                so it reads as part of the sentence
                                rather than as a control beside
                                it. */}
                            <InfoText text={"• " + line}>
                                {head.note && index === 0 && (
                                    <InfoNote
                                        label={head.note.label}
                                        points={head.note.points}
                                        fullList
                                    />
                                )}
                            </InfoText>
                        </span>
                    ))}
                </div>
            ))}

            {/* Row 3: the process line, spanning all four
                subsections -- the boundary between what the section
                tells the reader and what it asks them. */}
            {columnsDivider && (
                <div className="answer-columns-divider">
                    {columnsDivider}
                </div>
            )}

            {/* Row 4: ONE INPUT CARD PER SEGMENT.

                Everything this section asks is asked about a
                Segment, so a Segment is what an input card holds --
                all four of its subsections, side by side under
                their own headings. Two Segments are two cards, not
                one card asking everything twice.

                That is the hierarchy the page reads as:

                  Foundation -> Segment 1 -> subsection -> Profile 1

                and it is why folding a card away folds away that
                Segment entire. */}
            {foundation.segments.map((segment, segmentIndex) => {

                const open = !collapsed.has(segment.id);

                return (
                    <div
                        className="business-foundation-input business-foundation-card"
                        key={segment.id}
                        data-anchor={segment.id}
                        /* The colour belongs to THIS Segment: chosen
                           when it was created, against the colours
                           its siblings already had, and carried on it
                           ever since (see pickHue). So deleting the
                           Segment above it does not hand this one
                           that Segment's colour, and adding one
                           never repeats a colour already on the page.

                           A Segment recorded before the colour was
                           stored falls back to the hue its id hashes
                           to. Either hue is drawn as its nearest
                           palette colour (see segmentHue). */
                        style={{
                            "--strategy-theme-hue": segmentHue(segment)
                        } as CSSProperties}
                    >

                        <div className="strategy-box-head business-foundation-input-head fold-card-head">

                            <FoldArrow
                                open={open}
                                label={"Segment " + (segmentIndex + 1)}
                                onToggle={() => setCollapsed(current => toggledIn(current, segment.id))}
                            />

                            {/* A Segment holds cards of other kinds, so it
                                says what it is (see CardNumber). */}
                            <CardNumber number={segmentIndex + 1} kind="Segment" />

                            <FieldMark
                                label={"Segment " + (segmentIndex + 1) + (segment.name.trim() ? ": " + segment.name.trim() : "")}
                                card
                                rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[0])}
                            />

                            {/* The Segment's name, asked in its own
                                head like every other card's. */}
                            <CardNameInput
                                ariaLabel={"Segment " + (segmentIndex + 1) + " name"}
                                placeholder="Segment name"
                                disabled={disabled}
                                value={segment.name}
                                onChange={(name) => updateSegment(segmentIndex, { name })}
                            />

                            {/* One Segment card must always
                                exist. */}
                            {foundation.segments.length > 1 && remove(
                                "Segment " + (segmentIndex + 1),
                                () => update({
                                    segments: foundation.segments.filter(
                                        (_candidate, position) =>
                                            position !== segmentIndex
                                    )
                                })
                            )}

                        </div>

                        {open && (() => {

                            const parts = subsectionsFor(segment, segmentIndex);

                            return (
                                <>

                                    {/* The Segment's own Description,
                                        across the whole card and
                                        directly under its name. It
                                        describes the Segment, so it
                                        comes before everything that
                                        is described in terms of it,
                                        and it has the width for its
                                        parameters to sit two abreast. */}
                                    <div
                                        className="business-foundation-description"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[0])}
                                    >
                                        {parts.segmentDescription}
                                    </div>

                                    {/* The Profiles and the
                                        competitors, side by side
                                        under the Description -- all
                                        three describing the Segment,
                                        so all three in its two
                                        thirds. */}
                                    {/* Each list titled, as the
                                        Description and the Value
                                        Proposition are. */}
                                    <div
                                        className="business-foundation-profiles"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[0])}
                                    >
                                        <span className="field-group-title business-foundation-subhead business-foundation-column-title fold-group-head">
                                            Profiles
                                            <FoldAllToggle
                                                ids={segment.profiles.map(p => p.id)}
                                                folds={folds}
                                                label="profiles"
                                            />
                                        </span>
                                        {parts.profiles}
                                    </div>

                                    <div
                                        className="business-foundation-competitors"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[1])}
                                    >
                                        <span className="field-group-title business-foundation-subhead business-foundation-column-title fold-group-head">
                                            Competitors
                                            <FoldAllToggle
                                                ids={segment.competitors.map(c => c.id)}
                                                folds={folds}
                                                label="competitors"
                                            />
                                        </span>
                                        {parts.competitors}
                                    </div>

                                    {/* The remaining third, in two
                                        rows of its own: what is
                                        promised to the Segment,
                                        level with the Description,
                                        and what is sold to it to
                                        keep that promise, level with
                                        the Profile and Competitor
                                        cards. */}
                                    <div
                                        className="business-foundation-proposition"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[2])}
                                    >
                                        {parts.valueProposition}
                                    </div>

                                    <div
                                        className="business-foundation-offerings"
                                        data-rail={railId(BUSINESS_FOUNDATION_SUBSECTIONS[3])}
                                    >
                                        <span className="field-group-title business-foundation-subhead business-foundation-column-title fold-group-head">
                                            Offerings
                                            <FoldAllToggle
                                                ids={segment.offerings.map(o => o.id)}
                                                folds={folds}
                                                label="offerings"
                                            />
                                        </span>
                                        {parts.offerings}
                                    </div>

                                </>
                            );

                        })()}

                    </div>
                );

            })}

            {/* Row 5: adding a Segment.

                Below the input cards and outside them, because it
                makes the NEXT card. Every other Add button on this
                page sits inside the card it adds to; this one has
                no card to sit in.

                Always offered, for the same reason the Profile's is:
                "1 primary segment (maximum 2)" is advice, and the
                guidance above the line is where it is given. */}
            <div className="business-foundation-input-actions">
                {addButton("Segment", () => update({
                    segments: [
                        ...foundation.segments,
                        /* Given the colours already on the page, so
                           the new card cannot arrive in one of
                           them. */
                        createBusinessCustomerSegment(
                            foundation.segments.map(segmentHue)
                        )
                    ]
                }))}
            </div>

        </div>

    );

}
