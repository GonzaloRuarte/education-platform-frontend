# mta_reports_v2 — frontend

Cara frontend de los **Reportes Aurora**: listado, edición de slides, viewer interactivo (tabs de resumen, detalle, semáforo, scatter, tabla, histórico, etc.) y regeneración batch contra el backend.

> Para el lado backend (modelos, blobs, endpoints) ver `meta-backend/mta_reports_v2/CLAUDE.md`.

## Páginas

| Archivo | Ruta | Qué hace |
|---|---|---|
| `pages/ReportesAuroraListPage.tsx` | `/reports` | Grilla con filtros, publish/draft inline, botón "Generar reportes faltantes" con polling. Concentra toda la lógica de polling de regeneración. |
| `pages/ReporteAuroraCreatePage.tsx` | `/reports/agregar` | Form simple: escuela + toma (hoy hardcodeada `'1-2026'`) → POST. |
| `pages/ReporteAurora.tsx` | `/reports/escuela/:schoolId/toma/:toma` y `/reports/agrupamiento/:groupingId/toma/:toma` | Viewer principal (mismo componente para ambos sujetos). Tabs, sidebars de filtros, editor de slides. |

## Modelo mental — sujeto XOR

Cada reporte apunta a **UN sujeto: escuela XOR agrupamiento**. Esto se refleja en `I_AuroraReportListItem` (`types.ts`): `school | null`, `grouping | null`, exactamente uno seteado.

- En la lista, la columna "Sujeto" centraliza la decisión en `subjectFor(row)` — usar siempre ese helper, no acceder a `row.school`/`row.grouping` directo.
- En el viewer, varios tabs son **school-only** (cover, historico, instituciones). `SCHOOL_ONLY_TAB_IDS` los excluye silenciosamente cuando el sujeto es agrupamiento.
- Los blobs de agrupamiento ahora también se generan al apretar "Generar reportes faltantes": el backend encola un task Huey por cada `(grouping, toma)` elegible. Cold path sigue disponible como fallback en el primer GET cuando no se corrió la regen masiva.

## Hooks

Convención: pages NO importan axios. Los hooks de `hooks/` envuelven `axiosGet/axiosPost/...` con `useAuthResources()`.

CRUD (`hooks/crud.ts`):
- `useAuroraReportList` — lista paginada
- `useAuroraReportCreate` — POST
- `useAuroraReportBatchDelete`
- `useAuroraReportRegenerateAll` — dispara worker async
- `useAuroraReportRegenerateStatus` — polleable; devuelve `{status: 'running'|'done'|'failed'|'never', schools_written, schools_total, groupings_written?, groupings_total?, groupings_started_at?, ...}`. Los campos `groupings_*` aparecen sólo si "Generar reportes faltantes" disparó tasks de agrupamiento.
- `useAuroraReportPublish` / `useAuroraReportUnpublish`

Viewer (`hooks/viewer.ts`):
- `useReporteAurora(subject, toma)` — devuelve `I_RawEscuelaDatos` crudo + helpers lazy (`getMaterias`, `getAnios`, `getDivisiones`).
- `useEscuelaReporteAurora`, `useAgrupamientoReporteAurora` — alias retrocompatibles.

Slides (`hooks/useEditableSlide.ts`):
- `useEditableSlide({schoolId, diapositivaId, fields})` — GET + PATCH del HTML; requiere capability `manage_reports`.

## Regeneración masiva — el flujo

Implementado en `ReportesAuroraListPage.tsx`. Patrón:

1. Click "Generar reportes faltantes" → POST `regenerate-all-missing/`.
2. `startPolling()` arranca un `setInterval(tick, 3000)` que pega a `regenerate-status/`.
3. Mientras `status === 'running'` **o** queden agrupamientos pendientes (`groupings_written < groupings_total`) actualiza `regenProgress` (escuelas) y `groupingsProgress` (agrupamientos), ambos visibles en el banner y el botón.
4. Cuando schools done **y** groupings done (o sin agrupamientos elegibles): para el polling y llama a `reloadRef.current?.()` para refrescar la grilla.
5. Cleanup: `stopPolling()` en `useEffect` cleanup y en el `.finally` de la promise.

