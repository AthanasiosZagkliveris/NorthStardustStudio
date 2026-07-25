import logo from "../assets/logo.png";

import "../styles/app-header.css";

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