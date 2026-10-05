
// Componente accesible para visualizar valores de 0 a 100 con indicador numérico.
function StatBar({ label, value, max = 100, color = "var(--accent-blue)" }) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="stat-bar-container">
      <div className="stat-bar-header">
        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{label}</span>
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{value}</span>
      </div>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}

export default StatBar;





