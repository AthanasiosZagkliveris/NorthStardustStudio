import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import LegalEntityEditor from "../LegalEntityEditor";
import { differentiationOptionsFor, positioningName, userOutcomeOptionsFor } from "./shared.tsx";
import { asLegalEntityValue } from "../../../../framework/engine/answers/AnswerUtils";

afterEach(cleanup);

/** The stage a test names ("" or planning where none is given). */

function stageKey(stage: string): "plan" | "launch" | "manage" | "grow" {
    return stage === "launch" || stage === "manage" || stage === "grow" ? stage : "plan";
}

/** The Early Positioning questions of one seller and buyer relationship, at a business stage (planning where none is given). */

function Model({ model, saved, stage }: { model: string; saved?: { current: ReturnType<typeof asLegalEntityValue> | null }; stage?: string }) {
    const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { customerType: [model], businessStage: stage ?? "plan" } }));
    return <LegalEntityEditor value={value} businessStage={stageKey(stage ?? "plan")} audienceOnly onChange={next => { if (saved) saved.current = asLegalEntityValue(next); setValue(next); }} />;
}

describe("LegalEntityEditor organisation columns", () => {

    it("keeps where the organisation is on the left (name, country, address) and what it is and does on the right (Legal Form, Opening Date, Activities) with the Description below both, with no Customer or Market type", () => {

        function Org() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { country: "GB", mainActivity: "Weaving" } }));
            return <LegalEntityEditor value={value} onChange={setValue} />;
        }
        render(<Org />);

        const grid = document.querySelector("[data-anchor='legal-section-0'] .legal-entity-grid")!;
        const columns = [...grid.children].filter(child => child.classList.contains("legal-entity-field"));
        expect(columns).toHaveLength(2);
        const labels = (column: Element) => [...column.querySelectorAll(".field-label")].map(label => label.textContent?.replace(/\s+/g, " ").replace(/i$/, "").trim());
        expect(labels(columns[0])).toEqual(["Organisation Name", "Country", "Address"]);
        expect(columns[1].classList.contains("legal-entity-questions")).toBe(true);
        // (With no activity code yet, the profession it would settle is asked beside the activities: Questions 10, stage 4.)
        expect(labels(columns[1])).toEqual(["Legal Form", "Registration Date", "Opening Date", "Activities", "Primary", "Is your work a regulated profession?"]);
        // The Description stands below both columns, after a divider line.
        const below = document.querySelector("[data-anchor='legal-section-0'] .legal-entity-org-body > .legal-entity-org-description")!;
        expect(below.textContent).toContain("Notes");
        expect(below.querySelector("input[type=checkbox]")).toBeTruthy();
        expect(below.previousElementSibling?.getAttribute("role")).toBe("separator");
        expect(grid.textContent).not.toContain("Customer type");
        expect(grid.textContent).not.toContain("Market type");

    });

});

