// ══════════════════════════════════════════════════════════════
// hooks/useReporteMETA.js
// ══════════════════════════════════════════════════════════════
// Este hook reemplaza el MOCK data hardcoded del prototipo.
// Hace fetch al endpoint Django y devuelve los datos en el
// mismo formato que espera InformeMETA.jsx.
//
// Uso en tu componente:
//   const { data, loading, error } = useReporteMETA(escuelaId, filtros);
//

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "";

export default function useReporteMETA(escuelaId, filtros) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { materia, anio, division, toma } = filtros;

  const fetchData = useCallback(async () => {
    if (!escuelaId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        materia,
        anio,
        division,
        toma,
      });

      const res = await fetch(
        `${API_BASE}/api/reportes/meta/${escuelaId}/?${params}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();

      // json ya viene en el formato exacto que usa el componente:
      // {
      //   colegio: "Amundsen",
      //   general: { muestra: {mi, todos}, pct40: {mi, todos}, ... },
      //   por_colegio: { bars: [{id, p}], miId },
      //   detalle: { contenido: [{n, mi, t}], competencia: [...], boxplotMi, boxplotTodos }
      // }
      setData(json);
    } catch (err) {
      console.error("Error fetching reporte META:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [escuelaId, materia, anio, division, toma]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}


// ══════════════════════════════════════════════════════════════
// CÓMO INTEGRAR CON InformeMETA.jsx
// ══════════════════════════════════════════════════════════════
//
// En tu App principal (que wrappea las rutas):
//
//   <Route
//     path="/reportes/escuela/:escuelaId"
//     element={<InformeMETAConnected />}
//   />
//
// Componente connected:

/*
import { useParams } from "react-router-dom";
import useReporteMETA from "../hooks/useReporteMETA";
import InformeMETA from "./InformeMETA";

export default function InformeMETAConnected() {
  const { escuelaId } = useParams();
  const [materia, setMateria] = useState("Matemática");
  const [anio, setAnio] = useState("3ro");
  const [division, setDivision] = useState("Única");
  const [toma, setToma] = useState("2-2023");

  const filtros = { materia, anio, division, toma };
  const { data, loading, error } = useReporteMETA(escuelaId, filtros);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage msg={error} />;
  if (!data) return null;

  // data ya tiene la estructura exacta que usa InformeMETA
  return (
    <InformeMETA
      data={data}
      filtros={filtros}
      setMateria={setMateria}
      setAnio={setAnio}
      setDivision={setDivision}
      setToma={setToma}
    />
  );
}
*/


// ══════════════════════════════════════════════════════════════
// CAMBIOS MÍNIMOS EN InformeMETA.jsx
// ══════════════════════════════════════════════════════════════
//
// El prototipo actual tiene los datos hardcoded en `const D = {...}`.
// Para conectarlo con datos reales, los cambios son mínimos:
//
// ANTES (prototipo):
//   const D = { col: "Amundsen", mu: { mi: 17, t: 894 }, ... };
//   export default function App() { ... }
//
// DESPUÉS (producción):
//   export default function InformeMETA({ data }) {
//     const D = {
//       col: data.colegio,
//       mu: data.general.muestra,
//       p40: data.general.pct40,
//       pP: data.general.pctPISA,
//       p45: data.general.pct45,
//       matCont: data.detalle.contenido,
//       matComp: data.detalle.competencia,
//       bpMi: data.detalle.boxplotMi,
//       bpAll: data.detalle.boxplotTodos,
//       // Para Lenguaje, el mismo endpoint devuelve datos distintos
//       // según el filtro de materia
//     };
//     // ... resto del componente igual
//   }
//
// Es decir: EN VEZ DE editar todo el componente,
// solo cambiás de dónde viene `D`.
//
// ══════════════════════════════════════════════════════════════
