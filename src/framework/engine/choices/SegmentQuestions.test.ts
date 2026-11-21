import { describe, expect, it } from "vitest";
import { segmentQuestionAsked } from "./SegmentQuestions";
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
    segmentSettle,
    segmentWho,
    writtenInNames,
    writtenInRows, segmentAnswerStarts, withoutCopiedStarts, segmentSettledNotes } from "./SegmentQuestions.ts";

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

    it("skips the size of a self-employed organisation and asks one industry under its sector's heading, the sector its record", () => {
        // (1.1, the second batch of the review; owner, 2026-11-18 00:46.)
        const business = { ...OPEN, frame: "business" as const };
        expect(ids(segmentQuestionsOf("business-data", {}, business))).toEqual(["orgtype", "size", "industry"]);
        expect(ids(segmentQuestionsOf("business-data", { orgtype: ["self"] }, business))).toEqual(["orgtype", "industry"]);
        const industries = segmentOptions(question("industry"), {}, business) as readonly { id: string; heading?: string }[];
        expect(industries).toHaveLength(18);
        expect(industries.filter(option => option.heading).map(option => option.heading)).toEqual(["Resource extraction & energy", "Manufacturing & construction", "Consumer goods & retail", "Infrastructure & finance", "Tech, data & media, and business services", "Human services & public sector, and other services"]);
        expect(segmentSettle({ industry: ["health"] }, business).sector).toEqual(["human"]);
        // (A sector saved with no industry yet stays, said under the box.)
        expect(segmentSettle({ sector: ["tech"] }, business).sector).toEqual(["tech"]);
        expect(segmentSettledNotes("business-data", { industry: ["health"] }, business)).toContain("Sector: Human services & public sector, and other services");
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

    it("asks the kind of area from Planning, only for one place or one country", () => {
        // (1.11, the second batch of the review; owner, 2026-11-18 00:46: O20's order for the countryside reaches an early founder.)
        expect(ids(segmentQuestionsOf("geographics", { reach: ["city"] }, { ...OPEN, stage: "plan" }))).toEqual(["reach", "area"]);
        expect(ids(segmentQuestionsOf("geographics", { reach: ["city"] }, OPEN))).toEqual(["reach", "area"]);
        expect(ids(segmentQuestionsOf("geographics", { reach: ["online"] }, OPEN))).toEqual(["reach"]);
    });

    it("keeps invoicing for business customers", () => {
        expect(ids(segmentOptions(question("pay"), {}, { ...OPEN, frame: "people" }))).toEqual(["card", "wallet", "cash", "bnpl", "transfer"]);
        expect(ids(segmentOptions(question("pay"), {}, OPEN))).toContain("invoicepo");
        // (Saved before the split: "Invoice, bank transfer or purchase order" is both of its parts.)
        expect(asSegmentAnswers({ pay: ["card", "invoice"] }).pay).toEqual(["card", "invoicepo", "transfer"]);
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
        // (The end user's work, job, clients and their size are retired: nothing read them; owner, 2026-11-17.)
        expect(ids(segmentQuestionsOf("user", {}, serving))).toEqual(["u-age", "u-comfort"]);
        const employer = { ...OPEN, endsUser: true, relations: ["rel:employer", "rel:friend"] };
        expect(ids(segmentQuestionsOf("user", {}, employer))).toEqual(["u-age", "u-comfort"]);
        // A family member buying for a child is asked the school stage (a grandparent; 2026-11-09).
        const family = { ...OPEN, endsUser: true, relations: ["rel:family"] };
        expect(ids(segmentQuestionsOf("user", { "u-age": ["child"] }, family))).toEqual(["u-age", "u-school", "u-comfort"]);
        // An institution's end users are the people it serves, of any age: the school stage for a child, work for an adult, never its clients' organisation.
        const institution = { ...OPEN, frame: "business" as const, endsUser: true, relations: ["rel:institution"] };
        expect(ids(segmentOptions(question("u-age"), {}, institution))).toContain("baby");
        expect(ids(segmentOptions(question("u-age"), {}, institution))).toContain("dependent");
        expect(ids(segmentQuestionsOf("user", { "u-age": ["child"] }, institution))).toEqual(["u-age", "u-school", "u-comfort"]);
        expect(ids(segmentQuestionsOf("user", { "u-age": ["active"] }, institution))).toEqual(["u-age", "u-comfort"]);
    });

    it("settles the answers: what is no longer asked, or no longer offered, goes", () => {
        const students = { ...OPEN, frame: "people" as const, lifeStages: ["young"] };
        expect(segmentSettle({ age: ["minor"], education: ["degree"], income: ["high"], work: ["retired"] }, students)).toEqual({ age: ["minor"] });
        expect(segmentSettle({ age: ["peak"] }, students)).toEqual({});
        expect(segmentSettle({ orgtype: ["self"], size: ["micro"], sector: ["tech"], industry: ["health"] }, { ...OPEN, frame: "business" })).toEqual({ orgtype: ["self"], industry: ["health"], sector: ["human"], authorise: ["solo"] });
    });

    it("does not show a question with one option left, and its answer is that option", () => {
        const adults = { ...OPEN, endsUser: true, userStages: ["age:young"], relations: ["rel:friend"] };
        expect(ids(segmentQuestionsOf("user", {}, adults))).toEqual(["u-comfort"]);
        expect(segmentSettle({}, adults)).toEqual({ "u-age": ["young"] });
    });

    it("starts the work situation from the age term, and leaves a chosen one alone", () => {
        // (B4, owner, 2026-11-17 08:38: a start worked out each time, never saved by the choice.)
        const started = (age: string, before: SegmentAnswers = {}) => { const saved = segmentChoose(question("age"), before, [age]); return { ...saved, ...segmentAnswerStarts(saved, saved) }; };
        const work = (age: string, before: SegmentAnswers = {}) => started(age, before).work;
        expect(segmentChoose(question("age"), {}, ["peak"])).toEqual({ age: ["peak"] });
        expect(started("minor").work).toEqual(["notworking"]);
        expect(started("minor").work2).toEqual(["student"]);
        // Young adults 18–24 start nothing (owner, 2026-11-09; BLS: 67.5% of 20 to 24 year-olds employed).
        expect(started("young").work).toBeUndefined();
        expect(started("young").work2).toBeUndefined();
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
        const pay = (saved: SegmentAnswers) => ({ ...saved, ...segmentAnswerStarts(saved, saved) }).pay;
        expect(pay({ setting: ["mobile"] })).toEqual(["wallet"]);
        expect(pay({ setting: ["desktop"] })).toBeUndefined();
        expect(pay({ setting: ["mobile"], pay: ["card"] })).toEqual(["card"]);
        // (It follows where they shop until answered: on a phone, then in a shop, no wallet.)
        expect(pay({ setting: ["store"] })).toBeUndefined();
        // (A wallet copied by the old choice is taken out once, so it follows again; one changed is kept.)
        expect(withoutCopiedStarts({ setting: ["mobile"], pay: ["wallet"], age: ["minor"], work: ["notworking"], work2: ["student"] })).toEqual({ setting: ["mobile"], age: ["minor"] });
        expect(withoutCopiedStarts({ setting: ["mobile"], pay: ["card"], age: ["peak"], work: ["notworking"] })).toEqual({ setting: ["mobile"], pay: ["card"], age: ["peak"], work: ["notworking"] });
    });

    it("reads an older saved work situation as working or not, and the situation", () => {
        expect(asSegmentAnswers({ work: ["employed"] })).toEqual({ work: ["working"] });
        // (The end user's work is retired: its saved answer is not read.)
        expect(asSegmentAnswers({ work: ["home"], "u-work": ["retired"] })).toEqual({ work: ["notworking"], work2: ["homemaker"] });
    });

    it("reads the options merged on 2026-11-17: four education levels, three ways of sharing", () => {
        expect(asSegmentAnswers({ education: ["highschool"] })).toEqual({ education: ["school"] });
        expect(asSegmentAnswers({ education: ["vocational"] })).toEqual({ education: ["college"] });
        expect(asSegmentAnswers({ education: ["bachelor"] })).toEqual({ education: ["degree"] });
        expect(asSegmentAnswers({ education: ["doctorate"] })).toEqual({ education: ["postgraduate"] });
        expect(asSegmentAnswers({ share: ["private", "verbal", "public"] })).toEqual({ share: ["friends", "public"] });
        // (Journals and trade magazines: for postgraduates, and a business Segment with its industry.)
        const adverts = (answers: Record<string, string[]>, frame: "people" | "business") => ids(segmentOptions(question("advertising"), answers, { ...OPEN, frame }));
        expect(adverts({}, "people")).not.toContain("journals");
        expect(adverts({ education: ["postgraduate"] }, "people")).toContain("journals");
        expect(adverts({ industry: ["health"] }, "business")).toContain("journals");
        // (Keeping it to themselves: search and reviews first among the online ways, adverts first among the others.)
        const shown = ids(segmentOptions(question("discover"), { share: ["none"] }, OPEN));
        expect(shown.slice(0, 2)).toEqual(["search", "media"]);
        expect(shown[shown.indexOf("affiliates") + 1]).toBe("adverts");
    });

    it("reads a saved answer: known questions and options only, one id for a radio", () => {
        expect(asSegmentAnswers({ age: ["minor", "young"], gender: ["nope"], bogus: ["x"], discover: ["peers", "peers", 3] })).toEqual({ age: ["minor"], discover: ["peers"] });
        expect(asSegmentAnswers(null)).toEqual({});
    });

    it("reads a degree saved before it became a rating as its point (Questions 12)", () => {
        expect(asSegmentAnswers({ comfort: ["averse"], "u-comfort": ["savvy"] })).toEqual({ comfort: ["1"], "u-comfort": ["5"] });
        expect(asSegmentAnswers({ comfort: ["moderate"] })).toEqual({ comfort: ["3"] });
        expect(asSegmentAnswers({ trajectory: ["declining"] })).toEqual({ trajectory: ["1"] });
        expect(asSegmentAnswers({ trajectory: ["flat"] })).toEqual({ trajectory: ["3"] });
        expect(asSegmentAnswers({ trajectory: ["growing"] })).toEqual({ trajectory: ["4"] });
        expect(asSegmentAnswers({ trajectory: ["expanding"] })).toEqual({ trajectory: ["5"] });
        expect(asSegmentAnswers({ competition: ["blue"] })).toEqual({ competition: ["1"] });
        expect(asSegmentAnswers({ competition: ["fragmented"] })).toEqual({ competition: ["3"] });
        // Rated at the owner's request (2026-11-04): the household income, the gender mix and the kind of place (three kinds: 1, 3 and 5).
        expect(asSegmentAnswers({ income: ["upper-middle"], gender: ["leans-women"], area: ["suburban"] })).toEqual({ income: ["4"], gender: ["4"], area: ["3"] });
        expect(asSegmentAnswers({ competition: ["red"] })).toEqual({ competition: ["5"] });
        // A rating already saved stays; a point outside 1 to 5 goes.
        expect(asSegmentAnswers({ competition: ["4"], comfort: ["9"] })).toEqual({ competition: ["4"] });
    });

    it("prints a rating with its point and, at an end, its word", () => {
        const lines = segmentAnswerLines({ comfort: ["5"], competition: ["4"] });
        expect(lines).toContainEqual({ label: "How comfortable are your customers online?", value: "5 of 5 (Confident)" });
        expect(lines).toContainEqual({ label: "How crowded is your market?", value: "4 of 5" });
        // (In the card's order: how they share stands in Finding & Choosing, before how they pay, since 2026-11-16.)
        expect(segmentAnswerLines({ share: ["public", "friends"], pay: ["card"] })).toEqual([
            { label: "How do your customers share what they like?", value: "They post it publicly on social media; They tell friends and family" },
            { label: "How do your customers pay?", value: "Credit / debit card" }
        ]);
    });


    describe("what the answers above settle (asked of no one, answered for them)", () => {

        const business = { ...OPEN, frame: "business" as const };

        it("makes freelancers self-employed with no size, and shows them no question about who decides", () => {
            const solo = { ...business, scales: ["solo"] };
            expect(ids(segmentQuestionsOf("business-data", {}, solo))).toEqual(["industry"]);
            expect(segmentSettle({}, solo)).toEqual({ orgtype: ["self"], authorise: ["solo"] });
            expect(ids(segmentQuestionsOf("purchasing", {}, solo))).not.toContain("authorise");
            expect(segmentSettle({ ...{}, orgtype: ["private"], size: ["small"], authorise: ["executive"] }, solo)).toEqual({ orgtype: ["self"], authorise: ["solo"] });
        });

        it("takes the sizes of the scale chosen, and offers a public body only for Enterprise or Public Sector", () => {
            expect(ids(segmentOptions(question("size"), {}, { ...business, scales: ["smb"] }))).toEqual(["micro", "small"]);
            expect(segmentSettle({}, { ...business, scales: ["mid"] }).size).toEqual(["medium"]);
            expect(segmentSettle({}, { ...business, scales: ["enterprise"] }).size).toEqual(["large"]);
            expect(ids(segmentOptions(question("orgtype"), {}, { ...business, scales: ["smb"] }))).toEqual(["private", "nonprofit"]);
            expect(ids(segmentOptions(question("orgtype"), {}, { ...business, scales: ["enterprise"] }))).toEqual(["private", "public", "nonprofit"]);
            expect(ids(segmentOptions(question("orgtype"), {}, { ...business, scales: ["solo", "smb"] }))).toEqual(["private", "nonprofit", "self"]);
            expect(ids(segmentOptions(question("size"), {}, { ...business, scales: [] }))).toEqual(["micro", "small", "medium", "large"]);
        });

        it("keeps the size a choice for a public body of Enterprise or Public Sector, which can be small (owner, 2026-11-08)", () => {
            const enterprise = { ...business, scales: ["enterprise"] };
            expect(ids(segmentOptions(question("size"), { orgtype: ["public"] }, enterprise))).toEqual(["micro", "small", "medium", "large"]);
            expect(ids(segmentQuestionsOf("business-data", { orgtype: ["public"] }, enterprise))).toContain("size");
            expect(segmentSettle({ orgtype: ["public"], size: ["small"] }, enterprise).size).toEqual(["small"]);
            // A private enterprise is still large.
            expect(segmentSettle({ orgtype: ["private"] }, enterprise).size).toEqual(["large"]);
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
            expect(ids(segmentQuestionsOf("user", { "u-age": ["peak"] }, adults))).toEqual(["u-age", "u-comfort"]);
        });

    });

});