describe("LegalEntityEditor Early Positioning questions", () => {

    it("asks the seller and buyer relationship (B2C and B2B only), the audience, the buyer's category and the purpose, one choice each, and the audience follows the model", () => {

        let saved: ReturnType<typeof asLegalEntityValue> | null = null;
        function Audience() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { customerType: "b2b", audience: "smb" } }));
            return <LegalEntityEditor value={value} audienceOnly onChange={next => { saved = asLegalEntityValue(next); setValue(next); }} />;
        }
        render(<Audience />);

        // (The first version is single-sided and has no B2G or G2B: they are a future feature.)
        expect(screen.queryByRole("radiogroup", { name: "Market Structure" })).toBeNull();
        expect(screen.getByRole("radiogroup", { name: "Seller & Buyer Relationship" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "Seller & Buyer Relationship" }).querySelectorAll("input").length).toBe(2);
        expect(screen.getByRole("radiogroup", { name: "Buyer's category" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "Purpose" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "Audience Specialisation & Scale" })).toBeTruthy();
        // (The Differentiation and the Outcomes left Positioning on 2026-11-08, owner: the Business System asks them.)
        expect(screen.queryByRole("radiogroup", { name: "Differentiation" })).toBeNull();
        expect(screen.queryByRole("radiogroup", { name: "Outcome" })).toBeNull();
        expect(screen.queryByRole("radiogroup", { name: "Outcome for the end user" })).toBeNull();
        expect((screen.getByRole("radio", { name: "Startups & SMBs" }) as HTMLInputElement).checked).toBe(true);

        // A consumer market has life stages, not scales, and the old audience goes.
        fireEvent.click(screen.getByRole("radio", { name: "B2C (Business-to-Consumer)" }));
        expect(screen.getByRole("radiogroup", { name: "Buyer's Life-Stage" })).toBeTruthy();
        expect(screen.queryByRole("radio", { name: "Startups & SMBs" })).toBeNull();
        // The Proxy Buyers option is the buyer's category now: the life stage has three.
        expect(screen.queryByRole("radio", { name: /Proxy Buyers/ })).not.toBeNull();
        expect(screen.getByRole("radiogroup", { name: "Buyer's Life-Stage" }).querySelectorAll("input").length).toBe(3);
        expect(saved!.organisation.audience).toEqual([]);

        fireEvent.click(screen.getByRole("radio", { name: "Seniors" }));
        fireEvent.click(screen.getByRole("radio", { name: "Dual-Intent Buyers" }));
        fireEvent.click(screen.getByRole("radio", { name: "Gifting & Appreciation" }));
        // (A Dual-Intent Buyer's user has an outcome of their own: the Segment's End user part asks it now.)
        expect(screen.queryByRole("radio", { name: "Safety & care" })).toBeNull();
        expect(saved!.organisation).toMatchObject({ customerType: ["b2c"], audience: ["senior"], buyerCategory: ["b2c:dual"], purpose: ["gifting"], marketType: "single" });

    });

});

describe("LegalEntityEditor Early Positioning limits by business stage", () => {

    function Stage({ stage, start }: { stage: string; start?: Record<string, unknown> }) {
        const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { businessStage: stage, customerType: ["b2b"], ...start } }));
        return <LegalEntityEditor value={value} businessStage={stageKey(stage)} audienceOnly onChange={setValue} />;
    }

    it("takes one choice while planning and launching, two in the outcome from launching, two in each while managing: the others locked, a note beside the label", () => {

        // Planning: radios, no limit note.
        const planning = render(<Stage stage="plan" />);
        expect(screen.getAllByRole("radio", { name: /Productivity & Efficiency/ })).toHaveLength(1);
        expect(planning.container.querySelector(".business-foundation-tick-note")).toBeNull();
        cleanup();

        // Launching: one relationship, up to two outcomes (ticks, "2 max").
        const launching = render(<Stage stage="launch" />);
        expect(screen.getByRole("radio", { name: "B2B (Business-to-Business)" })).toBeTruthy();
        const outcomes = screen.getByRole("group", { name: "Purpose" });
        const ticks = () => [...outcomes.querySelectorAll("input[type=checkbox]")] as HTMLInputElement[];
        fireEvent.click(ticks()[0]);
        fireEvent.click(ticks()[1]);
        expect(ticks().map(tick => tick.disabled)).toEqual(ticks().map((_tick, at) => at > 1));
        // (The Purpose is the one question of the outcome's limit left on Positioning: the Differentiation and the Outcomes are the Business System's since 2026-11-08.)
        expect([...launching.container.querySelectorAll(".business-foundation-tick-note")].map(note => note.textContent)).toEqual(["2 max"]);
        // A ticked one is never locked: unticking frees the others.
        fireEvent.click(ticks()[0]);
        expect(ticks().every(tick => !tick.disabled)).toBe(true);
        cleanup();

        // Managing: two relationships as well; the third is locked.
        render(<Stage stage="manage" />);
        const relationships = screen.getByRole("group", { name: "Seller & Buyer Relationship" });
        fireEvent.click(screen.getByRole("checkbox", { name: /B2C/ }));
        expect([...relationships.querySelectorAll("input[type=checkbox]")].map(tick => (tick as HTMLInputElement).disabled)).toEqual([false, false]);
        // Both a business and a consumer buyer: both audience questions.
        expect(screen.getByRole("group", { name: "Audience Specialisation & Scale" })).toBeTruthy();
        expect(screen.getByRole("group", { name: "Buyer's Life-Stage" })).toBeTruthy();
        cleanup();

        // Growing: any number, no locks, no note.
        const growing = render(<Stage stage="grow" />);
        for (const tick of [...screen.getByRole("group", { name: "Purpose" }).querySelectorAll("input[type=checkbox]")]) fireEvent.click(tick);
        expect([...screen.getByRole("group", { name: "Purpose" }).querySelectorAll("input[type=checkbox]")].every(tick => (tick as HTMLInputElement).checked && !(tick as HTMLInputElement).disabled)).toBe(true);
        expect(growing.container.querySelector(".business-foundation-tick-note")).toBeNull();

    });

    it("reads an older answer: one id, or \"both\" as business-to-business and business-to-consumer", () => {

        const value = asLegalEntityValue({ organisation: { customerType: "both", audience: "smb", outcome: "cost" } });
        expect(value.organisation.customerType).toEqual(["b2b", "b2c"]);
        expect(value.organisation.audience).toEqual(["smb"]);
        // The first answer was one question, "Differentiation & Outcome": its ids are the differentiation now.
        expect(value.organisation.differentiation).toEqual(["cost"]);
        expect(value.organisation.outcome).toEqual([]);

    });

    it("reads an older answer without what the first version leaves out: B2G, G2B, a multi-sided market, the Proxy audience and the two End User questions it no longer asks", () => {

        const value = asLegalEntityValue({ organisation: {
            customerType: ["b2c", "b2g", "g2b"], marketType: "multi", audience: ["proxy", "senior", "central", "heavy"], outcome: ["b2c:cost", "b2g:premium"],
            endUser: ["age:child", "age:older", "age:adult", "rel:parent", "rel:friend", "decides:asks", "wants:safety"]
        } });
        expect(value.organisation).toMatchObject({ customerType: ["b2c"], marketType: "single", audience: ["senior"], differentiation: ["cost", "premium"], outcome: [] });
        // The three ages under 18 are Minors and the older adults are Seniors; the relationships stay; who chooses goes and what matters most is the outcome for the user.
        expect(value.organisation.endUser).toEqual(["age:minor", "age:senior", "age:adult", "rel:parent", "rel:friend"]);
        expect(value.organisation.outcomeUser).toEqual(["safety"]);

    });

});

