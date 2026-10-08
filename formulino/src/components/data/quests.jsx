// src/data/quests.jsx

export const QUESTS = [
  {
    id: 'q_top3',
    type: 'POSITION',
    target: 3,
    title: 'Exigencia del Patrocinador',
    description: 'El patrocinador principal invitó a directivos. Quieren verte en el podio.',
    reward: { budget: 3500, rep: 3, pop: 5 },
    penalty: { rep: -3, teamRelationship: -2 }
  },
  {
    id: 'q_top6',
    type: 'POSITION',
    target: 6,
    title: 'Objetivo de Puntos',
    description: 'Necesitamos asegurar puntos sólidos para el campeonato. Termina en el Top 6.',
    reward: { budget: 1500, teamRelationship: 5 },
    penalty: { teamRelationship: -5 }
  },
  {
    id: 'q_clean',
    type: 'CLEAN_RACE',
    title: 'Cuidar la Mecánica',
    description: 'No hay repuestos suficientes. Termina la carrera sin sufrir incidentes ni toques.',
    reward: { budget: 1000, teamRelationship: 8 },
    penalty: { teamRelationship: -10, rep: -2 }
  },
  {
    id: 'q_nemesis',
    type: 'BEAT_NEMESIS',
    title: 'Duelo Personal',
    description: 'La prensa está atenta a tu rivalidad. Termina la carrera por delante de tu némesis.',
    reward: { pop: 8, rep: 4, budget: 1000 },
    penalty: { pop: -5, rep: -2 }
  }
];