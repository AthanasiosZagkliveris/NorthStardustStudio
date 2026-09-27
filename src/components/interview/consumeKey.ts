import { KeyboardEvent as ReactKeyboardEvent } from "react";

/**
 * A key a popup has just answered, stopped from reaching anything
 * else.
 *
 * ESCAPE IS THE ONE THAT MATTERS. The interview page listens for it
 * on the WINDOW and treats it as Back (see Conversation.tsx), so a
 * popup that closes on Escape without consuming the key closes
 * itself AND leaves the page -- one press, two actions, and the
 * second one throws away where the reader was. Every floating panel
 * in this app had that: opening an "i" and pressing Escape to
 * dismiss it navigated out of the interview.
 *
 * `stopImmediatePropagation` ON THE NATIVE EVENT, not React's
 * `stopPropagation` alone. React listens at its own root container,
 * and a listener bound to the window itself is above that -- so
 * only stopping the native event keeps it from getting there. The
 * native event is the event itself when the caller is a plain
 * `document` listener, and `.nativeEvent` when it is a React
 * handler; this takes either.
 *
 * Not only for Escape: a panel that answers Enter or an arrow key
 * owes the page the same courtesy, which is what the suggestion
 * list in NumberedListInput uses it for.
 */
export function consumeKey(
    event: ReactKeyboardEvent | KeyboardEvent
): void {

    event.preventDefault();

    event.stopPropagation();

    const native = "nativeEvent" in event ? event.nativeEvent : event;

    native.stopImmediatePropagation();

}
