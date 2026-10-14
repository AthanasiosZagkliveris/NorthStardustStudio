import type { ComponentType } from "react";
import type { AssetContract } from "../contract";
import LabelArrowSamples from "./LabelArrowSamples";
import PlusBoxSamples from "./PlusBoxSamples";
import InfoNoteSamples from "./InfoNoteSamples";

/** How the gallery draws each asset, by the asset's name in its contract. */
export const galleries: Record<string, ComponentType<{ asset: AssetContract }>> = {
    "Label arrow": LabelArrowSamples,
    "Plus box": PlusBoxSamples,
    "Info note": InfoNoteSamples
};
