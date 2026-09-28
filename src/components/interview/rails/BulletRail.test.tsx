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

    it("renders nothing for a single item", () => {
        const { container } = render(<BulletRail items={[items[0]]} activeId="a" onSelect={() => {}} side="right" label="Sections" />);
        expect(container.firstChild).toBeNull();
    });

});
