
// Componente accesible para visualizar valores de 0 a 100 con indicador numérico.
function StatBar({ label, value, max = 100, color = "#3b82f6" }) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
        <span style={{ fontWeight: 600 }}>{label}</span>
        <span style={{ color: "#666" }}>{value} / {max}</span>
      </div>
      <div style={{ height: "8px", background: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${percentage}%`,
            background: color,
            transition: "width 0.3s ease"
          }}
        />
      </div>
    </div>
  );
}

export default StatBar;





