import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";

import MissionChoices from "./MissionChoices";
import ValuesChoices from "./ValuesChoices";
import { PB10_LABEL, PB11_LABEL, PB12_LABEL, PB13_LABEL, VALUE_KINDS } from "../../../../framework/engine/choices/MissionChoices";
import lumenText from "../../../../data/examples/lumen-and-loom-studio.json?raw";

/* THE MISSION'S AND THE VALUES' CHOICES ON SCREEN (Questions 9, section 8; PB10 to PB13): a tick writes the draft into an empty text, never into a written one. */
const example = JSON.parse(lumenText) as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> };
const foundation = example.systems["3"].responses.find(response => response.sectionNumber === 1)?.value;

afterEach(cleanup);

let saved: Record<string, unknown> = {};

function Mission({ start }: { start: Record<string, unknown> }) {
    const [value, setValue] = useState(start);
    saved = value;
    return <MissionChoices value={value} onChange={setValue} foundation={foundation} />;
}

function Values({ start }: { start: Record<string, unknown> }) {
    const [value, setValue] = useState(start);
    saved = value;
    return <ValuesChoices value={value} onChange={setValue} />;
}

const tickFirst = (label: string) => {
    const box = within(screen.getByRole("group", { name: label })).getAllByRole("checkbox")[0];
    act(() => { fireEvent.click(box); });
};

describe("the Mission's choices, PB10 to PB12", () => {

    it("draw the three questions from the Business System's Segments, and write the Mission's draft into an empty Mission", () => {
        render(<Mission start={{}} />);
        for (const label of [PB10_LABEL, PB11_LABEL, PB12_LABEL]) expect(screen.getByRole("group", { name: label })).toBeTruthy();
        tickFirst(PB10_LABEL);
        tickFirst(PB11_LABEL);
        expect(saved.mission).toMatch(/^We help /);
    });

    it("never write into a Mission the founder wrote", () => {
        render(<Mission start={{ mission: "Our own words." }} />);
        tickFirst(PB10_LABEL);
        tickFirst(PB11_LABEL);
        expect(saved.mission).toBe("Our own words.");
    });

});

describe("the Values' kinds, PB13", () => {

    it("start a line of the Values for each kind ticked, in empty Values", () => {
        render(<Values start={{}} />);
        tickFirst(PB13_LABEL);
        expect(String(saved.values).trim()).toBe(VALUE_KINDS[0].word + ":");
    });

    it("never write into Values the founder wrote", () => {
        render(<Values start={{ values: "Honesty: we say what we do." }} />);
        tickFirst(PB13_LABEL);
        expect(saved.values).toBe("Honesty: we say what we do.");
    });

});
