/* Part of AnswerBusinessFoundation.ts (split by its sections, 2026-11-10: the same code, in files of one topic each; AnswerBusinessFoundation.ts re-exports every part). */

import { asProfileAnswers } from "../ProfileQuestions.ts";
import { asObject, asText, randomId } from "../Readers.ts";
import { pickHue } from "../AnswerStrategy.ts";
import { type SegmentAnswers, asSegmentAnswers } from "../SegmentQuestions.ts";

/* ==================================================================
   Business System -- Foundation (Page 1)

   See AnswerType.BusinessFoundation, and the specification at
   docs/specifications/business-system/page-1-foundation.md.

   One section, four subsections, and the Customer Segment owns all
   of them. Everything the page asks is asked ABOUT A SEGMENT, so
   everything is stored on one: its Profiles, the competitors facing
   it ("analyse them for each Customer Segment"), the promise made
   to it ("The Value Proposition should be associated with the
   relevant Customer Segment"), and the Offerings sold to it, whose
   Needs come from that Segment's own Profiles.

   A Segment therefore has many Profiles, many competitors and many
   Offerings, but exactly ONE Value Proposition -- which is why that
   one is a string on the Segment rather than a list.
================================================================== */

/*
 * The specification's figures -- one primary Segment up to a
 * maximum of two, up to three Profiles each -- were constants
 * here, and both the editor and this reader enforced them.
 *
 * They are RECOMMENDATIONS, not limits. A founder who has
 * genuinely got three Segments is not helped by an Add button
 * that disappears, and was actively harmed by the reader, which
 * sliced anything past the figure off on the way back in -- a
 * Segment typed today and gone tomorrow.
 *
 * The figures still reach the founder, in the guidance above
 * the process line: "1 primary segment (maximum 2)" and "up to
 * 3 customer profiles". Advice is what they were meant to be.
 */

/**
 * Competitor and alternative types, with the given explanations.
 *
 * Singular, like every other name this page gives a thing --
 * a Segment, a Profile, a Competitor, an Offering. Each of these
 * labels names what ONE competitor is, so a list mixing
 * "Direct competitors" with "Status quo" was reading as two
 * different kinds of answer.
 */
export const BUSINESS_COMPETITOR_TYPES = [
    {
        id: "direct",
        label: "Direct competitor",
        explanation: "Offers a similar solution to the same need in your area."
    },
    {
        id: "indirect",
        // The id stays "indirect": it is what is stored, and
        // renaming the label must not orphan an answer.
        label: "Indirect competitor",
        explanation: "Offers a different solution but solves the same customer problem."
    },
    {
        id: "substitutes",
        label: "Substitute",
        explanation: "Offers an alternative way to satisfy the exact same customer need."
    },
    {
        id: "internal",
        label: "Internal solution",
        explanation: "The customer meets the need without outside help."
    },
    {
        id: "status-quo",
        label: "Status quo",
        explanation: "The customer does nothing and continues with the current situation."
    }
] as const;

/** Offering categories, as the specification lists them: no "Other" (owner, 2026-11-04; doc 43). A saved "Other" still shows until it is changed. */
export const BUSINESS_OFFERING_CATEGORIES = [
    "Product",
    "Service",
    "Hybrid"
] as const;

/**
 * A Description, one entry per named parameter.
 *
 * Keyed by the parameter's own id (see the editor's SUBSECTIONS),
 * not by its position, so the list can be reordered or added to
 * without moving anybody's answers.
 *
 * It was one block of prose covering every parameter at once.
 * Splitting it is what lets each parameter have its own box, its
 * own prompt and its own "i" -- and lets a founder see which of
 * them they have actually answered.
 */
export type BusinessDescriptionValue = Record<string, string>;

/**
 * A Profile's needs, under the three headings the specification
 * names: what the customer has to get done, how they want to feel
 * doing it, and how they want to be seen for it.
 *
 * One list each rather than one flat list. They were a single
 * list of needs with nothing to say which kind each one was --
 * which is most of what the answer is for.
 */
