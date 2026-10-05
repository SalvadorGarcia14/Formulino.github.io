import { createContext, useContext, useReducer, useEffect } from "react";
import { loadGameData, saveGameData, clearGameData } from "../utils/storage";
import { generateInitialGrid } from "../services/gameEngine.jsx";
import { CATEGORIES } from "../data/categories.jsx";

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
      const initialStandings = generateInitialGrid(`${pilot.name} ${pilot.lastName}`);
      
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
          standings: initialStandings
        },
        activeSponsors: []
      };
    }

    case "SIGN_SPONSOR": {
      const sponsor = action.payload;
      if (state.activeSponsors.length >= 3) return state; // Máximo 3 sponsors
      if (state.activeSponsors.some((s) => s.id === sponsor.id)) return state;

      return {
        ...state,
        pilot: {
          ...state.pilot,
          budget: state.pilot.budget + sponsor.signingBonus
        },
        activeSponsors: [
          ...state.activeSponsors,
          { id: sponsor.id, name: sponsor.name, payoutPerRace: sponsor.payoutPerRace }
        ]
      };
    }

    case "RELEASE_SPONSOR": {
      const sponsorId = action.payload;
      return {
        ...state,
        activeSponsors: state.activeSponsors.filter((s) => s.id !== sponsorId)
      };
    }

    case "COMPLETE_ROUND": {
      const { userPosition, circuitId, eventEffects } = action.payload;
      const currentCategory = CATEGORIES.find((c) => c.id === state.season.categoryId);
      const pointsTable = currentCategory.pointsSystem;
      const earnedPoints = pointsTable[userPosition - 1] || 0;

      // Cálculo de cobros de sponsors por carrera
      const sponsorEarnings = state.activeSponsors.reduce((sum, sp) => sum + sp.payoutPerRace, 0);

      const updatedStandings = state.season.standings.map((driver) => {
        if (driver.isUser) {
          return {
            ...driver,
            points: driver.points + earnedPoints,
            wins: driver.wins + (userPosition === 1 ? 1 : 0),
            podiums: driver.podiums + (userPosition <= 3 ? 1 : 0)
          };
        }
        const rivalPoints = Math.max(0, Math.floor(Math.random() * 12));
        return {
          ...driver,
          points: driver.points + rivalPoints
        };
      });

      updatedStandings.sort((a, b) => b.points - a.points);

      let deltaPop = userPosition <= 3 ? 8 : (userPosition <= 6 ? 4 : -2);
      let deltaRep = userPosition <= 5 ? 5 : 0;
      let deltaTeamRel = userPosition <= 5 ? 4 : -2;

      if (eventEffects) {
        if (eventEffects.popularity) deltaPop += eventEffects.popularity;
        if (eventEffects.reputation) deltaRep += eventEffects.reputation;
        if (eventEffects.teamRelationship) deltaTeamRel += eventEffects.teamRelationship;
      }

      const nextRound = state.season.currentRound + 1;
      const isSeasonEnd = nextRound > state.season.totalRounds;

      return {
        ...state,
        pilot: {
          ...state.pilot,
          popularity: Math.min(100, Math.max(0, state.pilot.popularity + deltaPop)),
          reputation: Math.min(100, Math.max(0, state.pilot.reputation + deltaRep)),
          budget: state.pilot.budget + sponsorEarnings + (eventEffects?.budget || 0),
          stats: {
            ...state.pilot.stats,
            mentality: Math.min(100, Math.max(1, state.pilot.stats.mentality + (eventEffects?.mentality || 0))),
            technicalFeedback: Math.min(100, Math.max(1, state.pilot.stats.technicalFeedback + (eventEffects?.technicalFeedback || 0))),
            consistency: Math.min(100, Math.max(1, state.pilot.stats.consistency + (eventEffects?.consistency || 0)))
          }
        },
        contract: {
          ...state.contract,
          teamRelationship: Math.min(100, Math.max(0, state.contract.teamRelationship + deltaTeamRel))
        },
        season: {
          ...state.season,
          currentRound: nextRound,
          standings: updatedStandings,
          resultsHistory: [
            ...state.season.resultsHistory,
            { round: state.season.currentRound, circuitId, position: userPosition, points: earnedPoints }
          ],
          isCompleted: isSeasonEnd
        }
      };
    }

    case "ADVANCE_SEASON": {
      const { chosenOffer, finalPosition, prizeMoney, repGain, popGain } = action.payload;
      const currentCategory = CATEGORIES.find((c) => c.id === state.season.categoryId);
      const newCategory = chosenOffer.category;

      const archivedSeason = {
        year: state.season.year,
        categoryName: currentCategory.name,
        teamId: state.contract.teamId,
        finalPosition,
        wins: state.season.standings.find((s) => s.isUser)?.wins || 0,
        podiums: state.season.standings.find((s) => s.isUser)?.podiums || 0,
        points: state.season.standings.find((s) => s.isUser)?.points || 0
      };

      const newGrid = generateInitialGrid(`${state.pilot.name} ${state.pilot.lastName}`);

      return {
        ...state,
        pilot: {
          ...state.pilot,
          age: state.pilot.age + 1,
          budget: state.pilot.budget + prizeMoney + chosenOffer.salary - chosenOffer.costToEnter,
          reputation: Math.min(100, state.pilot.reputation + repGain),
          popularity: Math.min(100, state.pilot.popularity + popGain)
        },
        contract: {
          teamId: chosenOffer.team.id,
          salary: chosenOffer.salary,
          seasonYear: state.season.year + 1,
          teamRelationship: 75,
          role: chosenOffer.role
        },
        season: {
          year: state.season.year + 1,
          categoryId: newCategory.id,
          currentRound: 1,
          totalRounds: newCategory.racesPerSeason,
          standings: newGrid,
          resultsHistory: [],
          isCompleted: false
        },
        careerHistory: [...state.careerHistory, archivedSeason]
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