import { useState } from 'react'
import { CareerProvider, useCareer } from "./components/context/CareerContext.jsx";
import CreatePlayer from './components/pages/CreatePlayer.jsx';
import { TEAMS } from "./components/data/teams.jsx";
import { CATEGORIES } from "./components/data/categories.jsx";

import './App.css'


function CareerDashboard() {
  const { state, dispatch } = useCareer();
  const currentTeam = TEAMS.find((t) => t.id === state.contract?.teamId);
  const currentCategory = CATEGORIES.find((c) => c.id === state.season?.categoryId);
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>🏎️ {state.pilot.name} {state.pilot.lastName} (#{state.pilot.number})</h1>
          <p style={{ margin: "0.25rem 0 0 0", color: "#6b7280" }}>
            {state.pilot.nationality} | {state.pilot.age} años | Estilo: {state.pilot.drivingStyle}
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("¿Seguro que deseas reiniciar tu carrera? Se borrará el progreso.")) {
              dispatch({ type: "RESET_CAREER" });
            }
          }}
          style={{ padding: "0.4rem 0.8rem", borderRadius: "4px", border: "1px solid #ef4444", background: "#fee2e2", color: "#b91c1c", cursor: "pointer" }}
        >
          Reiniciar Partida
        </button>
      </header>

      <main style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>📋 Contrato Actual</h3>
          <p><strong>Categoría:</strong> {currentCategory?.name || "Sin categoría"}</p>
          <p><strong>Equipo:</strong> {currentTeam?.name || "Agente Libre"}</p>
          <p><strong>Rol:</strong> {state.contract?.role}</p>
          <p><strong>Relación con el equipo:</strong> {state.contract?.teamRelationship} / 100</p>
          <p><strong>Presupuesto Personal:</strong> ${state.pilot.budget.toLocaleString()}</p>
        </div>

        <div style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>🏁 Temporada {state.season.year}</h3>
          <p><strong>Ronda:</strong> {state.season.currentRound} de {state.season.totalRounds}</p>
          <p><strong>Popularidad:</strong> {state.pilot.popularity} / 100</p>
          <p><strong>Reputación:</strong> {state.pilot.reputation} / 100</p>
          <div style={{ marginTop: "1rem", padding: "0.75rem", backgroundColor: "#f3f4f6", borderRadius: "6px" }}>
            <em>Listo para simular la Ronda {state.season.currentRound}.</em>
          </div>
        </div>
      </main>
    </div>
  );
}

function MainScreen() {
  const { state } = useCareer();

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🏎️ Formulino 🏎️ </h1>
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
