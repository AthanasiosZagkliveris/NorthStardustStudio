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
import { onlyPlanning } from "./BusinessStage.ts";

export type OfferingAnswers = Record<string, string[]>;
export type OfferingQuestionId = "o1" | "o2" | "o3" | "o3t" | "o4" | "o6" | "o7" | "o8" | "o10" | "o14" | "o15" | "o16" | "o17" | "o18" | "o20" | "o21" | "o22" | "o23";

export interface OfferingQuestion {
    id: OfferingQuestionId;
    label: string;
    /** Ticks (several) or one choice. */
    many: boolean;
    max?: number;
    info: readonly string[];
    /** The list ends with an Other that the user writes in (as a Profile's): its words are kept as the answer `<id>-other`, while Other is ticked. */
    other?: boolean;
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
    /** The Segment's frame (its customers are people or businesses): a business Segment's O18 "i" says consumer cancellation rights do not apply (2026-11-08). */
    frame?: "people" | "business" | "open";
    /** The Segment has an end user (its buyer is Proxy or Dual-Intent): the draft's goal and frustration are the end user's (doc 36, 2.1; doc 42, 1). */
    endsUser?: boolean;
    /** That buyer is Dual-Intent (uses it too): the card keeps "your customers" (2026-11-09; offeringWho). */
    dual?: boolean;
    /** The Segment's reach (Box 2, 1) and its area, a rating (1 rural to 5 urban): O6, O20 and O15 follow them (owner, 2026-11-17). */
    reach?: readonly string[];
    area?: string;
    /** Where the Segment's customers mainly work (workenv): working at home puts Local delivery first in O20 (owner, 2026-11-17). */
    workenv?: string;
    /** How the Segment's customers are paid (Box 1, 7): a fixed salary puts Ongoing first in O3, hourly or variable pay Per session first (1.13, the second batch of the review; owner, 2026-11-18 00:46). */
    workincome?: string;
    /** How much the Segment's Profiles weigh each value of B1 (its ticks, each by its rating, 1 where unrated): O4's order (2.11, the second batch of the review; owner, 2026-11-18 00:46). */
    valueWeights?: Readonly<Record<string, number>>;
    /** And each worry of E3: O8's order. */
    worryWeights?: Readonly<Record<string, number>>;
}

/** A list ordered by its weights, the heaviest first, the rest in their own order (2.11, the second batch of the review; owner, 2026-11-18 00:46). */
function byWeight(options: readonly SegmentOption[], weights: Readonly<Record<string, number>> | undefined): readonly SegmentOption[] {
    if (!weights) {
        return options;
    }
    return options.map((option, at) => ({ option, at })).sort((a, b) => (weights[b.option.id] ?? 0) - (weights[a.option.id] ?? 0) || a.at - b.at).map(entry => entry.option);
}

/** O6's ways for each form (O1; owner, 2026-11-17): a project or ongoing service, every way. */
const RECEIVE_OF_FORM: Readonly<Record<string, readonly string[]>> = {
    physical: ["shipped", "collect", "inperson"],
    digital: ["auto", "byyou"],
    app: ["access"], access: ["access"],
    live: ["live", "inperson"], inperson: ["live", "inperson"]
};
/** What the Segment's reach puts first (owner, 2026-11-17): O6 and O20. */
const REACH_FIRST: Readonly<Record<string, { o6: readonly string[]; o20: readonly string[] }>> = {
    city: { o6: ["inperson", "collect"], o20: ["local"] },
    country: { o6: ["shipped"], o20: ["postal", "courier"] },
    countries: { o6: ["shipped"], o20: ["courier", "fulfilment"] },
    online: { o6: ["auto", "byyou", "access", "live"], o20: [] }
};

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
/* HOW IT REACHES THEM, NAMED (owner, 2026-11-15 16:08 and 16:26: the channels shaped by the earlier answers): O6's follow-ups, each tick a delivery subchannel on
   Customer Engagement (JourneySuggestions.ts), each ending in Other, written in. O18 and O19 are taken: these are O20 to O22. */
