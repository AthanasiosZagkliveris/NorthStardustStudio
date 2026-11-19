/**
 * THE EFFECTIVE ANSWERS of a Segment, a Profile and an Offering (docs 35, 36 and 43; owner, 2026-11-08: "App follows the docs"): what is saved where the user set it,
 * otherwise the starting value the card shows. Only the fields the user set are saved; every other field keeps following its source answers. The one place every reader
 * of Page 1's answers goes through, so they cannot drift apart:
 * - Page 1's cards and the Value Proposition's draft and open items (editors/foundation/useFoundationSubsections.tsx): the Profile's, its end user's and the Offering's
 *   answers, offeringContextOf and withFieldSet.
 * - The Business Plan (BusinessDocuments.ts): the Offering's answers. The export (ExportRenderers.ts): the Profile's, its end user's and the Offering's.
 * - The Review (OpenItems.ts): the Offering's O3.
 * - The later pages (specifications/business-system/README.md, "What each later page reads from Page 1"): offeringStartsById for Page 2's Customers Buy
 *   (engagement/useEngagementDemand.tsx), Page 3's Delivery (capability/useCapabilityActivityAndDelivery.tsx) and Page 5's revenue stream
 *   (FinancialSustainabilityEditor.tsx); noPhysicalOffering for what Page 3 hides without a physical item (capability/useCapabilityState.tsx).
 * The Segment's answers (effectiveSegmentAnswers) are read here only, by offeringContextOf.
 */
import type { BusinessCustomerProfileValue, BusinessCustomerSegmentValue, BusinessOfferingValue } from "./AnswerBusinessFoundation.ts";
import { type OfferingAnswers, type OfferingContext, offeringShown, SENDING_WEEKS } from "./OfferingQuestions.ts";
import { profileShown, profileUserShown } from "./ProfileQuestions.ts";
import { type SegmentIdentity, segmentContextFor, segmentIsBusiness, segmentPositioningShown } from "./SegmentContext.ts";
import { type SegmentAnswers, segmentSettle } from "./SegmentQuestions.ts";

/**
 * THE WAYS THE SEGMENT'S OFFERINGS CAN BE TRIED FIRST (owner, 2026-11-16 17:38), by each Offering's Type and form (O1, as saved: it has no start): a physical item a
 * free sample and a catalogue (and a demo for a business Segment); an app or online access a free trial; an app or project work a demo; a live online or in-person
 * session a taster. Read from the saved form, not the effective answers, so a Profile's answers can read it (the Offering's read the Profiles').
 */
/** The forms of the Segment's Offerings, as each card shows them (O1): the marketplaces the Segment is offered follow them (owner, 2026-11-17). */
export function segmentForms(segment: BusinessCustomerSegmentValue): string[] {
    // (EVERYTHING WHILE AN OFFERING'S FORM IS UNKNOWN (1.5, the second batch of the review; owner, 2026-11-18 00:46): an Offering with no O1 yet could be any form,
    // so no list is filtered by the forms -- the empty list -- until every Offering has one.)
    if (segment.offerings.some(offering => (offering.questions?.o1 ?? []).length === 0)) {
        return [];
    }
    return [...new Set(segment.offerings.flatMap(offering => offering.questions?.o1 ?? []))];
}

export function segmentTrials(segment: BusinessCustomerSegmentValue): string[] | undefined {
    // (WHILE NO OFFERING SAYS WHAT IT IS (B2; owner, 2026-11-17 08:38): no Type and no form yet, so every way to try it first is offered.)
    if (!segment.offerings.some(offering => offering.category.trim() !== "" || (offering.questions?.o1 ?? []).length > 0)) {
        return undefined;
    }
    const kinds = new Set<string>();
    for (const offering of segment.offerings) {
        const form = offering.questions?.o1?.[0];
        // (An Offering whose form is unknown yet could be tried any way: every way, 1.5 of the review's second batch.)
        if (!form) {
            ["sample", "trial", "demo", "taster", "catalogue"].forEach(kind => kinds.add(kind));
            continue;
        }
        const physical = offering.category !== "Service" && !(form && NOT_PHYSICAL_FORMS.includes(form));
        if (physical) {
            kinds.add("sample");
            kinds.add("catalogue");
            if (segmentIsBusiness(segment)) {
                kinds.add("demo");
            }
        }
        if (form === "app" || form === "access") {
            kinds.add("trial");
        }
        if (form === "app" || form === "project") {
            kinds.add("demo");
        }
        if (form === "live" || form === "inperson") {
            kinds.add("taster");
        }
    }
    return ["sample", "trial", "demo", "taster", "catalogue"].filter(kind => kinds.has(kind));
}

