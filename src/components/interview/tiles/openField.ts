
import { systems } from "../../../data/systems";
import { parseFieldKey, type FieldKey } from "../../../framework/engine/FieldKeys";
import type { FrameworkSystem } from "../../../types/system";

/**
 * Where a field is: the System's interview, opened at the field's
 * page, with the field to focus (Conversation.tsx hands it to
 * focusField, jumpTo.ts). `anchors` is the path of cards to unfold on
 * the way, innermost first, as recorded with the field's annotation.
 * Null for a key that names no System.
 */
export function fieldLocation(key: FieldKey, anchors: readonly string[] = []): {
    pathname: "/introduction";
    state: {
        system: FrameworkSystem;
        targetSectionNumber: number;
        focusField: { key: FieldKey; anchors: string[] };
    };
} | null {

    const address = parseFieldKey(key);
    const system = address ? systems.find(candidate => candidate.number === address.systemNumber) : undefined;

    if (!address || !system) {
        return null;
    }

    return {
        pathname: "/introduction",
        state: {
            system,
            targetSectionNumber: address.sectionNumber,
            focusField: { key, anchors: [...anchors] }
        }
    };

}
