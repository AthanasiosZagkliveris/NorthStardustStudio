import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import StrategicRoadmapEditor from "./StrategicRoadmapEditor";
import { TOOLTIP_EDGE_MARGIN, TOOLTIP_GAP, placeTooltip } from "./roadmapTooltip";
import {
    asStrategicPeriodValue,
    asStrategyFoundationValue
} from "../../framework/engine/AnswerUtils";

afterEach(cleanup);

const foundation = asStrategyFoundationValue({
    period: { start: { month: "01", year: "2027" }, end: { month: "12", year: "2029" } },
    themes: [{ id: "theme-1", name: "Financial Stability", description: "" }]
});

const period = asStrategicPeriodValue({
    goalsByTheme: {
        "theme-1": [{
            id: "goal-1",
            name: "Goal",
            description: "",
            objectives: [{
                id: "objective-1",
                name: "Close the funding gap",
                description: "",
                period: { start: { month: "01", year: "2027" }, end: { month: "06", year: "2027" } },
                initiatives: ["Apply for the loan", "Open a line of credit"],
                metrics: [],
                ownerId: ""
            }]
        }]
    }
});

describe("placeTooltip", () => {

    const viewport = { width: 1000, height: 800 };
    const size = { width: 300, height: 30 };

    it("sits above the element, from where it is first visible", () => {

        const anchor = { left: 100, right: 700, top: 400, bottom: 430 };

        expect(placeTooltip(anchor, size, viewport, 0))
            .toEqual({ left: 100, top: 400 - TOOLTIP_GAP - 30 });

        // Its start scrolled under the Theme names: over what shows.
        expect(placeTooltip(anchor, size, viewport, 260).left).toBe(260);

    });

    it("goes above or below, never beside: on the side with more room, never over the element", () => {

        // Near the top: more room below.
        const high = { left: 100, right: 700, top: 120, bottom: 150 };
        expect(placeTooltip(high, size, viewport, 0).top).toBe(150 + TOOLTIP_GAP);
        // Near the bottom: above.
        const low = { left: 100, right: 700, top: 700, bottom: 730 };
        expect(placeTooltip(low, size, viewport, 0).top).toBe(700 - TOOLTIP_GAP - 30);
        // Always its own left edge, never to the side.
        expect(placeTooltip(high, size, viewport, 0).left).toBe(100);
        // Within a band clear of a fixed header and footer.
        expect(placeTooltip({ left: 100, right: 700, top: 90, bottom: 120 }, size, viewport, 0, { top: 80, bottom: 736 }).top).toBe(120 + TOOLTIP_GAP);

    });

    it("never leaves the window", () => {

        // Too far right: pulled back inside the right edge.
        expect(placeTooltip({ left: 900, right: 990, top: 400, bottom: 430 }, size, viewport, 0).left)
            .toBe(1000 - TOOLTIP_EDGE_MARGIN - 300);

        // Starting off the left edge: held at the margin.
        expect(placeTooltip({ left: -500, right: 200, top: 400, bottom: 430 }, size, viewport, -600).left)
            .toBe(TOOLTIP_EDGE_MARGIN);

        // No room above: below instead.
        expect(placeTooltip({ left: 100, right: 400, top: 10, bottom: 40 }, size, viewport, 0).top)
            .toBe(40 + TOOLTIP_GAP);

    });

});

describe("StrategicRoadmapEditor tooltips", () => {

    it("shows a bar's full name and dates on hover, and hides it on leave", () => {

        const { container } = render(<StrategicRoadmapEditor foundation={foundation} period={period} />);
        const bar = container.querySelector<HTMLElement>(".roadmap-bar")!;

        expect(bar.getAttribute("title")).toBeNull();
        expect(screen.queryByRole("tooltip")).toBeNull();

        fireEvent.mouseEnter(bar);

        const tip = screen.getByRole("tooltip");
        expect(tip.textContent).toBe("1. Close the funding gap · Jan 2027 – Jun 2027");
        expect(bar.getAttribute("aria-describedby")).toBe(tip.id);

        fireEvent.mouseLeave(bar);

        expect(screen.queryByRole("tooltip")).toBeNull();
        expect(bar.getAttribute("aria-describedby")).toBeNull();

    });

    it("shows an Initiative with its Objective's dates on keyboard focus, and Escape hides it", () => {

        const { container } = render(<StrategicRoadmapEditor foundation={foundation} period={period} />);

        fireEvent.click(container.querySelector(".roadmap-bar")!);

        const chip = container.querySelectorAll<HTMLElement>(".roadmap-initiative")[1];

        expect(chip.tabIndex).toBe(0);

        fireEvent.focus(chip);

        expect(screen.getByRole("tooltip").textContent)
            .toBe("2. Open a line of credit · Jan 2027 – Jun 2027");

        fireEvent.keyDown(chip, { key: "Escape" });

        expect(screen.queryByRole("tooltip")).toBeNull();

    });

    it("does not stand in the way of the wheel", () => {

        const { container } = render(<StrategicRoadmapEditor foundation={foundation} period={period} />);
        const bar = container.querySelector<HTMLElement>(".roadmap-bar")!;

        fireEvent.mouseEnter(bar);
        fireEvent.wheel(bar, { deltaY: -100 });

        expect(container.querySelector(".roadmap-zoomed")).not.toBeNull();
        expect(screen.getByRole("tooltip")).toBeTruthy();

    });

});