/** A Profile's answers as its card shows them: its own, with each start for a question it never answered. */
export function effectiveProfileAnswers(profile: BusinessCustomerProfileValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): SegmentAnswers {
    // (The Segment's answers as its card shows them, its starts included: B4, owner, 2026-11-17 08:38.)
    const context = { ...segmentContextFor(identity, segmentIsBusiness(segment)), trials: segmentTrials(segment), forms: segmentForms(segment) };
    return profileShown(profile.questions ?? {}, segmentPositioningShown(segment.questions, identity, context, segment.competitors), context);
}

/**
 * The end user's own answers of a Profile (doc 36, 2.1; owner, 2026-11-08), as its end-user part shows them: saved under `user.questions` (A8 is retired: the Segment's End user, 8 owns it; owner, 2026-11-17), with
 * E4 from the Segment's End user, 9 (itself started from Positioning's answer saved before) where never answered. Empty where the Segment has no end user. The end
 * user's E1, E2 and Needs are in `effectiveProfileAnswers` (the part they stand in: `profilePartOf`).
 */
export function effectiveProfileUserAnswers(profile: BusinessCustomerProfileValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): SegmentAnswers {
    const context = segmentContextFor(identity, segmentIsBusiness(segment));
    return profileUserShown(profile.user?.questions ?? {}, segmentPositioningShown(segment.questions, identity, context, segment.competitors), context);
}

/** A Segment's answers as its card shows them: its own, with the Positioning answers saved before 2026-11-08 as the starts of its Differentiation (else its Competitors' K10 ticks) and its end user's outcome. */
export function effectiveSegmentAnswers(segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): SegmentAnswers {
    return segmentPositioningShown(segment.questions, identity, segmentContextFor(identity, segmentIsBusiness(segment)), segment.competitors);
}

/**
 * What an Offering's questions follow: its Type, the business stage, the Segment's own Differentiation (K14; the Positioning one saved before is its start), the buyer's outcome saved on
 * Positioning before 2026-11-08 (O4 owns it now), the Segment's payment, its Profiles' worries and the Organisation's country (O18's "i").
 */
export function offeringContextOf(offering: BusinessOfferingValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): OfferingContext {
    const worries = [...new Set(segment.profiles.flatMap(profile => effectiveProfileAnswers(profile, segment, identity).e3 ?? []))];
    const differentiation = effectiveSegmentAnswers(segment, identity).differentiation ?? [];
    const context = segmentContextFor(identity, segmentIsBusiness(segment));
    // The pay O3's order reads is the Segment's settled answer (a stale invoice on a people Segment is not counted; phase 5, 2026-11-08); the frame tells O18's "i" a business Segment.
    // (The answers as the card shows them, its starts included -- How they pay from where they shop, B4 --, settled.)
    const settled = segmentSettle(segmentPositioningShown(segment.questions, identity, context, segment.competitors), context);
    const pay = settled.pay ?? [];
    // (O4 and O8 in the order the Profiles weigh their values (B1) and worries (E3), each tick by its rating, 1 unrated: 2.11, the second batch of the review.)
    const weights = (id: "b1" | "e3") => {
        const out: Record<string, number> = {};
        for (const profile of segment.profiles) {
            const answers = effectiveProfileAnswers(profile, segment, identity);
            const rated = Object.fromEntries((answers[id + "-rating"] ?? []).map(entry => entry.split(":")).map(([key, point]) => [key, Number(point) || 1]));
            for (const key of answers[id] ?? []) {
                out[key] = (out[key] ?? 0) + (rated[key] ?? 1);
            }
        }
        return out;
    };
    return { reach: settled.reach ?? [], area: settled.area?.[0] ?? "", workenv: settled.workenv?.[0] ?? "", workincome: settled.workincome?.[0] ?? "", valueWeights: weights("b1"), worryWeights: weights("e3"), type: offering.category, stage: identity?.stage, differentiation, outcome: identity?.outcome ?? [], pay, worries, country: identity?.country, activityCode: identity?.activityCode, frame: context.frame, ...(context.endsUser ? { endsUser: true } : {}), ...(context.dual ? { dual: true } : {}) };
}

/** An Offering's answers as its card shows them: its own, with each start for a question it never answered. */
export function effectiveOfferingAnswers(offering: BusinessOfferingValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): OfferingAnswers {
    return offeringShown(offering.questions ?? {}, offeringContextOf(offering, segment, identity));
}

/* ---- What the later pages start from (specifications/business-system/README.md, "What each later page reads from Page 1"; phase 5f, 2026-11-09) ---- */

