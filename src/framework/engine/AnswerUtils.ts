import { AnswerDefinition, TableColumnDefinition } from "../model/index.ts";
import { AnswerType } from "../enums/AnswerType.ts";
import { financialFoundationSectionsEmpty, financialSustainabilitySectionsEmpty } from "./FinancialModel.ts";
import { ProcessRecordValue, createBlankProcess } from "./AnswerProcess.ts";
import { asBrandInventoryValue, asBrandStyleValue, brandInventorySectionsEmpty, brandStyleSectionsEmpty } from "./AnswerBrand.ts";
import { asLegalEntityValue, legalEntitySectionsEmpty } from "./AnswerLegal.ts";
import { asFoundersProfileValue } from "./AnswerFounders.ts";
import { asStrategicPeriodValue, asStrategyFoundationValue, strategyFoundationSectionsEmpty } from "./AnswerStrategy.ts";
import { businessEngagementSectionsEmpty, businessFoundationSubsectionsEmpty } from "./AnswerBusinessFoundation.ts";
import { businessCapabilitySectionsEmpty } from "./AnswerBusinessCapability.ts";

// The answer values are split by domain; everything is still importable from here.
export * from "./AnswerProcess.ts";
export * from "./AnswerBrand.ts";
export * from "./AnswerExport.ts";
export * from "./AnswerStrategy.ts";
export * from "./AnswerLegal.ts";
export * from "./AnswerFounders.ts";
export * from "./AnswerBusinessFoundation.ts";
export * from "./AnswerBusinessCapability.ts";

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
