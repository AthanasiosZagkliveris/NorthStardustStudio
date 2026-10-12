/**
 * THE PERIODS OF THE CALENDAR'S FUNNEL: Today, Tomorrow, This week, Next week, This month, This year, Xmas, and the periods the user sets (a name, a first and a last
 * day), kept for each Organization on this machine. A week runs Sunday to Saturday, as the Calendar's grid does.
 */

export interface CalendarPeriod {
    id: string;
    label: string;
    /** ISO "YYYY-MM-DD", the first and the last day (the same for a day). */
    from: string;
    to: string;
    /** Made by the user (it can be removed). */
    custom?: boolean;
}

const pad = (value: number) => String(value).padStart(2, "0");
const iso = (date: Date) => date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
const parse = (text: string) => new Date(Number(text.slice(0, 4)), Number(text.slice(5, 7)) - 1, Number(text.slice(8, 10)));
const shifted = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/** The ready-made periods, counted from `today` (an ISO day). */
export function presetPeriods(today: string): CalendarPeriod[] {
    const now = parse(today);
    const weekStart = shifted(now, -now.getDay());
    const year = now.getFullYear();
    // Xmas, the 24th to the 26th of December: this year's until it has passed, then next year's.
    const xmasYear = iso(now) > year + "-12-26" ? year + 1 : year;
    return [
        { id: "today", label: "Today", from: today, to: today },
        { id: "tomorrow", label: "Tomorrow", from: iso(shifted(now, 1)), to: iso(shifted(now, 1)) },
        { id: "this-week", label: "This week", from: iso(weekStart), to: iso(shifted(weekStart, 6)) },
        { id: "next-week", label: "Next week", from: iso(shifted(weekStart, 7)), to: iso(shifted(weekStart, 13)) },
        { id: "this-month", label: "This month", from: year + "-" + pad(now.getMonth() + 1) + "-01", to: iso(new Date(year, now.getMonth() + 1, 0)) },
        { id: "this-year", label: "This year", from: year + "-01-01", to: year + "-12-31" },
        { id: "xmas", label: "Xmas", from: xmasYear + "-12-24", to: xmasYear + "-12-26" }
    ];
}

const key = (organizationId: string) => "ns-calendar-periods-" + organizationId;

export function loadCustomPeriods(organizationId: string): CalendarPeriod[] {
    try {
        const raw = window.localStorage.getItem(key(organizationId));
        const list = raw ? JSON.parse(raw) : [];
        return Array.isArray(list)
            ? list.filter(entry => entry && typeof entry.id === "string" && typeof entry.label === "string" && /^\d{4}-\d{2}-\d{2}$/.test(entry.from) && /^\d{4}-\d{2}-\d{2}$/.test(entry.to))
                .map(entry => ({ id: entry.id, label: entry.label, from: entry.from, to: entry.to, custom: true }))
            : [];
    } catch {
        return [];
    }
}

export function saveCustomPeriods(organizationId: string, periods: readonly CalendarPeriod[]): void {
    try {
        window.localStorage.setItem(key(organizationId), JSON.stringify(periods.map(({ id, label, from, to }) => ({ id, label, from, to }))));
    } catch {
        // (A browser that keeps nothing: the periods last until the Calendar is closed.)
    }
}

/** A period made from what the user typed: the first day before the last, a name or the two days as its name. */
export function newCustomPeriod(label: string, from: string, to: string): CalendarPeriod | null {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        return null;
    }
    const [first, last] = from <= to ? [from, to] : [to, from];
    return { id: "custom-" + Date.now().toString(36), label: label.trim() || first + " to " + last, from: first, to: last, custom: true };
}
