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

export function simulateRace({ pilot, team, circuit, tacticalChoice }) {
  // 1. Efectos del dilema táctico
  let tacticalScoreBonus = 0;
  let incidentRisk = (100 - team.reliability) * 0.2 + (pilot.stats.risk * 0.3);

  if (tacticalChoice === "ATTACK") {
    tacticalScoreBonus += 15;
    incidentRisk += 20;
  } else if (tacticalChoice === "PATIENT") {
    tacticalScoreBonus += 5;
    incidentRisk -= 10;
  } else if (tacticalChoice === "DEFEND") {
    tacticalScoreBonus -= 5;
    incidentRisk -= 18;
  }

  // Tirada de incidente / penalización mecánica
  const roll = Math.random() * 100;
  const sufferedIncident = roll < Math.max(incidentRisk, 4);

  // 2. Cálculo de rendimiento del jugador
  // Piloto (40%) + Auto (40%) + Circuito/Técnica (10%) + Táctica (10%) + Suerte (-15 a +15)
  const pilotBase = (pilot.stats.performance * 0.6) + (pilot.stats.consistency * 0.4);
  const teamBase = team.performance;
  const luck = (Math.random() * 30) - 15;
  
  let userPace = (pilotBase * 0.45) + (teamBase * 0.40) + tacticalScoreBonus + luck;
  if (sufferedIncident) {
    userPace -= 45; // Pérdida de tiempo por trompo, toque o avería menor
  }

  // 3. Generación de tiempos de la IA rival
  const competitors = [
    { name: `${pilot.name} ${pilot.lastName}`, isUser: true, pace: userPace, incident: sufferedIncident }
  ];

  RIVAL_NAMES.forEach((name, i) => {
    // Rendimiento variable de los rivales (media 55-75 con dispersión)
    const rivalSkill = 50 + (i * 2.2) + ((Math.random() * 20) - 10);
    const rivalIncident = Math.random() < 0.08;
    const rivalPace = rivalSkill - (rivalIncident ? 40 : 0);
    competitors.push({ name, isUser: false, pace: rivalPace, incident: rivalIncident });
  });

  // Ordenar de mayor ritmo a menor ritmo
  competitors.sort((a, b) => b.pace - a.pace);

  // Determinar posición final del usuario
  const userPosition = competitors.findIndex((c) => c.isUser) + 1;
  const userCompetitor = competitors.find((c) => c.isUser);

  return {
    position: userPosition,
    competitors,
    incident: userCompetitor.incident,
    raceSummary: userCompetitor.incident 
      ? "Sufriste un roce en curva y perdiste tiempo valioso en boxes." 
      : (userPosition <= 3 ? "¡Gran ritmo y podio brillante en pista!" : "Carrera limpia y sólida dentro de la parrilla.")
  };
}