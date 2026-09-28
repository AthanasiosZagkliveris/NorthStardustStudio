import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";

import StrategicRoadmapEditor from "./StrategicRoadmapEditor";
import {
    ROADMAP_MONTH_WIDTH,
    anchoredScrollLeft,
    monthX,
    trackFraction,
    wheelZoomTarget
} from "./roadmapZoom";
import {
    asStrategicPeriodValue,
    asStrategyFoundationValue,
    monthIndex
} from "../../framework/engine/AnswerUtils";

/** January 2027 to December 2029: 12 quarters, 36 months. */
const foundation = asStrategyFoundationValue({
    period: { start: { month: "01", year: "2027" }, end: { month: "12", year: "2029" } },
    themes: [{ id: "theme-1", name: "Growth", description: "" }]
});

/** One Objective, April to September 2027. */
const period = asStrategicPeriodValue({
    goalsByTheme: {
        "theme-1": [{
            id: "goal-1",
            name: "Goal",
            description: "",
            objectives: [{
                id: "objective-1",
                name: "Objective 1",
                description: "",
                period: { start: { month: "04", year: "2027" }, end: { month: "09", year: "2027" } },
                initiatives: [""],
                metrics: [],
                ownerId: ""
            }]
        }]
    }
});

const spanStart = monthIndex({ month: "01", year: "2027" });

describe("roadmap zoom arithmetic", () => {

    it("zooms in on wheel up and out on wheel down, and only when the level can change", () => {

        expect(wheelZoomTarget("quarters", -100)).toBe("months");
        expect(wheelZoomTarget("quarters", 100)).toBeNull();
        expect(wheelZoomTarget("months", 100)).toBe("quarters");
        expect(wheelZoomTarget("months", -100)).toBeNull();

    });

    it("maps a date to the same share of the track at both levels", () => {

        const start = monthIndex({ month: "04", year: "2027" });
        const end = monthIndex({ month: "09", year: "2027" }) + 1;

        // Quarters: a 1152px track, 32px a month.
        expect(monthX(start, spanStart, 36, 1152)).toBe(96);
        expect(monthX(end, spanStart, 36, 1152) - monthX(start, spanStart, 36, 1152)).toBe(192);

        // Months: 96px a month, so the bar starts on April's column
        // and spans exactly six of them.
        const zoomed = 36 * ROADMAP_MONTH_WIDTH;
        expect(monthX(start, spanStart, 36, zoomed)).toBe(3 * ROADMAP_MONTH_WIDTH);
        expect(monthX(end, spanStart, 36, zoomed) - monthX(start, spanStart, 36, zoomed))
            .toBe(6 * ROADMAP_MONTH_WIDTH);

    });

    it("keeps the moment under the pointer in place when the track widens", () => {

        // Before: a 984px track starting 257px into the roadmap, which
        // sits at x = 56; the pointer at x = 436.
        const roadmapLeft = 56;
        const pointerX = 436;
        const fraction = trackFraction(pointerX, roadmapLeft + 257, 984);

        // After: the track is 3456px wide, still 257px into the content.
        const scrollLeft = anchoredScrollLeft(257, 3456, fraction, pointerX - roadmapLeft);
        const trackLeftAfter = roadmapLeft + 257 - scrollLeft;

        const monthBefore = fraction * 36;
        const monthAfter = ((pointerX - trackLeftAfter) / 3456) * 36;

        expect(Math.abs(monthAfter - monthBefore) * ROADMAP_MONTH_WIDTH).toBeLessThan(1);

    });

});

