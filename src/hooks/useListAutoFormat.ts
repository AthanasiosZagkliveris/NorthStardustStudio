import { useLayoutEffect, useRef } from "react";

// A line already converted to a bullet: optional leading
// whitespace (indent), the bullet character itself, one space,
// then whatever content follows.
const BULLET_LINE = /^(\s*)• (.*)$/;

// A line that already reads as a numbered item: optional leading
// whitespace, one or more digits, a period, one space, then
// whatever content follows.
const NUMBERED_LINE = /^(\s*)(\d+)\.\s(.*)$/;

// The line-up-to-the-cursor immediately after typing a plain "* "
// or "- " at the very start of a line (nothing else on the line
// yet) -- the trigger that turns it into a real bullet character.
// Deliberately anchored to the START of the line (via the leading
// `^(\s*)`, not "anywhere"), so typing an asterisk mid-sentence
// never gets rewritten.
const BULLET_TRIGGER = /^(\s*)([*-]) $/;

// Same shape as BULLET_TRIGGER, but WITHOUT the trailing `$` anchor
// -- used to normalize a "* "/"- " marker that has real content
// after it on the same line, which happens when a whole already-
// written line (or several) arrives at once via paste rather than
// being typed character by character.
const BULLET_LINE_PREFIX = /^(\s*)([*-]) (.*)$/;

// The number of spaces one Tab/Shift+Tab press adds or removes at
// the start of a list line -- deliberately a plain, fixed-width
// indent rather than a tracked "indent_level" integer: this hook
// still stores everything as one plain string (see the module doc
// below), so an indent is just leading whitespace, the same as any
// other text in the line.
const TAB_INDENT_UNIT = "  ";

function lineStart(value: string, cursor: number): number {
    return value.lastIndexOf("\n", cursor - 1) + 1;
}

function lineEnd(value: string, cursor: number): number {
    const index = value.indexOf("\n", cursor);
    return index === -1 ? value.length : index;
}

// The length of the longest shared prefix between two strings --
// used (together with commonSuffixLength) to isolate exactly what
// text a single onChange just inserted, whether that's one typed
// character or a large pasted block, without needing a real "paste"
// event to know the difference.
function commonPrefixLength(a: string, b: string): number {

    const max = Math.min(a.length, b.length);
    let i = 0;

    while (i < max && a[i] === b[i]) {
        i++;
    }

    return i;

}

function commonSuffixLength(a: string, b: string, prefixLength: number): number {

    const max = Math.min(a.length, b.length) - prefixLength;
    let i = 0;

    while (i < max && a[a.length - 1 - i] === b[b.length - 1 - i]) {
        i++;
    }

    return i;

}

/**
 * Converts every "* "/"- " line inside a block of text into a real
 * "• " bullet, preserving each line's own leading indentation --
 * the same rewrite BULLET_TRIGGER does for a single just-typed
 * marker, just applied to every line in a larger chunk at once (a
 * pasted list, most commonly). Lines that don't start with a plain
 * "* "/"- " marker (already-bulleted "• " lines, numbered lines,
 * ordinary prose) are left exactly as they are.
 */
function normalizeBulletLines(text: string): string {

    return text
        .split("\n")
        .map(line => {

            const match = line.match(BULLET_LINE_PREFIX);

            if (!match) {
                return line;
            }

            const [, indent, , rest] = match;

            return `${indent}• ${rest}`;

        })
        .join("\n");

}

/**
 * Keeps every numbered-list line in a block of text sequential,
 * the way Notion/Obsidian both do live as you type -- inserting a
 * new item in the MIDDLE of an existing "1. / 2. / 3." run (or
 * removing one) used to leave a stale, duplicated, or gapped
 * sequence behind (e.g. "1. / 2. / 2. / 3." after inserting a new
 * item after "1."), which read as the whole numbered-list feature
 * being broken. Called after every edit that could touch a
 * numbered line -- Enter (continue or exit), and a multi-line
 * paste -- rather than only ever bumping the ONE line that was
 * just typed.
 *
 * Each contiguous run of numbered lines at the SAME indent depth
 * is renumbered sequentially from that run's own FIRST line -- so
 * a deliberate custom starting point (typing "5. " to begin a new
 * run) is preserved, only what comes AFTER it is kept in step. A
 * blank line, a non-numbered line, or a shallower indent breaks a
 * run (starts a fresh count); a DEEPER indent is treated as its
 * own independent nested run and left alone, exactly like a nested
 * sub-list numbering independently of its parent in both apps.
 * Bullet-only text is untouched (no line matches NUMBERED_LINE, so
 * every line falls through unchanged).
 */