export interface BusinessProfileNeedsValue {
    functional: string[];
    /**
     * Each functional item's id, line for line (owner, 2026-11-07): an Offering ticks an item by its id, so editing the item's words keeps the tick.
     * Kept the same length as `functional` by the reader (ids made from the words for saved items without one) and by the list (`reconcileLineIds`).
     */
    functionalIds?: string[];
    emotional: string[];
    social: string[];
}

/** An id for a functional item that has none (saved before 2026-11-07): made from its words and its place, so reading the same answer gives the same id. */
export function functionalNeedId(text: string, index: number): string {
    let hash = 0;
    for (const char of text.trim().toLocaleLowerCase() + "#" + index) {
        hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }
    return "need-" + (hash >>> 0).toString(36);
}

/** The functional items' ids, one for each item, those saved kept where they line up. */
export function functionalNeedIds(needs: BusinessProfileNeedsValue): string[] {
    const saved = needs.functionalIds ?? [];
    return needs.functional.map((text, index) => saved[index] || functionalNeedId(text, index));
}

/**
 * The ids of a numbered list's lines after an edit, so each line keeps its id: the lines before and after the edited stretch keep theirs; inside it, the
 * lines take the old ids in order and any extra line a new id (Enter splitting a line keeps the id on its first part).
 */
export function reconcileLineIds(oldItems: readonly string[], oldIds: readonly string[], newItems: readonly string[], fresh: () => string): string[] {
    let start = 0;
    while (start < oldItems.length && start < newItems.length && oldItems[start] === newItems[start]) {
        start += 1;
    }
    let tail = 0;
    while (tail < oldItems.length - start && tail < newItems.length - start
        && oldItems[oldItems.length - 1 - tail] === newItems[newItems.length - 1 - tail]) {
        tail += 1;
    }
    const middleOld = oldIds.slice(start, oldItems.length - tail);
    const middleCount = newItems.length - start - tail;
    const middle = Array.from({ length: middleCount }, (_, index) => middleOld[index] ?? fresh());
    return [...oldIds.slice(0, start), ...middle, ...oldIds.slice(oldItems.length - tail)];
}

export interface BusinessCustomerProfileValue {
    id: string;
    name: string;
    description: BusinessDescriptionValue;
    /** The Profile's choice questions (ProfileQuestions.ts): question id -> the option ids chosen. */
    questions?: Record<string, string[]>;
    /**
     * The end user's own part, on a Segment whose buyer is Proxy or Dual-Intent (owner, 2026-11-08; doc 36, 2.1): its answers to the questions both parts ask (A1, A7) and to its
     * own (A8, E4), by question, and its Personal note. The end user's E1, E2 and Needs are kept with the other answers above (`questions`, `goals`, `challenges`, `needs`).
     */
    user?: { questions?: Record<string, string[]>; note?: string };
    goals: string;
    challenges: string;
    objections: string;
    /**
     * One need per entry, rather than one block of prose, in three
     * named lists.
     *
     * The Offerings subsection's "Needs Addressed" is specified as
     * "a drop down selection menu populated with the Needs from the
     * Customer Profile", with more than one selectable -- which only
     * has something to offer if the needs are separate entries.
     */
    needs: BusinessProfileNeedsValue;
}

export interface BusinessCustomerSegmentValue {
    id: string;
    name: string;
    /**
     * The colour this Segment's card is drawn in, chosen when it
     * was created and kept (see pickHue).
     *
     * Optional because Segments recorded before it was stored have
     * none; those fall back to the hue their id hashes to, which
     * is the colour they have always been drawn in.
     */
    hue?: number;
    description: BusinessDescriptionValue;
    /**
     * The choices made in the questions of its Description's boxes
     * and of its user block, by question (see SegmentQuestions.ts).
     * The boxes' own text stays beside them, as notes.
     */
    questions: SegmentAnswers;
    profiles: BusinessCustomerProfileValue[];
    /**
     * This Segment's single Value Proposition -- the one thing the
     * page asks exactly once per Segment.
     */
    valueProposition: string;
    /** The competitors and alternatives facing this Segment. */
    competitors: BusinessCompetitorValue[];
    /** The Offerings sold to this Segment. */
    offerings: BusinessOfferingValue[];
}

