# Cambios Necesarios en el Backend — Rol Alumno

Este documento explica **qué debe existir o configurarse en Supabase** para que cada funcionalidad del rol alumno funcione correctamente en el frontend.

---

## 1. Autenticación y Perfil del Alumno

### Qué hace el frontend
Al cargar cualquier vista del alumno, se llama a `getAlumnoPerfil()` que busca en `tutorias.alumnos` el registro cuyo `user_id` coincide con `auth.uid()` del usuario autenticado.

### Qué debe existir en el backend

#### ✅ Tabla `tutorias.alumnos` ya existe (ver SCHEMA.md)

#### ⚠️ RLS requerida en `tutorias.alumnos`
```sql
-- El alumno solo puede leer su propio perfil
CREATE POLICY "alumno_select_own"
  ON tutorias.alumnos
  FOR SELECT
  TO PUBLIC
  USING (user_id = auth.uid());
```

#### ⚠️ El `user_id` del alumno debe estar vinculado a su cuenta `auth.users`
Cada alumno debe tener una cuenta en Supabase Auth con el mismo `user_id` referenciado en `tutorias.alumnos.user_id`.

> **Columnas que se usan en el perfil del alumno:**
> `id`, `matricula`, `nombre_completo`, `genero`, `telefono`, `correo_institucional`,
> `carrera`, `grupo`, `cuatrimestre`, `promedio_general`, `riesgo_academico`, `activo`

---

## 2. Sesiones de Tutoría

### Qué hace el frontend
`getSesionesAlumno()` filtra por `alumno_id` y hace join con `tutores` (para mostrar el nombre del tutor) y `sesion_motivos` (para mostrar los motivos de cada sesión).

### Qué debe existir en el backend

#### ✅ Tabla `tutorias.sesiones_tutoria` ya existe

#### ✅ Tabla `tutorias.sesion_motivos` ya existe

#### ⚠️ RLS requerida en `sesiones_tutoria`
```sql
CREATE POLICY "alumno_select_own_sesiones"
  ON tutorias.sesiones_tutoria
  FOR SELECT
  TO PUBLIC
  USING (alumno_id = tutorias.get_my_alumno_id());
```

#### ⚠️ RLS requerida en `sesion_motivos`
```sql
CREATE POLICY "alumno_select_own_motivos"
  ON tutorias.sesion_motivos
  FOR SELECT
  TO PUBLIC
  USING (
    sesion_id IN (
      SELECT id FROM tutorias.sesiones_tutoria
      WHERE alumno_id = tutorias.get_my_alumno_id()
    )
  );
```

#### ⚠️ RLS requerida en `tutores` (lectura para el alumno)
```sql
CREATE POLICY "alumno_select_tutor_asignado"
  ON tutorias.tutores
  FOR SELECT
  TO PUBLIC
  USING (
    id IN (
      SELECT tutor_id FROM tutorias.sesiones_tutoria
      WHERE alumno_id = tutorias.get_my_alumno_id()
    )
  );
```

> **Columnas que se usan en sesiones:**
> `id`, `fecha`, `hora_inicio`, `hora_fin`, `duracion_minutos`, `puntos_relevantes`,
> `compromisos_acuerdos`, `nivel_urgencia`, `estatus`, `confirmado_tutor`,
> `confirmado_alumno`, `fecha_confirmacion_alumno`

---

## 3. Confirmación de Asistencia (Firma Digital del Alumno)

### Qué hace el frontend
`confirmarAsistenciaAlumno(sesionId)` hace un `UPDATE` en `sesiones_tutoria` para marcar `confirmado_alumno = true` y registrar `fecha_confirmacion_alumno`.

### Qué debe existir en el backend

#### ⚠️ Política RLS de UPDATE para alumno en sus propias sesiones
```sql
CREATE POLICY "alumno_confirm_own_sesion"
  ON tutorias.sesiones_tutoria
  FOR UPDATE
  TO PUBLIC
  USING (alumno_id = tutorias.get_my_alumno_id())
  WITH CHECK (alumno_id = tutorias.get_my_alumno_id());
```

