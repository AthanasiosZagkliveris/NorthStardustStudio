import { useCallback, useEffect, useRef, useState } from "react";
import TextLink from "../components/interview/fields/TextLink.tsx";
import AddButton from "../components/controls/AddButton.tsx";
import { useLocation, useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/interview/editors/InterviewHeader";
import InterviewProgress, { SHOW_PROGRESS_LINE } from "../components/InterviewProgress";
import InterviewSection from "../components/InterviewSection";
import { groupOf, isCompanion, primaryOf } from "../framework/engine/PageGroups";
import AnswerRenderer from "../components/interview/editors/AnswerRenderer";
import type { PageSectionAnswer } from "../components/interview/editors/answer/shared.tsx";

import { InterviewSession } from "../framework/interview";
import {
    currentSituationDraft,
    financialPlanRange } from "../framework/engine/BusinessDocuments.ts";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import { AnswerDefinition, Section, ValidationIssue } from "../framework/model";
import { AnswerType } from "../framework/enums/AnswerType";
import { financialPlanPeriod } from "../framework/engine/FinancialModel.ts";
import {
    defaultAnswerValue,
    numberedUnitCount,
    ProcessRecordValue,
    StrategyRangeValue,
    StrategyThemeValue,
    asLegalEntityValue,
    asStrategicPeriodValue,
    type StrategicPeriodValue,
    asStrategyFoundationValue,
    formatRangeShort,
    titleWithPeriod,
    isRangeSet,
    monthIndex,
    strategyGoalsForTheme,
    strategyThemeHasContent } from "../framework/engine/AnswerUtils.ts";

import { StorageService } from "../services/StorageService";
import { OrganizationService } from "../services/OrganizationService";
import { asGlobalSettings, stageDurationsOf } from "../framework/engine/GlobalSettings";
import { stageOf } from "../framework/engine/BusinessStage";
import { fitPositioningToStage } from "../components/interview/editors/legal/shared";
import { offerRemovalUndo, UndoService } from "../services/UndoService";
import { FocusModeService } from "../services/FocusModeService";
import { useFocusMode } from "../components/FocusModeButton";
import { systems } from "../data/systems";
import { focusField, focusText } from "../components/interview/tiles/jumpTo.ts";
import { FieldPageProvider } from "../components/interview/fields/fieldMarks.tsx";
import BulletRail from "../components/interview/rails/BulletRail";
import PageArrow, { pageKey } from "../components/interview/fields/PageArrow";

/** The Introduction's place on the PAGES rail, above "1. …". */
const INTRODUCTION_RAIL_ID = "introduction";
import ListStatic from "../components/interview/fields/ListStatic";
import { drawnAsTiles, pageIndexFromRailId, pageRailItems, sectionRailItems } from "../components/interview/rails/railItems";
import { pageStatuses } from "../framework/engine/PageStatus";
import { sectionStatuses } from "../framework/engine/SectionStatus";
import { scrollToRailSection, useActiveRailSection } from "../components/interview/rails/useActiveRailSection";

import useRailTab from "../hooks/useRailTab.ts";
import useScrollRules from "../hooks/useScrollRules.ts";
import "../styles/conversation.css";
import "../styles/conversation-layout.css";
import "../styles/system-confirmation.css";

import { IDENTITY_SYSTEM_NUMBER, BUSINESS_SYSTEM_NUMBER, interviewManager, normalize, findSystemSection, resolveSharedAnswerValue, ExportStep, OPERATIONS_PROCESS_LIBRARY_SECTION, sectionTitleOf, isSharedProductRegisterSection, findSharedTargetAudiencePartBinding, isSocialMediaAudienceProfilesSection, extractSharedAudienceRows, mergeSharedAudienceIntoSocialMediaRows, extractProductNames, extractDynamicOptions, splitIntoSentences, withBold } from "./conversationHelpers";
import { readCrossSystem } from "./crossSystemReaders.ts";
import ExportFlow from "./ExportFlow.tsx";
import { pageNavigation } from "./pageNavigation.ts";

export default function Conversation() {

    useScrollRules();
    useRailTab();

    const location = useLocation();
    const navigate = useNavigate();

    const system = location.state?.system;

    // Set only by the Organization Calendar's own "Open →" link on
    // a task (see OrganizationCalendarPanel.tsx / SystemSelection.
    // tsx's `openTask`) -- jumps the freshly (re)loaded session
    // straight to this Section instead of wherever it was last
    // left, without disturbing any other Section's saved answer.
    // Sections are numbered from 1 (matches the "N. Section Title"
    // heading and the Calendar's own "8.2"-style origin label);
    // `goToSection` itself is 0-based.
    const targetSectionNumber: number | undefined = location.state?.targetSectionNumber;

    // Set only by System Selection's "Continue" line: open the
    // interview itself at `targetSectionNumber` (not its
    // Introduction), and scroll to the section card last worked in,
    // when one was recorded.
    const resume: { anchor?: string } | undefined = location.state?.resume;

    // Set by openField (fieldLocation): open the interview at
    // `targetSectionNumber` and there the one field this names --
    // its card unfolded, the field scrolled to, focused and
    // highlighted (see focusField in jumpTo.ts). A search result for
    // an answer names its text and cards instead (focusText).
    const openingField: { key: string; anchors?: string[]; text?: string; ids?: string[] } | undefined = location.state?.focusField;

    // Every Interview Session now belongs to a specific
    // Organization (see OrganizationService / item 6) -- read
    // once on mount since the Landing page is the only place
    // the selected Organization changes.
    const [organizationId] = useState<string | null>(() => OrganizationService.getSelected());
    const organizationName = organizationId
        ? OrganizationService.getSummary(organizationId)?.name ?? ""
        : "";

    const [session, setSession] = useState<InterviewSession | null>(null);
    const [loadingError, setLoadingError] = useState<string | null>(null);
    const [, refresh] = useState(0);

    // Export flow -- replaces the old, separate Review/Validation
    // page. Pressing "Finish" on the last Section validates the
    // Interview inline and opens one of these popups instead of
    // navigating away.
    const [exportStep, setExportStep] = useState<ExportStep>("none");

    // Whether the guidance above the progress line is showing.
    // Starts open: the instructions are what a page is for the first
    // time it is opened, and hiding them by default would leave a
    // new user looking at unexplained boxes.
    const [instructionsOpen, setInstructionsOpen] = useState(true);

    // Focus mode hides the Help with the rest (FocusModeButton).
    const focusMode = useFocusMode();

    // A held-back Strategy System change and what it would cost --
    // removing a Theme that has work under it, or narrowing the
    // Strategic Period past an Objective. `apply` runs it; dismissing
    // the dialog drops it. Rendered as the app's own dialog rather
    // than window.confirm, which the rest of the app avoids too.
    const [strategyPrompt, setStrategyPrompt] = useState<{
        title: string;
        message: string;
        apply: () => void;
    } | null>(null);
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    // Grows by one each time Export Options opens (ExportFlow.tsx).
    const [exportOpenCount, setExportOpenCount] = useState(0);

    // ← and → turn the page (pageKey says when they may): set below,
    // once the session's page functions exist, and read by one
    // listener for the page's life.
    const pageTurn = useRef<(direction: "previous" | "next") => void>(() => undefined);
    // Not while the Strategy confirmation or the export flow is open.
    const strategyPromptOpen = useRef(false);
    strategyPromptOpen.current = strategyPrompt !== null;
    const exportOpen = useRef(false);
    exportOpen.current = exportStep !== "none";

    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            const direction = pageKey(event);
            if (direction && !strategyPromptOpen.current && !exportOpen.current) {
                event.preventDefault();
                pageTurn.current(direction);
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Escape acts as "Back" everywhere in the app: first close
    // whichever popup is currently open (here, the Strategy
    // confirmation or the Export flow's own two-step dialog), and
    // only once nothing is open anymore does it fall through to the
    // same navigation the footer's own "Back" link performs.
    useEffect(() => {

        function handleKeyDown(event: KeyboardEvent) {

            if (event.key !== "Escape") {
                return;
            }

            if (strategyPrompt) {
                setStrategyPrompt(null);
                return;
            }

            if (exportStep !== "none") {
                setExportStep("none");
                return;
            }

            // Focus mode shown: Escape leaves it, before leaving the page.
            if (document.documentElement.classList.contains("focus-mode")) {
                FocusModeService.set(false);
                return;
            }

            navigate("/assistant", { state: { capability: system?.capability } });

        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, [strategyPrompt, exportStep, navigate, system]);

    useEffect(() => {

        if (!organizationId) {
            setLoadingError("No Organisation selected.");
            return;
        }

        if (!system) {
            setLoadingError("No Framework System selected.");
            return;
        }

        try {
            // Resume a previously saved Interview Session for this
            // same Organization + System (e.g. after a page reload),
            // rather than discarding the user's progress. Each
            // Organization keeps its own saved state per System (see
            // OrganizationService / item 6), so switching Systems --
            // or switching Organizations -- always resumes the right
            // Interview instead of a different one's.
            const savedSession = StorageService.loadInterview(organizationId, system.number);

            const loadedSession = savedSession ?? interviewManager.create(system.id);

            if (targetSectionNumber !== undefined) {
                loadedSession.goToSection(targetSectionNumber - 1);
                if (resume || openingField) {
                    loadedSession.startInterview();
                }
                StorageService.saveInterview(organizationId, loadedSession);
            }

            setSession(loadedSession);
        } catch (error) {
            setLoadingError(
                error instanceof Error
                    ? error.message
                    : "Failed to load Framework."
            );
        }

        // Every answer edit debounces its actual localStorage write
        // (see LocalOrganizationStore) so typing
        // doesn't pay a full-document read-parse-write on every
        // keystroke -- flushing here on cleanup (leaving this System,
        // switching Organizations, or unmounting entirely) guarantees
        // the last edit is on disk before we navigate away, on top of
        // the page unload/hide safety net OrganizationService already
        // registers for closing the app outright.
        return () => {
            OrganizationService.flushPendingWrites();
        };

    }, [system, organizationId, targetSectionNumber, resume, openingField]);

    // The last place worked, for System Selection's "Continue" line:
    // this System and the page open in it, whenever the interview
    // (not its Introduction) is showing. The section card is added
    // by recordFocusedCard below, and kept while the page stays the
    // same.
    const interviewShowing = session?.hasStartedInterview() ?? false;
    const placeIndex = session?.getCurrentSectionIndex();

    useEffect(() => {

        if (!organizationId || !system || !interviewShowing || placeIndex === undefined) {
            return;
        }

        const previous = OrganizationService.getLastPlace(organizationId);
        const samePage = previous?.systemNumber === system.number && previous?.sectionIndex === placeIndex;

        OrganizationService.setLastPlace(organizationId, {
            systemNumber: system.number,
            sectionIndex: placeIndex,
            anchor: samePage ? previous?.anchor : undefined
        });

    }, [organizationId, system, interviewShowing, placeIndex]);

    // Continuing lands on the card last worked in, once the page has
    // drawn it.
    useEffect(() => {

        const anchor = resume?.anchor;

        if (!session || !anchor) {
            return;
        }

        const timer = window.setTimeout(() => scrollToRailSection(anchor), 300);

        return () => window.clearTimeout(timer);

    }, [session, resume]);

    useEffect(() => {

        if (!session || !openingField) {
            return;
        }

        const timer = window.setTimeout(() => openingField.text
            ? focusText(openingField.text, openingField.ids ?? [])
            : focusField(openingField.key, openingField.anchors ?? []), 300);

        return () => window.clearTimeout(timer);

    }, [session, openingField]);

    // The Product Development System's Product Register is kept in
    // the Organization's shared product list (see
    // SHARED_PRODUCT_REGISTER_BINDINGS above). Landing on it pulls
    // in the latest shared rows before anything renders, rather
    // than showing a possibly stale copy from this Session's own
    // last save.
    //
    // Separately, the Product Development System's Sections 2-7
    // (Product Validation through Product Review) each have their
    // OWN answers per Product, not one shared answer for whichever
    // Product happened to be selected last -- so landing on any of
    // those Sections swaps in the CURRENTLY selected Product's own
    // saved answers (or a blank one, if that Product has none yet).
    useEffect(() => {

        if (!session || !organizationId || !system) {
            return;
        }

        const sectionNumber = session.getCurrentSectionNumber();

        if (isSharedProductRegisterSection(system.id, sectionTitleOf(session, sectionNumber))) {

            const sharedProducts = OrganizationService.getProducts(organizationId);

            session.saveResponse(sectionNumber, sharedProducts);
            StorageService.saveInterview(organizationId, session);
            redraw();

            return;

        }

        // Publishing System's Content Strategy / Website System's
        // Website Specification -- swap in the shared Target
        // Audience rows for just this Section's own "target-
        // audience" Multi-Part part, leaving every other part of
        // the Section (Content Goals, Website Purpose, etc.) as
        // this Session already had it.
        const targetAudiencePartBinding = findSharedTargetAudiencePartBinding(system.id, sectionNumber);

        if (targetAudiencePartBinding) {

            const sharedAudiences = OrganizationService.getTargetAudiences(organizationId);

            const currentValue = session.getResponse(sectionNumber);

            const currentParts: Record<string, unknown> =
                currentValue && typeof currentValue === "object" && !Array.isArray(currentValue)
                    ? currentValue as Record<string, unknown>
                    : {};

            session.saveResponse(sectionNumber, {
                ...currentParts,
                [targetAudiencePartBinding.partId]: sharedAudiences
            });

            StorageService.saveInterview(organizationId, session);
            redraw();

            return;

        }

        // Social Media System's own Audience Profiles -- same
        // shared Target Audience list, reconciled into this
        // Section's own WIDER table (see
        // mergeSharedAudienceIntoSocialMediaRows above).
        if (isSocialMediaAudienceProfilesSection(system.id, sectionNumber)) {

            const sharedAudiences = OrganizationService.getTargetAudiences(organizationId);
            const currentRows = session.getResponse(sectionNumber);

            const merged = mergeSharedAudienceIntoSocialMediaRows(sharedAudiences, currentRows);

            session.saveResponse(sectionNumber, merged);
            StorageService.saveInterview(organizationId, session);

            // Any locally-only audience (typed directly into Social
            // Media, not yet reflected in the shared store) round-
            // trips into the shared store right away too, so
            // Publishing/Website see it without waiting for a
            // further edit here.
            OrganizationService.saveTargetAudiences(organizationId, extractSharedAudienceRows(merged));

            redraw();

            return;

        }

        if (system.id === "product-development" && sectionNumber >= 2) {

            const selected = OrganizationService.getSelectedProductId(organizationId);

            if (!selected) {
                return;
            }

            const sectionDefinition = session.getFramework().sections.find(
                candidate => candidate.number === sectionNumber
            );

            if (!sectionDefinition) {
                return;
            }

            const stored = OrganizationService.getProductSectionResponse(
                organizationId,
                selected,
                sectionNumber
            );

            const value = stored ?? defaultAnswerValue(sectionDefinition.answer);

            session.saveResponse(sectionNumber, value);
            StorageService.saveInterview(organizationId, session);
            redraw();

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, organizationId, system, session?.getCurrentSectionIndex()]);


    function redraw() {
        refresh(value => value + 1);
    }

    function persistAndRedraw(currentSession: InterviewSession) {
        if (organizationId) {
            StorageService.saveInterview(organizationId, currentSession);
        }
        redraw();
    }

    // Every Section/Introduction change should present the new
    // page starting at its top, rather than keeping whatever
    // scroll position the previous (possibly taller) Section left
    // the window at.
    function scrollToTop() {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    }

    // The page moves: Start Interview, Next, Previous, the rail's jump, the Introduction (pageNavigation.ts).
    const { startInterview, startInterviewAt, nextSection, previousSection, goToPage, goToIntroduction } = pageNavigation({ session, organizationId, system, persistAndRedraw, scrollToTop, setValidationIssues, setExportStep, openExportOptions });

    // Stabilized so this is the SAME function reference across a
    // keystroke-driven re-render triggered by editing THIS field --
    // this is <AnswerRenderer>'s `onChange` prop, which flows all the
    // way down into <DynamicTable> for Table Sections; a fresh
    // closure every render would defeat DynamicTable's own
    // `React.memo` (see DynamicTable.tsx) every single time, since
    // `onChange` identity is one of its compared props. `persistAndRedraw`
    // is deliberately left out of the dependency list: it only closes
    // over `organizationId` (already a dependency here) and the
    // stable `refresh` state setter, so calling whichever instance of
    // it happened to be in scope when this callback was last built is
    // behaviorally identical to calling the latest one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const handleAnswerChange = useCallback((value: unknown) => {

        if (!session) {
            return;
        }

        // What the page held before, so a removal can be undone.
        const changedSection = session.getCurrentSectionNumber();
        const before = session.getResponse(changedSection);

        session.saveCurrentResponse(value);

        if (organizationId && system) {

            const sectionNumber = session.getCurrentSectionNumber();

            const targetAudiencePartBinding = findSharedTargetAudiencePartBinding(system.id, sectionNumber);

            if (isSharedProductRegisterSection(system.id, sectionTitleOf(session, sectionNumber))) {

                OrganizationService.saveProducts(organizationId, Array.isArray(value) ? value : []);

            } else if (targetAudiencePartBinding) {

                const parts: Record<string, unknown> =
                    value && typeof value === "object" && !Array.isArray(value)
                        ? value as Record<string, unknown>
                        : {};

                OrganizationService.saveTargetAudiences(
                    organizationId,
                    extractSharedAudienceRows(parts[targetAudiencePartBinding.partId])
                );

            } else if (isSocialMediaAudienceProfilesSection(system.id, sectionNumber)) {

                OrganizationService.saveTargetAudiences(
                    organizationId,
                    extractSharedAudienceRows(value)
                );

            } else if (system.id === "product-development" && sectionNumber >= 2) {

                const selected = OrganizationService.getSelectedProductId(organizationId);

                if (selected) {
                    OrganizationService.saveProductSectionResponse(
                        organizationId,
                        selected,
                        sectionNumber,
                        value
                    );
                }

            }

        }

        persistAndRedraw(session);

        // A card, row or text just removed can be put back, into the
        // page as it is then: through this same path while the page is
        // open (so whatever it keeps in step is kept), otherwise
        // straight into its stored answer.
        offerRemovalUndo(before, value, () => session.getResponse(changedSection), next => {
            if (session.getCurrentSectionNumber() === changedSection) {
                answerChangeRef.current(next);
            } else {
                session.saveResponse(changedSection, next);
                persistAndRedraw(session);
            }
        });

    }, [session, organizationId, system]);

    // The latest handleAnswerChange, for an undo offered by an earlier one.
    const answerChangeRef = useRef(handleAnswerChange);
    answerChangeRef.current = handleAnswerChange;

    // Another System's interview: a removal on the last one is final.
    useEffect(() => () => UndoService.dismiss(), [session]);

    // Resolves a Table column's live dropdown options from another
    // Section's response (see TableColumnDefinition.dynamicSource) --
    // e.g. a "Revenue Stream" column whose choices should always
    // match whatever the user has entered under the Revenue Model
    // Section's "Revenue Stream" card, or a "Stakeholder" column
    // whose choices should always match the Stakeholder Register
    // Table's own "Stakeholder" column. Matched by normalized title
    // text, the same way Questions/Answers Sections are matched to
    // each other -- and the same "Section: Card" markdown syntax
    // works whether the source is a Card List's card, a Table's
    // column, or (recursing one level) a named part of a Multi-Part
    // Section's own Table/Card List part, so a System's Answer
    // Definition never needs to say which kind of source it's
    // pointing at.
    //
    // `systemTitle`, when present, points at a Section of a
    // DIFFERENT System than the one this session is currently
    // interviewing (e.g. Finance System's Revenue Streams column
    // sourcing its options from the Business System's Revenue
    // Model). That other System's own saved Interview state is
    // read directly through StorageService/OrganizationService --
    // never through `session`, which only ever holds the CURRENT
    // System's Sections/responses -- falling back to that System's
    // freshly-parsed (still response-free) Framework when it has
    // never been opened for this Organization yet, so a not-yet-
    // started System just yields no options rather than an error.
    //
    // Declared here (alongside handleAnswerChange, BEFORE the
    // loadingError/!session early returns below) rather than closer
    // to where `framework`/`currentSection` already exist post-guard,
    // specifically so this can be a real `useCallback` -- React
    // requires every hook to run in the same order on every render,
    // and a hook placed after an early `return` would only run on
    // SOME renders. Guards on `session` itself instead, mirroring
    // handleAnswerChange's own internal check just above. Stabilized
    // on `session`/`organizationId` (a session's Framework, and
    // therefore its Sections, are the same object reference for the
    // session's whole lifetime) so this is <AnswerRenderer>'s
    // `resolveDynamicOptions` prop stays a stable reference across a
    // keystroke-driven re-render too -- both for the `tableColumns`
    // memo inside AnswerRenderer.tsx and, through it, <DynamicTable>'s
    // own `React.memo`.
    const resolveDynamicOptions = useCallback((
        systemTitle: string | undefined,
        sectionTitle: string,
        cardTitle: string
    ): string[] => {

        if (!session) {
            return [];
        }

        const currentFramework = session.getFramework();

        const isCrossSystem = systemTitle
            && normalize(systemTitle) !== normalize(currentFramework.metadata.systemName ?? "");

        if (!isCrossSystem) {

            const sourceSection = currentFramework.sections.find(
                candidate => normalize(candidate.title) === normalize(sectionTitle)
            );

            if (!sourceSection) {
                return [];
            }

            const response = session.getResponse(sourceSection.number);

            return extractDynamicOptions(sourceSection.answer, response, cardTitle, normalize);

        }

        const source = findSystemSection(systemTitle ?? "", sectionTitle);

        if (!source) {
            return [];
        }

        const otherSession = organizationId
            ? StorageService.loadInterview(organizationId, source.system.number)
            : null;

        const response = otherSession ? otherSession.getResponse(source.section.number) : undefined;

        return extractDynamicOptions(source.section.answer, response, cardTitle, normalize);

    }, [session, organizationId]);

    // Stabilized (rather than a plain function redeclared every
    // render) for the same reason as resolveDynamicOptions above --
    // this feeds into the Product Register Table's `rowSelection`
    // prop (see productRegisterRowSelection further below). Declared
    // here, before the early returns, for the same Rules-of-Hooks
    // reason. Doesn't touch `session` at all (only `organizationId`),
    // so no internal guard is needed beyond the existing one.
    const selectProduct = useCallback((name: string) => {

        if (!organizationId) {
            return;
        }

        OrganizationService.setSelectedProductId(organizationId, name);
        redraw();

    }, [organizationId]);

    // Export Options starts again from All Processes each time it opens (ExportFlow.tsx).
    function openExportOptions() {
        setExportOpenCount(count => count + 1);
        setExportStep("options");
    }


    // A Shared Answer Section (see AnswerType.SharedAnswer) holds no
    // data of its own: it renders ANOTHER System's Section and reads
    // and writes that System's saved response, so the two are one
    // piece of data edited from two places. Resolved here, once, into
    // the source System, its Section, and its live session.
    function resolveSharedAnswer(answer: AnswerDefinition | undefined) {

        const reference = answer?.sharedSource;

        if (!reference || !organizationId) {
            return null;
        }

        const source = findSystemSection(reference.systemTitle, reference.sectionTitle);

        if (!source) {
            return null;
        }

        const { system: sourceSystem, section: sourceSection } = source;

        // A session only exists once that System has been opened at
        // least once. Falling back to a fresh one means the shared
        // page still works before the source System has ever been
        // visited -- and saving it there is what creates it.
        const sourceSession =
            StorageService.loadInterview(organizationId, sourceSystem.number)
            ?? interviewManager.create(sourceSystem.id);

        return { system: sourceSystem, section: sourceSection, session: sourceSession };

    }

    // What actually renders: the mirrored Section's own definition
    // when this is a Shared Answer, otherwise this Section's own.
    // Shared by the page and the section rail so the rail always
    // lists the sections of the editor actually on screen.
    function resolveEffectiveAnswer(
        section: Section | undefined,
        shared: ReturnType<typeof resolveSharedAnswer>
    ): AnswerDefinition | undefined {

        return shared ? shared.section.answer : section?.answer;

    }

    // The Strategy System's Foundation page (by Answer Structure, not
    // number) and its saved value. Shared by the Strategy pages below
    // and the section rail, which lists the Foundation's Themes on the
    // Strategic Period and Roadmap pages.
    function findStrategyFoundationSection(currentSession: InterviewSession) {

        return currentSession.getFramework().sections.find(
            candidate => candidate.answer?.type === AnswerType.StrategyFoundation
        );

    }

    function resolveStrategyFoundationValue(currentSession: InterviewSession) {

        const foundationSection = findStrategyFoundationSection(currentSession);

        return foundationSection
            ? asStrategyFoundationValue(currentSession.getResponse(foundationSection.number))
            : undefined;

    }

    // Resolved before the early returns below so the section rail's
    // hook can use them; the page reads the same values further down.
    const sharedSource = session
        ? resolveSharedAnswer(session.getCurrentSection()?.answer)
        : null;

    const strategyFoundationValue = session
        ? resolveStrategyFoundationValue(session)
        : undefined;

    // The two bullet rails. Computed before the early returns below
    // (hooks), and simply empty while nothing is loaded.
    // Each page bullet is drawn in its page status (PageStatus.ts),
    // recomputed on every render so an answer given here shows at once.
    const railStatuses = session
        ? pageStatuses(session, (answer) => resolveSharedAnswerValue(organizationId, answer))
        : null;
    // (A page that holds several sections -- PageGroups.ts -- is one bullet, its companions' sections not pages of their own.)
    const groupSystemNumber = system?.number;
    const visiblePages = session ? session.getSections().filter(section => !isCompanion(groupSystemNumber, section.number)).length : 0;
    const railPages = session
        ? pageRailItems(session.getSections())
            .filter((_item, index) => !isCompanion(groupSystemNumber, session.getSections()[index].number))
            .map((item, position) => {
                const section = session.getSections().find(candidate => "page-" + candidate.number === item.id)!;
                const group = groupOf(groupSystemNumber, section.number);
                const members = (group?.members ?? [section.number]).map(number => railStatuses?.get(number));
                const status = members.every(entry => entry === "defined")
                    ? "defined" as const
                    : members.every(entry => entry === undefined || entry === "not-started") ? "not-started" as const : "in-progress" as const;
                return {
                    ...item,
                    // (A System of one page names it, with no number.)
                    label: (visiblePages > 1 ? (position + 1) + ". " : "") + (group ? group.title : item.label.replace(/^\d+\.\s+/, "")),
                    status: group ? status : railStatuses?.get(section.number)
                };
            })
        : [];
    const railSectionIndex = session?.getCurrentSectionIndex() ?? 0;
    // What renders on this page; also read by the page further down.
    const effectiveAnswer = session
        ? resolveEffectiveAnswer(session.getCurrentSection(), sharedSource)
        : undefined;

    // Columns are numbered continuously across the whole System
    // rather than restarting on each page, so this counts every
    // column on the column-layout Sections BEFORE the current one
    // (a System of three four-column pages therefore runs 1-4, 5-8,
    // 9-12). Counted against THIS System's own pages, not the
    // mirrored System's -- a shared page belongs to the System you
    // are currently in. The answers are identical either way; only
    // the positional index differs.
    // A Section that numbers its own units (see
    // AnswerDefinition.nestedNumbering) starts again from 1 instead,
    // as every Foundation page does. Resolved before the early
    // returns below because the section rail numbers its bullets
    // the same way.
    const columnNumberOffset = !session || effectiveAnswer?.nestedNumbering
        ? 0
        : session.getFramework().sections
            .filter(candidate => candidate.number < (session.getCurrentSection()?.number ?? 0))
            .reduce(
                (total, candidate) => total + numberedUnitCount(
                    candidate.answer,
                    // A Shared Answer counts as whatever it mirrors.
                    (answer: AnswerDefinition) => resolveSharedAnswer(answer)?.section.answer
                ),
                0
            );

    // Each section bullet is drawn in its section's status too
    // (SectionStatus.ts), from the same answers, on every render.
    const railSectionItems = session
        ? (drawnAsTiles(effectiveAnswer) ? [] : sectionRailItems(effectiveAnswer, strategyFoundationValue?.themes ?? [], columnNumberOffset + 1))
        : [];
    const railSectionStatuses = session
        ? sectionStatuses(
            effectiveAnswer,
            sharedSource
                ? resolveSharedAnswerValue(organizationId, session.getCurrentSection()?.answer)
                : session.getResponse(session.getCurrentSection()?.number ?? 0),
            {
                pageDefined: railStatuses?.get(session.getCurrentSection()?.number ?? 0) === "defined",
                themes: strategyFoundationValue?.themes ?? [],
                periodValue: session.getResponse(
                    session.getSections().find(candidate => candidate.answer?.type === AnswerType.StrategicPeriod)?.number ?? 0
                ),
                railIds: railSectionItems.map(item => item.id)
            }
        )
        : null;
    const railSections = railSectionItems.map(item => ({ ...item, status: railSectionStatuses?.get(item.id) }));
    const [activeRailSection, selectRailSection] = useActiveRailSection(railSections.map(item => item.id), railSectionIndex);

    // THE POSITIONING ANSWERS FOLLOW THE BUSINESS STAGE (owner, 2026-10-25): where a new Opening Date or duration has put the business in another stage, the answers that no longer fit it go back to their default.
    useEffect(() => {
        const identity = systems.find(candidate => candidate.id === "identity");
        const section = identity ? frameworkRegistry.getFramework(identity.id).sections.find(candidate => candidate.answer?.type === AnswerType.LegalEntity) : undefined;
        if (!organizationId || !identity || !section) {
            return;
        }
        const settings = asGlobalSettings(OrganizationService.getGlobalSettings(organizationId));
        const stage = stageOf(settings.openingDate, new Date(), stageDurationsOf(settings));
        const here = session && system.number === IDENTITY_SYSTEM_NUMBER;
        const state = here ? null : OrganizationService.loadSystemState(organizationId, IDENTITY_SYSTEM_NUMBER) as { responses?: Array<{ sectionNumber: number; value?: unknown }> } | null;
        const raw = here ? session.getResponse(section.number) : state?.responses?.find(response => response.sectionNumber === section.number)?.value;
        if (raw === undefined) {
            return;
        }
        const entity = asLegalEntityValue(raw);
        const fitted = fitPositioningToStage(entity.organisation, stage);
        if (fitted === entity.organisation) {
            return;
        }
        const next = { ...entity, organisation: fitted };
        if (here) {
            session.saveResponse(section.number, next);
            persistAndRedraw(session);
        } else if (state?.responses) {
            OrganizationService.saveSystemState(organizationId, IDENTITY_SYSTEM_NUMBER, { ...state, responses: state.responses.map(response => response.sectionNumber === section.number ? { ...response, value: next } : response) });
            redraw();
        }
    });

    // A companion is no page of its own: wherever the interview was left on one (a saved place, a link), it opens on the page it stands in.
    useEffect(() => {
        const current = session?.getCurrentSection();
        if (session && current && isCompanion(groupSystemNumber, current.number)) {
            session.goToSection(primaryOf(groupSystemNumber, current.number) - 1);
            redraw();
        }
    });

    if (loadingError) {
        return <div>{loadingError}</div>;
    }

    if (!session) {
        return <div>Loading...</div>;
    }

    const framework = session.getFramework();
    const introduction = framework.introduction;
    const currentSection = session.getCurrentSection();

    const showIntroduction = !session.hasStartedInterview();

    // The page arrows (above the rails; beside Start Interview on the
    // Introduction) and ← / →: back to the Introduction from the first
    // page, and no further than the last.
    const previousPage = session.isFirstSection() ? goToIntroduction : previousSection;
    // (The last page: no page of its own follows it.)
    const lastPageIndex = session.getSections().reduce((last, section, index) => isCompanion(groupSystemNumber, section.number) ? last : index, 0);
    const onLastPage = session.getCurrentSectionIndex() >= lastPageIndex;
    pageTurn.current = (direction) => {
        if (showIntroduction) {
            if (direction === "next") {
                startInterview();
            }
            return;
        }
        if (direction === "previous") {
            previousPage();
        } else if (!onLastPage && !nextDisabled) {
            nextSection();
        }
    };

    // A field taking focus names the section card it is in (its
    // `data-rail` marker) as the last place worked -- cheap, and
    // only while the interview itself is showing.
    function recordFocusedCard(event: React.FocusEvent<HTMLElement>) {

        if (!organizationId || !system || !session || showIntroduction) {
            return;
        }

        const anchor = (event.target as HTMLElement).closest<HTMLElement>("[data-rail]")?.dataset.rail;

        if (!anchor) {
            return;
        }

        OrganizationService.setLastPlace(organizationId, {
            systemNumber: system.number,
            sectionIndex: session.getCurrentSectionIndex(),
            anchor
        });

    }

    // The value shown, and where an edit goes. A Shared Answer reads
    // and writes the SOURCE System's stored response, so editing here
    // is editing that System -- there is deliberately no second copy
    // to keep in step.
    const effectiveValue = sharedSource
        ? sharedSource.session.getResponse(sharedSource.section.number)
        : session.getCurrentResponse();

    function handleSharedAnswerChange(value: unknown) {

        if (!sharedSource || !organizationId) {
            return;
        }

        const { session: source, section } = sharedSource;
        const before = source.getResponse(section.number);

        source.saveResponse(section.number, value);

        StorageService.saveInterview(organizationId, source);

        redraw();

        // As handleAnswerChange: a removal can be undone.
        offerRemovalUndo(before, value, () => source.getResponse(section.number), next => {
            source.saveResponse(section.number, next);
            StorageService.saveInterview(organizationId, source);
            redraw();
        });

    }

    // A column-layout page (see AnswerDefinition.columns) lays its
    // Section out as side-by-side columns, and moves its own title up
    // into the Interview Header. Read from the EFFECTIVE answer so a
    // Shared Answer mirroring a column page lays out as one too.
    const isColumnsPage = effectiveAnswer?.columns === true;

    // Pages whose editor owns the full width and carries its own
    // internal headings move their Section title up into the
    // Interview Header, rather than repeating it as a separate
    // heading directly above their own first heading. Column pages
    // do this already; the Brand System's Style and Inventory
    // editors are laid out the same way and read the same.
    // 3. Infrastructure & Capability drops each card's guidance down from an arrow
    // beside the card's title, instead of the page's Hide Help button.
    // (3. Customer Engagement has its guidance in the "i" beside each section title: no Hide Help button either.)
    const titleHelpArrows = effectiveAnswer?.type === AnswerType.BusinessCapability || effectiveAnswer?.type === AnswerType.BusinessFoundation || effectiveAnswer?.type === AnswerType.BusinessEngagement || effectiveAnswer?.type === AnswerType.StrategyFoundation
        || effectiveAnswer?.type === AnswerType.LegalEntity || effectiveAnswer?.type === AnswerType.FoundersProfile
        || effectiveAnswer?.type === AnswerType.BrandStyle || effectiveAnswer?.type === AnswerType.BrandInventory
        || effectiveAnswer?.type === AnswerType.StrategicPeriod || effectiveAnswer?.type === AnswerType.StrategicRoadmap
        // (A column page of four is drawn as four tiles, 2 x 2: each column's questions are in its tile's dialog, so the page has no Hide Help button.)
        || (effectiveAnswer?.columns === true && (effectiveAnswer.parts?.length ?? 0) === 4);

    const mergesTitleIntoHeader =
        isColumnsPage ||
        effectiveAnswer?.type === AnswerType.BusinessFoundation ||
        effectiveAnswer?.type === AnswerType.BusinessEngagement ||
        effectiveAnswer?.type === AnswerType.BusinessCapability ||
        effectiveAnswer?.type === AnswerType.FinancialFoundation ||
        effectiveAnswer?.type === AnswerType.FinancialSustainability ||
        effectiveAnswer?.type === AnswerType.LegalEntity ||
        effectiveAnswer?.type === AnswerType.FoundersProfile ||
        effectiveAnswer?.type === AnswerType.BrandStyle ||
        effectiveAnswer?.type === AnswerType.BrandInventory ||
        effectiveAnswer?.type === AnswerType.StrategyFoundation ||
        effectiveAnswer?.type === AnswerType.StrategicPeriod ||
        effectiveAnswer?.type === AnswerType.StrategicRoadmap;

    // What this page reads from the other Systems, and the ways to open or save their pages (crossSystemReaders.ts).
    const {
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
    } = readCrossSystem({ session, organizationId, systemNumber: system.number, navigate, redraw, persistAndRedraw, scrollToTop });


    /*
        The Strategy System's three pages read forward: the Strategic
        Period page develops the Themes the Foundation page defines,
        and the Roadmap draws both. A Section can only see its own
        response, so the other pages' answers are resolved here, once,
        and handed down.

        Resolved by Answer Structure rather than by System number, so
        this stays correct if the Strategy pages are ever reordered.
    */
    const strategyFoundationSection = findStrategyFoundationSection(session);

    const strategicPeriodSection = framework.sections.find(
        candidate => candidate.answer?.type === AnswerType.StrategicPeriod
    );

    // strategyFoundationValue itself is resolved above the early
    // returns (resolveStrategyFoundationValue), for the section rail.

    const strategicPeriodValue = strategicPeriodSection
        ? asStrategicPeriodValue(session.getResponse(strategicPeriodSection.number))
        : undefined;

    /*
        Every number on the Strategic Period page hangs off the
        Strategic Period's own number, which is the LAST of the
        Foundation page's four columns -- not the Foundation
        Section's number, which is 1.
    */
    const strategyThemeNumberPrefix = String(
        numberedUnitCount(strategyFoundationSection?.answer)
    );

    /**
     * Removing a Theme takes everything written under it on the
     * Strategic Period page with it, so this asks first -- but only
     * when there is something to lose. A Theme with nothing recorded
     * against it goes without a dialog, because confirming an
     * inconsequential action just teaches people to dismiss dialogs.
     */
    function guardThemeRemoval(theme: StrategyThemeValue, apply: () => void) {

        if (!strategicPeriodValue || !strategyThemeHasContent(strategicPeriodValue, theme.id)) {
            apply();
            return;
        }

        setStrategyPrompt({
            title: "Remove this Theme?",
            message:
                `"${theme.name.trim() || "Untitled Theme"}" has Goals, Objectives and ` +
                "Initiatives recorded against it on the Strategic Period page. Removing " +
                "the Theme removes all of them, and this cannot be undone.",
            apply
        });

    }

    /**
     * An Objective can only be placed inside the Strategic Period,
     * so narrowing the Period can strand one that was planned in the
     * part being cut away. Rather than silently leaving it outside
     * (where the Roadmap could not draw it), this names the
     * Objectives that would be stranded so the user knows exactly
     * which ones to move.
     */
    function guardPeriodChange(period: StrategyRangeValue, apply: () => void) {

        if (!strategyFoundationValue || !strategicPeriodValue || !isRangeSet(period)) {
            apply();
            return;
        }

        const first = monthIndex(period.start);
        const last = monthIndex(period.end);

        const stranded: string[] = [];

        strategyFoundationValue.themes.forEach((theme, themeIndex) => {

            strategyGoalsForTheme(strategicPeriodValue, theme.id).forEach((goal, goalIndex) => {

                goal.objectives.forEach((objective, objectiveIndex) => {

                    if (!isRangeSet(objective.period)) {
                        return;
                    }

                    const start = monthIndex(objective.period.start);
                    const end = monthIndex(objective.period.end);

                    if (start >= first && end <= last) {
                        return;
                    }

                    // Named as the page shows it, in words, so the
                    // user can find it: "Theme 1, Goal 2, Objective 1".
                    const number =
                        `Theme ${themeIndex + 1}, Goal ${goalIndex + 1}, Objective ${objectiveIndex + 1}:`;

                    stranded.push(
                        `${number} ${objective.name.trim() || "Untitled Objective"} ` +
                        `(${formatRangeShort(objective.period)})`
                    );

                });

            });

        });

        if (stranded.length === 0) {
            apply();
            return;
        }

        setStrategyPrompt({
            title: "Objectives fall outside this period",
            message:
                `${formatRangeShort(period)} leaves out ` +
                `${stranded.length === 1 ? "this Objective" : "these Objectives"}: ` +
                `${stranded.join("; ")}. Change ` +
                `${stranded.length === 1 ? "its period" : "their periods"} on the ` +
                "Strategic Period page first, or continue and set " +
                `${stranded.length === 1 ? "it" : "them"} again.`,
            apply
        });

    }

    /*
        The Current Situation drafted from the Business System, which
        is answered before Strategy: read from what is saved, on the
        Strategy System only.
    */
    const businessSessions = system?.id === "strategy" && organizationId
        ? {
            identity: StorageService.loadInterview(organizationId, IDENTITY_SYSTEM_NUMBER),
            business: StorageService.loadInterview(organizationId, BUSINESS_SYSTEM_NUMBER),
            organisationName: organizationName
        }
        : null;
    const situationDraft = businessSessions ? currentSituationDraft(businessSessions) : "";

    /* The financial plan's dates, for the Strategic Period to be compared with. */
    const financialPlan = businessSessions ? financialPlanRange(businessSessions) : null;

    /** Refreshing replaces the founder's own words: asked first. */
    function guardSituationRefresh(apply: () => void) {
        setStrategyPrompt({
            title: "Replace your Current Situation?",
            message: "Refresh replaces the text with a new draft from the Business System. " +
                "The changes you made to it will be lost.",
            apply
        });
    }

    /*
        A Business System page, opened from the Strategy System as the
        Legal Entity is opened from Business: that System, at that
        Section. The browser's Back, and the app's, return here.
    */
    const businessSystem = systems.find(candidate => candidate.id === "business");
    const openBusinessPage = (type: AnswerType) => {
        const target = businessSystem
            ? frameworkRegistry.getFramework(businessSystem.id).sections.find(candidate => candidate.answer?.type === type)
            : undefined;
        if (!businessSystem || !target) {
            return;
        }
        if (organizationId) {
            persistAndRedraw(session);
        }
        navigate("/introduction", { state: { system: businessSystem, targetSectionNumber: target.number } });
    };

    const strategyContext =
        strategyFoundationValue && strategicPeriodValue
            ? {
                foundation: strategyFoundationValue,
                period: strategicPeriodValue,
                themeNumberPrefix: strategyThemeNumberPrefix,
                guardThemeRemoval,
                guardPeriodChange,
                onChangePeriod: (next: StrategicPeriodValue) => {
                    if (strategicPeriodSection) {
                        session.saveResponse(strategicPeriodSection.number, next);
                        persistAndRedraw(session);
                    }
                },
                situationDraft,
                guardSituationRefresh,
                openBusinessPage,
                financialPlan
            }
            : undefined;

    /*
        The last two Strategy page titles are written with a literal
        "MM/YY - MM/YY" placeholder: it becomes the Strategic Period
        (" · Jan 2027 – Dec 2029") once one is set, and disappears
        until then (see titleWithPeriod).
    */
    // The period a title's "MM/YY - MM/YY" stands for: the Strategic
    // Period on the Strategy pages, the financial plan's months on the
    // Business System's Financial pages (financialPlanPeriod).
    const titlePeriod = strategyFoundationValue?.period ?? (financialFoundationSection
        ? financialPlanPeriod(session.getResponse(financialFoundationSection.number))
        : { start: { month: "", year: "" }, end: { month: "", year: "" } });

    const resolvedSectionTitle: string | undefined = currentSection
        ? titleWithPeriod(currentSection.title, titlePeriod)
        : undefined;

    // A Section that numbers its own units (see
    // AnswerDefinition.nestedNumbering) is itself numbered in the
    // title, so "1. Definition" says which page its "1." to "4."
    // columns are on. Where the numbering runs across the System
    // instead, the columns already carry that count and a Section
    // number in the title would be a second, unrelated one.
    const pageTitleGroup = groupOf(groupSystemNumber, currentSection.number);
    const pageTitle = pageTitleGroup
        // A page of several sections is named for them all (and a System of one such page needs no page name).
        ? (!pageTitleGroup.inHeader ? undefined : (railPages.findIndex(page => page.id === "page-" + currentSection.number) + 1) + ". " + pageTitleGroup.title)
        : effectiveAnswer?.nestedNumbering && resolvedSectionTitle
        ? currentSection.number + ". " + resolvedSectionTitle
        : resolvedSectionTitle;

    // Product Development System product picker (item 7): Section
    // 1 (Product Register) requires picking one of its own rows
    // before "Next" unlocks; Sections 2-7 then show that Product's
    // name under their own title (see InterviewSection's subtitle).
    const isProductDevelopmentSystem = system?.id === "product-development";
    const isProductRegisterStep = isProductDevelopmentSystem && currentSection.number === 1;

    const productNames = isProductDevelopmentSystem
        ? extractProductNames(session.getResponse(1))
        : [];

    const storedSelectedProductId = organizationId
        ? OrganizationService.getSelectedProductId(organizationId)
        : undefined;

    const selectedProductName =
        storedSelectedProductId && productNames.includes(storedSelectedProductId)
            ? storedSelectedProductId
            : undefined;

    const showProductSubtitle =
        isProductDevelopmentSystem && currentSection.number >= 2 && !!selectedProductName;

    const nextDisabled = isProductRegisterStep && !selectedProductName;

    // Operations System export scope picker (item 7): the Process
    // Library's own saved Processes/SOPs, read fresh every render
    // so the Export Options dialog always reflects whatever was
    // last saved -- not a stale snapshot from when the dialog first
    // opened.
    const isOperationsSystem = system?.id === "operations";
    const operationsProcesses: ProcessRecordValue[] = isOperationsSystem
        ? ((session.getResponse(OPERATIONS_PROCESS_LIBRARY_SECTION) as ProcessRecordValue[] | undefined) ?? [])
        : [];

    // Owner autofill suggestions for the Process Library (see
    // ProcessLibraryEditor's own `ownerSuggestions` prop): every
    // distinct Owner name ALREADY typed on some other Process --
    // the same Excel-style "suggest what's already been typed
    // elsewhere in this same column" pattern DynamicTable's own
    // "autofill" column type uses, just computed here since
    // Process Library is a bespoke editor, not a DynamicTable.
    // Roles & Responsibilities is no longer a source for this --
    // that Section is now itself DERIVED from Process Library's
    // Owner field (see RolesResponsibilitiesEditor.tsx), so
    // sourcing suggestions from it would be circular.
    const operationsOwnerSuggestions: string[] = isOperationsSystem
        ? Array.from(new Set(
              operationsProcesses
                  .map(process => process.who.trim())
                  .filter(name => name.length > 0)
          ))
        : [];

    // Lets the Product Register table (Section 1) double as the
    // Product picker: clicking a row, or its selection bullet under
    // the "#" column, selects that row's Product -- replacing the
    // separate Product picker list that used to sit below the table.
    const productRegisterRowSelection = isProductRegisterStep
        ? {
              isSelected: (row: Record<string, unknown>) => {
                  const name = row["product"];
                  return typeof name === "string" && name.trim() === selectedProductName;
              },
              onSelect: (row: Record<string, unknown>) => {
                  const name = row["product"];
                  if (typeof name === "string" && name.trim().length > 0) {
                      selectProduct(name.trim());
                  }
              }
          }
        : undefined;

    /** The other sections of the page a section stands on (PageGroups.ts), each with its saved answer and its saver: a tile of one frame may draw another section's answer (doc 45). */
    const pageSectionsBeside = (section: typeof currentSection): PageSectionAnswer[] | undefined => {
        const group = groupOf(groupSystemNumber, section.number);
        if (!group || group.members.length < 2) {
            return undefined;
        }
        return group.members.filter(number => number !== section.number).flatMap(number => {
            const other = session.getSections().find(candidate => candidate.number === number);
            if (!other?.answer) {
                return [];
            }
            const own = number === currentSection.number;
            return [{
                number,
                title: other.title,
                definition: own ? (effectiveAnswer ?? other.answer) : other.answer,
                value: own ? effectiveValue : session.getResponse(number),
                onChange: own
                    ? (sharedSource ? handleSharedAnswerChange : handleAnswerChange)
                    : (next: unknown) => {
                        session.saveResponse(number, next);
                        persistAndRedraw(session);
                    }
            }];
        });
    };

    /** One section's answer, drawn with its own field keys: the page's own section, or a companion drawn beside it (PageGroups.ts). */
    const renderAnswer = (section: typeof currentSection, answerDefinition: AnswerDefinition | undefined, answerValue: unknown, change: (value: unknown) => void, primary: boolean) => (
                            <FieldPageProvider
                                key={section.number}
                                organizationId={organizationId}
                                systemNumber={system.number}
                                sectionNumber={section.number}
                                pageTitle={section.number + ". " + (primary ? (resolvedSectionTitle ?? section.title) : section.title)}
                            >
                            <AnswerRenderer
                                key={section.number}
                                definition={answerDefinition ?? section.answer}
                                value={answerValue}
                                onChange={change}
                                frameTitle={pageGroup && pageGroup.members.length > 1 ? (pageGroup.members.indexOf(section.number) + 1) + ". " + (pageGroup.frameTitles?.[pageGroup.members.indexOf(section.number)] ?? section.title) : pageGroup?.frameTitles?.[0]}
                                pageSections={pageSectionsBeside(section)}
                                legalEntitySectionNumber={legalEntitySection?.number}
                                resolveDynamicOptions={resolveDynamicOptions}
                                rowSelection={productRegisterRowSelection}
                                ownerSuggestions={operationsOwnerSuggestions}
                                processLibraryProcesses={operationsProcesses}
                                columnNumberOffset={primary ? columnNumberOffset : 0}
                                legalEntityPrefill={legalEntityPrefill}
                                targetAudience={targetAudience}
                                identityVision={identityVision}
                                businessFoundation={businessFoundationValue}
                                onOpenBusinessFoundation={openBusinessFoundation}
                                organisationCurrency={organisationCurrency}
                                legalEntityFounders={legalEntity.founders}
                                foundersProfile={foundersProfile}
                                legalEntity={legalEntity}
                                businessCapability={businessCapabilityValue}
                                financialFoundation={financialFoundationValue}
                                openingDate={openingDate}
                                onChangeOpeningDate={changeOpeningDate}
                                businessStage={businessStage}
                                globalSettings={globalSettings}
                                financialSustainability={financialSustainabilityValue}
                                businessEngagement={businessEngagementValue}
                                onOpenBusinessEngagement={openBusinessSection(AnswerType.BusinessEngagement)}
                                onOpenBusinessCapability={openBusinessSection(AnswerType.BusinessCapability)}
                                onChangeBusinessCapability={capabilitySection
                                    ? (next: unknown) => {
                                        session.saveResponse(capabilitySection.number, next);
                                        persistAndRedraw(session);
                                    }
                                    : undefined}
                                onOpenFinancialFoundation={openBusinessSection(AnswerType.FinancialFoundation)}
                                onOpenLegalEntity={openLegalEntity}
                                onChangeLegalEntity={changeLegalEntityHere}
                                onChangeFoundersProfile={changeFoundersProfile}
                                strategy={strategyContext}
                                showInstructions={!focusMode && (titleHelpArrows || instructionsOpen)}
                                columnsDivider={
                                    !primary
                                        ? undefined
                                        : titleHelpArrows
                                        // No "Hide Help" button: each column title folds its own guidance.
                                        ? (SHOW_PROGRESS_LINE
                                            ? (
                                                <InterviewProgress
                                                    current={session.getCurrentSectionIndex() + 1}
                                                    total={session.getTotalSections()}
                                                />
                                            )
                                            : undefined)
                                        : mergesTitleIntoHeader
                                        ? (
                                            <>
                                                {/*
                                                    Sits directly above
                                                    the progress line,
                                                    below the guidance
                                                    it hides -- so the
                                                    control is where
                                                    the thing it acts
                                                    on ends, and the
                                                    line stays the
                                                    boundary between
                                                    reading and
                                                    answering.
                                                */}
                                                <button
                                                    type="button"
                                                    className={"interview-help-toggle interview-instructions-toggle" + (SHOW_PROGRESS_LINE ? "" : " interview-instructions-toggle-last")}
                                                    aria-expanded={instructionsOpen}
                                                    onClick={() => setInstructionsOpen(open => !open)}
                                                >
                                                    {instructionsOpen ? "Hide Help" : "Need Help?"}
                                                </button>

                                                <InterviewProgress
                                                    current={session.getCurrentSectionIndex() + 1}
                                                    total={session.getTotalSections()}
                                                />
                                            </>
                                        )
                                        : undefined
                                }
                            />
                            </FieldPageProvider>
    );

    const pageGroup = groupOf(groupSystemNumber, currentSection.number);

    return (
        <div className="conversation-page">
            {/*
                (The Organization Calendar / Capabilities / System
                slide-in panel lives only on the System Selection page.)
            */}
            <AppHeader organizationName={organizationName} focusable={!showIntroduction} />

            <main className="conversation-content" onFocus={recordFocusedCard}>
                <div className="conversation-card">
                    <InterviewHeader
                        systemNumber={String(framework.metadata.systemNumber)}
                        systemName={framework.metadata.systemName}
                        capabilityId={system?.capability}
                        pageTitle={
                            // The opening screen is named as a page is: "— Introduction".
                            showIntroduction
                                ? "Introduction"
                                : mergesTitleIntoHeader ? pageTitle : undefined
                        }
                        pageTitleCapitals={showIntroduction}
                    />

                    {showIntroduction ? (
                        <section className="interview-section intro-layout">
                            {/*
                                Two rows, so the columns' first lines
                                line up whatever their sizes: the
                                question beside the first fact's title,
                                then the introduction beside the facts
                                (each pair on one baseline). Kept to a
                                reading measure; the facts beside the
                                text on a wide screen, under it on a
                                narrow one (conversation.css).
                            */}

                            {/* The question the System answers: the lead. */}
                            {introduction.guidingQuestion && (
                                <p className="intro-guiding-question">
                                    {introduction.guidingQuestion}
                                </p>
                            )}

                            {/* What the System covers: its scope and its
                                pages, each opening the interview there. */}
                            <h2 className="intro-fact-label intro-covers-label" id="intro-covers">What it covers</h2>

                            <div className="interview-block-content intro-text">
                                {splitIntoSentences(introduction.introductionText).map((sentence, index) => (
                                    <p key={index} className="intro-sentence">
                                        {withBold(sentence)}
                                    </p>
                                ))}
                            </div>

                            {/* Then what it draws from Systems answered
                                earlier, and how long it takes -- each only
                                where the content has it. */}
                            <div className="intro-facts">
                                <div className="intro-fact-text" role="group" aria-labelledby="intro-covers">
                                    {introduction.systemScope && (
                                        <p className="intro-fact-line">{introduction.systemScope}</p>
                                    )}
                                    {/* The app's one shown-not-asked
                                        numbered list: its number column,
                                        its indent and its gap. */}
                                    <ListStatic
                                        lines={railPages.map(page => ({
                                            key: page.id,
                                            className: "intro-page",
                                            text: (
                                                <TextLink className="intro-page-link" onClick={() => startInterviewAt(pageIndexFromRailId(page.id))}>
                                                    {page.label.replace(/^\d+\.\s+/, "")}
                                                </TextLink>
                                            )
                                        }))}
                                    />
                                </div>

                                {introduction.usesFromEarlier && (
                                    <div className="intro-fact">
                                        <h2 className="intro-fact-label">Uses from earlier</h2>
                                        <div className="intro-fact-text">
                                            <p className="intro-fact-line">{withBold(introduction.usesFromEarlier)}</p>
                                        </div>
                                    </div>
                                )}

                                {introduction.thinkingTime && (
                                    <div className="intro-fact">
                                        <h2 className="intro-fact-label">Thinking time</h2>
                                        <div className="intro-fact-text">
                                            <p className="intro-fact-line">{introduction.thinkingTime}</p>
                                            <p className="intro-fact-line intro-fact-note">
                                                You can stop at any time; everything is saved.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Under the content, centred on the page: Start
                                Interview, one button shaped as an arrow (→
                                starts it too). Its focus ring is drawn by the
                                wrapper, which the shape does not clip. */}
                            <div className="intro-start">
                                <span className="start-arrow">
                                    <AddButton look="primary-button" className="start-arrow-button"
                                        onClick={startInterview}>
                                        Start Interview
                                    </AddButton>
                                </span>
                            </div>
                        </section>
                    ) : (
                        <>
                            {showProductSubtitle && (
                                <div className="product-name-banner">
                                    {selectedProductName}
                                </div>
                            )}

                            <InterviewSection
                                section={currentSection}
                                hideTitle={mergesTitleIntoHeader}
                            />

                            {/*
                                A column-layout page hands its progress
                                line to AnswerRenderer instead, so it can
                                sit between the column questions and the
                                answer boxes -- which are interleaved
                                inside that component, out of reach of a
                                sibling rendered here.
                            */}
                            {!mergesTitleIntoHeader && (
                                <InterviewProgress
                                    current={session.getCurrentSectionIndex() + 1}
                                    total={session.getTotalSections()}
                                />
                            )}

                            {pageGroup && pageGroup.members.length > 1
                                ? (
                                    <div className="page-group">
                                        {renderAnswer(currentSection, effectiveAnswer ?? currentSection.answer, effectiveValue, sharedSource ? handleSharedAnswerChange : handleAnswerChange, true)}
                                        {pageGroup.members.slice(1).map(number => {
                                            const companion = session.getSections().find(candidate => candidate.number === number);
                                            return companion
                                                ? renderAnswer(companion, companion.answer, session.getResponse(companion.number), (next: unknown) => {
                                                    session.saveResponse(companion.number, next);
                                                    persistAndRedraw(session);
                                                }, false)
                                                : null;
                                        })}
                                    </div>
                                )
                                : renderAnswer(currentSection, effectiveAnswer ?? currentSection.answer, effectiveValue, sharedSource ? handleSharedAnswerChange : handleAnswerChange, true)}

                            {/* No Previous / Next bar: the page arrows above the
                                rails (and ← / →) turn the page. FINISH IS HIDDEN, not
                                removed: on the last page the next arrow is not shown,
                                so the export flow nextSection opens there (validation,
                                then the export options) is not reached from here for
                                now -- the user will decide how it is offered. Its code,
                                dialogs and route stay as they are. */}
                        </>
                    )}
                </div>
            </main>

            {/*
                Two bullet rails flank the card once the interview has
                started: the left one lists the System's Introduction and
                pages and jumps between them (not on the Introduction
                itself, which lists the pages under What it covers); the
                right one lists the current page's sections and scrolls
                to them. Rendered after
                <main> so the card's own fields come first in the tab
                order -- the rails are position: fixed, so where they
                sit in the DOM does not move them on screen. One
                wrapper holds both, so they start at one height and
                move up together (see bullet-rail.css).
            */}
            {!showIntroduction && (
                <div className="bullet-rails">
                    <div className="bullet-rails-row">
                        <BulletRail
                            side="left"
                            label="Pages"
                            // The Introduction first, unnumbered and with no status.
                            items={[{ id: INTRODUCTION_RAIL_ID, label: "Introduction", capitals: true }, ...railPages]}
                            activeId={"page-" + currentSection.number}
                            onSelect={id => id === INTRODUCTION_RAIL_ID
                                ? goToIntroduction()
                                : goToPage(pageIndexFromRailId(id))}
                            arrow={
                                <PageArrow
                                    direction="previous"
                                    label={session.isFirstSection() ? "Previous page: the Introduction" : undefined}
                                    onClick={previousPage}
                                />
                            }
                        />
                        <BulletRail
                            side="right"
                            label="Sections"
                            items={railSections}
                            activeId={activeRailSection}
                            onSelect={id => {
                                // Pinned first, so the jump's own scroll keeps it.
                                selectRailSection(id);
                                scrollToRailSection(id);
                            }}
                            arrow={onLastPage ? undefined : (
                                <PageArrow direction="next" disabled={nextDisabled} onClick={nextSection} />
                            )}
                        />
                    </div>
                </div>
            )}

            <AppFooter
                onBack={() => navigate("/assistant", { state: { capability: system?.capability } })}
            />

            {strategyPrompt && (
                <div className="confirmation-overlay" onClick={() => setStrategyPrompt(null)}>
                    <div className="confirmation-dialog" onClick={(event) => event.stopPropagation()}>

                        <h2 className="confirmation-title">{strategyPrompt.title}</h2>

                        <p className="confirmation-message">{strategyPrompt.message}</p>

                        <div className="confirmation-actions">

                            <AddButton look="confirmation-button secondary"
                                onClick={() => setStrategyPrompt(null)}>
                                Cancel
                            </AddButton>

                            <AddButton look="confirmation-button primary" className="confirmation-button-danger"
                                onClick={() => {
                                    strategyPrompt.apply();
                                    setStrategyPrompt(null);
                                }}>
                                Continue
                            </AddButton>

                        </div>

                    </div>
                </div>
            )}

            <ExportFlow
                step={exportStep}
                onStep={setExportStep}
                onContinue={openExportOptions}
                openCount={exportOpenCount}
                validationIssues={validationIssues}
                session={session}
                system={system}
                organizationId={organizationId}
                organizationName={organizationName}
                selectedProductName={selectedProductName}
                operationsProcesses={operationsProcesses}
                legalEntity={legalEntity}
                foundersProfile={foundersProfile}
                organisationCurrency={organisationCurrency} />
        </div>
    );
}
