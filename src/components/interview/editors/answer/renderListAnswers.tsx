/**
 * THE LIST ANSWERS: the checklist, the card list and the profile cards. One function per Answer Structure, each given the scope of the renderer (scope.ts). Split out of AnswerRenderer.tsx.
 */
import ChoiceCard from "../../../controls/ChoiceCard.tsx";
import AddButton from "../../../controls/AddButton.tsx";
import NavArrow from "../../../controls/NavArrow.tsx";
import RemoveButton from "../../../controls/RemoveButton.tsx";
import TextBox from "../../../controls/TextBox.tsx";
import TextField from "../../../controls/TextField.tsx";
import { CardListAnswerValue, CardListItemValue, ChecklistItemValue, ProfileCardValue, ProfileCardsAnswerValue } from "../../../../framework/engine/AnswerUtils.ts";
import { ProfileCardInner, createCardListItemId, createChecklistItemId, createProfileCardId } from "./shared.tsx";
import type { AnswerScope } from "./scope.ts";

export function renderChecklist(scope: AnswerScope) {

    const { value, onChange, disabled } = scope;

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

                    <TextBox
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

                            <NavArrow vertical direction="previous" label="Move item up"
                                disabled={disabled || index === 0}
                                onClick={() => moveItem(index, -1)} />

                            <NavArrow vertical direction="next" label="Move item down"
                                disabled={disabled || index === items.length - 1}
                                onClick={() => moveItem(index, 1)} />

                        </div>

                        <div className="dynamic-table-row-delete-add">

                            <RemoveButton
                                aria-label={items.length <= 1 ? "Clear item" : "Remove item"}
                                disabled={disabled}
                                onClick={() => removeItem(item.id)} />

                            <AddButton shape="box" small
                                aria-label="Add item"
                                disabled={disabled}
                                onClick={addItem} />

                        </div>

                    </div>

                </div>

            ))}

        </div>

    );

}

export function renderCardList(scope: AnswerScope) {

    const { value, onChange, disabled, cardListOptions, activeCardId, setActiveCardId, variantCardsScrollRef } = scope;

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

            <div className="answer-variant-cards" ref={variantCardsScrollRef}>

                {cards.map(card => {

                    const items = values[card.id] ?? [];

                    const filled = items.some(
                        item => typeof item.text === "string" && item.text.trim().length > 0
                    );

                    const isActive = card.id === activeCard?.id;

                    return (

                        <ChoiceCard key={card.id} active={isActive} filled={filled} onClick={() => setActiveCardId(card.id)}>{card.title}</ChoiceCard>

                    );

                })}

            </div>

            {activeCard && (

                <div className="answer-checklist">

                    {activeItems.map((item, index) => (

                        <div key={item.id} className="answer-checklist-row">

                            <TextBox
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

                                    <NavArrow vertical direction="previous" label="Move entry up"
                                        disabled={disabled || index === 0}
                                        onClick={() => moveCardItem(activeCard.id, index, -1)} />

                                    <NavArrow vertical direction="next" label="Move entry down"
                                        disabled={disabled || index === activeItems.length - 1}
                                        onClick={() => moveCardItem(activeCard.id, index, 1)} />

                                </div>

                                <div className="dynamic-table-row-delete-add">

                                    <RemoveButton
                                        aria-label={activeItems.length <= 1 ? "Clear entry" : "Remove entry"}
                                        disabled={disabled}
                                        onClick={() => removeCardItem(activeCard.id, item.id)} />

                                    <AddButton shape="box" small
                                        aria-label="Add entry"
                                        disabled={disabled}
                                        onClick={() => addCardItem(activeCard.id)} />

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

}

export function renderProfileCards(scope: AnswerScope) {

    const { definition, value, onChange, disabled, profileCardsScrollRef } = scope;

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

            <div className="profile-cards-row" ref={profileCardsScrollRef}>

                {cards.map((card, index) => (

                    <div key={card.id} className="profile-card">

                        <RemoveButton
                            aria-label={
                                cards.length <= 1
                                    ? `Clear ${cardLabel} ${index + 1}`
                                    : `Remove ${cardLabel} ${index + 1}`
                            }
    disabled={disabled}
    onClick={() => removeCard(card.id)} />

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

                            <TextBox
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

                                    <TextField
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

                <AddButton
                    shape="box"
                    className="profile-card-add"
                    aria-label={`Add ${cardLabel}`}
                    disabled={disabled}
                    onClick={addCard}
                />

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

                        <TextField
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

