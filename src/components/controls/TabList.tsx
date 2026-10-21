import { KeyboardEvent, useRef } from "react";

import "../../styles/tab-list.css";

/**
 * THE TAB LIST: every row of tabs that shows one of a few documents or views at a time (the Business Documents' three) is this one component: tabs along a rule, the chosen one lifted
 * onto the page's ground; the arrow keys move between them, Home and End go to the first and the last.
 */
export default function TabList<T extends string>({ label, tabs, value, onChange, className }: {
    /** What the tabs choose, for a screen reader. */
    label: string;
    tabs: readonly { id: T; label: string }[];
    value: T;
    onChange: (next: T) => void;
    className?: string;
}) {
    const list = useRef<HTMLDivElement | null>(null);

    const move = (event: KeyboardEvent<HTMLDivElement>) => {
        const at = tabs.findIndex(tab => tab.id === value);
        const to = event.key === "ArrowRight" ? (at + 1) % tabs.length : event.key === "ArrowLeft" ? (at - 1 + tabs.length) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
        if (to < 0) {
            return;
        }
        event.preventDefault();
        onChange(tabs[to].id);
        window.requestAnimationFrame(() => list.current?.querySelectorAll<HTMLElement>('[role="tab"]')[to]?.focus());
    };

    return (
        <div ref={list} className={"tab-list" + (className ? " " + className : "")} role="tablist" aria-label={label} onKeyDown={move}>
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={value === tab.id}
                    tabIndex={value === tab.id ? 0 : -1}
                    className={"tab-list-tab" + (value === tab.id ? " tab-list-tab-active" : "")}
                    onClick={() => onChange(tab.id)}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
