import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

import InterviewInput from "./InterviewInput.tsx";
import DynamicTable, { TableColumn, TableRow } from "./DynamicTable.tsx";

import { AnswerDefinition, TableColumnDefinition } from "../../framework/model/index.ts";

import { AnswerType } from "../../framework/enums/AnswerType.ts";
import {
    CardListAnswerValue,
    CardListItemValue,
    ChecklistItemValue,
    ProfileCardValue,
    ProfileCardsAnswerValue,
    isDateColumn,
    visibleTableColumns
} from "../../framework/engine/AnswerUtils.ts";

let checklistItemCounter = 0;

/**
 * Creates a unique id for a newly added Checklist
 * item (used only as a React key / update target,
 * never persisted or exported).
 */
function createChecklistItemId(): string {

    checklistItemCounter += 1;

    return `checklist-item-${Date.now()}-${checklistItemCounter}`;

}

let cardListItemCounter = 0;

/**
 * Creates a unique id for a newly added Card List
 * entry (used only as a React key / update target,
 * never persisted or exported).
 */
function createCardListItemId(): string {

    cardListItemCounter += 1;

    return `cardlist-item-${Date.now()}-${cardListItemCounter}`;

}

let profileCardCounter = 0;

/**
 * Creates a unique id for a newly added Profile
 * Card (used only as a React key / update target,
 * never persisted or exported).
 */
function createProfileCardId(): string {

    profileCardCounter += 1;

    return `profile-card-${Date.now()}-${profileCardCounter}`;

}

/**
 * A Profile Card's textarea that grows tall enough to
 * show its entire value with no internal scrolling --
 * matches DynamicTable's AutoGrowTextarea, so a long
 * answer stretches the card's *natural* content height
 * (which ProfileCardInner then measures) instead of
 * scrolling inside a fixed-size box.
 */
function AutoGrowTextarea({

    className,

    value,

    placeholder,

    disabled,

    onChange

}: {

    className: string;

    value: string;

    placeholder?: string;

    disabled?: boolean;

    onChange: (value: string) => void;

}) {

    const ref = useRef<HTMLTextAreaElement | null>(null);

    function resize(el: HTMLTextAreaElement | null) {

        if (!el) {
            return;
        }

        el.style.height = "auto";

        el.style.height = `${el.scrollHeight}px`;

    }

    useLayoutEffect(() => {

        resize(ref.current);

    }, [value]);

    return (

        <textarea

            ref={ref}

            className={className}

            rows={1}

            placeholder={placeholder}

            disabled={disabled}

            value={value}

            onChange={(event) => {

                onChange(event.target.value);

                resize(event.target);

            }}

        />

    );

}

/**
 * Wraps a Profile Card's content. Cards sit in a
 * horizontal, non-wrapping row (see .profile-cards-row)
 * but deliberately do NOT scale their content down or
 * clip it: a card with a lot of text simply grows taller
 * instead (its subtitle textareas are AutoGrowTextarea,
 * so they grow with their own content), and every card in
 * the row stretches to match the tallest one via
 * .profile-cards-row's align-items:stretch. This is just
 * a thin, named wrapper for the padding/layout styling in
 * .profile-card-inner -- no measurement or scaling logic
 * needed.
 */
function ProfileCardInner({ children }: { children: ReactNode }) {

    return (

        <div className="profile-card-inner">

            {children}

        </div>

    );

}

interface AnswerRendererProps {

    definition: AnswerDefinition;

    value: unknown;

    onChange: (value: unknown) => void;

    disabled?: boolean;

    /**
     * Resolves a Table column's live dropdown
     * options from another Section's Card List
     * response (see TableColumnDefinition.dynamicSource).
     *
     * Only needed when this Section's Table has a
     * column that declares a `dynamicSource`;
     * omitted (or returning []) elsewhere.
     */
    resolveDynamicOptions?: (sectionTitle: string, cardTitle: string) => string[];

}

/**
 * Adapts a resolved Answer Definition's
 * table columns into the shape expected
 * by DynamicTable.
 *
 * The "#" row-index column is rendered
 * automatically by DynamicTable, so any
 * column explicitly titled "#" is dropped
 * here to avoid a duplicate.
 */
