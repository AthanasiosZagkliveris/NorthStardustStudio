import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TitleTooltips from "./TitleTooltips";
import { useAboveTip } from "./Tooltip";

describe("TitleTooltips", () => {

    afterEach(() => cleanup());

    it("shows a title in the app's tooltip and keeps the name of an icon with no text", () => {
        render(<><TitleTooltips /><button type="button" title="Fold the notes" data-testid="icon" /></>);
        const icon = screen.getByTestId("icon");
        act(() => { fireEvent.pointerOver(icon, { clientX: 10, clientY: 10 }); });
        expect(icon.hasAttribute("title")).toBe(false);
        expect(icon.getAttribute("aria-label")).toBe("Fold the notes");
        expect(screen.getByRole("tooltip").textContent).toBe("Click to hide the notes");
        act(() => { fireEvent.keyDown(document, { key: "Escape" }); });
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("describes, and does not rename, an element that has words of its own", () => {
        render(<><TitleTooltips /><button type="button" title="Adds a note">Add</button></>);
        const button = screen.getByText("Add");
        act(() => { fireEvent.focusIn(button); });
        expect(button.getAttribute("aria-label")).toBeNull();
        expect(button.getAttribute("aria-description")).toBe("Adds a note");
        expect(screen.getByRole("tooltip").textContent).toBe("Adds a note");
    });

    it("shows nothing for what is not a pressed control, and nothing for a control that only repeats its own words", () => {
        render(<><TitleTooltips /><div title="A tile that is only text" data-testid="tile">Words</div><button type="button" title="Add founder" data-testid="same">Add founder</button></>);
        act(() => { fireEvent.pointerOver(screen.getByTestId("tile"), { clientX: 5, clientY: 5 }); });
        expect(screen.queryByRole("tooltip")).toBeNull();
        act(() => { fireEvent.pointerOver(screen.getByTestId("same"), { clientX: 5, clientY: 5 }); });
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("says the name of an icon that has no title", () => {
        render(<><TitleTooltips /><button type="button" aria-label="Frequency: what this means" data-testid="i">i</button></>);
        act(() => { fireEvent.pointerOver(screen.getByTestId("i"), { clientX: 5, clientY: 5 }); });
        expect(screen.getByRole("tooltip").textContent).toBe("Click to learn about Frequency");
    });

    it("gives no second tip to a control that draws its own, and shows one tip at a time (owner, 2026-11-14 12:40)", () => {
        function Own() {
            const tip = useAboveTip<HTMLButtonElement>("Linked to 2 resources");
            return <><button type="button" {...tip.props} aria-label="Linked to 2 resources" data-testid="tag">t</button>{tip.node}</>;
        }
        render(<><TitleTooltips /><Own /><button type="button" aria-label="Remove action 1" data-testid="x">x</button></>);
        act(() => { fireEvent.mouseEnter(screen.getByTestId("tag")); fireEvent.pointerOver(screen.getByTestId("tag"), { clientX: 5, clientY: 5 }); });
        expect(screen.getAllByRole("tooltip").map(tip => tip.textContent)).toEqual(["Linked to 2 resources"]);
        act(() => { fireEvent.pointerOver(screen.getByTestId("x"), { clientX: 5, clientY: 5 }); });
        expect(screen.getAllByRole("tooltip").map(tip => tip.textContent)).toEqual(["Click to remove action 1"]);
    });

    it("has no tip for a control whose pop-up window is open, and takes the tip away when the window opens", async () => {
        render(<><TitleTooltips /><button type="button" aria-label="Open calendar" aria-haspopup="dialog" aria-expanded="false" data-testid="cal">c</button></>);
        const button = screen.getByTestId("cal");
        act(() => { fireEvent.pointerOver(button, { clientX: 5, clientY: 5 }); });
        expect(screen.getByRole("tooltip").textContent).toBe("Click to open calendar");
        await act(async () => { button.setAttribute("aria-expanded", "true"); await Promise.resolve(); });
        expect(screen.queryByRole("tooltip")).toBeNull();
        act(() => { fireEvent.pointerOver(button, { clientX: 5, clientY: 5 }); });
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("has no tip for a dropdown cell, whose value is on it", () => {
        render(<><TitleTooltips /><button type="button" aria-haspopup="listbox" title="United Kingdom" data-testid="dd"><span>United Kingdom</span></button></>);
        act(() => { fireEvent.pointerOver(screen.getByTestId("dd"), { clientX: 5, clientY: 5 }); });
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("gives a Back button that shows only its arrow (its word hidden in a narrow window) a tooltip", () => {
        render(<><TitleTooltips /><button type="button" aria-label="Back" data-testid="back"><span aria-hidden="true" /><span style={{ display: "none" }}>Back</span></button></>);
        const back = screen.getByTestId("back");
        act(() => { fireEvent.pointerOver(back, { clientX: 10, clientY: 10 }); });
        expect(screen.getByRole("tooltip").textContent).toBe("Click to go back");
    });

    it("says the whole title of a tile whose title is cut short by an ellipsis, and nothing for one that fits", () => {
        render(<><TitleTooltips /><button type="button" data-testid="tile"><span title="Segment Description of the people" data-testid="part">Segment Desc...</span></button></>);
        const part = screen.getByTestId("part");
        Object.defineProperty(part, "scrollWidth", { configurable: true, value: 200 });
        Object.defineProperty(part, "clientWidth", { configurable: true, value: 100 });
        part.style.overflowX = "hidden";
        act(() => { fireEvent.pointerOver(part, { clientX: 10, clientY: 10 }); });
        expect(screen.getByRole("tooltip").textContent).toBe("Segment Description of the people");
        act(() => { fireEvent.keyDown(document, { key: "Escape" }); });
        Object.defineProperty(part, "scrollWidth", { configurable: true, value: 100 });
        act(() => { fireEvent.pointerOver(part, { clientX: 11, clientY: 11 }); });
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

});
