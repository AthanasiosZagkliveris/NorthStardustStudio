/*
    WHAT THE CONVERSATION PAGE READS FROM THE OTHER SYSTEMS (Conversation.tsx): the answers of the Identity System and of the Business System's
    other pages that a page shows or builds on, the Global Settings' Opening Date and the business stage, and the ways to open or save those
    pages. Moved out of Conversation.tsx as it was (2026-11-11, the owner: "optimise the app and the folders"): the same code, run in the same
    place on every draw; Conversation.tsx calls readCrossSystem and uses what it returns.
*/
import type { NavigateFunction } from "react-router-dom";
import type { InterviewSession } from "../framework/interview";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { AnswerType } from "../framework/enums/AnswerType";
import { asLegalEntityValue } from "../framework/engine/AnswerUtils.ts";
import { countryCurrency } from "../framework/engine/LegalEntityJurisdictions.ts";
import { OrganizationService } from "../services/OrganizationService";
import { asGlobalSettings, stageDurationsOf } from "../framework/engine/GlobalSettings";
import { stageOf } from "../framework/engine/BusinessStage";
import { PreferencesService } from "../services/PreferencesService";
import { jumpTo, type OpenPage } from "../components/interview/tiles/jumpTo.ts";
import { systems } from "../data/systems";
import { IDENTITY_SYSTEM_NUMBER, IDENTITY_DEFINITION_SECTION } from "./conversationHelpers";

/** What the page hands in: the open interview, the Organization, the System's number, and the page's own ways to redraw, save and move. */
export interface CrossSystemInput {
    session: InterviewSession;
    organizationId: string | null;
    systemNumber: number;
    navigate: NavigateFunction;
    redraw: () => void;
    persistAndRedraw: (session: InterviewSession) => void;
    scrollToTop: () => void;
}

