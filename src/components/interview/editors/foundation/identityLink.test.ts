import { describe, expect, it } from "vitest";
import { segmentContextFor, segmentFrame } from "./identityLink";

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

    it("makes a Segment of people of one that has not ticked Business Data, where the buyer is not known", () => {
        expect(segmentContextFor(identity([]), false).frame).toBe("people");
        expect(segmentContextFor(identity([]), true).frame).toBe("open");
        expect(segmentContextFor(identity(["b2b"]), false).frame).toBe("business");
    });

});
