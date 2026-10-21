import { ButtonHTMLAttributes, ReactNode } from "react";

import "../../styles/suggestion-option.css";

/**
 * THE SUGGESTION: a row of a short list that is pressed to take it (the places a note can link to, the typical costs of a channel, the actions to link) is this one component: its
 * words (`label`) and, under them, where it is (`place`) where there is one. The list is the `notepad-suggestions` list that holds it.
 */
export default function SuggestionOption({ label, place, className, ...rest }: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & {
    label: ReactNode;
    place?: ReactNode;
}) {
    return (
        <button type="button" {...rest} className={"notepad-suggestion" + (className ? " " + className : "")}>
            <span className="notepad-suggestion-label">{label}</span>
            {place && <span className="notepad-suggestion-place">{place}</span>}
        </button>
    );
}
