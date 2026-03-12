# Clínica Veterinaria Peón Pet's — Sitio Web

Sitio web completo para la Clínica Veterinaria Peón Pet's ubicada en Rivadavia 36, La Falda, Córdoba.

## Stack técnico

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Estilos:** Tailwind CSS
- **Backend / DB:** Supabase (PostgreSQL + Auth)
- **Hosting:** Vercel (recomendado)

---

## Cómo levantar el proyecto

### 1. Instalar dependencias

```bash
cd project
npm install
```

### 2. Configurar Supabase

1. Ir a [supabase.com](https://supabase.com) y crear un nuevo proyecto
2. En el dashboard, ir a **SQL Editor** y ejecutar el contenido de `supabase/schema.sql`
3. En **Authentication → Users**, crear un usuario admin para el panel:
   - Email: el que prefieras (ej: `admin@peonpets.com`)
   - Password: contraseña segura

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y completar con los datos de Supabase:

```bash
cp .env.local.example .env.local
```

Abrir `.env.local` y completar:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

Los valores se encuentran en: Supabase Dashboard → Project Settings → API

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Estructura del proyecto

```
project/
├── app/
│   ├── page.tsx              # Página principal (Home)
│   ├── layout.tsx            # Layout raíz
│   ├── globals.css           # Estilos globales + Tailwind
│   ├── turnos/
│   │   └── page.tsx          # Página del sistema de turnos
│   ├── admin/
│   │   ├── page.tsx          # Login del panel admin
│   │   ├── layout.tsx        # Layout del admin
│   │   └── turnos/
│   │       └── page.tsx      # Gestión de turnos (admin)
│   └── api/
│       ├── turnos/
│       │   ├── route.ts      # POST /api/turnos
│       │   └── [id]/
│       │       └── route.ts  # PATCH /api/turnos/:id
│       └── horarios-disponibles/
│           └── route.ts      # GET /api/horarios-disponibles
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── BotonesFlotantes.tsx  # WhatsApp + Urgencias
│   ├── HeroSection.tsx
│   ├── ServiciosSection.tsx
│   ├── EquipoSection.tsx
│   ├── HorariosSection.tsx
│   ├── ResenasSection.tsx
│   ├── UbicacionSection.tsx
│   ├── ContactoSection.tsx
│   └── turnos/
│       ├── CalendarioTurnos.tsx
│       └── FormularioTurno.tsx
├── lib/
│   ├── supabase.ts           # Cliente browser
│   ├── supabase-server.ts    # Cliente servidor
│   └── horarios.ts           # Lógica de slots de tiempo
├── types/
│   └── index.ts              # Tipos TypeScript
└── supabase/
    └── schema.sql            # Tablas + políticas RLS
```

---

## Funcionalidades

### Sitio público
- **Hero** con tagline y botones de acción
- **Servicios** — Consulta, Urgencias, Vacunación, Control, Peluquería, Radiología
- **Equipo** — Dra. Nataly y Alexandra
- **Horarios** — Lun-Vie 9-13 / 16-20
- **Reseñas** — Google 4.4 ⭐ (30 reseñas)
- **Ubicación** — Mapa de Google Maps integrado
- **Contacto** — Teléfono, WhatsApp, Instagram, Facebook
- **Botones flotantes** — WhatsApp y Urgencias siempre visibles

### Sistema de turnos
- Calendario visual con días laborales (Lun-Vie)
- Slots de 30 minutos en mañana (9-13) y tarde (16-20)
- Horarios ocupados bloqueados en tiempo real desde Supabase
- Formulario con validaciones en frontend y backend
- Confirmación visual al terminar

### Panel Admin (`/admin`)
- Login con Supabase Auth (email + contraseña)
- Dashboard con contadores de turnos por estado
- Filtro por estado: Pendiente / Confirmado / Cancelado / Todos
- Modal de gestión: confirmar, cancelar, agregar notas internas
- Link directo a WhatsApp del cliente desde el modal

---

## Branding

| Color | HEX | Uso |
|-------|-----|-----|
| Verde Lima | `#A8D400` | Color principal, botones, acciones |
| Púrpura | `#6B2FA0` | Logo, títulos |
| Violeta | `#9B59B6` | Acentos secundarios |
| Cian Turquesa | `#00B8D4` | Detalles, separadores |
| Azul Oscuro | `#1A1A2E` | Fondo principal |

---

## Deploy en Vercel

1. Subir el proyecto a GitHub
2. Conectar el repo en [vercel.com](https://vercel.com)
3. Agregar las variables de entorno en Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy automático 🚀
