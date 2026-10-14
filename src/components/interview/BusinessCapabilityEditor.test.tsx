import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import BusinessCapabilityEditor, { newActivityFor } from "./BusinessCapabilityEditor";
import { cardBoxes, closeAllTiles, closeTile, infrastructureCard, offeringCard, openCard, openTile, tileButton, toggles, topDialog } from "../../test/interviewTestUtils";
import { BUSINESS_ACTIVITY_CATEGORIES, asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot, businessAutoResponsibleId, businessPartnerResponsibleId, businessResponsibleId } from "../../framework/engine/AnswerUtils";
import { stylesheet } from "../../test/stylesheet";


const OPERATIONAL = BUSINESS_ACTIVITY_CATEGORIES.find(category => category.id === "operational")!;

function Harness() {
    const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
    return <BusinessCapabilityEditor value={value} onChange={setValue} />;
}


afterEach(cleanup);

/** Offering's Capability > Resources: its Equipment category tile, then the Production Machinery group box. */
function openOfferingResources() {
    openTile("Resources");
    openTile("Equipment", "Production Machinery");
}

describe("BusinessCapabilityEditor lists of cards as boxes", () => {

    const ValueHarness = ({ initial }: { initial: unknown }) => {
        const [value, setValue] = useState<unknown>(initial);
        return <BusinessCapabilityEditor value={value} onChange={setValue} />;
    };

    it("adds a Resource with the add box, which opens it at once; the earlier ones stay closed boxes", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<ValueHarness initial={{ ...base, offering: { ...base.offering, resources: [{ ...createBusinessResourceSlot(), category: "equipment", group: "production-machinery", name: "First" }, { ...createBusinessResourceSlot(), category: "equipment", group: "production-machinery", name: "Second" }] } }} />);
        // (Offering's Resources view holds the cards in one category tile -- two cards or more -- which is pressed to open them.)
        openOfferingResources();
        expect(cardBoxes()).toEqual(["Resource 1: First", "Resource 2: Second"]);
        fireEvent.click(screen.getByRole("button", { name: "Add Card" }));
        // The grid closes; the new card floats, its name focused.
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        expect(screen.getByRole("textbox", { name: "Resource 3 name" })).toBeTruthy();
        fireEvent.change(screen.getByRole("textbox", { name: "Resource 3 name" }), { target: { value: "Third" } });
        closeTile();
        openOfferingResources();
        expect(cardBoxes()).toEqual(["Resource 1: First", "Resource 2: Second", "Resource 3: Third"]);
    });

    it("keeps structural sections open by default", () => {
        render(<Harness />);
        toggles(/Resources$|Activities$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("true"));
    });

    // The finished ones are filed under Completed, so a category's list counts the active ones only.
    it("counts only active activities in a category, the finished one being filed under Completed", () => {
        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: OPERATIONAL.id,
                name: "",
                activities: [
                    { ...createBusinessActivity(), name: "Open" },
                    { ...createBusinessActivity(), name: "Also open" },
                    { ...createBusinessActivity(), name: "Done", completed: true }
                ]
            }]
        };
        render(<ValueHarness initial={initial} />);
        openTile("Operational");
        expect(screen.getByText("Active 2")).toBeTruthy();
        expect(cardBoxes()).toEqual(["Activity 1: Open", "Activity 2: Also open"]);
        expect(screen.queryByRole("button", { name: "Expand all activities" })).toBeNull();
    });

    // An activity's box: its number and name, and under them who is responsible (else the first line of its description).
    it("puts an activity's one small line (its description, else who is responsible) under its name in its box", () => {
        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: OPERATIONAL.id,
                name: "",
                activities: [
                    { ...createBusinessActivity(), name: "Review", description: "Weekly numbers review" },
                    { ...createBusinessActivity(), name: "Plan" }
                ]
            }]
        };
        render(<ValueHarness initial={initial} />);
        openTile("Operational");
        const boxes = [...topDialog().querySelectorAll<HTMLElement>(".card-tile")];
        // The card tile says what Inventory says: the name (with its number), then where it belongs.
        expect(boxes[0].querySelector(".section-tile-title")?.textContent).toMatch(/1\. Review/);
        expect([...boxes[0].querySelectorAll(".section-tile-list > li")].map(item => item.textContent).slice(1)).toEqual(["Infrastructure", "Activities", "Operational"]);
        // The card itself is a press away, with its name box.
        expect(screen.queryByRole("textbox", { name: "Activity 1 name" })).toBeNull();
        openCard("Review");
        expect((screen.getByRole("textbox", { name: "Activity 1 name" }) as HTMLTextAreaElement).value).toBe("Review");
    });

    it("names a partner kind in the dialog's header, its cards boxes with no Expand all", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<ValueHarness initial={{ ...base, offering: { ...base.offering, professionals: [{ ...createBusinessPartner("Printer") }, { ...createBusinessPartner("Binder") }] } }} />);
        openTile("Partners & Suppliers", "Partners");
        expect(screen.queryByRole("button", { name: /^(Expand|Collapse) all/ })).toBeNull();
        expect(cardBoxes()).toEqual(["Partner 1: Printer", "Partner 2: Binder"]);
        expect(screen.getByRole("dialog", { name: "Partners & Suppliers, Partners" })).toBeTruthy();
        // (The kind is named in the header, after a slash; the box grid carries no heading of its own.)
        expect(document.querySelector(".section-tile-dialog .dialog-heading-sub")?.textContent).toBe("Partners");
        fireEvent.click(document.querySelector(".section-tile-back")!);
        // (Providers holds none, so the view has no tile for it -- a category of fewer than two cards is no tile.) The view's add box makes a blank card
        // and opens it floating, under the section's name.
        fireEvent.click(within(topDialog()).getByRole("button", { name: "Add Card" }));
        expect(document.querySelector(".floating-card-host")).not.toBeNull();
        expect(document.querySelector(".floating-card-host")!.getAttribute("aria-label")).toBe("Partners & Suppliers");
        expect(screen.getByRole("textbox", { name: "Professional 1 name" })).toBeTruthy();
    });

    it("carries only the heading on an activity category's title row (no Expand all)", () => {
        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: OPERATIONAL.id,
                name: "",
                activities: [
                    { ...createBusinessActivity(), name: "One" },
                    { ...createBusinessActivity(), name: "Two" }
                ]
            }]
        };
        render(<ValueHarness initial={initial} />);
        openTile("Operational");
        const head = document.querySelector(".section-tile-dialog .business-engagement-section-head")!;
        // (The heading names the section, then the category after a slash.)
        expect(head.textContent).toMatch(new RegExp("^Activities/" + OPERATIONAL.label));
        expect(head.querySelector(".fold-all-toggle")).toBeNull();
        // (The overall number of active cards stands next to the title, here 2; no separate "Active" line under it.)
        expect(head.querySelector(".dialog-heading-count")!.textContent).toBe("Active 2");
        expect(document.querySelectorAll(".business-capability-active")).toHaveLength(0);
    });

    it("shows the cards as closed boxes again on reload: nothing is open", () => {
        let latest: unknown = asBusinessCapabilityValue(undefined);
        function ReloadHarness({ initial }: { initial: unknown }) {
            const [value, setValue] = useState<unknown>(initial);
            latest = value;
            return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); latest = next; }} />;
        }
        const { unmount } = render(<ReloadHarness initial={latest} />);
        // (Each "+" of the tile makes one blank card -- no category, no group yet -- and opens it floating.)
        fireEvent.click(within(offeringCard()).getByRole("button", { name: "Add Resource to Resources" }));
        fireEvent.change(screen.getByRole("textbox", { name: "Resource 1 name" }), { target: { value: "Loom" } });
        closeAllTiles();
        fireEvent.click(within(offeringCard()).getByRole("button", { name: "Add Resource to Resources" }));
        fireEvent.change(screen.getByRole("textbox", { name: "Resource 2 name" }), { target: { value: "Cutter" } });
        closeAllTiles();
        unmount();
        // A fresh mount from the saved value starts with no card open.
        render(<ReloadHarness initial={latest} />);
        openTile("Resources", "No category");
        expect(cardBoxes()).toEqual(["Resource 1: Loom", "Resource 2: Cutter"]);
        expect(screen.queryByRole("textbox", { name: /Resource \d name/ })).toBeNull();
    });

});