const SEND: readonly SegmentOption[] = [
    { id: "courier", label: "Courier" }, { id: "postal", label: "Postal service" }, { id: "local", label: "Local delivery" }, { id: "fulfilment", label: "A fulfilment service" },
    { id: "other", label: "Other" }
];
const FILES: readonly SegmentOption[] = [
    // (Owner, 2026-11-16 16:31: each file service by name, each its own File Delivery channel; a saved "A download link" shows until unticked, OFFERING_RETIRED.)
    { id: "attachment", label: "Email attachment" }, { id: "wetransfer", label: "WeTransfer" }, { id: "googledrive", label: "Google Drive" }, { id: "dropbox", label: "Dropbox" },
    { id: "onedrive", label: "OneDrive" }, { id: "portal", label: "Client portal" },
    { id: "other", label: "Other" }
];
const MEET: readonly SegmentOption[] = [
    { id: "zoom", label: "Zoom" }, { id: "meet", label: "Google Meet" }, { id: "teams", label: "Microsoft Teams" }, { id: "stream", label: "Live stream" },
    { id: "other", label: "Other" }
];
const HELP: readonly SegmentOption[] = [
    { id: "none", label: "None" }, { id: "guides", label: "Guides & how-tos" }, { id: "auto", label: "Automatic help, such as chat or emails" },
    { id: "personal", label: "Personal help when needed" }, { id: "dedicated", label: "A dedicated person or team" },
    // (Owner, 2026-11-16 19:18: help of another kind, written in; each name its own relationship type on Customer Engagement.)
    { id: "other", label: "Other" }
];
/**
 * Options no longer offered whose saved answer still shows (and prints) until it is unticked: O7's "It depends on the plan" (2026-11-09: O7 became ticks, so the plans' different help
 * is ticked as each kind given, and the plans themselves are O14's packages).
 */
const OFFERING_RETIRED: Readonly<Partial<Record<OfferingQuestionId, readonly SegmentOption[]>>> = { o7: [{ id: "plan", label: "It depends on the plan" }], o21: [{ id: "link", label: "A download link" }] };
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
/* HOW THEY HEAR FROM YOU AFTER THE SALE (owner, 2026-11-16 16:31): O23, each tick its Support & Follow Up channel (JourneySuggestions.ts); "Only when they get in touch"
   stands alone, as O7's None. */