export interface BusinessCompetitorValue {
    id: string;
    name: string;
    /** One of BUSINESS_COMPETITOR_TYPES' ids, or "". */
    type: string;
    description: BusinessDescriptionValue;
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
    insights: string;
    /** The answers to the card's questions K1 to K10 (doc 41, CompetitorQuestions.ts): question id to the ids chosen, a rating as "option:point" under "<id>-rating". */
    questions?: Record<string, string[]>;
}

export interface BusinessOfferingValue {
    id: string;
    name: string;
    /**
     * Needs chosen from its own Segment's Profiles, by their ids.
     */
    needsAddressed: string[];
    category: string;
    /** Named when the category is "Other". */
    categoryOther: string;
    description: BusinessDescriptionValue;
    /** The answers to the card's questions O1 to O18 (doc 43, OfferingQuestions.ts; owner 2026-11-07): question id to the option ids chosen. */
    questions?: Record<string, string[]>;
}

/**
 * The whole page: nothing but Segments, because nothing on it is
 * asked of anything else.
 */
export interface BusinessFoundationValue {
    segments: BusinessCustomerSegmentValue[];
}

export function createBusinessCustomerProfile(): BusinessCustomerProfileValue {
    return {
        id: randomId("profile"),
        name: "",
        description: {},
        goals: "",
        challenges: "",
        objections: "",
        needs: { functional: [""], emotional: [""], social: [""] }
    };
}

/**
 * A new Segment.
 *
 * `taken` is the hues its siblings already have, so the colour it
 * is given is one none of them is using.
 */
export function createBusinessCustomerSegment(
    taken: number[] = []
): BusinessCustomerSegmentValue {

    const id = randomId("segment");

    return {
        id,
        hue: pickHue(taken),
        name: "",
        description: {},
        questions: {},
        // "By default, at least 1 Customer Profile card should
        // exist." The competitor and the Offering are there for
        // the same reason: a subsection showing nothing but an Add
        // button reads as missing rather than as empty.
        profiles: [createBusinessCustomerProfile()],
        valueProposition: "",
        competitors: [createBusinessCompetitor()],
        offerings: [createBusinessOffering()]
    };
}

export function createBusinessCompetitor(): BusinessCompetitorValue {
    return {
        id: randomId("competitor"),
        name: "",
        type: "",
        description: {},
        strengths: "",
        weaknesses: "",
        opportunities: "",
        threats: "",
        insights: ""
    };
}

export function createBusinessOffering(): BusinessOfferingValue {
    return {
        id: randomId("offering"),
        name: "",
        needsAddressed: [],
        category: "",
        categoryOther: "",
        description: {}
    };
}

export function businessNeedList(value: unknown, minimum = 0): string[] {

    const list = (Array.isArray(value) ? value : [])
        .map(entry => typeof entry === "string" ? entry : "");

    while (list.length < minimum) {
        list.push("");
    }

    return list;

}

/**
 * A Description as stored, whatever shape it is in.
 *
 * A string is what the single-box Description saved. It covered
 * every parameter at once, so it is read into `firstPartId` --
 * the first box the founder will see -- rather than discarded.
 * Nothing is lost; it just has to be redistributed by hand.
 */
export function asBusinessDescription(
    value: unknown,
    firstPartId: string
): BusinessDescriptionValue {

    if (typeof value === "string") {
        return value.length > 0 ? { [firstPartId]: value } : {};
    }

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const parts: BusinessDescriptionValue = {};

    for (const [key, entry] of Object.entries(source)) {
        if (typeof entry === "string") {
            parts[key] = entry;
        }
    }

    return parts;

}

/**
 * Market Size and Industry Outlook & Trends share one box. An
 * outlook saved in its own box before they merged is appended to
 * the Market Size text, after a blank line, so nothing is lost.
 */
