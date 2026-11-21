import { KeyboardEvent, ReactNode, useRef, useState, useSyncExternalStore } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AddButton from "./controls/AddButton.tsx";
import MenuOption from "./controls/MenuOption.tsx";
import { usePopupDismiss } from "./controls/PopupPanel.tsx";
import { openSearch } from "./SearchButton";
import { openSettings } from "./SettingsButton";
import { FocusIcon } from "./FocusModeButton";
import { openCalendar } from "./OrganizationCalendarPanel";
import { useNotepad } from "./notepad/Notepad";
import { NotepadService } from "../services/NotepadService";
import { FocusModeService } from "../services/FocusModeService";
import { ThemeService, type Theme, type ThemeChoice } from "../services/ThemeService";

import "../styles/conversation.css";
import "../styles/theme-switch.css";

/** The appearances (the reading modes), in the menu's order. */
export const READING_MODES: readonly { value: ThemeChoice; label: string; title: string }[] = [
    { value: "light", label: "Light", title: "Light theme" },
    { value: "sepia", label: "Sepia", title: "Sepia theme: warm paper for long reading" },
    { value: "dark", label: "Dark", title: "Dark theme" },
    { value: "auto", label: "Auto", title: "Follow the system's light or dark setting" }
];

/** Each drawing's box, cut round it so every icon's drawing stands the same height in its 24px; its line one weight (app-header.css, ONE DRAWN HEIGHT, ONE LINE). */
const THEME_ICON_BOX: Record<ThemeChoice, string> = {
    light: "0.43 0.43 15.13 15.13",
    sepia: "1.51 1.74 12.97 12.97",
    dark: "1.39 2.03 12.57 12.57",
    auto: "1.51 1.51 12.97 12.97"
};

