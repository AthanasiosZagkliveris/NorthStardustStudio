import { describe, expect, it } from "vitest";

import { type SegmentContext } from "./SegmentQuestions";
import { PROFILE_QUESTIONS, profileOptionsShown, profilePersona, profileShown } from "./ProfileQuestions";
import { offeringOptionsWith, supportPromise } from "./OfferingQuestions";
import { CROWDED_LINE, COMPETITOR_INFO, competitorK10Info, competitorOpenings, competitorTable } from "./CompetitorQuestions";
import { strategySwotShown } from "./AnswerStrategy";

/* The questions read at last (the open decisions and gaps, Group 4c, item 22; owner, 2026-11-17). */
const PEOPLE: SegmentContext = { frame: "people", stage: "manage", lifeStages: [], endsUser: false, userStages: [], relations: [], scales: [] };
const ids = (list: readonly { id: string }[]) => list.map(option => option.id);

describe("the Profile's starts from the Segment's work answers", () => {

    it("starts D3 from the work schedule, and from being retired", () => {
        const d3 = (segment: Record<string, string[]>) => profileShown({}, segment, PEOPLE).d3;
        expect(d3({ work: ["working"], workschedule: ["standard"] })).toEqual(["evenings", "weekends"]);
        expect(d3({ work: ["working"], workschedule: ["shift"] })).toEqual(["weekday-daytime", "weekends"]);
        expect(d3({ work: ["working"], workschedule: ["flexible"] })).toEqual(["weekday-daytime"]);
        expect(d3({ work: ["notworking"], work2: ["retired"] })).toEqual(["weekday-daytime"]);
        // (A schedule saved before the customers stopped working counts for nothing.)
        expect(d3({ work: ["notworking"], workschedule: ["standard"] })).toBeUndefined();
    });

    it("starts E3 at the price for students, and C1 at a smartphone on the road", () => {
        expect(profileShown({}, { work: ["notworking"], work2: ["student"] }, PEOPLE).e3).toEqual(["the-price-or-their-budget"]);
        expect(profileShown({}, { work: ["working"], workenv: ["field"] }, PEOPLE).c1).toEqual(["phone"]);
        // (Where they shop starts C1 first.)
        expect(profileShown({}, { work: ["working"], workenv: ["field"], setting: ["desktop"] }, PEOPLE).c1).toEqual(["computer"]);
    });

    it("orders D1 by the buying role (A5): a user tries it, the decider asks for a quote", () => {
        const d1 = PROFILE_QUESTIONS.find(question => question.id === "d1")!;
        expect(ids(profileOptionsShown(d1, {}, PEOPLE, { a5: ["use"] })).slice(0, 2)).toEqual(["a-free-trial", "a-demo"]);
        expect(ids(profileOptionsShown(d1, {}, PEOPLE, { a5: ["decide"] }))[0]).toBe("a-quote-or-proposal");
    });

    it("writes a Profile's persona line, from the parts answered", () => {
        expect(profilePersona("Sara", { a1: ["34"], a2: ["woman"], a3: ["professional"], a7: ["family"] })).toBe("Sara, 34, a professional, lives with her partner and children.");
        expect(profilePersona("Ola", { a3b: ["owner"] })).toBe("Ola, an owner or senior leader.");
        expect(profilePersona("Kim", {})).toBe("");
    });

});

describe("the Offering's readers", () => {
    it("puts Local delivery first in O20 for customers working at home", () => {
        expect(ids(offeringOptionsWith("o20", { type: "Product", workenv: "remote" }))[0]).toBe("local");
    });
    it("says the Support promise from O16, none with No set time", () => {
        expect(supportPromise({ o16: ["oneday"] })).toBe("Support promise: you reply within one working day.");
        expect(supportPromise({ o16: ["none"] })).toBeNull();
    });
});

describe("the Competitors' readers", () => {

    it("opens the customers beyond a narrower competitor's reach (K2)", () => {
        const labels = (k2: string, reach: string) => competitorOpenings({ k2: [k2] }, "direct", { profiles: [], others: [], reach }).map(opening => opening.label);
        expect(labels("city", "country")).toContain("Serve the customers beyond their reach");
        expect(labels("online", "country")).not.toContain("Serve the customers beyond their reach");
    });

    it("adds the crowded market's line to K10's i at 4 or 5", () => {
        expect(competitorK10Info("5")).toEqual([...COMPETITOR_INFO.k10, CROWDED_LINE]);
        expect(competitorK10Info("3")).toEqual(COMPETITOR_INFO.k10);
    });

    it("lays K1 to K10 side by side, a column per competitor, rows with an answer only", () => {
        const table = competitorTable([{ name: "Mill", type: "direct", questions: { k1: ["Product"], k2: ["countries"], "k8-rating": ["quality-and-results:5", "lower-price:1"] } }, { name: "", type: "direct", questions: {} }], { profiles: [] });
        expect(table.head).toEqual(["", "Mill", "Unnamed competitor"]);
        expect(table.rows.map(row => row[0])).toEqual(["What they offer", "Where they sell", "Strong on", "Weak on"]);
        expect(table.rows[0]).toEqual(["What they offer", "Product", ""]);
    });

});

describe("the Strategy SWOT's starts", () => {
    it("shows a quadrant's starts until the founder edits it", () => {
        const starts = { opportunities: ["The market for Makers is growing."], threats: [] };
        expect(strategySwotShown({ swot: { opportunities: [""] }, swotEdited: [] }, starts).opportunities).toEqual(["The market for Makers is growing."]);
        expect(strategySwotShown({ swot: { opportunities: [""] }, swotEdited: ["opportunities"] }, starts).opportunities).toEqual([""]);
        expect(strategySwotShown({ swot: { threats: [""] }, swotEdited: [] }, starts).threats).toEqual([""]);
    });
});
