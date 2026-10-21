/**
 * THE STATE OF A SINGLE ANSWER: the hooks that must run on every render whatever the Answer Structure is (the active variant card, the active card of a card list,
 * the drag-to-scroll rows, the table's columns). Split out of AnswerRenderer.tsx.
 */
import { useEffect, useMemo, useState } from "react";
import { AnswerType } from "../../../../framework/enums/AnswerType.ts";
import { CardListAnswerValue, ChecklistItemValue } from "../../../../framework/engine/AnswerUtils.ts";
import { useDragToScroll } from "../../../../hooks/useDragToScroll.ts";
import { createCardListItemId, createChecklistItemId, toTableColumns } from "./shared.tsx";
import type { AnswerProps } from "./scope.ts";

export function useAnswerState({ definition, value, onChange, resolveDynamicOptions, dynamicOptionsDependency }: Pick<AnswerProps, "definition" | "value" | "onChange" | "resolveDynamicOptions" | "dynamicOptionsDependency">) {

    // Hooks must run unconditionally on every render (regardless
    // of which Answer Structure this Section uses), so the active
    // Fixed Variant Text card and the active Card List card are
    // both tracked here rather than inside the switch case below.
    const fixedVariantOptions =
        definition.type === AnswerType.FixedVariantText
            ? (definition.variants ?? [])
            : [];
    const [activeVariantId, setActiveVariantId] = useState<string | undefined>(
        fixedVariantOptions[0]?.id
    );
    const cardListOptions =
        definition.type === AnswerType.CardList
            ? (definition.cards ?? [])
            : [];
    const [activeCardId, setActiveCardId] = useState<string | undefined>(
        cardListOptions[0]?.id
    );
    // Lets the user press anywhere on these rows' own background
    // and drag left/right to scroll them, same as DynamicTable's
    // own data table -- see useDragToScroll. `variantCardsScrollRef`
    // covers both the Fixed Variant Text and Card List variant-tab
    // rows below (only one of the two ever mounts per Section, so
    // sharing one ref between them is safe); `profileCardsScrollRef`
    // covers the Profile Cards row.
    const variantCardsScrollRef = useDragToScroll<HTMLDivElement>();
    const profileCardsScrollRef = useDragToScroll<HTMLDivElement>();
    // Self-healing safety net for sessions saved before Checklist/
    // Card List always seeded a first entry (see defaultAnswerValue):
    // if a saved response somehow has zero items, add one back --
    // mirrors DynamicTable's own "always at least one row" effect.
    useEffect(() => {

        if (definition.type !== AnswerType.Checklist) {
            return;
        }

        const items = Array.isArray(value) ? value as ChecklistItemValue[] : [];

        if (items.length === 0) {
            onChange([{ id: createChecklistItemId(), text: "", checked: false }]);
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [definition.type, Array.isArray(value) ? value.length : -1]);
    useEffect(() => {

        if (definition.type !== AnswerType.CardList) {
            return;
        }

        const cardsDef = definition.cards ?? [];

        const values: CardListAnswerValue =
            value && typeof value === "object" && !Array.isArray(value)
                ? value as CardListAnswerValue
                : {};

        const missing = cardsDef.filter(card => !(values[card.id]?.length));

        if (missing.length > 0) {

            const next = { ...values };

            missing.forEach(card => {
                next[card.id] = [{ id: createCardListItemId(), text: "" }];
            });

            onChange(next);

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [definition.type, definition.cards, value]);
    // Built unconditionally (Table is only one of the possible Answer
    // Structures, same reasoning as the other hooks above) and
    // memoized so a Table Section's <DynamicTable> (see the Table
    // case below) gets the SAME `columns` array reference across a
    // keystroke-driven re-render, not a freshly rebuilt one every
    // time -- letting `DynamicTable`'s own `React.memo` (see
    // DynamicTable.tsx) actually skip re-rendering the rest of the
    // Table when only some OTHER Section on the page changed, rather
    // than always seeing "columns changed" and re-rendering anyway.
    // `definition` is referentially stable for the lifetime of one
    // Section (Conversation.tsx keys <AnswerRenderer> by Section
    // number, so switching Sections remounts this component instead
    // of just changing the prop), so this only recomputes when it
    // actually needs to -- PLUS whenever `dynamicOptionsDependency`
    // changes (defaulting to this instance's own `value`, so a
    // plain, non-Multi-Part Table still only recomputes on its own
    // edits exactly as before). A Multi-Part Section's sibling parts
    // instead all share the WHOLE Section's combined value as this
    // dependency (see MultiPartAnswerRenderer), so a self-
    // referencing `dynamicSource` (e.g. Financial Risk's Evaluation
    // table sourcing its "Risk" dropdown from the Description
    // table's own "Risk" column, both parts of the same Section)
    // re-resolves its live options as the user types into the
    // SOURCE part, not just once at mount.
    const tableColumns = useMemo(
        () => toTableColumns(definition.table?.columns ?? [], resolveDynamicOptions),
        [definition, resolveDynamicOptions, dynamicOptionsDependency ?? value]
    );

    return { fixedVariantOptions, activeVariantId, setActiveVariantId, cardListOptions, activeCardId, setActiveCardId, variantCardsScrollRef, profileCardsScrollRef, tableColumns };

}
