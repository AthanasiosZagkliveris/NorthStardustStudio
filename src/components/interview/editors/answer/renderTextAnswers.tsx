/**
 * THE TEXT ANSWERS: free text, fixed variants, the T-layout and the table. One function per Answer Structure, each given the scope of the renderer (scope.ts). Split out of AnswerRenderer.tsx.
 */
import ChoiceCard from "../../../controls/ChoiceCard.tsx";
import TextField from "../../../controls/TextField.tsx";
import InterviewInput from "../../fields/InterviewInput.tsx";
import DynamicTable, { TableRow } from "../../fields/DynamicTable.tsx";

import type { AnswerScope } from "./scope.ts";

export function renderFreeText(scope: AnswerScope) {

    const { value, onChange, disabled, ariaLabel, autoGrow } = scope;

    return (

        <InterviewInput

            mode="textarea"

            ariaLabel={ariaLabel}

            value={String(value ?? "")}

            disabled={disabled}

            onChange={onChange}

            autoGrow={autoGrow}

        />

    );

}

export function renderFixedVariantText(scope: AnswerScope) {

    const { value, onChange, disabled, fixedVariantOptions, activeVariantId, setActiveVariantId, variantCardsScrollRef } = scope;

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

            <div className="answer-variant-cards" ref={variantCardsScrollRef}>

                {variants.map(variant => {

                    const filled =
                        typeof values[variant.id] === "string" &&
                        values[variant.id].trim().length > 0;

                    const isActive = variant.id === activeVariant?.id;

                    return (

                        <ChoiceCard key={variant.id} active={isActive} filled={filled} onClick={() => setActiveVariantId(variant.id)}>{variant.title}</ChoiceCard>

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

export function renderTLayoutText(scope: AnswerScope) {

    const { definition, value, onChange, disabled } = scope;

    // Same value shape as Fixed Variant Text (see
    // AnswerType.TLayoutText's own doc comment) -- just
    // rendered as one always-all-visible card instead of
    // tab-switched panels. The 1st declared variant spans
    // the top, the 2nd and 3rd sit side by side underneath
    // it. A Section that (mis)declares a variant count other
    // than 3 still renders sensibly: 1 variant is just the
    // top field alone, 2 is top + a single full-width bottom
    // field (no vertical divider, nothing to divide), and
    // anything past the 3rd is simply not shown, since this
    // Structure only has room for 3 -- a 4th field belongs
    // in a Fixed Variant Text or Card List Section instead.
    const variants = definition.variants ?? [];

    const values: Record<string, string> =
        value && typeof value === "object" && !Array.isArray(value)
            ? (value as Record<string, string>)
            : {};

    const [topVariant, leftVariant, rightVariant] = variants;

    function updateVariant(variantId: string, text: string) {
        onChange({ ...values, [variantId]: text });
    }

    return (

        <div className="handbook-t-card">

            {topVariant && (

                <div className="handbook-t-card-top">

                    <div className="handbook-t-card-label">{topVariant.title}</div>

                    <TextField
                        className="handbook-t-card-textarea handbook-t-card-textarea-top"
                        placeholder={`Write ${topVariant.title.toLowerCase()}...`}
                        disabled={disabled}
                        value={values[topVariant.id] ?? ""}
                        onChange={(next) => updateVariant(topVariant.id, next)}
                    />

                </div>

            )}

            {(leftVariant || rightVariant) && (

                <>

                    <div className="handbook-t-card-divider-horizontal" />

                    <div className="handbook-t-card-bottom">

                        {leftVariant && (

                            <div className="handbook-t-card-column">

                                <div className="handbook-t-card-label">{leftVariant.title}</div>

                                <TextField
                                    className="handbook-t-card-textarea"
                                    placeholder={`Write ${leftVariant.title.toLowerCase()}...`}
                                    disabled={disabled}
                                    value={values[leftVariant.id] ?? ""}
                                    onChange={(next) => updateVariant(leftVariant.id, next)}
                                />

                            </div>

                        )}

                        {leftVariant && rightVariant && (
                            <div className="handbook-t-card-divider-vertical" />
                        )}

                        {rightVariant && (

                            <div className="handbook-t-card-column">

                                <div className="handbook-t-card-label">{rightVariant.title}</div>

                                <TextField
                                    className="handbook-t-card-textarea"
                                    placeholder={`Write ${rightVariant.title.toLowerCase()}...`}
                                    disabled={disabled}
                                    value={values[rightVariant.id] ?? ""}
                                    onChange={(next) => updateVariant(rightVariant.id, next)}
                                />

                            </div>

                        )}

                    </div>

                </>

            )}

        </div>

    );

}

export function renderTable(scope: AnswerScope) {

    const { definition, value, onChange, disabled, rowSelection, tableColumns } = scope;

    const rows: TableRow[] = Array.isArray(value) ? value as TableRow[] : [];

    return (

        <DynamicTable

            columns={tableColumns}

            value={rows}

            disabled={disabled}

            onChange={onChange}

            rowNumberLabel={definition.table?.rowNumberLabel}

            rowSelection={rowSelection}

        />

    );

}

