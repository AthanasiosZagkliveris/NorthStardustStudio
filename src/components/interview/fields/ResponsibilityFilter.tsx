import { useRef, useState, useLayoutEffect } from "react";

import { usePopupDismiss } from "../../controls/PopupPanel.tsx";
import TickField from "../../controls/TickField.tsx";
import MenuHead from "../tiles/MenuHead.tsx";
import { BusinessTicks } from "../cards/BusinessCardFields.tsx";
import "../../../styles/capability-overview.css";
import FunnelButton from "../../controls/FunnelButton.tsx";

/** What a founder's Responsibilities can be told apart by: where they stand (Infrastructure, Offerings) and what they are (Activities, Partners & Suppliers, Legal). */
export const RESPONSIBILITY_FILTER_OPTIONS = ["Infrastructure", "Offerings", "Activities", "Partners & Suppliers", "Legal"] as const;

/**
 * THE FUNNEL: a box button in the "+"'s style (the card's tone, filled under the pointer) at the right of the Responsibilities row. It opens a short list of
 * ticks, one for each option; an option ticked off leaves out the responsibilities it names. Closes on Escape and on a click elsewhere.
 */
export default function ResponsibilityFilter({
    off,
    onToggle,
    label,
    options = RESPONSIBILITY_FILTER_OPTIONS,
    sets,
    groups,
    allOption = false
}: {
    /** ALL FIRST, AND THE DEFAULT (owner, 2026-11-23 16:19 UTC+2: "Fix the Total review filter, add an ALL option, as default, and when the user click on another
     *  option then it would appear only that one"): an "All" tick heads the list; while All is ticked, a tick on one option shows that one alone; after that, ticks
     *  add and take away; the last one taken away is All again (as the Calendar's lists, MultiPicker). */
    allOption?: boolean;
    /** The options under folded categories (owner, 2026-11-10: "place the options under folded categories"): each a FoldHead, closed at first,
     *  its count the options ticked; given, they take the place of `options`. */
    groups?: readonly { name: string; options: readonly string[] }[];
    /** The choices (a founder's Responsibilities by default). */
    options?: readonly string[];
    /** THE OPTIONS IN SETS OF ONE KIND (owner, 2026-11-20 18:35 UTC+2: "add a dividing line in their option card, so the user can better understand what options they
     *  have"): given, they take the place of `options`, a 1px line between one set and the next (where things stand, then how the founder takes part). */
    sets?: readonly (readonly string[])[];
    /** The options ticked off. */
    off: ReadonlySet<string>;
    onToggle: (option: string) => void;
    label: string;
}) {

    const [open, setOpen] = useState(false);
    const [unfolded, setUnfolded] = useState<ReadonlySet<string>>(new Set());
    const box = useRef<HTMLDivElement | null>(null);

    usePopupDismiss(open, [box], () => setOpen(false), { capture: true });

    // THE FUNNEL ENDS WHERE THE CALENDAR BOX ENDS: its right edge on the right edge of the founder's Start date box (moved by a transform: the row it stands in does not change).
    useLayoutEffect(() => {
        const node = box.current;
        const card = node?.closest<HTMLElement>(".business-founder-open");
        if (!node || !card) {
            return;
        }
        const align = () => {
            node.style.transform = "";
            const calendar = card.querySelector<HTMLElement>(".date-cell-field");
            const right = calendar ? calendar.getBoundingClientRect().right : 0;
            const mine = node.getBoundingClientRect().right;
            if (right > 0 && mine > right + 0.5) {
                node.style.transform = "translateX(" + -Math.round(mine - right) + "px)";
            }
        };
        align();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        const observer = new ResizeObserver(align);
        observer.observe(card);
        return () => observer.disconnect();
    });

    return (
        <div className="responsibility-filter" ref={box}>

            <FunnelButton
                aria-label={label}
                aria-expanded={open}
                aria-haspopup="true"
                active={off.size > 0}
                onClick={() => setOpen(current => !current)}
            />

            {open && (
                <div className="responsibility-filter-panel" role="group" aria-label={label}>
                    {groups
                        // (The Inventory's folded categories: its MenuHead, its tick list, BusinessTicks; owner, 2026-11-10.)
                        ? <div className="capability-overview-menu">{groups.filter(group => group.options.length > 0).map(group => {
                            const here = unfolded.has(group.name);
                            return (
                                <div key={group.name} className="capability-overview-menu-group">
                                    <MenuHead
                                        title={group.name}
                                        open={here}
                                        onToggle={() => setUnfolded(current => {
                                            const next = new Set(current);
                                            if (!next.delete(group.name)) {
                                                next.add(group.name);
                                            }
                                            return next;
                                        })}
                                    />
                                    {here && (
                                        <div className="capability-overview-menu-body">
                                            <BusinessTicks
                                                name={group.name}
                                                options={group.options.map(option => ({ id: option, label: option }))}
                                                chosen={group.options.filter(option => !off.has(option))}
                                                onChange={(next) => group.options.filter(option => next.includes(option) === off.has(option)).forEach(onToggle)}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}</div>
                        : allOption
                            ? (() => {
                                const all = options.every(option => !off.has(option));
                                return [
                                    <TickField key=" all" className="responsibility-filter-option" checked={all} onChange={() => options.filter(option => off.has(option)).forEach(onToggle)}>
                                        <span>All</span>
                                    </TickField>,
                                    ...options.map(option => (
                                        <TickField key={option} className="responsibility-filter-option" checked={!all && !off.has(option)} onChange={() => {
                                            if (all) {
                                                options.filter(other => other !== option).forEach(onToggle);
                                            } else if (!off.has(option) && options.filter(other => !off.has(other)).length === 1) {
                                                options.filter(other => other !== option).forEach(onToggle);
                                            } else {
                                                onToggle(option);
                                            }
                                        }}>
                                            <span>{option}</span>
                                        </TickField>
                                    ))
                                ];
                            })()
                            : (sets ?? [options]).filter(set => set.length > 0).map((set, at) => [
                            ...(at > 0 ? [<hr key={"rule-" + at} className="responsibility-filter-rule" />] : []),
                            ...set.map(option => (
                                <TickField key={option} className="responsibility-filter-option" checked={!off.has(option)} onChange={() => onToggle(option)}>
                                    <span>{option}</span>
                                </TickField>
                            ))
                        ])}
                </div>
            )}

        </div>
    );

}
