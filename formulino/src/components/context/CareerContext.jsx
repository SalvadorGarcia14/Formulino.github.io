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
      const { userPosition, circuitId, eventEffects, competitors, incident } = action.payload; // Recibe incident

      const currentCategory = CATEGORIES.find((c) => c.id === state.season.categoryId);
      const pointsTable = currentCategory.pointsSystem;
      const earnedPoints = pointsTable[userPosition - 1] || 0;

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
        return { ...driver, points: driver.points + rivalPoints };
      });

      updatedStandings.sort((a, b) => b.points - a.points);

      // --- INICIO LÓGICA DE NÉMESIS ---
      let currentNemesis = state.season.nemesis;
      let bonusPop = 0;
      let bonusRep = 0;

      if (competitors && competitors.length > 0) {
        if (!currentNemesis) {
          const nemesisIndex = userPosition === 1 ? 1 : userPosition - 2;
          const chosenRival = competitors[nemesisIndex]?.name || competitors[1].name;
          currentNemesis = { name: chosenRival, score: 0 };
        }
        const nemesisPos = competitors.findIndex(c => c.name === currentNemesis.name) + 1;
        if (userPosition < nemesisPos) {
          currentNemesis = { ...currentNemesis, score: currentNemesis.score + 1 };
          bonusPop += 3;
          bonusRep += 2;
        } else {
          currentNemesis = { ...currentNemesis, score: currentNemesis.score - 1 };
        }
      }
      // --- FIN LÓGICA DE NÉMESIS ---

      // --- INICIO LÓGICA DE MICRO-OBJETIVO ---
      let questBonusPop = 0;
      let questBonusRep = 0;
      let questBonusBudget = 0;
      let questBonusTeamRel = 0;

      if (state.season.activeQuest) {
        const q = state.season.activeQuest;
        let success = false;

        if (q.type === 'POSITION') {
          success = userPosition <= q.target;
        } else if (q.type === 'CLEAN_RACE') {
          success = !incident; // Usa la variable de incidente enviada desde RaceModal
        } else if (q.type === 'BEAT_NEMESIS') {
          const nemesisPos = competitors.findIndex(c => c.name === currentNemesis?.name) + 1;
          success = userPosition < nemesisPos;
        }

        if (success) {
          questBonusBudget = q.reward.budget || 0;
          questBonusPop = q.reward.pop || 0;
          questBonusRep = q.reward.rep || 0;
          questBonusTeamRel = q.reward.teamRelationship || 0;
        } else {
          questBonusBudget = q.penalty.budget || 0;
          questBonusPop = q.penalty.pop || 0;
          questBonusRep = q.penalty.rep || 0;
          questBonusTeamRel = q.penalty.teamRelationship || 0;
        }
      }
      // --- FIN LÓGICA DE MICRO-OBJETIVO ---

      let deltaPop = (userPosition <= 3 ? 8 : (userPosition <= 6 ? 4 : -2)) + bonusPop + questBonusPop;
      let deltaRep = (userPosition <= 5 ? 5 : 0) + bonusRep + questBonusRep;
      let deltaTeamRel = (userPosition <= 5 ? 4 : -2) + questBonusTeamRel;

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
          budget: state.pilot.budget + sponsorEarnings + questBonusBudget + (eventEffects?.budget || 0),
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
          isCompleted: isSeasonEnd,
          nemesis: currentNemesis,
          activeQuest: null // Se reinicia tras cada carrera
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