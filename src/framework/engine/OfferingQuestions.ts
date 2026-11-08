/**
 * THE OFFERING'S QUESTIONS (doc 43; owner, 2026-11-07: "Update the Value Proposition and Offering card according to their docs"): O1 to O18 in the doc's
 * order, their options, when each is asked and where each starts from; and the Value Proposition's draft and open items (doc 42), which read them.
 * Answers are kept on the Offering under `questions`, question id to the option ids chosen, as the Profile's and the Competitor's are.
 */
import type { SegmentOption } from "./SegmentQuestions.ts";
import { COMPETITOR_VALUES, clearOpenings, valueInSentence } from "./CompetitorQuestions.ts";
import { PROFILE_QUESTIONS, profileRatings } from "./ProfileQuestions.ts";
import type { BusinessCustomerSegmentValue, BusinessOfferingValue } from "./AnswerBusinessFoundation.ts";
import { businessSegmentFunctionalItems } from "./AnswerBusinessFoundation.ts";

export type OfferingAnswers = Record<string, string[]>;
export type OfferingQuestionId = "o1" | "o2" | "o3" | "o3t" | "o4" | "o6" | "o7" | "o8" | "o10" | "o14" | "o15" | "o16" | "o17" | "o18";

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
    /** The Offering's Type: Product, Service or Hybrid (BUSINESS_OFFERING_CATEGORIES); a saved "Other" is still read. */
    type: string;
    /** The business stage (plan, launch, manage, grow), for O2's starting value. */
    stage?: string;
    /** The Segment's Differentiation ids (K14, doc 41; the Positioning one saved before 2026-11-08 is its start), for O4's starting ticks. */
    differentiation?: readonly string[];
    /** The buyer's outcome ids saved on Positioning before 2026-11-08 (no longer asked: O4 owns it), for O4's starting ticks after the differentiation's. */
    outcome?: readonly string[];
    /** The Segment's "How do your customers pay?" ids, for O3's order. */
    pay?: readonly string[];
    /** The worries ticked in the Segment's Profiles' E3, for O8's options. */
    worries?: readonly string[];
    /** The Organisation's country (ISO code), for the cancellation rule O18's "i" shows. */
    country?: string;
    /** The Segment has an end user (its buyer is Proxy or Dual-Intent): the draft's goal and frustration are the end user's (doc 36, 2.1; doc 42, 1). */
    endsUser?: boolean;
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
    { id: "once", label: "One purchase" }, { id: "subscription", label: "A subscription / membership" }, { id: "licence", label: "A licence" },
    { id: "payg", label: "Pay as they go" }, { id: "session", label: "Per session / per hour" }, { id: "rent", label: "Rent / hire" },
    { id: "project", label: "A project or contract" }, { id: "retainer", label: "A monthly retainer" }, { id: "commission", label: "Commission on each sale" },
    { id: "free", label: "Free to them" }
];
/** Options merged into another (2026-11-08): a saved answer of the first is read as the second (asOfferingAnswers). */
const OFFERING_MERGED: Readonly<Record<string, Readonly<Record<string, string>>>> = { o3: { membership: "subscription" } };
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
    { id: "place", label: "A place to work" }, { id: "equipment", label: "Their own equipment or software" },
    // (Added 2026-11-08, the research: a visit needs their home or site; a session needs them there.)
    { id: "home", label: "Access to their home or site" }, { id: "attendance", label: "Their time or attendance" }
    // ("A minimum commitment / term" and "Payment upfront" left on 2026-11-07, owner: "avoid overlapping and repetition": they are payment terms, O3's.
    // "To meet certain conditions" left the same day: the conditions of sale are O18.)
];
/* The questions added on 2026-11-07 (owner, approving the free-text review): L19 to L24 (doc 34). */
const OFFERED: readonly SegmentOption[] = [
    { id: "range", label: "A standard range" }, { id: "custom", label: "Made to order / custom" }, { id: "packages", label: "Packages / tiers" },
    { id: "limited", label: "Limited / seasonal runs" }, { id: "addons", label: "Add-ons / extras" }
];
const LEAD_TIME: readonly SegmentOption[] = [
    { id: "now", label: "Straight away" }, { id: "week", label: "Within a week" }, { id: "weeks", label: "One to four weeks" }, { id: "months", label: "One to three months" }, { id: "longer", label: "Longer" }
];
const PAY_WHEN: readonly SegmentOption[] = [
    { id: "before", label: "Before they get it" }, { id: "deposit", label: "A deposit, then the rest" }, { id: "after", label: "When it is done / delivered" },
    { id: "monthly", label: "In instalments / monthly" }, { id: "invoice", label: "On invoice terms (for example 30 days)" }
];
const REPLY: readonly SegmentOption[] = [
    { id: "sameday", label: "The same day" }, { id: "oneday", label: "Within one working day" }, { id: "fewdays", label: "Within a few days" }, { id: "none", label: "No set time" }
];
const AFTER_SALE: readonly SegmentOption[] = [
    { id: "guarantee", label: "Guarantee / warranty" }, { id: "repairs", label: "Repairs" }, { id: "updates", label: "Updates" }, { id: "training", label: "Training" },
    { id: "replacements", label: "Replacements / refills" }, { id: "none", label: "None" }
];
const CONDITIONS: readonly SegmentOption[] = [
    { id: "minimum", label: "A minimum order" }, { id: "trade", label: "Trade / account only" }, { id: "nonrefundable", label: "Non-refundable once made (unless faulty)" },
    { id: "notice", label: "Notice to cancel" }, { id: "fee", label: "A booking / cancellation fee" }
    // (No age limit: the legal age is O12's, derived, not ticked.)
];
const WORRIES: readonly SegmentOption[] = PROFILE_QUESTIONS.find(question => question.id === "e3")?.options ?? [];
/** The worry "Support" (after they buy) is answered by O7, the help given after the sale, not ticked again in O8 (owner, 2026-11-07: "avoid overlapping and repetition"). */
const SUPPORT_WORRY = "support-after-they-buy";

