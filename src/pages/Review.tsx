import { useEffect, useMemo, useState } from "react";
import TextLink from "../components/interview/fields/TextLink";
import FoldHead from "../components/controls/FoldHead";
import { useLocation, useNavigate } from "react-router-dom";

import AppFooter from "../components/AppFooter";
import AppHeader from "../components/AppHeader";
import { fieldLocation } from "../components/interview/tiles/openField";
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

    // Every Organization, the open one first; each its own section.
    const sections = useMemo(() => {
        if (!organizationId) {
            return [];
        }
        const all = OrganizationService.list();
        const ordered = [...all.filter(entry => entry.id === organizationId), ...all.filter(entry => entry.id !== organizationId)];
        return ordered.map(entry => ({ id: entry.id, name: entry.name, items: organizationReview(entry.id) }));
    }, [organizationId]);

    if (!organizationId) {
        return null;
    }

    /* Go there: in another Organization, it is selected first (as
       choosing it on the Organizations screen does), then the place
       is opened. */
    function goThere(owner: string, place: ReviewPlace) {
        if (OrganizationService.getSelected() !== owner) {
            OrganizationService.setSelected(owner);
        }
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

    return (

        <div className="workspace review">

            <AppHeader organizationName={OrganizationService.getSummary(organizationId)?.name ?? ""} />

            <main className="review-page">

                <h1 className="workspace-title review-title">Review</h1>

                {sections.map(section => (
                    <OrganizationReview
                        key={section.id}
                        name={section.name}
                        items={section.items}
                        current={section.id === organizationId}
                        onGo={(place) => goThere(section.id, place)}
                    />
                ))}

            </main>

            <AppFooter onBack={back} />

        </div>

    );

}

/**
 * One Organization's Review: its three groups, each by Capability.
 * The open Organization's starts open; the others start folded, with
 * how much each has to look at.
 */
function OrganizationReview({ name, items, current, onGo }: {
    name: string;
    items: ReviewItem[];
    current: boolean;
    onGo: (place: ReviewPlace) => void;
}) {

    const [open, setOpen] = useState(current);
    const byGroup = (group: ReviewGroup): ReviewItem[] => items.filter(item => item.group === group);
    const id = "review-organization-" + name.replace(/[^A-Za-z0-9]+/g, "-");

    return (
        <section className="review-organization" aria-label={name}>

            <h2 className="review-organization-title">
                <FoldHead
                    open={open}
                    label={name}
                    name={name}
                    count={items.length === 0 ? "Nothing open" : String(items.length)}
                    onToggle={() => setOpen(value => !value)}
                />
            </h2>

            {open && (
                <div className="review-organization-body" id={id}>

                    {nothingOpen(items) && byGroup("second-look").length === 0 && (
                        <p className="review-empty">Nothing is open.</p>
                    )}

                    {GROUPS.filter(group => byGroup(group.id).length > 0).map(group => (
                        <section className="review-group" key={group.id} aria-label={group.title}>
                            <h3 className="review-group-title">
                                {group.title}
                                <span className="review-group-count">{byGroup(group.id).length}</span>
                            </h3>
                            {capabilities
                                .filter(capability => byGroup(group.id).some(item => (item.capability ?? "foundation") === capability.id))
                                .map(capability => (
                                    <div className="review-capability" key={capability.id}>
                                        <h4 className="review-capability-title">{capability.title}</h4>
                                        <ul className="review-list">
                                            {byGroup(group.id).filter(item => (item.capability ?? "foundation") === capability.id).map((item, index) => (
                                                <li className="review-item" key={group.id + index}>
                                                    <span className="review-item-text">{item.text}</span>
                                                    {item.place && (
                                                        <TextLink className="review-go" onClick={() => onGo(item.place!)}>
                                                            Go there
                                                        </TextLink>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                        </section>
                    ))}

                </div>
            )}

        </section>
    );

}
