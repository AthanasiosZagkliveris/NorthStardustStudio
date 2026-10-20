import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import StrategicPeriodEditor from "./editors/StrategicPeriodEditor";
import StrategicRoadmapEditor from "./editors/StrategicRoadmapEditor";
import {
    StrategicPeriodValue,
    StrategyRangeValue,
    asStrategicPeriodValue,
    asStrategyFoundationValue
} from "../../framework/engine/AnswerUtils";

afterEach(cleanup);

/** The page is a tile for each Theme: pressing it opens the Theme's dialog, where its Goal is. */
function openTheme() {
    fireEvent.click(document.querySelector<HTMLElement>(".section-tile")!);
}

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
        openTheme();

        // The calendar opens on 2027, so choosing a month commits.
        fireEvent.click(screen.getByRole("button", { name: "Start: March 2027" }));
        fireEvent.click(screen.getByRole("button", { name: "September 2027" }));

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
        openTheme();

        fireEvent.click(screen.getByRole("button", { name: "Start: March 2027" }));
        fireEvent.click(screen.getByRole("button", { name: "May 2027" }));

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

describe("StrategicPeriodEditor Objective Responsible", () => {

    const founderList = (...names: string[]) => names.map((name, index) => ({ id: "f" + (index + 1), name }));
    const show = (names: string[]) => {
        const result = render(
            <StrategicPeriodEditor value={periodWith(range(["03", "2027"], ["06", "2027"]))} onChange={() => undefined} foundation={foundation} founders={founderList(...names)} />
        );
        openTheme();
        return result;
    };

    it("is the Capability cards' side-label row (label beside a dropdown that takes the row) with several founders", () => {
        show(["Ann", "Bo", "Cy"]);
        const field = document.querySelector(".strategy-objective-when > .business-field-side")!;
        expect(field.querySelector(".field-label")?.textContent).toMatch(/^Responsible/);
        expect(field.querySelector(".option-picker")?.getAttribute("data-size")).toBe("fit");
        expect(document.querySelector(".strategy-objective-when")?.children).toHaveLength(3);
    });

    it("is not shown at all with ONE founder -- no label, no dropdown, no empty row -- and with none", () => {
        for (const names of [["Ann"], []]) {
            const { unmount } = show(names);
            expect(document.body.textContent).not.toMatch(/Responsible/);
            expect(document.querySelector(".strategy-objective-when")?.children).toHaveLength(2);
            unmount();
        }
    });

});

describe("the Responsible tick on a Strategy Objective", () => {

    const founderList = [{ id: "f1", name: "Ann" }, { id: "f2", name: "Bo" }];
    let latest: unknown;

    function Harness() {
        const [value, setValue] = useState<StrategicPeriodValue>(periodWith(range(["03", "2027"], ["06", "2027"])));
        return <StrategicPeriodEditor value={value} onChange={(next) => { latest = next; setValue(next); }} foundation={foundation} founders={founderList} />;
    }

    const tick = () => screen.getByRole("checkbox", { name: "Objective 1 has a responsible" }) as HTMLInputElement;

    it("is ticked by default next to the label; unticking hides the dropdown and stores responsibleOff; re-ticking brings it back empty", () => {
        render(<Harness />);
        openTheme();
        const field = document.querySelector(".strategy-objective-when > .business-field-side")!;
        expect(tick().checked).toBe(true);
        expect(field.firstElementChild?.querySelector("label.business-foundation-tick > input.brand-tick-box")).toBe(tick());
        expect(field.querySelector(".option-picker")).not.toBeNull();

        fireEvent.click(tick());
        expect(tick().checked).toBe(false);
        expect(field.querySelector(".option-picker")).toBeNull();
        expect(field.textContent).toMatch(/^Responsible/);
        expect(JSON.stringify(latest)).toContain("\"responsibleOff\":true");

        fireEvent.click(tick());
        expect(tick().checked).toBe(true);
        expect(field.querySelector(".option-picker-trigger")?.textContent).toContain("Select");
        expect(JSON.stringify(latest)).not.toContain("\"responsibleOff\":true");
    });

    it("shows no tick with ONE founder", () => {
        render(<StrategicPeriodEditor value={periodWith(range(["03", "2027"], ["06", "2027"]))} onChange={() => undefined} foundation={foundation} founders={[founderList[0]]} />);
        expect(screen.queryByRole("checkbox", { name: /has a responsible/ })).toBeNull();
    });

});
