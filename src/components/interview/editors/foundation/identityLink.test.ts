import { describe, expect, it } from "vitest";
import { segmentContext, segmentContextFor, segmentFrame, settledSegmentAnswers } from "./identityLink";

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
        const stale = { questions: { age: ["peak"], "u-age": ["child"], "u-school": ["primary"], orgtype: ["private"], size: ["small"], comfort: ["savvy"], discover: ["peers"] }, description: {} };
        // A consumer buyer of Direct Buyers: the business questions and the user's questions are not asked.
        expect(settledSegmentAnswers(stale, { customerType: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:direct"], endUser: [] }))
            .toEqual({ age: ["peak"], comfort: ["savvy"], discover: ["peers"] });
        // The buyer became a business: the people's age is no longer asked.
        expect(settledSegmentAnswers(stale, { customerType: ["b2b"], marketType: "single", audience: ["smb"], buyerCategory: ["b2b:direct"], endUser: [] }))
            .toEqual({ orgtype: ["private"], size: ["small"], comfort: ["savvy"], discover: ["peers"] });
        // A Proxy buyer of a child: the user's questions stand.
        expect(settledSegmentAnswers(stale, { customerType: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:proxy"], endUser: ["rel:parent", "age:minor"] }))
            .toEqual({ age: ["peak"], "u-age": ["child"], "u-school": ["primary"], comfort: ["savvy"], discover: ["peers"] });
    });


    it("takes the user's life stage that fits where only one does, even if it was never saved", () => {
        const context = segmentContext({ relationships: ["b2c"], marketType: "single", audience: ["young"], buyerCategory: ["b2c:proxy"], endUser: ["rel:parent"] });
        expect(context.userStages).toEqual(["age:minor"]);
    });

});
