import logo from "../assets/NORTH STARDUST Organization Framework.svg";

import SaveStatus from "./SaveStatus";
import { NotepadButton, NotepadPanel, NotepadPicker } from "./notepad/Notepad";
import FocusModeButton from "./FocusModeButton";
import ReviewButton from "./ReviewButton";
import SearchButton from "./SearchButton";
import SettingsButton from "./SettingsButton";
import ThemeSwitch from "./ThemeSwitch";
import UndoToast from "./UndoToast";

import "../styles/app-header.css";

interface AppHeaderProps {
    /**
     * The active Organization's name -- shown on the
     * opposite side of the header from the logo, on every
     * page that has one selected (System Selection,
     * Introduction, Interview). Omitted entirely (e.g. on
     * the Landing page, where there may be several
     * Organizations and none is "the" one yet) the header
     * renders exactly as before, logo only.
     */
    organizationName?: string;
    /** An interview page: the Focus tool (FocusModeButton) is offered. */
    focusable?: boolean;
    /** The landing page: a Reload tool beside the theme switch (the app's view is drawn again; the data is kept: it is on disk). */
    reloadable?: boolean;
    /** Called before the reload (the Landing page refreshes the saved examples from the current example files). */
    onReload?: () => void;
}

export default function AppHeader({ organizationName, focusable = false, reloadable = false, onReload }: AppHeaderProps) {

    return (

        <header className="app-header">

            <img
                src={logo}
                alt="North Stardust Organization Framework"
                className="app-logo"
            />

            {/* Whether the open Organization's edits are saved --
                only where one is open. */}
            {organizationName && <SaveStatus />}

            <ThemeSwitch />

            {reloadable && (
                <button
                    type="button"
                    className="header-tool app-reload"
                    aria-label="Reload the app and refresh the examples"
                    onClick={() => { onReload?.(); window.location.reload(); }}
                >
                    <svg className="header-tool-icon" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M16 10a6 6 0 1 1-2-4.5M16 3v3.5h-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="header-tool-word">Reload</span>
                </button>
            )}

            {/* Focus mode: on an interview page. */}
            {organizationName && focusable && <FocusModeButton />}

            {/* Search (Ctrl+K), and the person's own notes: wherever an Organization is open. */}
            {organizationName && <SearchButton />}
            {organizationName && <NotepadButton />}
            {organizationName && <ReviewButton />}
            {organizationName && <SettingsButton />}
            {organizationName && <NotepadPanel />}
            {organizationName && <NotepadPicker />}

            {/* Undo after a removal: one toast for the whole app. */}
            {organizationName && <UndoToast />}

            {organizationName && (
                <h1 className="app-header-organization-name" title={organizationName}>
                    {organizationName}
                </h1>
            )}

        </header>

    );

}
