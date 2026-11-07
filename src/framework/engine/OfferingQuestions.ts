/**
 * THE OFFERING'S QUESTIONS (doc 43; owner, 2026-11-07: "Update the Value Proposition and Offering card according to their docs"): O1 to O10 in the doc's
 * order, their options, when each is asked and where each starts from; and the Value Proposition's draft and open items (doc 42), which read them.
 * Answers are kept on the Offering under `questions`, question id to the option ids chosen, as the Profile's and the Competitor's are.
 */
import type { SegmentOption } from "./SegmentQuestions.ts";
import { COMPETITOR_VALUES, clearOpenings, valueInSentence } from "./CompetitorQuestions.ts";
import { PROFILE_QUESTIONS, profileRatings } from "./ProfileQuestions.ts";
import type { BusinessCustomerSegmentValue, BusinessOfferingValue } from "./AnswerBusinessFoundation.ts";
import { businessSegmentFunctionalItems } from "./AnswerBusinessFoundation.ts";

export type OfferingAnswers = Record<string, string[]>;
export type OfferingQuestionId = "o1" | "o2" | "o3" | "o4" | "o6" | "o7" | "o8" | "o10";

export interface OfferingQuestion {
    id: OfferingQuestionId;
    label: string;
    /** Ticks (several) or one choice. */
    many: boolean;
    max?: number;
    info: readonly string[];
}

/** What the Offering's card needs from the rest of the page to ask and start its questions. */
export interface OfferingContext {
    /** The Offering's Type: Product, Service, Hybrid or Other (BUSINESS_OFFERING_CATEGORIES). */
    type: string;
    /** The business stage (plan, launch, manage, grow), for O2's starting value. */
    stage?: string;
    /** Positioning's differentiation ids, for O4's starting ticks. */
    differentiation?: readonly string[];
    /** The Segment's "How do your customers pay?" ids, for O3's order. */
    pay?: readonly string[];
    /** The worries ticked in the Segment's Profiles' E3, for O8's options. */
    worries?: readonly string[];
}

const PRODUCT_FORMS: readonly SegmentOption[] = [
    { id: "physical", label: "A physical item" }, { id: "digital", label: "A digital file" }, { id: "app", label: "An app / online tool" }, { id: "access", label: "Online access" }
];
const SERVICE_FORMS: readonly SegmentOption[] = [
    { id: "live", label: "A live online session" }, { id: "inperson", label: "An in-person service" }, { id: "project", label: "Project work" }, { id: "ongoing", label: "An ongoing service" }
];
const READINESS: readonly SegmentOption[] = [
    { id: "now", label: "Yes, now" }, { id: "almost", label: "Almost ready" }, { id: "trial", label: "In a trial / beta" }, { id: "building", label: "Still being built" }, { id: "idea", label: "Just an idea" }
];
const PAYMENT: readonly SegmentOption[] = [
    { id: "once", label: "One purchase" }, { id: "subscription", label: "A subscription" }, { id: "membership", label: "A membership" }, { id: "licence", label: "A licence" },
    { id: "payg", label: "Pay as they go" }, { id: "project", label: "A project or contract" }, { id: "retainer", label: "A monthly retainer" }
];
const RECEIVE: readonly SegmentOption[] = [
    { id: "auto", label: "Sent automatically online" }, { id: "byyou", label: "Sent by you online" }, { id: "live", label: "In a live online session" }, { id: "inperson", label: "In person" },
    { id: "shipped", label: "Posted / shipped to them" }, { id: "collect", label: "They collect it" }, { id: "access", label: "Ongoing online access" }
];
const HELP: readonly SegmentOption[] = [
    { id: "none", label: "None" }, { id: "guides", label: "Guides and how-tos" }, { id: "auto", label: "Automatic help, such as chat or emails" },
    { id: "personal", label: "Personal help when needed" }, { id: "dedicated", label: "A dedicated person or team" }, { id: "plan", label: "It depends on the plan" }
];
/** L11 as doc 43 lists it for O10. */
const PROVIDE: readonly SegmentOption[] = [
    { id: "access", label: "Access to their systems or information" }, { id: "brief", label: "A clear brief" }, { id: "approval", label: "Approval within an agreed time" },
    { id: "place", label: "A place to work" }, { id: "equipment", label: "Their own equipment or software" }, { id: "commitment", label: "A minimum commitment / term" },
    { id: "upfront", label: "Payment upfront" }, { id: "conditions", label: "To meet certain conditions" }
];
const WORRIES: readonly SegmentOption[] = PROFILE_QUESTIONS.find(question => question.id === "e3")?.options ?? [];

