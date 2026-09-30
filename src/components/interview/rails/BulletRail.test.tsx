import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BulletRail from "./BulletRail";
import { stylesheet } from "../../../test/stylesheet";

const items = [{ id: "a", label: "1. Definition" }, { id: "b", label: "2. Ethics" }];

afterEach(cleanup);

describe("BulletRail", () => {

    it("marks the active bullet as current", () => {
        render(<BulletRail items={items} activeId="b" onSelect={() => {}} side="left" label="Pages" />);
        expect(screen.getByRole("button", { name: "2. Ethics" }).getAttribute("aria-current")).toBe("true");
        expect(screen.getByRole("button", { name: "1. Definition" }).getAttribute("aria-current")).toBeNull();
    });

    it("reports the chosen bullet", () => {
        const onSelect = vi.fn();
        render(<BulletRail items={items} activeId="a" onSelect={onSelect} side="left" label="Pages" />);
        fireEvent.click(screen.getByRole("button", { name: "2. Ethics" }));
        expect(onSelect).toHaveBeenCalledWith("b");
    });

    it("puts the bullet on the side nearest the card", () => {

        const partClasses = (button: HTMLElement) => Array.from(button.children).map(child => child.className);

        render(<BulletRail items={items} activeId="a" onSelect={() => {}} side="left" label="Pages" />);
        expect(partClasses(screen.getByRole("button", { name: "1. Definition" }))).toEqual(["bullet-rail-label", "bullet-rail-dot status-shape"]);

        cleanup();

        render(<BulletRail items={items} activeId="a" onSelect={() => {}} side="right" label="Sections" />);
        expect(partClasses(screen.getByRole("button", { name: "1. Definition" }))).toEqual(["bullet-rail-dot status-shape", "bullet-rail-label"]);

    });

    it("puts its name above the bullets, once for assistive technology", () => {

        render(<BulletRail items={items} activeId="a" onSelect={() => {}} side="right" label="Sections" />);

        const nav = screen.getByRole("navigation", { name: "Sections" });
        const head = nav.firstElementChild as HTMLElement;
        const title = head.querySelector(".bullet-rail-title") as HTMLElement;

        expect(head.className).toBe("bullet-rail-head");
        expect(title.textContent).toBe("Sections");
        // The nav's label already names it; the title is not read twice.
        expect(title.getAttribute("aria-hidden")).toBe("true");
        expect(head.nextElementSibling?.className).toBe("bullet-rail-list");

    });

    it("holds its page arrow on the title row, on the outer side of the name, even with too few items to draw", () => {

        const { container, unmount } = render(
            <BulletRail items={items} activeId="a" onSelect={() => {}} side="right" label="Sections" arrow={<button type="button">›</button>} />
        );
        const head = container.querySelector(".bullet-rail-head")!;
        expect([...head.children].map(child => child.textContent)).toEqual(["Sections", "›"]);
        unmount();

        const left = render(<BulletRail items={items.slice(0, 1)} activeId="a" onSelect={() => {}} side="left" label="Pages" arrow={<button type="button">‹</button>} />);
        expect(left.container.querySelector(".bullet-rail-head")?.firstElementChild?.textContent).toBe("‹");
        expect(left.container.querySelector(".bullet-rail-list")).toBeNull();

    });

    it("stands each label's number in the list-number column, from 1. to 12.", () => {

        const twelve = Array.from({ length: 12 }, (_, index) => ({ id: "s" + index, label: (index + 1) + ". Section " + (index + 1) }));

        render(<BulletRail items={twelve} activeId="s0" onSelect={() => {}} side="right" label="Sections" />);

        const numbers = Array.from(document.querySelectorAll(".bullet-rail-label > .list-number")).map(number => number.textContent);
        expect(numbers).toEqual(twelve.map((_, index) => (index + 1) + "."));
        expect(document.querySelectorAll(".bullet-rail-label > .bullet-rail-label-text")[11].textContent).toBe("Section 12");
        // The button's name is the label as written.
        expect(screen.getByRole("button", { name: "10. Section 10" })).toBeTruthy();

    });

    it("shows what a click will open on hover and on keyboard focus alike", () => {

        render(<BulletRail items={items} activeId="a" onSelect={() => {}} side="left" label="Pages" />);

        // The whole row -- label and bullet -- is one focusable button.
        const row = screen.getByRole("button", { name: "2. Ethics" });
        row.focus();
        expect(document.activeElement).toBe(row);
        expect(row.querySelector(".bullet-rail-label")).not.toBeNull();
        expect(row.querySelector(".bullet-rail-dot")).not.toBeNull();

        // Every hover cue has its focus twin: the link colour, the
        // underline on the label, the grown and coloured bullet.
        const css = stylesheet("bullet-rail.css");
        for (const state of [":hover", ":focus-visible"]) {
            expect(css).toContain(".bullet-rail-item" + state + " .bullet-rail-label");
            expect(css).toContain(".bullet-rail-item" + state + " .bullet-rail-dot");
        }
        expect(css).toContain(".bullet-rail-item:focus-visible { color: var(--text-primary); }");
        expect(css).toContain(".bullet-rail-item:focus-visible .bullet-rail-label .list-number { text-decoration: underline;");
        expect(css).toContain(".bullet-rail-item:focus-visible .bullet-rail-dot { --status-ink: var(--rail-dot-hover);");
        // No transition when the system asks for reduced motion.
        expect(css).toContain("prefers-reduced-motion: reduce) { .bullet-rail-item, .bullet-rail-dot { transition: none; }");

    });

    it("draws each page status as the bullet shape, and says it in the tooltip and the name", () => {

        const pages = [
            { id: "page-1", label: "1. Foundation", status: "defined" as const },
            { id: "page-2", label: "2. Customer Engagement", status: "in-progress" as const },
            { id: "page-3", label: "3. Infrastructure & Capability", status: "not-started" as const }
        ];

        render(<BulletRail items={pages} activeId="page-2" onSelect={() => {}} side="left" label="Pages" />);

        const row = screen.getByRole("button", { name: "2. Customer Engagement: in progress" });

        // No native tooltip repeating the label over the page.
        expect(row.hasAttribute("title")).toBe(false);
        // The active page keeps its active look, its shape inside it.
        expect(row.classList.contains("active")).toBe(true);
        expect(row.querySelector(".bullet-rail-dot")?.getAttribute("data-status")).toBe("in-progress");
        // The narrow layout's tooltip is the label: the word is in it.
        expect(row.querySelector(".bullet-rail-label")?.textContent).toBe("2. Customer Engagement: in progress");

        expect(screen.getByRole("button", { name: "1. Foundation: defined" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "3. Infrastructure & Capability: not started" })).toBeTruthy();

        // Three shapes, not three colours.
        const shapes = stylesheet("status-shape.css");
        expect(shapes).toContain(".status-shape[data-status=\"not-started\"] { border: 2px solid var(--status-ink); background: transparent;");
        expect(shapes).toContain(".status-shape[data-status=\"in-progress\"] { border: 2px solid var(--status-ink); background: linear-gradient(90deg, var(--status-ink) 50%, transparent 50%);");
        expect(shapes).not.toContain("needs-review");

    });

    it("leaves a bullet without a status as it was", () => {

        render(<BulletRail items={items} activeId="a" onSelect={() => {}} side="right" label="Sections" />);

        const row = screen.getByRole("button", { name: "2. Ethics" });

        expect(row.hasAttribute("title")).toBe(false);
        expect(row.querySelector(".bullet-rail-dot")?.hasAttribute("data-status")).toBe(false);
        expect(row.querySelector(".bullet-rail-status-word")).toBeNull();

    });

    it("renders nothing for a single item", () => {
        const { container } = render(<BulletRail items={[items[0]]} activeId="a" onSelect={() => {}} side="right" label="Sections" />);
        expect(container.firstChild).toBeNull();
    });

});
