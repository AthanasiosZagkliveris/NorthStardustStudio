import { ReactNode } from "react";
import type { SegmentIdentity } from "./identityLink.ts";
import { BUSINESS_COMPETITOR_TYPES, BusinessCustomerSegmentValue, BusinessFoundationValue } from "../../../../framework/engine/AnswerUtils.ts";

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
export const SUBSECTIONS = {

    segments: {
        instructions: [
            "Divide your Target Audience into segments, starting with the groups worth most or easiest to reach.", "How many follows your stage: one while planning or launching, up to two while managing, any number while growing.",
            "Define up to 3 customer profiles, including their problems, needs, and the best approach for reaching them."
        ],
        segmentDescription: [
            { id: "demographics", title: "Demographics", text: "What are their age group, education, work situation, household income and gender mix?" },
            { id: "geographics", title: "Geographics", text: "Where do they live, work or operate?" },
            { id: "business-data", title: "Business Data", text: "If you sell to companies, what type of organisation are they, how big, and in which sector and industry?" },
            { id: "purchasing", title: "Purchasing Power & Behaviour", text: "How do they find, choose, buy and pay, and who decides?" },
            // The specification's Market Size, with Industry Outlook &
            // Trends asked in the same box: not the specification's,
            // added at the product owner's request for the Business
            // Plan's Market Analysis. Optional, like every Description
            // parameter.
            { id: "market-size", title: "Market Size & Industry Outlook", text: "How large is this group, and where is its market heading: growth, the changes that matter, how crowded it is?" }
        ],
        // What the "i" of the Segment Description adds to the two instructions (which stand above the line on the page): how the questions of its boxes come and go.
        // (Two points since 2026-11-08: an answer held back while Planning is kept.)
        questionsNote: "The choices in each box follow your Positioning (who buys, their life stage and category) and your stage; a question that leaves a box takes its answer with it.",
        questionsHeldNote: "Some questions wait until you launch; an answer given to one of them is kept.",
        // What the "i" of each box adds to its prompt: what it asks and what its questions follow.
        boxNotes: {
            demographics: [
                "Asked when the customers are people. The age groups follow the life stage chosen in Positioning.", "Minors are asked only the questions that fit them.",
                "Choosing an age group starts the work situation with the one that goes with it, which you can change."
            ],
            geographics: [
                "Where most of your customers are.", "Once you are managing or growing, and for customers in one place or one country: the kind of area they live or work in."
            ],
            "business-data": [
                "Asked when the customers are businesses; for a business buyer this box comes before Geographics.",
                "Where Positioning chose both, the first Segment is of people and the second of businesses; one added later asks which it is."
            ],
            // In the order of a purchase (owner, 2026-11-08, P3).
            purchasing: [
                "Socialising, what makes them shop, how they decide and how they share are asked about people; who decides to buy, about businesses."
            ],
            "market-size": [
                "These answers describe the market the customers belong to."
            ],
            user: [
                "Shown when the buyer buys for someone else (a Proxy or Dual-Intent buyer in Positioning).", "It describes who uses what is bought: their life stage, their school or work, and how comfortable they are online."
            ]
        } as Record<string, string[]>,
        profileDescription: [
            { id: "personal", title: "Specific Personal Information", text: "What are their age, gender, household and work?", textBusiness: "What are their age, job level and role in buying?" },
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
        // A Profile of a Segment with an end user (owner, 2026-11-08: "If the buyer is proxy, the profile should contain questions for both buyer and end user."): its two
        // parts, each a section with its "i" (doc 36, 2.1). Choosing, paying and deciding are the buyer's; who they are, how they use it and what they want from it, the end user's.
        profileParts: {
            buyer: ["The person who chooses and pays: what matters to them when choosing, where they find you, how they compare and what might hold them back."],
            user: ["The person it is for, who uses it: who they are, what they want from it, what frustrates them and what they need."],
            userDual: ["The people the buyer buys for besides themselves (the buyer uses it too): who they are, what they want from it, what frustrates them and what they need.", "What they want, what frustrates them and what they need are asked of a typical user: the buyer or the others."],
            userPersonal: "Who is the end user, the person it is for?",
            userPersonalHint: "Use Notes for a name, what they do and where they live."
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
            // K2 to K4 (owner, 2026-11-08, S10): the box asks where they sell, how big they are and whether they are growing; it no longer promises industries.
            { id: "market", title: "Market", text: "Where do they sell, how big are they, and are they growing?" },
            // "and attract" dropped (2026-11-06): the box asks only where they reach customers (K5), since the attract question went (doc 41).
            { id: "acquisition", title: "Customer Acquisition", text: "How do they reach customers?" },
            { id: "experience", title: "Customer Experience", text: "What do customers say about their experience?" }
        ],
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
            "Say how it meets the emotional and social needs below: those ticked on the Profiles, strongest first, then the lines of their Notes."
        ]
    },

    offerings: {
        instructions: [
            "Turn customer problems and functional needs into practical product features and solutions.",
            "Make sure each one answers your Profiles' needs."
        ],
        description: [
            { id: "function", title: "Function", text: "What does it do, and what result should it deliver?" },
            { id: "benefit", title: "Customer Benefit", text: "Which problem does it solve, in your customers' words?" },
            { id: "scope", title: "Content & Scope", text: "What does it include, and what are its boundaries?" }
        ],
        // The second section of the card, "Terms & Service" (owner, 2026-11-09): how it is bought and delivered, the help given, and what the customers give and agree to.
        terms: [
            { id: "delivery", title: "Purchase & Delivery", text: "The steps from order to delivery: prices, deposits, timings." },
            { id: "support", title: "Support & Communication", text: "What the help and the updates include." },
            { id: "requirements", title: "Requirements & Conditions", text: "The details of what they give you, and the conditions that apply." }
        ]
    }

};

