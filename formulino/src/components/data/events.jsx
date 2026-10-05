export const POST_RACE_EVENTS = [
  {
    id: "press_rivalry",
    title: "Zona de Prensa: Declaraciones Calientes",
    description: "Un periodista te pone el micrófono y pregunta: '¿Crees que tu compañero de equipo te retuvo deliberadamente en la curva 3?'",
    options: [
      {
        text: "A: 'Sí, claramente no corre para el equipo. Es un egoísta.'",
        effects: { popularity: +8, teamRelationship: -15, reputation: -5 },
        feedback: "Tus declaraciones causaron revuelo en redes, pero en el box hay un silencio sepulcral."
      },
      {
        text: "B: 'Son cosas de carrera. Tenemos que analizar la telemetría juntos.'",
        effects: { popularity: +2, teamRelationship: +10, mentality: +3 },
        feedback: "El jefe de equipo agradeció tu madurez frente a las cámaras."
      },
      {
        text: "C: 'Prefiero hablar en pista. El próximo fin de semana responderé con ritmo.'",
        effects: { popularity: +5, reputation: +5, performance: +1 },
        feedback: "Tu respuesta cortante pero centrada te ganó el respeto del paddock."
      }
    ]
  },
  {
    id: "engineer_setup",
    title: "Reunión Técnica: El Veredicto de los Datos",
    description: "Tu ingeniero principal propone modificar agresivamente la convergencia y el reparto de frenos para la próxima cita.",
    options: [
      {
        text: "A: Confiar en el ingeniero y aprobar el nuevo balance.",
        effects: { teamRelationship: +12, technicalFeedback: +4 },
        feedback: "El equipo técnico valora enormemente tu disposición a evolucionar el chasis."
      },
      {
        text: "B: Rechazar el cambio. 'El coche va bien como está, no toquen nada.'",
        effects: { teamRelationship: -10, consistency: +3 },
        feedback: "Los mecánicos guardaron las herramientas entre susurros de disconformidad."
      },
      {
        text: "C: Proponer un compromiso intermedio tras analizar horas de vueltas rápidas.",
        effects: { teamRelationship: +6, technicalFeedback: +6, mentality: +2 },
        feedback: "El compromiso funcionó y demostraste dotes de liderazgo técnico."
      }
    ]
  },
  {
    id: "sponsor_event",
    title: "Cena con Patrocinadores",
    description: "Una marca de bebidas energéticas organiza una gala benéfica la noche previa a tu día de simulador libre.",
    options: [
      {
        text: "A: Asistir, hablar con inversionistas y tomar fotos con fanáticos.",
        effects: { popularity: +12, budget: +3500, consistency: -4 },
        feedback: "Fuiste la estrella de la noche y conseguiste fondos frescos, aunque faltó descanso."
      },
      {
        text: "B: Excusarse educadamente y priorizar el descanso y el entrenamiento físico.",
        effects: { popularity: -4, consistency: +5, mentality: +3 },
        feedback: "Los patrocinadores quedaron algo decepcionados, pero estás al 100% físicamente."
      },
      {
        text: "C: Pasar solo 30 minutos por protocolo y retirarte antes de medianoche.",
        effects: { popularity: +5, budget: +1500 },
        feedback: "Cumpliste con la imagen comercial sin comprometer la disciplina deportiva."
      }
    ]
  }
];