/** The questions, in the order doc 43 asks them, with the "i" each carries (what the doc's "i" says that is built). */
export const OFFERING_QUESTIONS: readonly OfferingQuestion[] = [
    { id: "o1", label: "What form does it take?", many: false, info: ["It refines the Type. A product and a service sold together is the Type Hybrid; make one Offering for each form, or choose the main one.", "Online access: a membership area, a course platform or a subscription library."] },
    { id: "o2", label: "Can customers buy it today?", many: false, info: ["Where it stands today.", "It starts from your business stage; change it for this Offering."] },
    { id: "o3", label: "How do customers pay for it?", many: false, info: ["How often they pay, and on what terms.", "Subscription: regular payments until they cancel. Pay as they go: they pay for what they use."] },
    { id: "o4", label: "What does it do best for the customer?", many: true, max: 3, info: ["The benefits your customers get. The first you tick is the main one. Choose up to three.", "The same list as \"What matters most\" on your Profiles and on your Competitors, so the three can be compared.", "Your Positioning's Differentiation starts the ticks; change them freely."] },
    { id: "o6", label: "How does the customer receive it?", many: false, info: ["How it reaches them once bought.", "Sent automatically online: a download or an email sent by the shop. Sent by you online: a file you send when it is ready."] },
    { id: "o7", label: "What help do you give after they buy?", many: false, info: ["The help that comes with it after the sale."] },
    { id: "o8", label: "Which of their worries does it answer?", many: true, info: ["The doubts that stop your customers buying from you, as your Profiles say. A worry that nothing answers is shown on the Value Proposition tile.", "Select all that apply."] },
    { id: "o10", label: "What does the customer need to give you?", many: true, info: ["What you need from them before or during the work. Write the details in the note."] }
];

/** The two boxes of the card's questions (doc 43): what it is and how it reaches them; what it answers. */
export const OFFERING_BOXES: readonly { title: string; ids: readonly OfferingQuestionId[] }[] = [
    { title: "What it is and how it reaches them", ids: ["o1", "o2", "o3", "o4", "o6", "o7"] },
    { title: "What it answers", ids: ["o8", "o10"] }
];

/** Whether a question is asked of this Offering (doc 43, "Asked when"). */
export function offeringAsks(id: OfferingQuestionId, context: OfferingContext): boolean {
    switch (id) {
        case "o1": return context.type === "Product" || context.type === "Service" || context.type === "Hybrid";
        case "o8": return (context.worries ?? []).length > 0;
        case "o10": return context.type === "Service" || context.type === "Hybrid";
        default: return true;
    }
}

/** A question's options for this Offering: O1 follows the Type, O3 puts A project or contract first where the Segment pays by invoice, O8 lists the Profiles' worries. */
export function offeringOptions(id: OfferingQuestionId, context: OfferingContext): readonly SegmentOption[] {
    switch (id) {
        case "o1": return context.type === "Product" ? PRODUCT_FORMS : context.type === "Service" ? SERVICE_FORMS : context.type === "Hybrid" ? [...PRODUCT_FORMS, ...SERVICE_FORMS] : [];
        case "o2": return READINESS;
        case "o3": return (context.pay ?? []).includes("invoice") ? [PAYMENT[5], ...PAYMENT.filter((_, at) => at !== 5)] : PAYMENT;
        case "o4": return COMPETITOR_VALUES;
        case "o6": return RECEIVE;
        case "o7": return HELP;
        case "o8": return WORRIES.filter(option => (context.worries ?? []).includes(option.id));
        case "o10": return PROVIDE;
    }
}

