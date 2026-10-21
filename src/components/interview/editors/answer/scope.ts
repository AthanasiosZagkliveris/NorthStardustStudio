import type { AnswerRendererProps } from "./shared.tsx";
import type { useAnswerState } from "./useAnswerState.tsx";

/** What a part of the renderer gets: the props as SingleAnswerRenderer holds them once their defaults are applied, and what its state part worked out. */
export type AnswerProps = Omit<AnswerRendererProps, "disabled" | "organisationCurrency" | "showInstructions"> & Required<Pick<AnswerRendererProps, "disabled" | "organisationCurrency" | "showInstructions">>;
export type AnswerScope = AnswerProps & ReturnType<typeof useAnswerState>;