function renumberNumberedBlocks(text: string): string {

    const lines = text.split("\n");
    const nextNumberByIndent = new Map<number, number>();

    for (let i = 0; i < lines.length; i++) {

        const match = lines[i].match(NUMBERED_LINE);

        if (!match) {
            // Any non-numbered line (including a blank one) ends
            // every currently-running count -- the next numbered
            // line encountered after this, at any depth, starts a
            // fresh run.
            nextNumberByIndent.clear();
            continue;
        }

        const [, indent, numberText, content] = match;
        const indentLength = indent.length;

        // A run at a DEEPER indent than this line just ended (this
        // line dedented back out of it) -- its counter is stale,
        // drop it so a later re-indent to that depth starts fresh
        // rather than resuming a now-unrelated count.
        for (const trackedIndent of [...nextNumberByIndent.keys()]) {
            if (trackedIndent > indentLength) {
                nextNumberByIndent.delete(trackedIndent);
            }
        }

        const expected = nextNumberByIndent.get(indentLength) ?? parseInt(numberText, 10);

        lines[i] = `${indent}${expected}. ${content}`;
        nextNumberByIndent.set(indentLength, expected + 1);

    }

    return lines.join("\n");

}

/**
 * Adds lightweight "Markdown-style" list authoring to a controlled
 * `<textarea>`:
 *
 * - Typing "* " or "- " at the very start of a line turns it into
 *   a real bullet ("• "). PASTING one or more already-"- "/"* "-
 *   prefixed lines (e.g. a list copied from another app) converts
 *   every one of them the same way, not just a single just-typed
 *   marker -- see normalizeBulletLines.
 * - Typing "1. " (any number followed by a period and a space) at
 *   the start of a line is recognized as a numbered list item.
 * - Pressing Enter (or Ctrl+Enter) inside a bullet or numbered line
 *   continues the list onto the next line (repeating the bullet, or
 *   incrementing the number). A numbered list stays fully sequential
 *   no matter WHERE the new line lands -- inserting a new item in
 *   the middle of an existing "1. / 2. / 3." run renumbers every
 *   item after it too (see renumberNumberedBlocks), matching Notion/
 *   Obsidian, instead of leaving a stale/duplicated run behind.
 * - Pressing plain Enter on an EMPTY, top-level (non-indented) list
 *   item removes its marker and exits the list -- confirmed against
 *   Notion's own documented behavior -- rather than adding yet
 *   another empty bullet/number underneath it. If that empty item is
 *   INDENTED, Enter un-indents it by one step first (same as
 *   Shift+Tab) and only fully exits once it's back at the top level
 *   -- Notion's own stated "give Shift+Tab a rest" behavior. Ctrl+
 *   Enter skips both the exit and the un-indent step and always
 *   inserts the next bullet/number immediately, even from an empty
 *   item.
 * - Tab/Shift+Tab on a bullet or numbered line adds/removes one
 *   fixed-width indent step (TAB_INDENT_UNIT) at the start of that
 *   line -- a plain visual indent, not a tracked hierarchy: this
 *   stays true to the hook's whole design (a plain string, not a
 *   node tree). A numbered list's OWN indent depth numbers
 *   independently of its parent/sibling depths (see
 *   renumberNumberedBlocks) the same way a nested sub-list does in
 *   Notion/Obsidian. Tab on a line that ISN'T a list line is left
 *   alone, so it still moves focus to the next field as normal
 *   everywhere else in the interview.
 *
 * Usage: spread the returned `onChange`/`onKeyDown` onto the
 * `<textarea>` (composing with any other onKeyDown the caller
 * already needs), and merge the returned `textareaRef` into
 * whatever ref the caller already attaches (e.g. one used for
 * auto-grow resizing) so this hook can restore the cursor position
 * after a rewrite -- setting a controlled textarea's value via
 * React state alone resets the cursor to the end otherwise.
 */
