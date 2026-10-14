import { createContext, useContext, useReducer, useEffect, useMemo } from "react";
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
    totalRounds: 4,
    standings: [],
    resultsHistory: [],
    isCompleted: false,
    nemesis: null, // <-- Nuevo estado
    activeQuest: null
  },

  // Patrocinadores activos (piloto_sponsor)
  activeSponsors: [],

  // Historial global de trayectoria (para el sistema de legado)
  careerHistory: []
};

// --- FUNCIONES HELPER (Optimizan y limpian el reducer) ---

// Limita un valor numérico entre un mínimo y un máximo
const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

// Procesa la lógica de la rivalidad aislando la complejidad
const processNemesis = (currentNemesis, competitors, userPosition) => {
  let nemesis = currentNemesis;
  let bonusPop = 0;
  let bonusRep = 0;

  if (competitors && competitors.length > 0) {
    if (!nemesis) {
      const nemesisIndex = userPosition === 1 ? 1 : userPosition - 2;
      const chosenRival = competitors[nemesisIndex]?.name || competitors[1].name;
      nemesis = { name: chosenRival, score: 0 };
    }
    const nemesisPos = competitors.findIndex(c => c.name === nemesis.name) + 1;
    if (userPosition < nemesisPos) {
      nemesis = { ...nemesis, score: nemesis.score + 1 };
      bonusPop = 3;
      bonusRep = 2;
    } else {
      nemesis = { ...nemesis, score: nemesis.score - 1 };
    }
  }
  return { nemesis, bonusPop, bonusRep };
};

// Procesa la recompensa o castigo del micro-objetivo
const processQuest = (quest, userPosition, incident, competitors, nemesis) => {
  if (!quest) return { budget: 0, pop: 0, rep: 0, teamRel: 0 };
  
  let success = false;
  if (quest.type === 'POSITION') success = userPosition <= quest.target;
  else if (quest.type === 'CLEAN_RACE') success = !incident;
  else if (quest.type === 'BEAT_NEMESIS') {
    const nemesisPos = competitors.findIndex(c => c.name === nemesis?.name) + 1;
    success = userPosition < nemesisPos;
  }

  const result = success ? quest.reward : quest.penalty;
  return {
    budget: result.budget || 0,
    pop: result.pop || 0,
    rep: result.rep || 0,
    teamRel: result.teamRelationship || 0
  };
};

