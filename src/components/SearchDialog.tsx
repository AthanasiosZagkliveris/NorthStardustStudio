import { KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { systems } from "../data/systems";
import { search, snippet, type SearchHit, type SearchTarget } from "../framework/engine/Search";
import { organizationSearchIndex } from "../services/SearchService";
import { fieldLocation } from "./interview/openField";
import { consumeKey } from "./interview/consumeKey";

type Navigate = ReturnType<typeof useNavigate>;

/**
 * Opens a result: a System at its introduction; a page; a field (its
 * card unfolded, the field focused, openField); an answer (its cards
 * unfolded, the box holding it focused, focusText).
 */
export function openTarget(navigate: Navigate, target: SearchTarget): void {

    const system = systems.find(candidate => candidate.number === target.systemNumber);

    if (!system) {
        return;
    }

    if (target.key) {
        const location = fieldLocation(target.key, target.anchors ?? []);
        if (location) {
            navigate(location.pathname, { state: location.state });
        }
        return;
    }

    if (target.text !== undefined && target.sectionNumber !== undefined) {
        navigate("/introduction", {
            state: { system, targetSectionNumber: target.sectionNumber, focusField: { key: "", text: target.text, ids: target.ids ?? [] } }
        });
        return;
    }

    navigate("/introduction", {
        state: target.sectionNumber !== undefined
            ? { system, targetSectionNumber: target.sectionNumber, resume: {} }
            : { system }
    });

}

const GROUPS: { id: "pages" | "fields" | "answers"; title: string }[] = [
    { id: "pages", title: "Pages" },
    { id: "fields", title: "Fields" },
    { id: "answers", title: "Your answers" }
];

/**
 * THE SEARCH DIALOG (Ctrl+K): one box, and as you type, what it finds
 * in the open Organization in up to three groups -- Pages, Fields, Your
 * answers (the words found marked, in a short piece of the answer).
 * The box is a combobox over one listbox: Up and Down move through
 * every result, Enter opens the one chosen (the first, until then),
 * Escape closes. The index is built as it opens (SearchService).
 */
export default function SearchDialog({

    organizationId,

    onClose

}: {

    organizationId: string;
    /** Closes it; `opened` when a result was opened. */
    onClose: (opened: boolean) => void;

}) {

    const navigate = useNavigate();
    const listId = useId();
    const input = useRef<HTMLInputElement | null>(null);

    const index = useMemo(() => organizationSearchIndex(organizationId), [organizationId]);

    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);

    const results = useMemo(() => search(index, query), [index, query]);
    const flat: SearchHit[] = [...results.pages, ...results.fields, ...results.answers];

    useEffect(() => {
        input.current?.focus();
    }, []);

    // The chosen result stays in view as the arrows move.
    useEffect(() => {
        document.getElementById(listId + "-" + active)?.scrollIntoView?.({ block: "nearest" });
    }, [active, listId]);

    function open(hit: SearchHit | undefined) {
        if (!hit) {
            return;
        }
        onClose(true);
        openTarget(navigate, hit.entry.target);
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case "ArrowDown":
                event.preventDefault();
                setActive(at => Math.min(at + 1, flat.length - 1));
                break;
            case "ArrowUp":
                event.preventDefault();
                setActive(at => Math.max(at - 1, 0));
                break;
            case "Enter":
                event.preventDefault();
                open(flat[active]);
                break;
            // Consumed: it closes the search and nothing behind it (consumeKey).
            case "Escape":
                consumeKey(event);
                onClose(false);
                break;
            // The box is the dialog's one stop.
            case "Tab":
                event.preventDefault();
                break;
            default:
                break;
        }
    }

    let position = 0;

    return (
        <div
            className="search-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose(false);
                }
            }}
        >
            <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Search">

                <input
                    ref={input}
                    type="text"
                    className="interview-input search-input"
                    role="combobox"
                    aria-label="Search pages, fields and your answers"
                    aria-expanded={flat.length > 0}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={flat.length > 0 ? listId + "-" + active : undefined}
                    placeholder="Search pages, fields and your answers"
                    autoComplete="off"
                    spellCheck={false}
                    value={query}
                    onChange={(event) => {
                        setQuery(event.target.value);
                        setActive(0);
                    }}
                    onKeyDown={onKeyDown}
                />

                <div id={listId} className="search-results" role="listbox" aria-label="Results">
                    {GROUPS.map(group => {
                        const hits = results[group.id];
                        if (hits.length === 0) {
                            return null;
                        }
                        const headId = listId + "-" + group.id;
                        return (
                            <div key={group.id} className="search-group" role="group" aria-labelledby={headId}>
                                <div id={headId} className="search-group-title" role="presentation">{group.title}</div>
                                {hits.map(hit => {
                                    const at = position++;
                                    return (
                                        <div
                                            key={at}
                                            id={listId + "-" + at}
                                            className={"search-option" + (at === active ? " search-option-active" : "")}
                                            role="option"
                                            aria-selected={at === active}
                                            onMouseMove={() => setActive(at)}
                                            onMouseDown={(event) => event.preventDefault()}
                                            onClick={() => open(hit)}
                                        >
                                            <span className="search-option-label">
                                                {group.id === "answers"
                                                    ? snippet(hit.entry.label, query).map((part, partIndex) => part.match
                                                        ? <mark key={partIndex} className="search-mark">{part.text}</mark>
                                                        : <span key={partIndex}>{part.text}</span>)
                                                    : hit.entry.label}
                                            </span>
                                            {hit.entry.place && <span className="search-option-place">{hit.entry.place}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                {query.trim() !== "" && flat.length === 0 && (
                    <p className="search-empty" role="status">No match for that.</p>
                )}

            </div>
        </div>
    );

}
