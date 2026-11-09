import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import OrganizationReview, { goToReviewPlace } from "../components/OrganizationReview";
import { OrganizationService } from "../services/OrganizationService";
import { organizationReview } from "../services/ReviewService";

import "../styles/global.css";
import "../styles/workspace.css";
import "../styles/review.css";

/**
 * REVIEW (the page; the Workbook panel's Review tab shows the same OrganizationReview): what is left to look at across the whole app for the open
 * Organization -- only that one -- in four groups (ReviewItems.ts),
 * each by Capability -- each item one sentence and a "Go there" that
 * opens the place to answer it. With nothing left, a plain "Nothing is
 * open." Escape goes back.
 *
 * THE TOTAL REVIEW (the Landing page's header button, "Review") is every Organization,
 * each folded with how much it has to look at.
 */
export default function Review() {

    const navigate = useNavigate();
    const location = useLocation();
    const [organizationId] = useState(() => OrganizationService.getSelected());
    const total = (location.state as { total?: boolean } | null)?.total === true;

    /* Back, and Escape, return to where Review was opened from (the
       header's Review and the last page's link say where); opened
       any other way, to System Selection's Foundation. */
    const from = (location.state as { from?: { pathname: string; state?: unknown } } | null)?.from;
    const back = useMemo(() => () => {
        if (from && from.pathname !== "/review") {
            navigate(from.pathname, { state: from.state });
        } else {
            navigate("/assistant", { state: { capability: "foundation" } });
        }
    }, [from, navigate]);

    useEffect(() => {
        if (!organizationId && !total) {
            navigate("/");
        }
    }, [organizationId, total, navigate]);

    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            // Not a key something open on the page has already answered.
            if (event.key === "Escape" && !event.defaultPrevented) {
                back();
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [back]);

    // The open Organization alone; the total review, every Organization in the Landing's order, each its own section.
    const sections = useMemo(() => {
        const all = OrganizationService.list();
        const shown = total ? all : all.filter(entry => entry.id === organizationId);
        return shown.map(entry => ({ id: entry.id, name: entry.name, items: organizationReview(entry.id) }));
    }, [organizationId, total]);

    if (!organizationId && !total) {
        return null;
    }

    return (

        <div className="workspace review">

            {/* (The total review is the Landing page's: no Organisation is open there, so its header is the Landing's, not the selected one's.) */}
            <AppHeader organizationName={!total && organizationId ? OrganizationService.getSummary(organizationId)?.name ?? "" : ""} totalReview={total} />

            <main className="review-page">

                <h1 className="workspace-title review-title">{total ? "Total review" : "Review"}</h1>

                {sections.map(section => (
                    <OrganizationReview
                        key={section.id}
                        name={section.name}
                        items={section.items}
                        current={!total}
                        onGo={(place) => goToReviewPlace(navigate, section.id, place)}
                    />
                ))}

            </main>

            <AppFooter onBack={back} />

        </div>

    );

}
