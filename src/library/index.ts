import type { AssetContract } from "./contract.ts";
import { labelArrow } from "./assets/labelArrow.ts";
import { plusBox } from "./assets/plusBox.ts";
import { infoNote } from "./assets/infoNote.ts";
import { removeX } from "./assets/removeX.ts";
import { rails } from "./assets/rails.ts";
import { backButton } from "./assets/backButton.ts";
import { foldArrow } from "./assets/foldArrow.ts";

/** Every asset of the library that has a contract. */
export const assets: readonly AssetContract[] = [labelArrow, plusBox, infoNote, removeX, rails, backButton, foldArrow];
