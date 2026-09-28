import logo from "../assets/NORTH STARDUST Organization Framework.svg";

import ThemeSwitch from "./ThemeSwitch";

import "../styles/app-header.css";

interface AppHeaderProps {
    /**
     * The active Organization's name -- shown on the
     * opposite side of the header from the logo, on every
     * page that has one selected (System Selection,
     * Introduction, Interview). Omitted entirely (e.g. on
     * the Landing page, where there may be several
     * Organizations and none is "the" one yet) the header
     * renders exactly as before, logo only.
     */
    organizationName?: string;
}

export default function AppHeader({ organizationName }: AppHeaderProps) {

    return (

        <header className="app-header">

            <img
                src={logo}
                alt="North Stardust Organization Framework"
                className="app-logo"
            />

            <ThemeSwitch />

            {organizationName && (
                <h1 className="app-header-organization-name" title={organizationName}>
                    {organizationName}
                </h1>
            )}

        </header>

    );

}
