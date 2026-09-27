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

    it("renders nothing for a single item", () => {
        const { container } = render(<BulletRail items={[items[0]]} activeId="a" onSelect={() => {}} side="right" label="Sections" />);
        expect(container.firstChild).toBeNull();
    });

});