describe("BusinessCapabilityEditor number limits", () => {

    it("refuses Delivery Hours above the founder's Working Hours", () => {

        function FounderHarness() {
            const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={setValue}
                    legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }]}
                />
            );
        }

        render(<FounderHarness />);
        openTile("Founders");

        // The founders' cards are open in the dialog and cannot fold (no arrow on them).
        expect(screen.queryAllByRole("button", { name: /^(Maximize|Minimize) Founder 1$/ })).toHaveLength(0);

        const working = screen.getByLabelText(/^Ann working hours/) as HTMLInputElement;
        ["1", "16", "160", "1600"].forEach(value => fireEvent.change(working, { target: { value } }));
        expect(working.value).toBe("160");

        const delivery = screen.getByLabelText(/^Ann delivery hours/) as HTMLInputElement;
        ["1", "16", "160", "1601"].forEach(value => fireEvent.change(delivery, { target: { value } }));
        expect(delivery.value).toBe("160");
        ["16", "161"].forEach(value => fireEvent.change(delivery, { target: { value } }));
        expect(delivery.value).toBe("16");

    });

});

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

describe("BusinessCapabilityEditor legacy numbers", () => {

    const ann = { id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" };

    const cost = (price: string) => ({ price, frequency: "monthly", frequencyOther: "", currency: "EUR" });

    function renderWith(initial: unknown, foundation?: unknown) {
        function ValueHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={setValue}
                    foundation={foundation}
                    legalEntityFounders={[ann]}
                />
            );
        }
        return render(<ValueHarness />);
    }

    const totals = (container: HTMLElement) =>
        [...container.querySelectorAll(".business-capability-total")].map(line => line.textContent ?? "");

    // Delivery hours are kept as typed, so "2,5" saved before the
    // box took only digits must read as the engine reads it: 2.5.
    it("reads a delivery's hours as the engine does", () => {

        renderWith(
            {
                ...asBusinessCapabilityValue(undefined),
                delivery: { "offering-1": { hours: { f1: "2,5" }, mode: "unit" } }
            },
            { segments: [{ offerings: [{ id: "offering-1", name: "Offering One" }] }] }
        );
        openTile("Delivery");
        openCard("Offering One");

        const line = document.body.querySelector(".delivery-total")?.textContent ?? "";
        expect(line).toContain("Total: 2.5 h per unit");

    });

    it("reads a resource's price as the engine does for its total", () => {

        renderWith({
            ...asBusinessCapabilityValue(undefined),
            resources: {
                utilities: [{
                    id: "premises-utilities",
                    name: "",
                    slots: [{
                        id: "slot-1", name: "Power", quantity: "2", description: "",
                        status: "costs", cost: cost("12,5"), providerId: "", offeringIds: []
                    }]
                }]
            }
        });
        openTile("Utilities", "Premises Utilities", "Power");

        expect(totals(document.body).some(line => /^Total: 2 × \D*12\.50 = \D*25$/.test(line))).toBe(true);

    });

    it("reads a chosen provider's price as the engine does", () => {

        renderWith({
            ...asBusinessCapabilityValue(undefined),
            providers: [{
                id: "p1", name: "PowerCo", description: "", responsibleId: "",
                cost: cost("12,5"), offeringIds: []
            }],
            resources: {
                utilities: [{
                    id: "premises-utilities",
                    name: "",
                    slots: [{
                        id: "slot-1", name: "Power", quantity: "", description: "",
                        status: "partners-suppliers", cost: cost(""), providerId: "p1", offeringIds: []
                    }]
                }]
            }
        });

        openTile("Utilities", "Premises Utilities", "Power");

        // One link only: the symbol beside the chosen name, whose tooltip carries the price.
        const link = document.querySelector<HTMLElement>(".business-link-symbol")!;
        expect(link.getAttribute("title")).toMatch(/12\.50 monthly/);
        expect(document.querySelectorAll(".business-capability-total").length).toBe(0);

    });

    it("asks a resource's Quantity at Costs only, after the Status, and keeps it hidden otherwise", () => {

        const slot = {
            id: "slot-1", name: "Power", quantity: "3", description: "",
            status: "partners-suppliers", cost: cost(""), providerId: "", offeringIds: []
        };
        const { unmount } = renderWith({
            ...asBusinessCapabilityValue(undefined),
            resources: { utilities: [{ id: "premises-utilities", name: "", slots: [slot] }] }
        });
        openTile("Utilities", "Premises Utilities", "Power");
        expect(screen.queryByLabelText("Resource 1 quantity")).toBeNull();
        unmount();

        renderWith({
            ...asBusinessCapabilityValue(undefined),
            resources: { utilities: [{ id: "premises-utilities", name: "", slots: [{ ...slot, status: "costs", cost: cost("5") }] }] }
        });
        openTile("Utilities", "Premises Utilities", "Power");
        const quantity = screen.getByLabelText("Resource 1 quantity") as HTMLInputElement;
        expect(quantity.value).toBe("3");
        const status = screen.getByRole("button", { name: /Resource 1 status/ });
        expect(status.compareDocumentPosition(quantity) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    });

});

