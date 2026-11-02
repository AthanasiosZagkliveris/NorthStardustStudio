import { describe, expect, it } from "vitest";

import lumen from "../data/examples/lumen-and-loom-studio.json";
import quillfield from "../data/examples/quillfield-automation-llc.json";
import { asBusinessFoundationValue, asLegalEntityValue } from "../framework/engine/AnswerUtils";
import { SEGMENT_QUESTIONS, segmentQuestionAsked, segmentSettle } from "../framework/engine/SegmentQuestions";
import { stageOf } from "../framework/engine/BusinessStage";
import { fitPositioningToStage } from "../components/interview/editors/legal/shared";
import { segmentContextFor } from "../components/interview/editors/foundation/identityLink";
import { asProfileAnswers, profileSettle } from "../framework/engine/ProfileQuestions";

/**
 * THE EXAMPLES ANSWER THE SEGMENT'S QUESTIONS: for each Segment of each example, read with the example's own Positioning answers, every question the Segment is asked has an answer
 * and no answer stands outside the rules (a question not asked, an option not offered). The kind of area is held back while Planning and Launching, so the examples are read as planning.
 */
describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s", (_name, example) => {

    const systems = example.systems as unknown as Record<string, { responses: { value: unknown }[] }>;
    const organisation = asLegalEntityValue(systems["1"].responses[2].value).organisation;
    const currentStage = stageOf((example as unknown as { globalSettings: { openingDate: string } }).globalSettings.openingDate, new Date());
    const identity = { relationships: organisation.customerType, marketType: organisation.marketType, audience: organisation.audience, buyerCategory: organisation.buyerCategory, endUser: organisation.endUser, stage: currentStage };
    const segments = asBusinessFoundationValue(systems["3"].responses[0].value).segments;

    // The Positioning answers of an example stand at its stage today and at every later one: where a stage allows fewer choices, the app empties the answer, and the example would then open with its Positioning blank.
    const stages = ["plan", "launch", "manage", "grow"] as const;
    const today = stages.indexOf(currentStage);
    it.each(stages.slice(today))("keeps its Positioning answers at the %s stage", stage => {
        expect(fitPositioningToStage(organisation, stage)).toBe(organisation);
    });

    it.each(segments.map(segment => [segment.name, segment] as const))("answers every question asked of %s, and nothing else", (_segmentName, segment) => {
        // (Where both relationships are chosen, the Segment is of businesses if it has the Business Data key.)
        const context = segmentContextFor(identity, segment.description["business-data"] !== undefined);
        expect(segmentSettle(segment.questions, context)).toEqual(segment.questions);
        // (A question with one option left is not shown, and holds that option as its answer: it is still asked.)
        const asked = SEGMENT_QUESTIONS.filter(question => segmentQuestionAsked(question, segment.questions, context)).map(question => question.id);
        expect(asked.filter(id => !(segment.questions[id]?.length))).toEqual([]);
        expect(Object.keys(segment.questions).filter(id => !asked.includes(id))).toEqual([]);
    });

    it.each(segments.flatMap(segment => segment.profiles.map(profile => [profile.name, segment, profile] as const)))("answers the Profile %s with answers that stand against its Segment", (_profileName, segment, profile) => {
        const context = segmentContextFor(identity, segment.description["business-data"] !== undefined);
        const answers = asProfileAnswers(profile.questions);
        expect(Object.keys(answers).length).toBeGreaterThan(5);
        expect(profileSettle(answers, segment.questions, context)).toEqual(answers);
    });

    it.each(segments.flatMap(segment => segment.profiles.map(profile => [profile.name, profile] as const)))("tells the same age in the note of %s as in its answer", (_profileName, profile) => {
        const answered = asProfileAnswers(profile.questions).a1?.[0];
        const written = (profile.description.personal ?? "").match(/\b(\d{2})\b/)?.[1];
        expect(written).toBe(answered);
    });

});
