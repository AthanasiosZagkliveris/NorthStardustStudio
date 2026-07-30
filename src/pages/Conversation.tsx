import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import AppFooter from "../components/AppFooter";
import InterviewHeader from "../components/interview/InterviewHeader";
import InterviewProgress from "../components/InterviewProgress";
import InterviewSection from "../components/InterviewSection";
import AnswerRenderer from "../components/interview/AnswerRenderer";

import { InterviewManager, ReviewManager } from "../framework/application";
import { InterviewSession } from "../framework/interview";
import { ValidationIssue, ValidationResult } from "../framework/model";
import { AnswerType } from "../framework/enums/AnswerType";
import {
    CardListAnswerValue,
    defaultAnswerValue,
    isAnswerEmpty,
    isTableRowComplete,
    TableAnswerRow,
    visibleTableColumns
} from "../framework/engine/AnswerUtils.ts";
import {
    buildMultiProductExportContent,
    buildSingleProductExportContent
} from "../framework/engine/ExportContentBuilder.ts";

import { StorageService } from "../services/StorageService";
import { OrganizationService } from "../services/OrganizationService";

import "../styles/conversation.css";
import "../styles/conversation-layout.css";
import "../styles/system-confirmation.css";

const interviewManager = new InterviewManager();
const reviewManager = new ReviewManager();

type ExportStep = "none" | "warning" | "options";
type CapabilityChoice = "original" | "other";

/**
 * The Product Development System's Export Options offer a choice
 * (item's follow-up request) between exporting just the currently
 * selected Product's own content, or the whole System file covering
 * every Product -- irrelevant to every other System, which only
 * ever exports "system"-scoped (the whole, single-Product-Register-
 * free document it always has).
 */
type ExportScope = "product" | "system";

/**
 * The Business System's Product Register (Section 5) and the
 * Product Development System's Product Register (Section 1)
 * are the SAME table per Organization (item 7): adding,
 * editing, or removing a row in either one shows up in the
 * other. Everything else about each System's own Sections
 * stays completely separate (see OrganizationService /
 * item 6) -- this is the one deliberate exception.
 */
const SHARED_PRODUCT_REGISTER_BINDINGS: { systemId: string; sectionNumber: number }[] = [
    { systemId: "business", sectionNumber: 5 },
    { systemId: "product-development", sectionNumber: 1 }
];

function isSharedProductRegisterSection(systemId: string | undefined, sectionNumber: number): boolean {
    return SHARED_PRODUCT_REGISTER_BINDINGS.some(
        binding => binding.systemId === systemId && binding.sectionNumber === sectionNumber
    );
}

/**
 * The Product Development System's Sections 2-7 (Product
 * Validation through Product Review) are answered once PER
 * Product, not once per System (see OrganizationService.
 * productAnswers) -- exporting this System needs to include
 * every Product's own answers for these Sections, not just
 * whichever Product happens to be selected right now.
 */
const PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS = new Set([2, 3, 4, 5, 6, 7]);

/**
 * Pulls every non-blank "Product" cell out of the shared
 * Product Register's rows, de-duplicated -- used to populate
 * the Product Development System's product picker (item 7).
 * Rows are matched by their Product name text rather than a
 * synthetic row id, the same way `resolveDynamicOptions`
 * below matches Sections/Cards by title text.
 */
function extractProductNames(rows: unknown): string[] {

    if (!Array.isArray(rows)) {
        return [];
    }

    const names = rows
        .map(row => {
            if (!row || typeof row !== "object") {
                return "";
            }
            const value = (row as Record<string, unknown>)["product"];
            return typeof value === "string" ? value.trim() : "";
        })
        .filter(name => name.length > 0);

    return Array.from(new Set(names));

}

/**
 * Validates a Product Development System Interview Session scoped
 * to a single, currently-selected Product -- rather than
 * `reviewManager.validate` (InterviewValidator), which checks the
 * shared Product Register (Section 1) as a WHOLE Table (every row,
 * every column, of every Product) and Sections 2-7 via whatever the
 * Session's own `responses` happen to hold (only reliable for
 * whichever Product was selected the last time each Section was
 * visited -- see the loading effect above).
 *
 * Section 1 only requires THIS Product's own row to be complete
 * (every visible column filled) -- some OTHER Product's row being
 * unfinished shouldn't block finishing THIS Product's interview.
 * Sections 2-7 are read straight from OrganizationService's
 * per-Product storage (the authoritative source, regardless of
 * which Sections the Session happens to have visited for this
 * Product) rather than from `session.getResponse`.
 */