/** Positioning's differentiation, through the value crosswalk (doc 34, 5.2a), as O4's starting ticks (at most three). */
const CROSSWALK: Record<string, readonly string[]> = {
    cost: ["lower-price"],
    convenience: ["speed", "ease-and-convenience"],
    compliance: ["safety-and-low-risk", "trust-and-reputation"],
    premium: ["quality-and-results", "shared-values-or-identity"]
};
const STAGE_START: Record<string, string> = { plan: "building", launch: "almost", manage: "now", grow: "now" };
const RECEIVE_START: Record<string, string> = { physical: "shipped", digital: "auto", live: "live", access: "access" };

/**
 * The answers as the card shows them: those saved, then a starting value where a question has none (doc 43: O2 from the business stage, O4 from the
 * differentiation, O6 from O1), never over an answer chosen; an answer to a question not asked, or an option not offered, is dropped.
 */
export function offeringShown(saved: OfferingAnswers, context: OfferingContext): OfferingAnswers {
    const shown: OfferingAnswers = {};
    for (const question of OFFERING_QUESTIONS) {
        if (!offeringAsks(question.id, context)) {
            continue;
        }
        const offered = offeringOptions(question.id, context).map(option => option.id);
        const kept = (saved[question.id] ?? []).filter(id => offered.includes(id));
        if (kept.length > 0) {
            shown[question.id] = kept;
        }
    }
    if (!saved.o2 && context.stage && STAGE_START[context.stage]) {
        shown.o2 = [STAGE_START[context.stage]];
    }
    if (!saved.o4) {
        const start = [...new Set((context.differentiation ?? []).flatMap(id => CROSSWALK[id] ?? []))].slice(0, 3);
        if (start.length > 0) {
            shown.o4 = start;
        }
    }
    if (!saved.o6 && shown.o1 && RECEIVE_START[shown.o1[0]]) {
        shown.o6 = [RECEIVE_START[shown.o1[0]]];
    }
    return shown;
}

/** A saved answer, whatever its shape: question ids to lists of option ids. */
export function asOfferingAnswers(source: unknown): OfferingAnswers {
    if (!source || typeof source !== "object") {
        return {};
    }
    const result: OfferingAnswers = {};
    for (const [key, value] of Object.entries(source as Record<string, unknown>)) {
        if (Array.isArray(value) && value.every(entry => typeof entry === "string")) {
            result[key] = value as string[];
        }
    }
    return result;
}

/** The option's words for a printed answer (the documents and the export). */
export function offeringAnswerLines(answers: OfferingAnswers, context: OfferingContext): { label: string; value: string }[] {
    return OFFERING_QUESTIONS.filter(question => (answers[question.id] ?? []).length > 0).map(question => ({
        label: question.label,
        value: (answers[question.id] ?? []).map(id => offeringOptions(question.id, { ...context, worries: WORRIES.map(option => option.id) }).find(option => option.id === id)?.label ?? id).join("; ")
    }));
}

/* ---- The Value Proposition's draft (doc 42, 1; the phrases, doc 34, 5.2d) ---- */

