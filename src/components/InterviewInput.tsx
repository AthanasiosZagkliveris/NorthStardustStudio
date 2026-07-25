interface InterviewInputProps {

    value: string;

    onChange: (value: string) => void;

}

export default function InterviewInput({

    value,

    onChange

}: InterviewInputProps) {

    return (

        <textarea

            className="interview-input"

            value={value}

            rows={12}

            onChange={(event) =>

                onChange(event.target.value)

            }

        />

    );

}