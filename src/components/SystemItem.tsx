import { FrameworkSystem } from "../types/system";

interface SystemItemProps {

    system: FrameworkSystem;

    color?: string;

    onClick: () => void;

}

export default function SystemItem({

    system,

    color,

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

        <li
            className="system-item"
            style={color ? ({ "--system-color": color } as React.CSSProperties) : undefined}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onClick();
                }
            }}
        >

            <span className="system-number">

                {String(system.number).padStart(2, "0")}.

            </span>

            <span className="system-title">

                {system.title}

            </span>

        </li>

    );

}