const KEEP_IN_TOUCH: readonly SegmentOption[] = [
    { id: "newsletter", label: "A newsletter" }, { id: "offers", label: "Offers & launches by email" }, { id: "social", label: "Posts on social media" },
    { id: "personal", label: "Personal messages" }, { id: "none", label: "Only when they get in touch" }, { id: "other", label: "Other" }
];
const AFTER_SALE: readonly SegmentOption[] = [
    { id: "guarantee", label: "Guarantee / warranty" }, { id: "repairs", label: "Repairs / maintenance" }, { id: "updates", label: "Updates" }, { id: "training", label: "Training" },
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
    { id: "o2", label: "Can your customers buy it today?", many: false, info: ["It starts from your business stage; change it for this Offering."] },
    { id: "o3", label: "On what terms do they pay for it?", many: false, info: ["How often they pay, and on what terms. How they pay (card, invoice) is the Segment's question.",
        "Subscription / membership: regular payments until they cancel.", "Pay as they go: they pay for what they use.",
        "Per session / per hour: a price for each session or hour.", "Rent / hire: they pay to use it for a time, then give it back.",
        "Commission on each sale: a share of each sale you make for them.", "Free to them: someone else pays, such as an advertiser or a funder.",
        "A minimum term: write it in the Notes."] },
    { id: "o3t", label: "When do they pay?", many: false, info: ["When the money comes in."] },
    { id: "o4", label: "Which of what matters most to your customers does it do best?", many: true, max: 3, info: ["The first you tick is the main benefit. The same list as \"What matters most\" on your Profiles and Competitors, so they can be compared.", "The Segment's Differentiation (under its Competitors) starts the ticks; change them freely."] },
    { id: "o6", label: "How do your customers receive it?", many: true, info: ["How it reaches them once bought: tick each way, as one Offering is often delivered in several.", "Sent automatically online: a download or an email sent by the shop.", "Sent by you online: a file you send when it is ready."] },
    { id: "o20", label: "How do you send it?", many: true, other: true, info: ["The way each order travels to them: each becomes a delivery channel on Foundation & Engagement.", "Tick Other to write another."] },
    { id: "o21", label: "How do you send the files?", many: true, other: true, info: ["The way they receive the files: each becomes a delivery channel on Foundation & Engagement.", "Tick Other to write another."] },
    { id: "o22", label: "Which tool do you meet them on?", many: true, other: true, info: ["The tool each live session runs on: each becomes a channel on Foundation & Engagement.", "Tick Other to write another."] },
    { id: "o7", label: "What help do you give after they buy?", many: true, other: true, info: ["The help that comes with it after the sale: tick each kind you give.", "None stands alone: ticking it clears the others.", "Tick Other to write another: each becomes a relationship type on Foundation & Engagement."] },
    { id: "o8", label: "Which of their worries does it answer?", many: true, info: ["The doubts that stop your customers buying from you, as your Profiles say. A worry left unanswered shows as an open item on the Value Proposition.", "Support is answered by the help after they buy, in Support & Communication."] },
    { id: "o10", label: "What do your customers need to give you?", many: true, info: ["What you need from them before or during the work. The details go in the Notes.",
        "A place to work: a desk or a room for you to use. Access to their home or site: the work is done there, such as a repair or a fitting.",
        "Their time or attendance: they must take part or be there, such as at a session or a fitting."] },
    { id: "o14", label: "How is it offered?", many: true, max: 3, info: ["How it is put together for sale: one range, made to each order, packages, limited runs or extras. Counts and what is included go in the Notes.", "Based on: the product mix (Kotler and Keller)."] },
    { id: "o15", label: "How long until they have it?", many: false, info: ["The time from order to having it. How it reaches them is the question above."] },
    { id: "o23", label: "How do you keep in touch after the sale?", many: true, other: true, info: ["How customers hear from you once they've bought: a newsletter, offers by email, posts or a personal note.", "Only when they get in touch stands alone: ticking it clears the others.", "Tick Other to write another."] },
    { id: "o16", label: "How fast do you reply?", many: false, info: ["How soon your customers hear back. The channels are on the Customer Engagement page."] },
    { id: "o17", label: "What comes after the sale?", many: true, info: ["What else comes with it after the sale; the help you give is the question above.", "None stands alone: ticking it clears the others."] },
    // O18's "i" says the cancellation rule of the Organisation's country only (offeringInfo); this is what it says with no country, or another one.
    { id: "o18", label: "Which conditions of sale apply?", many: true, info: ["The terms your customers agree to.", "Cancellation rights differ by country; check the rules where you sell.", "For an age limit, write it in the Notes."] }
];

/** What is not covered by the 14 days in the UK and the EU (the same exceptions in both). */
const NOT_COVERED = "Exceptions: goods made to their specification or personalised, perishable goods, and leisure, catering or accommodation booked for a set date.";
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

/** What O18's "i" says on a business Segment, in place of the consumer rule (phase 5, 2026-11-08). */
export const BUSINESS_CANCELLING = "Between businesses, your contract terms set the cancellation rules.";

/** What a question's "i" says for this Offering: O18 the cancellation rule of the Organisation's country (none between businesses), the others their own. */
export function offeringInfo(id: OfferingQuestionId, context: OfferingContext): readonly string[] {
    const info = OFFERING_QUESTIONS.find(question => question.id === id)?.info ?? [];
    if (id === "o18" && context.frame === "business") {
        return [info[0], BUSINESS_CANCELLING, info[2]];
    }
    const country = id === "o18" && context.country ? CANCELLING[context.country] : undefined;
    return country ? [info[0], ...country.rule, info[2], country.source] : info;
}

/**
 * The questions of each Description box (doc 43; owner, 2026-11-07): each box asks its questions, one band each (one question per band, the tints alternating),
 * then its optional Notes.
 */
// (Owner, 2026-11-08, P6 and P7: Function asks O1 alone; Customer Benefit opens with the Functional Needs Addressed (the card draws that band), then O8 and O4; O2 opens
// Purchase & Delivery, and how long until they have it (O15) comes before how they receive it (O6). The codes stay.)
// (Owner, 2026-11-09: when they pay (O3b) is a band of its own, straight after O3's, no longer a second row in O3's band.)
export const OFFERING_BOX_QUESTIONS: Readonly<Record<string, readonly OfferingQuestionId[]>> = {
    function: ["o1"],
    benefit: ["o8", "o4"],
    scope: ["o14"],
    // (How they receive it and how it is sent before how long until they have it, which starts from them: 1.7, the second batch of the review; owner, 2026-11-18 00:46.)
    delivery: ["o2", "o3", "o3t", "o6", "o20", "o21", "o22", "o15"],
    support: ["o7", "o17", "o23", "o16"],
    requirements: ["o10", "o18"]
};