/** The questions, in the order doc 43 asks them, with the "i" each carries (what the doc's "i" says that is built). */
export const OFFERING_QUESTIONS: readonly OfferingQuestion[] = [
    { id: "o1", label: "What form does it take?", many: false, info: ["It refines the Type. For a Hybrid, make one Offering for each form, or choose the main one.", "Online access: a membership area, a course platform or a subscription library."] },
    { id: "o2", label: "Can customers buy it today?", many: false, info: ["Where it stands today.", "It starts from your business stage; change it for this Offering."] },
    { id: "o3", label: "On what terms do they pay for it?", many: false, info: ["How often they pay, and on what terms. How they pay (card, invoice) is the Segment's question.",
        "Subscription / membership: regular payments until they cancel. Pay as they go: they pay for what they use.",
        "Per session / per hour: a price for each session or hour. Rent / hire: they pay to use it for a time, then give it back.",
        "Commission on each sale: a share of each sale you make for them. Free to them: someone else pays, such as an advertiser or a funder.",
        "A minimum term: write it in the Notes."] },
    { id: "o3t", label: "When do they pay?", many: false, info: ["When the money comes in. How they pay (card, invoice) is the Segment's question."] },
    { id: "o4", label: "What does it do best for the customer?", many: true, max: 3, info: ["The first you tick is the main benefit. The same list as \"What matters most\" on your Profiles and Competitors, so they can be compared.", "The Segment's Differentiation (under its Competitors) starts the ticks, and so does the outcome for the buyer you chose before; change them freely."] },
    { id: "o6", label: "How does the customer receive it?", many: false, info: ["How it reaches them once bought.", "Sent automatically online: a download or an email sent by the shop. Sent by you online: a file you send when it is ready."] },
    { id: "o7", label: "What help do you give after they buy?", many: false, info: ["The help that comes with it after the sale."] },
    { id: "o8", label: "Which of their worries does it answer?", many: true, info: ["The doubts that stop your customers buying from you, as your Profiles say. A worry nothing answers is shown on the Value Proposition.", "Support is answered by the help after they buy, in Support & Communication."] },
    { id: "o10", label: "What does the customer need to give you?", many: true, info: ["What you need from them before or during the work. The details go in the Notes.",
        "A place to work: a desk or a room for you to use. Access to their home or site: the work is done there, such as a repair or a fitting.",
        "Their time or attendance: they must take part or be there, such as at a session or a fitting."] },
    { id: "o14", label: "How is it offered?", many: true, max: 3, info: ["How it is put together for sale: one range, made to each order, packages, limited runs or extras. Counts and what is included go in the Notes.", "Based on: the product mix (Kotler and Keller)."] },
    { id: "o15", label: "How long until they have it?", many: false, info: ["The time from order to having it. How it reaches them is the question below."] },
    { id: "o16", label: "How fast do you reply?", many: false, info: ["How soon a customer hears back. The channels are on the Customer Engagement page."] },
    { id: "o17", label: "What comes after the sale?", many: true, info: ["What the help after the sale includes. How much help there is, is the question above.", "None stands alone: ticking it clears the others."] },
    // O18's "i" says the cancellation rule of the Organisation's country only (offeringInfo); this is what it says with no country, or another one.
    { id: "o18", label: "Which conditions of sale apply?", many: true, info: ["The terms a customer agrees to.", "Cancellation rights differ by country; check the rules where you sell.", "A legal minimum age is not ticked here: write an age limit in the Notes."] }
];

