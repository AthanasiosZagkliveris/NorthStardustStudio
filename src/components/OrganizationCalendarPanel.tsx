import { useEffect, useRef, useState } from "react";

import AddButton from "./controls/AddButton.tsx";
import RadioChoice from "./controls/RadioChoice.tsx";
import TextLink from "./interview/fields/TextLink.tsx";
import NavArrow from "./controls/NavArrow.tsx";
import { CalendarTaskAnnotation, OrganizationService } from "../services/OrganizationService";
import { NotepadService } from "../services/NotepadService";
import { CalendarTask, getCalendarTasks } from "../services/CalendarTaskService";
import { DateFormat, PreferencesService } from "../services/PreferencesService.ts";
import { isoToDisplay } from "./interview/fields/DateCellInput.tsx";
import NotesField from "./interview/fields/NotesField.tsx";
import CalendarFunnel, { CALENDAR_INCLUDES } from "./CalendarFunnel.tsx";
import { CARD_DATE_KINDS, type CardDateKind } from "../framework/engine/CalendarCardDates.ts";
import { type CalendarPeriod, loadCustomPeriods, presetPeriods, saveCustomPeriods } from "../services/CalendarPeriods.ts";

import { Capability } from "../types/capability";
import { FrameworkSystem } from "../types/system";
import { getCapabilityColor } from "../data/capabilities";

import "../styles/organization-calendar.css";
import "../styles/system-confirmation.css";

interface OrganizationCalendarPanelProps {

    /**
     * The currently selected Organization -- the Calendar is an
     * Organization-wide concept (its tasks are derived fresh from
     * every System's own saved data, see CalendarTaskService.ts;
     * only the lightweight per-task annotations -- time + notes --
     * live on the Organization document itself, see
     * OrganizationService's task-annotation methods), not tied to
     * any one System/Section, so this is the only thing the panel
     * needs from its host page. Rendered as nothing at all when
     * there isn't one yet (e.g. mid-navigation), the same "nothing
     * selected yet" guard every other Organization-scoped piece of
     * UI already follows.
     */
    organizationId: string | null;

    /**
     * Every Capability, in the same order System Selection's own
     * sidebar (`CapabilityList.tsx`) presents them in -- the
     * Capabilities flyout below just lists them in this order,
     * unfiltered/unsorted.
     */
    capabilities: Capability[];

    /**
     * Every System across every Capability, in flat numerical
     * order (not grouped by Capability) -- the Systems flyout
     * below sorts defensively by `number` regardless of the
     * order it's given in.
     */
    systems: FrameworkSystem[];

    /**
     * Opens the SAME Capability description window System
     * Selection's own sidebar opens on a click -- this rail is a
     * second entry point to that one dialog, not a second dialog.
     */
    onCapabilityOpen: (capability: Capability) => void;

    /**
     * Marks a Capability "active" -- the SAME thing the sidebar's
     * own click does alongside opening the dialog (see
     * CapabilityList.tsx's onClick, which fires both). Without
     * this, picking a Capability from the rail would open its
     * dialog but leave the main page's own System list showing
     * whatever Capability (if any) was already active, which
     * isn't "as it does now when we press on the capability".
     */
    onCapabilitySelect: (capabilityId: string) => void;

    /**
     * Opens the chosen System immediately -- the SAME thing a
     * System tile's own click does on System Selection's main page
     * (see SystemSelection.tsx's `handleSystemSelection`): navigates
     * straight into its interview, resuming wherever it was last
     * left. There is no confirmation step to open a second entry
     * point to anymore; this rail is just another way to trigger
     * the same immediate navigation.
     */
    onSystemOpen: (system: FrameworkSystem) => void;

    /**
     * Jumps straight into a specific System's specific Section --
     * the Calendar's own "Open" link on a task (see
     * CalendarTaskService.ts), so someone looking at a date can go
     * straight to whatever Table row or Operational Log entry
     * actually produced it. Optional: the link only renders when
     * this is provided.
     */
    onOpenTask?: (systemNumber: number, sectionNumber: number) => void;

    /**
     * Reports whenever this rail's own flyout opens or closes
     * (any of the 3 handles), so the host page can fold that into
     * its own Escape-key handling ("Escape closes whichever
     * sliding/pop-up window is open, then acts as Back") without
     * this component needing to know anything about Escape or
     * Back itself.
     */
    onOpenChange?: (open: boolean) => void;

    /**
     * Bumping this (to any new value) force-closes the rail's
     * flyout from the OUTSIDE -- e.g. the host page's own Escape
     * handler. A plain boolean would work just as well right up
     * until the rail is already closed and Escape is pressed
     * again with nothing else open; a monotonically-changing
     * signal always re-fires the effect, a repeated `false` would
     * not.
     */
    closeSignal?: number;

