import MenuOption from "../../controls/MenuOption.tsx";
import { DragEvent, KeyboardEvent, MouseEvent, ReactNode, useLayoutEffect, useRef, useState } from "react";
import AddButton from "../../controls/AddButton.tsx";
import RemoveButton from "../../controls/RemoveButton.tsx";
import { usePopupDismiss } from "../../controls/PopupPanel.tsx";
import FunnelButton from "../../controls/FunnelButton.tsx";
import { createPortal } from "react-dom";

import { useFloatingPanel } from "../../../hooks/useFloatingPanel.ts";


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

    onAdd,

    addLabel,

    onSort,

    sortOptions,

    menuContent,

    sortSelected,

    keepOpen = false

}: {

    /** Names the thing being acted on, for the buttons' labels. */
    label: string;

    disabled?: boolean;

    onRemove?: () => void;

    /** A "+" beside the x: adds a card related to this one (named by `addLabel`: "Goal", "Metric"...). */
    onAdd?: () => void;

    addLabel?: string;

    /**
     * The orders the funnel offers. Shown as a short menu rather
     * than applied straight away: a button that silently reorders,
     * and reorders differently each press, gives no way to say
     * which order you actually wanted.
     */
    sortOptions?: { id: string; label: string }[];

    onSort?: (optionId: string) => void;

    /**
     * More for the funnel's drop-down than orders: filters, above the orders (the Inventory overlay's). The drop-down is then wider
     * and scrolls, and stays open while a choice is made.
     */
    menuContent?: ReactNode;

    /** The order now in use: its option carries a bullet. */
    sortSelected?: string;

    /** Choosing an order leaves the drop-down open. */
    keepOpen?: boolean;

}) {

    const [menuOpen, setMenuOpen] = useState(false);

    const menuRef = useRef<HTMLDivElement | null>(null);
    const sortButtonRef = useRef<HTMLButtonElement | null>(null);
    // The wide menu (the Inventory funnel) is drawn outside the box around its button, OUTWARD -- beside the dialog, over no tile -- where the window has room for
    // it there, else under the funnel, inside the window.
    const wideRef = useRef<HTMLDivElement | null>(null);
    const wideHost = menuOpen && menuContent ? sortButtonRef.current?.closest<HTMLElement>(".section-tile-overlay") ?? document.body : null;
    useLayoutEffect(() => {
        const menu = wideRef.current;
        const button = sortButtonRef.current;
        if (!menuOpen || !menu || !button) {
            return;
        }
        const dialogNode = button.closest<HTMLElement>(".section-tile-dialog");
        // The window is drawn outside the dialog's box: it takes the card's colour (its hue) from the dialog.
        if (dialogNode) {
            menu.style.setProperty("--strategy-theme-hue", getComputedStyle(dialogNode).getPropertyValue("--strategy-theme-hue") || "0");
        }
        const freeDialog = () => {
            if (dialogNode) {
                ["width", "marginLeft", "marginRight", "maxWidth"].forEach(property => { dialogNode.style[property as "width"] = ""; });
            }
        };
        const place = () => {
            freeDialog();
            menu.style.maxHeight = "";
            menu.style.width = "";
            menu.style.minWidth = "";
            const dialog = dialogNode?.getBoundingClientRect();
            const width = menu.getBoundingClientRect().width;
            const anchor = button.getBoundingClientRect();
            let left: number;
            let top: number;
            // ALWAYS OUTWARD: right of the dialog if it fits, else left of it, else the dialog gives way (it narrows, its left edge kept) so that the window stands whole
            // on its right; inside the dialog, under the funnel, only where even that would leave the dialog under 640px.
            const margin = 8 + 12;
            if (dialog && dialogNode) {
                const roomRight = window.innerWidth - dialog.right - margin;
                const roomLeft = dialog.left - margin;
                let side: "right" | "left" | null = roomRight >= width ? "right" : roomLeft >= width ? "left" : null;
                if (!side && window.innerWidth - width - margin - dialog.left >= 640) {
                    dialogNode.style.marginLeft = dialog.left + "px";
                    dialogNode.style.marginRight = "auto";
                    dialogNode.style.width = window.innerWidth - width - margin - dialog.left + "px";
                    dialogNode.style.maxWidth = "none";
                    side = "right";
                }
                if (side) {
                    const box = dialogNode.getBoundingClientRect();
                    left = side === "right" ? box.right + 8 : box.left - 8 - width;
                    // (Its top stands on the dialog's top edge, its foot at the dialog's foot.)
                    top = Math.max(box.top, 8);
                    menu.style.left = left + "px";
                    menu.style.top = top + "px";
                    menu.style.maxHeight = Math.max(160, Math.min(box.bottom - top, window.innerHeight - top - 12)) + "px";
                    menu.setAttribute("data-outward", side);
                    return;
                }
            }
            left = Math.max(8, Math.min(anchor.right - width, window.innerWidth - 8 - width));
            top = anchor.bottom + 4;
            menu.removeAttribute("data-outward");
            menu.style.left = left + "px";
            menu.style.top = top + "px";
            menu.style.maxHeight = Math.max(160, window.innerHeight - top - 12) + "px";
        };
        place();
        window.addEventListener("resize", place);
        return () => {
            window.removeEventListener("resize", place);
            freeDialog();
        };
    }, [menuOpen]);

    // Clicking away or pressing Escape closes the menu -- what any
    // popover is expected to do, and without them the only way out
    // would be to pick something.
    usePopupDismiss(menuOpen, [menuRef, wideRef], () => setMenuOpen(false));

    const showSort = (!!onSort && !!sortOptions?.length) || !!menuContent;

    // See useFloatingPanel: this menu sits in a box head that can
    // be anywhere down a long page, so where it opens has to be
    // decided from where it actually is.
    const { panelRef: sortMenuRef, panelStyle: sortMenuStyle } =
        useFloatingPanel(menuOpen, sortButtonRef);

    return (

        <div className="strategy-box-actions">

            {showSort && (

                <div className="strategy-sort" ref={menuRef}>

                    <FunnelButton
                        ref={sortButtonRef}
                        aria-label={`Sort ${label}`}
                        aria-expanded={menuOpen}
                        aria-haspopup="menu"
                        disabled={disabled}
                        onClick={() => setMenuOpen(open => !open)}
                    />

                    {menuOpen && (() => {
                        const menuNode = (

                        <div
                            ref={menuContent ? wideRef : sortMenuRef}
                            className={"strategy-sort-menu" + (menuContent ? " strategy-sort-menu-wide" : "")}
                            style={menuContent ? { position: "fixed", right: "auto" } : sortMenuStyle}
                            role="menu"
                        >

                            {menuContent}

                            {sortOptions?.map(option => (
                                <MenuOption
                                    key={option.id}
                                    chosen={sortSelected === option.id}
                                    marked={sortSelected !== undefined}
                                    onClick={() => {
                                        onSort?.(option.id);
                                        if (!keepOpen) {
                                            setMenuOpen(false);
                                        }
                                    }}
                                >
                                    {option.label}
                                </MenuOption>
                            ))}

                        </div>

                        );
                        return menuContent && wideHost ? createPortal(menuNode, wideHost) : menuNode;
                    })()}

                </div>

            )}

            {onAdd && (
                <AddButton shape="box" small
                    aria-label={`Add ${addLabel ?? "card"}`}
                    disabled={disabled}
                    onClick={onAdd} />
            )}

            {onRemove && (
                <RemoveButton className="card-remove"
                    aria-label={`Remove ${label}`}
                    disabled={disabled}
                    onClick={onRemove} />
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