describe("BusinessCapabilityEditor founders' roles", () => {

    const ann = { id: "f1", name: "Ann", ownership: "100", capital: "", roles: ["Old role"], experience: "" };

    function renderWith(foundersProfile?: unknown) {
        let saved: unknown;
        function ValueHarness() {
            const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={(next) => { saved = next; setValue(next); }}
                    legalEntityFounders={[ann]}
                    foundersProfile={foundersProfile}
                />
            );
        }
        render(<ValueHarness />);
        openTile("Founders");
        // The founders' cards are open in the dialog and cannot fold (no arrow on them).
        expect(screen.queryAllByRole("button", { name: /^(Maximize|Minimize) Founder 1$/ })).toHaveLength(0);
        return () => asBusinessCapabilityValue(saved);
    }

    it("asks one Frequency for the salary and both hours", () => {

        const saved = renderWith();

        const labels = [...document.querySelectorAll(".business-founder-grid .field-label")].map(label => label.textContent?.replace(/i$/, "").trim());
        expect(labels.slice(1)).toEqual(["Frequency", "Working Hours", "Delivery Hours"]);
        const frequency = screen.getByRole("button", { name: /^Ann frequency of salary and hours/ });
        fireEvent.click(frequency);
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Weekly", "Monthly", "Annually"]);
        fireEvent.click(screen.getByRole("option", { name: "Annually" }));
        expect(saved().founders[0].period).toBe("year");
        expect(screen.getByLabelText(/^Ann working hours a year/)).toBeTruthy();
        expect(screen.getByLabelText(/^Ann salary a year/)).toBeTruthy();

    });

    it("shows each founder's roles from the Founders Profile, read-only", () => {

        const saved = renderWith({ founders: [{ id: "f1", roles: ["Director", "Designer"] }] });

        // A bullet list named "Roles", with no visible "Roles" label, and nothing to type in.
        const list = screen.getByRole("list", { name: "Roles" });
        expect(list.classList.contains("bullet-list-static")).toBe(true);
        expect([...list.querySelectorAll("li")].map(item => item.textContent)).toEqual(["Director", "Designer"]);
        expect(screen.queryByRole("textbox", { name: /roles/i })).toBeNull();
        expect([...document.querySelectorAll(".section-tile-dialog .field-label")].map(label => label.textContent)).not.toContain("Roles");
        expect(saved().founders[0].roles).toEqual(["Director", "Designer"]);

    });

    it("reads the roles a Legal Entity saved before the Founders Profile existed", () => {

        renderWith(undefined);

        const roles = [...screen.getByRole("list", { name: "Roles" }).querySelectorAll("li")].map(item => item.textContent);
        expect(roles).toEqual(["Old role"]);

    });

    it("points to the Founders Profile when a founder has none", () => {

        renderWith({ founders: [{ id: "f1", roles: [""] }] });

        expect(screen.getByText(/Add them under 1\. Identity System → 4\. Founders Profile → 1\. Founders\./)).toBeTruthy();

    });

});

