import { FrameworkSystem } from "../types/system";

interface SystemItemProps {

    system: FrameworkSystem;

    onClick: () => void;

}

export default function SystemItem({

    system,

    onClick

}: SystemItemProps) {

    return (

        <li
            className="system-item"
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