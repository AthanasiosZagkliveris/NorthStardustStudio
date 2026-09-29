import { useSyncExternalStore } from "react";

import { OrganizationService } from "../services/OrganizationService";
import type { SaveState } from "../services/OrganizationStore";

/** What a failed save asks the user to do, on hover or focus. */
const ERROR_ADVICE =
    "Your latest changes are still on screen but could not be saved on this device. " +
    "Go back to the start screen and use Export Organization to keep a copy, " +
    "then free some space.";

function describe(state: SaveState): { glyph: string; text: string } {

    switch (state.status) {
        case "saving":
            return { glyph: "…", text: "Saving…" };
        case "saved":
            return { glyph: "✓", text: "✓ Saved" };
        case "error":
            return { glyph: "!", text: "Not saved — " + state.reason };
    }

}

/**
 * The header's saved signal: quiet grey "Saving…" while an edit
 * waits to be written, then "✓ Saved"; "Not saved — storage is
 * full" (or the reason) in the warning colour when a write failed,
 * with the advice in its tooltip. Announced politely, never
 * clickable. In a narrow header only the glyph shows (app-header.css);
 * the words stay for assistive technology.
 */
export default function SaveStatus() {

    const state = useSyncExternalStore(
        OrganizationService.subscribeSaveState,
        OrganizationService.getSaveState
    );

    const { glyph, text } = describe(state);

    return (
        <p
            className={"save-status save-status-" + state.status}
            aria-live="polite"
            title={state.status === "error" ? ERROR_ADVICE : undefined}
        >
            <span className="save-status-glyph" aria-hidden="true">{glyph}</span>
            <span className="save-status-text">{text}</span>
        </p>
    );

}
