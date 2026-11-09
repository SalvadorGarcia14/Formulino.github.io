import { useState, useMemo } from "react";
import { useCareer } from "../../context/CareerContext.jsx";
import { TEAMS } from "../../data/teams.jsx";
import { CIRCUITS } from "../../data/circuits.jsx";
import { QUESTS } from "../../data/quests.jsx";
import { POST_RACE_EVENTS } from "../../data/events.jsx";
import {
  resolveNemesisName,
  isNamedDriver,
  F1_ELITE_RIVALS
} from "../../data/initialPilotStats.jsx";
import { simulateRace, generateRaceCondition } from "../../services/gameEngine.jsx";

function RaceModal({ onClose }) {
  // BLOQUE 1: Extracción de contexto y búsqueda memorizada de entidades
  const { state, dispatch } = useCareer();

  const currentTeam = useMemo(
    () => TEAMS.find((t) => t.id === state.contract?.teamId) || TEAMS[0],
    [state.contract?.teamId]
  );

  const currentCircuit = useMemo(
    () => CIRCUITS.find((c) => c.id === state.season.currentRound) || CIRCUITS[0],
    [state.season.currentRound]
  );

  // BLOQUE 1.5: Resolución y validación del Némesis según categoría
  const activeNemesis = useMemo(() => {
    const rawNemesis = state.season?.nemesis;
    const resolvedName = resolveNemesisName(
      rawNemesis,
      currentTeam?.id,
      TEAMS,
      state.pilot?.name
    );

    const categoryId = currentTeam?.categoryId || 1;
    const rivalTeamObj = TEAMS.find(
      (t) => t.categoryId === categoryId && t.drivers.includes(resolvedName)
    );

    const userWins =
      typeof rawNemesis === "object" && rawNemesis !== null
        ? rawNemesis.userWins ?? rawNemesis.wins ?? 0
        : 0;
    const rivalWins =
      typeof rawNemesis === "object" && rawNemesis !== null
        ? rawNemesis.rivalWins ?? rawNemesis.losses ?? 0
        : 0;

    return {
      name: resolvedName,
      teamName: rivalTeamObj ? rivalTeamObj.name : "Escudería Rival",
      userWins,
      rivalWins
    };
  }, [state.season?.nemesis, currentTeam, state.pilot?.name]);

  // BLOQUE 2: Sorteo síncrono pre-carrera y control de fases
  const [raceCondition] = useState(() => generateRaceCondition());
  const [hasQuestTriggered] = useState(() => Math.random() < 0.4);

  const [currentQuest] = useState(() => {
    if (!hasQuestTriggered) return null;
    let randomQuest = QUESTS[Math.floor(Math.random() * QUESTS.length)];
    if (randomQuest.type === "BEAT_NEMESIS" && !activeNemesis?.name) {
      randomQuest = QUESTS.find((q) => q.type === "CLEAN_RACE") || QUESTS[0];
    }
    return randomQuest;
  });

  const [phase, setPhase] = useState(hasQuestTriggered ? "PREPARATION" : "TACTICS");
  const [raceResult, setRaceResult] = useState(null);

  // BLOQUE 3: Sorteo de evento post-carrera en Paddock y control del Pop-up
  const [hasEventTriggered] = useState(() => Math.random() < 0.5);
  const [selectedEvent] = useState(() => {
    const randomIndex = Math.floor(Math.random() * POST_RACE_EVENTS.length);
    return POST_RACE_EVENTS[randomIndex];
  });
  const [selectedOption, setSelectedOption] = useState(null);
  const [isEventConfirmed, setIsEventConfirmed] = useState(false);

  // Cálculo del duelo Cara a Cara tras cruzar la meta
  const postRaceNemesisStats = useMemo(() => {
    if (!raceResult || !activeNemesis) return null;

    const rivalIndex = raceResult.competitors.findIndex(
      (c) => c.name === activeNemesis.name
    );
    const rivalPosition = rivalIndex !== -1 ? rivalIndex + 1 : null;
    const userWonDuel =
      rivalPosition !== null ? raceResult.position < rivalPosition : true;

    const updatedUserWins = activeNemesis.userWins + (userWonDuel ? 1 : 0);
    const updatedRivalWins = activeNemesis.rivalWins + (userWonDuel ? 0 : 1);
    const diff = updatedUserWins - updatedRivalWins;

    return {
      ...activeNemesis,
      rivalPosition,
      userWonDuel,
      userWins: updatedUserWins,
      rivalWins: updatedRivalWins,
      diff
    };
  }, [raceResult, activeNemesis]);

  // BLOQUE 4: Manejadores de lógica de carrera y despacho al estado global
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
      condition: raceCondition,
      activeSponsors: state.activeSponsors
    });
    setRaceResult(outcome);
    setPhase("RESULTS");
  };

  const handleLockEventChoice = () => {
    if (!selectedOption) return;
    setIsEventConfirmed(true);
  };

  const handleFinishRound = (optionEffects = null) => {
    const updatedNemesisPayload = postRaceNemesisStats
      ? {
        name: postRaceNemesisStats.name,
        teamName: postRaceNemesisStats.teamName,
        userWins: postRaceNemesisStats.userWins,
        rivalWins: postRaceNemesisStats.rivalWins,
        wins: postRaceNemesisStats.userWins,
        losses: postRaceNemesisStats.rivalWins
      }
      : activeNemesis;

    dispatch({
      type: "COMPLETE_ROUND",
      payload: {
        userPosition: raceResult.position,
        circuitId: currentCircuit.id,
        eventEffects: optionEffects,
        competitors: raceResult.competitors,
        incident: raceResult.incident,
        nemesis: updatedNemesisPayload
      }
    });
    onClose();
  };

  // Helper UI: Panel Cara a Cara
  const renderNemesisBanner = (isPostRace = false) => {
    const data = isPostRace && postRaceNemesisStats ? postRaceNemesisStats : activeNemesis;
    if (!data) return null;

    const diff = data.userWins - data.rivalWins;
    const isPositive = diff > 0;
    const isNegative = diff < 0;

    const statusColor = isPositive
      ? "var(--accent-emerald)"
      : isNegative
        ? "var(--accent-red)"
        : "var(--accent-amber)";

    const statusLabel = isPositive
      ? `EN POSITIVO (+${diff})`
      : isNegative
        ? `EN NEGATIVO (${diff})`
        : "IGUALADOS (0)";

    return (
      <div
        className="glass-panel"
        style={{
          padding: "0.9rem 1rem",
          marginBottom: "1.5rem",
          borderLeft: `4px solid ${statusColor}`,
          backgroundColor: "rgba(15, 23, 42, 0.6)"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.5rem",
            marginBottom: "0.6rem"
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.72rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "block"
              }}
            >
              ⚔️ Sistema de Némesis — Cara a Cara
            </span>
            <strong style={{ fontSize: "1rem", color: "var(--text-primary)" }}>
              Rivalidad vs. {data.name}
            </strong>
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                marginLeft: "0.5rem"
              }}
            >
              ({data.teamName})
            </span>
          </div>

          <span
            className="telemetry-text"
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "0.25rem 0.6rem",
              borderRadius: "6px",
              backgroundColor: isPositive
                ? "rgba(52, 211, 153, 0.15)"
                : isNegative
                  ? "rgba(248, 113, 113, 0.15)"
                  : "rgba(251, 191, 36, 0.15)",
              color: statusColor,
              border: `1px solid ${statusColor}`
            }}
          >
            {statusLabel}
          </span>
        </div>

        {/* Marcador Cara a Cara */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            backgroundColor: "var(--bg-accent)",
            padding: "0.5rem 0.75rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem"
          }}
        >
          <div>
            <span style={{ color: "var(--accent-blue)", fontWeight: 700 }}>
              Tú ({state.pilot?.name || "Piloto"})
            </span>
            {isPostRace && (
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "6px" }}>
                [P{raceResult.position}]
              </span>
            )}
          </div>

          <div
            className="telemetry-text"
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              padding: "0 1rem",
              color: "var(--text-primary)"
            }}
          >
            <span style={{ color: "var(--accent-emerald)" }}>{data.userWins}</span>
            <span style={{ margin: "0 0.4rem", color: "var(--text-muted)" }}>-</span>
            <span style={{ color: "var(--accent-red)" }}>{data.rivalWins}</span>
          </div>

          <div style={{ textAlign: "right" }}>
            {isPostRace && data.rivalPosition && (
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "6px" }}>
                [P{data.rivalPosition}]
              </span>
            )}
            <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
              {data.name}
            </span>
          </div>
        </div>

        {isPostRace && (
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.8rem",
              color: data.userWonDuel ? "var(--accent-emerald)" : "var(--accent-red)",
              fontWeight: 600,
              textAlign: "center"
            }}
          >
            {data.userWonDuel
              ? `✓ Superaste a ${data.name} en esta carrera (+1 al historial)`
              : `✗ ${data.name} terminó por delante de ti en esta fecha (-1 al historial)`}
          </div>
        )}
      </div>
    );
  };

  const renderEffectBadges = (effects) => {
    if (!effects) return null;
    const labels = {
      budget: { name: "Presupuesto", prefix: "$" },
      rep: { name: "Reputación", prefix: "" },
      pop: { name: "Popularidad", prefix: "" },
      teamRelationship: { name: "Relación Equipo", prefix: "" }
    };

    const entries = Object.entries(effects).filter(([_, val]) => val !== 0 && val !== undefined);
    if (entries.length === 0) return null;

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.85rem" }}>
        {entries.map(([key, value]) => {
          const isPositive = value > 0;
          const meta = labels[key] || { name: key, prefix: "" };
          return (
            <span
              key={key}
              className="telemetry-text"
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.25rem 0.6rem",
                borderRadius: "6px",
                backgroundColor: isPositive
                  ? "rgba(52, 211, 153, 0.15)"
                  : "rgba(248, 113, 113, 0.15)",
                color: isPositive ? "var(--accent-emerald)" : "var(--accent-red)",
                border: `1px solid ${isPositive ? "var(--accent-emerald)" : "var(--accent-red)"}`
              }}
            >
              {isPositive ? `+${meta.prefix}${value}` : `${meta.prefix}${value}`} {meta.name}
            </span>
          );
        })}
      </div>
    );
  };

  // BLOQUE 5: Renderizado de interfaz por fases
  return (
    <div style={{
      position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.75)",
      backdropFilter: "blur(4px)", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "1rem", zIndex: 1000
    }}>
      <div
        className="game-card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          position: "relative"
        }}
      >

        {/* FASE 0: PREPARATION */}
        {phase === "PREPARATION" && currentQuest && (
          <div>
            <span style={{ fontSize: "0.8rem", color: "var(--accent-blue)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Reunión de Estrategia Pre-Carrera
            </span>
            <h2 style={{ fontSize: "1.5rem", marginTop: "0.25rem", marginBottom: "0.5rem" }}>
              🎯 Objetivo: {currentQuest.title}
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "1rem", lineHeight: 1.4 }}>
              {currentQuest.description}
            </p>

            {renderNemesisBanner(false)}

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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
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

            {renderNemesisBanner(false)}

            {state.season.activeQuest && (
              <div style={{ marginBottom: "1.25rem", padding: "0.75rem", backgroundColor: "rgba(59, 130, 246, 0.15)", borderLeft: "4px solid var(--accent-blue)", borderRadius: "var(--radius-sm)", fontSize: "0.85rem", color: "var(--text-primary)" }}>
                📌 <strong>Objetivo activo:</strong> {state.season.activeQuest.title}
              </div>
            )}

            <div className="glass-panel" style={{
              padding: "1.1rem", marginBottom: "1.5rem",
              borderLeft: `4px solid ${raceCondition.type === "RAIN" ? "var(--accent-blue)" : raceCondition.type === "HOT" ? "var(--accent-amber)" : "var(--accent-emerald)"}`
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                <span className={`status-dot ${raceCondition.type === "NORMAL" ? "status-active" : "status-warning"}`}></span>
                <h4 style={{ margin: 0, textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-primary)" }}>
                  Clima: {raceCondition.label}
                </h4>
              </div>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-secondary)" }}>{raceCondition.description}</p>
            </div>

            <h4 style={{ margin: "0 0 0.85rem 0", color: "var(--text-secondary)", textTransform: "uppercase", fontSize: "0.85rem" }}>
              Selecciona tu mapa de motor (Táctica):
            </h4>

            <div style={{ display: "grid", gap: "0.85rem" }}>
              <button className="btn-tactical attack" onClick={() => handleExecuteRace("ATTACK")}>
                <strong style={{ fontSize: "1.05rem", marginBottom: "0.2rem", color: "#f87171" }}>A — MODO ATAQUE (Push)</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>Ritmo de clasificación constante. Degrada la goma críticamente y aumenta el riesgo de sobrecalentamiento.</div>
              </button>

              <button className="btn-tactical" onClick={() => handleExecuteRace("PATIENT")}>
                <strong style={{ fontSize: "1.05rem", marginBottom: "0.2rem" }}>B — MODO EQUILIBRADO (Balance)</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>Gestión estándar. Cuida la mecánica mientras mantiene el delta de tiempo con el piloto de adelante.</div>
              </button>

              <button className="btn-tactical defend" onClick={() => handleExecuteRace("DEFEND")}>
                <strong style={{ fontSize: "1.05rem", marginBottom: "0.2rem", color: "#34d399" }}>C — MODO DEFENSA (Save)</strong>
                <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>Levantar y rodar (*lift and coast*). Cede tiempo por vuelta para garantizar que el auto cruce la meta ileso.</div>
              </button>
            </div>
          </div>
        )}

        {/* FASE 2: RESULTADOS DE META */}
        {phase === "RESULTS" && raceResult && (
          <div>
            <div style={{ textAlign: "center", marginBottom: "1.25rem" }}>
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

            {renderNemesisBanner(true)}

            <div style={{ backgroundColor: "var(--bg-accent)", borderRadius: "var(--radius-sm)", padding: "1rem", marginBottom: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Top 5 de la Carrera
              </h4>
              {raceResult.competitors.slice(0, 5).map((comp, idx) => {
                const isRival = comp.name === activeNemesis?.name;
                return (
                  <div
                    key={comp.name}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "0.35rem 0",
                      fontSize: "0.85rem",
                      borderBottom: "1px solid rgba(255,255,255,0.05)",
                      color: comp.isUser
                        ? "var(--accent-blue)"
                        : isRival
                          ? "var(--accent-amber)"
                          : "var(--text-secondary)",
                      fontWeight: comp.isUser || isRival ? 700 : 400
                    }}
                  >
                    <span>
                      {idx + 1}. {comp.name} {comp.isUser && "(Tú)"}{" "}
                      {isRival && "⚔️ (Rival)"}
                    </span>
                    <span>{comp.incident ? "Incidente ⚠️" : "En Meta"}</span>
                  </div>
                );
              })}
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
        {phase === "EVENT" && selectedEvent && (
          <div className="fade-in-up">
            <span style={{ fontSize: "0.8rem", color: "var(--accent-pink)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>
              🎙️ Zona de Prensa — Evento de Fin de Semana
            </span>
            <h2 style={{ fontSize: "1.3rem", marginTop: "0.25rem", marginBottom: "0.5rem" }}>
              {selectedEvent.title}
            </h2>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: "1.5rem" }}>
              {selectedEvent.description}
            </p>

            <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {selectedEvent.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={i}
                    disabled={isEventConfirmed}
                    className={`style-button ${isSelected ? "active" : ""}`}
                    onClick={() => setSelectedOption(opt)}
                    style={{
                      textAlign: "left",
                      padding: "0.85rem 1rem",
                      fontSize: "0.85rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.75rem",
                      border: isSelected
                        ? "1px solid var(--accent-blue)"
                        : "1px solid var(--border-subtle)",
                      backgroundColor: isSelected
                        ? "rgba(59, 130, 246, 0.15)"
                        : "transparent",
                      color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                      cursor: isEventConfirmed ? "default" : "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span style={{ lineHeight: 1.4 }}>{opt.text}</span>
                    <span
                      style={{
                        minWidth: "20px",
                        height: "20px",
                        borderRadius: "50%",
                        border: isSelected
                          ? "2px solid var(--accent-blue)"
                          : "1px solid var(--text-muted)",
                        backgroundColor: isSelected ? "var(--accent-blue)" : "transparent",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700
                      }}
                    >
                      {isSelected ? "✓" : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              className="btn btn-success"
              onClick={handleLockEventChoice}
              disabled={!selectedOption || isEventConfirmed}
              style={{
                width: "100%",
                padding: "0.85rem",
                opacity: selectedOption && !isEventConfirmed ? 1 : 0.4,
                cursor: selectedOption && !isEventConfirmed ? "pointer" : "not-allowed"
              }}
            >
              Guardar Resultados 🏁
            </button>
          </div>
        )}

        {/* POP-UP DE NOTIFICACIÓN POST-CONFIRMACIÓN */}
        {isEventConfirmed && selectedOption && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem",
              zIndex: 1100
            }}
          >
            <div
              className="game-card glass-panel fade-in-up"
              style={{
                maxWidth: "440px",
                width: "100%",
                padding: "1.5rem",
                border: "1px solid var(--border-subtle)",
                borderTop: "4px solid var(--accent-blue)",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <span className="status-dot status-active"></span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--accent-blue)",
                    textTransform: "uppercase",
                    letterSpacing: "1.5px",
                    fontWeight: 700
                  }}
                >
                  Repercusión en el Paddock
                </span>
              </div>

              <div
                style={{
                  padding: "1rem",
                  backgroundColor: "var(--bg-accent)",
                  borderRadius: "var(--radius-sm)",
                  borderLeft: "4px solid var(--accent-blue)",
                  marginBottom: "1.25rem"
                }}
              >
                <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--text-primary)", lineHeight: 1.5 }}>
                  💡 {selectedOption.feedback}
                </p>

                {renderEffectBadges(selectedOption.effects)}
              </div>

              <button
                className="btn btn-primary"
                onClick={() => handleFinishRound(selectedOption.effects)}
                style={{ width: "100%", padding: "0.85rem", fontWeight: 600 }}
              >
                Entendido — Volver al Taller 🏁
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default RaceModal;