/** What is not covered by the 14 days in the UK and the EU (the same exceptions in both). */
const NOT_COVERED = "Not covered: goods made to their specification or personalised, perishable goods, and leisure, catering or accommodation booked for a set date.";
/** The right to cancel a consumer sale in each of the six countries (doc 43, O18; 2026-11-08): what the "i" says, then its source. */
const CANCELLING: Readonly<Record<string, { rule: readonly string[]; source: string }>> = {
    GB: {
        rule: ["In the UK, a consumer can cancel most online, phone and doorstep sales within 14 days (goods: from delivery; services: from the contract).", NOT_COVERED],
        source: "Based on: the Consumer Contracts Regulations 2013, regulation 28 (UK)."
    },
    IE: {
        rule: ["In Ireland and the EU, a consumer can cancel most online, phone and doorstep sales within 14 days (goods: from delivery; services: from the contract).", NOT_COVERED],
        source: "Based on: the Consumer Rights Directive 2011/83/EU, Article 16 (EU)."
    },
    US: {
        rule: ["No general right to cancel. The FTC Cooling-Off Rule gives 3 business days for sales made at the customer's home or at a temporary location.", "Online, phone and shop sales are not covered. State laws can add more."],
        source: "Based on: the FTC Cooling-Off Rule (US)."
    },
    CA: {
        rule: ["Set by each province, with no general right to cancel an online purchase (Ontario: 10 days for door-to-door sales)."],
        source: "Based on: Ontario's Consumer Protection Act (CA)."
    },
    AU: {
        rule: ["No change-of-mind right for shop or website purchases; 10 business days to cancel an unsolicited sale of $100 or more."],
        source: "Based on: the Australian Consumer Law (ACCC)."
    },
    NZ: {
        rule: ["No change-of-mind right; 5 working days to cancel an uninvited direct sale over $100."],
        source: "Based on: the Fair Trading Act 1986, section 36M (NZ)."
    }
};

/** What a question's "i" says for this Offering: O18 the cancellation rule of the Organisation's country, the others their own. */
export function offeringInfo(id: OfferingQuestionId, context: OfferingContext): readonly string[] {
    const info = OFFERING_QUESTIONS.find(question => question.id === id)?.info ?? [];
    const country = id === "o18" && context.country ? CANCELLING[context.country] : undefined;
    return country ? [info[0], ...country.rule, info[2], country.source] : info;
}

/**
 * The questions of each Description box (doc 43; owner, 2026-11-07): each box asks its questions, one band each, then its optional Notes. A band can hold two
 * rows (O3, the terms, then when they pay).
 */
// (Owner, 2026-11-08, P6 and P7: Function asks O1 alone; Customer Benefit opens with the Functional Needs Addressed (the card draws that band), then O8 and O4; O2 opens
// Purchase & Delivery, and how long until they have it (O15) comes before how they receive it (O6). The codes stay.)
export const OFFERING_BOX_QUESTIONS: Readonly<Record<string, readonly (readonly OfferingQuestionId[])[]>> = {
    function: [["o1"]],
    benefit: [["o8"], ["o4"]],
    scope: [["o14"]],
    delivery: [["o2"], ["o3", "o3t"], ["o15"], ["o6"]],
    support: [["o7"], ["o17"], ["o16"]],
    requirements: [["o10"], ["o18"]]
};

/**
 * A choice of ticks, where "None" stands alone (O17): ticking None clears the others, ticking another clears None. O4 keeps the order they were ticked in, so the
 * first ticked is the main benefit (doc 43, O4): a tick kept stays where it was, a new one goes last.
 */
export function offeringChoose(id: OfferingQuestionId, chosen: readonly string[], next: readonly string[]): string[] {
    if (id === "o4") {
        return [...chosen.filter(entry => next.includes(entry)), ...next.filter(entry => !chosen.includes(entry))];
    }
    if (id !== "o17") {
        return [...next];
    }
    const added = next.filter(entry => !chosen.includes(entry));
    if (added.includes("none")) {
        return ["none"];
    }
    return next.filter(entry => entry !== "none");
}

