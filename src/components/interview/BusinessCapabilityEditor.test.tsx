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
