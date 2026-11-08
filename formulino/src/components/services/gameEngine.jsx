import { TEAMS } from "../data/teams";
import { getDriverStats } from "../data/initialPilotStats";

// Nombres ficticios de respaldo por si se requieren (o se pueden mantener para categorías menores)
const RIVAL_NAMES = [
  "Mateo Rossi", "Luca Bianchi", "Felipe Gómez", "Julián Álvarez",
  "Thiago Martínez", "Enzo Fernández", "Bruno Costa", "Nicolás Díaz", "Joaquín Navarro"
];

// 1. Generación de grilla basada en equipos, categorías y estadísticas reales
export function generateInitialGrid(userPilotName, currentCategoryId = 1, userTeamId = null) {
  const grid = [
    { pilotName: userPilotName, isUser: true, points: 0, wins: 0, podiums: 0 }
  ];

  // Filtrar equipos de la categoría actual
  const categoryTeams = TEAMS.filter(t => t.categoryId === currentCategoryId);

  categoryTeams.forEach(team => {
    team.drivers.forEach(driverName => {
      // Si el usuario pertenece a este equipo y ya ocupamos el primer asiento, omitimos al compañero duplicado
      if (team.id === userTeamId && grid.length === 1) {
        return;
      }
      
      grid.push({
        pilotName: driverName,
        teamName: team.name,
        teamPerformance: team.performance,
        stats: getDriverStats(driverName),
        isUser: false,
        points: 0,
        wins: 0,
        podiums: 0
      });
    });
  });

  // Asegurar exactamente 22 pilotos en total (Usuario + 21 rivales) completando con genéricos si faltan
  while (grid.length < 22) {
    const fillerName = `Piloto Reserva ${grid.length}`;
    grid.push({
      pilotName: fillerName,
      teamName: "Independiente",
      teamPerformance: 70,
      stats: getDriverStats(fillerName),
      isUser: false,
      points: 0,
      wins: 0,
      podiums: 0
    });
  }

  // Si excede por alguna razón, recortar a 22
  return grid.slice(0, 22);
}

// Función para generar un estado previo a la carrera (clima o eventualidad)
export function generateRaceCondition() {
  const roll = Math.random();
  if (roll < 0.2) return { type: "RAIN", label: "Lluvia Fuerte", modifier: -15, description: "Pista empapada. El coche se siente inestable." };
  if (roll < 0.35) return { type: "HOT", label: "Mucho Calor", modifier: -5, description: "Asfalto hirviendo. Rápida degradación de neumáticos." };
  return { type: "NORMAL", label: "Condiciones Óptimas", modifier: 0, description: "Cielo despejado y temperatura ideal." };
}

