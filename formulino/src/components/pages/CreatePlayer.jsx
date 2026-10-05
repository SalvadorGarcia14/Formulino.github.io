import { useState } from "react";
import { useCareer } from "../context/CareerContext";
import { TEAMS } from "../data/teams";
import StatBar from "../componentes/StatBar/StatBar";
import TeamCard from "../componentes/TeamCard/TeamCard";

const DRIVING_STYLES = {
    Equilibrado: {
        description: "Piloto versátil sin fallas graves ni ventajas extremas.",
        stats: { performance: 55, consistency: 55, mentality: 55, technicalFeedback: 50, risk: 50 },
        popularity: 30,
        reputation: 35,
        budget: 8000
    },
    Agresivo: {
        description: "Busca huecos imposibles y adelanta rápido; mayor riesgo mecánico o penalizaciones.",
        stats: { performance: 62, consistency: 45, mentality: 50, technicalFeedback: 45, risk: 75 },
        popularity: 40,
        reputation: 30,
        budget: 6000
    },
    Consistente: {
        description: "Rara vez comete errores. Trata bien el material y suma puntos de forma regular.",
        stats: { performance: 52, consistency: 65, mentality: 60, technicalFeedback: 55, risk: 35 },
        popularity: 25,
        reputation: 40,
        budget: 7000
    },
    Técnico: {
        description: "Excelente sensibilidad mecánica para evolucionar el setup junto a los ingenieros.",
        stats: { performance: 50, consistency: 58, mentality: 55, technicalFeedback: 70, risk: 40 },
        popularity: 20,
        reputation: 45,
        budget: 9000
    }
};


function CreatePlayer() {
    const { dispatch } = useCareer();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        nationality: "Argentina",
        number: 7,
        gender: "M",
        drivingStyle: "Equilibrado"
    });

    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const tier1Teams = TEAMS.filter((t) => t.categoryId === 1);
    const currentStyleConfig = DRIVING_STYLES[formData.drivingStyle];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "number" ? Number(value) : value
        }));
    };

    const handleNextStep = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.lastName.trim()) {
            alert("Por favor completa nombre y apellido.");
            return;
        }
        setStep(2);
    };

    const handleStartCareer = () => {
        if (!selectedTeamId) return;

        dispatch({
            type: "INIT_CAREER",
            payload: {
                pilot: {
                    name: formData.name.trim(),
                    lastName: formData.lastName.trim(),
                    nationality: formData.nationality,
                    number: formData.number,
                    age: 16,
                    gender: formData.gender,
                    drivingStyle: formData.drivingStyle,
                    stats: { ...currentStyleConfig.stats },
                    popularity: currentStyleConfig.popularity,
                    reputation: currentStyleConfig.reputation,
                    budget: currentStyleConfig.budget,
                    isRetired: false
                },
                teamId: selectedTeamId
            }
        });
    };

    return (
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
            <header style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <h1 style={{ fontFamily: "Teko, sans-serif", fontSize: "3.5rem", letterSpacing: "2px", textTransform: "uppercase", margin: 0, lineHeight: 1 }}>
                    🏎️ FORMULINO
                </h1>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginTop: "0.5rem" }}>
                    {step === 1 ? "Paso 1: Configura la ficha técnica del piloto" : "Paso 2: Elige tu equipo de Karting Nacional"}
                </p>
            </header>

            {step === 1 && (
                <form onSubmit={handleNextStep} className="game-card" style={{ display: "grid", gap: "1.5rem" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                        <div className="form-group">
                            <label className="form-label">Nombre</label>
                            <input className="form-input" type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Salvador" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Apellido</label>
                            <input className="form-input" type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required placeholder="García" />
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.25rem" }}>
                        <div className="form-group">
                            <label className="form-label">País / Bandera</label>
                            <input className="form-input" type="text" name="nationality" value={formData.nationality} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Dorsal</label>
                            <input className="form-input" type="number" name="number" min="1" max="99" value={formData.number} onChange={handleInputChange} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Género</label>
                            <select className="form-select" name="gender" value={formData.gender} onChange={handleInputChange}>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                                <option value="NB">No Binario</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Estilo de Conducción</label>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "0.75rem", marginBottom: "0.75rem" }}>
                            {Object.keys(DRIVING_STYLES).map((style) => (
                                <button
                                    type="button"
                                    key={style}
                                    className={`style-button ${formData.drivingStyle === style ? "active" : ""}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, drivingStyle: style }))}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                            {currentStyleConfig.description}
                        </p>
                    </div>

                    <div style={{ background: "var(--bg-accent)", borderRadius: "var(--radius-sm)", padding: "1.25rem", border: "1px solid var(--border-subtle)" }}>
                        <h4 style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem" }}>
                            Atributos de Salida
                        </h4>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <StatBar label="Rendimiento" value={currentStyleConfig.stats.performance} />
                            <StatBar label="Consistencia" value={currentStyleConfig.stats.consistency} />
                            <StatBar label="Mentalidad" value={currentStyleConfig.stats.mentality} />
                            <StatBar label="Feedback Técnico" value={currentStyleConfig.stats.technicalFeedback} />
                            <StatBar label="Agresividad / Riesgo" value={currentStyleConfig.stats.risk} color="var(--accent-amber)" />
                            <StatBar label="Popularidad Inicial" value={currentStyleConfig.popularity} color="var(--accent-pink)" />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ padding: "0.85rem", fontSize: "1rem" }}>
                        Continuar a Selección de Equipo →
                    </button>
                </form>
            )}

            {step === 2 && (
                <div>
                    <button
                        type="button"
                        className="btn"
                        onClick={() => setStep(1)}
                        style={{ background: "none", color: "var(--text-secondary)", marginBottom: "1.5rem", padding: "0.25rem 0.5rem" }}
                    >
                        ← Volver a ficha de piloto
                    </button>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
                        {tier1Teams.map((team) => (
                            <TeamCard
                                key={team.id}
                                team={team}
                                isSelected={selectedTeamId === team.id}
                                onSelect={setSelectedTeamId}
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleStartCareer}
                        disabled={!selectedTeamId}
                        className={`btn ${selectedTeamId ? "btn-success" : ""}`}
                        style={{
                            width: "100%",
                            padding: "1rem",
                            fontSize: "1.1rem",
                            opacity: selectedTeamId ? 1 : 0.4,
                            cursor: selectedTeamId ? "pointer" : "not-allowed"
                        }}
                    >
                        Comenzar Temporada de Karting Nacional 🏁
                    </button>
                </div>
            )}
        </div>
    );
}

export default CreatePlayer;
