import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen, fireEvent } from "@testing-library/react";

import { RAIL_TOP_CLEARANCE, scrollToRailSection, useActiveRailSection } from "./useActiveRailSection";

function Probe({ ids }: { ids: string[] }) {
    const [active, select] = useActiveRailSection(ids, "page-1");
    return (
        <>
            <p data-testid="active">{active}</p>
            {ids.map(id => (
                <button key={id} type="button" onClick={() => select(id)}>{"select " + id}</button>
            ))}
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

// jsdom lays nothing out, so every page would count as scrolled to
// its bottom: give it a tall one unless a test says otherwise.
beforeEach(() => {
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 10000, configurable: true });
});

afterEach(() => {
    cleanup();
    delete (document.documentElement as { scrollHeight?: number }).scrollHeight;
});

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

    // The spec: the bullet follows the focused field, otherwise the
    // scroll position -- a scroll must not steal it from a visible
    // focused field (e.g. the second column of a shared row).
    it("keeps the focused section on scroll while it is on screen", () => {
        render(<Probe ids={["a", "b", "c"]} />);
        act(() => { screen.getByLabelText("field c").focus(); });
        placeTops({ a: 150, b: 400, c: 500 });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("c");

        act(() => { screen.getByLabelText("field c").blur(); });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("a");
    });

    it("lets the scroll position win once the focused section is off screen", () => {
        render(<Probe ids={["a", "b", "c"]} />);
        act(() => { screen.getByLabelText("field c").focus(); });
        placeTops({ a: 150, b: 400, c: window.innerHeight + 50 });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("a");
    });

    // A rail click pins its bullet through the scroll it starts --
    // otherwise a section sharing a row, or one the page cannot
    // scroll far enough to reach, could never turn green.
    it("keeps a clicked bullet active through the scroll that follows", () => {
        render(<Probe ids={["a", "b", "c"]} />);
        fireEvent.click(screen.getByText("select b"));
        expect(screen.getByTestId("active").textContent).toBe("b");

        placeTops({ a: 150, b: 150, c: 600 });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("b");
    });

    it("releases the pin on a user scroll", () => {
        render(<Probe ids={["a", "b", "c"]} />);
        fireEvent.click(screen.getByText("select b"));

        placeTops({ a: 150, b: 150, c: 600 });
        act(() => { window.dispatchEvent(new Event("wheel")); });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("a");
    });

    it("releases the pin when focus moves into another section", () => {
        render(<Probe ids={["a", "b", "c"]} />);
        fireEvent.click(screen.getByText("select b"));
        fireEvent.focusIn(screen.getByLabelText("field c"));
        expect(screen.getByTestId("active").textContent).toBe("c");
    });

    it("keeps the pin on a scroll key typed into a field", () => {
        render(<Probe ids={["a", "b", "c"]} />);
        fireEvent.click(screen.getByText("select b"));
        fireEvent.keyDown(screen.getByLabelText("field b"), { key: "ArrowDown" });

        placeTops({ a: 150, b: 150, c: 600 });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("b");

        fireEvent.keyDown(document.body, { key: "PageDown" });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("a");
    });

    // At the very bottom the last sections may never climb into the
    // band under the header, so the last one showing its top wins.
    it("hands the bullet to the last visible section at the bottom of the page", () => {
        render(<Probe ids={["a", "b", "c"]} />);
        placeTops({ a: -300, b: 300, c: 500 });
        Object.defineProperty(window, "scrollY", { value: 1000, configurable: true });
        Object.defineProperty(document.documentElement, "scrollHeight", { value: 1000 + window.innerHeight, configurable: true });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("c");

        // Short of the bottom, the usual band under the header rules.
        Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
        act(() => { window.dispatchEvent(new Event("scroll")); });
        expect(screen.getByTestId("active").textContent).toBe("b");

        Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
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

    // A rail click only scrolls: the cursor never lands in a field,
    // so every click behaves the same whether or not the section has
    // one.
    it("scrolls the section under the header without focusing any field", () => {
        const scrollTo = vi.fn();
        window.scrollTo = scrollTo as unknown as typeof window.scrollTo;
        Object.defineProperty(window, "scrollY", { value: 2100, configurable: true });
        const raf = vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
            callback(0);
            return 0;
        });
        const focus = vi.spyOn(HTMLElement.prototype, "focus");

        document.body.innerHTML = '<button type="button">rail</button><div data-rail="x"><input aria-label="first" /></div>';
        const rail = document.querySelector<HTMLButtonElement>("button")!;
        rail.focus();
        focus.mockClear();

        const section = document.querySelector<HTMLElement>('[data-rail="x"]')!;
        section.getBoundingClientRect = () => ({ top: -634, bottom: 0, left: 0, right: 0, width: 0, height: 634, x: 0, y: -634, toJSON() {} });

        scrollToRailSection("x");

        expect(scrollTo).toHaveBeenCalledWith({ top: -634 + 2100 - RAIL_TOP_CLEARANCE, behavior: "smooth" });
        expect(focus).not.toHaveBeenCalled();
        expect(document.activeElement).toBe(rail);

        focus.mockRestore();
        raf.mockRestore();
        Object.defineProperty(window, "scrollY", { value: 0, configurable: true });
    });

});