describe("StrategicRoadmapEditor wheel zoom", () => {

    let now = 1_000_000;

    beforeEach(() => {
        vi.spyOn(Date, "now").mockImplementation(() => now);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    /** A wheel movement over Theme 1's timeline, after any earlier gesture has ended. */
    function wheel(container: HTMLElement, deltaY: number): boolean {
        now += 1000;
        const track = container.querySelector(".roadmap-theme-box .roadmap-track")!;
        return fireEvent.wheel(track, { deltaY });
    }

    function monthsPerYear(container: HTMLElement) {
        return container.querySelectorAll(".roadmap-month").length / 3;
    }

    it("switches to months on wheel up and back to quarters on wheel down", () => {

        const { container } = render(<StrategicRoadmapEditor foundation={foundation} period={period} />);

        expect(container.querySelectorAll(".roadmap-quarter")).toHaveLength(12);
        expect(container.querySelector(".roadmap-zoomed")).toBeNull();

        expect(wheel(container, -100)).toBe(false);

        expect(container.querySelector(".roadmap-zoomed")).not.toBeNull();
        expect(monthsPerYear(container)).toBe(12);
        expect([...container.querySelectorAll(".roadmap-month")].slice(0, 12).map(month => month.textContent))
            .toEqual(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);

        expect(wheel(container, 100)).toBe(false);

        expect(container.querySelector(".roadmap-zoomed")).toBeNull();
        expect(container.querySelectorAll(".roadmap-month")).toHaveLength(0);
        expect([...container.querySelectorAll(".roadmap-quarter")].map(quarter => quarter.textContent).slice(0, 4))
            .toEqual(["Q1", "Q2", "Q3", "Q4"]);

    });

    it("leaves the wheel to the page when the level cannot change", () => {

        const { container } = render(<StrategicRoadmapEditor foundation={foundation} period={period} />);

        // Quarters: down scrolls the page.
        expect(wheel(container, 100)).toBe(true);
        expect(container.querySelector(".roadmap-zoomed")).toBeNull();

        wheel(container, -100);

        // Months: up scrolls the page.
        expect(wheel(container, -100)).toBe(true);
        expect(container.querySelector(".roadmap-zoomed")).not.toBeNull();

    });

    it("makes one step per gesture and adds up small trackpad deltas", () => {

        const { container } = render(<StrategicRoadmapEditor foundation={foundation} period={period} />);
        const track = container.querySelector(".roadmap-theme-box .roadmap-track")!;

        now += 1000;

        // Small deltas: no step until they add up.
        fireEvent.wheel(track, { deltaY: -20 });
        expect(container.querySelector(".roadmap-zoomed")).toBeNull();
        now += 10;
        fireEvent.wheel(track, { deltaY: -20 });
        now += 10;
        fireEvent.wheel(track, { deltaY: -20 });
        expect(container.querySelector(".roadmap-zoomed")).not.toBeNull();

        // The rest of the same gesture is swallowed, not scrolled.
        now += 10;
        expect(fireEvent.wheel(track, { deltaY: -20 })).toBe(false);

    });

    it("ignores the wheel outside the timeline and sideways scrolling", () => {

        const { container } = render(<StrategicRoadmapEditor foundation={foundation} period={period} />);

        now += 1000;
        expect(fireEvent.wheel(container.querySelector(".roadmap-theme-box .roadmap-theme")!, { deltaY: -100 }))
            .toBe(true);

        now += 1000;
        expect(fireEvent.wheel(container.querySelector(".roadmap-theme-box .roadmap-track")!, { deltaY: -100, shiftKey: true }))
            .toBe(true);

        expect(container.querySelector(".roadmap-zoomed")).toBeNull();

    });

    it("places a bar on its months at both levels", () => {

        const { container } = render(<StrategicRoadmapEditor foundation={foundation} period={period} />);

        const bar = () => container.querySelector<HTMLElement>(".roadmap-bar")!;

        // April to September of a 36-month span: 3/36 in, 6/36 wide.
        const left = `${(3 / 36) * 100}%`;
        const width = `${(6 / 36) * 100}%`;

        expect(bar().style.left).toBe(left);
        expect(bar().style.width).toBe(width);

        wheel(container, -100);

        // The same share of a track of 36 month columns, so it starts
        // on April's column and ends with September's.
        expect(container.querySelectorAll(".roadmap-theme-box .roadmap-cell")).toHaveLength(36);
        expect(bar().style.left).toBe(left);
        expect(bar().style.width).toBe(width);

    });

});
