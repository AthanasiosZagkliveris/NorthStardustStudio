import { useSyncExternalStore } from "react";
import { NotepadService } from "../../services/NotepadService";

/* The Notes tool's notes and view (NotepadService.ts), in a file of its own so the Menu (ToolsMenu.tsx) counts the notes without
   bringing the Notes panel into every page's first load. */

/** The notepad's notes and view, kept current. */
export function useNotepad() {
    const version = useSyncExternalStore(
        NotepadService.subscribe,
        () => NotepadService.notes().length + ":" + JSON.stringify(NotepadService.view()) + ":" + NotepadService.notes().map(note => note.text.length + "/" + note.links.length + "/" + (note.date ?? "")).join(",")
    );
    void version;
    return { notes: NotepadService.notes(), view: NotepadService.view() };
}