/**
 * A choice of ticks, where "None" stands alone (O7 and O17): ticking None clears the others, ticking another clears None. O4 keeps the order they were ticked in, so the
 * first ticked is the main benefit (doc 43, O4): a tick kept stays where it was, a new one goes last.
 */
export function offeringChoose(id: OfferingQuestionId, chosen: readonly string[], next: readonly string[]): string[] {
    if (id === "o4") {
        return [...chosen.filter(entry => next.includes(entry)), ...next.filter(entry => !chosen.includes(entry))];
    }
    if (id !== "o17" && id !== "o7" && id !== "o23") {
        return [...next];
    }
    const added = next.filter(entry => !chosen.includes(entry));
    if (added.includes("none")) {
        return ["none"];
    }
    return next.filter(entry => entry !== "none");
}

/** The questions held back while the business is only Planning (owner, 2026-11-08, P5): how fast you reply (O16) and what comes after the sale (O17); shown from Launching. */
export const OFFERING_HELD_WHILE_PLANNING: readonly OfferingQuestionId[] = ["o16", "o17", "o23"];

/**
 * Whether a question is asked of this Offering (doc 43, "Asked when"). A question held back while Planning (an empty stage is Planning) is not asked then, but its saved answer stays
 * on the Offering (only the question answered is ever written), so it shows again from Launching.
 */
/** O6's follow-ups and the ways of receiving each follows: posted or shipped (O20), sent online (O21), a live online session (O22). */
const RECEIVE_FOLLOW_UPS: Readonly<Partial<Record<OfferingQuestionId, readonly string[]>>> = { o20: ["shipped"], o21: ["auto", "byyou"], o22: ["live"] };

export function offeringAsks(id: OfferingQuestionId, context: OfferingContext, answers: OfferingAnswers = {}): boolean {
    const follows = RECEIVE_FOLLOW_UPS[id];
    if (follows) {
        return (answers.o6 ?? []).some(option => follows.includes(option));
    }
    if (OFFERING_HELD_WHILE_PLANNING.includes(id) && onlyPlanning(context.stage)) {
        return false;
    }
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
        case "o3": {
            // (TWO HEADED GROUPS, One purchase and Ongoing (owner, 2026-11-17); a project first in its group where the Segment pays by invoice or purchase order.)
            const ordered = (context.pay ?? []).includes("invoicepo") ? [...PAYMENT.filter(option => option.id === "project"), ...PAYMENT.filter(option => option.id !== "project")] : [...PAYMENT];
            const ongoing = ["subscription", "licence", "payg", "retainer"];
            // (BY HOW THEY ARE PAID (Box 1, 7; 1.13, the second batch of the review; owner, 2026-11-18 00:46): hourly or variable pay puts Per session first in its group; a fixed salary the Ongoing group first.)
            const paid = context.workincome ?? "";
            const once = ordered.filter(option => !ongoing.includes(option.id)).sort((a, b) => paid === "hourly" || paid === "variable" ? Number(b.id === "session") - Number(a.id === "session") : 0);
            const recurring = ordered.filter(option => ongoing.includes(option.id));
            const groups = [once.map((option, at) => at === 0 ? { ...option, heading: "One purchase" } : option), recurring.map((option, at) => at === 0 ? { ...option, heading: "Ongoing" } : option)];
            return (paid === "salary" ? [groups[1], groups[0]] : groups).flat();
        }
        case "o4": return byWeight(COMPETITOR_VALUES, context.valueWeights);
        case "o6": return RECEIVE;
        case "o7": return HELP;
        case "o8": return byWeight(WORRIES.filter(option => option.id !== SUPPORT_WORRY && (context.worries ?? []).includes(option.id)), context.worryWeights);
        case "o10": return PROVIDE;
        case "o3t": return PAY_WHEN;
        case "o14": return OFFERED;
        case "o15": return LEAD_TIME;
        case "o16": return REPLY;
        case "o17": return AFTER_SALE;
        case "o18": return CONDITIONS;
        case "o20": return SEND;
        case "o21": return FILES;
        case "o22": return MEET;
        case "o23": return KEEP_IN_TOUCH;
    }
}