/** O3's terms paid once (one-off) and every month (recurring); Free to them is neither, so it starts nothing. */
const O3_ONE_OFF: readonly string[] = ["once", "session", "rent", "commission", "project"];
const O3_RECURRING: readonly string[] = ["subscription", "licence", "payg", "retainer"];
/** Page 5's Charged (REVENUE_CHARGES' ids) for each O3 term. */
const O3_CHARGED: Readonly<Record<string, "per-sale" | "per-project" | "monthly" | "annually">> = {
    once: "per-sale", session: "per-sale", rent: "per-sale", commission: "per-sale", project: "per-project",
    subscription: "monthly", retainer: "monthly", payg: "monthly", licence: "annually"
};
/** Page 3's Calendar Time in weeks for each O15 band: the band's upper end (Straight away and Longer start nothing). */
const O15_WEEKS: Readonly<Record<string, string>> = { week: "1", weeks: "4", months: "13" };

/** What an Offering's later cards start from: each field is there only where Page 1's answer says it. */
export interface OfferingStarts {
    /** Page 2, Demand & Conversion, Customers Buy: true is "Every month, until they cancel". */
    recurring?: boolean;
    /** Page 3, Delivery, Delivered. */
    deliveryMode?: "unit" | "monthly";
    /** Page 3, Delivery, Calendar Time (weeks), for an Offering delivered per unit. */
    duration?: string;
    /** Page 5, the revenue stream's Charged. */
    charged?: "per-sale" | "per-project" | "monthly" | "annually";
    /** Page 5, the revenue stream's Payment Timing (PAYMENT_TIMINGS' ids; When earned, "", is the default and starts nothing). */
    paymentTiming?: "upfront" | "completion" | "split" | "milestone";
    /** Whether O3t is answered: Page 5's Payment Timing is then its record (paymentTiming, or When earned where it gives none). */
    paymentTimingAnswered?: boolean;
    /** Delivered in sessions (a live online session, an in-person service, or charged per session: O1, O3): the Delivery card asks DV6, customers in one session. */
    sessions?: boolean;
    /** Made in batches (a Product or Hybrid, not made to order: Type, O14): the Delivery card asks DV9 and DV10. */
    batches?: boolean;
    /** Not ready to sell (O2: Just an idea, Still being built): Demand & Conversion asks Ready from, and its sales start then (owner, 2026-11-17). */
    notReady?: "idea" | "building";
}

/**
 * The starts an Offering gives its cards on Pages 2, 3 and 5, from its answers as its card shows them (O3, its second row O3t, O15, O2). A later page shows them on a card it has
 * not saved yet and saves them with the first thing written there; what that page saved wins.
 */
export function offeringStarts(offering: BusinessOfferingValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): OfferingStarts {
    const answers = effectiveOfferingAnswers(offering, segment, identity);
    const terms = answers.o3?.[0] ?? "";
    const recurring = O3_RECURRING.includes(terms) ? true : O3_ONE_OFF.includes(terms) ? false : undefined;
    const starts: OfferingStarts = {};
    if (recurring !== undefined) {
        starts.recurring = recurring;
        starts.deliveryMode = recurring ? "monthly" : "unit";
    }
    const weeks = O15_WEEKS[answers.o15?.[0] ?? ""];
    if (weeks && recurring !== true) {
        // (LESS THE SENDING (B1; owner, 2026-11-17 08:38): O15 is the time until the customer has it, so the making takes what the sending (O20) leaves -- at least a
        // week -- and an untouched card never says it takes longer than customers expect.)
        const sending = Math.max(0, ...(answers.o20 ?? []).map(way => SENDING_WEEKS[way] ?? 0));
        starts.duration = String(Math.max(1, Number(weeks) - sending));
    }
    if (O3_CHARGED[terms]) {
        starts.charged = O3_CHARGED[terms];
    }
    // When they pay (O3t): paid in instalments is Milestones on a charge paid once, and When earned (no start) on a monthly one.
    const when = answers.o3t?.[0] ?? "";
    const timing = when === "before" ? "upfront" : when === "deposit" ? "split" : when === "after" || when === "invoice" ? "completion"
        : when === "monthly" && recurring !== true ? "milestone" : undefined;
    if (timing) {
        starts.paymentTiming = timing;
    }
    if (when !== "") {
        starts.paymentTimingAnswered = true;
    }
    // (Doc 52, DV6 and DV9/DV10; owner, 2026-11-17.)
    if ((answers.o1 ?? []).some(form => form === "live" || form === "inperson") || terms === "session") {
        starts.sessions = true;
    }
    // (A physical item only: a digital file, an app or online access has no batch to set up; 2.8, owner, 2026-11-17 08:38.)
    if ((offering.category === "Product" || offering.category === "Hybrid") && !(answers.o14 ?? []).includes("custom") && offeringIsPhysical(offering, segment, identity)) {
        starts.batches = true;
    }
    // (Not ready to sell: O2's Just an idea or Still being built; owner, 2026-11-17.)
    const ready = answers.o2?.[0];
    if (ready === "idea" || ready === "building") {
        starts.notReady = ready;
    }
    return starts;
}

