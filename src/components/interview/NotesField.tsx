import { useCallback, useLayoutEffect } from "react";

import { useListAutoFormat } from "../../hooks/useListAutoFormat.ts";

interface NotesFieldProps {

    value: string;

    onChange: (value: string) => void;

    placeholder?: string;

    /**
     * Accessible name for the notes field -- see
     * InterviewInput.ariaLabel. Its placeholder ("Add a note")
     * says what to do, not which column it belongs to.
     */
    ariaLabel?: string;

    disabled?: boolean;

    /**
     * An extra class alongside this component's own shared
     * `notes-field` class -- lets a call site keep its existing,
     * scope-specific selector (e.g. `.operational-log-autogrow-
     * field`'s own sizing tweaks in conversation.css, or an existing
     * Playwright test that already queries by that class) working
     * unchanged, while still picking up every bit of shared Notes
     * behavior/styling this component centralizes.
     */
    className?: string;

}

/**
 * The ONE shared "Notes" field every actual Notes-purpose column or
 * window in the app should use -- "wherever there is a note column
 * or window, it should always have the free text features (bullet
 * points and numbered lists features), and should be regular not
 * bold. Standardise it." Before this component existed, Operational
 * Log, Roles & Responsibilities, and the Organization Calendar's own
 * task annotation each hand-rolled their OWN near-identical "grows
 * to fit its content, no internal scrolling" textarea -- none of
 * them wired up `useListAutoFormat` (the
 * same bullet/numbered-list authoring every generic Table-driven
 * free-text field already gets via InterviewInput), and the
 * Calendar's own copy additionally inherited a bold font-weight from
 * its "Notes" caption label wrapper by accident (see
 * `.org-calendar-task-annotation-notes` in organization-calendar.css
 * -- font-weight:700 was meant for the CAPTION text, but
 * `font:inherit` on `.interview-input` let it cascade down into the
 * actual typed note text too). This component fixes both at once,
 * in one place, so every CURRENT Notes field behaves identically and
 * any FUTURE one gets the same behavior for free just by using it.
 *
 * Deliberately NOT used for ProcessLibraryEditor's own Name/Purpose/
 * Step-action fields -- those are short, structured, single-purpose
 * text (a name, a one-line purpose, a step's action), not open-ended
 * "notes", so list authoring doesn't apply to them the same way; the
 * user's own request scoped this to "note column[s] or window[s]"
 * specifically.
 *
 * `placeholder` DEFAULTS to "Add a note" -- originally "Add a note
 * (optional)" ("All the notes should have a default message: Add a
 * note (optional)"), with "(optional)" later dropped ("On Notes
 * Columns/Cards remove the (optional) from the message"). Each call
 * site used to pass its own slightly different wording ("Add a
 * relevant note (optional)", "Add a brief note (optional)", "Add a
 * note for this task") before this was standardized; a call site can
 * still override it with something more specific if a future Notes
 * field genuinely needs to, but the shared default means nobody has
 * to remember to type the standard wording by hand -- a new Notes
 * field gets it for free just by using this component without
 * passing `placeholder` at all.
 */
export default function NotesField({

    value,

    onChange,

    placeholder = "Add a note",

    disabled = false,

    className = "",

    ariaLabel

}: NotesFieldProps) {

    const listAutoFormat = useListAutoFormat(value, onChange);

    function resize(el: HTMLTextAreaElement | null) {

        if (!el) {
            return;
        }

        el.style.height = "auto";

        el.style.height = `${el.scrollHeight}px`;

    }

    const setRef = useCallback((el: HTMLTextAreaElement | null) => {

        // Merges this component's own auto-grow ref with the one
        // useListAutoFormat needs to restore the cursor after a
        // bullet/number rewrite -- see that hook's own doc comment
        // ("merge the returned textareaRef into whatever ref the
        // caller already attaches").
        listAutoFormat.textareaRef.current = el;

        resize(el);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useLayoutEffect(() => {

        resize(listAutoFormat.textareaRef.current);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return (

        <textarea

            ref={setRef}

            className={`interview-input notes-field${className ? ` ${className}` : ""}`}

            aria-label={ariaLabel}

            rows={1}

            placeholder={placeholder}

            disabled={disabled}

            value={value}

            onChange={(event) => {

                listAutoFormat.onChange(event);

                resize(event.target);

            }}

            onKeyDown={listAutoFormat.onKeyDown}

        />

    );

}
