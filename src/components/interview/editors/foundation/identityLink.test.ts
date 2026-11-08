import { describe, expect, it } from "vitest";
import { segmentContext, segmentContextFor, segmentFrame, settledSegmentAnswers } from "./identityLink";
import { SEGMENT_QUESTIONS, segmentOptions, segmentQuestionsOf } from "../../../../framework/engine/SegmentQuestions";
import { PROFILE_QUESTIONS, profileQuestionAsked } from "../../../../framework/engine/ProfileQuestions";

const identity = (relationships: string[], audience: string[] = [], buyerCategory: string[] = []) => ({ relationships, marketType: "single", audience, buyerCategory });

describe("the buyer the Segment card follows", () => {

    it("is the relationship chosen", () => {
        expect(segmentFrame(identity(["b2c"]))).toBe("people");
        expect(segmentFrame(identity(["b2b"]))).toBe("business");
        expect(segmentFrame(identity(["b2c", "b2b"]))).toBe("open");
    });

    it("is read from the buyer's category, then the audience, where no relationship is chosen", () => {
        expect(segmentFrame(identity([], [], ["b2b:direct"]))).toBe("business");
        expect(segmentFrame(identity([], ["smb"]))).toBe("business");
        expect(segmentFrame(identity([], ["adult"]))).toBe("people");
        expect(segmentFrame(identity([], ["adult", "smb"]))).toBe("open");
        expect(segmentFrame(identity([]))).toBe("open");
    });

    it("makes a Segment of one kind where the buyer is not known: businesses with the Business Data key, people without", () => {
        expect(segmentContextFor(identity([]), false).frame).toBe("people");
        expect(segmentContextFor(identity(["b2c", "b2b"]), true).frame).toBe("business");
        expect(segmentContextFor(identity(["b2b"]), false).frame).toBe("business");
    });


    it("settles a Segment's answers against Identity as it is now, so a change in Positioning leaves no old answer in the documents", () => {
        const stale = { questions: { age: ["peak"], "u-age": ["child"], "u-school": ["primary"], orgtype: ["private"], size: ["small"], comfort: ["5"], discover: ["peers"] }, description: {} };
        // A consumer buyer of Direct Buyers: the business questions and the user's questions are not asked.
        expect(settledSegmentAnswers(stale, { customerType: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:direct"], endUser: [] }))
            .toEqual({ age: ["peak"], comfort: ["5"], discover: ["peers"] });
        // The buyer became a business: the people's age is no longer asked.
        expect(settledSegmentAnswers(stale, { customerType: ["b2b"], marketType: "single", audience: ["smb"], buyerCategory: ["b2b:direct"], endUser: [] }))
            .toEqual({ orgtype: ["private"], size: ["small"], comfort: ["5"], discover: ["peers"] });
        // A Proxy buyer of a child: the user's questions stand.
        expect(settledSegmentAnswers(stale, { customerType: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:proxy"], endUser: ["rel:parent", "age:minor"] }))
            .toEqual({ age: ["peak"], "u-age": ["child"], "u-school": ["primary"], comfort: ["5"], discover: ["peers"] });
    });


    it("reads each Segment's end user from its own relationship: B2C Direct and B2B Proxy (S9; owner, 2026-11-08)", () => {
        const s9 = { relationships: ["b2c", "b2b"], marketType: "single", audience: ["adult", "mid"], buyerCategory: ["b2c:direct", "b2b:proxy"], endUser: ["rel:employer"] };
        const people = segmentContextFor(s9, false);
        const business = segmentContextFor(s9, true);
        expect(people).toMatchObject({ frame: "people", endsUser: false, relations: [] });
        expect(business).toMatchObject({ frame: "business", endsUser: true, relations: ["rel:employer"], userStages: [] });
        // The B2C Direct Segment is not asked about an end user; the B2B one is, and only of adult ages.
        const questions = (context: typeof people) => ["demographics", "business-data", "user"].flatMap(box => segmentQuestionsOf(box as "user", {}, context).map(question => question.id));
        expect(questions(people)).not.toContain("u-age");
        expect(questions(people)).not.toContain("u-job");
        expect(questions(people)).not.toContain("u-comfort");
        expect(questions(business)).toEqual(expect.arrayContaining(["u-age", "u-job", "u-comfort"]));
        expect(profileQuestionAsked(PROFILE_QUESTIONS.find(question => question.id === "a5")!, {}, people)).toBe(false);
    });

    it("offers a business Segment's end user only working ages (owner, 2026-11-08; no retirees, phase 5)", () => {
        const context = segmentContextFor({ relationships: ["b2b"], marketType: "single", audience: ["mid"], buyerCategory: ["b2b:proxy"], endUser: ["rel:employer"] }, true);
        const ages = segmentOptions(SEGMENT_QUESTIONS.find(question => question.id === "u-age")!, {}, context).map(option => option.id);
        expect(ages).toEqual(["young", "established", "peak", "mature"]);
        // A consumer's end user can still be a child.
        const child = segmentContextFor({ relationships: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:proxy"], endUser: ["rel:family"] }, false);
        expect(segmentOptions(SEGMENT_QUESTIONS.find(question => question.id === "u-age")!, {}, child).map(option => option.id)).toContain("baby");
    });

    it("takes the user's life stage that fits where only one does, even if it was never saved", () => {
        const context = segmentContext({ relationships: ["b2c"], marketType: "single", audience: ["young"], buyerCategory: ["b2c:proxy"], endUser: ["rel:parent"] });
        expect(context.userStages).toEqual(["age:minor"]);
    });

});
