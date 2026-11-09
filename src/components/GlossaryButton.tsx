import AddButton from "./controls/AddButton.tsx";
import { useLocation, useNavigate } from "react-router-dom";
import { openWorkbook } from "./notepad/Notepad.tsx";

/**
 * The Landing page's Glossary button (with an Organisation open, the Glossary is a tab of the Workbook), like the other header tools: an open book
 * and the word (the book alone in a narrow header). It opens the
 * Workbook page on its Glossary (the References are the next tab), as
 * the Landing's (no Organisation open), remembering where it was opened
 * from so Back and Escape return there.
 */
export default function GlossaryButton() {

    const navigate = useNavigate();
    const location = useLocation();

    return (
        <AddButton className="header-tool"
            aria-label="Glossary and references"
            title="Glossary and references"
            onClick={() => openWorkbook(navigate, location, { tab: "glossary", total: true })}>
            <svg className="header-tool-icon" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M10 5.5C8.5 4.3 6.3 4 3.5 4.2v10.6c2.8-.2 5 .1 6.5 1.3 1.5-1.2 3.7-1.5 6.5-1.3V4.2C13.7 4 11.5 4.3 10 5.5zM10 5.5v10.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
            <span className="header-tool-word">Glossary</span>
        </AddButton>
    );

}
