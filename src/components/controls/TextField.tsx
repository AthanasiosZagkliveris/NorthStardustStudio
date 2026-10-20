import { KeyboardEvent, useCallback, useLayoutEffect, useRef } from "react";

import { useAutoGrow } from "../../hooks/useAutoGrow.ts";
import { useListAutoFormat } from "../../hooks/useListAutoFormat.ts";

/**
 * THE TEXT FIELD: every free-text cell (a note, a description, a table cell, an answer) is this one component -- a text area that grows with its words (never scrolls inside itself) and carries the app's list writing ("- " or "1. " at the start of a line becomes a bullet or a number; Enter continues the list). What a place adds is only its class (width, font) and its wording; `grow={false}` keeps a fixed height; `maxLines` caps the growth; `list={false}` is for a name or a one-line purpose, where lists do not apply.
 */
export default function TextField({ value, onChange, className, ariaLabel, placeholder, disabled = false, rows = 1, list = true, grow = true, maxLines, onKeyDown, elementRef }: {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    ariaLabel?: string;
    placeholder?: string;
    disabled?: boolean;
    rows?: number;
    list?: boolean;
    grow?: boolean;
    /** The most lines it grows to (a name: two); past them the box scrolls. */
    maxLines?: number;
    /** The place's own key handling (for example linking with #); it replaces the list writing. */
    onKeyDown?: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    /** The box itself, for a place that moves the cursor or the focus. */
    elementRef?: (element: HTMLTextAreaElement | null) => void;
}) {
    const element = useRef<HTMLTextAreaElement | null>(null);
    const listAutoFormat = useListAutoFormat(value, onChange);
    const setRefs = useCallback((node: HTMLTextAreaElement | null) => {
        element.current = node;
        listAutoFormat.textareaRef.current = node;
        elementRef?.(node);
    }, [listAutoFormat.textareaRef, elementRef]);
    useAutoGrow(element, value, grow);
    // The height of the most lines of the box's own text, its padding and its edge; past them it scrolls.
    useLayoutEffect(() => {
        const box = element.current;
        if (!box || maxLines === undefined) {
            return;
        }
        const style = getComputedStyle(box);
        const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.25;
        const room = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
        box.style.maxHeight = (maxLines * line + room) + "px";
        box.style.overflowY = box.scrollHeight > box.clientHeight + 1 ? "auto" : "hidden";
    }, [value, maxLines]);
    return (
        <textarea
            ref={setRefs}
            className={className}
            aria-label={ariaLabel}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            value={value}
            onChange={list ? listAutoFormat.onChange : (event) => onChange(event.target.value)}
            onKeyDown={onKeyDown ?? (list ? listAutoFormat.onKeyDown : undefined)}
        />
    );
}