/** Each goal (L4, E1) after "and want to …", and each frustration (L3, E2) after "who …" (doc 34, 5.2d): hidden, only the draft reads them. */
const GOAL_PHRASES: Record<string, string> = {
    "get-easier-access": "get easier access", "express-who-they-are": "express themselves", "win-customers-or-earn-more": "grow their income",
    "meet-a-requirement": "meet their legal duties", "learn-something-new": "learn and grow", "stay-within-the-rules": "run things properly"
};
const FRUSTRATION_PHRASES: Record<string, string> = {
    "it-costs-too-much": "find it too costly", "it-takes-too-long": "wait too long", "the-quality-is-inconsistent": "get uneven results",
    "it-is-hard-to-find-someone-they-trust": "struggle to find someone they trust", "they-lack-the-know-how": "worry about getting it wrong",
    "they-have-no-time-or-capacity": "lack the time or people", "it-is-too-complicated": "find it too complicated"
};

/** The highest-rated option of a Profile question across the Segment's Profiles; ties, and ticks unrated, in the list's order. */
export function highestRated(profiles: readonly Record<string, string[]>[], id: "e1" | "e2"): string | undefined {
    const question = PROFILE_QUESTIONS.find(entry => entry.id === id);
    if (!question) {
        return undefined;
    }
    let best: { option: string; point: number; order: number } | undefined;
    question.options.forEach((option, order) => {
        const ticked = profiles.filter(answers => (answers[id] ?? []).includes(option.id));
        if (ticked.length === 0) {
            return;
        }
        const point = Math.max(0, ...ticked.map(answers => profileRatings(answers, question)[option.id] ?? 0));
        if (!best || point > best.point) {
            best = { option: option.id, point, order };
        }
    });
    return best?.option;
}

/** "a product", "an app / online tool": the Offering's form (O1), else its Type, as it reads after "is". */
function formWords(offering: BusinessOfferingValue, answers: OfferingAnswers, context: OfferingContext): string {
    const form = offeringOptions("o1", context).find(option => option.id === answers.o1?.[0]);
    if (form) {
        return form.label.charAt(0).toLowerCase() + form.label.slice(1);
    }
    const type = offering.category === "Hybrid" ? "product and service" : offering.category === "Other" ? (offering.categoryOther.trim() || "offering") : offering.category.toLowerCase();
    return (/^[aeiou]/i.test(type) ? "an " : "a ") + type;
}

/**
 * Whether the draft is offered (doc 42, 1): the Segment has a name, a Profile has answered E2 or holds a functional need, and an Offering has a Type.
 */
export function draftOffered(segment: BusinessCustomerSegmentValue): boolean {
    return segment.name.trim().length > 0
        && segment.profiles.some(profile => (profile.questions?.e2 ?? []).length > 0 || profile.needs.functional.some(need => need.trim()))
        && segment.offerings.some(offering => offering.category.trim().length > 0);
}

/**
 * The draft sentence for one Offering (doc 42, 1): "For [Segment] who [frustration] and want to [goal], [Offering] is [form] that offers [benefit]. Unlike
 * its competitors, it offers [the clear opening]." The goal and frustration are the highest-rated across the Profiles, in their draft phrases; a blank whose
 * answer is missing stays in square brackets; with no clear opening the sentence ends after the benefit.
 */
export function valuePropositionDraft(segment: BusinessCustomerSegmentValue, offering: BusinessOfferingValue, answers: OfferingAnswers, context: OfferingContext): string {
    const profiles = segment.profiles.map(profile => profile.questions ?? {});
    const goal = highestRated(profiles, "e1");
    const frustration = highestRated(profiles, "e2");
    const benefit = answers.o4?.[0];
    const name = offering.name.trim() || "[the Offering's name]";
    const sentence = "For " + segment.name.trim() + " who " + (frustration ? FRUSTRATION_PHRASES[frustration] ?? "[a frustration]" : "[a frustration]")
        + " and want to " + (goal ? GOAL_PHRASES[goal] ?? "[a goal]" : "[a goal]") + ", " + name + " is " + formWords(offering, answers, context)
        + " that offers " + (benefit ? valueInSentence(benefit) : "[its main benefit]") + ".";
    const clear = clearOpenings(profiles, segment.competitors.map(competitor => competitor.questions ?? {}));
    return clear.length > 0 ? sentence + " Unlike its competitors, it offers " + valueInSentence(clear[0]) + "." : sentence;
}

