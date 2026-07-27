import "../styles/system-list.css";

import SystemItem from "./SystemItem";

import { FrameworkSystem } from "../types/system";

interface SystemListProps {

    systems: FrameworkSystem[];

    onSystemClick: (system: FrameworkSystem) => void;

}

export default function SystemList({

    systems,

    onSystemClick

}: SystemListProps) {

    return (

        <ul className="system-list">

            {systems.map(system => (

                <SystemItem

                    key={system.id}

                    system={system}

                    onClick={() => onSystemClick(system)}

                />

            ))}

        </ul>

    );

}