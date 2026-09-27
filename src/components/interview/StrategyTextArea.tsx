import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { useListAutoFormat } from "../../hooks/useListAutoFormat.ts";

/**
 * A multi-line answer field on the Strategy System's pages.
 *
 * Wires up `useListAutoFormat` -- the same list behaviour every
 * other multi-line field in the app already has: typing "- ", "* "
 * or "1. " at the start of a line turns it into a real bullet or
 * numbered item, Enter continues the list, and Enter on an empty
 * item leaves it. The Strategy pages were written with plain
 * <textarea>s and so were the only place in the app where that did
 * not work.
 *
 * It also never opens SHORTER THAN ITS OWN PLACEHOLDER. A
 * placeholder that says what the answer has to cover is only worth
 * writing if it can be read, and the Business System's Foundation
 * page puts a field's whole parameter list in one -- six named
 * parameters, which is six lines in a quarter-page column and was
 * being cut off after two. A short placeholder ("Description")
 * already fits, so nothing changes where nothing was wrong.
 *
 * Everything else is a plain textarea: same classes, same value,
 * same onChange.
 */
export default function StrategyTextArea({

    className,

    ariaLabel,

    placeholder,

    disabled = false,

    value,

    onChange

}: {

    className: string;

    ariaLabel: string;

    placeholder?: string;

    disabled?: boolean;

    value: string;

    onChange: (value: string) => void;

}) {

    const listAutoFormat = useListAutoFormat(value, onChange);

    /**
     * Keeps the box the size of what is in it -- its placeholder
     * while it is empty, its answer once there is one.
     *
     * The inline height is CLEARED FIRST, every time. That hands the
     * box back to its own CSS, which is both how it shrinks when
     * text is deleted and how the measurement stays honest: with a
     * previous height still set, `scrollHeight` would report that
     * height rather than what the content needs.
     *
     * Then it only grows. `scrollHeight` exceeds `clientHeight`
     * exactly when something is being clipped; where the content
     * already fits, no height is set at all and the box keeps the
     * one its CSS gives it -- .strategy-note's calc(3em + 18px), the
     * Value Proposition's measured height. So the floor is always
     * the designed size, never one line's worth.
     *
     * The borders are added back on. `box-sizing` is border-box
     * here, so a height sizes the BORDER box while `scrollHeight`
     * counts the content and padding but not the borders -- setting
     * one straight from the other left the box 2px short and clipped
     * the last line by exactly that.
     */
    const element = useRef<HTMLTextAreaElement | null>(null);

    const fitToContent = useCallback(() => {

        const field = element.current;

        if (!field) {
            return;
        }

        field.style.height = "";

        if (field.scrollHeight <= field.clientHeight) {
            return;
        }

        const borders = field.offsetHeight - field.clientHeight;

        field.style.height = (field.scrollHeight + borders) + "px";

    }, []);

    useLayoutEffect(fitToContent, [fitToContent, value, placeholder]);

    /*
        The wrapped height depends on the field's WIDTH, and these
        columns collapse from four to two to one as the window
        narrows -- so it has to be measured again when that happens.

        Width only. Setting the height changes the field's own
        height, which the observer would see as another resize and
        answer by measuring again: the classic ResizeObserver loop.
        Ignoring height breaks it, and height is not what the
        wrapping depends on anyway.
    */
    const lastWidth = useRef(0);

    useEffect(() => {

        const field = element.current;

        if (!field || typeof ResizeObserver === "undefined") {
            return;
        }

        const observer = new ResizeObserver(() => {

            const width = field.clientWidth;

            if (width === lastWidth.current) {
                return;
            }

            lastWidth.current = width;

            fitToContent();

        });

        observer.observe(field);

        return () => observer.disconnect();

    }, [fitToContent]);

    return (

        <textarea

            ref={(node) => {
                element.current = node;
                listAutoFormat.textareaRef.current = node;
            }}

            className={className}

            aria-label={ariaLabel}

            placeholder={placeholder}

            disabled={disabled}

            value={value}

            onChange={listAutoFormat.onChange}

            onKeyDown={listAutoFormat.onKeyDown}

        />

    );

}
