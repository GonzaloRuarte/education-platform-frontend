import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
  ComposedChart, Cell, Rectangle
} from "recharts";

// --- Mock data (esto vendría de tu Django API) ---
const MOCK_DATA = {
  escuela: { id: 123, nombre: "Escuela Benito Juárez", region: "Norte" },
  periodo: "2025-2",
  metricas: {
    puntajes_por_materia: [
      { materia: "Matemáticas", promedio_escuela: 72.5, promedio_regional: 68.3, promedio_nacional: 65.1, semaforo: "verde" },
      { materia: "Lectura", promedio_escuela: 58.2, promedio_regional: 62.0, promedio_nacional: 64.8, semaforo: "rojo" },
      { materia: "Ciencias", promedio_escuela: 70.1, promedio_regional: 69.5, promedio_nacional: 67.2, semaforo: "amarillo" },
      { materia: "Historia", promedio_escuela: 65.8, promedio_regional: 63.2, promedio_nacional: 62.0, semaforo: "verde" },
      { materia: "Inglés", promedio_escuela: 55.0, promedio_regional: 60.4, promedio_nacional: 61.2, semaforo: "rojo" },
    ],
    tendencia: [
      { periodo: "2024-1", promedio: 62.4 },
      { periodo: "2024-2", promedio: 64.8 },
      { periodo: "2025-1", promedio: 67.1 },
      { periodo: "2025-2", promedio: 71.3 },
    ],
    distribucion: {
      "Matemáticas": [
        { rango: "0-20", frecuencia: 2 }, { rango: "21-40", frecuencia: 5 },
        { rango: "41-60", frecuencia: 18 }, { rango: "61-80", frecuencia: 42 },
        { rango: "81-100", frecuencia: 13 },
      ],
      "Lectura": [
        { rango: "0-20", frecuencia: 5 }, { rango: "21-40", frecuencia: 12 },
        { rango: "41-60", frecuencia: 30 }, { rango: "61-80", frecuencia: 25 },
        { rango: "81-100", frecuencia: 8 },
      ],
    },
    boxplots: [
      { materia: "Matemáticas", min: 12, q1: 55, median: 72, q3: 83, max: 98 },
      { materia: "Lectura", min: 8, q1: 42, median: 58, q3: 71, max: 92 },
      { materia: "Ciencias", min: 20, q1: 58, median: 70, q3: 80, max: 95 },
      { materia: "Historia", min: 15, q1: 50, median: 66, q3: 78, max: 94 },
      { materia: "Inglés", min: 10, q1: 38, median: 55, q3: 68, max: 88 },
    ],
  },
};

// --- Colors & Theme ---
const COLORS = {
  escuela: "#2563eb",
  regional: "#94a3b8",
  nacional: "#cbd5e1",
  verde: "#16a34a",
  amarillo: "#ca8a04",
  rojo: "#dc2626",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
  histBar: "#6366f1",
  boxFill: "#dbeafe",
  boxStroke: "#2563eb",
  trendLine: "#2563eb",
  trendDot: "#1d4ed8",
};

const FONT = "'Segoe UI', system-ui, -apple-system, sans-serif";

// --- Semáforo Component ---
function Semaforo({ color, materia, puntaje }) {
  const bgMap = { verde: "#dcfce7", amarillo: "#fef9c3", rojo: "#fee2e2" };
  const fgMap = { verde: COLORS.verde, amarillo: COLORS.amarillo, rojo: COLORS.rojo };
  const labelMap = { verde: "Por encima", amarillo: "Dentro de lo esperado", rojo: "Por debajo" };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px", borderRadius: 10,
      background: bgMap[color], border: `1px solid ${fgMap[color]}22`,
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: "50%",
        background: fgMap[color], flexShrink: 0,
        boxShadow: `0 0 8px ${fgMap[color]}66`,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.text }}>{materia}</div>
        <div style={{ fontSize: 12, color: COLORS.textMuted }}>{labelMap[color]}</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 18, color: fgMap[color] }}>
        {puntaje.toFixed(1)}
      </div>
    </div>
  );
}

// --- Card wrapper ---
function Card({ title, children, span }) {
  return (
    <div style={{
      background: COLORS.card, borderRadius: 14,
      border: `1px solid ${COLORS.border}`,
      padding: "24px 24px 20px",
      gridColumn: span ? `span ${span}` : undefined,
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <h3 style={{
        margin: "0 0 18px", fontSize: 15, fontWeight: 600,
        color: COLORS.textMuted, letterSpacing: 0.3,
        textTransform: "uppercase", fontFamily: FONT,
      }}>{title}</h3>
      {children}
    </div>
  );
}

// --- Boxplot as horizontal bars using Recharts ---
function BoxplotChart({ data }) {
  const chartData = data.map(d => ({
    materia: d.materia,
    base: d.min,
    lowerWhisker: d.q1 - d.min,
    iqr: d.q3 - d.q1,
    upperWhisker: d.max - d.q3,
    median: d.median,
    q1: d.q1,
    q3: d.q3,
    min: d.min,
    max: d.max,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 5, bottom: 5 }}>
        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: COLORS.textMuted }} />
        <YAxis type="category" dataKey="materia" width={90} tick={{ fontSize: 12, fill: COLORS.text }} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{
                background: "#fff", border: `1px solid ${COLORS.border}`,
                borderRadius: 8, padding: "10px 14px", fontSize: 13, lineHeight: 1.6,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.materia}</div>
                <div>Mín: {d.min} · Q1: {d.q1} · Mediana: {d.median} · Q3: {d.q3} · Máx: {d.max}</div>
              </div>
            );
          }}
        />
        <Bar dataKey="base" stackId="box" fill="transparent" />
        <Bar dataKey="lowerWhisker" stackId="box" fill={COLORS.boxFill} stroke={COLORS.boxStroke} strokeWidth={1} radius={0} />
        <Bar dataKey="iqr" stackId="box" fill={COLORS.boxFill} stroke={COLORS.boxStroke} strokeWidth={1.5} radius={0} />
        <Bar dataKey="upperWhisker" stackId="box" fill={COLORS.boxFill} stroke={COLORS.boxStroke} strokeWidth={1} radius={0} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// --- Main Dashboard ---
