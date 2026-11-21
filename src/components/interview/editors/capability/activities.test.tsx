import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import BusinessCapabilityEditor from "../BusinessCapabilityEditor";
import { newActivityFor } from "../BusinessCapabilityModel";
import { cardBoxes, closeAllTiles, closeTile, infrastructureCard, offeringCard, openCard, openTile, tileButton, topDialog } from "../../../../test/interviewTestUtils";
import { BUSINESS_ACTIVITY_CATEGORIES, asBusinessCapabilityValue, createBusinessActivity, businessAutoResponsibleId } from "../../../../framework/engine/answers/AnswerUtils";
import { stylesheet } from "../../../../test/stylesheet";

const OPERATIONAL = BUSINESS_ACTIVITY_CATEGORIES.find(category => category.id === "operational")!;

afterEach(cleanup);

describe("BusinessCapabilityEditor completed activities", () => {

    const initial = {
        ...asBusinessCapabilityValue(undefined),
        activities: [{
            id: OPERATIONAL.id,
            name: "",
            activities: [
                { ...createBusinessActivity(), name: "Alpha" },
                { ...createBusinessActivity(), name: "Beta" },
                { ...createBusinessActivity(), name: "Done", completed: true }
            ]
        }]
    };

    function ValueHarness({ value }: { value?: unknown }) {
        const [current, setCurrent] = useState<unknown>(value ?? initial);
        return <BusinessCapabilityEditor value={current} onChange={setCurrent} />;
    }

    // (Every category has its own tile in the Activities view, the empty ones too: the section tile lists them all.)
    const INFRASTRUCTURE_ACTIVITY_CATEGORIES = "Activities, Pre-Operational, Operational";
    const OFFERING_ACTIVITY_CATEGORIES = "Activities, Production, Marketing, Sales & Customer";

    it("files a completed activity under the grey Completed tile, out of its category's list", () => {
        render(<ValueHarness />);
        // The grey tile lists the finished ones; the category lists the active ones.
        const completed = tileButton("Completed");
        expect(completed.classList.contains("section-tile-completed")).toBe(true);
        expect(completed.getAttribute("aria-label")).toBe("Completed, Done");
        // (Infrastructure's Activities tile names every category, the empty ones too; the finished one is in no list of Operational.)
        expect(tileButton("Operational").getAttribute("aria-label")).toBe(INFRASTRUCTURE_ACTIVITY_CATEGORIES);
        openTile("Operational");
        expect(cardBoxes()).toEqual(["Activity 1: Alpha", "Activity 2: Beta"]);
        // (Back leaves the category for the Activities view, and Back again the view.)
        closeTile();
        closeTile();
        // (One finished card: the Completed tile opens it at once, floating -- frozen, with no Add box.)
        openTile("Completed");
        expect(document.querySelector(".section-tile-dialog")).toBeNull();
        expect(topDialog().querySelector("[data-frozen]")).toBeTruthy();
        expect(within(topDialog()).queryByRole("button", { name: /^Add / })).toBeNull();
    });

    it("returns an activity to its category's active list when it is un-ticked, and files one that is ticked under Completed", () => {
        render(<ValueHarness />);
        openTile("Completed");
        openCard("Done");
        fireEvent.click(screen.getByRole("checkbox", { name: "Activity 1 completed" }));
        // It leaves the Completed view: it was the last one, so the dialog closes by itself and the tile is gone (it exists only while an activity is completed)...
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(() => tileButton("Completed")).toThrow();
        // ...and is back among its category's active ones.
        openTile("Operational");
        expect(cardBoxes()).toEqual(["Activity 1: Alpha", "Activity 2: Beta", "Activity 3: Done"]);
        openCard("Alpha");
        fireEvent.click(screen.getByRole("checkbox", { name: "Activity 1 completed" }));
        closeTile();
        expect(tileButton("Completed").getAttribute("aria-label")).toBe("Completed, Alpha");
    });

    it("has no Completed tile while no activity is completed, in Infrastructure and in Offering's Capability", () => {
        render(<ValueHarness value={asBusinessCapabilityValue(undefined)} />);
        expect(() => tileButton("Completed")).toThrow();
        expect(() => tileButton("Completed")).toThrow();
        expect(document.querySelector(".section-tile-completed")).toBeNull();
    });

    it("lists every completed activity, whichever category it belongs to, as card boxes of the one Completed tile (categories first, in order)", () => {
        const many = (id: string, count: number, label: string) => ({
            id, name: "", activities: Array.from({ length: count }, (_, index) => ({ ...createBusinessActivity(), name: label + " " + (index + 1), completed: true }))
        });
        render(<ValueHarness value={{
            ...asBusinessCapabilityValue(undefined),
            activities: [many("operational", 5, "Ops"), many("marketing", 4, "Mkt")]
        }} />);
        openTile("Completed");
        // Nine in all: one grid, Operational's five, then Marketing's four.
        expect(cardBoxes()).toEqual([...[1, 2, 3, 4, 5].map(n => "Activity " + n + ": Ops " + n), ...[1, 2, 3, 4].map(n => "Activity " + (n + 5) + ": Mkt " + n)]);
        expect(screen.getByRole("dialog", { name: "Completed" })).toBeTruthy();
    });

    it("gives Offering's Capability a grey Completed tile of its own, like Infrastructure's, and takes the nested Completed box out of its Activities", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<ValueHarness value={{
            ...base,
            offering: { ...base.offering, activities: [{ ...createBusinessActivity("production"), name: "Live" }, { ...createBusinessActivity("production"), name: "Finished", completed: true }] }
        }} />);
        // The tile: grey, outside both sections, listing the finished ones, with no "+" box.
        const tile = tileButton("Completed");
        expect(tile.classList.contains("section-tile-completed")).toBe(true);
        expect(tile.getAttribute("aria-label")).toBe("Completed, Finished");
        expect(tile.closest(".section-tiles-completed")).toBeTruthy();
        expect(tile.parentElement!.querySelector(".plus-box")).toBeNull();
        expect(tileButton("Activities", offeringCard()).getAttribute("aria-label")).toBe(OFFERING_ACTIVITY_CATEGORIES);
        // It holds one finished card: pressed, it opens that card (frozen, grey), floating; no Add box.
        openTile("Completed");
        expect(document.querySelector(".section-tile-dialog")).toBeNull();
        expect(topDialog().querySelector(".business-capability-activity-completed")).toBeTruthy();
        expect(within(topDialog()).queryByRole("button", { name: /^Add / })).toBeNull();
        closeTile();
        // The Activities tile holds the live one only: no Completed box inside it any more.
        openTile("Activities", "Production", "Live", offeringCard());
        expect(document.querySelector(".card-box-folder")).toBeNull();
        expect((screen.getByRole("textbox", { name: "Activity 1 name" }) as HTMLTextAreaElement).value).toBe("Live");
    });

    it("files an Offering's Capability activity under its Completed tile when it is ticked, and back under Activities when it is un-ticked", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<ValueHarness value={{
            ...base,
            offering: { ...base.offering, activities: [{ ...createBusinessActivity("production"), name: "Weave" }] }
        }} />);
        openTile("Activities", "Production", "Weave", offeringCard());
        fireEvent.click(screen.getByRole("checkbox", { name: "Activity 1 completed" }));
        closeAllTiles();
        expect(tileButton("Completed").getAttribute("aria-label")).toBe("Completed, Weave");
        expect(tileButton("Activities", offeringCard()).getAttribute("aria-label")).toBe(OFFERING_ACTIVITY_CATEGORIES);
        openTile("Completed");
        openCard("Weave");
        fireEvent.click(screen.getByRole("checkbox", { name: "Activity 1 completed" }));
        // (The last completed one: the floating card closes by itself and the tile goes.)
        expect(document.querySelector(".floating-card-host")).toBeNull();
        closeAllTiles();
        expect(() => tileButton("Completed")).toThrow();
        expect(tileButton("Activities", offeringCard()).getAttribute("aria-label")).toBe(OFFERING_ACTIVITY_CATEGORIES);
    });

    it("FREEZES a completed activity (Infrastructure's and Offering's Capability's): every field is disabled but its Completed tick, which unfreezes it", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<ValueHarness value={{
            ...base,
            activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "Done", completed: true, description: "Wrote it" }] }],
            offering: { ...base.offering, activities: [{ ...createBusinessActivity("production"), name: "Offered", completed: true }] }
        }} />);
        for (const [scope, name, card] of [[infrastructureCard, "Done", "Done"], [offeringCard, "Offered", "Offered"]] as const) {
            openTile("Completed");
            openCard(card);
            const dialog = topDialog();
            const activity = dialog.querySelector(".business-capability-activity") as HTMLElement;
            expect(activity.hasAttribute("data-frozen")).toBe(true);
            const controls = [...activity.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLButtonElement>("input, textarea, button")];
            const open = controls.filter(control => !control.matches(":disabled"));
            // Only the Completed tick stays live...
            expect(open.map(control => control.getAttribute("aria-label")), name).toEqual(["Activity 1 completed"]);
            // ...and it was enough to put every field into the frozen part: name, performer, description, linked Offerings...
            expect(controls.length).toBeGreaterThan(3);
            // Un-ticked, the activity leaves the Completed view and is whole again in its own list.
            fireEvent.click(screen.getByRole("checkbox", { name: "Activity 1 completed" }));
            expect(document.querySelector(".floating-card-host")).toBeNull();
            closeAllTiles();
            openTile("Activities", scope === offeringCard ? "Production" : "Operational", card, scope());
            const whole = topDialog().querySelector(".business-capability-activity") as HTMLElement;
            expect(whole.hasAttribute("data-frozen")).toBe(false);
            expect([...whole.querySelectorAll<HTMLElement>("textarea, input")].every(control => !control.matches(":disabled"))).toBe(true);
            closeAllTiles();
        }
    });

    it("draws the grey of the finished ones from the completed tokens: ground, edge and text", () => {
        const css = stylesheet("section-tiles.css");
        // (No stroke: the box is the grey ground with its inset light and shade; a finished card keeps the grey edge.)
        expect(css).toMatch(/\.section-tile-completed \{[^}]*background: var\(--bg-completed-card\);[^}]*color: var\(--text-completed-ink\);/);
        expect(css).toMatch(/\.business-capability-activity\.business-capability-activity-completed \{[^}]*border-color: var\(--line-completed\);[^}]*background: var\(--bg-completed-card\);/);
        expect(css).toMatch(/\.section-tile-dialog-completed\.business-foundation-card \{[^}]*var\(--bg-completed-card\)/);
    });

});

