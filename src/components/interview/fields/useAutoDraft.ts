import { useEffect, useRef } from "react";

/**
 * THE DRAFT, WRITTEN IN BY ITSELF (owner, 2026-11-20 18:35 UTC+2: "Instead of appearing, an Add a draft option, add the draft automatically"; 19:17: "Add
 * only the draft and remove the Notes. The app user could add or change the text as he wishes"): a text the app can draft from the founder's answers (the
 * Vision, an Ambassador's text, a source's Basis, a relationship's Purpose and Approach, the Value Proposition, the Strategic Compass, an Objective's name) takes
 * its draft while it is empty, and keeps following the answers for as long as it still says what the app wrote this time it was open; once the founder
 * writes in it, it is theirs. A text already saved is never changed. No Notes of its own: the text itself is the founder's to add to or change.
 */
export function useAutoDraft(text: string, draft: string, write: (draft: string) => void, disabled = false): void {
    const written = useRef<string | null>(null);
    useEffect(() => {
        if (disabled || draft.trim() === "" || draft === text) {
            return;
        }
        const untouched = text.trim() === "" || (written.current !== null && text === written.current);
        if (untouched) {
            written.current = draft;
            write(draft);
        }
        // (The writer is a new function each render; the text and the draft are what decide.)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, draft, disabled]);
}

/** The same, as an element, for a text drawn in a list or a card's render (a source's Basis, a relationship's Purpose): it draws nothing. */
export function AutoDraft({ text, draft, write, disabled = false }: { text: string; draft: string; write: (draft: string) => void; disabled?: boolean }): null {
    useAutoDraft(text, draft, write, disabled);
    return null;
}
