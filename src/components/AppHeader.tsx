import { useEffect, useState } from "react";

import logo from "../assets/logo.png";

import { DateFormat, PreferencesService } from "../services/PreferencesService.ts";

import "../styles/app-header.css";

export default function AppHeader() {

    const [dateFormat, setDateFormat] = useState<DateFormat>(PreferencesService.getDateFormat());

    useEffect(() => {

        return PreferencesService.subscribe(() => {
            setDateFormat(PreferencesService.getDateFormat());
        });

    }, []);

    return (

        <header className="app-header">

            <img
                src={logo}
                alt="North Stardust Organization Framework"
                className="app-logo"
            />

            <div className="app-header-actions">

                <button
                    type="button"
                    className="date-format-toggle"
                    title="Switch between US (MM/DD/YYYY) and EU (DD/MM/YYYY) date presentation"
                    onClick={() => PreferencesService.toggleDateFormat()}
                >
                    {dateFormat === "US" ? "Dates: MM/DD/YYYY" : "Dates: DD/MM/YYYY"}
                </button>

            </div>

        </header>

    );

}