    /**
     * True while a "child window" this rail itself opened -- the
     * "Start Interview" confirmation or the Capability description
     * dialog, both reachable from a click inside this rail's own
     * Systems/Capabilities flyout -- is still open. Those dialogs
     * render as their own full-page overlays, OUTSIDE this rail's
     * own DOM subtree, so a plain click-outside-closes-the-rail
     * check would otherwise see every click inside them as "outside
     * the rail" and close it out from under the dialog it just
     * opened. While this is true, every one of this rail's own
     * close triggers (mouse leaving, focus leaving, clicking
     * outside) is suppressed -- the rail only closes once the child
     * dialog itself closes and the mouse/focus/click genuinely
     * leaves afterward.
     */
    suppressClose?: boolean;

}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_LABELS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

// A day cell only has room for so many indicator dots before it
// starts fighting the day number for space -- beyond this many
// tasks on one date, the rest collapse into a small "+N" badge
// instead (still counted, never silently dropped).
//
// Three rather than four: the dots now sit in a row beside each
// other rather than stacked (see `.org-calendar-day-dots`), so
// what limits them is the cell's WIDTH, shared with the "+N"
// badge that appears the moment they are limited at all.
const MAX_VISIBLE_DOTS = 3;

// Which of the rail's flyouts (if any) is currently showing in
// the shared content pane -- `null` means the rail is fully
// collapsed to just its three handles.
type RailTab = "calendar" | "capabilities" | "systems" | null;

function pad2(value: number): string {
    return String(value).padStart(2, "0");
}