// --- REDUCER PRINCIPAL ---
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
          standings: generateInitialGrid(`${pilot.name} ${pilot.lastName}`)
        },
        activeSponsors: []
      };
    }

    case "SIGN_SPONSOR": {
      const sponsor = action.payload;
      if (state.activeSponsors.length >= 3 || state.activeSponsors.some(s => s.id === sponsor.id)) {
        return state;
      }
      return {
        ...state,
        pilot: { ...state.pilot, budget: state.pilot.budget + sponsor.signingBonus },
        activeSponsors: [...state.activeSponsors, { id: sponsor.id, name: sponsor.name, payoutPerRace: sponsor.payoutPerRace }]
      };
    }

    case "RELEASE_SPONSOR": {
      return {
        ...state,
        activeSponsors: state.activeSponsors.filter(s => s.id !== action.payload)
      };
    }

    case "COMPLETE_ROUND": {
      const { userPosition, circuitId, eventEffects, competitors, incident } = action.payload;
      const currentCategory = CATEGORIES.find(c => c.id === state.season.categoryId);
      const earnedPoints = currentCategory.pointsSystem[userPosition - 1] || 0;
      const sponsorEarnings = state.activeSponsors.reduce((sum, sp) => sum + sp.payoutPerRace, 0);

      // Actualizar Standings
      const updatedStandings = state.season.standings.map(driver => {
        if (driver.isUser) {
          return {
            ...driver,
            points: driver.points + earnedPoints,
            wins: driver.wins + (userPosition === 1 ? 1 : 0),
            podiums: driver.podiums + (userPosition <= 3 ? 1 : 0)
          };
        }
        return { ...driver, points: driver.points + Math.max(0, Math.floor(Math.random() * 12)) };
      }).sort((a, b) => b.points - a.points);

      // Procesar módulos paralelos (Némesis y Misiones) usando los Helpers
      const { nemesis, bonusPop: nemPop, bonusRep: nemRep } = processNemesis(state.season.nemesis, competitors, userPosition);
      const questEffects = processQuest(state.season.activeQuest, userPosition, incident, competitors, nemesis);

      // Calcular Deltas Finales
      let deltaPop = (userPosition <= 3 ? 8 : userPosition <= 6 ? 4 : -2) + nemPop + questEffects.pop + (eventEffects?.popularity || 0);
      let deltaRep = (userPosition <= 5 ? 5 : 0) + nemRep + questEffects.rep + (eventEffects?.reputation || 0);
      let deltaTeamRel = (userPosition <= 5 ? 4 : -2) + questEffects.teamRel + (eventEffects?.teamRelationship || 0);

      const nextRound = state.season.currentRound + 1;

      return {
        ...state,
        pilot: {
          ...state.pilot,
          popularity: clamp(state.pilot.popularity + deltaPop, 0, 100),
          reputation: clamp(state.pilot.reputation + deltaRep, 0, 100),
          budget: state.pilot.budget + sponsorEarnings + questEffects.budget + (eventEffects?.budget || 0),
          stats: {
            ...state.pilot.stats,
            mentality: clamp(state.pilot.stats.mentality + (eventEffects?.mentality || 0), 1, 100),
            technicalFeedback: clamp(state.pilot.stats.technicalFeedback + (eventEffects?.technicalFeedback || 0), 1, 100),
            consistency: clamp(state.pilot.stats.consistency + (eventEffects?.consistency || 0), 1, 100)
          }
        },
        contract: {
          ...state.contract,
          teamRelationship: clamp(state.contract.teamRelationship + deltaTeamRel, 0, 100)
        },
        season: {
          ...state.season,
          currentRound: nextRound,
          standings: updatedStandings,
          resultsHistory: [
            ...state.season.resultsHistory,
            { round: state.season.currentRound, circuitId, position: userPosition, points: earnedPoints }
          ],
          isCompleted: nextRound > state.season.totalRounds,
          nemesis,
          activeQuest: null
        }
      };
    }

    case "ADVANCE_SEASON": {
      const { chosenOffer, finalPosition, prizeMoney, repGain, popGain } = action.payload;
      const currentCategory = CATEGORIES.find(c => c.id === state.season.categoryId);
      const isCategoryChange = currentCategory.id !== chosenOffer.category.id;
      
      let nextPopularity = clamp(state.pilot.popularity + popGain, 0, 100);
      if (isCategoryChange) nextPopularity = Math.max(5, Math.floor(nextPopularity / 6));

      return {
        ...state,
        pilot: {
          ...state.pilot,
          age: state.pilot.age + 1,
          budget: state.pilot.budget + prizeMoney + chosenOffer.salary - chosenOffer.costToEnter,
          reputation: clamp(state.pilot.reputation + repGain, 0, 100),
          popularity: nextPopularity
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
          categoryId: chosenOffer.category.id,
          currentRound: 1,
          totalRounds: chosenOffer.category.racesPerSeason,
          standings: generateInitialGrid(`${state.pilot.name} ${state.pilot.lastName}`),
          resultsHistory: [],
          isCompleted: false
        },
        careerHistory: [...state.careerHistory, {
          year: state.season.year,
          categoryName: currentCategory.name,
          teamId: state.contract.teamId,
          finalPosition,
          wins: state.season.standings.find(s => s.isUser)?.wins || 0,
          podiums: state.season.standings.find(s => s.isUser)?.podiums || 0,
          points: state.season.standings.find(s => s.isUser)?.points || 0
        }]
      };
    }

    case "RESET_CAREER":
      clearGameData();
      return initialState;

    default:
      return state;
  }
}

export function CareerProvider({ children }) {
  const [state, dispatch] = useReducer(careerReducer, initialState, () => loadGameData() || initialState);

  useEffect(() => {
    if (state.pilot) saveGameData(state);
  }, [state]);

  // Se memoiza el contexto para evitar re-renders masivos en la UI si el estado no ha cambiado
  const contextValue = useMemo(() => ({ state, dispatch }), [state]);

  return (
    <CareerContext.Provider value={contextValue}>
      {children}
    </CareerContext.Provider>
  );
}

export function useCareer() {
  const context = useContext(CareerContext);
  if (!context) throw new Error("useCareer debe utilizarse dentro de un CareerProvider");
  return context;
}