describe("who the questions are about", () => {
    const direct = { frame: "people", stage: "", lifeStages: [], endsUser: false, userStages: [], relations: [], scales: [] } as const;
    const proxy = { ...direct, endsUser: true };
    it("a direct buyer's customers are customers; a proxy buyer's boxes say buyers, the user's box says users", () => {
        expect(segmentWho("How old are your customers?", "demographics", direct)).toBe("How old are your customers?");
        expect(segmentWho("How old are your customers?", "demographics", proxy)).toBe("How old are your buyers?");
        expect(segmentWho("How old are your customers?", "user", proxy)).toBe("How old are your end users?");
    });
});

describe("what is changing, the path to purchase and where they discover (2026-11-08)", () => {

    const PEOPLE: SegmentContext = { ...OPEN, frame: "people" };
    const BUSINESS: SegmentContext = { ...OPEN, frame: "business" };

    it("adds Environment & climate to what is changing", () => {
        expect(ids(question("trends").options)).toEqual(["technology", "regulation", "economy", "society", "supply", "environment"]);
        expect(question("trends").options.find(option => option.id === "environment")?.label).toBe("Environment & climate");
    });

    it("reads Straight away as On impulse, its id kept, and adds habit and urgent need", () => {
        expect(question("path").options.map(option => option.label)).toEqual(["On impulse", "After comparing options", "On a recommendation", "Out of habit", "When they urgently need it"]);
        expect(asSegmentAnswers({ path: ["impulse"] }).path).toEqual(["impulse"]);
    });

    it("offers Sales calls or tenders to business customers only", () => {
        const discover = (context: SegmentContext) => ids(segmentOptions(question("discover"), {}, context, false));
        // (Two headed groups, Online, then In person, in print and on air; Other last: owner, 2026-11-17.)
        expect(discover(BUSINESS)).toEqual(["communities", "creators", "media", "algorithmic", "search", "affiliates", "peers", "passing", "events", "sales", "partners", "adverts", "flyers", "post", "samples", "other"]);
        const headings = segmentOptions(question("discover"), {}, BUSINESS, false).filter(option => option.heading).map(option => [option.id, option.heading]);
        expect(headings).toEqual([["communities", "Online"], ["peers", "In person, in print and on air"]]);
        // (Customers less at ease online: the in-person group first.)
        expect(segmentOptions(question("discover"), { comfort: ["1"] }, BUSINESS, false)[0]).toMatchObject({ id: "passing", heading: "In person, in print and on air" });
        expect(discover(PEOPLE)).not.toContain("sales");
        expect(discover(OPEN)).not.toContain("sales");
        expect(segmentSettle({ discover: ["sales", "search"] }, PEOPLE).discover).toEqual(["search"]);
        expect(segmentSettle({ discover: ["sales", "search"] }, BUSINESS).discover).toEqual(["sales", "search"]);
        expect(question("discover").max).toBe(3);
    });

});

