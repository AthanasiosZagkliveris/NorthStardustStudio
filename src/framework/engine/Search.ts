/*
    SEARCH (Ctrl+K), without the page around it: an index of the open
    Organization -- its Systems' and pages' titles, the field and label
    names on those pages, and its own answers -- and what a query finds
    in it, in three groups.

    Case and accents never matter ("resume" finds "Résumé"); every word
    of the query has to be found; nothing else is syntax. Within a
    group, what matches exactly comes first, then what starts with the
    query, then what has a word starting with each word, then the rest;
    then the Foundation Systems first, in their order. The groups are
    shown in this order too -- pages, then fields, then answers -- so an
    exact title comes before a label, and a label before an answer.
*/

export type SearchGroup = "page" | "field" | "answer";

/** Where a result opens (see SearchDialog). */
export interface SearchTarget {
    systemNumber: number;
    /** The page; absent for a whole System. */
    sectionNumber?: number;
    /** A field or a page's section (FieldKeys.ts). */
    key?: string;
    /** The cards to unfold on the way to `key`, innermost first. */
    anchors?: string[];
    /** An answer: the text to find, and the ids of the cards it is in, innermost first. */
    text?: string;
    ids?: string[];
}

export interface SearchEntry {
    group: SearchGroup;
    /** What the result says: a title, a label, or the answer's text. */
    label: string;
    /** Where it is, in words ("3. Business System → 1. Foundation"). */
    place: string;
    target: SearchTarget;
    /** Its place in the app's order: lower first. */
    rank: number;
    /** The label, as it is compared (normalize). */
    folded: string;
    /** The same with every run of punctuation a space, and one before: for "a word starts with". */
    spaced: string;
}

/** Lower case, accents and marks taken off, runs of space as one: what is compared. */
export function normalize(text: string): string {
    return text.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase().replace(/\s+/g, " ");
}

/** A query's words, normalized. */
export function queryWords(query: string): string[] {
    return normalize(query).trim().split(" ").filter(word => word.length > 0);
}

/** An entry, its label folded once, as the index is built. */
export function entry(group: SearchGroup, label: string, place: string, target: SearchTarget, rank: number): SearchEntry {
    const folded = normalize(label);
    return { group, label, place, target, rank, folded, spaced: " " + folded.replace(/[^\p{L}\p{N}]+/gu, " ") };
}

/* ---------- Answers ---------- */

/** Keys that name or point at things, not what a person wrote. */
function isReferenceKey(key: string): boolean {
    return key === "id" || /Ids?$/.test(key);
}

/** A stored code ("per-sale", "2027-03", "offering-a4k9r2td") or an image, not words a person wrote. */
function isCode(text: string): boolean {
    return /^[a-z0-9]+(?:[-_][a-z0-9]+)+$/i.test(text) || text.startsWith("data:");
}

/**
 * Every text a person wrote in an answer, each with the ids of the
 * cards it is in, innermost first (what opening it unfolds).
 */
export function answerTexts(value: unknown): { text: string; ids: string[] }[] {

    const out: { text: string; ids: string[] }[] = [];

    const walk = (node: unknown, ids: string[]) => {
        if (typeof node === "string") {
            const text = node.trim();
            if (text.length > 1 && !isCode(text)) {
                out.push({ text, ids });
            }
            return;
        }
        if (Array.isArray(node)) {
            node.forEach(item => walk(item, ids));
            return;
        }
        if (node && typeof node === "object") {
            const record = node as Record<string, unknown>;
            const id = typeof record.id === "string" && record.id !== "" ? record.id : null;
            const inner = id ? [id, ...ids] : ids;
            for (const [key, item] of Object.entries(record)) {
                if (!isReferenceKey(key)) {
                    walk(item, inner);
                }
            }
        }
    };

    walk(value, []);
    return out;

}

/* ---------- Finding ---------- */

export interface SearchHit {
    entry: SearchEntry;
    /** 0 exact, 1 starts with, 2 a word starts with each word, 3 inside. */
    score: number;
}

export interface SearchResults {
    pages: SearchHit[];
    fields: SearchHit[];
    answers: SearchHit[];
}

/** How well an entry matches the words: null when a word is missing. */
function score(item: SearchEntry, words: readonly string[], phrase: string): number | null {
    for (const word of words) {
        if (!item.folded.includes(word)) {
            return null;
        }
    }
    if (item.folded === phrase) {
        return 0;
    }
    if (item.folded.startsWith(phrase)) {
        return 1;
    }
    return words.every(word => item.spaced.includes(" " + word)) ? 2 : 3;
}

/** How many of each group are shown: enough to choose from, short enough to take in. */
export const GROUP_LIMITS: Record<SearchGroup, number> = { page: 5, field: 6, answer: 8 };

/** What `query` finds in `index`, best first in each group. */
export function search(index: readonly SearchEntry[], query: string): SearchResults {

    const words = queryWords(query);
    const results: SearchResults = { pages: [], fields: [], answers: [] };

    if (words.length === 0) {
        return results;
    }

    const phrase = words.join(" ");
    const found: Record<SearchGroup, SearchHit[]> = { page: [], field: [], answer: [] };

    for (const item of index) {
        const matched = score(item, words, phrase);
        if (matched !== null) {
            found[item.group].push({ entry: item, score: matched });
        }
    }

    const best = (hits: SearchHit[], limit: number) => hits
        .sort((one, other) => one.score - other.score || one.entry.rank - other.entry.rank)
        .slice(0, limit);

    results.pages = best(found.page, GROUP_LIMITS.page);
    results.fields = best(found.field, GROUP_LIMITS.field);
    results.answers = best(found.answer, GROUP_LIMITS.answer);

    return results;

}

/**
 * A short piece of an answer around what the query found, as parts to
 * draw -- the query's words marked -- with "…" where it was cut.
 */
export function snippet(text: string, query: string, radius = 40): { text: string; match: boolean }[] {

    const words = queryWords(query);
    const flat = text.replace(/\s+/g, " ").trim();
    // Folding keeps plain text's length; where it would not (a letter
    // that folds into two), the piece is the start, unmarked.
    const folded = normalize(flat);
    const aligned = folded.length === flat.length;
    const first = aligned && words.length > 0 ? Math.max(0, folded.indexOf(words[0])) : 0;

    // From a word start about `radius` before the match, to a word end
    // about two radii after it.
    let start = Math.max(0, first - radius);
    if (start > 0) {
        const space = flat.indexOf(" ", start);
        start = space >= 0 && space < first ? space + 1 : start;
    }
    let end = Math.min(flat.length, Math.max(start + radius * 3, first + radius * 2));
    if (end < flat.length) {
        const space = flat.lastIndexOf(" ", end);
        end = space > first ? space : end;
    }

    const piece = flat.slice(start, end);
    const marks = new Array<boolean>(piece.length).fill(false);
    if (aligned) {
        const foldedPiece = folded.slice(start, end);
        for (const word of words) {
            for (let at = foldedPiece.indexOf(word); at >= 0; at = foldedPiece.indexOf(word, at + word.length)) {
                marks.fill(true, at, at + word.length);
            }
        }
    }

    const parts: { text: string; match: boolean }[] = [];
    if (start > 0) {
        parts.push({ text: "…", match: false });
    }
    for (let at = 0; at < piece.length;) {
        let next = at;
        while (next < piece.length && marks[next] === marks[at]) {
            next++;
        }
        parts.push({ text: piece.slice(at, next), match: marks[at] });
        at = next;
    }
    if (end < flat.length) {
        parts.push({ text: "…", match: false });
    }
    return parts;

}
