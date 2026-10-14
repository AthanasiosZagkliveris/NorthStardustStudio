import type { AssetContract } from "./contract.ts";
import { labelArrow } from "./assets/labelArrow.ts";
import { plusBox } from "./assets/plusBox.ts";
import { infoNote } from "./assets/infoNote.ts";
import { removeX } from "./assets/removeX.ts";

/** Every asset of the library that has a contract. */
export const assets: readonly AssetContract[] = [labelArrow, plusBox, infoNote, removeX];