describe("BusinessCapabilityEditor founders' Responsibilities", () => {

    const ann = { id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" };

    /** Ann, the only founder, is responsible for every named activity. */
    function renderWith(names: string[], completed: number) {
        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: OPERATIONAL.id,
                name: "",
                activities: names.map((name, index) => ({ ...createBusinessActivity(), name, completed: index < completed }))
            }]
        };
        function ValueHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} legalEntityFounders={[ann]} />;
        }
        const view = render(<ValueHarness />);
        openTile("Founders");
        // The founders' cards are open in the dialog and cannot fold (no arrow on them).
        expect(screen.queryAllByRole("button", { name: /^(Maximize|Minimize) Founder 1$/ })).toHaveLength(0);
        // The section is drawn in a dialog, outside the render's own container.
        return { ...view, container: document.body };
    }

    const lines = (container: HTMLElement) =>
        [...container.querySelectorAll(".business-capability-responsibilities-head ~ div .numbered-list-static-text")].map(line => line.textContent);

    it("counts what is done of all of them, beside the label", () => {
        const { container } = renderWith(["A", "B", "C", "D", "E", "F", "G"], 3);
        expect(container.querySelector(".business-capability-responsibilities-count")?.textContent).toBe("3/7");
    });

    it("shows only the rate beside the label, no word before it", () => {
        const { container } = renderWith(["A", "B", "C"], 1);
        const count = container.querySelector(".business-capability-responsibilities-count")!;
        expect(count.textContent).toBe("1/3");
        expect(count.textContent).not.toMatch(/Completed/);
    });

    it("starts a list of more than five folded, and unfolds it from its arrow", () => {
        const { container } = renderWith(["A", "B", "C", "D", "E", "F"], 1);
        const arrow = screen.getByRole("button", { name: /^Maximize Responsibilities of (Ann|Founder 1)$/ });
        expect(arrow.getAttribute("aria-expanded")).toBe("false");
        expect(lines(container)).toEqual([]);
        fireEvent.click(arrow);
        const open = screen.getByRole("button", { name: /^Minimize Responsibilities of (Ann|Founder 1)$/ });
        expect(open.getAttribute("aria-expanded")).toBe("true");
        // What is done waits in its own Completed fold, folded.
        expect(lines(container)).toEqual(["B", "C", "D", "E", "F"]);
        fireEvent.click(open);
        expect(lines(container)).toEqual([]);
    });

    it("keeps what is done out of the list, in a Completed fold under it that starts folded", () => {
        const { container } = renderWith(["A", "B", "C", "D"], 2);
        // (Every list starts folded; this one is opened by hand.)
        fireEvent.click(screen.getByRole("button", { name: /^Maximize Responsibilities of (Ann|Founder 1)$/ }));
        expect(lines(container)).toEqual(["C", "D"]);
        // (The same row as Responsibilities: the standard fold arrow, then the label.)
        const completed = screen.getByRole("button", { name: /^Maximize completed responsibilities of (Ann|Founder 1)$/ });
        expect(completed.getAttribute("aria-expanded")).toBe("false");
        fireEvent.click(completed);
        expect(lines(container)).toEqual(["C", "D", "A", "B"]);
        // Numbered on from the list above.
        const done = container.querySelectorAll(".business-capability-completed .numbered-list-static");
        expect(done[done.length - 1].getAttribute("start")).toBe("3");
        expect(container.querySelector(".business-capability-responsibilities-count")?.textContent).toBe("2/4");
    });

    it("starts a list of five or fewer folded as well: every list is collapsed by default", () => {
        const { container } = renderWith(["A", "B", "C", "D", "E"], 0);
        expect(screen.getByRole("button", { name: /^Maximize Responsibilities of (Ann|Founder 1)$/ }).getAttribute("aria-expanded")).toBe("false");
        expect(lines(container)).toHaveLength(0);
        expect(container.querySelector(".business-capability-responsibilities-count")?.textContent).toBe("0/5");
    });

    it("stands the numbered list at the card's content edge, and its Completed row under the Responsibilities arrow", () => {
        const { container } = renderWith(["A", "B", "C", "D"], 2);
        fireEvent.click(screen.getByRole("button", { name: /^Maximize Responsibilities of (Ann|Founder 1)$/ }));
        for (const list of container.querySelectorAll(".business-capability-responsibilities-head ~ div .numbered-list-static")) {
            expect(list.classList.contains("numbered-list-static-flush")).toBe(true);
        }
        const css = stylesheet("section-tiles.css");
        // No indent for the list the arrow folds any more.
        expect(css).not.toMatch(/responsibilities-head:has\(> \.strategy-box-toggle\) ~ \*/);
        expect(css).not.toMatch(/margin-left: 44px/);
        expect(stylesheet("numbered-list.css")).toMatch(/\.numbered-list-static-flush > li::before ?\{[^}]*padding-left: ?0;[^}]*text-align: ?left;/);
    });

    it("collapses the list again every time the dialog opens; toggling inside an open dialog works", () => {
        const { container } = renderWith(["A", "B", "C"], 0);
        fireEvent.click(screen.getByRole("button", { name: /^Maximize Responsibilities of (Ann|Founder 1)$/ }));
        expect(lines(container)).toEqual(["A", "B", "C"]);
        closeTile();
        openTile("Founders");
        expect(screen.getByRole("button", { name: /^Maximize Responsibilities of (Ann|Founder 1)$/ }).getAttribute("aria-expanded")).toBe("false");
        expect(lines(container)).toHaveLength(0);
    });

    it("has no arrow and no count while there is nothing to list", () => {
        const { container } = renderWith([], 0);
        expect(screen.queryByRole("button", { name: /Responsibilities of/ })).toBeNull();
        expect(container.querySelector(".business-capability-responsibilities-count")).toBeNull();
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

describe("BusinessCapabilityEditor Frequency and Responsibility side labels", () => {

    function renderCards() {
        const base = asBusinessCapabilityValue(undefined);
        const initial = {
            ...base,
            offering: {
                ...base.offering,
                resources: [{ ...createBusinessResourceSlot(), category: "equipment", group: "production-machinery", name: "Stall", status: "costs" }],
                professionals: [{ ...createBusinessPartner("Printer") }]
            }
        };
        function CardHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={setValue}
                    legalEntityFounders={[
                        { id: "f1", name: "Ann", ownership: "50", capital: "", roles: [""], experience: "" },
                        { id: "f2", name: "Bo", ownership: "50", capital: "", roles: [""], experience: "" }
                    ]}
                />
            );
        }
        render(<CardHarness />);
    }

    /** Opens a tile, then the card box of that name. */
    function openCards(tile: string, card: string, box?: string) {
        openTile(tile, box, card);
    }

    // (A card is only ever a floating card now: the dialog is a grid of boxes.)
    const sideLabels = () => [...document.querySelectorAll(".floating-card-host .business-field-side")]
        .map(field => field.querySelector(".field-label")?.textContent?.replace(/i$/, "").trim());

    /** Each is the label first, then the dropdown in one row: hugging its longest option (Frequency), or running to the right edge of the name cell (Status, Responsible). */
    function expectLabelThenHuggingDropdown() {
        for (const field of document.querySelectorAll(".business-field-side")) {
            expect(field.children[0].classList.contains("field-label") || field.children[0].classList.contains("business-foundation-label-info")).toBe(true);
            // (The Start and End dates are Calendars, not dropdowns; a one-option dropdown is text.)
            if (/^(Start|End) date|^Useful life|^Rate override/.test(field.querySelector(".field-label")?.textContent ?? "") || field.querySelector(".business-capability-static-value")) {
                continue;
            }
            // (A sole founder has no Responsible field at all: see "a Partnership / Provider's Responsible".)
            const picker = field.querySelector(".option-picker");
            expect(picker ? picker.getAttribute("data-size") : field.querySelector(".business-capability-automatic")?.textContent).toBeTruthy();
            const label = (field.querySelector(".field-label")?.textContent ?? "").replace(/i$/, "").trim();
            expect(picker === null || picker.getAttribute("data-size") === (label === "Status" || label === "Responsible" || label === "Category" || label === "Group" ? "fit" : "hug")).toBe(true);
        }
    }

    it("sets the label beside its dropdown: Status on a Resource, Responsible on a partner (whose Frequency, like a Resource's, keeps its label above, in the cost row)", () => {
        renderCards();
        openOfferingResources();
        openCard("Resource 1");
        expect(sideLabels()).toEqual(["Start date", "End date", "Category", "Group", "Status"]);
        expectLabelThenHuggingDropdown();
        closeTile();
        openCards("Partners & Suppliers", "Partner 1", "Partners");
        expect(sideLabels()).toEqual(["Start date", "End date", "Group", "Responsible"]);
        // The partner's Frequency keeps its label above the dropdown, on the Price's row (the dropdown hugs its longest option too).
        const partnerFrequency = [...document.querySelectorAll('.floating-card-host .business-foundation-field')]
            .find(field => field.querySelector(":scope > .field-label")?.textContent?.startsWith("Frequency"))!;
        expect(partnerFrequency.classList.contains("business-field-side")).toBe(false);
        expectLabelThenHuggingDropdown();
    });

    it("gives the two labels one shared column (--side-label-short) and the gap --side-label-gap, label and dropdown on one centre line", () => {
        const css = stylesheet("conversation.css");
        expect(stylesheet("global.css")).toMatch(/--card-label-col: \d+px;[\s\S]*--side-label-short: var\(--card-label-col\);/);
        expect(css).toContain(".business-field-side{ display:grid; grid-template-columns:var(--side-label-short) minmax(0, 1fr); column-gap:var(--side-label-gap);");
        expect(css).toMatch(/\.business-field-side\{[^}]*align-items:center;/);
    });

});

