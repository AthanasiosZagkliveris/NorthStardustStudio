import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TitleTooltips from "./TitleTooltips";

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

    it("has no tip for a dropdown cell, whose value is on it", () => {
        render(<><TitleTooltips /><button type="button" aria-haspopup="listbox" title="United Kingdom" data-testid="dd"><span>United Kingdom</span></button></>);
        act(() => { fireEvent.pointerOver(screen.getByTestId("dd"), { clientX: 5, clientY: 5 }); });
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

});
