import { describe, expect, it } from "vitest";

import { profileAnswerLines, profileChoose, profileQuestionAsked, profileQuestionsOf, profileRate, profileRatings, profileSettle, profileShown, profileWho, proposedBusinessProfiles, PROFILE_QUESTIONS } from "./ProfileQuestions";
import type { SegmentContext } from "./SegmentQuestions";

const people = { frame: "people", endsUser: false } as unknown as SegmentContext;
const business = { frame: "business", endsUser: false } as unknown as SegmentContext;
const question = (id: string) => PROFILE_QUESTIONS.find(entry => entry.id === id)!;

describe("the Profile's questions follow the Segment", () => {

    it("asks one job question: the kind of work of a working B2C customer, the job level of a B2B one", () => {
        const ids = (segment: Record<string, string[]>, context: SegmentContext) => profileQuestionsOf("personal", segment, context).map(q => q.id);
        expect(ids({ work: ["working"] }, people)).toContain("a3");
        expect(ids({ work: ["working"] }, people)).not.toContain("a3b");
        expect(ids({ work: ["not"] }, people)).not.toContain("a3");
        expect(ids({ orgtype: ["private"] }, business)).toContain("a3b");
        expect(ids({ orgtype: ["private"] }, business)).not.toContain("a3");
        expect(question("a3").options).toHaveLength(9);
        expect(question("a3b").options.map(option => option.label)).toEqual(["Owner / partner", "Senior executive", "Director / head of department", "Manager / team lead", "Specialist / team member"]);
    });

    it("sets a self-employed customer's job level to Owner / partner without asking it", () => {
        expect(profileQuestionsOf("personal", { orgtype: ["self"] }, business).map(q => q.id)).not.toContain("a3b");
        expect(profileSettle({}, { orgtype: ["self"] }, business).a3b).toEqual(["owner"]);
    });

    it("starts the role in buying from the job level, and keeps a role the user chose", () => {
        expect(profileShown({ a3b: ["executive"] }, { orgtype: ["private"] }, business).a5).toEqual(["decide"]);
        expect(profileShown({ a3b: ["specialist"] }, { orgtype: ["private"] }, business).a5).toEqual(["use"]);
        expect(profileShown({ a3b: ["owner"], a5: ["influence"] }, { orgtype: ["private"] }, business).a5).toEqual(["influence"]);
    });

    it("reads a job saved before 2026-11-03: a B2B kind of work as a job level, Owner as Manager / director", () => {
        expect(profileSettle({ a3: ["owner"] }, { orgtype: ["private"] }, business)).toMatchObject({ a3b: ["owner"] });
        expect(profileSettle({ a3: ["professional"] }, { orgtype: ["private"] }, business).a3b).toEqual(["specialist"]);
        expect(profileSettle({ a3: ["owner"] }, { work: ["working"] }, people).a3).toEqual(["manager"]);
    });

    it("asks who they live with of B2C adults only", () => {
        const ids = (segment: Record<string, string[]>, context: SegmentContext) => profileQuestionsOf("personal", segment, context).map(q => q.id);
        expect(ids({ age: ["established"] }, people)).toContain("a7");
        expect(ids({ age: ["minor"] }, people)).not.toContain("a7");
        expect(ids({ age: ["minor", "young"] }, people)).toContain("a7");
        expect(ids({}, business)).not.toContain("a7");
        expect(question("a7").options).toHaveLength(6);
    });

    it("asks gender only where the Segment's mix leans, and starts it from the mix", () => {
        expect(profileQuestionsOf("personal", { gender: ["3"] }, people).map(q => q.id)).not.toContain("a2");
        expect(profileQuestionsOf("personal", { gender: ["4"] }, people).map(q => q.id)).toContain("a2");
        expect(profileShown({}, { gender: ["4"] }, people).a2).toEqual(["woman"]);
        // (The mix is a rating, 2026-11-04: 3 is balanced, 4 leans women.) (A gender the user chose is never overruled by the mix.)
        expect(profileShown({ a2: ["man"] }, { gender: ["4"] }, people).a2).toEqual(["man"]);
    });

    it("asks the purchase part only for a business, a user, or minors, and ticks all five for a sole practitioner", () => {
        expect(profileQuestionsOf("personal", {}, people).map(q => q.id)).not.toContain("a5");
        expect(profileQuestionsOf("personal", { age: ["minor"] }, people).map(q => q.id)).toContain("a5");
        expect(profileShown({}, { authorise: ["solo"] }, business).a5).toHaveLength(5);
    });

    it("clears an exact age that falls outside the Segment's age group and keeps one inside it", () => {
        expect(profileSettle({ a1: ["21"] }, { age: ["young"] }, people).a1).toEqual(["21"]);
        expect(profileSettle({ a1: ["21"] }, { age: ["peak"] }, people).a1).toBeUndefined();
        expect(profileSettle({ a1: ["21"] }, {}, people).a1).toEqual(["21"]);
    });

    it("removes the answer of a question no longer asked", () => {
        const answers = { c3: ["reddit"], c4: ["market"] };
        expect(profileSettle(answers, { discover: ["peers"], social: ["digital"] }, people)).toEqual({});
        expect(profileSettle(answers, { discover: ["communities"], social: ["mixed"] }, people)).toEqual(answers);
    });

    it("holds a limit, and keeps what is written under Other only while Other is ticked", () => {
        // What matters most holds five since 2026-11-04 (doc 36, section 11).
        expect(profileChoose(question("b1"), {}, ["lower-price", "speed", "ease-and-convenience", "quality-and-results", "trust-and-reputation", "expert-knowledge"]).b1).toHaveLength(5);
        expect(profileChoose(question("c1"), { c1: ["phone"] }, ["phone", "other"]).c1).toEqual(["phone", "other"]);
        expect(profileSettle({ c2: ["other"], "c2-other": ["Substack"] }, {}, people)).toEqual({ c2: ["other"], "c2-other": ["Substack"] });
        expect(profileSettle({ c2: ["instagram"], "c2-other": ["Substack"] }, {}, people)).toEqual({ c2: ["instagram"] });
    });

    it("starts the worry about price where the household income is Low, and the help from the comfort", () => {
        expect(profileShown({}, { income: ["1"] }, people).e3).toEqual(["the-price-or-their-budget"]);
        // The online comfort is a rating (doc 35): 1 or 2 starts "Wants to talk to a person", 4 or 5 "Works it out alone", 3 nothing.
        expect(profileShown({}, { comfort: ["1"] }, people).d2).toEqual(["person"]);
        expect(profileShown({}, { comfort: ["2"] }, people).d2).toEqual(["person"]);
        expect(profileShown({}, { comfort: ["4"] }, people).d2).toEqual(["alone"]);
        expect(profileShown({}, { comfort: ["3"] }, people).d2).toBeUndefined();
        expect(profileShown({}, { path: ["impulse"] }, people).d1).toBeUndefined();
    });

    it("asks the social media unless the Segment's online comfort is rated 1", () => {
        const c2 = PROFILE_QUESTIONS.find(question => question.id === "c2")!;
        expect(profileQuestionAsked(c2, { comfort: ["1"] }, people)).toBe(false);
        expect(profileQuestionAsked(c2, { comfort: ["2"] }, people)).toBe(true);
        expect(profileQuestionAsked(c2, {}, people)).toBe(true);
    });

});

