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
    createBusinessCustomerSegment,
    createBusinessOffering
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
        const groups = screen.getAllByRole("group", { name: "How will you stand apart?" });
        expect(groups).toHaveLength(1);
        // (In the Competitors column, after both Competitor cards.)
        const column = container.querySelector(".business-foundation-competitors")!;
        expect(column.contains(groups[0])).toBe(true);
        const cards = [...column.querySelectorAll("[data-anchor]")];
        expect(cards.length).toBeGreaterThanOrEqual(2);
        expect(cards[cards.length - 1].compareDocumentPosition(groups[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        // (Managing: two at most, "2 max"; the Positioning answer is the start, nothing is saved until a tick.)
        expect((screen.getByRole("checkbox", { name: "How will you stand apart?: Status & Premium" }) as HTMLInputElement).checked).toBe(true);
        expect(asBusinessFoundationValue(saved.current).segments[0].questions.differentiation).toBeUndefined();
        fireEvent.click(screen.getByRole("checkbox", { name: "How will you stand apart?: Personal Service & Relationship" }));
        expect([...asBusinessFoundationValue(saved.current).segments[0].questions.differentiation].sort()).toEqual(["personal", "premium"]);
        expect((screen.getByRole("checkbox", { name: "How will you stand apart?: Cost-driven" }) as HTMLInputElement).disabled).toBe(true);
    });

    it("asks the end user's outcome in each Profile's end-user part (E4) only where the Segment has an end user, no longer on the Segment", () => {
        const saved: { current: unknown } = { current: null };
        render(<Held identity={proxy} saved={saved} />);
        // (Closed, a Profile shows no question: the Segment's End user part no longer asks it.)
        expect(screen.queryByRole("group", { name: /^Outcome for / })).toBeNull();
        fireEvent.click(toggles(/Profile 1$/)[0]);
        // (Named by the relationship, as the rest of the end user's part: a parent buys for the child; owner, 2026-11-09.)
        const outcome = screen.getByRole("group", { name: "Outcome for the child" });
        // (Ordered by the purposes chosen: Protection & Risk Reduction puts Safety & care first; started from Positioning.)
        expect(outcome.querySelector("label")?.textContent).toBe("Safety & care");
        expect((screen.getByRole("checkbox", { name: "Outcome for the child: Safety & care" }) as HTMLInputElement).checked).toBe(true);
        // (Nothing is saved until a tick; a tick is saved on the Profile's end-user part.)
        expect(asBusinessFoundationValue(saved.current).segments[0].profiles[0].user).toBeUndefined();
        fireEvent.click(screen.getByRole("checkbox", { name: "Outcome for the child: Learning & growth" }));
        expect([...(asBusinessFoundationValue(saved.current).segments[0].profiles[0].user?.questions?.outcome ?? [])].sort()).toEqual(["learning", "safety"]);
        expect(asBusinessFoundationValue(saved.current).segments[0].profiles[0].questions?.outcome).toBeUndefined();
        cleanup();
        render(<Held identity={{ ...proxy, buyerCategory: ["b2c:direct"], endUser: [] }} saved={saved} />);
        fireEvent.click(toggles(/Profile 1$/)[0]);
        expect(screen.queryByRole("group", { name: /^Outcome for / })).toBeNull();
        expect(screen.queryByRole("radiogroup", { name: /^Outcome for / })).toBeNull();
    });

    it("splits a Proxy or Dual-Intent Segment's Profile into the buyer and the end user; a Direct Segment's keeps its three sections", () => {
        const saved: { current: unknown } = { current: null };
        const heads = () => screen.getAllByRole("heading", { level: 3 }).map(heading => (heading.textContent ?? "").trim().replace(/i$/, ""))  /* (an "i" after a title reads as its letter) */;
        // (The end user is named by the relationship, a parent's "the child"; a Dual-Intent buyer uses it too: its parts are the buyer who also uses it and the others, and E1, E2
        // and the Needs are asked of a typical user: 2026-11-09.)
        for (const [category, buyer, user, who] of [["b2c:proxy", "The buyer", "The end user", "the child"], ["b2c:dual", "The buyer (who also uses it)", "The others who use it", "a typical user"]]) {
            render(<Held identity={{ ...proxy, buyerCategory: [category] }} saved={saved} />);
            fireEvent.click(toggles(/Profile 1$/)[0]);
            expect(heads()).toEqual(expect.arrayContaining([buyer, user]));
            expect(heads()).not.toContain("Motivations");
            // The buyer: what matters when choosing (B1), the worries (E3); the end user: the age within the end-user stage (a Child: 3 to 10), the goals and frustrations.
            expect(screen.getByRole("group", { name: "What matters most to this person?" })).toBeTruthy();
            expect(screen.getByRole("group", { name: "What does " + who + " want to achieve?" })).toBeTruthy();
            expect(screen.getByRole("group", { name: "What frustrates " + who + " today?" })).toBeTruthy();
            expect(screen.queryByRole("group", { name: "What does this person want to achieve?" })).toBeNull();
            expect(screen.getByLabelText("How old is the child?")).toBeTruthy();
            cleanup();
        }
        render(<Held identity={{ ...proxy, buyerCategory: ["b2c:direct"], endUser: [] }} saved={saved} />);
        fireEvent.click(toggles(/Profile 1$/)[0]);
        expect(heads()).toEqual(expect.arrayContaining(["Description", "Motivations", "Needs"]));
        expect(heads()).not.toContain("The end user");
        expect(screen.getByRole("group", { name: "What does this person want to achieve?" })).toBeTruthy();
        expect(screen.queryByLabelText("How old is the end user?")).toBeNull();
    });

    it("starts the Differentiation from the openings ticked on the Competitors where Positioning saved none, and puts them first (doc 41, K14)", () => {
        function Ticked() {
            const [value, setValue] = useState<unknown>(() => {
                const segment = createBusinessCustomerSegment([]);
                return { ...asBusinessFoundationValue(undefined), segments: [{ ...segment, competitors: [{ ...createBusinessCompetitor(), questions: { k10: ["better:good-support"] } }] }] };
            });
            return <BusinessFoundationEditor value={value} onChange={setValue} identity={{ ...proxy, differentiation: [] } as never} />;
        }
        render(<Ticked />);
        const ticks = screen.getAllByRole("checkbox", { name: /^How will you stand apart\?: / });
        expect(ticks[0].getAttribute("aria-label")).toBe("How will you stand apart?: Personal Service & Relationship");
        expect((ticks[0] as HTMLInputElement).checked).toBe(true);
        expect(screen.getByRole("heading", { name: "Differentiation" })).toBeTruthy();
    });

    it("asks one Differentiation as a radio while planning", () => {
        const saved: { current: unknown } = { current: null };
        render(<Held identity={{ ...proxy, stage: "plan" }} saved={saved} />);
        expect(screen.getByRole("radiogroup", { name: "How will you stand apart?" })).toBeTruthy();
        fireEvent.click(screen.getByRole("radio", { name: "Cost-driven" }));
        expect(asBusinessFoundationValue(saved.current).segments[0].questions.differentiation).toEqual(["cost"]);
    });

});