/* Phase 5, P3 (owner, 2026-11-08): Box 4 in the order of a purchase; the codes stay. In two sections since 2026-11-16 16:31: Finding & Choosing, Buying & Paying. */
describe("Box 4's order", () => {
    it("asks Finding & Choosing (comfort, socialising, what makes them shop, how they share, where they discover, how they decide), then Buying & Paying", () => {
        const people = { ...OPEN, frame: "people" as const };
        const business = { ...OPEN, frame: "business" as const };
        // (How they share before where they discover, whose order it sets: 1.6, the second batch of the review.)
        expect(ids(segmentQuestionsOf("purchasing", {}, people))).toEqual(["comfort", "social", "trigger", "share", "discover", "path", "setting", "pay"]);
        expect(segmentQuestionsOf("purchasing", {}, people).map(entry => entry.group)).toEqual([...Array(6).fill("Finding & Choosing"), "Buying & Paying", "Buying & Paying"]);
        expect(ids(segmentQuestionsOf("purchasing", {}, business))).toEqual(["comfort", "discover", "authorise", "setting", "pay"]);
    });
});

/* Phase 5, P5 (owner, 2026-11-08): questions held back while Planning, their saved answers kept. */
describe("the questions held back while Planning", () => {
    const at = (stage: string) => ({ ...OPEN, frame: "people" as const, stage });
    const working = { age: ["peak"], work: ["working"] };
    it("does not ask where they work, how they are paid or how they share while Planning (an empty stage too), and asks them from Launching", () => {
        for (const stage of ["plan", ""]) {
            expect(ids(segmentQuestionsOf("demographics", working, at(stage)))).not.toEqual(expect.arrayContaining(["workenv"]));
            expect(ids(segmentQuestionsOf("demographics", working, at(stage)))).not.toContain("workincome");
            expect(ids(segmentQuestionsOf("purchasing", working, at(stage)))).not.toContain("share");
        }
        expect(ids(segmentQuestionsOf("demographics", working, at("launch")))).toEqual(expect.arrayContaining(["workenv", "workincome"]));
        expect(ids(segmentQuestionsOf("purchasing", working, at("launch")))).toContain("share");
    });
    it("keeps a saved answer through a stage change back and forth", () => {
        const saved = { ...working, workenv: ["office"], workincome: ["salary"], share: ["public"] };
        const planning = segmentSettle(saved, at("plan"));
        expect(planning).toEqual(expect.objectContaining({ workenv: ["office"], workincome: ["salary"], share: ["public"] }));
        expect(segmentSettle(planning, at("launch"))).toEqual(expect.objectContaining({ workenv: ["office"], workincome: ["salary"], share: ["public"] }));
        // (A question not asked for another reason still loses its answer: no longer working.)
        expect(segmentSettle({ ...saved, work: ["notworking"] }, at("plan")).workenv).toBeUndefined();
    });
});

