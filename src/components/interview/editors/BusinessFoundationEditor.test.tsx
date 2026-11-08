import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessFoundationEditor from "./BusinessFoundationEditor";
import { toggles } from "../../../test/interviewTestUtils";
import {
    asBusinessFoundationValue,
    BUSINESS_FOUNDATION_SUBSECTIONS,
    businessFoundationSubsectionsEmpty,
    createBusinessCompetitor,
    createBusinessCustomerProfile,
    createBusinessCustomerSegment
} from "../../../framework/engine/AnswerUtils";

function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessFoundationEditor value={value} onChange={setValue} />;
}


function twoProfiles() {
    const segment = createBusinessCustomerSegment([]);
    return {
        ...asBusinessFoundationValue(undefined),
        segments: [{ ...segment, profiles: [createBusinessCustomerProfile(), createBusinessCustomerProfile()] }]
    };
}

afterEach(cleanup);

describe("BusinessFoundationEditor folding", () => {

    it("starts Profile cards collapsed but the Segment open", () => {

        render(<Harness initial={twoProfiles()} />);

        toggles(/Profile \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("false"));
        toggles(/Segment \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("true"));

    });

    it("opens a newly added Profile", () => {

        render(<Harness initial={twoProfiles()} />);

        fireEvent.click(screen.getByRole("button", { name: /\+ Add Profile/ }));

        const profileToggles = toggles(/Profile \d+$/);
        expect(profileToggles).toHaveLength(3);
        expect(profileToggles[2].getAttribute("aria-expanded")).toBe("true");

    });

    it("proposes Profiles by buying role for a business Segment, each added once with its name", () => {

        const segment = createBusinessCustomerSegment([]);
        render(<Harness initial={{
            ...asBusinessFoundationValue(undefined),
            segments: [{ ...segment, description: { ...segment.description, "business-data": "" }, questions: { authorise: ["procurement"] } }]
        }} />);

        expect(screen.getByRole("button", { name: "+ Add User Profile" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "+ Add Decider Profile" })).toBeTruthy();
        const before = toggles(/Profile \d+$/).length;
        fireEvent.click(screen.getByRole("button", { name: "+ Add Buyer Profile" }));

        expect(screen.queryByRole("button", { name: "+ Add Buyer Profile" })).toBeNull();
        const after = toggles(/Profile \d+$/);
        expect(after).toHaveLength(before + 1);
        expect(after[before].getAttribute("aria-expanded")).toBe("true");
        expect(screen.getByDisplayValue("Buyer")).toBeTruthy();

    });

    it("expands all Profiles in a Segment", () => {

        render(<Harness initial={twoProfiles()} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand all profiles" }));

        toggles(/Profile \d+$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("true"));

    });

});

describe("BusinessFoundationEditor industry outlook", () => {

    it("asks it with Market Size, in one box, as choice questions and no free text", () => {

        render(<Harness initial={twoProfiles()} />);

        expect(screen.getByRole("radiogroup", { name: "Is your market growing or shrinking?" })).toBeTruthy();
        expect(screen.getByRole("group", { name: "What is changing most for your customers?" })).toBeTruthy();
        expect(screen.queryByLabelText(/Segment 1 description:/)).toBeNull();
        expect(screen.getByRole("button", { name: "Market Size & Industry Outlook: what this means" })).toBeTruthy();

    });

    it("moves an outlook saved in its own box into the Market Size box", () => {

        const saved = (description: Record<string, string>) =>
            asBusinessFoundationValue({ segments: [{ id: "s", name: "Firms", description }] }).segments[0].description;
        expect(saved({ "market-size": "1,200 firms", "industry-outlook": "Growing." }))
            .toEqual({ "market-size": "1,200 firms\n\nGrowing." });
        expect(saved({ "industry-outlook": "Growing." })).toEqual({ "market-size": "Growing." });
        expect(saved({ "market-size": "1,200 firms", "industry-outlook": "" })).toEqual({ "market-size": "1,200 firms" });

    });

    it("loads a Segment saved without it unchanged, and never counts it as missing", () => {

        const saved = { segments: [{ id: "s", name: "Firms", description: { "market-size": "1,200 firms" } }] };
        const segment = asBusinessFoundationValue(saved).segments[0];
        expect(segment.description).toEqual({ "market-size": "1,200 firms" });

        const answered = {
            segments: [{
                id: "s", name: "Firms", description: {}, valueProposition: "We save time.",
                profiles: [{ ...createBusinessCustomerProfile(), name: "Office manager" }],
                competitors: [{ id: "c", name: "Zapier" }],
                offerings: [{ id: "o", name: "Audit" }]
            }]
        };
        expect(businessFoundationSubsectionsEmpty(answered)).toEqual([false, false, false, false]);

    });

});

describe("BusinessFoundationEditor page order (owner, 2026-11-08)", () => {

    it("puts the Offerings before the Value Proposition: in the tiles, the subsections and the instructions", () => {

        function Tiled() {
            const [value, setValue] = useState<unknown>(twoProfiles());
            return <BusinessFoundationEditor value={value} onChange={setValue} asTiles />;
        }
        render(<Tiled />);
        const ids = [...document.querySelectorAll<HTMLElement>(".section-tile")].map(tile => (tile.getAttribute("data-tile") ?? "").replace(/^.*:/, ""));
        expect(ids).toEqual(["customers", "competitors", "offerings", "value-proposition"]);
        expect([...BUSINESS_FOUNDATION_SUBSECTIONS]).toEqual(["Customer Segment and Profile", "Competitor and Alternative", "Offering", "Value Proposition"]);
        // Only the Offering is missing: it is the third subsection.
        expect(businessFoundationSubsectionsEmpty({
            segments: [{ id: "s", name: "Firms", description: {}, valueProposition: "We save time.", profiles: [{ ...createBusinessCustomerProfile(), name: "Office manager" }], competitors: [{ id: "c", name: "Zapier" }], offerings: [] }]
        })).toEqual([false, false, true, false]);

    });

    it("points the Offering's instruction at the Profiles' needs, not at the Value Proposition that follows it", () => {

        render(<Harness initial={twoProfiles()} />);
        expect(screen.getAllByText(/Make sure each one answers your Profiles' needs\./).length).toBeGreaterThan(0);
        expect(screen.queryByText(/supports the Value Proposition/)).toBeNull();
        const titles = [...document.querySelectorAll(".answer-column-label")].map(title => title.textContent);
        expect(titles).toEqual(["1.Customer Segment and Profile", "2.Competitor and Alternative", "3.Offering", "4.Value Proposition"]);

    });

});

describe("BusinessFoundationEditor follows the Identity answers", () => {

    const identity = (relationships: string[], audience: string[] = [], marketType = "single") => ({ relationships, marketType, audience });

    function Identified({ identity: given }: { identity?: ReturnType<typeof identity> }) {
        const [value, setValue] = useState<unknown>(twoProfiles());
        return <BusinessFoundationEditor value={value} onChange={setValue} identity={given} />;
    }

    it("asks people's Demographics and not Business Data for a B2C seller", () => {
        render(<Identified identity={identity(["b2c"])} />);
        expect(screen.queryByRole("radiogroup", { name: "How old are your customers?" })).not.toBeNull();
        expect(screen.queryByText("Business Data")).toBeNull();
    });

    it("asks Business Data without its tick, and not Demographics, for a B2B seller", () => {
        render(<Identified identity={identity(["b2b"])} />);
        expect(screen.queryByRole("radiogroup", { name: "How old are your customers?" })).toBeNull();
        expect(screen.queryByRole("radiogroup", { name: "What kind of organisation are your customers?" })).not.toBeNull();
        expect(screen.queryByRole("checkbox", { name: /Business Data/ })).toBeNull();
    });

    it("makes the first two Segments for the user, People then Businesses, when both relationships are chosen", () => {
        function Held() {
            const [value, setValue] = useState<unknown>(twoProfiles());
            return <BusinessFoundationEditor value={value} onChange={setValue} identity={identity(["b2c", "b2b"])} />;
        }
        render(<Held />);
        expect(screen.queryByRole("checkbox", { name: /Business Data/ })).toBeNull();
        expect(screen.queryByRole("radiogroup", { name: "Who is this Segment's customer?" })).toBeNull();
        expect(screen.queryAllByRole("radiogroup", { name: "How old are your customers?" }).length).toBe(1);
        expect(screen.queryAllByRole("radiogroup", { name: "How big are your customers' organisations?" }).length).toBe(1);
    });

});

describe("BusinessFoundationEditor asks its questions", () => {

    it("saves a choice on the Segment, and offers the age terms of the Positioning life stage", () => {
        let saved: unknown;
        function Held() {
            const [value, setValue] = useState<unknown>(twoProfiles());
            saved = value;
            return <BusinessFoundationEditor value={value} onChange={setValue} identity={{ relationships: ["b2c"], marketType: "single", audience: ["adult"] }} />;
        }
        render(<Held />);
        const ages = screen.getByRole("radiogroup", { name: "How old are your customers?" });
        expect(Array.from(ages.querySelectorAll("label")).map(label => label.textContent)).toEqual(["Established 25–39", "Peak 40–54", "Mature 55–64"]);
        fireEvent.click(screen.getByRole("radio", { name: "Peak 40–54" }));
        expect(asBusinessFoundationValue(saved).segments[0].questions).toEqual({ age: ["peak"], work: ["working"] });
    });

    it("has no free-text box in a box of the Segment's Description", () => {
        render(<Harness initial={twoProfiles()} />);
        expect(screen.queryByLabelText(/Segment 1 description:/)).toBeNull();
    });

});

/* Positioning's 8 and 10 on the Business System (owner, 2026-11-08, "Move all three"): the Differentiation once per Segment after its Competitors, the end user's outcome in its End user part. */
describe("BusinessFoundationEditor asks the questions that left Positioning", () => {

    function Held({ identity, saved }: { identity: Record<string, unknown>; saved: { current: unknown } }) {
        const [value, setValue] = useState<unknown>(() => {
            const segment = createBusinessCustomerSegment([]);
            return { ...asBusinessFoundationValue(undefined), segments: [{ ...segment, competitors: [createBusinessCompetitor(), createBusinessCompetitor()] }] };
        });
        saved.current = value;
        return <BusinessFoundationEditor value={value} onChange={setValue} identity={identity as never} />;
    }
    const proxy = { relationships: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:proxy"], endUser: ["rel:parent", "age:minor"], stage: "manage", differentiation: ["premium"], outcomeUser: ["safety"], purpose: ["protection"] };

    it("asks the Differentiation once for the Segment, in its Competitors column after the Competitor cards, started from Positioning; a tick is saved on the Segment", () => {
        const saved: { current: unknown } = { current: null };
        const { container } = render(<Held identity={proxy} saved={saved} />);
        const groups = screen.getAllByRole("group", { name: "Differentiation" });
        expect(groups).toHaveLength(1);
        // (In the Competitors column, after both Competitor cards.)
        const column = container.querySelector(".business-foundation-competitors")!;
        expect(column.contains(groups[0])).toBe(true);
        const cards = [...column.querySelectorAll("[data-anchor]")];
        expect(cards.length).toBeGreaterThanOrEqual(2);
        expect(cards[cards.length - 1].compareDocumentPosition(groups[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        // (Managing: two at most, "2 max"; the Positioning answer is the start, nothing is saved until a tick.)
        expect((screen.getByRole("checkbox", { name: "Differentiation: Status & Premium" }) as HTMLInputElement).checked).toBe(true);
        expect(asBusinessFoundationValue(saved.current).segments[0].questions.differentiation).toBeUndefined();
        fireEvent.click(screen.getByRole("checkbox", { name: "Differentiation: Personal Service & Relationship" }));
        expect([...asBusinessFoundationValue(saved.current).segments[0].questions.differentiation].sort()).toEqual(["personal", "premium"]);
        expect((screen.getByRole("checkbox", { name: "Differentiation: Cost-driven" }) as HTMLInputElement).disabled).toBe(true);
    });

    it("asks the end user's outcome in each Profile's end-user part (E4) only where the Segment has an end user, no longer on the Segment", () => {
        const saved: { current: unknown } = { current: null };
        render(<Held identity={proxy} saved={saved} />);
        // (Closed, a Profile shows no question: the Segment's End user part no longer asks it.)
        expect(screen.queryByRole("group", { name: "Outcome for the end user" })).toBeNull();
        fireEvent.click(toggles(/Profile 1$/)[0]);
        const outcome = screen.getByRole("group", { name: "Outcome for the end user" });
        // (Ordered by the purposes chosen: Protection & Risk Reduction puts Safety & care first; started from Positioning.)
        expect(outcome.querySelector("label")?.textContent).toBe("Safety & care");
        expect((screen.getByRole("checkbox", { name: "Outcome for the end user: Safety & care" }) as HTMLInputElement).checked).toBe(true);
        // (Nothing is saved until a tick; a tick is saved on the Profile's end-user part.)
        expect(asBusinessFoundationValue(saved.current).segments[0].profiles[0].user).toBeUndefined();
        fireEvent.click(screen.getByRole("checkbox", { name: "Outcome for the end user: Learning & growth" }));
        expect([...(asBusinessFoundationValue(saved.current).segments[0].profiles[0].user?.questions?.outcome ?? [])].sort()).toEqual(["learning", "safety"]);
        expect(asBusinessFoundationValue(saved.current).segments[0].profiles[0].questions?.outcome).toBeUndefined();
        cleanup();
        render(<Held identity={{ ...proxy, buyerCategory: ["b2c:direct"], endUser: [] }} saved={saved} />);
        fireEvent.click(toggles(/Profile 1$/)[0]);
        expect(screen.queryByRole("group", { name: "Outcome for the end user" })).toBeNull();
        expect(screen.queryByRole("radiogroup", { name: "Outcome for the end user" })).toBeNull();
    });

    it("splits a Proxy or Dual-Intent Segment's Profile into the buyer and the end user; a Direct Segment's keeps its three sections", () => {
        const saved: { current: unknown } = { current: null };
        const heads = () => screen.getAllByRole("heading", { level: 3 }).map(heading => (heading.textContent ?? "").trim().replace(/i$/, ""))  /* (an "i" after a title reads as its letter) */;
        for (const category of ["b2c:proxy", "b2c:dual"]) {
            render(<Held identity={{ ...proxy, buyerCategory: [category] }} saved={saved} />);
            fireEvent.click(toggles(/Profile 1$/)[0]);
            expect(heads()).toEqual(expect.arrayContaining(["The buyer", "The end user"]));
            expect(heads()).not.toContain("Motivations");
            // The buyer: what matters when choosing (B1), the worries (E3); the end user: the age within the end-user stage (a Child: 3 to 10), the goals and frustrations.
            expect(screen.getByRole("group", { name: "What matters most to this person?" })).toBeTruthy();
            expect(screen.getByRole("group", { name: "What does the end user want to achieve?" })).toBeTruthy();
            expect(screen.getByRole("group", { name: "What frustrates the end user today?" })).toBeTruthy();
            expect(screen.queryByRole("group", { name: "What does this person want to achieve?" })).toBeNull();
            expect(screen.getByLabelText("How old is the end user?")).toBeTruthy();
            cleanup();
        }
        render(<Held identity={{ ...proxy, buyerCategory: ["b2c:direct"], endUser: [] }} saved={saved} />);
        fireEvent.click(toggles(/Profile 1$/)[0]);
        expect(heads()).toEqual(expect.arrayContaining(["Description", "Motivations", "Needs"]));
        expect(heads()).not.toContain("The end user");
        expect(screen.getByRole("group", { name: "What does this person want to achieve?" })).toBeTruthy();
        expect(screen.queryByLabelText("How old is the end user?")).toBeNull();
    });

    it("asks one Differentiation as a radio while planning", () => {
        const saved: { current: unknown } = { current: null };
        render(<Held identity={{ ...proxy, stage: "plan" }} saved={saved} />);
        expect(screen.getByRole("radiogroup", { name: "Differentiation" })).toBeTruthy();
        fireEvent.click(screen.getByRole("radio", { name: "Cost-driven" }));
        expect(asBusinessFoundationValue(saved.current).segments[0].questions.differentiation).toEqual(["cost"]);
    });

});
