import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";

import UndoToast, { UNDO_TIME } from "./UndoToast";
import { offerRemovalUndo, UndoService } from "../services/UndoService";
import { useRemovalMarks } from "./interview/cards/removalMarks";

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    cleanup();
    UndoService.dismiss();
    UndoService.takeRemoval();
    vi.useRealTimers();
});

describe("the undo toast", () => {

    it("says what was removed, politely, with an Undo button that undoes it", () => {
        const undo = vi.fn();
        const { container } = render(<UndoToast />);
        expect(container.querySelector("[aria-live=polite]")).toBeTruthy();

        act(() => UndoService.offer("Profile 1 removed.", undo));
        expect(screen.getByText("Profile 1 removed.")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Undo" }));
        expect(undo).toHaveBeenCalledTimes(1);
        expect(screen.queryByText("Profile 1 removed.")).toBeNull();
    });

    it("goes after ten seconds, the removal final; the time stops while it is hovered", () => {
        const undo = vi.fn();
        render(<UndoToast />);
        act(() => UndoService.offer("Goal 2 removed.", undo));

        act(() => { vi.advanceTimersByTime(4000); });
        fireEvent.mouseEnter(screen.getByText("Goal 2 removed.").parentElement!);
        act(() => { vi.advanceTimersByTime(30_000); });
        expect(screen.getByText("Goal 2 removed.")).toBeTruthy();

        fireEvent.mouseLeave(screen.getByText("Goal 2 removed.").parentElement!);
        act(() => { vi.advanceTimersByTime(UNDO_TIME - 4000 - 100); });
        expect(screen.getByText("Goal 2 removed.")).toBeTruthy();
        act(() => { vi.advanceTimersByTime(200); });
        expect(screen.queryByText("Goal 2 removed.")).toBeNull();
        expect(undo).not.toHaveBeenCalled();
    });

    it("stops too while it holds the focus", () => {
        render(<UndoToast />);
        act(() => UndoService.offer("Founder 2 removed.", () => undefined));
        act(() => { screen.getByRole("button", { name: "Undo" }).focus(); });
        act(() => { vi.advanceTimersByTime(UNDO_TIME * 2); });
        expect(screen.getByText("Founder 2 removed.")).toBeTruthy();
    });

    it("undoes on Ctrl+Z (or ⌘Z) while it shows, but not inside a text field", () => {
        const undo = vi.fn();
        render(<><textarea aria-label="Notes" /><UndoToast /></>);
        act(() => UndoService.offer("Offering 1 removed.", undo));

        fireEvent.keyDown(screen.getByRole("textbox", { name: "Notes" }), { key: "z", ctrlKey: true });
        expect(undo).not.toHaveBeenCalled();

        fireEvent.keyDown(document.body, { key: "z", metaKey: true });
        expect(undo).toHaveBeenCalledTimes(1);
        expect(screen.queryByText("Offering 1 removed.")).toBeNull();

        // Nothing to undo now: Ctrl+Z does nothing more.
        fireEvent.keyDown(document.body, { key: "z", ctrlKey: true });
        expect(undo).toHaveBeenCalledTimes(1);
    });

    it("shows one offer at a time: a new removal replaces it, and the last is final", () => {
        const first = vi.fn();
        const second = vi.fn();
        render(<UndoToast />);
        act(() => UndoService.offer("Cost 1 removed.", first));
        act(() => UndoService.offer("Cost 2 removed.", second));
        expect(screen.queryByText("Cost 1 removed.")).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Undo" }));
        expect(second).toHaveBeenCalled();
        expect(first).not.toHaveBeenCalled();
    });

});

describe("offering to undo a removal on a page", () => {

    const before = { profiles: [{ id: "p1", name: "Anna" }, { id: "p2", name: "Ben" }] };
    const after = { profiles: [{ id: "p1", name: "Anna" }] };

    it("offers it only for a marked removal of something written, and puts it back into the page as it is then", () => {
        let stored: unknown = after;
        offerRemovalUndo(before, after, () => stored, value => { stored = value; });
        expect(UndoService.current()).toBeNull();

        UndoService.markRemoval("profile 2");
        offerRemovalUndo(before, after, () => stored, value => { stored = value; });
        expect(UndoService.current()?.message).toBe("Profile 2 removed.");

        stored = { profiles: [{ id: "p1", name: "Annie" }] };
        UndoService.undo();
        expect(stored).toEqual({ profiles: [{ id: "p1", name: "Annie" }, { id: "p2", name: "Ben" }] });
    });

    it("offers nothing for an empty row removed", () => {
        UndoService.markRemoval("Profile 2");
        offerRemovalUndo({ profiles: [{ id: "p1", name: "" }] }, { profiles: [] }, () => null, () => undefined);
        expect(UndoService.current()).toBeNull();
    });

    it("marks every × named Remove on the page, and Delete on a movable box", () => {
        function Page() {
            const root = useRef<HTMLDivElement | null>(null);
            useRemovalMarks(root);
            return (
                <div ref={root}>
                    <button type="button" aria-label="Remove this Offering">×</button>
                    <button type="button" aria-label="Maximize Offering 1">+</button>
                    <div tabIndex={0} role="group" aria-label="Goal 1. Use the arrow keys to move it, Delete to remove it." />
                </div>
            );
        }
        render(<Page />);
        fireEvent.click(screen.getByRole("button", { name: "Remove this Offering" }));
        expect(UndoService.takeRemoval()).toBe("Offering");
        fireEvent.click(screen.getByRole("button", { name: "Maximize Offering 1" }));
        expect(UndoService.takeRemoval()).toBeNull();
        fireEvent.keyDown(screen.getByRole("group"), { key: "Delete" });
        expect(UndoService.takeRemoval()).toBe("Goal 1");
        // A mark is for the moment it was made.
        UndoService.markRemoval("Goal 1");
        act(() => { vi.advanceTimersByTime(5000); });
        expect(UndoService.takeRemoval()).toBeNull();
    });

});
