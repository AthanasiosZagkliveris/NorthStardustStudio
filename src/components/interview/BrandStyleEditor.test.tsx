import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BrandStyleEditor from "./BrandStyleEditor";
import { typeInto } from "../../test/interviewTestUtils";
import { asBrandStyleValue, brandStyleSectionsEmpty, type BrandStyleAnswerValue } from "../../framework/engine/AnswerUtils";
import { UndoService } from "../../services/UndoService";

afterEach(cleanup);


function Harness({ onValue }: { onValue?: (value: BrandStyleAnswerValue) => void }) {
    const [value, setValue] = useState<unknown>(() => {
        const style = asBrandStyleValue(undefined);
        const first = Object.keys(style.hierarchy)[0];
        return {
            ...style,
            colours: style.colours.map((colour, index) => index === 0 ? { ...colour, enabled: true, name: "Loom Blue", hex: "#1a2b3c", usage: "Headings" } : colour),
            hierarchy: { ...style.hierarchy, [first]: { ...style.hierarchy[first], enabled: true } }
        };
    });
    return <BrandStyleEditor value={value} onChange={(next) => { onValue?.(next); setValue(next); }} />;
}

/** Opens every folded card. */
function openAll() {
    for (const arrow of screen.queryAllByRole("button", { name: /^Maximize/ })) {
        fireEvent.click(arrow);
    }
}

describe("BrandStyleEditor limits", () => {

    it("refuses a size over 120 px and anything but hex in a HEX box", () => {

        render(<Harness />);
        openAll();

        const size = screen.getAllByLabelText(/size in pixels/)[0] as HTMLInputElement;
        typeInto(size, "121");
        expect(size.value).toBe("12");

        const hex = screen.getAllByLabelText(/ HEX$/)[0] as HTMLInputElement;
        typeInto(hex, "#1a2g");
        expect(hex.value).toBe("#1a2");
        typeInto(hex, "#1a2b3c4");
        expect(hex.value).toBe("#1a2b3c");

    });

});

describe("BrandStyleEditor cards", () => {

    it("names a colour in its card head and reads it folded, with its role", () => {

        const { container } = render(<Harness />);

        const heads = [...container.querySelectorAll(".brand-style-card .fold-card-head")];
        expect(heads[0].textContent).toContain("Loom Blue");
        expect(heads[0].textContent).toContain("Primary A · #1A2B3C · Headings");
        // Two colour cards (Primary A, and Secondary A on by default), one typeface card, the Text Hierarchy card.
        expect(heads.length).toBe(4);

        openAll();
        expect((screen.getByLabelText("Colour 1 name") as HTMLTextAreaElement).value).toBe("Loom Blue");

    });

    it("adds the next free role, and removes one keeping what it holds, with an undo", () => {

        let saved: BrandStyleAnswerValue | undefined;
        render(<Harness onValue={(value) => { saved = value; }} />);

        fireEvent.click(screen.getByRole("button", { name: "+ Add Colour" }));
        // Primary B: the first role switched off whose prerequisite is on.
        expect(saved?.colours[1].enabled).toBe(true);

        fireEvent.click(screen.getByRole("button", { name: "Remove Colour 1" }));
        // Primary A off, and Primary B with it (it needs A); the values stay.
        expect(saved?.colours[0]).toMatchObject({ enabled: false, name: "Loom Blue", hex: "#1a2b3c", usage: "Headings" });
        expect(saved?.colours[1].enabled).toBe(false);

        expect(UndoService.current()?.message).toBe("Colour 1 removed.");
        UndoService.undo();
        expect(saved?.colours[0]).toMatchObject({ enabled: true, name: "Loom Blue" });
        expect(saved?.colours[1].enabled).toBe(true);

    });

    it("moves a card to another role without losing either role's values", () => {

        let saved: BrandStyleAnswerValue | undefined;
        render(<Harness onValue={(value) => { saved = value; }} />);
        openAll();

        const role = screen.getByRole("button", { name: /^Colour 1 role/ });
        fireEvent.click(role);
        fireEvent.click(screen.getByRole("option", { name: "Neutral A" }));

        expect(saved?.colours[4]).toMatchObject({ enabled: true, name: "Loom Blue", hex: "#1a2b3c" });
        expect(saved?.colours[0].enabled).toBe(false);

    });

});

describe("brandStyleSectionsEmpty", () => {

    function style(hex: string, size: string) {
        const base = asBrandStyleValue(undefined);
        const first = Object.keys(base.hierarchy)[0];
        return {
            ...base,
            colours: base.colours.map((colour, index) => ({ ...colour, enabled: index === 0, hex })),
            hierarchy: Object.fromEntries(Object.entries(base.hierarchy).map(([id, level]) =>
                [id, { ...level, enabled: id === first, size }]))
        };
    }

    it("counts a colour only with a whole HEX, and a size only from 8 px", () => {
        expect(brandStyleSectionsEmpty(style("#1a2b3c", "16"))[0]).toBe(false);
        expect(brandStyleSectionsEmpty(style("#abc", "16"))[0]).toBe(false);
        expect(brandStyleSectionsEmpty(style("#1a2b", "16"))[0]).toBe(true);
        expect(brandStyleSectionsEmpty(style("#1a2b3c", "8"))[2]).toBe(false);
        expect(brandStyleSectionsEmpty(style("#1a2b3c", "7"))[2]).toBe(true);
    });

});
