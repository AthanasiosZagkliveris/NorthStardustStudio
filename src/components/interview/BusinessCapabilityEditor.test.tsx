import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { BUSINESS_ACTIVITY_CATEGORIES, asBusinessCapabilityValue, createBusinessActivity } from "../../framework/engine/AnswerUtils";

function Harness() {
    const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
    return <BusinessCapabilityEditor value={value} onChange={setValue} />;
}

const toggles = (pattern: RegExp) =>
    screen.getAllByRole("button", { name: pattern }).filter(b => b.classList.contains("strategy-box-toggle"));

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

    it("puts the activity list's Expand all on the Active row", () => {

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
        expect(head.textContent).toMatch(/Active 2/);

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
                    legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""] }]}
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
