import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import { fieldLocation } from "../components/interview/openField";
import { systems } from "../data/systems";
import { nothingOpen, type ReviewGroup, type ReviewItem, type ReviewPlace } from "../framework/engine/ReviewItems";
import { capabilities } from "../data/capabilities";
import { OrganizationService } from "../services/OrganizationService";
import { organizationReview } from "../services/ReviewService";

import "../styles/global.css";
import "../styles/workspace.css";
import "../styles/review.css";

const GROUPS: { id: ReviewGroup; title: string }[] = [
    { id: "open", title: "Still open" },
    { id: "second-look", title: "Worth a second look" },
    { id: "missing", title: "Missing from the documents" }
];

/**
 * REVIEW: what is left to look at across the whole app for the open
 * Organization, in three groups (ReviewItems.ts), each by Capability
 * -- each item one sentence and a "Go there" that opens the place to
 * answer it. With nothing left, a plain "Nothing is open." Escape
 * goes back.
 */
export default function Review() {

    const navigate = useNavigate();
    const location = useLocation();
    const [organizationId] = useState(() => OrganizationService.getSelected());

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
        if (!organizationId) {
            navigate("/");
        }
    }, [organizationId, navigate]);

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

    const items = useMemo(() => organizationId ? organizationReview(organizationId) : [], [organizationId]);

    if (!organizationId) {
        return null;
    }

    function goThere(place: ReviewPlace) {
        const location = place.key ? fieldLocation(place.key, place.anchors ?? []) : null;
        if (location) {
            navigate(location.pathname, { state: location.state });
            return;
        }
        const system = systems.find(candidate => candidate.number === place.systemNumber);
        if (system) {
            navigate("/introduction", { state: { system, targetSectionNumber: place.sectionNumber } });
        }
    }

    const byGroup = (group: ReviewGroup): ReviewItem[] => items.filter(item => item.group === group);

    return (

        <div className="workspace review">

            <AppHeader organizationName={OrganizationService.getSummary(organizationId)?.name ?? ""} />

            <main className="review-page">

                <h1 className="workspace-title review-title">Review</h1>

                {nothingOpen(items) && byGroup("second-look").length === 0 && (
                    <p className="review-empty">Nothing is open.</p>
                )}

                {GROUPS.filter(group => byGroup(group.id).length > 0).map(group => (
                        <section className="review-group" key={group.id} aria-labelledby={"review-" + group.id}>
                            <h2 className="review-group-title" id={"review-" + group.id}>
                                {group.title}
                                <span className="review-group-count">{byGroup(group.id).length}</span>
                            </h2>
                            {capabilities
                                .filter(capability => byGroup(group.id).some(item => (item.capability ?? "foundation") === capability.id))
                                .map(capability => (
                                    <div className="review-capability" key={capability.id}>
                                        <h3 className="review-capability-title">{capability.title}</h3>
                                    <ul className="review-list">
                                        {byGroup(group.id).filter(item => (item.capability ?? "foundation") === capability.id).map((item, index) => (
                                            <li className="review-item" key={group.id + index}>
                                                <span className="review-item-text">{item.text}</span>
                                                {item.place && (
                                                    <button
                                                        type="button"
                                                        className="review-go"
                                                        onClick={() => goThere(item.place!)}
                                                    >
                                                        Go there
                                                    </button>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    </div>
                                ))}
                        </section>
                    ))}

            </main>

            <AppFooter onBack={back} />

        </div>

    );

}

