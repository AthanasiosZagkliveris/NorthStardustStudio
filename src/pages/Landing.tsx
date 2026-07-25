console.log("Landing rendered");

import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";

import "../styles/global.css";
import "../styles/landing.css";

export default function Landing() {

    const navigate = useNavigate();
  return (
    <main className="landing">

      <img
        src={logo}
        alt="North Stardust Organization Framework"
        className="landing-logo"
      />

      <div className="landing-cards">

     <button
    className="landing-card"
    onClick={() => navigate("/assistant")}
>
    AI Assistant
</button>

<button
    className="landing-card"
    onClick={() => navigate("/generator")}
>
    Capability Generator
</button>

      </div>

    </main>
  );
}