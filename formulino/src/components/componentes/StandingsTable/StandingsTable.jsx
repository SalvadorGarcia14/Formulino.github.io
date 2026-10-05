function StandingsTable({ standings }) {
  return (
    <div className="game-card" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "0.5rem" }}>
        🏆 Tabla de Posiciones del Campeonato
      </h3>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
          <thead>
            <tr style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ padding: "0.5rem" }}>Pos</th>
              <th style={{ padding: "0.5rem" }}>Piloto</th>
              <th style={{ padding: "0.5rem", textAlign: "center" }}>Podios</th>
              <th style={{ padding: "0.5rem", textAlign: "center" }}>Victorias</th>
              <th style={{ padding: "0.5rem", textAlign: "right" }}>Puntos</th>
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
                    borderBottom: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <td style={{ padding: "0.6rem 0.5rem" }}>
                    {isLead ? "👑 1" : `${index + 1}`}
                  </td>
                  <td style={{ padding: "0.6rem 0.5rem", color: isUser ? "var(--accent-blue)" : "inherit" }}>
                    {driver.pilotName} {isUser && "(Tú)"}
                  </td>
                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>{driver.podiums}</td>
                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}>{driver.wins}</td>
                  <td style={{ padding: "0.6rem 0.5rem", textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>
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