function resolveColumnType(
    column: TableColumnDefinition
): TableColumn["type"] {

    if (column.dynamicSource) {
        return "dynamic-select";
    }

    if (column.autofill) {
        return "autofill";
    }

    if (column.field) {
        return "field";
    }

    if (isDateColumn(column.title)) {
        return "date";
    }

    return "text";

}

function toTableColumns(
    columns: TableColumnDefinition[],
    resolveDynamicOptions?: (sectionTitle: string, cardTitle: string) => string[]
): TableColumn[] {

    return visibleTableColumns(columns)

        .map(column => ({

            id: column.id,

            title: column.title,

            type: resolveColumnType(column),

            field: column.field,

            options:
                column.dynamicSource && resolveDynamicOptions
                    ? resolveDynamicOptions(
                        column.dynamicSource.sectionTitle,
                        column.dynamicSource.cardTitle
                    )
                    : undefined,

            repeatable: column.repeatable,

            groupAnchor: column.groupAnchor

        }));

}

export default function AnswerRenderer({

    definition,

    value,

    onChange,

    disabled = false,

    resolveDynamicOptions

}: AnswerRendererProps) {

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

    switch (definition.type) {

        case AnswerType.FreeText:

            return (

                <InterviewInput

                    mode="textarea"

                    value={String(value ?? "")}

                    disabled={disabled}

                    onChange={onChange}

                />

            );

        case AnswerType.FixedVariantText: {

            const variants = fixedVariantOptions;

            const values: Record<string, string> =
                value && typeof value === "object" && !Array.isArray(value)
                    ? (value as Record<string, string>)
                    : {};

            const activeVariant =
                variants.find(variant => variant.id === activeVariantId) ??
                variants[0];

            return (

                <div className="answer-variant-cards-wrapper">

                    <div className="answer-variant-cards">

                        {variants.map(variant => {

                            const filled =
                                typeof values[variant.id] === "string" &&
                                values[variant.id].trim().length > 0;

                            const isActive = variant.id === activeVariant?.id;

                            return (

                                <button

                                    type="button"

                                    key={variant.id}

                                    className={
                                        "answer-variant-card" +
                                        (isActive ? " active" : "") +
                                        (filled ? " filled" : "")
                                    }

                                    onClick={() => setActiveVariantId(variant.id)}

                                >

                                    {variant.title}

                                    {filled && (
                                        <span className="answer-variant-card-check">
                                            ✓
                                        </span>
                                    )}

                                </button>

                            );

                        })}

                    </div>

                    {activeVariant && (

                        <div className="answer-variant-editor">

                            <InterviewInput

                                mode="textarea"

                                value={String(values[activeVariant.id] ?? "")}

                                disabled={disabled}

                                onChange={(next) =>

                                    onChange({

                                        ...values,

                                        [activeVariant.id]: next

                                    })

                                }

                            />

                        </div>

                    )}

                </div>

            );

        }

        case AnswerType.Table: {

            const columns = toTableColumns(
                definition.table?.columns ?? [],
                resolveDynamicOptions
            );

            const rows: TableRow[] = Array.isArray(value) ? value as TableRow[] : [];

            return (

                <DynamicTable

                    columns={columns}

                    value={rows}

                    disabled={disabled}

                    onChange={onChange}

                    rowNumberLabel={definition.table?.rowNumberLabel}

                />

            );

        }

        case AnswerType.Checklist: {

            const items: ChecklistItemValue[] =
                Array.isArray(value) ? value as ChecklistItemValue[] : [];

            function updateItems(nextItems: ChecklistItemValue[]) {
                onChange(nextItems);
            }

            function addItem() {

                updateItems([
                    ...items,
                    { id: createChecklistItemId(), text: "", checked: false }
                ]);

            }

            function removeItem(itemId: string) {

                // At least one item always stays -- clear it back
                // to blank instead of removing the last row, the
                // same convention DynamicTable uses for its last
                // remaining row.
                if (items.length <= 1) {

                    updateItems(items.map(candidate =>
                        candidate.id === itemId
                            ? { ...candidate, text: "", checked: false }
                            : candidate
                    ));

                    return;

                }

                updateItems(items.filter(candidate => candidate.id !== itemId));

            }

            function moveItem(index: number, direction: -1 | 1) {

                const targetIndex = index + direction;

                if (targetIndex < 0 || targetIndex >= items.length) {
                    return;
                }

                const next = [...items];

                const [moved] = next.splice(index, 1);
                next.splice(targetIndex, 0, moved);

                updateItems(next);

            }

            return (

                <div className="answer-checklist">

                    {items.map((item, index) => (

                        <div key={item.id} className="answer-checklist-row">

                            <input
                                type="checkbox"
                                className="answer-checklist-checkbox"
                                checked={item.checked}
                                disabled={disabled}
                                onChange={() =>

                                    updateItems(items.map(candidate =>
                                        candidate.id === item.id
                                            ? { ...candidate, checked: !candidate.checked }
                                            : candidate
                                    ))

                                }
                            />

                            <input
                                type="text"
                                className="answer-checklist-input"
                                placeholder="Checklist item"
                                disabled={disabled}
                                value={item.text}
                                onChange={(event) =>

                                    updateItems(items.map(candidate =>
                                        candidate.id === item.id
                                            ? { ...candidate, text: event.target.value }
                                            : candidate
                                    ))

                                }
                            />

                            {/* All four row controls grouped together on
                                one side, matching DynamicTable's single
                                combined actions cluster (rather than
                                splitting move to one end and remove/add
                                to the other). */}
                            <div className="dynamic-table-row-actions">

                                <div className="dynamic-table-row-move">

                                    <button
                                        type="button"
                                        className="dynamic-table-row-move-up"
                                        aria-label="Move item up"
                                        title="Move item up"
                                        disabled={disabled || index === 0}
                                        onClick={() => moveItem(index, -1)}
                                    >
                                        ▲
                                    </button>

                                    <button
                                        type="button"
                                        className="dynamic-table-row-move-down"
                                        aria-label="Move item down"
                                        title="Move item down"
                                        disabled={disabled || index === items.length - 1}
                                        onClick={() => moveItem(index, 1)}
                                    >
                                        ▼
                                    </button>

                                </div>

                                <div className="dynamic-table-row-delete-add">

                                    <button
                                        type="button"
                                        className="dynamic-table-row-remove"
                                        aria-label={items.length <= 1 ? "Clear item" : "Remove item"}
                                        title={items.length <= 1 ? "Clear item" : "Remove item"}
                                        disabled={disabled}
                                        onClick={() => removeItem(item.id)}
                                    >
                                        −
                                    </button>

                                    <button
                                        type="button"
                                        className="dynamic-table-row-add"
                                        aria-label="Add item"
                                        title="Add item"
                                        disabled={disabled}
                                        onClick={addItem}
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            );

        }

        case AnswerType.CardList: {

            const cards = cardListOptions;

            const values: CardListAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as CardListAnswerValue
                    : {};

            const activeCard =
                cards.find(card => card.id === activeCardId) ?? cards[0];

            const activeItems: CardListItemValue[] =
                activeCard ? (values[activeCard.id] ?? []) : [];

            function updateCardItems(cardId: string, items: CardListItemValue[]) {
                onChange({ ...values, [cardId]: items });
            }

            function addCardItem(cardId: string) {

                const items = values[cardId] ?? [];

                updateCardItems(cardId, [
                    ...items,
                    { id: createCardListItemId(), text: "" }
                ]);

            }

            function removeCardItem(cardId: string, itemId: string) {

                const items = values[cardId] ?? [];

                // At least one entry always stays per card -- clear
                // it back to blank instead of removing the last row.
                if (items.length <= 1) {

                    updateCardItems(cardId, items.map(candidate =>
                        candidate.id === itemId ? { ...candidate, text: "" } : candidate
                    ));

                    return;

                }

                updateCardItems(cardId, items.filter(candidate => candidate.id !== itemId));

            }

            function moveCardItem(cardId: string, index: number, direction: -1 | 1) {

                const items = values[cardId] ?? [];
                const targetIndex = index + direction;

                if (targetIndex < 0 || targetIndex >= items.length) {
                    return;
                }

                const next = [...items];

                const [moved] = next.splice(index, 1);
                next.splice(targetIndex, 0, moved);

                updateCardItems(cardId, next);

            }

            return (

                <div className="answer-variant-cards-wrapper">

                    <div className="answer-variant-cards">

                        {cards.map(card => {

                            const items = values[card.id] ?? [];

                            const filled = items.some(
                                item => typeof item.text === "string" && item.text.trim().length > 0
                            );

                            const isActive = card.id === activeCard?.id;

                            return (

                                <button

                                    type="button"

                                    key={card.id}

                                    className={
                                        "answer-variant-card" +
                                        (isActive ? " active" : "") +
                                        (filled ? " filled" : "")
                                    }

                                    onClick={() => setActiveCardId(card.id)}

                                >

                                    {card.title}

                                    {filled && (
                                        <span className="answer-variant-card-check">
                                            ✓
                                        </span>
                                    )}

                                </button>

                            );

                        })}

                    </div>

                    {activeCard && (

                        <div className="answer-checklist">

                            {activeItems.map((item, index) => (

                                <div key={item.id} className="answer-checklist-row">

                                    <input
                                        type="text"
                                        className="answer-checklist-input"
                                        placeholder={`${activeCard.title} entry`}
                                        disabled={disabled}
                                        value={item.text}
                                        onChange={(event) =>

                                            updateCardItems(activeCard.id, activeItems.map(candidate =>
                                                candidate.id === item.id
                                                    ? { ...candidate, text: event.target.value }
                                                    : candidate
                                            ))

                                        }
                                    />

                                    {/* All four row controls grouped together
                                        on one side, matching DynamicTable's
                                        single combined actions cluster. */}
                                    <div className="dynamic-table-row-actions">

                                        <div className="dynamic-table-row-move">

                                            <button
                                                type="button"
                                                className="dynamic-table-row-move-up"
                                                aria-label="Move entry up"
                                                title="Move entry up"
                                                disabled={disabled || index === 0}
                                                onClick={() => moveCardItem(activeCard.id, index, -1)}
                                            >
                                                ▲
                                            </button>

                                            <button
                                                type="button"
                                                className="dynamic-table-row-move-down"
                                                aria-label="Move entry down"
                                                title="Move entry down"
                                                disabled={disabled || index === activeItems.length - 1}
                                                onClick={() => moveCardItem(activeCard.id, index, 1)}
                                            >
                                                ▼
                                            </button>

                                        </div>

                                        <div className="dynamic-table-row-delete-add">

                                            <button
                                                type="button"
                                                className="dynamic-table-row-remove"
                                                aria-label={activeItems.length <= 1 ? "Clear entry" : "Remove entry"}
                                                title={activeItems.length <= 1 ? "Clear entry" : "Remove entry"}
                                                disabled={disabled}
                                                onClick={() => removeCardItem(activeCard.id, item.id)}
                                            >
                                                −
                                            </button>

                                            <button
                                                type="button"
                                                className="dynamic-table-row-add"
                                                aria-label="Add entry"
                                                title="Add entry"
                                                disabled={disabled}
                                                onClick={() => addCardItem(activeCard.id)}
                                            >
                                                +
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

            );

        }

        case AnswerType.ProfileCards: {

            const profile = definition.profile;

            const profileValue: ProfileCardsAnswerValue =
                value && typeof value === "object" && !Array.isArray(value)
                    ? value as ProfileCardsAnswerValue
                    : { cards: [] };

            const cards: ProfileCardValue[] =
                Array.isArray(profileValue.cards) ? profileValue.cards : [];

            const subtitles = profile?.subtitles ?? [];
            const cardLabel = profile?.cardLabel ?? "Card";
            const trailing = profile?.trailingCard;

            function updateCards(nextCards: ProfileCardValue[]) {
                onChange({ ...profileValue, cards: nextCards });
            }

            function updateTrailing(text: string) {
                onChange({ ...profileValue, trailing: text });
            }

            function addCard() {

                updateCards([
                    ...cards,
                    { id: createProfileCardId(), title: "", sections: {} }
                ]);

            }

            function removeCard(cardId: string) {

                // At least one card always stays -- mirrors the
                // global "always at least one row/item" convention
                // used by DynamicTable, Checklist, and Card List
                // above: pressing remove on the last remaining
                // card clears it back to blank instead of doing
                // nothing (and instead of actually removing it,
                // which would leave the Section with zero cards).
                if (cards.length <= 1) {

                    updateCards(cards.map(card =>
                        card.id === cardId
                            ? { ...card, title: "", sections: {} }
                            : card
                    ));

                    return;

                }

                updateCards(cards.filter(card => card.id !== cardId));

            }

            function updateCardTitle(cardId: string, title: string) {

                updateCards(cards.map(card =>
                    card.id === cardId ? { ...card, title } : card
                ));

            }

            function updateCardSection(cardId: string, subtitleId: string, text: string) {

                updateCards(cards.map(card =>
                    card.id === cardId
                        ? { ...card, sections: { ...card.sections, [subtitleId]: text } }
                        : card
                ));

            }

            return (

                <div className="profile-cards-wrapper">

                    <div className="profile-cards-row">

                        {cards.map((card, index) => (

                            <div key={card.id} className="profile-card">

                                <button
                                    type="button"
                                    className="profile-card-remove"
                                    aria-label={
                                        cards.length <= 1
                                            ? `Clear ${cardLabel} ${index + 1}`
                                            : `Remove ${cardLabel} ${index + 1}`
                                    }
                                    title={cards.length <= 1 ? "Clear" : "Remove"}
                                    disabled={disabled}
                                    onClick={() => removeCard(card.id)}
                                >
                                    ×
                                </button>

                                <ProfileCardInner>

                                    {/* Fixed, non-editable label -- always
                                        reads "Customer Group 1", "Competitor
                                        2", etc. -- kept separate from the
                                        title input below it (an optional
                                        custom name/nickname for the card)
                                        so the card's identity stays visible
                                        even once a custom title is typed. */}
                                    <div className="profile-card-fixed-label">
                                        {cardLabel} {index + 1}
                                    </div>

                                    <input
                                        type="text"
                                        className="answer-checklist-input profile-card-title-input"
                                        placeholder="Add a title..."
                                        disabled={disabled}
                                        value={card.title}
                                        onChange={(event) => updateCardTitle(card.id, event.target.value)}
                                    />

                                    {subtitles.map(subtitle => (

                                        <div key={subtitle.id} className="profile-card-section">

                                            <div className="profile-card-subtitle">
                                                {subtitle.title}
                                            </div>

                                            <AutoGrowTextarea
                                                className="profile-card-subtitle-textarea"
                                                placeholder={`Describe ${subtitle.title.toLowerCase()}...`}
                                                disabled={disabled}
                                                value={card.sections?.[subtitle.id] ?? ""}
                                                onChange={(next) =>
                                                    updateCardSection(card.id, subtitle.id, next)
                                                }
                                            />

                                        </div>

                                    ))}

                                </ProfileCardInner>

                            </div>

                        ))}

                        <button
                            type="button"
                            className="profile-card-add-tile"
                            aria-label={`Add ${cardLabel}`}
                            title={`Add ${cardLabel}`}
                            disabled={disabled}
                            onClick={addCard}
                        >
                            +
                        </button>

                    </div>

                    {trailing && (

                        <div className="profile-card profile-card-trailing">

                            <ProfileCardInner>

                                <div className="profile-card-subtitle">
                                    {trailing.title}
                                </div>

                                {trailing.placeholder && (
                                    <p className="profile-card-trailing-description">
                                        {trailing.placeholder}
                                    </p>
                                )}

                                <AutoGrowTextarea
                                    className="profile-card-subtitle-textarea"
                                    placeholder={trailing.placeholder}
                                    disabled={disabled}
                                    value={profileValue.trailing ?? ""}
                                    onChange={updateTrailing}
                                />

                            </ProfileCardInner>

                        </div>

                    )}

                </div>

            );

        }

        default:

            return null;

    }

}
