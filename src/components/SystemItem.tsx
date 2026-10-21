import PressRow from "./controls/PressRow.tsx";
import { FrameworkSystem } from "../types/system";
import { PAGE_STATUS_WORDS, type PageStatus } from "../framework/engine/PageStatus";

import "../styles/status-shape.css";

interface SystemItemProps {

    system: FrameworkSystem;

    color?: string;

    /** The System's status for the open Organization, when known. */
    status?: PageStatus | null;

    onClick: () => void;

}

export default function SystemItem({

    system,

    color,

    status,

    onClick

}: SystemItemProps) {

    // role/tabIndex/onKeyDown mirror CapabilityList's own custom
    // control: an <li> carrying only an onClick is reachable by mouse
    // but invisible to the keyboard, which left the System list -- the
    // app's primary navigation -- impossible to operate without a
    // pointer. Enter and Space both activate, matching what a real
    // <button> does; preventDefault stops Space from scrolling the
    // page instead of selecting.
    return (

        <PressRow
            as="li"
            className="system-item"
            style={color ? ({ "--system-color": color } as React.CSSProperties) : undefined}
            onPress={onClick}
        >

            <span className="system-number">

                {String(system.number).padStart(2, "0")}.

            </span>

            {/* The title, and under it the System's status. */}
            <span className="system-name">

                {/* data-reserve feeds the invisible copy that reserves the
                    title's hover width (.hover-width-reserve, global.css). */}
                <span className="system-title hover-width-reserve" data-reserve={system.title}>

                    {system.title}

                </span>

                {/* The same shape the Pages rail draws for a page
                    (status-shape.css), with its word. */}
                {status && (
                    <span className="system-status">
                        <span className="status-shape" data-status={status} aria-hidden="true" />
                        <span className="system-status-word">{PAGE_STATUS_WORDS[status]}</span>
                    </span>
                )}

            </span>

        </PressRow>

    );

}
