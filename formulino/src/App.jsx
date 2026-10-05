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
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "2rem 1.5rem" }}>
      <header className="game-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            🏎️ {state.pilot.name} {state.pilot.lastName}
            <span style={{ fontSize: "1rem", color: "var(--accent-amber)", backgroundColor: "#1e293b", padding: "0.1rem 0.5rem", borderRadius: "4px" }}>
              #{state.pilot.number}
            </span>
          </h1>
          <p style={{ margin: "0.35rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            {state.pilot.nationality} • {state.pilot.age} años • Estilo {state.pilot.drivingStyle}
          </p>
        </div>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (window.confirm("¿Seguro que deseas reiniciar tu carrera?")) {
              dispatch({ type: "RESET_CAREER" });
            }
          }}
          style={{ padding: "0.5rem 0.85rem", fontSize: "0.8rem" }}
        >
          Reiniciar Partida
        </button>
      </header>

      <main style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
        <div className="game-card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
            📋 Contrato Deportivo
          </h3>
          <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Categoría:</span>
            <strong>{currentCategory?.name}</strong>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Equipo:</span>
            <strong>{currentTeam?.name}</strong>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Rol:</span>
            <span>{state.contract?.role}</span>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Relación con el equipo:</span>
            <span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>{state.contract?.teamRelationship}%</span>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Billetera Personal:</span>
            <span style={{ color: "var(--accent-emerald)", fontWeight: 700 }}>${state.pilot.budget.toLocaleString()}</span>
          </p>
        </div>

        <div className="game-card">
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
            🏁 Temporada {state.season.year}
          </h3>
          <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Progreso del Calendario:</span>
            <strong>
              {state.season.isCompleted
                ? "Temporada Finalizada 🏁"
                : `Ronda ${state.season.currentRound} de ${state.season.totalRounds}`}
            </strong>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Popularidad:</span>
            <span style={{ color: "var(--accent-pink)", fontWeight: 600 }}>{state.pilot.popularity}/100</span>
          </p>
          <p style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem", fontSize: "0.9rem" }}>
            <span style={{ color: "var(--text-secondary)" }}>Reputación en Paddock:</span>
            <span style={{ color: "var(--accent-blue)", fontWeight: 600 }}>{state.pilot.reputation}/100</span>
          </p>

          {!state.season.isCompleted ? (
            <button
              className="btn btn-primary"
              onClick={() => setIsRaceOpen(true)}
              style={{ width: "100%", padding: "0.75rem", fontSize: "1rem" }}
            >
              Disputar Gran Premio (Ronda {state.season.currentRound}) 🚦
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => setIsSeasonEndOpen(true)}
              style={{ width: "100%", padding: "0.75rem", fontSize: "1rem" }}
            >
              Cierre de Temporada & Mercado de Fichajes 🏆
            </button>
          )}
        </div>
      </main>

      {/* Panel Comercial de Patrocinadores */}
      <div className="game-card" style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
        <div className="game-card" style={{ marginTop: "1.5rem" }}>
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
      <StandingsTable standings={state.season.standings} />

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