describe("a Profile is one person", () => {
    it("writes the questions of a woman, of a man, or of a person", () => {
        expect(profileWho("How old is {s}?", "woman")).toBe("How old is she?");
        expect(profileWho("What matters most to {o}?", "man")).toBe("What matters most to him?");
        expect(profileWho("What is {p} job role?", "man")).toBe("What is his job role?");
        expect(profileWho("Which devices does {s} use?", "woman")).toBe("Which devices does she use?");
        expect(profileWho("Which devices does {s} use?", "non-binary")).toBe("Which devices does this person use?");
        expect(profileWho("What is {p} job role?")).toBe("What is this person's job role?");
    });
});

describe("the Profiles proposed for a business Segment, by buying role", () => {

    const ids = (authorise: string[], names: string[] = []) => proposedBusinessProfiles({ authorise }, business, names).map(profile => profile.id);

    it("proposes one Profile with every role where one person decides", () => {
        expect(ids(["solo"])).toEqual(["decider"]);
        expect(proposedBusinessProfiles({ authorise: ["solo"] }, business)[0].roles).toEqual(["use", "influence", "order", "decide", "gate"]);
    });

    it("proposes a user and a decider for a team or a manager, and adds a checker or a buyer, never more than three", () => {
        expect(ids(["champions"])).toEqual(["user", "decider"]);
        expect(ids(["executive"])).toEqual(["user", "decider"]);
        expect(ids(["multi"])).toEqual(["user", "decider", "checker"]);
        expect(ids(["procurement"])).toEqual(["user", "decider", "buyer"]);
        expect(ids(["solo", "champions", "executive", "multi", "procurement"])).toEqual(["user", "decider", "checker-buyer"]);
        expect(proposedBusinessProfiles({ authorise: ["procurement"] }, business)[2].roles).toEqual(["order", "gate"]);
    });

    it("proposes nothing for people or before the question is answered, and not a Profile already added", () => {
        expect(ids([])).toEqual([]);
        expect(proposedBusinessProfiles({ authorise: ["solo"] }, people)).toEqual([]);
        expect(ids(["executive"], [" decider "])).toEqual(["user"]);
    });

});

