function StandingsTable({ standings }) {
  return (
    <div className="game-card glass-panel" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ 
        fontSize: "1.1rem", 
        marginBottom: "1rem", 
        borderBottom: "1px solid var(--border-subtle)", 
        paddingBottom: "0.5rem",
        display: "flex",
        alignItems: "center",
        gap: "8px" 
      }}>
        🏆 Tabla de Posiciones del Campeonato
      </h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ padding: "0.6rem 0.5rem" }}>Pos</th>
              <th style={{ padding: "0.6rem 0.5rem" }}>Piloto / Escudería</th>
              <th style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>Podios</th>
              <th style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>Victorias</th>
              <th style={{ padding: "0.6rem 0.5rem", textAlign: "right" }}>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((driver, index) => {
              const isLead = index === 0;
              const isUser = driver.isUser;

              return (
                <tr
                  key={driver.pilotName}
                  style={{
                    backgroundColor: isUser ? "rgba(59, 130, 246, 0.15)" : "transparent",
                    color: isUser ? "#fff" : "var(--text-secondary)",
                    fontWeight: isUser ? 700 : 400,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "background-color 0.2s ease"
                  }}
                >
                  <td style={{ padding: "0.7rem 0.5rem" }} className="telemetry-text">
                    {isLead ? "👑 1" : `${index + 1}`}
                  </td>
                  <td style={{ padding: "0.7rem 0.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ 
                        color: isUser ? "var(--accent-blue)" : "var(--text-primary)", 
                        fontWeight: isUser ? 700 : 600,
                        fontSize: "0.9rem"
                      }}>
                        {driver.pilotName} {isUser && "(Tú)"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {driver.teamName || (isUser ? "Tu Escudería" : "Piloto Independiente")}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "0.7rem 0.5rem", textAlign: "center" }} className="telemetry-text">
                    {driver.podiums}
                  </td>
                  <td style={{ padding: "0.7rem 0.5rem", textAlign: "center" }} className="telemetry-text">
                    {driver.wins}
                  </td>
                  <td style={{ padding: "0.7rem 0.5rem", textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }} className="telemetry-text">
                    {driver.points} pts
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StandingsTable;