/* WHERE THEY SHOP, NAMED (owner, 2026-11-15 16:08 and 16:26): the marketplaces and the shops follow Where do your customers usually shop?. */
describe("the follow-ups of Where do your customers usually shop?", () => {

    it("asks Which marketplaces on a marketplace, Which shops in a shop or both, and neither online", () => {
        const asked = (setting: string) => ids(segmentQuestionsOf("purchasing", { setting: [setting] }, OPEN));
        expect(asked("marketplace")).toContain("marketplaces");
        expect(asked("marketplace")).not.toContain("shops");
        expect(asked("store")).toContain("shops");
        expect(asked("multi")).toContain("shops");
        expect(asked("mobile")).not.toEqual(expect.arrayContaining(["marketplaces"]));
        expect(asked("mobile")).not.toContain("shops");
    });

    it("keeps the marketplace written in under Other while Other is ticked, and reads it back as saved", () => {
        const answers: SegmentAnswers = { setting: ["marketplace"], marketplaces: ["etsy", "other"], "marketplaces-other": ["Vinted"] };
        expect(segmentSettle(answers, OPEN)["marketplaces-other"]).toEqual(["Vinted"]);
        expect(asSegmentAnswers(answers)["marketplaces-other"]).toEqual(["Vinted"]);
        expect(segmentSettle({ ...answers, marketplaces: ["etsy"] }, OPEN)["marketplaces-other"]).toBeUndefined();
        // (Another place to shop: the follow-up goes, with its words.)
        expect(segmentSettle({ ...answers, setting: ["mobile"] }, OPEN).marketplaces).toBeUndefined();
    });

});

