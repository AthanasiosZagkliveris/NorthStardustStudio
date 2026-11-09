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
import { type OfferingAnswers, type OfferingContext, offeringOptions, offeringShown } from "./OfferingQuestions.ts";
import { profileShown, profileUserShown } from "./ProfileQuestions.ts";
import { type SegmentIdentity, segmentContextFor, segmentIsBusiness, segmentPositioningShown } from "./SegmentContext.ts";
import { type SegmentAnswers, segmentSettle } from "./SegmentQuestions.ts";

/** A Profile's answers as its card shows them: its own, with each start for a question it never answered. */
export function effectiveProfileAnswers(profile: BusinessCustomerProfileValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): SegmentAnswers {
    return profileShown(profile.questions ?? {}, segment.questions, segmentContextFor(identity, segmentIsBusiness(segment)));
}

/**
 * The end user's own answers of a Profile (doc 36, 2.1; owner, 2026-11-08), as its end-user part shows them: saved under `user.questions`, with A8 started from the Segment's End
 * user, 8 and E4 from the Segment's End user, 9 (itself started from Positioning's answer saved before) where never answered. Empty where the Segment has no end user. The end
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
    const pay = segmentSettle(segment.questions, context).pay ?? [];
    return { type: offering.category, stage: identity?.stage, differentiation, outcome: identity?.outcome ?? [], pay, worries, country: identity?.country, frame: context.frame, ...(context.endsUser ? { endsUser: true } : {}), ...(context.dual ? { dual: true } : {}) };
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
    /** Page 3, Delivery, Constraints: O10's options, as their words. */
    constraints?: string;
    /** Page 5, the revenue stream's Charged. */
    charged?: "per-sale" | "per-project" | "monthly" | "annually";
    /** Page 5, the revenue stream's Payment Timing (PAYMENT_TIMINGS' ids; When earned, "", is the default and starts nothing). */
    paymentTiming?: "upfront" | "completion" | "split" | "milestone";
}

/**
 * The starts an Offering gives its cards on Pages 2, 3 and 5, from its answers as its card shows them (O3, its second row O3t, O10, O15). A later page shows them on a card it has
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
        starts.duration = weeks;
    }
    const context = offeringContextOf(offering, segment, identity);
    const provided = (answers.o10 ?? []).map(id => offeringOptions("o10", context).find(option => option.id === id)?.label).filter((label): label is string => !!label);
    if (provided.length > 0) {
        starts.constraints = provided.join("; ") + ".";
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
    return starts;
}

/** The starts of the Offering with this id, wherever it is on Page 1; none where there is no such Offering. */
export function offeringStartsById(segments: readonly BusinessCustomerSegmentValue[], offeringId: string, identity?: SegmentIdentity): OfferingStarts {
    const segment = segments.find(entry => entry.offerings.some(offering => offering.id === offeringId));
    const offering = segment?.offerings.find(entry => entry.id === offeringId);
    return segment && offering ? offeringStarts(offering, segment, identity) : {};
}

/** O1's forms with no physical item (doc 43, O1): a digital file, an app, online access, a live online session, project work, an ongoing service. */
const NOT_PHYSICAL_FORMS: readonly string[] = ["digital", "app", "access", "live", "project", "ongoing"];

/**
 * Whether an Offering has a physical item (doc 28, 11.7): not where its Type is Service, or its form (O1) is one of NOT_PHYSICAL_FORMS. An Offering with no Type or form yet
 * (or Other) may have one, so it counts as having one.
 */
export function offeringIsPhysical(offering: BusinessOfferingValue, segment: BusinessCustomerSegmentValue, identity?: SegmentIdentity): boolean {
    if (offering.category === "Service") {
        return false;
    }
    const form = effectiveOfferingAnswers(offering, segment, identity).o1?.[0];
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