export function useListAutoFormat(
    value: string,
    onChange: (value: string) => void
) {

    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const pendingSelection = useRef<number | null>(null);

    // Runs synchronously after the DOM has committed the rewritten
    // value (but before the browser paints), restoring the cursor
    // to where the user would expect it -- right after the bullet/
    // number that was just inserted, not wherever React's own
    // default controlled-value handling would otherwise leave it
    // (the end of the text).
    useLayoutEffect(() => {

        if (pendingSelection.current === null) {
            return;
        }

        const position = pendingSelection.current;

        pendingSelection.current = null;

        const el = textareaRef.current;

        if (el) {
            el.setSelectionRange(position, position);
        }

    }, [value]);

    function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {

        // Every regex in this file (BULLET_LINE, NUMBERED_LINE,
        // BULLET_TRIGGER, BULLET_LINE_PREFIX) is anchored with a
        // trailing `$`, tested one line at a time after splitting the
        // whole value on plain "\n" (see normalizeBulletLines/
        // renumberNumberedBlocks below). A lone "\n" is what every
        // line in this hook's OWN stored value already uses -- but
        // pasted text arriving from elsewhere (e.g. anything copied
        // on Windows) commonly uses "\r\n" instead, which leaves a
        // trailing "\r" on every split line except the last. `$`
        // (without the `m` flag) only matches at the true end of the
        // string, or immediately before a trailing "\n" -- never
        // before a "\r" -- so every one of those regexes silently
        // fails to match on a line with a leftover "\r", and a
        // pasted "- Item 1\r\n- Item 2\r\n..." list keeps its raw
        // "- " markers instead of becoming real bullets (same failure
        // for a pasted numbered list and renumberNumberedBlocks).
        // Stripping "\r" here, right where text first enters this
        // hook, keeps it out of the stored value entirely, so every
        // downstream regex only ever sees the plain "\n"-separated
        // lines it was written for.
        //
        // The raw DOM `selectionStart` is an index into the
        // UN-normalized value (the actual "\r\n"-containing text the
        // browser just committed) -- normalizing the prefix up to
        // that index separately, and using ITS length as `cursor`,
        // keeps the cursor pointing at the same logical spot in the
        // now-normalized `nextValue` regardless of how many "\r"
        // characters sat before or after it (a flat
        // `event.target.selectionStart` would drift out of sync by
        // one position per stripped "\r" before the cursor).
        const rawValue = event.target.value;
        const rawCursor = event.target.selectionStart;
        const normalizedPrefix = rawValue.slice(0, rawCursor).replace(/\r\n?/g, "\n");
        const cursor = normalizedPrefix.length;
        const nextValue = normalizedPrefix + rawValue.slice(rawCursor).replace(/\r\n?/g, "\n");

        // Isolate exactly what this onChange just inserted (typing
        // OR paste both land here as one plain onChange -- there's
        // no separate "this was a paste" signal to rely on) by
        // diffing against the previous value: whatever sits between
        // the longest shared prefix and the longest shared suffix is
        // new. A single typed character is a 1-char insertion and
        // falls through to the existing per-keystroke trigger check
        // below unchanged; anything longer (a pasted block, an
        // autofill, ...) goes through normalizeBulletLines instead,
        // which rewrites "* "/"- " on EVERY newly-inserted line, not
        // just one anchored right at the cursor -- otherwise a
        // pasted list (e.g. copied from another app) would silently
        // keep its raw "- " markers instead of becoming real
        // bullets. The renumberNumberedBlocks pass runs on the whole
        // resulting value (not just the pasted chunk), so a pasted
        // numbered list also falls in line with whatever numbered
        // content already surrounds it, instead of arriving with its
        // own independent, possibly-clashing numbering.
        const prefixLength = commonPrefixLength(value, nextValue);
        const suffixLength = commonSuffixLength(value, nextValue, prefixLength);
        const insertedText = nextValue.slice(prefixLength, nextValue.length - suffixLength);

        if (insertedText.length > 1) {

            const normalizedInserted = normalizeBulletLines(insertedText);

            const candidateValue =
                nextValue.slice(0, prefixLength) +
                normalizedInserted +
                nextValue.slice(nextValue.length - suffixLength);

            const rewritten = renumberNumberedBlocks(candidateValue);

            if (rewritten !== nextValue) {

                pendingSelection.current = cursor + (normalizedInserted.length - insertedText.length);

                onChange(rewritten);

                return;

            }

        }

        const start = lineStart(nextValue, cursor);
        const beforeCursor = nextValue.slice(start, cursor);

        const triggerMatch = beforeCursor.match(BULLET_TRIGGER);

        if (triggerMatch) {

            const [whole, indent] = triggerMatch;
            const replacement = `${indent}• `;

            // Same length as what it replaces ("* "/"- " -> "• "),
            // so the cursor lands in exactly the same spot -- right
            // after the space, ready to type the bullet's content.
            const rewritten = nextValue.slice(0, start) + replacement + nextValue.slice(start + whole.length);

            pendingSelection.current = start + replacement.length;

            onChange(rewritten);

            return;

        }

        onChange(nextValue);

    }

    // Tab/Shift+Tab on a bullet or numbered line indents/outdents
    // that line by one TAB_INDENT_UNIT step. Only intervenes when
    // the cursor is actually on a recognized list line -- Tab
    // everywhere else in the interview is the normal "move to the
    // next field" control, and hijacking it unconditionally would
    // break that.
    function handleTab(event: React.KeyboardEvent<HTMLTextAreaElement>) {

        const textarea = event.currentTarget;

        // A selection spanning multiple lines would need each of
        // those lines re-indented together to be useful -- out of
        // scope for now, so a selection just falls through to the
        // browser's normal Tab (move focus) behavior rather than
        // doing something half-right to only part of it.
        if (textarea.selectionStart !== textarea.selectionEnd) {
            return;
        }

        const cursor = textarea.selectionStart;
        const start = lineStart(value, cursor);
        const end = lineEnd(value, cursor);
        const line = value.slice(start, end);

        const bulletMatch = line.match(BULLET_LINE);
        const numberedMatch = line.match(NUMBERED_LINE);
        const listMatch = bulletMatch ?? numberedMatch;

        if (!listMatch) {
            return;
        }

        event.preventDefault();

        const currentIndent = listMatch[1];

        if (event.shiftKey) {

            if (currentIndent.length === 0) {
                // Already at the top level -- nothing to outdent.
                return;
            }

            const removedLength = Math.min(TAB_INDENT_UNIT.length, currentIndent.length);
            const outdentedLine = currentIndent.slice(0, currentIndent.length - removedLength) + line.slice(currentIndent.length);
            const rewritten = value.slice(0, start) + outdentedLine + value.slice(end);

            pendingSelection.current = cursor - removedLength;

            onChange(rewritten);

            return;

        }

        const rewritten = value.slice(0, start) + TAB_INDENT_UNIT + line + value.slice(end);

        pendingSelection.current = cursor + TAB_INDENT_UNIT.length;

        onChange(rewritten);

    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {

        if (event.key === "Tab") {
            handleTab(event);
            return;
        }

        // Plain Enter continues/exits the list, same as Ctrl+Enter --
        // some users' muscle memory (from other list/task editors)
        // reaches for Ctrl+Enter specifically to add the next bullet
        // or number, so it's treated as an equivalent trigger rather
        // than a plain-newline escape hatch. Shift+Enter and Alt/Meta
        // (Cmd) +Enter are left alone -- Shift+Enter in particular is
        // the deliberate "insert a real newline without continuing
        // the list" escape hatch, matching common editor convention.
        if (event.key !== "Enter" || event.shiftKey || event.altKey || event.metaKey) {
            return;
        }

        // Ctrl+Enter always forces the next bullet/number, even from
        // an empty list item -- an explicit "give me the next one"
        // command. Plain Enter keeps the smart exit-if-empty
        // behavior below, so a quick double-Enter still ends a list
        // the way most list-aware editors expect.
        const forceNext = event.ctrlKey;

        const textarea = event.currentTarget;

        // Only continue/exit a list for a plain cursor press, not
        // for Enter typed over an active text selection -- that's
        // an ordinary "replace this selection" edit, not a "start a
        // new list line" one.
        if (textarea.selectionStart !== textarea.selectionEnd) {
            return;
        }

        const cursor = textarea.selectionStart;
        const start = lineStart(value, cursor);
        const end = lineEnd(value, cursor);
        const line = value.slice(start, end);

        const bulletMatch = line.match(BULLET_LINE);
        const numberedMatch = line.match(NUMBERED_LINE);

        if (!bulletMatch && !numberedMatch) {
            return;
        }

        event.preventDefault();

        if (bulletMatch) {

            const [, indent, content] = bulletMatch;

            if (!forceNext && content.trim().length === 0) {

                if (indent.length > 0) {

                    // Notion's own documented behavior ("give
                    // Shift+Tab a rest -- pressing return in an
                    // empty bullet will un-indent it"): an empty
                    // INDENTED item un-indents one step first,
                    // keeping its marker, rather than exiting
                    // straight away. Only a top-level empty item
                    // exits on this same press (below).
                    const outdentedIndent = indent.slice(0, Math.max(0, indent.length - TAB_INDENT_UNIT.length));
                    const rewritten = value.slice(0, start) + outdentedIndent + "• " + value.slice(end);

                    pendingSelection.current = start + outdentedIndent.length + 2;

                    onChange(rewritten);

                    return;

                }

                // Enter on an empty, top-level bullet exits the
                // list: strip the marker, leave the cursor on that
                // same (now plain) line rather than starting a new
                // one.
                const rewritten = value.slice(0, start) + indent + value.slice(end);

                pendingSelection.current = start + indent.length;

                onChange(rewritten);

                return;

            }

            const insertion = `\n${indent}• `;
            const rewritten = value.slice(0, cursor) + insertion + value.slice(cursor);

            pendingSelection.current = cursor + insertion.length;

            onChange(rewritten);

            return;

        }

        if (numberedMatch) {

            const [, indent, numberText, content] = numberedMatch;

            if (!forceNext && content.trim().length === 0) {

                if (indent.length > 0) {

                    // Same un-indent-first step as an empty bullet
                    // above, then renumber so this item's number
                    // matches whatever run it just landed in at its
                    // new, shallower depth (it may no longer be
                    // "next" there).
                    const outdentedIndent = indent.slice(0, Math.max(0, indent.length - TAB_INDENT_UNIT.length));
                    const candidate = value.slice(0, start) + outdentedIndent + numberText + ". " + value.slice(end);
                    const rewritten = renumberNumberedBlocks(candidate);

                    pendingSelection.current = start + outdentedIndent.length + numberText.length + 2;

                    onChange(rewritten);

                    return;

                }

                // Enter on an empty, top-level numbered item exits
                // the list: strip the marker, leaving this line as
                // an ordinary blank line in place (not removed) --
                // same as the LAST item of a run ending normally.
                // Renumbering here mostly matters for the item ABOVE
                // this one (its own count may need to reflect this
                // line disappearing from the run); anything BELOW
                // this now-blank line was already a separate run as
                // far as numbering is concerned (a blank/non-list
                // line always breaks a run -- see
                // renumberNumberedBlocks), so it keeps whatever
                // number it already had rather than being pulled
                // down to "close a gap".
                const candidate = value.slice(0, start) + indent + value.slice(end);
                const rewritten = renumberNumberedBlocks(candidate);

                pendingSelection.current = start + indent.length;

                onChange(rewritten);

                return;

            }

            // Insert the next number right after this line, THEN
            // renumber the whole value -- inserting mid-list (not
            // just at the very end) used to leave every item below
            // this point stale/duplicated (e.g. "1. / 2. / 2. / 3."
            // instead of "1. / 2. / 3. / 4."); renumberNumberedBlocks
            // re-walks the whole run so it stays sequential end to
            // end no matter where the new item lands.
            const nextNumber = parseInt(numberText, 10) + 1;
            const insertion = `\n${indent}${nextNumber}. `;
            const candidate = value.slice(0, cursor) + insertion + value.slice(cursor);
            const rewritten = renumberNumberedBlocks(candidate);

            pendingSelection.current = cursor + insertion.length;

            onChange(rewritten);

            return;

        }

    }

    return {
        textareaRef,
        onChange: handleChange,
        onKeyDown: handleKeyDown
    };

}
