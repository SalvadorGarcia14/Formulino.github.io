// src/data/initialPilotStats.js

// Diccionario de atributos específicos para pilotos reales o templates por dificultad
export const DRIVER_PRESETS = {
  // F1 Elite (Muy difícil de vencer)
  "Max Verstappen": { performance: 98, consistency: 95, mentality: 96, risk: 40 },
  "Lewis Hamilton": { performance: 96, consistency: 94, mentality: 95, risk: 45 },
  "Lando Norris": { performance: 95, consistency: 92, mentality: 90, risk: 50 },
  "Charles Leclerc": { performance: 96, consistency: 90, mentality: 88, risk: 60 },
  "Fernando Alonso": { performance: 94, consistency: 96, mentality: 98, risk: 35 },
  "George Russell": { performance: 93, consistency: 91, mentality: 89, risk: 50 },
  "Oscar Piastri": { performance: 94, consistency: 93, mentality: 92, risk: 45 },
  "Carlos Sainz Jr.": { performance: 93, consistency: 94, mentality: 91, risk: 40 },

  // F1 Media / Experiados
  "Alexander Albon": { performance: 89, consistency: 90, mentality: 88, risk: 45 },
  "Pierre Gasly": { performance: 88, consistency: 87, mentality: 86, risk: 50 },
  "Esteban Ocon": { performance: 87, consistency: 88, mentality: 85, risk: 55 },
  "Nico Hülkenberg": { performance: 88, consistency: 92, mentality: 89, risk: 35 },
  "Valtteri Bottas": { performance: 86, consistency: 89, mentality: 85, risk: 40 },
  "Sergio Pérez": { performance: 87, consistency: 84, mentality: 83, risk: 55 },

  // F1 / F2 / F3 Jóvenes y más accesibles
  "Franco Colapinto": { performance: 88, consistency: 86, mentality: 92, risk: 55 },
  "Andrea Kimi Antonelli": { performance: 89, consistency: 83, mentality: 85, risk: 65 },
  "Oliver Bearman": { performance: 87, consistency: 84, mentality: 87, risk: 60 },
  "Liam Lawson": { performance: 86, consistency: 85, mentality: 88, risk: 55 },
  "Gabriel Bortoleto": { performance: 86, consistency: 88, mentality: 86, risk: 45 },
  "Isack Hadjar": { performance: 87, consistency: 83, mentality: 84, risk: 65 },
  
  // Fácil de vencer (ejemplo: Lance Stroll u otros puestos de relleno)
  "Lance Stroll": { performance: 82, consistency: 78, mentality: 75, risk: 50 },
};

// Función auxiliar para obtener estadísticas de un piloto o generar valores por defecto si no está en la lista
export function getDriverStats(driverName) {
  if (DRIVER_PRESETS[driverName]) {
    return DRIVER_PRESETS[driverName];
  }
  // Valores por defecto equilibrados para pilotos de categorías inferiores o genéricos
  return {
    performance: 70 + Math.floor(Math.random() * 15),
    consistency: 70 + Math.floor(Math.random() * 15),
    mentality: 75,
    risk: 50
  };
}