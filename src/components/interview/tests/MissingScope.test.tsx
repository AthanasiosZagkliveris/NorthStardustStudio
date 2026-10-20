import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { freshCards } from "../cards/freshCards.ts";
import { MissingScope } from "../cards/BusinessCardFields.tsx";

afterEach(() => freshCards.remove("card-1"));

describe("a card's fields show what it lacks exactly when its tile flashes", () => {

    it("shows what a card lacks, its Name included, once it is not a card just made", () => {
        render(<MissingScope lacking={["Name", "Price"]} cardId="card-1">{(shown) => <p>{shown.join(",")}</p>}</MissingScope>);
        expect(screen.getByText("Name,Price")).toBeTruthy();
    });

    it("is quiet while the card is a card just made and still open, and speaks when it is closed", () => {
        freshCards.add("card-1");
        const view = render(<MissingScope lacking={["Name", "Price"]} cardId="card-1">{(shown) => <p>{"[" + shown.join(",") + "]"}</p>}</MissingScope>);
        expect(screen.getByText("[]")).toBeTruthy();
        freshCards.remove("card-1");
        view.rerender(<MissingScope lacking={["Name", "Price"]} cardId="card-1">{(shown) => <p>{"[" + shown.join(",") + "]"}</p>}</MissingScope>);
        expect(screen.getByText("[Name,Price]")).toBeTruthy();
    });

});
