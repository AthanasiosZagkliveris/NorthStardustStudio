/**
 * THE PAGE ANSWERS of the Business, Financial, Identity and Brand Systems: each hands its value to the editor of its page. One function per Answer Structure, each given the scope of the renderer (scope.ts). Split out of AnswerRenderer.tsx.
 */
import BrandStyleEditor from "../BrandStyleEditor.tsx";
import BusinessCapabilityEditor from "../BusinessCapabilityEditor.tsx";
import BusinessEngagementEditor from "../BusinessEngagementEditor.tsx";
import BusinessFoundationEditor from "../BusinessFoundationEditor.tsx";
import FinancialFoundationEditor from "../FinancialFoundationEditor.tsx";
import FinancialSustainabilityEditor from "../FinancialSustainabilityEditor.tsx";
import LegalEntityEditor from "../LegalEntityEditor.tsx";
import FoundersProfileEditor from "../FoundersProfileEditor.tsx";
import BrandInventoryEditor from "../BrandInventoryEditor.tsx";

import { asLegalEntityValue } from "../../../../framework/engine/AnswerUtils.ts";
import type { FoundersProfileValue } from "../../../../framework/engine/AnswerUtils.ts";
import type { AnswerScope } from "./scope.ts";

export function renderBusinessFoundation(scope: AnswerScope) {

    const { value, onChange, disabled, targetAudience, legalEntity, columnsDivider, frameTitle, showInstructions } = scope;

    // What Identity says of who the Segment sells to (the Positioning tile's answers).
    const organisation = asLegalEntityValue(legalEntity).organisation;

    return (

        <BusinessFoundationEditor
            value={value}
            identity={{ relationships: organisation.customerType, marketType: organisation.marketType, audience: organisation.audience }}
            showInstructions={showInstructions}
            columnsDivider={columnsDivider}
            frameTitle={frameTitle}
            asTiles
            targetAudience={targetAudience}
            onChange={onChange}
            disabled={disabled}
        />

    );

}

export function renderBusinessEngagement(scope: AnswerScope) {

    const { value, onChange, disabled, businessFoundation, onOpenBusinessFoundation, organisationCurrency, businessCapability, onOpenBusinessCapability, onChangeBusinessCapability, columnsDivider, showInstructions } = scope;

    return (

        <BusinessEngagementEditor
            value={value}
            showInstructions={showInstructions}
            columnsDivider={columnsDivider}
            foundation={businessFoundation}
            onOpenFoundation={onOpenBusinessFoundation}
            capability={businessCapability}
            onChangeCapability={onChangeBusinessCapability}
            onOpenCapability={onOpenBusinessCapability}
            currency={organisationCurrency}
            asTiles
            onChange={onChange}
            disabled={disabled}
        />

    );

}

export function renderBusinessCapability(scope: AnswerScope) {

    const { value, onChange, disabled, legalEntityPrefill, businessFoundation, onOpenBusinessFoundation, organisationCurrency, legalEntityFounders, foundersProfile, legalEntity, onChangeLegalEntity, financialFoundation, openingDate, globalSettings, businessEngagement, onOpenBusinessEngagement, onOpenLegalEntity, columnsDivider, showInstructions } = scope;

    return (

        <BusinessCapabilityEditor
            value={value}
            showInstructions={showInstructions}
            columnsDivider={columnsDivider}
            foundation={businessFoundation}
            onOpenFoundation={onOpenBusinessFoundation}
            organisationCurrency={organisationCurrency}
            legalEntityFounders={legalEntityFounders}
            legalExpenses={legalEntity?.expenses}
            onOpenLegalEntity={onOpenLegalEntity}
            legalEntity={legalEntity}
            onChangeLegalEntity={onChangeLegalEntity}
            legalEntityPrefill={legalEntityPrefill}
            foundersProfile={foundersProfile}
            engagement={businessEngagement}
            financialFoundation={financialFoundation}
            openingDate={openingDate}
            globalSettings={globalSettings}
            onOpenEngagement={onOpenBusinessEngagement}
            onChange={onChange}
            disabled={disabled}
        />

    );

}

