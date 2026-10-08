// Nombres ficticios para la parrilla de Karting Nacional (10 competidores)
const RIVAL_NAMES = [
  "Mateo Rossi", "Luca Bianchi", "Felipe Gómez", "Julián Álvarez",
  "Thiago Martínez", "Enzo Fernández", "Bruno Costa", "Nicolás Díaz", "Joaquín Navarro"
];

export function generateInitialGrid(userPilotName) {
  const grid = [{ pilotName: userPilotName, isUser: true, points: 0, wins: 0, podiums: 0 }];
  RIVAL_NAMES.forEach((name) => {
    grid.push({ pilotName: name, isUser: false, points: 0, wins: 0, podiums: 0 });
  });
  return grid;
}

// función para generar un estado previo a la carrera (clima o eventualidad)
export function generateRaceCondition() {
  const roll = Math.random();
  if (roll < 0.2) return { type: "RAIN", label: "Lluvia Fuerte", modifier: -15, description: "Pista empapada. El coche se siente inestable." };
  if (roll < 0.35) return { type: "HOT", label: "Mucho Calor", modifier: -5, description: "Asfalto hirviendo. Rápida degradación de neumáticos." };
  return { type: "NORMAL", label: "Condiciones Óptimas", modifier: 0, description: "Cielo despejado y temperatura ideal." };
}


export function simulateRace({ pilot, team, circuit, tacticalChoice, condition }) {
  let tacticalScoreBonus = 0;
  let incidentRisk = (100 - team.reliability) * 0.2 + (pilot.stats.risk * 0.3);
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

  // 1. Chequeo de Mentilidad (Posibilidad de salvar un accidente inminente)
  let sufferedIncident = false;
  let mentallySaved = false;

  if (Math.random() * 100 < incidentRisk) {
    // Hubo un error, ¿la mentalidad del piloto lo salva de un choque desastroso?
    const mentalityRoll = Math.random() * 100;
    if (mentalityRoll < pilot.stats.mentality * 0.7) {
      mentallySaved = true; // Salvó el coche, pero perdió algo de tiempo
      tacticalScoreBonus -= 15;
    } else {
      sufferedIncident = true; // Accidente o avería real
    }
  }


  // 2. Penalización por desgaste
  // Si el desgaste es muy alto y la consistencia del piloto es baja, pierde ritmo.
  let paceDrop = 0;
  if (tireWear > 15) {
    paceDrop = Math.max(0, tireWear - (pilot.stats.consistency * 0.3));
  }


  // 3. Cálculo de ritmo general (Pace)
  const pilotBase = (pilot.stats.performance * 0.6) + (pilot.stats.consistency * 0.4);
  const teamBase = team.performance;
  const luck = (Math.random() * 20) - 10;

  let userPace = (pilotBase * 0.45) + (teamBase * 0.40) + tacticalScoreBonus - paceDrop + luck + condition.modifier;
  if (sufferedIncident) {
    userPace -= 50;
  }

  // 4. Generación de la IA
  const competitors = [
    { name: `${pilot.name} ${pilot.lastName}`, isUser: true, pace: userPace, incident: sufferedIncident, mentallySaved }
  ];


  RIVAL_NAMES.forEach((name, i) => {
    // Rendimiento variable de los rivales (media 55-75 con dispersión)
    const rivalSkill = 50 + (i * 2.2) + ((Math.random() * 20) - 10);
    const rivalIncident = Math.random() < (condition.type === "RAIN" ? 0.15 : 0.08); // La IA también sufre en lluvia
    const rivalPace = rivalSkill - (rivalIncident ? 40 : 0) + condition.modifier;
    competitors.push({ name, isUser: false, pace: rivalPace, incident: rivalIncident });
  });
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
    summary = "🛞 Tufriste degradación extrema. Te quedaste sin neumáticos al final.";
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