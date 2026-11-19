import { NO_REGISTRY_FORM, formationStatusOf, type LegalEntityValue } from "./AnswerLegal.ts";
import { asBusinessCapabilityValue, isCostingStatus } from "./AnswerBusinessCapability.ts";
import { parseAmount } from "./Amounts.ts";
import { founderMonthlySalary } from "./DemandCapacity.ts";

/*
    THE LEGAL STARTS, STAGE 1 (doc 53, section 6, decisions 1 (a), 5 and 8; the owner's delegation of 2026-11-19 19:48 UTC+2): what a fact the app holds makes
    mandatory, with no exemption, the Legal Entity makes on its own -- the legal form's filings and their official fees, and the United Kingdom's PAYE employer
    registration once anyone on the payroll is paid. Each item carries its rule's id: an item the founder removes is remembered (`dismissedStarts`) and never made
    again unseen; an item already there, by its rule or by its name, is not made twice. A fee is the official one, checked on the date given, with its source;
    what is not an official fixed fee (a premium, a quote) is left empty (doc 28, rule 6). Ireland's figures wait for their official pages (doc 53, section 5).
*/

/** The date the official fees below were checked (doc 53, section 2). */
export const LEGAL_FEES_CHECKED = "2026-11-19";

/** What a rule makes: a requirement card (with an expense paying for it, where there is a fixed fee), an expense on the registration number, or a tax registration row. */
export interface LegalStart {
    /** The rule's id (doc 53: GB2, US3, ...): the item made carries it. */
    rule: string;
    kind: "requirement" | "expense" | "tax-row";
    name: string;
    /** A requirement's type (LEGAL_REQUIREMENT_TYPES). */
    type?: string;
    /** What it asks, in a line, for the requirement's notes. */
    says?: string;
    /** The official fee, and how often (LEGAL_ENTITY_EXPENSE_FREQUENCIES); none where there is no fixed fee. */
    fee?: { amount: string; frequency: "One time" | "Annually" | "Every two years"; expenseName: string };
    /** The official page behind it. */
    source: string;
}

/** The facts the rules read: the Legal Entity, and whether anyone on the payroll is paid (Infrastructure & Capability). */
export interface LegalFacts {
    entity: LegalEntityValue;
    /** A founder with a salary, or a member of staff. */
    paid: boolean;
}

const GOV_FEES = "https://www.gov.uk/government/publications/companies-house-fees/companies-house-fees";

