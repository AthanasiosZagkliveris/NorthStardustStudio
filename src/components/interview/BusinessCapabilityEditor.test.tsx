import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor, { withDerivedActivity } from "./BusinessCapabilityEditor";
import { toggles } from "../../test/interviewTestUtils";
import { BUSINESS_ACTIVITY_CATEGORIES, asBusinessCapabilityValue, createBusinessActivity, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";

function Harness() {
    const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
    return <BusinessCapabilityEditor value={value} onChange={setValue} />;
}


afterEach(cleanup);

describe("BusinessCapabilityEditor folding", () => {

    it("opens each newly added Resource and leaves earlier ones folded", () => {

        render(<Harness />);

        const add = () => fireEvent.click(screen.getAllByRole("button", { name: /\+ Add Resource/ })[0]);
        add();
        add();

        const resources = toggles(/Resource \d+$/);
        expect(resources[resources.length - 1].getAttribute("aria-expanded")).toBe("true");

    });

    it("keeps structural sections open by default", () => {

        render(<Harness />);

        toggles(/Resources$|Activities$/).forEach(t => expect(t.getAttribute("aria-expanded")).toBe("true"));

    });

    // Completed activities live in their own folded list, so "Expand
    // all" counts only the active ones -- and one active activity is
    // too few for the control to show at all.
    it("counts only active activities for Expand all", () => {

        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: BUSINESS_ACTIVITY_CATEGORIES[0].id,
                name: "",
                activities: [
                    { ...createBusinessActivity(), name: "Open" },
                    { ...createBusinessActivity(), name: "Done", completed: true }
                ]
            }]
        };

        function ValueHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} />;
        }

        render(<ValueHarness />);

        expect(screen.getByText("Active 1")).toBeTruthy();
        expect(screen.queryByRole("button", { name: "Expand all activities" })).toBeNull();

    });

    // The shared folding-card head (.fold-card-head): the summary on a
    // row of its own, the head's last child, and the name as text.
    it("puts a folded activity's summary on its own row under its name", () => {

        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: BUSINESS_ACTIVITY_CATEGORIES[0].id,
                name: "",
                activities: [
                    { ...createBusinessActivity(), name: "Review", description: "Weekly numbers review" },
                    { ...createBusinessActivity(), name: "Plan" }
                ]
            }]
        };

        function ValueHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} />;
        }

        render(<ValueHarness />);

        const summary = screen.getByText("Weekly numbers review");
        const head = summary.parentElement!;

        expect(head.classList.contains("fold-card-head")).toBe(true);
        expect(head.lastElementChild).toBe(summary);
        expect(screen.queryByRole("textbox", { name: "Activity 1 name" })).toBeNull();
        expect(screen.getByText("Review").classList.contains("strategy-name-static")).toBe(true);

    });

    // "Expand all" sits on its group's own title row, never on a line
    // of its own -- so the Professionals column's cards start level
    // with the Providers column beside it, toggle or not.
    it("puts a partner group's Expand all on its title row", () => {

        render(<Harness />);

        const add = () => fireEvent.click(screen.getAllByRole("button", { name: "+ Add Professional" })[0]);
        add();
        add();

        const toggle = screen.getAllByRole("button", { name: /^(Expand|Collapse) all professionals$/ })[0];
        const head = toggle.parentElement!;

        expect(head.classList.contains("fold-group-head")).toBe(true);
        expect(head.firstElementChild).not.toBe(toggle);
        expect(head.textContent).toMatch(/Professionals/);

        // The Providers column, with no toggle, has the same title row.
        const providersColumn = screen.getAllByRole("button", { name: "+ Add Provider" })[0].closest(".business-capability-column")!;
        expect(providersColumn.querySelector(":scope > .fold-group-head")).not.toBeNull();

    });

    // On the group's own title row, as every Expand all is -- not on
    // the "Active N" line under it.
    it("puts the activity list's Expand all on its category's title row", () => {

        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: BUSINESS_ACTIVITY_CATEGORIES[0].id,
                name: "",
                activities: [
                    { ...createBusinessActivity(), name: "One" },
                    { ...createBusinessActivity(), name: "Two" }
                ]
            }]
        };

        function ValueHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} />;
        }

        render(<ValueHarness />);

        const head = screen.getByRole("button", { name: "Expand all activities" }).parentElement!;

        expect(head.classList.contains("fold-group-head")).toBe(true);
        expect(head.textContent).toMatch(new RegExp("^1\\. " + BUSINESS_ACTIVITY_CATEGORIES[0].label));
        expect(head.textContent).not.toMatch(/Active/);

    });

    it("folds Resource cards again on reload, once they are no longer newly added", () => {

        let latest: unknown = asBusinessCapabilityValue(undefined);

        function ReloadHarness({ initial }: { initial: unknown }) {
            const [value, setValue] = useState<unknown>(initial);
            latest = value;
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={(next) => { setValue(next); latest = next; }}
                />
            );
        }

        const { unmount } = render(<ReloadHarness initial={latest} />);

        const add = () => fireEvent.click(screen.getAllByRole("button", { name: /\+ Add Resource/ })[0]);
        add();
        add();

        unmount();

        // A fresh mount from the saved value -- as a page reload would
        // see it -- starts with no fold state of its own: both Resource
        // cards added above should now be closed.
        render(<ReloadHarness initial={latest} />);

        const resources = toggles(/Resource \d+$/);
        expect(resources.length).toBe(2);
        resources.forEach(t => expect(t.getAttribute("aria-expanded")).toBe("false"));

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

        const card = toggles(/(Founder 1|Ann)$/)[0];
        if (card.getAttribute("aria-expanded") === "false") {
            fireEvent.click(card);
        }

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

    // Completed rows cannot be reordered, so they offer no drag: a
    // drag begun on one must never move an active row instead.
    it("does not let a completed row be dragged onto the active list", () => {

        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: BUSINESS_ACTIVITY_CATEGORIES[0].id,
                name: "",
                activities: [
                    { ...createBusinessActivity(), name: "Alpha" },
                    { ...createBusinessActivity(), name: "Beta" },
                    { ...createBusinessActivity(), name: "Done", completed: true }
                ]
            }]
        };

        let saved: unknown = initial;

        function ValueHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={(next) => { saved = next; setValue(next); }}
                />
            );
        }

        const { container } = render(<ValueHarness />);

        fireEvent.click(screen.getByRole("button", { name: "Completed 1" }));

        const row = (name: string) =>
            screen.getByText(name).closest(".business-capability-activity") as HTMLElement;

        const done = row("Done");
        const beta = row("Beta");
        const dataTransfer = { setData: () => {}, effectAllowed: "", dropEffect: "" };

        expect(done.querySelector(".business-capability-handle")).toBeNull();

        const handle = done.querySelector(".strategy-box-number");
        if (handle) {
            fireEvent.mouseDown(handle);
        }
        fireEvent.dragStart(done, { dataTransfer });
        fireEvent.dragOver(beta, { dataTransfer });
        fireEvent.drop(beta, { dataTransfer });

        const names = asBusinessCapabilityValue(saved).activities[0].activities.map(entry => entry.name);
        expect(names).toEqual(["Alpha", "Beta", "Done"]);
        expect(container.querySelector(".strategy-drop-target")).toBeNull();

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

        const { container } = renderWith(
            {
                ...asBusinessCapabilityValue(undefined),
                delivery: { "offering-1": { hours: { f1: "2,5" }, mode: "unit" } }
            },
            { segments: [{ offerings: [{ id: "offering-1", name: "Offering One" }] }] }
        );

        const line = container.querySelector(".delivery-total")?.textContent ?? "";
        expect(line).toContain("Total: 2.5 h per unit");

    });

    it("reads a resource's price as the engine does for its total", () => {

        const { container } = renderWith({
            ...asBusinessCapabilityValue(undefined),
            resources: {
                utilities: [{
                    id: "electricity",
                    name: "",
                    slots: [{
                        id: "slot-1", name: "Power", quantity: "2", description: "",
                        status: "costs", cost: cost("12,5"), providerId: "", offeringIds: []
                    }]
                }]
            }
        });

        fireEvent.click(toggles(/(Resource 1|Power)$/)[0]);

        expect(totals(container).some(line => /^Total: 2 × \D*12\.50 = \D*25$/.test(line))).toBe(true);

    });

    it("reads a chosen provider's price as the engine does", () => {

        const { container } = renderWith({
            ...asBusinessCapabilityValue(undefined),
            providers: [{
                id: "p1", name: "PowerCo", description: "", responsibleId: "",
                cost: cost("12,5"), offeringIds: []
            }],
            resources: {
                utilities: [{
                    id: "electricity",
                    name: "",
                    slots: [{
                        id: "slot-1", name: "Power", quantity: "", description: "",
                        status: "provided", cost: cost(""), providerId: "p1", offeringIds: []
                    }]
                }]
            }
        });

        fireEvent.click(toggles(/(Resource 1|Power)$/)[0]);

        expect(totals(container).some(line => /12\.50 monthly, priced on its card/.test(line))).toBe(true);

    });

    it("asks a resource's Quantity at Costs only, after the Status, and keeps it hidden otherwise", () => {

        const slot = {
            id: "slot-1", name: "Power", quantity: "3", description: "",
            status: "provided", cost: cost(""), providerId: "", offeringIds: []
        };
        const { unmount } = renderWith({
            ...asBusinessCapabilityValue(undefined),
            resources: { utilities: [{ id: "electricity", name: "", slots: [slot] }] }
        });
        fireEvent.click(toggles(/(Resource 1|Power)$/)[0]);
        expect(screen.queryByLabelText("Resource 1 quantity")).toBeNull();
        unmount();

        renderWith({
            ...asBusinessCapabilityValue(undefined),
            resources: { utilities: [{ id: "electricity", name: "", slots: [{ ...slot, status: "costs", cost: cost("5") }] }] }
        });
        fireEvent.click(toggles(/(Resource 1|Power)$/)[0]);
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
        const card = toggles(/(Founder 1|Ann)$/)[0];
        if (card.getAttribute("aria-expanded") === "false") {
            fireEvent.click(card);
        }
        return () => asBusinessCapabilityValue(saved);
    }

    it("asks one Frequency for the salary and both hours", () => {

        const saved = renderWith();

        const labels = [...document.querySelectorAll(".business-founder-grid .field-label")].map(label => label.textContent?.replace(/i$/, "").trim());
        expect(labels.slice(1)).toEqual(["Frequency", "Working Hrs", "Delivery Hrs"]);
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

        const roles = [...document.querySelectorAll(".numbered-list-static li")].map(item => item.textContent);
        expect(roles).toEqual(["Director", "Designer"]);
        expect(screen.queryByLabelText(/roles/i)).toBeNull();
        expect(saved().founders[0].roles).toEqual(["Director", "Designer"]);

    });

    it("reads the roles a Legal Entity saved before the Founders Profile existed", () => {

        renderWith(undefined);

        const roles = [...document.querySelectorAll(".numbered-list-static li")].map(item => item.textContent);
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
                id: BUSINESS_ACTIVITY_CATEGORIES[0].id,
                name: "",
                activities: names.map((name, index) => ({ ...createBusinessActivity(), name, completed: index < completed }))
            }]
        };
        function ValueHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} legalEntityFounders={[ann]} />;
        }
        const view = render(<ValueHarness />);
        const card = toggles(/(Founder 1|Ann)$/)[0];
        if (card.getAttribute("aria-expanded") === "false") {
            fireEvent.click(card);
        }
        return view;
    }

    const lines = (container: HTMLElement) =>
        [...container.querySelectorAll(".business-capability-responsibilities-head ~ div .numbered-list-static-text")].map(line => line.textContent);

    it("counts what is done of all of them, beside the label", () => {
        const { container } = renderWith(["A", "B", "C", "D", "E", "F", "G"], 3);
        expect(container.querySelector(".business-capability-responsibilities-count")?.textContent).toBe("Completed 3/7");
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
        expect(lines(container)).toEqual(["C", "D"]);
        const completed = container.querySelector<HTMLButtonElement>("[aria-controls=responsibilities-done-f1]")!;
        expect(completed.getAttribute("aria-expanded")).toBe("false");
        fireEvent.click(completed);
        expect(lines(container)).toEqual(["C", "D", "A", "B"]);
        // Numbered on from the list above.
        const done = container.querySelectorAll(".business-capability-completed .numbered-list-static");
        expect(done[done.length - 1].getAttribute("start")).toBe("3");
        expect(container.querySelector(".business-capability-responsibilities-count")?.textContent).toBe("Completed 2/4");
    });

    it("starts a list of five or fewer open", () => {
        const { container } = renderWith(["A", "B", "C", "D", "E"], 0);
        expect(screen.getByRole("button", { name: /^Minimize Responsibilities of (Ann|Founder 1)$/ }).getAttribute("aria-expanded")).toBe("true");
        expect(lines(container)).toHaveLength(5);
        expect(container.querySelector(".business-capability-responsibilities-count")?.textContent).toBe("Completed 0/5");
    });

    it("has no arrow and no count while there is nothing to list", () => {
        const { container } = renderWith([], 0);
        expect(screen.queryByRole("button", { name: /Responsibilities of/ })).toBeNull();
        expect(container.querySelector(".business-capability-responsibilities-count")).toBeNull();
    });

});

describe("an activity a resource's status creates", () => {

    const slot = { ...createBusinessResourceSlot(), id: "resource-loom", name: "Warping mill" };

    it("is the sole founder's, as Performer and Responsibility", () => {
        const next = withDerivedActivity(asBusinessCapabilityValue(undefined), "infrastructure", slot, "investigation", ["f1"]);
        const created = next.activities.flatMap(category => category.activities).find(activity => activity.sourceId === slot.id)!;
        expect(created).toMatchObject({ name: "Investigate Warping mill", performerIds: ["f1"], responsibleId: "f1" });
    });

    it("is left for the person to assign where there are several founders", () => {
        const next = withDerivedActivity(asBusinessCapabilityValue(undefined), "infrastructure", slot, "activity", ["f1", "f2"]);
        const created = next.activities.flatMap(category => category.activities).find(activity => activity.sourceId === slot.id)!;
        expect(created).toMatchObject({ name: "Set up Warping mill", performerIds: [], responsibleId: "" });
    });

});