/**
 * DESIGN FOR PHONES FIRST (owner, 2026-11-17): every Profile of the Segment (at least one) finds and buys on a smartphone only (C1, as each card shows it); the
 * Main Website's card on Customer Engagement says so.
 */
export function segmentPhonesOnly(segment: BusinessCustomerSegmentValue, identity?: SegmentIdentity): boolean {
    const devices = segment.profiles.map(profile => effectiveProfileAnswers(profile, segment, identity).c1 ?? []);
    return devices.length > 0 && devices.every(list => list.length === 1 && list[0] === "phone");
}

/** The answers of the Offering with this id as its card shows them, wherever it is on Page 1; none where there is no such Offering. */
export function offeringAnswersById(segments: readonly BusinessCustomerSegmentValue[], offeringId: string, identity?: SegmentIdentity): OfferingAnswers {
    const segment = segments.find(entry => entry.offerings.some(offering => offering.id === offeringId));
    const offering = segment?.offerings.find(entry => entry.id === offeringId);
    return segment && offering ? effectiveOfferingAnswers(offering, segment, identity) : {};
}

/** The starts of the Offering with this id, wherever it is on Page 1; none where there is no such Offering. */
export function offeringStartsById(segments: readonly BusinessCustomerSegmentValue[], offeringId: string, identity?: SegmentIdentity): OfferingStarts {
    const segment = segments.find(entry => entry.offerings.some(offering => offering.id === offeringId));
    const offering = segment?.offerings.find(entry => entry.id === offeringId);
    return segment && offering ? offeringStarts(offering, segment, identity) : {};
}

/** O1's forms with no physical item (doc 43, O1): a digital file, an app, online access, a live online session, project work, an ongoing service. */
const NOT_PHYSICAL_FORMS: readonly string[] = ["digital", "app", "access", "live", "project", "ongoing"];

/** O6's ways a customer receives a physical item: posted or shipped, or collected. */
const PHYSICAL_RECEIVE: readonly string[] = ["shipped", "collect"];

/**
 * Whether an Offering has a physical item (doc 28, 11.7): an Offering posted, shipped or collected (O6), or sent a way O20 names, has one, whatever its Type and form;
 * otherwise not where its Type is Service, or its form (O1) is one of NOT_PHYSICAL_FORMS. An Offering with no Type or form yet (or Other) may have one, so it counts as
 * having one.
 */
export function offeringIsPhysical(offering: BusinessOfferingValue, segment: BusinessCustomerSegmentValue, identity?: SegmentIdentity): boolean {
    const answers = effectiveOfferingAnswers(offering, segment, identity);
    if ((answers.o6 ?? []).some(way => PHYSICAL_RECEIVE.includes(way)) || (answers.o20 ?? []).length > 0) {
        return true;
    }
    if (offering.category === "Service") {
        return false;
    }
    const form = answers.o1?.[0];
    return !(form && NOT_PHYSICAL_FORMS.includes(form));
}

/** Whether Page 1 has Offerings and none of them has a physical item: Pages 3 and 4 then hide the groups of stock, delivery vehicles and logistics while they hold no card. */
export function noPhysicalOffering(segments: readonly BusinessCustomerSegmentValue[], identity?: SegmentIdentity): boolean {
    const all = segments.flatMap(segment => segment.offerings.map(offering => ({ offering, segment })));
    return all.length > 0 && all.every(entry => !offeringIsPhysical(entry.offering, entry.segment, identity));
}

/**
 * The saved answers with one field set by the user: the field, its ratings and its Other text are taken from `next` (the answers as shown, changed); every other
 * field stays as saved, so a field never set keeps following its start.
 */
export function withFieldSet(saved: SegmentAnswers, next: SegmentAnswers, field: string): SegmentAnswers {
    const result: SegmentAnswers = { ...saved };
    for (const key of [field, field + "-rating", field + "-other"]) {
        if (key in next) {
            result[key] = next[key];
        } else {
            delete result[key];
        }
    }
    return result;
}
