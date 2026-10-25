import { CSSProperties, ReactNode } from "react";
import CardShell from "../cards/CardShell.tsx";
import { legalExpenseMissing, legalRequirementMissing } from "../../../framework/engine/SystemCardCompleteness.ts";
import type { FloorLink } from "../tiles/capabilityFloor.ts";
import SectionTiles, { DialogHeading, type SectionTile, type TileLink } from "../tiles/SectionTiles.tsx";
import CardBoxes, { type CardBox, type CardBoxAdd } from "../cards/CardBoxes.tsx";
import SubTiles from "../tiles/SubTiles.tsx";
import FoundersProfileEditor from "./FoundersProfileEditor.tsx";
import { workHue } from "../../../framework/engine/WorkColours.ts";
import { FOUNDERS_PROFILE_SECTIONS, LEGAL_ENTITY_SECTIONS, LegalEntityValue, asFoundersProfileValue, asLegalEntityValue, createLegalEntityExpense, createLegalEntityRequirement } from "../../../framework/engine/AnswerUtils.ts";
import { LEGAL_REQUIREMENT_TYPES } from "../../../framework/engine/LegalEntityJurisdictions.ts";
import { moneyText } from "../../../framework/engine/ExportRenderers.ts";
import { railId } from "../rails/railItems.ts";
import { InfoPoint } from "../fields/InfoNote.tsx";

import { INFO, LegalEntityEditorProps, shownDay } from "./legal/shared.tsx";
export { formationIssues } from "./legal/shared.tsx";
import { useLegalState } from "./legal/useLegalState.tsx";
import { useLegalFieldsAndSections } from "./legal/useLegalFieldsAndSections.tsx";
import { useLegalCardsAndSections } from "./legal/useLegalCardsAndSections.tsx";

/**
 * The Identity System's Legal Entity page (see
 * AnswerType.LegalEntity).
 *
 * Six subsections in one progressive form, running from the
 * organization itself to its founders, its registration, its tax
 * identity, whatever else the law asks of it, and what all of that
 * costs. Built for a founder rather than a lawyer: every field is
 * answerable without legal or accounting knowledge, and nothing
 * jurisdiction-specific is shown until the jurisdiction is known.
 *
 * The page narrows as it learns. Choosing a Country fixes what the
 * consumption tax is called and which legal forms are offered;
 * choosing a Legal Form sets whether capital is asked about. Both
 * are suggestions the user can override, and for a country this app
 * carries no profile for, the page says so and asks its questions
 * in wording that assumes no particular legal system (see
 * LegalEntityJurisdictions).
 *
 * Everything optional is behind an "+ Add" rather than sitting empty
 * on screen, which is what keeps a page this long readable for the
 * many organizations that need only the first half of it.
 */
