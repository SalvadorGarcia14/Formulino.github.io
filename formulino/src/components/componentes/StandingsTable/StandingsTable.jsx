import React, { useEffect, useRef } from "react";

function StandingsTable({ standings }) {
  const scrollContainerRef = useRef(null);
  const userRowRef = useRef(null);
  const theadRef = useRef(null);

  // Encontramos el índice del usuario para mostrarlo en el encabezado (Visibilidad)
  const userIndex = standings.findIndex((driver) => driver.isUser);
  const userPosition = userIndex !== -1 ? userIndex + 1 : null;

  // Función para posicionar la fila del usuario como la primera visible debajo del encabezado
  const scrollToUser = () => {
    if (scrollContainerRef.current && userRowRef.current) {
      const headerHeight = theadRef.current ? theadRef.current.offsetHeight : 42;
      const rowTop = userRowRef.current.offsetTop;

      // Usamos scrollTo en el contenedor para no mover el scroll de toda la página web
      scrollContainerRef.current.scrollTo({
        top: rowTop - headerHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToUser();
  }, [standings]);

  return (
    <div className="game-card glass-panel" style={{ marginTop: "1.5rem" }}>
      {/* Encabezado de la tarjeta con indicador rápido de posición */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.75rem",
          borderBottom: "1px solid var(--border-subtle)",
          paddingBottom: "0.5rem",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <h3
          style={{
            fontSize: "1.1rem",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🏆 Tabla de Posiciones del Campeonato
        </h3>

        {/* VISIBILIDAD: Badge interactivo que informa tu puesto al instante y permite volver a él */}
        {userPosition && (
          <button
            onClick={scrollToUser}
            title="Hacer clic para centrar tu posición"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              border: "1px solid var(--accent-blue)",
              color: "var(--text-primary)",
              padding: "0.25rem 0.6rem",
              borderRadius: "6px",
              fontSize: "0.78rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "background-color 0.2s ease",
            }}
          >
            <span>📍 Tu Posición: #{userPosition}</span>
            <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
              / {standings.length}
            </span>
          </button>
        )}
      </div>

      {/* Contenedor con scroll vertical limitado a ~5 filas (aprox. 280px + 42px del header) */}
      <div
        ref={scrollContainerRef}
        style={{
          maxHeight: "322px",
          overflowY: "auto",
          overflowX: "auto",
          position: "relative",
          scrollbarWidth: "thin",
          scrollbarColor: "var(--accent-blue) rgba(255, 255, 255, 0.05)",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.85rem",
            textAlign: "left",
          }}
        >
          {/* VISIBILIDAD: Encabezado fijo (Sticky) para no perder referencia de las columnas al bajar al puesto 10 */}
          <thead
            ref={theadRef}
            style={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: "rgba(15, 23, 42, 0.95)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            <tr
              style={{
                color: "var(--text-muted)",
                borderBottom: "1px solid var(--border-subtle)",
              }}
            >
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
                  ref={isUser ? userRowRef : null}
                  style={{
                    height: "56px", // Altura uniforme para garantizar que entren exactamente 5 filas
                    backgroundColor: isUser
                      ? "rgba(59, 130, 246, 0.18)"
                      : "transparent",
                    color: isUser ? "#fff" : "var(--text-secondary)",
                    fontWeight: isUser ? 700 : 400,
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    borderLeft: isUser
                      ? "4px solid var(--accent-blue)"
                      : "4px solid transparent",
                    transition: "background-color 0.2s ease",
                  }}
                >
                  <td style={{ padding: "0.6rem 0.5rem" }} className="telemetry-text">
                    {isLead ? "👑 1" : `${index + 1}`}
                  </td>
                  <td style={{ padding: "0.6rem 0.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span
                        style={{
                          color: isUser ? "var(--accent-blue)" : "var(--text-primary)",
                          fontWeight: isUser ? 700 : 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        {driver.pilotName} {isUser && "(Tú)"}
                      </span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {driver.teamName ||
                          (isUser ? "Tu Escudería" : "Piloto Independiente")}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}
                    className="telemetry-text"
                  >
                    {driver.podiums}
                  </td>
                  <td
                    style={{ padding: "0.6rem 0.5rem", textAlign: "center" }}
                    className="telemetry-text"
                  >
                    {driver.wins}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem 0.5rem",
                      textAlign: "right",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                    }}
                    className="telemetry-text"
                  >
                    {driver.points} pts
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* VISIBILIDAD: Pie informativo que indica que la lista es deslizable */}
      {standings.length > 5 && (
        <div
          style={{
            marginTop: "0.5rem",
            paddingTop: "0.4rem",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
          }}
        >
          <span>Mostrando 5 de {standings.length} pilotos</span>
          <span>↕ Desliza la tabla para ver el resto</span>
        </div>
      )}
    </div>
  );
}

export default StandingsTable;