import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";
import { businessFoundationSegments } from "./AnswerUtils.ts";
import { funnelIsTrial, monthsToClose } from "./JourneySuggestions.ts";
import type { BusinessCustomerSegmentValue } from "./AnswerBusinessFoundation.ts";

const segmentsOf = (file: string): BusinessCustomerSegmentValue[] => {
    const organisation = JSON.parse(readFileSync("src/data/examples/" + file, "utf8"));
    return businessFoundationSegments(organisation.systems["3"].responses.find((response: { sectionNumber: number }) => response.sectionNumber === 1).value);
};
const withAnswers = (segment: BusinessCustomerSegmentValue, answers: Record<string, string[]>): BusinessCustomerSegmentValue =>
    ({ ...segment, questions: { ...segment.questions, ...answers } });

describe("the Demand recheck (doc 50, section 2.5; owner, 2026-11-14 12:00)", () => {
    const [first] = segmentsOf("quillfield-automation-llc.json");

    test("the time to buy follows who decides: the longest the answers name", () => {
        expect(monthsToClose(withAnswers(first, { path: ["researcher"], authorise: ["solo"] }))).toEqual({ low: 1, high: 1 });
        expect(monthsToClose(withAnswers(first, { path: ["researcher"], authorise: ["solo", "executive"] }))).toEqual({ low: 2, high: 3 });
        expect(monthsToClose(withAnswers(first, { path: ["validator"], authorise: ["multi", "procurement"] }))).toEqual({ low: 3, high: 6 });
    });

    test("on impulse or out of habit, or with no one named, there is none", () => {
        expect(monthsToClose(withAnswers(first, { path: ["impulse"], authorise: ["procurement"] }))).toBeNull();
        expect(monthsToClose(withAnswers(first, { path: ["habit"], authorise: ["executive"] }))).toBeNull();
        expect(monthsToClose(withAnswers(first, { path: ["researcher"], authorise: [] }))).toBeNull();
    });

    test("the funnel's middle step is a trial where a Profile compares by a demo, trial or sample", () => {
        const tried = { ...first, profiles: first.profiles.map((profile, at) => at === 0 ? { ...profile, questions: { ...(profile.questions ?? {}), d1: ["a-demo-trial-or-sample"] } } : profile) };
        const none = { ...first, profiles: first.profiles.map(profile => ({ ...profile, questions: { ...(profile.questions ?? {}), d1: ["your-website"] } })) };
        expect(funnelIsTrial(tried)).toBe(true);
        expect(funnelIsTrial(none)).toBe(false);
    });
});
