/*
    OPENING THE CALENDAR from the Menu (ToolsMenu.tsx) on the page it is pressed on: System Selection's rail, or the rail alone the
    header holds elsewhere (OrganizationCalendarPanel.tsx listens for the event). Kept in a file of its own so the Menu, which every
    page's header draws, does not bring the Calendar and everything it reads into the first load.
*/

/** The event the Calendar's rail listens for. */
export const OPEN_CALENDAR = "calendar:open";

/** Opens the Calendar on this page. */
export function openCalendar(): void {
    window.dispatchEvent(new CustomEvent(OPEN_CALENDAR));
}
