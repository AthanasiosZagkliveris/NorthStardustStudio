import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { FocusModeService } from "../services/FocusModeService";

import "../styles/focus-mode.css";

/** Whether focus mode is on (FocusModeService). */
export function useFocusMode(): boolean {
    return useSyncExternalStore(FocusModeService.subscribe, FocusModeService.isOn, FocusModeService.isOn);
}

/** Four corners drawn in: the page, closed in on. */
function FocusIcon({ exit = false }: { exit?: boolean }) {
    return (
        <svg className="header-tool-icon" viewBox="0 0 20 20" aria-hidden="true">
            <path
                d={exit
                    ? "M7 3v4H3M13 3v4h4M7 17v-4H3M13 17v-4h4"
                    : "M3 7V3h4M17 7V3h-4M3 13v4h4M17 13v4h-4"}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

/**
 * FOCUS MODE, on an interview page: the header's Focus tool (an icon
 * and the word, the icon alone in a narrow header) turns it on; then
 * the rails, the Help, the header and the progress line are hidden,
 * the page is centred at a reading width (focus-mode.css), and one
 * small "Exit focus" button stays in the top-right corner. Escape
 * exits too (Conversation.tsx, after any dialog has closed). The
 * choice is remembered on this device until exited.
 */
export default function FocusModeButton() {

    const on = useFocusMode();

    // The page takes the mode while this, the interview's own tool, is here.
    useEffect(() => {
        const root = document.documentElement;
        root.classList.toggle("focus-mode", on);
        return () => root.classList.remove("focus-mode");
    }, [on]);

    return (
        <>
            <button
                type="button"
                className="header-tool focus-mode-enter"
                aria-label="Focus"
                aria-pressed={on}
                title="Focus: the page alone"
                onClick={() => FocusModeService.set(true)}
            >
                <FocusIcon />
                <span className="header-tool-word">Focus</span>
            </button>

            {on && createPortal(
                <button
                    type="button"
                    className="header-tool focus-mode-exit"
                    title="Exit focus (Escape)"
                    onClick={() => FocusModeService.set(false)}
                >
                    <FocusIcon exit />
                    <span>Exit focus</span>
                </button>,
                document.body
            )}
        </>
    );

}