describe("an activity made with \"Other…\" under a card's Activity status", () => {

    it("is the sole founder's, as Performer and Responsibility, and starts when the card does", () => {
        const made = newActivityFor("infrastructure", "2027-03-01", [], ["f1"]);
        expect(made).toMatchObject({ name: "", category: "operational", startDate: "2027-03-01", performerIds: ["f1"], responsibleId: "f1" });
    });

    it("is left for the person to assign where there are several founders", () => {
        const made = newActivityFor("offering", "", ["off-1"], ["f1", "f2"]);
        expect(made).toMatchObject({ category: "production", offeringIds: ["off-1"], performerIds: [], responsibleId: "" });
    });

});

describe("an Activity's Responsible", () => {

    const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });

    function renderActivity(founders: ReturnType<typeof founder>[]) {
        const base = asBusinessCapabilityValue(undefined);
        const initial = {
            ...base,
            activities: [{
                id: OPERATIONAL.id,
                name: "",
                activities: [{ ...createBusinessActivity(), name: "Pack orders" }]
            }]
        };
        function ActivityHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} legalEntityFounders={founders} />;
        }
        render(<ActivityHarness />);
        openTile("Operational", undefined, "Pack orders");
        return document.body;
    }

    it("is not shown at all in an organisation with ONE founder, and he is still the responsible one", () => {
        const page = renderActivity([founder("f1", "Ann")]);
        expect(page.querySelector('[aria-label="Activity 1 name"]')).toBeTruthy();
        expect(page.querySelector(".business-capability-activity")?.textContent).not.toMatch(/Responsib/);
        expect(page.querySelector(".business-capability-activity .business-capability-automatic")).toBeNull();
        expect(businessAutoResponsibleId(["f1"], [])).toBe("f1");
    });

    it("is unchanged with several founders (a Responsible dropdown)", () => {
        const page = renderActivity([founder("f1", "Ann"), founder("f2", "Bo")]);
        expect(page.querySelector(".business-capability-activity")?.textContent).toMatch(/Responsible/);
        // The label is "Responsible" (as a partner's), not "Responsibility"; the picker is named after it.
        expect(page.querySelector(".business-capability-activity")?.textContent).not.toMatch(/Responsibility/);
        expect(page.querySelector('.business-capability-activity [aria-label^="Activity 1 responsible"]')).toBeTruthy();
    });

});
