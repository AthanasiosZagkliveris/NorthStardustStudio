import { useEffect, useRef } from "react";

import InfoNote, { InfoPoint } from "../fields/InfoNote.tsx";
import LabelArrow from "../fields/LabelArrow.tsx";
import "../../../styles/title-arrow.css";
import { consumeKey } from "../fields/consumeKey.ts";

/**
 * A card's title row (3. Infrastructure & Capability): the column title in
 * its card, the one label the card has, with the arrow that DROPS ITS
 * GUIDANCE DOWN (docs/ai/layout-rules.md, "The title arrow"). The guidance is
 * a panel floating over the card under the title: it takes no room (the
 * card's content below does not move), closes on the arrow, Escape or a
 * click anywhere outside it, and starts closed. Which one is open is the
 * parent's (one at a time), view-only, never saved.
 */
export default function CardTitleHelp({

    number,

    title,

    lines,

    note,

    enabled,

    open,

    onToggle,

    onClose

}: {

    number: number;
    title: string;
    /** The guidance, one bullet each. */
    lines: readonly string[];
    /** What the column is (its "i", after the title). */
    note?: InfoPoint[];
    /** False hides the arrow and the guidance (focus mode). */
    enabled: boolean;
    open: boolean;
    onToggle: () => void;
    onClose: () => void;

}) {

    const block = useRef<HTMLDivElement | null>(null);
    const panelId = "capability-help-" + number;

    // Escape closes it (and only it: the key is the page's Back otherwise), with the
    // focus back on its arrow; a press anywhere outside the title and its panel does too.
    useEffect(() => {
        if (!open) {
            return;
        }
        function onKeyDown(event: KeyboardEvent) {
            if (event.key !== "Escape" || event.defaultPrevented) {
                return;
            }
            consumeKey(event);
            onClose();
            block.current?.querySelector<HTMLElement>(".label-arrow")?.focus({ preventScroll: true });
        }
        function onPress(event: MouseEvent) {
            if (block.current && event.target instanceof Node && !block.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("mousedown", onPress);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("mousedown", onPress);
        };
        // onClose is a fresh function each render; closing is all it does.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    return (
        <div className="card-title-block" ref={block}>

            <div className="card-title-row">

                <h3 className="answer-column-label">
                    <span className="answer-column-label-number">
                        {number + "."}
                    </span>
                    <span className="answer-column-label-text">{title}</span>
                </h3>

                {note && note.length > 0 && <InfoNote label={title} points={note} fullList />}

                {enabled && (
                    <LabelArrow
                        open={open}
                        label={(open ? "Hide help for " : "Show help for ") + title}
                        controls={panelId}
                        onToggle={onToggle}
                    />
                )}

            </div>

            {enabled && open && (
                <div
                    className="answer-column-questions card-title-help"
                    id={panelId}
                    role="region"
                    aria-label={"Help for " + title}
                >
                    {lines.map(line => (
                        <span
                            className="answer-question-line answer-question-line-bullet"
                            key={line}
                        >
                            {"• " + line}
                        </span>
                    ))}
                </div>
            )}

        </div>
    );

}
