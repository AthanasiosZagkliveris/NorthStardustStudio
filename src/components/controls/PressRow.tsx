import { HTMLAttributes, KeyboardEvent } from "react";

/**
 * THE PRESS ROW: a row or a handle that is pressed to open or choose something and holds more than a button's words (a number, a title and a status; a vertical label) is this one
 * component. It is a `div` or an `li` with `role="button"`, a place in the tab order and the keys of a button (Enter and Space press it), so no place writes the key handling again.
 * `pressed` is its state; `onReach` is what the pointer entering it or the keyboard focus does (the rails and the lists that show what is under them); `ownKeysOnly` leaves the keys
 * pressed in something it holds (a text box) to that thing.
 */
export default function PressRow({ as = "div", pressed, onPress, onReach, ownKeysOnly = false, ...rest }: Omit<HTMLAttributes<HTMLElement>, "role" | "tabIndex" | "onClick" | "onKeyDown" | "onFocus" | "onMouseEnter"> & {
    as?: "div" | "li";
    pressed?: boolean;
    onPress: () => void;
    onReach?: () => void;
    ownKeysOnly?: boolean;
}) {
    const Tag = as;
    const keys = (event: KeyboardEvent<HTMLElement>) => {
        if (ownKeysOnly && event.target !== event.currentTarget) {
            return;
        }
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onPress();
        }
    };
    return (
        <Tag
            role="button"
            tabIndex={0}
            aria-pressed={pressed}
            onClick={onPress}
            onKeyDown={keys}
            onMouseEnter={onReach}
            onFocus={onReach}
            {...rest}
        />
    );
}
