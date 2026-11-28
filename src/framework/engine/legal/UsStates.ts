/**
 * US states and the District of Columbia: what a domestic for-profit LLC or corporation
 * files and pays to the state (formation, periodic report, publication, fixed annual tax),
 * and whether a statewide sales tax exists, with the registration's name and agency.
 *
 * Checked 2026-11-19 from official state sources only; a figure not confirmed on an
 * official page is left out. Amounts are plain dollars as digits ("200", "138.75").
 * A fee that scales with shares, capital, members or receipts and is stated only as a
 * range or a minimum is left out too.
 */

export const US_STATES_CHECKED = "2026-11-19";

type UsFrequency = "One time" | "Annually" | "Every two years";

export interface UsFee {
    name: string;
    /** Plain dollars as digits, e.g. "200" or "138.75". */
    amount: string;
    frequency: UsFrequency;
}

interface UsPublication {
    says: string;
    fee?: UsFee;
}

interface UsFormFilings {
    formation?: UsFee;
    report?: UsFee;
    publication?: UsPublication;
}

interface UsState {
    code: string;
    name: string;
    checked: string;
    llc?: UsFormFilings;
    corporation?: UsFormFilings;
    /** A fixed annual tax or fee owed whatever the profit (CA $800 franchise tax, DE LLC annual tax, ...), by form. */
    fixedTax?: { llc?: UsFee; corporation?: UsFee };
    /** A statewide sales tax exists. */
    salesTax: boolean;
    /** The registration's name and agency. */
    salesTaxRegistration?: string;
    /** The official URLs from the research row. */
    sources: string[];
}

const once = (name: string, amount: string): UsFee => ({ name, amount, frequency: "One time" });
const yearly = (name: string, amount: string): UsFee => ({ name, amount, frequency: "Annually" });
const biennial = (name: string, amount: string): UsFee => ({ name, amount, frequency: "Every two years" });

const C = US_STATES_CHECKED;

