# Revisión pre-merge development → production
**Fecha:** 2026-03-04

---

## CRÍTICO — Bloqueante

### `FRONTEND_URL` no definida en `settings.py`
**Commit:** `b016ab0` (Gonzalo)
**Repo:** meta-backend
**Archivo:** `mta_auth/services/recovery.py`

El servicio de reset password construye el link del email así:

```python
reset_url = f"{settings.FRONTEND_URL}/dashboard/login/restablecer-password/{uid}/{token}"
```

`FRONTEND_URL` **no está definida en `config/settings.py`**. Cuando alguien intente recuperar su contraseña, el backend tira `AttributeError` y la feature falla completamente.

**Fix necesario antes de mergear:**

1. Agregar en `config/settings.py`:
```python
FRONTEND_URL = env("FRONTEND_URL")
```

2. Agregar la variable en el entorno de producción (Azure / .env):
```
FRONTEND_URL=https://<dominio-de-produccion>
```

---

## MEDIO — No bloqueante

### `resetState()` removido del retry offline
**Commit:** `44e17ca`
**Repo:** meta-frontend
**Archivo:** `mta_resolutions/hooks/index.ts`

Se quitó `resetState()` de `useResolutionRetrySubmit`, pero no representa riesgo real: el botón "Salir" llama a `exit()` que a su vez llama `resetState()`. El estado se limpia correctamente cuando el alumno sale.

---

## Sin riesgo

| Cambio | Autor | Detalle |
|--------|-------|---------|
| Migración `is_test` en Appointment | gus | `default=False`, segura en producción |
| Migración `section_title` / `section_close` en Question | Gonzalo | `default=''` / `default=False`, backward compatible |
| Separadores de pregunta | Gonzalo | Campos opcionales, no rompe evaluaciones existentes |
| Offline flow (retry, inline UI, polling) | gus | Probado y funcional |
| Fix `FRONTEND_URL` en `pages.ts` | gus | Corrige TypeError al salir de evaluación |
| Métricas comportamentales (`first_touched_datetime`, `change_count`) | gus | JSON blob, sin migración de DB |
| DevDashboard (turnos de prueba, confirmación) | gus | Solo afecta panel de desarrollo |
| Limpieza CI/CD (Azure Login step) | gus | Elimina credenciales expiradas |

---

## Conclusión

**No mergear hasta que Gonzalo agregue `FRONTEND_URL` a `settings.py` y al entorno de producción.**

El resto de los cambios es seguro para deployar.
