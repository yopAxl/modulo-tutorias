# TutorTrack: Sistema de Gestión de Tutorías - UTNay

## Descripción del Proyecto
**TutorTrack** es una plataforma integral desarrollada para la **Universidad Tecnológica de Nayarit (UTN)**, diseñada para digitalizar y optimizar el proceso de seguimiento académico y gestión de tutorías. El sistema permite un monitoreo continuo del desempeño estudiantil, facilitando la comunicación entre alumnos, tutores, docentes y administradores.

## Características Principales
- **Seguimiento Académico**: Monitoreo en tiempo real del promedio (GPA) y niveles de riesgo.
- **Gestión de Sesiones**: Registro digital de tutorías basado en el formato oficial **R07-M01-01**.
- **Expediente Digital**: Centralización de calificaciones, planes de acción y documentación académica.
- **Reportes Institucionales**: Generación de estadísticas y reportes automatizados para la toma de decisiones.
- **Multilingüe**: Soporte completo para Español e Inglés (i18n).

## Tecnologías Utilizadas
- **Core**: [Next.js 16](https://nextjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Backend & Autenticación**: [Supabase](https://supabase.com/)
- **Interfaz de Usuario**: [Tailwind CSS 4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Generación de Documentos**: [jsPDF](https://github.com/parallax/jsPDF) & [autoTable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Estado y Notificaciones**: [Sonner](https://sonner.emilkowal.ski/)

## Configuración y Ejecución
1. Instalar dependencias: `yarn install`
2. Configurar variables de entorno (`.env.local`) con las credenciales de Supabase.
3. Iniciar el servidor de desarrollo: `yarn dev`

## Equipo del Proyecto
### Desarrollo (Developers)
- **Axel Velázquez**
- **Kevin Abraham**
- **Emiliano Estrada**

### Control de Calidad (QA)
- **Vladimir Montes**

### Documentación
- **Román Bañuelos**

---
© 2026 Universidad Tecnológica de Nayarit.
