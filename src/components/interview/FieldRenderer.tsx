import { useEffect, useState } from "react";

import InterviewInput from "./InterviewInput.tsx";
import DateCellInput from "./DateCellInput.tsx";

import {
    FieldDefinition,
} from "../../framework/model/index.ts";

interface FieldRendererProps {

    field: FieldDefinition;

    value: unknown;

    onChange: (value: unknown) => void;

    disabled?: boolean;


    /** Accessible name for the rendered control -- see
     *  InterviewInput.ariaLabel. Sourced from the Table column
     *  title by DynamicTable. */
    ariaLabel?: string;

}

/**
 * The extra dropdown choice a `field.allowCustom` Field (currently
 * just the Platform Field) offers alongside its own preset
 * `options` -- picking it reveals a free-text input underneath
 * instead of storing the literal word "Other" (see
 * SelectFieldWithCustom below).
 */
const OTHER_OPTION_LABEL = "Other";

/**
 * Renders a `field.allowCustom` select Field: the same dropdown as
 * a plain select Field, PLUS one extra "Other" choice that reveals
 * a free-text input in its place -- "Give also the option to the
 * user to type any extra" (Platform Field). Kept as its own
 * component (rather than a branch inside FieldRenderer itself)
 * specifically so its hooks stay unconditional -- FieldRenderer's
 * own `switch` on `field.type` has no hooks of its own, and
 * conditionally calling hooks only for this one case would violate
 * the Rules of Hooks.
 *
 * Whether the "Other" text input is showing is tracked as its own
 * piece of state (`customMode`), NOT derived purely from `value`:
 * picking "Other" clears the stored value to "" so the user starts
 * from a blank field, and an empty string can't tell "Other" apart
 * from "nothing chosen yet" on its own. `customMode` self-corrects
 * from a non-empty `value` (covers a pre-existing custom value on
 * mount, and any value changed by something other than this
 * control) but is left alone while `value` is empty, so it doesn't
 * flip back off the instant "Other" clears the field.
 */
function SelectFieldWithCustom({

    field,

    value,

    onChange,

    disabled = false,

    ariaLabel

}: FieldRendererProps) {

    const presetLabels = (field.options ?? []).map(option => option.label);

    const currentValue = String(value ?? "");

    const [customMode, setCustomMode] = useState(
        () => currentValue.length > 0 && !presetLabels.includes(currentValue)
    );

    useEffect(() => {

        if (currentValue.length === 0) {
            return;
        }

        setCustomMode(!presetLabels.includes(currentValue));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentValue]);

    return (

        <div className="field-select-with-custom">

            <InterviewInput

                ariaLabel={ariaLabel}

                mode="select"

                value={customMode ? OTHER_OPTION_LABEL : currentValue}

                placeholder={field.placeholder}

                disabled={disabled}

                options={[...presetLabels, OTHER_OPTION_LABEL]}

                onChange={(selected) => {

                    if (selected === OTHER_OPTION_LABEL) {
                        setCustomMode(true);
                        onChange("");
                    } else {
                        setCustomMode(false);
                        onChange(selected);
                    }

                }}

            />

            {customMode && (

                <InterviewInput

                ariaLabel={ariaLabel}

                    mode="input"

                    className="interview-input field-select-with-custom-input"

                    value={currentValue}

                    placeholder="Type a custom value"

                    disabled={disabled}

                    onChange={(text) => onChange(text)}

                />

            )}

        </div>

    );

}

export default function FieldRenderer({

    field,

    value,

    onChange,

    disabled = false,

    ariaLabel

}: FieldRendererProps) {

    switch (field.type) {

        case "select":

            if (field.allowCustom) {

                return (

                    <SelectFieldWithCustom

                        field={field}

                        value={value}

                        onChange={onChange}

                        disabled={disabled}

                        ariaLabel={ariaLabel}

                    />

                );

            }

            return (

                <InterviewInput

                ariaLabel={ariaLabel}

                    mode="select"

                    value={String(value ?? "")}

                    placeholder={field.placeholder}

                    disabled={disabled}

                    options={
                        (field.options ?? []).map(
                            option => option.label
                        )
                    }

                    onChange={(value) => onChange(value)}

                />

            );

        case "input":

            return (

                <InterviewInput

                ariaLabel={ariaLabel}

                    mode="input"

                    value={String(value ?? "")}

                    placeholder={field.placeholder}

                    disabled={disabled}

                    onChange={(value) => onChange(value)}

                />

            );

        case "textarea":

            return (

                <InterviewInput

                ariaLabel={ariaLabel}

                    mode="textarea"

                    value={String(value ?? "")}

                    rows={6}

                    placeholder={field.placeholder}

                    disabled={disabled}

                    onChange={(value) => onChange(value)}

                />

            );

        case "number":

            return (

                <input

                    type="number"

                    className="interview-input"

                    value={String(value ?? "")}

                    disabled={disabled}

                    placeholder={field.placeholder}

                    onChange={(event) =>
                        onChange(event.target.value)
                    }

                />

            );

        case "date":

            return (

                <DateCellInput ariaLabel="Date" value={String(value ?? "")} disabled={disabled} onChange={(next) => onChange(next)} />

            );

        default:

            return null;

    }

}