import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import StrategicPeriodEditor from "./StrategicPeriodEditor";
import StrategicRoadmapEditor from "./StrategicRoadmapEditor";
import {
    StrategicPeriodValue,
    StrategyRangeValue,
    asStrategicPeriodValue,
    asStrategyFoundationValue
} from "../../framework/engine/AnswerUtils";

afterEach(cleanup);

/** A Foundation running January 2027 to December 2029, with one Theme. */
const foundation = asStrategyFoundationValue({
    period: { start: { month: "01", year: "2027" }, end: { month: "12", year: "2029" } },
    themes: [{ id: "theme-1", name: "Growth", description: "" }]
});

/** One Theme, one Goal, and an Objective per period given. */
function periodWith(...periods: StrategyRangeValue[]): StrategicPeriodValue {
    return asStrategicPeriodValue({
        goalsByTheme: {
            "theme-1": [{
                id: "goal-1",
                name: "Goal",
                description: "",
                objectives: periods.map((period, index) => ({
                    id: `objective-${index + 1}`,
                    name: `Objective ${index + 1}`,
                    description: "",
                    period,
                    initiatives: [""],
                    metrics: [],
                    ownerId: ""
                }))
            }]
        }
    });
}

function range(start: [string, string], end: [string, string]): StrategyRangeValue {
    return {
        start: { month: start[0], year: start[1] },
        end: { month: end[0], year: end[1] }
    };
}

describe("StrategicPeriodEditor Objective dates", () => {

    it("clears End when Start moves past it", () => {

        let saved: StrategicPeriodValue | null = null;

        render(
            <StrategicPeriodEditor
                value={periodWith(range(["03", "2027"], ["06", "2027"]))}
                onChange={(next) => { saved = next; }}
                foundation={foundation}
            />
        );

        // The picker opens holding 2027, so choosing a month commits.
        fireEvent.click(screen.getByRole("button", { name: "Start: March 2027" }));
        fireEvent.click(screen.getByRole("button", { name: "Sep" }));

        const objective = saved!.goalsByTheme["theme-1"][0].objectives[0];

        expect(objective.period.start).toEqual({ month: "09", year: "2027" });
        expect(objective.period.end).toEqual({ month: "", year: "" });

    });

    it("keeps End when Start stays before it", () => {

        let saved: StrategicPeriodValue | null = null;

        render(
            <StrategicPeriodEditor
                value={periodWith(range(["03", "2027"], ["06", "2027"]))}
                onChange={(next) => { saved = next; }}
                foundation={foundation}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Start: March 2027" }));
        fireEvent.click(screen.getByRole("button", { name: "May" }));

        const objective = saved!.goalsByTheme["theme-1"][0].objectives[0];

        expect(objective.period.start).toEqual({ month: "05", year: "2027" });
        expect(objective.period.end).toEqual({ month: "06", year: "2027" });

    });

});

describe("StrategicRoadmapEditor Objective bars", () => {

    function bars(container: HTMLElement) {
        return [...container.querySelectorAll(".roadmap-bar")].map(bar => bar.textContent);
    }

    it("draws a bar only for a complete period that runs forwards", () => {

        const { container } = render(
            <StrategicRoadmapEditor
                foundation={foundation}
                period={periodWith(
                    range(["03", "2027"], ["06", "2027"]),
                    range(["03", "2027"], ["", ""]),
                    range(["06", "2027"], ["03", "2027"])
                )}
            />
        );

        expect(bars(container)).toEqual(["1. Objective 1"]);

    });

    it("numbers bars by their own order in the Theme, not the Theme.Goal.Objective path", () => {

        const { container } = render(
            <StrategicRoadmapEditor
                foundation={foundation}
                period={periodWith(
                    range(["03", "2027"], ["06", "2027"]),
                    range(["07", "2027"], ["09", "2027"])
                )}
            />
        );

        expect(bars(container)).toEqual(["1. Objective 1", "2. Objective 2"]);

    });

    it("says the periods fall outside the Strategic Period when they do", () => {

        const { container } = render(
            <StrategicRoadmapEditor
                foundation={foundation}
                period={periodWith(range(["03", "2031"], ["06", "2031"]))}
            />
        );

        expect(bars(container)).toEqual([]);
        expect(container.textContent).not.toContain("has a period yet");
        expect(container.textContent).toContain("outside the Strategic Period");

    });

    it("still says no Objective has a period when none does", () => {

        const { container } = render(
            <StrategicRoadmapEditor
                foundation={foundation}
                period={periodWith(range(["03", "2027"], ["", ""]))}
            />
        );

        expect(container.textContent).toContain("has a period yet");
        expect(container.textContent).not.toContain("outside the Strategic Period");

    });

});
