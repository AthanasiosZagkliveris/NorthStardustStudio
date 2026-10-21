import { CURRENCY_CODES, CURRENCY_SEARCH_ALIASES } from "../../../framework/engine/Currencies.ts";
import OptionPicker from "./OptionPicker.tsx";

/**
 * THE CURRENCY PICKER: the one dropdown of currency codes (the Business System's cost cards, the Strategic Period's money metrics): three letters wide, searchable by code and by name,
 * the search word "Type". A place gives only what it chooses (`label`, `value`, `onChange`), never another look.
 */
export default function CurrencyPicker({ label, value, onChange, disabled }: {
    label: string;
    value: string;
    onChange: (next: string) => void;
    disabled?: boolean;
}) {
    return (
        <OptionPicker
            label={label}
            placeholder="Code"
            options={CURRENCY_CODES}
            currency
            searchable
            searchPlaceholder="Type"
            searchAliases={CURRENCY_SEARCH_ALIASES}
            disabled={disabled}
            value={value}
            onChange={onChange}
        />
    );
}
