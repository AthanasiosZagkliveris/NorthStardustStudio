import { lazy, useState, type ComponentType } from "react";

/**
 * THE PAGE EDITORS, LOADED WHEN NEEDED (owner, 2026-11-11, the folder report's item 2): the big editors of the Business, Financial, Brand,
 * Strategy and Operations pages are their own pieces of the built app, so opening the interview does not load them all. A page's editor
 * is fetched the first time it draws (AnswerRenderer holds the Suspense); `preloadPageEditors` fetches them all at once (the interview calls
 * it when the browser is idle, so a page seldom waits; the tests call it before they run). Once fetched, an editor draws at once.
 */
type Loader = () => Promise<{ default: ComponentType<never> }>;

const loaders: Loader[] = [];

function pageEditor<P>(load: () => Promise<{ default: ComponentType<P> }>): ComponentType<P> {
    let loaded: ComponentType<P> | null = null;
    const fetch = () => load().then(module => { loaded = module.default; return module; });
    loaders.push(fetch as unknown as Loader);
    const Lazy = lazy(fetch);
    const Editor = (props: P & object) => {
        // (Chosen once per editor drawn: switching from the lazy one to the loaded one later would draw the editor afresh and lose its state.)
        const [Drawn] = useState<ComponentType<P>>(() => loaded ?? Lazy);
        return <Drawn {...props} />;
    };
    return Editor as ComponentType<P>;
}

export function preloadPageEditors(): Promise<unknown> {
    return Promise.all(loaders.map(load => load()));
}

export const BrandStyleEditor = pageEditor(() => import("../BrandStyleEditor.tsx"));
export const BusinessCapabilityEditor = pageEditor(() => import("../BusinessCapabilityEditor.tsx"));
export const BusinessEngagementEditor = pageEditor(() => import("../BusinessEngagementEditor.tsx"));
export const BusinessFoundationEditor = pageEditor(() => import("../BusinessFoundationEditor.tsx"));
export const FinancialFoundationEditor = pageEditor(() => import("../FinancialFoundationEditor.tsx"));
export const FinancialSustainabilityEditor = pageEditor(() => import("../FinancialSustainabilityEditor.tsx"));
export const FoundersProfileEditor = pageEditor(() => import("../FoundersProfileEditor.tsx"));
export const BrandInventoryEditor = pageEditor(() => import("../BrandInventoryEditor.tsx"));
export const ProcessLibraryEditor = pageEditor(() => import("../ProcessLibraryEditor.tsx"));
export const OperationalLogEditor = pageEditor(() => import("../OperationalLogEditor.tsx"));
export const RolesResponsibilitiesEditor = pageEditor(() => import("../RolesResponsibilitiesEditor.tsx"));
export const StrategyFoundationEditor = pageEditor(() => import("../StrategyFoundationEditor.tsx"));
export const StrategicPeriodEditor = pageEditor(() => import("../StrategicPeriodEditor.tsx"));
export const StrategicRoadmapEditor = pageEditor(() => import("../StrategicRoadmapEditor.tsx"));
