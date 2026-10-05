import { useState } from "react";
import { useCareer } from "../../context/CareerContext.jsx";
import { TEAMS } from "../../data/teams.jsx";
import { CATEGORIES } from "../../data/categories.jsx";
import { CIRCUITS } from "../../data/circuits.jsx";
import { POST_RACE_EVENTS } from "../../data/events.jsx";
import { simulateRace } from "../../services/gameEngine.jsx";



function RaceModal({ onClose }) {
  const { state, dispatch } = useCareer();
  const currentTeam = TEAMS.find((t) => t.id === state.contract?.teamId);
  const currentCircuit = CIRCUITS.find((c) => c.id === state.season.currentRound) || CIRCUITS[0];

  const [phase, setPhase] = useState("TACTICS");
  const [raceResult, setRaceResult] = useState(null);

  // Probabilidad del 50% de que ocurra un evento aleatorio al terminar la carrera
  const [hasEventTriggered] = useState(() => Math.random() < 0.5);
  const [selectedEvent] = useState(() => {
    const randomIndex = Math.floor(Math.random() * POST_RACE_EVENTS.length);
    return POST_RACE_EVENTS[randomIndex];
  });
  const [selectedOption, setSelectedOption] = useState(null);

  const handleExecuteRace = (choice) => {
    const outcome = simulateRace({
      pilot: state.pilot,
      team: currentTeam,
      circuit: currentCircuit,
      tacticalChoice: choice
    });
    setRaceResult(outcome);
    setPhase("RESULTS");
  };

  const handleFinishRound = (optionEffects = null) => {
    dispatch({
      type: "COMPLETE_ROUND",
      payload: {
        userPosition: raceResult.position,
        circuitId: currentCircuit.id,
        eventEffects: optionEffects
      }
    });
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      zIndex: 1000
    }}>
      <div className="game-card" style={{ maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        
        {/* FASE 1: TÁCTICA */}
        {phase === "TACTICS" && (
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--accent-amber)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Ronda {state.season.currentRound} de {state.season.totalRounds}
            </span>
            <h2 style={{ fontSize: "1.5rem", marginTop: "0.25rem", marginBottom: "0.5rem" }}>
              🏁 {currentCircuit.name}
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
              Trazado: <strong>{currentCircuit.type}</strong> | Exigencia: <strong>Nivel {currentCircuit.difficulty}/5</strong>
            </p>

            <div style={{ backgroundColor: "var(--bg-accent)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", color: "var(--text-primary)" }}>Situación de Carrera:</h4>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                Faltan 4 vueltas para el final. Estás en un tren de monoplazas cerrado y se abre una oportunidad en la frenada de la horquilla. ¿Qué orden de pilotaje tomas?
              </p>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <button
                className="btn"
                onClick={() => handleExecuteRace("ATTACK")}
                style={{ padding: "0.85rem", backgroundColor: "#3f171c", color: "#f87171", borderColor: "#ef444455", textAlign: "left", justifyContent: "flex-start" }}
              >
                <div>
                  <strong>A — Tirarse agresivo al interior</strong>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Gran opción de escalar puestos, pero alto riesgo de trompo o toque.</div>
                </div>
              </button>

              <button
                className="btn"
                onClick={() => handleExecuteRace("PATIENT")}
                style={{ padding: "0.85rem", backgroundColor: "var(--bg-accent)", color: "var(--text-primary)", borderColor: "var(--border-subtle)", textAlign: "left", justifyContent: "flex-start" }}
              >
                <div>
                  <strong>B — Estudiar el hueco y preparar la salida</strong>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Equilibrio entre ritmo constante y cuidado de neumáticos.</div>
                </div>
              </button>

              <button
                className="btn"
                onClick={() => handleExecuteRace("DEFEND")}
                style={{ padding: "0.85rem", backgroundColor: "#062e24", color: "#34d399", borderColor: "#10b98155", textAlign: "left", justifyContent: "flex-start" }}
              >
                <div>
                  <strong>C — Proteger la posición actual</strong>
                  <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>Minimiza fallas mecánicas y asegura cruzar la línea de meta con puntos.</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* FASE 2: RESULTADOS DE META */}
        {phase === "RESULTS" && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "3rem" }}>
                {raceResult.position === 1 ? "🥇" : raceResult.position <= 3 ? "🏆" : "🏁"}
              </span>
              <h2 style={{ fontSize: "2rem", margin: "0.5rem 0 0.25rem 0" }}>
                Posición Final: P{raceResult.position}
              </h2>
              <p style={{ color: raceResult.incident ? "var(--accent-red)" : "var(--accent-emerald)", fontSize: "0.9rem", fontWeight: 600 }}>
                {raceResult.raceSummary}
              </p>
            </div>

            <div style={{ backgroundColor: "var(--bg-accent)", borderRadius: "var(--radius-sm)", padding: "1rem", marginBottom: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Top 5 de la Carrera
              </h4>
              {raceResult.competitors.slice(0, 5).map((comp, idx) => (
                <div
                  key={comp.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.35rem 0",
                    fontSize: "0.85rem",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color: comp.isUser ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: comp.isUser ? 700 : 400
                  }}
                >
                  <span>{idx + 1}. {comp.name} {comp.isUser && "(Tú)"}</span>
                  <span>{comp.incident ? "Incidente ⚠️" : "En Meta"}</span>
                </div>
              ))}
            </div>

            {/* Si el evento aleatorio se activó, continúa a la fase EVENT; si no, finaliza directamente */}
            {hasEventTriggered ? (
              <button
                className="btn btn-primary"
                onClick={() => setPhase("EVENT")}
                style={{ width: "100%", padding: "0.85rem" }}
              >
                Situación en Paddock / Prensa Detectada →
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={() => handleFinishRound(null)}
                style={{ width: "100%", padding: "0.85rem" }}
              >
                Jornada tranquila sin incidentes. Volver al Taller 🏁
              </button>
            )}
          </div>
        )}

        {/* FASE 3: EVENTO POST-CARRERA (Solo si hasEventTriggered === true) */}
        {phase === "EVENT" && (
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--accent-pink)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Evento de Fin de Semana
            </span>
            <h2 style={{ fontSize: "1.3rem", marginTop: "0.25rem", marginBottom: "0.5rem" }}>
              {selectedEvent.title}
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: "1.5rem" }}>
              {selectedEvent.description}
            </p>

            <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {selectedEvent.options.map((opt, i) => (
                <button
                  key={i}
                  className={`style-button ${selectedOption === opt ? "active" : ""}`}
                  onClick={() => setSelectedOption(opt)}
                  style={{ textAlign: "left", padding: "0.85rem", fontSize: "0.85rem" }}
                >
                  {opt.text}
                </button>
              ))}
            </div>

            {selectedOption && (
              <div style={{ padding: "0.85rem", backgroundColor: "var(--bg-accent)", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", borderLeft: "4px solid var(--accent-blue)" }}>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                  💡 {selectedOption.feedback}
                </p>
              </div>
            )}

            <button
              className="btn btn-success"
              onClick={() => handleFinishRound(selectedOption ? selectedOption.effects : null)}
              disabled={!selectedOption}
              style={{
                width: "100%",
                padding: "0.85rem",
                opacity: selectedOption ? 1 : 0.4,
                cursor: selectedOption ? "pointer" : "not-allowed"
              }}
            >
              Guardar Resultados y Volver al Taller 🏁
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default RaceModal;