describe("a Partnership / Provider's Responsible", () => {

    const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });

    function renderPartner(founders: ReturnType<typeof founder>[], responsibleId = "") {
        const base = asBusinessCapabilityValue(undefined);
        const initial = {
            ...base,
            offering: { ...base.offering, professionals: [{ ...createBusinessPartner("Printer"), responsibleId }] }
        };
        function PartnerHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} legalEntityFounders={founders} />;
        }
        render(<PartnerHarness />);
        openTile("Partners & Suppliers", "Partners", "Partner 1");
        return document.querySelector(".floating-card-host")!;
    }

    const responsible = (section: Element) => [...section.querySelectorAll(".business-field-side")]
        .find(field => field.querySelector(".field-label")?.textContent?.startsWith("Responsible"))!;

    it("is called Responsible", () => {
        const section = renderPartner([founder("f1", "Ann"), founder("f2", "Bo")]);
        const field = responsible(section);
        expect(field.querySelector(".field-label")?.textContent).toMatch(/^Responsible/);
        expect(field.querySelector(".field-label")?.textContent).not.toMatch(/Responsibility/);
        expect(field.querySelector(".option-picker-trigger")?.getAttribute("aria-label")).toMatch(/^Printer responsible: /);
    });

    it("is not shown at all in an organization with ONE founder: no label, no text, no empty row (he is still responsible)", () => {
        const section = renderPartner([founder("f1", "Ann")]);
        expect(responsible(section)).toBeUndefined();
        expect(section.textContent).not.toMatch(/Responsib/);
        expect(section.querySelector(".business-capability-automatic")).toBeNull();
        expect(section.querySelector(".business-capability-cost-after")).toBeNull();
        expect(businessPartnerResponsibleId({ responsibleId: "" }, ["f1"])).toBe("f1");
    });

    it("keeps an explicit choice among several founders, and leaves it to the user with several or none", () => {
        const chosen = renderPartner([founder("f1", "Ann"), founder("f2", "Bo")], "f2");
        expect(responsible(chosen).querySelector(".option-picker-trigger")?.textContent).toContain("Bo");
        cleanup();
        const open = renderPartner([founder("f1", "Ann"), founder("f2", "Bo")]);
        expect(responsible(open).querySelector(".option-picker-trigger")?.textContent).toContain("Select");
        expect(responsible(open).querySelector(".business-capability-automatic")).toBeNull();
        cleanup();
        const none = renderPartner([]);
        expect(responsible(none).querySelector(".option-picker")).toBeNull();
        expect(responsible(none).querySelector(".business-capability-automatic")).toBeNull();
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

    it("is not shown at all in an organization with ONE founder, and he is still the responsible one", () => {
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

describe("BusinessCapabilityEditor Offering's Capability resources as boxes", () => {

    it("lays the Resource cards out as closed square boxes, numbered in order, each opening its card", () => {
        const base = asBusinessCapabilityValue(undefined);
        const initial = {
            ...base,
            offering: { ...base.offering, resources: [1, 2, 3, 4].map(n => ({ ...createBusinessResourceSlot(), category: "equipment", group: "production-machinery", name: "R" + n })) }
        };
        function GridHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} />;
        }
        render(<GridHarness />);
        openOfferingResources();
        expect(cardBoxes()).toEqual(["Resource 1: R1", "Resource 2: R2", "Resource 3: R3", "Resource 4: R4"]);
        // The tiles stand in one grid of the page's tile size (215px), no column stacks.
        const grid = document.querySelector(".card-tile-grid") as HTMLElement;
        expect(grid.style.getPropertyValue("--section-tile-size")).toBe("215px");
        expect(document.querySelector(".card-columns")).toBeNull();
        expect(document.querySelector(".business-capability-card-grid")).toBeNull();
        expect(stylesheet("conversation.css")).not.toMatch(/\.business-capability-card-grid/);
    });

    it("draws a Resource tile with its name cut after three lines and, under it, where it belongs, its status and its cost", () => {
        const base = asBusinessCapabilityValue(undefined);
        const slot = { ...createBusinessResourceSlot(), category: "equipment", group: "production-machinery", name: "A name far too long for the box to hold on one line at all", status: "costs" };
        render(<BusinessCapabilityEditor value={{ ...base, offering: { ...base.offering, resources: [slot, { ...createBusinessResourceSlot(), category: "equipment", group: "production-machinery", name: "Other" }] } }} onChange={() => undefined} />);
        openOfferingResources();
        const box = document.querySelector(".card-tile") as HTMLElement;
        expect(box.getAttribute("title")?.startsWith(slot.name)).toBe(true);
        expect([...box.querySelectorAll(".section-tile-list > li")].map(item => item.textContent).slice(1)).toEqual(["Offering's Capability", "Equipment", "Production Machinery", "Costs"]);
        // The list's lines are the page tiles' own (one line each, cut by an ellipsis).
        expect(stylesheet("section-tiles.css")).toMatch(/\.section-tile-list > li \{[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/);
    });

});

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
        openTile("Delivery");
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
        openTile("Delivery");
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
        const tile = tileButton("Delivery");
        const links = [...tile.parentElement!.querySelectorAll<HTMLElement>("button.section-tile-link")];
        expect(links.map(link => link.textContent)).toEqual(["Offering One", "Offering Two"]);
        fireEvent.click(links[1]);
        const card = screen.getByRole("dialog", { name: "Delivery" });
        expect(card.classList.contains("floating-card-host")).toBe(true);
        expect(card.querySelector(".floating-card-caption")!.textContent).toContain("Delivery");
        expect(card.querySelectorAll(".delivery-card")).toHaveLength(1);
        expect(card.querySelector(".strategy-name-static")!.textContent).toBe("Offering Two");
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
        openTile("Delivery");
        openCard("Offering One");
        const card = document.querySelector(".delivery-card")!;
        expect(card.textContent).not.toMatch(/count against their capacity/);
        expect(card.textContent).not.toMatch(/To share the work with an external professional/);
        expect(document.body.textContent).not.toMatch(/The budgets below compare this/);
        // Delivered is a side-label row.
        expect(card.querySelector(".business-field-side")?.textContent).toMatch(/^Delivered/);
    });

});

