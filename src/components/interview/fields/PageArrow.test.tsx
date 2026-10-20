import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import PageArrow, { pageKey } from "./PageArrow";

afterEach(cleanup);

/** A key press on `target`, as the page's listener sees it. */
function press(key: string, target: Element, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true, ...init });
    Object.defineProperty(event, "target", { value: target });
    return event;
}

describe("the page arrows", () => {

    it("are named Previous page and Next page, drawn with their character as the fallback", () => {
        render(<><PageArrow direction="previous" onClick={() => undefined} /><PageArrow direction="next" onClick={() => undefined} /></>);
        expect(screen.getByRole("button", { name: "Previous page" }).textContent).toBe("‹");
        expect(screen.getByRole("button", { name: "Next page" }).getAttribute("data-direction")).toBe("next");
    });

    it("let ← and → turn the page only where nothing else uses the arrows", () => {
        const { container } = render(
            <div>
                <p>Text</p>
                <input aria-label="Name" />
                <div className="option-picker"><button type="button">Pick</button></div>
                <div role="group" tabIndex={0} aria-label="Goal 1" />
            </div>
        );
        const text = container.querySelector("p")!;
        expect(pageKey(press("ArrowLeft", text))).toBe("previous");
        expect(pageKey(press("ArrowRight", document.body))).toBe("next");
        expect(pageKey(press("ArrowRight", text, { shiftKey: true }))).toBeNull();
        expect(pageKey(press("ArrowDown", text))).toBeNull();
        expect(pageKey(press("ArrowRight", screen.getByLabelText("Name")))).toBeNull();
        expect(pageKey(press("ArrowRight", screen.getByText("Pick")))).toBeNull();
        expect(pageKey(press("ArrowRight", screen.getByRole("group")))).toBeNull();

        // Not under an open search or dialog.
        const overlay = document.createElement("div");
        overlay.className = "search-overlay";
        document.body.appendChild(overlay);
        expect(pageKey(press("ArrowRight", text))).toBeNull();
        overlay.remove();
    });

});