describe("Psychographics and Motivations ticked and rated (doc 36, section 11)", () => {

    it("holds the limits: what matters most up to five, goals, frustrations and worries up to three", () => {
        expect(question("b1").max).toBe(5);
        expect(["e1", "e2", "e3"].map(id => question(id).max)).toEqual([3, 3, 3]);
        expect(question("b1").rating).toEqual({ low: "Optional", high: "Essential" });
        expect(question("e3").rating).toEqual({ low: "Minor", high: "Blocking" });
    });

    it("keeps a tick's rating while it is ticked, and an existing tick starts unrated", () => {
        const b1 = question("b1");
        const ticked = profileChoose(b1, {}, ["speed", "lower-price"]);
        expect(profileRatings(ticked, b1)).toEqual({});
        const rated = profileRate(b1, ticked, "speed", 5);
        expect(profileRatings(rated, b1)).toEqual({ speed: 5 });
        expect(profileRatings(profileRate(b1, rated, "speed", 3), b1)).toEqual({ speed: 3 });
        expect(profileRate(b1, rated, "speed", undefined)["b1-rating"]).toBeUndefined();
        // Unticked, the rating goes with it.
        const unticked = profileSettle(profileChoose(b1, rated, ["lower-price"]), {}, people);
        expect(unticked["b1-rating"]).toBeUndefined();
        expect(profileSettle(rated, {}, people)["b1-rating"]).toEqual(["speed:5"]);
        // A point outside 1 to 5 is not kept.
        expect(profileSettle({ b1: ["speed"], "b1-rating": ["speed:9"] }, {}, people)["b1-rating"]).toBeUndefined();
    });

    it("prints each tick with its rating, the highest first, and an unrated tick after", () => {
        const lines = profileAnswerLines({ b1: ["lower-price", "speed", "good-support"], "b1-rating": ["speed:5", "lower-price:3"] });
        expect(lines.find(line => line.value.includes("Speed"))?.value).toBe("Speed (5/5); Low price (3/5); Support");
    });

});

describe("the Emotional and Social needs ticked and rated (doc 36, section 10)", () => {

    it("asks a person's lists of a people Segment and a business buyer's of a business one", () => {
        expect(profileQuestionsOf("needs", {}, people).map(entry => entry.id)).toEqual(["emotional", "social"]);
        expect(profileQuestionsOf("needs", {}, business).map(entry => entry.id)).toEqual(["emotional-b2b", "social-b2b"]);
        expect(question("emotional").max).toBe(3);
        expect(question("social").rating).toEqual({ low: "Mild", high: "Strong" });
    });

    it("keeps three ticks and their ratings, and prints them with their ratings", () => {
        const social = question("social");
        const ticked = profileRate(social, profileChoose(social, {}, ["as-part-of-a-group-they-value", "as-having-good-taste-style", "as-one-of-the-few-with-access", "as-caring-for-others-or-the-planet"]), "as-part-of-a-group-they-value", 4);
        expect(ticked.social).toHaveLength(3);
        const settled = profileSettle(ticked, {}, people);
        expect(settled["social-rating"]).toEqual(["as-part-of-a-group-they-value:4"]);
        expect(profileAnswerLines(settled).find(line => line.value.startsWith("Part of"))?.value).toBe("Part of a group (4/5); Stylish; One of the few");
        // A business Segment does not keep a person's list.
        expect(profileSettle(ticked, {}, business).social).toBeUndefined();
    });

});
