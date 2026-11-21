import { useRef, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AddButton from "./controls/AddButton.tsx";
import MenuOption from "./controls/MenuOption.tsx";
import { usePopupDismiss } from "./controls/PopupPanel.tsx";
import { openSearch } from "./SearchButton";
import { openSettings } from "./SettingsButton";
import { useNotepad } from "./notepad/Notepad";
import { NotepadService } from "../services/NotepadService";
import { FocusModeService } from "../services/FocusModeService";
import { ThemeService, type ThemeChoice } from "../services/ThemeService";

import "../styles/capability-overview.css";
import "../styles/conversation.css";
import "../styles/theme-switch.css";

/** The reading modes, in the menu's order. */
export const READING_MODES: readonly { value: ThemeChoice; label: string; title: string }[] = [
    { value: "light", label: "Light", title: "Light theme" },
    { value: "sepia", label: "Sepia", title: "Sepia theme: warm paper for long reading" },
    { value: "dark", label: "Dark", title: "Dark theme" },
    { value: "auto", label: "Auto", title: "Follow the system's light or dark setting" }
];

/**
 * THE TOOLS MENU (docs/ai/layout-rules.md, section 6, "The Tools menu"; owner, 2026-11-21 00:56 UTC+2: "I want to place the global settings, Calendar, Notes, Focus,
 * Search … under a common umbrella"; 23:44: "A Tools - Include the Reading Mode"): ONE header button, its icon and word (the icon alone in a narrow header), opening
 * one menu -- the Export menu's (MenuOption rows, usePopupDismiss) in the Inventory panel's titled sections: under **Tools**, Search (Ctrl+K beside it), Notes (the
 * count of notes), Calendar, Focus (on an interview page) and Settings; under **Reading mode**, Light, Sepia, Dark and Auto, the chosen one marked. Each tool keeps
 * its own way of working (the search's dialog and Ctrl+K, the Notes' panel, Focus's Exit button, the Global Settings' page, System Selection's Calendar tab).
 * With no Organisation open (the Organisations screen) the menu holds the reading modes only.
 */
export default function ToolsMenu({ organizationOpen, focusable }: { organizationOpen: boolean; focusable: boolean }) {

    const navigate = useNavigate();
    const location = useLocation();
    const { notes } = useNotepad();
    const choice = useSyncExternalStore(ThemeService.subscribe, ThemeService.getChoice, ThemeService.getChoice);

    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement | null>(null);
    usePopupDismiss(open, [box], () => setOpen(false));

    /** A row pressed: the menu closes, then the tool opens. */
    const run = (action: () => void) => () => {
        setOpen(false);
        action();
    };

    return (
        <div className="theme-switch tools-menu" ref={box}>
            <AddButton className="header-tool" aria-label="Tools" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(current => !current)}>
                {/* Four small squares: the tools together. */}
                <svg className="header-tool-icon" viewBox="2.5 2.5 15 15" aria-hidden="true">
                    <rect x="3.25" y="3.25" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="11.25" y="3.25" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="3.25" y="11.25" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <rect x="11.25" y="11.25" width="5.5" height="5.5" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="header-tool-word">Tools</span>
            </AddButton>
            {open && (
                <div className="strategy-sort-menu theme-switch-list tools-menu-list" role="menu" aria-label="Tools">
                    {organizationOpen && (
                        <div className="tools-menu-section" role="group" aria-label="Tools">
                            <p className="capability-overview-menu-section-title" aria-hidden="true">Tools</p>
                            <MenuOption marked aria-keyshortcuts="Control+K Meta+K" onClick={run(openSearch)}>Search<span className="tools-menu-hint">Ctrl+K</span></MenuOption>
                            <MenuOption marked aria-label={"Notes, " + notes.length + (notes.length === 1 ? " note" : " notes")} onClick={run(() => NotepadService.toggle())}>
                                Notes{notes.length > 0 && <span className="tools-menu-hint">{notes.length}</span>}
                            </MenuOption>
                            <MenuOption marked onClick={run(() => navigate("/assistant", { state: { ...(location.pathname === "/assistant" && location.state && typeof location.state === "object" ? location.state : {}), calendar: Date.now() } }))}>Calendar</MenuOption>
                            {focusable && <MenuOption marked onClick={run(() => FocusModeService.set(true))}>Focus</MenuOption>}
                            <MenuOption marked chosen={location.pathname === "/settings"} onClick={run(() => openSettings(navigate, location))}>Settings</MenuOption>
                        </div>
                    )}
                    <div className="tools-menu-section" role="group" aria-label="Reading mode">
                        <p className="capability-overview-menu-section-title" aria-hidden="true">Reading mode</p>
                        {READING_MODES.map(mode => (
                            <MenuOption key={mode.value} marked chosen={mode.value === choice} title={mode.title} onClick={run(() => ThemeService.setChoice(mode.value))}>{mode.label}</MenuOption>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

}
