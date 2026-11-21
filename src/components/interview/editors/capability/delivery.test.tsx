import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import BusinessCapabilityEditor from "../BusinessCapabilityEditor";
import { closeTile, openCard, openTile, tileButton, topDialog } from "../../../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessResourceSlot } from "../../../../framework/engine/answers/AnswerUtils";
import { stylesheet } from "../../../../test/stylesheet";


afterEach(cleanup);

describe("BusinessCapabilityEditor Delivery", () => {

    it("shows a person's hours with no unit after the box (the label names the hours)", () => {
        const base = asBusinessCapabilityValue(undefined);
        function DeliveryHarness() {
            const [value, setValue] = useState<unknown>(base);
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={setValue}
                    legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }]}
                    foundation={{ segments: [{ offerings: [{ id: "offering-1", name: "Offering One" }] }] }}
                />
            );
        }
        render(<DeliveryHarness />);
        openTile("Capacity & Delivery");
        expect(document.querySelector(".delivery-person-unit")).toBeNull();
        for (const person of document.querySelectorAll(".delivery-person")) {
            expect(person.textContent).not.toMatch(/\bh$/);
        }
    });

    it("does not draw '(founder)' or '(external)' after a person: it is in the tooltip and the input's name", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(
            <BusinessCapabilityEditor
                value={base}
                onChange={() => undefined}
                legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }]}
                foundation={{ segments: [{ offerings: [{ id: "offering-1", name: "Offering One" }] }] }}
            />
        );
        openTile("Capacity & Delivery");
        openCard("Offering One");
        const person = document.querySelector(".delivery-card .delivery-person")!;
        expect(person.textContent).not.toMatch(/\((founder|external)\)/);
        expect(person.querySelector(".delivery-person-kind")).toBeNull();
        expect(person.querySelector(".delivery-person-name")!.getAttribute("title")).toBe("Ann (founder)");
        expect(person.querySelector("input")!.getAttribute("aria-label")).toMatch(/\(founder\)$/);
    });

    it("lists each Offering on the Delivery tile as a link that opens THAT Offering's Delivery card alone, floating, under the caption 'Delivery'", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(
            <BusinessCapabilityEditor
                value={base}
                onChange={() => undefined}
                legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }]}
                foundation={{ segments: [{ offerings: [{ id: "offering-1", name: "Offering One" }, { id: "offering-2", name: "Offering Two" }] }] }}
            />
        );
        const tile = tileButton("Capacity & Delivery");
        const links = [...tile.parentElement!.querySelectorAll<HTMLElement>("button.section-tile-link")];
        expect(links.map(link => link.textContent)).toEqual(["Offering One", "Offering Two"]);
        fireEvent.click(links[1]);
        const card = screen.getByRole("dialog", { name: "Capacity & Delivery" });
        expect(card.classList.contains("floating-card-host")).toBe(true);
        expect(card.querySelector(".floating-card-caption")!.textContent).toContain("Delivery");
        expect(card.querySelectorAll(".delivery-card")).toHaveLength(1);
        expect(card.querySelector(".strategy-name-static")!.textContent).toBe("Offering Two");
    });

    it("asks LC1 on Capacity & Delivery: the Legal Entity's Gaps and Cover read in once, each ticked skill with its cover, or a link to the Activities", () => {
        const saved: unknown[] = [];
        function Harness() {
            const [value, setValue] = useState<unknown>(asBusinessCapabilityValue({
                offering: { activities: [{ ...createBusinessActivity(), id: "sell-1", name: "Call buyers", category: "sales", offeringIds: ["offering-1"], performerIds: ["f1"] }] }
            }));
            return <BusinessCapabilityEditor
                value={value}
                onChange={(next) => { saved.push(next); setValue(next); }}
                legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }]}
                foundersProfile={{ founders: [], teamGaps: "No one sells. No bookkeeping.", teamCover: "A mentor helps." }}
                foundation={{ segments: [{ offerings: [{ id: "offering-1", name: "Offering One" }] }] }}
            />;
        }
        render(<Harness />);
        // The migration: once, Gaps as Other rows, one a sentence; Cover as the Notes.
        const migrated = asBusinessCapabilityValue(saved.find(next => asBusinessCapabilityValue(next).skillsNeeded !== undefined));
        expect([migrated.skillsNeeded, migrated.skillsOther, migrated.skillsNotes]).toEqual([["other"], ["No one sells.", "No bookkeeping."], "A mentor helps."]);

        openTile("Capacity & Delivery");
        const dialog = topDialog();
        expect(within(dialog).getByRole("group", { name: "Which skills does the business still need?" })).toBeTruthy();
        expect((within(dialog).getByRole("textbox", { name: "Skills notes" }) as HTMLTextAreaElement).value).toBe("A mentor helps.");
        // Selling's cover is the Team of the Sales activities: Ann, a link to her card.
        fireEvent.click(within(dialog).getByRole("checkbox", { name: "Selling" }));
        expect(asBusinessCapabilityValue(saved[saved.length - 1]).skillsNeeded).toEqual(["other", "selling"]);
        const covered = [...dialog.querySelectorAll(".delivery-skill-cover")].map(line => line.textContent);
        expect(covered).toContain("Covered by: Ann");
        // Marketing has no activity with a Team: "Not covered yet", a link to the Activities.
        // (The Other rows' cover is Infrastructure's activities, with none here: one "Not covered yet" already.)
        const before = within(dialog).getAllByRole("button", { name: "Not covered yet" }).length;
        fireEvent.click(within(dialog).getByRole("checkbox", { name: "Marketing & social media" }));
        expect(within(dialog).getAllByRole("button", { name: "Not covered yet" })).toHaveLength(before + 1);
    });

    it("sets a Delivery card's order number at the card's padding edge: no box of its own to the left of it", () => {
        const css = stylesheet("section-tiles.css");
        expect(css).toMatch(/\.delivery-card \.strategy-box-head > \.strategy-box-number \{[^}]*min-width: 0;/);
        expect(css).toMatch(/\.delivery-card \.strategy-box-head > \.strategy-box-number > \.list-number \{[^}]*text-align: left;/);
    });

    it("carries no static explanation: the paragraphs sit behind the \"i\" of the hours label", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(
            <BusinessCapabilityEditor
                value={base}
                onChange={() => undefined}
                legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }]}
                foundation={{ segments: [{ offerings: [{ id: "offering-1", name: "Offering One" }] }] }}
            />
        );
        openTile("Capacity & Delivery");
        openCard("Offering One");
        const card = document.querySelector(".delivery-card")!;
        expect(card.textContent).not.toMatch(/count against their capacity/);
        expect(card.textContent).not.toMatch(/To share the work with an external professional/);
        expect(document.body.textContent).not.toMatch(/The budgets below compare this/);
        // Delivered is a side-label row.
        expect(card.querySelector(".business-field-side")?.textContent).toMatch(/^Delivered/);
    });

});

