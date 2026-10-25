/**
 * Read-only aggregation for the Organization Calendar (see
 * OrganizationCalendarPanel.tsx) -- the Calendar shows no
 * user-authored notes anymore; every date it marks is discovered
 * by scanning every System this Organization has ANY saved data
 * for, and pulling out every Date-typed value already sitting in
 * that data:
 *
 *   - Every Operational Log entry's own `date` field (Systems
 *     whose Section is an Operational Log answer).
 *   - Every Table column whose title contains the word "date"
 *     (the same heuristic DynamicTable.tsx itself uses to decide
 *     which columns get a date picker -- see AnswerUtils'
 *     `isDateColumn`), across every row of every such Table.
 *   - Every Process/SOP's own How Often schedule (see
 *     ProcessScheduleValue / expandScheduleOccurrences below) --
 *     Daily recurs every day going forward; Weekly/Bi-Weekly
 *     recurs on whichever weekday was picked; Monthly/Quarterly/
 *     Semi-Annually/Annually recur from whichever date was picked,
 *     stepping forward at that cadence; Other shows once, on
 *     whichever date was picked; As Needed never generates a task.
 *
 * Nothing here is ever written back to a System's own answer data
 * -- this is a pure read/derive step. The only thing a person can
 * actually edit through the Calendar is a lightweight per-task
 * annotation (a time of day + a free-text note), kept entirely
 * separate in `OrganizationService.getTaskAnnotations`/
 * `setTaskAnnotation`, keyed by each task's own `taskId`.
 */

import { StorageService } from "./StorageService";
import { OrganizationService } from "./OrganizationService";
import { NotepadService } from "./NotepadService";
import { systems } from "../data/systems";
import { getCapabilityColor } from "../data/capabilities";
import { AnswerType } from "../framework/enums/AnswerType.ts";
import { capabilityCardDates, keyCardDates, legalEntityCardDates, type CardDate, type CardDateKind } from "../framework/engine/CalendarCardDates.ts";
import { keyDatesOfSessions } from "../framework/engine/KeyDates.ts";
import {
    OperationalLogAnswerValue,
    asBusinessCapabilityValue,
    asLegalEntityValue,
    ProcessRecordValue,
    ProcessScheduleValue,
    TableAnswerRow,
    isDateColumn,
    resolveProcessLogLabel,
    sopDisplayId,
    visibleTableColumns
} from "../framework/engine/AnswerUtils.ts";

// How far around today a recurring/scheduled Process or SOP is
// actually projected into real occurrence dates -- generous
// enough to browse a year back and two years forward on the
// Calendar, not a promise of literally every occurrence a
// schedule anchored far in the past or future would ever produce
// (an unbounded projection has no natural stopping point at all
// for something like Daily). Every occurrence-generating branch
// below is bounded by this window either way.
const SCHEDULE_WINDOW_PAST_MONTHS = 12;
const SCHEDULE_WINDOW_FUTURE_MONTHS = 24;

const RECURRING_STEP_MONTHS: Record<string, number> = {
    Monthly: 1,
    Quarterly: 3,
    "Semi-Annually": 6,
    Annually: 12
};

function todayIsoLocal(): string {

    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

}

function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());

    if (!match) {
        return null;
    }

    const [, year, month, day] = match;

    return { year: Number(year), month: Number(month), day: Number(day) };

}

function toIsoDate(date: Date): string {

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

}

function addDaysIso(iso: string, days: number): string {

    const parsed = parseIsoDate(iso);

    if (!parsed) {
        return iso;
    }

    return toIsoDate(new Date(parsed.year, parsed.month - 1, parsed.day + days));

}

/**
 * Steps a date forward by whole months, clamping the day-of-month
 * to whatever the target month actually has -- e.g. "the 31st"
 * stepped a month from January lands on February's own last day
 * (28th/29th) rather than JS Date's own default of overflowing
 * into March 2nd/3rd. Always computed from the ORIGINAL anchor
 * (`months` is the full step count from day one), not by
 * repeatedly re-stepping an already-stepped date, so a clamp on
 * one occurrence can never drift every later one.
 */
function addMonthsIso(iso: string, months: number): string {

    const parsed = parseIsoDate(iso);

    if (!parsed) {
        return iso;
    }

    const targetMonthIndex = parsed.month - 1 + months;
    const daysInTargetMonth = new Date(parsed.year, targetMonthIndex + 1, 0).getDate();
    const day = Math.min(parsed.day, daysInTargetMonth);

    return toIsoDate(new Date(parsed.year, targetMonthIndex, day));

}

