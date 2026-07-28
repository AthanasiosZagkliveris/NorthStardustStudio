import logo from "../assets/logo.png";

import "../styles/app-header.css";

/**
 * The app header only ever shows the logo unless
 * explicitly asked for something more -- any other
 * controls (e.g. the date format preference) live
 * where they're actually used instead.
 */
export default function AppHeader() {

    return (

        <header className="app-header">

            <img
                src={logo}
                alt="North Stardust Organization Framework"
                className="app-logo"
            />

        </header>

    );

}
