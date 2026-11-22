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

describe("the SWOT by the ratings (owner, 2026-11-22 21:23 UTC+2: \"Fix the SWOT using the rating system\")", () => {

    it("writes a rated change's line straight into the Opportunities or the Threats, moves it with the rating, and asks no tick for it", () => {
        const [first] = SW1_CHANGES;
        const help = changeEffectLines({ [first.id]: 5 }).opportunities[0];
        const hurt = changeEffectLines({ [first.id]: 1 }).threats[0];
        let saved: Record<string, unknown> = {};
        const swot = { strengths: [], weaknesses: [], opportunities: ["Retailer interest"], threats: ["Rising prices"] };
        const { rerender } = render(
            <StrategyFoundationEditor
                value={{ swot, swotEdited: ["opportunities", "threats"], changeEffects: { [first.id]: 0 } }}
                onChange={(next) => { saved = next as unknown as Record<string, unknown>; }}
                choices={{ stage: "plan", changeStarts: [first.id], segments: [], reachBeyond: false }}
                swotSuggestions={{ strengths: [], weaknesses: [], opportunities: [help], threats: [hurt] }}
            />
        );
        openTile("SWOT Analysis");
        const rating = (point: number) => document.querySelectorAll<HTMLInputElement>("input[type=radio][name='strategy-change-effects-" + first.id + "']")[point - 1];
        const shown = () => [...document.querySelectorAll<HTMLTextAreaElement | HTMLInputElement>(".strategy-swot-quadrant textarea, .strategy-swot-quadrant input[type=text]")].map(field => field.value);
        const again = () => rerender(
            <StrategyFoundationEditor
                value={saved}
                onChange={(next) => { saved = next as unknown as Record<string, unknown>; }}
                choices={{ stage: "plan", changeStarts: [first.id], segments: [], reachBeyond: false }}
                swotSuggestions={{ strengths: [], weaknesses: [], opportunities: [help], threats: [hurt] }}
            />
        );
        fireEvent.click(rating(5));
        again();
        expect(shown()).toContain(help);
        expect(shown()).not.toContain(hurt);
        fireEvent.click(rating(1));
        again();
        expect(shown()).toContain(hurt);
        expect(shown()).not.toContain(help);
        expect(shown()).toEqual(expect.arrayContaining(["Retailer interest", "Rising prices"]));
        // (The rating is the answer: no "Which of these fit you?" tick repeats it.)
        expect(screen.queryByRole("checkbox", { name: new RegExp("Which of these fit you\? .*" + first.label.toLowerCase()) })).toBeNull();
    });

});
