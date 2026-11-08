/**
 * THE EFFECTIVE ANSWERS of a Profile and an Offering (docs 36 and 43; owner, 2026-11-08: "App follows the docs"): what is saved where the user set it, otherwise the
 * starting value the card shows. One place, read by the card, the Value Proposition, the Business Plan and the export, so they cannot drift apart.
 * Only the fields the user set are saved; every other field keeps following its source answers.
 */
import type { BusinessCustomerProfileValue, BusinessCustomerSegmentValue, BusinessOfferingValue } from "./AnswerBusinessFoundation.ts";
import { type OfferingAnswers, type OfferingContext, offeringShown } from "./OfferingQuestions.ts";
import { profileShown } from "./ProfileQuestions.ts";
import { type SegmentIdentity, segmentContextFor, segmentIsBusiness, segmentPositioningShown } from "./SegmentContext.ts";
import type { SegmentAnswers } from "./SegmentQuestions.ts";

/** A Profile's answers as its card shows them: its own, with each start for a question it never answered. */
export function effectiveProfileAnswers(profile: BusinessCustomerProfileValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): SegmentAnswers {
    return profileShown(profile.questions ?? {}, segment.questions, segmentContextFor(identity, segmentIsBusiness(segment)));
}

/** A Segment's answers as its card shows them: its own, with the Positioning answers saved before 2026-11-08 as the starts of its Differentiation and its end user's outcome. */
export function effectiveSegmentAnswers(segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): SegmentAnswers {
    return segmentPositioningShown(segment.questions, identity, segmentContextFor(identity, segmentIsBusiness(segment)));
}

/**
 * What an Offering's questions follow: its Type, the business stage, the Segment's own Differentiation (K14; the Positioning one saved before is its start), the buyer's outcome saved on
 * Positioning before 2026-11-08 (O4 owns it now), the Segment's payment, its Profiles' worries and the Organisation's country (O18's "i").
 */
export function offeringContextOf(offering: BusinessOfferingValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): OfferingContext {
    const worries = [...new Set(segment.profiles.flatMap(profile => effectiveProfileAnswers(profile, segment, identity).e3 ?? []))];
    const differentiation = effectiveSegmentAnswers(segment, identity).differentiation ?? [];
    return { type: offering.category, stage: identity?.stage, differentiation, outcome: identity?.outcome ?? [], pay: segment.questions.pay ?? [], worries, country: identity?.country };
}

/** An Offering's answers as its card shows them: its own, with each start for a question it never answered. */
export function effectiveOfferingAnswers(offering: BusinessOfferingValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): OfferingAnswers {
    return offeringShown(offering.questions ?? {}, offeringContextOf(offering, segment, identity));
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
