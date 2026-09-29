import "../styles/system-list.css";

import SystemItem from "./SystemItem";

import { FrameworkSystem } from "../types/system";
import type { PageStatus } from "../framework/engine/PageStatus";

interface SystemListProps {

    systems: FrameworkSystem[];

    color?: string;

    /** Each System's status, by System number (see SystemItem). */
    statuses?: Readonly<Record<number, PageStatus | null>>;

    onSystemClick: (system: FrameworkSystem) => void;

}

export default function SystemList({

    systems,

    color,

    statuses,

    onSystemClick

}: SystemListProps) {

    return (

        <ul className="system-list">

            {systems.map(system => (

                <SystemItem

                    key={system.id}

                    system={system}

                    color={color}

                    status={statuses?.[system.number]}

                    onClick={() => onSystemClick(system)}

                />

            ))}

        </ul>

    );

}
