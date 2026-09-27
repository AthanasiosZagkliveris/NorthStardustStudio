import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import SystemList from "./SystemList";
import { systems } from "../data/systems";

afterEach(cleanup);

describe("SystemList", () => {

    // system-list.css reserves each title's bold (hover) width from
    // this attribute, so the highlight never has to grow on hover.
    it("gives every title the text its hover width is reserved from", () => {

        const list = systems.slice(0, 3);

        render(<SystemList systems={list} onSystemClick={() => {}} />);

        list.forEach(system => {
            const title = screen.getByText(system.title);
            expect(title.classList.contains("system-title")).toBe(true);
            expect(title.getAttribute("data-title")).toBe(system.title);
        });

    });

});