export function withMarketOutlook(parts: BusinessDescriptionValue): BusinessDescriptionValue {

    const { "industry-outlook": outlook, ...rest } = parts;

    if (outlook === undefined) {
        return parts;
    }

    const size = rest["market-size"] ?? "";

    if (outlook.trim().length > 0) {
        rest["market-size"] = size.trim().length > 0 ? size.trimEnd() + "\n\n" + outlook : outlook;
    }

    return rest;

}

/*
 * The first parameter of each Description, named here so a
 * legacy one-block answer lands in a box the founder actually
 * sees. They are the editor's own ids (SUBSECTIONS in
 * BusinessFoundationEditor); kept as plain strings because the
 * parser must not depend on a component.
 */
export const BUSINESS_FIRST_DESCRIPTION_PART = {
    segment: "demographics",
    profile: "personal",
    competitor: "offerings",
    offering: "function"
} as const;

/**
 * A Profile's needs, whatever shape they are in.
 *
 * A flat array is what the single list saved. Its entries were
 * needs of no stated kind, and functional is the kind a plainly
 * written need most often is, so they are read in there rather
 * than dropped. Nothing is lost; some may want moving.
 */
export function asBusinessNeeds(value: unknown): BusinessProfileNeedsValue {

    if (Array.isArray(value)) {
        return {
            functional: businessNeedList(value, 1),
            emotional: [""],
            social: [""]
        };
    }

    const source = value && typeof value === "object"
        ? value as Record<string, unknown>
        : {};

    const functional = businessNeedList(source.functional, 1);
    const saved = Array.isArray(source.functionalIds) ? source.functionalIds.map(entry => typeof entry === "string" ? entry : "") : [];

    return {
        functional,
        functionalIds: functional.map((text, index) => saved[index] || functionalNeedId(text, index)),
        emotional: businessNeedList(source.emotional, 1),
        social: businessNeedList(source.social, 1)
    };

}

export function asBusinessCompetitor(entry: unknown): BusinessCompetitorValue {

    const competitor = asObject(entry);

    return {
        id: asText(competitor.id) || randomId("competitor"),
        name: asText(competitor.name),
        type: asText(competitor.type),
        description: asBusinessDescription(
            competitor.description,
            BUSINESS_FIRST_DESCRIPTION_PART.competitor
        ),
        // One Notes for strengths and weaknesses, one for opportunities and threats (owner, 2026-11-05): kept under `strengths` and `opportunities`;
        // text saved in the second box before is joined in as its own line, "Weaknesses: ..." (and "Strengths: ..." before it, where there is any).
        strengths: joinedNote("Strengths", asText(competitor.strengths), "Weaknesses", asText(competitor.weaknesses)),
        weaknesses: "",
        opportunities: joinedNote("Opportunities", asText(competitor.opportunities), "Threats", asText(competitor.threats)),
        threats: "",
        insights: asText(competitor.insights),
        // (Kept only where something is answered, so a card saved before the questions reads as it did.)
        ...competitorQuestionsOf(competitor.questions)
    };

}

/** Two SWOT boxes as one note: the first as it is while the second is empty; otherwise each, where it has text, on its own line after its name. */
function joinedNote(firstName: string, first: string, secondName: string, second: string): string {
    if (!second.trim()) {
        return first;
    }
    return [first.trim() ? firstName + ": " + first.trim() : "", secondName + ": " + second.trim()].filter(Boolean).join("\n");
}

/** A Competitor's saved questions: lists of words only (doc 41; read by CompetitorQuestions.ts). */
function competitorQuestionsOf(source: unknown): { questions?: Record<string, string[]> } {
    if (!source || typeof source !== "object" || Array.isArray(source)) {
        return {};
    }
    const questions: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
        if (Array.isArray(value) && value.length > 0 && value.every(entry => typeof entry === "string")) {
            questions[key] = value as string[];
        }
    }
    const read = competitorLayoutOf2026_11_04(questions);
    return Object.keys(read).length > 0 ? { questions: read } : {};
}

