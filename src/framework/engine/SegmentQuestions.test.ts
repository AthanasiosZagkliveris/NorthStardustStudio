import { describe, expect, it } from "vitest";
import {
    SEGMENT_INDUSTRIES,
    SEGMENT_QUESTIONS,
    SEGMENT_SECTORS,
    type SegmentContext,
    asSegmentAnswers,
    segmentAnswerLines,
    segmentChoose,
    segmentOptions,
    segmentQuestionsOf,
    segmentSettle
} from "./SegmentQuestions.ts";

const OPEN: SegmentContext = { frame: "open", stage: "manage", lifeStages: [], endsUser: false, userStages: [], relations: [] };
const question = (id: string) => SEGMENT_QUESTIONS.find(entry => entry.id === id)!;
const ids = (list: readonly { id: string }[]) => list.map(option => option.id);

describe("the Segment's questions", () => {

    it("gives every question unique option ids and every industry a sector", () => {
        for (const entry of SEGMENT_QUESTIONS) {
            expect(new Set(ids(entry.options)).size).toBe(entry.options.length);
        }
        expect(SEGMENT_INDUSTRIES).toHaveLength(18);
        for (const industry of SEGMENT_INDUSTRIES) {
            expect(ids(SEGMENT_SECTORS)).toContain(industry.sector);
        }
    });

    it("asks a people buyer Boxes 1 and the B2C habits, and a business buyer Box 3 and the decision", () => {
        const people = { ...OPEN, frame: "people" as const };
        const business = { ...OPEN, frame: "business" as const };
        expect(ids(segmentQuestionsOf("demographics", {}, people))).toContain("age");
        expect(ids(segmentQuestionsOf("demographics", {}, business))).toEqual([]);
        expect(ids(segmentQuestionsOf("purchasing", {}, people))).not.toContain("authorise");
        expect(ids(segmentQuestionsOf("purchasing", {}, business))).not.toContain("trigger");
        expect(ids(segmentQuestionsOf("purchasing", {}, OPEN))).toEqual(expect.arrayContaining(["trigger", "authorise"]));
    });

    it("skips the size of a self-employed organisation and asks the industry after the sector", () => {
        const business = { ...OPEN, frame: "business" as const };
        expect(ids(segmentQuestionsOf("business-data", {}, business))).toEqual(["orgtype", "size", "sector"]);
        expect(ids(segmentQuestionsOf("business-data", { orgtype: ["self"], sector: ["tech"] }, business))).toEqual(["orgtype", "sector", "industry"]);
        expect(ids(segmentOptions(question("industry"), { sector: ["human"] }, business))).toEqual(["government", "education", "health", "other"]);
    });

    it("offers the age terms of the Positioning life stage, and drops education and income for minors", () => {
        const students = { ...OPEN, frame: "people" as const, lifeStages: ["young"] };
        expect(ids(segmentOptions(question("age"), {}, students))).toEqual(["minor", "young"]);
        expect(ids(segmentOptions(question("age"), {}, { ...students, lifeStages: ["senior"] }))).toEqual(["active", "dependent"]);
        expect(ids(segmentQuestionsOf("demographics", { age: ["minor"] }, students))).toEqual(["age", "work", "gender"]);
        expect(ids(segmentOptions(question("work"), { age: ["minor"] }, students))).not.toContain("retired");
        expect(ids(segmentOptions(question("pay"), { age: ["minor"] }, students))).not.toContain("bnpl");
    });

    it("holds the kind of area back while planning and launching, and asks it only for one place or one country", () => {
        expect(ids(segmentQuestionsOf("geographics", { reach: ["city"] }, { ...OPEN, stage: "plan" }))).toEqual(["reach"]);
        expect(ids(segmentQuestionsOf("geographics", { reach: ["city"] }, OPEN))).toEqual(["reach", "area"]);
        expect(ids(segmentQuestionsOf("geographics", { reach: ["online"] }, OPEN))).toEqual(["reach"]);
    });

    it("keeps invoicing for business customers", () => {
        expect(ids(segmentOptions(question("pay"), {}, { ...OPEN, frame: "people" }))).toEqual(["card", "wallet", "bnpl"]);
        expect(ids(segmentOptions(question("pay"), {}, OPEN))).toContain("invoice");
    });

    it("makes 'They don't typically share' exclude the other ways, and holds the limits", () => {
        expect(segmentChoose(question("share"), { share: ["public"] }, ["public", "none"]).share).toEqual(["none"]);
        expect(segmentChoose(question("share"), { share: ["none"] }, ["none", "verbal"]).share).toEqual(["verbal"]);
        expect(segmentChoose(question("discover"), {}, ["peers", "communities", "creators", "media"]).discover).toHaveLength(3);
        expect(segmentChoose(question("trigger"), { trigger: ["need"] }, []).trigger).toBeUndefined();
    });

    it("asks the user block only for a Proxy or Dual-Intent buyer, by relationship", () => {
        expect(segmentQuestionsOf("user", {}, OPEN)).toEqual([]);
        const parent = { ...OPEN, endsUser: true, userStages: ["age:minor"], relations: ["rel:parent"] };
        expect(ids(segmentQuestionsOf("user", {}, parent))).toEqual(["u-age", "u-school", "u-comfort"]);
        expect(ids(segmentOptions(question("u-age"), {}, parent))).toEqual(["baby", "child", "teen"]);
        const serving = { ...OPEN, endsUser: true, relations: ["rel:serving"] };
        expect(ids(segmentQuestionsOf("user", { "u-orgtype": ["self"] }, serving))).toEqual(["u-age", "u-orgtype", "u-comfort"]);
        const employer = { ...OPEN, endsUser: true, relations: ["rel:employer", "rel:friend"] };
        expect(ids(segmentQuestionsOf("user", {}, employer))).toEqual(["u-age", "u-work", "u-job", "u-comfort"]);
    });

    it("settles the answers: what is no longer asked, or no longer offered, goes", () => {
        const students = { ...OPEN, frame: "people" as const, lifeStages: ["young"] };
        expect(segmentSettle({ age: ["minor"], education: ["bachelor"], income: ["high"], work: ["retired"] }, students)).toEqual({ age: ["minor"] });
        expect(segmentSettle({ age: ["peak"] }, students)).toEqual({});
        expect(segmentSettle({ orgtype: ["self"], size: ["micro"], sector: ["tech"], industry: ["health"] }, { ...OPEN, frame: "business" })).toEqual({ orgtype: ["self"], sector: ["tech"] });
    });

    it("reads a saved answer: known questions and options only, one id for a radio", () => {
        expect(asSegmentAnswers({ age: ["minor", "young"], gender: ["nope"], bogus: ["x"], discover: ["peers", "peers", 3] })).toEqual({ age: ["minor"], discover: ["peers"] });
        expect(asSegmentAnswers(null)).toEqual({});
        expect(segmentAnswerLines({ share: ["public", "verbal"], pay: ["card"] })).toEqual([
            { label: "How do they share their favorite finds or experiences?", value: "Posting publicly on personal social media feeds; Verbally during face-to-face conversations" },
            { label: "How do they prefer to pay?", value: "Traditional credit / debit card" }
        ]);
    });

});
