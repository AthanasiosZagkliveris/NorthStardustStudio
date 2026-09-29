import logo from "../assets/NORTH STARDUST Organization Framework.svg";

import SaveStatus from "./SaveStatus";
import { NotepadButton, NotepadPanel, NotepadPicker } from "./notepad/Notepad";
import ThemeSwitch from "./ThemeSwitch";

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
}

export default function AppHeader({ organizationName }: AppHeaderProps) {

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

            {/* The person's own notes: wherever an Organization is open. */}
            {organizationName && <NotepadButton />}
            {organizationName && <NotepadPanel />}
            {organizationName && <NotepadPicker />}

            {organizationName && (
                <h1 className="app-header-organization-name" title={organizationName}>
                    {organizationName}
                </h1>
            )}

        </header>

    );

}