/**
 * WHEN WHERE THE CUSTOMERS ARE AND HOW THEY RECEIVE IT DO NOT FIT (owner, 2026-11-17): customers in several countries or anywhere online, and an Offering given only in
 * person or collected. Null where they fit.
 */
export function offeringReachNote(answers: OfferingAnswers, context: OfferingContext): string | null {
    const reach = context.reach ?? [];
    const ways = answers.o6 ?? [];
    const far = reach.includes("countries") ? "live in several countries" : reach.includes("online") ? "are anywhere online" : "";
    if (!far || ways.length === 0 || !ways.every(way => way === "inperson" || way === "collect")) {
        return null;
    }
    return "Your customers " + far + ", and this Offering is " + (ways.includes("inperson") ? "given in person" : "collected") + ". Add a live online session or shipping, or narrow where your customers are.";
}

/** O15's bands in weeks, the most each allows (Straight away: none), and the next band's words for what to tell customers (owner, 2026-11-17). */
export const LEAD_TIME_WEEKS: Readonly<Record<string, { weeks: number; expect: string; tell: string }>> = {
    now: { weeks: 0, expect: "straight away", tell: "within a week" },
    week: { weeks: 1, expect: "within a week", tell: "1 to 4 weeks" },
    weeks: { weeks: 4, expect: "within four weeks", tell: "1 to 3 months" },
    months: { weeks: 13, expect: "within three months", tell: "longer than three months" }
};
/** The weeks each way of sending (O20) takes, about (owner, 2026-11-17): local delivery the same week. */
export const SENDING_WEEKS: Readonly<Record<string, number>> = { courier: 1, postal: 1, local: 0, fulfilment: 1 };

/** What O10 puts first by the form (O1; 2026-11-09), an order, never a lock: an in-person service, Access to their home or site; a live online session, Their time or attendance. */
const PROVIDE_FIRST: Readonly<Record<string, string>> = { inperson: "home", live: "attendance" };

/**
 * A question's options as the card shows them: those offered, in the order the answers above give (O10 by O1, `answers`), then a retired option still saved (OFFERING_RETIRED),
 * so it shows until it is unticked.
 */
export function offeringOptionsWith(id: OfferingQuestionId, context: OfferingContext, chosen: readonly string[] = [], answers: OfferingAnswers = {}): readonly SegmentOption[] {
    let listed: readonly SegmentOption[] = offeringOptions(id, context);
    // (O6 FILTERED BY THE FORM (O1; owner, 2026-11-17): a saved way outside it stays, with a note.)
    const ways = id === "o6" ? RECEIVE_OF_FORM[answers.o1?.[0] ?? ""] : undefined;
    if (ways) {
        listed = listed.filter(option => ways.includes(option.id) || chosen.includes(option.id))
            .map(option => ways.includes(option.id) ? option : { ...option, note: "Kept from your earlier answer. It sits outside the usual ways to receive this kind of Offering." });
    }
    // (THE SEGMENT'S REACH ORDERS O6 AND O20, and a rural area puts the post and couriers first in O20; never locked.)
    const reachFirst = (context.reach ?? []).flatMap(reach => id === "o6" ? REACH_FIRST[reach]?.o6 ?? [] : id === "o20" ? REACH_FIRST[reach]?.o20 ?? [] : []);
    const rural = id === "o20" && (context.area === "1" || context.area === "2") ? ["postal", "courier"] : [];
    const home = id === "o20" && context.workenv === "remote" ? ["local"] : [];
    const ranked = [...new Set([...reachFirst, ...rural, ...home])];
    if (ranked.length > 0) {
        const rank = (option: string) => ranked.includes(option) ? ranked.indexOf(option) : ranked.length;
        listed = [...listed].sort((a, b) => (a.id === "other" ? 1 : 0) - (b.id === "other" ? 1 : 0) || rank(a.id) - rank(b.id));
    }
    const first = id === "o10" ? PROVIDE_FIRST[answers.o1?.[0] ?? ""] : undefined;
    const offered = first ? [...listed.filter(option => option.id === first), ...listed.filter(option => option.id !== first)] : listed;
    const retired = (OFFERING_RETIRED[id] ?? []).filter(option => chosen.includes(option.id));
    return retired.length > 0 ? [...offered, ...retired] : offered;
}

