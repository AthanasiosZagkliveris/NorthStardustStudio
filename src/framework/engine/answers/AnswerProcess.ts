/**
 * THE PROCESS LIBRARY AND THE OPERATIONAL LOG: record shapes, display ids, blank records, change snapshots and the log entries a change writes.
 * Split out of AnswerUtils.ts (still importable from there).
 */


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

export let processKeyCounter = 0;

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

export let processStepKeyCounter = 0;

/**
 * Creates a fresh, stable `ProcessStepValue.key` -- same
 * idiom as createProcessKey above.
 */
export function createProcessStepKey(): string {

    processStepKeyCounter += 1;

    return `step-${Date.now()}-${processStepKeyCounter}`;

}

export let processSopKeyCounter = 0;

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

export let operationalLogRowKeyCounter = 0;

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

export const PROCESS_FIELD_LABELS: Array<{ key: "name" | "purpose" | "who" | "howOften" | "status"; label: string }> = [
    { key: "name", label: "Name" },
    { key: "purpose", label: "Purpose" },
    { key: "who", label: "Owner" },
    { key: "howOften", label: "Frequency" },
    { key: "status", label: "Status" }
];

export const SOP_FIELD_LABELS: Array<{ key: "name" | "purpose" | "who" | "howOften"; label: string }> = [
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
