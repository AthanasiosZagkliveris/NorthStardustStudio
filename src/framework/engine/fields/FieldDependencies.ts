/*
    CHAINED ANSWERS: an answer that depends on another waits for it.
    Someone who does not yet know the country to register in does not
    know the city either -- so a dependent field is FROZEN (shown
    disabled, with "Choose a country first." in its status line) until
    the answer it depends on is given. What a frozen field already holds
    is kept, and shows again once the parent is answered; where the new
    parent answer makes it invalid (a state of another country), the
    page's own rule for that answer applies, as before.

    The chains are listed in docs/ai/06-framework-conventions-and-patterns.md
    ("Chained answers"). `frozen` chains are enforced where their fields
    are drawn (FrozenUntil, fieldMarks.tsx); `conditional` ones need
    nothing more, because the dependent fields are not drawn at all
    until the parent is answered.
*/

/** A frozen chain's hint for its dependents: "Choose a country first." */
export function waitingHint(parent: string): string {
    const word = parent.trim().toLowerCase();
    return "Choose " + (/^[aeiou]/.test(word) ? "an " : "a ") + word + " first.";
}
