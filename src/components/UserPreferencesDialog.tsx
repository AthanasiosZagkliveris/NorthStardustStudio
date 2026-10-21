import { useState } from "react";

import AddButton from "./controls/AddButton.tsx";
import SegmentedToggle from "./controls/SegmentedToggle.tsx";
import { DateFormat, PreferencesService } from "../services/PreferencesService.ts";

import "../styles/system-confirmation.css";

interface UserPreferencesDialogProps {

    open: boolean;

    onClose: () => void;

}

/**
 * First-run Preferences popup -- shown once, right after someone
 * types the App's single User Name for the very first time and
 * presses Enter (see Landing.tsx). Currently holds just the one
 * preference the app has today (Date presentation), but is framed
 * generically ("Your Preferences") since more may join it later.
 * Every preference set here can also be changed afterward from the
 * Framework Navigator rail's own Calendar flyout (System Selection
 * page) -- this popup is only the first-run prompt, not the only
 * way in.
 */
export default function UserPreferencesDialog({

    open,

    onClose

}: UserPreferencesDialogProps) {

    const [dateFormat, setDateFormatChoice] = useState<DateFormat>(() => PreferencesService.getDateFormat());

    if (!open) {
        return null;
    }

    function save() {

        PreferencesService.setDateFormat(dateFormat);

        onClose();

    }

    return (

        // Clicking the backdrop dismisses without saving -- the same
        // as leaving the current toggle selection un-applied, since
        // only the "Save" button itself calls PreferencesService.
        // setDateFormat. The dialog box stops the click from
        // reaching here when it landed inside it instead.
        <div className="confirmation-overlay" onClick={onClose}>

            <div className="confirmation-dialog user-preferences-dialog" onClick={(event) => event.stopPropagation()}>

                <h2 className="confirmation-title">
                    Welcome! Set your preferences
                </h2>

                <p className="confirmation-question">
                    You can change any of these later from the Framework
                    Navigator on the System Selection page.
                </p>

                <div className="user-preferences-field">

                    <span className="user-preferences-label">Date presentation</span>

                    <SegmentedToggle
                        label="Date presentation"
                        options={[{ id: "US", label: "MM/DD (US)" }, { id: "EU", label: "DD/MM (EU)" }]}
                        value={dateFormat}
                        onChange={(next) => next && setDateFormatChoice(next)}
                    />

                </div>

                <div className="confirmation-actions">

                    <AddButton look="confirmation-button primary"
                        onClick={save}>
                        Save
                    </AddButton>

                </div>

            </div>

        </div>

    );

}
