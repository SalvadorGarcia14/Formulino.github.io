import { useCareer } from "../../context/CareerContext";
import StatBar from "../StatBar/StatBar";

const MAX_UPGRADE_LEVEL = 10;

function RndModal({ onClose }) {
  const { state, dispatch } = useCareer();
  const { pilot, contract } = state;

  // Si no hay contrato activo (por seguridad)
  if (!contract) return null;

  const carUpgrades = contract.carUpgrades || { performance: 0, reliability: 0 };
  const budget = pilot?.budget || 0;

  // Cálculo de costos exponenciales o progresivos
  // Rendimiento es más caro porque da ventaja directa en carrera
  const perfLevel = carUpgrades.performance;
  const relLevel = carUpgrades.reliability;

  const perfCost = 15000 + perfLevel * 8000;
  const relCost = 10000 + relLevel * 5000;

  // Manejadores de mejora
  const handleUpgrade = (upgradeType, cost) => {
    if (budget < cost) return;

    dispatch({
      type: "UPGRADE_TEAM_CAR",
      payload: {
        upgradeType,
        cost
      }
    });
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
      <div className="game-card glass-panel" style={{ maxWidth: "650px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
        
        {/* Cabecera del Centro de I+D */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.4rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              🔧 Centro de I+D & Mejoras del Monoplaza
            </h2>
            <p style={{ margin: "0.25rem 0 0 0", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              Presupuesto actual: <strong className="telemetry-text" style={{ color: "var(--accent-emerald)" }}>${budget.toLocaleString()}</strong>
            </p>
          </div>
          <button className="btn btn-danger" onClick={onClose} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
            Cerrar ✕
          </button>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Invierte capital de la escudería para desarrollar piezas aerodinámicas y optimizar la unidad de potencia. Las mejoras se reinician al cambiar de equipo o categoría al finalizar la temporada.
        </p>

        {/* Listado de Opciones de I+D */}
        <div style={{ display: "grid", gap: "1.25rem", marginBottom: "1.5rem" }}>
          
          {/* 1. Rendimiento del Motor / Chasis */}
          <div className="game-card" style={{ backgroundColor: "var(--bg-accent)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>
                  ⚡ Paquete de Potencia y Aerodinámica
                </h4>
                <p style={{ margin: "0.2rem 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Aumenta el ritmo base (Pace) del monoplaza en cada Gran Premio.
                </p>
                <span className="telemetry-text" style={{ fontSize: "0.75rem", color: "var(--accent-blue)" }}>
                  Nivel Actual: {perfLevel} / {MAX_UPGRADE_LEVEL}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                {perfLevel >= MAX_UPGRADE_LEVEL ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: 700 }}>MÁXIMO NIVEL</span>
                ) : (
                  <button
                    className="btn btn-primary"
                    disabled={budget < perfCost}
                    onClick={() => handleUpgrade("performance", perfCost)}
                    style={{
                      padding: "0.45rem 0.85rem",
                      fontSize: "0.8rem",
                      opacity: budget < perfCost ? 0.5 : 1
                    }}
                  >
                    Mejorar (-${perfCost.toLocaleString()})
                  </button>
                )}
              </div>
            </div>
            <StatBar label="Progreso de I+D (Performance)" value={perfLevel * 10} color="var(--accent-blue)" />
          </div>

          {/* 2. Fiabilidad Mecánica */}
          <div className="game-card" style={{ backgroundColor: "var(--bg-accent)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary)" }}>
                  🛡️ Refuerzo de Fiabilidad Mecánica
                </h4>
                <p style={{ margin: "0.2rem 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Reduce drásticamente la probabilidad de sufrir averías o accidentes mecánicos.
                </p>
                <span className="telemetry-text" style={{ fontSize: "0.75rem", color: "var(--accent-emerald)" }}>
                  Nivel Actual: {relLevel} / {MAX_UPGRADE_LEVEL}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                {relLevel >= MAX_UPGRADE_LEVEL ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--accent-emerald)", fontWeight: 700 }}>MÁXIMO NIVEL</span>
                ) : (
                  <button
                    className="btn btn-success"
                    disabled={budget < relCost}
                    onClick={() => handleUpgrade("reliability", relCost)}
                    style={{
                      padding: "0.45rem 0.85rem",
                      fontSize: "0.8rem",
                      opacity: budget < relCost ? 0.5 : 1
                    }}
                  >
                    Mejorar (-${relCost.toLocaleString()})
                  </button>
                )}
              </div>
            </div>
            <StatBar label="Progreso de I+D (Fiabilidad)" value={relLevel * 10} color="var(--accent-emerald)" />
          </div>

        </div>

      </div>
    </div>
  );
}

export default RndModal;