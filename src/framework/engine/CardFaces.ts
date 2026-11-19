import type { BusinessCompetitorValue, BusinessCustomerSegmentValue, BusinessOfferingValue } from "./AnswerBusinessFoundation.ts";
import { COMPETITOR_REACH_OPTIONS, COMPETITOR_SIZE_OPTIONS } from "./CompetitorQuestions.ts";
import { effectiveOfferingAnswers, effectiveProfileAnswers, offeringContextOf } from "./EffectiveAnswers.ts";
import { offeringOptions } from "./OfferingQuestions.ts";
import { PROFILE_QUESTIONS } from "./ProfileQuestions.ts";
import type { SegmentIdentity } from "./SegmentContext.ts";
import { BUSINESS_COMPETITOR_TYPES } from "./businessFoundation/foundationPage.ts";

/*
    WHAT A CARD'S TILE SAYS (owner, 2026-11-19 16:52 UTC+2, 1.2: "For each tile in the dialogue cards, check what core information they could carry on them as listed
    items"): the core of each card, a line each, in its own options' words, as its card shows them (the effective answers, starts included) -- never a figure the
    card does not hold. A Profile: how old, the kind of work, the main goal. An Offering: its Type, its form, whether it can be bought today, how it is paid for. A
    Competitor: its Type, its reach, its size. A line with no answer is left out; a card with none says nothing under its name.
*/

const labelOf = (options: readonly { id: string; label: string }[], id: string | undefined): string => options.find(option => option.id === id)?.label ?? "";

/** A Profile's tile: "36 years old", its kind of work, its first goal. */
export function profileFaceLines(profile: BusinessCustomerSegmentValue["profiles"][number], segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): string[] {
    const answers = effectiveProfileAnswers(profile, segment, identity);
    const options = (id: string) => PROFILE_QUESTIONS.find(question => question.id === id)?.options ?? [];
    const age = answers.a1?.[0]?.trim() ?? "";
    return [
        /^\d+$/.test(age) ? age + " years old" : age,
        labelOf(options("a3"), answers.a3?.[0]) || labelOf(options("a3b"), answers.a3b?.[0]),
        labelOf(options("e1"), answers.e1?.[0])
    ].filter(Boolean);
}

/** An Offering's tile: its Type, its form (O1), whether it can be bought today (O2), how it is paid for (O3). */
export function offeringFaceLines(offering: BusinessOfferingValue, segment: BusinessCustomerSegmentValue, identity: SegmentIdentity | undefined): string[] {
    const answers = effectiveOfferingAnswers(offering, segment, identity);
    const context = offeringContextOf(offering, segment, identity);
    return [
        offering.category.trim(),
        labelOf(offeringOptions("o1", context), answers.o1?.[0]),
        // (O2's "Yes, now" answers its question; on the tile, standing alone, it reads "Available now". The others say themselves: "Still being built".)
        answers.o2?.[0] === "now" ? "Available now" : labelOf(offeringOptions("o2", context), answers.o2?.[0]),
        labelOf(offeringOptions("o3", context), answers.o3?.[0])
    ].filter(Boolean);
}

/** A Competitor's tile: its Type, its reach (K2), its size (K3). */
export function competitorFaceLines(competitor: BusinessCompetitorValue): string[] {
    const answers = competitor.questions ?? {};
    return [
        labelOf(BUSINESS_COMPETITOR_TYPES, competitor.type),
        labelOf(COMPETITOR_REACH_OPTIONS, answers.k2?.[0]),
        labelOf(COMPETITOR_SIZE_OPTIONS, answers.k3?.[0])
    ].filter(Boolean);
}
