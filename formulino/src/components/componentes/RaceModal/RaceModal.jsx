import { useState, useEffect } from "react";
import { useCareer } from "../../context/CareerContext.jsx";
import { TEAMS } from "../../data/teams.jsx";
import { CATEGORIES } from "../../data/categories.jsx";
import { CIRCUITS } from "../../data/circuits.jsx";
import { QUESTS } from "../../data/quests.jsx";
import { POST_RACE_EVENTS } from "../../data/events.jsx";
import { simulateRace, generateRaceCondition } from "../../services/gameEngine.jsx";

function RaceModal({ onClose }) {
  const { state, dispatch } = useCareer();
  const currentTeam = TEAMS.find((t) => t.id === state.contract?.teamId);
  const currentCircuit = CIRCUITS.find((c) => c.id === state.season.currentRound) || CIRCUITS[0];

  // La fase inicial ahora es PREPARATION
  const [phase, setPhase] = useState("PREPARATION");
  const [raceResult, setRaceResult] = useState(null);
  const [raceCondition, setRaceCondition] = useState(null);
  const [currentQuest, setCurrentQuest] = useState(null);

  useEffect(() => {
    setRaceCondition(generateRaceCondition());
    
    // Seleccionar una misión aleatoria
    let randomQuest = QUESTS[Math.floor(Math.random() * QUESTS.length)];
    // Evitar la misión del Némesis si es la primera carrera y aún no tienes uno
    if (randomQuest.type === 'BEAT_NEMESIS' && !state.season.nemesis) {
      randomQuest = QUESTS.find(q => q.type === 'CLEAN_RACE') || QUESTS[0];
    }
    setCurrentQuest(randomQuest);
  }, [state.season.nemesis]);

  const [hasEventTriggered] = useState(() => Math.random() < 0.5);
  const [selectedEvent] = useState(() => {
    const randomIndex = Math.floor(Math.random() * POST_RACE_EVENTS.length);
    return POST_RACE_EVENTS[randomIndex];
  });
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAcceptQuest = () => {
    dispatch({ type: "ACCEPT_QUEST", payload: currentQuest });
    setPhase("TACTICS");
  };

  const handleExecuteRace = (choice) => {
    const outcome = simulateRace({
      pilot: state.pilot,
      team: currentTeam,
      circuit: currentCircuit,
      tacticalChoice: choice,
      condition: raceCondition
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
        eventEffects: optionEffects,
        competitors: raceResult.competitors,
        incident: raceResult.incident // Enviamos el estado de incidente para procesar la misión CLEAN_RACE
      }
    });
    onClose();
  };

  if (!raceCondition || !currentQuest) return null; 

  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "1rem", zIndex: 1000
    }}>
      <div className="game-card" style={{ maxWidth: "600px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>

        {/* FASE 0: PREPARATION (Micro-Objetivo) */}
        {phase === "PREPARATION" && (
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Reunión de Estrategia Pre-Carrera
            </span>
            <h2 style={{ fontSize: "1.5rem", marginTop: "0.25rem", marginBottom: "0.5rem" }}>
              🎯 Objetivo: {currentQuest.title}
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1.5rem", lineHeight: 1.4 }}>
              {currentQuest.description}
            </p>

            <div style={{ backgroundColor: "var(--bg-accent)", padding: "1rem", borderRadius: "var(--radius-sm)", marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>RECOMPENSA SI CUMPLES:</span>
                {currentQuest.reward.budget && <div style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>+${currentQuest.reward.budget}</div>}
                {currentQuest.reward.rep && <div style={{ color: "var(--accent-blue)" }}>+{currentQuest.reward.rep} Reputación</div>}
                {currentQuest.reward.pop && <div style={{ color: "var(--accent-pink)" }}>+{currentQuest.reward.pop} Popularidad</div>}
                {currentQuest.reward.teamRelationship && <div style={{ color: "var(--accent-emerald)" }}>+{currentQuest.reward.teamRelationship} Relación Eq.</div>}
              </div>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>CASTIGO SI FALLAS:</span>
                {currentQuest.penalty.rep && <div style={{ color: "var(--accent-red)" }}>{currentQuest.penalty.rep} Reputación</div>}
                {currentQuest.penalty.pop && <div style={{ color: "var(--accent-red)" }}>{currentQuest.penalty.pop} Popularidad</div>}
                {currentQuest.penalty.teamRelationship && <div style={{ color: "var(--accent-red)" }}>{currentQuest.penalty.teamRelationship} Relación Eq.</div>}
              </div>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <button className="btn btn-primary" onClick={handleAcceptQuest} style={{ padding: "0.85rem", width: "100%" }}>
                Aceptar Promesa e ir a la Parrilla 🚦
              </button>
              <button className="btn" onClick={() => setPhase("TACTICS")} style={{ padding: "0.85rem", backgroundColor: "transparent", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)", width: "100%" }}>
                Rechazar (Ir directo a la carrera)
              </button>
            </div>
          </div>
        )}

        {/* FASE 1: TÁCTICA */}
        {phase === "TACTICS" && (
          <div className="fade-in-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "var(--accent-amber)", textTransform: "uppercase", letterSpacing: "2px", fontWeight: 700 }}>
                  Ronda {state.season.currentRound} / {state.season.totalRounds}
                </span>
                <h2 style={{ fontSize: "2rem", margin: "0.25rem 0", textTransform: "uppercase" }}>
                  🏁 {currentCircuit.name}
                </h2>
              </div>
              <div style={{ textAlign: "right", padding: "0.5rem 1rem", background: "var(--bg-card)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Nivel Exigencia</div>
                <div className="telemetry-text" style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>{currentCircuit.difficulty}/5</div>
              </div>
            </div>

            {/* Mantenido de tu código original para no perder la visualización de la misión */}
            {state.season.activeQuest && (
               <div style={{ marginBottom: "1.5rem", padding: "0.75rem", backgroundColor: "rgba(59, 130, 246, 0.15)", borderLeft: "4px solid var(--accent-blue)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                 📌 <strong>Objetivo activo:</strong> {state.season.activeQuest.title}
               </div>
            )}

            {/* Panel Climático tipo Telemetría */}
            <div className="glass-panel" style={{ 
              padding: "1.25rem", marginBottom: "2rem",
              borderLeft: `4px solid ${raceCondition.type === "RAIN" ? "var(--accent-blue)" : raceCondition.type === "HOT" ? "var(--accent-amber)" : "var(--accent-emerald)"}`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                <span className={`status-dot ${raceCondition.type === "NORMAL" ? "status-active" : "status-warning"}`}></span>
                <h4 style={{ margin: 0, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-primary)" }}>
                  Clima: {raceCondition.label}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>{raceCondition.description}</p>
            </div>

            <h4 style={{ margin: "0 0 1rem 0", color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.85rem" }}>
              Selecciona tu mapa de motor (Táctica):
            </h4>

            <div style={{ display: "grid", gap: "1rem" }}>
              <button className="btn-tactical attack" onClick={() => handleExecuteRace("ATTACK")}>
                <strong style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "#f87171" }}>A — MODO ATAQUE (Push)</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>Ritmo de clasificación constante. Degrada la goma críticamente y aumenta el riesgo de sobrecalentamiento.</div>
              </button>

              <button className="btn-tactical" onClick={() => handleExecuteRace("PATIENT")}>
                <strong style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>B — MODO EQUILIBRADO (Balance)</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>Gestión estándar. Cuida la mecánica mientras mantiene el delta de tiempo con el piloto de adelante.</div>
              </button>

              <button className="btn-tactical defend" onClick={() => handleExecuteRace("DEFEND")}>
                <strong style={{ fontSize: "1.1rem", marginBottom: "0.25rem", color: "#34d399" }}>C — MODO DEFENSA (Save)</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>Levantar y rodar (*lift and coast*). Cede tiempo por vuelta para garantizar que el auto cruce la meta ileso.</div>
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
                <div key={comp.name}
                  style={{
                    display: "flex", justifyContent: "space-between", padding: "0.35rem 0", fontSize: "0.85rem",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    color: comp.isUser ? "var(--accent-blue)" : "var(--text-secondary)",
                    fontWeight: comp.isUser ? 700 : 400
                  }}>
                  <span>{idx + 1}. {comp.name} {comp.isUser && "(Tú)"}</span>
                  <span>{comp.incident ? "Incidente ⚠️" : "En Meta"}</span>
                </div>
              ))}
            </div>

            {hasEventTriggered ? (
              <button className="btn btn-primary" onClick={() => setPhase("EVENT")} style={{ width: "100%", padding: "0.85rem" }}>
                Situación en Paddock Detectada →
              </button>
            ) : (
              <button className="btn btn-success" onClick={() => handleFinishRound(null)} style={{ width: "100%", padding: "0.85rem" }}>
                Jornada terminada. Volver al Taller 🏁
              </button>
            )}
          </div>
        )}

        {/* FASE 3: EVENTO POST-CARRERA */}
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
                <button key={i} className={`style-button ${selectedOption === opt ? "active" : ""}`}
                  onClick={() => setSelectedOption(opt)} style={{ textAlign: "left", padding: "0.85rem", fontSize: "0.85rem" }}>
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

            <button className="btn btn-success" onClick={() => handleFinishRound(selectedOption ? selectedOption.effects : null)}
              disabled={!selectedOption}
              style={{ width: "100%", padding: "0.85rem", opacity: selectedOption ? 1 : 0.4, cursor: selectedOption ? "pointer" : "not-allowed" }}>
              Guardar Resultados y Volver al Taller 🏁
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RaceModal;