describe("an Other's list (owner, 2026-11-16 14:24)", () => {
    it("shows one empty row to type in, keeps the rows as typed, and reads an old text once by its commas", () => {
        expect(writtenInRows(undefined)).toEqual([""]);
        expect(writtenInRows(["Vinted", ""])).toEqual(["Vinted", ""]);
        expect(writtenInRows(["Vinted, Depop"])).toEqual(["Vinted", "Depop"]);
        // (The channels read the names alone: trimmed, no empty row, no repeat.)
        expect(writtenInNames(["Vinted ", "", "vinted", "Depop"])).toEqual(["Vinted", "Depop"]);
    });
});

/* Owner, 2026-11-16 17:38: where they discover, ordered by their online comfort and reach; adverts ask where they are seen (Box 4, 3a). */
describe("where they discover: the traditional ways", () => {
    const people = { ...OPEN, frame: "people" as const };
    const order = (answers: Record<string, string[]>) => ids(segmentOptions(question("discover"), answers, people, false));
    it("puts the printed and in-person ways first for customers not at ease online, passing by for a city, the online ways for anywhere online; Other last", () => {
        expect(order({ comfort: ["2"] }).slice(0, 5)).toEqual(["passing", "flyers", "post", "adverts", "events"]);
        expect(order({ reach: ["city"] }).slice(0, 3)).toEqual(["passing", "flyers", "events"]);
        expect(order({ reach: ["online"] }).slice(0, 6)).toEqual(["communities", "creators", "media", "algorithmic", "search", "affiliates"]);
        expect(order({ reach: ["online"] }).slice(-1)).toEqual(["other"]);
        // (Nothing hidden: the same options in every order.)
        expect([...order({ comfort: ["1"] })].sort()).toEqual([...order({})].sort());
    });
    it("asks where they see adverts only where adverts are ticked; the answer goes with the tick", () => {
        expect(ids(segmentQuestionsOf("purchasing", { discover: ["adverts"] }, people))).toEqual(["comfort", "social", "trigger", "share", "discover", "advertising", "path", "setting", "pay"]);
        expect(ids(segmentQuestionsOf("purchasing", { discover: ["flyers"] }, people))).not.toContain("advertising");
        expect(segmentSettle({ discover: ["flyers"], advertising: ["radio"] }, people).advertising).toBeUndefined();
        expect(segmentSettle({ discover: ["adverts"], advertising: ["radio"] }, people).advertising).toEqual(["radio"]);
    });
});

