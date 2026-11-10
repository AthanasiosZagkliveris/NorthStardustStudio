import FoldArrow from "../fields/FoldArrow.tsx";

/**
 * A FOLDED CATEGORY'S HEAD in a funnel's menu (the Inventory's Include, Sort, Belongs to, Columns; the Landing page Glossary's Kinds of term,
 * Organisations, Letters): its label and its fold arrow (the title arrow of the section cards): the block is shown while the arrow points down.
 * (capability-overview.css draws it, under `.capability-overview-menu`.)
 */
export default function MenuHead({ title, open, onToggle, controls }: { title: string; open: boolean; onToggle: () => void; controls?: string }) {
    return (
        <div className="capability-overview-menu-head">
            <strong>{title}</strong>
            <FoldArrow variant="label" open={open} controls={controls} name={(open ? "Fold " : "Unfold ") + title} onToggle={onToggle} />
        </div>
    );
}