/**
 * Turns a Process/SOP's own `howOften` + `schedule` into every
 * occurrence date within the bounded window above -- see this
 * file's own top-of-file doc comment for what each frequency
 * actually does. A safety guard on every loop below keeps a
 * pathological schedule (e.g. a Weekly anchored many years in the
 * past) from ever iterating unboundedly; the window filter is
 * what actually limits what's RETURNED, the guard just limits how
 * many candidate dates get computed and checked along the way.
 */
export function expandScheduleOccurrences(
    howOften: string,
    schedule: ProcessScheduleValue | undefined
): string[] {

    const frequency = howOften.trim();

    if (frequency.length === 0 || frequency === "As Needed") {
        return [];
    }

    const today = todayIsoLocal();
    const windowStart = addMonthsIso(today, -SCHEDULE_WINDOW_PAST_MONTHS);
    const windowEnd = addMonthsIso(today, SCHEDULE_WINDOW_FUTURE_MONTHS);

    if (frequency === "Daily") {

        const occurrences: string[] = [];
        let cursor = today;
        let guard = 0;

        while (cursor <= windowEnd && guard < 2000) {
            occurrences.push(cursor);
            cursor = addDaysIso(cursor, 1);
            guard += 1;
        }

        return occurrences;

    }

    const anchor = schedule?.anchorDate?.trim();

    if (!anchor || !parseIsoDate(anchor)) {
        // Nothing picked yet in the follow-up Weekday/Date control
        // -- no occurrence to show until there is one.
        return [];
    }

    if (frequency === "Weekly" || frequency === "Bi-Weekly") {

        const stepDays = frequency === "Weekly" ? 7 : 14;
        const occurrences: string[] = [];

        for (let step = 0; step < 500; step++) {

            const candidate = addDaysIso(anchor, step * stepDays);

            if (candidate > windowEnd) {
                break;
            }

            if (candidate >= windowStart) {
                occurrences.push(candidate);
            }

        }

        return occurrences;

    }

    const stepMonths = RECURRING_STEP_MONTHS[frequency];

    if (stepMonths) {

        const occurrences: string[] = [];

        for (let step = 0; step < 500; step++) {

            const candidate = addMonthsIso(anchor, step * stepMonths);

            if (candidate > windowEnd) {
                break;
            }

            if (candidate >= windowStart) {
                occurrences.push(candidate);
            }

        }

        return occurrences;

    }

    // "Custom" -- no defined interval to repeat by, so it shows
    // once, on whichever date was picked (if that date even falls
    // in the window at all).
    return anchor >= windowStart && anchor <= windowEnd ? [anchor] : [];

}

export interface CalendarTask {

    /**
     * Stable-ish identifier used to key this task's own
     * annotation (see OrganizationService.setTaskAnnotation).
     * Built from where the date actually lives -- for an
     * Operational Log row, from that row's own stable `.key`
     * (survives reordering); for a generic Table row, from its
     * array INDEX (the same known reorder-drift trade-off the
     * rest of this app already accepts for its own index-keyed
     * Sets elsewhere -- generic Table rows have no stable key of
     * their own to use instead).
     */
    taskId: string;

    /** ISO "YYYY-MM-DD". */
    date: string;

    systemNumber: number;
    systemTitle: string;

    sectionNumber: number;
    sectionTitle: string;

    /** e.g. "8.3" -- System number "." Section number. */
    originLabel: string;

    /** What this date is actually about -- a Process name, a row's own name/title column, etc. */
    description: string;

    /** The task's Capability's color -- what "system colour" means for the day-cell dot. */
    color: string;

    /**
     * For the date of a card (a resource's start, a warranty's end, a payment, an Opening Date ...): which kind it is, so the Calendar's funnel can keep or leave it.
     * `undefined` for the Calendar's other tasks.
     */
    kind?: CardDateKind;

    /** For the date of a card: what kind of card it is ("Resource", "Activity", "Partner", "Supplier", "Founder", "Expense", "Organization"). */
    noun?: string;

    /** For a note placed on this day: its id (the Notepad opens on it). */
    noteId?: string;

    /** For the date of a card: what the date is ("Starts", "Ends", "Warranty until") and the card's name. */
    label?: string;
    name?: string;

    /**
     * The Process/SOP's own How Often preset ("Daily", "Monthly",
     * "Semi-Annually", ...) for a schedule-derived task; `undefined`
     * for an Operational Log or Table-derived task, which is a
     * single dated entry, never a recurring series. Read by
     * OrganizationCalendarPanel.tsx to decide whether setting a
     * Time on one occurrence should offer to apply it to every
     * other occurrence of the same recurring task.
     */
    howOften?: string;

}

