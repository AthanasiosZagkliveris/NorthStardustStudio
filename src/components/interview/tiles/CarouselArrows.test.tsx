import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useRef } from "react";

import { CarouselArrows } from "./CarouselArrows";

afterEach(() => {
    cleanup();
    document.querySelectorAll("[data-test-layer]").forEach(layer => layer.remove());
});

/** A layer with its carousel arrows, as a dialog or a floating card draws them. */
function Layer() {
    const target = useRef<HTMLDivElement | null>(null);
    return (
        <div data-carousel="">
            <div ref={target}>The layer</div>
            <CarouselArrows target={target} hue={200} step={{ what: "section", previous: () => undefined, next: () => undefined }} />
        </div>
    );
}

describe("only the topmost layer shows its carousel arrows", () => {

    it("hides a layer's arrows when a layer over it becomes a carousel after it is drawn (its step known later)", async () => {
        render(<Layer />);
        expect(await screen.findByRole("button", { name: /Previous section/ })).toBeTruthy();
        // A layer drawn over it, not yet a carousel: the arrows stay.
        const over = document.createElement("div");
        over.setAttribute("data-test-layer", "");
        document.body.appendChild(over);
        await new Promise(resolve => setTimeout(resolve, 20));
        expect(screen.queryByRole("button", { name: /Previous section/ })).toBeTruthy();
        // It becomes one: the layer under it hides its arrows.
        over.setAttribute("data-carousel", "");
        await waitFor(() => expect(screen.queryByRole("button", { name: /Previous section/ })).toBeNull());
        // And shows them again when it goes.
        over.remove();
        expect(await screen.findByRole("button", { name: /Previous section/ })).toBeTruthy();
    });

});