/** A sun, an open book for Sepia, a moon, and a half-filled circle for Auto. Drawn in the text colour. */
function ThemeIcon({ value }: { value: ThemeChoice }) {
    return (
        <svg className="header-tool-icon" viewBox={THEME_ICON_BOX[value]} aria-hidden="true" focusable="false">
            {value === "light" && (
                <>
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.4 1.4M11.55 11.55l1.4 1.4M3.05 12.95l1.4-1.4M11.55 4.45l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
            )}
            {value === "sepia" && (
                <path d="M8 4.2C6.6 3.2 4.6 2.8 2 3v9.3c2.6-.2 4.6.2 6 1.2 1.4-1 3.4-1.4 6-1.2V3c-2.6-.2-4.6.2-6 1.2zM8 4.2v9.3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            )}
            {value === "dark" && <path d="M13.5 10.2A6 6 0 0 1 5.8 2.5a6 6 0 1 0 7.7 7.7z" fill="currentColor" />}
            {value === "auto" && (
                <>
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor" />
                </>
            )}
        </svg>
    );
}

/** Each tool's own symbol, as it stood on its header button (the Menu's button takes the sliders the Settings button had; Settings a gear; the Calendar a page of days). */
const ICONS: Record<"menu" | "search" | "notes" | "calendar" | "settings", ReactNode> = {
    menu: (
        <svg className="header-tool-icon" viewBox="2.43 2.43 15.14 15.14" aria-hidden="true" focusable="false">
            <path d="M3 6h9M15 6h2M3 14h2M8 14h9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="13.5" cy="6" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="6.5" cy="14" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    search: (
        <svg className="header-tool-icon" viewBox="2.69 2.69 14.86 14.86" aria-hidden="true" focusable="false">
            <circle cx="8.5" cy="8.5" r="5.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12.5 12.5l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    notes: (
        <svg className="header-tool-icon" viewBox="2.4 1.9 16.22 16.22" aria-hidden="true" focusable="false">
            <path d="M5 2.5h7.5L16 6v11.5H5z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M7.5 9h6M7.5 12h6M7.5 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    calendar: (
        <svg className="header-tool-icon" viewBox="2.25 2.25 15.5 15.5" aria-hidden="true" focusable="false">
            <rect x="3" y="4.5" width="14" height="12.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 8.5h14M7 3v3M13 3v3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    // (A gear: the outline of Feather's "settings" icon, MIT licence.)
    settings: (
        <svg className="header-tool-icon" viewBox="0.25 0.25 23.5 23.5" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
};

/** The choice and the theme it comes to, as one value React can compare ("auto:dark"). */
function themeState(): string {
    const choice = ThemeService.getChoice();
    return choice + ":" + ThemeService.resolve(choice);
}

/**
 * THE MENU (docs/ai/layout-rules.md, section 6, "The Menu"; owner, 2026-11-21 00:56 UTC+2: "I want to place the global settings, Calendar, Notes, Focus,
 * Search … under a common umbrella"; 23:44: "Include the Reading Mode"; his notes of 03:40: "MENU" with the settings symbol, no inner title, "Appearance"
 * a row with a side menu, each tool's symbol on its row): ONE header button, Menu, its icon and word (the icon alone in a narrow header), opening the
 * dropdown card every menu a button opens has (MenuOption rows, usePopupDismiss): Search (Ctrl+K beside it), Notes (the count of notes), Calendar, Focus
 * (an interview page), Settings, then Appearance, whose side menu -- the same card, beside its row -- holds Light, Sepia, Dark and Auto, the chosen one
 * marked; it opens on the pointer, a press, Enter, Space or the right arrow, and the left arrow or Escape closes it. Each tool keeps its own way of working
 * (the search's dialog and Ctrl+K, the Notes' panel, Focus's Exit button, the Global Settings' page, the Calendar's rail on the page it is pressed on). With no Organisation
 * open the menu holds Appearance alone.
 */
export default function ToolsMenu({ organizationOpen, focusable }: { organizationOpen: boolean; focusable: boolean }) {

    const navigate = useNavigate();
    const location = useLocation();
    const { notes } = useNotepad();
    const state = useSyncExternalStore(ThemeService.subscribe, themeState, themeState);
    const [choice, resolved] = state.split(":") as [ThemeChoice, Theme];

    const [open, setOpen] = useState(false);
    const [side, setSide] = useState(false);
    const box = useRef<HTMLDivElement | null>(null);
    const sideMenu = useRef<HTMLDivElement | null>(null);
    usePopupDismiss(open, [box], () => { setOpen(false); setSide(false); });

    /** The Appearance row: where the focus returns from its side menu. */
    const appearanceRow = () => box.current?.querySelector<HTMLButtonElement>(".tools-menu-appearance > button") ?? null;

    /** A row pressed: the menu closes, then the tool opens. */
    const run = (action: () => void) => () => {
        setOpen(false);
        setSide(false);
        action();
    };

    /** The side menu opened; from the keyboard its chosen row takes the focus. */
    const openSide = (focus: boolean) => {
        setSide(true);
        if (focus) {
            window.requestAnimationFrame(() => (sideMenu.current?.querySelector<HTMLElement>("[aria-current=true]") ?? sideMenu.current?.querySelector<HTMLElement>("button"))?.focus());
        }
    };

    const onAppearanceKey = (event: KeyboardEvent<HTMLButtonElement>) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openSide(true);
        }
    };

    const onSideKey = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            setSide(false);
            appearanceRow()?.focus();
            return;
        }
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            const rows = [...(sideMenu.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
            const at = rows.indexOf(document.activeElement as HTMLButtonElement);
            rows[(at + (event.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length]?.focus();
        }
    };

    const row = (icon: ReactNode, label: string) => <><span className="tools-menu-icon">{icon}</span>{label}</>;

    return (
        <div className="theme-switch tools-menu" ref={box}>
            <AddButton className="header-tool" aria-label="Menu" aria-haspopup="menu" aria-expanded={open} onClick={() => { setOpen(current => !current); setSide(false); }}>
                {ICONS.menu}
                <span className="header-tool-word">Menu</span>
            </AddButton>
            {open && (
                <div className="strategy-sort-menu theme-switch-list tools-menu-list" role="menu" aria-label="Menu">
                    {organizationOpen && (
                        <>
                            <MenuOption aria-label="Search" aria-keyshortcuts="Control+K Meta+K" onClick={run(openSearch)}>{row(ICONS.search, "Search")}<span className="tools-menu-hint">Ctrl+K</span></MenuOption>
                            <MenuOption aria-label={"Notes, " + notes.length + (notes.length === 1 ? " note" : " notes")} onClick={run(() => NotepadService.toggle())}>
                                {row(ICONS.notes, "Notes")}{notes.length > 0 && <span className="tools-menu-hint">{notes.length}</span>}
                            </MenuOption>
                            <MenuOption aria-label="Calendar" onClick={run(openCalendar)}>{row(ICONS.calendar, "Calendar")}</MenuOption>
                            {focusable && <MenuOption aria-label="Focus" onClick={run(() => FocusModeService.set(true))}>{row(<FocusIcon />, "Focus")}</MenuOption>}
                            <MenuOption aria-label="Settings" chosen={location.pathname === "/settings"} onClick={run(() => openSettings(navigate, location))}>{row(ICONS.settings, "Settings")}</MenuOption>
                        </>
                    )}
                    <div className="tools-menu-appearance" onMouseEnter={() => openSide(false)} onMouseLeave={() => setSide(false)}>
                        <MenuOption
                            aria-label="Appearance"
                            aria-haspopup="menu"
                            aria-expanded={side}
                            onClick={() => (side ? setSide(false) : openSide(false))}
                            onKeyDown={onAppearanceKey}
                        >
                            {/* (Auto with the icon of what it comes to now.) */}
                            {row(<ThemeIcon value={choice === "auto" ? resolved : choice} />, "Appearance")}
                            <span className="tools-menu-hint" aria-hidden="true">‹</span>
                        </MenuOption>
                        {side && (
                            <div ref={sideMenu} className="strategy-sort-menu tools-menu-side" role="menu" aria-label="Appearance" onKeyDown={onSideKey}>
                                {READING_MODES.map(mode => (
                                    <MenuOption key={mode.value} aria-label={mode.label} marked chosen={mode.value === choice} title={mode.title} onClick={run(() => ThemeService.setChoice(mode.value))}>
                                        {row(<ThemeIcon value={mode.value} />, mode.label)}
                                    </MenuOption>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

}