/** Backs out of whatever is open (a card, its list, the boxes) until the dialog is closed. */
function closeAll() {
    for (let back = 0; back < 4 && screen.queryAllByRole("dialog").length > 0; back++) {
        closeTile();
    }
}

describe("the Responsible tick on a Capability card", () => {

    const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });
    const two = [founder("f1", "Ann"), founder("f2", "Bo")];

    let latest: ReturnType<typeof asBusinessCapabilityValue>;

    function renderCards(founders: typeof two, patch: { activity?: object; partner?: object } = {}) {
        const base = asBusinessCapabilityValue(undefined);
        const initial = {
            ...base,
            activities: [{
                id: OPERATIONAL.id,
                name: "",
                activities: [{ ...createBusinessActivity(), name: "Pack orders", ...patch.activity }]
            }],
            offering: { ...base.offering, professionals: [{ ...createBusinessPartner("Printer"), ...patch.partner }] }
        };
        function TickHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={(next) => { latest = asBusinessCapabilityValue(next); setValue(next); }} legalEntityFounders={founders} />;
        }
        render(<TickHarness />);
    }

    /** Opens a tile and its card; the other tile's card is not drawn while this one is open. */
    function openCards(tile: string, card: string, box?: string) {
        openTile(tile, box, card);
    }

    const openActivity = () => openCards("Operational", "Activity 1");
    const openPartner = () => openCards("Partners & Suppliers", "Partner 1", "Partners");

    const activityTick = () => screen.queryByRole("checkbox", { name: "Activity 1 has a responsible" }) as HTMLInputElement | null;
    const partnerTick = () => screen.queryByRole("checkbox", { name: "Printer has a responsible" }) as HTMLInputElement | null;

    it("is ticked by default, next to the label, with the dropdown (tick, then label, then dropdown)", () => {
        renderCards(two);
        const expectTicked = (tick: HTMLInputElement) => {
            expect(tick.checked).toBe(true);
            const field = tick.closest(".business-foundation-field")!;
            expect(field.firstElementChild?.querySelector("label.business-foundation-tick > input.brand-tick-box")).toBe(tick);
            expect(tick.nextElementSibling?.textContent).toMatch(/^Responsib/);
            expect(field.querySelector(".option-picker")).not.toBeNull();
        };
        openActivity();
        expectTicked(activityTick()!);
        closeAll();
        openPartner();
        expectTicked(partnerTick()!);
    });

    it("unticking removes the field for that card and clears the choice; re-ticking brings the dropdown back empty", () => {
        renderCards(two, { activity: { responsibleId: "f2" }, partner: { responsibleId: "f1" } });
        const untick = (tick: () => HTMLInputElement | null) => {
            fireEvent.click(tick()!);
            expect(tick()!.checked).toBe(false);
            // The tick and its label stay, the dropdown is gone.
            expect(tick()!.closest(".business-foundation-field")!.querySelector(".option-picker")).toBeNull();
            expect(tick()!.closest(".business-foundation-field")!.textContent).toMatch(/Responsib/);
        };
        openActivity();
        untick(activityTick);
        closeAll();
        openPartner();
        untick(partnerTick);
        closeAll();
        expect(latest.activities[0].activities[0]).toMatchObject({ responsibleOff: true, responsibleId: "" });
        expect(latest.offering.professionals[0]).toMatchObject({ responsibleOff: true, responsibleId: "" });

        openActivity();
        fireEvent.click(activityTick()!);
        expect(activityTick()!.checked).toBe(true);
        expect(activityTick()!.closest(".business-foundation-field")!.querySelector(".option-picker-trigger")?.textContent).toContain("Select");
        expect(latest.activities[0].activities[0].responsibleOff).toBeUndefined();
        expect(latest.activities[0].activities[0].responsibleId).toBe("");
    });

    it("starts unticked from a stored responsibleOff, and a card without the key is ticked", () => {
        renderCards(two, { activity: { responsibleOff: true } });
        openActivity();
        expect(activityTick()!.checked).toBe(false);
        closeAll();
        openPartner();
        expect(partnerTick()!.checked).toBe(true);
    });

    it("an unticked activity is not given the founder its single Performer would make responsible", () => {
        renderCards(two, { activity: { performerIds: ["f1"], responsibleOff: true } });
        openActivity();
        expect(activityTick()!.checked).toBe(false);
        expect(activityTick()!.closest(".business-foundation-field")!.querySelector(".business-capability-automatic")).toBeNull();
        expect(businessResponsibleId({ ...createBusinessActivity(), performerIds: ["f1"], responsibleOff: true }, ["f1", "f2"])).toBe("");
    });

    it("shows no tick, no label and no dropdown with ONE founder", () => {
        renderCards([founder("f1", "Ann")] as typeof two);
        openActivity();
        expect(activityTick()).toBeNull();
        expect(document.body.textContent).not.toMatch(/Responsib/);
        closeAll();
        openPartner();
        expect(partnerTick()).toBeNull();
        expect(document.body.textContent).not.toMatch(/Responsib/);
    });

});