**Por qué dos contadores**: el streaming run de escuelas (`regenerate_all_blobs`) marca `done` apenas termina, pero las tasks per-grouping (`regenerate_grouping_blob`) se encolan una por una y pueden seguir corriendo. Sin la rama de "groupings pending" el polling pararía antes de tiempo.

**Por qué `reloadRef` y no `reload` directo**: `customButtons` recibe `reload` desde `ListPage` como prop. Para que el polling (que vive afuera) pueda refrescar, se guarda en una ref durante el render del botón.

**Estado al montar**: el `useEffect` inicial llama `fetchRegenStatus()` una vez. Si una regeneración estaba corriendo cuando se cargó la página, retoma el polling. Sin esto, refrescar la página durante una regeneración pierde el indicador.

## Convenciones internas

- **Auth**: pages envueltas con `withAuth(Component, { allowedCapabilities, logoutDestination })`. Capabilities relevantes: `manage_reports`, `manage_admin_users`. Dentro de la página, `useHasCapabilities(['manage_reports'])` para gating fino (mostrar/ocultar columnas, botones).
- **Subject polymorphism**: helpers como `subjectFor` y `reportPathFor` para no duplicar la rama school/grouping. Si agregás lógica que depende del sujeto, sumala ahí.
- **Cálculos puros separados**: `components/calc/` contiene funciones puras (no JSX) tipo `calcResumen`, `calcDetalle`, `calcSemaforo`. El viewer combina cálculos + componentes.
- **Detección "es Lenguaje"**: `isLenguajeMateria()` en `components/calc/_shared.ts` normaliza acentos. **Cuidado**: si comparás strings de materia a mano, mismatch silencioso → se pierde la rama de microcompetencias.
- **Sin Zustand ni store global**: estado local de componente. El polling usa `useRef` para el interval handle y para el callback de reload.

## Integración con backend

Endpoints que se consumen (todos bajo `/reportes-aurora/` en backend):

- Listar/crear/borrar reportes
- `/regenerate-all-missing/` y `/regenerate-status/` (regeneración masiva + polling)
- `/<pk>/publish/`, `/<pk>/unpublish/`
- `/<escuela|agrupamiento>/<id>/toma/<toma>/` para el viewer
- `/escuela/<id>/diapositiva/<id>/` para slides

Una fila con `status='draft'` devuelve **404 desde el backend** si el usuario no tiene `manage_reports`. El viewer asume éxito; si pegás a un draft sin capability vas a ver el error de `useReporteAurora`.

## Gotchas

- **Cleanup del polling**: el `useEffect` de mount limpia con `stopPolling()` en cleanup. Si agregás un branch nuevo que arranque un interval, asegurate de pasar por `startPolling()` (que es idempotente) o vas a dejar leaks.
- **Intervalo 3s fijo**: aceptable hoy. Con 100+ escuelas considerar backoff.
- **Cambios de filtro no resetean el tab**: cambiar materia/año/división puede dejar al usuario en un tab incompatible. Si tocás filtros, considerá si el tab actual sigue teniendo sentido.
- **El XOR puede mentir si el backend lo rompe**: `subjectFor` prioriza grouping si ambos vienen seteados. Si ves bugs raros de "escuela aparece como agrupamiento", revisá los datos del backend antes que el frontend.
- **`toma` está hardcodeada** en el form de creación (`'1-2026'`). Cuando avance el calendario hay que actualizarla o hacerla configurable.
- **Edit mode**: `?edit=1` en la URL del viewer activa el tab `'intro'` y el modo edición de slides. Solo funciona con `manage_reports`.

## Componentes/utilidades compartidas

- `@/shared/pages/ListPage` — la grilla; recibe `customButtons({ reload })`.
- `@/shared/pages/CreationPage` — wrapper de form de creación.
- `@/mta_auth/hocs/withAuth` y `@/mta_auth/hooks` (`useHasCapabilities`).
- `@/mta_schools/components/SchoolSelect` — `SchoolSelectControlled` para react-hook-form.
- `@/shared/data/axios` — `axiosGet`, `axiosPost`, etc.
- `@/shared/toasts` — `successToast`, `warningToast`; `@/shared/service: handleServiceError` para errores de hooks.
