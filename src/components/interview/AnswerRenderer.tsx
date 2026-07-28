import { useState } from "react";

import InterviewInput from "./InterviewInput.tsx";
import DynamicTable, { TableColumn, TableRow } from "./DynamicTable.tsx";

import { AnswerDefinition, TableColumnDefinition } from "../../framework/model/index.ts";

import { AnswerType } from "../../framework/enums/AnswerType.ts";
import {
    ChecklistItemValue,
    isDateColumn,
    isMultiEntryColumn,
    visibleTableColumns
} from "../../framework/engine/AnswerUtils.ts";

let checklistItemCounter = 0;

/**
 * Creates a unique id for a newly added Checklist
 * item (used only as a React key / update target,
 * never persisted or exported).
 */
function createChecklistItemId(): string {

    checklistItemCounter += 1;

    return `checklist-item-${Date.now()}-${checklistItemCounter}`;

}

interface AnswerRendererProps {

    definition: AnswerDefinition;

    value: unknown;

    onChange: (value: unknown) => void;

    disabled?: boolean;

}

/**
 * Adapts a resolved Answer Definition's
 * table columns into the shape expected
 * by DynamicTable.
 *
 * The "#" row-index column is rendered
 * automatically by DynamicTable, so any
 * column explicitly titled "#" is dropped
 * here to avoid a duplicate.
 */
function resolveColumnType(
    column: TableColumnDefinition
): TableColumn["type"] {

    if (column.field) {
        return "field";
    }

    if (isDateColumn(column.title)) {
        return "date";
    }

    if (isMultiEntryColumn(column.title)) {
        return "list";
    }

    return "text";

}

function toTableColumns(
    columns: TableColumnDefinition[]
): TableColumn[] {

    return visibleTableColumns(columns)

        .map(column => ({

            id: column.id,

            title: column.title,

            type: resolveColumnType(column),

            field: column.field

        }));

}

export default function AnswerRenderer({

    definition,

    value,

    onChange,

    disabled = false

}: AnswerRendererProps) {

    // Hooks must run unconditionally on every render (regardless
    // of which Answer Structure this Section uses), so the active
    // Fixed Variant Text card is tracked here rather than inside
    // the switch case below.
    const fixedVariantOptions =
        definition.type === AnswerType.FixedVariantText
            ? (definition.variants ?? [])
            : [];

    const [activeVariantId, setActiveVariantId] = useState<string | undefined>(
        fixedVariantOptions[0]?.id
    );

    switch (definition.type) {

        case AnswerType.FreeText:

            return (

                <InterviewInput

                    mode="textarea"

                    value={String(value ?? "")}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        case AnswerType.FixedVariantText: {

            const variants = fixedVariantOptions;

            const values: Record<string, string> =
                value && typeof value === "object" && !Array.isArray(value)
                    ? (value as Record<string, string>)
                    : {};

            const activeVariant =
                variants.find(variant => variant.id === activeVariantId) ??
                variants[0];

            return (

                <div className="answer-variant-cards-wrapper">

                    <div className="answer-variant-cards">

                        {variants.map(variant => {

                            const filled =
                                typeof values[variant.id] === "string" &&
                                values[variant.id].trim().length > 0;

                            const isActive = variant.id === activeVariant?.id;

                            return (

                                <button

                                    type="button"

                                    key={variant.id}

                                    className={
                                        "answer-variant-card" +
                                        (isActive ? " active" : "") +
                                        (filled ? " filled" : "")
                                    }

                                    onClick={() => setActiveVariantId(variant.id)}

                                >

                                    {variant.title}

                                    {filled && (
                                        <span className="answer-variant-card-check">
                                            ✓
                                        </span>
                                    )}

                                </button>

                            );

                        })}

                    </div>

                    {activeVariant && (

                        <div className="answer-variant-editor">

                            <InterviewInput

                                mode="textarea"

                                value={String(values[activeVariant.id] ?? "")}

                                disabled={disabled}

                                onChange={(next) =>

                                    onChange({

                                        ...values,

                                        [activeVariant.id]: next

                                    })

                                }

                            />

                        </div>

                    )}

                </div>

            );

        }

        case AnswerType.Table: {

            const columns = toTableColumns(definition.table?.columns ?? []);

            const rows: TableRow[] = Array.isArray(value) ? value as TableRow[] : [];

            return (

                <DynamicTable

                    columns={columns}

                    value={rows}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        }

        case AnswerType.Checklist: {

            const items: ChecklistItemValue[] =
                Array.isArray(value) ? value as ChecklistItemValue[] : [];

            function updateItems(nextItems: ChecklistItemValue[]) {
                onChange(nextItems);
            }

            function addItem() {

                updateItems([
                    ...items,
                    { id: createChecklistItemId(), text: "", checked: false }
                ]);

            }

            return (

                <div className="answer-checklist">

                    {items.length === 0 && (
                        <div className="answer-checklist-empty">
                            No checklist items yet.
                        </div>
                    )}

                    {items.map(item => (

                        <div key={item.id} className="answer-checklist-row">

                            <input
                                type="checkbox"
                                className="answer-checklist-checkbox"
                                checked={item.checked}
                                disabled={disabled}
                                onChange={() =>

                                    updateItems(items.map(candidate =>
                                        candidate.id === item.id
                                            ? { ...candidate, checked: !candidate.checked }
                                            : candidate
                                    ))

                                }
                            />

                            <input
                                type="text"
                                className="answer-checklist-input"
                                placeholder="Checklist item"
                                disabled={disabled}
                                value={item.text}
                                onChange={(event) =>

                                    updateItems(items.map(candidate =>
                                        candidate.id === item.id
                                            ? { ...candidate, text: event.target.value }
                                            : candidate
                                    ))

                                }
                            />

                            <button
                                type="button"
                                className="answer-checklist-remove"
                                disabled={disabled}
                                onClick={() =>

                                    updateItems(items.filter(candidate => candidate.id !== item.id))

                                }
                            >
                                ×
                            </button>

                        </div>

                    ))}

                    <button
                        type="button"
                        className="answer-checklist-add"
                        disabled={disabled}
                        onClick={addItem}
                    >
                        + Add Item
                    </button>

                </div>

            );

        }

        default:

            return null;

    }

}