/* Phase 5, P9a (owner, 2026-11-08): the Segment's End user part comes right after who the buyer is. */
describe("BusinessFoundationEditor places the Segment's End user part", () => {

    const boxTitles = () => screen.getAllByRole("heading").map(heading => (heading.textContent ?? "").trim().replace(/i$/, ""));
    const order = (titles: string[], names: string[]) => names.map(name => titles.indexOf(name));

    it("right after Demographics on a people Segment, and right after Business Data on a business Segment (the boxes of each column in their order)", () => {
        const proxy = { relationships: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:proxy"], endUser: ["rel:parent", "age:minor"], stage: "manage" };
        render(<BusinessFoundationEditor value={twoProfiles()} onChange={() => undefined} identity={proxy as never} />);
        const people = order(boxTitles(), ["Demographics", "End user"]);
        expect(people.every(at => at >= 0)).toBe(true);
        expect(people[1]).toBe(people[0] + 1);
        cleanup();
        const employer = { relationships: ["b2b"], marketType: "single", audience: ["mid"], buyerCategory: ["b2b:proxy"], endUser: ["rel:employer"], stage: "manage" };
        render(<BusinessFoundationEditor value={twoProfiles()} onChange={() => undefined} identity={employer as never} />);
        const business = order(boxTitles(), ["Business Data", "End user"]);
        expect(business.every(at => at >= 0)).toBe(true);
        expect(business[1]).toBe(business[0] + 1);
    });

});

/* Phase 5, P6 (owner, 2026-11-08): the Functional Needs Addressed open the Offering's Customer Benefit box, before O8 and O4. */
describe("BusinessFoundationEditor's Offering card order", () => {

    it("draws the needs addressed as the first band of Customer Benefit, then O8 and O4; Function asks O1 alone; O2 opens Purchase & Delivery", () => {
        const segment = createBusinessCustomerSegment([]);
        const profile = { ...createBusinessCustomerProfile(), name: "Parent", needs: { functional: ["Book a lesson"], emotional: [], social: [] }, questions: { e3: ["the-price-or-their-budget"] } };
        render(<Harness initial={{ ...asBusinessFoundationValue(undefined), segments: [{ ...segment, profiles: [profile], offerings: [{ ...createBusinessOffering(), name: "Tutoring", category: "Service" }] }] }} />);
        fireEvent.click(toggles(/Offering 1$/)[0]);
        const boxOf = (title: string) => screen.getAllByRole("heading").find(heading => (heading.textContent ?? "").replace(/i$/, "").trim() === title)!.closest(".business-segment-box")!;
        const labels = (box: Element) => [...box.querySelectorAll(".legal-entity-org-section")].map(band => band.textContent ?? "");
        const benefit = labels(boxOf("Customer Benefit"));
        const at = (text: string) => benefit.findIndex(band => band.includes(text));
        expect(at("Functional Needs Addressed")).toBeGreaterThan(0);
        expect(at("Functional Needs Addressed")).toBeLessThan(at("Which of their worries does it answer?"));
        expect(at("Which of their worries does it answer?")).toBeLessThan(at("Which of what matters most to your customers does it do best?"));
        const fn = labels(boxOf("Function"));
        expect(fn.some(band => band.includes("What form does it take?"))).toBe(true);
        expect(fn.some(band => band.includes("Can your customers buy it today?"))).toBe(false);
        const delivery = labels(boxOf("Purchase & Delivery"));
        expect(delivery.findIndex(band => band.includes("Can your customers buy it today?"))).toBe(1);
        expect(delivery.findIndex(band => band.includes("How long until they have it?"))).toBeLessThan(delivery.findIndex(band => band.includes("receive it?")));
    });

});

/* Phase 5, P5 (owner, 2026-11-08): questions held back while Planning; a saved answer survives a stage change back and forth. */
describe("BusinessFoundationEditor holds questions back while Planning", () => {

    function Staged({ stage, saved }: { stage: string; saved: { current: unknown } }) {
        const [value, setValue] = useState<unknown>(() => {
            const segment = createBusinessCustomerSegment([]);
            return {
                ...asBusinessFoundationValue(undefined),
                segments: [{
                    ...segment,
                    questions: { age: ["peak"], work: ["working"], workenv: ["office"], share: ["public"] },
                    competitors: [{ ...createBusinessCompetitor(), name: "Rival", type: "direct", questions: { k3: ["small"] } }],
                    offerings: [{ ...createBusinessOffering(), name: "Tutoring", category: "Service", questions: { o16: ["sameday"] } }]
                }]
            };
        });
        saved.current = value;
        const identity = { relationships: ["b2c"], marketType: "single", audience: ["adult"], buyerCategory: ["b2c:direct"], endUser: [], stage };
        return <BusinessFoundationEditor value={value} onChange={setValue} identity={identity as never} />;
    }

    it("hides Box 1, 5, Box 4, 4, K3 and O16 while Planning, shows them from Launching, and keeps their answers", () => {
        const saved: { current: unknown } = { current: null };
        const { rerender } = render(<Staged stage="plan" saved={saved} />);
        for (const toggle of [...toggles(/Competitor 1$/), ...toggles(/Offering 1$/)]) {
            fireEvent.click(toggle);
        }
        const asked = () => ["Where do your customers mainly work?", "How do your customers share what they like?", "How big is their organisation?", "How fast do you reply?"]
            .map(name => (screen.queryByRole("radiogroup", { name }) ?? screen.queryByRole("group", { name })) !== null);
        expect(asked()).toEqual([false, false, false, false]);
        // (A choice elsewhere settles the Segment: the held-back answers stay.)
        fireEvent.click(screen.getByRole("checkbox", { name: /Feeds, ads and marketplace suggestions/ }));
        const kept = () => {
            const segment = asBusinessFoundationValue(saved.current).segments[0];
            return [segment.questions.workenv, segment.questions.share, segment.competitors[0].questions?.k3, segment.offerings[0].questions?.o16];
        };
        expect(kept()).toEqual([["office"], ["public"], ["small"], ["sameday"]]);
        rerender(<Staged stage="launch" saved={saved} />);
        expect(asked()).toEqual([true, true, true, true]);
        rerender(<Staged stage="plan" saved={saved} />);
        expect(asked()).toEqual([false, false, false, false]);
        expect(kept()).toEqual([["office"], ["public"], ["small"], ["sameday"]]);
    });

});
