# Base de Datos — Sistema de Tutorías Académicas

## Información general

- **Motor**: PostgreSQL 15+ (Supabase)
- **Esquema principal**: `tutorias`
- **Autenticación**: Supabase Auth (`auth.users`)
- **Almacenamiento de archivos**: Supabase Storage (bucket: `tutorias-docs`)
- **UUID**: se usa `gen_random_uuid()` nativo de PostgreSQL

---

## Roles de la aplicación

| Rol | Descripción |
|-----|-------------|
| `rol_administrador` | Control DML completo. Sin permisos DDL. Único que puede ver `audit_log`. |
| `rol_tutor` | Crea y edita sesiones. Solo accede a sus alumnos asignados. |
| `rol_docente` | Lectura general. Registra y edita sus propias calificaciones. |
| `rol_alumno` | Solo lectura de su propia información. |

El rol activo de cada usuario se inyecta en el JWT como claim `app_role` al momento del login mediante la función `tutorias.custom_access_token_hook`.

---

## Tablas de catálogo

Estas tablas son de solo lectura para la app. Se llenan con datos semilla al crear la BD.

### `tutorias.cat_riesgo_academico`
Niveles de riesgo académico del alumno.
| Columna | Tipo | Notas |
|---------|------|-------|
| `codigo` | VARCHAR(10) | PK. Valores: `bajo`, `medio`, `alto` |
| `descripcion` | VARCHAR(50) | |
| `color_hex` | CHAR(7) | Color para UI |
| `orden` | SMALLINT | Orden de visualización |

### `tutorias.cat_tipo_documento`
Tipos de documento que se pueden subir al sistema.
| Columna | Tipo | Notas |
|---------|------|-------|
| `codigo` | VARCHAR(30) | PK. Ej: `kardex`, `constancia`, `plan_accion` |
| `descripcion` | VARCHAR(100) | |
| `activo` | BOOLEAN | |

### `tutorias.cat_nivel_urgencia`
Nivel de urgencia de una sesión de tutoría.
| Columna | Tipo | Notas |
|---------|------|-------|
| `codigo` | VARCHAR(10) | PK. Valores: `normal`, `medio`, `urgente`, `critico` |
| `descripcion` | VARCHAR(50) | |
| `orden` | SMALLINT | |

### `tutorias.cat_tipo_canalizacion`
Servicios a los que se puede canalizar a un alumno.
| Columna | Tipo | Notas |
|---------|------|-------|
| `codigo` | VARCHAR(20) | PK. Ej: `psicologia`, `medico`, `trabajo_social` |
| `descripcion` | VARCHAR(100) | |
| `activo` | BOOLEAN | |

### `tutorias.cat_motivo_tutoria`
Motivos de la sesión de tutoría según formato oficial R07-M01-01.
| Columna | Tipo | Notas |
|---------|------|-------|
| `codigo` | VARCHAR(30) | PK. Ej: `reprobacion`, `ausentismo`, `problemas_economicos` |
| `descripcion` | VARCHAR(100) | |
| `activo` | BOOLEAN | |
| `orden` | SMALLINT | |

Valores disponibles: `reprobacion`, `ausentismo`, `problemas_economicos`, `indisciplina`, `falta_atencion_clases`, `problemas_familiares`, `impuntualidad`, `falta_compromiso`, `incumplimiento_expectativas`, `otros`.

---

## Tablas de perfiles de usuario

Cada perfil extiende `auth.users` de Supabase mediante `user_id UUID REFERENCES auth.users(id)`. Un usuario solo puede tener UN perfil (un `user_id` no puede estar en dos tablas de perfil simultáneamente).

### `tutorias.administradores`
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `auth.users(id)`. UNIQUE |
| `nombre_completo` | VARCHAR(120) | |
| `activo` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-actualizado por trigger |