/** Whether a question is asked of this Offering (doc 43, "Asked when"). */
export function offeringAsks(id: OfferingQuestionId, context: OfferingContext): boolean {
    switch (id) {
        case "o1": return context.type === "Product" || context.type === "Service" || context.type === "Hybrid";
        case "o8": return (context.worries ?? []).some(id => id !== SUPPORT_WORRY);
        case "o10": return context.type === "Service" || context.type === "Hybrid";
        default: return true;
    }
}

/** A question's options for this Offering: O1 follows the Type, O3 puts A project or contract first where the Segment pays by invoice, O8 lists the Profiles' worries. */
export function offeringOptions(id: OfferingQuestionId, context: OfferingContext): readonly SegmentOption[] {
    switch (id) {
        case "o1": return context.type === "Product" ? PRODUCT_FORMS : context.type === "Service" ? SERVICE_FORMS : context.type === "Hybrid" ? [...PRODUCT_FORMS, ...SERVICE_FORMS] : [];
        case "o2": return READINESS;
        case "o3": return (context.pay ?? []).includes("invoice") ? [...PAYMENT.filter(option => option.id === "project"), ...PAYMENT.filter(option => option.id !== "project")] : PAYMENT;
        case "o4": return COMPETITOR_VALUES;
        case "o6": return RECEIVE;
        case "o7": return HELP;
        case "o8": return WORRIES.filter(option => option.id !== SUPPORT_WORRY && (context.worries ?? []).includes(option.id));
        case "o10": return PROVIDE;
        case "o3t": return PAY_WHEN;
        case "o14": return OFFERED;
        case "o15": return LEAD_TIME;
        case "o16": return REPLY;
        case "o17": return AFTER_SALE;
        case "o18": return CONDITIONS;
    }
}

/** Positioning's differentiation, through the value crosswalk (doc 34, 5.2a), as O4's starting ticks (at most three). */
const CROSSWALK: Record<string, readonly string[]> = {
    cost: ["lower-price"],
    convenience: ["speed", "ease-and-convenience"],
    compliance: ["safety-and-low-risk", "trust-and-reputation"],
    premium: ["quality-and-results", "shared-values-or-identity"],
    // The nearest L1 options (owner, 2026-11-08): L1 has no option of their own.
    performance: ["quality-and-results", "expert-knowledge"],
    ecosystem: ["ease-and-convenience"],
    // Personal Service & Relationship (2026-11-08): Personalisation and Support.
    personal: ["a-service-made-for-them", "good-support"]
};
/**
 * The buyer's outcome (Positioning's question 9 until 2026-11-08; O4 is its one owner now, owner: "Move all three"), through the same crosswalk (doc 34, 5.2a): each of its four options has
 * its value in L1 already, so O4 needed no new option; a saved outcome starts O4's ticks after the differentiation's.
 */
const OUTCOME_CROSSWALK: Record<string, readonly string[]> = {
    savings: ["lower-price"],
    time: ["speed", "ease-and-convenience"],
    assurance: ["safety-and-low-risk", "trust-and-reputation"],
    prestige: ["quality-and-results", "shared-values-or-identity"]
};
// (Launching starts "Yes, now", 2026-11-08: a business that is launching sells.)
const STAGE_START: Record<string, string> = { plan: "building", launch: "now", manage: "now", grow: "now" };
const RECEIVE_START: Record<string, string> = { physical: "shipped", digital: "auto", app: "access", access: "access", live: "live", inperson: "inperson" };

/**
 * The answers as the card shows them: those saved, then a starting value where a question has none (doc 43: O2 from the business stage, O4 from the
 * Segment's differentiation and the buyer's outcome saved before, O6 from O1), never over an answer chosen; an answer to a question not asked, or an option not offered, is dropped.
 */
