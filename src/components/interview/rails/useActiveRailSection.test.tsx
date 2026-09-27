import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, fireEvent } from "@testing-library/react";

import { RAIL_TOP_CLEARANCE, scrollToRailSection, useActiveRailSection } from "./useActiveRailSection";

function Probe({ ids }: { ids: string[] }) {
    const active = useActiveRailSection(ids, "page-1");
    return (
        <>
            <p data-testid="active">{active}</p>
            {ids.map(id => (
                <div key={id} data-rail={id}><input aria-label={"field " + id} /></div>
            ))}
        </>
    );
}

function placeTops(tops: Record<string, number>) {
    document.querySelectorAll<HTMLElement>("[data-rail]").forEach(el => {
        const top = tops[el.dataset.rail!];
        el.getBoundingClientRect = () => ({ top, bottom: top + 100, left: 0, right: 0, width: 0, height: 100, x: 0, y: top, toJSON() {} });
    });
}

afterEach(cleanup);

describe("useActiveRailSection", () => {

    it("starts on the first section", () => {
        render(<Probe ids={["a", "b"]} />);
        expect(screen.getByTestId("active").textContent).toBe("a");
    });

    it("follows the scroll position", () => {
        render(<Probe ids={["a", "b"]} />);
        placeTops({ a: -400, b: 200 });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("b");
    });

    it("follows the focused field", () => {
        render(<Probe ids={["a", "b", "c"]} />);
        fireEvent.focusIn(screen.getByLabelText("field c"));
        expect(screen.getByTestId("active").textContent).toBe("c");
    });

});

describe("scrollToRailSection", () => {

    it("opens a folded section's toggle", () => {
        window.scrollTo = vi.fn();

        const onClick = vi.fn(() => toggle.setAttribute("aria-expanded", "true"));
        document.body.innerHTML = '<div data-rail="x"><div><button class="strategy-box-toggle" aria-expanded="false"></button></div></div>';
        const toggle = document.querySelector<HTMLButtonElement>(".strategy-box-toggle")!;
        toggle.onclick = onClick;

        scrollToRailSection("x");

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    // Chrome cancels an in-progress smooth scroll on a programmatic
    // focus, so the field must be focused BEFORE the scroll starts.
    it("focuses the first field before scrolling it under the header", () => {
        const scrollTo = vi.fn();
        window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
        Object.defineProperty(window, "scrollY", { value: 2100, configurable: true });
        const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
            callback(0);
            return 0;
        });
        const focus = vi.spyOn(HTMLElement.prototype, "focus");

        document.body.innerHTML = '<div data-rail="x"><input aria-label="first" /></div>';
        const section = document.querySelector<HTMLElement>('[data-rail="x"]')!;
        section.getBoundingClientRect = () => ({ top: -634, bottom: 0, left: 0, right: 0, width: 0, height: 634, x: 0, y: -634, toJSON() {} });

        scrollToRailSection("x");

        expect(focus).toHaveBeenCalledTimes(1);
        expect(focus.mock.contexts[0]).toBe(document.querySelector("input"));
        expect(scrollTo).toHaveBeenCalledWith({ top: -634 + 2100 - RAIL_TOP_CLEARANCE, behavior: "smooth" });
        expect(focus.mock.invocationCallOrder[0]).toBeLessThan(scrollTo.mock.invocationCallOrder[0]);

        focus.mockRestore();
        raf.mockRestore();
    });

});
