import { Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import SystemSelection from "./pages/SystemSelection";
import Conversation from "./pages/Conversation";
import CapabilityGenerator from "./pages/CapabilityGenerator";

export default function App() {

    return (

        <Routes>

            <Route
                path="/"
                element={<Landing />}
            />

            <Route
                path="/assistant"
                element={<SystemSelection />}
            />

            <Route
                path="/introduction"
                element={<Conversation />}
            />

            <Route
                path="/conversation"
                element={<Conversation />}
            />

            <Route
                path="/generator"
                element={<CapabilityGenerator />}
            />

        </Routes>

    );

}
