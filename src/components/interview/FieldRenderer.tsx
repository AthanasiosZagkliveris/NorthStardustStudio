import InterviewInput from "./InterviewInput.tsx";

import {
    FieldDefinition,
} from "../../framework/model/index.ts";

interface FieldRendererProps {

    field: FieldDefinition;

    value: unknown;

    onChange: (value: unknown) => void;

    disabled?: boolean;

}

export default function FieldRenderer({

    field,

    value,

    onChange,

    disabled = false

}: FieldRendererProps) {

    switch (field.type) {

        case "select":

            return (

                <InterviewInput

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

                <input

                    type="date"

                    className="interview-input"

                    value={String(value ?? "")}

                    disabled={disabled}

                    onChange={(event) =>
                        onChange(event.target.value)
                    }

                />

            );

        default:

            return null;

    }

}