### `tutorias.alumnos`
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `auth.users(id)`. UNIQUE |
| `matricula` | VARCHAR(20) | UNIQUE |
| `nombre_completo` | VARCHAR(120) | |
| `genero` | CHAR(1) | `M`, `F` o `X` |
| `telefono` | VARCHAR(20) | |
| `correo_institucional` | VARCHAR(120) | UNIQUE. Distinto del email de auth |
| `carrera` | VARCHAR(100) | Ej: `IDGS` |
| `grupo` | VARCHAR(10) | Ej: `8`, `3A` |
| `cuatrimestre` | SMALLINT | Entre 1 y 12 |
| `promedio_general` | NUMERIC(4,2) | Entre 0.00 y 10.00 |
| `riesgo_academico` | VARCHAR(10) | FK → `cat_riesgo_academico(codigo)` |
| `activo` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |
| `updated_at` | TIMESTAMPTZ | Auto-actualizado por trigger |

### `tutorias.tutores`
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `auth.users(id)`. UNIQUE |
| `nombre_completo` | VARCHAR(120) | |
| `departamento` | VARCHAR(100) | |
| `especialidad` | VARCHAR(100) | |
| `activo` | BOOLEAN | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `tutorias.docentes`
| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `auth.users(id)`. UNIQUE |
| `nombre_completo` | VARCHAR(120) | |
| `departamento` | VARCHAR(100) | |
| `activo` | BOOLEAN | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

## Tablas de operación

### `tutorias.asignaciones_tutor`
Registra qué tutor tiene asignado a qué alumno y en qué período.
Un alumno puede cambiar de tutor — el historial se conserva con `fecha_inicio` / `fecha_fin`.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `tutor_id` | UUID | FK → `tutorias.tutores(id)` |
| `alumno_id` | UUID | FK → `tutorias.alumnos(id)` |
| `fecha_inicio` | DATE | |
| `fecha_fin` | DATE | NULL = asignación activa |
| `activa` | BOOLEAN | |
| `created_at` | TIMESTAMPTZ | |

---

### `tutorias.sesiones_tutoria`
Registro de cada sesión entre tutor y alumno. Es la tabla central del sistema.
Corresponde al formato físico oficial **R07-M01-01**.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `alumno_id` | UUID | FK → `tutorias.alumnos(id)` |
| `tutor_id` | UUID | FK → `tutorias.tutores(id)` |
| `fecha` | DATE | |
| `hora_inicio` | TIME | |
| `hora_fin` | TIME | |
| `duracion_minutos` | SMALLINT | **Columna generada automáticamente** (no se inserta manualmente) |
| `puntos_relevantes` | TEXT | "Puntos relevantes de la sesión" del formato físico |
| `compromisos_acuerdos` | TEXT | "Compromisos y acuerdos" del formato físico |
| `nivel_urgencia` | VARCHAR(10) | FK → `cat_nivel_urgencia(codigo)` |
| `estatus` | VARCHAR(20) | `programada`, `realizada`, `cancelada`, `pendiente`, `no_presentado` |
| `confirmado_tutor` | BOOLEAN | Equivalente digital a la firma del tutor |
| `confirmado_alumno` | BOOLEAN | Equivalente digital a la firma del alumno |
| `fecha_confirmacion_tutor` | TIMESTAMPTZ | |
| `fecha_confirmacion_alumno` | TIMESTAMPTZ | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

> ⚠️ Las columnas `temas_tratados` y `acuerdos_tareas` están deprecadas. Usar `puntos_relevantes` y `compromisos_acuerdos`.

---

### `tutorias.sesion_motivos`
Motivos marcados en cada sesión (relación many-to-many).
Una sesión puede tener varios motivos simultáneos, igual que las casillas del formato R07-M01-01.

| Columna | Tipo | Notas |
|---------|------|-------|
| `sesion_id` | UUID | PK + FK → `tutorias.sesiones_tutoria(id)` |
| `motivo_codigo` | VARCHAR(30) | PK + FK → `tutorias.cat_motivo_tutoria(codigo)` |
| `detalle` | TEXT | Campo libre, útil cuando el motivo es `otros` |

---

