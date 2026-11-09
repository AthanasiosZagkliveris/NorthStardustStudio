import { useEffect, useState } from "react";
import AddButton from "./controls/AddButton.tsx";
import { useLocation, useNavigate } from "react-router-dom";

import { OrganizationService } from "../services/OrganizationService";
import { openWorkbook } from "./notepad/Notepad.tsx";

/**
 * How many items of the open Organisation are still open or worth a second look (null until worked out, and with no Organisation
 * open or for the total review). The count reads every Foundation answer, so it is worked out after the page has drawn, and the
 * module that works it out is loaded then too, never with the page that shows the button. The Workbook button shows it too.
 */
export function useReviewCount(total = false): number | null {

    const location = useLocation();
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        const organizationId = OrganizationService.getSelected();
        if (!organizationId || total) {
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
    }, [location.key, total]);

    return count;

}

/**
 * The Landing page's Review button (the header's tools of an open Organisation are in the Workbook since 2026-11-09): an icon and a
 * word (the icon alone in a narrow header). No Organisation is open there (`total`): it opens the review of every Organisation, and
 * has no count. It opens the Workbook page on its Review (the total review), remembering where it was opened from so Back and Escape
 * return there.
 */
export default function ReviewButton({ total = false }: { total?: boolean }) {

    const navigate = useNavigate();
    const location = useLocation();
    const count = useReviewCount(total);

    const words = count ? count + (count === 1 ? " item" : " items") + " to look at" : "nothing open";

    return (
        <AddButton className="header-tool"
            aria-label={"Review, " + words}
            onClick={() => openWorkbook(navigate, location, { tab: "review", total: total || undefined })}>
            <svg className="header-tool-icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M4 5.5h12M4 10h12M4 14.5h7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13 14.5l1.5 1.5 3-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="header-tool-word">Review</span>
            {count ? <span className="header-tool-count">{count}</span> : null}
        </AddButton>
    );

}
