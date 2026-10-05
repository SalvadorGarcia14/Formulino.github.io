import { TEAMS } from "../data/teams.jsx";
import { CATEGORIES } from "../data/categories.jsx";


export function generateSeasonOffers({ pilot, seasonStandings, currentTeamId, currentCategoryId = 1 }) {
  const userStandingIndex = seasonStandings.findIndex((s) => s.isUser);
  const finalPosition = userStandingIndex !== -1 ? userStandingIndex + 1 : 10;

  const currentCategory = CATEGORIES.find((c) => c.id === currentCategoryId) || CATEGORIES[0];
  const nextCategoryId = Math.min(currentCategory.id + 1, CATEGORIES.length);
  const nextCategory = CATEGORIES.find((c) => c.id === nextCategoryId);

  const currentTierTeams = TEAMS.filter((t) => t.categoryId === currentCategory.id);
  const nextTierTeams = TEAMS.filter((t) => t.categoryId === nextCategoryId);

  const offers = [];

  // 1. Renovación en el equipo actual (si existe en la categoría)
  const stayTeam = currentTierTeams.find((t) => t.id === currentTeamId) || currentTierTeams[0];
  offers.push({
    id: `offer_renewal_${stayTeam.id}_cat${currentCategory.id}`,
    team: stayTeam,
    category: currentCategory,
    type: "RENEWAL",
    role: finalPosition <= 3 ? "Primer Piloto" : "Piloto Titular",
    salary: currentCategory.id * 3000,
    costToEnter: 0,
    description: `Renovación para continuar un año más en ${currentCategory.name}.`
  });

  // 2. Oferta alternativa dentro de la misma categoría
  const altTeam = currentTierTeams.find((t) => t.id !== currentTeamId) || currentTierTeams[1];
  if (altTeam) {
    offers.push({
      id: `offer_alt_${altTeam.id}_cat${currentCategory.id}`,
      team: altTeam,
      category: currentCategory,
      type: "TRANSFER_SAME_TIER",
      role: "Piloto Titular",
      salary: currentCategory.id * 3500,
      costToEnter: 0,
      description: `Cambio de escudería para buscar un nuevo rendimiento en ${currentCategory.name}.`
    });
  }

  // 3. Ofertas hacia la categoría superior (si no estamos en el tope)
  if (nextCategory && nextCategory.id !== currentCategory.id) {
    const qualifyForPromotion = finalPosition <= 3 || pilot.reputation >= (currentCategory.id * 20);

    nextTierTeams.forEach((team) => {
      if (qualifyForPromotion) {
        offers.push({
          id: `offer_promo_${team.id}_cat${nextCategory.id}`,
          team: team,
          category: nextCategory,
          type: "PROMOTION",
          role: "Piloto Promesa",
          salary: nextCategory.id * 5000,
          costToEnter: 0,
          description: `Ascenso por mérito deportivo a ${nextCategory.name} tras tu rendimiento (P${finalPosition}).`
        });
      } else {
        const requiredBudget = nextCategory.id * 15000;
        offers.push({
          id: `offer_pay_${team.id}_cat${nextCategory.id}`,
          team: team,
          category: nextCategory,
          type: "PAY_DRIVER",
          role: "Piloto de Pago",
          salary: 0,
          costToEnter: requiredBudget,
          description: `Asiento condicionado a un patrocinio personal de $${requiredBudget.toLocaleString()} para competir en ${nextCategory.name}.`
        });
      }
    });
  }

  return {
    finalPosition,
    offers
  };
}