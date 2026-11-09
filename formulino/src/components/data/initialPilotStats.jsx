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

  // F1 Media / Experimentados
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

// Agregar al final de src/data/initialPilotStats.js

export const F1_ELITE_RIVALS = [
  "Max Verstappen",
  "Lewis Hamilton",
  "Lando Norris",
  "Charles Leclerc",
  "Fernando Alonso",
  "George Russell",
  "Oscar Piastri",
  "Carlos Sainz Jr.",
];

// Descarta nombres vacíos, "Rival" o genéricos como "Piloto F3-G" / "Piloto Relleno K1"
export function isValidRivalName(name) {
  if (!name || typeof name !== "string") return false;
  const clean = name.trim();
  if (clean === "" || clean.toLowerCase() === "rival") return false;
  return !/^piloto\s/i.test(clean);
}

// Devuelve siempre un nombre de rival válido según el equipo y categoría del jugador
export function resolveNemesisName(rawNemesis, currentTeamId, teams, userName = "") {
  const currentTeam = teams.find((t) => t.id === currentTeamId) || teams[0];
  const categoryId = currentTeam?.categoryId || 1;

  // Extraemos el nombre sin importar cómo lo haya guardado CareerContext
  const candidateName =
    typeof rawNemesis === "string"
      ? rawNemesis
      : rawNemesis?.name || rawNemesis?.pilotName || rawNemesis?.driverName || "";

  const categoryTeams = teams.filter((t) => t.categoryId === categoryId);

  // Regla F1 (categoryId: 4): solo los 8 pilotos de élite
  if (categoryId === 4) {
    if (F1_ELITE_RIVALS.includes(candidateName) && candidateName !== userName) {
      return candidateName;
    }
    const f1Pool = F1_ELITE_RIVALS.filter((n) => n !== userName);
    return f1Pool[0] || "Max Verstappen";
  }

  // Regla Karting (1), F3 (2) y F2 (3): solo pilotos con nombre propio
  const namedDriversInCategory = categoryTeams
    .flatMap((t) => t.drivers)
    .filter((n) => isValidRivalName(n) && n !== userName);

  // Si el candidato ya es un piloto con nombre de esta categoría, lo mantenemos
  if (isValidRivalName(candidateName) && namedDriversInCategory.includes(candidateName)) {
    return candidateName;
  }

  // Priorizamos al compañero de equipo si tiene nombre propio
  const validTeammate = (currentTeam?.drivers || []).find(
    (n) => isValidRivalName(n) && n !== userName
  );

  return validTeammate || namedDriversInCategory[0] || "Nico Fuca";
}

export function isNamedDriver(name) {
  if (!name || typeof name !== "string") return false;
  const clean = name.trim();
  if (clean === "" || clean.toLowerCase() === "rival") return false;
  return !/^piloto\s/i.test(clean);
}

// Función auxiliar para obtener estadísticas de un piloto o generar valores por defecto
export function getDriverStats(driverName) {
  if (DRIVER_PRESETS[driverName]) {
    return DRIVER_PRESETS[driverName];
  }
  return {
    performance: 70 + Math.floor(Math.random() * 15),
    consistency: 70 + Math.floor(Math.random() * 15),
    mentality: 75,
    risk: 50,
  };
}