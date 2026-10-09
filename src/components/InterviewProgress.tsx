/**
 * THE ONE SWITCH for the progress line (the thin bar under the
 * Hide Help button on every System page). Hidden for now: the pages
 * are listed in the side rails, so the line adds nothing. Flip this to
 * true to restore it -- the markup and the logic below are untouched.
 */
export const SHOW_PROGRESS_LINE = false;

interface InterviewProgressProps {

    current: number;

    total: number;

}

export default function InterviewProgress({

    current,

    total

}: InterviewProgressProps) {

    if (!SHOW_PROGRESS_LINE) {

        return null;

    }

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
