import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import BrandStyleEditor, { levelHeight } from "./BrandStyleEditor";
import { typeInto } from "../../test/interviewTestUtils";
import { asBrandStyleValue, brandStyleSectionsEmpty, type BrandStyleAnswerValue } from "../../framework/engine/AnswerUtils";
import { UndoService } from "../../services/UndoService";
import { stylesheet } from "../../test/stylesheet";
import { cardTint, contrastBetween, readColour } from "./brandStyleParts";

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
        // Folded: the name, and the role under it.
        expect(heads[0].querySelector(".business-card-summary")?.textContent).toBe("Primary A");
        // Two colour cards (Primary A, and Secondary A on by default) and one typeface card; the Text Hierarchy is a plain box, no head.
        expect(heads.length).toBe(3);
        expect(container.querySelector(".brand-hierarchy-card .fold-card-head")).toBeNull();

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

describe("BrandStyleEditor Text Hierarchy", () => {

    it("explains every level in one \"i\" on the section's first guidance line, none in the box", () => {
        const { container } = render(<Harness />);
        expect(container.querySelector(".brand-hierarchy-card .info-note")).toBeNull();
        expect(screen.getByRole("button", { name: /Text levels and their sizes/ })).toBeTruthy();
    });

    function h1() {
        return screen.getByLabelText(/^H1 \(Title\) size in pixels/) as HTMLInputElement;
    }

    it("draws each level's name at the size in its box, within its range", () => {

        const { container } = render(<Harness />);

        typeInto(h1(), "40");
        const label = container.querySelector(".brand-hierarchy-row .brand-slot-label") as HTMLElement;
        expect(label.style.fontSize).toBe("40px");

        // Outside the range, the name stays at the range's end.
        typeInto(h1(), "90");
        expect(label.style.fontSize).toBe("48px");

    });

    it("keeps a size within the range its \"i\" states when the box is left, quietly", () => {

        render(<Harness />);

        typeInto(h1(), "90");
        fireEvent.blur(h1());
        expect(h1().value).toBe("48");
        expect(screen.getByRole("status").textContent).toBe("Kept within 36–48 px.");

        typeInto(h1(), "12");
        fireEvent.blur(h1());
        expect(h1().value).toBe("36");

    });

    it("steps by 1 with the arrow keys and the wheel (5 with Shift), within the range", () => {

        render(<Harness />);

        typeInto(h1(), "40");
        fireEvent.keyDown(h1(), { key: "ArrowUp" });
        expect(h1().value).toBe("41");
        fireEvent.keyDown(h1(), { key: "ArrowDown", shiftKey: true });
        expect(h1().value).toBe("36");
        fireEvent.keyDown(h1(), { key: "ArrowDown" });
        expect(h1().value).toBe("36");

        // The wheel only while the box has the focus, and it keeps the page still.
        const idle = new WheelEvent("wheel", { deltaY: -1, bubbles: true, cancelable: true });
        h1().dispatchEvent(idle);
        expect(h1().value).toBe("36");
        h1().focus();
        const turn = new WheelEvent("wheel", { deltaY: -1, bubbles: true, cancelable: true });
        act(() => { h1().dispatchEvent(turn); });
        expect(turn.defaultPrevented).toBe(true);
        expect(h1().value).toBe("37");

    });

    // A stable box: every row as tall as its name at its range's largest
    // size (never under a control), whatever the sizes typed.
    it("fixes each level's row at its largest size, so a size typed moves nothing", () => {

        expect(levelHeight("H1 (Title)", "36–48")).toBe(58);
        expect(levelHeight("Body Text", "16–18")).toBe(45);
        // Two lines at 14px are 34px: a control's 45.
        expect(levelHeight("Captions & Metadata / Interface", "12–14")).toBe(45);

        const { container } = render(<Harness />);
        const rows = () => [...container.querySelectorAll(".brand-hierarchy-row")].map(row => (row as HTMLElement).style.getPropertyValue("--level-height"));
        const before = rows();
        expect(before[0]).toBe("58px");

        typeInto(h1(), "36");
        expect(rows()).toEqual(before);

    });

    it("asks each size in a square box, the value centred", () => {
        const css = stylesheet("conversation.css");
        expect(css).toMatch(/\.brand-style \.brand-size-input\{[^}]*width:var\(--control-square\);\s*height:var\(--control-square\);[^}]*text-align:center;/);
        expect(stylesheet("global.css")).toContain("--control-square: 45px;");
    });

});

describe("BrandStyleEditor optional fields and tint", () => {

    it("asks Usage and Purpose behind a tick", () => {

        render(<Harness />);
        openAll();

        // Filled, Usage loads ticked; the empty typeface's Purpose waits behind its tick.
        expect((screen.getByLabelText("Primary A usage") as HTMLInputElement).value).toBe("Headings");
        expect(screen.queryByLabelText("Primary purpose")).toBeNull();
        const tick = screen.getAllByRole("checkbox").find(box => box.closest(".optional-field")?.textContent?.includes("Purpose"))!;
        fireEvent.click(tick);
        expect(screen.getByLabelText("Primary purpose")).toBeTruthy();

    });

    it("tints a folded colour card no further than keeps its text at 4.5:1", () => {

        const light = { ground: [255, 255, 255] as [number, number, number], texts: [[17, 24, 39], [95, 99, 104]] as [number, number, number][] };
        const dark = { ground: [26, 29, 33] as [number, number, number], texts: [[230, 232, 235], [182, 184, 186]] as [number, number, number][] };
        for (const hex of ["#000000", "#ffffff", "#ffff00", "#1a2b3c", "#e05a2b"]) {
            for (const ink of [light, dark]) {
                const tint = cardTint(hex, ink);
                if (tint) {
                    const ground = readColour(tint)!;
                    ink.texts.forEach(text => expect(contrastBetween(text, ground)).toBeGreaterThanOrEqual(4.5));
                }
            }
        }
        expect(cardTint("#1a2b3c", light)).not.toBeNull();

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