export function readCrossSystem({ session, organizationId, systemNumber, navigate, redraw, persistAndRedraw, scrollToTop }: CrossSystemInput) {

    const framework = session.getFramework();

    // What the Legal Entity page can answer for the user without
    // asking: the Organization's name and the User's own, both
    // given when the app was set up. Read here because the page
    // itself has no access to either.
    const legalEntityPrefill = {
        organisationName:
            (organizationId && OrganizationService.getSummary(organizationId)?.name) || "",
        founderName: PreferencesService.getUserName()
    };

    /*
        The Target Audience the Business System's Foundation page
        asks the founder to divide into Segments.

        It was answered two Systems earlier, under the Identity
        System's Positioning column ("Who is your target
        audience?"), so the Foundation page shows it rather than
        asking again -- the same reason the Legal Entity page
        prefills the organization's own name above.

        Read straight from storage rather than through a Session:
        this is another System's saved answer, and opening a
        Session for it would run that System's migrations as a
        side effect of drawing a note.
    */
    const targetAudience = (() => {

        if (!organizationId) {
            return "";
        }

        const state = OrganizationService.loadSystemState(
            organizationId,
            IDENTITY_SYSTEM_NUMBER
        ) as { responses?: Array<{ sectionNumber: number; value?: unknown }> } | null;

        const definition = state?.responses?.find(
            response => response.sectionNumber === IDENTITY_DEFINITION_SECTION
        )?.value;

        const positioning = definition &&
            typeof definition === "object" &&
            !Array.isArray(definition)
            ? (definition as Record<string, unknown>).positioning
            : undefined;

        return typeof positioning === "string" ? positioning : "";

    })();

    /* The Vision, from the same Identity answer: shown beside the
       Strategy System's Strategic Compass, which follows from it. */
    const identityVision = (() => {

        if (!organizationId) {
            return "";
        }

        const state = OrganizationService.loadSystemState(
            organizationId,
            IDENTITY_SYSTEM_NUMBER
        ) as { responses?: Array<{ sectionNumber: number; value?: unknown }> } | null;

        const definition = state?.responses?.find(
            response => response.sectionNumber === IDENTITY_DEFINITION_SECTION
        )?.value;

        const vision = definition && typeof definition === "object" && !Array.isArray(definition)
            ? (definition as Record<string, unknown>).vision
            : undefined;

        return typeof vision === "string" ? vision : "";

    })();

    /*
        The currency the organisation is registered in: the country
        chosen on the Identity System's Legal Entity page, through
        the same countryCurrency that page shows beside its own
        amounts. The Business System's Infrastructure & Capability
        page puts it beside every Price, so a founder names the
        currency once, by saying where they are registered.

        Read straight from storage, for the reason targetAudience
        gives, and resolved by Answer Structure rather than by
        Section number. "" when no country has been chosen yet.

        The same page's 2. Founders & Ownership are that page's
        founders too: they are who Infrastructure & Capability lists
        under 1. Founders and names in every Responsibility, and who
        the Founders Profile page draws a card for.
    */
    function identityResponse(type: AnswerType): unknown {

        if (!organizationId) {
            return undefined;
        }

        const identity = systems.find(
            candidate => candidate.number === IDENTITY_SYSTEM_NUMBER
        );

        const section = identity
            ? frameworkRegistry.getFramework(identity.id).sections.find(
                candidate => candidate.answer?.type === type
            )
            : undefined;

        if (!section) {
            return undefined;
        }

        const state = OrganizationService.loadSystemState(
            organizationId,
            IDENTITY_SYSTEM_NUMBER
        ) as { responses?: Array<{ sectionNumber: number; value?: unknown }> } | null;

        return state?.responses?.find(
            response => response.sectionNumber === section.number
        )?.value;

    }

    const legalEntity = asLegalEntityValue(identityResponse(AnswerType.LegalEntity));

    /*
        The Identity System's Founders Profile, as saved: each
        founder's Roles, which Infrastructure & Capability shows
        under 1. Founders, and the profiles the Legal Entity page
        will not drop a founder's row from (see founderProfiles).
    */
    const foundersProfile = identityResponse(AnswerType.FoundersProfile);

    const organisationCurrency = countryCurrency(legalEntity.organisation.country);

    /*
        The Business System's first two pages read the same way the
        Strategy System's three do: Customer Engagement (Page 2) is
        answered entirely against the Segments, Profiles and
        Offerings the Foundation page (Page 1) defines, and refers
        to them rather than asking for them again.

        A Section can only see its own response, so the Foundation's
        is resolved here, once, and handed down -- and so is the way
        back to it, for the links Page 2 draws on the names it
        borrows.

        Resolved by Answer Structure rather than by Section number,
        so this stays correct if the Business pages are reordered.
    */
    const businessFoundationSection = framework.sections.find(
        candidate => candidate.answer?.type === AnswerType.BusinessFoundation
    );

    const businessFoundationValue = businessFoundationSection
        ? session.getResponse(businessFoundationSection.number)
        : undefined;

    const openBusinessFoundation: OpenPage | undefined = businessFoundationSection
        ? (path) => {

            // Sections are numbered from 1; goToSection is 0-based.
            session.goToSection(businessFoundationSection.number - 1);

            persistAndRedraw(session);

            // At the card the link names, or at the top.
            if (path && path.length > 0) {
                jumpTo(path);
            } else {
                scrollToTop();
            }

        }
        : undefined;

    /*
        The two Financial pages read the pages before them: Page 4
        consolidates the costs recorded on Page 3 (and on the Legal
        Entity, resolved above), and Page 5 measures revenue against
        everything Page 4 establishes. Resolved by Answer Structure,
        as Page 1 is.
    */
    const sectionOfType = (type: AnswerType) => framework.sections.find(
        candidate => candidate.answer?.type === type
    );

    const capabilitySection = sectionOfType(AnswerType.BusinessCapability);
    const financialFoundationSection = sectionOfType(AnswerType.FinancialFoundation);
    const financialSustainabilitySection = sectionOfType(AnswerType.FinancialSustainability);
    const businessEngagementSection = sectionOfType(AnswerType.BusinessEngagement);

    const businessCapabilityValue = capabilitySection
        ? session.getResponse(capabilitySection.number)
        : undefined;

    const financialFoundationValue = financialFoundationSection
        ? session.getResponse(financialFoundationSection.number)
        : undefined;

    // The Opening Date lives in the Global Settings; the Organization tile edits it, and the pages that place costs around it read it.
    const globalSettings = asGlobalSettings(organizationId ? OrganizationService.getGlobalSettings(organizationId) : undefined);
    const openingDate = globalSettings.openingDate;
    // The business stage: the Opening Date's, with the Global Settings' durations (BusinessStage.ts).
    const businessStage = stageOf(openingDate, new Date(), stageDurationsOf(globalSettings));
    const changeOpeningDate = (iso: string) => {
        if (organizationId) {
            OrganizationService.saveGlobalSettings(organizationId, { ...asGlobalSettings(OrganizationService.getGlobalSettings(organizationId)), openingDate: iso });
            redraw();
        }
    };

    // Its Demand & Conversion gives the expected sales both Financial pages use.
    const businessEngagementValue = businessEngagementSection
        ? session.getResponse(businessEngagementSection.number)
        : undefined;

    // Its revenue is what Financial Foundation's operating need is net of.
    const financialSustainabilityValue = financialSustainabilitySection
        ? session.getResponse(financialSustainabilitySection.number)
        : undefined;

    const openBusinessSection = (type: AnswerType): OpenPage | undefined => {

        const target = sectionOfType(type);

        if (!target) {
            return undefined;
        }

        return (path) => {
            session.goToSection(target.number - 1);
            persistAndRedraw(session);
            if (path && path.length > 0) {
                jumpTo(path);
            } else {
                scrollToTop();
            }
        };

    };

    /*
        The Legal Entity is another System's page (1. Identity System),
        so it is opened as the Calendar opens a task: the Identity
        System, at its Legal Entity Section. The browser's Back, and the
        app's, return here.
    */
    const identitySystem = systems.find(candidate => candidate.id === "identity");
    const legalEntitySection = identitySystem
        ? frameworkRegistry.getFramework(identitySystem.id).sections
            .find(candidate => candidate.answer?.type === AnswerType.LegalEntity)
        : undefined;
    /** Saves the Legal Entity page's answer (the Identity System's) from the Business System, where its legal cards float over 3. Infrastructure & Capability. */
    const changeLegalEntity = identitySystem && legalEntitySection && organizationId
        ? (next: unknown) => {
            const state = OrganizationService.loadSystemState(organizationId, IDENTITY_SYSTEM_NUMBER) as { responses?: Array<{ sectionNumber: number; value?: unknown }> } | null;
            if (!state?.responses) {
                return;
            }
            OrganizationService.saveSystemState(organizationId, IDENTITY_SYSTEM_NUMBER, {
                ...state,
                responses: state.responses.map(response => response.sectionNumber === legalEntitySection.number ? { ...response, value: next } : response)
            });
            redraw();
        }
        : undefined;
    /** On the Identity System's own pages the answers are saved through the interview that is open, so what the page saves is not written over by it later. */
    const foundersProfileSection = identitySystem
        ? frameworkRegistry.getFramework(identitySystem.id).sections.find(candidate => candidate.answer?.type === AnswerType.FoundersProfile)
        : undefined;
    const identityHere = systemNumber === IDENTITY_SYSTEM_NUMBER;
    const changeLegalEntityHere = identityHere && legalEntitySection
        ? (next: unknown) => {
            session.saveResponse(legalEntitySection.number, next);
            persistAndRedraw(session);
        }
        : changeLegalEntity;
    const changeFoundersProfile = identityHere && foundersProfileSection
        ? (next: unknown) => {
            session.saveResponse(foundersProfileSection.number, next);
            persistAndRedraw(session);
        }
        : undefined;
    const openLegalEntity: OpenPage | undefined = identitySystem && legalEntitySection
        ? (path) => {
            if (organizationId) {
                persistAndRedraw(session);
            }
            // (The Founders & Ownership tile stands on the Definition, the Identity System's first section, since 2026-11-09.)
            const onDefinition = path?.[0] === "legal-section-1";
            navigate("/introduction", {
                state: { system: identitySystem, targetSectionNumber: onDefinition ? frameworkRegistry.getFramework(identitySystem.id).sections[0].number : legalEntitySection.number }
            });
            if (path && path.length > 0) {
                jumpTo(path);
            }
        }
        : undefined;

    return {
        legalEntityPrefill,
        targetAudience,
        identityVision,
        legalEntity,
        foundersProfile,
        organisationCurrency,
        businessFoundationValue,
        openBusinessFoundation,
        capabilitySection,
        financialFoundationSection,
        businessCapabilityValue,
        financialFoundationValue,
        globalSettings,
        openingDate,
        businessStage,
        changeOpeningDate,
        businessEngagementValue,
        financialSustainabilityValue,
        openBusinessSection,
        legalEntitySection,
        changeLegalEntityHere,
        changeFoundersProfile,
        openLegalEntity
    };

}