function validateProductDevelopmentForProduct(
    session: InterviewSession,
    organizationId: string,
    productName: string
): ValidationResult {

    const framework = session.getFramework();
    const issues: ValidationIssue[] = [];

    for (const section of framework.sections) {

        if (section.number === 1) {

            const rows = Array.isArray(session.getResponse(1))
                ? session.getResponse(1) as TableAnswerRow[]
                : [];

            const row = rows.find(candidate => {
                const name = candidate["product"];
                return typeof name === "string" && name.trim() === productName;
            });

            const columns = visibleTableColumns(section.answer.table?.columns ?? []);
            const complete = !!row && isTableRowComplete(columns, row);

            if (!complete) {
                issues.push({ sectionNumber: section.number, sectionTitle: section.title });
            }

            continue;

        }

        if (PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS.has(section.number)) {

            const value = OrganizationService.getProductSectionResponse(
                organizationId,
                productName,
                section.number
            );

            if (isAnswerEmpty(section.answer, value)) {
                issues.push({ sectionNumber: section.number, sectionTitle: section.title });
            }

            continue;

        }

        // Fallback for any Section that is neither the shared
        // Product Register nor one of the per-Product Sections --
        // shouldn't normally occur for this System, but checked the
        // same way `reviewManager.validate` would as a safety net.
        if (isAnswerEmpty(section.answer, session.getResponse(section.number))) {
            issues.push({ sectionNumber: section.number, sectionTitle: section.title });
        }

    }

    return { valid: issues.length === 0, issues };

}

/**
 * Splits a block of introduction text into one
 * sentence per entry, so the introduction can be
 * rendered as one short paragraph per sentence
 * instead of one large block of text.
 */
function splitIntoSentences(text: string): string[] {

    const collapsed = text.replace(/\s+/g, " ").trim();

    if (collapsed.length === 0) {
        return [];
    }

    const matches = collapsed.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g);

    if (!matches) {
        return [collapsed];
    }

    return matches
        .map(sentence => sentence.trim())
        .filter(sentence => sentence.length > 0);

}