### `tutorias.calificaciones`
Calificaciones por asignatura y período.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `alumno_id` | UUID | FK → `tutorias.alumnos(id)` |
| `docente_id` | UUID | FK → `tutorias.docentes(id)`. Nullable |
| `asignatura` | VARCHAR(100) | |
| `periodo` | VARCHAR(20) | Ej: `2024-1`, `2024-2` |
| `calificacion` | NUMERIC(4,2) | Entre 0.00 y 10.00 |
| `tipo_evaluacion` | VARCHAR(30) | `ordinario`, `extraordinario`, `titulo`, `otro` |
| `observaciones` | TEXT | |
| `created_at` | TIMESTAMPTZ | |

Restricción única: `(alumno_id, asignatura, periodo, tipo_evaluacion)`.

---

### `tutorias.incidencias`
Registro de incidencias disciplinarias o académicas.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `alumno_id` | UUID | FK → `tutorias.alumnos(id)` |
| `registrado_por` | UUID | FK → `auth.users(id)` |
| `fecha` | DATE | |
| `tipo_incidencia` | VARCHAR(50) | Texto libre |
| `descripcion` | TEXT | |
| `estatus` | VARCHAR(20) | `abierta`, `en_proceso`, `cerrada`, `archivada` |
| `resolucion` | TEXT | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

### `tutorias.canalizaciones`
Envíos formales del alumno a servicios externos (psicología, médico, etc.).

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `alumno_id` | UUID | FK → `tutorias.alumnos(id)` |
| `tutor_id` | UUID | FK → `tutorias.tutores(id)` |
| `sesion_id` | UUID | FK → `tutorias.sesiones_tutoria(id)`. Nullable |
| `tipo_servicio` | VARCHAR(20) | FK → `cat_tipo_canalizacion(codigo)` |
| `fecha_canalizacion` | DATE | |
| `motivo` | TEXT | |
| `estatus` | VARCHAR(20) | `pendiente`, `en_atencion`, `concluida`, `cancelada` |
| `seguimiento` | TEXT | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

---

### `tutorias.documentos`
Metadatos de archivos físicos almacenados en Supabase Storage.
El archivo real vive en Storage; esta tabla guarda la referencia.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `alumno_id` | UUID | FK → `tutorias.alumnos(id)`. Nullable |
| `sesion_id` | UUID | FK → `tutorias.sesiones_tutoria(id)`. Nullable |
| `tipo_documento` | VARCHAR(30) | FK → `cat_tipo_documento(codigo)` |
| `nombre_archivo` | VARCHAR(255) | |
| `storage_bucket` | VARCHAR(100) | Default: `tutorias-docs` |
| `storage_path` | TEXT | Ruta dentro del bucket |
| `nivel_privacidad` | VARCHAR(10) | `visible` (alumno puede verlo) o `oculto` (solo tutor/admin) |
| `subido_por` | UUID | FK → `auth.users(id)` |
| `mime_type` | VARCHAR(100) | |
| `tamano_bytes` | BIGINT | |
| `created_at` | TIMESTAMPTZ | |

> Al menos uno de `alumno_id` o `sesion_id` debe tener valor (constraint en BD).

---

### `tutorias.audit_log`
Log de eventos del sistema. **Solo el administrador puede leerlo.**
Ningún rol puede modificarlo ni eliminarlo — integridad garantizada por GRANT.

| Columna | Tipo | Notas |
|---------|------|-------|
| `id` | UUID | PK |
| `user_id` | UUID | FK → `auth.users(id)`. Nullable |
| `rol_activo` | VARCHAR(50) | Rol que ejecutó la acción |
| `evento` | VARCHAR(50) | Ej: `login`, `write`, `access_denied` |
| `tabla_afectada` | VARCHAR(100) | |
| `registro_id` | UUID | ID del registro afectado (sin datos sensibles) |
| `ip_address` | INET | |
| `metadata` | JSONB | Datos adicionales sin PII |
| `created_at` | TIMESTAMPTZ | |

