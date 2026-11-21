import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import StrategyFoundationEditor from "./StrategyFoundationEditor";
import { sectionRailItems } from "../rails/railItems";
import { AnswerType } from "../../../framework/enums/AnswerType";
import type { AnswerDefinition } from "../../../framework/model/AnswerDefinition";
import { SW1_CHANGES, changeEffectLines } from "../../../framework/engine/choices/StrategyChoices";
import { openTile } from "../../../test/interviewTestUtils";

afterEach(cleanup);

describe("StrategyFoundationEditor data-rail markers", () => {

    it("marks every sub-section with the id the section rail expects", () => {

        const { container } = render(
            <StrategyFoundationEditor value={undefined} onChange={() => {}} />
        );

        const ids = [...container.querySelectorAll("[data-rail]")].map(
            element => element.getAttribute("data-rail")
        );

        const expected = sectionRailItems(
            { type: AnswerType.StrategyFoundation } as AnswerDefinition
        ).map(item => item.id);

        expect(ids).toEqual(expected);

    });

});

describe("the SWOT's starts", () => {

    it("show a rated change's line once, though the saved starts already hold it (round of 2026-11-20 18:35 UTC+2, batch C)", () => {
        const [first] = SW1_CHANGES;
        const line = changeEffectLines({ [first.id]: 5 }).opportunities[0];
        render(
            <StrategyFoundationEditor
                value={{ changeEffects: { [first.id]: 5 } }}
                onChange={() => {}}
                swotStarts={{ opportunities: [line], threats: [] }}
            />
        );
        openTile("SWOT Analysis");
        // (Counted in the quadrant's list itself: SW2 also offers the line as a tick.)
        const lines = [...document.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(".strategy-swot-quadrant textarea, .strategy-swot-quadrant input[type=text]")].map(field => field.value);
        expect(lines.filter(value => value === line).length).toBe(1);
    });

});

describe("SW2, Which of these fit you?", () => {

    it("writes a ticked suggestion into its quadrant's list and keeps the founder's own lines (Questions 21, section 10)", () => {
        let saved: Record<string, unknown> = {};
        render(
            <StrategyFoundationEditor
                value={{ swot: { strengths: ["Three founders"], weaknesses: [], opportunities: [], threats: [] }, swotEdited: ["strengths"] }}
                onChange={(next) => { saved = next as unknown as Record<string, unknown>; }}
                swotSuggestions={{ strengths: ["Breaks even in Jun 2027"], weaknesses: [], opportunities: [], threats: [] }}
            />
        );
        openTile("SWOT Analysis");
        fireEvent.click(screen.getByRole("checkbox", { name: "Which of these fit you? Strengths: Breaks even in Jun 2027" }));
        expect((saved.swot as Record<string, string[]>).strengths).toEqual(["Three founders", "Breaks even in Jun 2027"]);
    });

});