/**
 * Every Date-derived task across every System this Organization
 * has saved data for. Recomputed fresh on every call -- there's
 * no cache to invalidate, since a task's own source data (a
 * Table row, an Operational Log entry) can change from any other
 * part of the app at any time.
 */
export function getCalendarTasks(organizationId: string): CalendarTask[] {

    const tasks: CalendarTask[] = [];

    for (const systemNumber of OrganizationService.listSystemNumbers(organizationId)) {

        const session = StorageService.loadInterview(organizationId, systemNumber);

        if (!session) {
            continue;
        }

        const system = systems.find(candidate => candidate.number === systemNumber);
        const systemTitle = system?.title ?? `System ${systemNumber}`;
        const color = getCapabilityColor(system?.capability);

        const sections = session.getSections();

        // Operational Log rows only store a Process's KEY, not its
        // name -- resolving that into something readable needs
        // this same System's own Process Library answer alongside
        // it (see resolveProcessLogLabel).
        let processes: ProcessRecordValue[] = [];
        const processLibrarySection = sections.find(
            section => section.answer.type === AnswerType.ProcessLibrary
        );

        if (processLibrarySection) {

            const value = session.getResponse(processLibrarySection.number);

            if (Array.isArray(value)) {
                processes = value as ProcessRecordValue[];
            }

        }

        // Every Process's (and every one of its SOPs') own How
        // Often schedule -- turned into real occurrence dates by
        // expandScheduleOccurrences above. Origin/Section are both
        // the Process Library's own (SOPs have no Section number
        // of their own; they're nested inside it), matching how
        // the live editor and export both already address a SOP --
        // by ITS OWN id/name, not a Section number that doesn't
        // exist for it.
        if (processLibrarySection) {

            processes.forEach((process) => {

                for (const occurrence of expandScheduleOccurrences(process.howOften, process.schedule)) {

                    tasks.push({
                        taskId: `${systemNumber}-${processLibrarySection.number}-schedule-${process.key}-${occurrence}`,
                        date: occurrence,
                        systemNumber,
                        systemTitle,
                        sectionNumber: processLibrarySection.number,
                        sectionTitle: processLibrarySection.title,
                        originLabel: `${systemNumber}.${processLibrarySection.number}`,
                        description: resolveProcessLogLabel(process.key, processes) || "Untitled Process",
                        color,
                        howOften: process.howOften
                    });

                }

                const sops = Array.isArray(process.sops) ? process.sops : [];

                sops.forEach((sop, sopIndex) => {

                    for (const occurrence of expandScheduleOccurrences(sop.howOften, sop.schedule)) {

                        const sopName = sop.name.trim().length > 0 ? sop.name.trim() : "Untitled SOP";

                        tasks.push({
                            taskId: `${systemNumber}-${processLibrarySection.number}-schedule-sop-${sop.key}-${occurrence}`,
                            date: occurrence,
                            systemNumber,
                            systemTitle,
                            sectionNumber: processLibrarySection.number,
                            sectionTitle: processLibrarySection.title,
                            originLabel: `${systemNumber}.${processLibrarySection.number}`,
                            description: `${sopDisplayId(sops, sopIndex)} · ${sopName}`,
                            color,
                            howOften: sop.howOften
                        });

                    }

                });

            });

        }

        // THE DATES OF THE CARDS: the Infrastructure & Capability page's resources, partners, activities and founders; the Legal Entity's formation and expenses; the Opening Date.
        const cardTask = (section: { number: number; title: string }, entry: CardDate): CalendarTask => ({
            taskId: systemNumber + "-" + section.number + "-card-" + entry.key,
            date: entry.date,
            systemNumber,
            systemTitle,
            sectionNumber: section.number,
            sectionTitle: section.title,
            originLabel: systemNumber + "." + section.number,
            description: entry.noun + ": " + entry.name + " \u00B7 " + entry.label,
            color,
            kind: entry.kind,
            noun: entry.noun,
            label: entry.label,
            name: entry.name
        });
        for (const section of sections) {
            const value = session.getResponse(section.number);
            if (section.answer.type === AnswerType.BusinessCapability) {
                capabilityCardDates(asBusinessCapabilityValue(value), []).forEach(entry => tasks.push(cardTask(section, entry)));
            } else if (section.answer.type === AnswerType.LegalEntity) {
                legalEntityCardDates(asLegalEntityValue(value)).forEach(entry => tasks.push(cardTask(section, entry)));
            }
        }

        for (const section of sections) {

            const value = session.getResponse(section.number);

            if (section.answer.type === AnswerType.OperationalLog && Array.isArray(value)) {

                for (const row of value as OperationalLogAnswerValue) {

                    if (!row.date || row.date.trim().length === 0) {
                        continue;
                    }

                    const description =
                        resolveProcessLogLabel(row.processKey, processes) ||
                        row.description.trim() ||
                        "Operational Log entry";

                    tasks.push({
                        taskId: `${systemNumber}-${section.number}-log-${row.key}`,
                        date: row.date,
                        systemNumber,
                        systemTitle,
                        sectionNumber: section.number,
                        sectionTitle: section.title,
                        originLabel: `${systemNumber}.${section.number}`,
                        description,
                        color
                    });

                }

                continue;

            }

            if (section.answer.type === AnswerType.Table && Array.isArray(value) && section.answer.table) {

                const columns = visibleTableColumns(section.answer.table.columns);
                const dateColumns = columns.filter(column => isDateColumn(column.title));

                if (dateColumns.length === 0) {
                    continue;
                }

                (value as TableAnswerRow[]).forEach((row, rowIndex) => {

                    for (const dateColumn of dateColumns) {

                        const rawDate = row[dateColumn.id];

                        if (typeof rawDate !== "string" || rawDate.trim().length === 0) {
                            continue;
                        }

                        // Prefer a "name"/"title"-ish column as this
                        // task's description; failing that, the first
                        // other non-blank text column; failing THAT,
                        // a generic fallback -- generic Tables have no
                        // guaranteed "this is the row's own name" field,
                        // so this is a best-effort heuristic, not a
                        // guarantee.
                        const labelColumn =
                            columns.find(column =>
                                column.id !== dateColumn.id &&
                                /name|title/i.test(column.title) &&
                                typeof row[column.id] === "string" &&
                                (row[column.id] as string).trim().length > 0
                            ) ??
                            columns.find(column =>
                                column.id !== dateColumn.id &&
                                typeof row[column.id] === "string" &&
                                (row[column.id] as string).trim().length > 0
                            );

                        const description = labelColumn
                            ? String(row[labelColumn.id]).trim()
                            : "Untitled entry";

                        tasks.push({
                            taskId: `${systemNumber}-${section.number}-${dateColumn.id}-${rowIndex}`,
                            date: rawDate,
                            systemNumber,
                            systemTitle,
                            sectionNumber: section.number,
                            sectionTitle: section.title,
                            originLabel: `${systemNumber}.${section.number}`,
                            description,
                            color
                        });

                    }

                });

            }

        }

    }

    // THE KEY DATES, the organization's milestones (the plan's start, the registration, the opening, the ends of the stage windows): past and to come, one kind of date on the Calendar.
    try {
        const foundation = (number: number) => { try { return StorageService.loadInterview(organizationId, number); } catch { return null; } };
        const keyDates = keyDatesOfSessions({
            identity: foundation(1),
            brand: foundation(2),
            business: foundation(3),
            strategy: foundation(4),
            organisationName: OrganizationService.getSummary(organizationId)?.name ?? "",
            globalSettings: OrganizationService.getGlobalSettings(organizationId)
        });
        const identity = systems.find(candidate => candidate.number === 1);
        keyCardDates(keyDates, "").forEach(entry => tasks.push({
            taskId: "key-" + entry.key,
            date: entry.date,
            systemNumber: 1,
            systemTitle: identity?.title ?? "System 1",
            sectionNumber: 0,
            sectionTitle: "Key dates",
            originLabel: "Key date",
            description: entry.name + " \u00B7 " + entry.label,
            color: getCapabilityColor(identity?.capability),
            kind: entry.kind,
            noun: entry.noun,
            label: entry.label,
            name: entry.name
        }));
    } catch {
        // (An organization with nothing saved yet has no key dates.)
    }

    // THE NOTES that stand on a day (the Notepad's Date, ticked): this Organization's, and the general ones.
    for (const note of NotepadService.notes()) {
        if (note.date && (note.organizationId === organizationId || note.organizationId === "")) {
            const first = note.text.split("\n").map(line => line.trim()).find(line => line.length > 0) ?? "Note";
            tasks.push({
                taskId: "note-" + note.id,
                date: note.date,
                systemNumber: 0,
                systemTitle: "Notes",
                sectionNumber: 0,
                sectionTitle: "Notes",
                originLabel: "Note",
                description: first,
                color: "var(--bg-primary)",
                label: "Note",
                name: first,
                noteId: note.id
            });
        }
    }

    return tasks;

}
