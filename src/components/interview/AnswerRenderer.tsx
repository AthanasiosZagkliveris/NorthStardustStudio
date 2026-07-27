import InterviewInput from "./InterviewInput.tsx";
import DynamicTable from "./DynamicTable.tsx";

import { AnswerDefinition } from "../../framework/model/index.ts";

import { AnswerType } from "../../framework/enums/AnswerType.ts";

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

        case AnswerType.FreeText:

            return (

                <InterviewInput

                    mode="textarea"

                    value={String(value ?? "")}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        case AnswerType.FixedVariantText:

            return (

                <InterviewInput

                    mode="fixed-variant"

                    value={value}

                    variants={definition.variants ?? []}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        case AnswerType.Table:

            return (

                <DynamicTable

                    columns={definition.table?.columns ?? []}

                    value={Array.isArray(value) ? value : []}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        default:

            return null;

    }

}