describe("The name of the positioning tile follows the business stage", () => {

    it("is Early Positioning while planning and launching (and before a stage is chosen), Core Market Positioning while managing, Corporate & Portfolio Positioning while growing", () => {

        expect(["", "plan", "launch"].map(positioningName)).toEqual(["Early Positioning", "Early Positioning", "Early Positioning"]);
        expect(positioningName("manage")).toBe("Core Market Positioning");
        expect(positioningName("grow")).toBe("Corporate & Portfolio Positioning");

    });

});

describe("LegalEntityEditor Early Positioning: the buyer's category and the End User", () => {

    it("asks the End User only of a Proxy or Dual-Intent Buyer, and drops its answers with it", () => {

        const saved: { current: ReturnType<typeof asLegalEntityValue> | null } = { current: null };
        render(<Model model="b2c" stage="manage" saved={saved} />);
        expect(screen.queryByRole("group", { name: "Buyer & End User relationship" })).toBeNull();

        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        expect(screen.getByRole("group", { name: "Buyer & End User relationship" })).toBeTruthy();
        expect(screen.getByRole("group", { name: "End User's Life-Stage" })).toBeTruthy();
        // The first version has no "who chooses" and no "what matters most": a future feature.
        expect(screen.queryByRole("radiogroup", { name: "Who chooses: the Buyer or the End User" })).toBeNull();
        expect(screen.queryByRole("group", { name: "What matters most to the End User" })).toBeNull();

        fireEvent.click(screen.getByRole("checkbox", { name: /Parent or guardian/ }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Minors/ }));
        expect(saved.current!.organisation).toMatchObject({ buyerCategory: ["b2c:proxy"], endUser: ["rel:parent", "age:minor"] });

        // Dual-Intent asks the same; a Direct Buyer asks none, and the answers go.
        fireEvent.click(screen.getByRole("radio", { name: "Dual-Intent Buyers" }));
        expect(saved.current!.organisation.endUser).toEqual(["rel:parent", "age:minor"]);
        fireEvent.click(screen.getByRole("radio", { name: "Direct Buyers" }));
        expect(saved.current!.organisation).toMatchObject({ buyerCategory: ["b2c:direct"], endUser: [] });
        expect(screen.queryByRole("group", { name: "Buyer & End User relationship" })).toBeNull();

    });

    it("offers only the buyer and user relationships that can be the buyer's category, the user's life stage to a consumer buyer only", () => {

        const relations = () => [...screen.getByRole("radiogroup", { name: "Buyer & End User relationship" }).querySelectorAll("label")].map(label => label.textContent);
        render(<Model model="b2c" />);
        // A Proxy Buyer buys for the other: not a spouse or partner (a shared purchase).
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        expect(relations()).toEqual(["Parent or guardian", "Caregiver", "Family member", "Friend or acquaintance", "Commercial & Professional"]);
        expect(screen.getByRole("radiogroup", { name: "End User's Life-Stage" }).querySelectorAll("input").length).toBe(4);
        // A Dual-Intent Buyer shares the purchase: not a friend or a commercial and professional buyer.
        fireEvent.click(screen.getByRole("radio", { name: "Dual-Intent Buyers" }));
        expect(relations()).toEqual(["Parent or guardian", "Caregiver", "Family member", "Spouse or partner"]);
        cleanup();

        render(<Model model="b2b" />);
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        expect(relations()).toEqual(["Employer", "Professional intermediary", "Sponsor or funder", "Institution or membership body"]);
        expect(screen.queryByRole("radiogroup", { name: "End User's Life-Stage" })).toBeNull();
        fireEvent.click(screen.getByRole("radio", { name: "Dual-Intent Buyers" }));
        expect(relations()).toEqual(["Business partner", "Business serving clients", "Institution or membership body"]);

    });

    it("offers no Other relationship, but shows a saved one until it is unticked (owner, 2026-11-09)", () => {

        const relations = () => [...screen.getByRole("radiogroup", { name: "Buyer & End User relationship" }).querySelectorAll("label")].map(label => label.textContent);
        const saved = asLegalEntityValue({ organisation: { customerType: ["b2b"], buyerCategory: ["b2b:proxy"], endUser: ["rel:otherbusiness"], businessStage: "plan" } });
        render(<LegalEntityEditor value={saved} businessStage={stageKey("plan")} audienceOnly onChange={() => undefined} />);
        expect(relations()).toEqual(["Employer", "Professional intermediary", "Sponsor or funder", "Institution or membership body", "Other"]);

    });

    it("takes a relationship that no longer fits away with the change of category", () => {

        const saved: { current: ReturnType<typeof asLegalEntityValue> | null } = { current: null };
        render(<Model model="b2c" stage="manage" saved={saved} />);
        fireEvent.click(screen.getByRole("radio", { name: "Dual-Intent Buyers" }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Spouse or partner/ }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Parent or guardian/ }));
        expect(saved.current!.organisation.endUser.sort()).toEqual(["rel:parent", "rel:partner"]);
        // A Proxy Buyer is not a partner: the answer goes, the parent stays.
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        expect(saved.current!.organisation.endUser).toEqual(["rel:parent"]);

    });

    it("no longer asks the outcomes (2026-11-08: O4 owns the buyer's, the Segment's End user part the end user's), and keeps an end user's outcome saved before as the Segment's start", () => {

        const saved: { current: ReturnType<typeof asLegalEntityValue> | null } = { current: null };
        function Older() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { customerType: ["b2c"], buyerCategory: ["b2c:proxy"], businessStage: "manage", outcome: ["time"], outcomeUser: ["safety"] } }));
            return <LegalEntityEditor value={value} businessStage={stageKey("manage")} audienceOnly onChange={next => { saved.current = asLegalEntityValue(next); setValue(next); }} />;
        }
        render(<Older />);
        for (const name of ["Outcome", "Outcome for the buyer", "Outcome for the end user", "Differentiation"]) {
            expect(screen.queryByRole("group", { name }), name).toBeNull();
        }
        fireEvent.click(screen.getByRole("radio", { name: "Direct Buyers" }));
        expect(saved.current!.organisation.outcomeUser).toEqual(["safety"]);
        expect(saved.current!.organisation.outcome).toEqual(["time"]);

    });

    it("limits the End User's relationship by the stage, as the audience is limited", () => {

        render(<Model model="b2c" stage="plan" />);
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        // While planning each question is one choice: a radio.
        expect(screen.getByRole("radiogroup", { name: "Buyer & End User relationship" })).toBeTruthy();
        expect(screen.getByRole("radiogroup", { name: "End User's Life-Stage" })).toBeTruthy();

    });

});