export function offeringShown(saved: OfferingAnswers, context: OfferingContext): OfferingAnswers {
    const shown: OfferingAnswers = {};
    for (const question of OFFERING_QUESTIONS) {
        if (!offeringAsks(question.id, context)) {
            continue;
        }
        const offered = offeringOptions(question.id, context).map(option => option.id);
        // A merged option is read as the one kept (OFFERING_MERGED), so an answer saved before the merge still shows.
        const kept = [...new Set((saved[question.id] ?? []).map(id => OFFERING_MERGED[question.id]?.[id] ?? id))].filter(id => offered.includes(id));
        if (kept.length > 0) {
            shown[question.id] = kept;
        }
    }
    if (!saved.o2 && context.stage && STAGE_START[context.stage]) {
        shown.o2 = [STAGE_START[context.stage]];
    }
    if (!saved.o4) {
        const start = [...new Set([...(context.differentiation ?? []).flatMap(id => CROSSWALK[id] ?? []), ...(context.outcome ?? []).flatMap(id => OUTCOME_CROSSWALK[id] ?? [])])].slice(0, 3);
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
    // Merged options (2026-11-08): a saved A membership is A subscription / membership, counted once.
    for (const [id, merged] of Object.entries(OFFERING_MERGED)) {
        if (result[id]) {
            result[id] = [...new Set(result[id].map(option => merged[option] ?? option))];
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
    // (Stay within the rules merged into Meet a requirement, 2026-11-08: the phrase covers both.)
    "meet-a-requirement": "meet their obligations", "learn-something-new": "learn and grow",
    "save-time-money": "save time and money", "get-a-problem-fixed": "get a problem fixed", "enjoy-themselves": "enjoy themselves"
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
    const type = offering.category === "Hybrid" ? "product and service" : offering.category === "Other" ? "offering" : offering.category.toLowerCase();
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
 * answer is missing stays in square brackets; with no clear opening the sentence ends after the benefit. A Segment with an end user reads "For [Segment] whose end users
 * [frustration] and want to [goal]": E1 and E2 are the end user's there (doc 36, 2.1).
 */
export function valuePropositionDraft(segment: BusinessCustomerSegmentValue, offering: BusinessOfferingValue, answers: OfferingAnswers, context: OfferingContext,
    profileAnswers: readonly Record<string, string[]>[] = segment.profiles.map(profile => profile.questions ?? {})): string {
    const profiles = [...profileAnswers];
    const goal = highestRated(profiles, "e1");
    const frustration = highestRated(profiles, "e2");
    const benefit = answers.o4?.[0];
    const name = offering.name.trim() || "[the Offering's name]";
    // A Segment with an end user (Proxy or Dual-Intent): the goal and the frustration are the end user's (doc 36, 2.1), so the sentence says whose ("whose end users").
    const sentence = "For " + segment.name.trim() + (context.endsUser ? " whose end users " : " who ") + (frustration ? FRUSTRATION_PHRASES[frustration] ?? "[a frustration]" : "[a frustration]")
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
 * Offering's answers as its card shows them (offeringShown), in the Segment's order; `profileAnswers` each Profile's, as its card shows them (EffectiveAnswers.ts).
 */
export function valuePropositionOpenItems(segment: BusinessCustomerSegmentValue, answers: readonly OfferingAnswers[],
    profileAnswers: readonly Record<string, string[]>[] = segment.profiles.map(profile => profile.questions ?? {})): OpenItem[] {
    const profiles = [...profileAnswers];
    const named = (offering: BusinessOfferingValue, at: number) => offering.name.trim() || "Offering " + (at + 1);
    const items: OpenItem[] = [];
    const mismatch = valueMismatch(profiles, segment.offerings.map((offering, at) => ({ name: named(offering, at), answers: answers[at] ?? {} })));
    for (const value of mismatch.unmet) {
        items.push({ kind: "Unmet value", text: "Your Profiles care about " + valueWord(value) + ", and no Offering does it best." });
    }
    // An unwanted benefit is one the user ticked: O4's starting ticks (from the Differentiation) are not counted until saved (owner, 2026-11-08).
    const saved = segment.offerings.map((offering, at) => ({ name: named(offering, at), answers: { o4: (offering.questions?.o4 ?? []).filter(id => (answers[at]?.o4 ?? []).includes(id)) } }));
    for (const entry of valueMismatch(profiles, saved).unwanted) {
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
    if (answers.some(entry => (entry.o7 ?? []).some(id => id !== "none"))) {
        answered.add(SUPPORT_WORRY);
    }
    const worries = [...new Set(profiles.flatMap(entry => entry.e3 ?? []))];
    for (const worry of WORRIES.map(option => option.id).filter(id => worries.includes(id) && !answered.has(id))) {
        items.push({ kind: "Worry left open", text: "Your Profiles worry about " + worryWord(worry) + ", and no Offering answers it." });
    }
    return items;
}
