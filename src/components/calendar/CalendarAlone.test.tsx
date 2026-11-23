import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import OrganizationCalendarPanel, { openCalendar } from "./OrganizationCalendarPanel";
import { OrganizationService } from "../../services/OrganizationService";
import { systems } from "../../data/systems";

afterEach(cleanup);

/** The Calendar alone, as the header holds it on every page but System Selection (owner, 2026-11-21 04:05 UTC+2). */
function renderAlone() {
    const organization = OrganizationService.create("Lumen");
    return render(
        <MemoryRouter>
            <OrganizationCalendarPanel alone organizationId={organization.id} capabilities={[]} systems={systems}
                onCapabilityOpen={() => undefined} onCapabilitySelect={() => undefined} onSystemOpen={() => undefined} />
            <p>Page</p>
        </MemoryRouter>
    );
}

describe("the Calendar opened from the Menu, on the page it is pressed on", () => {

    it("draws nothing until it is asked for, then a side panel as the Notes panel: its title on top with the closing arrow, no handles (owner, 2026-11-22)", () => {
        renderAlone();
        expect(document.querySelector(".org-calendar-panel")).toBeNull();
        act(() => openCalendar());
        expect(document.querySelector(".org-calendar-content-main")).toBeTruthy();
        expect(document.querySelector("aside.org-calendar-side .notepad-head .notepad-title")?.textContent).toBe("Calendar");
        expect(document.querySelectorAll(".org-rail-handle").length).toBe(0);
        fireEvent.click(document.querySelector<HTMLElement>("[aria-label='Close calendar']")!);
        expect(document.querySelector(".org-calendar-panel")).toBeNull();
    });

    it("closes on Escape, and the key goes no further: the page never takes it as Back (the Notes panel's own Escape, useEscapeCloses)", () => {
        renderAlone();
        act(() => openCalendar());
        const page = vi.fn((event: KeyboardEvent) => event.key);
        window.addEventListener("keydown", page);
        fireEvent.keyDown(document.body, { key: "Escape" });
        window.removeEventListener("keydown", page);
        expect(page).not.toHaveBeenCalled();
        expect(document.querySelector(".org-calendar-panel")).toBeNull();
    });

    it("stays open on a press outside it, as the Notes panel does", () => {
        const { getByText } = renderAlone();
        act(() => openCalendar());
        fireEvent.mouseDown(getByText("Page"));
        expect(document.querySelector(".org-calendar-panel")).toBeTruthy();
    });

});
