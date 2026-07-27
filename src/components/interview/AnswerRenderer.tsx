import InterviewInput from "./InterviewInput.tsx";
import DynamicTable, { TableColumn, TableRow } from "./DynamicTable.tsx";

import { AnswerDefinition, TableColumnDefinition } from "../../framework/model/index.ts";

import { AnswerType } from "../../framework/enums/AnswerType.ts";
import { visibleTableColumns } from "../../framework/engine/AnswerUtils.ts";

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
function toTableColumns(
    columns: TableColumnDefinition[]
): TableColumn[] {

    return visibleTableColumns(columns)

        .map(column => ({

            id: column.id,

            title: column.title,

            type: column.field ? "field" : "text",

            field: column.field

        }));

}

export default function AnswerRenderer({

    definition,

    value,

    onChange,

    disabled = false

}: AnswerRendererProps) {

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

            const variants = definition.variants ?? [];

            const values: Record<string, string> =
                value && typeof value === "object" && !Array.isArray(value)
                    ? (value as Record<string, string>)
                    : {};

            return (

                <div className="answer-variants">

                    {variants.map(variant => (

                        <div key={variant.id} className="answer-variant">

                            <div className="answer-variant-title">

                                {variant.title}

                            </div>

                            <InterviewInput

                                mode="textarea"

                                value={String(values[variant.id] ?? "")}

                                disabled={disabled}

                                onChange={(next) =>

                                    onChange({

                                        ...values,

                                        [variant.id]: next

                                    })

                                }

                            />

                        </div>

                    ))}

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

        default:

            return null;

    }

}