describe("2.8: how they pay, from who decides; no payment service where they buy on a marketplace", () => {
    const question = (id: string) => SEGMENT_QUESTIONS.find(entry => entry.id === id)!;

    it("starts Invoice or purchase order where a manager signs off or a formal procurement decides", () => {
        expect(segmentAnswerStarts({ authorise: ["executive"] }, { authorise: ["executive"] }).pay).toEqual(["invoicepo"]);
        expect(segmentAnswerStarts({}, { orgtype: ["public"] }).pay).toEqual(["invoicepo"]);
        expect(segmentAnswerStarts({}, { setting: ["mobile"], authorise: ["procurement"] }).pay).toEqual(["wallet", "invoicepo"]);
        expect(segmentAnswerStarts({ authorise: ["solo"] }, { authorise: ["solo"] }).pay).toBeUndefined();
    });
    it("asks for the payment services only where they do not shop on a marketplace", () => {
        const context = { frame: "people" as const, lifeStages: [], scales: [], relations: [], userStages: [], stage: "manage", endsUser: false };
        expect(segmentQuestionAsked(question("providers"), { pay: ["card"], setting: ["mobile"] }, context as never)).toBe(true);
        expect(segmentQuestionAsked(question("providers"), { pay: ["card"], setting: ["marketplace"] }, context as never)).toBe(false);
    });
});
