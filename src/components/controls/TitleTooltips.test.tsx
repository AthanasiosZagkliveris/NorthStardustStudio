import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import TitleTooltips from "./TitleTooltips";

describe("TitleTooltips", () => {

    afterEach(() => cleanup());

    it("shows a title in the app's tooltip and keeps the name of an icon with no text", () => {
        render(<><TitleTooltips /><button type="button" title="Fold the notes away" data-testid="icon" /></>);
        const icon = screen.getByTestId("icon");
        act(() => { fireEvent.pointerOver(icon, { clientX: 10, clientY: 10 }); });
        expect(icon.hasAttribute("title")).toBe(false);
        expect(icon.getAttribute("aria-label")).toBe("Fold the notes away");
        expect(screen.getByRole("tooltip").textContent).toBe("Fold the notes away");
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

});
