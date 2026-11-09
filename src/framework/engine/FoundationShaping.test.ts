import { describe, expect, it } from "vitest";
import { segmentContextFor } from "./SegmentContext";
import type { SegmentIdentity } from "./SegmentContext";
import { SEGMENT_QUESTIONS, segmentChoose, segmentOptions, segmentQuestionsOf } from "./SegmentQuestions";
import { PROFILE_QUESTIONS, profileOptionsShown, profileShown, profileUserName, profileUserWho } from "./ProfileQuestions";
import { OFFERING_QUESTIONS, offeringOptionsWith, offeringShown, offeringWho } from "./OfferingQuestions";

/* Proxy and Dual-Intent tailoring, and earlier answers shaping later ones (2026-11-09; docs 35, 36 and 43): starts and orders only, never locks; a saved answer wins. */

const base: SegmentIdentity = { relationships: ["b2c"], marketType: "single", audience: ["adult"], stage: "grow" };
const proxyParent = segmentContextFor({ ...base, buyerCategory: ["b2c:proxy"], endUser: ["rel:parent", "age:minor"] }, false);
const dualPartner = segmentContextFor({ ...base, buyerCategory: ["b2c:dual"], endUser: ["rel:partner"] }, false);
const direct = segmentContextFor({ ...base, buyerCategory: ["b2c:direct"] }, false);
const business = segmentContextFor({ relationships: ["b2b"], marketType: "single", audience: ["smb"], stage: "grow" }, true);
const question = (id: string) => PROFILE_QUESTIONS.find(entry => entry.id === id)!;
const ids = (options: readonly { id: string }[]) => options.map(option => option.id);

describe("the words follow who the question is about", () => {
    it("asks a Proxy or Dual Segment's market size in buyers, as the rest of the buyer's boxes", () => {
        const label = (context: typeof direct) => segmentQuestionsOf("market-size", {}, context).find(entry => entry.id === "tam")!.label;
        expect(label(direct)).toBe("How many potential customers are there?");
        expect(label(proxyParent)).toBe("How many potential buyers are there?");
        expect(label(dualPartner)).toBe("How many potential buyers are there?");
    });

    it("asks a Proxy Segment's Offering how the end user receives it, has it and what they give, and how the buyer pays; a Dual or Direct one as written", () => {
        const proxy = { endsUser: true };
        expect(offeringWho("o6", "How do your customers receive it?", proxy)).toBe("How do your end users receive it?");
        expect(offeringWho("o15", "How long until they have it?", proxy)).toBe("How long until your end users have it?");
        expect(offeringWho("o10", "What do your customers need to give you?", proxy)).toBe("What do your end users need to give you?");
        expect(offeringWho("o3", "On what terms do they pay for it?", proxy)).toBe("On what terms do your buyers pay for it?");
        expect(offeringWho("o3t", "When do they pay?", proxy)).toBe("When do your buyers pay?");
        expect(offeringWho("o6", "How do your customers receive it?", { endsUser: true, dual: true })).toBe("How do your customers receive it?");
        expect(offeringWho("o6", "How do your customers receive it?", {})).toBe("How do your customers receive it?");
        // O4: the buyer's on a Proxy Segment (owner, 2026-11-09, as K8); a Dual or Direct one keeps "your customers".
        const o4 = OFFERING_QUESTIONS.find(question => question.id === "o4")!.label;
        expect(offeringWho("o4", o4, proxy)).toBe("Which of what matters most to your buyers does it do best?");
        expect(offeringWho("o4", o4, { endsUser: true, dual: true })).toBe(o4);
        expect(offeringWho("o4", o4, {})).toBe("Which of what matters most to your customers does it do best?");
    });

    it("names the end user by the relationship, else the end user", () => {
        expect(profileUserName(proxyParent)).toBe("the child");
        expect(profileUserName(dualPartner)).toBe("the partner");
        expect(profileUserName({ relations: ["rel:caregiver"] })).toBe("the person cared for");
        expect(profileUserName({ relations: ["rel:employer"] })).toBe("the employee");
        expect(profileUserName({ relations: ["rel:serving"] })).toBe("the client");
        expect(profileUserName({ relations: ["rel:institution"] })).toBe("the person it serves");
        expect(profileUserName({ relations: ["rel:friend"] })).toBe("the end user");
        expect(profileUserName({ relations: ["rel:parent", "rel:partner"] })).toBe("the end user");
        expect(profileUserWho("How old is {s}?", "the child")).toBe("How old is the child?");
    });
});

