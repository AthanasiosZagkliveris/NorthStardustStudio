import AddButton from "./controls/AddButton.tsx";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * The header's Global Settings button, beside Review and like it: an icon and a word (the icon alone in a narrow header). It opens the Global Settings
 * screen, remembering where it was opened from so Back and Escape return there; on the screen it does nothing.
 */
export default function SettingsButton() {

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <AddButton className="header-tool"
            aria-label="Global Settings"
            aria-current={location.pathname === "/settings" ? "page" : undefined}
            onClick={() => {
                // Already there: nothing to open.
                if (location.pathname === "/settings") {
                    return;
                }
                navigate("/settings", { state: { from: { pathname: location.pathname, state: location.state } } });
            }}>
            <svg className="header-tool-icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M3 6h9M15 6h2M3 14h2M8 14h9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="13.5" cy="6" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="6.5" cy="14" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="header-tool-word">Settings</span>
        </AddButton>
    );

}
