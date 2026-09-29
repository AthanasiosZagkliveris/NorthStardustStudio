import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import { fieldLocation } from "../components/interview/openField";
import { systems } from "../data/systems";
import type { ReviewGroup, ReviewItem, ReviewPlace } from "../framework/engine/ReviewItems";
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
 * REVIEW: what is left to look at across the four Foundation Systems,
 * in three groups (ReviewItems.ts) -- each item one sentence and a
 * "Go there" that opens the place to answer it. With nothing left:
 * "Your Foundation is ready", and the way to the documents. Escape
 * goes back.
 */
export default function Review() {

    const navigate = useNavigate();
    const [organizationId] = useState(() => OrganizationService.getSelected());

    useEffect(() => {
        if (!organizationId) {
            navigate("/");
        }
    }, [organizationId, navigate]);

    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            if (event.key === "Escape") {
                navigate("/assistant", { state: { capability: "foundation" } });
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [navigate]);

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

                {items.length === 0
                    ? (
                        <div className="review-ready">
                            <p className="review-ready-text">Your Foundation is ready. Create your documents.</p>
                            <button
                                type="button"
                                className="workspace-documents-button"
                                onClick={() => navigate("/documents")}
                            >
                                Business Documents
                            </button>
                        </div>
                    )
                    : GROUPS.filter(group => byGroup(group.id).length > 0).map(group => (
                        <section className="review-group" key={group.id} aria-labelledby={"review-" + group.id}>
                            <h2 className="review-group-title" id={"review-" + group.id}>
                                {group.title}
                                <span className="review-group-count">{byGroup(group.id).length}</span>
                            </h2>
                            <ul className="review-list">
                                {byGroup(group.id).map((item, index) => (
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
                        </section>
                    ))}

            </main>

            <AppFooter onBack={() => navigate("/assistant", { state: { capability: "foundation" } })} />

        </div>

    );

}