describe("LegalEntityEditor Early Positioning: the two columns and the order of the purposes", () => {

    const labelsOf = (name: string) => [...screen.getByRole("radiogroup", { name }).querySelectorAll("label")].map(label => label.textContent);

    it("asks every question before the purpose on the left (the relationship, the buyer's life stage, the buyer's category, the End User) and the purpose, the differentiation and the outcome on the right", () => {

        const { container } = render(<Model model="b2c" />);
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        const [left, right] = [...container.querySelectorAll(".legal-entity-audience > .legal-entity-field")];
        const names = (column: Element) => [...column.querySelectorAll("[role=radiogroup], [role=group]")].map(group => group.getAttribute("aria-label"));
        expect(names(left)).toEqual(["Seller & Buyer Relationship", "Buyer's Life-Stage", "Buyer's category", "Buyer & End User relationship", "End User's Life-Stage"]);
        expect(names(right)).toEqual(["Purpose"]);

    });

    it("groups the questions by relationship with both chosen: the consumer buyer's on the left under the first question, the business buyer's on the right above the purpose", () => {

        function Both() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { customerType: ["b2c", "b2b"], businessStage: "manage", buyerCategory: ["b2c:proxy", "b2b:proxy"] } }));
            return <LegalEntityEditor value={value} businessStage="manage" audienceOnly onChange={setValue} />;
        }
        const { container } = render(<Both />);
        const [left, right] = [...container.querySelectorAll(".legal-entity-audience > .legal-entity-field")];
        const names = (column: Element) => [...column.querySelectorAll("[role=radiogroup], [role=group]")].map(group => group.getAttribute("aria-label"));
        expect(names(left)).toEqual(["Seller & Buyer Relationship", "Buyer's Life-Stage", "Buyer's category (B2C)", "Buyer & End User relationship (B2C)", "End User's Life-Stage"]);
        expect(names(right)).toEqual(["Audience Specialisation & Scale", "Buyer's category (B2B)", "Buyer & End User relationship (B2B)", "Purpose"]);
        // (A double rule between one group and the next in a column.)
        expect(left.querySelectorAll(".business-capability-card-rule-double")).toHaveLength(1);
        expect(right.querySelectorAll(".business-capability-card-rule-double")).toHaveLength(1);

    });

    it("keeps the order of the end user's outcomes and of the differentiations for the Segment, where they are asked now: the purposes chosen first", () => {

        const order = { customerType: ["b2c"], audience: [] as string[], buyerCategory: ["b2c:proxy"], endUser: [] as string[], purpose: ["protection"] };
        expect(userOutcomeOptionsFor(order)[0].label).toBe("Safety & care");
        // (Nothing is hidden for the user.)
        expect(userOutcomeOptionsFor(order)).toHaveLength(6);
        // (Every differentiation is offered where no business scale's table leaves one blank.)
        expect(differentiationOptionsFor(order, [])).toHaveLength(7);

    });

    it("offers the purposes that fit the buyer, the most relevant first, and leaves out the ones that are generally less directly relevant", () => {

        render(<Model model="b2c" />);
        // A consumer buyer: Business Growth is the one purpose that is not relevant; Compliance is only possible, so it comes last.
        let purposes = labelsOf("Purpose");
        expect(purposes).toHaveLength(11);
        expect(purposes).not.toContain("Business Growth & Performance");
        expect(purposes[purposes.length - 1]).toBe("Compliance & Obligations");

        // A Direct Buyer does not gift: Gifting is left out.
        fireEvent.click(screen.getByRole("radio", { name: "Direct Buyers" }));
        purposes = labelsOf("Purpose");
        expect(purposes).not.toContain("Gifting & Appreciation");
        expect(purposes).toHaveLength(11);

        // A Proxy Buyer who is a friend: Gifting, Entertainment and Social Connection are primary, Health, Creation and Access possible; the other six are left out.
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        fireEvent.click(screen.getByRole("radio", { name: "Friend or acquaintance" }));
        purposes = labelsOf("Purpose");
        expect(purposes).toEqual(["Gifting & Appreciation", "Entertainment & Enjoyment", "Social Connection & Relationships", "Health, Care & Wellbeing", "Creation & Expression", "Access & Social Support"]);

    });

    it("keeps a purpose that was chosen even when the answers above no longer make it relevant", () => {

        function Held() {
            const [value, setValue] = useState<unknown>(asLegalEntityValue({ organisation: { customerType: ["b2c"], buyerCategory: ["b2c:direct"], purpose: ["gifting"] } }));
            return <LegalEntityEditor value={value} audienceOnly onChange={setValue} />;
        }
        render(<Held />);
        expect(labelsOf("Purpose")).toContain("Gifting & Appreciation");

    });


});

