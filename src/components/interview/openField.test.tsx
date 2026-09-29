import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { fieldLocation } from "./openField";
import { focusField } from "./jumpTo";
import FieldStatusLine from "./FieldStatusLine";

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    document.body.innerHTML = "";
});

describe("opening a field", () => {

    it("opens the field's System at its page, with the field to focus", () => {
        const location = fieldLocation("1.3:organization/legal-form", ["organization"]);
        expect(location?.pathname).toBe("/introduction");
        expect(location?.state.system.number).toBe(1);
        expect(location?.state.targetSectionNumber).toBe(3);
        expect(location?.state.focusField).toEqual({ key: "1.3:organization/legal-form", anchors: ["organization"] });
        expect(fieldLocation("99.1:x")).toBeNull();
    });

    it("focuses and highlights the field once it is on the page", () => {
        vi.useFakeTimers();
        window.scrollTo = () => undefined;
        const field = document.createElement("div");
        field.dataset.fieldKey = "1.3:organization/legal-form";
        const input = document.createElement("input");
        field.append(input);

        focusField("1.3:organization/legal-form");
        // Not rendered yet: it waits for it.
        vi.advanceTimersByTime(200);
        document.body.append(field);
        vi.advanceTimersByTime(200);

        expect(document.activeElement).toBe(input);
        expect(field.classList.contains("jump-highlight")).toBe(true);
    });

});

describe("the field status line", () => {

    it("says nothing when there is nothing to say", () => {
        const { container } = render(<FieldStatusLine label="Legal Form" />);
        expect(container.textContent).toBe("");
    });

    it("says a scenario's own value, with its reset", () => {
        const reset = vi.fn();
        render(<FieldStatusLine label="Price" changedIn="Slow start" onReset={reset} />);
        expect(screen.getByText(/Changed in Slow start/)).toBeTruthy();
        screen.getByRole("button", { name: "Reset" }).click();
        expect(reset).toHaveBeenCalled();
    });

});
