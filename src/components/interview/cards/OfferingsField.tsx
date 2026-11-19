import { ReactNode } from "react";
import NumberCell from "../../controls/NumberCell.tsx";
import OptionPicker from "../fields/OptionPicker.tsx";
import { BusinessEmpty, BusinessField, BusinessTicks } from "./BusinessCardFields.tsx";
import { OFFERING_BASIS_KEY, SHARE_BASES, SHARE_BASIS_HELP, offeringFractions, offeringSharesFor, offeringSharesTotal, shareBasisOf, type ShareWeights } from "../../../framework/engine/AnswerUtils.ts";

/**
 * THE OFFERINGS A COST SERVES, AND HOW IT IS SHARED (one component for every card that carries it: a resource, an activity, a partner or supplier on
 * Infrastructure & Capability, and a Legal Entity expense -- the owner's approved plan of 2026-11-18, step 3): the Offerings ticked, one or several; with
 * several, how the cost is shared (owner, 2026-11-16; doc 3, R3) -- by the hours each uses, the revenue each brings, in equal parts, or the user's own
 * split, each Offering's percent at the end of its row. None ticked: the cost is the whole company's.
 */
export interface OfferingsFieldProps {
    /** The Offerings ticked, by id. */
    current: string[];
    onNext: (next: { offeringIds: string[]; offeringShares: Record<string, string> }) => void;
    /** The card's name in the field's labels ("Resource 2 linked Offerings"). */
    name: string;
    /** What stands where there is no Offering to tick yet. */
    empty: ReactNode;
    /** The shares saved, by Offering id, and the basis under OFFERING_BASIS_KEY. */
    shares: Record<string, string>;
    /** Every Offering the organisation sells: its id and its name. */
    choices: readonly { id: string; label: string }[];
    /** The hours and the revenue of each Offering, for the shares by hours or by revenue. */
    shareWeights?: ShareWeights;
    disabled?: boolean;
    /** A card a Customer Channel made carries that channel's Offerings: they change on the channel, not here. */
    locked?: boolean;
    /** A generated card keeps the Offerings its connected cards serve (adding is free, removing these is not). */
    kept?: readonly string[];
    /** A cost that needs no share: one paid per unit or as a share of revenue -- each Offering pays it in full on what it sells --, or no cost at all (an activity).
        The ticks alone (owner, 2026-11-14 23:30: "70% of 2%, what % gives?"; 2026-11-16); the shares saved stay as they are for another frequency. */
    whole?: boolean;
}

export default function OfferingsField({ current, onNext, name, empty, shares, choices, shareWeights, disabled = false, locked = false, kept = [], whole = false }: OfferingsFieldProps) {
    const total = offeringSharesTotal(current, shares);
    const split = !whole && choices.length > 0 && current.length > 1;
    // HOW IS IT SHARED (owner, 2026-11-16; doc 3, R3): by the hours each Offering uses, by the revenue each brings, in equal parts, or the user's own split.
    const basis = shareBasisOf(current, shares, shareWeights);
    const own = basis === "own";
    const fractions = offeringFractions(current, shares, shareWeights);
    const percentOf = (id: string) => Math.round((fractions[id] ?? 0) * 100);
    const left = 100 - total;
    return (
        // (Its section, titled OFFERINGS, is the caller's: a BandSection counts where it stands straight in the card's body (EngagementBands), so the card's helper
        // wraps this field in it (offeringsField). The title band names it; the ticks stand under it with no label of their own.)
        <>
        <div className="business-foundation-field business-offering-field" role="group" aria-label="Offerings">
            {/* The user's own split: the percent each carries, totalled first, above the numbers; what is left to share said while it is short. */}
            {split && own && (
                <p className={"business-capability-total" + (total === 100 ? "" : " business-capability-alarm")}>
                    {total === 100 ? "Total 100%" : left > 0 ? "Total " + total + "%: " + left + "% left to share" : "Total " + total + "%: " + (-left) + "% more than the whole"}
                </p>
            )}
            {kept.length > 0 && (
                <p className="business-capability-total">{"Kept while a card connected to it serves them: " + kept.map(id => choices.find(choice => choice.id === id)?.label ?? "").filter(Boolean).join(", ") + "."}</p>
            )}
            {choices.length === 0
                ? <BusinessEmpty>{empty}</BusinessEmpty>
                : (
                    <BusinessTicks
                        name={name}
                        options={choices.map(choice => ({ id: choice.id, label: choice.label }))}
                        chosen={current}
                        disabled={disabled || locked}
                        // (The typed shares are kept: an Offering ticked starts at 0, one unticked takes its share with it.)
                        onChange={(requested) => {
                            const next = [...new Set([...requested, ...kept])];
                            onNext({ offeringIds: next, offeringShares: offeringSharesFor(next, shares) });
                        }}
                        // With several Offerings, the percent of the card each carries stands at the end of its own row, in the x's column: the user's own, typed
                        // (a whole number, two digits at most); by any other basis, the percent it comes to, as a record.
                        trailing={split ? Object.fromEntries(current.map(id => [id, own ? (
                            <NumberCell kind="int"
                                className="business-capability-share"
                                aria-label={name + " share of " + (choices.find(choice => choice.id === id)?.label ?? "Offering")}
                                placeholder="%"
                                title="Percent of this card"
                                disabled={disabled || locked}
                                value={shares[id] ?? ""}
                                onChange={(event) => onNext({ offeringIds: current, offeringShares: { ...shares, [id]: event.target.value.replace(/\D/g, "").slice(0, 2) } })}
                            />
                        ) : (
                            <span className="business-capability-static-value" aria-label={name + " share of " + (choices.find(choice => choice.id === id)?.label ?? "Offering")}>{percentOf(id) + "%"}</span>
                        )])) : undefined}
                    />
                )}
        </div>
        {split && (
            <BusinessField label="How is it shared?" info={SHARE_BASIS_HELP}>
                <OptionPicker
                    label={name + " how it is shared"}
                    placeholder="Select"
                    options={SHARE_BASES.map(entry => entry.label)}
                    disabled={disabled || locked}
                    value={SHARE_BASES.find(entry => entry.id === basis)?.label ?? ""}
                    onChange={(next) => {
                        const chosen = SHARE_BASES.find(entry => entry.label === next)?.id ?? basis;
                        // (My own split starts from the split shown, in whole percents that total 100.)
                        const start = chosen === "own" && !own
                            ? (() => {
                                const whole = current.map(id => percentOf(id));
                                whole[whole.length - 1] = 100 - whole.slice(0, -1).reduce((sum, amount) => sum + amount, 0);
                                return Object.fromEntries(current.map((id, at) => [id, String(whole[at])]));
                            })()
                            : Object.fromEntries(current.map(id => [id, shares[id] ?? "0"]));
                        onNext({ offeringIds: current, offeringShares: { ...start, [OFFERING_BASIS_KEY]: chosen } });
                    }}
                />
            </BusinessField>
        )}
        </>
    );
}