/* ---- The Value Proposition's open items (doc 42, 2) ---- */

/**
 * The values that do not match (the one function for both items, so the Value Proposition and the Review say the same): what the Profiles care about
 * (B1) that no Offering does best (O4), and what an Offering claims (O4) that no Profile cares about (B1).
 */
export function valueMismatch(profiles: readonly Record<string, string[]>[], offerings: readonly { name: string; answers: OfferingAnswers }[]): { unmet: string[]; unwanted: { offering: string; values: string[] }[] } {
    const cared = new Set(profiles.flatMap(answers => answers.b1 ?? []));
    const given = new Set(offerings.flatMap(offering => offering.answers.o4 ?? []));
    return {
        unmet: COMPETITOR_VALUES.map(value => value.id).filter(id => cared.has(id) && !given.has(id)),
        unwanted: offerings.map(offering => ({ offering: offering.name, values: (offering.answers.o4 ?? []).filter(id => !cared.has(id)) })).filter(entry => entry.values.length > 0)
    };
}

/** One open item: its kind (doc 42's name) and what it says. */
export interface OpenItem {
    kind: "Unmet value" | "Unwanted benefit" | "Unanswered need" | "Unused offering" | "Worry left open";
    text: string;
}

const valueWord = (id: string) => COMPETITOR_VALUES.find(value => value.id === id)?.label ?? id;
const worryWord = (id: string) => WORRIES.find(option => option.id === id)?.label ?? id;

/**
 * The open items of a Segment (doc 42, 2): gaps between what its customers want and what its Offerings give, reminders not errors. `answers` are each
 * Offering's answers as its card shows them (offeringShown), in the Segment's order.
 */
export function valuePropositionOpenItems(segment: BusinessCustomerSegmentValue, answers: readonly OfferingAnswers[]): OpenItem[] {
    const profiles = segment.profiles.map(profile => profile.questions ?? {});
    const named = (offering: BusinessOfferingValue, at: number) => offering.name.trim() || "Offering " + (at + 1);
    const items: OpenItem[] = [];
    const mismatch = valueMismatch(profiles, segment.offerings.map((offering, at) => ({ name: named(offering, at), answers: answers[at] ?? {} })));
    for (const value of mismatch.unmet) {
        items.push({ kind: "Unmet value", text: "Your Profiles care about " + valueWord(value) + ", and no Offering does it best." });
    }
    for (const entry of mismatch.unwanted) {
        items.push({ kind: "Unwanted benefit", text: entry.offering + " does " + entry.values.map(valueWord).join(" and ") + " best, which no Profile ticks as what matters most." });
    }
    const ticked = new Set(segment.offerings.flatMap(offering => offering.needsAddressed));
    const functional = businessSegmentFunctionalItems(segment);
    for (const item of functional) {
        if (!item.ids.some(id => ticked.has(id))) {
            items.push({ kind: "Unanswered need", text: "\"" + item.text + "\" is not addressed by any Offering." });
        }
    }
    const segmentIds = new Set(functional.flatMap(item => item.ids));
    segment.offerings.forEach((offering, at) => {
        if (offering.category.trim() && !offering.needsAddressed.some(id => segmentIds.has(id))) {
            items.push({ kind: "Unused offering", text: named(offering, at) + " addresses none of this Segment's needs." });
        }
    });
    const answered = new Set(answers.flatMap(entry => entry.o8 ?? []));
    const worries = [...new Set(profiles.flatMap(entry => entry.e3 ?? []))];
    for (const worry of WORRIES.map(option => option.id).filter(id => worries.includes(id) && !answered.has(id))) {
        items.push({ kind: "Worry left open", text: "Your Profiles worry about " + worryWord(worry) + ", and no Offering answers it." });
    }
    return items;
}