/** The rules of level (a), by country, from the legal form (doc 53, section 2). */
export function legalStartsFor({ entity, paid }: LegalFacts): LegalStart[] {
    const { country, subdivision, legalForm } = entity.organisation;
    const form = legalForm.trim();
    // (Registered or not is worked out, never chosen: a registration number is the proof; formationStatusOf.)
    const planned = formationStatusOf(legalForm, entity.formation.registrationNumber, entity.formation.date) === "planned";
    if (!form || NO_REGISTRY_FORM.test(form)) {
        return [];
    }
    const starts: LegalStart[] = [];
    if (country === "GB") {
        const company = /Limited by Shares|Limited by Guarantee|Community Interest Company/.test(form);
        const llp = /\(LLP\)/.test(form);
        if (company || llp) {
            if (planned) {
                starts.push({ rule: "GB1", kind: "expense", name: "Company incorporation", fee: { amount: "100", frequency: "One time", expenseName: "Company incorporation" }, source: GOV_FEES });
            }
            starts.push({ rule: "GB2", kind: "requirement", type: "additional", name: "Confirmation statement", says: "Sent to Companies House at least once every 12 months, confirming the company's details.", fee: { amount: "50", frequency: "Annually", expenseName: "Confirmation statement fee" }, source: GOV_FEES });
            starts.push({ rule: "GB3", kind: "requirement", type: "additional", name: "Annual accounts to Companies House", says: "Sent every year; a small or micro-entity company may send simpler accounts.", source: "https://www.gov.uk/annual-accounts" });
            starts.push({ rule: "GB4", kind: "requirement", type: "beneficial-owner", name: "People with significant control (PSC) register", says: "Everyone holding more than 25% of the shares or votes, or able to appoint most directors; changes reported within 14 days.", source: "https://www.gov.uk/guidance/people-with-significant-control-pscs" });
        }
        if (company) {
            starts.push({ rule: "GB6", kind: "requirement", type: "additional", name: "Company Tax Return", says: "Filed within 12 months of the end of the accounting period; the Corporation Tax paid 9 months and 1 day after it.", source: "https://www.gov.uk/company-tax-returns" });
            starts.push({ rule: "GB7", kind: "requirement", type: "other", name: "Company details on the website, order forms and letters", says: "The registered number, the registered office, the place of registration and \"Limited\".", source: "https://www.gov.uk/running-a-limited-company/signs-stationery-and-promotional-material" });
        }
        // (PAYE: anyone on the payroll paid, a sole director of a limited company too: "You must register even if you're only employing yourself".)
        if (paid && (company || llp)) {
            starts.push({ rule: "GB10", kind: "tax-row", name: "PAYE Employer Reference", says: "Registered with HMRC before the first payday, at most 2 months before.", source: "https://www.gov.uk/register-employer" });
        }
    }
    if (country === "US") {
        const formed = /LLC|Corporation|\(LP\)/.test(form);
        if (formed || paid) {
            starts.push({ rule: "US1", kind: "requirement", type: "additional", name: "EIN from the IRS", says: "Applied for once the state has formed the business; there is no fee.", source: "https://www.irs.gov/businesses/small-businesses-self-employed/get-an-employer-identification-number" });
        }
        if (/\(LLC\)/.test(form) && /^(NY|New York)$/i.test(subdivision)) {
            if (planned) {
                starts.push({ rule: "US2", kind: "expense", name: "Articles of Organization", fee: { amount: "200", frequency: "One time", expenseName: "Articles of Organization" }, source: "https://dos.ny.gov/articles-organization-domestic-limited-liability-company-0" });
            }
            starts.push({ rule: "US3", kind: "requirement", type: "additional", name: "Publication of the LLC's formation", says: "Published in two newspapers chosen by the county clerk for six weeks in a row, within 120 days of formation, then the Certificate of Publication filed.", fee: { amount: "50", frequency: "One time", expenseName: "Certificate of Publication" }, source: "https://dos.ny.gov/certificate-publication-domestic-limited-liability-company-0" });
            // (The Biennial Statement's $9 every two years: the "Every two years" frequency, doc 53, decision 2, stage 3.)
            starts.push({ rule: "US4", kind: "requirement", type: "additional", name: "Biennial Statement", says: "Filed every two years, in the month the Articles were filed.", fee: { amount: "9", frequency: "Every two years", expenseName: "Biennial Statement" }, source: "https://dos.ny.gov/articles-organization-domestic-limited-liability-company-0" });
        }
    }
    if (country === "CA" && form === "Corporation (federal)") {
        const fees = "https://ised-isde.canada.ca/site/corporations-canada/en/services-fees-and-processing-times";
        if (planned) {
            starts.push({ rule: "CA1", kind: "expense", name: "Incorporation", fee: { amount: "200", frequency: "One time", expenseName: "Incorporation" }, source: fees });
        }
        starts.push({ rule: "CA2", kind: "requirement", type: "additional", name: "Annual return", says: "Filed with Corporations Canada every year.", fee: { amount: "12", frequency: "Annually", expenseName: "Annual return fee" }, source: fees });
    }
    if (country === "AU" && /Pty Ltd/.test(form)) {
        const fees = "https://business.gov.au/news/changes-for-businesses-from-1-july-2026";
        if (planned) {
            starts.push({ rule: "AU1", kind: "expense", name: "Company registration", fee: { amount: "636", frequency: "One time", expenseName: "Company registration" }, source: fees });
        }
        starts.push({ rule: "AU2", kind: "requirement", type: "additional", name: "Annual review", says: "ASIC's annual review of the company's details, with its fee.", fee: { amount: "342", frequency: "Annually", expenseName: "Annual review fee" }, source: fees });
    }
    if (country === "NZ" && /Limited Company|\(LTC\)/.test(form)) {
        const fees = "https://companies-register.companiesoffice.govt.nz/help-centre/managing-your-online-account/schedule-of-fees/";
        if (planned) {
            starts.push({ rule: "NZ1", kind: "expense", name: "Incorporation", fee: { amount: "136.55", frequency: "One time", expenseName: "Incorporation" }, source: fees });
        }
        starts.push({ rule: "NZ2", kind: "requirement", type: "additional", name: "Annual return", says: "Filed with the Companies Office every year from the calendar year after incorporation.", fee: { amount: "57.20", frequency: "Annually", expenseName: "Annual return fee" }, source: fees });
    }
    if (country === "IE" && /\((LTD|DAC|CLG)\)/.test(form)) {
        // (Ireland's fees wait for their official pages, which refused the fetch: doc 53, section 5.)
        starts.push({ rule: "IE2", kind: "requirement", type: "additional", name: "Annual return (Form B1)", says: "Filed with the Companies Registration Office every year.", source: "https://cro.ie/" });
        starts.push({ rule: "IE3", kind: "requirement", type: "beneficial-owner", name: "Register of Beneficial Ownership (RBO)", says: "Filed within 5 months of incorporation; changes within 14 days.", source: "https://rbo.gov.ie/" });
    }
    return starts;
}

