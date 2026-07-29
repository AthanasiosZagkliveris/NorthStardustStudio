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
 * Wraps a Profile Card's content and scales it down
 * (uniformly, preserving proportions) whenever it would
 * otherwise overflow the card's fixed height -- so a
 * card with a lot of text shrinks as a whole instead of
 * clipping or scrolling internally. Runs its own
 * measurement effect (rather than living in the
 * ProfileCards case above) purely so each card gets its
 * own ref/state without violating the rules of hooks
 * inside a .map() loop.
 */
function ProfileCardInner({

    children,

    disableScale = false,

    measureKey

}: {

    children: ReactNode;

    disableScale?: boolean;

    /**
     * A string that changes whenever this card's actual
     * text content changes (title + every subtitle's
     * text) -- the effect's dependency, so it only
     * remeasures when there's actually something new to
     * measure.
     */
    measureKey?: string;

}) {

    const ref = useRef<HTMLDivElement | null>(null);

    // Deliberately imperative, not React state: the scale
    // this effect computes is applied directly to the DOM
    // node within the very same invocation, rather than via
    // setState + a follow-up render. Going through state was
    // tried first and had a subtle bug -- whenever two
    // different content changes happened to compute the same
    // scale (a very ordinary occurrence, e.g. editing a
    // short subtitle while a long one elsewhere still
    // dominates the card's height), React's setState bails
    // out of re-rendering for an unchanged value. But the
    // measurement step just above it had already reset the
    // node's transform/width to their unscaled values on the
    // DOM directly (needed so the *next* measurement isn't
    // measuring an already-shrunk box) -- with no re-render
    // to follow, that reset was never replaced by the real
    // scale, permanently leaving the card unscaled. Setting
    // the final style imperatively, right here, removes the
    // dependency on a follow-up render entirely.
    useLayoutEffect(() => {

        const el = ref.current;
        const parent = el?.parentElement;

        if (!el || !parent) {
            return;
        }

        if (disableScale) {
            el.style.transform = "";
            el.style.width = "";
            return;
        }

        // Reset to the unscaled size before measuring, so
        // this measurement reflects the content's true
        // natural height, not whatever scale a previous
        // measurement left it at.
        el.style.transform = "none";
        el.style.width = "100%";

        const naturalHeight = el.scrollHeight;
        const availableHeight = parent.clientHeight;

        const scale =
            naturalHeight > 0 && naturalHeight > availableHeight
                ? availableHeight / naturalHeight
                : 1;

        if (scale < 1) {
            el.style.transform = `scale(${scale})`;
            el.style.width = `${100 / scale}%`;
        } else {
            el.style.transform = "";
            el.style.width = "";
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [measureKey, disableScale]);

    return (

        <div

            ref={ref}

            className="profile-card-inner"

        >

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

                                <ProfileCardInner

                                    measureKey={
                                        `${card.title}|` +
                                        subtitles.map(subtitle => card.sections?.[subtitle.id] ?? "").join("|")
                                    }

                                >

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

                            <ProfileCardInner disableScale>

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