/**
 * Who a question is about on a Segment whose buyer is Proxy (2026-11-09): how it reaches them (O6), how long until they have it (O15) and what they give you (O10) are the end user's;
 * the terms and when they pay (O3, O3b) and what matters most (O4, as K8) the buyer's. A Direct or Dual-Intent buyer (who uses it too) keeps the words as written. The documents keep them as written.
 */
export function offeringWho(id: OfferingQuestionId, label: string, context: Pick<OfferingContext, "endsUser" | "dual">): string {
    if (!context.endsUser || context.dual) {
        return label;
    }
    switch (id) {
        case "o6": case "o10": return label.replace("your customers", "your end users");
        case "o15": return label.replace("until they have", "until your end users have");
        case "o3": return label.replace("do they pay", "do your buyers pay");
        case "o3t": return label.replace("do they pay", "do your buyers pay");
        // What matters most to the buyer, who chooses (owner, 2026-11-09), as K8 reads the buyer's B1.
        case "o4": return label.replace("your customers", "your buyers");
        default: return label;
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
// (O6 is ticks since 2026-11-09: the clearest way only, the others ticked by hand. Project work, sent by you; an ongoing service, none.)
const RECEIVE_START: Record<string, string> = { physical: "shipped", digital: "auto", app: "access", access: "access", live: "live", inperson: "inperson", project: "byyou" };
/** O1 → O15 (2026-11-09): a digital file, an app or online access is theirs straight away. */
const LEAD_TIME_START: Record<string, string> = { digital: "now", app: "now", access: "now" };
/**
 * O1 → O3 (2026-11-09): online access by subscription; project work as a project or contract; an ongoing service on a retainer; a session, live or in person, per
 * session. And (3.4; owner, 2026-11-17 08:38) a physical item or a digital file as one purchase, an app by subscription.
 */
const TERMS_START: Record<string, string> = { access: "subscription", project: "project", ongoing: "retainer", live: "session", inperson: "session", physical: "once", digital: "once", app: "subscription" };
/** O6 → O15 (3.7; owner, 2026-11-17 08:38): posted or shipped, within a week; sent automatically or ongoing online access, straight away. */
const LEAD_TIME_OF_RECEIVING: readonly [string, string][] = [["shipped", "week"], ["auto", "now"], ["access", "now"]];
/** The Segment's reach → O20's one start (3.9; owner, 2026-11-17 08:38): a city, Local delivery; a country, Postal service; several countries, Courier. */
const SENDING_START: Readonly<Record<string, string>> = { city: "local", country: "postal", countries: "courier" };
/** O3 → O3b (2026-11-09): a subscription or retainer monthly; a project a deposit, then the rest; one purchase before they get it. */
// (And per session and a licence before they get it, commission when it is done: 2.13, the second batch of the review; owner, 2026-11-18 00:46.)
const PAY_WHEN_START: Record<string, string> = { subscription: "monthly", retainer: "monthly", project: "deposit", once: "before", session: "before", licence: "before", commission: "after" };

/**
 * The answers as the card shows them: those saved, then a starting value where a question has none (doc 43: O2 from the business stage, O4 from the
 * Segment's differentiation and the buyer's outcome saved before, O6, O15 and O3 from O1, O3b from O3, O17 from O7's None), never over an answer chosen; an answer to a question not asked, or an option not offered, is dropped.
 */
export function offeringShown(saved: OfferingAnswers, context: OfferingContext): OfferingAnswers {
    const shown: OfferingAnswers = {};
    for (const question of OFFERING_QUESTIONS) {
        // (A question held back only by the stage keeps its saved answer here, so the documents still print it; the card does not ask it while Planning.)
        const heldBack = OFFERING_HELD_WHILE_PLANNING.includes(question.id) && offeringAsks(question.id, { ...context, stage: "launch" });
        if (!offeringAsks(question.id, context) && !heldBack) {
            continue;
        }
        // (A retired option saved stays: OFFERING_RETIRED.)
        const offered = [...offeringOptions(question.id, context), ...(OFFERING_RETIRED[question.id] ?? [])].map(option => option.id);
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
    // The starts of 2026-11-09 (doc 43): never over a saved answer, each from the answer shown above it.
    // (Customers in several countries: One to four weeks, whatever the form; owner, 2026-11-17.)
    // (Then how they receive it (O6; 3.7, owner, 2026-11-17 08:38), then the form.)
    const received = LEAD_TIME_OF_RECEIVING.find(([way]) => (shown.o6 ?? []).includes(way));
    if (!saved.o15 && (context.reach ?? []).includes("countries")) {
        shown.o15 = ["weeks"];
    } else if (!saved.o15 && received) {
        shown.o15 = [received[1]];
    } else if (!saved.o15 && shown.o1 && LEAD_TIME_START[shown.o1[0]]) {
        shown.o15 = [LEAD_TIME_START[shown.o1[0]]];
    }
    if (!saved.o3 && shown.o1 && TERMS_START[shown.o1[0]]) {
        shown.o3 = [TERMS_START[shown.o1[0]]];
    }
    if (!saved.o3t && shown.o3 && PAY_WHEN_START[shown.o3[0]]) {
        shown.o3t = [PAY_WHEN_START[shown.o3[0]]];
    }
    // O6's follow-ups, asked by the ways of receiving shown: the saved ticks, and the words written in under Other while Other is ticked.
    for (const id of Object.keys(RECEIVE_FOLLOW_UPS) as OfferingQuestionId[]) {
        delete shown[id];
        if (offeringAsks(id, context, shown)) {
            const offered = [...offeringOptions(id, context), ...(OFFERING_RETIRED[id] ?? [])].map(option => option.id);
            const kept = (saved[id] ?? []).filter(option => offered.includes(option));
            if (kept.length > 0) {
                shown[id] = kept;
                if (kept.includes("other") && saved[id + "-other"]) {
                    shown[id + "-other"] = saved[id + "-other"];
                }
            }
        }
    }
    // (O20'S ONE START FROM THE SEGMENT'S REACH (3.9; owner, 2026-11-17 08:38): where it is asked and never answered.)
    const sending = (context.reach ?? []).map(reach => SENDING_START[reach]).find(Boolean);
    if (!("o20" in saved) && sending && offeringAsks("o20", context, shown) && offeringOptions("o20", context).some(option => option.id === sending)) {
        shown.o20 = [sending];
    }
    // (O7's and O23's words written in under Other stay while Other is ticked.)
    for (const id of ["o7", "o23"] as const) {
        if ((shown[id] ?? []).includes("other") && saved[id + "-other"]) {
            shown[id + "-other"] = saved[id + "-other"];
        }
    }
    // None of help after the sale (O7) starts None of what comes after it (O17).
    if (!saved.o17 && shown.o7?.length === 1 && shown.o7[0] === "none") {
        shown.o17 = ["none"];
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
        value: (answers[question.id] ?? []).map(id => offeringOptionsWith(question.id, { ...context, worries: WORRIES.map(option => option.id) }, answers[question.id]).find(option => option.id === id)?.label ?? id).join("; ")
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
export function highestRated(profiles: readonly Record<string, string[]>[], id: "e1" | "e2" | "functional"): string | undefined {
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

/** THE SUPPORT PROMISE (O16; owner, 2026-11-17), on the Offering's relationship card (Customer Engagement): how soon customers hear back; null with No set time or no answer. */
export function supportPromise(answers: OfferingAnswers): string | null {
    const words: Record<string, string> = { sameday: "the same day", oneday: "within one working day", fewdays: "within a few days" };
    const reply = words[answers.o16?.[0] ?? ""];
    return reply ? "Support promise: you reply " + reply + "." : null;
}

/** The functional jobs (the Profile's Needs) in the draft, after "that" (doc 42, 1; owner, 2026-11-17). */
const JOB_PHRASES: Readonly<Record<string, string>> = {
    organisation: "keeps things in order", integration: "works with the tools they already use", connection: "helps them reach other people",
    information: "gives them the answers they need", variety: "gives them more options"
};
/** The end user's outcome (E4) in the draft's closing sentence: "Their end users get comfort and ease." */
const OUTCOME_PHRASES: Readonly<Record<string, string>> = {
    enjoy: "enjoyment and fun", comfort: "comfort and ease", safety: "safety and care", learning: "learning and growth", belong: "looks and belonging", practical: "practical use"
};

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
 * The draft sentence for one Offering (doc 42, 1): "For [Segment] who [frustration] and want to [goal], [Offering] is [form] that offers [benefit], and
 * it stands out for [the clear opening]." The goal and frustration are the highest-rated across the Profiles, in their draft phrases; a blank whose
 * answer is missing stays in square brackets; with no clear opening the sentence ends after the benefit. A Segment with an end user reads "For [Segment] whose end users
 * [frustration] and want to [goal]": E1 and E2 are the end user's there (doc 36, 2.1).
 */
export function valuePropositionDraft(segment: BusinessCustomerSegmentValue, offering: BusinessOfferingValue, answers: OfferingAnswers, context: OfferingContext,
    profileAnswers: readonly Record<string, string[]>[] = segment.profiles.map(profile => profile.questions ?? {}), userAnswers: readonly Record<string, string[]>[] = []): string {
    const profiles = [...profileAnswers];
    const goal = highestRated(profiles, "e1");
    const frustration = highestRated(profiles, "e2");
    // (THE JOB IT DOES (the Needs' functional ticks, the highest rated) and, with an end user, THE END USER'S OUTCOME (E4), the first ticked; owner, 2026-11-17.)
    const job = highestRated(profiles, "functional");
    const outcome = userAnswers.flatMap(entry => entry.outcome ?? []).find(id => OUTCOME_PHRASES[id]);
    const benefit = answers.o4?.[0];
    const name = offering.name.trim() || "[the Offering's name]";
    // A Segment with an end user (Proxy or Dual-Intent): the goal and the frustration are the end user's (doc 36, 2.1), so the sentence says whose ("whose end users").
    const sentence = "For " + segment.name.trim() + (context.endsUser ? " whose end users " : " who ") + (frustration ? FRUSTRATION_PHRASES[frustration] ?? "[a frustration]" : "[a frustration]")
        + " and want to " + (goal ? GOAL_PHRASES[goal] ?? "[a goal]" : "[a goal]") + ", " + name + " is " + formWords(offering, answers, context)
        + " that " + (job && JOB_PHRASES[job] ? JOB_PHRASES[job] + " and " : "") + "offers " + (benefit ? valueInSentence(benefit) : "[its main benefit]");
    const clear = clearOpenings(profiles, segment.competitors.map(competitor => competitor.questions ?? {}));
    return sentence + (clear.length > 0 ? ", and it stands out for " + valueInSentence(clear[0]) : "") + "."
        + (context.endsUser && outcome ? " Their end users get " + OUTCOME_PHRASES[outcome] + "." : "");
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
    /** What it is about, in its own words (a value, a need, a worry): the Objective a draft names (openItemObjective). */
    about?: string;
}

/** An open item as an Objective's name (P9; owner, 2026-11-18 03:01, "All, P1 to P9"): "Lead on good support", "Address \"…\"", "Answer the worry about …"; null for the items that ask to undo, not to do. */
export function openItemObjective(item: OpenItem): string | null {
    const about = item.about ?? "";
    switch (item.kind) {
        case "Unmet value": return about ? "Lead on " + about.charAt(0).toLowerCase() + about.slice(1) : null;
        case "Unanswered need": return about ? "Address \"" + about + "\"" : null;
        case "Worry left open": return about ? "Answer the worry about " + about.charAt(0).toLowerCase() + about.slice(1) : null;
        default: return null;
    }
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
        items.push({ kind: "Unmet value", text: "Your Profiles care about " + valueWord(value) + ", and no Offering does it best.", about: valueWord(value) });
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
            items.push({ kind: "Unanswered need", text: "\"" + item.text + "\" is not addressed by any Offering.", about: item.text });
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
        items.push({ kind: "Worry left open", text: "Your Profiles worry about " + worryWord(worry) + ", and no Offering answers it.", about: worryWord(worry) });
    }
    return items;
}
