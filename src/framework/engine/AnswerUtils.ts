import { parseAmount, parseDecimal } from "./Amounts.ts";
import { CURRENCY_CODES } from "./Currencies.ts";
import { asObject, asText, randomId } from "./Readers.ts";
import { AnswerDefinition, TableColumnDefinition } from "../model/index.ts";
import {
    type DeliveryValue,
    type DemandValue,
    type FounderPeriod,
    asDeliveryMap,
    asDemandMap,
    asFounderPeriod,
    asHoursPeriod
} from "./DemandCapacity.ts";

import { AnswerType } from "../enums/AnswerType.ts";
import { nextPaletteHue, paletteHue, paletteHuesInOrder } from "./Palette.ts";
import {
    financialFoundationSectionsEmpty,
    financialSustainabilitySectionsEmpty
} from "./FinancialModel.ts";

/**
 * Runtime value shapes produced by AnswerRenderer
 * for each Answer Structure.
 */
type FixedVariantAnswerValue = Record<string, string>;

/**
 * Filters a raw Table's declared columns down
 * to the columns that should actually be
 * rendered/exported.
 *
 * A column explicitly titled "#" is a manual
 * row-number placeholder in the Answer
 * Definition Resource; the runtime always
 * renders/exports its own row-number column
 * instead, so any such column is dropped here
 * to avoid a duplicate.
 */
export function visibleTableColumns(
    columns: TableColumnDefinition[]
): TableColumnDefinition[] {

    return columns.filter(column => column.title.trim() !== "#");

}

/**
 * Determines whether a table column is a date,
 * so it can be rendered with a native date picker
 * instead of a plain text input.
 */
export function isDateColumn(title: string): boolean {

    return /\bdate\b/i.test(title);

}

export type TableAnswerRow = Record<string, unknown>;

/**
 * A single user-authored Checklist item.
 */
export interface ChecklistItemValue {
    id: string;
    text: string;
    checked: boolean;
}

/**
 * A single user-authored Card List
 * entry (used within one card's list).
 */
export interface CardListItemValue {
    id: string;
    text: string;
}

/**
 * Runtime value shape for a Card List
 * answer: each card's own reorderable
 * list of entries, keyed by card id.
 */
export type CardListAnswerValue = Record<string, CardListItemValue[]>;

/**
 * A single user-authored Profile Card.
 */
export interface ProfileCardValue {
    id: string;
    title: string;
    sections: Record<string, string>;
}

/**
 * Runtime value shape for a Profile
 * Cards answer.
 */
export interface ProfileCardsAnswerValue {
    cards: ProfileCardValue[];
    trailing?: string;
}

/**
 * A single Step within an SOP.
 *
 * `key` is a stable, never-user-facing identifier -- same
 * idiom as ProcessRecordValue.key, but for a single Step
 * within an SOP. Needed so the Operational Log's auto-change
 * detection (see diffProcessAgainstSnapshot) can tell "this
 * Step's text changed" apart from "this Step was removed and
 * a different one added at the same position" purely by
 * matching keys, rather than guessing from array position
 * (which shifts the moment an earlier Step is added/removed).
 */
export interface ProcessStepValue {
    key: string;
    action: string;
    done: boolean;
}

/**
 * A recurring (or one-off) schedule attached to a Process or
 * SOP's own How Often field -- only ever present once the user
 * has actually picked something in the follow-up control that
 * appears under the How Often dropdown (see ProcessLibraryEditor.
 * tsx's own FrequencyCell): a weekday for Weekly/Bi-Weekly, or a
 * calendar date for Monthly/Quarterly/Semi-Annually/Annually/
 * Other. Daily and As Needed never carry one -- Daily recurs
 * every single day with nothing to anchor, and As Needed is
 * explicitly irregular (see CalendarTaskService.ts's own
 * `expandScheduleOccurrences`, which is what actually turns this
 * into dots on the Organization Calendar).
 *
 * `anchorDate` alone is enough to represent every supported
 * cadence: for Weekly/Bi-Weekly it's the first matching weekday
 * on/after the moment it was picked (its own day-of-week IS the
 * chosen weekday, so there's no need to separately store which
 * weekday was picked); for Monthly/Quarterly/Semi-Annually/
 * Annually it's the date every later occurrence steps forward
 * from (same day-of-month, stepping by 1/3/6/12 months); for
 * Other it's simply the one date picked (no defined interval to
 * repeat by, so it shows once).
 */
export interface ProcessScheduleValue {
    anchorDate: string;
}

/**
 * A single SOP within a Process. Always holds at least
 * one Step (mirroring every other "always at least one
 * row" default in this file) -- an SOP with zero Steps
 * would read as broken rather than "not written yet".
 *
 * `id` is an OPTIONAL reference tag holding just the SOP's own
 * INITIALS (e.g. "SHIP") -- the numeric suffix is always
 * computed automatically from those initials and this SOP's own
 * position among every other SOP (in this same Process) sharing
 * them (see sopDisplayId). Left blank, it falls back to the
 * generic "SOP" initials, so an ID always makes sense out of the
 * box.
 *
 * `who`/`howOften` mirror the SAME fields on ProcessRecordValue
 * below, one level down -- an SOP can have its own Owner and its
 * own How Often independent of its parent Process's (e.g. a
 * Process done "As Needed" overall might still have one SOP
 * that's actually done Weekly). `schedule` is that SOP's own
 * follow-up pick (see ProcessScheduleValue above), same as the
 * Process-level one.
 *
 * `key` is the same stable, never-user-facing identifier as
 * ProcessStepValue.key above -- see that field's own doc
 * comment.
 */
export interface ProcessSopValue {
    id?: string;
    key: string;
    name: string;
    purpose: string;
    who: string;
    howOften: string;
    schedule?: ProcessScheduleValue;
    steps: ProcessStepValue[];
}

/**
 * A single Process. Always holds at least one SOP -- see
 * ProcessLibraryEditor.tsx's own comments for the collapse
 * rule this enables: a Process with exactly one SOP shows
 * that SOP's Steps directly on the Process card, with the
 * SOP's own Name/Purpose (and the SOPs table itself) simply
 * not rendered, rather than the data model having a
 * genuinely different shape for the 1-SOP case.
 *
 * `id` is the same INITIALS-only reference tag as
 * ProcessSopValue.id -- see processDisplayId for how its numeric
 * suffix is computed.
 *
 * `schedule` is this Process's own follow-up pick under How
 * Often -- see ProcessScheduleValue above.
 *
 * `key` is a SEPARATE, non-optional, never-user-facing
 * identifier (unlike `id`, which the user can freely edit or
 * leave blank) -- a stable handle other Sections can point at
 * even while `id`/`name`/position all change. Currently used
 * by the Operational Log (each entry's optional Process link)
 * and Roles & Responsibilities (each Process's Notes) -- see
 * OperationalLogRowValue.processKey and
 * RolesResponsibilitiesAnswerValue below. Generated once, on
 * creation (see createProcessKey), and never regenerated
 * afterwards.
 */
export interface ProcessRecordValue {
    id?: string;
    key: string;
    name: string;
    purpose: string;
    who: string;
    howOften: string;
    schedule?: ProcessScheduleValue;
    status: string;
    sops: ProcessSopValue[];

    /**
     * The Process's own field values (and its SOPs'/Steps' own
     * key-matched values) as of the last time the Operational Log
     * was updated for it -- an internal bookkeeping field, never
     * rendered or edited directly (same "shadow" role as `key`
     * above, just for change-detection rather than identity). See
     * ProcessChangeSnapshot / diffProcessAgainstSnapshot /
     * generateOperationalLogEntriesFromProcessLibrary below for
     * how it's captured, compared, and refreshed. Absent entirely
     * on a Process that's never been through that cycle yet (a
     * brand new one, or one from a session saved before this field
     * existed -- see StorageService's normalize step, which
     * silently backfills it without generating a log entry, so
     * pre-existing Processes don't all look "newly added" the
     * first time this runs).
     */
    lastLoggedSnapshot?: ProcessChangeSnapshot;
}

/**
 * Normalizes a typed (or stored) Process/SOP ID down to what the
 * field is actually allowed to hold -- letters only, capitalized,
 * and capped at 3 characters -- the numeric position is always
 * computed automatically (see processDisplayId/sopDisplayId below),
 * never typed. Used both live, on every keystroke
 * (ProcessLibraryEditor.tsx, so someone typing "PRC - 01" trying to
 * spell out their own number by hand simply can't, and someone
 * typing "process" ends up with just "PRO"), and defensively here on
 * every stored `id` this module reads -- a value saved before this
 * restriction existed could still hold digits/dashes/spaces/lower-
 * case letters/more than 3 characters baked right into the initials,
 * which would otherwise put an extra "-" into the "{initials}-{seq}"
 * display id below (or an oversized tag) and corrupt it.
 */
export function sanitizeIdInitials(value: string): string {
    return value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3);
}

/**
 * A Process's display ID -- always "{INITIALS}-{seq}", e.g.
 * "ORD-02". The initials are whatever the user typed into the
 * ID field (uppercased; "PRC" when left blank); the numeric
 * suffix is NEVER typed, it's always computed automatically from
 * how many Processes AT OR BEFORE this one in the table (in
 * whatever order they're currently arranged) share those same
 * initials -- so entering "ORD" on three different rows numbers
 * them ORD-01/ORD-02/ORD-03 in the order they appear, and
 * every other set of initials keeps its own separate count.
 *
 * Takes the full `processes` list (not just this one Process)
 * because that count can only be computed by looking at every
 * row up to this one -- shared by the live editor
 * (ProcessLibraryEditor.tsx) and export (buildAnswerBlocks
 * below) so the two never disagree. Typed as a plain
 * `{ id?: string }` array (not the full ProcessRecordValue[])
 * so the SAME function also works against a Process's own
 * ProcessChangeSnapshot list (see diffProcessAgainstSnapshot's
 * `removedSopPlaceholder` case's own sopDisplayId call below,
 * which needs the exact same grouping logic against a historical
 * snapshot that's no longer part of the live data at all).
 */
export function processDisplayId(processes: Array<{ id?: string }>, processIndex: number): string {

    const initials = sanitizeIdInitials((processes[processIndex]?.id ?? "").trim()).toUpperCase() || "PRC";

    return `${initials}-${processDisplaySequence(processes, processIndex)}`;

}

/**
 * Just the auto-generated NUMBER half of `processDisplayId` above
 * (e.g. "02", no initials, no dash) -- used by the live editor
 * (ProcessLibraryEditor.tsx) to render that number inline right next
 * to the initials input without ever having to slice it back out of
 * the combined "{INITIALS}-{seq}" string, which broke the moment an
 * initials value itself contained a "-" (e.g. a pre-existing/legacy
 * id saved before `sanitizeIdInitials` was enforced on typing) --
 * `"PRC-01".indexOf("-")` finds THAT dash, not the one separating
 * initials from sequence, producing a garbled "-01-02"-style result.
 * Computing the number on its own here sidesteps that entirely.
 * Two digits (not three) -- a Process Library rarely has anywhere
 * close to 100 Processes sharing the same initials.
 */
export function processDisplaySequence(processes: Array<{ id?: string }>, processIndex: number): string {

    const initials = sanitizeIdInitials((processes[processIndex]?.id ?? "").trim()).toUpperCase() || "PRC";

    let sequence = 0;

    for (let index = 0; index <= processIndex; index++) {

        const candidateInitials = sanitizeIdInitials((processes[index]?.id ?? "").trim()).toUpperCase() || "PRC";

        if (candidateInitials === initials) {
            sequence += 1;
        }

    }

    return String(sequence).padStart(2, "0");

}

/**
 * An SOP's display ID -- same "{INITIALS}-{seq}" scheme as
 * processDisplayId above, one level down: the count is scoped to
 * this SOP's OWN Process (every SOP within the same Process
 * sharing these initials), matching the existing ".2"-style
 * nesting-under-its-Process convention this ID replaces. "SOP"
 * is the default initials when left blank.
 */
export function sopDisplayId(sops: Array<{ id?: string }>, sopIndex: number): string {

    const initials = sanitizeIdInitials((sops[sopIndex]?.id ?? "").trim()).toUpperCase() || "SOP";

    return `${initials}-${sopDisplaySequence(sops, sopIndex)}`;

}

/** Same idea as `processDisplaySequence` above, one level down -- see its own doc comment. */
export function sopDisplaySequence(sops: Array<{ id?: string }>, sopIndex: number): string {

    const initials = sanitizeIdInitials((sops[sopIndex]?.id ?? "").trim()).toUpperCase() || "SOP";

    let sequence = 0;

    for (let index = 0; index <= sopIndex; index++) {

        const candidateInitials = sanitizeIdInitials((sops[index]?.id ?? "").trim()).toUpperCase() || "SOP";

        if (candidateInitials === initials) {
            sequence += 1;
        }

    }

    return String(sequence).padStart(2, "0");

}

/**
 * Runtime value shape for a Process Library answer: every
 * Process the Organization has documented, in the order
 * they were added.
 */
export type ProcessLibraryAnswerValue = ProcessRecordValue[];

let processKeyCounter = 0;

/**
 * Creates a fresh, stable `ProcessRecordValue.key` -- see
 * that field's own doc comment for what it's used for.
 * Timestamp + an incrementing counter (the same idiom
 * AnswerRenderer.tsx's own createChecklistItemId/
 * createCardListItemId/createProfileCardId already use) is
 * unique enough for a single-user local session; unlike
 * those three, THIS id is actually persisted (Notes and
 * Operational Log entries reference it across reloads), not
 * just a transient React key.
 */
export function createProcessKey(): string {

    processKeyCounter += 1;

    return `process-${Date.now()}-${processKeyCounter}`;

}

let processStepKeyCounter = 0;

/**
 * Creates a fresh, stable `ProcessStepValue.key` -- same
 * idiom as createProcessKey above.
 */
export function createProcessStepKey(): string {

    processStepKeyCounter += 1;

    return `step-${Date.now()}-${processStepKeyCounter}`;

}

let processSopKeyCounter = 0;

/**
 * Creates a fresh, stable `ProcessSopValue.key` -- same idiom
 * as createProcessKey above.
 */
export function createProcessSopKey(): string {

    processSopKeyCounter += 1;

    return `sop-${Date.now()}-${processSopKeyCounter}`;

}

/**
 * Builds a single blank Step -- the seed every new SOP
 * starts with, and what "+ Add Step" appends.
 */
export function createBlankProcessStep(): ProcessStepValue {

    return { key: createProcessStepKey(), action: "", done: false };

}

/**
 * Builds a single blank SOP, seeded with one blank Step --
 * the seed every new Process starts with (as its lone,
 * initially-hidden SOP), and what "+ Add SOP" appends.
 */
export function createBlankProcessSop(): ProcessSopValue {

    return {
        key: createProcessSopKey(),
        name: "",
        purpose: "",
        who: "",
        howOften: "",
        steps: [createBlankProcessStep()]
    };

}

/**
 * Builds a single blank Process, seeded with one blank SOP
 * -- what "+ Add Process" appends, and what a fresh Process
 * Library Section starts with (see defaultAnswerValue).
 */
export function createBlankProcess(): ProcessRecordValue {

    return {
        key: createProcessKey(),
        name: "",
        purpose: "",
        who: "",
        howOften: "",
        status: "",
        sops: [createBlankProcessSop()]
    };

}

/**
 * A single Operational Log entry -- auto-generated whenever
 * the user leaves Process Library (Section 2) having actually
 * changed something (see generateOperationalLogEntriesFromProcessLibrary),
 * NOT independently authored. `date`, `processKey`,
 * `ownerOfChange`, and `description` are all filled in by that
 * generator and never hand-edited; `notes` is the one field
 * left for the user to actually write into (see
 * OperationalLogEditor.tsx).
 *
 * `key` is the same kind of stable, never-user-facing
 * identifier as ProcessRecordValue.key -- needed here
 * specifically because the table is always kept sorted by
 * `date`, most recent first (see sortOperationalLogRows), so a
 * row's ARRAY INDEX changes the moment its date does; editing
 * (its Notes) by index alone would silently touch the wrong
 * entry the instant a re-sort moved it.
 *
 * `processKey` links this entry back to the Process in the
 * same System's Process Library (Section 2) whose edit it
 * records, by that Process's OWN stable `key` -- not its
 * display id or name, both of which can change out from under
 * a log entry that pointed at them. `ownerOfChange` is a
 * SNAPSHOT of that Process's Owner at the moment this entry
 * was generated (linked from Process Library / Roles &
 * Responsibilities' own Owner data, not independently typed
 * here) -- kept as a copy, not a live lookup, so this entry's
 * history stays accurate even if the Process's Owner is
 * reassigned later.
 */
export interface OperationalLogRowValue {
    key: string;
    date: string;
    processKey: string;
    ownerOfChange: string;
    description: string;
    notes: string;
}

/**
 * Runtime value shape for an Operational Log answer -- always
 * kept sorted by `date` (see sortOperationalLogRows), MOST
 * RECENT first, blank dates last.
 */
export type OperationalLogAnswerValue = OperationalLogRowValue[];

let operationalLogRowKeyCounter = 0;

/**
 * Creates a fresh, stable OperationalLogRowValue.key -- same
 * idiom as createProcessKey above.
 */
export function createOperationalLogRowKey(): string {

    operationalLogRowKeyCounter += 1;

    return `log-row-${Date.now()}-${operationalLogRowKeyCounter}`;

}

/**
 * Sorts Operational Log entries chronologically, MOST RECENT
 * first, by their `date` (ISO "YYYY-MM-DD", so a plain string
 * comparison already sorts correctly) -- entries with no date
 * yet sort after every dated entry, in their existing relative
 * order (a stable sort), rather than jumping to the top (an
 * entry with no date isn't "recent", it's incomplete). Used
 * both by the live editor (every add/edit re-sorts immediately)
 * and defensively by export, so the two can never disagree.
 */
export function sortOperationalLogRows(rows: OperationalLogRowValue[]): OperationalLogRowValue[] {

    return [...rows].sort((a, b) => {

        const aDate = a.date.trim();
        const bDate = b.date.trim();

        if (aDate.length === 0 && bDate.length === 0) {
            return 0;
        }

        if (aDate.length === 0) {
            return 1;
        }

        if (bDate.length === 0) {
            return -1;
        }

        return aDate < bDate ? 1 : aDate > bDate ? -1 : 0;

    });

}

/**
 * Resolves an Operational Log entry's `processKey` into the
 * same "PRC-001 · Process Name" label the live editor's own
 * Process ID picker shows -- shared so the picker and export
 * (and the live table's own read-only display of an already-
 * chosen Process) can never disagree. Returns "" when
 * `processKey` is blank or no longer matches any current
 * Process (e.g. that Process was since deleted).
 */
export function resolveProcessLogLabel(processKey: string, processes: ProcessRecordValue[]): string {

    if (processKey.trim().length === 0) {
        return "";
    }

    const processIndex = processes.findIndex(process => process.key === processKey);

    if (processIndex === -1) {
        return "";
    }

    const process = processes[processIndex];

    const namePart = process.name.trim().length > 0 ? process.name.trim() : "Untitled Process";

    return `${processDisplayId(processes, processIndex)} · ${namePart}`;

}

/**
 * Resolves an Operational Log entry's `processKey` into just
 * that Process's own display ID ("PRC-001"), with none of
 * resolveProcessLogLabel's " · Name" suffix -- what the
 * Operational Log's own read-only Process ID column shows.
 * Same "" fallback as resolveProcessLogLabel for a blank or
 * no-longer-matching key.
 */
export function resolveProcessId(processKey: string, processes: ProcessRecordValue[]): string {

    if (processKey.trim().length === 0) {
        return "";
    }

    const processIndex = processes.findIndex(process => process.key === processKey);

    if (processIndex === -1) {
        return "";
    }

    return processDisplayId(processes, processIndex);

}

// =====================================================================
// Operational Log auto-generation -- diffs a Process's current field
// values against a snapshot of its values as of the last time the Log
// was updated for it, and turns any real differences into a new,
// auto-written Operational Log entry. See ProcessRecordValue.
// lastLoggedSnapshot's own doc comment for where the snapshot itself
// lives, and Conversation.tsx's own call site (on leaving Process
// Library) for when this actually runs.
// =====================================================================

/**
 * A single Step's own field values, as of the last time the Log
 * was updated for its Process -- see ProcessChangeSnapshot below.
 */
interface ProcessStepSnapshot {
    key: string;
    action: string;
}

/**
 * A single SOP's own field values (and its Steps' own
 * key-matched snapshots), as of the last time the Log was
 * updated for its Process.
 */
interface ProcessSopSnapshot {
    key: string;
    id?: string;
    name: string;
    purpose: string;
    who: string;
    howOften: string;
    steps: ProcessStepSnapshot[];
}

/**
 * A Process's own field values (and its SOPs'/Steps' own
 * key-matched snapshots), as of the last time the Operational
 * Log was updated for it -- see ProcessRecordValue.
 * lastLoggedSnapshot.
 */
interface ProcessChangeSnapshot {
    name: string;
    purpose: string;
    who: string;
    howOften: string;
    status: string;
    sops: ProcessSopSnapshot[];
}

/**
 * Captures a Process's CURRENT field values into a fresh
 * snapshot -- used both to seed `lastLoggedSnapshot` (silently,
 * no Log entry -- see StorageService's normalize step) and to
 * refresh it after generating a Log entry for real changes (see
 * generateOperationalLogEntriesFromProcessLibrary).
 */
function captureProcessSnapshot(process: ProcessRecordValue): ProcessChangeSnapshot {

    return {
        name: process.name,
        purpose: process.purpose,
        who: process.who,
        howOften: process.howOften,
        status: process.status,
        sops: (Array.isArray(process.sops) ? process.sops : []).map(sop => ({
            key: sop.key,
            id: sop.id,
            name: sop.name,
            purpose: sop.purpose,
            who: sop.who,
            howOften: sop.howOften,
            steps: (Array.isArray(sop.steps) ? sop.steps : []).map(step => ({
                key: step.key,
                action: step.action
            }))
        }))
    };

}

/**
 * The three change-kind groupings the Operational Log's
 * auto-written Description sorts every detected change into --
 * matches exactly the "Updates: / Addition: / Removal:" section
 * labels formatProcessChangeDescription below writes out. Each
 * line is already formatted as "<location> / <field>" (or, for
 * a whole new SOP, "<SOP id> / Step <numbers>") -- ready to join
 * one per line under its section.
 */
interface ProcessChangeSummary {
    updates: string[];
    additions: string[];
    removals: string[];
}

const PROCESS_FIELD_LABELS: Array<{ key: "name" | "purpose" | "who" | "howOften" | "status"; label: string }> = [
    { key: "name", label: "Name" },
    { key: "purpose", label: "Purpose" },
    { key: "who", label: "Owner" },
    { key: "howOften", label: "Frequency" },
    { key: "status", label: "Status" }
];

const SOP_FIELD_LABELS: Array<{ key: "name" | "purpose" | "who" | "howOften"; label: string }> = [
    { key: "name", label: "Name" },
    { key: "purpose", label: "Purpose" },
    { key: "who", label: "Owner" },
    { key: "howOften", label: "Frequency" }
];

/**
 * Compares a Process's CURRENT field values against a snapshot
 * of what they were as of the last Operational Log update for
 * it, and returns every real difference found -- text changes
 * (Process-level fields, an existing SOP's Name/Purpose, an
 * existing Step's action text), additions (a whole new SOP --
 * summarized as one line covering it and whichever Steps it
 * already has filled in, or a new Step within an existing SOP),
 * and removals (an existing SOP or Step no longer present),
 * each matched by stable `key` rather than array position (so
 * reordering alone -- with no other change -- produces nothing
 * here; see ProcessSopValue.key / ProcessStepValue.key).
 *
 * `oldSnapshot` being undefined means this Process has never
 * been through this cycle before -- either it's genuinely new
 * (added after the session's baseline was established -- see
 * lastLoggedSnapshot's own doc comment), in which case a
 * non-blank Process is reported as one single Addition line, or
 * it's still entirely blank (just added, nothing typed into it
 * yet), in which case nothing is reported at all.
 *
 * Takes the full `processes` list (not just this one Process),
 * same reason as processDisplayId above -- its own ID label
 * (and every one of its SOPs' own ID labels) needs to see every
 * OTHER row to count correctly.
 */
export function diffProcessAgainstSnapshot(
    processes: ProcessRecordValue[],
    processIndex: number,
    oldSnapshot: ProcessChangeSnapshot | undefined
): ProcessChangeSummary {

    const updates: string[] = [];
    const additions: string[] = [];
    const removals: string[] = [];

    const process = processes[processIndex];
    const processLabel = processDisplayId(processes, processIndex);
    const sops = Array.isArray(process.sops) ? process.sops : [];

    if (!oldSnapshot) {

        const hasContent =
            process.name.trim().length > 0 ||
            process.purpose.trim().length > 0 ||
            process.who.trim().length > 0 ||
            process.howOften.trim().length > 0 ||
            process.status.trim().length > 0 ||
            sops.some(sop =>
                sop.name.trim().length > 0 ||
                sop.purpose.trim().length > 0 ||
                (Array.isArray(sop.steps) ? sop.steps : []).some(step => step.action.trim().length > 0)
            );

        if (hasContent) {
            const namePart = process.name.trim().length > 0 ? process.name.trim() : "Untitled Process";
            additions.push(`${processLabel} · ${namePart}`);
        }

        return { updates, additions, removals };

    }

    PROCESS_FIELD_LABELS.forEach(({ key, label }) => {

        if ((oldSnapshot[key] ?? "").trim() !== (process[key] ?? "").trim()) {
            updates.push(`${processLabel} / ${label}`);
        }

    });

    const oldSopsByKey = new Map(oldSnapshot.sops.map(sop => [sop.key, sop]));
    const newSopKeys = new Set(sops.map(sop => sop.key));

    sops.forEach((sop, sopIndex) => {

        const sopLabel = sopDisplayId(sops, sopIndex);
        const oldSop = oldSopsByKey.get(sop.key);
        const steps = Array.isArray(sop.steps) ? sop.steps : [];

        if (!oldSop) {

            const filledStepNumbers = steps
                .map((step, stepIndex) => ({ step, stepIndex }))
                .filter(({ step }) => step.action.trim().length > 0)
                .map(({ stepIndex }) => String(stepIndex + 1));

            additions.push(
                filledStepNumbers.length > 0
                    ? `${sopLabel} / Step ${filledStepNumbers.join("/")}`
                    : sopLabel
            );

            return;

        }

        SOP_FIELD_LABELS.forEach(({ key, label }) => {

            if ((oldSop[key] ?? "").trim() !== (sop[key] ?? "").trim()) {
                updates.push(`${sopLabel} / ${label}`);
            }

        });

        const oldStepsByKey = new Map(oldSop.steps.map(step => [step.key, step]));
        const newStepKeys = new Set(steps.map(step => step.key));

        const addedStepNumbers: string[] = [];

        steps.forEach((step, stepIndex) => {

            const oldStep = oldStepsByKey.get(step.key);

            if (!oldStep) {
                if (step.action.trim().length > 0) {
                    addedStepNumbers.push(String(stepIndex + 1));
                }
                return;
            }

            if (oldStep.action.trim() !== step.action.trim()) {
                updates.push(`${sopLabel} / Step ${stepIndex + 1}`);
            }

        });

        if (addedStepNumbers.length > 0) {
            additions.push(`${sopLabel} / Step ${addedStepNumbers.join("/")}`);
        }

        const removedStepNumbers: string[] = [];

        oldSop.steps.forEach((oldStep, oldStepIndex) => {
            if (!newStepKeys.has(oldStep.key) && oldStep.action.trim().length > 0) {
                removedStepNumbers.push(String(oldStepIndex + 1));
            }
        });

        if (removedStepNumbers.length > 0) {
            removals.push(`${sopLabel} / Step ${removedStepNumbers.join("/")}`);
        }

    });

    oldSnapshot.sops.forEach((oldSop, oldSopIndex) => {

        if (newSopKeys.has(oldSop.key)) {
            return;
        }

        const hadContent =
            oldSop.name.trim().length > 0 ||
            oldSop.purpose.trim().length > 0 ||
            oldSop.steps.some(step => step.action.trim().length > 0);

        if (!hadContent) {
            return;
        }

        // `oldSnapshot.sops` -- not the live `sops` above, which no
        // longer contains this one -- is the exact historical list
        // sopDisplayId needs to recompute the SAME label this SOP
        // showed the last time it was actually on screen.
        removals.push(sopDisplayId(oldSnapshot.sops, oldSopIndex));

    });

    return { updates, additions, removals };

}

/**
 * Turns a ProcessChangeSummary into the Operational Log's
 * auto-written Description text -- one section per change kind
 * that actually has anything in it ("Updates:" / "Addition:" /
 * "Removal:"), one line per change under its section, sections
 * separated by a blank line. Returns "" when nothing changed at
 * all (the caller uses that to decide whether a Log entry needs
 * generating in the first place).
 */
export function formatProcessChangeDescription(summary: ProcessChangeSummary): string {

    const sections: string[] = [];

    if (summary.updates.length > 0) {
        sections.push(`Updates:\n${summary.updates.join("\n")}`);
    }

    if (summary.additions.length > 0) {
        sections.push(`Addition:\n${summary.additions.join("\n")}`);
    }

    if (summary.removals.length > 0) {
        sections.push(`Removal:\n${summary.removals.join("\n")}`);
    }

    return sections.join("\n\n");

}

/**
 * Today's date, in the same ISO ("YYYY-MM-DD") shape every
 * other stored date in the Framework uses -- local calendar
 * date, not UTC, so "today" always matches what the user's own
 * clock says regardless of timezone offset.
 */
export function todayIsoDate(): string {

    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${now.getFullYear()}-${month}-${day}`;

}

/**
 * The single entry point that turns "the user just left Process
 * Library" into an up-to-date Operational Log: diffs every
 * CURRENT Process against its own `lastLoggedSnapshot` (skipping
 * any Process with no snapshot at all yet -- see
 * seedProcessSnapshots below, which StorageService always runs
 * first so this only ever sees "no snapshot" for a Process
 * that's genuinely new this session), appends one new entry per
 * Process with real changes (today's date, that Process's own
 * `key`/current Owner, and the formatted diff as Description),
 * re-sorts the Log, and refreshes every diffed Process's
 * `lastLoggedSnapshot` to its current values either way (changed
 * or not) so the next diff starts from a clean baseline.
 *
 * Returns both the (possibly snapshot-refreshed) Processes and
 * the (possibly appended) Log rows -- the caller persists both
 * back into their own Sections together, since a generated entry
 * and the snapshot that stops it being generated again are one
 * atomic step.
 */
export function generateOperationalLogEntriesFromProcessLibrary(
    processes: ProcessRecordValue[],
    existingLogRows: OperationalLogRowValue[]
): { processes: ProcessRecordValue[]; logRows: OperationalLogRowValue[] } {

    const today = todayIsoDate();
    const newRows: OperationalLogRowValue[] = [];

    const updatedProcesses = processes.map((process, processIndex) => {

        if (!process.lastLoggedSnapshot) {

            const summary = diffProcessAgainstSnapshot(processes, processIndex, undefined);
            const description = formatProcessChangeDescription(summary);

            if (description.length > 0) {
                newRows.push({
                    key: createOperationalLogRowKey(),
                    date: today,
                    processKey: process.key,
                    ownerOfChange: process.who,
                    description,
                    notes: ""
                });
            }

            return { ...process, lastLoggedSnapshot: captureProcessSnapshot(process) };

        }

        const summary = diffProcessAgainstSnapshot(processes, processIndex, process.lastLoggedSnapshot);
        const description = formatProcessChangeDescription(summary);

        if (description.length === 0) {
            return process;
        }

        newRows.push({
            key: createOperationalLogRowKey(),
            date: today,
            processKey: process.key,
            ownerOfChange: process.who,
            description,
            notes: ""
        });

        return { ...process, lastLoggedSnapshot: captureProcessSnapshot(process) };

    });

    const logRows = newRows.length > 0
        ? sortOperationalLogRows([...existingLogRows, ...newRows])
        : existingLogRows;

    return { processes: updatedProcesses, logRows };

}

/**
 * Silently backfills `lastLoggedSnapshot` on every Process that
 * doesn't have one yet, WITHOUT generating any Operational Log
 * entries -- establishes (or extends, for newly-added Processes
 * found on a later load) the baseline
 * generateOperationalLogEntriesFromProcessLibrary diffs against,
 * so a session's pre-existing Processes never all look "newly
 * added" the first time a diff actually runs. Always run first
 * (see StorageService's normalize step, on every Operations
 * System session load) -- generateOperationalLogEntriesFromProcessLibrary
 * itself only ever sees a missing snapshot for a Process that's
 * genuinely new since the last load.
 */
export function seedProcessSnapshots(processes: ProcessRecordValue[]): ProcessRecordValue[] {

    return processes.map(process =>
        process.lastLoggedSnapshot
            ? process
            : { ...process, lastLoggedSnapshot: captureProcessSnapshot(process) }
    );

}

/**
 * Runtime value shape for a Roles & Responsibilities answer:
 * NOT a list of independently-authored rows (see the
 * RolesResponsibilities AnswerType's own doc comment) --
 * every Process with a non-blank Owner in the Process
 * Library (Section 2) becomes one "Responsibility" entry
 * automatically, grouped by Owner. The only thing actually
 * stored here is each Process's own Notes, keyed by that
 * Process's stable `key` (so a Note stays attached to the
 * right Process even if its name, Owner, or position later
 * changes). A key with no corresponding Process anymore
 * (e.g. that Process was deleted) is simply never rendered --
 * left in place rather than pruned, in case the deletion was
 * a mistake since undone by re-adding an equivalent Process
 * (which would get a NEW key, so this is really just inert
 * leftover data, not a live re-attachment).
 */
export type RolesResponsibilitiesAnswerValue = Record<string, string>;

/**
 * One Process, grouped under its Owner, ready to render as a
 * "Responsibility" -- computed fresh from the current Process
 * Library + Roles & Responsibilities responses by both the
 * live editor (RolesResponsibilitiesEditor.tsx) and export
 * (buildAnswerBlocks below), so the two can never disagree on
 * grouping/ordering.
 */
interface RolesResponsibilityEntry {
    process: ProcessRecordValue;
    processIndex: number;
    notes: string;
}

/**
 * One Owner's group of Responsibilities, in Process Library
 * order.
 */
interface RolesResponsibilityGroup {
    owner: string;
    entries: RolesResponsibilityEntry[];
}

/**
 * Groups every Process with a non-blank Owner by that Owner,
 * in Process Library order within each group, with the groups
 * themselves sorted alphabetically (case-insensitive) by
 * Owner -- the single shared computation behind both the live
 * editor and export, so "the table is alphabetical" and "a
 * Responsibility's position follows the Process Library" (see
 * the RolesResponsibilities AnswerType's own doc comment) are
 * guaranteed to actually match what's rendered.
 */
export function groupRolesResponsibilities(
    processes: ProcessRecordValue[],
    notes: RolesResponsibilitiesAnswerValue
): RolesResponsibilityGroup[] {

    const groupsByOwner = new Map<string, RolesResponsibilityGroup>();

    processes.forEach((process, processIndex) => {

        const owner = process.who.trim();

        if (owner.length === 0) {
            return;
        }

        let group = groupsByOwner.get(owner);

        if (!group) {
            group = { owner, entries: [] };
            groupsByOwner.set(owner, group);
        }

        group.entries.push({
            process,
            processIndex,
            notes: notes[process.key] ?? ""
        });

    });

    return Array.from(groupsByOwner.values()).sort(
        (a, b) => a.owner.localeCompare(b.owner, undefined, { sensitivity: "base" })
    );

}

/**
 * Determines whether a single table cell has been
 * filled in, aware of the multi-entry ("list") cell
 * shape (an array of strings) as well as plain
 * text/date/field cells (a single string).
 */
function isCellFilled(cell: unknown): boolean {

    if (Array.isArray(cell)) {

        return cell.some(
            item => typeof item === "string" && item.trim().length > 0
        );

    }

    return typeof cell === "string" && cell.trim().length > 0;

}

/**
 * Determines whether a SINGLE Table row has every one
 * of its visible columns filled in -- the same rule
 * `isAnswerEmpty` applies across every row of a whole
 * Table, but scoped to just one row.
 *
 * Used by the Product Development System's "Finish"
 * validation (see Conversation.tsx): the shared Product
 * Register (Section 1) holds every Product's row, but
 * finishing one Product's interview should only require
 * THAT Product's own row to be complete, not every other
 * Product's row too.
 */
export function isTableRowComplete(
    columns: TableColumnDefinition[],
    row: TableAnswerRow
): boolean {

    return columns.every(column => isCellFilled(row[column.id]));

}

/**
 * Returns the empty/default value appropriate
 * for the supplied Answer Definition.
 *
 * Used to seed a Section's response before the
 * user has entered anything.
 */
export function defaultAnswerValue(answer: AnswerDefinition): unknown {

    switch (answer.type) {

        case AnswerType.FixedVariantText:
        case AnswerType.TLayoutText:
            return {};

        // Object-shaped from the very first render. Without these
        // three, the switch fell through to its "" default, so an
        // untouched Brand page persisted an empty STRING -- which
        // then looked exactly like the old string-shaped Brand
        // answers to StorageService's legacy check, and got the
        // whole System wiped on the next load, uploaded images
        // included.
        case AnswerType.BrandStyle:
            return asBrandStyleValue(undefined);

        case AnswerType.BrandInventory:
            return asBrandInventoryValue(undefined);

        // Object-shaped for the same reason the Brand pages are.
        case AnswerType.LegalEntity:
            return asLegalEntityValue(undefined);

        case AnswerType.FoundersProfile:
            return asFoundersProfileValue(undefined);

        // A Shared Answer stores nothing of its own -- the Section
        // it mirrors owns the value. Null rather than "" so it is
        // never mistaken for a real, string-shaped answer.
        case AnswerType.SharedAnswer:
            return null;

        // Object-shaped for the same reason the Brand pages are.
        case AnswerType.StrategyFoundation:
            return asStrategyFoundationValue(undefined);

        case AnswerType.StrategicPeriod:
            return asStrategicPeriodValue(undefined);

        // The Roadmap is drawn entirely from the other two pages
        // and stores nothing of its own. Null rather than "" so it
        // is never mistaken for a real, string-shaped answer.
        case AnswerType.StrategicRoadmap:
            return null;

        case AnswerType.Table: {

            // Tables always start with one row -- an
            // empty table with only an "Add Row" button
            // reads as broken, not as "nothing entered
            // yet".
            const columns = visibleTableColumns(answer.table?.columns ?? []);

            const row: TableAnswerRow = {};

            // A `repeatable`/`repeatableValue` column's cell holds a
            // LIST of values (see DynamicTable's own `createRow`) --
            // seeded here the same way, so the very first row a
            // fresh Table starts with already has the right shape
            // instead of relying on DynamicTable to paper over a
            // lone scalar default the first time it renders.
            columns.forEach(column => {
                row[column.id] = (column.repeatable || column.repeatableValue) ? [""] : "";
            });

            return [row];

        }

        case AnswerType.Checklist:

            // A Checklist always starts with one blank item --
            // matches Table's "always at least one row" and
            // avoids an empty state where the only thing on
            // screen is an "Add Item" button.
            return [{ id: "checklist-item-default-1", text: "", checked: false }];

        case AnswerType.CardList: {

            const values: CardListAnswerValue = {};

            for (const card of answer.cards ?? []) {
                values[card.id] = [{ id: `${card.id}-default-1`, text: "" }];
            }

            return values;

        }

        case AnswerType.ProfileCards: {

            const profile = answer.profile;
            const count = Math.max(0, profile?.initialCount ?? 1);

            const cards: ProfileCardValue[] = Array.from(
                { length: count },
                (_, index) => ({
                    id: `card-${index + 1}`,
                    title: "",
                    sections: {}
                })
            );

            const value: ProfileCardsAnswerValue = { cards };

            if (profile?.trailingCard) {
                value.trailing = "";
            }

            return value;

        }

        case AnswerType.ProcessLibrary:

            // One blank Process (itself seeded with one blank,
            // initially-hidden SOP holding one blank Step) -- an
            // empty Process Library with only an "Add Process"
            // button reads as broken, matching every other
            // "always at least one row/item" default above.
            return [createBlankProcess()];

        case AnswerType.OperationalLog:

            // Nothing to seed -- every entry here is auto-generated
            // from Process Library edits (see
            // generateOperationalLogEntriesFromProcessLibrary), not
            // independently authored, so an empty Log is a
            // genuinely complete starting point (same reasoning as
            // Roles & Responsibilities below).
            return [];

        case AnswerType.RolesResponsibilities:

            // Nothing to seed -- every "row" here is DERIVED from
            // Process Library (see groupRolesResponsibilities), so
            // an empty Notes map is a genuinely complete starting
            // point, not "nothing entered yet".
            return {};

        case AnswerType.MultiPart: {

            // One entry per part, each seeded with THAT part's own
            // default value (recursively -- a part can itself be
            // anything a whole Section could be) -- e.g. Financial
            // Risk's Description/Evaluation/Mitigation Measures/
            // Contingency Plan each start with their own one blank
            // Table row, exactly as if each were its own Section.
            const value: Record<string, unknown> = {};

            for (const part of answer.parts ?? []) {
                value[part.id] = defaultAnswerValue(part.answer);
            }

            return value;

        }

        case AnswerType.FreeText:
        default:
            return "";

    }

}

/**
 * Determines whether a Section response is
 * empty, in a way that is aware of the
 * Section's Answer Structure.
 */
export function isAnswerEmpty(answer: AnswerDefinition, value: unknown): boolean {

    switch (answer.type) {

        case AnswerType.FreeText:
            return typeof value !== "string" || value.trim().length === 0;

        case AnswerType.FixedVariantText:
        case AnswerType.TLayoutText: {

            if (!value || typeof value !== "object" || Array.isArray(value)) {
                return true;
            }

            const values = value as FixedVariantAnswerValue;

            return !Object.values(values).some(
                entry => typeof entry === "string" && entry.trim().length > 0
            );

        }

        case AnswerType.Table: {

            if (!Array.isArray(value) || value.length === 0) {
                return true;
            }

            // A row a user has added via "+ Add Row" but left
            // blank should NOT count as a completed answer --
            // every visible column of every row must be filled
            // for the Section to be considered complete.
            const columns = visibleTableColumns(answer.table?.columns ?? []);
            const rows = value as TableAnswerRow[];

            return rows.some(row =>
                columns.some(column => !isCellFilled(row[column.id]))
            );

        }

        case AnswerType.Checklist: {

            if (!Array.isArray(value) || value.length === 0) {
                return true;
            }

            const items = value as ChecklistItemValue[];

            return !items.some(
                item => typeof item.text === "string" && item.text.trim().length > 0
            );

        }

        case AnswerType.CardList: {

            if (!value || typeof value !== "object" || Array.isArray(value)) {
                return true;
            }

            const values = value as CardListAnswerValue;

            return !Object.values(values).some(items =>
                Array.isArray(items) && items.some(
                    item => typeof item.text === "string" && item.text.trim().length > 0
                )
            );

        }

        case AnswerType.ProfileCards: {

            if (!value || typeof value !== "object" || Array.isArray(value)) {
                return true;
            }

            const profileValue = value as ProfileCardsAnswerValue;
            const cards = Array.isArray(profileValue.cards) ? profileValue.cards : [];

            const cardsFilled = cards.some(card =>
                (typeof card.title === "string" && card.title.trim().length > 0) ||
                Object.values(card.sections ?? {}).some(
                    text => typeof text === "string" && text.trim().length > 0
                )
            );

            const trailingFilled =
                typeof profileValue.trailing === "string" &&
                profileValue.trailing.trim().length > 0;

            return !cardsFilled && !trailingFilled;

        }

        case AnswerType.ProcessLibrary: {

            // Complete once at least one Process has a name --
            // the same "at least one populated entry" bar as
            // Checklist/CardList above, rather than Table's
            // strict "every row, every column" rule. A Process
            // Library is a growing reference the user adds to
            // over time, not a fixed-shape form, so requiring
            // every Process to already have full SOPs/Steps
            // filled in would be far too strict.
            if (!Array.isArray(value)) {
                return true;
            }

            const processes = value as ProcessRecordValue[];

            return !processes.some(
                process => typeof process.name === "string" && process.name.trim().length > 0
            );

        }

        case AnswerType.OperationalLog:

            // Never flags this Section incomplete on its own --
            // every entry is auto-generated from Process Library
            // edits (see generateOperationalLogEntriesFromProcessLibrary),
            // not something the user is ever asked to fill in
            // directly, so there's nothing here for "complete" to
            // even mean (same reasoning as Roles & Responsibilities
            // below).
            return false;

        case AnswerType.RolesResponsibilities:

            // Never flags this Section incomplete on its own --
            // Owner/Responsibility are DERIVED from Process Library
            // (whose own completeness Section 2 already tracks, see
            // validateOperationsProcessOwnership in Conversation.tsx),
            // and Notes are a purely optional annotation, never
            // required. There is nothing this Section asks the user
            // to fill in directly.
            return false;

        case AnswerType.MultiPart: {

            // Complete once EVERY part has something in it -- same
            // "every visible column/every part filled" strictness
            // Table already applies to its own columns, extended
            // across parts instead of columns.
            const values: Record<string, unknown> =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as Record<string, unknown>
                    : {};

            return (answer.parts ?? []).some(
                part => isAnswerEmpty(part.answer, values[part.id])
            );

        }

        // Incomplete while ANY of the page's own sections is --
        // the per-section detail is what the completeness dialog
        // lists, so the two always agree (see
        // brandStyleSectionsEmpty / brandInventorySectionsEmpty).
        case AnswerType.BrandStyle:
            return brandStyleSectionsEmpty(value).some(Boolean);

        case AnswerType.BrandInventory:
            return brandInventorySectionsEmpty(value).some(Boolean);

        case AnswerType.LegalEntity:
            return legalEntitySectionsEmpty(value).some(Boolean);

        // Every question on it is optional -- a founder's profile
        // strengthens a plan, but no page is left unfinished for
        // the want of one.
        case AnswerType.FoundersProfile:
            return false;

        case AnswerType.BusinessFoundation:
            return businessFoundationSubsectionsEmpty(value).some(Boolean);

        case AnswerType.BusinessEngagement:
            return businessEngagementSectionsEmpty(value).some(Boolean);

        case AnswerType.BusinessCapability:
            return businessCapabilitySectionsEmpty(value).some(Boolean);

        case AnswerType.FinancialFoundation:
            return financialFoundationSectionsEmpty(value).some(Boolean);

        case AnswerType.FinancialSustainability:
            return financialSustainabilitySectionsEmpty(value).some(Boolean);

        // A Shared Answer holds no value of its own -- the Section
        // it mirrors owns the data, and that Section's own
        // completeness is what counts. Reported complete here so a
        // System is never blocked on data it doesn't store.
        case AnswerType.SharedAnswer:
            return false;

        case AnswerType.StrategyFoundation:
            return strategyFoundationSectionsEmpty(value).some(Boolean);

        // Judged by the validator instead, which can see the Themes
        // this page develops -- they live on the Foundation page, so
        // this page's own value cannot say whether anything is
        // missing. Reported complete here rather than guessing.
        case AnswerType.StrategicPeriod:
            return false;

        // Nothing on the Roadmap is editable, so there is nothing on
        // it to leave unfinished.
        case AnswerType.StrategicRoadmap:
            return false;

        default:
            return true;

    }

}

/**
 * One slot of the Brand System's palette.
 *
 * `enabled` is the slot's activation tick: a brand does not have
 * to define all six colours, so an unticked slot keeps whatever was
 * typed in it but is greyed out and excluded from completeness.
 * That is deliberately different from "blank" -- it lets someone
 * park a candidate colour without it counting as part of the
 * palette.
 */
interface BrandColourValue {
    enabled: boolean;
    name: string;
    hex: string;
    usage: string;
}

interface BrandTypefaceValue {
    enabled: boolean;
    font: string;
    purpose: string;
}

interface BrandHierarchyValue {
    enabled: boolean;
    size: string;
}

/**
 * One image asset held inline as a data URL. Stored inline rather
 * than as a file path because this app persists to localStorage and
 * has no filesystem access -- see BrandInventoryEditor for the
 * downscaling and size caps that keeps within.
 */
export interface BrandAssetValue {
    dataUrl: string;
    fileName: string;
}

interface BrandImageValue extends BrandAssetValue {
    name: string;
    description: string;
}

export interface BrandStyleAnswerValue {
    colours: BrandColourValue[];
    typefaces: BrandTypefaceValue[];
    hierarchy: Record<string, BrandHierarchyValue>;
    /** The Icon & Logo and the Brand Images: the Style page holds them too (they were a page of their own, "Inventory"). */
    inventory: BrandInventoryAnswerValue;
}

/**
 * The icon, or the logo: ONE file, an SVG or a PNG (`file`).
 *
 * The page used to ask for each mark twice, as an SVG and as a PNG,
 * and saved them under `svg` and `png`. Those are kept exactly as
 * saved -- never deleted -- and read through brandMarkFile: while
 * `file` is empty the saved SVG is shown in its place, else the
 * saved PNG. `null` is a file removed by hand, which shows nothing
 * even where an older one is still saved.
 */
export interface BrandMarkValue {
    file?: BrandAssetValue | null;
    png?: BrandAssetValue;
    svg?: BrandAssetValue;
}

export interface BrandInventoryAnswerValue {
    icon: BrandMarkValue;
    logo: BrandMarkValue;
    /**
     * What the logo and icon show, what they mean and how they are
     * to be used. Answers saved before it was asked load with it
     * empty.
     */
    markDescription: string;
    images: BrandImageValue[];
}

/** The one file a mark shows: its own, else a PNG or SVG saved by the page's earlier two-file version (see BrandMarkValue). */
export function brandMarkFile(mark: BrandMarkValue): BrandAssetValue | undefined {
    return mark.file === null ? undefined : mark.file ?? mark.svg ?? mark.png;
}

/**
 * The palette's 6 fixed slots in ROW-MAJOR order, because they
 * render as 3 rows of 2 (Primary A | Primary B, then Secondary,
 * then Neutral) inside a single "Colours" section -- not as two
 * separate A and B columns.
 *
 * `defaultEnabled` marks the slots a brand almost always has, so a
 * new palette starts with Primary A and Secondary A already ticked
 * rather than everything switched off.
 */
export const BRAND_COLOUR_SLOTS = [
    { id: "primary-a", label: "Primary A", defaultEnabled: true, dependsOn: undefined,
        help: "Use for the most frequently occurring and recognisable brand elements." },
    { id: "primary-b", label: "Primary B", defaultEnabled: false, dependsOn: "primary-a",
        help: "Use for elements that need stronger visual distinction within the primary palette." },
    { id: "secondary-a", label: "Secondary A", defaultEnabled: true, dependsOn: undefined,
        help: "Use for illustrations, categories and supporting visual elements." },
    { id: "secondary-b", label: "Secondary B", defaultEnabled: false, dependsOn: "secondary-a",
        help: "Use for additional visual variation where Secondary A is not sufficient." },
    { id: "neutral-a", label: "Neutral A", defaultEnabled: false, dependsOn: undefined,
        help: "Use for neutral surfaces, backgrounds and areas requiring minimal visual emphasis." },
    { id: "neutral-b", label: "Neutral B", defaultEnabled: false, dependsOn: "neutral-a",
        help: "Use for secondary neutral surfaces, borders, dividers and other low-emphasis elements." }
] as const;

export const BRAND_TYPEFACE_SLOTS = [
    { id: "primary", label: "Primary", defaultEnabled: true, dependsOn: undefined,
        help: "Use for headings, logo lockups, product names and other designated brand expressions." },
    { id: "secondary", label: "Secondary", defaultEnabled: false, dependsOn: undefined,
        help: "Use for body text, interface content and product descriptions." },
    { id: "optional", label: "Optional", defaultEnabled: false, dependsOn: "secondary",
        help: "Use for specific applications where an additional typographic character is useful." }
] as const;

/** Each level with its recommended size range: guidance, never enforced. */
export const BRAND_HIERARCHY_LEVELS = [
    { id: "h1", label: "H1 (Title)", defaultEnabled: true, dependsOn: undefined, range: "36–48" },
    { id: "h2", label: "H2 (Section)", defaultEnabled: false, dependsOn: undefined, range: "28–36" },
    { id: "h3", label: "H3 (Subsection)", defaultEnabled: false, dependsOn: "h2", range: "22–28" },
    { id: "body", label: "Body Text", defaultEnabled: true, dependsOn: undefined, range: "16–18" },
    { id: "caption", label: "Captions & Metadata / Interface", defaultEnabled: false, dependsOn: undefined, range: "12–14" }
] as const;

/**
 * Back to 2, matching the "Upload 2-5 images" guidance the page
 * states. Guidance and validation have to agree on what "done"
 * means -- while the wording said "up to 5" with no minimum, a
 * single image satisfied everything on screen yet was still flagged
 * in the completeness dialog with nothing explaining why.
 *
 * Doubles as the number of slots the editor always shows (see
 * asBrandInventoryValue), so the page opens with the two it asks
 * for rather than one "add" button.
 */
export const BRAND_IMAGE_MIN = 2;
export const BRAND_IMAGE_MAX = 5;

/**
 * The titles of the Brand Style and Brand Inventory pages' sections
 * (1-3 and 1-2, each page counting its own), used
 * both to head each section and to name it in the completeness
 * dialog.
 */
export const BRAND_STYLE_SECTIONS = ["Colours", "Typography", "Text Hierarchy"] as const;

export const BRAND_INVENTORY_SECTIONS = ["Icon & Logo", "Brand Images"] as const;

/** The Style page's sections: its own three, then the Icon & Logo and the Brand Images (once the Inventory page). */
export const BRAND_STYLE_PAGE_SECTIONS = [...BRAND_STYLE_SECTIONS, ...BRAND_INVENTORY_SECTIONS] as const;

/**
 * How many individually-numbered parts a Section contributes to its
 * System's running count -- the columns of a column-layout page, or
 * the named sections a Brand editor holds. Everything else
 * contributes 0, since it is numbered as a whole Section instead.
 *
 * Callers pass `resolveShared` so a Shared Answer can be counted by
 * what it actually renders: the Brand System's first page mirrors
 * four Identity columns, and those four have to be counted or its
 * Style page would start numbering at 1 instead of 5.
 */
export function numberedUnitCount(
    answer: AnswerDefinition | undefined,
    resolveShared?: (answer: AnswerDefinition) => AnswerDefinition | undefined
): number {

    if (!answer) {
        return 0;
    }

    if (answer.type === AnswerType.SharedAnswer) {
        const source = resolveShared?.(answer);
        return source ? numberedUnitCount(source, resolveShared) : 0;
    }

    if (answer.type === AnswerType.BrandStyle) {
        return BRAND_STYLE_PAGE_SECTIONS.length;
    }

    if (answer.type === AnswerType.BrandInventory) {
        return BRAND_INVENTORY_SECTIONS.length;
    }

    if (answer.type === AnswerType.StrategyFoundation) {
        return STRATEGY_FOUNDATION_SECTIONS.length;
    }

    // ONE, not six. The Legal Entity page takes a single number of
    // its own in a running count -- 9 after the Identity System's
    // two four-column pages -- and its six subsections number
    // themselves from inside it (1 to 6 under the page-by-page
    // numbering the Identity System uses), the way a Strategic
    // Theme numbers its Goals.
    if (answer.type === AnswerType.LegalEntity) {
        return 1;
    }

    // One, for the same reason: its two subsections number
    // themselves from inside it.
    if (answer.type === AnswerType.FoundersProfile) {
        return 1;
    }

    // The Strategy System's other two pages carry no numbers of
    // their own: page 2 expands the Foundation page's fourth
    // section (its Themes are 4.1, 4.2, ... and number themselves
    // from the nesting), and page 3 is a drawing of both.
    if (answer.type === AnswerType.StrategicPeriod ||
        answer.type === AnswerType.StrategicRoadmap) {
        return 0;
    }

    return answer.columns ? (answer.parts?.length ?? 0) : 0;

}

/**
 * Normalizes whatever is stored into a complete Brand Style value,
 * padding any missing slot so the editor can render every row
 * unconditionally. Tolerates a null/legacy value rather than
 * throwing -- the Brand System previously held a completely
 * different shape (see StorageService's own migration).
 */
export function asBrandStyleValue(value: unknown): BrandStyleAnswerValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Partial<BrandStyleAnswerValue>
        : {};

    const colours = BRAND_COLOUR_SLOTS.map((slot, index) => {
        const stored = Array.isArray(source.colours) ? source.colours[index] : undefined;
        return {
            enabled: typeof stored?.enabled === "boolean" ? stored.enabled : slot.defaultEnabled,
            name: typeof stored?.name === "string" ? stored.name : "",
            hex: typeof stored?.hex === "string" ? stored.hex : "",
            usage: typeof stored?.usage === "string" ? stored.usage : ""
        };
    });

    const typefaces = BRAND_TYPEFACE_SLOTS.map((slot, index) => {
        const stored = Array.isArray(source.typefaces) ? source.typefaces[index] : undefined;
        return {
            enabled: typeof stored?.enabled === "boolean" ? stored.enabled : slot.defaultEnabled,
            font: typeof stored?.font === "string" ? stored.font : "",
            purpose: typeof stored?.purpose === "string" ? stored.purpose : ""
        };
    });

    const storedHierarchy =
        source.hierarchy && typeof source.hierarchy === "object"
            ? source.hierarchy as Record<string, unknown>
            : {};

    const hierarchy: Record<string, BrandHierarchyValue> = {};

    for (const level of BRAND_HIERARCHY_LEVELS) {
        const stored = storedHierarchy[level.id];
        const record = stored && typeof stored === "object"
            ? stored as Partial<BrandHierarchyValue>
            : {};
        hierarchy[level.id] = {
            enabled: typeof record.enabled === "boolean" ? record.enabled : level.defaultEnabled,
            size: typeof record.size === "string" ? record.size : ""
        };
    }

    return { colours, typefaces, hierarchy, inventory: asBrandInventoryValue(source.inventory) };

}

/**
 * Normalizes whatever the user typed into a HEX value the colour
 * sample and the colour picker can both use.
 *
 * Accepts "#1a2b3c", "1a2b3c", "#abc" and "abc" -- people paste HEX
 * with and without the hash, and 3-digit shorthand is common in
 * brand guidelines. Anything that isn't a complete 3- or 6-digit
 * HEX returns undefined, so a half-typed value shows as "nothing
 * chosen" rather than flashing through wrong colours per keystroke.
 */
export function normalizeHex(input: string): string | undefined {

    const raw = input.trim().replace(/^#/, "");

    if (!/^[0-9a-f]{3}$/i.test(raw) && !/^[0-9a-f]{6}$/i.test(raw)) {
        return undefined;
    }

    const full = raw.length === 3
        ? raw.split("").map(character => character + character).join("")
        : raw;

    return `#${full.toLowerCase()}`;

}

/**
 * Whether each of the Style page's three sections (Colours,
 * Typography, Text Hierarchy) still needs attention. Only ACTIVATED
 * slots count -- an unticked slot is a deliberate "this brand
 * doesn't use one", not an unfinished field.
 */
export function brandStyleSectionsEmpty(value: unknown): boolean[] {

    const style = asBrandStyleValue(value);

    const colours = style.colours.filter(colour => colour.enabled);
    const typefaces = style.typefaces.filter(typeface => typeface.enabled);
    const levels = BRAND_HIERARCHY_LEVELS
        .map(level => style.hierarchy[level.id])
        .filter(level => level.enabled);

    // A whole HEX, as normalizeHex accepts it (#RGB or #RRGGBB, the
    // # optional), and a size of 8 px or more.
    const wholeHex = (hex: string) => normalizeHex(hex) !== undefined;
    const readableSize = (size: string) => /^\d+$/.test(size.trim()) && Number(size.trim()) >= 8;

    return [
        colours.length === 0 || colours.some(colour => !wholeHex(colour.hex)),
        typefaces.length === 0 || typefaces.some(typeface => typeface.font.trim().length === 0),
        levels.length === 0 || levels.some(level => !readableSize(level.size)),
        ...brandInventorySectionsEmpty(style.inventory)
    ];

}

/**
 * Normalizes whatever is stored into a complete Brand Inventory
 * value. Same tolerance as asBrandStyleValue above.
 */
export function asBrandInventoryValue(value: unknown): BrandInventoryAnswerValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Partial<BrandInventoryAnswerValue>
        : {};

    const asset = (input: unknown): BrandAssetValue | undefined => {

        if (!input || typeof input !== "object") {
            return undefined;
        }

        const record = input as Partial<BrandAssetValue>;

        return typeof record.dataUrl === "string" && record.dataUrl.length > 0
            ? { dataUrl: record.dataUrl, fileName: String(record.fileName ?? "") }
            : undefined;

    };

    const mark = (input: unknown): BrandMarkValue => {
        const record = input && typeof input === "object" ? input as Record<string, unknown> : {};
        return {
            file: record.file === null ? null : asset(record.file),
            png: asset(record.png),
            svg: asset(record.svg)
        };
    };

    const images = (Array.isArray(source.images) ? source.images : [])
        .slice(0, BRAND_IMAGE_MAX)
        .map(stored => ({
            dataUrl: typeof stored?.dataUrl === "string" ? stored.dataUrl : "",
            fileName: typeof stored?.fileName === "string" ? stored.fileName : "",
            name: typeof stored?.name === "string" ? stored.name : "",
            description: typeof stored?.description === "string" ? stored.description : ""
        }));

    // Always at least the 2 the page asks for, so both slots -- each
    // with its Name and Short Description beside it -- are on screen
    // from the start rather than hidden behind an "add" button. An
    // empty slot simply carries no dataUrl, which is what the
    // completeness check already counts on.
    while (images.length < BRAND_IMAGE_MIN) {
        images.push({ dataUrl: "", fileName: "", name: "", description: "" });
    }

    return {
        icon: mark(source.icon),
        logo: mark(source.logo),
        markDescription: typeof source.markDescription === "string" ? source.markDescription : "",
        images
    };

}

/**
 * Whether each of the Inventory page's two sections (Icon & Logo,
 * Brand Images) still needs attention.
 */
export function brandInventorySectionsEmpty(value: unknown): boolean[] {

    const inventory = asBrandInventoryValue(value);

    // As the page asks: one icon and one logo, each an SVG or a PNG.
    const marksComplete = !!brandMarkFile(inventory.icon) && !!brandMarkFile(inventory.logo);

    const usableImages = inventory.images.filter(image => !!image.dataUrl);

    return [!marksComplete, usableImages.length < BRAND_IMAGE_MIN];

}

/**
 * A structured, format-agnostic piece of exportable
 * Section content. Each export format (Markdown, PDF)
 * renders these idiomatically -- a real <table> in
 * PDF, an escaped pipe table in Markdown, and so on --
 * instead of every format sharing one lossy plain-text
 * shape (which is what made Tables and Checklists show
 * up as raw, unrendered syntax in the PDF export).
 */
export type ExportBlock =
    /** `label`, where there is one, is set in bold before the text: "Mission: …". */
    | { kind: "paragraph"; text: string; label?: string }
    /** Level 2 sits under level 1: a Profile under its Segment. */
    | { kind: "subheading"; text: string; level?: 1 | 2 }
    | { kind: "table"; headers: string[]; rows: string[][] }
    | { kind: "checklist"; items: { text: string; checked: boolean }[] }
    | { kind: "list"; items: { text: string; indent: number }[]; ordered?: boolean }
    /**
     * Pictures, each with its words beneath: the brand's logo, icon
     * and images in the Business Plan's brand guide. `src` is the
     * image as the Brand System saved it, a data URL. `marks`: a logo
     * and an icon, printed smaller than a photograph.
     */
    | { kind: "images"; items: ExportImage[]; marks?: boolean };

/** One picture in an export (see ExportBlock "images", ExportContent.documentLogo). */
export interface ExportImage {
    src: string;
    alt: string;
    /** Set in bold under the picture: "Logo", an image's name. */
    title?: string;
    /** Under the title: what the picture shows. */
    caption?: string;
}

/**
 * Whether a picture can go into an export: a base64 data URL of a
 * PNG, JPEG, GIF, WebP or SVG -- what the Brand System stores. The
 * exports write `src` into markup, so anything else is left out
 * rather than escaped.
 */
export function isExportableImage(src: string): boolean {
    return /^data:image\/(png|jpeg|gif|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/.test(src);
}

/**
 * Per-call rendering tweaks for buildAnswerBlocks, read only by
 * the Answer Structures that need them (currently just Process
 * Library) -- every other Structure ignores this parameter
 * entirely, so it stays optional rather than growing every
 * Structure's own signature.
 */
/**
 * What a page answered against other pages needs to export: the
 * other Sections of its own System, by Answer Structure, and the
 * facts read from the Identity System. See ExportRenderers.ts.
 */
export interface ExportContext {
    responseOf?: (type: AnswerType) => unknown;
    legalEntity?: LegalEntityValue;
    /** The Identity System's Founders Profile, as saved (see founderProfiles). */
    foundersProfile?: unknown;
    currency?: string;
}

export interface BuildAnswerBlocksOptions {

    /** For the pages with an editor of their own (see ExportRenderers.ts). */
    context?: ExportContext;

    /**
     * Process Library only: normally a Process with exactly 1 SOP
     * collapses that SOP's own heading away (see the collapse rule
     * on ProcessLibraryEditor.tsx) and shows its Steps directly
     * under the Process. When exporting a caller-filtered set of
     * SOPs (e.g. the "Selected SOPs" export scope in Conversation.
     * tsx), a Process can end up with just 1 SOP in the filtered
     * data purely because the others were filtered OUT -- not
     * because the Process itself only ever had 1. Collapsing that
     * away would silently hide which specific SOP the user chose
     * to export. Setting this to true always shows each SOP's own
     * "SOP-01.2 · Name" heading, regardless of how many SOPs
     * remain after filtering.
     */
    forceExpandProcessSops?: boolean;

    /**
     * Operational Log and Roles & Responsibilities only: the
     * SAME Operations System session's current Process Library
     * (Section 2) response, needed to resolve an Operational Log
     * entry's `processKey` into a "PRC-001 · Name" label, and to
     * group Roles & Responsibilities' Notes by Process Owner (see
     * groupRolesResponsibilities). The Framework Engine has no
     * built-in notion of "read another Section's response while
     * exporting this one", so the caller (see
     * ExportContentBuilder.buildExportContent's own
     * `sectionBlockOptions` hook, wired up in Conversation.tsx)
     * supplies it explicitly. Omitted (or omitted the calling
     * Section not being Operational Log/Roles & Responsibilities)
     * simply exports with no Process cross-reference resolved --
     * an Operational Log entry's Process shows blank, and Roles &
     * Responsibilities exports empty.
     */
    processLibrary?: ProcessRecordValue[];

    /**
     * Process Library only: when true, every Process/SOP's `.id` in
     * the data being exported is ALREADY the final computed display
     * ID ("PRC-001", not just typed initials like "PRC") -- so this
     * block should use `process.id`/`sop.id` directly rather than
     * running it back through processDisplayId/sopDisplayId.
     *
     * Why this exists: Conversation.tsx's own export flow needs a
     * Process's display ID to reflect its ORIGINAL position in the
     * FULL Process Library, even when the user chose to export only
     * a filtered subset (e.g. "Selected Processes") -- otherwise a
     * Process that was originally 6th would export as "PRC-001"
     * just because it's 1st in the filtered subset. To get that, it
     * pre-computes each ID against the full unfiltered list BEFORE
     * filtering, and sets this flag so this block won't recompute
     * against the (now positionally-meaningless) filtered list's
     * own indices -- recomputing there would both get the number
     * wrong AND double-append a second "-001" on top of the
     * already-final one, since processDisplayId always treats
     * whatever's in `.id` as bare initials to number, never as an
     * already-numbered ID to leave alone.
     */
    idsPreResolved?: boolean;

}

/**
 * Converts a single table cell's raw value into
 * exportable text.
 *
 * A `repeatable`/`repeatableValue` cell's entries are
 * joined with a real newline, one per line, rather than
 * "; " on a single line -- both exporters' own table-
 * cell escaping (MarkdownExporter's `escapeTableCell`,
 * PdfExporter's `renderBlockHtml`) already convert a
 * newline into "<br>", and an ordinary HTML/PDF table
 * cell grows to fit however many lines that produces, so
 * a Revenue Stream with several Revenue Methods (and
 * their paired Method Mix % entries, line-for-line) reads
 * as a short vertical list in its own cell instead of one
 * cramped "1. X; 2. Y; 3. Z" line.
 */
function cellToText(cell: unknown): string {

    if (Array.isArray(cell)) {

        return cell
            .filter(item => typeof item === "string" && item.trim().length > 0)
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n");

    }

    return cell === undefined || cell === null ? "" : String(cell);

}

/**
 * Splits free text into paragraphs on blank lines,
 * trimming and dropping any that are empty.
 */
function toParagraphs(text: string): string[] {

    return text
        .split(/\n{2,}/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0);

}

// A line already converted to a bullet by useListAutoFormat.ts's
// live-typing/paste trigger ("• " at the start of the line, exactly
// what gets stored in the raw answer text), OR a plain "- "/"* "
// line that somehow never got converted -- a safety net so a list
// still exports as a real list even if a raw markdown-style marker
// slips through the live editor untouched. Leading whitespace is
// captured (group 1) as the line's indent, added via Tab in the
// textarea -- see TAB_INDENT_UNIT in useListAutoFormat.ts.
//
// The content group is DELIBERATELY optional (`(?: (.*))?`, not a
// required trailing " (.*)") -- a freshly-typed, not-yet-filled-in
// item (just "• " or "1. " with nothing after it, which is exactly
// what the textarea holds the moment you press Enter to start a new
// item) has to still be recognized as a list line. Below, each raw
// line also gets its OWN trailing whitespace stripped before this
// regex ever sees it (see `paragraphToBlocks`), which erases that
// trailing marker space entirely for an empty item -- "• " becomes
// "•", "1. " becomes "1." -- so requiring the space unconditionally
// would silently fail to match those and demote the whole item to
// plain prose, which is exactly the bug this fixes: a paragraph
// gets rendered as one un-broken HTML line, so a handful of empty
// list items came out as a squished-together "1. 2. • •" instead of
// a real (if empty) list.
const EXPORT_BULLET_LINE = /^(\s*)(?:•|[*-])(?: (.*))?$/;

// A line already recognized as a numbered list item by
// useListAutoFormat.ts (optional indent, digits, a period, then
// optionally a space and content -- see the comment on
// EXPORT_BULLET_LINE for why the content half is optional).
const EXPORT_NUMBERED_LINE = /^(\s*)\d+\.(?:\s(.*))?$/;

// How many leading-whitespace characters make up one indent step --
// matches TAB_INDENT_UNIT's length in useListAutoFormat.ts (that
// hook is the only thing that ever writes indented list lines, via
// Tab/Shift+Tab). Kept as a separate constant here rather than a
// shared import so this file -- plain export/formatting logic --
// doesn't take on a dependency on a React hook module.
const EXPORT_INDENT_UNIT_LENGTH = 2;

function indentLevel(whitespace: string): number {
    return Math.floor(whitespace.length / EXPORT_INDENT_UNIT_LENGTH);
}

/**
 * Converts one paragraph's worth of free text (no blank
 * lines inside it -- those are already paragraph
 * boundaries, see `toParagraphs`) into export blocks,
 * recognizing runs of consecutive "• " bullet lines or
 * "N. " numbered lines (as produced by the textarea's
 * list auto-format feature, see useListAutoFormat.ts) as
 * real list blocks instead of losing their structure --
 * both exporters previously rendered a `paragraph` block
 * as one continuous line, which silently collapsed a
 * hand-typed list down to its bare markers ("• •",
 * "1. 2. 3.") with the line breaks (and so the separation
 * between items) discarded. Each item keeps its own indent
 * level, so a Tab-indented sub-point still renders nested
 * (not flattened to the same level as its parent) in both
 * the Markdown and PDF export.
 *
 * Any other, non-list lines in the paragraph are kept
 * together as a single `paragraph` block, exactly as
 * before.
 */
function paragraphToBlocks(paragraph: string): ExportBlock[] {

    const blocks: ExportBlock[] = [];
    const lines = paragraph
        .split(/\r?\n/)
        .map(line => line.replace(/\s+$/, ""))
        .filter(line => line.trim().length > 0);

    let listMode: "bullet" | "numbered" | null = null;
    let listItems: { text: string; indent: number }[] = [];
    let proseLines: string[] = [];

    function flushProse() {

        if (proseLines.length > 0) {
            blocks.push({ kind: "paragraph", text: proseLines.join("\n") });
            proseLines = [];
        }

    }

    function flushList() {

        if (listItems.length > 0) {
            blocks.push({ kind: "list", items: listItems, ordered: listMode === "numbered" });
            listItems = [];
        }

        listMode = null;

    }

    for (const line of lines) {

        const bulletMatch = line.match(EXPORT_BULLET_LINE);
        const numberedMatch = line.match(EXPORT_NUMBERED_LINE);

        if (bulletMatch) {

            if (listMode === "numbered") {
                flushList();
            }

            flushProse();
            listMode = "bullet";
            listItems.push({ text: bulletMatch[2] ?? "", indent: indentLevel(bulletMatch[1]) });

        } else if (numberedMatch) {

            if (listMode === "bullet") {
                flushList();
            }

            flushProse();
            listMode = "numbered";
            listItems.push({ text: numberedMatch[2] ?? "", indent: indentLevel(numberedMatch[1]) });

        } else {

            flushList();
            proseLines.push(line.trim());

        }

    }

    flushList();
    flushProse();

    return blocks;

}

/**
 * Converts free text (already known to be non-blank) into
 * export blocks, splitting on blank-line paragraph
 * boundaries and recognizing bullet/numbered list lines
 * within each paragraph -- see `paragraphToBlocks`.
 */
function toContentBlocks(text: string): ExportBlock[] {

    return toParagraphs(text).flatMap(paragraphToBlocks);

}

/**
 * Builds the exportable content of a Section response,
 * following the shape declared by its Answer
 * Definition. Returns an empty array when there is
 * nothing worth exporting (blank text, an all-blank
 * Table, an empty Checklist), so callers can show a
 * "No response" placeholder consistently.
 */
export function buildAnswerBlocks(
    answer: AnswerDefinition,
    value: unknown,
    options?: BuildAnswerBlocksOptions
): ExportBlock[] {

    switch (answer.type) {

        case AnswerType.FreeText: {

            const text = typeof value === "string" ? value.trim() : "";

            return toContentBlocks(text);

        }

        case AnswerType.FixedVariantText:
        case AnswerType.TLayoutText: {

            const values: FixedVariantAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as FixedVariantAnswerValue
                    : {};

            const blocks: ExportBlock[] = [];

            for (const variant of answer.variants ?? []) {

                const text = String(values[variant.id] ?? "").trim();

                if (text.length === 0) {
                    continue;
                }

                blocks.push({ kind: "subheading", text: variant.title });

                blocks.push(...toContentBlocks(text));

            }

            return blocks;

        }

        case AnswerType.Table: {

            const columns = visibleTableColumns(answer.table?.columns ?? []);
            const rows: TableAnswerRow[] = Array.isArray(value) ? value as TableAnswerRow[] : [];

            if (columns.length === 0) {
                return [];
            }

            // Rows the user never touched (every cell still
            // blank -- e.g. the single default row a fresh
            // Table starts with) are dropped from the export
            // rather than showing up as an empty row.
            const filledRows = rows.filter(
                row => columns.some(column => isCellFilled(row[column.id]))
            );

            if (filledRows.length === 0) {
                return [];
            }

            const headers = ["#", ...columns.map(column => column.title)];

            const dataRows = filledRows.map((row, index) => [
                String(index + 1),
                ...columns.map(column => cellToText(row[column.id]))
            ]);

            return [{ kind: "table", headers, rows: dataRows }];

        }

        case AnswerType.Checklist: {

            const items: ChecklistItemValue[] = Array.isArray(value)
                ? value as ChecklistItemValue[]
                : [];

            const filled = items.filter(
                item => typeof item.text === "string" && item.text.trim().length > 0
            );

            if (filled.length === 0) {
                return [];
            }

            return [{
                kind: "checklist",
                items: filled.map(item => ({ text: item.text.trim(), checked: item.checked }))
            }];

        }

        case AnswerType.CardList: {

            const values: CardListAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as CardListAnswerValue
                    : {};

            const blocks: ExportBlock[] = [];

            for (const card of answer.cards ?? []) {

                const items = (values[card.id] ?? []).filter(
                    item => typeof item.text === "string" && item.text.trim().length > 0
                );

                if (items.length === 0) {
                    continue;
                }

                blocks.push({ kind: "subheading", text: card.title });
                blocks.push({ kind: "list", items: items.map(item => ({ text: item.text.trim(), indent: 0 })) });

            }

            return blocks;

        }

        case AnswerType.ProfileCards: {

            const profileValue: ProfileCardsAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as ProfileCardsAnswerValue
                    : { cards: [] };

            const cards = Array.isArray(profileValue.cards) ? profileValue.cards : [];
            const blocks: ExportBlock[] = [];

            cards.forEach((card, index) => {

                const sections = card.sections ?? {};

                const hasContent =
                    (typeof card.title === "string" && card.title.trim().length > 0) ||
                    Object.values(sections).some(
                        text => typeof text === "string" && text.trim().length > 0
                    );

                if (!hasContent) {
                    return;
                }

                blocks.push({
                    kind: "subheading",
                    text: card.title?.trim().length > 0
                        ? card.title.trim()
                        : `${answer.profile?.cardLabel ?? "Card"} ${index + 1}`
                });

                for (const subtitle of answer.profile?.subtitles ?? []) {

                    const text = String(sections[subtitle.id] ?? "").trim();

                    if (text.length === 0) {
                        continue;
                    }

                    // Bold subsection label ("Strengths", "Needs", ...)
                    // on its own line, with the written text
                    // underneath it -- the same subheading-then-
                    // paragraph(s) pattern already used for the
                    // trailing "Market Position" card below and for
                    // Fixed Variant Text's own variant titles --
                    // rather than inlining "Label: text" onto one
                    // line.
                    blocks.push({ kind: "subheading", text: subtitle.title });

                    blocks.push(...toContentBlocks(text));

                }

            });

            const trailing = answer.profile?.trailingCard;
            const trailingText = String(profileValue.trailing ?? "").trim();

            if (trailing && trailingText.length > 0) {

                blocks.push({ kind: "subheading", text: trailing.title });

                blocks.push(...toContentBlocks(trailingText));

            }

            return blocks;

        }

        case AnswerType.ProcessLibrary: {

            const processes: ProcessRecordValue[] = Array.isArray(value) ? value as ProcessRecordValue[] : [];
            const blocks: ExportBlock[] = [];
            const forceExpandSops = options?.forceExpandProcessSops === true;

            const hasStepContent = (steps: ProcessStepValue[]) =>
                steps.some(step => typeof step.action === "string" && step.action.trim().length > 0);

            // A printable checklist (real "- [ ]" Markdown syntax /
            // an empty checkbox glyph in PDF -- see MarkdownExporter
            // and PdfExporter's own "checklist" block rendering)
            // rather than a plain table: the live editor no longer
            // offers a way to tick a Step off inside the app itself
            // (see ProcessLibraryEditor.tsx), but a printed or
            // exported SOP is exactly the kind of document someone
            // DOES want to physically check items off while
            // following it. `checked` reads whatever `done` value
            // is already stored (forward-compatible with any
            // already-saved data), but nothing in the current editor
            // can set it true anymore, so a fresh Step always starts
            // unchecked here.
            const stepsChecklistBlock = (steps: ProcessStepValue[]): ExportBlock | undefined => {

                const filled = steps.filter(
                    step => typeof step.action === "string" && step.action.trim().length > 0
                );

                if (filled.length === 0) {
                    return undefined;
                }

                return {
                    kind: "checklist",
                    items: filled.map(step => ({
                        text: step.action.trim(),
                        checked: step.done === true
                    }))
                };

            };

            processes.forEach((process, processIndex) => {

                const sops = Array.isArray(process.sops) ? process.sops : [];

                const hasContent =
                    (typeof process.name === "string" && process.name.trim().length > 0) ||
                    (typeof process.purpose === "string" && process.purpose.trim().length > 0) ||
                    sops.some(sop =>
                        (typeof sop.name === "string" && sop.name.trim().length > 0) ||
                        (typeof sop.purpose === "string" && sop.purpose.trim().length > 0) ||
                        hasStepContent(Array.isArray(sop.steps) ? sop.steps : [])
                    );

                if (!hasContent) {
                    return;
                }

                // See BuildAnswerBlocksOptions.idsPreResolved's own
                // doc comment -- when the caller already stamped the
                // final computed ID onto `process.id` (to preserve
                // original-position numbering through export-scope
                // filtering), use it as-is instead of recomputing,
                // which would both get the number wrong and
                // double-append a second suffix on top.
                const processId = options?.idsPreResolved
                    ? (typeof process.id === "string" && process.id.trim().length > 0 ? process.id.trim() : processDisplayId(processes, processIndex))
                    : processDisplayId(processes, processIndex);
                const processName = typeof process.name === "string" ? process.name.trim() : "";

                blocks.push({
                    kind: "subheading",
                    text: processName.length > 0 ? `${processId} · ${processName}` : processId
                });

                if (typeof process.purpose === "string" && process.purpose.trim().length > 0) {
                    blocks.push(...toContentBlocks(process.purpose.trim()));
                }

                const metaParts: string[] = [];

                if (typeof process.who === "string" && process.who.trim().length > 0) {
                    metaParts.push(`Owner: ${process.who.trim()}`);
                }

                if (typeof process.howOften === "string" && process.howOften.trim().length > 0) {
                    metaParts.push(`Frequency: ${process.howOften.trim()}`);
                }

                if (typeof process.status === "string" && process.status.trim().length > 0) {
                    metaParts.push(`Status: ${process.status.trim()}`);
                }

                if (metaParts.length > 0) {
                    blocks.push({ kind: "paragraph", text: metaParts.join(" · ") });
                }

                // Collapse rule (see ProcessLibraryEditor.tsx): 0 or 1
                // SOP renders that SOP's Steps directly under the
                // Process, with no SOP-level heading of its own --
                // UNLESS the caller explicitly asked to always show
                // SOP headings (see forceExpandSops's own doc
                // comment above), because a single remaining SOP
                // here is the result of export-time filtering, not
                // because the Process only ever had one.
                if (sops.length <= 1 && !forceExpandSops) {

                    const steps = Array.isArray(sops[0]?.steps) ? sops[0].steps : [];
                    const checklist = stepsChecklistBlock(steps);

                    if (checklist) {
                        blocks.push(checklist);
                    }

                } else {

                    sops.forEach((sop, sopIndex) => {

                        const steps = Array.isArray(sop.steps) ? sop.steps : [];

                        const sopHasContent =
                            (typeof sop.name === "string" && sop.name.trim().length > 0) ||
                            (typeof sop.purpose === "string" && sop.purpose.trim().length > 0) ||
                            hasStepContent(steps);

                        if (!sopHasContent) {
                            return;
                        }

                        const sopId = options?.idsPreResolved
                            ? (typeof sop.id === "string" && sop.id.trim().length > 0 ? sop.id.trim() : sopDisplayId(sops, sopIndex))
                            : sopDisplayId(sops, sopIndex);
                        const sopName = typeof sop.name === "string" ? sop.name.trim() : "";

                        blocks.push({
                            kind: "subheading",
                            text: sopName.length > 0 ? `${sopId} · ${sopName}` : sopId
                        });

                        if (typeof sop.purpose === "string" && sop.purpose.trim().length > 0) {
                            blocks.push(...toContentBlocks(sop.purpose.trim()));
                        }

                        const sopMetaParts: string[] = [];

                        if (typeof sop.who === "string" && sop.who.trim().length > 0) {
                            sopMetaParts.push(`Owner: ${sop.who.trim()}`);
                        }

                        if (typeof sop.howOften === "string" && sop.howOften.trim().length > 0) {
                            sopMetaParts.push(`Frequency: ${sop.howOften.trim()}`);
                        }

                        if (sopMetaParts.length > 0) {
                            blocks.push({ kind: "paragraph", text: sopMetaParts.join(" · ") });
                        }

                        const checklist = stepsChecklistBlock(steps);

                        if (checklist) {
                            blocks.push(checklist);
                        }

                    });

                }

            });

            return blocks;

        }

        case AnswerType.OperationalLog: {

            const rows: OperationalLogRowValue[] = Array.isArray(value) ? value as OperationalLogRowValue[] : [];
            const processes = options?.processLibrary ?? [];

            const filled = rows.filter(row =>
                (typeof row.date === "string" && row.date.trim().length > 0) ||
                (typeof row.description === "string" && row.description.trim().length > 0)
            );

            if (filled.length === 0) {
                return [];
            }

            const sorted = sortOperationalLogRows(filled);

            const headers = ["#", "Date", "Process", "Owner", "Description", "Notes"];

            const dataRows = sorted.map((row, index) => [
                String(index + 1),
                row.date.trim(),
                resolveProcessLogLabel(row.processKey, processes),
                row.ownerOfChange.trim(),
                row.description.trim(),
                row.notes.trim()
            ]);

            return [{ kind: "table", headers, rows: dataRows }];

        }

        case AnswerType.RolesResponsibilities: {

            const processes = options?.processLibrary ?? [];

            const notes: RolesResponsibilitiesAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as RolesResponsibilitiesAnswerValue
                    : {};

            const groups = groupRolesResponsibilities(processes, notes);

            const blocks: ExportBlock[] = [];

            groups.forEach(group => {

                blocks.push({ kind: "subheading", text: group.owner });

                blocks.push({
                    kind: "table",
                    headers: ["Process ID", "Responsibility", "Notes"],
                    rows: group.entries.map(entry => [
                        processDisplayId(processes, entry.processIndex),
                        entry.process.name.trim().length > 0 ? entry.process.name.trim() : "Untitled Process",
                        entry.notes.trim()
                    ])
                });

            });

            return blocks;

        }

        case AnswerType.MultiPart: {

            const values: Record<string, unknown> =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as Record<string, unknown>
                    : {};

            const blocks: ExportBlock[] = [];

            for (const part of answer.parts ?? []) {

                const partBlocks = buildAnswerBlocks(part.answer, values[part.id], options);

                if (partBlocks.length === 0) {
                    continue;
                }

                if (part.label.length > 0) {
                    blocks.push({ kind: "subheading", text: part.label });
                }

                blocks.push(...partBlocks);

            }

            return blocks;

        }

        default:
            return [];

    }

}

/* ==========================================================
   Strategy System

   Three pages that read forward: the Foundation page owns the
   Strategic Period and the Strategic Themes, the Strategic Period
   page develops each Theme into Goals / Objectives / Initiatives /
   Metrics, and the Roadmap page draws both across a timeline.

   Only the Foundation page STORES the Period and the Themes; the
   other two hold references to them. A Theme renamed on page 1 is
   renamed everywhere at once, and the three pages can never drift
   apart the way three copies would.
========================================================== */

/** The Foundation page's four columns, in order. */
export const STRATEGY_FOUNDATION_SECTIONS = [
    "Current Situation Analysis",
    "SWOT Analysis",
    "Strategic Compass",
    "Strategic Period"
] as const;

/** The four quadrants of the SWOT column, in order. */
export const STRATEGY_SWOT_QUADRANTS = [
    { id: "strengths", label: "Strengths" },
    { id: "weaknesses", label: "Weaknesses" },
    { id: "opportunities", label: "Opportunities" },
    { id: "threats", label: "Threats" }
] as const;

/** How often a Metric is measured. */
export const STRATEGY_METRIC_FREQUENCIES = [
    "Weekly",
    "Monthly",
    "Quarterly",
    "Semiannually",
    "Annually"
] as const;

/**
 * What a Metric's Baseline and Target are counted in. A money Metric
 * is Currency (its currency chosen beside it); anything else counted
 * is a Number, what it counts said in the Metric's name or
 * description. (A "Custom" unit, named in a box of its own, was a
 * second way to say Currency -- "£" -- and is read as one of these
 * now; see migratedMetricUnit.)
 */
export const STRATEGY_METRIC_UNITS = [
    "Number",
    "Percentage",
    "Currency"
] as const;

/** A money Metric: its currency is chosen as a Business price's is. */
export const STRATEGY_METRIC_CURRENCY_UNIT = "Currency";

/**
 * A month/year point. Both halves are strings because both come
 * from a <select>, and an unset point is "" rather than a sentinel
 * number that could be mistaken for a real month.
 */
export interface StrategyMonthValue {
    month: string;
    year: string;
}

/** A start and end month/year. Used for both Periods. */
export interface StrategyRangeValue {
    start: StrategyMonthValue;
    end: StrategyMonthValue;
}

export interface StrategyThemeValue {
    id: string;
    name: string;
    description: string;
}

export interface StrategyFoundationValue {
    situation: string;
    /**
     * Where the Current Situation text came from: "auto", the draft
     * built from the Business System (kept in step with it); "edited",
     * the founder's own words (never replaced without asking); "" for
     * an answer saved before the draft existed.
     */
    situationSource: "" | "auto" | "edited";
    swot: Record<string, string[]>;
    compass: string;
    period: StrategyRangeValue;
    themes: StrategyThemeValue[];
}

export interface StrategyMetricValue {
    id: string;
    name: string;
    description: string;
    baseline: string;
    target: string;
    frequency: string;
    unit: string;
    /**
     * For a Currency Metric: its currency code. "" is the
     * organization's own (from the Legal Entity country), so it
     * follows the registration as a Business price does.
     */
    currency: string;
}

export interface StrategyObjectiveValue {
    id: string;
    name: string;
    description: string;
    period: StrategyRangeValue;
    initiatives: string[];
    metrics: StrategyMetricValue[];
    /** The founder who owns it -- a Legal Entity founder id, or "". */
    ownerId: string;
    /**
     * The Responsible tick, unticked: this objective has no responsible
     * by choice. Absent means ticked (the default), so nothing stored
     * before this key existed changes. See responsibleIsOff.
     */
    responsibleOff?: boolean;
}

export interface StrategyGoalValue {
    id: string;
    name: string;
    description: string;
    objectives: StrategyObjectiveValue[];
}

/**
 * The Strategic Period page's stored value.
 *
 * Keyed by Theme id rather than held as a parallel array: a Theme
 * reordered or deleted on the Foundation page must never silently
 * re-point this page's Goals at a different Theme, and a map cannot
 * be knocked out of step by an insertion the way an array can.
 */
export interface StrategicPeriodValue {
    goalsByTheme: Record<string, StrategyGoalValue[]>;
}


function strategyStringList(value: unknown, minimum: number): string[] {

    const list = Array.isArray(value) ? value.map(asText) : [];

    while (list.length < minimum) {
        list.push("");
    }

    return list;

}

function strategyMonth(value: unknown): StrategyMonthValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    return { month: asText(source.month), year: asText(source.year) };

}

function strategyRange(value: unknown): StrategyRangeValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    return { start: strategyMonth(source.start), end: strategyMonth(source.end) };

}

export function isMonthSet(month: StrategyMonthValue): boolean {
    return month.month.trim().length > 0 && month.year.trim().length > 0;
}

export function isRangeSet(range: StrategyRangeValue): boolean {
    return isMonthSet(range.start) && isMonthSet(range.end);
}

/**
 * A month/year as one comparable integer (year * 12 + month), so
 * ranges can be compared and iterated without any date arithmetic.
 * -1 for an unset point, which never compares as inside a range.
 */
export function monthIndex(month: StrategyMonthValue): number {

    if (!isMonthSet(month)) {
        return -1;
    }

    return Number(month.year) * 12 + (Number(month.month) - 1);

}

export function monthFromIndex(index: number): StrategyMonthValue {
    return {
        year: String(Math.floor(index / 12)),
        month: String((index % 12) + 1).padStart(2, "0")
    };
}

export const STRATEGY_MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
] as const;

/** "03/26" -- the MM/YY the Strategy page titles are written in. */
export function formatMonthShort(month: StrategyMonthValue): string {

    if (!isMonthSet(month)) {
        return "MM/YY";
    }

    return month.month.padStart(2, "0") + "/" + month.year.slice(-2);

}

/**
 * A Strategy page title with its period: the placeholder "MM/YY -
 * MM/YY" becomes " · Jan 2027 – Dec 2029" once the Strategic Period
 * is set, and nothing until then.
 */
export function titleWithPeriod(title: string, range: StrategyRangeValue): string {
    const period = isRangeSet(range) ? " · " + formatRangeAbbrev(range) : "";
    return title.replace(/\s*MM\/YY - MM\/YY/, period);
}

/** A period as "Jan 2027 – Dec 2029". */
export function formatRangeAbbrev(range: StrategyRangeValue): string {
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const label = (month: StrategyMonthValue) => names[Number(month.month) - 1] + " " + month.year;
    return label(range.start) + " – " + label(range.end);
}

export function formatRangeShort(range: StrategyRangeValue): string {
    return formatMonthShort(range.start) + " - " + formatMonthShort(range.end);
}

export function formatMonthLong(month: StrategyMonthValue): string {

    if (!isMonthSet(month)) {
        return "";
    }

    return STRATEGY_MONTH_NAMES[Number(month.month) - 1] + " " + month.year;

}

export function asStrategyFoundationValue(value: unknown): StrategyFoundationValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const storedSwot = source.swot && typeof source.swot === "object" && !Array.isArray(source.swot)
        ? source.swot as Record<string, unknown>
        : {};

    const swot: Record<string, string[]> = {};

    for (const quadrant of STRATEGY_SWOT_QUADRANTS) {
        // One line each from the start: a quadrant showing nothing
        // but an empty space reads as broken rather than as
        // "nothing entered yet".
        swot[quadrant.id] = strategyStringList(storedSwot[quadrant.id], 1);
    }

    const themes = (Array.isArray(source.themes) ? source.themes : []).map(entry => {

        const theme = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        return {
            id: asText(theme.id) || randomId("theme"),
            name: asText(theme.name),
            description: asText(theme.description)
        };

    });

    return {
        situation: asText(source.situation),
        situationSource: source.situationSource === "auto" || source.situationSource === "edited"
            ? source.situationSource
            : "",
        swot,
        compass: asText(source.compass),
        period: strategyRange(source.period),
        themes
    };

}

function strategyMetric(value: unknown): StrategyMetricValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    return {
        id: asText(source.id) || randomId("metric"),
        name: asText(source.name),
        baseline: asText(source.baseline),
        target: asText(source.target),
        frequency: asText(source.frequency),
        ...migratedMetricUnit(asText(source.unit), asText(source.customUnit), asText(source.currency), asText(source.description))
    };

}

/** Currency symbols a "Custom" unit was written as, and their codes. */
const METRIC_UNIT_SYMBOLS: Record<string, string> = {
    "£": "GBP", "$": "USD", "US$": "USD", "€": "EUR", "¥": "JPY", "C$": "CAD", "A$": "AUD", "CHF": "CHF"
};

/**
 * A Metric saved with the "Custom" unit, read as one of the three:
 * a currency's symbol or code (£, $, €, GBP, USD…) is Currency in
 * that currency; "%" or "percent" is Percentage; "number" or "count"
 * is Number; anything else is a Number, its words kept at the end of
 * the Description ("Unit: hours per build"), so nothing is lost.
 */
export function migratedMetricUnit(
    unit: string,
    customUnit: string,
    currency: string,
    description: string
): { unit: string; currency: string; description: string } {
    if (unit !== "Custom") {
        return { unit, currency, description };
    }
    const text = customUnit.trim();
    const code = METRIC_UNIT_SYMBOLS[text] ?? (/^[A-Za-z]{3}$/.test(text) && CURRENCY_CODES.includes(text.toUpperCase()) ? text.toUpperCase() : "");
    if (code) {
        return { unit: "Currency", currency: code, description };
    }
    if (/^(%|percent(age)?)$/i.test(text)) {
        return { unit: "Percentage", currency, description };
    }
    if (text === "" || /^(number|count|#)$/i.test(text)) {
        return { unit: "Number", currency, description };
    }
    return {
        unit: "Number",
        currency,
        description: (description.trim() ? description.replace(/\s+$/, "") + "\n" : "") + "Unit: " + text
    };
}

function strategyObjective(value: unknown): StrategyObjectiveValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const metrics = (Array.isArray(source.metrics) ? source.metrics : []).map(strategyMetric);

    return {
        id: asText(source.id) || randomId("objective"),
        name: asText(source.name),
        description: asText(source.description),
        period: strategyRange(source.period),
        initiatives: strategyStringList(source.initiatives, 1),
        metrics: metrics.length > 0 ? metrics : [strategyMetric(undefined)],
        ownerId: asText(source.ownerId),
        ...(source.responsibleOff === true ? { responsibleOff: true } : {})
    };

}

function strategyGoal(value: unknown): StrategyGoalValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const objectives = (Array.isArray(source.objectives) ? source.objectives : []).map(strategyObjective);

    return {
        id: asText(source.id) || randomId("goal"),
        name: asText(source.name),
        description: asText(source.description),
        objectives: objectives.length > 0 ? objectives : [strategyObjective(undefined)]
    };

}

export function createStrategyGoal(): StrategyGoalValue {
    return strategyGoal(undefined);
}

export function createStrategyObjective(): StrategyObjectiveValue {
    return strategyObjective(undefined);
}

export function createStrategyMetric(): StrategyMetricValue {
    return strategyMetric(undefined);
}

/** A Theme's name as shown: "Untitled Theme" until it has one. */
export function strategyThemeName(theme: StrategyThemeValue): string {
    return theme.name.trim().length > 0 ? theme.name : "Untitled Theme";
}

export function createStrategyTheme(name = "", description = ""): StrategyThemeValue {
    return { id: randomId("theme"), name, description };
}

/**
 * Common Strategic Themes for a small organization: broad,
 * outcome-oriented areas of focus, offered as suggestions. A founder
 * may pick any, change them, or write their own.
 */
export const STRATEGY_THEME_SUGGESTIONS: { name: string; description: string }[] = [
    { name: "Growth & Market", description: "Focus on expanding the organisation's customer base, market presence, reach, or overall scale." },
    { name: "Customers & Experience", description: "Focus on acquiring, retaining, understanding, and creating greater value for customers, including improving their overall experience." },
    { name: "Products & Innovation", description: "Focus on developing, improving, expanding, or innovating the organisation's products, services, offerings, or intellectual property." },
    { name: "Revenue & Financial Sustainability", description: "Focus on building sustainable revenue, improving profitability, managing costs, strengthening cash flow, and achieving financial stability." },
    { name: "Brand & Positioning", description: "Focus on strengthening brand recognition, differentiation, reputation, market positioning, and the organisation's relationship with its audience." },
    { name: "Operations & Capability", description: "Focus on improving operational efficiency and developing the people, systems, technology, resources, and capabilities required to execute the strategy." },
    { name: "Partnerships & Expansion", description: "Focus on developing strategic partnerships, entering new markets or locations, and creating new opportunities through external relationships." }
];

export function asStrategicPeriodValue(value: unknown): StrategicPeriodValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const stored = source.goalsByTheme && typeof source.goalsByTheme === "object"
        ? source.goalsByTheme as Record<string, unknown>
        : {};

    const goalsByTheme: Record<string, StrategyGoalValue[]> = {};

    for (const entry of Object.entries(stored)) {
        goalsByTheme[entry[0]] = (Array.isArray(entry[1]) ? entry[1] : []).map(strategyGoal);
    }

    return { goalsByTheme };

}

/**
 * The Goals stored for one Theme, seeded with the single Goal a
 * Theme always starts with.
 *
 * Seeded on READ rather than on write, so a Theme created on the
 * Foundation page already has its first Goal, Objective, Initiative
 * and Metric the first time this page is opened -- without page 1
 * needing to know anything about page 2's shape.
 *
 * The seeded ids are DERIVED from the Theme's own id rather than
 * generated. They have to be: nothing is stored until the user types
 * something, so this runs again on every render, and a random id
 * would be a different id each time. The page tracks which box is
 * open by id, so that made a seeded Goal impossible to reopen once
 * closed -- it was no longer the box the page had a note of.
 */
export function strategyGoalsForTheme(
    value: StrategicPeriodValue,
    themeId: string
): StrategyGoalValue[] {

    const goals = value.goalsByTheme[themeId];

    if (goals && goals.length > 0) {
        return goals;
    }

    return [{
        id: `${themeId}-goal-1`,
        name: "",
        description: "",
        objectives: [{
            id: `${themeId}-objective-1`,
            name: "",
            description: "",
            period: { start: { month: "", year: "" }, end: { month: "", year: "" } },
            initiatives: [""],
            ownerId: "",
            metrics: [{
                id: `${themeId}-metric-1`,
                name: "",
                description: "",
                baseline: "",
                target: "",
                frequency: "",
                unit: "",
                currency: ""
            }]
        }]
    }];

}

/** Whether a Theme has anything recorded against it on page 2. */
export function strategyThemeHasContent(
    value: StrategicPeriodValue,
    themeId: string
): boolean {

    const goals = value.goalsByTheme[themeId];

    if (!goals) {
        return false;
    }

    return goals.some(goal =>
        goal.name.trim().length > 0 ||
        goal.description.trim().length > 0 ||
        goal.objectives.some(objective =>
            objective.name.trim().length > 0 ||
            objective.description.trim().length > 0 ||
            isRangeSet(objective.period) ||
            objective.initiatives.some(entry => entry.trim().length > 0) ||
            objective.metrics.some(metric => metric.name.trim().length > 0)
        )
    );

}

/**
 * Whether each of the Foundation page's four columns still needs
 * attention, in the order STRATEGY_FOUNDATION_SECTIONS lists them.
 */
export function strategyFoundationSectionsEmpty(value: unknown): boolean[] {

    const foundation = asStrategyFoundationValue(value);

    const swotEmpty = STRATEGY_SWOT_QUADRANTS.some(quadrant =>
        !(foundation.swot[quadrant.id] ?? []).some(entry => entry.trim().length > 0)
    );

    // The fourth column is done once the Period is set. Strategic
    // Themes are optional: a founder may define none.
    const periodEmpty = !isRangeSet(foundation.period);

    return [
        foundation.situation.trim().length === 0,
        swotEmpty,
        foundation.compass.trim().length === 0,
        periodEmpty
    ];

}

/**
 * Whether an Objective still needs attention: a name, a period, at
 * least one Initiative, and at least one named Metric.
 */
export function strategyObjectiveIncomplete(objective: StrategyObjectiveValue): boolean {

    return objective.name.trim().length === 0 ||
        !isRangeSet(objective.period) ||
        !objective.initiatives.some(entry => entry.trim().length > 0) ||
        !objective.metrics.some(metric => metric.name.trim().length > 0);

}

/**
 * A colour for each Strategic Theme, keyed by id.
 *
 * Themes are the only thing on these pages that repeats without a
 * fixed identity -- there is no "first" Theme in the way there is a
 * Primary colour or an Icon slot -- so a quiet tint is what lets a
 * reader tell one Theme's block from the next at a glance, on the
 * Strategic Period page and the Roadmap alike.
 *
 * Every Theme gets a DIFFERENT palette colour (Palette.ts), which
 * is why this takes the whole list rather than one id: hashing
 * each id on its own could land two Themes on the same colour,
 * and two Themes that look alike is the one thing the tint exists
 * to prevent. The palette's eight go round in its own order, each
 * well away from the one before.
 *
 * The order is taken from the ids sorted, not from the Themes'
 * positions, so reordering the Themes does not repaint them --
 * a colour follows its Theme.
 */
export function strategyThemeHues(themeIds: string[]): Record<string, number> {
    return paletteHuesInOrder([...new Set(themeIds)].sort());
}

/**
 * A hue for one thing, derived from THE THING rather than from
 * its place among its siblings.
 *
 * strategyThemeHues above hands out the palette across whatever
 * it is handed, which keeps neighbours apart -- but a colour is
 * then a function of POSITION. Delete the first of two Segments
 * and the second inherits its colour, so the card that is left
 * looks like the card that went. A colour that moves between
 * things is worse than a colour that is merely close to another.
 *
 * Hashed with FNV-1a, whose avalanche means two ids differing by
 * one character land nowhere near each other. Tenths of a degree
 * rather than whole ones, so there is no needless clustering.
 *
 * This is a raw hue, as Segments recorded before the palette
 * stored it: draw it through paletteHue (as stableCardHue does).
 */
export function stableHue(id: string): number {

    let hash = 2166136261;

    for (let index = 0; index < id.length; index++) {
        hash ^= id.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return ((hash >>> 0) % 3600) / 10;

}

/** The palette colour a thing with a fixed id is drawn in: its stable hue's nearest. */
export function stableCardHue(id: string): number {
    return paletteHue(stableHue(id));
}

/**
 * A Segment's colour: the hue it was given, else its stable one --
 * drawn as the nearest palette colour, so a hue stored before the
 * palette existed (any point on the wheel) still draws calm. The
 * stored value itself is left as it is.
 */
export function segmentHue(segment: { id: string; hue?: number }): number {
    return paletteHue(segment.hue ?? stableHue(segment.id));
}

/**
 * The palette hue for a NEW thing, given the hues its siblings
 * already have (see nextPaletteHue): the next palette colour after
 * its neighbour's, the least used first, never the neighbour's own.
 *
 * Chosen once and then STORED, which is what keeps it still.
 * Recomputing it against the current siblings would put the
 * colours back on the footing this replaced -- deleting one thing
 * would recolour the rest.
 *
 * With nothing taken it is the palette's first, sky: new things
 * take the palette in its order of priority (Palette.ts), the
 * colours that sit best with the app's blue first.
 */
export function pickHue(taken: number[]): number {
    return nextPaletteHue(taken);
}

/*
 * There was a `strategyThemeTints` here that turned each hue into
 * a finished `hsl(... 96%)` background string. Every caller now
 * hands the raw HUE to the element instead, as
 * --strategy-theme-hue, and the stylesheet derives the ground,
 * the strokes and the glow from it -- one number rather than one
 * pre-mixed colour per thing that needs one.
 */

/**
 * The saturation the Roadmap's selected Objective bar is filled at
 * (see .roadmap-bar-open in conversation.css). Kept here because
 * `strategyThemeBarLightness` has to solve for a lightness AT this
 * saturation -- the two are one colour, described in two files.
 */
const STRATEGY_BAR_SATURATION = 36;

/**
 * The contrast the selected bar's white label is held to. 4.6:1
 * rather than a bare 4.5:1, so rounding the lightness to a tenth
 * of a percent can never drop it under the line.
 */
const STRATEGY_BAR_TEXT_CONTRAST = 4.6;

/** One HSL colour as linear 0-1 sRGB channels. */
function hslChannels(hue: number, saturation: number, lightness: number): [number, number, number] {

    const s = saturation / 100;
    const l = lightness / 100;

    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const sector = (((hue % 360) + 360) % 360) / 60;
    const second = chroma * (1 - Math.abs((sector % 2) - 1));

    const [red, green, blue] =
        sector < 1 ? [chroma, second, 0] :
        sector < 2 ? [second, chroma, 0] :
        sector < 3 ? [0, chroma, second] :
        sector < 4 ? [0, second, chroma] :
        sector < 5 ? [second, 0, chroma] :
                     [chroma, 0, second];

    const offset = l - chroma / 2;

    return [red + offset, green + offset, blue + offset];

}

/** WCAG relative luminance (SC 1.4.3's own definition), from channels in 0-1. */
export function relativeLuminance(channels: [number, number, number]): number {

    const [red, green, blue] = channels.map(channel =>
        channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;

}

/**
 * How light the selected Objective bar can be FOR THIS HUE and
 * still carry white text at 4.6:1.
 *
 * A single lightness cannot do this. At one saturation the same
 * HSL lightness is a bright yellow and a near-black blue -- the
 * palette's hues differ by more than 3x in luminance -- so pinning
 * every Theme to one value means pinning every Theme to whatever
 * the brightest hue can bear, and the rest come out far darker
 * than they need to be. Solving per hue lets each Theme's bar sit
 * as light as its own colour allows, which is what makes the
 * selected state readable rather than merely dark.
 *
 * Returned as a CSS percentage string, ready for
 * `--strategy-bar-lightness`.
 */
export function strategyThemeBarLightness(hue: number): string {

    // White against a background of luminance L is
    // (1.05) / (L + 0.05); inverted, this is the lightest the
    // background may be.
    const ceiling = 1.05 / STRATEGY_BAR_TEXT_CONTRAST - 0.05;

    // Luminance rises monotonically with lightness at a fixed hue
    // and saturation, so a plain bisection finds the answer. 20
    // rounds takes a 60-point range under a thousandth of a point.
    let low = 0;
    let high = 60;

    for (let round = 0; round < 20; round += 1) {

        const middle = (low + high) / 2;

        if (relativeLuminance(hslChannels(hue, STRATEGY_BAR_SATURATION, middle)) > ceiling) {
            high = middle;
        } else {
            low = middle;
        }

    }

    return `${Math.floor(low * 10) / 10}%`;

}

/* ==========================================================
   Legal Entity (see AnswerType.LegalEntity)

   One page, six subsections, each a different shape. The value is
   one object so the whole page saves and loads as a unit, and so a
   later subsection can read an earlier one -- an expense names the
   founder responsible for it, and links to a registration number or
   a legal requirement recorded further up.
========================================================== */

/** The six subsections, in the order the page asks them. */
export const LEGAL_ENTITY_SECTIONS = [
    "Organization",
    "Founders & Ownership",
    "Formation & Registration",
    "Tax & Business Registration",
    "Additional Legal Requirements",
    "Legal Entity Expenses"
] as const;

/** What the organization legally is, and where. */
interface LegalEntityOrganisationValue {
    name: string;
    /** ISO 3166-1 alpha-2, or "" -- see LegalEntityJurisdictions. */
    country: string;
    /**
     * The state, province, canton or emirate, for the four
     * countries where it changes the answers. "" everywhere else,
     * where the question is never asked.
     */
    subdivision: string;

    /** A label from the country's own list, or "" when named below. */
    legalForm: string;
    /**
     * Typed instead of chosen. The brief is explicit that a legal
     * form must never be prescribed, so the list is an offer and
     * this is the way out of it -- including for every country the
     * app carries no list for.
     */
    legalFormOther: string;
    mainActivity: string;
    /**
     * The jurisdiction's own classification code, asked for only
     * where there is one to ask for.
     */
    activityCode: string;
    /**
     * The tick that asks for the code at all (as the consumption tax's
     * tick asks for its number). A page saved before it existed reads
     * as ticked when it already holds a code.
     */
    activityCodeOn: boolean;
    /*
     * The registered address, in parts.
     *
     * The Legal Entity brief asked for one whole field including
     * the country, on the grounds that address components differ
     * between countries. It was later asked for in parts instead,
     * which is what an address actually gets used as: a city is
     * searchable, a postal code is validatable, and a single blob
     * is neither. The country stays a separate question about
     * jurisdiction rather than a line of the address.
     */
    addressLine1: string;

    /**
     * No longer asked: the address is one box of as many lines as it
     * needs (addressLine1). A second line saved before is read into it,
     * on a line of its own, and this is always "" (see asLegalEntityValue).
     */
    addressLine2: string;

    /**
     * No longer asked: the City and the postal code are lines of the
     * one address (addressLine1). Saved ones are read into it, and
     * these are always "" (see asLegalEntityValue; addressCity reads
     * the city back where a sentence needs it).
     */
    city: string;

    postalCode: string;
}

export interface LegalEntityFounderValue {
    id: string;
    name: string;
    /** Percent, as typed. */
    ownership: string;
    capital: string;
    /**
     * LEGACY: asked here before the Founders Profile page asked it.
     * Read only to seed that page (see founderProfileOf); the Legal
     * Entity page no longer shows or writes it.
     */
    roles: string[];
    /**
     * LEGACY, as `roles`: a short bio, which seeds the Founders
     * Profile's Relevant Industry Experience.
     */
    experience: string;
}

/** A registration or tax number beyond the first. */
export interface LegalEntityNumberValue {
    id: string;
    /**
     * What this number is called here -- the brief refuses to invent
     * a country-specific field for each one, so the user names it.
     */
    label: string;
    number: string;
}

interface LegalEntityFormationValue {
    /**
     * "planned": not registered yet, the form and place chosen but no
     * date or numbers to give. "" (or "registered"): registered.
     */
    status: "" | "registered" | "planned";
    /** ISO yyyy-mm-dd, as an input[type=date] stores it. */
    date: string;
    authority: string;
    registrationNumber: string;
    additionalNumbers: LegalEntityNumberValue[];
}

/** Whether the organization is registered for the consumption tax. */
export type LegalEntityTaxStatus = "" | "yes" | "no" | "not-applicable";

interface LegalEntityTaxValue {
    identificationNumber: string;
    consumptionTaxStatus: LegalEntityTaxStatus;
    consumptionTaxNumber: string;
    additionalRegistrations: LegalEntityNumberValue[];
}

export interface LegalEntityRequirementValue {
    id: string;
    /** An id from LEGAL_REQUIREMENT_TYPES. */
    type: string;
    name: string;
    reference: string;
    notes: string;
    /**
     * "Add to Legal Entity Expenses": whether 6.'s expenses are offered
     * this requirement in their Links. Saved before it was asked: ticked
     * where an expense already links to it.
     */
    offerInExpenses: boolean;
}

export interface LegalEntityExpenseValue {
    id: string;
    name: string;
    /** The date of the expense (an ISO date), straight after the name: it places the cost in a month of the cash flow. */
    date: string;
    /** A founder id, so renaming a founder renames this too. */
    responsibility: string;
    /** The Responsible tick, unticked: no responsible by choice (absent = ticked), as on every card. */
    responsibleOff?: boolean;
    cost: string;
    /** One of LEGAL_ENTITY_EXPENSE_FREQUENCIES. */
    frequency: string;
    /**
     * Ids of what this expense is for -- a registration number or a
     * legal requirement recorded above. Ids rather than typed
     * references, so a link cannot go stale while its target is
     * renamed, and cannot point at something that was deleted.
     * Exactly one: every expense pays for one registration or requirement
     * (a saved answer with several keeps its first).
     */
    links: string[];
    description: string;
    /** The id of the requirement that made this expense ("Add to Legal Entity Expenses"), or "": such an expense is named and linked by its requirement. */
    fromRequirement: string;
}

export interface LegalEntityValue {
    organisation: LegalEntityOrganisationValue;
    /**
     * Whether the founder table asks about capital. Defaults from
     * the chosen legal form and is then the user's to set -- the
     * brief is clear that capital is not universal, and equally
     * clear that the app must not decide it for them.
     */
    capitalApplies: boolean;
    founders: LegalEntityFounderValue[];
    formation: LegalEntityFormationValue;
    tax: LegalEntityTaxValue;
    requirements: LegalEntityRequirementValue[];
    expenses: LegalEntityExpenseValue[];
}


export function createLegalEntityFounder(): LegalEntityFounderValue {
    return { id: randomId("founder"), name: "", ownership: "", capital: "", roles: [""], experience: "" };
}

export function createLegalEntityNumber(): LegalEntityNumberValue {
    return { id: randomId("number"), label: "", number: "" };
}

/** The legal forms that have no company registry (a sole trader is known to the tax office, not to a registry). */
const NO_REGISTRY_FORM = /sole (trader|proprietor)|self-employed|freelance/i;

/**
 * WHETHER THE ORGANIZATION IS REGISTERED, worked out and never chosen: a registration number is the proof, so a number says registered and none says not yet.
 * A form with no company registry has none to show: it counts as registered once it has a date.
 */
export function formationStatusOf(legalForm: string, registrationNumber: string, date: string): "planned" | "registered" {
    if (registrationNumber.trim().length > 0) {
        return "registered";
    }
    return NO_REGISTRY_FORM.test(legalForm) && date.trim().length > 0 ? "registered" : "planned";
}

export function createLegalEntityRequirement(): LegalEntityRequirementValue {
    return { id: randomId("requirement"), type: "", name: "", reference: "", notes: "", offerInExpenses: false };
}

export function createLegalEntityExpense(): LegalEntityExpenseValue {
    return {
        id: randomId("expense"),
        name: "",
        date: todayIsoDate(),
        responsibility: "",
        cost: "",
        frequency: "",
        links: [],
        description: "",
        fromRequirement: ""
    };
}

function legalEntityNumberList(value: unknown): LegalEntityNumberValue[] {

    return (Array.isArray(value) ? value : []).map(entry => {

        const row = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        return {
            id: asText(row.id) || randomId("number"),
            label: asText(row.label),
            number: asText(row.number)
        };

    });

}

export function asLegalEntityValue(value: unknown): LegalEntityValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const organisationSource =
        source.organisation && typeof source.organisation === "object"
            ? source.organisation as Record<string, unknown>
            : {};

    const formationSource =
        source.formation && typeof source.formation === "object"
            ? source.formation as Record<string, unknown>
            : {};

    const taxSource =
        source.tax && typeof source.tax === "object"
            ? source.tax as Record<string, unknown>
            : {};

    const founders = (Array.isArray(source.founders) ? source.founders : []).map(entry => {

        const row = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        return {
            id: asText(row.id) || randomId("founder"),
            name: asText(row.name),
            ownership: asText(row.ownership),
            capital: asText(row.capital),
            /* Legacy, kept for the Founders Profile to seed from (see
               founderProfileOf). A list, and one line of text before
               that: what was typed into the single box is kept, as
               the first role. */
            roles: Array.isArray(row.roles) && row.roles.length > 0
                ? row.roles.map(asText)
                : [asText(row.role)],
            // Asked for later: a founder saved before it has none.
            experience: asText(row.experience)
        };

    });

    // What the expenses link to, for a requirement saved before it said
    // whether it is offered to them.
    const linkedIds = new Set((Array.isArray(source.expenses) ? source.expenses : []).flatMap(entry =>
        entry && typeof entry === "object" && Array.isArray((entry as Record<string, unknown>).links)
            ? ((entry as Record<string, unknown>).links as unknown[]).map(asText)
            : []));

    const requirements = (Array.isArray(source.requirements) ? source.requirements : []).map(entry => {

        const row = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        const id = asText(row.id) || randomId("requirement");

        return {
            id,
            type: asText(row.type),
            name: asText(row.name),
            reference: asText(row.reference),
            notes: asText(row.notes),
            offerInExpenses: typeof row.offerInExpenses === "boolean" ? row.offerInExpenses : linkedIds.has(id)
        };

    });

    const expenses = (Array.isArray(source.expenses) ? source.expenses : []).map(entry => {

        const row = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        return {
            id: asText(row.id) || randomId("expense"),
            name: asText(row.name),
            date: isoDateText(row.date),
            responsibility: asText(row.responsibility),
            ...(row.responsibleOff === true ? { responsibleOff: true } : {}),
            cost: asText(row.cost),
            frequency: asText(row.frequency),
            // (One registration only: an earlier answer's several keep the first.)
            links: (Array.isArray(row.links) ? row.links : []).map(asText).filter(Boolean).slice(0, 1),
            description: asText(row.description),
            fromRequirement: asText(row.fromRequirement)
        };

    });

    const status = asText(taxSource.consumptionTaxStatus);

    return {

        organisation: {
            name: asText(organisationSource.name),
            country: asText(organisationSource.country),
            subdivision: asText(organisationSource.subdivision),
            legalForm: asText(organisationSource.legalForm),
            legalFormOther: asText(organisationSource.legalFormOther),
            mainActivity: asText(organisationSource.mainActivity),
            activityCode: asText(organisationSource.activityCode),
            activityCodeOn: typeof organisationSource.activityCodeOn === "boolean"
                ? organisationSource.activityCodeOn
                : asText(organisationSource.activityCode).trim().length > 0,

            // A page saved while the address was one field keeps
            // what was written in it: the whole thing lands on the
            // first line, which is the only part of it we can know
            // is right.
            // ONE ADDRESS, ONE BOX: the street lines saved before
            // (Address 1, Address 2), then the City, then the postal
            // code, one per line, so nothing saved is lost.
            addressLine1: [
                asText(organisationSource.addressLine1) || asText(organisationSource.address),
                asText(organisationSource.addressLine2),
                asText(organisationSource.city),
                asText(organisationSource.postalCode)
            ].filter(line => line.trim().length > 0).join("\n"),
            addressLine2: "",
            city: "",
            postalCode: ""
        },

        capitalApplies: source.capitalApplies === true,

        // One row from the start: an organization has at least one
        // founder, and an empty table reads as broken rather than as
        // "nobody yet".
        founders: founders.length > 0 ? founders : [createLegalEntityFounder()],

        formation: {
            // (Never chosen: a company with a registration number is registered, one without is not yet.)
            status: formationStatusOf(asText(organisationSource.legalForm), asText(formationSource.registrationNumber), asText(formationSource.date)),
            date: asText(formationSource.date),
            authority: asText(formationSource.authority),
            registrationNumber: asText(formationSource.registrationNumber),
            additionalNumbers: legalEntityNumberList(formationSource.additionalNumbers)
        },

        tax: {
            identificationNumber: asText(taxSource.identificationNumber),
            // The tick is the answer: ticked, registered; unticked, not
            // (or not applicable). A "not applicable" saved while the page
            // asked it separately is read as not registered.
            consumptionTaxStatus:
                status === "yes" || status === "no"
                    ? status
                    : status === "not-applicable" ? "no" : "",
            consumptionTaxNumber: asText(taxSource.consumptionTaxNumber),
            additionalRegistrations: legalEntityNumberList(taxSource.additionalRegistrations)
        },

        // (A "Not applicable" tick saved by an earlier version is
        // simply not read: an empty list says the same.)
        requirements,

        expenses

    };

}

/** The founders' ownership percentages, added up. */
export function legalEntityTotalOwnership(value: LegalEntityValue): number {

    return value.founders.reduce((total, founder) => {
        // Each share within 0 to 100%, for answers saved before the limit.
        return total + Math.min(100, Math.max(0, parseDecimal(founder.ownership.replace("%", "")) ?? 0));
    }, 0);

}

/** The founders' capital contributions, added up. */
export function legalEntityTotalCapital(value: LegalEntityValue): number {

    return value.founders.reduce((total, founder) => {
        // Read as the financial pages read it: "10,000" is ten thousand.
        // A negative contribution counts as none.
        return total + Math.max(0, parseAmount(founder.capital) ?? 0);
    }, 0);

}

/**
 * Which of the six subsections have nothing in them yet -- what the
 * completeness dialog lists, and what isAnswerEmpty adds up.
 *
 * The last two are deliberately NOT counted. Additional Legal
 * Requirements and Expenses are open lists that a great many
 * organizations correctly leave empty, and a page that can never be
 * finished is a page that stops meaning anything.
 */
/**
 * The City, read back out of the one address where a sentence names it
 * ("based in London"): the line before a last line that is a postal
 * code (short, with a digit), as the address box's placeholder asks
 * the lines to be written. "" where that cannot be told.
 */
export function addressCity(address: string): string {
    const lines = address.split("\n").map(line => line.trim()).filter(Boolean);
    if (lines.length < 3) {
        return "";
    }
    const last = lines[lines.length - 1];
    return /\d/.test(last) && last.length <= 12 ? lines[lines.length - 2] : "";
}

export function legalEntitySectionsEmpty(value: unknown): boolean[] {

    const entity = asLegalEntityValue(value);
    const organisation = entity.organisation;

    const organisationEmpty =
        organisation.name.trim().length === 0 ||
        organisation.country.trim().length === 0 ||
        (organisation.legalForm.trim().length === 0 &&
            organisation.legalFormOther.trim().length === 0) ||
        organisation.mainActivity.trim().length === 0 ||
        organisation.addressLine1.trim().length === 0;

    const foundersEmpty = !entity.founders.some(
        founder => founder.name.trim().length > 0
    );

    // Not registered yet: there is no date or number to give, only
    // where it will be registered.
    const planned = entity.formation.status === "planned";
    const formationEmpty = planned
        ? entity.formation.authority.trim().length === 0
        : entity.formation.date.trim().length === 0 ||
            entity.formation.authority.trim().length === 0 ||
            entity.formation.registrationNumber.trim().length === 0;

    // The consumption tax is a tick now, and an unticked box is a
    // complete answer -- so what is left to ask for is the number
    // the organization is identified by, and the registration
    // number whenever the box IS ticked.
    const taxEmpty = !planned && (
        entity.tax.identificationNumber.trim().length === 0 ||
        (entity.tax.consumptionTaxStatus === "yes" &&
            entity.tax.consumptionTaxNumber.trim().length === 0));

    return [organisationEmpty, foundersEmpty, formationEmpty, taxEmpty, false, false];

}

/* ==========================================================
   Founders Profile (see AnswerType.FoundersProfile)

   One card per founder the Legal Entity names, keyed by that
   founder's id, so a rename or a reorder there is followed here.
   Roles and a short bio used to be asked on the Legal Entity
   itself; a founder saved then carries them on its Legal Entity
   row, and founderProfiles reads them from there until this page
   holds an entry of its own for that founder.
========================================================== */

/** The two subsections, in the order the page asks them. */
export const FOUNDERS_PROFILE_SECTIONS = [
    "Founders",
    "Capability Gaps & Cover"
] as const;

/**
 * What a Skills, Expertise & Qualifications entry is, in the order
 * the page offers them and the documents list them.
 */
export const FOUNDER_CREDENTIAL_TYPES = [
    { id: "skill", label: "Skill" },
    { id: "expertise", label: "Professional / Technical Expertise" },
    { id: "qualification", label: "Degree / Qualification" },
    { id: "certification", label: "Certification" },
    { id: "licence", label: "Licence" },
    { id: "membership", label: "Membership / Other Credential" }
] as const;

/** One Skills, Expertise & Qualifications entry. */
export interface FounderSkillValue {
    /** A FOUNDER_CREDENTIAL_TYPES id, or "" while none is chosen. */
    type: string;
    text: string;
}

export interface FounderProfileValue {
    /** The Legal Entity founder's id. */
    id: string;
    /** One line per role: a founder is often several things. */
    roles: string[];
    /** Where, in what, and for how long: companies, sectors, positions, projects, markets. */
    industryExperience: string;
    /** Teams led, budgets or P&L owned, businesses run. */
    managementExperience: string;
    /** As many as they have: what, their part in it, the result. */
    achievements: string[];
    /** Skills, expertise, degrees, certifications, licences, memberships -- each typed. */
    skills: FounderSkillValue[];
}

export interface FoundersProfileValue {
    founders: FounderProfileValue[];
    /** Which capabilities the team lacks. */
    teamGaps: string;
    /** How they are covered: planned hires, advisors, mentors, partners, contractors, training. */
    teamCover: string;
}

/** A founder's profile, named as the Legal Entity names them. */
export interface NamedFounderProfile extends FounderProfileValue {
    name: string;
}

export function createFounderProfile(id: string): FounderProfileValue {
    return {
        id,
        roles: [""],
        industryExperience: "",
        managementExperience: "",
        achievements: [""],
        skills: [{ type: "", text: "" }]
    };
}

/** A list line by line, never empty: a list input always shows one line. */
function profileList(value: unknown): string[] {
    const items = (Array.isArray(value) ? value : []).map(asText);
    return items.length > 0 ? items : [""];
}

/**
 * The typed entries, never empty: the page always shows one row.
 * Saved before entries had a type, an entry is a plain string -- it
 * is kept, untyped; a type the page does not offer is read as none.
 */
function profileSkills(value: unknown): FounderSkillValue[] {

    const items = (Array.isArray(value) ? value : []).map(item => {

        if (item && typeof item === "object" && !Array.isArray(item)) {
            const row = item as Record<string, unknown>;
            const type = asText(row.type);
            return {
                type: FOUNDER_CREDENTIAL_TYPES.some(entry => entry.id === type) ? type : "",
                text: asText(row.text)
            };
        }

        return { type: "", text: asText(item) };

    });

    return items.length > 0 ? items : [{ type: "", text: "" }];

}

/**
 * The Relevant Industry Experience, with the years in the industry an
 * entry saved them in -- a box of their own until the text took them
 * over -- put back at its start ("12 years in the industry. ..."),
 * unless the text already starts with them. Nothing saved is lost.
 */
function experienceWithYears(years: string, experience: string): string {

    const count = years.trim();

    if (count.length === 0 || experience.trimStart().startsWith(count)) {
        return experience;
    }

    const said = count + (count === "1" ? " year" : " years") + " in the industry.";

    return experience.trim().length > 0 ? said + " " + experience : said;

}

/**
 * A founder's Skills, Expertise & Qualifications as the documents
 * list them: in FOUNDER_CREDENTIAL_TYPES' order, each after its
 * type ("Certification: Microsoft Power Platform"), and the untyped
 * last, as written. Entries with no text are left out.
 */
export function founderSkillLines(skills: readonly FounderSkillValue[]): string[] {

    const written = skills.filter(entry => entry.text.trim().length > 0);

    return [
        ...FOUNDER_CREDENTIAL_TYPES.flatMap(kind => written
            .filter(entry => entry.type === kind.id)
            .map(entry => kind.label + ": " + entry.text.trim())),
        ...written
            .filter(entry => !FOUNDER_CREDENTIAL_TYPES.some(kind => kind.id === entry.type))
            .map(entry => entry.text.trim())
    ];

}

export function asFoundersProfileValue(value: unknown): FoundersProfileValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const founders = (Array.isArray(source.founders) ? source.founders : [])
        .map(entry => entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {})
        // An entry means nothing without the founder it describes.
        .filter(row => asText(row.id).length > 0)
        .map(row => ({
            id: asText(row.id),
            roles: profileList(row.roles),
            industryExperience: experienceWithYears(asText(row.years), asText(row.industryExperience)),
            managementExperience: asText(row.managementExperience),
            achievements: profileList(row.achievements),
            skills: profileSkills(row.skills)
        }));

    return {
        founders,
        teamGaps: asText(source.teamGaps),
        teamCover: asText(source.teamCover)
    };

}

/**
 * One Legal Entity founder's profile: this page's own entry for
 * them, or -- until there is one -- what the Legal Entity row saved
 * before this page existed carries: its Roles, and its Experience &
 * Skills as the Relevant Industry Experience.
 */
export function founderProfileOf(
    founder: LegalEntityFounderValue,
    profile: unknown
): FounderProfileValue {

    const own = asFoundersProfileValue(profile).founders.find(entry => entry.id === founder.id);

    if (own) {
        return own;
    }

    return {
        ...createFounderProfile(founder.id),
        roles: founder.roles.length > 0 ? [...founder.roles] : [""],
        industryExperience: founder.experience
    };

}

/**
 * Every NAMED Legal Entity founder's profile, in the Legal Entity's
 * order -- the one place anything reads roles or experience from,
 * so the documents, the exports and the Business System see the
 * same answer whether or not this page has been opened.
 */
export function founderProfiles(
    legalFounders: readonly LegalEntityFounderValue[],
    profile: unknown
): NamedFounderProfile[] {

    return legalFounders
        .filter(founder => founder.name.trim().length > 0)
        .map(founder => ({ ...founderProfileOf(founder, profile), name: founder.name.trim() }));

}

/**
 * The page's value with an entry for every named Legal Entity
 * founder -- seeded from the Legal Entity row where it has none (see
 * founderProfileOf) -- which is what the page writes back, once, so
 * the seeded answers become its own.
 *
 * Entries for founders the Legal Entity no longer names are KEPT:
 * clearing a name and typing it again should not cost the profile.
 */
export function withFounderProfiles(
    profile: unknown,
    legalFounders: readonly LegalEntityFounderValue[]
): FoundersProfileValue {

    const value = asFoundersProfileValue(profile);

    const missing = legalFounders
        .filter(founder => founder.name.trim().length > 0)
        .filter(founder => !value.founders.some(entry => entry.id === founder.id))
        .map(founder => founderProfileOf(founder, value));

    return missing.length === 0
        ? value
        : { ...value, founders: [...value.founders, ...missing] };

}

/** Whether a profile says anything beyond the founder's roles. */
export function founderProfileHasText(entry: FounderProfileValue): boolean {
    return entry.industryExperience.trim().length > 0 ||
        entry.managementExperience.trim().length > 0 ||
        entry.achievements.some(item => item.trim().length > 0) ||
        entry.skills.some(item => item.text.trim().length > 0);
}

/** Whether a profile holds anything at all, its roles included. */
export function founderProfileHasContent(entry: FounderProfileValue): boolean {
    return entry.roles.some(role => role.trim().length > 0) || founderProfileHasText(entry);
}

/* ==================================================================
   Business System -- Foundation (Page 1)

   See AnswerType.BusinessFoundation, and the specification at
   docs/specifications/business-system/page-1-foundation.md.

   One section, four subsections, and the Customer Segment owns all
   of them. Everything the page asks is asked ABOUT A SEGMENT, so
   everything is stored on one: its Profiles, the competitors facing
   it ("analyse them for each Customer Segment"), the promise made
   to it ("The Value Proposition should be associated with the
   relevant Customer Segment"), and the Offerings sold to it, whose
   Needs come from that Segment's own Profiles.

   A Segment therefore has many Profiles, many competitors and many
   Offerings, but exactly ONE Value Proposition -- which is why that
   one is a string on the Segment rather than a list.
================================================================== */

/*
 * The specification's figures -- one primary Segment up to a
 * maximum of two, up to three Profiles each -- were constants
 * here, and both the editor and this reader enforced them.
 *
 * They are RECOMMENDATIONS, not limits. A founder who has
 * genuinely got three Segments is not helped by an Add button
 * that disappears, and was actively harmed by the reader, which
 * sliced anything past the figure off on the way back in -- a
 * Segment typed today and gone tomorrow.
 *
 * The figures still reach the founder, in the guidance above
 * the process line: "1 primary segment (maximum 2)" and "up to
 * 3 customer profiles". Advice is what they were meant to be.
 */

/**
 * Competitor and alternative types, with the given explanations.
 *
 * Singular, like every other name this page gives a thing --
 * a Segment, a Profile, a Competitor, an Offering. Each of these
 * labels names what ONE competitor is, so a list mixing
 * "Direct competitors" with "Status quo" was reading as two
 * different kinds of answer.
 */
export const BUSINESS_COMPETITOR_TYPES = [
    {
        id: "direct",
        label: "Direct competitor",
        explanation: "Offers a similar solution to the same need in your area."
    },
    {
        id: "indirect",
        // The id stays "indirect": it is what is stored, and
        // renaming the label must not orphan an answer.
        label: "Indirect competitor",
        explanation: "Offers a different solution but solves the same customer problem."
    },
    {
        id: "substitutes",
        label: "Substitute",
        explanation: "Offers an alternative way to satisfy the exact same customer need."
    },
    {
        id: "internal",
        label: "Internal solution",
        explanation: "The customer meets the need without outside help."
    },
    {
        id: "status-quo",
        label: "Status quo",
        explanation: "The customer does nothing and continues with the current situation."
    }
] as const;

/** Offering categories, as the specification lists them. */
export const BUSINESS_OFFERING_CATEGORIES = [
    "Product",
    "Service",
    "Hybrid",
    "Other"
] as const;

/**
 * A Description, one entry per named parameter.
 *
 * Keyed by the parameter's own id (see the editor's SUBSECTIONS),
 * not by its position, so the list can be reordered or added to
 * without moving anybody's answers.
 *
 * It was one block of prose covering every parameter at once.
 * Splitting it is what lets each parameter have its own box, its
 * own prompt and its own "i" -- and lets a founder see which of
 * them they have actually answered.
 */
export type BusinessDescriptionValue = Record<string, string>;

/**
 * A Profile's needs, under the three headings the specification
 * names: what the customer has to get done, how they want to feel
 * doing it, and how they want to be seen for it.
 *
 * One list each rather than one flat list. They were a single
 * list of needs with nothing to say which kind each one was --
 * which is most of what the answer is for.
 */
export interface BusinessProfileNeedsValue {
    functional: string[];
    emotional: string[];
    social: string[];
}

export interface BusinessCustomerProfileValue {
    id: string;
    name: string;
    description: BusinessDescriptionValue;
    goals: string;
    challenges: string;
    objections: string;
    /**
     * One need per entry, rather than one block of prose, in three
     * named lists.
     *
     * The Offerings subsection's "Needs Addressed" is specified as
     * "a drop down selection menu populated with the Needs from the
     * Customer Profile", with more than one selectable -- which only
     * has something to offer if the needs are separate entries.
     */
    needs: BusinessProfileNeedsValue;
}

export interface BusinessCustomerSegmentValue {
    id: string;
    name: string;
    /**
     * The colour this Segment's card is drawn in, chosen when it
     * was created and kept (see pickHue).
     *
     * Optional because Segments recorded before it was stored have
     * none; those fall back to the hue their id hashes to, which
     * is the colour they have always been drawn in.
     */
    hue?: number;
    description: BusinessDescriptionValue;
    profiles: BusinessCustomerProfileValue[];
    /**
     * This Segment's single Value Proposition -- the one thing the
     * page asks exactly once per Segment.
     */
    valueProposition: string;
    /** The competitors and alternatives facing this Segment. */
    competitors: BusinessCompetitorValue[];
    /** The Offerings sold to this Segment. */
    offerings: BusinessOfferingValue[];
}

export interface BusinessCompetitorValue {
    id: string;
    name: string;
    /** One of BUSINESS_COMPETITOR_TYPES' ids, or "". */
    type: string;
    description: BusinessDescriptionValue;
    strengths: string;
    weaknesses: string;
    opportunities: string;
    threats: string;
    insights: string;
}

export interface BusinessOfferingValue {
    id: string;
    name: string;
    /**
     * Needs chosen from its own Segment's Profiles, by their text.
     */
    needsAddressed: string[];
    category: string;
    /** Named when the category is "Other". */
    categoryOther: string;
    description: BusinessDescriptionValue;
}

/**
 * The whole page: nothing but Segments, because nothing on it is
 * asked of anything else.
 */
export interface BusinessFoundationValue {
    segments: BusinessCustomerSegmentValue[];
}


export function createBusinessCustomerProfile(): BusinessCustomerProfileValue {
    return {
        id: randomId("profile"),
        name: "",
        description: {},
        goals: "",
        challenges: "",
        objections: "",
        needs: { functional: [""], emotional: [""], social: [""] }
    };
}

/**
 * A new Segment.
 *
 * `taken` is the hues its siblings already have, so the colour it
 * is given is one none of them is using.
 */
export function createBusinessCustomerSegment(
    taken: number[] = []
): BusinessCustomerSegmentValue {

    const id = randomId("segment");

    return {
        id,
        hue: pickHue(taken),
        name: "",
        description: {},
        // "By default, at least 1 Customer Profile card should
        // exist." The competitor and the Offering are there for
        // the same reason: a subsection showing nothing but an Add
        // button reads as missing rather than as empty.
        profiles: [createBusinessCustomerProfile()],
        valueProposition: "",
        competitors: [createBusinessCompetitor()],
        offerings: [createBusinessOffering()]
    };
}

export function createBusinessCompetitor(): BusinessCompetitorValue {
    return {
        id: randomId("competitor"),
        name: "",
        type: "",
        description: {},
        strengths: "",
        weaknesses: "",
        opportunities: "",
        threats: "",
        insights: ""
    };
}

export function createBusinessOffering(): BusinessOfferingValue {
    return {
        id: randomId("offering"),
        name: "",
        needsAddressed: [],
        category: "",
        categoryOther: "",
        description: {}
    };
}


function businessNeedList(value: unknown, minimum = 0): string[] {

    const list = (Array.isArray(value) ? value : [])
        .map(entry => typeof entry === "string" ? entry : "");

    while (list.length < minimum) {
        list.push("");
    }

    return list;

}

/**
 * A Description as stored, whatever shape it is in.
 *
 * A string is what the single-box Description saved. It covered
 * every parameter at once, so it is read into `firstPartId` --
 * the first box the founder will see -- rather than discarded.
 * Nothing is lost; it just has to be redistributed by hand.
 */
function asBusinessDescription(
    value: unknown,
    firstPartId: string
): BusinessDescriptionValue {

    if (typeof value === "string") {
        return value.length > 0 ? { [firstPartId]: value } : {};
    }

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const parts: BusinessDescriptionValue = {};

    for (const [key, entry] of Object.entries(source)) {
        if (typeof entry === "string") {
            parts[key] = entry;
        }
    }

    return parts;

}

/**
 * Market Size and Industry Outlook & Trends share one box. An
 * outlook saved in its own box before they merged is appended to
 * the Market Size text, after a blank line, so nothing is lost.
 */
function withMarketOutlook(parts: BusinessDescriptionValue): BusinessDescriptionValue {

    const { "industry-outlook": outlook, ...rest } = parts;

    if (outlook === undefined) {
        return parts;
    }

    const size = rest["market-size"] ?? "";

    if (outlook.trim().length > 0) {
        rest["market-size"] = size.trim().length > 0 ? size.trimEnd() + "\n\n" + outlook : outlook;
    }

    return rest;

}

/*
 * The first parameter of each Description, named here so a
 * legacy one-block answer lands in a box the founder actually
 * sees. They are the editor's own ids (SUBSECTIONS in
 * BusinessFoundationEditor); kept as plain strings because the
 * parser must not depend on a component.
 */
const BUSINESS_FIRST_DESCRIPTION_PART = {
    segment: "demographics",
    profile: "personal",
    competitor: "offerings",
    offering: "function"
} as const;

/**
 * A Profile's needs, whatever shape they are in.
 *
 * A flat array is what the single list saved. Its entries were
 * needs of no stated kind, and functional is the kind a plainly
 * written need most often is, so they are read in there rather
 * than dropped. Nothing is lost; some may want moving.
 */
function asBusinessNeeds(value: unknown): BusinessProfileNeedsValue {

    if (Array.isArray(value)) {
        return {
            functional: businessNeedList(value, 1),
            emotional: [""],
            social: [""]
        };
    }

    const source = value && typeof value === "object"
        ? value as Record<string, unknown>
        : {};

    return {
        functional: businessNeedList(source.functional, 1),
        emotional: businessNeedList(source.emotional, 1),
        social: businessNeedList(source.social, 1)
    };

}


function asBusinessCompetitor(entry: unknown): BusinessCompetitorValue {

    const competitor = asObject(entry);

    return {
        id: asText(competitor.id) || randomId("competitor"),
        name: asText(competitor.name),
        type: asText(competitor.type),
        description: asBusinessDescription(
            competitor.description,
            BUSINESS_FIRST_DESCRIPTION_PART.competitor
        ),
        strengths: asText(competitor.strengths),
        weaknesses: asText(competitor.weaknesses),
        opportunities: asText(competitor.opportunities),
        threats: asText(competitor.threats),
        insights: asText(competitor.insights)
    };

}

function asBusinessOffering(entry: unknown): BusinessOfferingValue {

    const offering = asObject(entry);

    return {
        id: asText(offering.id) || randomId("offering"),
        name: asText(offering.name),
        needsAddressed: businessNeedList(offering.needsAddressed),
        category: asText(offering.category),
        categoryOther: asText(offering.categoryOther),
        description: asBusinessDescription(
            offering.description,
            BUSINESS_FIRST_DESCRIPTION_PART.offering
        )
    };

}

/**
 * The stored answer, in the shape the editor expects, whatever was
 * actually saved. One Segment always exists, holding one Profile,
 * one competitor and one Offering: the specification requires a
 * Profile card from the start, and a subsection showing nothing at
 * all reads as broken rather than as empty.
 *
 * Competitors and Offerings were once kept on the page rather than
 * on the Segment. Anything saved that way is read onto the FIRST
 * Segment here, which is where a single-segment answer -- every
 * answer that shape could have produced in practice -- belongs. No
 * migration flag: the reader already has to cope with whatever is
 * on disk, and doing it here means it is done everywhere the answer
 * is read.
 */
export function asBusinessFoundationValue(value: unknown): BusinessFoundationValue {

    const source = asObject(value);

    const pageCompetitors = (Array.isArray(source.competitors) ? source.competitors : [])
        .map(asBusinessCompetitor);

    const pageOfferings = (Array.isArray(source.offerings) ? source.offerings : [])
        .map(asBusinessOffering);

    const segments = (Array.isArray(source.segments) ? source.segments : [])
        .map((entry, index) => {

            const segment = asObject(entry);

            const profiles = (Array.isArray(segment.profiles) ? segment.profiles : [])
                .map(candidate => {

                    const profile = asObject(candidate);

                    return {
                        id: asText(profile.id) || randomId("profile"),
                        name: asText(profile.name),
                        description: asBusinessDescription(
                            profile.description,
                            BUSINESS_FIRST_DESCRIPTION_PART.profile
                        ),
                        goals: asText(profile.goals),
                        challenges: asText(profile.challenges),
                        objections: asText(profile.objections),
                        needs: asBusinessNeeds(profile.needs)
                    };

                });

            const competitors = (Array.isArray(segment.competitors)
                ? segment.competitors
                : []).map(asBusinessCompetitor);

            const offerings = (Array.isArray(segment.offerings)
                ? segment.offerings
                : []).map(asBusinessOffering);

            // The older page-level lists, taken on by the first
            // Segment and only when it has none of its own.
            const inherited = index === 0;

            const ownCompetitors = competitors.length > 0
                ? competitors
                : (inherited ? pageCompetitors : []);

            const ownOfferings = offerings.length > 0
                ? offerings
                : (inherited ? pageOfferings : []);

            return {
                id: asText(segment.id) || randomId("segment"),
                hue: typeof segment.hue === "number" && Number.isFinite(segment.hue)
                    ? segment.hue
                    : undefined,
                name: asText(segment.name),
                description: withMarketOutlook(asBusinessDescription(
                    segment.description,
                    BUSINESS_FIRST_DESCRIPTION_PART.segment
                )),
                profiles: profiles.length > 0
                    ? profiles
                    : [createBusinessCustomerProfile()],
                valueProposition: asText(segment.valueProposition),
                competitors: ownCompetitors.length > 0
                    ? ownCompetitors
                    : [createBusinessCompetitor()],
                offerings: ownOfferings.length > 0
                    ? ownOfferings
                    : [createBusinessOffering()]
            };

        });

    return {
        segments: segments.length > 0 ? segments : [createBusinessCustomerSegment()]
    };

}

/**
 * The needs of one kind across ALL of a Segment's Profiles, in
 * page order and without repeats.
 *
 * Profiles in one Segment SHARE their needs. Two people in the
 * same segment wanting the same thing is the ordinary case rather
 * than a clash: each Profile lists it because it is true of that
 * Profile, and the Segment has it once. So an Offering is offered
 * it once, and the Value Proposition is reminded of it once.
 *
 * Shared without regard to case or surrounding space, since
 * neither is what makes two needs different: the same words typed
 * into two Profiles are one need however they were capitalised,
 * and the first spelling is the one kept.
 *
 * A need belongs to the Segment that has it, so an Offering sold
 * to one Segment is never offered another Segment's needs.
 */
export function businessSegmentNeeds(
    segment: BusinessCustomerSegmentValue,
    kind: keyof BusinessProfileNeedsValue
): string[] {

    const needs: string[] = [];
    const seen = new Set<string>();

    for (const profile of segment.profiles) {
        for (const need of profile.needs[kind]) {

            const text = need.trim();

            if (text.length === 0) {
                continue;
            }

            const key = text.toLocaleLowerCase();

            if (seen.has(key)) {
                continue;
            }

            seen.add(key);
            needs.push(text);

        }
    }

    return needs;

}

/**
 * Which of the Foundation section's four subsections are still
 * empty, in page order, so the completeness dialog can name the
 * subsection rather than the section.
 *
 * What counts as answered, per subsection:
 *
 * 1. A named Segment holding a named Profile. The Segment on its
 *    own is a heading; the Profile is the answer.
 * 2. A named competitor or alternative, under any Segment. The
 *    specification asks for three to five, but a page that refused
 *    to finish on four would be enforcing a recommendation.
 * 3. A Value Proposition for every Segment that has a name. One
 *    Segment left blank is the subsection left unfinished, which is
 *    the point of writing one per Segment.
 * 4. A named Offering, under any Segment.
 */
export function businessFoundationSubsectionsEmpty(value: unknown): boolean[] {

    const foundation = asBusinessFoundationValue(value);

    const namedSegments = foundation.segments.filter(
        segment => segment.name.trim().length > 0
    );

    const segmentsEmpty = !namedSegments.some(
        segment => segment.profiles.some(profile => profile.name.trim().length > 0)
    );

    const competitorsEmpty = !foundation.segments.some(
        segment => segment.competitors.some(
            competitor => competitor.name.trim().length > 0
        )
    );

    const propositionEmpty = namedSegments.length === 0 ||
        namedSegments.some(segment => segment.valueProposition.trim().length === 0);

    const offeringsEmpty = !foundation.segments.some(
        segment => segment.offerings.some(
            offering => offering.name.trim().length > 0
        )
    );

    return [segmentsEmpty, competitorsEmpty, propositionEmpty, offeringsEmpty];

}

/**
 * The four subsection titles, in page order, for the same dialog.
 *
 * Singular throughout, as the page's headings read them: each
 * names the kind of thing being answered, not the pile of them.
 */
export const BUSINESS_FOUNDATION_SUBSECTIONS = [
    "Customer Segment and Profile",
    "Competitor and Alternative",
    "Value Proposition",
    "Offering"
] as const;

/* ==================================================================
   Business System -- Customer Engagement (Page 2)

   See AnswerType.BusinessEngagement, and the specifications at
   docs/specifications/business-system/page-2-section-1-channels.md
   and page-2-section-2-customer-relationships.md (with its worked
   example beside it).

   Two sections, and the Segment owns both -- for the same reason it
   owns all four of Page 1's. A Channel's reference header shows
   "the selected Customer Segment", its Profiles and its Offerings;
   a Relationship is held with a Profile, whose Offerings and
   Channels are its Segment's. So this page is answered one Segment
   at a time, against the Segments Page 1 defines.

   NOTHING HERE IS DEFINED, ONLY REFERENCED. Segments, Profiles and
   Offerings all come from Page 1 and are held by id: this page
   never stores a name, so renaming a Profile on Page 1 renames it
   here, and neither page can drift from the other. "Do not
   duplicate information that already exists in those sections. Use
   references/selections instead."

   The one thing this page defines is the Channel, which Section 2
   then refers to by id in the same way.
================================================================== */

/**
 * The channel categories, as the specification lists them.
 *
 * "Provide a conservative predefined list... Do not allow unlimited
 * custom categories". Seven, closed: a category is a container for
 * the channels under it, and a list a founder can extend is a list
 * that stops grouping anything.
 */
/**
 * Where in the customer journey a kind of channel is plausibly
 * used, so the Journey Stage list offers what fits rather than all
 * five every time.
 *
 * Taken from the specification's own worked examples, and kept
 * generous: this narrows a list to stop a founder hesitating over
 * an answer that cannot be right, not to argue with one that is.
 * A stage already recorded is always still offered, whatever the
 * category later becomes -- see the editor -- so nothing a founder
 * has said can be hidden by a rule here.
 *
 * A category not listed, and any the founder names themselves,
 * offers all five: nothing is known about it to narrow by.
 */
const ALL_STAGES = [
    "discovery", "evaluation", "purchase", "delivery", "support"
] as const;

/*
 * THE CHANNEL CATEGORIES, in the order they are offered (the Customer
 * Channels specification's final taxonomy): each with what it is, the
 * Journey Stages a channel of that kind is usually used at, and its
 * channels -- the well-known places or means of that kind, each with
 * what it is, offered by name so nobody types "Instagram" twice and
 * spells it two ways. The picker adds "Other" after them, which lets
 * the name be typed; `otherDescription` says what it stands for.
 * One table: the pickers, their "i" help, the tests and the documents
 * all read it.
 *
 * "Other" is the fallback category, for a channel that fits none of
 * them: its name is the category the founder types, and it offers
 * every stage.
 */
export const BUSINESS_CHANNEL_CATEGORIES = [
    {
        id: "social-media",
        label: "Social Media",
        description: "Social platforms where people can discover your organisation, engage with your content and stay connected.",
        stages: ["discovery", "evaluation", "support"],
        channels: [
            { label: "Instagram", description: "A visual social platform for showcasing offerings, awareness and engagement." },
            { label: "Facebook", description: "A social platform for audience engagement, communities, events and promotion." },
            { label: "LinkedIn", description: "A professional platform for networking, expertise, services and B2B engagement." },
            { label: "YouTube", description: "A video platform for content, education, demonstrations and engagement." },
            { label: "TikTok", description: "A short-form video platform for discovery and engagement." },
            { label: "Pinterest", description: "A visual discovery platform for inspiration and product discovery." },
            { label: "X (Twitter)", description: "Public communication, discussion and audience engagement." }
        ],
        otherDescription: "Another social media platform."
    },
    {
        id: "community",
        label: "Community",
        description: "Spaces where people gather to discuss, participate, share knowledge and interact with your organisation or community.",
        stages: ["discovery", "evaluation", "support"],
        channels: [
            { label: "Facebook Group", description: "A community space for discussion and ongoing engagement." },
            { label: "Discord", description: "A community platform for ongoing discussion and interaction." },
            { label: "Reddit", description: "Topic-based communities for discussion and shared interests." },
            { label: "Slack", description: "A group communication and discussion environment." },
            { label: "Meetup", description: "A platform for communities and gatherings." }
        ],
        otherDescription: "Another community platform."
    },
    {
        id: "website",
        label: "Website",
        description: "Your organisation's own website and pages, used to present information, offerings, transactions, delivery or support.",
        stages: ALL_STAGES,
        channels: [
            { label: "Main Website", description: "Your organisation's primary website and online presence." },
            { label: "Online Store", description: "A website area for browsing and purchasing offerings." },
            { label: "Landing Page", description: "A focused page for an offering, campaign or action." },
            { label: "Booking / Registration Page", description: "A page for bookings, registrations or appointments." },
            { label: "Contact Page", description: "A page for contacting your organisation." }
        ],
        otherDescription: "Another website page or web presence.",
        namePlaceholder: "Website or page"
    },
    {
        id: "marketplace",
        label: "Marketplace",
        description: "Third-party platforms where customers can discover, evaluate, purchase or receive your offerings.",
        stages: ["discovery", "evaluation", "purchase", "delivery"],
        channels: [
            { label: "Etsy", description: "A marketplace for creative, handmade, personalised and physical products." },
            { label: "Amazon", description: "A large marketplace for physical and digital products." },
            { label: "Gumroad", description: "A platform for digital products, memberships and creator offerings." },
            { label: "Fiverr", description: "A marketplace for freelance and creative services." },
            { label: "Upwork", description: "A freelance marketplace for professional services." }
        ],
        otherDescription: "Another marketplace."
    },
    {
        id: "in-person",
        label: "In Person",
        description: "Physical locations, meetings, events or activities where you interact directly with customers.",
        stages: ["discovery", "evaluation", "delivery", "support"],
        channels: [
            { label: "Studio / Shop", description: "A physical location for visiting, browsing or receiving offerings." },
            { label: "Market / Pop-up", description: "A temporary physical selling or promotional presence." },
            { label: "Trade Fair / Exhibition", description: "An event for presenting offerings and meeting audiences." },
            { label: "Workshop / Class", description: "In-person teaching, training or an experience." },
            { label: "Event / Talk", description: "A presentation, talk or public gathering." },
            { label: "Sales Visit", description: "A face-to-face sales or relationship meeting." },
            { label: "Customer Location", description: "A service or interaction at the customer's location." },
            { label: "Pickup / Collection", description: "The customer collects a purchased product in person." }
        ],
        otherDescription: "Another in-person interaction."
    },
    {
        id: "email",
        label: "Email",
        description: "Communication with customers through email, including direct messages, newsletters and follow-ups.",
        stages: ["evaluation", "delivery", "support"],
        channels: [
            { label: "Direct Email", description: "Individual or small-group customer communication." },
            { label: "Newsletter", description: "Regular email communication to subscribers." },
            { label: "Email Campaign", description: "Planned email communication for a specific purpose." },
            { label: "Automated Email", description: "An email triggered by an action or a customer's status." }
        ],
        otherDescription: "Another form of email communication.",
        namePlaceholder: "Email address"
    },
    {
        id: "online-live",
        label: "Online / Live",
        description: "Live digital interactions or experiences delivered through online meeting, streaming or communication platforms.",
        stages: ["evaluation", "delivery", "support"],
        channels: [
            { label: "Zoom", description: "Live online meetings and video communication." },
            { label: "Google Meet", description: "Live online meetings and video communication." },
            { label: "Microsoft Teams", description: "Online meetings, communication and collaboration." },
            { label: "Live Stream", description: "A real-time broadcast to an online audience." }
        ],
        otherDescription: "Another live online platform or method."
    },
    {
        id: "direct-payment",
        label: "Direct Payment",
        description: "Methods customers use to pay your organisation directly, such as cash, card or bank transfer.",
        stages: ["purchase"],
        channels: [
            { label: "Card", description: "Payment with a debit, credit or other payment card." },
            { label: "Cash", description: "Payment in physical cash." },
            { label: "Bank Transfer", description: "Payment transferred directly from the customer's bank account." },
            { label: "Payment Link", description: "Payment completed through a dedicated payment link." },
            { label: "Invoice", description: "Payment requested through an issued invoice." }
        ],
        otherDescription: "Another direct payment method.",
        namePlaceholder: "Payment method"
    },
    {
        id: "file-delivery",
        label: "File Delivery",
        description: "Services or methods used to deliver digital files or downloadable products to customers.",
        stages: ["delivery"],
        channels: [
            { label: "WeTransfer", description: "A file-transfer service for sending digital files." },
            { label: "Google Drive", description: "Cloud storage used to give access to digital files." },
            { label: "Dropbox", description: "Cloud storage and file sharing for digital files." },
            { label: "OneDrive", description: "Cloud storage and file sharing for digital files." },
            { label: "Email Attachment", description: "A digital file delivered as an email attachment." },
            { label: "Client Portal", description: "A dedicated customer area for accessing files and resources." }
        ],
        otherDescription: "Another digital file delivery method."
    },
    {
        id: "physical-delivery",
        label: "Physical Delivery",
        description: "Methods used to physically deliver products to customers, such as courier, postal service or local delivery.",
        stages: ["delivery"],
        channels: [
            { label: "Courier", description: "A product delivered through a courier or parcel service." },
            { label: "Postal Service", description: "A product sent through a national or international postal service." },
            { label: "Local Delivery", description: "A product delivered within a local area." },
            { label: "Third-party Fulfilment", description: "An outside provider stores, prepares and ships your products." }
        ],
        otherDescription: "Another physical delivery method."
    },
    {
        id: "retail-wholesale",
        label: "Retail & Wholesale",
        description: "Shops, stockists and trade buyers who sell your offerings to their own customers, or buy them in bulk to resell.",
        stages: ["discovery", "evaluation", "purchase", "delivery"],
        channels: [
            { label: "Retail Stockist", description: "A shop or boutique that stocks and sells your products." },
            { label: "Distributor", description: "A trade firm that buys in volume and supplies shops or other buyers." },
            { label: "Wholesale Account", description: "A business customer that buys in bulk at trade prices." },
            { label: "Reseller", description: "A business that sells your offerings on under its own name or alongside its own." },
            { label: "Concession / Shop-in-shop", description: "A space inside another shop where your products are sold." }
        ],
        otherDescription: "Another retail or wholesale route."
    },
    {
        id: "referral-affiliates",
        label: "Referral & Affiliates",
        description: "People and partners who send customers to you and are rewarded for the sales or leads they bring.",
        stages: ["discovery", "evaluation", "purchase"],
        channels: [
            { label: "Referral Partner", description: "A business or person that recommends you to their own contacts." },
            { label: "Affiliate", description: "A website or creator paid for the sales that come through their link." },
            { label: "Influencer / Ambassador", description: "A public voice who promotes your offerings to an audience." },
            { label: "Customer Referral", description: "Existing customers who bring new ones, often for a reward." }
        ],
        otherDescription: "Another referral or affiliate route."
    },
    {
        id: "other",
        label: "Other",
        description: "A channel that does not fit any of the categories above.",
        stages: ALL_STAGES,
        channels: [],
        otherDescription: "A channel of your own."
    }
] as const;

/** A point of help: a name and what it means. */
export interface ChannelHelpPoint {
    title: string;
    text: string;
}

/** The chosen one first, then the rest in their order. */
function chosenFirst(points: ChannelHelpPoint[], chosen: string): ChannelHelpPoint[] {
    const at = points.findIndex(point => point.title === chosen.trim());
    return at <= 0 ? points : [points[at], ...points.slice(0, at), ...points.slice(at + 1)];
}

/**
 * The "i" beside the Channel Category picker: every category and what
 * it is, the one chosen first (from the one table).
 */
export function channelCategoryHelp(chosen: string): ChannelHelpPoint[] {
    return chosenFirst(
        BUSINESS_CHANNEL_CATEGORIES.map(category => ({ title: category.label, text: category.description })),
        chosen
    );
}

/**
 * The "i" beside a channel's picker: its category's channels and what
 * each is, "Other" last, the one chosen first. None for a category of
 * the founder's own, which has no list.
 */
export function channelOptionHelp(category: string, chosen: string): ChannelHelpPoint[] {
    const known = BUSINESS_CHANNEL_CATEGORIES.find(entry => entry.label === category);
    if (!known || known.channels.length === 0) {
        return [];
    }
    return chosenFirst([
        ...known.channels.map(channel => ({ title: channel.label, text: channel.description })),
        { title: BUSINESS_CHANNEL_OTHER, text: known.otherDescription }
    ], chosen);
}

/** What to write in a channel's name box, for a category that says. */
export function businessChannelNamePlaceholder(category: string): string {

    const known = BUSINESS_CHANNEL_CATEGORIES.find(
        entry => entry.label === category
    );

    return (known && "namePlaceholder" in known)
        ? known.namePlaceholder
        : "Channel name";

}

/** A category's label, whether it is one of the seven or a name
 *  the founder gave it themselves. */
function businessChannelCategoryLabel(category: string): string {
    return BUSINESS_CHANNEL_CATEGORIES.find(
        entry => entry.id === category
    )?.label ?? category;
}

/**
 * The last entry of a channel list.
 *
 * Choosing it does not switch the field into another mode -- it
 * empties the box so the name can be typed straight into it. The
 * name is the name wherever it came from.
 */
export const BUSINESS_CHANNEL_OTHER = "Other";

/**
 * The five customer journey stages, shared by both of this page's
 * sections -- a Channel is used at some of them, and a Relationship
 * is conducted at some of them.
 *
 * One list, declared once, because the two sections have to agree:
 * Section 2 picks a Channel for a stage and shows the Action that
 * Channel records for that same stage, which only resolves while
 * both are naming the stage the same way.
 *
 * Purchase and Delivery stay apart -- "Payment and delivery may
 * happen through completely different channels."
 */
export const BUSINESS_JOURNEY_STAGES = [
    // "Discover", the specification's word; the id stays "discovery",
    // so every stored answer still names it.
    { id: "discovery", label: "Discover" },
    { id: "evaluation", label: "Evaluation" },
    { id: "purchase", label: "Purchase" },
    { id: "delivery", label: "Delivery" },
    { id: "support", label: "Support & Follow Up" }
] as const;

/**
 * The five relationship types, each with the explanation the
 * specification gives it.
 *
 * Shown behind the "i" rather than beside every tick, the way the
 * competitor types are on Page 1 -- choosing is then reading five
 * words rather than five sentences.
 */
export const BUSINESS_RELATIONSHIP_TYPES = [
    {
        id: "self-service",
        label: "Self-Service",
        explanation: "The customer can find information, make decisions and use the offering independently, with little direct assistance."
    },
    {
        id: "personal-assistance",
        label: "Personal Assistance",
        explanation: "A person communicates directly with the customer and provides guidance or help when needed."
    },
    {
        id: "dedicated-support",
        label: "Dedicated Support",
        explanation: "The customer receives structured, ongoing support from a designated person or team."
    },
    {
        id: "community",
        label: "Community",
        explanation: "The relationship is supported through interaction with a community of customers or users."
    },
    {
        id: "automated-service",
        label: "Automated Service",
        explanation: "Technology provides information, guidance or assistance without direct involvement from a person."
    }
] as const;

/**
 * Get, Keep and Grow, each with what it MEANS.
 *
 * The meaning is shown beside the name rather than behind the "i":
 * "The dropdown should not just say Get / Keep / Grow. Give the
 * user the meaning directly... This makes the terminology usable
 * even for someone who has never encountered the Get / Keep / Grow
 * model."
 */
export const BUSINESS_RELATIONSHIP_GOALS = [
    {
        id: "get",
        label: "Get",
        explanation: "Attract and convert suitable customers."
    },
    {
        id: "keep",
        label: "Keep",
        explanation: "Maintain satisfaction and encourage continued engagement."
    },
    {
        id: "grow",
        label: "Grow",
        explanation: "Develop the relationship through additional or deeper value."
    }
] as const;

/**
 * One channel: a specific thing with a destination, nested under
 * one of the seven categories.
 *
 * `actions` is keyed by journey stage and holds a list per stage:
 * "For every selected Journey Stage, create a corresponding Action
 * slot", and "Allow more than one Action under a Journey Stage".
 *
 * It is a MAP rather than a list parallel to `stages` so that
 * unticking a stage hides its actions without throwing them away.
 * Unticking is how a founder tries a stage on; it is not a request
 * to delete what they wrote under it, and re-ticking brings the
 * work straight back. The same reason Page 1 keeps what is written
 * under a competitor question its type later hides.
 */
export interface BusinessChannelValue {
    id: string;
    /**
     * The category's LABEL -- one of BUSINESS_CHANNEL_CATEGORIES'
     * seven, a name the founder gave it themselves, or "".
     */
    category: string;
    /**
     * What the channel is called.
     *
     * One field, whether it was typed or taken from the category's
     * list -- a name chosen from a list is the same answer as a
     * name written by hand, and storing "Other" plus the real name
     * beside it was two fields for one fact.
     */
    name: string;
    /** One destination per entry -- a channel may have several. */
    links: string[];
    /** Offering ids, from this Segment's Page 1 Offerings. */
    offerings: string[];
    /** Journey stage ids this channel is used at. */
    stages: string[];
    /**
     * THE ACTIONS OF EACH ROW (channel x stage), by id, in order: each
     * a reference to one of the Segment's actions (its `actions`), so
     * the same action can stand in any number of rows. Kept when a
     * stage is unticked.
     */
    actionIds: Record<string, string[]>;
    /**
     * The same actions' texts, row by row, as read (never written):
     * worked out from `actionIds` every time the answer is read, for
     * everything that only reads them -- documents, exports, search.
     */
    actions: Record<string, string[]>;
}

/**
 * One action of a Segment's channels: written once, placed in any
 * number of rows (BusinessChannelValue.actionIds). Editing it edits
 * it in every row; it is gone once no row holds it.
 */
export interface BusinessChannelActionValue {
    id: string;
    text: string;
}

/**
 * One interaction: a journey stage within an Offering within a
 * Relationship Type.
 *
 * The Goal lives HERE rather than on the relationship as a whole.
 * "The Goal belongs to the Journey Stage/interaction, not
 * necessarily to the whole Profile" -- one relationship can be
 * getting a customer at Evaluation and keeping them at Support, and
 * saying the relationship is "Get + Keep" loses which is which. It
 * is optional per stage, since not every interaction needs a
 * strategic goal of its own.
 */
/**
 * One interaction: what is done at one journey stage, through one
 * channel, for one Offering.
 *
 * It holds ONLY THE ANSWERS. Which interactions exist is not
 * recorded here -- it is read off the Channels table, which
 * already says which Offerings each channel carries and at which
 * stages it is used. See businessRelationshipInteractions.
 */
export interface BusinessRelationshipInteractionValue {
    approach: string;
    /** BUSINESS_RELATIONSHIP_GOALS ids; more than one allowed. */
    goals: string[];
}

/**
 * One Relationship Type slot: why it is maintained, and how each
 * interaction under it is conducted.
 *
 * "Do not treat a combination such as Self-Service + Personal
 * Assistance as one Relationship Type" -- each is its own slot,
 * with its own Purpose, Approaches and Goals.
 *
 * The Offerings and the stages it covers are NOT stored. They are
 * derived from the Channels table, so the two sections cannot
 * disagree about which interactions the organisation actually has:
 * adding a journey stage to a channel adds the row here, and
 * taking it away takes the row away. What is stored is what only a
 * person can say -- the Purpose, and each interaction's Approach
 * and Goals, kept under the key that identifies it.
 */
export interface BusinessRelationshipTypeValue {
    purpose: string;
    /**
     * By `businessInteractionKey` -- Offering, stage and channel
     * together, because one Offering can be engaged at the same
     * stage through two different channels and each of those is
     * its own interaction with its own Approach.
     */
    interactions: Record<string, BusinessRelationshipInteractionValue>;
}

/**
 * The relationship kept with one Profile ABOUT ONE OFFERING.
 *
 * The kind of relationship is per Offering, not per Profile: the
 * same person may want to buy a product on their own and be walked
 * through a service, and those are two relationships with two
 * reasons behind them. "Do not treat a combination such as
 * Self-Service + Personal Assistance as one Relationship Type" --
 * each is still its own slot, now within the Offering it concerns.
 */
export interface BusinessOfferingRelationshipsValue {
    /** BUSINESS_RELATIONSHIP_TYPES ids, each its own slot. */
    types: string[];
    /** Kept by type id, so unticking a type loses nothing. */
    typeDetail: Record<string, BusinessRelationshipTypeValue>;
}

/**
 * Stored in a channel's Offerings in place of listing them: this
 * channel carries EVERY Offering the Segment has.
 *
 * A mark rather than the ids written out, so it keeps meaning
 * "all" as Page 1 gains Offerings -- a channel that carries
 * everything today carries whatever is added tomorrow -- and so a
 * channel that does carry everything stays one line rather than
 * five. Chosen not to collide with an id, which randomId always
 * gives a "kind-" prefix.
 */
export const BUSINESS_CHANNEL_ALL_OFFERINGS = "*";

/** Which Offerings a channel actually carries, with the "all"
 *  mark resolved against the Segment's own list. */
function businessChannelOfferings(
    channel: BusinessChannelValue,
    offerings: readonly { id: string }[]
): string[] {

    return channel.offerings.includes(BUSINESS_CHANNEL_ALL_OFFERINGS)
        ? offerings.map(offering => offering.id)
        : channel.offerings;

}

/**
 * The Offerings that answer a Profile's FUNCTIONAL NEEDS.
 *
 * Page 1 has both halves of this already: a Profile lists what it
 * needs to get done, and an Offering lists which of those needs it
 * addresses. An Offering that answers none of a Profile's needs is
 * not sold to that Profile, whatever else is true of it -- so the
 * relationships kept with that Profile are not about it.
 *
 * Matched on the need's TEXT, because that is what an Offering
 * stores, and without regard to case or surrounding space --
 * exactly as businessSegmentNeeds pools them, so the two agree
 * about what counts as the same need.
 */
export function businessProfileOfferings(
    profile: BusinessCustomerProfileValue,
    offerings: readonly BusinessOfferingValue[]
): BusinessOfferingValue[] {

    const needs = new Set(
        profile.needs.functional
            .map(need => need.trim().toLocaleLowerCase())
            .filter(need => need.length > 0)
    );

    if (needs.size === 0) {
        return [];
    }

    return offerings.filter(offering =>
        offering.needsAddressed.some(need =>
            needs.has(need.trim().toLocaleLowerCase())
        )
    );

}

/**
 * ONE KIND OF CHANNEL used at one journey stage, and the channels
 * of that kind it happens through -- "Social Media", then TikTok
 * and Instagram.
 *
 * A row of the Interaction Context column. Not an answer of its
 * own: the Approach and the Goal are written once for the stage
 * these all belong to.
 */
interface BusinessInteractionChannelsValue {
    /** A channel category's label, or "" for channels with none. */
    category: string;
    channelIds: string[];
}

/**
 * One interaction: one Offering, at one journey stage, through
 * every kind of channel used at it.
 *
 * ONE ANSWER PER STAGE. An organisation does not approach a
 * customer differently at Discovery depending on whether they
 * arrived through social media or the website -- it has an
 * approach to being discovered. The kinds of channel are where
 * that happens, listed under the stage, not separate answers.
 */
interface BusinessInteractionValue {
    key: string;
    offeringId: string;
    stageId: string;
    /** The kinds of channel used at this stage, in the order
     *  BUSINESS_CHANNEL_CATEGORIES gives them. */
    groups: BusinessInteractionChannelsValue[];
    /** See businessRelationshipInteractions. */
    legacyKeys: string[];
}

/**
 * The key one interaction's answers are filed under: the Offering
 * and the journey stage.
 */
export function businessInteractionKey(
    offeringId: string,
    stageId: string
): string {
    return offeringId + "|" + stageId;
}

/**
 * Every interaction the Channels table says exists FOR THESE
 * OFFERINGS, in the order the table reads: by Offering, then by
 * journey stage.
 *
 * This is the whole of what Customer Relationships is answered
 * against. A channel that carries two Offerings at three stages is
 * six interactions; a channel with no Offering chosen, or no stage,
 * is none.
 *
 * `offerings` is what the caller has already narrowed to -- for a
 * Profile's relationships, the Offerings that answer that Profile's
 * functional needs (see businessProfileOfferings). It also gives
 * the order, so the rows run in the same order as the Offerings
 * column of the reference header above them.
 *
 * `segmentOfferings` is the Segment's whole list, needed only to
 * resolve a channel marked as carrying all of them.
 */
export function businessRelationshipInteractions(
    channels: readonly BusinessChannelValue[],
    offerings: readonly { id: string }[],
    segmentOfferings: readonly { id: string }[] = offerings
): BusinessInteractionValue[] {

    const found: BusinessInteractionValue[] = [];

    /* WHERE A CATEGORY SORTS. The seven the page offers come in
       their own order, wherever a founder happened to add them to
       the Channels table; anything they named themselves follows,
       in the order it was met there. */
    const categoryOrder = (category: string) => {

        const known = BUSINESS_CHANNEL_CATEGORIES.findIndex(
            entry => entry.label === category
        );

        return known === -1 ? BUSINESS_CHANNEL_CATEGORIES.length : known;

    };

    for (const offering of offerings) {
        for (const stage of BUSINESS_JOURNEY_STAGES) {

            /* ONE ENTRY PER STAGE, holding the KINDS of channel used
               at it. Three social channels and the website at
               Discovery are one interaction reached four ways, not
               four interactions: the Approach and the Goal are
               written once, for being discovered. */
            for (const channel of channels) {

                if (
                    !businessChannelOfferings(channel, segmentOfferings)
                        .includes(offering.id) ||
                    !channel.stages.includes(stage.id)
                ) {
                    continue;
                }

                let entry = found.find(candidate =>
                    candidate.offeringId === offering.id &&
                    candidate.stageId === stage.id
                );

                if (!entry) {
                    entry = {
                        key: businessInteractionKey(offering.id, stage.id),
                        offeringId: offering.id,
                        stageId: stage.id,
                        groups: [],
                        legacyKeys: []
                    };
                    found.push(entry);
                }

                const group = entry.groups.find(
                    candidate => candidate.category === channel.category
                );

                if (group) {
                    group.channelIds.push(channel.id);
                } else {
                    entry.groups.push({
                        category: channel.category,
                        channelIds: [channel.id]
                    });
                }

                /* WHAT THIS STAGE'S ANSWER WAS FILED UNDER BEFORE.
                   Two rounds of it: one row per channel to begin
                   with, then one row per kind of channel. Both are
                   read as fallbacks so nothing written then is
                   stranded, and neither is ever written to. */
                for (const legacy of [
                    offering.id + "|" + stage.id + "|" + channel.id,
                    offering.id + "|" + stage.id + "|" + channel.category
                ]) {
                    if (!entry.legacyKeys.includes(legacy)) {
                        entry.legacyKeys.push(legacy);
                    }
                }

            }

        }
    }

    /* The kinds of channel in the page's own order, so Social Media
       reads before Website however the Channels table was filled
       in. The stages keep the journey's order they were built in. */
    for (const entry of found) {
        entry.groups.sort(
            (left, right) =>
                categoryOrder(left.category) - categoryOrder(right.category)
        );
    }

    return found;

}

/**
 * What one Page 1 Profile's relationships were, when they were
 * kept per Profile.
 *
 * Read only to be migrated: the relationship is kept ABOUT AN
 * OFFERING now, once, and the Profiles an Offering serves are read
 * off Page 1 and listed under it. Three Profiles buying the same
 * Offering are not three relationships with it -- see
 * BusinessOfferingRelationshipEntryValue.
 */
interface BusinessProfileRelationshipsValue {
    /** The Page 1 Profile this belonged to. */
    profileId: string;
    /** By Offering id. */
    offerings: Record<string, BusinessOfferingRelationshipsValue>;
}

/** What is kept about ONE Offering, whoever it is sold to. */
interface BusinessOfferingRelationshipEntryValue
    extends BusinessOfferingRelationshipsValue {
    /** The Page 1 Offering this belongs to. */
    offeringId: string;
}

/** One Page 1 Segment's answers to this page. */
export interface BusinessSegmentEngagementValue {
    /** The Page 1 Segment this belongs to. */
    segmentId: string;
    channels: BusinessChannelValue[];
    /** The Segment's channel actions, each held once (see BusinessChannelActionValue). */
    actions: BusinessChannelActionValue[];
    /**
     * By Offering, which is the order the table reads: Offering,
     * the Profiles it is sold to, then the relationship kept about
     * it.
     */
    offerings: BusinessOfferingRelationshipEntryValue[];
    /**
     * The same answers as they were kept before, by Profile. Never
     * written to; read once so nothing recorded then is lost (see
     * asBusinessSegmentEngagement).
     */
    profiles: BusinessProfileRelationshipsValue[];
}

/**
 * The whole page. Segments are held by id and never created here:
 * an entry exists only once something has been answered against
 * that Segment, and a Segment deleted on Page 1 simply stops being
 * drawn.
 */
/**
 * A CHANNEL'S RESOURCE (ChannelResources.ts): something a Customer
 * Channel needs, kept as a Resource card on 3. Infrastructure &
 * Capability (made in Offering's Capability › Resources, or earlier in
 * Infrastructure) -- where its Quantity, Price, Frequency and Description
 * are entered -- and linked here by that card's id. Its name is the
 * card's (one name). The channel's actions it serves are linked by id.
 * The card is made blank (no Offerings, no Status): the user fills it in
 * on page 3. Only a link: its cost is counted once, where it is recorded.
 */
export interface BusinessChannelResourceValue {
    id: string;
    /** The Page 1 Segment the channel is under. */
    segmentId: string;
    /** The channel's id. */
    channelId: string;
    /** The card on 3. Infrastructure & Capability (a resource, or a partner or the Workspace linked before). */
    resourceId: string;
    /** The Segment's channel actions it serves (BusinessChannelActionValue ids). */
    actionIds: string[];
    /** The card was already the company's and was linked ("Link existing"): taking it off the channel keeps it. */
    existing?: boolean;
}

export interface BusinessEngagementValue {
    segments: BusinessSegmentEngagementValue[];
    /** The channels' resources (see BusinessChannelResourceValue). */
    channelResources: BusinessChannelResourceValue[];
    /**
     * Demand & Conversion, by Offering id: how each Offering's
     * customers come, and so its expected sales (see DemandCapacity.ts).
     * Optional: an Offering without one has its sales entered on
     * Sustainability.
     */
    demand: Record<string, DemandValue>;
}

export function createBusinessChannel(): BusinessChannelValue {
    return {
        id: randomId("channel"),
        category: "",
        name: "",
        links: [""],
        // A channel always carries Offerings; a new one carries them all.
        offerings: [BUSINESS_CHANNEL_ALL_OFFERINGS],
        stages: [],
        actionIds: {},
        actions: {}
    };
}

export function createBusinessRelationshipInteraction(): BusinessRelationshipInteractionValue {
    return { approach: "", goals: [] };
}

export function createBusinessRelationshipType(): BusinessRelationshipTypeValue {
    return { purpose: "", interactions: {} };
}

/**
 * A Segment's empty answer to this page.
 *
 * Its first channel's id is DERIVED FROM THE SEGMENT rather than
 * drawn at random, because this is called during rendering: a
 * Segment that has not been answered yet has no stored entry, so
 * the editor builds one to draw. A random id there would be a new
 * id on every keystroke -- a card React treats as a different card
 * each time, losing the caret out of whatever was being typed into.
 *
 * One channel from the start, for the reason Page 1 starts with one
 * of everything: a section showing nothing but an Add button reads
 * as missing rather than as empty.
 */
export function createBusinessSegmentEngagement(
    segmentId: string
): BusinessSegmentEngagementValue {
    return {
        segmentId,
        channels: [{ ...createBusinessChannel(), id: segmentId + "-channel" }],
        actions: [],
        offerings: [],
        profiles: []
    };
}


export function createBusinessOfferingRelationships(): BusinessOfferingRelationshipsValue {
    return { types: [], typeDetail: {} };
}

/**
 * Page 1's Segments AS RECORDED, for the pages that refer to them.
 *
 * asBusinessFoundationValue invents a Segment when it finds none,
 * because its editor must always have one card to draw. A page
 * referring to Page 1 must not: an invented Segment carries a
 * freshly drawn id, so it would be a DIFFERENT Segment on every
 * render -- and Page 2 keys its cards, its stored answers and its
 * channels off that id. Every keystroke would rebuild the card
 * being typed into.
 *
 * Nothing recorded on Page 1 is an empty list here, which is what
 * Page 2 draws its own "define a Segment first" note from.
 */
export function businessFoundationSegments(
    value: unknown
): BusinessCustomerSegmentValue[] {

    const source = asObject(value);

    const recorded = Array.isArray(source.segments) && source.segments.length > 0;

    return recorded ? asBusinessFoundationValue(value).segments : [];

}

/** A list of ids, keeping only the ones the page still offers. */
function businessIdList(value: unknown, allowed?: ReadonlySet<string>): string[] {

    const list = (Array.isArray(value) ? value : [])
        .filter((entry): entry is string => typeof entry === "string");

    return allowed ? list.filter(entry => allowed.has(entry)) : list;

}

const BUSINESS_JOURNEY_STAGE_IDS: ReadonlySet<string> =
    new Set(BUSINESS_JOURNEY_STAGES.map(stage => stage.id));

const BUSINESS_RELATIONSHIP_TYPE_IDS: ReadonlySet<string> =
    new Set(BUSINESS_RELATIONSHIP_TYPES.map(type => type.id));

const BUSINESS_RELATIONSHIP_GOAL_IDS: ReadonlySet<string> =
    new Set(BUSINESS_RELATIONSHIP_GOALS.map(goal => goal.id));

function asBusinessChannel(entry: unknown): BusinessChannelValue {

    const channel = asObject(entry);

    // The texts as saved before actions were shared (read by
    // withSharedActions below, which turns them into actions).
    const actions: Record<string, string[]> = {};

    for (const [stage, list] of Object.entries(asObject(channel.actions))) {
        if (BUSINESS_JOURNEY_STAGE_IDS.has(stage)) {
            actions[stage] = businessNeedList(list);
        }
    }

    const actionIds: Record<string, string[]> = {};

    for (const [stage, list] of Object.entries(asObject(channel.actionIds))) {
        if (BUSINESS_JOURNEY_STAGE_IDS.has(stage) && Array.isArray(list)) {
            actionIds[stage] = list.map(asText).filter(id => id.length > 0);
        }
    }

    return {
        id: asText(channel.id) || randomId("channel"),
        /* Held as the LABEL, because a category can now be one the
           founder named themselves and there is no id for that.
           Anything saved as one of the seven ids becomes its label
           here, so an answer written before that and one written
           after group together instead of reading as two
           categories with the same name. */
        category: businessChannelCategoryLabel(
            asText(channel.category)
        ),
        name: asText(channel.name),
        links: businessNeedList(channel.links, 1),
        // A channel is never without Offerings: none saved (older data) reads as every Offering.
        offerings: businessIdList(channel.offerings).length > 0
            ? businessIdList(channel.offerings)
            : [BUSINESS_CHANNEL_ALL_OFFERINGS],
        stages: businessIdList(channel.stages, BUSINESS_JOURNEY_STAGE_IDS),
        // Marks a channel saved with shared actions (see withSharedActions).
        // (An empty one beside texts is a channel made new and given texts: read as saved before.)
        actionIds: channel.actionIds !== undefined && (Object.keys(actionIds).length > 0 || Object.keys(actions).length === 0)
            ? actionIds
            : (null as unknown as Record<string, string[]>),
        actions
    };

}

/**
 * A Segment's channels with their actions SHARED: each row's actions
 * as references to the Segment's own list, and the texts worked out
 * from them.
 *
 * A channel saved before actions were shared holds its texts: each
 * becomes an action of its own, one reference each -- never merged
 * with another of the same words, which may mean something else in
 * its row -- under an id made from where it was (channel, stage,
 * place), so reading the same answer twice gives the same ids. An
 * action no row holds any more is gone.
 */
function withSharedActions(
    channels: BusinessChannelValue[],
    stored: unknown
): { channels: BusinessChannelValue[]; actions: BusinessChannelActionValue[] } {

    const texts = new Map<string, string>();

    for (const entry of Array.isArray(stored) ? stored : []) {
        const action = asObject(entry);
        const id = asText(action.id);
        if (id) {
            texts.set(id, asText(action.text));
        }
    }

    const shared = channels.map(channel => {
        let actionIds: Record<string, string[]>;
        if (channel.actionIds) {
            actionIds = Object.fromEntries(Object.entries(channel.actionIds)
                .map(([stage, ids]) => [stage, ids.filter(id => texts.has(id))]));
        } else {
            actionIds = {};
            for (const [stage, list] of Object.entries(channel.actions)) {
                actionIds[stage] = list.flatMap((text, index) => {
                    if (!text.trim()) {
                        return [];
                    }
                    const id = "action-" + channel.id + "-" + stage + "-" + (index + 1);
                    texts.set(id, text);
                    return [id];
                });
            }
        }
        const actions = Object.fromEntries(Object.entries(actionIds)
            .map(([stage, ids]) => [stage, ids.map(id => texts.get(id) ?? "")]));
        return { ...channel, actionIds, actions };
    });

    const held = new Set(shared.flatMap(channel => Object.values(channel.actionIds).flat()));

    return {
        channels: shared,
        actions: [...texts.entries()].filter(([id]) => held.has(id)).map(([id, text]) => ({ id, text }))
    };

}

function asBusinessRelationshipInteraction(
    entry: unknown
): BusinessRelationshipInteractionValue {

    const interaction = asObject(entry);

    return {
        approach: asText(interaction.approach),
        goals: businessIdList(interaction.goals, BUSINESS_RELATIONSHIP_GOAL_IDS)
    };

}

function asBusinessRelationshipType(entry: unknown): BusinessRelationshipTypeValue {

    const type = asObject(entry);

    const interactions: Record<string, BusinessRelationshipInteractionValue> = {};

    for (const [key, detail] of Object.entries(asObject(type.interactions))) {
        interactions[key] = asBusinessRelationshipInteraction(detail);
    }

    /*
        The shape this replaced: Offerings and stages were chosen by
        hand and stored, with each stage's answers under
        offeringDetail -> stageDetail. Which interactions exist is
        read off the Channels table now, but WHAT WAS WRITTEN UNDER
        THEM IS NOT THROWN AWAY -- each old answer is re-filed under
        the key its Offering, stage and channel make, which is where
        the same interaction now looks for it.
    */
    for (const [offeringId, offering] of Object.entries(
        asObject(type.offeringDetail)
    )) {
        for (const [stageId, stage] of Object.entries(
            asObject(asObject(offering).stageDetail)
        )) {

            const detail = asObject(stage);

            /* Filed under the Offering and the stage, which is
               where the interaction looks. The channel it named is
               dropped rather than kept in the key: a stage has one
               Approach now, however many ways it happens. */
            const key = businessInteractionKey(offeringId, stageId);

            if (!(key in interactions)) {
                interactions[key] = asBusinessRelationshipInteraction(detail);
            }

        }
    }

    return {
        purpose: asText(type.purpose),
        interactions
    };

}

/**
 * The stored answer in the shape the editor expects, whatever was
 * actually saved.
 *
 * Unlike Page 1 this creates nothing when it finds nothing: the
 * page has no Segments of its own to invent, and which Segments
 * exist is Page 1's answer rather than this one's. An empty page is
 * an empty list here, and the editor draws it from the Foundation.
 */
export function asBusinessEngagementValue(value: unknown): BusinessEngagementValue {

    const source = asObject(value);

    const segments = (Array.isArray(source.segments) ? source.segments : [])
        .map(entry => {

            const segment = asObject(entry);

            const profiles = (Array.isArray(segment.profiles) ? segment.profiles : [])
                .map(candidate => {

                    const profile = asObject(candidate);

                    const offerings: Record<
                        string, BusinessOfferingRelationshipsValue
                    > = {};

                    for (const [offeringId, detail] of Object.entries(
                        asObject(profile.offerings)
                    )) {

                        const entryValue = asObject(detail);

                        const typeDetail: Record<
                            string, BusinessRelationshipTypeValue
                        > = {};

                        for (const [type, typeValue] of Object.entries(
                            asObject(entryValue.typeDetail)
                        )) {
                            if (BUSINESS_RELATIONSHIP_TYPE_IDS.has(type)) {
                                typeDetail[type] = asBusinessRelationshipType(typeValue);
                            }
                        }

                        offerings[offeringId] = {
                            types: businessIdList(
                                entryValue.types, BUSINESS_RELATIONSHIP_TYPE_IDS
                            ),
                            typeDetail
                        };

                    }

                    /*
                        The shape this replaced: the relationship
                        types were chosen once per PROFILE, with every
                        Offering's interactions filed under them. They
                        are chosen per Offering now -- the same person
                        may buy a product on their own and be walked
                        through a service.

                        NOTHING WRITTEN IS THROWN AWAY. Every stored
                        interaction already names its Offering in its
                        own key, so each one is re-filed under that
                        Offering, carrying the type it was under and
                        that type's Purpose with it. A type chosen
                        with nothing ever written under it names no
                        Offering and has nothing to carry, so it does
                        not survive -- there is nothing in it to lose.
                    */
                    for (const [type, typeValue] of Object.entries(
                        asObject(profile.typeDetail)
                    )) {

                        if (!BUSINESS_RELATIONSHIP_TYPE_IDS.has(type)) {
                            continue;
                        }

                        const old = asBusinessRelationshipType(typeValue);

                        for (const [key, interaction] of Object.entries(old.interactions)) {

                            const offeringId = key.split("|")[0];

                            if (offeringId.length === 0) {
                                continue;
                            }

                            const target = offerings[offeringId] ??
                                createBusinessOfferingRelationships();

                            if (!target.types.includes(type)) {
                                target.types = [...target.types, type];
                            }

                            const existing = target.typeDetail[type] ??
                                createBusinessRelationshipType();

                            target.typeDetail[type] = {
                                purpose: existing.purpose || old.purpose,
                                interactions: {
                                    ...existing.interactions,
                                    [key]: existing.interactions[key] ?? interaction
                                }
                            };

                            offerings[offeringId] = target;

                        }

                    }

                    return {
                        profileId: asText(profile.profileId),
                        offerings
                    };

                })
                .filter(profile => profile.profileId.length > 0);

            /*
                THE RELATIONSHIP IS KEPT ABOUT AN OFFERING, ONCE.

                It used to be kept per Profile, about an Offering --
                so three Profiles buying the same Offering each held
                their own Relationship Types, Purposes and Approaches
                for it. The page reads Offering first now, with the
                Profiles it is sold to listed under it, and one
                answer stands for all of them.

                MERGED RATHER THAN PICKED. Every Profile's entry for
                an Offering is folded into that Offering's own, field
                by field, and the FIRST thing written wins each
                field: the union of the types, the first Purpose
                given for each, and the first Approach and Goals
                given for each interaction. Nothing is thrown away
                except where two Profiles answered the SAME field
                about the same Offering differently, where one of the
                two has to go.
            */
            const merged: BusinessOfferingRelationshipEntryValue[] = [];

            const storedOfferings = Array.isArray(segment.offerings)
                ? segment.offerings
                : [];

            for (const candidate of storedOfferings) {

                const entry = asObject(candidate);
                const offeringId = asText(entry.offeringId);

                if (offeringId.length === 0) {
                    continue;
                }

                const typeDetail: Record<string, BusinessRelationshipTypeValue> = {};

                for (const [type, typeValue] of Object.entries(
                    asObject(entry.typeDetail)
                )) {
                    if (BUSINESS_RELATIONSHIP_TYPE_IDS.has(type)) {
                        typeDetail[type] = asBusinessRelationshipType(typeValue);
                    }
                }

                merged.push({
                    offeringId,
                    types: businessIdList(entry.types, BUSINESS_RELATIONSHIP_TYPE_IDS),
                    typeDetail
                });

            }

            for (const profile of profiles) {
                for (const [offeringId, kept] of Object.entries(profile.offerings)) {

                    let target = merged.find(
                        entry => entry.offeringId === offeringId
                    );

                    if (!target) {
                        target = {
                            offeringId,
                            ...createBusinessOfferingRelationships()
                        };
                        merged.push(target);
                    }

                    for (const type of kept.types) {
                        if (!target.types.includes(type)) {
                            target.types.push(type);
                        }
                    }

                    for (const [type, detail] of Object.entries(kept.typeDetail)) {

                        const existing = target.typeDetail[type] ??
                            createBusinessRelationshipType();

                        const interactions = { ...existing.interactions };

                        for (const [key, written] of Object.entries(detail.interactions)) {

                            const already = interactions[key];

                            interactions[key] = {
                                approach: already?.approach || written.approach,
                                goals: already?.goals.length
                                    ? already.goals
                                    : written.goals
                            };

                        }

                        target.typeDetail[type] = {
                            purpose: existing.purpose || detail.purpose,
                            interactions
                        };

                    }

                }
            }

            const { channels, actions } = withSharedActions(
                (Array.isArray(segment.channels) ? segment.channels : []).map(asBusinessChannel),
                segment.actions
            );

            return {
                segmentId: asText(segment.segmentId),
                channels,
                actions,
                offerings: merged,
                profiles
            };

        })
        .filter(segment => segment.segmentId.length > 0);

    const channelResources: BusinessChannelResourceValue[] = (Array.isArray(source.channelResources) ? source.channelResources : [])
        .map(entry => {
            const link = asObject(entry);
            return {
                id: asText(link.id) || randomId("channel-resource"),
                segmentId: asText(link.segmentId),
                channelId: asText(link.channelId),
                resourceId: asText(link.resourceId),
                actionIds: (Array.isArray(link.actionIds) ? link.actionIds : []).map(asText).filter(Boolean),
                ...(link.existing === true ? { existing: true } : {})
            };
        })
        .filter(link => link.segmentId && link.channelId && link.resourceId);

    /* COST LINKS SAVED BEFORE (a channel, or its category's row, linked
       to a cost card): each is a resource of its channel now, pointing
       at the SAME card -- nothing is made. A category's link goes to
       its first channel; one whose category has no channel is dropped.
       A resource is made on one channel: a card linked to several is
       the first one's, and serves the others through shared actions.
       Its id is kept, so reading it twice gives the same resource. */
    for (const entry of Array.isArray(source.channelCosts) ? source.channelCosts : []) {
        const link = asObject(entry);
        const segmentId = asText(link.segmentId);
        const key = asText(link.channelKey);
        const costId = asText(link.costId);
        const segment = segments.find(candidate => candidate.segmentId === segmentId);
        if (!segment || !key || !costId) {
            continue;
        }
        const channelId = key.startsWith("category:")
            ? segment.channels.find(channel => channel.category === key.slice("category:".length))?.id
            : segment.channels.find(channel => channel.id === key)?.id;
        if (!channelId || channelResources.some(existing => existing.resourceId === costId)) {
            continue;
        }
        channelResources.push({ id: asText(link.id) || "channel-resource-" + channelId + "-" + costId, segmentId, channelId, resourceId: costId, actionIds: [], existing: true });
    }

    return { segments, demand: asDemandMap(source.demand), channelResources };

}

/**
 * Which of this page's two sections are still empty, in page order,
 * so the completeness dialog can name the section.
 *
 * What counts as answered:
 *
 * 1. A named channel, under any Segment. The category alone is a
 *    container; the specific channel is the answer.
 * 2. A Relationship Type chosen for some Offering, with the Purpose
 *    that says why it is maintained. The type on its own is a
 *    selection; the Purpose is what the section asks for.
 */
export function businessEngagementSectionsEmpty(value: unknown): boolean[] {

    const engagement = asBusinessEngagementValue(value);

    const channelsEmpty = !engagement.segments.some(
        segment => segment.channels.some(
            channel => channel.name.trim().length > 0
        )
    );

    const relationshipsEmpty = !engagement.segments.some(
        segment => segment.offerings.some(
            offering => offering.types.some(
                type => (offering.typeDetail[type]?.purpose ?? "").trim().length > 0
            )
        )
    );

    return [channelsEmpty, relationshipsEmpty];

}

/**
 * The two section titles, in page order, for the same dialog.
 *
 * Singular, as Page 1's four are and as this page's own headings
 * read them: each names the kind of thing being answered.
 */
export const BUSINESS_ENGAGEMENT_SECTIONS = [
    "Customer Channel",
    "Customer Relationship"
] as const;

/* ==================================================================
   Business System -- Infrastructure & Capability (Page 3)

   See AnswerType.BusinessCapability, and the specification at
   docs/specifications/business-system/page-3-infrastructure-and-capability.md.

   Two sections holding the same three subsections:

     Infrastructure        1. Resources  2. Activities  3. Partnerships
     Offering's Capability 1. Resources  2. Activities  3. Partnerships

   Infrastructure is what the ORGANIZATION needs; Offering's
   Capability is what each OFFERING needs on top of it, so every row
   there is additionally linked to one of Page 1's Offerings.

   THE THREE SUBSECTIONS WRITE INTO EACH OTHER, which is the whole
   difficulty of this page. A resource marked "Partners & Suppliers"
   (or a space's "Rent") names a supplier under 3; one marked "Activity"
   chooses an activity under 2 (or makes one with "Other…"); an
   activity's responsible founder collects its name under their own
   Responsibilities in 1. Nothing here is a form that can be filled
   top to bottom and left alone.
================================================================== */

/** Where the organisation's work is carried out. */
export const BUSINESS_WORKSPACE_KINDS = [
    { id: "home", label: "Home" },
    { id: "coworking", label: "Coworking Space" },
    { id: "incubator", label: "Incubator / Accelerator" },
    { id: "dedicated", label: "Dedicated Workspace" },
    { id: "other", label: "Other" }
] as const;

/**
 * What is known about a resource, and what each answer obliges.
 *
 * `action` is the follow-up the specification attaches to the
 * status -- the thing that makes this page a system rather than a
 * list. See the editor, which carries each one out.
 *
 * Rent and Buy are a space's or a vehicle's own words for what
 * were Provided and Costs. "Needs Investigation" is kept for the people
 * cards alone (BUSINESS_PEOPLE_STATUS_IDS).
 */
export const BUSINESS_RESOURCE_STATUSES = [
    {
        id: "exists",
        label: "Exists / Free",
        explanation: "It is already available to the organization at no additional cost."
    },
    {
        id: "rent",
        label: "Rent",
        explanation: "It is rented through a supplier. Choose who."
    },
    {
        id: "partners-suppliers",
        label: "Partners & Suppliers",
        explanation: "It is supplied by a partner or a supplier, or cannot or should not be performed by the founders. Choose who."
    },
    {
        id: "activity",
        label: "Activity",
        explanation: "It can be created, developed or established internally by the founders."
    },
    {
        id: "investigation",
        label: "Needs Investigation",
        explanation: "It is not yet known and requires research."
    },
    {
        id: "buy",
        label: "Buy",
        explanation: "It is bought. Record its price."
    },
    {
        id: "costs",
        label: "Costs",
        explanation: "It must be purchased. Record its price and payment frequency."
    }
] as const;

/** The statuses a RESOURCE CARD offers. (A space's are BUSINESS_WORKSPACE_STATUS_IDS; a people card adds one, BUSINESS_PEOPLE_STATUS_IDS.) */
export const BUSINESS_RESOURCE_CARD_STATUS_IDS = ["exists", "partners-suppliers", "activity", "costs"] as const;

/** A people card's (Admin Team, Delivery Team): the common ones, and Needs Investigation. */
export const BUSINESS_PEOPLE_STATUS_IDS = ["exists", "partners-suppliers", "activity", "investigation", "costs"] as const;

/** The groups whose cards are people. */
export const BUSINESS_PEOPLE_GROUP_IDS = ["admin-team", "delivery-team"] as const;

/**
 * The groups whose cards are SPACES and VEHICLES (in both places): their statuses are Exists / Free, Rent, Activity and Buy. Rent names a supplier of one
 * group (RENT_SUPPLIER_GROUP), whose card holds the rent or the lease; Buy shows the price: One-time for a space, Per unit for a vehicle.
 */
export const BUSINESS_SPACE_GROUP_IDS = ["premises", "workshop-storage", "company-vehicles", "delivery-vehicles"] as const;

/** The statuses of a space or a vehicle. */
export const BUSINESS_SPACE_STATUS_IDS = ["exists", "rent", "activity", "buy"] as const;

export const isSpaceGroup = (groupId: string) => (BUSINESS_SPACE_GROUP_IDS as readonly string[]).includes(groupId);

/** The spaces (not the vehicles): bought One-time, with no Qty. */
export const isSpaceOnlyGroup = (groupId: string) => groupId === "premises" || groupId === "workshop-storage";

/** The one supplier group a Rent names, by place: Property, Vehicles & Facilities; Landlords, Leasing & Warehouses. */
export const RENT_SUPPLIER_GROUP: Record<"infrastructure" | "offering", string> = {
    infrastructure: "property-vehicles-facilities",
    offering: "landlords-leasing-warehouses"
};

/** The statuses a card of this group offers (a group of "" is any). */
export function resourceStatusIds(groupId: string): readonly string[] {
    return isSpaceGroup(groupId)
        ? BUSINESS_SPACE_STATUS_IDS
        : (BUSINESS_PEOPLE_GROUP_IDS as readonly string[]).includes(groupId) ? BUSINESS_PEOPLE_STATUS_IDS : BUSINESS_RESOURCE_CARD_STATUS_IDS;
}

/**
 * A card's status when it is filed in another group: a space or a vehicle's Rent and Buy are another card's Partners & Suppliers and Costs, and the other
 * way round; a status the new group does not offer is cleared.
 */
export function statusInGroup(status: string, groupId: string): string {
    const space = isSpaceGroup(groupId);
    const mapped = space
        ? (status === "partners-suppliers" ? "rent" : status === "costs" ? "buy" : status)
        : (status === "rent" ? "partners-suppliers" : status === "buy" ? "costs" : status);
    return status === "" || resourceStatusIds(groupId).includes(mapped) ? mapped : "";
}

/** Whether a status names a supplier: Partners & Suppliers, or a space's Rent. */
export const usesSupplier = (status: string) => status === "partners-suppliers" || status === "rent";

/**
 * The price a Buy asks for: a space's is One-time, a vehicle's Per unit (with the unit "unit"); what is already there for it is kept.
 */
export function buyCostOf(groupId: string, cost: BusinessCostValue): BusinessCostValue {
    if (isSpaceOnlyGroup(groupId)) {
        return cost.frequency === "" ? { ...cost, frequency: "one-time" } : cost;
    }
    return cost.frequency === "" ? { ...cost, frequency: "per-unit", unit: cost.unit || "unit" } : cost;
}

/** Whether a resource's status says a partner or supplier supplies it. */
export const isPartnered = (status: string) => status === "partners-suppliers";

/** Whether a status says the card is paid for with a price: Costs, or a space's Buy. */
export const isCostingStatus = (status: string) => status === "costs" || status === "buy";

/** The Workspace's statuses: a space's (the Workspace form is the common card now). */
export const BUSINESS_WORKSPACE_STATUS_IDS = [
    "exists", "rent", "activity", "buy"
] as const;

/**
 * How often a price is paid (the card's driver). Per unit (with a unit
 * name) and per project are costs of ACTIVITY -- a materials kit per
 * participant, a courier per parcel -- which Sustainability counts
 * against each unit sold rather than against the month; but a purchase
 * of an asset is priced per unit too (see isPurchaseGroup).
 */
export const BUSINESS_COST_FREQUENCIES = [
    { id: "one-time", label: "One-time" },
    { id: "monthly", label: "Monthly" },
    { id: "quarterly", label: "Quarterly" },
    { id: "annually", label: "Annually" },
    { id: "per-unit", label: "Per unit" },
    { id: "per-project", label: "Per project" },
    { id: "percent-revenue", label: "% of Rev" }
] as const;

interface BusinessResourceKind { id: string; label: string; help: string }

/**
 * The nine resource categories, each with the groups INFRASTRUCTURE
 * has in it (a group's id is also the id of the subsection that holds
 * its cards). The groups are fixed lists: no "Other" adds one.
 *
 * Founders & Owners, the first group of Human Resources, is the Founders
 * tile and is not listed here; the Offering's groups are
 * BUSINESS_OFFERING_RESOURCE_GROUPS.
 *
 * No letter or number: the page numbers them where it draws them,
 * inside the two groups it arranges them into (see the Capability
 * editor's RESOURCE_GROUPINGS), so the order is written once.
 */
export const BUSINESS_RESOURCE_GROUPS = [
    {
        id: "workspace",
        label: "Workspace",
        notes: [],
        kinds: [
            { id: "premises", label: "Premises", help: "The space where the team works, owned, rented through a landlord or at home, e.g. Studio rent, Shared-space seat, Home-office allowance, Owned office." }
        ] as BusinessResourceKind[]
    },
    {
        id: "utilities",
        label: "Utilities",
        notes: [
            "A utility category can contain multiple entries, such as additional equipment, maintenance, installation, or professional services.",
            "Record the appropriate provider or activity, and any related costs separately."
        ],
        kinds: [
            { id: "premises-utilities", label: "Premises Utilities", help: "The services the daily operation consumes, e.g. Electricity, Gas heating, Broadband line, Mobile plan." }
        ] as BusinessResourceKind[]
    },
    {
        id: "workstation",
        label: "Workstation",
        notes: [],
        kinds: [
            { id: "furniture-fittings", label: "Furniture & Fittings", help: "The furniture and fittings of the work areas, e.g. Standing desk, Drawing table, Ergonomic chair, Filing cabinet." }
        ] as BusinessResourceKind[]
    },
    {
        id: "equipment",
        label: "Equipment",
        notes: [],
        kinds: [
            { id: "devices-tools", label: "Devices & Tools", help: "The devices and tools the team uses for its own work, bought or leased, e.g. Laptop, Label printer, Mirrorless camera, Vehicle tracker, Protective goggles." }
        ] as BusinessResourceKind[]
    },
    {
        id: "vehicles",
        label: "Vehicles",
        notes: [],
        kinds: [
            { id: "company-vehicles", label: "Company Vehicles", help: "Cars and bikes the company owns or leases for general use, e.g. Sales car, Cargo bike, Minibus lease." },
            { id: "vehicle-running-costs", label: "Vehicle Running Costs", help: "Fuel and the everyday running costs of company vehicles, e.g. Petrol, Electric charging, Car wash, Washer fluid." }
        ] as BusinessResourceKind[]
    },
    {
        id: "digital",
        label: "Digital Infrastructure",
        notes: [],
        kinds: [
            { id: "software-web", label: "Software & Web", help: "Software subscriptions and the public website, e.g. Bookkeeping software, Company website, Shared mailbox, Fleet tracking." },
            { id: "cloud-security", label: "Cloud & Security", help: "Storage, back-up and protection of files and data, e.g. Cloud drive, Nightly back-up, Password vault, Antivirus." }
        ] as BusinessResourceKind[]
    },
    {
        id: "materials",
        label: "Materials & Inventory",
        notes: [],
        kinds: [
            { id: "business-consumables", label: "Business Consumables", help: "Everyday items the business uses up and replaces, e.g. Copy paper, Dish soap, Coffee beans." }
        ] as BusinessResourceKind[]
    },
    {
        id: "documents",
        label: "Documents & Rights",
        notes: [],
        kinds: [
            { id: "insurances", label: "Insurances", help: "Policies that cover the company's liability, premises and people, e.g. Public liability, Cyber, Key person, Directors and officers." },
            { id: "licences", label: "Licences", help: "Paid permissions: the right to use another's work and permits from authorities, e.g. Stock photo licence, Typeface rights, Image library, Staff parking permit." },
            { id: "certificates", label: "Certificates", help: "Certificates and inspections of the premises and the team, e.g. Gas safety certificate, Fire-risk assessment, First-aid award, Energy rating." },
            { id: "tickets-trips", label: "Tickets & Trip Costs", help: "The fares and stops of trips that serve the whole company, e.g. Conference train fare, Hotel for a seminar, Airport taxi, Car park." }
        ] as BusinessResourceKind[]
    },
    {
        id: "hr",
        label: "Human Resources",
        notes: [],
        kinds: [
            { id: "admin-team", label: "Admin Team", help: "Staff and helpers who handle the company's administration, e.g. Operations manager, Bookkeeper, Receptionist, Intern." }
        ] as BusinessResourceKind[]
    }
] as const;

/** The same nine categories in the Offering's Capability, and the groups it has in each. */
export const BUSINESS_OFFERING_RESOURCE_GROUPS: readonly { id: string; label: string; kinds: readonly BusinessResourceKind[] }[] = [
    { id: "workspace", label: "Workspace", kinds: [
        { id: "site-hire", label: "Site Hire", help: "The site rented for one event or job, e.g. Market pitch fee, Stand levy, Marquee frame, Rehearsal room slot." },
        { id: "workshop-storage", label: "Workshop & Storage", help: "The permanent base where the product is made or stored, e.g. Warehouse bay, Container yard, Shared-kitchen membership, Chiller space." }
    ] },
    { id: "utilities", label: "Utilities", kinds: [
        { id: "process-utilities", label: "Process Utilities", help: "The energy, water and waste services that production consumes, e.g. Firing power, Rinse water, Chemical disposal." }
    ] },
    { id: "workstation", label: "Workstation", kinds: [
        { id: "fixtures-displays", label: "Fixtures & Displays", help: "Fixed installations in your premises for making or showing the product, e.g. Workbench, Pallet racking, Showcase shelves, Sign board." }
    ] },
    { id: "equipment", label: "Equipment", kinds: [
        { id: "production-machinery", label: "Production Machinery", help: "Machines that turn raw materials into finished goods, e.g. Floor loom, Industrial oven, Laser cutter." },
        { id: "devices-tools", label: "Devices & Tools", help: "The tools, instruments and gear used to make or deliver the offering, besides its machines, e.g. Card reader, Stall display kit, Tripod rig, Hard hat, Moisture meter." }
    ] },
    { id: "vehicles", label: "Vehicles", kinds: [
        { id: "delivery-vehicles", label: "Delivery Vehicles", help: "Vans and trucks that carry or install the product, e.g. Transit van, Refrigerated truck, Short-term hire." },
        { id: "delivery-running-costs", label: "Delivery Running Costs", help: "Fuel and the everyday running costs of delivery vehicles, e.g. Diesel, AdBlue, Van valet, Cab air freshener." }
    ] },
    { id: "digital", label: "Digital Infrastructure", kinds: [
        { id: "sales-delivery-tools", label: "Sales & Delivery Tools", help: "Software that takes orders, bookings and payments, then delivers the result, e.g. Web shop, Booking app, Newsletter tool, File transfer." },
        { id: "platforms-apis", label: "Platforms & APIs", help: "Online services your product calls, billed per use, e.g. AI text service, Maps lookup, Address check, Speech transcription." }
    ] },
    { id: "materials", label: "Materials & Inventory", kinds: [
        { id: "materials-stock", label: "Materials & Stock", help: "The materials, parts, packaging and resale goods that each sale uses, e.g. Yarn, Brass fittings, Mailer boxes, Gift wrap, Sample swatches, Resale mugs." }
    ] },
    { id: "documents", label: "Documents & Rights", kinds: [
        { id: "insurances", label: "Insurances", help: "Policies that cover products, jobs and events, e.g. Product recall, Carriage of goods, Event cancellation, Customer default." },
        { id: "licences", label: "Licences", help: "Paid permissions for the offering: the right to use another's work and permits from authorities, e.g. Licensed artwork, Backing track, Patented method, Parking-bay suspension." },
        { id: "royalties", label: "Royalties", help: "Payments that follow the sales or use of another's creation, e.g. Author royalty, Franchise percentage, Patent share, Master-rights split." },
        { id: "certificates", label: "Certificates", help: "Certificates, inspections and the tests behind them, needed to sell or use an offering, e.g. CE-mark testing, Organic certification, Flame trial, Food-safety swab." },
        { id: "tickets-trips", label: "Tickets & Trip Costs", help: "The fares, stops and tolls of trips that the work requires, e.g. Coach ticket, Ferry crossing, Toll bridge, Loading-bay fee." }
    ] },
    { id: "hr", label: "Human Resources", kinds: [
        { id: "delivery-team", label: "Delivery Team", help: "The people who make the product or serve the customer, e.g. Weaver, Instructor, Installer, Barista." }
    ] }
];

/**
 * The groups whose cards are bought things (assets): a purchase there is
 * priced Per unit, and the quantity multiplies the price. A space bought
 * is One-time.
 */
export const BUSINESS_PURCHASE_GROUP_IDS = [
    "furniture-fittings", "devices-tools", "fixtures-displays", "production-machinery", "company-vehicles", "delivery-vehicles"
] as const;

export const isPurchaseGroup = (groupId: string) => (BUSINESS_PURCHASE_GROUP_IDS as readonly string[]).includes(groupId);

/** The id of a category's group when it has exactly one (nothing is left to choose), else "". */
export function soleGroupOf(groups: readonly { id: string }[] | undefined): string {
    return groups !== undefined && groups.length === 1 ? groups[0].id : "";
}

/**
 * THE PERIOD of an activity group (cost model section 13), as the days its dates must stay inside: Pre-Operational runs from Plan Start to the day before
 * the Opening Date; Operational and Sales & Customer from the Opening Date; Production and Marketing from Plan Start. A bound that is not known (a date
 * not given yet) is "" and holds nothing.
 */
export function activityPeriod(groupId: string, planStart: string, openingDate: string): { from: string; to: string } {
    switch (groupId) {
        case "pre-operational": {
            const opening = isoToTime(openingDate);
            return { from: planStart, to: opening === null ? "" : timeToIso(opening - PAYMENT_DAY) };
        }
        case "operational":
        case "sales":
            return { from: openingDate, to: "" };
        case "production":
        case "marketing":
            return { from: planStart, to: "" };
        default:
            return { from: "", to: "" };
    }
}

/** The last day of an activity: its End date, else its Start date (an activity with no end counts as one day). */
export const activityLastDay = (activity: { startDate: string; endDate: string }) => activity.endDate || activity.startDate;

/** What is wrong with an activity's dates against the period of its group: a start before it, an end after it, an end before its start. */
export function activityDateIssues(activity: { startDate: string; endDate: string }, period: { from: string; to: string }): string[] {
    const issues: string[] = [];
    if (activity.startDate && period.from && activity.startDate < period.from) {
        issues.push("The Start date is before the period begins.");
    }
    if (period.to && ((activity.startDate && activity.startDate > period.to) || (activityLastDay(activity) && activityLastDay(activity) > period.to))) {
        issues.push("The dates run past the end of the period.");
    }
    if (activity.endDate && activity.startDate && activity.endDate < activity.startDate) {
        issues.push("The End date is before the Start date.");
    }
    return issues;
}

/**
 * A resource linked to an activity: the card, and the number of units of it the activity uses when the card has units (a Per unit price: 3 hours, 40 km).
 */
export interface BusinessActivityResource {
    id: string;
    units: string;
}

/** The linked resources whose Start date falls after the activity ends (its End date, else its Start date): a linked card cannot begin later. */
export function resourcesStartingTooLate(activity: { startDate: string; endDate: string }, starts: Readonly<Record<string, string>>, linked: readonly BusinessActivityResource[]): string[] {
    const last = activityLastDay(activity);
    return last === "" ? [] : linked.filter(entry => entry.id !== "" && (starts[entry.id] ?? "") !== "" && starts[entry.id] > last).map(entry => entry.id);
}

/** The most units of a resource an activity (or a performer) can take: the Qty of the card (whole units); null where the card has no limit to give. */
export function unitsCap(quantity: string): number | null {
    const count = Math.floor(parseAmount(quantity) ?? 0);
    return count >= 1 ? count : null;
}

/** Units typed for a resource or a performer, kept whole and never more than the card holds. */
export function cappedUnits(typed: string, quantity: string): string {
    const digits = typed.replace(/\D/g, "").slice(0, 6);
    const cap = unitsCap(quantity);
    return digits !== "" && cap !== null && Number(digits) > cap ? String(cap) : digits;
}

/**
 * THE PAYMENT PLAN of a Per project price (cost model section 13): when the money leaves, not what the cost is. Not ticked, the price is paid in full on the
 * card's Start date. Ticked, its type is one of three; every payment has a percent and a date, and the percents total 100% or the card is incomplete.
 *
 * - Deposit & Balance: a percent at the Start date and the rest on a second date (the End date unless another is given).
 * - Instalments: a number of payments, dated evenly from the Start date to the End date and equal; the dates and amounts can be moved.
 * - Milestones: a title, a percent and a date for each stage.
 */
export const BUSINESS_PAYMENT_PLANS = [
    { id: "deposit-balance", label: "Deposit & Balance" },
    { id: "instalments", label: "Instalments" },
    { id: "milestones", label: "Milestones" }
] as const;

export interface BusinessPaymentLine {
    id: string;
    /** A stage's name (Milestones); "" for the others. */
    title: string;
    percent: string;
    /** An ISO date; "" is the card's Start date for the first line of Deposit & Balance, its End date for the second. */
    date: string;
}

export interface BusinessPaymentPlan {
    on: boolean;
    /** One of BUSINESS_PAYMENT_PLANS' ids, or "". */
    type: string;
    /** The number of Instalments, as typed. */
    count: string;
    lines: BusinessPaymentLine[];
}

export const emptyPaymentPlan = (): BusinessPaymentPlan => ({ on: false, type: "", count: "", lines: [] });

function asPaymentPlan(value: unknown): BusinessPaymentPlan {
    const plan = asObject(value);
    const type = asText(plan.type);
    return {
        on: plan.on === true,
        type: BUSINESS_PAYMENT_PLANS.some(entry => entry.id === type) ? type : "",
        count: asText(plan.count).replace(/\D/g, "").slice(0, 2),
        lines: (Array.isArray(plan.lines) ? plan.lines : []).slice(0, 60).map(entry => {
            const line = asObject(entry);
            return { id: asText(line.id) || randomId("payment"), title: asText(line.title), percent: businessDecimalText(asText(line.percent)), date: isoDateText(line.date) };
        })
    };
}

const PAYMENT_DAY = 24 * 60 * 60 * 1000;

function isoToTime(iso: string): number | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
    return match ? Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

function timeToIso(time: number): string {
    return new Date(time).toISOString().slice(0, 10);
}

/** Equal shares of 100%, to two decimals, the last taking what rounding leaves: three are 33.33, 33.33 and 33.34. */
export function equalPercents(count: number): string[] {
    if (count < 1) {
        return [];
    }
    const each = Math.floor(10000 / count) / 100;
    const shares = Array.from({ length: count }, () => each);
    shares[count - 1] = Math.round((100 - each * (count - 1)) * 100) / 100;
    return shares.map(share => String(share));
}

/** INSTALMENTS: `count` equal payments, dated evenly from the Start date to the End date (the first on the Start date, the last on the End date). */
export function instalmentLines(count: number, startDate: string, endDate: string): BusinessPaymentLine[] {
    const first = isoToTime(startDate);
    const last = isoToTime(endDate);
    return equalPercents(count).map((percent, at) => ({
        id: randomId("payment"),
        title: "",
        percent,
        date: first === null ? "" : count === 1 || last === null || last < first ? startDate : timeToIso(first + Math.round((last - first) / PAYMENT_DAY * at / (count - 1)) * PAYMENT_DAY)
    }));
}

/** The payments of a plan as they fall: the first of Deposit & Balance on the Start date, the second on its own date else the End date. */
export function paymentPlanLines(plan: BusinessPaymentPlan, startDate: string, endDate: string): BusinessPaymentLine[] {
    if (plan.type === "instalments" && plan.lines.length > 0) {
        // Instalments are dated evenly from the first to the last: those two are the plan's own dates (the card has no Start or End date while it has a plan), the ones between follow them.
        const count = plan.lines.length;
        const first = plan.lines[0].date || startDate;
        const last = plan.lines[count - 1].date || endDate || first;
        const dated = instalmentLines(count, first, last);
        return plan.lines.map((line, at) => ({ ...line, date: dated[at].date }));
    }
    if (plan.type === "milestones" && plan.lines.length > 0) {
        // Milestones with no date of their own take the card's: the first the Start date, the last the End date, the ones between spread evenly.
        const count = plan.lines.length;
        const first = plan.lines[0].date || startDate;
        const last = plan.lines[count - 1].date || endDate || first;
        const spread = instalmentLines(count, first, last);
        return plan.lines.map((line, at) => ({ ...line, date: line.date || spread[at].date }));
    }

    return plan.type === "deposit-balance"
        ? plan.lines.slice(0, 2).map((line, at) => ({ ...line, date: line.date || (at === 0 ? startDate : endDate) }))
        : plan.lines;
}

/** What the percents of a plan add up to. */
export function paymentPlanTotal(plan: BusinessPaymentPlan): number {
    return Math.round(plan.lines.reduce((sum, line) => sum + (parseAmount(line.percent) ?? 0), 0) * 100) / 100;
}

/**
 * Whether the plan of a Per project price leaves the card incomplete: a plan ticked with no type, percents that do not total 100%, or a payment with no date
 * (for Deposit & Balance, no Start date or no End date to fall back on). Nothing is wrong with a plan that is not ticked.
 */
export function paymentPlanIncomplete(cost: { frequency: string }, plan: BusinessPaymentPlan, startDate: string, endDate: string): boolean {
    if (cost.frequency !== "per-project" || !plan.on) {
        return false;
    }
    if (plan.type === "" || plan.lines.length === 0 || paymentPlanTotal(plan) !== 100) {
        return true;
    }
    if (plan.type === "deposit-balance" && plan.lines.length !== 2) {
        return true;
    }
    return paymentPlanLines(plan, startDate, endDate).some(line => line.date === "");
}

/**
 * THE EXTRAS: optional lines that depend on one card (the card structure's "Extras", cost model section 8). Each is ticked on and typed; none is required.
 * `kind` is what the figure is -- money (in the card's currency), a percent, or a quantity -- and `frequency` how often it is paid.
 */
export const BUSINESS_EXTRAS = {
    "allowance": { label: "Allowance", kind: "money", frequency: "monthly" },
    "commission": { label: "Commission", kind: "percent", frequency: "percent-revenue" },
    "bonus": { label: "Bonus", kind: "money", frequency: "annually" },
    "property-tax": { label: "Commercial property tax", kind: "money", frequency: "annually" },
    "service-charge": { label: "Service charge", kind: "money", frequency: "monthly" },
    "deposit": { label: "Deposit", kind: "money", frequency: "one-time" },
    "handling-pallet": { label: "Handling per pallet", kind: "money", frequency: "per-unit" },
    "road-tax": { label: "Road tax", kind: "money", frequency: "annually" },
    "minimum-order": { label: "Minimum order", kind: "quantity", frequency: "per-unit" },
    "customs-duty": { label: "Customs duty", kind: "percent", frequency: "percent-cost" },
    "clearance-handling": { label: "Clearance and handling", kind: "money", frequency: "per-project" },
    "other-duties": { label: "Other duties", kind: "percent", frequency: "percent-cost" }
} as const;

export type BusinessExtraKey = keyof typeof BUSINESS_EXTRAS;

/** The extras kept on a card: a figure for each one ticked (an extra with nothing typed is not ticked). */
export type BusinessExtrasValue = Partial<Record<BusinessExtraKey, string>>;

/** The people's groups, and the founders (the Founders tile): Allowance, Commission and Bonus. */
export const PEOPLE_EXTRA_KEYS: readonly BusinessExtraKey[] = ["allowance", "commission", "bonus"];

/** The extras a RESOURCE card offers: a bought space has its tax and charge, a bought vehicle its road tax, a person Allowance, Commission and Bonus. */
export function slotExtraKeys(groupId: string, status: string): readonly BusinessExtraKey[] {
    if ((BUSINESS_PEOPLE_GROUP_IDS as readonly string[]).includes(groupId)) {
        return PEOPLE_EXTRA_KEYS;
    }
    if (isSpaceOnlyGroup(groupId)) {
        return isCostingStatus(status) ? ["property-tax", "service-charge"] : [];
    }
    if (groupId === "company-vehicles" || groupId === "delivery-vehicles") {
        return isCostingStatus(status) ? ["road-tax"] : [];
    }
    return [];
}

/** What a landlord or leasing supplier's card is connected to: the rented spaces and vehicles that name it. */
export interface SupplierConnections {
    space: boolean;
    workshop: boolean;
    vehicle: boolean;
}

export function supplierConnections(capability: BusinessCapabilityValue, partnerId: string): SupplierConnections {
    const rented = [
        ...Object.entries(capability.resources).flatMap(([, subsections]) => subsections.map(subsection => ({ groupId: subsection.id, slots: subsection.slots }))),
        ...BUSINESS_OFFERING_RESOURCE_GROUPS.flatMap(category => category.kinds.map(kind => ({
            groupId: kind.id,
            slots: capability.offering.resources.filter(slot => slot.category === category.id && slot.group === kind.id)
        })))
    ].flatMap(entry => entry.slots.filter(slot => slot.status === "rent" && slot.providerId === partnerId).map(() => entry.groupId));
    return {
        space: rented.some(groupId => isSpaceOnlyGroup(groupId)),
        workshop: rented.includes("workshop-storage"),
        vehicle: rented.some(groupId => groupId === "company-vehicles" || groupId === "delivery-vehicles")
    };
}

/** The extras a PARTNER or SUPPLIER card offers: a producer's duties and minimum, a landlord's by what is connected to it. */
export function partnerExtraKeys(group: string, connections: SupplierConnections): readonly BusinessExtraKey[] {
    if (group === "producers-wholesalers") {
        return ["minimum-order", "customs-duty", "clearance-handling", "other-duties"];
    }
    if (group === "property-vehicles-facilities" || group === "landlords-leasing-warehouses") {
        return [
            ...(connections.space ? ["deposit", "service-charge", "property-tax"] as const : []),
            ...(connections.workshop && group === "landlords-leasing-warehouses" ? ["handling-pallet"] as const : []),
            ...(connections.vehicle ? ["road-tax"] as const : [])
        ];
    }
    return [];
}

/**
 * THE SERVICES BUNDLED INTO AN ASSET (rule C2): a Technical Support supplier whose card is named by a Partners & Suppliers status row of an asset card
 * (a bought physical asset: the status Costs or Buy, in a purchase group) builds or installs that asset, so its price is added to the asset's value.
 * The link is the only data. Returns the asset's id by the supplier's id (the first asset that names it).
 */
export function serviceAssetLinks(capability: BusinessCapabilityValue): Record<string, string> {
    const technical = new Set([...capability.providers, ...capability.offering.providers].filter(partner => partner.group === "technical-support").map(partner => partner.id));
    const links: Record<string, string> = {};
    const assets = [
        ...Object.values(capability.resources).flatMap(subsections => subsections.flatMap(subsection => subsection.slots.map(slot => ({ slot, groupId: subsection.id })))),
        ...capability.offering.resources.map(slot => ({ slot, groupId: slot.group }))
    ];
    assets.forEach(({ slot, groupId }) => {
        if (!isCostingStatus(slot.status) || !isPurchaseGroup(groupId)) {
            return;
        }
        const named = (slot.extraStatuses ?? []).filter(row => row.status === "partners-suppliers").map(row => row.providerId);
        named.filter(id => id !== "" && technical.has(id) && !(id in links)).forEach(id => { links[id] = slot.id; });
    });
    return links;
}

/**
 * THE COST OF ONE UNIT OF AN ASSET WITH ITS LINKED SERVICES (cost model, section 4): the price of one unit plus the services bundled into it, shared by the
 * units the card buys. The capitalisation limit is tested on this, never on the invoice of a linked service: a machine of 20,000 and an installation of 1,500
 * are one asset of 21,500. Null while the card has no price.
 */
export function assetUnitCost(capability: BusinessCapabilityValue, slot: BusinessResourceSlotValue): number | null {
    const price = parseAmount(slot.cost.price);
    if (price === null) {
        return null;
    }
    const units = Math.max(1, parseAmount(slot.quantity) ?? 1);
    const services = servicesOfAsset(capability, slot.id).reduce((sum, partner) => sum + (parseAmount(partner.cost.price) ?? 0), 0);
    return Math.round((price + services / units) * 100) / 100;
}

/** The Technical Support suppliers bundled into one asset. */
export const servicesOfAsset = (capability: BusinessCapabilityValue, assetId: string): BusinessPartnerValue[] => {
    const links = serviceAssetLinks(capability);
    return [...capability.providers, ...capability.offering.providers].filter(partner => links[partner.id] === assetId);
};

/**
 * THE GENERATED INSURANCES CARD (rule G1): a premises, company vehicle, delivery vehicle, workshop, machine or event (Site Hire) card that is created gets
 * an Insurances card in Documents & Rights of its place, linked to it. Its End date is the renewal date, the insurer is added with the + status and the
 * cover limit and grade go in the Description. Made once, when the card first has a name; removing the Insurances card does not make it again.
 */
const INSURED_INFRASTRUCTURE_GROUPS = ["premises", "company-vehicles"];
const INSURED_OFFERING_GROUPS = ["site-hire", "workshop-storage", "production-machinery", "delivery-vehicles"];

export function withNewInsurances(previous: BusinessCapabilityValue, next: BusinessCapabilityValue): BusinessCapabilityValue {
    const named = (slot: BusinessResourceSlotValue) => slot.name.trim() !== "";
    const before = new Map([
        ...Object.values(previous.resources).flatMap(subsections => subsections.flatMap(subsection => subsection.slots)),
        ...previous.offering.resources
    ].map(slot => [slot.id, slot] as const));
    const fresh = (slot: BusinessResourceSlotValue) => slot.insuranceId === "" && slot.insuresId === "" && named(slot) && !(before.get(slot.id) && named(before.get(slot.id) as BusinessResourceSlotValue));
    const made: BusinessResourceSlotValue[] = [];
    const insurance = (slot: BusinessResourceSlotValue, offering: boolean): BusinessResourceSlotValue => {
        const card: BusinessResourceSlotValue = {
            ...createBusinessResourceSlot(),
            name: "Insurance for " + slot.name.trim(),
            status: "costs",
            insuresId: slot.id,
            startDate: slot.startDate || todayIsoDate(),
            cost: { ...createBusinessCost(), frequency: slot.group === "site-hire" ? "per-project" : "annually" },
            ...(offering ? { category: "documents", group: "insurances", offeringIds: [...slot.offeringIds], offeringShares: { ...slot.offeringShares } } : {})
        };
        made.push(card);
        return card;
    };
    let changed = false;
    const link = (slot: BusinessResourceSlotValue, offering: boolean, groupId: string): BusinessResourceSlotValue => {
        if (!(offering ? INSURED_OFFERING_GROUPS : INSURED_INFRASTRUCTURE_GROUPS).includes(groupId) || !fresh(slot)) {
            return slot;
        }
        changed = true;
        return { ...slot, insuranceId: insurance(slot, offering).id };
    };
    const resources = Object.fromEntries(Object.entries(next.resources).map(([category, subsections]) =>
        [category, subsections.map(subsection => ({ ...subsection, slots: subsection.slots.map(slot => link(slot, false, subsection.id)) }))]
    )) as BusinessCapabilityValue["resources"];
    const offeringResources = next.offering.resources.map(slot => link(slot, true, slot.group));
    if (!changed) {
        return next;
    }
    const infrastructureCards = made.filter(card => card.category === "");
    const documents = resources.documents ?? [];
    const withDocuments = infrastructureCards.length === 0
        ? resources
        : {
            ...resources,
            documents: documents.some(subsection => subsection.id === "insurances")
                ? documents.map(subsection => subsection.id === "insurances" ? { ...subsection, slots: [...subsection.slots, ...infrastructureCards] } : subsection)
                : [...documents, { id: "insurances", name: "", slots: infrastructureCards }]
        };
    return {
        ...next,
        resources: withDocuments,
        offering: { ...next.offering, resources: [...offeringResources, ...made.filter(card => card.category !== "")] }
    };
}

/**
 * WHAT MAY BE WRITTEN IN A CARD'S DESCRIPTION, by group (the card structure): the cover limit and grade of an insurance, the outcome of a certificate, the
 * organisation and terms of a partner, the contact and lead time of a supplier. "" for a group with no hint of its own.
 */
export function noteHint(groupId: string): string {
    switch (groupId) {
        case "insurances":
            return "The cover limit, the grade (mandatory, recommended, optional) and any other detail may be written here. The insurer is added with +, as a Business Services supplier.";
        case "certificates":
            return "The outcome (certificate, test report, permit) and any other detail may be written here. The issuing body or inspector is added with +, as a supplier.";
        case "alliances-networks":
        case "revenue-partners":
        case "accreditation-bodies":
            return "The organisation, the contact and the terms of the agreement may be written here.";
        case "goods-equipment":
        case "business-services":
        case "creative-it-services":
        case "property-vehicles-facilities":
        case "technical-support":
        case "producers-wholesalers":
        case "logistics-fulfilment":
        case "contractors-advisers":
        case "agencies-influencers":
        case "venues-organisers":
        case "landlords-leasing-warehouses":
        case "platforms-payments":
            return "The supplier, the contact, the terms and the lead time may be written here.";
        default:
            return "";
    }
}

/** A supplier connected to a rented vehicle shows a Qty before its price (how many vehicles the lease covers). */
export const supplierHasQuantity = (connections: SupplierConnections) => connections.vehicle;

/** Whether a partner or supplier card has a Qty before its price: a lessor of vehicles, and any card priced Per unit (per hour, per kg ...). */
export const partnerHasQuantity = (connections: SupplierConnections, cost: { frequency: string }) => connections.vehicle || cost.frequency === "per-unit";

/** Extras as saved: the known ones that hold a figure, the figure cleaned to its kind. */
function asBusinessExtras(value: unknown): BusinessExtrasValue {
    const source = asObject(value);
    const kept: BusinessExtrasValue = {};
    for (const key of Object.keys(BUSINESS_EXTRAS) as BusinessExtraKey[]) {
        const text = key in source ? (BUSINESS_EXTRAS[key].kind === "quantity" ? asText(source[key]).replace(/\D/g, "") : businessDecimalText(asText(source[key]))) : "";
        if (text.length > 0) {
            kept[key] = text;
        }
    }
    return kept;
}

/**
 * The frequencies each group offers (the card structure's "Frequencies offered"), by "place:group". A group not listed offers all seven. A group with ONE
 * frequency has nothing to choose: it is shown as text -- and a One-time one is not shown at all.
 */
const GROUP_FREQUENCIES: Record<string, readonly string[]> = {
    "infrastructure:premises": ["one-time"],
    "infrastructure:premises-utilities": ["monthly"],
    "infrastructure:furniture-fittings": ["per-unit"],
    "infrastructure:devices-tools": ["per-unit", "monthly"],
    "infrastructure:company-vehicles": ["per-unit"],
    "infrastructure:vehicle-running-costs": ["per-unit", "monthly"],
    "infrastructure:software-web": ["per-unit", "monthly", "annually"],
    "infrastructure:cloud-security": ["monthly"],
    "infrastructure:business-consumables": ["monthly", "per-unit"],
    "infrastructure:insurances": ["annually", "monthly"],
    "infrastructure:licences": ["one-time", "annually", "per-unit"],
    "infrastructure:certificates": ["one-time", "annually"],
    "infrastructure:tickets-trips": ["per-unit", "per-project"],
    "infrastructure:admin-team": ["monthly"],
    "infrastructure:alliances-networks": ["annually"],
    "infrastructure:goods-equipment": ["per-unit"],
    "infrastructure:business-services": ["monthly", "annually", "per-project"],
    "infrastructure:creative-it-services": ["per-project", "monthly"],
    "infrastructure:property-vehicles-facilities": ["monthly"],
    "infrastructure:technical-support": ["per-project", "per-unit", "annually"],
    "offering:site-hire": ["per-project"],
    "offering:workshop-storage": ["one-time"],
    "offering:process-utilities": ["per-unit"],
    "offering:fixtures-displays": ["per-unit"],
    "offering:production-machinery": ["per-unit"],
    "offering:devices-tools": ["per-unit", "annually"],
    "offering:delivery-vehicles": ["per-unit"],
    "offering:delivery-running-costs": ["per-unit"],
    "offering:sales-delivery-tools": ["monthly", "annually"],
    "offering:platforms-apis": ["per-unit"],
    "offering:materials-stock": ["per-unit"],
    "offering:insurances": ["annually", "per-project"],
    "offering:licences": ["one-time", "annually", "per-unit"],
    "offering:royalties": ["percent-revenue", "monthly", "annually", "one-time"],
    "offering:certificates": ["per-project", "annually"],
    "offering:tickets-trips": ["per-unit", "per-project"],
    "offering:delivery-team": ["monthly", "per-unit"],
    "offering:revenue-partners": ["percent-revenue", "per-project"],
    "offering:accreditation-bodies": ["annually"],
    "offering:producers-wholesalers": ["per-unit"],
    "offering:logistics-fulfilment": ["per-unit", "monthly"],
    "offering:contractors-advisers": ["per-project", "per-unit"],
    "offering:agencies-influencers": ["per-project", "monthly"],
    "offering:venues-organisers": ["per-project"],
    "offering:landlords-leasing-warehouses": ["monthly"],
    "offering:platforms-payments": ["percent-revenue", "per-unit", "monthly"]
};

/**
 * THE COST OPTIONS AND BILLING TYPES (cost model, section 5). A card in Platforms & Payments, Revenue Partners, Royalties, Insurances or Licences asks for
 * a ready-made option: the option sets the billing type, the billing type sets the driver, and the financial engine routes the cost. (A courier and a
 * campaign are priced one way a card, by an option of their own; they have no billing type.)
 *
 * - Percentage: a rate of the revenue it follows. The driver is locked to % of Rev (a calculated COGS line).
 * - Fixed amount: an amount a month or a year. The driver is Monthly or Annually (an OpEx line).
 * - Lump sum: one amount at the start. The driver is One-time (a Start-up expense, or an intangible asset amortised automatically).
 */
export type BillingType = "percentage" | "fixed" | "lump-sum" | "";

export const BILLING_TYPES: readonly { id: Exclude<BillingType, "">; label: string }[] = [
    { id: "percentage", label: "Percentage" },
    { id: "fixed", label: "Fixed amount" },
    { id: "lump-sum", label: "Lump sum" }
];

export interface BusinessCostOption {
    id: string;
    label: string;
    billing: BillingType;
    /** The drivers the option allows, where its billing type does not say (a courier's, a campaign's). */
    frequencies?: readonly string[];
    /** The unit of a Per unit option. */
    unit?: string;
    /** A calculated line for each employee (key-person or health cover): the price is a month's for one. */
    perEmployee?: boolean;
}

const INSURANCE_OPTIONS: readonly BusinessCostOption[] = [
    { id: "property-liability", label: "Commercial property and liability", billing: "fixed" },
    { id: "key-person-health", label: "Key-person or employee health", billing: "fixed", frequencies: ["monthly"], perEmployee: true }
];

const COST_OPTIONS: Record<string, readonly BusinessCostOption[]> = {
    "infrastructure:insurances": INSURANCE_OPTIONS,
    "offering:insurances": INSURANCE_OPTIONS,
    "infrastructure:licences": [
        { id: "initial-permit", label: "Initial permit", billing: "lump-sum" },
        { id: "annual-renewal", label: "Annual renewal, music rights, municipal taxes", billing: "fixed" }
    ],
    "offering:licences": [
        { id: "initial-permit", label: "Initial operating licence", billing: "lump-sum" },
        { id: "annual-renewal", label: "Annual renewal", billing: "fixed" }
    ],
    "offering:royalties": [
        { id: "royalty-on-sales", label: "Royalty on sales", billing: "percentage" },
        { id: "fixed-royalty", label: "Fixed royalty", billing: "fixed" },
        { id: "franchise-fee", label: "Upfront franchise or master licence fee", billing: "lump-sum" }
    ],
    "offering:revenue-partners": [
        { id: "affiliate-commission", label: "Affiliate networks and influencer commissions", billing: "percentage" },
        { id: "sales-agents", label: "Sales agents and B2B brokers", billing: "percentage" }
    ],
    "offering:platforms-payments": [
        { id: "payment-gateway", label: "Payment gateway", billing: "percentage" },
        { id: "marketplace-platform", label: "Marketplace or delivery platform", billing: "percentage" },
        { id: "saas-platform", label: "SaaS e-commerce platform", billing: "fixed" }
    ],
    "offering:logistics-fulfilment": [
        { id: "flat-per-parcel", label: "Flat per parcel", billing: "", frequencies: ["per-unit"], unit: "parcel" },
        { id: "by-weight-zone", label: "By weight or zone", billing: "", frequencies: ["per-unit"], unit: "parcel" },
        { id: "monthly-flat-fee", label: "Monthly flat fee", billing: "", frequencies: ["monthly"] },
        { id: "fulfilment-per-item", label: "Fulfilment per item", billing: "", frequencies: ["per-unit"], unit: "order" }
    ],
    "offering:agencies-influencers": [
        { id: "campaign-fee", label: "Campaign fee", billing: "", frequencies: ["per-project"] },
        { id: "monthly-budget", label: "Monthly budget", billing: "", frequencies: ["monthly"] },
        { id: "retainer", label: "Retainer", billing: "", frequencies: ["monthly"] },
        { id: "per-post", label: "Per post", billing: "", frequencies: ["per-unit"], unit: "post" }
    ]
};

/** The cost options of a group (none for a group that asks for no option). */
export const costOptionsOf = (place: "infrastructure" | "offering", groupId: string): readonly BusinessCostOption[] => COST_OPTIONS[place + ":" + groupId] ?? [];

export const costOptionOf = (place: "infrastructure" | "offering", groupId: string, optionId: string): BusinessCostOption | undefined =>
    costOptionsOf(place, groupId).find(option => option.id === optionId);

/** The billing type an option sets ("" for a card with no option, or an option with none). */
export const billingOf = (place: "infrastructure" | "offering", groupId: string, optionId: string): BillingType => costOptionOf(place, groupId, optionId)?.billing ?? "";

/** The drivers a chosen option allows: Percentage is % of Rev, a Lump sum One-time, a Fixed amount Monthly or Annually (as the group offers). */
export function optionFrequenciesOf(place: "infrastructure" | "offering", groupId: string, optionId: string): readonly string[] | null {
    const option = costOptionOf(place, groupId, optionId);
    if (!option) {
        return null;
    }
    if (option.frequencies) {
        return option.frequencies;
    }
    switch (option.billing) {
        case "percentage": return ["percent-revenue"];
        case "lump-sum": return ["one-time"];
        case "fixed": {
            const own = frequencyIdsOf(place, groupId).filter(id => id === "monthly" || id === "annually");
            return own.length > 0 ? own : ["monthly", "annually"];
        }
        default: return null;
    }
}

/**
 * A cost with an option chosen: the driver the option locks (kept when it is one the option allows, else the first), the unit of a Per unit option, and no
 * unit otherwise. Nothing is changed for a card whose option is not one of its group's.
 */
export function costWithOption(cost: BusinessCostValue, place: "infrastructure" | "offering", groupId: string, optionId: string): BusinessCostValue {
    const allowed = optionFrequenciesOf(place, groupId, optionId);
    const option = costOptionOf(place, groupId, optionId);
    if (!allowed || !option) {
        return cost;
    }
    const frequency = allowed.includes(cost.frequency) ? cost.frequency : allowed[0];
    const unit = frequency === "per-unit" ? (option.unit ?? (cost.unit || "unit")) : "";
    return frequency === cost.frequency && unit === cost.unit && cost.frequencyOther === "" ? cost : { ...cost, frequency, unit, frequencyOther: "" };
}

/** An option as saved: kept when it is one of the group's, else none. */
const validCostOption = (place: "infrastructure" | "offering", groupId: string, optionId: string): string =>
    costOptionOf(place, groupId, optionId) ? optionId : "";

/** The frequencies a group offers, in the order of the seven; all seven for a group the list does not know. */
export function frequencyIdsOf(place: "infrastructure" | "offering", groupId: string): readonly string[] {
    const offered = GROUP_FREQUENCIES[place + ":" + groupId];
    return offered === undefined ? BUSINESS_COST_FREQUENCIES.map(entry => entry.id) : BUSINESS_COST_FREQUENCIES.map(entry => entry.id).filter(id => offered.includes(id));
}

/**
 * The units a Per unit price can be for, by group (the card structure's "Unit"); "unit" is always one. A group with one unit besides "unit" has nothing to
 * choose: the unit is text. A group not listed has "unit" alone.
 */
const GROUP_UNITS: Record<string, readonly string[]> = {
    "infrastructure:furniture-fittings": ["item", "set"],
    "infrastructure:devices-tools": ["item", "set"],
    "infrastructure:company-vehicles": ["vehicle"],
    "infrastructure:vehicle-running-costs": ["km", "litre", "kWh", "bill"],
    "infrastructure:software-web": ["seat", "licence", "user"],
    "infrastructure:business-consumables": ["box", "kg", "litre", "bill"],
    "infrastructure:licences": ["seat", "licence", "user"],
    "infrastructure:tickets-trips": ["trip", "ticket", "night", "person"],
    "infrastructure:goods-equipment": ["order", "bill"],
    "infrastructure:technical-support": ["hour", "visit"],
    "offering:process-utilities": ["kWh", "litre", "m³", "bill"],
    "offering:fixtures-displays": ["item", "set"],
    "offering:production-machinery": ["machine", "item"],
    "offering:devices-tools": ["item", "set"],
    "offering:delivery-vehicles": ["vehicle"],
    "offering:delivery-running-costs": ["km", "litre", "delivery", "bill"],
    "offering:platforms-apis": ["call", "token", "request"],
    "offering:materials-stock": ["kg", "metre", "litre", "piece", "box"],
    "offering:licences": ["seat", "licence", "user"],
    "offering:tickets-trips": ["trip", "ticket", "night", "person"],
    "offering:delivery-team": ["hour"],
    "offering:producers-wholesalers": ["kg", "metre", "piece", "order"],
    "offering:logistics-fulfilment": ["parcel", "pallet", "order"],
    "offering:contractors-advisers": ["hour", "day"],
    "offering:platforms-payments": ["order", "transaction"],
    "offering:agencies-influencers": ["post"]
};

/** The units of a group, "unit" last (always there). */
export function unitsOf(place: "infrastructure" | "offering", groupId: string): readonly string[] {
    return [...(GROUP_UNITS[place + ":" + groupId] ?? []), "unit"];
}

/** The one unit a group has besides "unit", when it has exactly one (then the unit is text), else "". */
export function soleUnitOf(place: "infrastructure" | "offering", groupId: string): string {
    const specific = unitsOf(place, groupId).filter(unit => unit !== "unit");
    return specific.length === 1 ? specific[0] : "";
}

/**
 * A price with what its group fixes filled in: the one frequency a group offers (when a price is typed and none is set), and for a Per unit price the unit -- the
 * group's only one, else "unit". What is already there is kept.
 */
export function normalCostOf(cost: BusinessCostValue, place: "infrastructure" | "offering", groupId: string): BusinessCostValue {
    const offered = frequencyIdsOf(place, groupId);
    // (Only a card with a price: an empty one is left as it is, so that a blank card is still blank.)
    const frequency = cost.frequency === "" && offered.length === 1 && cost.price.trim() !== "" ? offered[0] : cost.frequency;
    const unit = frequency === "per-unit" && cost.unit === "" ? soleUnitOf(place, groupId) || "unit" : cost.unit;
    return frequency === cost.frequency && unit === cost.unit ? cost : { ...cost, frequency, unit };
}

/** The Offering's groups of one category. */
export function offeringGroupsOf(categoryId: string): readonly BusinessResourceKind[] {
    return BUSINESS_OFFERING_RESOURCE_GROUPS.find(category => category.id === categoryId)?.kinds ?? [];
}

/**
 * The activity groups of a place, with the period each one's dates stay
 * inside. Infrastructure's Pre-Operational activities also have a type
 * (BUSINESS_PREOPERATIONAL_TYPES), which is not shown as a category.
 */
export const BUSINESS_ACTIVITY_GROUPS = {
    infrastructure: [
        {
            id: "pre-operational",
            label: "Pre-Operational",
            period: "plan-start-to-opening",
            note: "Anything that runs before opening: machinery and its installation, legal and accounting, testing and training, a launch event."
        },
        {
            id: "operational",
            label: "Operational",
            period: "from-opening",
            note: "Activities required to operate the organization day to day."
        }
    ],
    offering: [
        {
            id: "production",
            label: "Production",
            period: "from-plan-start",
            note: "Activities required to design, develop and deliver the offerings."
        },
        {
            id: "marketing",
            label: "Marketing",
            period: "from-plan-start",
            note: "Activities required to promote the organization and its offerings."
        },
        {
            id: "sales",
            label: "Sales & Customer",
            period: "from-opening",
            note: "Activities required to acquire customers and manage customer relationships."
        }
    ]
} as const;

/** What a Pre-Operational activity is: the type it carries (not shown as a category). */
export const BUSINESS_PREOPERATIONAL_TYPES = [
    { id: "capex", label: "Capital Expenditure" },
    { id: "startup", label: "Start-up Expenses" }
] as const;

/** Every activity group of both places, for the lookups that do not care which place. */
export const BUSINESS_ACTIVITY_CATEGORIES = [
    ...BUSINESS_ACTIVITY_GROUPS.infrastructure,
    ...BUSINESS_ACTIVITY_GROUPS.offering
];

/** The activity groups of a place (the ones a card there can be filed under). */
export const activityGroupsOf = (scope: "infrastructure" | "offering") => BUSINESS_ACTIVITY_GROUPS[scope];

/**
 * Where an activity created from a resource's status is filed.
 *
 * "Activities created or assigned from Infrastructure are placed
 * under the appropriate activity category." Setting one up, or
 * finding out about it, is work required to establish and operate
 * the organisation -- which is Operational, word for word.
 */
export const BUSINESS_DERIVED_ACTIVITY_CATEGORY = "operational";

/**
 * The category an activity made by a resource's status is filed under, by the section the resource is in: work to establish and operate the
 * organization (Infrastructure) is Operational, work to design, develop and deliver an offering (Offering's Capability) is Production. The one place
 * to change that default.
 */
export const DERIVED_ACTIVITY_CATEGORY: Record<"infrastructure" | "offering", string> = {
    infrastructure: BUSINESS_DERIVED_ACTIVITY_CATEGORY,
    offering: "production"
};

/** The category of a NEW Activity or Partner / Provider card: none yet -- the cell reads "Select", the card is incomplete till one is chosen. */
export const UNASSIGNED_CATEGORY = "unassigned";

/** An activity category's name: a built-in's label, else the name the user typed ("" while he has not typed it yet). */
export function activityCategoryLabel(categories: readonly { id: string; name: string }[], id: string): string {
    return BUSINESS_ACTIVITY_CATEGORIES.find(entry => entry.id === id)?.label ?? categories.find(entry => entry.id === id)?.name.trim() ?? "";
}

/** A price and how often it is paid. */
export interface BusinessCostValue {
    price: string;
    /** One of BUSINESS_COST_FREQUENCIES' ids, or "". */
    frequency: string;
    /** Named when the frequency is "other" (no longer offered: an older answer's is moved to the card's description). */
    frequencyOther: string;
    /** What a Per unit price is for ("unit", "order", "hour", "kg"...), or "" for none. */
    unit: string;
    /**
     * An ISO currency code, or "" for the organisation's own -- the
     * currency of the country it is registered in on the Identity
     * System's Legal Entity page.
     *
     * "" rather than that code written in, so a price nobody has
     * changed follows the registration if it changes; only a price
     * the founder has set to something else keeps its own.
     */
    currency: string;
}

/** Digits and at most one ".": what a Quantity, Price or Salary holds. */
const BUSINESS_PLAIN_NUMBER = /^(\d+\.?\d*|\.\d+)$/;

/**
 * What a Quantity, Price or Salary box keeps of what was typed:
 * its digits and its first ".", nothing else. "£30" becomes "30"
 * as it is typed, rather than being refused as a whole.
 */
export function businessDecimalText(text: string): string {
    const kept = text.replace(/[^\d.]/g, "");
    const point = kept.indexOf(".");
    return point < 0
        ? kept
        : kept.slice(0, point + 1) + kept.slice(point + 1).replace(/\./g, "");
}

/**
 * How many of a resource its price is for: the Quantity, when it is
 * a positive number other than 1. Null when it is empty or 1 -- the
 * price is then the price of the one -- and when it is 0 or not a
 * number at all, which count as 1 rather than as nothing.
 *
 * A per-unit or per-project price is never multiplied: its quantity
 * is not how many were bought -- unless it is a PURCHASE (an asset
 * group's card priced Per unit, see isPurchaseGroup): 3 laptops at
 * 1,000 are 3,000. (A partner or supplier card priced Per unit counts
 * as one too: 0.4 of an hour at 23.50 an hour is 9.40. Stock, a Qty
 * that is the opening stock, is not.)
 */
export function resourceUnitCount(quantity: string, frequency: string, purchase = false): number | null {
    if ((frequency === "per-unit" && !purchase) || frequency === "per-order" || frequency === "per-project" || frequency === "percent-revenue") {
        return null;
    }
    const text = quantity.trim();
    if (!BUSINESS_PLAIN_NUMBER.test(text)) {
        return null;
    }
    const count = Number(text);
    return count > 0 && count !== 1 ? count : null;
}

/** The units a Qty may count with decimals; any other unit takes whole numbers. */
export const BUSINESS_DECIMAL_UNITS = ["hour", "metre", "litre", "kWh"] as const;

/**
 * What a Qty box keeps of what was typed: whole digits, or digits and
 * one "." where the unit is an hour, a metre, a litre or kWh.
 */
export function businessQuantityText(text: string, unit = ""): string {
    const named = unit.trim().toLowerCase();
    return BUSINESS_DECIMAL_UNITS.some(entry => entry.toLowerCase() === named)
        ? businessDecimalText(text)
        : text.replace(/\D/g, "");
}

/**
 * A saved Price or Salary written before those boxes took only
 * numbers, as the plain number it meant: "£30" as "30", "1,200.50"
 * as "1200.50", "30 GBP" as "30".
 *
 * Only where the reading is not in doubt. A currency sign, a
 * three-letter code and spaces go; commas go only when they group
 * thousands. "12,5" could be twelve and a half or a typing slip, and
 * "30 a month" is more than a number, so both are kept as written
 * for the founder to correct. A plain number comes back as it was,
 * so reading a value twice changes nothing.
 */
/**
 * A founder's salary and Frequency, as saved -- or migrated from
 * before the one Frequency: then the salary was always a month's and
 * the hours alone had a period (`hoursPeriod`, a week or a month).
 * That period becomes the founder's, and a monthly salary is turned
 * into that period's (a week's: times 12 / 52), rounded to the cent
 * as every amount is kept -- so every figure calculated from it,
 * converted back to a month, is what it was to within that rounding
 * (at most half a cent a week: about 2 cents a month a founder).
 *
 * A salary kept with more than two decimals (the first version of this
 * migration kept them unrounded) is rounded to the cent, once.
 */
/** An amount to the cent, as plain text: "415.38", "1800". */
function centsText(amount: number): string {
    return String(Math.round(amount * 100) / 100);
}

function founderSalaryAndPeriod(founder: Record<string, unknown>): { salary: string; period: FounderPeriod } {
    const typed = businessAmountText(founder.salary);
    const salary = /\.\d{3,}$/.test(typed) && parseAmount(typed) !== null
        ? centsText(parseAmount(typed) ?? 0)
        : typed;
    if (founder.period !== undefined) {
        return { salary, period: asFounderPeriod(founder.period) };
    }
    const period: FounderPeriod = asHoursPeriod(founder.hoursPeriod);
    const monthly = parseAmount(salary);
    return period === "week" && monthly !== null
        ? { salary: centsText(monthly * 12 / 52), period }
        : { salary, period };
}

function businessAmountText(value: unknown): string {
    const text = asText(value).trim();
    if (text === "" || BUSINESS_PLAIN_NUMBER.test(text)) {
        return text;
    }
    const bare = text
        .replace(/\p{Sc}/gu, "")
        .replace(/^\s*[A-Za-z]{3}\s+|\s+[A-Za-z]{3}\s*$/g, "")
        .replace(/\s+/g, "");
    if (BUSINESS_PLAIN_NUMBER.test(bare)) {
        return bare;
    }
    if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(bare)) {
        return bare.replace(/,/g, "");
    }
    return text;
}

export interface BusinessFounderValue {
    id: string;
    name: string;
    /** One line per role: a founder is often several things. */
    roles: string[];
    /** The salary for the founder's period (see founderMonthlySalary). */
    salary: string;
    /** Working hours for the period (see DemandCapacity.ts, deliveryHours). */
    hours: string;
    /** Hours for the period available for delivering Offerings: the preferred answer. */
    deliveryHours: string;
    /** Or the percent of working hours spent delivering (see founderDeliveryHours). */
    deliveryShare: string;
    /** The day the founder starts (an ISO date): a founder has a start date only. */
    startDate: string;
    /** The founder's optional Allowance, Commission and Bonus. */
    extras: BusinessExtrasValue;
    /**
     * The founder's Frequency: whether the salary and the hours above
     * are a week's, a month's or a year's; "" is a month. Every
     * calculation converts them to a month.
     */
    period: FounderPeriod;
}

/**
 * One recorded resource.
 *
 * `providerId` and `activityId` are the two ends of this page's
 * cross-references: the first points into 3. Partners & Suppliers (at Partners
 * & Suppliers or Rent), the second at an activity of 2. Activities (at Activity).
 */
export interface BusinessResourceSlotValue {
    id: string;
    name: string;
    quantity: string;
    description: string;
    /** One of BUSINESS_RESOURCE_STATUSES' ids, or "". */
    status: string;
    cost: BusinessCostValue;
    /**
     * A provider when the status is "provided"; an External
     * Professional or Partner when it is "professional".
     */
    providerId: string;
    /**
     * The Page 1 Offerings it serves -- Offering's Capability only. One
     * resource, activity or partner can serve several (the same yarn
     * in two collections).
     */
    offeringIds: string[];
    /** A Workspace card (the Workspace category): its type (BUSINESS_WORKSPACE_KINDS' id), the name of an "Other" one, and its optional deposit. */
    workspaceKind: string;
    workspaceKindOther: string;
    deposit: string;
    /**
     * An OFFERING card's category and group (BUSINESS_OFFERING_RESOURCE_GROUPS' ids); "" while it is in "No category" / "No group". An Infrastructure
     * card has neither: the subsection that holds it is its group.
     */
    category: string;
    group: string;
    /** The day the resource starts (an ISO date, "YYYY-MM-DD"); "" while it is not given. Asked on every card. */
    startDate: string;
    /** The day it ends (an ISO date); optional. */
    endDate: string;
    /** The activity chosen at the status Activity (an id of an activity of its place), "" for none. */
    activityId: string;
    /** Years the asset stays useful to the business (it feeds the depreciation line); "" for the group's default. Asked of an asset bought. */
    usefulLife: string;
    /** The equipment has a warranty (information only), and the day it lasts until (an ISO date). */
    warranty: boolean;
    warrantyUntil: string;
    /** A contract's own rate (a percent) in place of the default one: royalties. Optional. */
    rateOverride: string;
    /** The ready-made cost option of its group (costOptionsOf), which sets the billing type and locks the driver; "" until chosen. */
    costOption: string;
    /** Years an intangible asset (an upfront franchise fee) is amortised over; "" until given. */
    amortisationYears: string;
    /** The optional extras of the card (slotExtraKeys). */
    extras: BusinessExtrasValue;
    /** The payment plan of a Per project price. */
    paymentPlan: BusinessPaymentPlan;
    /** The share of the card each linked Offering carries, by Offering id, when several are linked (they total 100%). */
    offeringShares: Record<string, string>;
    /**
     * The statuses added beside the first with the "+": a further supplier of the same resource (the installer, the insurer...), or a further activity.
     * Each is a row of its own.
     */
    extraStatuses: BusinessStatusRow[];
    /** The Insurances card generated for this card when it was made ("" until then; kept when that card is removed, so it is not made again). */
    insuranceId: string;
    /** On a generated Insurances card: the card it insures ("" for any other). */
    insuresId: string;
}

/** A status row added with the "+" of a card's Status: its own status and the supplier or activity it names. */
export interface BusinessStatusRow {
    id: string;
    /** One of BUSINESS_EXTRA_STATUS_IDS, or "". */
    status: string;
    providerId: string;
    activityId: string;
}

/** The statuses a row added with the "+" can have. */
export const BUSINESS_EXTRA_STATUS_IDS = ["partners-suppliers", "activity"] as const;

/**
 * One subsection of a resource group: a fixed kind, or a named
 * addition.
 *
 * A fixed kind's id IS the kind's id, never a generated one. The
 * editor has to find a kind's slots while rendering, and a
 * generated id would be a new id on every render -- which is a new
 * card, losing the caret out of whatever was being typed into.
 */
interface BusinessResourceSubsectionValue {
    id: string;
    /** Only an addition carries one; a fixed kind has its own. */
    name: string;
    slots: BusinessResourceSlotValue[];
}

export interface BusinessActivityValue {
    id: string;
    /**
     * Its category: "operational", "production", "marketing", "sales" or one the user made (BusinessCapabilityValue.activityCategories). An
     * Infrastructure activity is filed in the category it stands in (that is its truth); an Offering's carries it here. A saved Offering activity without
     * one is read as Production (Operational when a resource of Infrastructure made it).
     */
    category: string;
    name: string;
    description: string;
    /**
     * Founder, partner or provider ids: an activity can take more
     * than one person.
     */
    performerIds: string[];
    /**
     * A founder id -- one responsible person, as specified. The one
     * CHOSEN; where the choice is not the founder's to make (see
     * businessAutoResponsibleId) that rule wins, and this is kept
     * for when it stops applying.
     */
    responsibleId: string;
    /**
     * The Responsible tick, unticked: no responsible by choice (the field
     * is removed for this card, responsibleId is cleared). Absent means
     * ticked, the default. See responsibleIsOff.
     */
    responsibleOff?: boolean;
    completed: boolean;
    /**
     * The Page 1 Offerings it serves -- Offering's Capability only. One
     * resource, activity or partner can serve several (the same yarn
     * in two collections).
     */
    offeringIds: string[];
    /** A Pre-Operational activity's type (BUSINESS_PREOPERATIONAL_TYPES' id), "" for any other. */
    type: string;
    /** The card whose Activity status made it with "+ Add" (its name is written there, and the activity's name is a link back to it); "" for one made on its own. */
    madeBy: string;
    /** The day it starts (an ISO date); asked on every card. */
    startDate: string;
    /** The day it ends (an ISO date); optional. */
    endDate: string;
    /** The share of the card each linked Offering carries, by Offering id, when several are linked (they total 100%). */
    offeringShares: Record<string, string>;
    /** The resources the activity uses (the Resources tick), each with the units of it the activity takes when it has units. */
    resources: BusinessActivityResource[];
    /** How many people each performer is, by performer id ("" is one). */
    performerPeople: Record<string, string>;
}

interface BusinessActivityCategoryValue {
    id: string;
    /** Only an added category carries one. */
    name: string;
    activities: BusinessActivityValue[];
}

/**
 * A CATEGORY the user keeps (Partners & Suppliers': "Legal", "Couriers" ...): an id and the name he typed under "Other". The built-in categories
 * (Partners, Providers) are not stored here.
 */
export interface BusinessCategoryValue {
    id: string;
    name: string;
}

/** The two types of card in Partners & Suppliers; each type's groups (BUSINESS_PARTNER_GROUPS) play the part of categories. */
export const PARTNER_CATEGORIES = [
    { id: "partners", label: "Partners" },
    { id: "suppliers", label: "Suppliers" }
] as const;

/** The groups of each type, by place: fixed lists (21 groups in Infrastructure with the resources', 26 in the Offering with theirs). */
export const BUSINESS_PARTNER_GROUPS: Record<"infrastructure" | "offering", Record<"partners" | "suppliers", readonly { id: string; label: string; help: string }[]>> = {
    infrastructure: {
        partners: [
            { id: "alliances-networks", label: "Alliances & Networks", help: "Organisations you join for the benefit of the whole company, e.g. Trade association, Buying group, Start-up accelerator, Producers cooperative." }
        ],
        suppliers: [
            { id: "goods-equipment", label: "Goods & Equipment", help: "Sellers of furniture, devices and consumables for the company, e.g. Furniture dealer, Stationery merchant, Computer reseller, Water-cooler rental." },
            { id: "business-services", label: "Business Services", help: "Firms that run the administrative side, e.g. Accountant, Lawyer, Insurance broker, Payroll bureau, Business bank, Web host." },
            { id: "creative-it-services", label: "Creative & IT Services", help: "Freelancers and small agencies for design, branding, content or technology work, e.g. Web builder, Brand identity house, Photographer, IT support, Copywriter." },
            { id: "property-vehicles-facilities", label: "Property, Vehicles & Facilities", help: "Owners and caretakers of the premises, and lessors of vehicles, e.g. Landlord, Coworking operator, Cleaner, Car lessor." },
            { id: "technical-support", label: "Technical Support", help: "Outsourced technicians who maintain, repair and install the company's assets, e.g. Electrical engineer, Plumber, Boiler fitter, Network cabling. An installation is linked to the asset it installs." }
        ]
    },
    offering: {
        partners: [
            { id: "revenue-partners", label: "Revenue Partners", help: "Parties who sell for you or send customers, and take a cut of each sale, e.g. Boutique stockist, Distributor, Referral partner, Affiliate blogger, Co-teacher." },
            { id: "accreditation-bodies", label: "Accreditation Bodies", help: "Bodies whose approval gives your work credibility, e.g. Weavers' guild, Craft standards panel, Culinary institute." }
        ],
        suppliers: [
            { id: "producers-wholesalers", label: "Producers & Wholesalers", help: "Producers and wholesalers that sell the materials and parts in the product, e.g. Wool mill, Box maker, Fabric importer, Flour miller." },
            { id: "logistics-fulfilment", label: "Logistics & Fulfilment", help: "Carriers and warehouses that deliver orders to buyers, e.g. Courier, National post, Fulfilment centre, Freight forwarder." },
            { id: "contractors-advisers", label: "Contractors & Advisers", help: "Outsourced specialists who do part of an offering's job or guide it, e.g. Dye works, Freelance developer, Product-safety adviser, Electrician." },
            { id: "agencies-influencers", label: "Agencies & Influencers", help: "Firms and creators paid to spread the word, e.g. Marketing agency, Instagram creator, Poster press, Podcast sponsor." },
            { id: "venues-organisers", label: "Venues & Organisers", help: "Hosts of the places and events where you sell, e.g. Fair organiser, Exhibition hall, Show promoter." },
            { id: "landlords-leasing-warehouses", label: "Landlords, Leasing & Warehouses", help: "Owners of premises used for making or storing stock, and lessors of vehicles, e.g. Estate owner, Depot firm, Chilled-storage outfit, Van leasing specialist." },
            { id: "platforms-payments", label: "Platforms & Payments", help: "Intermediaries between you and the customer who charge a fee, e.g. Online marketplace, Payment processor, App store, Reservation portal." }
        ]
    }
};

/** The help text of Founders & Owners, the first group of Human Resources in Infrastructure (the Founders tile): the help-texts document's own. */
export const FOUNDERS_OWNERS_HELP = "Owners who work in the company and draw pay from it, e.g. Founder salary, Part-time director fee.";

/**
 * THE HELP OF A CATEGORY, as the help-texts document shows it: the text of its one group, or one line for each of its groups ("Company Vehicles: cars and
 * bikes the company owns ..."), the group's name first and its text after it in lower case.
 */
export function groupHelpLines(groups: readonly { label: string; help: string }[]): string[] {
    const usable = groups.filter(group => group.help.length > 0);
    return usable.length === 1 ? [usable[0].help] : usable.map(group => group.label + ": " + group.help.charAt(0).toLowerCase() + group.help.slice(1));
}

/** The same as points of an "i": one group is its text; several are each a bold name and its text (as the Status's "i" lists its options). */
export function groupHelpPoints(groups: readonly { label: string; help: string }[]): (string | { title: string; text: string })[] {
    const usable = groups.filter(group => group.help.length > 0);
    return usable.length === 1 ? [usable[0].help] : usable.map(group => ({ title: group.label, text: group.help }));
}

/** The help text ("i") of a partner or supplier group, "" for none (no group, or an older answer's). */
export function partnerGroupHelp(place: "infrastructure" | "offering", type: string | undefined, group: string): string {
    return type === "partners" || type === "suppliers" ? BUSINESS_PARTNER_GROUPS[place][type].find(entry => entry.id === group)?.help ?? "" : "";
}

/** Where an older answer's Partners and Suppliers are filed: both are Suppliers, the first in the group that holds advisers and services. */
const LEGACY_PARTNER_GROUP: Record<"infrastructure" | "offering", string> = { infrastructure: "business-services", offering: "contractors-advisers" };

/** A category's name: a built-in's label, else the name the user typed ("" while he has not typed it yet). */
export function partnerCategoryLabel(categories: readonly BusinessCategoryValue[], id: string): string {
    return PARTNER_CATEGORIES.find(entry => entry.id === id)?.label ?? categories.find(entry => entry.id === id)?.name.trim() ?? "";
}

/** What a card of this category is called in a link ("Open Partner", "Open Supplier"): a Supplier only in the Suppliers type. */
export const partnerNoun = (category: string): "Partner" | "Supplier" => category === "suppliers" ? "Supplier" : "Partner";

/** Which of the two stored lists a card counts as (for the Financial Foundation's expense natures): by its category, else by the list it is stored in. */
export function partnerKindOf(partner: { category: string }, stored: "professionals" | "providers"): "professionals" | "providers" {
    return partner.category === "suppliers" ? "providers" : partner.category === "partners" ? "professionals" : stored;
}

export interface BusinessPartnerValue {
    id: string;
    /**
     * Its category: "partners", "providers" or a category the user made (BusinessCapabilityValue.partnerCategories). A saved card without one is read
     * as the list it is in (professionals: Partners, providers: Providers), so nothing is lost.
     */
    category: string;
    name: string;
    description: string;
    /** Its group within the type (BUSINESS_PARTNER_GROUPS' id), "" while it is in "No group". */
    group: string;
    /** A contract's own rate (a percent) in place of the default one: a Revenue Partner's. Optional. */
    rateOverride: string;
    /** The ready-made cost option of its group (costOptionsOf), which sets the billing type and locks the driver; "" until chosen. */
    costOption: string;
    /** A supplier connected to a rented vehicle: how many vehicles its price is for ("" is one). */
    quantity: string;
    /** The optional extras of the card (partnerExtraKeys). */
    extras: BusinessExtrasValue;
    /** The payment plan of a Per project price. */
    paymentPlan: BusinessPaymentPlan;
    /** The share of the card each linked Offering carries, by Offering id, when several are linked (they total 100%). */
    offeringShares: Record<string, string>;
    /** The card whose Status made it with "Other…" (made for that card's Offerings and start); "" for one made on its own. */
    madeBy: string;
    /** The day it starts (an ISO date); asked on every card. */
    startDate: string;
    /** The day it ends (an ISO date); optional. */
    endDate: string;
    /** A founder id: who contacts and coordinates them. */
    responsibleId: string;
    /** The Responsible tick, unticked: no responsible by choice. Absent means ticked. */
    responsibleOff?: boolean;
    cost: BusinessCostValue;
    /**
     * The Page 1 Offerings it serves -- Offering's Capability only. One
     * resource, activity or partner can serve several (the same yarn
     * in two collections).
     */
    offeringIds: string[];
}

/**
 * The whole page.
 *
 * Founders and the Workspace belong to Infrastructure alone -- they
 * are A and B of its Resources, and an Offering does not have its
 * own founders -- so they sit at the top rather than inside a
 * section.
 *
 * Infrastructure's Resources and Activities are grouped (C-F, A-E);
 * Offering's Capability's are flat lists, as its own part of the
 * specification writes them. Both split their Partnerships into
 * professionals and providers, because both sections' status lists
 * send the reader to "A. External Professionals & Partners or
 * B. Providers".
 */
/**
 * A Workspace as the cost model, the exports and the tiles read it: a RESOURCE CARD of the built-in "Workspace" category (resources.workspace), seen through
 * `workspacesOf`. It is not stored apart: a card whose Category is Workspace is the one Resource card with the Workspace form's fields in it (its type, its
 * deposit), and it keeps its id when its Category is changed.
 */
export interface BusinessWorkspaceValue {
    id: string;
    /** The card's name: its type's label ("Dedicated Workspace"), or what the founder wrote. */
    name: string;
    /** One of BUSINESS_WORKSPACE_KINDS' ids, or "". */
    kind: string;
    kindOther: string;
    status: string;
    cost: BusinessCostValue;
    providerId: string;
    /**
     * An optional deposit on the Workspace (an amount, in the cost's
     * currency), meaningful at Costs only. "" = none. The Financial
     * Foundation gathers it as a one-time Deposit asset.
     */
    deposit: string;
}

/** The id of the first Workspace card (the one every earlier answer has). */
export const FIRST_WORKSPACE_ID = "workspace";

/** The built-in Resources category whose cards are Workspaces. */
export const WORKSPACE_GROUP_ID = "workspace";

/** The group of the Workspace category that holds the Workspace cards (the id of their subsection). */
export const PREMISES_GROUP_ID = "premises";

/**
 * The format of a Page 3 answer. Version 3 has the nine categories with their groups, Partners & Suppliers and the current statuses and frequencies;
 * an answer without it is read once into them (see asBusinessCapabilityValue) and written back with it.
 */
export const BUSINESS_CAPABILITY_FORMAT_VERSION = 3;

/**
 * Where the fixed kinds of the five earlier Infrastructure categories are filed now: [category, group]. A kind the user made ("Other") has no group
 * and goes to "No group" of its category, its name written into the description of its cards.
 */
const LEGACY_KIND_GROUP: Record<string, [string, string]> = {
    workspace: ["workspace", PREMISES_GROUP_ID],
    electricity: ["utilities", "premises-utilities"],
    internet: ["utilities", "premises-utilities"],
    heating: ["utilities", "premises-utilities"],
    cooling: ["utilities", "premises-utilities"],
    water: ["utilities", "premises-utilities"],
    furniture: ["workstation", "furniture-fittings"],
    electrical: ["workstation", "furniture-fittings"],
    supporting: ["workstation", "furniture-fittings"],
    computing: ["equipment", "devices-tools"],
    peripherals: ["equipment", "devices-tools"],
    specialised: ["equipment", "devices-tools"],
    software: ["digital", "software-web"],
    presence: ["digital", "software-web"],
    services: ["digital", "cloud-security"]
};

/** The activity categories an earlier answer had (the same four in both places), for the note an activity that has to leave its category carries. */
const LEGACY_ACTIVITY_CATEGORY_LABELS: Record<string, string> = {
    operational: "Operational",
    production: "Production",
    marketing: "Marketing",
    sales: "Sales & Customer"
};

/** What a Workspace card is called where cards are listed in the documents and the costs: "Workspace" for the first, "Workspace 2" and on for the others. */
export const workspaceCardName = (index: number) => index === 0 ? "Workspace" : "Workspace " + (index + 1);

/** The Workspace cards of an answer, in order: the resource cards of its Workspace category. */
export function workspacesOf(capability: { resources: Record<string, BusinessResourceSubsectionValue[]> }): BusinessWorkspaceValue[] {
    return (capability.resources[WORKSPACE_GROUP_ID] ?? []).flatMap(subsection => subsection.slots).map(slot => ({
        id: slot.id,
        name: slot.name,
        kind: slot.workspaceKind,
        kindOther: slot.workspaceKindOther,
        status: slot.status,
        cost: slot.cost,
        providerId: slot.providerId,
        deposit: slot.deposit
    }));
}

/** Whether an answer saved before there were Workspace cards held anything in its Workspace (an untouched one made no card then, and makes none now). */
function legacyWorkspaceSlots(source: Record<string, unknown>): BusinessResourceSlotValue[] {
    const list: unknown[] = Array.isArray(source.workspaces) ? source.workspaces : source.workspace !== undefined ? [source.workspace] : [];
    const seen = new Set<string>();
    return list.flatMap((entry, index) => {
        const workspace = asObject(entry);
        const kind = asText(workspace.kind);
        const cost = asBusinessCost(workspace.cost);
        const status = asText(workspace.status);
        const providerId = asText(workspace.providerId);
        const deposit = businessDecimalText(asText(workspace.deposit));
        if (!kind && !status && !cost.price && !providerId && !deposit) {
            return [];
        }
        let id = asText(workspace.id) || (index === 0 ? FIRST_WORKSPACE_ID : randomId("workspace"));
        const earlierStatus = status === "investigation" ? "Needs Investigation" : "";
        if (seen.has(id)) {
            id = randomId("workspace");
        }
        seen.add(id);
        const label = BUSINESS_WORKSPACE_KINDS.find(entry => entry.id === kind)?.label ?? "";
        const other = asText(workspace.kindOther).trim();
        return [{
            ...createBusinessResourceSlot(),
            id,
            // (Its name is its type's: it stays complete, and the totals are as they were.)
            name: kind === "other" && other ? other : label || workspaceCardName(index),
            description: withEarlier("", "status", earlierStatus),
            status: spaceStatusOf(status),
            cost: normalCostOf(cost, "infrastructure", PREMISES_GROUP_ID),
            providerId,
            workspaceKind: kind,
            workspaceKindOther: asText(workspace.kindOther),
            deposit
        }];
    });
}

export interface BusinessCapabilityValue {

    /** BUSINESS_CAPABILITY_FORMAT_VERSION once read; an answer saved before it is moved to the current categories when it is read. */
    formatVersion?: number;

    founders: BusinessFounderValue[];

    /** C-F, by group id (and the Workspace category: its cards are read through `workspacesOf`). */
    resources: Record<string, BusinessResourceSubsectionValue[]>;

    activities: BusinessActivityCategoryValue[];

    professionals: BusinessPartnerValue[];

    providers: BusinessPartnerValue[];

    /** The categories of Partners & Suppliers the user has made (under "Other"), shared by Infrastructure's and Offering's cards. */
    partnerCategories: BusinessCategoryValue[];

    /** The categories of activities the user has made (under "Other"), shared by Infrastructure's and Offering's activities. */
    activityCategories: BusinessCategoryValue[];

    offering: {
        resources: BusinessResourceSlotValue[];
        activities: BusinessActivityValue[];
        professionals: BusinessPartnerValue[];
        providers: BusinessPartnerValue[];
    };

    /**
     * How each Offering is delivered, by Offering id: the effort one
     * unit takes, how long, and by whom (see DemandCapacity.ts).
     */
    delivery: Record<string, DeliveryValue>;

}

/**
 * THE DATE DEFINES THE ORDER (then the number): every list of cards of the Infrastructure & Capability page -- a resource group's, an activity category's,
 * the partners' and suppliers' -- is kept in the order of the cards' Start dates, the earliest first; a card with the same date keeps its place, a card
 * with no date goes last. The founders keep the order the Legal Entity gives them.
 */
export function orderedByDate(value: BusinessCapabilityValue): BusinessCapabilityValue {
    const byDate = <T extends { startDate: string }>(cards: T[]): T[] => {
        const sorted = cards.map((card, at) => ({ card, at })).sort((a, b) => {
            const first = a.card.startDate || "9999-99-99";
            const second = b.card.startDate || "9999-99-99";
            return first < second ? -1 : first > second ? 1 : a.at - b.at;
        }).map(entry => entry.card);
        return sorted.every((card, at) => card === cards[at]) ? cards : sorted;
    };
    return {
        ...value,
        resources: Object.fromEntries(Object.entries(value.resources).map(([id, subsections]) => [id, subsections.map(subsection => ({ ...subsection, slots: byDate(subsection.slots) }))])),
        activities: value.activities.map(category => ({ ...category, activities: byDate(category.activities) })),
        professionals: byDate(value.professionals),
        providers: byDate(value.providers),
        offering: {
            ...value.offering,
            resources: byDate(value.offering.resources),
            activities: byDate(value.offering.activities),
            professionals: byDate(value.offering.professionals),
            providers: byDate(value.offering.providers)
        }
    };
}

function createBusinessCost(): BusinessCostValue {
    return { price: "", frequency: "", frequencyOther: "", unit: "", currency: "" };
}

function createBusinessFounder(): BusinessFounderValue {
    return { id: randomId("founder"), name: "", roles: [""], salary: "", hours: "", deliveryHours: "", deliveryShare: "", period: "", startDate: "", extras: {} };
}

export function createBusinessResourceSlot(): BusinessResourceSlotValue {
    return {
        id: randomId("resource"),
        name: "",
        quantity: "1",
        description: "",
        status: "",
        cost: createBusinessCost(),
        providerId: "",
        offeringIds: [],
        workspaceKind: "",
        workspaceKindOther: "",
        deposit: "",
        category: "",
        group: "",
        // (A card begins today unless told otherwise.)
        startDate: todayIsoDate(),
        endDate: "",
        activityId: "",
        usefulLife: "",
        warranty: false,
        warrantyUntil: "",
        rateOverride: "",
        costOption: "",
        amortisationYears: "",
        extras: {},
        paymentPlan: emptyPaymentPlan(),
        offeringShares: {},
        extraStatuses: [],
        insuranceId: "",
        insuresId: ""
    };
}

export function createBusinessActivity(category = ""): BusinessActivityValue {
    return {
        id: randomId("activity"),
        category,
        name: "",
        description: "",
        performerIds: [],
        responsibleId: "",
        completed: false,
        offeringIds: [],
        type: "",
        madeBy: "",
        startDate: todayIsoDate(),
        endDate: "",
        offeringShares: {},
        resources: [],
        performerPeople: {}
    };
}

export function createBusinessPartner(name = "", category = ""): BusinessPartnerValue {
    return {
        id: randomId("partner"),
        category,
        group: "",
        rateOverride: "",
        costOption: "",
        quantity: "",
        extras: {},
        paymentPlan: emptyPaymentPlan(),
        offeringShares: {},
        madeBy: "",
        startDate: todayIsoDate(),
        endDate: "",
        name,
        description: "",
        responsibleId: "",
        cost: createBusinessCost(),
        offeringIds: []
    };
}

/**
 * What Partners opens with: nothing. (It used to be seeded with an Accountant, a Lawyer and an Insurance Professional; a saved answer keeps
 * whatever it holds, these included -- only a page with none stored stops getting them.)
 */
function seededProfessionals(): BusinessPartnerValue[] {
    return [];
}

function asBusinessCost(value: unknown): BusinessCostValue {

    const cost = asObject(value);

    /* Per order is Per unit now, with "order" as its unit; the price and the way it is counted are as they were. */
    const perOrder = asText(cost.frequency) === "per-order";

    return {
        price: businessAmountText(cost.price),
        frequency: perOrder ? "per-unit" : asText(cost.frequency),
        frequencyOther: asText(cost.frequencyOther),
        unit: asText(cost.unit) || (perOrder ? "order" : ""),
        currency: asText(cost.currency)
    };

}

/**
 * A cost saved with the frequency "Other" (which is no longer offered): the frequency is cleared -- the card shows incomplete until one is chosen --
 * and what it was called is returned, to be written into the card's description rather than lost.
 */
function withoutOtherFrequency(cost: BusinessCostValue): { cost: BusinessCostValue; was: string } {
    if (cost.frequency !== "other") {
        return { cost, was: "" };
    }
    return { cost: { ...cost, frequency: "", frequencyOther: "" }, was: cost.frequencyOther.trim() || "Other" };
}

/** A description with what an earlier version of the page called the card, put in front of it so that nothing is lost. */
function withEarlier(description: string, what: string, was: string): string {
    return (was ? "Earlier " + what + ": " + was + ". " + description : description).trim();
}

/** The status a space (the Workspace form) has in the current statuses, from an earlier answer's. Needs Investigation and Needs Activity were none of its. */
function spaceStatusOf(status: string): string {
    return status === "provided" || status === "partners-providers" || status === "professional" ? "rent"
        : status === "costs" ? "buy"
        : (BUSINESS_WORKSPACE_STATUS_IDS as readonly string[]).includes(status) ? status : "";
}

/** The status any other card has in the current statuses, from an earlier answer's. */
function cardStatusOf(status: string): string {
    return status === "provided" || status === "professional" || status === "partners-providers" ? "partners-suppliers"
        : status === "rent" ? "partners-suppliers"
        : status === "buy" ? "costs"
        : status;
}

function asBusinessResourceSlot(
    entry: unknown,
    workspace = false,
    context: {
        /** The answer was saved before the nine categories (no format version 3): its statuses, frequencies and quantities are moved to the current ones. */
        legacy?: boolean;
        /** The group the card is filed in (an Infrastructure card's subsection, an Offering card's own). */
        groupId?: string;
        /** Its place: the group's frequency and unit are those of the place. */
        place?: "infrastructure" | "offering";
    } = {}
): BusinessResourceSlotValue {

    const slot = asObject(entry);

    /* Quantity took any text before it took only a number. What is
       not a plain number -- "3 tables, 6 shelving units", "6 lamps",
       "8 per workshop" -- is moved to the front of the description
       rather than lost, and the Quantity left empty. Even "6 lamps"
       keeps no 6: a Quantity that was not a number meant the price
       was the total, and a 6 here would multiply it. Once moved,
       the Quantity is "", so reading it again moves nothing. */
    const quantity = asText(slot.quantity).trim();
    const description = asText(slot.description);
    /* Digits and one "." are a number, or one being typed: "3." and
       "." are on their way to one and stay. */
    const moved = !/^\d*\.?\d*$/.test(quantity);

    const groupId = context.groupId ?? "";
    const rawStatus = asText(slot.status);

    /* An earlier answer's status, in the current ones (see the F1 mapping): Provided is Rent on a space and Partners & Suppliers elsewhere; Costs on a
       space is Buy; Needs Investigation belongs to the people cards, and on any other card it is cleared and said in the description. */
    let status = rawStatus;
    let earlierStatus = "";
    if (workspace) {
        status = context.legacy ? spaceStatusOf(rawStatus) : rawStatus;
        if (context.legacy && rawStatus === "investigation") {
            earlierStatus = "Needs Investigation";
        }
    } else if (context.legacy) {
        status = cardStatusOf(rawStatus);
        if (status === "investigation" && !(BUSINESS_PEOPLE_GROUP_IDS as readonly string[]).includes(groupId)) {
            status = "";
            earlierStatus = "Needs Investigation";
        }
    } else {
        // (Provided and Partners were one status already, before the nine categories.)
        status = rawStatus === "provided" || rawStatus === "professional" ? "partners-suppliers" : rawStatus;
    }

    const read = asBusinessCost(slot.cost);
    const { cost: noOther, was: earlierFrequency } = withoutOtherFrequency(read);

    /* A purchase of an asset is priced Per unit: an earlier answer's One-time price in an asset group moves to it (Qty times the price, as before). */
    const cost = context.legacy && isPurchaseGroup(groupId) && isCostingStatus(status) && noOther.frequency === "one-time"
        ? { ...noOther, frequency: "per-unit", unit: noOther.unit || "unit" }
        : noOther;

    return {
        id: asText(slot.id) || randomId("resource"),
        name: asText(slot.name),
        quantity: moved ? "" : quantity,
        description: withEarlier(withEarlier(moved
            ? ("Quantity: " + quantity.replace(/\.$/, "") + ". " + description).trim()
            : description, "frequency", earlierFrequency), "status", earlierStatus),
        status,
        cost: normalCostOf(cost, context.place ?? "infrastructure", groupId),
        providerId: asText(slot.providerId),
        offeringIds: offeringIdsOf(slot),
        workspaceKind: asText(slot.workspaceKind),
        workspaceKindOther: asText(slot.workspaceKindOther),
        deposit: businessDecimalText(asText(slot.deposit)),
        category: asText(slot.category),
        group: asText(slot.group),
        startDate: isoDateText(slot.startDate),
        endDate: isoDateText(slot.endDate),
        activityId: asText(slot.activityId),
        usefulLife: businessDecimalText(asText(slot.usefulLife)),
        warranty: slot.warranty === true,
        warrantyUntil: isoDateText(slot.warrantyUntil),
        rateOverride: businessDecimalText(asText(slot.rateOverride)),
        costOption: validCostOption(context.place ?? "infrastructure", groupId, asText(slot.costOption)),
        amortisationYears: asText(slot.amortisationYears).replace(/\D/g, "").slice(0, 3),
        extras: asBusinessExtras(slot.extras),
        paymentPlan: asPaymentPlan(slot.paymentPlan),
        offeringShares: asOfferingShares(slot.offeringShares, offeringIdsOf(slot)),
        extraStatuses: (Array.isArray(slot.extraStatuses) ? slot.extraStatuses : []).map(entry => {
            const row = asObject(entry);
            return {
                id: asText(row.id) || randomId("status"),
                status: (BUSINESS_EXTRA_STATUS_IDS as readonly string[]).includes(asText(row.status)) ? asText(row.status) : "",
                providerId: asText(row.providerId),
                activityId: asText(row.activityId)
            };
        }),
        insuranceId: asText(slot.insuranceId),
        insuresId: asText(slot.insuresId)
    };

}

/**
 * THE SHARES of the Offerings a card is linked to: the percent of the card each Offering carries, when it is linked to several. They total 100% or the card
 * is incomplete; one Offering carries all of it. Ticking Offerings starts them equal.
 */
export function equalOfferingShares(offeringIds: readonly string[]): Record<string, string> {
    // (Whole percents, of at most two digits: three Offerings are 33, 33 and 34.)
    const each = Math.floor(100 / Math.max(1, offeringIds.length));
    return Object.fromEntries(offeringIds.map((id, at) => [id, String(at === offeringIds.length - 1 ? 100 - each * (offeringIds.length - 1) : each)]));
}

/**
 * THE SHARES COUNT IN UNITS instead of percents when the card says so (a delivery of 3 items of one Offering and 5 of another): a reserved entry of the
 * shares, UNITS_KEY, holds "1". The units are then shares of their own total, and there is nothing to total to 100.
 */
export const OFFERING_UNITS_KEY = "~units";

export const offeringSharesInUnits = (shares: Record<string, string>) => shares[OFFERING_UNITS_KEY] === "1";

/** Every linked Offering one unit, in units. */
export function unitOfferingShares(offeringIds: readonly string[]): Record<string, string> {
    return { ...Object.fromEntries(offeringIds.map(id => [id, "1"])), [OFFERING_UNITS_KEY]: "1" };
}

/** What the typed shares of the linked Offerings add up to (an Offering with none typed counts nothing). */
export function offeringSharesTotal(offeringIds: readonly string[], shares: Record<string, string>): number {
    return Math.round(offeringIds.reduce((sum, id) => sum + (parseAmount(shares[id] ?? "") ?? 0), 0) * 100) / 100;
}

/** Whether a card linked to several Offerings has a share missing, or shares that do not total 100%. One or none: nothing to share. */
export function offeringSharesIncomplete(offeringIds: readonly string[], shares: Record<string, string>): boolean {
    if (offeringSharesInUnits(shares)) {
        return offeringIds.length > 1 && offeringIds.some(id => !((parseAmount(shares[id] ?? "") ?? 0) > 0));
    }
    return offeringIds.length > 1 && (offeringIds.some(id => (shares[id] ?? "") === "") || offeringSharesTotal(offeringIds, shares) !== 100);
}

/** The fraction of a card each linked Offering carries: the typed shares when they total 100%, else equal ones. */
export function offeringFractions(offeringIds: readonly string[], shares: Record<string, string>): Record<string, number> {
    const typed = offeringIds.length > 1 && !offeringSharesIncomplete(offeringIds, shares);
    const whole = offeringSharesInUnits(shares) ? offeringIds.reduce((sum, id) => sum + (parseAmount(shares[id] ?? "") ?? 0), 0) : 100;
    return Object.fromEntries(offeringIds.map(id => [id, typed ? (parseAmount(shares[id] ?? "") ?? 0) / whole : 1 / offeringIds.length]));
}

/** The shares kept: those of the Offerings the card is linked to, cleaned to numbers. */
function asOfferingShares(value: unknown, offeringIds: readonly string[]): Record<string, string> {
    const source = asObject(value);
    const kept = Object.fromEntries(offeringIds.filter(id => id in source).map(id => [id, businessDecimalText(asText(source[id]))]));
    // A card linked to several Offerings before there were shares was shared equally: it keeps being.
    if (offeringIds.length > 1 && Object.keys(kept).length === 0) {
        return equalOfferingShares(offeringIds);
    }
    return offeringIds.length > 1 && source[OFFERING_UNITS_KEY] === "1" ? { ...kept, [OFFERING_UNITS_KEY]: "1" } : kept;
}

/** An ISO date ("YYYY-MM-DD") as saved; anything else is not a date and reads as none. */
function isoDateText(value: unknown): string {
    const text = asText(value).trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!match) {
        return "";
    }
    // A real day: 2027-02-30 is none.
    const day = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    return day.getUTCFullYear() === Number(match[1]) && day.getUTCMonth() === Number(match[2]) - 1 && day.getUTCDate() === Number(match[3]) ? text : "";
}

/** A list of unknowns: what is not a list reads as none. */
function asArrayOf(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

/** A list now; one Offering before, which is kept as the list's first. */
function offeringIdsOf(entry: Record<string, unknown>): string[] {
    const list = Array.isArray(entry.offeringIds)
        ? entry.offeringIds.map(asText)
        : [asText(entry.offeringId)];
    return [...new Set(list.filter(id => id.length > 0))];
}

function asBusinessActivity(entry: unknown, fallbackCategory = ""): BusinessActivityValue {

    const activity = asObject(entry);

    return {
        id: asText(activity.id) || randomId("activity"),
        category: asText(activity.category) || fallbackCategory,
        name: asText(activity.name),
        description: asText(activity.description),
        /* A list now; one id before. The one chosen is kept. An
           empty entry is a picker added and not yet chosen, and
           stays while it is on screen. */
        performerIds: Array.isArray(activity.performerIds)
            ? activity.performerIds.map(asText)
            : [asText(activity.performerId)].filter(id => id.length > 0),
        responsibleId: asText(activity.responsibleId),
        ...(activity.responsibleOff === true ? { responsibleOff: true } : {}),
        completed: activity.completed === true,
        offeringIds: offeringIdsOf(activity),
        type: BUSINESS_PREOPERATIONAL_TYPES.some(entry => entry.id === asText(activity.type)) ? asText(activity.type) : "",
        madeBy: asText(activity.madeBy),
        startDate: isoDateText(activity.startDate),
        endDate: isoDateText(activity.endDate),
        offeringShares: asOfferingShares(activity.offeringShares, offeringIdsOf(activity)),
        resources: (Array.isArray(activity.resources) ? activity.resources : [])
            // (Units are whole numbers. A row still waiting for its resource is kept: its id is "".)
            .map(entry => ({ id: asText(asObject(entry).id), units: asText(asObject(entry).units).replace(/\D/g, "").slice(0, 6) }))
            .filter((entry, at, all) => entry.id === "" || all.findIndex(other => other.id === entry.id) === at),
        performerPeople: Object.fromEntries(Object.entries(asObject(activity.performerPeople))
            .map(([id, people]) => [id, asText(people).replace(/\D/g, "").slice(0, 4)])
            .filter(([, people]) => people !== ""))
    };

}

function asBusinessPartner(
    entry: unknown,
    fallbackCategory: string,
    context: {
        legacy?: boolean;
        scope?: "infrastructure" | "offering";
        /** The names of the categories the user made, by id (an earlier answer's). */
        categoryNames?: ReadonlyMap<string, string>;
    } = {}
): BusinessPartnerValue {

    const partner = asObject(entry);

    const scope = context.scope ?? "infrastructure";
    const rawCategory = asText(partner.category) || fallbackCategory;
    const description = asText(partner.description);

    let category = rawCategory;
    let group = asText(partner.group);
    let earlierCategory = "";

    if (context.legacy) {
        /* Partners and Suppliers are both Suppliers now (see the F1 mapping): the old Partners in the group that holds advisers and services, the
           old Providers and the categories the user made with no group yet -- the name of such a category goes into the description. */
        if (rawCategory === "partners") {
            category = "suppliers";
            group = LEGACY_PARTNER_GROUP[scope];
        } else if (rawCategory === "providers") {
            category = "suppliers";
            group = "";
        } else if (rawCategory !== UNASSIGNED_CATEGORY) {
            category = "suppliers";
            group = "";
            earlierCategory = context.categoryNames?.get(rawCategory)?.trim() ?? "";
        }
    }

    // (Providers is Suppliers: a list's default category from before the types were Partners and Suppliers.)
    if (category === "providers") {
        category = "suppliers";
    }

    /* A group is one of the type's in this place. */
    if (!(PARTNER_CATEGORIES as readonly { id: string }[]).some(entry => entry.id === category)) {
        group = "";
    } else if (!BUSINESS_PARTNER_GROUPS[scope][category as "partners" | "suppliers"].some(entry => entry.id === group)) {
        group = "";
    }

    const read = asBusinessCost(partner.cost);
    const { cost, was: earlierFrequency } = withoutOtherFrequency(read);

    return {
        id: asText(partner.id) || randomId("partner"),
        category,
        group,
        rateOverride: businessDecimalText(asText(partner.rateOverride)),
        costOption: validCostOption(scope, group, asText(partner.costOption)),
        quantity: businessDecimalText(asText(partner.quantity)),
        extras: asBusinessExtras(partner.extras),
        paymentPlan: asPaymentPlan(partner.paymentPlan),
        offeringShares: asOfferingShares(partner.offeringShares, offeringIdsOf(partner)),
        madeBy: asText(partner.madeBy),
        startDate: isoDateText(partner.startDate),
        endDate: isoDateText(partner.endDate),
        name: asText(partner.name),
        description: withEarlier(withEarlier(description, "frequency", earlierFrequency), "category", earlierCategory),
        responsibleId: asText(partner.responsibleId),
        ...(partner.responsibleOff === true ? { responsibleOff: true } : {}),
        cost: normalCostOf(cost, scope, group),
        offeringIds: offeringIdsOf(partner)
    };

}

function asBusinessPartnerList(
    value: unknown,
    fallbackCategory: string,
    context: Parameters<typeof asBusinessPartner>[2] = {}
): BusinessPartnerValue[] {
    return (Array.isArray(value) ? value : []).map(entry => asBusinessPartner(entry, fallbackCategory, context));
}

function asBusinessCategoryList(value: unknown): BusinessCategoryValue[] {
    return (Array.isArray(value) ? value : []).map(entry => {
        const category = asObject(entry);
        return { id: asText(category.id) || randomId("category"), name: asText(category.name) };
    });
}

/**
 * The stored answer in the shape the editor expects.
 *
 * Nothing is invented for an empty page except the three seeded
 * professionals, which the specification asks for by name -- and
 * those are seeded ONCE, by the editor when it first writes, not
 * here. A reader that supplied them would put them back every time
 * a founder deleted one.
 */
export function asBusinessCapabilityValue(value: unknown): BusinessCapabilityValue {

    const source = asObject(value);

    /* An answer saved before the nine categories has no format version: its cards are moved ONCE to the current categories, groups, statuses and
       frequencies (the mapping agreed as F1), and the value is written back carrying the version. A card that fits nowhere is put in "No category" /
       "No group" with what it was written into its description. */
    const legacy = !(typeof source.formatVersion === "number" && source.formatVersion >= BUSINESS_CAPABILITY_FORMAT_VERSION);

    const resources: Record<string, BusinessResourceSubsectionValue[]> = {};

    for (const [category, entries] of Object.entries(asObject(source.resources))) {

        const merged = new Map<string, BusinessResourceSubsectionValue>();

        for (const entry of Array.isArray(entries) ? entries : []) {

            const subsection = asObject(entry);
            const rawId = asText(subsection.id);

            if (rawId.length === 0) {
                continue;
            }

            const target = legacy ? LEGACY_KIND_GROUP[rawId] : undefined;
            const kept = target !== undefined && target[0] === category ? target[1] : "";
            const fixed = BUSINESS_RESOURCE_GROUPS.find(entry => entry.id === category)?.kinds.some(kind => kind.id === rawId) ?? false;
            // A kind the user made, or one no longer there: its cards are in the category's "No group" -- or, where the category has just the one group, in it.
            const made = legacy && kept === "" && !fixed && rawId !== UNASSIGNED_CATEGORY;
            const only = soleGroupOf(BUSINESS_RESOURCE_GROUPS.find(entry => entry.id === category)?.kinds);
            const id = kept ? kept : made || rawId === UNASSIGNED_CATEGORY ? only || UNASSIGNED_CATEGORY : rawId;
            const named = asText(subsection.name).trim();

            const slots = (Array.isArray(subsection.slots) ? subsection.slots : [])
                .map(slot => asBusinessResourceSlot(slot, category === WORKSPACE_GROUP_ID, { legacy, groupId: id, place: "infrastructure" }))
                .map(slot => made ? { ...slot, description: withEarlier(slot.description, "group", named || "Other") } : slot);

            const into = merged.get(id);
            if (into) {
                into.slots.push(...slots);
            } else if (!made || slots.length > 0) {
                merged.set(id, { id, name: made ? "" : asText(subsection.name), slots });
            }

        }

        resources[category] = [...merged.values()];

    }

    // An answer saved before the Workspace was a Resources category: its Workspace(s) become cards of it, ids kept.
    if (!resources[WORKSPACE_GROUP_ID] || resources[WORKSPACE_GROUP_ID].every(subsection => subsection.slots.length === 0)) {
        const legacyWorkspace = legacyWorkspaceSlots(source);
        if (legacyWorkspace.length > 0) {
            resources[WORKSPACE_GROUP_ID] = [{ id: PREMISES_GROUP_ID, name: "", slots: legacyWorkspace }];
        }
    }

    // The activity an earlier answer's status MADE (it named the card in its `sourceId`) is now the one the card chooses: the same activity, an ordinary one.
    const madeBy = new Map<string, string>();
    const noteMade = (entry: unknown) => {
        const made = asObject(entry);
        const from = asText(made.sourceId);
        if (from && asText(made.id) && !madeBy.has(from)) {
            madeBy.set(from, asText(made.id));
        }
    };
    (Array.isArray(source.activities) ? source.activities : []).forEach(container => asArrayOf(asObject(container).activities).forEach(noteMade));
    asArrayOf(asObject(source.offering).activities).forEach(noteMade);
    const choosing = <T extends { id: string; status: string; activityId: string }>(slot: T): T =>
        slot.status === "activity" && slot.activityId === "" && madeBy.has(slot.id) ? { ...slot, activityId: madeBy.get(slot.id) ?? "" } : slot;
    for (const [category, subsections] of Object.entries(resources)) {
        resources[category] = subsections.map(subsection => ({ ...subsection, slots: subsection.slots.map(choosing) }));
    }

    // The categories the user made (an earlier answer's) by id: their names, for the note a card carries when its category goes.
    const userActivityNames = new Map<string, string>();
    for (const entry of asBusinessCategoryList(source.activityCategories)) {
        userActivityNames.set(entry.id, entry.name);
    }

    const rawContainers: BusinessActivityCategoryValue[] = (Array.isArray(source.activities) ? source.activities : [])
        .map(entry => {
            const category = asObject(entry);
            const id = asText(category.id);
            if (id.length > 0 && asText(category.name).trim()) {
                userActivityNames.set(id, asText(category.name));
            }
            return {
                id,
                name: asText(category.name),
                activities: (Array.isArray(category.activities) ? category.activities : []).map(activity => ({ ...asBusinessActivity(activity, id), category: id }))
            };
        })
        .filter(category => category.id.length > 0);

    /** The category an earlier answer's activity is filed under now in this place, and the note it carries when that is "No category". */
    const activityFiledUnder = (scope: "infrastructure" | "offering", id: string): { category: string; earlier: string } => {
        if (id === UNASSIGNED_CATEGORY || BUSINESS_ACTIVITY_GROUPS[scope].some(group => group.id === id)) {
            return { category: id, earlier: "" };
        }
        return { category: UNASSIGNED_CATEGORY, earlier: userActivityNames.get(id)?.trim() || LEGACY_ACTIVITY_CATEGORY_LABELS[id] || id };
    };

    let activityContainers = rawContainers;
    if (legacy) {
        // Infrastructure has two groups now (Pre-Operational and Operational): the other categories' activities are in "No category".
        const regrouped = new Map<string, BusinessActivityCategoryValue>();
        for (const container of rawContainers) {
            for (const activity of container.activities) {
                const filed = activityFiledUnder("infrastructure", container.id);
                const into = regrouped.get(filed.category) ?? { id: filed.category, name: "", activities: [] };
                into.activities.push({ ...activity, category: filed.category, description: withEarlier(activity.description, "category", filed.earlier) });
                regrouped.set(filed.category, into);
            }
        }
        activityContainers = [...regrouped.values()];
    }

    // The categories the user made: the stored list, then any named category an old answer kept only as the container of its activities.
    const activityCategories: BusinessCategoryValue[] = legacy ? [] : asBusinessCategoryList(source.activityCategories);
    if (!legacy) {
        for (const container of activityContainers) {
            if (!BUSINESS_ACTIVITY_CATEGORIES.some(entry => entry.id === container.id) && container.name.trim() && !activityCategories.some(entry => entry.id === container.id)) {
                activityCategories.push({ id: container.id, name: container.name });
            }
        }
    }

    const partnerCategoryNames = new Map<string, string>(asBusinessCategoryList(source.partnerCategories).map(entry => [entry.id, entry.name]));
    const partnerContext = (scope: "infrastructure" | "offering") => ({ legacy, scope, categoryNames: partnerCategoryNames });

    const offering = asObject(source.offering);

    const offeringResource = (entry: unknown): BusinessResourceSlotValue => {
        const read = asBusinessResourceSlot(entry, false, { legacy, groupId: asText(asObject(entry).group), place: "offering" });
        const category = BUSINESS_OFFERING_RESOURCE_GROUPS.some(group => group.id === read.category) ? read.category : "";
        const groups = offeringGroupsOf(category);
        return { ...read, category, group: groups.some(group => group.id === read.group) ? read.group : soleGroupOf(groups) };
    };

    return withDepositsOnLandlords({

        formatVersion: BUSINESS_CAPABILITY_FORMAT_VERSION,

        /* One founder card from the start, like Page 1's one
           Segment and Page 2's one channel: an organisation has at
           least one founder, every Responsibility on this page
           names one, and a section showing nothing but an Add
           button reads as missing rather than as empty.

           Its id is fixed rather than drawn, for the reason
           seededProfessionals gives: this runs while the page is
           being drawn. */
        founders: source.founders === undefined
            ? [{ ...createBusinessFounder(), id: "founder-1" }]
            : (Array.isArray(source.founders) ? source.founders : [])
            .map(entry => {

                const founder = asObject(entry);

                return {
                    id: asText(founder.id) || randomId("founder"),
                    name: asText(founder.name),
                    /* A list now; one line of text before. What
                       was typed into the single box is kept, as
                       the first role, rather than dropped. */
                    roles: typeof founder.roles === "string"
                        ? [founder.roles]
                        : businessNeedList(founder.roles, 1),
                    ...founderSalaryAndPeriod(founder),
                    hours: businessDecimalText(asText(founder.hours)),
                    deliveryHours: businessDecimalText(asText(founder.deliveryHours)),
                    deliveryShare: businessDecimalText(asText(founder.deliveryShare)),
                    startDate: isoDateText(founder.startDate),
                    extras: asBusinessExtras(founder.extras)
                };

            }),

        resources,

        // (An Infrastructure activity's category IS the one it is filed in.)
        activities: activityContainers,

        activityCategories,

        professionals: source.professionals === undefined
            ? seededProfessionals()
            : asBusinessPartnerList(source.professionals, "partners", partnerContext("infrastructure")),

        providers: asBusinessPartnerList(source.providers, "providers", partnerContext("infrastructure")),

        partnerCategories: legacy ? [] : asBusinessCategoryList(source.partnerCategories),

        offering: {
            resources: (Array.isArray(offering.resources) ? offering.resources : []).map(offeringResource).map(choosing),
            // (An Offering activity carries its category: the one it was saved with, else Production.)
            activities: (Array.isArray(offering.activities) ? offering.activities : [])
                .map(entry => {
                    const read = asBusinessActivity(entry, DERIVED_ACTIVITY_CATEGORY.offering);
                    const known = read.category === UNASSIGNED_CATEGORY
                        || activityGroupsOf("offering").some(category => category.id === read.category)
                        || (legacy && read.category in LEGACY_ACTIVITY_CATEGORY_LABELS)
                        || activityCategories.some(category => category.id === read.category);
                    const category = known ? read.category : DERIVED_ACTIVITY_CATEGORY.offering;
                    const filed = legacy ? activityFiledUnder("offering", category) : { category, earlier: "" };
                    return { ...read, category: filed.category, description: withEarlier(read.description, "category", filed.earlier) };
                }),
            professionals: asBusinessPartnerList(offering.professionals, "partners", partnerContext("offering")),
            providers: asBusinessPartnerList(offering.providers, "providers", partnerContext("offering"))
        },

        delivery: asDeliveryMap(source.delivery)

    });

}

/**
 * A Deposit is the landlord's extra (it sits on the supplier card that holds the rent). The deposit an earlier answer kept on a rented Premises card moves to
 * its supplier, unless the supplier already has one; one on a card with no supplier stays where it was.
 */
function withDepositsOnLandlords(value: BusinessCapabilityValue): BusinessCapabilityValue {
    const spaces = Object.values(value.resources).flat().flatMap(subsection => subsection.slots).filter(slot => slot.deposit !== "" && slot.status === "rent" && slot.providerId !== "");
    if (spaces.length === 0) {
        return value;
    }
    const lists = [value.providers, value.professionals, value.offering.providers, value.offering.professionals].flat();
    const movable = spaces.filter(slot => lists.some(partner => partner.id === slot.providerId));
    if (movable.length === 0) {
        return value;
    }
    const given = new Map<string, string>();
    const moved = new Set<string>();
    for (const slot of movable) {
        const partner = lists.find(entry => entry.id === slot.providerId);
        if (partner && (partner.extras.deposit ?? "") === "" && !given.has(partner.id)) {
            given.set(partner.id, slot.deposit);
            moved.add(slot.id);
        }
    }
    const give = (partner: BusinessPartnerValue): BusinessPartnerValue => given.has(partner.id) ? { ...partner, extras: { ...partner.extras, deposit: given.get(partner.id) } } : partner;
    return {
        ...value,
        resources: Object.fromEntries(Object.entries(value.resources).map(([category, subsections]) => [
            category,
            subsections.map(subsection => ({ ...subsection, slots: subsection.slots.map(slot => moved.has(slot.id) ? { ...slot, deposit: "" } : slot) }))
        ])),
        professionals: value.professionals.map(give),
        providers: value.providers.map(give),
        offering: { ...value.offering, professionals: value.offering.professionals.map(give), providers: value.offering.providers.map(give) }
    };
}

/** Every activity on the page, whichever section or category it is
 *  filed under -- for the lookups that do not care. */
function businessAllActivities(
    capability: BusinessCapabilityValue
): BusinessActivityValue[] {
    return [
        ...capability.activities.flatMap(category => category.activities),
        ...capability.offering.activities
    ];
}

/**
 * What one founder is responsible for: the name of every activity
 * assigned to them, in page order, and whether it is completed.
 *
 * "This list is developed automatically" -- so it is derived here
 * and shown read-only under the founder, never typed. An activity
 * names its responsible founder; the founder does not name their
 * activities, or the same fact would be recorded twice and be free
 * to disagree with itself.
 */
/** One thing a founder is responsible for: where it stands (Infrastructure, Offering, the Legal Entity) and what it is. */
export interface FounderResponsibility {
    id: string;
    name: string;
    completed: boolean;
    scope: "infrastructure" | "offering" | "legal";
    kind: "activity" | "partner" | "supplier" | "legal";
}

export function businessFounderResponsibilities(
    capability: BusinessCapabilityValue,
    founderId: string,
    /** The Legal Entity's expenses: an expense names the founder responsible for it. */
    legalExpenses: readonly { id: string; name: string; responsibility: string; responsibleOff?: boolean }[] = []
): FounderResponsibility[] {

    if (founderId.length === 0) {
        return [];
    }

    const founderIds = capability.founders.map(founder => founder.id);
    const offeringIds = new Set(capability.offering.activities.map(activity => activity.id));

    const activities = businessAllActivities(capability)
        .filter(activity =>
            businessResponsibleId(activity, founderIds) === founderId &&
            activity.name.trim().length > 0
        )
        .map(activity => ({
            id: activity.id,
            name: activity.name.trim(),
            completed: activity.completed,
            scope: offeringIds.has(activity.id) ? "offering" as const : "infrastructure" as const,
            kind: "activity" as const
        }));

    const partners = (list: readonly BusinessPartnerValue[], scope: "infrastructure" | "offering", kind: "partner" | "supplier") => list
        .filter(partner => businessPartnerResponsibleId(partner, founderIds) === founderId && partner.name.trim().length > 0)
        .map(partner => ({ id: partner.id, name: partner.name.trim(), completed: false, scope, kind }));

    const legal = legalExpenses
        .filter(expense => expense.responsibleOff !== true && expense.responsibility === founderId && expense.name.trim().length > 0)
        .map(expense => ({ id: expense.id, name: expense.name.trim(), completed: false, scope: "legal" as const, kind: "legal" as const }));

    return [
        ...activities,
        ...partners(capability.professionals, "infrastructure", "partner"),
        ...partners(capability.providers, "infrastructure", "supplier"),
        ...partners(capability.offering.professionals, "offering", "partner"),
        ...partners(capability.offering.providers, "offering", "supplier"),
        ...legal
    ];

}

/**
 * How long a founder's Responsibilities list can be and still start
 * open. A longer one starts folded, behind its "Completed n/m"
 * count, so the founder card stays a card rather than a list.
 */
export const RESPONSIBILITIES_OPEN_UP_TO = 5;

/** A founder's Responsibilities, counted: how many are done of how many, and whether the list starts open. */
export function businessResponsibilitiesTally(
    responsibilities: readonly { completed: boolean }[]
): { completed: number; total: number; startsOpen: boolean } {
    return {
        completed: responsibilities.filter(entry => entry.completed).length,
        total: responsibilities.length,
        startsOpen: responsibilities.length <= RESPONSIBILITIES_OPEN_UP_TO
    };
}

/**
 * The Responsible tick was turned off on this card (activity, partner /
 * provider or strategy objective): it has no responsible by choice. The
 * default -- the key absent -- is ticked, so everything stored before the
 * tick existed is unchanged. An unticked card is neither flagged as
 * missing a responsible nor given the sole founder by the rule: the rules
 * of businessAutoResponsibleId apply only while the tick is on.
 */
export function responsibleIsOff(card: { responsibleOff?: boolean }): boolean {
    return card.responsibleOff === true;
}

/**
 * The founder responsible BY RULE, or "" where it is a choice.
 *
 * 1. A one-person organisation: its only founder is responsible for
 *    everything, since there is nobody else it could be.
 * 2. An activity whose Performers include exactly one founder (with
 *    or without partners and providers beside them): that founder is
 *    responsible for it too, and it follows the Performers -- change
 *    them so a different single founder remains, and so does this.
 *    With two or more founders among them somebody has to be chosen
 *    (the choice, kept in responsibleId, is never overridden); with
 *    none it is left empty for Review to list.
 *
 * `performerIds` is omitted for what has no performer -- a partner,
 * where only the first rule applies.
 */
export function businessAutoResponsibleId(
    founderIds: readonly string[],
    performerIds?: readonly string[]
): string {

    if (founderIds.length === 1) {
        return founderIds[0];
    }

    const founders = [...new Set(
        (performerIds ?? []).filter(id => id.length > 0 && founderIds.includes(id))
    )];

    if (founders.length === 1) {
        return founders[0];
    }

    return "";

}

/**
 * Who is responsible for a Partnership / Provider: the founder chosen on its
 * card; and, where the organisation has exactly ONE founder, that founder
 * while nothing (or nobody who is still a founder) is chosen -- he is
 * responsible automatically (businessAutoResponsibleId's first rule). Derived
 * from what is stored, never written back: a choice is never overridden, and
 * with several founders, or none, it is what was chosen ("" until then).
 */
export function businessPartnerResponsibleId(
    partner: { responsibleId: string; responsibleOff?: boolean },
    founderIds: readonly string[]
): string {
    if (responsibleIsOff(partner)) {
        return "";
    }
    if (partner.responsibleId.length > 0 && founderIds.includes(partner.responsibleId)) {
        return partner.responsibleId;
    }
    return businessAutoResponsibleId(founderIds) || partner.responsibleId;
}

/**
 * Who is responsible for a Strategy Objective: the founder chosen on its card;
 * and, where the organisation has exactly ONE founder (who has no Responsible
 * field to choose in), that founder while nothing (or nobody who is still a
 * founder) is chosen. Derived from what is stored, never written back.
 */
export function strategyObjectiveOwnerId(
    objective: { ownerId: string; responsibleOff?: boolean },
    founderIds: readonly string[]
): string {
    return businessPartnerResponsibleId(
        { responsibleId: objective.ownerId, responsibleOff: objective.responsibleOff },
        founderIds
    );
}

/** Who is responsible for an activity: by rule, or as chosen. */
export function businessResponsibleId(
    activity: BusinessActivityValue,
    founderIds: readonly string[]
): string {
    if (responsibleIsOff(activity)) {
        return "";
    }
    return businessAutoResponsibleId(founderIds, activity.performerIds) ||
        activity.responsibleId;
}

/**
 * The page's founders, taken from the Identity System's Legal
 * Entity -- 2. Founders & Ownership -- where they are answered.
 *
 * Each named Legal Entity founder becomes one founder here, under
 * that founder's own id, so every Responsibility on this page points
 * at the same person the Legal Entity does and follows a rename
 * there. The name is the Legal Entity's and the Roles are the
 * Founders Profile's (see founderProfiles -- `profile` is that page's
 * saved value); the Salary asked on this page is kept, found by id or, for founders recorded here
 * before this link existed, by name -- and anything that named such
 * a founder by the old id is moved onto the new one.
 *
 * Returns the value unchanged while the Legal Entity names nobody,
 * so what was recorded here is not wiped by an unanswered page.
 */
export function withLegalEntityFounders(
    capability: BusinessCapabilityValue,
    legalFounders: readonly LegalEntityFounderValue[],
    profile?: unknown
): BusinessCapabilityValue {

    const named = legalFounders.filter(founder => founder.name.trim().length > 0);

    if (named.length === 0) {
        return capability;
    }

    const key = (name: string) => name.trim().toLocaleLowerCase();

    /** Old id -> Legal Entity id, for founders matched by name. */
    const moved = new Map<string, string>();

    const taken = new Set<string>();

    const founders = named.map(legal => {

        const match =
            capability.founders.find(
                founder => founder.id === legal.id && !taken.has(founder.id)
            ) ??
            capability.founders.find(
                founder => !taken.has(founder.id) &&
                    key(founder.name) === key(legal.name)
            );

        if (match) {
            taken.add(match.id);
            if (match.id !== legal.id) {
                moved.set(match.id, legal.id);
            }
        }

        return {
            id: legal.id,
            name: legal.name,
            // The Founders Profile's roles, as answered there.
            roles: founderProfileOf(legal, profile).roles.filter(role => role.trim().length > 0),
            salary: match?.salary ?? "",
            hours: match?.hours ?? "",
            deliveryHours: match?.deliveryHours ?? "",
            period: match?.period ?? "",
            deliveryShare: match?.deliveryShare ?? "",
            startDate: match?.startDate ?? "",
            extras: match?.extras ?? {}
        };

    });

    const remap = (id: string) => moved.get(id) ?? id;

    const activity = (entry: BusinessActivityValue): BusinessActivityValue => ({
        ...entry,
        performerIds: entry.performerIds.map(remap),
        responsibleId: remap(entry.responsibleId)
    });

    const partner = (entry: BusinessPartnerValue): BusinessPartnerValue => ({
        ...entry,
        responsibleId: remap(entry.responsibleId)
    });

    if (moved.size === 0) {
        return { ...capability, founders };
    }

    return {
        ...capability,
        founders,
        activities: capability.activities.map(category => ({
            ...category,
            activities: category.activities.map(activity)
        })),
        professionals: capability.professionals.map(partner),
        providers: capability.providers.map(partner),
        offering: {
            ...capability.offering,
            activities: capability.offering.activities.map(activity),
            professionals: capability.offering.professionals.map(partner),
            providers: capability.offering.providers.map(partner)
        }
    };

}

/**
 * Which of this page's two sections are still empty, in page order.
 *
 * What counts as answered:
 *
 * 1. A named founder. Everything else about the organisation's
 *    infrastructure is recorded by somebody, and the founders are
 *    who that is.
 * 2. A named resource, activity or partner linked to an Offering.
 *    The link is the point of the section -- an unlinked row
 *    belongs in Infrastructure.
 */
export function businessCapabilitySectionsEmpty(value: unknown): boolean[] {

    const capability = asBusinessCapabilityValue(value);

    const infrastructureEmpty = !capability.founders.some(
        founder => founder.name.trim().length > 0
    );

    const named = (entry: { name: string; offeringIds: string[] }) =>
        entry.name.trim().length > 0 && entry.offeringIds.length > 0;

    const offeringEmpty = !(
        capability.offering.resources.some(named) ||
        capability.offering.activities.some(named) ||
        capability.offering.professionals.some(named) ||
        capability.offering.providers.some(named)
    );

    return [infrastructureEmpty, offeringEmpty];

}

export const BUSINESS_CAPABILITY_SECTIONS = [
    "Infrastructure",
    "Offering's Capability"
] as const;
