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
        questionsNote: "Which choices each box asks follows your Positioning (who buys, their life stage and category) and your stage. An answer no longer asked is removed.",
        // What the "i" of each box adds to its prompt: what it asks and what its questions follow.
        boxNotes: {
            demographics: [
                "Asked when the customers are people. The age groups follow the life stage chosen in Positioning.", "Questions that do not apply to minors are not asked of them.",
                "Choosing an age group starts the work situation with the one that goes with it, which you can change."
            ],
            geographics: [
                "Where most of your customers are.", "Once you are managing or growing, and for customers in one place or one country: the kind of area they live or work in.",
                "If your customers are in more than one place, make another Segment."
            ],
            "business-data": [
                "Asked when the customers are businesses; for a business buyer this box comes before Geographics.",
                "Where Positioning chose both, the first Segment is of people and the second of businesses; one added later asks which it is."
            ],
            purchasing: [
                "For every customer: online comfort, how they socialise, where they shop, how they pay.",
                "For people: where they discover and share, what makes them shop and how they decide. For businesses: who decides to buy.",
                "The ways of discovering new products that you tick are offered on the Profile as related platforms."
            ],
            "market-size": [
                "These answers describe the market the customers belong to, not your own business."
            ],
            user: [
                "Shown when the buyer buys for someone else (a Proxy or Dual-Intent buyer in Positioning).", "It describes who uses what is bought: their life stage, how they relate to the buyer, how comfortable they are online."
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
            "Ensure every feature supports the Value Proposition."
        ],
        description: [
            { id: "function", title: "Function", text: "What does it do, and what result should it deliver?" },
            { id: "benefit", title: "Customer Benefit", text: "Which problem does it solve, in your customers' words?" },
            { id: "scope", title: "Content & Scope", text: "What does it include, and what are its boundaries?" },
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
/** What each note of a Profile or a Competitor says before anything is written (owner, 2026-11-04): what belongs there and is not asked above. */
export const NOTE_PLACEHOLDERS: Record<string, string> = {
    personal: "A name, a job title, where they live",
    psychographics: "What they believe and enjoy, beyond what matters most",
    hubs: "The names of their groups, accounts and events",
    habits: "Where and when they buy, and the steps",
    goals: "What they want, in their own words",
    challenges: "What goes wrong for them, in their words",
    objections: "Their doubts, in their own words",
    offerings: "What they sell, by name",
    market: "What no answer above says about their market",
    acquisition: "Their account and shop names, their partners",
    experience: "What no rating above says, in their customers' words",
    strengths: "Strengths and weaknesses no rating above says",
    opportunities: "Opportunities and threats no change above says",
    needs: "What no tick above says",
    // The Offering's Notes (owner, 2026-11-07): what no question of the box says.
    function: "What it is, by name",
    benefit: "The benefit in your customers' words",
    scope: "Counts, inclusions and limits",
    delivery: "Packaging and the steps",
    support: "Names and how often",
    requirements: "Care instructions and standards"
};

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
    /** What its note says before anything is written: what belongs there that the questions do not ask. */
    placeholder?: string;

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
    /** A new question behind Insights & Differentiation. */
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
