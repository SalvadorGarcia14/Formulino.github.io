import { createContext, useContext, useReducer, useEffect } from "react";
import { loadGameData, saveGameData, clearGameData } from "../utils/storage";

const CareerContext = createContext(null);

const initialState = {
  // Entidad Piloto
  pilot: null,
  /*
    Estructura esperada:
    {
      name: "Juan",
      lastName: "Pérez",
      nationality: "Argentina",
      number: 14,
      age: 16,
      gender: "M",
      drivingStyle: "Equilibrado", // Agresivo, Consistente, Calculador
      stats: {
        performance: 55,
        consistency: 50,
        mentality: 50,
        technicalFeedback: 45,
        risk: 50
      },
      popularity: 30,
      reputation: 35,
      budget: 5000,
      isRetired: false
    }
  */

  // Entidad Contrato_Piloto
  contract: null,
  /*
    {
      teamId: 101,
      salary: 0,
      seasonYear: 1,
      teamRelationship: 75,
      role: "Piloto 2"
    }
  */

  // Entidad Temporada
  season: {
    year: 1,
    categoryId: 1,
    currentRound: 1,
    totalRounds: 6,
    standings: [], // [{ pilotId, name, points, wins, podiums }]
    resultsHistory: [], // Entidad Resultado [{ round, circuitId, position, points }]
    isCompleted: false
  },

  // Patrocinadores activos (piloto_sponsor)
  activeSponsors: [],

  // Historial global de trayectoria (para el sistema de legado)
  careerHistory: []
};

function careerReducer(state, action) {
  switch (action.type) {
    case "INIT_CAREER": {
      const { pilot, teamId } = action.payload;
      return {
        ...initialState,
        pilot,
        contract: {
          teamId,
          salary: 0,
          seasonYear: 1,
          teamRelationship: 70,
          role: "Piloto Titular"
        },
        season: {
          ...initialState.season,
          standings: [
            { pilotName: `${pilot.name} ${pilot.lastName}`, isUser: true, points: 0, wins: 0, podiums: 0 },
            { pilotName: "Rival 1", isUser: false, points: 0, wins: 0, podiums: 0 },
            { pilotName: "Rival 2", isUser: false, points: 0, wins: 0, podiums: 0 },
            { pilotName: "Rival 3", isUser: false, points: 0, wins: 0, podiums: 0 }
          ]
        }
      };
    }

    case "RESET_CAREER": {
      clearGameData();
      return initialState;
    }

    default:
      return state;
  }
}

export function CareerProvider({ children }) {
  const [state, dispatch] = useReducer(careerReducer, initialState, () => {
    const saved = loadGameData();
    return saved || initialState;
  });

  useEffect(() => {
    if (state.pilot) {
      saveGameData(state);
    }
  }, [state]);

  return (
    <CareerContext.Provider value={{ state, dispatch }}>
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) {
    throw new Error("useCareer debe utilizarse dentro de un CareerProvider");
  }
  return context;
}