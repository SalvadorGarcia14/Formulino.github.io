import { useState, useMemo } from "react";
import { useCareer } from "../../context/CareerContext.jsx";
import { generateSeasonOffers } from "../../services/contractEngine";
import StatBar from "../StatBar/StatBar";

function SeasonEndModal({ onClose }) {
  const { state, dispatch } = useCareer();
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  const { finalPosition, offers } = useMemo(() => {
    return generateSeasonOffers({
      pilot: state.pilot,
      seasonStandings: state.season.standings,
      currentTeamId: state.contract?.teamId,
      currentCategoryId: state.season?.categoryId || 1
    });
  }, [state.pilot, state.season.standings, state.contract?.teamId, state.season?.categoryId]);

  const rewards = useMemo(() => {
    const tierMultiplier = state.season.categoryId || 1;
    if (finalPosition === 1) return { money: 20000 * tierMultiplier, rep: 15, pop: 20, title: "👑 ¡CAMPEÓN DE LA TEMPORADA!" };
    if (finalPosition <= 3) return { money: 12000 * tierMultiplier, rep: 10, pop: 12, title: "🏆 ¡PODIO EN EL CAMPEONATO!" };
    if (finalPosition <= 5) return { money: 6000 * tierMultiplier, rep: 5, pop: 5, title: "Top 5 Consolidado" };
    return { money: 2000 * tierMultiplier, rep: 1, pop: 0, title: "Fin de Temporada" };
  }, [finalPosition, state.season.categoryId]);

  const selectedOffer = offers.find((o) => o.id === selectedOfferId);
  const canAfford = selectedOffer ? state.pilot.budget + rewards.money >= selectedOffer.costToEnter : false;

  const handleSignOffer = () => {
    if (!selectedOffer || !canAfford) return;

    dispatch({
      type: "ADVANCE_SEASON",
      payload: {
        chosenOffer: selectedOffer,
        finalPosition,
        prizeMoney: rewards.money,
        repGain: rewards.rep,
        popGain: rewards.pop
      }
    });
    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
      zIndex: 1100
    }}>
      <div className="game-card" style={{ maxWidth: "750px", width: "100%", maxHeight: "92vh", overflowY: "auto" }}>
        
        <div style={{ textAlign: "center", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "1.25rem", marginBottom: "1.5rem" }}>
          <span style={{ fontSize: "2.5rem" }}>{finalPosition === 1 ? "🏆" : "🏁"}</span>
          <h2 style={{ fontSize: "1.8rem", margin: "0.25rem 0" }}>{rewards.title}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Finalizaste en la <strong>Posición {finalPosition}</strong> del campeonato anual.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem" }}>
            <div style={{ backgroundColor: "var(--bg-accent)", padding: "0.5rem 1rem", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>PREMIO ECONÓMICO</span>
              <strong style={{ color: "var(--accent-emerald)" }}>+${rewards.money.toLocaleString()}</strong>
            </div>
            <div style={{ backgroundColor: "var(--bg-accent)", padding: "0.5rem 1rem", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>REPUTACIÓN</span>
              <strong style={{ color: "var(--accent-blue)" }}>+{rewards.rep} pts</strong>
            </div>
            <div style={{ backgroundColor: "var(--bg-accent)", padding: "0.5rem 1rem", borderRadius: "6px" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>POPULARIDAD</span>
              <strong style={{ color: "var(--accent-pink)" }}>+{rewards.pop} pts</strong>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", color: "var(--text-primary)" }}>
          📋 Ofertas de Contrato para el Próximo Año ({state.pilot.age + 1} años):
        </h3>

        <div style={{ display: "grid", gap: "0.85rem", marginBottom: "1.5rem" }}>
          {offers.map((offer) => {
            const isSelected = selectedOfferId === offer.id;
            const isPayDriver = offer.type === "PAY_DRIVER";
            const userFunds = state.pilot.budget + rewards.money;
            const unaffordable = isPayDriver && userFunds < offer.costToEnter;

            return (
              <div
                key={offer.id}
                onClick={() => !unaffordable && setSelectedOfferId(offer.id)}
                className={`game-card ${isSelected ? "selected" : ""}`}
                style={{
                  cursor: unaffordable ? "not-allowed" : "pointer",
                  opacity: unaffordable ? 0.5 : 1,
                  padding: "1rem",
                  borderColor: isSelected ? "var(--accent-blue)" : "var(--border-subtle)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "1.05rem" }}>
                      {offer.team.name}
                      <span style={{ fontSize: "0.75rem", marginLeft: "0.5rem", color: "var(--accent-amber)" }}>
                        ({offer.category.name})
                      </span>
                    </h4>
                    <p style={{ margin: "0.25rem 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      Rol: <strong>{offer.role}</strong> • {offer.description}
                    </p>
                  </div>
                  <div style={{ textAlign: "right", minWidth: "110px" }}>
                    {isPayDriver ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-red)", fontWeight: 700 }}>
                        Costo: -${offer.costToEnter.toLocaleString()}
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: 700 }}>
                        Salario: +${offer.salary.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginTop: "0.75rem" }}>
                  <StatBar label="Potencial del Auto" value={offer.team.performance} color="var(--accent-red)" />
                  <StatBar label="Fiabilidad Mecánica" value={offer.team.reliability} color="var(--accent-emerald)" />
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="btn btn-success"
          onClick={handleSignOffer}
          disabled={!selectedOfferId || !canAfford}
          style={{
            width: "100%",
            padding: "0.9rem",
            fontSize: "1rem",
            opacity: selectedOfferId && canAfford ? 1 : 0.4,
            cursor: selectedOfferId && canAfford ? "pointer" : "not-allowed"
          }}
        >
          {selectedOffer
            ? `Firmar con ${selectedOffer.team.name} y Comenzar Temporada ${state.season.year + 1} ✍️`
            : "Selecciona una oferta para firmar"}
        </button>
      </div>
    </div>
  );
}


export default SeasonEndModal;