export function renderFinancialFoundation(scope: AnswerScope) {

    const { value, onChange, disabled, businessFoundation, onOpenBusinessFoundation, organisationCurrency, legalEntity, businessCapability, openingDate, onChangeOpeningDate, globalSettings, financialSustainability, businessEngagement, onOpenBusinessCapability, onOpenLegalEntity, columnsDivider, showInstructions } = scope;

    return (

        <FinancialFoundationEditor
            value={value}
            showInstructions={showInstructions}
            columnsDivider={columnsDivider}
            foundation={businessFoundation}
            capability={businessCapability}
            legalEntity={legalEntity}
            sustainability={financialSustainability}
            engagement={businessEngagement}
            currency={organisationCurrency}
            openingDate={openingDate}
            globalSettings={globalSettings}
            onChangeOpeningDate={onChangeOpeningDate}
            onOpenFoundation={onOpenBusinessFoundation}
            onOpenCapability={onOpenBusinessCapability}
            onOpenLegalEntity={onOpenLegalEntity}
            onChange={onChange}
            disabled={disabled}
        />

    );

}

export function renderFinancialSustainability(scope: AnswerScope) {

    const { value, onChange, disabled, businessFoundation, onOpenBusinessFoundation, organisationCurrency, legalEntity, businessCapability, financialFoundation, businessEngagement, onOpenBusinessEngagement, onOpenBusinessCapability, onOpenFinancialFoundation, columnsDivider, showInstructions } = scope;

    return (

        <FinancialSustainabilityEditor
            value={value}
            showInstructions={showInstructions}
            columnsDivider={columnsDivider}
            foundation={businessFoundation}
            capability={businessCapability}
            financialFoundation={financialFoundation}
            engagement={businessEngagement}
            legalEntity={legalEntity}
            currency={organisationCurrency}
            onOpenFoundation={onOpenBusinessFoundation}
            onOpenFinancialFoundation={onOpenFinancialFoundation}
            onOpenEngagement={onOpenBusinessEngagement}
            onOpenCapability={onOpenBusinessCapability}
            onChange={onChange}
            disabled={disabled}
        />

    );

}

export function renderLegalEntity(scope: AnswerScope) {

    const { value, onChange, disabled, legalEntityPrefill, foundersProfile, onChangeFoundersProfile, openingDate, columnsDivider, frameTitle, showInstructions } = scope;

    return (

        <LegalEntityEditor
            value={value}
            prefill={legalEntityPrefill}
            foundersProfile={foundersProfile}
            onChangeFoundersProfile={onChangeFoundersProfile as ((value: FoundersProfileValue) => void) | undefined}
            openingDate={openingDate}
            columnsDivider={columnsDivider}
            frameTitle={frameTitle}
            showInstructions={showInstructions}
            asTiles
            onChange={onChange}
            disabled={disabled}
        />

    );

}

export function renderFoundersProfile(scope: AnswerScope) {

    const { value, onChange, disabled, legalEntityFounders, onOpenLegalEntity, columnsDivider, frameTitle, showInstructions } = scope;

    return (

        <FoundersProfileEditor
            value={value}
            legalEntityFounders={legalEntityFounders}
            onOpenLegalEntity={onOpenLegalEntity}
            columnsDivider={columnsDivider}
            frameTitle={frameTitle}
            showInstructions={showInstructions}
            asTiles
            onChange={onChange}
            disabled={disabled}
        />

    );

}

export function renderBrandStyle(scope: AnswerScope) {

    const { value, onChange, disabled, columnNumberOffset, columnsDivider, frameTitle, showInstructions } = scope;

    return (

        <BrandStyleEditor
            value={value}
            startNumber={(columnNumberOffset ?? 0) + 1}
            columnsDivider={columnsDivider}
            frameTitle={frameTitle}
            showInstructions={showInstructions}
            asTiles
            onChange={onChange}
            disabled={disabled}
        />

    );

}

export function renderBrandInventory(scope: AnswerScope) {

    const { value, onChange, disabled, columnNumberOffset, columnsDivider, showInstructions } = scope;

    return (

        <BrandInventoryEditor
            value={value}
            startNumber={(columnNumberOffset ?? 0) + 1}
            columnsDivider={columnsDivider}
            showInstructions={showInstructions}
            asTiles
            onChange={onChange}
            disabled={disabled}
        />

    );

}