Para registrar eventos usar la función: `tutorias.registrar_audit(evento, tabla, registro_id, metadata)`.

---

## Tablas opcionales (según alcance)

### `tutorias.notificaciones`
Alertas internas. Compatible con Supabase Realtime.
Campos principales: `user_id`, `tipo`, `titulo`, `mensaje`, `leida`, `url_accion`, `created_at`.
Tipos disponibles: `riesgo_alto`, `sesion_proxima`, `sesion_cancelada`, `canalizacion_pendiente`, `nuevo_documento`, `calificacion_registrada`, `sistema`.

### `tutorias.disponibilidad_tutor`
Bloques de disponibilidad semanal de cada tutor.
Campos: `tutor_id`, `dia_semana` (0=domingo … 6=sábado), `hora_inicio`, `hora_fin`, `activa`.

### `tutorias.planes_accion`
Plan de acción tutorial estructurado por alumno y período.
Campos principales: `alumno_id`, `tutor_id`, `periodo`, `objetivo_general`, `metas` (JSONB), `estatus`, `fecha_inicio`, `fecha_revision`.
Estructura de `metas`: `[{"descripcion": "...", "fecha_limite": "2024-06-01", "lograda": false}]`

---

## Relaciones principales (resumen)

```
auth.users
  ├── administradores (1:1)
  ├── alumnos         (1:1)
  ├── tutores         (1:1)
  └── docentes        (1:1)

alumnos
  ├── asignaciones_tutor  (N tutores a lo largo del tiempo)
  ├── sesiones_tutoria    (N sesiones)
  ├── calificaciones      (N calificaciones)
  ├── incidencias         (N incidencias)
  ├── canalizaciones      (N canalizaciones)
  └── documentos          (N documentos)

sesiones_tutoria
  ├── sesion_motivos      (N motivos por sesión)
  ├── canalizaciones      (puede originar canalizaciones)
  └── documentos          (puede tener documentos adjuntos)
```

---

## Funciones auxiliares importantes

| Función | Descripción |
|---------|-------------|
| `tutorias.get_my_role()` | Devuelve el `app_role` del JWT del usuario actual |
| `tutorias.get_my_alumno_id()` | Devuelve el `id` del perfil alumno del usuario actual |
| `tutorias.get_my_tutor_id()` | Devuelve el `id` del perfil tutor del usuario actual |
| `tutorias.get_my_docente_id()` | Devuelve el `id` del perfil docente del usuario actual |
| `tutorias.registrar_audit(...)` | Inserta un evento en `audit_log` (usar en lugar de INSERT directo) |
| `tutorias.custom_access_token_hook(event)` | Hook de Supabase Auth que inyecta `app_role` en el JWT |

---

## Reglas de seguridad (RLS)

Todas las tablas tienen Row Level Security activado con `FORCE ROW LEVEL SECURITY`.

Reglas clave:
- **Alumno** solo ve filas donde `alumno_id = get_my_alumno_id()` o `user_id = auth.uid()`
- **Alumno** solo ve documentos con `nivel_privacidad = 'visible'`
- **Tutor** solo ve alumnos donde exista una `asignaciones_tutor` activa con su `tutor_id`
- **Tutor** solo puede crear/editar sesiones donde él sea el `tutor_id`
- **Administrador** accede a todas las filas sin restricción de RLS
- **Nadie** puede modificar `audit_log` (solo INSERT vía función `registrar_audit`)

---

## Convenciones de desarrollo

- Usar siempre `gen_random_uuid()` para generar UUIDs (no `uuid_generate_v4()`)
- Todas las fechas y horas en `TIMESTAMPTZ` (con zona horaria)
- El campo `updated_at` se actualiza automáticamente mediante triggers
- Los registros transaccionales (sesiones, calificaciones, incidencias) **no se eliminan** — soft delete solo aplica a perfiles con el campo `activo`
- Para insertar en `audit_log` siempre usar la función `tutorias.registrar_audit()`, nunca INSERT directo
