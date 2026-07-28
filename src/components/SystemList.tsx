import "../styles/system-list.css";

import SystemItem from "./SystemItem";

import { FrameworkSystem } from "../types/system";

interface SystemListProps {

    systems: FrameworkSystem[];

    color?: string;

    onSystemClick: (system: FrameworkSystem) => void;

}

export default function SystemList({

    systems,

    color,

    onSystemClick

}: SystemListProps) {

    return (

        <ul className="system-list">

            {systems.map(system => (

                <SystemItem

                    key={system.id}

                    system={system}

                    color={color}

                    onClick={() => onSystemClick(system)}

                />

            ))}

        </ul>

    );

}