export default function Conversation() {

    const location = useLocation();
    const navigate = useNavigate();

    const system = location.state?.system;

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
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    const [capabilityChoice, setCapabilityChoice] = useState<CapabilityChoice>("original");
    const [otherCapabilityName, setOtherCapabilityName] = useState("");
    const [includeMd, setIncludeMd] = useState(true);
    const [includePdf, setIncludePdf] = useState(false);

    // Defaults to "system" (the whole file, every Product) so
    // behavior is unchanged for anyone who doesn't touch this new
    // choice -- that was the ONLY export shape the Product
    // Development System produced before this option existed.
    const [exportScope, setExportScope] = useState<ExportScope>("system");

    useEffect(() => {

        if (!organizationId) {
            setLoadingError("No Organization selected.");
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

            setSession(loadedSession);
        } catch (error) {
            setLoadingError(
                error instanceof Error
                    ? error.message
                    : "Failed to load Framework."
            );
        }

        // Every answer edit debounces its actual localStorage write
        // (see OrganizationService's DebouncedLocalStorage) so typing
        // doesn't pay a full-document read-parse-write on every
        // keystroke -- flushing here on cleanup (leaving this System,
        // switching Organizations, or unmounting entirely) guarantees
        // the last edit is on disk before we navigate away, on top of
        // the page unload/hide safety net OrganizationService already
        // registers for closing the app outright.
        return () => {
            OrganizationService.flushPendingWrites();
        };

    }, [system, organizationId]);

    // The Business System's Product Register (Section 5) and the
    // Product Development System's Product Register (Section 1)
    // share one row list per Organization (see
    // SHARED_PRODUCT_REGISTER_BINDINGS above). Landing on either
    // one pulls in the latest shared rows -- in case the OTHER
    // System changed them since this Session was last saved --
    // before anything renders, rather than showing a possibly
    // stale copy from this Session's own last save.
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

        if (isSharedProductRegisterSection(system.id, sectionNumber)) {

            const sharedProducts = OrganizationService.getProducts(organizationId);

            session.saveResponse(sectionNumber, sharedProducts);
            StorageService.saveInterview(organizationId, session);
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

    function startInterview() {

        if (!session) {
            return;
        }

        session.startInterview();
        persistAndRedraw(session);
        scrollToTop();

    }

    function nextSection() {

        if (!session) {
            return;
        }

        if (session.isLastSection()) {

            if (organizationId) {
                StorageService.saveInterview(organizationId, session);
            }

            // The Product Development System's Sections are
            // completed once PER PRODUCT (see
            // PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS) -- "Finish"
            // should only require the currently selected Product's
            // own Sections (and its own row in the shared Product
            // Register) to be complete, not every OTHER Product's
            // too. See validateProductDevelopmentForProduct's own
            // comment for why this can't just reuse
            // `reviewManager.validate` as-is.
            const selectedProductForValidation =
                system?.id === "product-development" && organizationId
                    ? OrganizationService.getSelectedProductId(organizationId)
                    : undefined;

            const validation =
                selectedProductForValidation && organizationId
                    ? validateProductDevelopmentForProduct(session, organizationId, selectedProductForValidation)
                    : reviewManager.validate(session);

            if (!validation.valid) {
                setValidationIssues(validation.issues);
                setExportStep("warning");
            } else {
                setExportStep("options");
            }

            return;

        }

        session.nextSection();
        persistAndRedraw(session);
        scrollToTop();

    }

    function previousSection() {

        if (!session) {
            return;
        }

        if (session.previousSection()) {
            persistAndRedraw(session);
            scrollToTop();
        }

    }

    function goToIntroduction() {

        if (!session) {
            return;
        }

        session.viewIntroduction();
        persistAndRedraw(session);
        scrollToTop();

    }

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

        session.saveCurrentResponse(value);

        if (organizationId && system) {

            const sectionNumber = session.getCurrentSectionNumber();

            if (isSharedProductRegisterSection(system.id, sectionNumber)) {

                OrganizationService.saveProducts(organizationId, Array.isArray(value) ? value : []);

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

    }, [session, organizationId, system]);

    // Resolves a Table column's live dropdown options from another
    // Section's Card List response (see TableColumnDefinition.
    // dynamicSource) -- e.g. a "Revenue Stream" column whose choices
    // should always match whatever the user has entered under the
    // Revenue Model Section's "Revenue Stream" card. Matched by
    // normalized title text, the same way Questions/Answers Sections
    // are matched to each other.
    //
    // Declared here (alongside handleAnswerChange, BEFORE the
    // loadingError/!session early returns below) rather than closer
    // to where `framework`/`currentSection` already exist post-guard,
    // specifically so this can be a real `useCallback` -- React
    // requires every hook to run in the same order on every render,
    // and a hook placed after an early `return` would only run on
    // SOME renders. Guards on `session` itself instead, mirroring
    // handleAnswerChange's own internal check just above. Stabilized
    // on `session` alone (a session's Framework, and therefore its
    // Sections, are the same object reference for the session's whole
    // lifetime) so this is <AnswerRenderer>'s `resolveDynamicOptions`
    // prop stays a stable reference across a keystroke-driven
    // re-render too -- both for the `tableColumns` memo inside
    // AnswerRenderer.tsx and, through it, <DynamicTable>'s own
    // `React.memo`.
    const resolveDynamicOptions = useCallback((sectionTitle: string, cardTitle: string): string[] => {

        if (!session) {
            return [];
        }

        const framework = session.getFramework();

        const normalize = (text: string) => text.trim().toLowerCase();

        const sourceSection = framework.sections.find(
            candidate => normalize(candidate.title) === normalize(sectionTitle)
        );

        if (!sourceSection || sourceSection.answer.type !== AnswerType.CardList) {
            return [];
        }

        const card = sourceSection.answer.cards?.find(
            candidate => normalize(candidate.title) === normalize(cardTitle)
        );

        if (!card) {
            return [];
        }

        const response = session.getResponse(sourceSection.number);

        if (!response || typeof response !== "object" || Array.isArray(response)) {
            return [];
        }

        const items = (response as CardListAnswerValue)[card.id] ?? [];

        return items
            .map(item => item.text.trim())
            .filter(text => text.length > 0);

    }, [session]);

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

    function handleContinueToOptions() {

        setExportStep("options");

    }

    function handleFinalExport() {

        if (!session) {
            return;
        }

        const framework = session.getFramework();

        const capabilityLabel =
            capabilityChoice === "original"
                ? framework.metadata.capability
                : otherCapabilityName;

        const exportContent =
            system?.id === "product-development" && organizationId
                ? (() => {

                      // One document load for the whole export, rather than
                      // one per (Product, Section) pair -- OrganizationService.
                      // getProductSectionResponse alone would re-parse the
                      // entire Organization document from localStorage once
                      // per lookup here.
                      const allProductAnswers =
                          OrganizationService.getAllProductSectionResponses(organizationId);

                      const getProductSectionResponse = (productName: string, sectionNumber: number) =>
                          allProductAnswers[productName]?.[String(sectionNumber)] ?? null;

                      // "This Product only" (exportScope === "product"): the
                      // shared Product Register (Section 1) narrowed down to
                      // just the selected Product's own row, followed by that
                      // Product's own Sections 2-7 -- everything flattened
                      // into one document, no Product-heading grouping, since
                      // there's only one Product's worth of content here.
                      const selectedProductId =
                          exportScope === "product"
                              ? OrganizationService.getSelectedProductId(organizationId)
                              : undefined;

                      if (selectedProductId) {

                          return buildSingleProductExportContent(
                              session,
                              capabilityLabel,
                              selectedProductId,
                              PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS,
                              getProductSectionResponse,
                              (sectionNumber, response) => {

                                  if (sectionNumber !== 1 || !Array.isArray(response)) {
                                      return response;
                                  }

                                  return (response as TableAnswerRow[]).filter(row => {
                                      const name = row["product"];
                                      return typeof name === "string" && name.trim() === selectedProductId;
                                  });

                              }
                          );

                      }

                      // "Whole System" (exportScope === "system", or no
                      // Product selected): the Product Register in full,
                      // followed by EVERY Product's own Sections 2-7,
                      // grouped one Product at a time (see
                      // buildMultiProductExportContent) -- unchanged from
                      // before this option existed.
                      return buildMultiProductExportContent(
                          session,
                          capabilityLabel,
                          extractProductNames(session.getResponse(1)),
                          PRODUCT_DEVELOPMENT_PER_PRODUCT_SECTIONS,
                          getProductSectionResponse
                      );

                  })()
                : undefined;

        if (includeMd) {
            reviewManager.exportMarkdown(session, capabilityLabel, exportContent);
        }

        if (includePdf) {
            reviewManager.exportPdf(session, capabilityLabel, exportContent);
        }

        setExportStep("none");

    }

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

    const canConfirmCapability =
        capabilityChoice === "original" || otherCapabilityName.trim().length > 0;
    const canExport = includeMd || includePdf;

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

    // Lets the Product Register table (Section 1) double as the
    // Product picker: clicking a row, or its selection bullet under
    // the "#" column, selects that row's Product -- replacing the
    // separate ProductSelector list that used to sit below the table.
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

    return (
        <div className="conversation-page">
            <AppHeader organizationName={organizationName} />

            <main className="conversation-content">
                <div className="conversation-card">
                    <InterviewHeader
                        systemNumber={String(framework.metadata.systemNumber)}
                        systemName={framework.metadata.systemName}
                        capabilityId={system?.capability}
                    />

                    {showIntroduction ? (
                        <section className="interview-section">
                            <div className="interview-block-content">
                                {splitIntoSentences(introduction.introductionText).map((sentence, index) => (
                                    <p key={index} className="intro-sentence">
                                        {sentence}
                                    </p>
                                ))}
                            </div>

                            <div className="interview-nav">
                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={startInterview}
                                >
                                    Start Interview
                                </button>
                            </div>
                        </section>
                    ) : (
                        <>
                            {showProductSubtitle && (
                                <div className="product-name-banner">
                                    {selectedProductName}
                                </div>
                            )}

                            <InterviewSection section={currentSection} />

                            <InterviewProgress
                                current={session.getCurrentSectionIndex() + 1}
                                total={session.getTotalSections()}
                            />

                            <AnswerRenderer
                                key={currentSection.number}
                                definition={currentSection.answer}
                                value={session.getCurrentResponse()}
                                onChange={handleAnswerChange}
                                resolveDynamicOptions={resolveDynamicOptions}
                                rowSelection={productRegisterRowSelection}
                            />

                            <div className="interview-nav">
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={
                                        session.isFirstSection()
                                            ? goToIntroduction
                                            : previousSection
                                    }
                                >
                                    {session.isFirstSection() ? "Introduction" : "Previous"}
                                </button>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={nextSection}
                                    disabled={nextDisabled}
                                >
                                    {session.isLastSection() ? "Finish" : "Next"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </main>

            <AppFooter
                onBack={() => navigate("/assistant")}
            />

            {exportStep === "warning" && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog">
                        <h2 className="confirmation-title">
                            Sections Incomplete
                        </h2>

                        <ul className="confirmation-warning-list">
                            {validationIssues.map(issue => (
                                <li key={issue.sectionNumber}>
                                    {issue.sectionNumber}. {issue.sectionTitle}
                                </li>
                            ))}
                        </ul>

                        <div className="confirmation-actions">
                            <button
                                className="confirmation-button secondary"
                                onClick={() => setExportStep("none")}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirmation-button primary"
                                onClick={handleContinueToOptions}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {exportStep === "options" && (
                <div className="confirmation-overlay">
                    <div className="confirmation-dialog export-options-dialog">
                        <h2 className="confirmation-title">
                            Export Options
                        </h2>

                        {isProductDevelopmentSystem && (
                            <div className="export-options-group">
                                <div className="export-options-label">Include</div>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="export-scope"
                                        checked={exportScope === "product"}
                                        onChange={() => setExportScope("product")}
                                    />
                                    This Product only
                                    {selectedProductName ? ` (${selectedProductName})` : ""}
                                </label>

                                <label className="export-options-radio">
                                    <input
                                        type="radio"
                                        name="export-scope"
                                        checked={exportScope === "system"}
                                        onChange={() => setExportScope("system")}
                                    />
                                    Whole System (all Products)
                                </label>
                            </div>
                        )}

                        <div className="export-options-group">
                            <div className="export-options-label">Capability</div>

                            <label className="export-options-radio">
                                <input
                                    type="radio"
                                    name="capability-choice"
                                    checked={capabilityChoice === "original"}
                                    onChange={() => setCapabilityChoice("original")}
                                />
                                Original ({framework.metadata.capability})
                            </label>

                            <label className="export-options-radio">
                                <input
                                    type="radio"
                                    name="capability-choice"
                                    checked={capabilityChoice === "other"}
                                    onChange={() => setCapabilityChoice("other")}
                                />
                                Another Capability
                            </label>

                            {capabilityChoice === "other" && (
                                <input
                                    type="text"
                                    className="export-options-text-input"
                                    placeholder="Capability name"
                                    value={otherCapabilityName}
                                    onChange={(event) => setOtherCapabilityName(event.target.value)}
                                />
                            )}
                        </div>

                        <div className="export-options-group">
                            <div className="export-options-label">Format</div>

                            <label className="export-options-checkbox">
                                <input
                                    type="checkbox"
                                    checked={includeMd}
                                    onChange={(event) => setIncludeMd(event.target.checked)}
                                />
                                Markdown (.md)
                            </label>

                            <label className="export-options-checkbox">
                                <input
                                    type="checkbox"
                                    checked={includePdf}
                                    onChange={(event) => setIncludePdf(event.target.checked)}
                                />
                                PDF
                            </label>
                        </div>

                        <div className="confirmation-actions">
                            <button
                                className="confirmation-button secondary"
                                onClick={() => setExportStep("none")}
                            >
                                Cancel
                            </button>

                            <button
                                className="confirmation-button primary"
                                onClick={handleFinalExport}
                                disabled={!canExport || !canConfirmCapability}
                            >
                                Export
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
