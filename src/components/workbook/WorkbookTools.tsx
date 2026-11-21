import { createContext, ReactNode, useContext } from "react";
import { createPortal } from "react-dom";

/** Where the Workbook's section buttons stand: the row of its title, at the right (set by the Workbook page). */
export const WorkbookToolsSlot = createContext<HTMLElement | null>(null);

/**
 * A SECTION'S BUTTONS ON THE WORKBOOK (owner, 2026-11-09: "All the buttons should be placed on the top, aligned to the page titles, at the opposite
 * sides"): the funnels and the Export of the section shown stand in the title's row, at its right end (layout rules 22.37). Outside the Workbook (no slot),
 * they stand in their own row at the right, as before.
 */
export default function WorkbookTools({ children }: { children: ReactNode }) {
    const slot = useContext(WorkbookToolsSlot);
    return slot ? createPortal(children, slot) : <div className="glossary-bar">{children}</div>;
}