/** Whether a rule's item is already there: by its rule, or by its name (an item the founder wrote before the rules). */
function present(entity: LegalEntityValue, start: LegalStart): boolean {
    const same = (name: string) => name.trim().toLowerCase() === start.name.toLowerCase();
    if (start.kind === "requirement") {
        // (A register of who controls the company is one, whatever the founder called it: "PSC register".)
        return entity.requirements.some(requirement => requirement.rule === start.rule || same(requirement.name) || (start.type === "beneficial-owner" && requirement.type === "beneficial-owner"));
    }
    if (start.kind === "tax-row") {
        return entity.tax.additionalRegistrations.some(row => row.rule === start.rule || same(row.label));
    }
    return entity.expenses.some(expense => expense.rule === start.rule || same(expense.name));
}

/** The rules whose items are still to make: not there yet, and not removed by the founder. */
export function pendingLegalStarts(facts: LegalFacts): LegalStart[] {
    const dismissed = new Set(facts.entity.dismissedStarts);
    return legalStartsFor(facts).filter(start => !dismissed.has(start.rule) && !present(facts.entity, start));
}

/** The Legal Entity with the pending items made: a requirement (its notes saying what it asks and its source; its fee an expense linked to it), an expense on the
    registration number, a tax row. `id` makes each new id; `date` is the expense's date (the registration's, else the Opening Date). */
export function withLegalStarts(entity: LegalEntityValue, starts: readonly LegalStart[], id: (prefix: string) => string, date: string): LegalEntityValue {
    let next = entity;
    const expense = (start: LegalStart, link: string) => ({
        id: id("expense"), name: start.fee!.expenseName, date, responsibility: "", cost: start.fee!.amount, frequency: start.fee!.frequency,
        links: link ? [link] : [], description: "", fromRequirement: start.kind === "requirement" ? link : "", rule: start.rule
    });
    for (const start of starts) {
        if (start.kind === "requirement") {
            const requirement = { id: id("requirement"), type: start.type ?? "additional", name: start.name, reference: "", notes: [start.says ?? "", "Official source: " + start.source].filter(Boolean).join("\n"), offerInExpenses: !!start.fee, rule: start.rule };
            next = { ...next, requirements: [...next.requirements, requirement], expenses: start.fee ? [...next.expenses, expense(start, requirement.id)] : next.expenses };
        } else if (start.kind === "tax-row") {
            next = { ...next, tax: { ...next.tax, additionalRegistrations: [...next.tax.additionalRegistrations, { id: id("number"), label: start.name, number: "", rule: start.rule }] } };
        } else if (start.fee) {
            next = { ...next, expenses: [...next.expenses, expense(start, "formation-registration-number")] };
        }
    }
    return next;
}

/** The rule behind an item, for its source line ("Official fee, checked 19 Nov 2026"). */
export function legalStartOf(entity: LegalEntityValue, rule: string): LegalStart | undefined {
    return legalStartsFor({ entity, paid: true }).find(start => start.rule === rule);
}

/** Whether anyone on the payroll is paid (doc 53, GB10): a founder with a salary, or a member of staff, on Infrastructure & Capability. */
export function paysAnyone(capabilityValue: unknown): boolean {
    if (capabilityValue === undefined || capabilityValue === null) {
        return false;
    }
    const capability = asBusinessCapabilityValue(capabilityValue);
    return capability.founders.some(founder => (founderMonthlySalary(founder) ?? 0) > 0) || paidStaffOf(capabilityValue).length > 0;
}

/**
 * THE PAID PEOPLE CARDS (doc 53, GB10 and GB11; owner, 2026-11-19): a Staff card (Human Resources, Infrastructure's or the Offering's) whose Status costs and whose
 * price is above 0 -- an employee. A Partner's or Supplier's card is never one: a contractor is not employed.
 */
export function paidStaffOf(capabilityValue: unknown): { id: string; name: string; family?: "" | "yes" | "no" }[] {
    if (capabilityValue === undefined || capabilityValue === null) {
        return [];
    }
    const capability = asBusinessCapabilityValue(capabilityValue);
    const paid = (slot: { status: string; cost: { price: string } }) => isCostingStatus(slot.status) && (parseAmount(slot.cost.price) ?? 0) > 0;
    return [...capability.offering.resources.filter(slot => slot.category === "hr"), ...(capability.resources["hr"] ?? []).flatMap(subsection => subsection.slots)]
        .filter(paid).map(slot => ({ id: slot.id, name: slot.name, family: slot.family }));
}
