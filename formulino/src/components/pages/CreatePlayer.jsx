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
        description: "Busca huecos imposibles y adelanta rápido, pero arriesga roturas o toques.",
        stats: { performance: 62, consistency: 45, mentality: 50, technicalFeedback: 45, risk: 75 },
        popularity: 40,
        reputation: 30,
        budget: 6000
    },
    Consistente: {
        description: "Rara vez comete errores. Gestiona bien los neumáticos y suma puntos siempre.",
        stats: { performance: 52, consistency: 65, mentality: 60, technicalFeedback: 55, risk: 35 },
        popularity: 25,
        reputation: 40,
        budget: 7000
    },
    Técnico: {
        description: "Gran capacidad para comunicar cambios a los mecánicos y evolucionar el chasis.",
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

    // Equipos del primer nivel jerárquico (Karting Nacional)
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
        if (!selectedTeamId) {
            alert("Por favor selecciona un equipo para iniciar tu carrera.");
            return;
        }

      const newPilot = {
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
      };

      dispatch({
        type: "INIT_CAREER",
        payload: {
          pilot: newPilot,
          teamId: selectedTeamId
        }
      });
    };

return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem" }}>
      <header style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🏎️ Formulino</h1>
        <p style={{ color: "#6b7280" }}>
          {step === 1 ? "Paso 1: Configura la ficha de tu piloto (16 años)" : "Paso 2: Elige tu equipo de Karting Nacional"}
        </p>
      </header>

      {step === 1 && (
        <form onSubmit={handleNextStep} style={{ display: "grid", gap: "1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Nombre</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Ej. Salvador"
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                placeholder="Ej. García"
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>País</label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Dorsal / Número</label>
              <input
                type="number"
                name="number"
                min="1"
                max="99"
                value={formData.number}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Género</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="NB">No Binario</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: "0.25rem" }}>Estilo de Conducción</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.5rem" }}>
              {Object.keys(DRIVING_STYLES).map((style) => (
                <button
                  type="button"
                  key={style}
                  onClick={() => setFormData((prev) => ({ ...prev, drivingStyle: style }))}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "6px",
                    border: formData.drivingStyle === style ? "2px solid #2563eb" : "1px solid #ccc",
                    backgroundColor: formData.drivingStyle === style ? "#eff6ff" : "#fff",
                    cursor: "pointer",
                    fontWeight: 600
                  }}
                >
                  {style}
                </button>
              ))}
            </div>
            <p style={{ fontSize: "0.85rem", color: "#555", marginTop: "0.5rem" }}>
              {currentStyleConfig.description}
            </p>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "1rem", backgroundColor: "#f9fafb" }}>
            <h4 style={{ margin: "0 0 0.5rem 0" }}>Atributos iniciales calculados:</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
              <StatBar label="Rendimiento" value={currentStyleConfig.stats.performance} />
              <StatBar label="Consistencia" value={currentStyleConfig.stats.consistency} />
              <StatBar label="Mentalidad" value={currentStyleConfig.stats.mentality} />
              <StatBar label="Feedback Técnico" value={currentStyleConfig.stats.technicalFeedback} />
              <StatBar label="Agresividad / Riesgo" value={currentStyleConfig.stats.risk} color="#f59e0b" />
              <StatBar label="Popularidad" value={currentStyleConfig.popularity} color="#ec4899" />
            </div>
          </div>

          <button
            type="submit"
            style={{
              padding: "0.8rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "#2563eb",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Continuar a Selección de Equipo →
          </button>
        </form>
      )}

      {step === 2 && (
        <div>
          <button
            type="button"
            onClick={() => setStep(1)}
            style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", marginBottom: "1rem" }}
          >
            ← Volver a modificar piloto
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
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
            style={{
              width: "100%",
              padding: "0.9rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: selectedTeamId ? "#16a34a" : "#9ca3af",
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: selectedTeamId ? "pointer" : "not-allowed"
            }}
          >
            Comenzar Temporada de Karting Nacional 🏁
          </button>
        </div>
      )}
    </div>
  );

};

export default CreatePlayer;
