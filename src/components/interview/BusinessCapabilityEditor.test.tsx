import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { asBusinessCapabilityValue } from "../../framework/engine/AnswerUtils";

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
