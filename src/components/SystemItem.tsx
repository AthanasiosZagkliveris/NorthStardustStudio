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

    return (

        <li
            className="system-item"
            style={color ? ({ "--system-color": color } as React.CSSProperties) : undefined}
            onClick={onClick}
        >

            <span className="system-number">

                {system.number}.

            </span>

            <span className="system-title">

                {system.title}

            </span>

        </li>

    );

}
