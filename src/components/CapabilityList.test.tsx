import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import CapabilityList from "./CapabilityList";
import { capabilities } from "../data/capabilities";
import { stylesheet } from "../test/stylesheet";

afterEach(cleanup);

describe("CapabilityList", () => {

    // A selected or hovered Capability goes bold at 5% tracking; each
    // label reserves that width (.hover-width-reserve), so its row and
    // highlight are already wide enough and the label never runs past it.
    it("reserves every label's bold width, so the highlight contains it", () => {
        render(<CapabilityList capabilities={capabilities} activeCapability={capabilities[3].id} onActiveCapabilityChange={() => {}} onCapabilityOpen={() => {}} />);
        capabilities.forEach(capability => {
            const label = screen.getByText(capability.title);
            expect(label.classList.contains("hover-width-reserve")).toBe(true);
            expect(label.getAttribute("data-reserve")).toBe(capability.title);
        });
        const css = stylesheet("global.css");
        expect(css).toContain(".hover-width-reserve::after { content: attr(data-reserve) / \"\";");
        expect(css).toContain("letter-spacing: 0.05em;");
    });

});
