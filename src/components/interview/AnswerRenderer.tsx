import InterviewInput from "./InterviewInput.tsx";
import DynamicTable from "./DynamicTable";
import FieldRenderer from "./FieldRenderer";

export type AnswerType =
    | "textarea"
    | "input"
    | "select"
    | "table"
    | "field";

export interface AnswerDefinition {
    type: AnswerType;

    placeholder?: string;

    rows?: number;

    options?: string[];

    field?: string;

    columns?: string[];
}

interface AnswerRendererProps {

    definition: AnswerDefinition;

    value: unknown;

    onChange: (value: unknown) => void;

    disabled?: boolean;

}

export default function AnswerRenderer({

    definition,

    value,

    onChange,

    disabled = false

}: AnswerRendererProps) {

    switch (definition.type) {

        case "input":

            return (

                <InterviewInput

                    mode="input"

                    value={String(value ?? "")}

                    placeholder={definition.placeholder}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        case "select":

            return (

                <InterviewInput

                    mode="select"

                    value={String(value ?? "")}

                    placeholder={definition.placeholder}

                    options={definition.options ?? []}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        case "field":

            return (

                <FieldRenderer

                    field={definition.field ?? ""}

                    value={value}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        case "table":

            return (

                <DynamicTable

                    columns={definition.columns ?? []}

                    value={Array.isArray(value) ? value : []}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        case "textarea":

        default:

            return (

                <InterviewInput

                    mode="textarea"

                    value={String(value ?? "")}

                    rows={definition.rows ?? 10}

                    placeholder={definition.placeholder}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

    }

}