import type { CalendarTaskAnnotation } from "./OrganizationService";

/*
    THE APP USER'S OWN CALENDAR (owner, 2026-11-23 15:32 UTC+2: "Place a Calendar option in the Menu, in the landing page. This will be the App Users Calendar. So every
    organization will have its own. and the User will have also its own."): opened from the Landing page's Menu, it holds the user's general notes that stand on a day
    (the Notepad's, made with no Organisation open) and the times and words the user adds to its days. It is kept in this browser, apart from every Organisation's.
*/

/** The Calendar's owner on the Landing page: the user, not an Organisation. */
export const USER_CALENDAR_ID = "app-user";

const KEY = "northstardust-user-calendar";

/** The user's own times and words on the Calendar's dates. */
export function loadUserAnnotations(): Record<string, CalendarTaskAnnotation> {
    try {
        const raw = window.localStorage.getItem(KEY);
        const value = raw ? JSON.parse(raw) : {};
        return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, CalendarTaskAnnotation> : {};
    } catch {
        return {};
    }
}

/** Sets (or, with both blank, clears) one of the user's annotations. */
export function saveUserAnnotation(taskId: string, annotation: CalendarTaskAnnotation): void {
    const all = loadUserAnnotations();
    if (!(annotation.time ?? "").trim() && !(annotation.notes ?? "").trim()) {
        delete all[taskId];
    } else {
        all[taskId] = annotation;
    }
    try {
        window.localStorage.setItem(KEY, JSON.stringify(all));
    } catch {
        // (A browser that keeps nothing: the words last until the Calendar is closed.)
    }
}