describe("LegalEntityEditor Early Positioning: the user of a parent, and the life stages of the buyer and the user", () => {

    const labelsOf = (name: string) => [...screen.getByRole("radiogroup", { name }).querySelectorAll("label")].map(label => label.textContent);

    it("offers a parent or legal guardian only a minor or a young adult as the user", () => {

        const saved: { current: ReturnType<typeof asLegalEntityValue> | null } = { current: null };
        render(<Model model="b2c" saved={saved} />);
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        expect(labelsOf("End User's Life-Stage")).toEqual(["Minors", "Young Adults", "Adults", "Seniors"]);
        fireEvent.click(screen.getByRole("radio", { name: "Parent or guardian" }));
        expect(labelsOf("End User's Life-Stage")).toEqual(["Minors", "Young Adults"]);
        // Another relationship brings them back.
        fireEvent.click(screen.getByRole("radio", { name: "Caregiver" }));
        expect(labelsOf("End User's Life-Stage")).toEqual(["Minors", "Young Adults", "Adults", "Seniors"]);

    });

    it("takes an adult or a senior user away when a parent is chosen", () => {

        const saved: { current: ReturnType<typeof asLegalEntityValue> | null } = { current: null };
        render(<Model model="b2c" stage="manage" saved={saved} />);
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        fireEvent.click(within(screen.getByRole("group", { name: "End User's Life-Stage" })).getByRole("checkbox", { name: /Seniors/ }));
        fireEvent.click(screen.getByRole("checkbox", { name: /Parent or guardian/ }));
        expect(saved.current!.organisation.endUser).not.toContain("age:senior");

    });

    it("offers the purposes of the buyer's and the user's life stage: a student buying for a minor has no business growth", () => {

        render(<Model model="b2c" />);
        fireEvent.click(screen.getByRole("radio", { name: "Students / Young Adults" }));
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        fireEvent.click(screen.getByRole("radio", { name: "Minors" }));
        const purposes = labelsOf("Purpose");
        expect(purposes).not.toContain("Business Growth & Performance");
        expect(purposes).not.toContain("Compliance & Obligations");
        expect(purposes[0]).toBe("Learning & Development");

    });

    it("does not offer the Commercial & Professional to a Student or Young Adult buyer", () => {

        render(<Model model="b2c" />);
        fireEvent.click(screen.getByRole("radio", { name: "Proxy Buyers" }));
        expect(screen.queryByRole("radio", { name: /Commercial & Professional/ }) ?? screen.queryByRole("checkbox", { name: /Commercial & Professional/ })).not.toBeNull();
        fireEvent.click(screen.getByRole("radio", { name: "Students / Young Adults" }));
        expect(screen.queryByRole("radio", { name: /Commercial & Professional/ }) ?? screen.queryByRole("checkbox", { name: /Commercial & Professional/ })).toBeNull();

    });

});