describe("a Dual-Intent buyer uses it too", () => {
    it("starts the buyer's role in buying with Uses it, Places the order and Makes the final decision", () => {
        expect(profileShown({}, {}, dualPartner).a5).toEqual(["use", "order", "decide"]);
        expect(profileShown({}, {}, proxyParent).a5).toEqual(["order", "decide"]);
        expect(profileShown({ a5: ["decide"] }, {}, dualPartner).a5).toEqual(["decide"]);
    });
});

describe("a minor end user of a Proxy buyer is asked what fits a minor", () => {
    it("offers no adult goals (E1) nor the cost (E2), and keeps a saved one shown", () => {
        const child = { "u-age": ["child"] };
        expect(ids(profileOptionsShown(question("e1"), child, proxyParent, {}))).not.toEqual(expect.arrayContaining(["win-customers-or-earn-more"]));
        for (const id of ["win-customers-or-earn-more", "meet-a-requirement", "save-time-money"]) {
            expect(ids(profileOptionsShown(question("e1"), child, proxyParent, {}))).not.toContain(id);
        }
        expect(ids(profileOptionsShown(question("e2"), child, proxyParent, {}))).not.toContain("it-costs-too-much");
        expect(ids(profileOptionsShown(question("e1"), child, proxyParent, { e1: ["save-time-money"] }))).toContain("save-time-money");
        // An adult end user, or a Dual one, keeps every option.
        expect(ids(profileOptionsShown(question("e1"), { "u-age": ["established"] }, proxyParent, {}))).toContain("save-time-money");
        expect(ids(profileOptionsShown(question("e2"), {}, dualPartner, {}))).toContain("it-costs-too-much");
    });

    it("asks a baby or child how they want to be seen with friends and in style only, a teenager all but a legacy", () => {
        expect(ids(profileOptionsShown(question("social"), { "u-age": ["child"] }, proxyParent, {}))).toEqual(["as-having-good-taste-style", "as-part-of-a-group-they-value"]);
        expect(ids(profileOptionsShown(question("social"), { "u-age": ["baby"] }, proxyParent, {}))).toEqual(["as-having-good-taste-style", "as-part-of-a-group-they-value"]);
        expect(ids(profileOptionsShown(question("social"), { "u-age": ["teen"] }, proxyParent, {}))).not.toContain("as-leaving-something-for-their-family");
        expect(ids(profileOptionsShown(question("social"), { "u-age": ["teen"] }, proxyParent, {}))).toContain("as-one-of-the-few-with-access");
    });
});

describe("orders by earlier answers (never a lock)", () => {
    it("puts the buyer's household of the relationship first (A7)", () => {
        expect(ids(profileOptionsShown(question("a7"), {}, proxyParent, {})).slice(0, 2)).toEqual(["family", "single-parent"]);
        expect(ids(profileOptionsShown(question("a7"), {}, dualPartner, {})).slice(0, 2)).toEqual(["partner", "family"]);
        expect(ids(profileOptionsShown(question("a7"), {}, direct, {}))[0]).toBe("alone");
        expect(profileOptionsShown(question("a7"), {}, proxyParent, {})).toHaveLength(question("a7").options.length);
    });

    it("puts the worries the values ticked in B1 point to first, the highest rated first (B1 → E3)", () => {
        const answers = { b1: ["lower-price", "good-support", "speed"], "b1-rating": ["good-support:5", "lower-price:3"] };
        expect(ids(profileOptionsShown(question("e3"), {}, direct, answers)).slice(0, 2)).toEqual(["support-after-they-buy", "the-price-or-their-budget"]);
    });

    it("orders how they decide to buy by what makes them go shopping (Box 4, 5 → 6)", () => {
        const path = SEGMENT_QUESTIONS.find(entry => entry.id === "path")!;
        expect(segmentOptions(path, { trigger: ["boredom"] }, direct)[0].id).toBe("impulse");
        expect(ids(segmentOptions(path, { trigger: ["need"] }, direct)).slice(0, 2)).toEqual(["urgent", "researcher"]);
        expect(segmentOptions(path, {}, direct)[0].id).toBe("impulse");
        expect(segmentOptions(path, { trigger: ["need"] }, direct)).toHaveLength(path.options.length);
    });

    it("puts the end user's needs first in what they give you by the form (O1 → O10)", () => {
        expect(offeringOptionsWith("o10", { type: "Service" }, [], { o1: ["inperson"] })[0].id).toBe("home");
        expect(offeringOptionsWith("o10", { type: "Service" }, [], { o1: ["live"] })[0].id).toBe("attendance");
        expect(offeringOptionsWith("o10", { type: "Service" }, [], { o1: ["project"] })[0].id).toBe("access");
    });
});

