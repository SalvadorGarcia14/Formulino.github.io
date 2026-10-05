import { useCareer } from "../../context/CareerContext";    
import { SPONSORS } from "../../data/sponsors";

function SponsorModal({ onClose }) {
  const { state, dispatch } = useCareer();
  const { pilot, activeSponsors } = state;

  const handleSign = (sponsor) => {
    dispatch({ type: "SIGN_SPONSOR", payload: sponsor });
  };

  const handleRelease = (sponsorId) => {
    dispatch({ type: "RELEASE_SPONSOR", payload: sponsorId });
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
      <div className="game-card" style={{ maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>🤝 Departamento Comercial & Sponsors</h2>
            <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Popularidad actual: <strong style={{ color: "var(--accent-pink)" }}>{pilot.popularity}/100</strong> • Espacios: <strong>{activeSponsors.length}/3</strong>
            </p>
          </div>
          <button className="btn btn-danger" onClick={onClose} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
            Cerrar ✕
          </button>
        </div>

        {/* Sponsors Activos */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            Patrocinadores en el Mono / Auto
          </h4>
          {activeSponsors.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
              No tienes patrocinadores activos. Acepta ofertas abajo para recibir ingresos por carrera.
            </p>
          ) : (
            <div style={{ display: "grid", gap: "0.5rem" }}>
              {activeSponsors.map((sp) => (
                <div
                  key={sp.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.65rem 0.85rem",
                    backgroundColor: "var(--bg-accent)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border-subtle)"
                  }}
                >
                  <div>
                    <strong>{sp.name}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", marginLeft: "0.75rem" }}>
                      +${sp.payoutPerRace.toLocaleString()} / carrera
                    </span>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleRelease(sp.id)}
                    style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                  >
                    Rescindir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mercado de Patrocinios */}
        <div>
          <h4 style={{ fontSize: "0.9rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Marcas Interesadas
          </h4>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {SPONSORS.map((sp) => {
              const isSigned = activeSponsors.some((s) => s.id === sp.id);
              const isUnlocked = pilot.popularity >= sp.minPopularity;
              const isSlotsFull = activeSponsors.length >= 3;

              return (
                <div
                  key={sp.id}
                  style={{
                    padding: "0.85rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: isSigned ? "#132338" : "var(--bg-card)",
                    border: isSigned ? "1px solid var(--accent-blue)" : "1px solid var(--border-subtle)",
                    opacity: !isUnlocked ? 0.45 : 1
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1rem" }}>
                        {sp.name} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>({sp.sector})</span>
                      </h4>
                      <p style={{ margin: "0.2rem 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {sp.description}
                      </p>
                      <div style={{ fontSize: "0.8rem", marginTop: "0.4rem" }}>
                        Bono de firma: <strong style={{ color: "var(--accent-emerald)" }}>+${sp.signingBonus.toLocaleString()}</strong> • 
                        Por carrera: <strong style={{ color: "var(--accent-blue)" }}>+${sp.payoutPerRace.toLocaleString()}</strong>
                      </div>
                    </div>

                    <div>
                      {isSigned ? (
                        <span style={{ fontSize: "0.8rem", color: "var(--accent-blue)", fontWeight: 600 }}>Activo ✓</span>
                      ) : !isUnlocked ? (
                        <span style={{ fontSize: "0.75rem", color: "var(--accent-amber)" }}>
                          Requiere {sp.minPopularity} Pop
                        </span>
                      ) : (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleSign(sp)}
                          disabled={isSlotsFull}
                          style={{ padding: "0.4rem 0.75rem", fontSize: "0.8rem", opacity: isSlotsFull ? 0.5 : 1 }}
                        >
                          {isSlotsFull ? "Espacios Llenos" : "Firmar Contrato"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SponsorModal;