function toIsoDate(year: number, month: number, day: number): string {
    return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function todayIso(): string {
    const now = new Date();
    return toIsoDate(now.getFullYear(), now.getMonth(), now.getDate());
}

/** Every task landing on exactly `iso` -- every discovered task is a single specific date, never a range. */
function tasksOnDate(tasks: CalendarTask[], iso: string): CalendarTask[] {
    return tasks.filter(task => task.date === iso);
}

// A schedule-derived task's own taskId always ends in "-YYYY-MM-DD"
// (see CalendarTaskService.ts's own construction) -- stripping
// exactly that trailing 11 characters ("-" + 10-digit ISO date)
// leaves the stable part every occurrence of the SAME recurring
// Process/SOP shares, regardless of which specific date this one
// occurrence landed on. Used to find "every other occurrence of
// this recurring task" when offering to apply a Time to all of
// them (see handleTimeChange below).
function recurringSeriesPrefix(taskId: string): string {
    return taskId.slice(0, Math.max(0, taskId.length - 11));
}

// Only these three presets get the "apply to every occurrence"
// prompt, per the user's own explicit list -- Weekly/Bi-Weekly/
// Quarterly/Annually/Custom recurring tasks keep their own
// independent per-occurrence Time instead.
const RECURRING_TIME_PROMPT_FREQUENCIES = ["Daily", "Monthly", "Semi-Annually"];

/**
 * A slide-in navigation rail docked to the left edge of the
 * window, between the fixed AppHeader and AppFooter (never
 * covering either one) -- System Selection page only. Three
 * independently-hoverable/focusable handles stack vertically down
 * the rail (Calendar / Capabilities / System); hovering OR
 * keyboard-focusing one opens its own flyout in the shared pane to
 * its right, closing again once the mouse/focus leaves the whole
 * rail:
 *
 *   - Calendar: READ-ONLY and auto-filled -- the Organization's
 *     own month grid, marking every date that has a Date-typed
 *     value ANYWHERE in ANY of this Organization's Systems (see
 *     CalendarTaskService.ts -- every Operational Log entry's
 *     date, every "...Date" Table column's value), each with a dot
 *     indicator in that task's own System's Capability color.
 *     Clicking a day lists that day's tasks (origin + what they're
 *     about, read-only) -- the only thing editable per task is a
 *     time-of-day + a free-text note layered on top of it (see
 *     OrganizationService.setTaskAnnotation); there is no way to
 *     add a whole new task from here. Also carries the date-
 *     display preference (US MM/DD/YYYY vs EU DD/MM/YYYY) -- the
 *     same shared, app-wide setting (PreferencesService) every
 *     other Date field in the app reads.
 *   - Capabilities: every Capability, in the same order System
 *     Selection's own sidebar presents them. Clicking one opens
 *     the same Capability description dialog the sidebar's own
 *     click already opens, AND marks that Capability active on the
 *     main page too -- full parity with the sidebar's own click,
 *     not just a shortcut to the dialog.
 *   - Systems: every System across every Capability, in flat
 *     numerical order. Clicking one opens that System immediately,
 *     the same thing a System tile's own click does on the main
 *     page -- again, a second way to reach the same action, not a
 *     duplicate.
 *
 * Each handle's own flyout is rendered as its own DOM sibling
 * (`.org-calendar-content`, absolutely positioned so it always
 * appears in the same place regardless of which handle it's
 * attached to -- see organization-calendar.css) immediately
 * following THAT handle, not bundled after all three handles --
 * that's what makes Tab, not just a mouse, able to reach a flyout's
 * own items right after its handle instead of skipping over the
 * remaining handles first.
 */
export default function OrganizationCalendarPanel({

    organizationId,
    capabilities,
    systems,
    onCapabilityOpen,
    onCapabilitySelect,
    onSystemOpen,
    onOpenTask,
    onOpenChange,
    closeSignal,
    suppressClose

}: OrganizationCalendarPanelProps) {

    const [activeTab, setActiveTab] = useState<RailTab>(null);

    const panelRef = useRef<HTMLDivElement | null>(null);

    /**
     * Holds the "apply to every other occurrence?" question while
     * it's showing -- which sibling task ids it would apply `time`
     * to on confirmation. `null` means the dialog is closed. A
     * custom in-app dialog (rendered further down, styled like
     * every other popup in the app -- see `.confirmation-overlay`/
     * `.confirmation-dialog` in system-confirmation.css) instead of
     * the browser's own `window.confirm`, which renders as a
     * generic OS dialog bearing the dev server's own address
     * ("localhost:1420 says") -- jarringly out of place next to the
     * app's own styled pop-ups. See `handleTimeChange` below for
     * where this gets set.
     */
    const [timeConfirmPrompt, setTimeConfirmPrompt] = useState<{ time: string; siblingTaskIds: string[]; howOften: string } | null>(null);

    // While the "apply to every occurrence?" dialog is open, none of
    // the rail's usual close triggers (mouse leaving, focus leaving,
    // clicking outside) should fire -- same reasoning as the existing
    // `suppressClose` prop (see its own doc comment above): the
    // dialog renders centered on the whole viewport (`.confirmation-
    // overlay` is `position:fixed; inset:0`), so reaching its own
    // buttons routinely means moving the pointer OFF of the rail's
    // own on-screen box, which would otherwise read as "the mouse
    // left the rail" and close it out from under the dialog it just
    // opened.
    const suppressCloseForFlyout = suppressClose || timeConfirmPrompt !== null;

    /**
     * True for the duration of a mousedown -- cleared on the very
     * next tick. Lets the panel's own `onBlur` below (see its doc
     * comment) tell "focus just shifted because of a click that's
     * ALSO being handled by the mousedown listener below" apart from
     * "focus shifted because of Tab/Shift+Tab, with no click
     * involved at all" -- the only case `onBlur` itself actually
     * needs to react to.
     */
    const mouseDownInProgressRef = useRef(false);

    useEffect(() => {

        function markMouseDown() {

            mouseDownInProgressRef.current = true;

            // Any blur/focusout this mousedown itself triggers (by
            // shifting focus away from whatever was previously
            // focused, e.g. clicking a plain <div> that can't take
            // focus) fires synchronously, within this same tick --
            // clearing the flag on the next tick keeps it from ever
            // masking a LATER, genuinely separate blur (e.g. a Tab
            // press with no click involved).
            setTimeout(() => {
                mouseDownInProgressRef.current = false;
            }, 0);

        }

        document.addEventListener("mousedown", markMouseDown, true);

        return () => document.removeEventListener("mousedown", markMouseDown, true);

    }, []);

    // Clicking anywhere outside the rail closes its flyout, same as
    // clicking outside any other popup/sliding window in the app --
    // except while `suppressCloseForFlyout` is true (a child dialog
    // this rail itself opened -- either the caller's own `suppressClose`
    // prop, or this component's own Time-confirm dialog above -- is
    // still showing). Pressing INSIDE any of the 3 sliding cards --
    // Calendar, Capabilities, or Systems -- never closes it, no
    // matter what's clicked (a day, blank space, plain text, it
    // doesn't matter); only a genuinely outside click, Escape (see
    // `closeSignal` above), or the cursor actually leaving the rail
    // (see the panel's own `onMouseLeave` below) closes it.
    useEffect(() => {

        if (activeTab === null) {
            return;
        }

        function handlePointerDown(event: MouseEvent) {

            if (suppressCloseForFlyout) {
                return;
            }

            const target = event.target as HTMLElement | null;

            if (!target) {
                return;
            }

            const outsidePanel = !(panelRef.current && panelRef.current.contains(target));

            if (outsidePanel) {
                setActiveTab(null);
            }

        }

        document.addEventListener("mousedown", handlePointerDown);

        return () => document.removeEventListener("mousedown", handlePointerDown);

    }, [activeTab, suppressCloseForFlyout]);

    useEffect(() => {

        onOpenChange?.(activeTab !== null);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    useEffect(() => {

        if (closeSignal === undefined) {
            return;
        }

        setActiveTab(null);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [closeSignal]);

    const [tasks, setTasks] = useState<CalendarTask[]>([]);
    const [annotations, setAnnotations] = useState<Record<string, CalendarTaskAnnotation>>({});

    const today = todayIso();
    const [viewYear, setViewYear] = useState(() => Number(today.slice(0, 4)));
    const [viewMonth, setViewMonth] = useState(() => Number(today.slice(5, 7)) - 1);

    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // THE FUNNEL: the period listed (none: the month grid alone), the periods the user made, and the kinds of card date shown (the recommended ones to begin with).
    const [periodId, setPeriodId] = useState<string | null>(null);
    const [customPeriods, setCustomPeriods] = useState<CalendarPeriod[]>([]);
    const [kinds, setKinds] = useState<ReadonlySet<CardDateKind>>(() => new Set(CARD_DATE_KINDS.filter(kind => kind.recommended).map(kind => kind.id)));
    // Which cards the dates are included from (all to begin with).
    const [includes, setIncludes] = useState<ReadonlySet<string>>(() => new Set(CALENDAR_INCLUDES.map(entry => entry.id)));
    // A note (a time and words) is made only when the user asks for one, on a new date or one already recorded.
    const [notesOpen, setNotesOpen] = useState<ReadonlySet<string>>(new Set());
    useEffect(() => {
        setCustomPeriods(organizationId ? loadCustomPeriods(organizationId) : []);
    }, [organizationId]);

    const [dateFormat, setDateFormat] = useState<DateFormat>(PreferencesService.getDateFormat());

    useEffect(() => {

        return PreferencesService.subscribe(() => {
            setDateFormat(PreferencesService.getDateFormat());
        });

    }, []);

    function reloadTasks() {

        if (!organizationId) {
            setTasks([]);
            setAnnotations({});
            return;
        }

        setTasks(getCalendarTasks(organizationId));
        setAnnotations(OrganizationService.getTaskAnnotations(organizationId));

    }

    useEffect(() => {

        reloadTasks();

        // Also re-scan every time the Calendar tab is actually
        // opened -- Table rows / Operational Log entries can
        // change from elsewhere in the app (a different System
        // entirely) between one glance at the Calendar and the
        // next, and this stays cheap (localStorage reads, no
        // network) even opened often.

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationId, activeTab === "calendar"]);

    function updateAnnotation(taskId: string, patch: { time?: string; notes?: string }): void {

        if (!organizationId) {
            return;
        }

        const next = { ...(annotations[taskId] ?? {}), ...patch };

        OrganizationService.setTaskAnnotation(organizationId, taskId, next);

        setAnnotations(previous => ({ ...previous, [taskId]: next }));

    }

    /**
     * Setting a Time on a Daily/Monthly/Semi-Annually task (the
     * user's own explicit list -- every other recurring frequency,
     * and any non-recurring task, always keeps its own independent
     * Time) offers to copy that SAME time onto every other
     * occurrence of that same recurring Process/SOP -- most people
     * setting "9:00 AM" on one occurrence mean the whole series, not
     * just that one date. The clicked task's own Time always applies
     * immediately either way; only the SIBLINGS' Time waits on the
     * dialog's answer (see `timeConfirmPrompt` above).
     */
    function handleTimeChange(task: CalendarTask, time: string): void {

        updateAnnotation(task.taskId, { time });

        if (time.trim().length === 0 || !task.howOften || !RECURRING_TIME_PROMPT_FREQUENCIES.includes(task.howOften)) {
            return;
        }

        const seriesPrefix = recurringSeriesPrefix(task.taskId);

        const siblingTaskIds = tasks
            .filter(candidate => candidate.taskId !== task.taskId && candidate.taskId.startsWith(`${seriesPrefix}-`))
            .map(candidate => candidate.taskId);

        if (siblingTaskIds.length === 0) {
            return;
        }

        setTimeConfirmPrompt({ time, siblingTaskIds, howOften: task.howOften });

    }

    /** Applies the pending `timeConfirmPrompt`'s time to every sibling occurrence, then closes the dialog. */
    function confirmApplyTimeToSiblings(): void {

        if (!timeConfirmPrompt) {
            return;
        }

        timeConfirmPrompt.siblingTaskIds.forEach(siblingTaskId => updateAnnotation(siblingTaskId, { time: timeConfirmPrompt.time }));

        setTimeConfirmPrompt(null);

    }

    if (!organizationId) {
        return null;
    }

    function goToMonth(delta: number) {

        let nextMonth = viewMonth + delta;
        let nextYear = viewYear;

        if (nextMonth < 0) {
            nextMonth = 11;
            nextYear -= 1;
        } else if (nextMonth > 11) {
            nextMonth = 0;
            nextYear += 1;
        }

        setViewMonth(nextMonth);
        setViewYear(nextYear);

    }

    function selectDay(iso: string) {

        setSelectedDate(iso);

    }

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();

    const cells: Array<{ day: number; iso: string } | null> = [];

    for (let blank = 0; blank < firstWeekday; blank++) {
        cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ day, iso: toIsoDate(viewYear, viewMonth, day) });
    }

    while (cells.length % 7 !== 0) {
        cells.push(null);
    }

    // Always pad out to a full 6-row grid (42 cells), not just the
    // nearest multiple of 7 -- most months only need 5 rows (or 4),
    // but a handful (any 31-day month starting on a Friday or
    // Saturday, e.g. August 2026) need 6. Leaving the grid at
    // whatever row count each month actually needs made the whole
    // Calendar flyout visibly grow/shrink height as you navigated
    // between months, and made a 6-row "today" month look
    // noticeably bigger than its 5-row neighbors right when the
    // panel first opens. Padding every month out to the same fixed
    // 6 rows (with the extra trailing cells rendered blank, same as
    // the leading ones) keeps the grid -- and the whole panel -- an
    // identical size no matter which month is showing.
    while (cells.length < 42) {
        cells.push(null);
    }

    // (Card dates of a kind the funnel leaves out are not shown; every other task always is.)
    const shown = tasks.filter(task => !task.kind || (kinds.has(task.kind) && CALENDAR_INCLUDES.some(entry => includes.has(entry.id) && (!task.noun || entry.nouns.includes(task.noun)) && (task.noun !== undefined))));
    const periods = [...presetPeriods(today), ...customPeriods];
    const period = periods.find(candidate => candidate.id === periodId) ?? null;
    const periodTasks = period
        ? shown.filter(task => task.date >= period.from && task.date <= period.to).sort((one, other) => one.date.localeCompare(other.date) || one.description.localeCompare(other.description))
        : [];

    function choosePeriod(id: string | null) {
        setPeriodId(id);
        const chosen = periods.find(candidate => candidate.id === id);
        if (chosen) {
            setViewYear(Number(chosen.from.slice(0, 4)));
            setViewMonth(Number(chosen.from.slice(5, 7)) - 1);
        }
    }

    const selectedDateTasks = selectedDate ? tasksOnDate(shown, selectedDate) : [];

    const orderedSystems = [...systems].sort((a, b) => a.number - b.number);

    // The one shared flyout pane -- which of the three bodies below
    // actually renders is driven entirely by `activeTab`, so it's
    // safe to drop this same element under whichever handle is
    // currently active (see the 3 handle groups in the JSX below);
    // only one of those three placements is ever non-empty at once.
    const flyoutContent = (

        <div
            className={
                "org-calendar-content" +
                (activeTab === "calendar" ? " org-calendar-content-main" : "") +
                (activeTab === "capabilities" || activeTab === "systems" ? " org-calendar-content-child" : "")
            }
        >

            {activeTab === "calendar" && (

                <>

                    {/*
                        The single, app-wide date-presentation
                        control -- moved out of the cramped
                        header pill into its own full-width,
                        clearly-labeled row so it's the first
                        thing anyone opening this flyout
                        notices, not something they have to
                        spot in a corner. This is now the ONLY
                        place that setting can be changed from
                        (the Operational Log's own in-table
                        toggle was removed -- see
                        OperationalLogEditor.tsx).
                    */}
                    <div className="org-calendar-date-format-row">

                        <span className="org-calendar-date-format-label">Date presentation</span>

                        <RadioChoice
                            label="Date presentation"
                            group="org-calendar-date-format"
                            options={[{ id: "US", label: "MM/DD (US)" }, { id: "EU", label: "DD/MM (EU)" }]}
                            value={dateFormat}
                            onChange={(next) => PreferencesService.setDateFormat(next)}
                        />

                    </div>

                    <CalendarFunnel
                        periods={periods}
                        periodId={periodId}
                        onPeriod={choosePeriod}
                        onAddPeriod={(made) => {
                            const next = [...customPeriods, made];
                            setCustomPeriods(next);
                            if (organizationId) {
                                saveCustomPeriods(organizationId, next);
                            }
                        }}
                        onRemovePeriod={(id) => {
                            const next = customPeriods.filter(candidate => candidate.id !== id);
                            setCustomPeriods(next);
                            if (periodId === id) {
                                setPeriodId(null);
                            }
                            if (organizationId) {
                                saveCustomPeriods(organizationId, next);
                            }
                        }}
                        kinds={kinds}
                        onKinds={setKinds}
                        includes={includes}
                        onIncludes={setIncludes}
                    />

                    <div className="org-calendar-month-nav">

                        <NavArrow className="page-arrow org-calendar-month-arrow" direction="previous" label="Previous month" onClick={() => goToMonth(-1)} />

                        <span className="org-calendar-month-label">
                            {MONTH_LABELS[viewMonth]} {viewYear}
                        </span>

                        <NavArrow className="page-arrow org-calendar-month-arrow" direction="next" label="Next month" onClick={() => goToMonth(1)} />

                    </div>

                    <div className="org-calendar-grid org-calendar-weekday-row">
                        {WEEKDAY_LABELS.map(label => (
                            <div key={label} className="org-calendar-weekday">{label}</div>
                        ))}
                    </div>

                    <div className="org-calendar-grid">

                        {cells.map((cell, index) => {

                            if (!cell) {
                                return <div key={`blank-${index}`} className="org-calendar-day org-calendar-day-blank" />;
                            }

                            const dayTasks = tasksOnDate(shown, cell.iso);
                            const visibleDots = dayTasks.slice(0, MAX_VISIBLE_DOTS);
                            const overflowCount = dayTasks.length - visibleDots.length;

                            return (

                                <button
                                    type="button"
                                    key={cell.iso}
                                    className={
                                        "org-calendar-day" +
                                        (cell.iso === today ? " org-calendar-day-today" : "") +
                                        (cell.iso === selectedDate ? " org-calendar-day-selected" : "")
                                    }
                                    onClick={() => selectDay(cell.iso)}
                                >

                                    <span className="org-calendar-day-number">{cell.day}</span>

                                    {dayTasks.length > 0 && (

                                        <span className="org-calendar-day-dots">

                                            {visibleDots.map(task => (
                                                <span
                                                    key={task.taskId}
                                                    className="org-calendar-day-dot"
                                                    style={{ backgroundColor: task.color }}
                                                />
                                            ))}

                                            {overflowCount > 0 && (
                                                <span className="org-calendar-day-dot-overflow">+{overflowCount}</span>
                                            )}

                                        </span>

                                    )}

                                </button>

                            );

                        })}

                    </div>

                    {period && (

                        <div className="org-calendar-agenda">

                            <h3 className="org-calendar-selected-title">
                                {period.label}
                                <span className="org-calendar-agenda-range">
                                    {period.from === period.to ? isoToDisplay(period.from, dateFormat) : isoToDisplay(period.from, dateFormat) + " - " + isoToDisplay(period.to, dateFormat)}
                                </span>
                            </h3>

                            {periodTasks.length === 0 && (
                                <p className="org-calendar-selected-empty">Nothing in this period.</p>
                            )}

                            {periodTasks.map(task => (
                                <div key={task.taskId} className="org-calendar-agenda-row" style={{ "--capability-color": task.color } as React.CSSProperties}>
                                    <span className="org-calendar-agenda-date">{isoToDisplay(task.date, dateFormat)}</span>
                                    {task.label && <span className="org-calendar-task-kind">{task.label}</span>}
                                    {task.noteId
                                        ? <TextLink className="org-calendar-task-link" onClick={() => NotepadService.open([task.noteId as string])}>{task.name}</TextLink>
                                        : onOpenTask
                                            ? <TextLink className="org-calendar-task-link" title={task.originLabel + " " + task.sectionTitle} onClick={() => onOpenTask(task.systemNumber, task.sectionNumber)}>{task.name ?? task.description}</TextLink>
                                            : <span className="org-calendar-agenda-text">{task.name ?? task.description}</span>}
                                </div>
                            ))}

                        </div>

                    )}

                    {selectedDate && (

                        <div className="org-calendar-selected">

                            <h3 className="org-calendar-selected-title">
                                {isoToDisplay(selectedDate, dateFormat)}
                                {selectedDateTasks.length > 0 && (
                                    <AddButton className="org-calendar-expand"
                                        onClick={() => setNotesOpen(current => selectedDateTasks.every(task => current.has(task.taskId))
                                            ? new Set([...current].filter(id => !selectedDateTasks.some(task => task.taskId === id)))
                                            : new Set([...current, ...selectedDateTasks.map(task => task.taskId)]))}>
                                        {selectedDateTasks.every(task => notesOpen.has(task.taskId)) ? "Collapse all" : "Expand all"}
                                    </AddButton>
                                )}
                            </h3>

                            {selectedDateTasks.length === 0 && (
                                <p className="org-calendar-selected-empty">Nothing on this date.</p>
                            )}

                            {[...selectedDateTasks].sort((one, other) => (annotations[one.taskId]?.time ?? "99:99").localeCompare(annotations[other.taskId]?.time ?? "99:99")).map(task => {

                                const annotation = annotations[task.taskId] ?? {};
                                const hasNote = !!(annotation.time || annotation.notes);
                                const noteShown = hasNote || notesOpen.has(task.taskId);

                                return (

                                    <div key={task.taskId} className="org-calendar-task" style={{ "--capability-color": task.color } as React.CSSProperties}>

                                        {/* What the date is (Start, End ...) and the card's name, a link to its page; a note is added from the button that shows on hovering. */}
                                        <div className="org-calendar-task-line">

                                            {task.label && <span className="org-calendar-task-kind">{task.label}</span>}

                                            {task.noteId
                                                ? (
                                                    <TextLink
                                                        className="org-calendar-task-link"
                                                        onClick={() => NotepadService.open([task.noteId as string])}
                                                    >
                                                        {task.name}
                                                    </TextLink>
                                                )
                                                : onOpenTask
                                                ? (
                                                    <TextLink
                                                        className="org-calendar-task-link"
                                                        title={task.originLabel + " " + task.sectionTitle}
                                                        onClick={() => onOpenTask(task.systemNumber, task.sectionNumber)}
                                                    >
                                                        {task.name ?? task.description}
                                                    </TextLink>
                                                )
                                                : <span>{task.name ?? task.description}</span>}

                                            {!noteShown && (
                                                <AddButton className="org-calendar-task-add"
                                                    onClick={() => setNotesOpen(current => new Set(current).add(task.taskId))}>
                                                    Add Note
                                                </AddButton>
                                            )}

                                        </div>

                                        {noteShown && (
                                        <div className="org-calendar-task-annotation">

                                            <label className="org-calendar-task-annotation-time">
                                                <span>Time</span>
                                                <input
                                                    type="time"
                                                    className="interview-input"
                                                    value={annotation.time ?? ""}
                                                    onChange={(event) =>
                                                        handleTimeChange(task, event.target.value)
                                                    }
                                                />
                                            </label>

                                            <label className="org-calendar-task-annotation-notes">
                                                <span>Note</span>
                                                <NotesField
                                                    value={annotation.notes ?? ""}
                                                    onChange={(next) =>
                                                        updateAnnotation(task.taskId, { notes: next })
                                                    }
                                                />
                                            </label>

                                        </div>
                                        )}

                                    </div>

                                );

                            })}

                        </div>

                    )}

                </>

            )}

            {activeTab === "capabilities" && (

                <>

                    <div className="org-calendar-header">
                        <div className="org-calendar-title">Read a Capability</div>
                    </div>

                    {/*
                        No descriptive hint paragraph here by design
                        (see the user's own "no other text" request)
                        -- just the Capabilities themselves, each in
                        its own colour, exactly like the sidebar's
                        own Capability list.
                    */}
                    <div className="org-rail-capability-list">

                        {capabilities.map(capability => (

                            <button
                                type="button"
                                key={capability.id}
                                className="org-rail-capability-item"
                                style={{ "--capability-color": capability.color } as React.CSSProperties}
                                onClick={() => {
                                    onCapabilitySelect(capability.id);
                                    onCapabilityOpen(capability);
                                }}
                            >
                                <span className="hover-width-reserve" data-reserve={capability.title}>
                                    {capability.title}
                                </span>
                            </button>

                        ))}

                    </div>

                </>

            )}

            {activeTab === "systems" && (

                <>

                    <div className="org-calendar-header">
                        <div className="org-calendar-title">Select a System</div>
                    </div>

                    {/*
                        No descriptive hint paragraph here either --
                        same "no other text" request as Capabilities
                        above. Every System shown here spans every
                        Capability (not just the currently active
                        one, unlike the sidebar's own filtered System
                        list), so each one carries ITS OWN parent
                        Capability's colour individually rather than
                        one shared colour for the whole list.
                    */}
                    <div className="org-rail-system-list">

                        {orderedSystems.map(system => (

                            <button
                                type="button"
                                key={system.id}
                                className="org-rail-system-item"
                                style={{ "--system-color": getCapabilityColor(system.capability) } as React.CSSProperties}
                                onClick={() => onSystemOpen(system)}
                            >
                                <span className="org-rail-system-number">{pad2(system.number)}.</span>
                                <span className="org-rail-system-title hover-width-reserve" data-reserve={system.title}>{system.title}</span>
                            </button>

                        ))}

                    </div>

                </>

            )}

        </div>

    );

    return (

        <div
            ref={panelRef}
            className={`org-calendar-panel${activeTab ? " org-calendar-panel-open" : ""}`}
            onMouseLeave={() => {

                if (!suppressCloseForFlyout) {
                    setActiveTab(null);
                }

            }}
            onBlur={(event) => {

                // Keyboard-focus parity with the mouse's own
                // onMouseLeave above -- Tabbing all the way out of
                // the rail (to something outside it, not just to
                // the next handle/link INSIDE it) closes the
                // flyout the same way moving the mouse away does.
                // `relatedTarget` is the element gaining focus;
                // null (e.g. clicking outside the document) also
                // counts as "left".
                if (suppressCloseForFlyout) {
                    return;
                }

                // A blur caused by a mousedown (e.g. clicking a plain
                // <div> -- blank space inside a flyout card -- shifts
                // focus away from whatever control was previously
                // focused, since a <div> can't itself take focus) is
                // NOT "the person tabbed/clicked away" -- the
                // mousedown-based outside-click handler above is the
                // one that decides whether THAT click should close
                // the rail, and pressing anywhere INSIDE any of the 3
                // sliding cards should never close it. Only react to
                // a blur that happened with no mousedown involved at
                // all (a Tab/Shift+Tab key press).
                if (mouseDownInProgressRef.current) {
                    return;
                }

                const nextFocus = event.relatedTarget as Node | null;

                if (!nextFocus || !event.currentTarget.contains(nextFocus)) {
                    setActiveTab(null);
                }

            }}
            title="Framework Navigator"
        >

            <div className="org-calendar-inner">

                <div className="org-rail-handles" aria-label="Framework Navigator">

                    {/*
                        The rail's own proper name -- not a handle
                        itself (no hover/click behavior), just a
                        small always-visible label identifying the
                        whole 3-handle rail, the same way each
                        individual handle below identifies its own
                        flyout.
                    */}
                    <div className="org-rail-name">Framework Navigator</div>

                    <div className="org-rail-handle-group">

                        <div
                            className={`org-rail-handle org-calendar-handle${activeTab === "calendar" ? " org-rail-handle-active" : ""}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={activeTab === "calendar"}
                            onMouseEnter={() => setActiveTab("calendar")}
                            onFocus={() => setActiveTab("calendar")}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    setActiveTab("calendar");
                                }
                            }}
                        >
                            <span className="org-rail-handle-label">Calendar</span>
                        </div>

                        {activeTab === "calendar" && flyoutContent}

                    </div>

                    <div className="org-rail-handle-group">

                        <div
                            className={`org-rail-handle org-rail-handle-capabilities${activeTab === "capabilities" ? " org-rail-handle-active" : ""}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={activeTab === "capabilities"}
                            onMouseEnter={() => setActiveTab("capabilities")}
                            onFocus={() => setActiveTab("capabilities")}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    setActiveTab("capabilities");
                                }
                            }}
                        >
                            <span className="org-rail-handle-label">Capabilities</span>
                        </div>

                        {activeTab === "capabilities" && flyoutContent}

                    </div>

                    <div className="org-rail-handle-group">

                        <div
                            className={`org-rail-handle org-rail-handle-systems${activeTab === "systems" ? " org-rail-handle-active" : ""}`}
                            role="button"
                            tabIndex={0}
                            aria-pressed={activeTab === "systems"}
                            onMouseEnter={() => setActiveTab("systems")}
                            onFocus={() => setActiveTab("systems")}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    setActiveTab("systems");
                                }
                            }}
                        >
                            <span className="org-rail-handle-label">Systems</span>
                        </div>

                        {activeTab === "systems" && flyoutContent}

                    </div>

                </div>

            </div>

            {/*
                The "apply to every occurrence?" dialog (see
                `handleTimeChange`/`timeConfirmPrompt` above) --
                deliberately nested INSIDE this ref'd panel div (not
                rendered as a page-level sibling) so the outside-click
                check above (`panelRef.current.contains(target)`)
                still treats a click anywhere on it, including the
                dimmed backdrop, as "inside the rail", never as the
                outside click that would close the whole rail out
                from under it.
            */}
            {timeConfirmPrompt && (

                <div className="confirmation-overlay" onClick={() => setTimeConfirmPrompt(null)}>

                    <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>

                        <h2 className="confirmation-title">
                            This is a {timeConfirmPrompt.howOften.toLowerCase()} reminder.
                        </h2>

                        <p className="confirmation-question">
                            Apply this timing to all?
                        </p>

                        <div className="confirmation-actions">

                            <AddButton look="confirmation-button secondary"
                                onClick={() => setTimeConfirmPrompt(null)}>
                                No, just this one
                            </AddButton>

                            <AddButton look="confirmation-button primary"
                                onClick={confirmApplyTimeToSiblings}>
                                Yes, apply to all
                            </AddButton>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}
