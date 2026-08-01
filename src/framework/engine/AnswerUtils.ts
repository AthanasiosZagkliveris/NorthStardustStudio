import { AnswerDefinition, TableColumnDefinition } from "../model/index.ts";

import { AnswerType } from "../enums/AnswerType.ts";

/**
 * Runtime value shapes produced by AnswerRenderer
 * for each Answer Structure.
 */
export type FixedVariantAnswerValue = Record<string, string>;

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
 * `date` (see sortOperationalLogRows), so a row's ARRAY INDEX
 * changes the moment its date does; editing (its Notes) by
 * index alone would silently touch the wrong entry the instant
 * a re-sort moved it.
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
 * kept sorted by `date` (see sortOperationalLogRows), oldest
 * first, blank dates last.
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
 * Sorts Operational Log entries chronologically (oldest
 * first) by their `date` (ISO "YYYY-MM-DD", so a plain string
 * comparison already sorts correctly) -- entries with no date
 * yet sort after every dated entry, in their existing relative
 * order (a stable sort), rather than jumping to the top. Used
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

        return aDate < bDate ? -1 : aDate > bDate ? 1 : 0;

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
export interface ProcessStepSnapshot {
    key: string;
    action: string;
}

/**
 * A single SOP's own field values (and its Steps' own
 * key-matched snapshots), as of the last time the Log was
 * updated for its Process.
 */
export interface ProcessSopSnapshot {
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
export interface ProcessChangeSnapshot {
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
export function captureProcessSnapshot(process: ProcessRecordValue): ProcessChangeSnapshot {

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
export interface ProcessChangeSummary {
    updates: string[];
    additions: string[];
    removals: string[];
}

const PROCESS_FIELD_LABELS: Array<{ key: "name" | "purpose" | "who" | "howOften" | "status"; label: string }> = [
    { key: "name", label: "Name" },
    { key: "purpose", label: "Purpose" },
    { key: "who", label: "Owner" },
    { key: "howOften", label: "How Often" },
    { key: "status", label: "Status" }
];

const SOP_FIELD_LABELS: Array<{ key: "name" | "purpose" | "who" | "howOften"; label: string }> = [
    { key: "name", label: "Name" },
    { key: "purpose", label: "Purpose" },
    { key: "who", label: "Owner" },
    { key: "howOften", label: "How Often" }
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
function todayIsoDate(): string {

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
export interface RolesResponsibilityEntry {
    process: ProcessRecordValue;
    processIndex: number;
    notes: string;
}

/**
 * One Owner's group of Responsibilities, in Process Library
 * order.
 */
export interface RolesResponsibilityGroup {
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
export function isCellFilled(cell: unknown): boolean {

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

        default:
            return true;

    }

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
    | { kind: "paragraph"; text: string }
    | { kind: "subheading"; text: string }
    | { kind: "table"; headers: string[]; rows: string[][] }
    | { kind: "checklist"; items: { text: string; checked: boolean }[] }
    | { kind: "list"; items: { text: string; indent: number }[]; ordered?: boolean };

/**
 * Per-call rendering tweaks for buildAnswerBlocks, read only by
 * the Answer Structures that need them (currently just Process
 * Library) -- every other Structure ignores this parameter
 * entirely, so it stays optional rather than growing every
 * Structure's own signature.
 */
export interface BuildAnswerBlocksOptions {

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
                    metaParts.push(`How often: ${process.howOften.trim()}`);
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
                            sopMetaParts.push(`How often: ${sop.howOften.trim()}`);
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

        default:
            return [];

    }

}
