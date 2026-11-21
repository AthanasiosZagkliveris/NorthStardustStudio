/*
    SMALL READERS AND IDS, in one place: the answer normalisers in
    AnswerUtils, DemandCapacity and FinancialModel read stored values
    the same way and draw ids the same way.
*/

/** A stored value as a plain object; anything else reads as empty. */
export function asObject(value: unknown): Record<string, unknown> {
    return value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};
}

/** A stored value as text; anything else reads as "". */
export function asText(value: unknown): string {
    return typeof value === "string" ? value : "";
}

/** Ids only have to be unique within one stored answer. */
export function randomId(prefix: string): string {
    return prefix + "-" + Math.random().toString(36).slice(2, 10);
}
