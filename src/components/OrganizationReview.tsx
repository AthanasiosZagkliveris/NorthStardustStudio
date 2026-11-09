import type { NavigateFunction } from "react-router-dom";

import FoldHead from "./controls/FoldHead";
import TextLink from "./interview/fields/TextLink";
import { fieldLocation } from "./interview/tiles/openField";
import { capabilities } from "../data/capabilities";
import { systems } from "../data/systems";
import { nothingOpen, type ReviewGroup, type ReviewItem, type ReviewPlace } from "../framework/engine/ReviewItems";
import { OrganizationService } from "../services/OrganizationService";

import "../styles/review.css";

/*
    THE REVIEW OF ONE ORGANISATION, shared by the Review page (Review.tsx: the open Organisation, or every one in the total review)
    and the Workbook panel's Review tab (Notepad.tsx): its four groups, each by Capability, each item one sentence and a "Go there".
*/

const GROUPS: { id: ReviewGroup; title: string }[] = [
    { id: "open", title: "Still open" },
    { id: "second-look", title: "Worth a second look" },
    { id: "key-dates", title: "Key dates" },
    { id: "missing", title: "Missing from the documents" }
];

/**
 * Go there: in another Organisation, it is selected first (as choosing it on the Organisations screen does), then the place is
 * opened.
 */
export function goToReviewPlace(navigate: NavigateFunction, owner: string, place: ReviewPlace): void {
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

/**
 * One Organization's Review: its four groups, each by Capability.
 * Every Organization is shown open, with how much it has to look at (owner,
 * 2026-11-05: the Review needs no fold arrow).
 */
export default function OrganizationReview({ name, items, current, onGo }: {
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
