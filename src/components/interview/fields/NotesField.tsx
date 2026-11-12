import TextField from "../../controls/TextField.tsx";

interface NotesFieldProps {

    value: string;

    onChange: (value: string) => void;

    placeholder?: string;

    /**
     * Accessible name for the notes field -- see
     * InterviewInput.ariaLabel. A Notes box shows no placeholder (owner,
     * 2026-11-12): the notes are the user's own, to use as each wants.
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
 * `placeholder` is empty unless a call site passes one: a Notes box says nothing before the user writes
 * (owner, 2026-11-12: "Do not place any message in the text cells" -- the notes work as each user wants; earlier
 * every Notes box said "Add a note").
 */
export default function NotesField({

    value,

    onChange,

    placeholder,

    disabled = false,

    className = "",

    ariaLabel

}: NotesFieldProps) {

    return (

        <TextField

            className={`interview-input notes-field${className ? ` ${className}` : ""}`}

            ariaLabel={ariaLabel}

            placeholder={placeholder}

            disabled={disabled}

            value={value}

            onChange={onChange}

        />

    );

}
