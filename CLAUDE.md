# Instrucciones para Claude

## "revision produccion"

Cuando el usuario diga "revision produccion", hacer una revisión MINUCIOSA y EXHAUSTIVA de todos los commits que están en `development` pero no en `production`, en ambos repos (frontend y backend). No limitarse a los cambios propios — revisar TODO, incluyendo commits de otros autores.

### Proceso

1. Obtener lista completa de commits pendientes:
```bash
# Frontend
git log origin/production..origin/development --oneline

# Backend
cd /home/gus/repos/meta-backend && git log origin/production..origin/development --oneline
```

2. Para cada commit, hacer `git show <hash>` y leer el diff completo. Para cambios grandes, leer también los archivos afectados en su totalidad.

3. Revisar específicamente:
   - **Migraciones de DB**: ¿tienen `default=`? ¿son reversibles? ¿rompen datos existentes?
   - **Variables de entorno/settings**: ¿se usa algo que no está definido en `settings.py`? ¿falta agregar al entorno de producción?
   - **Cambios en la API**: ¿son backward compatible? ¿rompen el frontend actual en prod?
   - **Estado persistido en localStorage (Zustand)**: ¿un cambio de schema puede romper estado viejo?
   - **Lógica crítica de negocio**: flujo de entrega de evaluación, autenticación, resoluciones offline
   - **Seguridad**: validaciones, permisos, exposición de datos
   - **Imports y exports**: ¿algo que se usa pero no está definido?
   - **Features incompletas**: ¿algo que fue commiteado pero no funciona end-to-end?

4. Clasificar hallazgos en:
   - **CRÍTICO (bloqueante)**: no mergear hasta resolver
   - **ALTO**: riesgo real pero no bloquea si se documenta
   - **MEDIO**: edge cases, UX degradada
   - **BAJO / Sin riesgo**: seguro

5. Generar un reporte `.md` con fecha en la raíz del repo frontend:
   `REPORTE_REVISION_PRODUCCION_YYYY-MM-DD.md`

### Ejemplo de hallazgo crítico real
En la revisión del 2026-03-04 se detectó que Gonzalo usó `settings.FRONTEND_URL` en el servicio de reset password, pero esa variable no estaba definida en `config/settings.py` ni en el entorno de producción → `AttributeError` al intentar recuperar contraseña.

### Repos
- Frontend: `/home/gus/Documents/REPOS/meta-frontend`
- Backend: `/home/gus/repos/meta-backend`
