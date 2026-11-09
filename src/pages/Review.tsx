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
    { id: "key-dates", title: "Key dates" },
    { id: "missing", title: "Missing from the documents" }
];

/**
 * REVIEW: what is left to look at across the whole app for the open
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
                        onGo={(place) => goThere(section.id, place)}
                    />
                ))}

            </main>

            <AppFooter onBack={back} />

        </div>

    );

}

/**
 * One Organization's Review: its four groups, each by Capability.
 * Every Organization is shown open, with how much it has to look at (owner,
 * 2026-11-05: the Review needs no fold arrow).
 */
function OrganizationReview({ name, items, current, onGo }: {
    name: string;
    items: ReviewItem[];
    current: boolean;
    onGo: (place: ReviewPlace) => void;
}) {

    // (Always open: `current` no longer decides a fold.)
    void current;
    const open = true;
    const byGroup = (group: ReviewGroup): ReviewItem[] => items.filter(item => item.group === group);
    // (The key dates are milestones, not things to do: they are not in the count of what is left to look at.)
    const toLookAt = items.filter(item => item.group !== "key-dates");
    const id = "review-organization-" + name.replace(/[^A-Za-z0-9]+/g, "-");
    const shownGroups = GROUPS.filter(group => byGroup(group.id).length > 0);
    // (A group's count that only says the Organisation's again -- the one group counted -- is not shown: one count, said once.)
    const counted = shownGroups.filter(group => group.id !== "key-dates");

    return (
        <section className="review-organization" aria-label={name}>

            <h2 className="review-organization-title">
                <FoldHead
                    open={open}
                    label={name}
                    name={name}
                    count={toLookAt.length === 0 ? "Nothing open" : String(toLookAt.length)}
                    onToggle={() => undefined}
                    folds={false}
                />
            </h2>

            {open && (
                <div className="review-organization-body" id={id}>

                    {nothingOpen(items) && byGroup("second-look").length === 0 && (
                        <p className="review-empty">Nothing is open.</p>
                    )}

                    {shownGroups.map(group => {
                        // (The Capability's sub-head only where the group spans more than one Capability: one would only repeat what the group holds.)
                        const spanned = capabilities.filter(capability => byGroup(group.id).some(item => (item.capability ?? "foundation") === capability.id));
                        return (
                        <section className="review-group" key={group.id} aria-label={group.title}>
                            {/* The group's head is the Organisation's own head (FoldHead, no arrow), its count in the one count style. */}
                            <h3 className="review-group-title">
                                <FoldHead
                                    open
                                    label={group.title}
                                    name={group.title}
                                    count={counted.length === 1 && counted[0].id === group.id ? undefined : String(byGroup(group.id).length)}
                                    onToggle={() => undefined}
                                    folds={false}
                                />
                            </h3>
                            {spanned
                                .map(capability => (
                                    <div className="review-capability" key={capability.id}>
                                        {spanned.length > 1 && <h4 className="review-capability-title">{capability.title}</h4>}
                                        <ul className="review-list">
                                            {byGroup(group.id).filter(item => (item.capability ?? "foundation") === capability.id).map((item, index) => (
                                                <li className={"review-item" + (item.when === "past" ? " review-item-past" : "")} key={group.id + index}>
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
                        );
                    })}

                </div>
            )}

        </section>
    );

}