export const US_STATES: readonly UsState[] = [
    {
        code: "AL", name: "Alabama", checked: C,
        llc: { formation: once("Certificate of Formation", "200") },
        corporation: {
            formation: once("Certificate of Formation", "200"),
            report: yearly("SOS annual report fee, collected by ALDOR with the Business Privilege Tax return (Form CPT)", "10")
        },
        salesTax: true,
        salesTaxRegistration: "Sales Tax License, Alabama Department of Revenue",
        sources: [
            "https://www.sos.alabama.gov/sites/default/files/form-files/FeeSchedule.pdf",
            "https://www.revenue.alabama.gov/individual-corporate/alabama-business-privilege-tax-and-corporate-share-tax/",
            "https://www.revenue.alabama.gov/faqs/how-do-i-apply-or-register-for-a-sales-tax-number/",
            "https://workforce.alabama.gov/faqs/how-does-my-business-register-as-a-new-employer/"
        ]
    },
    {
        code: "AK", name: "Alaska", checked: C,
        llc: { formation: once("Articles of Organization", "250"), report: biennial("Biennial Report", "100") },
        corporation: { formation: once("Articles of Incorporation", "250"), report: biennial("Biennial Report", "100") },
        fixedTax: { llc: yearly("Business License", "50"), corporation: yearly("Business License", "50") },
        salesTax: false,
        sources: [
            "https://www.commerce.alaska.gov/web/cbpl/Corporations/BiennialReportsFAQs",
            "https://www.commerce.alaska.gov/web/cbpl/corporations/corpformsfees/formsbyevent.aspx",
            "https://www.commerce.alaska.gov/web/Portals/5/pub/BusinessLicenseStatutes.pdf",
            "https://labor.alaska.gov/unemployment/ui-general-info.htm"
        ]
    },
    {
        code: "AZ", name: "Arizona", checked: C,
        llc: {
            formation: once("Articles of Organization", "50"),
            publication: { says: "Publish a notice of the Articles once the Arizona Corporation Commission approves them; for a statutory agent in Maricopa or Pima county the Commission publishes it on its website." }
        },
        corporation: {
            formation: once("Articles of Incorporation", "60"),
            report: yearly("Annual Report", "45"),
            publication: { says: "Publish a notice of the Articles once the Arizona Corporation Commission approves them; for a statutory agent in Maricopa or Pima county the Commission publishes it on its website." }
        },
        salesTax: true,
        salesTaxRegistration: "Transaction Privilege Tax (TPT) License, Arizona Department of Revenue",
        sources: [
            "https://azcc.gov/docs/default-source/corps-files/fee-schedules/fee-schedule-llcs.pdf",
            "https://azcc.gov/docs/default-source/corps-files/fee-schedules/fee-schedule-corporations6def4cc74b1a47129d16c2b1c3851bda.pdf",
            "https://azcc.gov/docs/default-source/corps-files/instructions/l010i-instructions-articles-of-organization.pdf",
            "https://azdor.gov/transaction-privilege-tax/tpt-license/applying-tpt-license"
        ]
    },
    {
        code: "AR", name: "Arkansas", checked: C,
        llc: { formation: once("Certificate of Organization", "50"), report: yearly("Annual Franchise Tax Report", "150") },
        corporation: { formation: once("Articles of Incorporation", "45") },
        salesTax: true,
        salesTaxRegistration: "Sales Tax Permit, Arkansas Department of Finance and Administration",
        sources: [
            "https://www.sos.arkansas.gov/uploads/LLC_Fees1.pdf",
            "https://www.sos.arkansas.gov/uploads/bcs/Corp_Filing_Fees_2.pdf",
            "https://www.sos.arkansas.gov/business-commercial-services-bcs/forms-fees/corporations",
            "https://www.sos.arkansas.gov/uploads/bcs/LLC1_FT_2026.pdf",
            "https://www.sos.arkansas.gov/uploads/bcs/Corp1_FT_2026.pdf",
            "https://www.dfa.arkansas.gov/office/taxes/excise-tax-administration/sales-use-tax/register-for-a-tax-account/",
            "https://portal.arkansas.gov/service/ar-ui-tax-employer-registration/"
        ]
    },
    {
        code: "CA", name: "California", checked: C,
        llc: { formation: once("Articles of Organization (LLC-1)", "70"), report: biennial("Statement of Information", "20") },
        corporation: { formation: once("Articles of Incorporation, General Stock Corporation (ARTS-GS)", "100"), report: yearly("Statement of Information", "25") },
        fixedTax: { llc: yearly("Annual LLC tax (FTB 3522)", "800"), corporation: yearly("Minimum franchise tax", "800") },
        salesTax: true,
        salesTaxRegistration: "Seller's Permit, California Department of Tax and Fee Administration",
        sources: [
            "https://llcbizfile.sos.ca.gov/registration",
            "https://www.sos.ca.gov/business-programs/business-entities/faqs",
            "https://www.sos.ca.gov/business-programs/cannabizfile/cannabis-forms-and-fees/corporations-and-cooperatives-california",
            "https://www.ftb.ca.gov/file/business/types/limited-liability-company/index.html",
            "https://www.ftb.ca.gov/forms/misc/1060.html",
            "https://cdtfa.ca.gov/taxes-and-fees/faqseller.htm",
            "https://edd.ca.gov/siteassets/files/pdf_pub_ctr/de44.pdf"
        ]
    },
    {
        code: "CO", name: "Colorado", checked: C,
        llc: { formation: once("Articles of Organization", "50"), report: yearly("Periodic Report", "25") },
        corporation: { formation: once("Articles of Incorporation", "50"), report: yearly("Periodic Report", "25") },
        salesTax: true,
        salesTaxRegistration: "Sales Tax License, Colorado Department of Revenue",
        sources: [
            "https://www.sos.state.co.us/pubs/info_center/fees/business.html",
            "https://www.sos.state.co.us/pubs/business/FAQs/reports.html",
            "https://tax.colorado.gov/new-businesses",
            "https://cdle.colorado.gov/employers/starting-a-business"
        ]
    },
    {
        code: "CT", name: "Connecticut", checked: C,
        llc: { formation: once("Certificate of Organization", "120"), report: yearly("Annual Report", "80") },
        corporation: { formation: once("Certificate of Incorporation", "250"), report: yearly("Annual Report", "150") },
        salesTax: true,
        salesTaxRegistration: "Sales and Use Tax Permit, Department of Revenue Services",
        sources: [
            "https://business.ct.gov/knowledge-base/articles/domestic-limited-liability-companies-forms-and-fees",
            "https://business.ct.gov/knowledge-base/articles/domestic-annual-report-forms-and-fees",
            "https://business.ct.gov/knowledge-base/articles/submit-paper-filings",
            "https://portal.ct.gov/drs/sales-tax/tax-information",
            "https://portal.ct.gov/DRS/TSC/Help-Text/corp-tax-help-page"
        ]
    },
    {
        code: "DE", name: "Delaware", checked: C,
        llc: { formation: once("Certificate of Formation", "110") },
        corporation: { report: yearly("Annual Franchise Tax Report", "50") },
        salesTax: false,
        sources: [
            "https://corpfiles.delaware.gov/LLC_Forms/LLC%20Formation.pdf",
            "https://corpfiles.delaware.gov/Corp_Forms/Incorporation%20-%20Stock.pdf",
            "https://corp.delaware.gov/alt-entitytaxinstructions/",
            "https://corp.delaware.gov/frtax/",
            "https://revenue.delaware.gov/business-tax-forms/doing-business-in-delaware/step-2-requirements/"
        ]
    },
    {
        code: "DC", name: "District of Columbia", checked: C,
        llc: { formation: once("Articles of Organization", "99"), report: biennial("Biennial Report", "300") },
        corporation: { formation: once("Articles of Incorporation", "99"), report: biennial("Biennial Report", "300") },
        salesTax: true,
        salesTaxRegistration: "Sales and Use Tax registration (Form FR-500), Office of Tax and Revenue",
        sources: [
            "https://dlcp.dc.gov/page/corporations-division-fees-limited-liability-company",
            "https://dlcp.dc.gov/page/corporations-division-fees-business-corporation",
            "https://dlcp.dc.gov/page/corporations-division-business-registration-faqs",
            "https://otr.cfo.dc.gov/page/dc-business-franchise-tax-rates",
            "https://otr.cfo.dc.gov/page/new-business-registration",
            "https://does.dc.gov/service/registration-questions"
        ]
    },
    {
        code: "FL", name: "Florida", checked: C,
        llc: { formation: once("Articles of Organization", "125"), report: yearly("Annual Report", "138.75") },
        corporation: { formation: once("Articles of Incorporation", "70"), report: yearly("Annual Report", "150") },
        salesTax: true,
        salesTaxRegistration: "Sales and Use Tax Certificate of Registration (Form DR-1), Florida Department of Revenue",
        sources: [
            "https://dos.fl.gov/sunbiz/forms/fees/llc-fees/",
            "https://dos.fl.gov/sunbiz/forms/fees/corporate-fees/",
            "https://dos.fl.gov/sunbiz/manage-business/efile/annual-report/",
            "https://floridarevenue.com/taxes/eservices/Pages/registration.aspx"
        ]
    },
    {
        code: "GA", name: "Georgia", checked: C,
        llc: { formation: once("Articles of Organization", "100") },
        corporation: {
            report: yearly("Annual Registration", "60"),
            publication: {
                says: "Publish a Notice of Intent to Incorporate in the county legal organ, sent the business day after filing.",
                fee: once("Notice of Intent to Incorporate", "40")
            }
        },
        salesTax: true,
        salesTaxRegistration: "Sales and Use Tax registration (Georgia Tax Center), Georgia Department of Revenue",
        sources: [
            "https://georgia.gov/register-llc",
            "https://sos.ga.gov/sites/default/files/forms/Reference%20-%20Filing%20Fees_0.pdf",
            "https://sos.ga.gov/sites/default/files/2025-07/corp-filing_procedure-corporation.pdf",
            "https://dor.georgia.gov/taxes/register-new-business-georgia"
        ]
    },
    {
        code: "HI", name: "Hawaii", checked: C,
        llc: { formation: once("Articles of Organization (Form LLC-1)", "51"), report: yearly("Annual Report", "15") },
        corporation: { formation: once("Articles of Incorporation", "51"), report: yearly("Annual Report", "15") },
        salesTax: true,
        salesTaxRegistration: "General Excise Tax (GET) license (Form BB-1), Hawaii Department of Taxation",
        sources: [
            "https://cca.hawaii.gov/breg/registration/dllc/",
            "https://cca.hawaii.gov/breg/registration/dpc/",
            "https://cca.hawaii.gov/breg/fees/",
            "https://cca.hawaii.gov/breg/registration/dllc/fees/",
            "https://tax.hawaii.gov/geninfo/get/"
        ]
    },
    {
        code: "ID", name: "Idaho", checked: C,
        llc: { formation: once("Certificate of Organization", "100") },
        corporation: { formation: once("Articles of Incorporation", "100") },
        salesTax: true,
        salesTaxRegistration: "Seller's Permit (Idaho Business Registration), Idaho State Tax Commission",
        sources: [
            "https://sos.idaho.gov/business-forms/",
            "https://tax.idaho.gov/online-services/business-registration/"
        ]
    },
    {
        code: "IL", name: "Illinois", checked: C,
        llc: { formation: once("Articles of Organization (LLC-5.5)", "150"), report: yearly("Annual Report", "75") },
        corporation: { report: yearly("Annual Report", "75") },
        salesTax: true,
        salesTaxRegistration: "Certificate of Registration (Form REG-1), Illinois Department of Revenue",
        sources: [
            "https://www.ilsos.gov/publications/business-services/llc.html",
            "https://www.ilsos.gov/content/dam/publications/pdf_publications/bca210.pdf",
            "https://www.ilsos.gov/content/dam/publications/pdf_publications/bca1405d.pdf",
            "https://tax.illinois.gov/businesses/registration.html"
        ]
    },
    {
        code: "IN", name: "Indiana", checked: C,
        llc: { formation: once("Articles of Organization", "100"), report: biennial("Business Entity Report", "31") },
        corporation: { formation: once("Articles of Incorporation", "100"), report: biennial("Business Entity Report", "31") },
        salesTax: true,
        salesTaxRegistration: "Registered Retail Merchant Certificate (Form BT-1 via INBiz), Indiana Department of Revenue",
        sources: [
            "https://www.in.gov/sos/business/business-entity-reports",
            "https://iga.in.gov/ic/2026/Title_23/Article_0.5/Chapter_9.pdf",
            "https://www.in.gov/dor/i-am-a/business-corp/sales-tax/"
        ]
    },
    {
        code: "IA", name: "Iowa", checked: C,
        llc: { formation: once("Certificate of Organization", "50"), report: biennial("Biennial Report", "30") },
        corporation: { formation: once("Articles of Incorporation", "50") },
        salesTax: true,
        salesTaxRegistration: "Sales Tax Permit (Iowa Business Tax Permit Registration), Iowa Department of Revenue",
        sources: [
            "https://sos.iowa.gov/businesses/business-entity-forms-and-fees",
            "https://help.sos.iowa.gov/how-do-i-file-biennial-report",
            "https://revenue.iowa.gov/taxes/business-permit-registration",
            "https://workforce.iowa.gov/media/3040/download?inline="
        ]
    },
    {
        code: "KS", name: "Kansas", checked: C,
        salesTax: true,
        salesTaxRegistration: "Retailers' Sales Tax registration (Form CR-16), Kansas Department of Revenue",
        sources: [
            "https://sos.ks.gov/publications/register/Volume-45/Issues/Issue-07/02-12-26-53865.html",
            "https://sos.ks.gov/forms/business_services/AI.pdf",
            "https://www.ksrevenue.gov/forms-btreg.html"
        ]
    },
    {
        code: "KY", name: "Kentucky", checked: C,
        llc: { formation: once("Articles of Organization", "40"), report: yearly("Annual Report", "15") },
        corporation: { report: yearly("Annual Report", "15") },
        fixedTax: { llc: yearly("Limited Liability Entity Tax (LLET) minimum", "175"), corporation: yearly("Limited Liability Entity Tax (LLET) minimum", "175") },
        salesTax: true,
        salesTaxRegistration: "Sales and Use Tax Permit (Form 10A100), Kentucky Department of Revenue",
        sources: [
            "https://www.sos.ky.gov/bus/business-filings/Pages/Fees.aspx",
            "https://www.sos.ky.gov/bus/business-filings/Pages/Annual-Reports.aspx",
            "https://revenue.ky.gov/Business/Corporation-Income-and-Limited-Liability-Entity-Tax/Pages/default.aspx",
            "https://onestop.ky.gov/manage/Pages/taxes.aspx"
        ]
    },
    {
        code: "LA", name: "Louisiana", checked: C,
        salesTax: true,
        salesTaxRegistration: "State sales tax account (LaTAP Register My Business), Louisiana Department of Revenue",
        sources: [
            "https://www.sos.la.gov/business-services/forms-fee-schedule",
            "https://static.sos.la.gov/shared/fee_changes_2026.pdf",
            "https://revenue.louisiana.gov/tax-education-and-faqs/faqs/income-tax-reform/is-the-corporation-franchise-tax-repealed/",
            "https://revenue.louisiana.gov/businesses/general-resources/business-registration/"
        ]
    },
    {
        code: "ME", name: "Maine", checked: C,
        llc: { formation: once("Certificate of Formation (MLLC-6)", "175"), report: yearly("Annual Report", "85") },
        corporation: { formation: once("Articles of Incorporation (MBCA-6)", "145"), report: yearly("Annual Report", "85") },
        salesTax: true,
        salesTaxRegistration: "Retailer Certificate, Maine Revenue Services",
        sources: [
            "https://www.maine.gov/sos/corporations-commissions/i-need-a-business-form/limited-liability-company-forms",
            "https://www.maine.gov/sos/corporations-commissions/corporations-business-services/business-corporations",
            "https://legislature.maine.gov/statutes/13-c/title13-Csec123.html",
            "https://www.maine.gov/revenue/sites/maine.gov.revenue/files/inline-files/25_Central_reg_app_booklet%20.pdf"
        ]
    },
    {
        code: "MD", name: "Maryland", checked: C,
        llc: { formation: once("Articles of Organization", "100"), report: yearly("Annual Report & Business Personal Property Return (Form 1)", "300") },
        corporation: { formation: once("Articles of Incorporation", "120"), report: yearly("Annual Report & Business Personal Property Return (Form 1)", "300") },
        salesTax: true,
        sources: [
            "https://dat.maryland.gov/Documents/Accessible%20Documents/Charter%20-%20Resource%20Docs/List%20of%20Fees%20for%20Charter%20Services%20and%20Document%20Filings_0326-A.pdf",
            "https://dat.maryland.gov/businesses/Documents/Charter_Legal_FAQ.pdf",
            "https://dat.maryland.gov/SDAT%20Forms/PPR_Forms/2024Form1IAnnualnstructions_Business_PersonalProperty.pdf",
            "https://egov.maryland.gov/BusinessExpress/Payment/FeesSchedule"
        ]
    },
    {
        code: "MA", name: "Massachusetts", checked: C,
        llc: { formation: once("Certificate of Organization", "500"), report: yearly("Annual Report", "500") },
        corporation: { formation: once("Articles of Organization", "250"), report: yearly("Annual Report", "100") },
        fixedTax: { corporation: yearly("Corporate excise minimum", "456") },
        salesTax: true,
        sources: [
            "https://www.sec.state.ma.us/divisions/corporations/download/Fee_Schedule.pdf",
            "https://www.sec.state.ma.us/divisions/corporations/filing-by-subject/limited-liability/corporations-limited-liability-company.htm",
            "https://www.mass.gov/info-details/s-corporations"
        ]
    },
    {
        code: "MI", name: "Michigan", checked: C,
        llc: { formation: once("Articles of Organization", "50"), report: yearly("Annual Statement", "25") },
        salesTax: true,
        sources: [
            "https://www.michigan.gov/lara/-/media/Project/Websites/lara/cscl/NonImages_new/Corps/forms/llc/700-0725.pdf",
            "https://www.michigan.gov/lara/-/media/Project/Websites/lara/cscl/NonImages_new/Corps/forms/corporation/500-0725.pdf",
            "https://www.michigan.gov/lara/-/media/Project/Websites/lara/cscl/NonImages_new/Corps/forms/CSCL_CD_267.pdf",
            "https://www.michigan.gov/lara/bureau-list/cscl/corps/frequently-asked-questions"
        ]
    },
    {
        code: "MN", name: "Minnesota", checked: C,
        llc: { formation: once("Articles of Organization", "155"), report: yearly("Annual Renewal", "0") },
        corporation: { formation: once("Articles of Incorporation", "155"), report: yearly("Annual Renewal", "0") },
        salesTax: true,
        sources: [
            "https://www.sos.mn.gov/business-liens/start-a-business/business-filing-certification-fee-schedule/",
            "https://www.sos.mn.gov/media/1824/llcarticlesoforganization.pdf",
            "https://www.sos.mn.gov/media/1388/domesticbusinesscorparticlesofinc.pdf"
        ]
    },
    {
        code: "MS", name: "Mississippi", checked: C,
        llc: { formation: once("Certificate of Formation (F0100)", "50"), report: yearly("Annual Report", "0") },
        corporation: { formation: once("Articles of Incorporation (F0001)", "50"), report: yearly("Annual Report", "25") },
        fixedTax: { corporation: yearly("Franchise tax minimum", "25") },
        salesTax: true,
        sources: [
            "https://www.sos.ms.gov/content/documents/Business/FeeSchedule.pdf",
            "https://www.sos.ms.gov/news/warning-misleading-annual-report-mailers-0",
            "https://www.dor.ms.gov/business/business-tax-frequently-asked-questions"
        ]
    },
    {
        code: "MO", name: "Missouri", checked: C,
        llc: { formation: once("Articles of Organization (LLC-1)", "50") },
        corporation: { formation: once("Articles of Incorporation", "58") },
        salesTax: true,
        sources: [
            "https://www.sos.mo.gov/CMSImages/Business/fees.pdf",
            "https://www.sos.mo.gov/business/faqs",
            "https://s1.sos.mo.gov/CMSImages/Business/llc1.pdf"
        ]
    },
    {
        code: "MT", name: "Montana", checked: C,
        llc: { formation: once("Articles of Organization", "35") },
        fixedTax: { corporation: yearly("Corporation license tax minimum", "50") },
        salesTax: false,
        sources: [
            "https://sosmt.gov/business/fees/",
            "https://help.sosmt.gov/en-us/article/how-do-i-file-my-annual-report-ywawrv/",
            "https://rules.mt.gov/gateway/RuleNo.asp?RN=44.5.115",
            "https://revenue.mt.gov/files/Forms/Montana-Form-CIT-Instructions/2025_Montana_Form_CIT_Instructions.pdf"
        ]
    },
    {
        code: "NE", name: "Nebraska", checked: C,
        llc: {
            formation: once("Certificate of Organization", "100"),
            report: biennial("Biennial Report", "30"),
            publication: {
                says: "Publish a notice of organisation and file the affidavit of publication with the Secretary of State.",
                fee: once("Affidavit of publication", "25")
            }
        },
        corporation: {
            formation: once("Articles of Incorporation", "100"),
            publication: {
                says: "Publish a notice of incorporation and file the affidavit of publication with the Secretary of State.",
                fee: once("Affidavit of publication", "25")
            }
        },
        salesTax: true,
        sources: [
            "https://sos.nebraska.gov/business-services/forms-and-fee-information",
            "https://sos.nebraska.gov/sites/default/files/doc/business-services/Corporations/Forms/CertificateOfOrganization.pdf",
            "https://sos.nebraska.gov/sites/default/files/doc/business-services/Corporations/Reinstatement/DLLCReinstatement.pdf",
            "https://sos.nebraska.gov/sites/default/files/doc/business-services/Corporations/Reinstatement/DCorporationReinstatement.pdf"
        ]
    },
    {
        code: "NV", name: "Nevada", checked: C,
        fixedTax: { llc: yearly("State Business License", "200"), corporation: yearly("State Business License", "500") },
        salesTax: true,
        sources: [
            "https://www.nvsos.gov/licensing/state-business-license/state-business-license-faq",
            "https://www.nvsos.gov/businesses/commercial-recordings/forms-fees/all-business-forms/filing-fee-calculator"
        ]
    },
    {
        code: "NH", name: "New Hampshire", checked: C,
        llc: { formation: once("Certificate of Formation (LLC-1)", "100"), report: yearly("Annual Report", "100") },
        corporation: { formation: once("Articles of Incorporation", "100"), report: yearly("Annual Report", "100") },
        salesTax: false,
        sources: [
            "https://www.sos.nh.gov/corporations-0/forms-and-fees/limited-liability-companies",
            "https://gc.nh.gov/rsa/html/XXVIII/304-C/304-C-191.htm",
            "https://gc.nh.gov/rsa/html/XXVII/293-A/293-A-122.htm"
        ]
    },
    {
        code: "NJ", name: "New Jersey", checked: C,
        llc: { formation: once("Certificate of Formation", "100"), report: yearly("Annual Report", "75") },
        corporation: { formation: once("Certificate of Incorporation", "100"), report: yearly("Annual Report", "75") },
        salesTax: true,
        salesTaxRegistration: "Sales tax Certificate of Authority (Form NJ-REG), Division of Revenue and Enterprise Services and Division of Taxation",
        sources: [
            "https://www.nj.gov/treasury/revenue/fees.shtml",
            "https://www.nj.gov/treasury/revenue/gettingregistered.shtml",
            "https://www.nj.gov/treasury/taxation/pdf/current/cbt/cbt100ins.pdf"
        ]
    },
    {
        code: "NM", name: "New Mexico", checked: C,
        llc: { formation: once("Articles of Organization", "50") },
        corporation: { report: biennial("Biennial Report", "25") },
        salesTax: true,
        salesTaxRegistration: "New Mexico Business Tax Identification Number (NMBTIN), Taxation and Revenue Department",
        sources: [
            "https://www.sos.nm.gov/business-services/",
            "https://businessportal.nm.gov/maintain/file-reports/",
            "https://www.tax.newmexico.gov/businesses/gross-receipts-overview/"
        ]
    },
    {
        code: "NY", name: "New York", checked: C,
        llc: {
            formation: once("Articles of Organization", "200"),
            report: biennial("Biennial Statement", "9"),
            publication: {
                says: "Publish a notice in two newspapers for six weeks within 120 days of formation, then file a Certificate of Publication.",
                fee: once("Certificate of Publication", "50")
            }
        },
        corporation: { formation: once("Certificate of Incorporation", "125"), report: biennial("Biennial Statement", "9") },
        salesTax: true,
        salesTaxRegistration: "Certificate of Authority, NYS Department of Taxation and Finance",
        sources: [
            "https://dos.ny.gov/fee-schedules",
            "https://www.tax.ny.gov/forms/current-forms/ct/ct3i.htm",
            "https://www.tax.ny.gov/pit/efile/annual_filing_fee.htm"
        ]
    },
    {
        code: "NC", name: "North Carolina", checked: C,
        llc: { formation: once("Articles of Organization", "125"), report: yearly("Annual Report", "200") },
        corporation: { formation: once("Articles of Incorporation", "125"), report: yearly("Annual Report", "25") },
        fixedTax: { corporation: yearly("Franchise tax minimum", "200") },
        salesTax: true,
        salesTaxRegistration: "Sales and Use Tax registration (Form NC-BR), NC Department of Revenue",
        sources: [
            "https://www.sosnc.gov/fees/by_title/_Business_Registration",
            "https://www.sosnc.gov/divisions/business_registration/annual_report_due_dates",
            "https://www.ncdor.gov/taxes-forms/corporate-income-franchise-tax/corporate-income-and-franchise-tax-rates"
        ]
    },
    {
        code: "ND", name: "North Dakota", checked: C,
        llc: { formation: once("Articles of Organization", "135"), report: yearly("Annual Report", "50") },
        corporation: { formation: once("Articles of Incorporation", "100"), report: yearly("Annual Report", "25") },
        salesTax: true,
        salesTaxRegistration: "Sales and Use Tax Permit, Office of State Tax Commissioner",
        sources: [
            "https://sos.nd.gov/business/business-services/business-structures/limited-liability-companies/limited-liability-company-llc/llc-fees.html",
            "https://www.sos.nd.gov/business/business-services/business-structures/corporation",
            "https://www.tax.nd.gov/sales-and-use-tax"
        ]
    },
    {
        code: "OH", name: "Ohio", checked: C,
        llc: { formation: once("Articles of Organization (Form 610)", "99") },
        corporation: { formation: once("Articles of Incorporation", "99") },
        salesTax: true,
        salesTaxRegistration: "Vendor's License, Ohio Department of Taxation",
        sources: [
            "https://www.ohiosos.gov/business/business-filing-forms",
            "https://tax.ohio.gov/home/news-and-events/all-news/2025-04-09-vendors-license-fee-change"
        ]
    },
    {
        code: "OK", name: "Oklahoma", checked: C,
        llc: { formation: once("Articles of Organization", "100"), report: yearly("Annual Certificate", "25") },
        salesTax: true,
        sources: [
            "https://www.sos.ok.gov/business/fees.aspx",
            "https://oklahoma.gov/tax/newsroom/2023/07-26-23.html"
        ]
    },
    {
        code: "OR", name: "Oregon", checked: C,
        llc: { formation: once("Articles of Organization", "100"), report: yearly("Annual Report", "100") },
        corporation: { formation: once("Articles of Incorporation", "100"), report: yearly("Annual Report", "100") },
        salesTax: false,
        sources: [
            "https://sos.oregon.gov/business/documents/business-registry-forms/llc-articles.pdf",
            "https://sos.oregon.gov/business/documents/business-registry-forms/dbc-articles.pdf",
            "https://sos.oregon.gov/business/Pages/dont-be-misled.aspx",
            "https://www.oregon.gov/dor/programs/businesses/pages/corp-requirements.aspx"
        ]
    },
    {
        code: "PA", name: "Pennsylvania", checked: C,
        llc: { formation: once("Certificate of Organization", "125"), report: yearly("Annual Report", "7") },
        corporation: {
            formation: once("Articles of Incorporation", "125"),
            report: yearly("Annual Report", "7"),
            publication: { says: "Advertise the incorporation in two newspapers, one of them a legal journal." }
        },
        salesTax: true,
        salesTaxRegistration: "Sales Tax License, PA Department of Revenue",
        sources: [
            "https://www.pa.gov/agencies/dos/programs/business/fees-and-payments",
            "https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/annual-reports",
            "https://www.pa.gov/agencies/dos/programs/business/types-of-filings-and-registrations/pennsylvania-business-corporations",
            "https://business.pa.gov/register/registering-with-pennsylvania/basic-business-registration-overview/"
        ]
    },
    {
        code: "RI", name: "Rhode Island", checked: C,
        llc: { formation: once("Articles of Organization (Form 400)", "150"), report: yearly("Annual Report", "50") },
        corporation: { formation: once("Articles of Incorporation", "230"), report: yearly("Annual Report", "50") },
        fixedTax: { llc: yearly("LLC annual charge", "400"), corporation: yearly("Corporation minimum tax", "400") },
        salesTax: true,
        salesTaxRegistration: "Permit to Make Sales at Retail, RI Division of Taxation",
        sources: [
            "https://docs.sos.ri.gov/documents/BusinessServices/business-forms-fee-schedule.pdf",
            "https://docs.sos.ri.gov/documents/BusinessServices/400-articles-of-organization.pdf",
            "https://docs.sos.ri.gov/documents/BusinessServices/630-business-corporation-annual-report.pdf",
            "https://tax.ri.gov/resources/businesses/corporate",
            "https://tax.ri.gov/tax-sections/sales-excise-taxes"
        ]
    },
    {
        code: "SC", name: "South Carolina", checked: C,
        llc: { formation: once("Articles of Organization", "110") },
        corporation: { formation: once("Articles of Incorporation", "135") },
        salesTax: true,
        salesTaxRegistration: "Retail License, SC Department of Revenue",
        sources: [
            "https://businessfilings.sc.gov/BusinessFiling/Entity/DownloadForm?formName=F0006&entityType=2&filingType=Articles+of+Organization",
            "https://businessfilings.sc.gov/BusinessFiling/Entity/DownloadForm?entityType=1&filingType=ARTICLES+OF+INCORPORATION&formName=F0001",
            "https://dor.sc.gov/business-income-taxes/corporate/corporate-faqs",
            "https://dor.sc.gov/businesses/apply-business-tax-account/licensing-retail-license",
            "https://dor.sc.gov/tax/registration/faq"
        ]
    },
    {
        code: "SD", name: "South Dakota", checked: C,
        llc: { formation: once("Articles of Organization", "150"), report: yearly("Annual Report", "55") },
        corporation: { formation: once("Articles of Incorporation", "150"), report: yearly("Annual Report", "55") },
        salesTax: true,
        salesTaxRegistration: "Sales Tax License, SD Department of Revenue",
        sources: [
            "https://sdsos.gov/general-information/filing-fees.aspx",
            "https://sdsos.gov/Division%20of%20Business%20Services/FAQs/default.aspx",
            "https://dor.sd.gov/businesses/taxes/sales-use-tax/"
        ]
    },
    {
        code: "TN", name: "Tennessee", checked: C,
        corporation: { formation: once("Charter, For-Profit Corporation (SS-4417)", "100"), report: yearly("Annual Report", "20") },
        fixedTax: { llc: yearly("Franchise tax minimum", "100"), corporation: yearly("Franchise tax minimum", "100") },
        salesTax: true,
        salesTaxRegistration: "Sales and Use Tax registration (TNTAP), TN Department of Revenue",
        sources: [
            "https://sos.tn.gov/businesses/services/business-forms-fees",
            "https://sos.tn.gov/businesses/faqs",
            "https://www.tn.gov/revenue/taxes/franchise---excise-tax.html"
        ]
    },
    {
        code: "TX", name: "Texas", checked: C,
        llc: { formation: once("Certificate of Formation (Form 205)", "300"), report: yearly("Franchise Tax Report + Public Information Report", "0") },
        corporation: { formation: once("Certificate of Formation (Form 201)", "300"), report: yearly("Franchise Tax Report + Public Information Report", "0") },
        salesTax: true,
        salesTaxRegistration: "Sales and Use Tax Permit, Texas Comptroller of Public Accounts",
        sources: [
            "https://www.sos.state.tx.us/corp/instructions/205.shtml",
            "https://www.sos.texas.gov/corp/instructions/201.shtml",
            "https://comptroller.texas.gov/taxes/franchise/",
            "https://comptroller.texas.gov/taxes/permit/"
        ]
    },
    {
        code: "UT", name: "Utah", checked: C,
        llc: { formation: once("Certificate of Organization", "59"), report: yearly("Annual Renewal", "18") },
        corporation: { formation: once("Articles of Incorporation", "59"), report: yearly("Annual Renewal", "18") },
        salesTax: true,
        sources: [
            "https://commerce.utah.gov/wp-content/uploads/2023/04/currentfees.pdf",
            "https://commerce.utah.gov/corporations/renewal-process/",
            "https://tax.utah.gov/business/corporate-income-tax/c-corp-tax/"
        ]
    },
    {
        code: "VT", name: "Vermont", checked: C,
        llc: { formation: once("Articles of Organization", "155"), report: yearly("Annual Report", "45") },
        corporation: { formation: once("Articles of Incorporation", "155") },
        salesTax: true,
        sources: [
            "https://sos.vermont.gov/business-services/fees-statutes",
            "https://legislature.vermont.gov/statutes/section/11/025/04012",
            "https://sos.vermont.gov/business-services/business-filings/annualbiennial-reports",
            "https://tax.vermont.gov/sites/tax/files/documents/CO-411-Instr-2024.pdf"
        ]
    },
    {
        code: "VA", name: "Virginia", checked: C,
        llc: { formation: once("Articles of Organization (LLC-1011)", "100"), report: yearly("Annual Registration Fee", "50") },
        corporation: { report: yearly("Annual Registration Fee", "50") },
        salesTax: true,
        sources: [
            "https://scc.virginia.gov/pages/New-Virginia-Entity-Fees",
            "https://law.lis.virginia.gov/vacode/title13.1/chapter12/section13.1-1005/",
            "https://law.lis.virginia.gov/vacode/title13.1/chapter9/section13.1-615.1/",
            "https://www.scc.virginia.gov/businesses/business-faqs/annual-registration-fees/"
        ]
    },
    {
        code: "WA", name: "Washington", checked: C,
        llc: { formation: once("Certificate of Formation", "180"), report: yearly("Annual Report", "70") },
        corporation: { formation: once("Articles of Incorporation", "180"), report: yearly("Annual Report", "70") },
        salesTax: true,
        salesTaxRegistration: "State tax registration through the Business License Application, Department of Revenue Business Licensing Service",
        sources: [
            "https://www.sos.wa.gov/corporations-charities/frequently-asked-questions-faqs/fee-schedules-priority-services",
            "https://www.sos.wa.gov/corporations-charities/business-entities/limited-liability-company-llc-professional-llc-pllc-filing-resource-page",
            "https://dor.wa.gov/open-business/apply-business-license"
        ]
    },
    {
        code: "WV", name: "West Virginia", checked: C,
        llc: { formation: once("Articles of Organization (LLD-1)", "100"), report: yearly("Annual Report", "25") },
        corporation: { formation: once("Articles of Incorporation (CD-1)", "100"), report: yearly("Annual Report", "25") },
        salesTax: true,
        salesTaxRegistration: "Business Registration Certificate, WV State Tax Department",
        sources: [
            "https://sos.wv.gov/sites/default/files/2026-07/lld-1_0.pdf",
            "https://sos.wv.gov/sites/default/files/2026-04/cd-1.pdf",
            "https://sos.wv.gov/business/updates-and-changes/annual-reports",
            "https://tax.wv.gov/Documents/Business/BusinessRegistrationInformationAndInstructions.pdf"
        ]
    },
    {
        code: "WI", name: "Wisconsin", checked: C,
        llc: { formation: once("Articles of Organization (Form 502)", "130"), report: yearly("Annual Report", "25") },
        corporation: { formation: once("Articles of Incorporation (Form 2)", "100"), report: yearly("Annual Report", "25") },
        salesTax: true,
        salesTaxRegistration: "Seller's Permit (Business Tax Registration), Wisconsin Department of Revenue",
        sources: [
            "https://dfi.wi.gov/Pages/BusinessServices/BusinessEntities/Fees.aspx",
            "https://dfi.wi.gov/Documents/BusinessServices/BusinessEntities/Forms/CORP502.pdf",
            "https://docs.legis.wisconsin.gov/statutes/statutes/183/i/0122/2/a",
            "https://www.revenue.wi.gov/Pages/FAQS/pcs-btr.aspx"
        ]
    },
    {
        code: "WY", name: "Wyoming", checked: C,
        llc: { formation: once("Articles of Organization", "100") },
        corporation: { formation: once("Articles of Incorporation", "100") },
        salesTax: true,
        salesTaxRegistration: "Sales/Use Tax License, Wyoming Department of Revenue",
        sources: [
            "https://sos.wyo.gov/business/docs/businessfees.pdf",
            "https://sos.wyo.gov/faqs.aspx?root=BUS",
            "https://sos.wyo.gov/Forms/Business/PROF/P-ArticlesIncorporation.pdf",
            "https://excise-tax-div.wyo.gov/general-administrative/excise-tax-faqs"
        ]
    }
];

/** The state or DC for a subdivision given as its two-letter code or its name (case-insensitive, trimmed). */
export function usStateOf(subdivision: string): UsState | undefined {
    const key = subdivision.trim().toLowerCase();
    if (!key) return undefined;
    return US_STATES.find(state => state.code.toLowerCase() === key || state.name.toLowerCase() === key);
}
