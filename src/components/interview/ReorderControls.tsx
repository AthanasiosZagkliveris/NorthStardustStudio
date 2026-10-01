import { DragEvent, KeyboardEvent, MouseEvent, useEffect, useRef, useState } from "react";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";

import { consumeKey } from "./consumeKey.ts";

/**
 * The controls a reorderable box carries: remove, and optionally a
 * funnel that sorts its contents.
 *
 * There are no up/down arrows. A box is moved by selecting it and
 * pressing the arrow keys, or by dragging it -- see useMovableBox,
 * which also makes the box focusable so the keyboard route exists
 * for everyone, not just pointer users.
 */
export default function BoxActions({

    label,

    disabled = false,

    onRemove,

    onSort,

    sortOptions

}: {

    /** Names the thing being acted on, for the buttons' labels. */
    label: string;

    disabled?: boolean;

    onRemove?: () => void;

    /**
     * The orders the funnel offers. Shown as a short menu rather
     * than applied straight away: a button that silently reorders,
     * and reorders differently each press, gives no way to say
     * which order you actually wanted.
     */
    sortOptions?: { id: string; label: string }[];

    onSort?: (optionId: string) => void;

}) {

    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement | null>(null);
    const sortButtonRef = useRef<HTMLButtonElement | null>(null);

    // Clicking away or pressing Escape closes the menu -- what any
    // popover is expected to do, and without them the only way out
    // would be to pick something.
    useEffect(() => {

        if (!menuOpen) {
            return;
        }

        function onPointerDown(event: globalThis.MouseEvent) {
            if (!menuRef.current?.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        }

        function onKeyDown(event: globalThis.KeyboardEvent) {
            if (event.key === "Escape") {
                // Consumed, or it closes the menu and leaves the
                // page in one press (see consumeKey).
                consumeKey(event);
                setMenuOpen(false);
            }
        }

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);

        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };

    }, [menuOpen]);

    const showSort = !!onSort && !!sortOptions?.length;

    // See useFloatingPanel: this menu sits in a box head that can
    // be anywhere down a long page, so where it opens has to be
    // decided from where it actually is.
    const { panelRef: sortMenuRef, panelStyle: sortMenuStyle } =
        useFloatingPanel(menuOpen, sortButtonRef);

    return (

        <div className="strategy-box-actions">

            {showSort && (

                <div className="strategy-sort" ref={menuRef}>

                    <button
                        ref={sortButtonRef}
                        type="button"
                        className="strategy-box-action"
                        aria-label={`Sort ${label}`}
                        title={`Sort ${label}`}
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                        disabled={disabled}
                        onClick={() => setMenuOpen(open => !open)}
                    >
                        {/*
                            Drawn rather than typed: no character in
                            the font is a funnel, and the nearest ones
                            read as a plain triangle next to the "−"
                            beside them.
                        */}
                        <svg
                            className="strategy-funnel-icon"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                            focusable="false"
                        >
                            <path
                                d="M2 3h12l-4.6 5.4v4.2L6.6 14V8.4L2 3z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>

                    {menuOpen && (

                        <div
                            ref={sortMenuRef}
                            className="strategy-sort-menu"
                            style={sortMenuStyle}
                            role="menu"
                        >

                            {sortOptions?.map(option => (
                                <button
                                    key={option.id}
                                    type="button"
                                    className="strategy-sort-option"
                                    role="menuitem"
                                    onClick={() => {
                                        onSort?.(option.id);
                                        setMenuOpen(false);
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}

                        </div>

                    )}

                </div>

            )}

            {onRemove && (
                <button
                    type="button"
                    className="strategy-box-remove"
                    aria-label={`Remove ${label}`}
                    title={`Remove ${label}`}
                    disabled={disabled}
                    onClick={onRemove}
                >
                    {/* A fallback only -- the X actually shown is
                        drawn in CSS so it sits dead centre at any
                        size. See "Delete controls" in
                        conversation.css. */}
                    ×
                </button>
            )}

        </div>

    );

}

/** A copy of `list` with the entry at `from` moved to `to`: what an onReorder applies. */
export function reorder<T>(list: T[], from: number, to: number): T[] {
    const next = [...list];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
}

/**
 * Makes one list of boxes movable: select a box and press the up or
 * down arrow to move it, or drag it onto another.
 *
 * Selection is plain focus on the box itself, which is what makes
 * the keyboard route work at all -- a box has to be reachable by Tab
 * before a key press can mean anything to it. Delete removes the
 * selected box, and a click inside one of its own fields does NOT
 * select it, so typing an arrow key inside a text field moves the
 * caret rather than the box.
 */
export function useMovableBox(

    onReorder: (from: number, to: number) => void,

    onRemove?: (index: number) => void

) {

    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [overIndex, setOverIndex] = useState<number | null>(null);
    const [armed, setArmed] = useState(false);

    function boxProps(index: number, count: number, label: string) {

        return {

            tabIndex: 0,

            role: "group",

            "aria-label": `${label}. Use the arrow keys to move it, Delete to remove it.`,

            /*
                Clicking the box selects it.

                A div with tabIndex only takes focus from Tab, not
                from a click, so a box could be reordered from the
                keyboard but not selected with the mouse -- which
                reads as "not selectable" to anyone who reaches for
                the pointer first. A click landing on a field or a
                button inside is left alone: that control wants the
                focus, and stealing it would stop the box being
                usable at all.
            */
            onMouseDown: (event: MouseEvent<HTMLElement>) => {

                const target = event.target as HTMLElement;

                if (target.closest("input, textarea, select, button, a, [contenteditable]")) {
                    return;
                }

                event.currentTarget.focus();

                // These boxes nest -- a Metric sits inside an
                // Objective inside a Goal -- and the event bubbles
                // through every one of them. Without this the
                // OUTERMOST box would claim the focus last and win,
                // so clicking a Metric selected its Goal instead.
                event.stopPropagation();

            },

            draggable: armed,

            onDragStart: (event: DragEvent<HTMLElement>) => {
                // Some browsers refuse to start a drag without it.
                event.dataTransfer.setData("text/plain", String(index));
                event.dataTransfer.effectAllowed = "move";
                setDragIndex(index);
            },

            onDragOver: (event: DragEvent<HTMLElement>) => {
                if (dragIndex === null) {
                    return;
                }
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                setOverIndex(index);
            },

            onDrop: (event: DragEvent<HTMLElement>) => {

                event.preventDefault();
                event.stopPropagation();

                if (dragIndex !== null && dragIndex !== index) {
                    onReorder(dragIndex, index);
                }

                setDragIndex(null);
                setOverIndex(null);
                setArmed(false);

            },

            onDragEnd: () => {
                setDragIndex(null);
                setOverIndex(null);
                setArmed(false);
            },

            onKeyDown: (event: KeyboardEvent<HTMLElement>) => {

                // Only when the BOX itself is the focused element.
                // Inside one of its fields the same keys belong to
                // that field, and stealing them there would make
                // text impossible to edit.
                if (event.target !== event.currentTarget) {
                    return;
                }

                if (event.key === "ArrowUp" && index > 0) {
                    event.preventDefault();
                    onReorder(index, index - 1);
                    return;
                }

                if (event.key === "ArrowDown" && index < count - 1) {
                    event.preventDefault();
                    onReorder(index, index + 1);
                    return;
                }

                if ((event.key === "Delete" || event.key === "Backspace") && onRemove) {
                    event.preventDefault();
                    onRemove(index);
                }

            },

            className: overIndex === index && dragIndex !== null && dragIndex !== index
                ? "strategy-drop-target"
                : ""

        };

    }

    /**
     * The grip. Dragging only starts from here, so a drag begun on a
     * text field inside a box selects text as it normally would
     * instead of dragging the box out from under the caret.
     *
     * Hidden from assistive technology: it is a grip, not a control,
     * and the arrow keys already do its job without a pointer.
     */
    const handleProps = {

        onMouseDown: () => setArmed(true),
        onMouseUp: () => setArmed(false),

        "aria-hidden": true

    };

    return { boxProps, handleProps };

}

/**
 * Drag-only reordering for a plain list of lines (see
 * NumberedListInput), where each line is a single field rather than
 * a box that can hold focus of its own.
 */
export function useListDrag(onReorder: (from: number, to: number) => void) {

    const movable = useMovableBox(onReorder);

    return {

        itemProps: (index: number) => {

            const { tabIndex, role, onKeyDown, ...rest } =
                movable.boxProps(index, Number.MAX_SAFE_INTEGER, "");

            // Deliberately dropped: a line is already reachable
            // through its own input, and a second tab stop wrapping
            // it would just double the number of stops in a list.
            void tabIndex;
            void role;
            void onKeyDown;

            return { ...rest, "aria-label": undefined };

        },

        handleProps: movable.handleProps

    };

}