export default function ReporteEscuela() {
  const [data, setData] = useState(null);
  const [materiaHist, setMateriaHist] = useState("Matemáticas");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // En producción: fetch(`/api/reportes/escuela/${escuelaId}/`)
    setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 600);
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: COLORS.bg, fontFamily: FONT,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: `3px solid ${COLORS.border}`,
            borderTopColor: COLORS.escuela, borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 16px",
          }} />
          <div style={{ color: COLORS.textMuted, fontSize: 15 }}>Cargando reporte...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  const { escuela, periodo, metricas } = data;

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, fontFamily: FONT }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
        color: "#fff", padding: "40px 32px 36px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>
            Reporte de Evaluación
          </div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
            {escuela.nombre}
          </h1>
          <div style={{ marginTop: 10, display: "flex", gap: 20, fontSize: 14, opacity: 0.85 }}>
            <span>📍 Región {escuela.region}</span>
            <span>📅 Periodo {periodo}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "28px 32px 60px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20,
      }}>

        {/* Semáforos */}
        <Card title="Estado por materia" span={1}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {metricas.puntajes_por_materia.map((p) => (
              <Semaforo
                key={p.materia}
                color={p.semaforo}
                materia={p.materia}
                puntaje={p.promedio_escuela}
              />
            ))}
          </div>
        </Card>

        {/* Comparación barras */}
        <Card title="Puntajes vs. regional y nacional" span={1}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metricas.puntajes_por_materia} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="materia" tick={{ fontSize: 11, fill: COLORS.textMuted }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: COLORS.textMuted }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8, border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="promedio_escuela" name="Escuela" fill={COLORS.escuela} radius={[4, 4, 0, 0]} />
              <Bar dataKey="promedio_regional" name="Regional" fill={COLORS.regional} radius={[4, 4, 0, 0]} />
              <Bar dataKey="promedio_nacional" name="Nacional" fill={COLORS.nacional} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Tendencia */}
        <Card title="Tendencia del promedio general" span={1}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={metricas.tendencia} margin={{ top: 10, right: 20, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="periodo" tick={{ fontSize: 12, fill: COLORS.textMuted }} />
              <YAxis domain={[50, 85]} tick={{ fontSize: 12, fill: COLORS.textMuted }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8, border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13,
                }}
              />
              <Line
                type="monotone" dataKey="promedio" name="Promedio"
                stroke={COLORS.trendLine} strokeWidth={3}
                dot={{ fill: COLORS.trendDot, r: 5, strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, stroke: COLORS.trendDot, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={{
            textAlign: "center", marginTop: 8,
            fontSize: 13, color: COLORS.textMuted,
          }}>
            📈 +{(metricas.tendencia[metricas.tendencia.length - 1].promedio - metricas.tendencia[0].promedio).toFixed(1)} puntos
            en {metricas.tendencia.length} periodos
          </div>
        </Card>

        {/* Histograma */}
        <Card title="Distribución de notas" span={1}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {Object.keys(metricas.distribucion).map((m) => (
              <button
                key={m}
                onClick={() => setMateriaHist(m)}
                style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 13,
                  border: `1px solid ${materiaHist === m ? COLORS.escuela : COLORS.border}`,
                  background: materiaHist === m ? COLORS.escuela : "#fff",
                  color: materiaHist === m ? "#fff" : COLORS.text,
                  cursor: "pointer", fontWeight: materiaHist === m ? 600 : 400,
                  transition: "all 0.15s ease",
                }}
              >
                {m}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={metricas.distribucion[materiaHist]} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="rango" tick={{ fontSize: 12, fill: COLORS.textMuted }} />
              <YAxis tick={{ fontSize: 12, fill: COLORS.textMuted }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 8, border: `1px solid ${COLORS.border}`,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13,
                }}
                formatter={(val) => [`${val} estudiantes`, "Frecuencia"]}
              />
              <Bar dataKey="frecuencia" fill={COLORS.histBar} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Boxplots */}
        <Card title="Distribución por materia (boxplot)" span={2}>
          <BoxplotChart data={metricas.boxplots} />
          <div style={{
            display: "flex", gap: 20, justifyContent: "center",
            marginTop: 12, fontSize: 12, color: COLORS.textMuted,
          }}>
            <span>◻️ Caja = Q1 a Q3 (50% central)</span>
            <span>Líneas = Mín a Máx</span>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "24px 32px",
        fontSize: 12, color: COLORS.textMuted,
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        Generado automáticamente · Datos del periodo {periodo} · {escuela.nombre}
      </div>
    </div>
  );
}
