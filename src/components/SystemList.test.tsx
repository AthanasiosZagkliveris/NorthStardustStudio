import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import SystemList from "./SystemList";
import { systems } from "../data/systems";

afterEach(cleanup);

describe("SystemList", () => {

    // .hover-width-reserve (global.css) reserves each title's bold (hover) width from
    // this attribute, so the highlight never has to grow on hover.
    it("gives every title the text its hover width is reserved from", () => {

        const list = systems.slice(0, 3);

        render(<SystemList systems={list} onSystemClick={() => {}} />);

        list.forEach(system => {
            const title = screen.getByText(system.title);
            expect(title.classList.contains("system-title")).toBe(true);
            expect(title.classList.contains("hover-width-reserve")).toBe(true);
            expect(title.getAttribute("data-reserve")).toBe(system.title);
        });

    });

    it("shows each System's status as the rail's shape and its word", () => {

        const list = systems.slice(0, 4);

        render(
            <SystemList
                systems={list}
                statuses={{ 1: "defined", 2: "in-progress", 3: "not-started", 4: null }}
                onSystemClick={() => {}}
            />
        );

        const row = screen.getByRole("button", { name: /Brand System/ });

        expect(row.textContent).toContain("in progress");
        expect(row.querySelector(".status-shape")?.getAttribute("data-status")).toBe("in-progress");
        expect(screen.getByRole("button", { name: /Identity System/ }).textContent).toContain("defined");
        expect(screen.getByRole("button", { name: /Business System/ }).textContent).toContain("not started");
        // No status known: nothing drawn.
        expect(screen.getByRole("button", { name: /Strategy System/ }).querySelector(".system-status")).toBeNull();

    });

});
