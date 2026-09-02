import { useState } from 'react'
import { CareerProvider, useCareer } from "./components/context/CareerContext.jsx";
import './App.css'


function MainScreen() {
    const { state } = useCareer();

return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🏎️ Formulino 🏎️ </h1>
      {state.pilot ? (
        <p>Piloto activo: {state.pilot.name} {state.pilot.lastName}</p>
      ) : (
        <p>No hay partida iniciada. Listo para la Fase 2.</p>
      )}
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
