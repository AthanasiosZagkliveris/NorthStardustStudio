import TextBox from "./controls/TextBox.tsx";
interface CapabilityInputProps {

    value: string;

    onChange: (value: string) => void;

}

const popularCapabilities = [

    "Sales",
    "CRM",
    "Customer Success",
    "Client Onboarding",
    "Recruitment",
    "Service Delivery",
    "Partnership Management",
    "Change Management",
    "Risk Management",
    "Content Marketing"

];

export default function CapabilityInput({

    value,
    onChange

}: CapabilityInputProps) {

    return (

        <div className="capability-page">

            <div className="capability-content">

                <header className="capability-header">

                    <h1 className="capability-title">

                        Capability Generator

                    </h1>

                </header>

                <TextBox

                    className="capability-input"

                    aria-label="Capability to create"

                    value={value}

                    placeholder="What organizational capability would you like to create?"

                    onChange={(e) => onChange(e.target.value)}

                />

                <h2 className="section-title">

                    Popular Capabilities

                </h2>

                <div className="capability-chip-grid">

                    {popularCapabilities.map((capability) => (

                        <button

                            key={capability}

                            type="button"

                            className="capability-chip"

                            onClick={() => onChange(capability)}

                        >

                            {capability}

                        </button>

                    ))}

                </div>

            </div>

        </div>

    );

}