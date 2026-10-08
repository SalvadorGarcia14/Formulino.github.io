import { useState } from 'react'
import { CareerProvider, useCareer } from "./components/context/CareerContext.jsx";

import CreatePlayer from './components/pages/CreatePlayer.jsx';
import StandingsTable from "./components/componentes/StandingsTable/StandingsTable.jsx";
import RaceModal from "./components/componentes/RaceModal/RaceModal.jsx";
import SeasonEndModal from "./components/componentes/SeasonEndModal/SeasonEndModal.jsx";
import SponsorModal from "./components/componentes/SponsorModal/SponsorModal.jsx";


import { TEAMS } from "./components/data/teams.jsx";
import { CATEGORIES } from "./components/data/categories.jsx";

import "./components/styles/theme.css";
import "./components/styles/Formulino.css";

import './App.css'
function CareerDashboard() {
  const { state, dispatch } = useCareer();
  const [isRaceOpen, setIsRaceOpen] = useState(false);
  const [isSeasonEndOpen, setIsSeasonEndOpen] = useState(false);
  const [isSponsorOpen, setIsSponsorOpen] = useState(false);

  const currentTeam = TEAMS.find((t) => t.id === state.contract?.teamId);
  const currentCategory = CATEGORIES.find((c) => c.id === state.season?.categoryId);

  const totalSponsorIncome = state.activeSponsors?.reduce((sum, sp) => sum + sp.payoutPerRace, 0) || 0;

  return (
    /* 👇 INICIO DE LA INTEGRACIÓN DEL NUEVO DISEÑO 👇 */
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <header className="glass-panel fade-in-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg, var(--accent-blue), var(--accent-pink))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold", color: "#fff", boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}>
            {state.pilot.number}
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: 0, textTransform: "uppercase", letterSpacing: "1px" }}>
              {state.pilot.name} {state.pilot.lastName}
            </h1>
            <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              <span className="status-dot status-active"></span>
              {state.pilot.nationality} • {state.pilot.age} AÑOS • ESTILO {state.pilot.drivingStyle.toUpperCase()}
            </p>
          </div>
        </div>
        <button className="btn btn-danger" onClick={() => { if (window.confirm("¿Seguro que deseas reiniciar tu carrera?")) dispatch({ type: "RESET_CAREER" }); }}>
          Reiniciar Partida
        </button>
      </header>

      <main style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <div className="game-card fade-in-up delay-1">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            📋 DATOS DEL CONTRATO
          </h3>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <p style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Categoría</span>
              <strong className="telemetry-text">{currentCategory?.name}</strong>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Escudería</span>
              <strong className="telemetry-text">{currentTeam?.name}</strong>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Rol</span>
              <span className="telemetry-text">{state.contract?.role}</span>
            </p>
            {/* Se mantiene la relación con el equipo de tu código anterior */}
            <p style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Relación Eq.</span>
              <span className="telemetry-text" style={{ color: "var(--accent-emerald)" }}>{state.contract?.teamRelationship}%</span>
            </p>

            <div style={{ padding: "0.75rem", background: "rgba(16, 185, 129, 0.1)", borderRadius: "6px", marginTop: "0.5rem" }}>
              <p style={{ display: "flex", justifyContent: "space-between", margin: 0, fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Billetera Personal</span>
                <strong className="telemetry-text" style={{ color: "var(--accent-emerald)" }}>${state.pilot.budget.toLocaleString()}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="game-card fade-in-up delay-2">
          
          {/* FUSIÓN: Widget de Rivalidad adaptado a la nueva estructura */}
          {state.season.nemesis && !state.season.isCompleted && (
            <div style={{
              marginBottom: "1.25rem", padding: "0.85rem",
              backgroundColor: "var(--bg-accent)",
              borderLeft: "4px solid var(--accent-red)",
              borderRadius: "var(--radius-sm)"
            }}>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                En la mira de la prensa:
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.25rem" }}>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}>
                  ⚔️ Rivalidad vs {state.season.nemesis.name}
                </strong>
                <span style={{
                  fontWeight: 800,
                  color: state.season.nemesis.score > 0 ? "var(--accent-emerald)" : state.season.nemesis.score < 0 ? "var(--accent-red)" : "var(--text-muted)"
                }}>
                  Cara a cara: {state.season.nemesis.score > 0 ? "+" : ""}{state.season.nemesis.score}
                </span>
              </div>

              {(() => {
                const userSt = state.season.standings.find(s => s.isUser);
                const nemSt = state.season.standings.find(s => s.pilotName === state.season.nemesis.name);

                if (!userSt || !nemSt) return null;

                const diff = userSt.points - nemSt.points;
                const isWinning = diff > 0;
                const isTied = diff === 0;

                return (
                  <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.5rem" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Estado en el Campeonato: </span>
                    <strong style={{
                      color: isWinning ? "var(--accent-emerald)" : isTied ? "var(--text-muted)" : "var(--accent-amber)"
                    }}>
                      {isWinning
                        ? `+${diff} puntos de ventaja`
                        : isTied
                          ? "Empatados en puntos"
                          : `${diff} puntos (Déficit)`}
                    </strong>
                  </div>
                );
              })()}
            </div>
          )}

          <h3 style={{ fontSize: "1.1rem", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem" }}>
            🏁 TEMPORADA {state.season.year}
          </h3>
          <div style={{ display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <p style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Progreso</span>
              <strong className="telemetry-text">
                {state.season.isCompleted ? "FINALIZADA" : `R${state.season.currentRound}/${state.season.totalRounds}`}
              </strong>
            </p>
            <p style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Popularidad</span>
              <strong className="telemetry-text" style={{ color: "var(--accent-pink)" }}>{state.pilot.popularity}%</strong>
            </p>
            {/* Se mantiene la Reputación de tu código anterior */}
            <p style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
              <span style={{ color: "var(--text-secondary)" }}>Reputación</span>
              <strong className="telemetry-text" style={{ color: "var(--accent-blue)" }}>{state.pilot.reputation}%</strong>
            </p>
          </div>

          {!state.season.isCompleted ? (
            <button className="btn btn-primary" onClick={() => setIsRaceOpen(true)} style={{ width: "100%", padding: "1rem", fontSize: "1.05rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800 }}>
              Disputar Gran Premio 🚦
            </button>
          ) : (
            <button className="btn btn-success" onClick={() => setIsSeasonEndOpen(true)} style={{ width: "100%", padding: "1rem", fontSize: "1.05rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800 }}>
              Mercado de Fichajes 🏆
            </button>
          )}
        </div>
      </main>
      /* 👆 FIN DE LA INTEGRACIÓN DEL NUEVO DISEÑO 👆 */

      {/* Panel Comercial de Patrocinadores */}
      <div className="game-card fade-in-up delay-2" style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: "1rem" }}>💼 Patrocinadores Activos ({state.activeSponsors?.length || 0}/3)</h4>
          <p style={{ margin: "0.2rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Ingresos fijos: <strong style={{ color: "var(--accent-emerald)" }}>+${totalSponsorIncome.toLocaleString()} / carrera disputada</strong>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsSponsorOpen(true)} style={{ padding: "0.5rem 0.85rem", fontSize: "0.85rem" }}>
          Gestionar Sponsors 🤝
        </button>
      </div>

      {/* Historial de Temporadas Pasadas */}
      {state.careerHistory.length > 0 && (
        <div className="game-card fade-in-up delay-2" style={{ marginTop: "1.5rem" }}>
          <h4 style={{ fontSize: "0.95rem", margin: "0 0 0.75rem 0", color: "var(--text-secondary)" }}>
            📜 Trayectoria Profesional
          </h4>
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {state.careerHistory.map((hist, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                  padding: "0.4rem 0.6rem",
                  backgroundColor: "var(--bg-accent)",
                  borderRadius: "4px"
                }}
              >
                <span>Año {hist.year}: <strong>{hist.categoryName}</strong></span>
                <span>Puesto Final: <strong>P{hist.finalPosition}</strong> ({hist.points} pts, {hist.wins} wins)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de clasificación */}
      <div className="fade-in-up delay-2">
        <StandingsTable standings={state.season.standings} />
      </div>

      {/* Modales */}
      {isRaceOpen && <RaceModal onClose={() => setIsRaceOpen(false)} />}
      {isSeasonEndOpen && <SeasonEndModal onClose={() => setIsSeasonEndOpen(false)} />}
      {isSponsorOpen && <SponsorModal onClose={() => setIsSponsorOpen(false)} />}
    </div>
  );
}

function MainScreen() {
  const { state } = useCareer();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {!state.pilot ? <CreatePlayer /> : <CareerDashboard />}
    </div>
  );
}

function App() {
  return (
    <CareerProvider>
      <MainScreen />
    </CareerProvider>
  )
}

export default App