describe("starts from earlier answers (a saved answer wins)", () => {
    it("starts how they receive it from the form, the clearest way only (O1 → O6)", () => {
        const o6 = (form: string) => offeringShown({ o1: [form] }, { type: "Hybrid" }).o6;
        expect(o6("physical")).toEqual(["shipped"]);
        expect(o6("digital")).toEqual(["auto"]);
        expect(o6("app")).toEqual(["access"]);
        expect(o6("access")).toEqual(["access"]);
        expect(o6("live")).toEqual(["live"]);
        expect(o6("inperson")).toEqual(["inperson"]);
        expect(o6("project")).toEqual(["byyou"]);
        expect(o6("ongoing")).toBeUndefined();
        expect(offeringShown({ o1: ["physical"], o6: ["inperson", "collect"] }, { type: "Product" }).o6).toEqual(["inperson", "collect"]);
    });

    it("starts how long until they have it from a digital form (O1 → O15)", () => {
        for (const form of ["digital", "app", "access"]) {
            expect(offeringShown({ o1: [form] }, { type: "Product" }).o15).toEqual(["now"]);
        }
        expect(offeringShown({ o1: ["physical"] }, { type: "Product" }).o15).toBeUndefined();
        expect(offeringShown({ o1: ["digital"], o15: ["week"] }, { type: "Product" }).o15).toEqual(["week"]);
    });

    it("starts the terms from the form (O1 → O3), and when they pay from the terms (O3 → O3b)", () => {
        const shown = (o1: string, saved: Record<string, string[]> = {}) => offeringShown({ o1: [o1], ...saved }, { type: "Hybrid" });
        expect(shown("access")).toMatchObject({ o3: ["subscription"], o3t: ["monthly"] });
        expect(shown("project")).toMatchObject({ o3: ["project"], o3t: ["deposit"] });
        expect(shown("ongoing")).toMatchObject({ o3: ["retainer"], o3t: ["monthly"] });
        expect(shown("live").o3).toEqual(["session"]);
        expect(shown("inperson").o3).toEqual(["session"]);
        expect(shown("physical").o3).toBeUndefined();
        expect(shown("physical", { o3: ["once"] }).o3t).toEqual(["before"]);
        expect(shown("access", { o3: ["once"], o3t: ["after"] })).toMatchObject({ o3: ["once"], o3t: ["after"] });
    });

    it("starts what comes after the sale at None where no help is given (O7 → O17)", () => {
        expect(offeringShown({ o7: ["none"] }, { type: "Service", stage: "grow" }).o17).toEqual(["none"]);
        expect(offeringShown({ o7: ["guides"] }, { type: "Service", stage: "grow" }).o17).toBeUndefined();
        expect(offeringShown({ o7: ["none"], o17: ["updates"] }, { type: "Service", stage: "grow" }).o17).toEqual(["updates"]);
    });

    it("starts the help before buying from how they compare options, only where nothing else starts it (D1 → D2)", () => {
        expect(profileShown({ d1: ["a-demo-trial-or-sample"] }, {}, direct).d2).toEqual(["formal"]);
        expect(profileShown({ d1: ["a-quote-or-proposal"] }, {}, direct).d2).toEqual(["formal"]);
        expect(profileShown({ d1: ["a-meeting-or-call"] }, {}, direct).d2).toEqual(["person"]);
        // The Segment's online comfort starts it first; a saved D2 wins.
        expect(profileShown({ d1: ["a-meeting-or-call"] }, { comfort: ["5"] }, direct).d2).toEqual(["alone"]);
        expect(profileShown({ d1: ["a-demo-trial-or-sample"], d2: ["little"] }, {}, direct).d2).toEqual(["little"]);
    });

    it("starts who decides to buy from the kind and size of organisation (Box 3, 1 and 2 → Box 4, 9)", () => {
        const orgtype = SEGMENT_QUESTIONS.find(entry => entry.id === "orgtype")!;
        const size = SEGMENT_QUESTIONS.find(entry => entry.id === "size")!;
        expect(segmentChoose(orgtype, {}, ["public"]).authorise).toEqual(["procurement"]);
        expect(segmentChoose(size, { orgtype: ["private"] }, ["large"]).authorise).toEqual(["procurement"]);
        expect(segmentChoose(size, { orgtype: ["private"] }, ["micro"]).authorise).toEqual(["solo"]);
        expect(segmentChoose(orgtype, {}, ["self"]).authorise).toEqual(["solo"]);
        expect(segmentChoose(size, { orgtype: ["private"] }, ["medium"]).authorise).toBeUndefined();
        expect(segmentChoose(size, { orgtype: ["private"], authorise: ["champions"] }, ["large"]).authorise).toEqual(["champions"]);
        expect(business.frame).toBe("business");
    });
});