/**
 * Answers saved under the numbers of the morning of 2026-11-04 (K6 "How do they attract new customers?", K7 the platforms ... K11 the openings) read under the
 * numbers since K6 went (owner, 2026-11-04: it repeated the channels): K6 is dropped and K7 to K11 become K6 to K10. The values had an Other row for a short
 * while: a value written there and its rating are dropped too. The older layout is told by a key only it has, or by its K9 ratings being values, not changes.
 */
function competitorLayoutOf2026_11_04(questions: Record<string, string[]>): Record<string, string[]> {
    const ATTRACT = ["discounts", "trial", "referral", "ads", "content", "events", "partnerships"];
    // (Environment added 2026-11-08 with the Segment's new change, so its rating is not read as the older layout.)
    const CHANGES = ["technology", "regulation", "economy", "society", "supply", "environment"];
    const older = "k11" in questions || "k10-rating" in questions || "k9-other" in questions || "k7-other" in questions
        || (questions.k6 ?? []).some(id => ATTRACT.includes(id))
        || (questions["k9-rating"] ?? []).some(entry => !CHANGES.includes(entry.split(":")[0]));
    if (!older) {
        return questions;
    }
    const read: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(questions)) {
        const match = /^k(\d+)(-.+)?$/.exec(key);
        const n = match ? Number(match[1]) : 0;
        if (n === 6 || key === "k9-other") {
            continue;
        }
        const entries = key === "k9-rating" ? value.filter(entry => !entry.startsWith("other-")) : value;
        if (entries.length > 0) {
            read[n >= 7 ? "k" + (n - 1) + (match?.[2] ?? "") : key] = entries;
        }
    }
    return read;
}

/** The Offering's answers (O1 to O18), kept only where there are some: question ids to lists of option ids. */
function offeringQuestionsOf(source: unknown): { questions?: Record<string, string[]> } {
    if (!source || typeof source !== "object") {
        return {};
    }
    const questions: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
        if (Array.isArray(value) && value.every(entry => typeof entry === "string") && value.length > 0) {
            questions[key] = value as string[];
        }
    }
    return Object.keys(questions).length > 0 ? { questions } : {};
}

export function asBusinessOffering(entry: unknown): BusinessOfferingValue {

    const offering = asObject(entry);

    return {
        id: asText(offering.id) || randomId("offering"),
        name: asText(offering.name),
        needsAddressed: businessNeedList(offering.needsAddressed),
        category: asText(offering.category),
        categoryOther: asText(offering.categoryOther),
        description: asBusinessDescription(
            offering.description,
            BUSINESS_FIRST_DESCRIPTION_PART.offering
        ),
        ...offeringQuestionsOf(offering.questions)
    };

}

/**
 * The stored answer, in the shape the editor expects, whatever was
 * actually saved. One Segment always exists, holding one Profile,
 * one competitor and one Offering: the specification requires a
 * Profile card from the start, and a subsection showing nothing at
 * all reads as broken rather than as empty.
 *
 * Competitors and Offerings were once kept on the page rather than
 * on the Segment. Anything saved that way is read onto the FIRST
 * Segment here, which is where a single-segment answer -- every
 * answer that shape could have produced in practice -- belongs. No
 * migration flag: the reader already has to cope with whatever is
 * on disk, and doing it here means it is done everywhere the answer
 * is read.
 */
