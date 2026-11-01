import { describe, expect, it } from "vitest";

import lumen from "../data/examples/lumen-and-loom-studio.json";
import quillfield from "../data/examples/quillfield-automation-llc.json";
import { asBusinessFoundationValue, asLegalEntityValue } from "../framework/engine/AnswerUtils";
import { SEGMENT_QUESTIONS, segmentQuestionAsked, segmentSettle } from "../framework/engine/SegmentQuestions";
import { stageOf } from "../framework/engine/BusinessStage";
import { fitPositioningToStage } from "../components/interview/editors/legal/shared";
import { segmentContextFor } from "../components/interview/editors/foundation/identityLink";

/**
 * THE EXAMPLES ANSWER THE SEGMENT'S QUESTIONS: for each Segment of each example, read with the example's own Positioning answers, every question the Segment is asked has an answer
 * and no answer stands outside the rules (a question not asked, an option not offered). The kind of area is held back while Planning and Launching, so the examples are read as planning.
 */
describe.each([["Lumen & Loom Studio", lumen], ["Quillfield Automation LLC", quillfield]])("the example %s", (_name, example) => {

    const systems = example.systems as unknown as Record<string, { responses: { value: unknown }[] }>;
    const organisation = asLegalEntityValue(systems["1"].responses[2].value).organisation;
    const identity = { relationships: organisation.customerType, marketType: organisation.marketType, audience: organisation.audience, buyerCategory: organisation.buyerCategory, endUser: organisation.endUser, stage: "plan" };
    const segments = asBusinessFoundationValue(systems["3"].responses[0].value).segments;

    // The Positioning answers of an example stand at its stage today and at every later one: where a stage allows fewer choices, the app empties the answer, and the example would then open with its Positioning blank.
    const stages = ["plan", "launch", "manage", "grow"] as const;
    const today = stages.indexOf(stageOf((example as unknown as { globalSettings: { openingDate: string } }).globalSettings.openingDate, new Date()));
    it.each(stages.slice(today))("keeps its Positioning answers at the %s stage", stage => {
        expect(fitPositioningToStage(organisation, stage)).toBe(organisation);
    });

    it.each(segments.map(segment => [segment.name, segment] as const))("answers every question asked of %s, and nothing else", (_segmentName, segment) => {
        // (Where the buyer is not known to be a business, a Segment is a Segment of people unless its Business Data tick is on.)
        const context = segmentContextFor(identity, segment.description["business-data"] !== undefined);
        expect(segmentSettle(segment.questions, context)).toEqual(segment.questions);
        // (A question with one option left is not shown, and holds that option as its answer: it is still asked.)
        const asked = SEGMENT_QUESTIONS.filter(question => segmentQuestionAsked(question, segment.questions, context)).map(question => question.id);
        // (A tick that only opens more questions is optional.)
        expect(asked.filter(id => !(segment.questions[id]?.length) && !SEGMENT_QUESTIONS.find(question => question.id === id)?.toggle)).toEqual([]);
        expect(Object.keys(segment.questions).filter(id => !asked.includes(id))).toEqual([]);
    });

});