/**
 * One named parameter of a Description: its stored key, the name
 * shown as the box's label, and the question it asks -- which its
 * "i" carries.
 */

/** What each Notes box of a Profile, a Competitor or an Offering is for, shown in the "i" beside its label (owner, 2026-11-12: the box itself stays empty). */
export const NOTE_HELP: Record<string, string> = {
    personal: "A name, a job title, where they live",
    // (The end user's Personal box, doc 36, 2.1.)
    userPersonal: "A name, what they do, where they live",
    psychographics: "What they believe and enjoy, beyond what matters most",
    hubs: "The names of their groups, accounts and events",
    habits: "How they buy, in their words",
    goals: "What they want, in their own words",
    challenges: "What goes wrong for them, in their words",
    objections: "Their doubts, in their own words",
    offerings: "What they sell, by name",
    market: "Other points on their market, such as regions and trends",
    acquisition: "Their account and shop names, their partners",
    experience: "Other points on their service, in their customers' words",
    strengths: "Other strengths and weaknesses you have noticed",
    opportunities: "Other changes that could help or harm them",
    needs: "Other needs, in their words",
    // The Offering's Notes (owner, 2026-11-07).
    function: "What it is, by name",
    benefit: "The benefit in your customers' words",
    scope: "Counts, inclusions and limits",
    delivery: "Packaging and the steps",
    support: "Names and how often",
    requirements: "Care instructions and standards"
};

/** The "i" of a Notes box: its help text, where it has one. */
export const noteInfo = (id: string): string[] | undefined => NOTE_HELP[id] ? [NOTE_HELP[id]] : undefined;

export interface DescriptionPart {
    id: string;
    title: string;
    text: string;
    /** More points for the "i", after the question (what Identity already says). */
    extra?: string[];
    /** Asked without the tick that asks whether it applies (Business Data, where the Segment's customers are businesses). */
    always?: boolean;
    /** The choice questions of the box (see SegmentQuestions.ts), each one band of the box. */
    questions?: ReactNode[];
    /** How tall the box stands (its title and each question with its options, in lines), so the two columns can be of one height. */
    weight?: number;
    /** Under its questions the box also keeps its own text note (the Profile's boxes). */
    note?: boolean;
    /** The heading level of its title (3 where it is a section of its card, 4 where it stands under a section: the Profile's boxes). */
    level?: number;
    /** What its note is for, shown in the "i" beside the Notes label. */
    noteInfo?: string[];
    /**
     * Where its note is kept, when not in the Description's own text under its id (a Profile's Objections, Goals and Challenges notes, and the end user's Personal note: doc 36,
     * 2.1): the note's text, how it is written, and the key of its field where the title is used twice on one card.
     */
    noteValue?: string;
    onNote?: (next: string) => void;
    noteId?: string;
    /** The box's bands, drawn as they are, in place of a band per question (a Profile's Needs in the end user's part). */
    body?: ReactNode;
    /** Where the boxes stand in two columns, this one stays in the first box's column, so it reads right after it (the Segment's End user part: owner, 2026-11-08, P9a). */
    withFirst?: boolean;

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
export interface CompetitorTypeQuestions {
    /** By part id: a new title and/or question, or null to hide. */
    parts?: Record<string, { title?: string; text?: string } | null>;
    /** A new question behind Insights. */
    insights?: string;
}

export const COMPETITOR_TYPE_QUESTIONS: Record<string, CompetitorTypeQuestions> = {

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
        insights: "What have you learned from customers solving this themselves, and how could your organisation make it easier, better, faster, or more valuable?"
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
export function competitorParts(typeId: string): DescriptionPart[] {

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
export const OPTIONAL_DESCRIPTION_PART = "business-data";

/** Which of the three need lists a parameter names. */
export type BusinessNeedKind = "functional" | "emotional" | "social";

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
export function otherProfileNeeds(
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
export const CATEGORY_OTHER = "Other";

export interface BusinessFoundationEditorProps {

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

    /** What Identity says of the seller and buyer relationship, the market structure and the audience: the Segment card follows it (see identityLink.ts). */
    identity?: SegmentIdentity;

    /** The page as four tiles (Customers, Competitors, Value Proposition, Offerings), each opening its part of every Segment in its dialog. */
    asTiles?: boolean;

    /** With `asTiles`: the frame's title over the tiles. */
    frameTitle?: string;

}

/**
 * ONE COLUMN OF BANDS, the width of the card (2026-11-09: one helper for what four places wrote out): a Description in one column, a Profile's Motivations and Needs, a Competitor's
 * question standing alone in a group (K8 to K10). Only the layout; the bands inside are the caller's.
 */
export function SingleColumn({ children }: { children: ReactNode }) {
    return (
        <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization legal-entity-audience business-segment-grid business-segment-grid-single">
            <div className="legal-entity-field">{children}</div>
        </div>
    );
}
