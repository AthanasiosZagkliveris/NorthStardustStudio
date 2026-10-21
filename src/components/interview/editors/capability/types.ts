import { ReactNode } from "react";
import { LegalEntityExpenseValue, BusinessCapabilityValue, LegalEntityFounderValue } from "../../../../framework/engine/AnswerUtils.ts";
import { type GlobalSettingsValue } from "../../../../framework/engine/GlobalSettings.ts";
import type { OpenPage } from "../../tiles/jumpTo.ts";

export interface BusinessCapabilityEditorProps {

    value: unknown;

    onChange: (value: BusinessCapabilityValue) => void;

    disabled?: boolean;

    /** See AnswerRendererProps.showInstructions. */
    showInstructions?: boolean;

    /** See AnswerRendererProps.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * Page 1's answer. Only its Offerings are read: Offering's
     * Capability links every row it holds to one of them, and an
     * Offering is defined there, never here.
     */
    foundation?: unknown;

    /** Opens Page 1, for the link beside an empty Offering list. */
    onOpenFoundation?: OpenPage;

    /**
     * The currency of the country the organisation is registered
     * in (1. Identity System — 3. Legal Entity), or "" before one
     * is chosen there. Every Price on this page is in it unless the
     * founder picks another for that price.
     */
    organisationCurrency?: string;

    /**
     * The founders answered under 1. Identity System — 3. Legal
     * Entity, 2. Founders & Ownership. They ARE this page's
     * founders: named there, given Roles on 4. Founders Profile,
     * and a Salary here.
     */
    legalEntityFounders?: readonly LegalEntityFounderValue[];
    /** 1. Identity System — 3. Legal Entity's expenses: shown (not opened) among the "Inventory". */
    legalExpenses?: readonly LegalEntityExpenseValue[];
    /** Opens the Identity System's Legal Entity page (a legal expense a founder is responsible for). */
    onOpenLegalEntity?: OpenPage;
    /** The Legal Entity page's answer and how to save it (it belongs to the Identity System): a legal card called from this page floats here, and is edited here. */
    legalEntity?: unknown;
    onChangeLegalEntity?: (value: unknown) => void;
    legalEntityPrefill?: { organisationName: string; founderName: string };
    /** 1. Identity System — 4. Founders Profile, as saved: each founder's Roles. */
    foundersProfile?: unknown;
    /** Customer Engagement: its Demand & Conversion gives each Offering's expected sales. */
    engagement?: unknown;
    /** 4. Finances' saved value: its Plan Start (and its Opening Date) bound the dates of an activity. */
    financialFoundation?: unknown;
    /** The Opening Date (an ISO date), where the Financial Foundation has one. */
    openingDate?: string;
    /** The Global Settings: the default rates a Percentage card shows beside its Rate override. */
    globalSettings?: GlobalSettingsValue;
    /** Opens Customer Engagement: back to a channel after picking its cost here. */
    onOpenEngagement?: OpenPage;

}
