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

function lineStart(value: string, cursor: number): number {
    return value.lastIndexOf("\n", cursor - 1) + 1;
}

function lineEnd(value: string, cursor: number): number {
    const index = value.indexOf("\n", cursor);
    return index === -1 ? value.length : index;
}

/**
 * Adds lightweight "Markdown-style" list authoring to a controlled
 * `<textarea>`:
 *
 * - Typing "* " or "- " at the very start of a line turns it into
 *   a real bullet ("• ").
 * - Typing "1. " (any number followed by a period and a space) at
 *   the start of a line is recognized as a numbered list item.
 * - Pressing Enter (or Ctrl+Enter) inside a bullet or numbered line
 *   continues the list onto the next line (repeating the bullet, or
 *   incrementing the number) -- pressing plain Enter on an EMPTY
 *   list item instead removes its marker and exits the list, rather
 *   than adding yet another empty bullet/number underneath it.
 *   Ctrl+Enter skips that "exit if empty" check and always inserts
 *   the next bullet/number, even from an empty item.
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

        const nextValue = event.target.value;
        const cursor = event.target.selectionStart;

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

    function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {

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

                // Enter on an empty bullet exits the list: strip
                // the marker, leave the cursor on that same (now
                // plain) line rather than starting a new one.
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

                const rewritten = value.slice(0, start) + indent + value.slice(end);

                pendingSelection.current = start + indent.length;

                onChange(rewritten);

                return;

            }

            const nextNumber = parseInt(numberText, 10) + 1;
            const insertion = `\n${indent}${nextNumber}. `;
            const rewritten = value.slice(0, cursor) + insertion + value.slice(cursor);

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
