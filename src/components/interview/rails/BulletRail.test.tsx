import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BulletRail from "./BulletRail";

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
        expect(partClasses(screen.getByRole("button", { name: "1. Definition" }))).toEqual(["bullet-rail-label", "bullet-rail-dot"]);

        cleanup();

        render(<BulletRail items={items} activeId="a" onSelect={() => {}} side="right" label="Sections" />);
        expect(partClasses(screen.getByRole("button", { name: "1. Definition" }))).toEqual(["bullet-rail-dot", "bullet-rail-label"]);

    });

    it("puts its name above the bullets, once for assistive technology", () => {

        render(<BulletRail items={items} activeId="a" onSelect={() => {}} side="right" label="Sections" />);

        const nav = screen.getByRole("navigation", { name: "Sections" });
        const title = nav.firstElementChild as HTMLElement;

        expect(title.className).toBe("bullet-rail-title");
        expect(title.textContent).toBe("Sections");
        // The nav's label already names it; the title is not read twice.
        expect(title.getAttribute("aria-hidden")).toBe("true");
        expect(title.nextElementSibling?.className).toBe("bullet-rail-list");

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

    it("renders nothing for a single item", () => {
        const { container } = render(<BulletRail items={[items[0]]} activeId="a" onSelect={() => {}} side="right" label="Sections" />);
        expect(container.firstChild).toBeNull();
    });

});