describe("Capacity & Delivery, Questions 19 (owner, 2026-11-17)", () => {

    const founders = [{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }];
    const foundation = { segments: [{ id: "s", name: "Makers", offerings: [
        { id: "o-class", name: "Classes", category: "Service", questions: { o1: ["inperson"], o3: ["once"] } },
        { id: "o-rug", name: "Rugs", category: "Product", questions: { o1: ["physical"], o3: ["once"] } }
    ] }] };
    function Harness({ initial, onValue }: { initial: unknown; onValue?: (next: unknown) => void }) {
        const [value, setValue] = useState<unknown>(initial);
        return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next); }} legalEntityFounders={founders} foundation={foundation} />;
    }

    it("asks DV6 for sessions (the hours then a session's), DV9 and DV10 for a product, and DV12 in place of Constraints, each tick opening its own question", () => {
        let saved: unknown;
        render(<Harness initial={{ ...asBusinessCapabilityValue(undefined), offering: { ...asBusinessCapabilityValue(undefined).offering, resources: [{ ...createBusinessResourceSlot(), id: "loom", name: "Floor loom", offeringIds: ["o-rug"] }] } }} onValue={(next) => { saved = next; }} />);
        openTile("Capacity & Delivery");
        openCard("Classes");
        expect(screen.getByLabelText("Classes customers in one session")).toBeTruthy();
        expect(document.querySelector(".floating-card-host")!.textContent).toContain("Working Hours per Session, by person");
        expect(screen.queryByLabelText("Classes set-up hours for a batch")).toBeNull();
        closeTile();
        openCard("Rugs");
        expect(screen.queryByLabelText("Rugs customers in one session")).toBeNull();
        expect(screen.getByLabelText("Rugs set-up hours for a batch")).toBeTruthy();
        fireEvent.click(within(screen.getByRole("group", { name: "Rugs what can hold up delivery" })).getByLabelText("Equipment or a workspace"));
        expect(asBusinessCapabilityValue(saved).delivery["o-rug"].holdUps).toEqual(["equipment"]);
        // (One resource: the picker is its record.)
        expect(screen.getByRole("textbox", { name: "Rugs equipment that holds up delivery: Floor loom" }).getAttribute("aria-readonly")).toBe("true");
        expect(screen.getByLabelText("Rugs units the equipment holds at once")).toBeTruthy();
    });

    it("moves a saved Constraints text once into Other, one row a sentence", () => {
        let saved: unknown;
        const initial = { ...asBusinessCapabilityValue(undefined), delivery: { "o-rug": { ...asBusinessCapabilityValue({ delivery: { "o-rug": {} } }).delivery["o-rug"], hours: { f1: "2" }, constraints: "Three looms. Yarn takes a week." } } };
        render(<Harness initial={initial} onValue={(next) => { saved = next; }} />);
        const moved = asBusinessCapabilityValue(saved).delivery["o-rug"];
        expect([moved.constraints, moved.holdUps, moved.holdUpsOther]).toEqual(["", ["other"], ["Three looms.", "Yarn takes a week."]]);
    });

    it("draws the 85% mark on every bar", () => {
        expect(stylesheet("delivery.css")).toMatch(/\.delivery-budget-ceiling\{[^}]*position:absolute;/);
    });

});
