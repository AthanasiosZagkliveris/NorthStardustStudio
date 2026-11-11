/**
 * Split out of AnswerBusinessCapability.ts (2026-11-11, the folder report's item 6); that file re-exports what is exported here.
 */


/**
 * The activity groups of a place, with the period each one's dates stay
 * inside. Infrastructure's Pre-Operational activities also have a type
 * (BUSINESS_PREOPERATIONAL_TYPES), which is not shown as a category.
 */
export const BUSINESS_ACTIVITY_GROUPS = {
    infrastructure: [
        {
            id: "pre-operational",
            label: "Pre-Operational",
            period: "plan-start-to-opening",
            note: "Anything that runs before opening: machinery and its installation, legal and accounting, testing and training, a launch event."
        },
        {
            id: "operational",
            label: "Operational",
            period: "from-opening",
            note: "Activities required to operate the organisation day to day."
        }
    ],
    offering: [
        {
            id: "production",
            label: "Production",
            period: "from-plan-start",
            note: "Activities required to design, develop and deliver the offerings."
        },
        {
            id: "marketing",
            label: "Marketing",
            period: "from-plan-start",
            note: "Activities required to promote the organisation and its offerings."
        },
        {
            id: "sales",
            label: "Sales & Customer",
            period: "from-opening",
            note: "Activities required to acquire customers and manage customer relationships."
        }
    ]
} as const;

/** What a Pre-Operational activity is: the type it carries (not shown as a category). */
export const BUSINESS_PREOPERATIONAL_TYPES = [
    { id: "capex", label: "Capital Expenditure" },
    { id: "startup", label: "Start-up Expenses" }
] as const;

/** Every activity group of both places, for the lookups that do not care which place. */
export const BUSINESS_ACTIVITY_CATEGORIES = [
    ...BUSINESS_ACTIVITY_GROUPS.infrastructure,
    ...BUSINESS_ACTIVITY_GROUPS.offering
];

/** The activity groups of a place (the ones a card there can be filed under). */
export const activityGroupsOf = (scope: "infrastructure" | "offering") => BUSINESS_ACTIVITY_GROUPS[scope];

/**
 * Where an activity created from a resource's status is filed.
 *
 * "Activities created or assigned from Infrastructure are placed
 * under the appropriate activity category." Setting one up, or
 * finding out about it, is work required to establish and operate
 * the organisation -- which is Operational, word for word.
 */
export const BUSINESS_DERIVED_ACTIVITY_CATEGORY = "operational";

/**
 * The category an activity made by a resource's status is filed under, by the section the resource is in: work to establish and operate the
 * organization (Infrastructure) is Operational, work to design, develop and deliver an offering (Offering's Capability) is Production. The one place
 * to change that default.
 */
export const DERIVED_ACTIVITY_CATEGORY: Record<"infrastructure" | "offering", string> = {
    infrastructure: BUSINESS_DERIVED_ACTIVITY_CATEGORY,
    offering: "production"
};

/** The category of a NEW Activity or Partner / Provider card: none yet -- the cell reads "Select", the card is incomplete till one is chosen. */
export const UNASSIGNED_CATEGORY = "unassigned";

/** An activity category's name: a built-in's label, else the name the user typed ("" while he has not typed it yet). */
export function activityCategoryLabel(categories: readonly { id: string; name: string }[], id: string): string {
    return BUSINESS_ACTIVITY_CATEGORIES.find(entry => entry.id === id)?.label ?? categories.find(entry => entry.id === id)?.name.trim() ?? "";
}