describe("BusinessCapabilityEditor founders' share of working hours", () => {

    function renderAnn() {
        function ShareHarness() {
            const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={setValue}
                    legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: ["Weaver"], experience: "" }]}
                />
            );
        }
        render(<ShareHarness />);
        openTile("Founders");
    }

    const note = () => document.querySelector(".business-founder-share");

    it("says only the share of the working hours, without repeating the delivery hours of the field above", () => {
        renderAnn();
        fireEvent.change(screen.getByLabelText(/^Ann working hours/), { target: { value: "160" } });
        fireEvent.change(screen.getByLabelText(/^Ann delivery hours/), { target: { value: "112" } });
        expect(note()?.textContent).toBe("70% of working hours");
        expect(document.body.textContent).not.toMatch(/Delivery hours: 112/);
        expect(note()!.classList.contains("delivery-muted")).toBe(true);
    });

    it("shows nothing while the working hours are blank or 0", () => {
        renderAnn();
        fireEvent.change(screen.getByLabelText(/^Ann delivery hours/), { target: { value: "40" } });
        expect(note()).toBeNull();
        fireEvent.change(screen.getByLabelText(/^Ann working hours/), { target: { value: "0" } });
        expect(note()).toBeNull();
    });

    it("adds the month a weekly Frequency counts to (new information), still without the delivery figure", () => {
        renderAnn();
        fireEvent.click(screen.getByRole("button", { name: /Ann frequency of salary and hours/ }));
        fireEvent.click(screen.getByRole("option", { name: "Weekly" }));
        fireEvent.change(screen.getByLabelText(/^Ann working hours/), { target: { value: "40" } });
        fireEvent.change(screen.getByLabelText(/^Ann delivery hours/), { target: { value: "20" } });
        expect(note()?.textContent).toMatch(/^50% of working hours, about [\d.,]+ a month/);
    });

    it("lays the founder card's head out as the other cards: the number at the body's edge, the name 8px after it", () => {
        const css = stylesheet("section-tiles.css");
        // The number hangs in the marker column (left of the content edge); the name follows at the head's one 8px gap.
        expect(css).toMatch(/\.business-founder-open > \.strategy-box-head > \.strategy-box-number \{[^}]*min-width: calc\(var\(--founder-marker\) - 8px\);/);
        expect(css).toMatch(/\.business-founder-open > \.strategy-box-head > \.strategy-box-number > \.list-number \{[^}]*text-align: left;/);
    });

});