export default function LegalEntityEditor(props: LegalEntityEditorProps) {

    const part1 = useLegalState(props);
    const part2 = { ...part1, ...useLegalFieldsAndSections({ ...part1 }) };
    const part3 = { ...part1, ...part2, ...useLegalCardsAndSections({ ...part1, ...part2 }) };
    const { amountLabel, soleFounderSettled, updateFounder, foundersProfile, onChangeFoundersProfile, organizationOnly, audienceOnly, audience, asTiles, cardsOnly, columnsDivider, currency, disabled, entity, expenseCard, frameTitle, latest, linkTargets, profile, requirementCard, section0, section1, section2, section3, section4, section5, showInstructions, update } = part3;

    /* THE PAGE AS TILES (the page's tile system), one for each of its six sections. A tile opens its section in its dialog: Organization and Founders & Ownership with no
       frame around them, Formation & Registration and Tax & Business Registration in theirs; Additional Legal Requirements and Legal Entity Expenses open a box for each card
       (as the Business System's cards do), and a box opens its card floating. */
    /* THE ORGANIZATION TILE OF PAGE 1 (Definition): only its dialog, as the tile opens it (design document 28, 8.5). */
    if (audienceOnly) {
        return (
            <div className="legal-entity legal-entity-unframed legal-entity-body legal-entity-org-body">
                {audience}
                {/* A divider line across, then the tile's own text under it. */}
                <div className="business-capability-card-rule legal-entity-org-rule" role="separator" />
            </div>
        );
    }
    if (organizationOnly) {
        return (
            <div className="column-tile-content legal-entity legal-entity-unframed" data-rail={railId(LEGAL_ENTITY_SECTIONS[0])}>
                <div className="business-engagement-section-head"><DialogHeading title="Organization" info={["What the organization is: its name, where it is, its legal form, what it does and where it stands."]} /></div>
                <div className="legal-entity-body">{section0}</div>
            </div>
        );
    }
    if (asTiles) {
        const lines = (list: readonly string[], count = 4) => list.map(text => text.trim()).filter(text => text.length > 0).slice(0, count);
        const rail = (section: number) => railId(LEGAL_ENTITY_SECTIONS[section]);
        // (Every dialog of the page opens with the one heading the Business System's do: the title, then its "i".)
        const SECTION_INFO: Record<number, InfoPoint[]> = {
            0: ["What the organization is in law: its name, what it does, its legal form and where it is."],
            1: ["Who owns the organization, and how much of it each founder owns."]
        };
        const plain = (section: number, body: ReactNode) => (
            <div className="column-tile-content legal-entity legal-entity-unframed" data-rail={rail(section)}>
                <div className="business-engagement-section-head"><DialogHeading title={LEGAL_ENTITY_SECTIONS[section]} info={SECTION_INFO[section]} /></div>
                <div className="legal-entity-body">{body}</div>
            </div>
        );
        /** A card floating over its tile keeps the page's Legal Entity scope. */
        const floating = (card: ReactNode) => <div className="column-tile-content legal-entity"><div className="legal-entity-body">{card}</div></div>;
        const dialogOf = (section: number, info: InfoPoint[], boxes: ReactNode) => (
            <div className="column-tile-content legal-entity" data-rail={rail(section)}>
                <div className="business-engagement-section-head"><DialogHeading title={section === 5 ? "Expenses" : LEGAL_ENTITY_SECTIONS[section]} info={info} /></div>
                {boxes}
            </div>
        );
        const typeLabel = (requirement: LegalEntityValue["requirements"][number]) => LEGAL_REQUIREMENT_TYPES.find(type => type.id === requirement.type)?.label ?? "";
        /** The circles of a tile: one for each expense linked to any of these registrations. */
        const expenseCircles = (targets: readonly string[]): FloorLink[] => entity.expenses
            .filter(expense => targets.some(target => target !== "" && expense.links.includes(target)))
            .map(expense => ({ id: expense.id, name: expense.name.trim() || "Unnamed expense", type: "expense" as const }));
        /** The circles of an expense: one for each registration (a number, a requirement) it is for. */
        const registrationCircles = (expense: LegalEntityValue["expenses"][number]): FloorLink[] => linkTargets
            .filter(target => expense.links.includes(target.id))
            .map(target => ({ id: target.id, name: target.label, type: "registration" as const }));
        // WHAT A CARD STILL LACKS (SystemCardCompleteness.ts): a card with something written but not what it needs lights its tile, flashing red.
        const missingById = new Map<string, readonly string[]>();
        entity.requirements.forEach(requirement => { const lacks = legalRequirementMissing(requirement); if (lacks.length > 0) { missingById.set(requirement.id, lacks); } });
        entity.expenses.forEach(expense => { const lacks = legalExpenseMissing(expense); if (lacks.length > 0) { missingById.set(expense.id, lacks); } });
        const requirementBoxes: CardBox[] = entity.requirements.map((requirement, index) => ({
            id: requirement.id,
            missing: missingById.get(requirement.id),
            number: index + 1,
            name: requirement.name,
            unnamed: "Unnamed requirement",
            centred: true,
            // The Type and the Reference or Number (and, where an expense is linked to it, that it has expenses).
            lines: [typeLabel(requirement), requirement.reference.trim(), entity.expenses.some(expense => expense.links.includes(requirement.id)) ? "**Has expenses**" : ""].filter(line => line.length > 0),
            own: true,
            links: expenseCircles([requirement.id]),
            content: () => null
        }));
        /** "Companies House: 16234587" as its name and, under it, the number; a requirement or a name alone is said as it is. */
        const shortRegistration = (label: string): string[] => label.includes(": ") ? [label.slice(0, label.lastIndexOf(": ")), label.slice(label.lastIndexOf(": ") + 2)] : [label];
        const linkedLabel = (expense: LegalEntityValue["expenses"][number]) => linkTargets.find(target => expense.links.includes(target.id))?.label ?? "";
        const expenseBoxes: CardBox[] = entity.expenses.map((expense, index) => ({
            id: expense.id,
            missing: missingById.get(expense.id),
            number: index + 1,
            name: expense.name,
            unnamed: "Unnamed expense",
            plain: true,
            // The start date, the registration number it belongs to (RN: ...), and its cost.
            lines: [shownDay(expense.date), ...shortRegistration(linkedLabel(expense)), [expense.cost ? "**" + moneyText(expense.cost, currency) + "**" : "", expense.frequency].filter(Boolean).join(" ")].filter(line => line.length > 0),
            own: true,
            links: registrationCircles(expense),
            content: () => null
        }));
        const addOf = (kind: "requirement" | "expense"): CardBoxAdd => ({
            label: kind === "requirement" ? "legal requirement" : "expense",
            disabled,
            onAdd: () => {
                const made = kind === "requirement" ? createLegalEntityRequirement() : createLegalEntityExpense();
                update(kind === "requirement"
                    ? { requirements: [...asLegalEntityValue(latest.current.value).requirements, made as ReturnType<typeof createLegalEntityRequirement>] }
                    : { expenses: [...asLegalEntityValue(latest.current.value).expenses, made as ReturnType<typeof createLegalEntityExpense>] });
                return made.id;
            },
            isBlank: (id: string) => {
                const card = kind === "requirement"
                    ? asLegalEntityValue(latest.current.value).requirements.find(candidate => candidate.id === id)
                    : asLegalEntityValue(latest.current.value).expenses.find(candidate => candidate.id === id);
                return !card || JSON.stringify({ ...card, id: "" }) === JSON.stringify({ ...(kind === "requirement" ? createLegalEntityRequirement() : createLegalEntityExpense()), id: "" });
            },
            onRemove: (ids: string[]) => update(kind === "requirement"
                ? { requirements: asLegalEntityValue(latest.current.value).requirements.filter(candidate => !ids.includes(candidate.id)) }
                : { expenses: asLegalEntityValue(latest.current.value).expenses.filter(candidate => !ids.includes(candidate.id)) })
        });
        /** A requirement and the expense it made are drawn together, the requirement above. */
        const pairOf = (id: string) => {
            const made = entity.expenses.find(expense => expense.fromRequirement !== "" && (expense.id === id || expense.fromRequirement === id));
            return made && entity.requirements.some(requirement => requirement.id === made.fromRequirement)
                ? { parent: { id: made.fromRequirement, caption: "Additional legal requirement" }, child: { id: made.id, caption: "Expense" } }
                : null;
        };
        const cardOf = (id: string): ReactNode => {
            const requirement = entity.requirements.findIndex(candidate => candidate.id === id);
            if (requirement >= 0) {
                return floating(requirementCard(entity.requirements[requirement], requirement, true));
            }
            const expense = entity.expenses.findIndex(candidate => candidate.id === id);
            return expense >= 0 ? floating(expenseCard(entity.expenses[expense], expense, true)) : null;
        };
        const named = entity.founders.filter(founder => founder.name.trim());
        /** The page holds the founders' tiles and the Capability tile (a page of the Identity System that is given the Founders Profile's saver). */
        const holdsFounders = onChangeFoundersProfile !== undefined;
        const capability = asFoundersProfileValue(foundersProfile);
        const foundersListed = named.length === 1
            ? { items: [named[0].name.trim()], marks: [{ centre: true }] }
            : {
                // (A name, then its share after a dash: two columns, the dashes in one.)
                items: lines(named.map(founder => founder.name.trim() + "\u0001" + (founder.ownership.trim() ? "\u2014 " + founder.ownership.trim() + "%" : "")), 8),
                marks: named.map(() => undefined)
            };
        const expenseEntries = entity.expenses.filter(expense => expense.name.trim().length > 0).slice(0, 8);
        /** The link of a line that names a registration: the first expense linked to it (a press opens that expense's card). */
        const expenseLink = (targetId: string): TileLink | undefined => {
            const expense = entity.expenses.find(candidate => candidate.links.includes(targetId));
            return expense ? { card: expense.id } : undefined;
        };
        // The lines of the Formation's and the Tax's tiles, each with the registration it names (the expense linked to it gives the line its link).
        const formationEntries = [
            { text: entity.formation.status === "planned" ? "Planned" : "Registered", target: "formation-registration-number" },
            { text: entity.formation.authority, target: "" },
            ...entity.formation.additionalNumbers.map(number => ({ text: number.label, target: number.id }))
        ].filter(entry => entry.text.trim().length > 0).slice(0, 6);
        const taxEntries = [
            { text: entity.tax.identificationNumber.trim() ? (profile.taxIdName || "Tax ID") + ": " + entity.tax.identificationNumber.trim() : "", target: "" },
            { text: entity.tax.consumptionTaxStatus === "yes" ? "VAT " + entity.tax.consumptionTaxNumber : "", target: "tax-consumption-number" },
            ...entity.tax.additionalRegistrations.map(registration => ({ text: registration.label, target: registration.id }))
        ].filter(entry => entry.text.trim().length > 0).slice(0, 6);
        const tiles: SectionTile[] = [
            {
                id: "legal-entity-founders", title: "Founders & Ownership", large: true, rail: rail(1),
                // (The dialog holds the Ownership, with the founders' profile tiles under it.)
// (The founders' profiles: each name a link that opens that founder's card in the dialog. Without the Founders Profile saver, as before: the owners with their shares.)
                items: holdsFounders ? lines(named.map(founder => founder.name.trim()), 8) : foundersListed.items,
                itemMarks: holdsFounders ? lines(named.map(founder => founder.name.trim()), 8).map(() => ({ bullet: true })) : foundersListed.marks,
                links: holdsFounders && !soleFounderSettled ? named.slice(0, 8).map(founder => ({ box: "founder-profile-" + founder.id })) : undefined,
                content: () => holdsFounders && onChangeFoundersProfile
                    ? (
                        <div className="column-tile-content legal-entity legal-entity-unframed" data-rail={rail(1)}>
                            <div className="business-engagement-section-head"><DialogHeading title="Founders & Ownership" info={SECTION_INFO[1]} /></div>
                            <FoundersProfileEditor
                                value={foundersProfile}
                                onChange={onChangeFoundersProfile}
                                legalEntityFounders={entity.founders}
                                disabled={disabled}
                                // (A one-owner form has no ownership to ask: the founder's card, its name a cell and the capital optional beside it.)
                                soleFounder={soleFounderSettled ? {
                                    onName: (next) => updateFounder(0, { name: next }),
                                    capital: entity.founders[0]?.capital ?? "",
                                    onCapital: (next) => {
                                        // (A keystroke the cell refused hands back what it had: nothing is saved, so nothing is redrawn under the typing.)
                                        if (next === (entity.founders[0]?.capital ?? "")) {
                                            return;
                                        }
                                        const founders = entity.founders.map((founder, at) => at === 0 ? { ...founder, capital: next } : founder);
                                        update({ founders, capitalApplies: next.trim().length > 0 });
                                    },
                                    label: amountLabel("Capital"),
                                    placeholder: currency || "Amount"
                                } : undefined}
                                subTilesWith={<div className="legal-entity-body legal-entity-subview">{section1}</div>}
                            />
                        </div>
                    )
                    : plain(1, section1)
            },
            ...(holdsFounders && onChangeFoundersProfile ? [{
                id: "founders-gaps", title: "Capability", large: true, rail: railId(FOUNDERS_PROFILE_SECTIONS[1]),
                items: lines([...capability.teamGaps.split("\n"), ...capability.teamCover.split("\n")], 8),
                content: () => (
                    <FoundersProfileEditor
                        value={foundersProfile}
                        onChange={onChangeFoundersProfile}
                        legalEntityFounders={entity.founders}
                        disabled={disabled}
                        capabilityOnly
                    />
                )
            } as SectionTile] : []),
            {
                id: "legal-entity-registrations", title: "Registrations", large: true, rail: rail(2), view: true,
                // The state, then the names of the registration numbers (the formation's, the tax's) and the requirements.
                items: ["Registration numbers", "Additional legal requirements"],
                // (A second bullet, in the link's colour, where a registration of that section is linked to an expense.)
                itemMarks: [{ bullet: true }, { bullet: true }],
                links: [{ box: "registration-numbers" }, { box: "requirements" }],
                holds: entity.requirements.map(requirement => requirement.id),
                boxHolds: { requirements: entity.requirements.map(requirement => requirement.id) },
                cardFor: cardOf,
                pairOf,
                content: () => (
                    <div className="column-tile-content legal-entity legal-entity-unframed" data-rail={rail(2)}>
                        <div className="business-engagement-section-head"><DialogHeading title="Registrations" /></div>
                        <SubTiles
                            label="Registrations"
                            tiles={[
                                {
                                    // THE REGISTRATION NUMBERS, ONE TILE (owner, 2026-10-24): the numbers of the registry (formation) and of the tax, under one heading; the Registration Date is on the Organization tile.
                                    id: "registration-numbers",
                                    title: "Registration Numbers",
                                    items: [...formationEntries, ...taxEntries].slice(0, 8).map(entry => entry.text),
                                    itemMarks: [...formationEntries, ...taxEntries].slice(0, 8).map((_entry, at) => at === 0 ? { plain: true } : { bullet: true }),
                                    links: [...formationEntries, ...taxEntries].slice(0, 8).map(entry => expenseLink(entry.target)),
                                    circles: expenseCircles(["formation-registration-number", ...entity.formation.additionalNumbers.map(number => number.id), "tax-consumption-number", ...entity.tax.additionalRegistrations.map(registration => registration.id)]),
                                    content: () => (
                                        <div className="legal-entity-body legal-entity-subview">
                                            {section2}
                                            <div className="business-capability-card-rule legal-entity-org-rule" role="separator" />
                                            {section3}
                                        </div>
                                    )
                                },
                                {
                                    id: "requirements",
                                    title: "Additional legal requirements",
                                    items: entity.requirements.filter(requirement => requirement.name.trim()).slice(0, 6).map(requirement => requirement.name.trim()),
                                    itemMarks: entity.requirements.filter(requirement => requirement.name.trim()).slice(0, 6).map(() => ({ bullet: true })),
                                    links: entity.requirements.filter(requirement => requirement.name.trim()).slice(0, 6).map(requirement => ({ card: requirement.id })),
                                    circles: expenseCircles(entity.requirements.map(requirement => requirement.id)),
                                    add: addOf("requirement"),
                                    content: () => <CardBoxes items={requirementBoxes} label="Legal requirements" what="Requirement" add={addOf("requirement")} autoStart={false} />
                                }
                            ]}
                        />
                    </div>
                )
            },
            {
                id: "legal-entity-expenses", title: "Expenses", large: true, rail: rail(5), view: true, note: INFO.expenses,
                items: expenseEntries.map(expense => expense.name.trim()),
                itemMarks: expenseEntries.map(() => ({ bullet: true })),
                links: expenseEntries.map(expense => ({ card: expense.id })),
                holds: entity.expenses.map(expense => expense.id),
                cardFor: cardOf,
                pairOf,
                add: addOf("expense"),
                content: () => dialogOf(5, INFO.expenses, <CardBoxes items={expenseBoxes} label="Expenses" what="Expense" add={addOf("expense")} />)
            }
        ];
        if (cardsOnly) {
            return <SectionTiles label={LEGAL_ENTITY_SECTIONS.join(", ")} hue={workHue("define")} tiles={tiles} incomplete={missingById} cardsOnly />;
        }
        return (
            <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <CardShell
                    
                    data-anchor="column-tiles"
                    style={{ "--strategy-theme-hue": workHue("define") } as CSSProperties}
                >
                    <div className="card-scroll">
                        <div className="business-capability-section business-capability-tiles-section">
                            {frameTitle ? <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">{frameTitle}</span></div> : <div className="business-capability-heading-spacer" aria-hidden="true" />}
                            <SectionTiles label={LEGAL_ENTITY_SECTIONS.join(", ")} hue={workHue("define")} tiles={tiles} incomplete={missingById} />
                        </div>
                    </div>
                </CardShell>
            </div>
        );
    }
    return (

        <div
            className="brand-style legal-entity"
            style={{ "--answer-column-count": 1 } as CSSProperties}
        >

            <div className="brand-style-head">

                {showInstructions && (
                    <div className="answer-column-questions">
                        <span className="answer-question-line answer-question-line-bullet">
                            • Record what your organization is legally, who owns it, how it
                            was registered, and how it is identified for tax.
                        </span>
                        <span className="answer-question-line answer-question-line-bullet">
                            • Start with the Country and the Legal Form. The rest of the page
                            adjusts to them.
                        </span>
                        <span className="answer-question-line answer-question-line-bullet">
                            • Leave out anything your organization does not have. Use the Add
                            buttons only for what applies to you.
                        </span>
                    </div>
                )}

            </div>

            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            <div className="legal-entity-body">

                {/*
                    Subsections 1 and 2 side by side, each half the page
                    as every subsection here: what the organization is
                    and where, beside who owns it. Each as tall as its
                    own content.
                */}
                <div className="legal-entity-row">

                {/* ---------- 1. Organisation ---------- */}

                {section0}

                {/* ---------- 2. Founders & Ownership ---------- */}

                {section1}

                </div>

                {/*
                    Subsections 3 and 4 side by side: how the organisation is
                    registered, and how it is identified for tax, are
                    the two halves of the same page of paperwork. In
                    the nine countries where one number does both
                    jobs, they are literally the same answer, and
                    seeing them together is what makes that obvious.
                */}
                <div className="legal-entity-row">

                {/* ---------- 3. Formation & Registration ---------- */}

                {section2}

                {/* ---------- 4. Tax & Business Registration ---------- */}

                {/* ONE LIST on the Name | Number columns of 3.: the tax
                    number first (its local name, "UTR", "EIN") beside its
                    box, then the consumption tax as a tick (ticked, its
                    number beside it; unticked, not registered -- which is
                    also the answer where it does not apply), then, under
                    "Tax / Registration" and "Number", any others added,
                    each with its ×. The ×
                    column is kept on every row, so the Number column stands
                    at the same x as 3.'s. */}
                {section3}

                </div>

                {/*
                    The other pair. What else the law asks of this
                    organisation, beside what all of it costs -- a
                    requirement and its expense are usually the same
                    fact counted twice, and an expense here can link
                    straight to a requirement there. Side by side is
                    what makes that reachable without scrolling
                    between them.
                */}
                <div className="legal-entity-row">

                {/* ---------- 5. Additional Legal Requirements ---------- */}

                {section4}

                {/* ---------- 6. Legal Entity Expenses ---------- */}

                {section5}

                </div>

            </div>

        </div>

    );

}