export function simulateRace({ pilot, team, circuit, tacticalChoice, condition, currentGrid = [], carUpgrades = { performance: 0, reliability: 0 } }) {
  // Cálculo de mejoras de I+D en el coche
  const extraPerf = (carUpgrades?.performance || 0) * 0.8; 
  const extraRel = (carUpgrades?.reliability || 0) * 1.5;   

  const effectiveTeamPerf = team.performance + extraPerf;
  const effectiveTeamRel = Math.min(100, team.reliability + extraRel);

  let tacticalScoreBonus = 0;
  // Usamos la fiabilidad efectiva con las mejoras de I+D aplicadas
  let incidentRisk = (100 - effectiveTeamRel) * 0.2 + (pilot.stats.risk * 0.3);
  let tireWear = 0;

  // Impacto del clima
  if (condition.type === "RAIN") {
    incidentRisk += 15; // Más riesgo en lluvia
  } else if (condition.type === "HOT") {
    tireWear += 10; // Más desgaste inicial por el calor
  }

  // Efectos de la táctica elegida
  if (tacticalChoice === "ATTACK") {
    tacticalScoreBonus += 18;
    incidentRisk += 25;
    tireWear += 20;
  } else if (tacticalChoice === "PATIENT") {
    tacticalScoreBonus += 5;
    incidentRisk -= 5;
    tireWear -= 10;
  } else if (tacticalChoice === "DEFEND") {
    tacticalScoreBonus -= 8;
    incidentRisk -= 20;
    tireWear -= 15; // Cuida mucho los neumáticos
  }

  // 1. Chequeo de Mentalidad (Posibilidad de salvar un accidente inminente)
  let sufferedIncident = false;
  let mentallySaved = false;

  if (Math.random() * 100 < incidentRisk) {
    const mentalityRoll = Math.random() * 100;
    if (mentalityRoll < pilot.stats.mentality * 0.7) {
      mentallySaved = true; // Salvó el coche, pero perdió algo de tiempo
      tacticalScoreBonus -= 15;
    } else {
      sufferedIncident = true; // Accidente o avería real
    }
  }

  // 2. Penalización por desgaste
  let paceDrop = 0;
  if (tireWear > 15) {
    paceDrop = Math.max(0, tireWear - (pilot.stats.consistency * 0.3));
  }

  // 3. Cálculo de ritmo general (Pace) del usuario usando effectiveTeamPerf
  const pilotBase = (pilot.stats.performance * 0.6) + (pilot.stats.consistency * 0.4);
  const luck = (Math.random() * 20) - 10;

  let userPace = (pilotBase * 0.45) + (effectiveTeamPerf * 0.40) + tacticalScoreBonus - paceDrop + luck + condition.modifier;
  if (sufferedIncident) {
    userPace -= 50;
  }

  // 4. Generación y simulación de la IA con sus estadísticas reales
  const competitors = [
    { name: `${pilot.name} ${pilot.lastName}`, isUser: true, pace: userPace, incident: sufferedIncident, mentallySaved }
  ];

  // Si pasas la grilla actual de la temporada, simulamos a los rivales usando sus stats reales
  if (currentGrid && currentGrid.length > 1) {
    currentGrid.forEach(driver => {
      if (driver.isUser) return; // Ya agregamos al usuario arriba

      const rivalStats = driver.stats || { performance: 60, consistency: 60, risk: 10 };
      const rivalTeamPerf = driver.teamPerformance || 70;
      
      const rivalBase = (rivalStats.performance * 0.6) + (rivalStats.consistency * 0.4);
      const rivalLuck = (Math.random() * 20) - 10;
      const rivalIncident = Math.random() < (condition.type === "RAIN" ? 0.12 : 0.05);
      
      let rivalPace = (rivalBase * 0.45) + (rivalTeamPerf * 0.40) + rivalLuck + condition.modifier;
      if (rivalIncident) {
        rivalPace -= 45;
      }

      competitors.push({
        name: driver.pilotName,
        teamName: driver.teamName,
        isUser: false,
        pace: rivalPace,
        incident: rivalIncident
      });
    });
  } else {
    // Respaldo por si se llama sin la grilla completa
    RIVAL_NAMES.forEach((name, i) => {
      const rivalSkill = 50 + (i * 2.2) + ((Math.random() * 20) - 10);
      const rivalIncident = Math.random() < (condition.type === "RAIN" ? 0.15 : 0.08);
      const rivalPace = rivalSkill - (rivalIncident ? 40 : 0) + condition.modifier;
      competitors.push({ name, isUser: false, pace: rivalPace, incident: rivalIncident });
    });
  }

  // Ordenar de mayor ritmo a menor ritmo
  competitors.sort((a, b) => b.pace - a.pace);

  // Determinar posición final del usuario
  const userPosition = competitors.findIndex((c) => c.isUser) + 1;
  const userCompetitor = competitors.find((c) => c.isUser);

  // Generación del resumen de carrera
  let summary = "";
  if (userCompetitor.incident) {
    summary = "💥 Sufriste un grave incidente en pista. Desastre.";
  } else if (userCompetitor.mentallySaved) {
    summary = "⚠️ Casi pierdes el coche en la penúltima vuelta, pero tu reflejo (Mentalidad) salvó los puntos.";
  } else if (paceDrop > 5) {
    summary = "🛞 Sufriste degradación extrema. Te quedaste sin neumáticos al final.";
  } else if (userPosition <= 3) {
    summary = "🏆 ¡Ritmo impecable y podio espectacular!";
  } else {
    summary = "🏁 Carrera limpia, cruzaste la meta sin mayores sobresaltos.";
  }

  return {
    position: userPosition,
    competitors,
    incident: userCompetitor.incident,
    raceSummary: summary
  };
}