export function asBusinessFoundationValue(value: unknown): BusinessFoundationValue {

    const source = asObject(value);

    const pageCompetitors = (Array.isArray(source.competitors) ? source.competitors : [])
        .map(asBusinessCompetitor);

    const pageOfferings = (Array.isArray(source.offerings) ? source.offerings : [])
        .map(asBusinessOffering);

    const segments = (Array.isArray(source.segments) ? source.segments : [])
        .map((entry, index) => {

            const segment = asObject(entry);

            const profiles = (Array.isArray(segment.profiles) ? segment.profiles : [])
                .map(candidate => {

                    const profile = asObject(candidate);
                    // The end user's part (doc 36, 2.1): kept where it holds anything.
                    const userSource = asObject(profile.user);
                    const userQuestions = asProfileAnswers(userSource.questions);
                    const userNote = asText(userSource.note);
                    const user = Object.keys(userQuestions).length > 0 || userNote ? { ...(Object.keys(userQuestions).length > 0 ? { questions: userQuestions } : {}), ...(userNote ? { note: userNote } : {}) } : undefined;

                    return {
                        id: asText(profile.id) || randomId("profile"),
                        name: asText(profile.name),
                        description: asBusinessDescription(
                            profile.description,
                            BUSINESS_FIRST_DESCRIPTION_PART.profile
                        ),
                        ...(Object.keys(asProfileAnswers(profile.questions)).length > 0 ? { questions: asProfileAnswers(profile.questions) } : {}),
                        ...(user ? { user } : {}),
                        goals: asText(profile.goals),
                        challenges: asText(profile.challenges),
                        objections: asText(profile.objections),
                        needs: asBusinessNeeds(profile.needs)
                    };

                });

            const competitors = (Array.isArray(segment.competitors)
                ? segment.competitors
                : []).map(asBusinessCompetitor);

            const offerings = (Array.isArray(segment.offerings)
                ? segment.offerings
                : []).map(asBusinessOffering);

            // The older page-level lists, taken on by the first
            // Segment and only when it has none of its own.
            const inherited = index === 0;

            const ownCompetitors = competitors.length > 0
                ? competitors
                : (inherited ? pageCompetitors : []);

            const ownOfferings = offerings.length > 0
                ? offerings
                : (inherited ? pageOfferings : []);

            // An Offering ticks the Profiles' functional items by id (owner, 2026-11-07): a tick saved as the item's words is read as its id.
            const itemIds = new Map<string, string[]>();
            for (const profile of profiles) {
                const ids = functionalNeedIds(profile.needs);
                profile.needs.functional.forEach((text, at) => {
                    const key = text.trim().toLocaleLowerCase();
                    if (key) {
                        itemIds.set(key, [...(itemIds.get(key) ?? []), ids[at]]);
                    }
                });
            }
            const known = new Set([...itemIds.values()].flat());
            for (const offering of ownOfferings) {
                offering.needsAddressed = [...new Set(offering.needsAddressed.flatMap(entry =>
                    known.has(entry) ? [entry] : (itemIds.get(entry.trim().toLocaleLowerCase()) ?? [entry])))];
            }

            return {
                id: asText(segment.id) || randomId("segment"),
                hue: typeof segment.hue === "number" && Number.isFinite(segment.hue)
                    ? segment.hue
                    : undefined,
                name: asText(segment.name),
                description: withMarketOutlook(asBusinessDescription(
                    segment.description,
                    BUSINESS_FIRST_DESCRIPTION_PART.segment
                )),
                questions: asSegmentAnswers(segment.questions),
                profiles: profiles.length > 0
                    ? profiles
                    : [createBusinessCustomerProfile()],
                valueProposition: asText(segment.valueProposition),
                competitors: ownCompetitors.length > 0
                    ? ownCompetitors
                    : [createBusinessCompetitor()],
                offerings: ownOfferings.length > 0
                    ? ownOfferings
                    : [createBusinessOffering()]
            };

        });

    return {
        segments: segments.length > 0 ? segments : [createBusinessCustomerSegment()]
    };

}

/**
 * The needs of one kind across ALL of a Segment's Profiles, in
 * page order and without repeats.
 *
 * Profiles in one Segment SHARE their needs. Two people in the
 * same segment wanting the same thing is the ordinary case rather
 * than a clash: each Profile lists it because it is true of that
 * Profile, and the Segment has it once. So an Offering is offered
 * it once, and the Value Proposition is reminded of it once.
 *
 * Shared without regard to case or surrounding space, since
 * neither is what makes two needs different: the same words typed
 * into two Profiles are one need however they were capitalised,
 * and the first spelling is the one kept.
 *
 * A need belongs to the Segment that has it, so an Offering sold
 * to one Segment is never offered another Segment's needs.
 */
/** One functional item of a Segment, as an Offering ticks it: its words (the first spelling) and the ids of every Profile item with those words. */
export interface BusinessFunctionalItem {
    text: string;
    ids: string[];
}

