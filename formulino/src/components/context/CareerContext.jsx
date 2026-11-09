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
      name: "Salvi",
      lastName: "Garcia",
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
      role: "Piloto Titular",
      carUpgrades: { performance: 0, reliability: 0 } // <-- I+D del coche actual
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
    nemesis: null,
    activeQuest: null
  },

  // Patrocinadores activos (piloto_sponsor)
  activeSponsors: [],

  // Historial global de trayectoria (sistema de legado)
  careerHistory: []
};

// --- FUNCIONES HELPER ---

// Limita un valor numérico entre un mínimo y un máximo
const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

// Procesa la lógica de la rivalidad adaptada a pilotName
const processNemesis = (currentNemesis, competitors, userPosition) => {
  let nemesis = currentNemesis;
  let bonusPop = 0;
  let bonusRep = 0;

  if (competitors && competitors.length > 0) {
    if (!nemesis) {
      const nemesisIndex = userPosition === 1 ? 1 : userPosition - 2;
      const chosenRival = competitors[nemesisIndex]?.pilotName || competitors[1]?.pilotName || "Rival";
      nemesis = { name: chosenRival, score: 0 };
    }
    const nemesisPos = competitors.findIndex(c => c.pilotName === nemesis.name) + 1;
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
    const nemesisPos = competitors.findIndex(c => c.pilotName === nemesis?.name) + 1;
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
      const startingCategory = CATEGORIES.find(c => c.id === 1) || CATEGORIES[0];
      return {
        ...initialState,
        pilot,
        contract: {
          teamId,
          salary: 0,
          seasonYear: 1,
          teamRelationship: 70,
          role: "Piloto Titular",
          carUpgrades: { performance: 0, reliability: 0 } // Inicializar mejoras de I+D
        },
        season: {
          ...initialState.season,
          categoryId: 1,
          totalRounds: startingCategory.racesPerSeason,
          standings: generateInitialGrid(`${pilot.name} ${pilot.lastName}`, 1, teamId)
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

    // --- NUEVO: SISTEMA DE COMPRAS E INVERSIÓN I+D ---
    case "UPGRADE_PILOT_STAT": {
      const { statKey, cost } = action.payload; // statKey: 'performance', 'consistency', etc.
      if (state.pilot.budget < cost) return state;

      const currentVal = state.pilot.stats[statKey] || 50;
      if (currentVal >= 99) return state; // Tope máximo

      return {
        ...state,
        pilot: {
          ...state.pilot,
          budget: state.pilot.budget - cost,
          stats: {
            ...state.pilot.stats,
            [statKey]: clamp(currentVal + 1, 1, 99)
          }
        }
      };
    }

    case "UPGRADE_TEAM_CAR": {
      const { upgradeType, cost } = action.payload; // upgradeType: 'performance' o 'reliability'
      if (state.pilot.budget < cost) return state;

      const currentUpgrades = state.contract?.carUpgrades || { performance: 0, reliability: 0 };
      if (currentUpgrades[upgradeType] >= 10) return state; // Límite de mejoras por contrato/temporada

      return {
        ...state,
        pilot: {
          ...state.pilot,
          budget: state.pilot.budget - cost
        },
        contract: {
          ...state.contract,
          carUpgrades: {
            ...currentUpgrades,
            [upgradeType]: currentUpgrades[upgradeType] + 1
          }
        }
      };
    }
    // ------------------------------------------------

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

      // Procesar módulos paralelos (Némesis y Misiones)
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
          role: chosenOffer.role,
          carUpgrades: { performance: 0, reliability: 0 } // Reiniciar I+D al cambiar o renovar contrato con nuevo coche
        },
        season: {
          year: state.season.year + 1,
          categoryId: chosenOffer.category.id,
          currentRound: 1,
          totalRounds: chosenOffer.category.racesPerSeason,
          // Aquí se inyectan los pilotos y se desplaza al compañero correspondiente según el teamId elegido
          standings: generateInitialGrid(`${state.pilot.name} ${state.pilot.lastName}`, chosenOffer.category.id, chosenOffer.team.id),
          resultsHistory: [],
          isCompleted: false,
          nemesis: null,
          activeQuest: null
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