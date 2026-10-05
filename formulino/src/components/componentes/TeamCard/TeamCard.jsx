import StatBar from "../StatBar/StatBar";

function TeamCard({ team, onSelect, isSelected }) {
  return (
    <div className={`game-card ${isSelected ? "selected" : ""}`} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)" }}>{team.name}</h3>
          <span style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem", borderRadius: "4px", backgroundColor: "#1e293b", color: "var(--accent-amber)" }}>
            Tier {team.categoryId}
          </span>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", minHeight: "2.8rem", lineHeight: 1.4 }}>
          {team.description}
        </p>

        <div style={{ margin: "1.25rem 0" }}>
          <StatBar label="Rendimiento del Chasis" value={team.performance} color="var(--accent-red)" />
          <StatBar label="Fiabilidad Mecánica" value={team.reliability} color="var(--accent-emerald)" />
          <StatBar label="Prestigio de Marca" value={team.prestige} color="var(--accent-blue)" />
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.25rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
          Presupuesto asignado: <strong style={{ color: "var(--accent-emerald)" }}>${team.budget.toLocaleString()}</strong>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(team.id)}
        className={`btn ${isSelected ? "btn-primary" : "btn"}`}
        style={{
          width: "100%",
          padding: "0.65rem 1rem",
          backgroundColor: isSelected ? undefined : "var(--bg-accent)",
          color: isSelected ? "#fff" : "var(--text-primary)",
          borderColor: isSelected ? "transparent" : "var(--border-subtle)"
        }}
      >
        {isSelected ? "Oferta Aceptada ✓" : "Firmar con el Equipo"}
      </button>
    </div>
  );
}

export default TeamCard;