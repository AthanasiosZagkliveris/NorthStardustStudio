import { useState } from "react";

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
                    : undefined

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

                    {items.length === 0 && (
                        <div className="answer-checklist-empty">
                            No checklist items yet.
                        </div>
                    )}

                    {items.map((item, index) => (

                        <div key={item.id} className="answer-checklist-row">

                            <div className="answer-checklist-move">

                                <button
                                    type="button"
                                    className="answer-checklist-move-up"
                                    aria-label="Move item up"
                                    title="Move item up"
                                    disabled={disabled || index === 0}
                                    onClick={() => moveItem(index, -1)}
                                >
                                    ▲
                                </button>

                                <button
                                    type="button"
                                    className="answer-checklist-move-down"
                                    aria-label="Move item down"
                                    title="Move item down"
                                    disabled={disabled || index === items.length - 1}
                                    onClick={() => moveItem(index, 1)}
                                >
                                    ▼
                                </button>

                            </div>

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

                            <button
                                type="button"
                                className="answer-checklist-remove"
                                disabled={disabled}
                                onClick={() =>

                                    updateItems(items.filter(candidate => candidate.id !== item.id))

                                }
                            >
                                ×
                            </button>

                        </div>

                    ))}

                    <button
                        type="button"
                        className="answer-checklist-add"
                        disabled={disabled}
                        onClick={addItem}
                    >
                        + Add Item
                    </button>

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

                            {activeItems.length === 0 && (
                                <div className="answer-checklist-empty">
                                    No {activeCard.title.toLowerCase()} entries yet.
                                </div>
                            )}

                            {activeItems.map((item, index) => (

                                <div key={item.id} className="answer-checklist-row">

                                    <div className="answer-checklist-move">

                                        <button
                                            type="button"
                                            className="answer-checklist-move-up"
                                            aria-label="Move entry up"
                                            title="Move entry up"
                                            disabled={disabled || index === 0}
                                            onClick={() => moveCardItem(activeCard.id, index, -1)}
                                        >
                                            ▲
                                        </button>

                                        <button
                                            type="button"
                                            className="answer-checklist-move-down"
                                            aria-label="Move entry down"
                                            title="Move entry down"
                                            disabled={disabled || index === activeItems.length - 1}
                                            onClick={() => moveCardItem(activeCard.id, index, 1)}
                                        >
                                            ▼
                                        </button>

                                    </div>

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

                                    <button
                                        type="button"
                                        className="answer-checklist-remove"
                                        disabled={disabled}
                                        onClick={() =>

                                            updateCardItems(
                                                activeCard.id,
                                                activeItems.filter(candidate => candidate.id !== item.id)
                                            )

                                        }
                                    >
                                        ×
                                    </button>

                                </div>

                            ))}

                            <button
                                type="button"
                                className="answer-checklist-add"
                                disabled={disabled}
                                onClick={() => addCardItem(activeCard.id)}
                            >
                                + Add {activeCard.title}
                            </button>

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
                // "always at least one row/item" convention used
                // by DynamicTable and the Checklist above.
                if (cards.length <= 1) {
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

                                {cards.length > 1 && (

                                    <button
                                        type="button"
                                        className="profile-card-remove"
                                        aria-label={`Remove ${cardLabel} ${index + 1}`}
                                        title="Remove"
                                        disabled={disabled}
                                        onClick={() => removeCard(card.id)}
                                    >
                                        ×
                                    </button>

                                )}

                                <input
                                    type="text"
                                    className="answer-checklist-input profile-card-title-input"
                                    placeholder={`${cardLabel} ${index + 1} Title`}
                                    disabled={disabled}
                                    value={card.title}
                                    onChange={(event) => updateCardTitle(card.id, event.target.value)}
                                />

                                {subtitles.map(subtitle => (

                                    <div key={subtitle.id} className="profile-card-section">

                                        <div className="profile-card-subtitle">
                                            {subtitle.title}
                                        </div>

                                        <textarea
                                            className="profile-card-subtitle-textarea"
                                            placeholder={`Describe ${subtitle.title.toLowerCase()}...`}
                                            disabled={disabled}
                                            value={card.sections?.[subtitle.id] ?? ""}
                                            onChange={(event) =>
                                                updateCardSection(card.id, subtitle.id, event.target.value)
                                            }
                                        />

                                    </div>

                                ))}

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

                            <div className="profile-card-subtitle">
                                {trailing.title}
                            </div>

                            {trailing.placeholder && (
                                <p className="profile-card-trailing-description">
                                    {trailing.placeholder}
                                </p>
                            )}

                            <textarea
                                className="profile-card-subtitle-textarea"
                                placeholder={trailing.placeholder}
                                disabled={disabled}
                                value={profileValue.trailing ?? ""}
                                onChange={(event) => updateTrailing(event.target.value)}
                            />

                        </div>

                    )}

                </div>

            );

        }

        default:

            return null;

    }

}
