interface InterviewProgressProps {

    current: number;

    total: number;

}

export default function InterviewProgress({

    current,

    total

}: InterviewProgressProps) {

    const percentage =

        total === 0

            ? 0

            : (current / total) * 100;

    return (

        <div className="interview-progress">

            <div

                className="interview-progress-bar"

                style={{

                    width: `${percentage}%`

                }}

            />

        </div>

    );

}