/**
 * The functional items of ALL of a Segment's Profiles, in page order, one for the same words on several Profiles (as businessSegmentNeeds pools
 * them), each with the ids an Offering ticks (owner, 2026-11-07: by id, not by text).
 */
export function businessSegmentFunctionalItems(segment: BusinessCustomerSegmentValue): BusinessFunctionalItem[] {
    const items: BusinessFunctionalItem[] = [];
    const byKey = new Map<string, BusinessFunctionalItem>();
    for (const profile of segment.profiles) {
        const ids = functionalNeedIds(profile.needs);
        profile.needs.functional.forEach((need, at) => {
            const text = need.trim();
            if (!text) {
                return;
            }
            const key = text.toLocaleLowerCase();
            const item = byKey.get(key);
            if (item) {
                item.ids.push(ids[at]);
            } else {
                const fresh = { text, ids: [ids[at]] };
                byKey.set(key, fresh);
                items.push(fresh);
            }
        });
    }
    return items;
}

/** The words of the functional items an Offering ticks, in the Segment's order (for the documents and the export). */
export function businessOfferingNeedTexts(segment: BusinessCustomerSegmentValue, offering: BusinessOfferingValue): string[] {
    return businessSegmentFunctionalItems(segment)
        .filter(item => item.ids.some(id => offering.needsAddressed.includes(id)))
        .map(item => item.text);
}

export function businessSegmentNeeds(
    segment: BusinessCustomerSegmentValue,
    kind: "functional" | "emotional" | "social"
): string[] {

    const needs: string[] = [];
    const seen = new Set<string>();

    for (const profile of segment.profiles) {
        for (const need of profile.needs[kind]) {

            const text = need.trim();

            if (text.length === 0) {
                continue;
            }

            const key = text.toLocaleLowerCase();

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            needs.push(text);

        }
    }

    return needs;

}

/**
 * Which of the Foundation section's four subsections are still
 * empty, in page order, so the completeness dialog can name the
 * subsection rather than the section.
 *
 * What counts as answered, per subsection:
 *
 * 1. A named Segment holding a named Profile. The Segment on its
 *    own is a heading; the Profile is the answer.
 * 2. A named competitor or alternative, under any Segment. The
 *    specification asks for three to five, but a page that refused
 *    to finish on four would be enforcing a recommendation.
 * 3. A named Offering, under any Segment.
 * 4. A Value Proposition for every Segment that has a name. One
 *    Segment left blank is the subsection left unfinished, which is
 *    the point of writing one per Segment. (Last since 2026-11-08: it
 *    reads the Offerings, so they come before it.)
 */
export function businessFoundationSubsectionsEmpty(value: unknown): boolean[] {

    const foundation = asBusinessFoundationValue(value);

    const namedSegments = foundation.segments.filter(
        segment => segment.name.trim().length > 0
    );

    const segmentsEmpty = !namedSegments.some(
        segment => segment.profiles.some(profile => profile.name.trim().length > 0)
    );

    const competitorsEmpty = !foundation.segments.some(
        segment => segment.competitors.some(
            competitor => competitor.name.trim().length > 0
        )
    );

    const propositionEmpty = namedSegments.length === 0 ||
        namedSegments.some(segment => segment.valueProposition.trim().length === 0);

    const offeringsEmpty = !foundation.segments.some(
        segment => segment.offerings.some(
            offering => offering.name.trim().length > 0
        )
    );

    return [segmentsEmpty, competitorsEmpty, offeringsEmpty, propositionEmpty];

}

/**
 * The four subsection titles, in page order, for the same dialog.
 *
 * Singular throughout, as the page's headings read them: each
 * names the kind of thing being answered, not the pile of them.
 * The Offering before the Value Proposition (owner, 2026-11-08): the
 * Value Proposition is drafted from the Offerings, so it comes last.
 */
export const BUSINESS_FOUNDATION_SUBSECTIONS = [
    "Customer Segment and Profile",
    "Competitor and Alternative",
    "Offering",
    "Value Proposition"
] as const;
