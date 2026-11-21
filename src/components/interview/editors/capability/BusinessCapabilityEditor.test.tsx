import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import BusinessCapabilityEditor from "../BusinessCapabilityEditor";
import { cardBoxes, closeAllTiles, closeTile, offeringCard, openCard, openTile, toggles, topDialog } from "../../../../test/interviewTestUtils";
import { BUSINESS_ACTIVITY_CATEGORIES, asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../../../framework/engine/answers/AnswerUtils";
import { stylesheet } from "../../../../test/stylesheet";

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
        expect(screen.queryAllByRole("button", { name: /^(Maximise|Minimise) Founder 1$/ })).toHaveLength(0);

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
        openTile("Capacity & Delivery");
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
            // (The Start and End dates are Calendars, not dropdowns; a one-option dropdown is text; the hours they can give and a lead time are number cells.)
            if (/^(Start|End) date|^Useful life|^Rate override|^Hours a month they can give|^Lead time/.test(field.querySelector(".field-label")?.textContent ?? "") || field.querySelector(".business-capability-static-value")) {
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
        // (Its Hours a month they can give a side-label row too: layout rules section 8, "A field on one row, its cell at its step"; owner, 2026-11-19.)
        expect(sideLabels()).toEqual(["Start date", "End date", "Group", "Responsible", "Hours a month they can give"]);
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
        expect([...box.querySelectorAll(".section-tile-list > li")].map(item => item.textContent).slice(1)).toEqual(["Offering", "Equipment", "Production Machinery", "Costs"]);
        // The list's lines are the page tiles' own (one line each, cut by an ellipsis).
        expect(stylesheet("section-tiles.css")).toMatch(/\.section-tile-list > li \{[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/);
    });

});

describe("BusinessCapabilityEditor starts from Page 1 (phase 5f, 2026-11-09)", () => {

    const founders = [{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }];
    const foundation = { segments: [{ id: "s", name: "Firms", offerings: [
        { id: "offering-1", name: "Build", category: "Service", questions: { o1: ["project"], o3: ["project"], o15: ["weeks"], o10: ["access", "brief"] } },
        { id: "offering-2", name: "Care", category: "Service", questions: { o1: ["ongoing"], o3: ["retainer"] } }
    ] }] };

    function StartHarness({ initial, onValue }: { initial: unknown; onValue?: (next: unknown) => void }) {
        const [value, setValue] = useState<unknown>(initial);
        return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next); }} legalEntityFounders={founders} foundation={foundation} />;
    }

    it("shows Delivered as O3's record, starts Calendar Time from O15, and asks what can hold up delivery (DV12) in place of Constraints", () => {
        render(<StartHarness initial={asBusinessCapabilityValue(undefined)} />);
        openTile("Capacity & Delivery");
        openCard("Build");
        // (DV1 IS O3'S RECORD: one option, read only; owner, 2026-11-17.)
        expect(screen.getByRole("textbox", { name: "Build delivered per unit or every month: Per unit" }).getAttribute("aria-readonly")).toBe("true");
        expect((screen.getByLabelText("Build calendar time, weeks") as HTMLInputElement).value).toBe("4");
        expect(screen.queryByLabelText("Build delivery constraints")).toBeNull();
        expect(screen.getByRole("group", { name: "Build what can hold up delivery" })).toBeTruthy();
    });

    it("starts Every month for a retainer, and saves the start with the first thing written", () => {
        let saved: unknown;
        render(<StartHarness initial={asBusinessCapabilityValue(undefined)} onValue={(next) => { saved = next; }} />);
        openTile("Capacity & Delivery");
        openCard("Care");
        expect(screen.getByRole("textbox", { name: "Care delivered per unit or every month: Every month" }).getAttribute("aria-readonly")).toBe("true");
        fireEvent.change(screen.getByLabelText(/^Ann hours per client a month of Care/), { target: { value: "6" } });
        expect(asBusinessCapabilityValue(saved).delivery["offering-2"]).toMatchObject({ mode: "monthly", hours: { f1: "6" } });
    });

    it("keeps the page's own Delivery over the starts", () => {
        const initial = { ...asBusinessCapabilityValue(undefined), delivery: { "offering-1": { hours: { f1: "40" }, duration: "6", constraints: "", effort: "", deliverers: [], mode: "unit", period: "" } } };
        render(<StartHarness initial={initial} />);
        openTile("Capacity & Delivery");
        openCard("Build");
        expect((screen.getByLabelText("Build calendar time, weeks") as HTMLInputElement).value).toBe("6");
        expect(screen.queryByLabelText("Build delivery constraints")).toBeNull();
    });

});

describe("BusinessCapabilityEditor without a physical item (Questions 2, 11.7; phase 5f)", () => {

    const services = { segments: [{ id: "s", name: "Firms", offerings: [{ id: "offering-1", name: "Build", category: "Service", questions: { o1: ["project"] } }] }] };
    const goods = { segments: [{ id: "s", name: "Homes", offerings: [{ id: "offering-1", name: "Throws", category: "Product", questions: { o1: ["physical"] } }] }] };
    const categoryTiles = () => [...(topDialog()?.querySelectorAll<HTMLElement>("button.section-tile") ?? [])].map(button => (button.getAttribute("aria-label") ?? "").split(",")[0]);

    it("hides Vehicles and Materials & Inventory in the Offering's Resources while every Offering is a service and they hold no card", () => {
        render(<BusinessCapabilityEditor value={asBusinessCapabilityValue(undefined)} onChange={() => undefined} foundation={services} />);
        openTile("Resources");
        expect(categoryTiles()).toContain("Equipment");
        expect(categoryTiles()).not.toContain("Vehicles");
        expect(categoryTiles()).not.toContain("Materials & Inventory");
    });

    it("shows them for a physical item, and shows a category that holds a card whatever the Offerings", () => {
        render(<BusinessCapabilityEditor value={asBusinessCapabilityValue(undefined)} onChange={() => undefined} foundation={goods} />);
        openTile("Resources");
        expect(categoryTiles()).toEqual(expect.arrayContaining(["Vehicles", "Materials & Inventory"]));
        cleanup();
        const base = asBusinessCapabilityValue(undefined);
        const withStock = { ...base, offering: { ...base.offering, resources: [{ ...createBusinessResourceSlot(), category: "materials", group: "materials-stock", name: "Kits" }] } };
        render(<BusinessCapabilityEditor value={withStock} onChange={() => undefined} foundation={services} />);
        openTile("Resources");
        expect(categoryTiles()).toContain("Materials & Inventory");
        expect(categoryTiles()).not.toContain("Vehicles");
    });

});
