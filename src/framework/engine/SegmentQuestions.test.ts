import { describe, expect, it } from "vitest";
import {
    SEGMENT_INDUSTRIES,
    SEGMENT_QUESTIONS,
    SEGMENT_SECTORS,
    type SegmentAnswers,
    type SegmentContext,
    asSegmentAnswers,
    segmentAnswerLines,
    segmentChoose,
    segmentOptions,
    segmentQuestionsOf,
    segmentSettle
} from "./SegmentQuestions.ts";

const OPEN: SegmentContext = { frame: "open", stage: "manage", lifeStages: [], endsUser: false, userStages: [], relations: [], scales: [] };
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
        expect(ids(segmentOptions(question("work2"), { age: ["minor"] }, students))).not.toContain("retired");
        expect(ids(segmentOptions(question("work2"), { age: ["peak"] }, students))).toContain("retired");
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
        expect(ids(segmentOptions(question("u-school"), {}, parent))).toEqual(["early", "primary", "secondary"]);
        expect(ids(segmentOptions(question("u-school"), { "u-age": ["child"] }, parent))).toEqual(["early", "primary"]);
        expect(segmentSettle({ "u-age": ["baby"], "u-school": ["secondary"] }, parent)).toEqual({ "u-age": ["baby"], "u-school": ["early"] });
        const serving = { ...OPEN, endsUser: true, relations: ["rel:serving"] };
        expect(ids(segmentQuestionsOf("user", { "u-orgtype": ["self"] }, serving))).toEqual(["u-age", "u-orgtype", "u-comfort"]);
        const employer = { ...OPEN, endsUser: true, relations: ["rel:employer", "rel:friend"] };
        expect(ids(segmentQuestionsOf("user", {}, employer))).toEqual(["u-age", "u-work", "u-job", "u-comfort"]);
    });

    it("settles the answers: what is no longer asked, or no longer offered, goes", () => {
        const students = { ...OPEN, frame: "people" as const, lifeStages: ["young"] };
        expect(segmentSettle({ age: ["minor"], education: ["bachelor"], income: ["high"], work: ["retired"] }, students)).toEqual({ age: ["minor"] });
        expect(segmentSettle({ age: ["peak"] }, students)).toEqual({});
        expect(segmentSettle({ orgtype: ["self"], size: ["micro"], sector: ["tech"], industry: ["health"] }, { ...OPEN, frame: "business" })).toEqual({ orgtype: ["self"], sector: ["tech"], authorise: ["solo"] });
    });

    it("does not show a question with one option left, and its answer is that option", () => {
        const adults = { ...OPEN, endsUser: true, userStages: ["age:young"], relations: ["rel:friend"] };
        expect(ids(segmentQuestionsOf("user", {}, adults))).toEqual(["u-work", "u-comfort"]);
        expect(segmentSettle({}, adults)).toEqual({ "u-age": ["young"] });
    });

    it("starts the work situation from the age term, and leaves a chosen one alone", () => {
        const work = (age: string, before: SegmentAnswers = {}) => segmentChoose(question("age"), before, [age]).work;
        const started = (age: string, before: SegmentAnswers = {}) => segmentChoose(question("age"), before, [age]);
        expect(started("minor").work).toEqual(["notworking"]);
        expect(started("minor").work2).toEqual(["student"]);
        expect(started("young").work2).toEqual(["student"]);
        expect(started("peak").work).toEqual(["working"]);
        expect(started("peak").work2).toBeUndefined();
        expect(started("active").work2).toEqual(["retired"]);
        expect(work("peak", { work: ["notworking"] })).toEqual(["notworking"]);
    });

    it("asks the non-working situation only when the person is not working", () => {
        const people = { ...OPEN, frame: "people" as const };
        expect(ids(segmentQuestionsOf("demographics", {}, people))).toEqual(["age", "education", "work", "income", "gender"]);
        expect(ids(segmentQuestionsOf("demographics", { work: ["notworking"] }, people))).toContain("work2");
        expect(ids(segmentQuestionsOf("demographics", { work: ["working"] }, people))).not.toContain("work2");
    });

    it("asks the working environment, schedule and income structure of someone who is working", () => {
        const people = { ...OPEN, frame: "people" as const };
        expect(ids(segmentQuestionsOf("demographics", { work: ["working"] }, people))).toEqual(["age", "education", "work", "workenv", "workschedule", "workincome", "income", "gender"]);
        expect(segmentSettle({ work: ["notworking"], work2: ["student"], workenv: ["remote"], workschedule: ["shift"], workincome: ["hourly"] }, people)).toEqual({ work: ["notworking"], work2: ["student"] });
        expect(segmentSettle({ work: ["working"], work2: ["student"], workenv: ["remote"] }, people)).toEqual({ work: ["working"], workenv: ["remote"] });
    });

    it("starts the way of paying from where they buy: Digital wallets on a phone, and leaves a chosen way alone", () => {
        expect(segmentChoose(question("setting"), {}, ["mobile"]).pay).toEqual(["wallet"]);
        expect(segmentChoose(question("setting"), {}, ["desktop"]).pay).toBeUndefined();
        expect(segmentChoose(question("setting"), { pay: ["card"] }, ["mobile"]).pay).toEqual(["card"]);
    });

    it("reads an older saved work situation as working or not, and the situation", () => {
        expect(asSegmentAnswers({ work: ["employed"] })).toEqual({ work: ["working"] });
        expect(asSegmentAnswers({ work: ["home"], "u-work": ["retired"] })).toEqual({ work: ["notworking"], work2: ["homemaker"], "u-work": ["notworking"], "u-work2": ["retired"] });
    });

    it("reads a saved answer: known questions and options only, one id for a radio", () => {
        expect(asSegmentAnswers({ age: ["minor", "young"], gender: ["nope"], bogus: ["x"], discover: ["peers", "peers", 3] })).toEqual({ age: ["minor"], discover: ["peers"] });
        expect(asSegmentAnswers(null)).toEqual({});
        expect(segmentAnswerLines({ share: ["public", "verbal"], pay: ["card"] })).toEqual([
            { label: "How do they share what they like?", value: "They post it publicly on social media; They tell people in person" },
            { label: "How do they prefer to pay?", value: "Credit / debit card" }
        ]);
    });


    describe("what the answers above settle (asked of no one, answered for them)", () => {

        const business = { ...OPEN, frame: "business" as const };

        it("makes freelancers self-employed with no size, and shows them no question about who decides", () => {
            const solo = { ...business, scales: ["solo"] };
            expect(ids(segmentQuestionsOf("business-data", {}, solo))).toEqual(["sector"]);
            expect(segmentSettle({}, solo)).toEqual({ orgtype: ["self"], authorise: ["solo"] });
            expect(ids(segmentQuestionsOf("purchasing", {}, solo))).not.toContain("authorise");
            expect(segmentSettle({ ...{}, orgtype: ["private"], size: ["small"], authorise: ["executive"] }, solo)).toEqual({ orgtype: ["self"], authorise: ["solo"] });
        });

        it("takes the sizes of the scale chosen, and offers a public body only for Enterprise / Public Sector", () => {
            expect(ids(segmentOptions(question("size"), {}, { ...business, scales: ["smb"] }))).toEqual(["micro", "small"]);
            expect(segmentSettle({}, { ...business, scales: ["mid"] }).size).toEqual(["medium"]);
            expect(segmentSettle({}, { ...business, scales: ["enterprise"] }).size).toEqual(["large"]);
            expect(ids(segmentOptions(question("orgtype"), {}, { ...business, scales: ["smb"] }))).toEqual(["private", "nonprofit"]);
            expect(ids(segmentOptions(question("orgtype"), {}, { ...business, scales: ["enterprise"] }))).toEqual(["private", "public", "nonprofit"]);
            expect(ids(segmentOptions(question("orgtype"), {}, { ...business, scales: ["solo", "smb"] }))).toEqual(["private", "nonprofit", "self"]);
            expect(ids(segmentOptions(question("size"), {}, { ...business, scales: [] }))).toEqual(["micro", "small", "medium", "large"]);
        });

        it("makes a self-employed customer decide alone", () => {
            expect(segmentSettle({ orgtype: ["self"] }, { ...business, scales: ["solo", "smb"] })).toEqual({ orgtype: ["self"], authorise: ["solo"] });
        });

        it("makes a retiree not working and retired", () => {
            const people = { ...OPEN, frame: "people" as const };
            expect(segmentSettle({ age: ["active"] }, people)).toEqual({ age: ["active"], work: ["notworking"], work2: ["retired"] });
            expect(segmentSettle({ age: ["dependent"], work: ["working"] }, people)).toEqual({ age: ["dependent"], work: ["notworking"], work2: ["retired"] });
            expect(ids(segmentQuestionsOf("demographics", { age: ["active"] }, people))).toEqual(["age", "education", "income", "gender"]);
        });

        it("asks the user's school stage, work and tool comfort only where the user's age calls for them", () => {
            const parent = { ...OPEN, endsUser: true, userStages: ["age:minor"], relations: ["rel:parent", "rel:friend"] };
            expect(segmentSettle({ "u-age": ["baby"] }, parent)).toEqual({ "u-age": ["baby"], "u-school": ["early"] });
            expect(ids(segmentQuestionsOf("user", { "u-age": ["baby"] }, parent))).toEqual(["u-age"]);
            expect(ids(segmentOptions(question("u-school"), { "u-age": ["child"] }, parent))).toEqual(["early", "primary"]);
            expect(segmentSettle({ "u-age": ["teen"] }, parent)["u-school"]).toEqual(["secondary"]);
            expect(ids(segmentQuestionsOf("user", { "u-age": ["child"] }, parent))).toEqual(["u-age", "u-school", "u-comfort"]);
            const adults = { ...OPEN, endsUser: true, userStages: ["age:adult"], relations: ["rel:parent", "rel:friend"] };
            expect(ids(segmentQuestionsOf("user", { "u-age": ["peak"] }, adults))).toEqual(["u-age", "u-work", "u-comfort"]);
        });

    });

});