> **Nota de seguridad:** Para limitar el UPDATE solo a las columnas `confirmado_alumno` y `fecha_confirmacion_alumno`, considera usar una **función RPC** en lugar de UPDATE directo:
> ```sql
> CREATE OR REPLACE FUNCTION tutorias.confirmar_asistencia_alumno(p_sesion_id UUID)
> RETURNS VOID
> LANGUAGE plpgsql
> SECURITY DEFINER
> AS $$
> BEGIN
>   UPDATE tutorias.sesiones_tutoria
>   SET confirmado_alumno = true,
>       fecha_confirmacion_alumno = NOW()
>   WHERE id = p_sesion_id
>     AND alumno_id = tutorias.get_my_alumno_id()
>     AND estatus = 'realizada'
>     AND confirmado_alumno = false;
> END;
> $$;
> ```
> Si usas la función RPC, cambia la acción en `actions.ts` de `update()` a `rpc('confirmar_asistencia_alumno', { p_sesion_id: sesionId })`.

---

## 4. Calificaciones del Alumno

### Qué hace el frontend
`getCalificacionesAlumno()` lee todos los registros de `calificaciones` donde `alumno_id` coincide con el alumno autenticado.

### Qué debe existir en el backend

#### ✅ Tabla `tutorias.calificaciones` ya existe

#### ⚠️ RLS requerida en `calificaciones`
```sql
CREATE POLICY "alumno_select_own_calificaciones"
  ON tutorias.calificaciones
  FOR SELECT
  TO PUBLIC
  USING (alumno_id = tutorias.get_my_alumno_id());
```

> **Columnas usadas:**
> `id`, `asignatura`, `periodo`, `calificacion`, `tipo_evaluacion`, `observaciones`, `created_at`

---

## 5. Documentos del Alumno

### Qué hace el frontend
- **Listar:** `getDocumentosAlumno()` lee `tutorias.documentos` donde `alumno_id` coincide y `nivel_privacidad = 'visible'` (RLS lo filtra automáticamente).
- **Descargar:** `getDocumentoUrl()` genera una URL firmada temporal (60 s) del bucket `tutorias-docs` vía Storage API.
- **Subir:** `subirDocumentoAlumno()` sube a `/alumnos/{alumno_id}/{timestamp}_{tipo}.ext` y registra metadatos en `tutorias.documentos`.

### Qué debe existir en el backend

#### ✅ Tabla `tutorias.documentos` ya existe

#### ⚠️ RLS en `tutorias.documentos` — SELECT solo documentos visibles
```sql
CREATE POLICY "alumno_select_own_docs"
  ON tutorias.documentos
  FOR SELECT
  TO PUBLIC
  USING (
    alumno_id = tutorias.get_my_alumno_id()
    AND nivel_privacidad = 'visible'
  );
```

#### ⚠️ RLS en `tutorias.documentos` — INSERT para el alumno
```sql
CREATE POLICY "alumno_insert_own_docs"
  ON tutorias.documentos
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    alumno_id = tutorias.get_my_alumno_id()
    AND nivel_privacidad = 'visible'
    AND subido_por = auth.uid()
  );
```

#### ⚠️ Bucket de Supabase Storage: `tutorias-docs`

1. Crear el bucket `tutorias-docs` en **Storage → Buckets** de Supabase (puede ser privado).
2. Agregar política de Storage para que el alumno pueda subir a su carpeta:
```sql
-- En Storage Policies (tutorias-docs bucket)
-- INSERT: El alumno puede subir solo a su carpeta
CREATE POLICY "alumno_upload_own"
  ON storage.objects
  FOR INSERT
  TO PUBLIC
  WITH CHECK (
    bucket_id = 'tutorias-docs'
    AND (storage.foldername(name))[1] = 'alumnos'
    AND (storage.foldername(name))[2] = (
      SELECT id::text FROM tutorias.alumnos WHERE user_id = auth.uid()
    )
  );

-- SELECT: El alumno puede leer sus propios archivos
CREATE POLICY "alumno_read_own"
  ON storage.objects
  FOR SELECT
  TO PUBLIC
  USING (
    bucket_id = 'tutorias-docs'
    AND (storage.foldername(name))[2] = (
      SELECT id::text FROM tutorias.alumnos WHERE user_id = auth.uid()
    )
  );
```

> **Alternativa más simple:** Si usas `createSignedUrl` desde el servidor (Server Action con `service_role`), el alumno **no necesita acceso directo al Storage**. Basta con que el Server Action tenga permiso. Para eso, en `getDocumentoUrl()` usa la función `createAdminClient()` (igual que respaldos) en lugar del cliente del usuario.

---

## 6. Planes de Acción

### Qué hace el frontend
`getPlanesAccionAlumno()` lee `tutorias.planes_accion` donde `alumno_id` coincide.

### ⚠️ Esta tabla es OPCIONAL según SCHEMA.md. Debe crearse si no existe:

```sql
CREATE TABLE IF NOT EXISTS tutorias.planes_accion (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  alumno_id        UUID NOT NULL REFERENCES tutorias.alumnos(id),
  tutor_id         UUID NOT NULL REFERENCES tutorias.tutores(id),
  periodo          VARCHAR(20) NOT NULL,
  objetivo_general TEXT NOT NULL,
  metas            JSONB NOT NULL DEFAULT '[]',
  estatus          VARCHAR(20) NOT NULL DEFAULT 'activo'
                   CHECK (estatus IN ('activo', 'completado', 'cancelado')),
  fecha_inicio     DATE NOT NULL,
  fecha_revision   DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER set_updated_at_planes_accion
  BEFORE UPDATE ON tutorias.planes_accion
  FOR EACH ROW EXECUTE FUNCTION tutorias.set_updated_at();

-- RLS
ALTER TABLE tutorias.planes_accion ENABLE ROW LEVEL SECURITY;
FORCE ROW LEVEL SECURITY ON tutorias.planes_accion;

CREATE POLICY "alumno_select_own_planes"
  ON tutorias.planes_accion
  FOR SELECT
  TO PUBLIC
  USING (alumno_id = tutorias.get_my_alumno_id());
```

> **Estructura de `metas` (JSONB):**
> ```json
> [
>   { "descripcion": "Regularizar Cálculo", "fecha_limite": "2026-06-01", "lograda": false },
>   { "descripcion": "Asistir a todas las sesiones", "fecha_limite": "2026-05-01", "lograda": true }
> ]
> ```

---

## 7. Descarga de Expediente PDF

### Qué hace el frontend
`generateExpedientePDF()` se ejecuta **100% en el cliente** (browser). Combina los datos del alumno, calificaciones y sesiones que ya están en memoria para generar el PDF con `jsPDF`.

### Qué necesita del backend
- **Ningún cambio adicional.** Los datos se obtienen de las actions ya documentadas arriba.
- El logo `/Logo_ut.png` debe estar en la carpeta `public/` del proyecto Next.js (ya existe según el código).

---

## 8. Función `tutorias.get_my_alumno_id()`

Muchas RLS policies dependen de esta función. Si no existe, créala:

```sql
CREATE OR REPLACE FUNCTION tutorias.get_my_alumno_id()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM tutorias.alumnos WHERE user_id = auth.uid() LIMIT 1;
$$;
```

---

## 9. Resumen Rápido — Checklist de BD

| # | Qué necesitas | Estado |
|---|---------------|--------|
| 1 | Tabla `tutorias.alumnos` | ✅ Ya existe en SCHEMA |
| 2 | Tabla `tutorias.sesiones_tutoria` | ✅ Ya existe en SCHEMA |
| 3 | Tabla `tutorias.sesion_motivos` | ✅ Ya existe en SCHEMA |
| 4 | Tabla `tutorias.calificaciones` | ✅ Ya existe en SCHEMA |
| 5 | Tabla `tutorias.documentos` | ✅ Ya existe en SCHEMA |
| 6 | Tabla `tutorias.planes_accion` | ⚠️ Opcional — crearla si no existe |
| 7 | Bucket `tutorias-docs` en Storage | ⚠️ Crear en Supabase Storage |
| 8 | Función `get_my_alumno_id()` | ⚠️ Verificar que exista |
| 9 | RLS `alumnos` SELECT | ⚠️ Crear política |
| 10 | RLS `sesiones_tutoria` SELECT | ⚠️ Crear política |
| 11 | RLS `sesiones_tutoria` UPDATE (confirmar) | ⚠️ Crear política o RPC |
| 12 | RLS `sesion_motivos` SELECT | ⚠️ Crear política |
| 13 | RLS `tutores` SELECT (parcial) | ⚠️ Crear política |
| 14 | RLS `calificaciones` SELECT | ⚠️ Crear política |
| 15 | RLS `documentos` SELECT (solo visible) | ⚠️ Crear política |
| 16 | RLS `documentos` INSERT | ⚠️ Crear política |
| 17 | Storage policies `tutorias-docs` | ⚠️ Crear política en bucket |
| 18 | RLS `planes_accion` SELECT | ⚠️ Crear política (tras crear tabla) |

---

## Nota sobre el esquema `tutorias`

Todas las consultas desde el frontend usan `.schema("tutorias")` en el cliente de Supabase para apuntar al esquema correcto. Si el cliente de Supabase no tiene habilitado el custom schema, debes agregarlo en la configuración:

```env
# En .env.local ya debes tener estas variables:
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

Y asegurarte de que el proyecto Supabase tenga habilitada la API para el esquema `tutorias` en **Settings → API → Extra schemas to expose**.
