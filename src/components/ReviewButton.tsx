import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { OrganizationService } from "../services/OrganizationService";

/**
 * The header's Review button, beside Notes and like it: an icon and a
 * word (the icon alone in a narrow header), and how many items are
 * still open or worth a second look -- no count when there are none.
 * It opens the Review page, remembering where it was opened from so
 * Back and Escape return there; on the Review page it does nothing.
 *
 * The count reads every Foundation answer, so it is worked out after
 * the page has drawn, and the module that works it out is loaded then
 * too, never with the page that shows the button.
 */
export default function ReviewButton() {

    const navigate = useNavigate();
    const location = useLocation();
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const organizationId = OrganizationService.getSelected();
        if (!organizationId) {
            return;
        }
        let live = true;
        const timer = window.setTimeout(() => {
            Promise.all([import("../services/ReviewService"), import("../framework/engine/ReviewItems")])
                .then(([service, engine]) => {
                    if (live) {
                        setCount(engine.headerCount(service.organizationReview(organizationId)));
                    }
                })
                .catch(() => undefined);
        }, 0);
        return () => {
            live = false;
            window.clearTimeout(timer);
        };
    }, [location.key]);

    const words = count ? count + (count === 1 ? " item" : " items") + " to look at" : "nothing open";

    return (
        <button
            type="button"
            className="header-tool"
            aria-label={"Review, " + words}
            aria-current={location.pathname === "/review" ? "page" : undefined}
            onClick={() => {
                // Already there: nothing to open.
                if (location.pathname === "/review") {
                    return;
                }
                navigate("/review", { state: { from: { pathname: location.pathname, state: location.state } } });
            }}
        >
            <svg className="header-tool-icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 5.5h12M4 10h12M4 14.5h7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 14.5l1.5 1.5 3-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="header-tool-word">Review</span>
            {count ? <span className="header-tool-count">{count}</span> : null}
        </button>
    );

}
