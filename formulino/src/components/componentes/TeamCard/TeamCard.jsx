import StatBar from "../StatBar/StatBar";

function TeamCard({ team, onSelect, isSelected }) {
return (
    <div
      style={{
        border: isSelected ? "2px solid #2563eb" : "1px solid #d1d5db",
        borderRadius: "8px",
        padding: "1.25rem",
        backgroundColor: isSelected ? "#eff6ff" : "#ffffff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
      }}
    >
      <div>
        <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem" }}>{team.name}</h3>
        <p style={{ fontSize: "0.85rem", color: "#4b5563", minHeight: "2.5rem" }}>
          {team.description}
        </p>

        <div style={{ margin: "1rem 0" }}>
          <StatBar label="Rendimiento del Auto" value={team.performance} color="#ef4444" />
          <StatBar label="Fiabilidad Mecánica" value={team.reliability} color="#10b981" />
          <StatBar label="Prestigio del Equipo" value={team.prestige} color="#8b5cf6" />
        </div>

        <div style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "1rem" }}>
          <strong>Presupuesto inicial asignado:</strong> ${team.budget.toLocaleString()}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelect(team.id)}
        style={{
          width: "100%",
          padding: "0.6rem 1rem",
          borderRadius: "6px",
          border: "none",
          backgroundColor: isSelected ? "#2563eb" : "#374151",
          color: "#ffffff",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        {isSelected ? "Seleccionado ✓" : "Firmar Contrato"}
      </button>
    </div>
  );
}

export default TeamCard;