# Panel de Administración — Clínica Veterinaria Peón Pet's

## Objetivo

Crear una sección `/admin` dentro de la web existente (Next.js + Supabase) que permita a la Dra. Nataly y al personal de la clínica gestionar los turnos. Esta sección debe ser invisible para los clientes y accesible solo con contraseña.

---

## Acceso y seguridad

### Credenciales
Hardcodeadas en `.env.local` — no en la base de datos:
```
ADMIN_USER=admin
ADMIN_PASSWORD=peonpets2024
ADMIN_SESSION_SECRET=una_clave_random_larga_de_32_caracteres
```

### Cómo funciona el login
- URL: `/admin/login` — página simple con formulario usuario + contraseña
- Al hacer login correcto → se genera una cookie `admin_session` firmada con `ADMIN_SESSION_SECRET`
- La cookie dura 8 horas y es `httpOnly` (no accesible desde JavaScript del browser)
- Implementar con `jose` o `jsonwebtoken` para firmar el token de sesión

### Protección de rutas
- Crear un middleware en `middleware.ts` en la raíz del proyecto Next.js
- El middleware intercepta TODAS las rutas que empiecen con `/admin`
- Si no hay cookie válida → redirige automáticamente a `/admin/login`
- La página de login es la ÚNICA ruta de `/admin` que no requiere autenticación

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = request.nextUrl.pathname === '/admin/login'
  const session = request.cookies.get('admin_session')

  if (isAdminRoute && !isLoginPage && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

export const config = {
  matcher: ['/admin/:path*']
}
```

### Logout
- Botón de cerrar sesión en el sidebar del panel
- Borra la cookie `admin_session`
- Redirige a `/admin/login`

### Seguridad adicional
- El panel NO debe estar indexado por Google — agregar en `/admin/layout.tsx`:
  ```typescript
  export const metadata = { robots: 'noindex, nofollow' }
  ```
- No mostrar mensajes de error específicos en el login (ej: no decir "contraseña incorrecta", solo "credenciales inválidas")
- Agregar rate limiting básico: máximo 5 intentos fallidos por IP en 10 minutos

### Múltiples usuarios
Por ahora un solo usuario admin. Si en el futuro necesitan usuarios separados por médico, se puede migrar a Supabase Auth. Por ahora es suficiente con uno solo que comparte todo el personal de la clínica.

---

## Estructura de páginas

```
/admin/login          → pantalla de login
/admin                → dashboard general (resumen del día)
/admin/clinica        → turnos de clínica general (Dra. Nataly)
/admin/dermatologia   → turnos de dermatología
/admin/oftalmologia   → turnos de oftalmología  
/admin/endocrinologia → turnos de endocrinología
/admin/especialidades → gestión de fechas disponibles de especialistas
```

---

## Base de datos — cambios necesarios

### Tabla `turnos` — agregar columna `especialidad`
```sql
ALTER TABLE turnos 
ADD COLUMN IF NOT EXISTS especialidad text DEFAULT 'clinica';
-- Valores posibles: 'clinica', 'dermatologia', 'oftalmologia', 'endocrinologia'
```

### Nueva tabla `especialistas_fechas`
Para que la clínica cargue cuándo viene cada especialista:
```sql
CREATE TABLE IF NOT EXISTS especialistas_fechas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  especialidad text NOT NULL,
  fecha date NOT NULL,
  hora_inicio time NOT NULL DEFAULT '09:00',
  hora_fin time NOT NULL DEFAULT '13:00',
  intervalo_minutos int NOT NULL DEFAULT 30,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
```

---

## Diseño del panel

- Fondo blanco, sidebar izquierdo con las secciones
- Colores de la clínica: verde lima `#A8D400` y púrpura `#6B2FA0`
- Tipografía limpia, tablas claras
- Diseño desktop-first (se usa principalmente en computadora)
- NO tiene que ser fancy — tiene que ser funcional y claro

### Sidebar
```
🏥 Clínica General
🔬 Dermatología  
👁️ Oftalmología
💊 Endocrinología
📅 Fechas Especialistas
```

---

## Vista de turnos por sección

Cada sección (clínica, dermatología, etc.) muestra una tabla con:

| Campo | Descripción |
|-------|-------------|
| Fecha y hora | Del turno |
| Nombre | Nombre + apellido del dueño |
| Mascota | Nombre y especie |
| Motivo | Motivo de consulta |
| Teléfono | Con botón directo a WhatsApp |
| Estado | Badge de color: pendiente (amarillo), confirmado (verde), cancelado (rojo) |
| Acciones | Botones: Confirmar / Cancelar |

### Filtros disponibles
- Por fecha (hoy / mañana / esta semana / todas)
- Por estado (pendiente / confirmado / cancelado / todos)

### Ordenamiento
- Por defecto: más próximos primero

---

## Acciones del panel

### Confirmar turno
1. Admin hace click en "Confirmar"
2. Estado cambia a `confirmado` en Supabase
3. Se dispara automáticamente la Edge Function `notificar-turno-confirmado` 
   que manda WhatsApp al cliente con el mensaje de confirmación

### Cancelar turno
1. Admin hace click en "Cancelar"
2. Aparece modal pidiendo motivo (opcional)
3. Estado cambia a `cancelado`
4. Se manda WhatsApp al cliente:
```
❌ Hola {nombre}, lamentablemente tuvimos que cancelar el turno 
de {mascota} del {fecha} a las {hora}.

Por favor comunicate con nosotros para reprogramarlo:
📞 03548-495677
💬 WhatsApp: 03548 15-63-2527
```

---

## Lógica del recordatorio (actualizar Edge Function)

Reemplazar la lógica actual de `recordatorio-turnos` por esta:

```
SI el turno es en MÁS de 2 horas:
  → mandar recordatorio 2 horas antes

SI el turno es en MENOS de 2 horas (se confirmó tarde):
  → mandar recordatorio inmediatamente después de confirmar
  → NO esperar el cron
```

Mensaje de recordatorio:
```
🔔 ¡Hola {nombre}! Te recordamos que hoy a las {hora} tenés turno 
en Clínica Veterinaria Peón Pet's.

🐾 Mascota: {mascota} ({especie})
📋 Motivo: {motivo}
📍 Rivadavia 36, La Falda

¡Te esperamos! 🌿
```

El cron sigue corriendo cada hora para los recordatorios normales de +2hs.

---

## Gestión de fechas de especialistas (`/admin/especialidades`)

Esta sección permite cargar cuándo viene cada especialista:

- Formulario simple: especialidad + fecha + hora inicio + hora fin + intervalo entre turnos
- Lista de fechas cargadas con opción de eliminar
- Esas fechas se muestran automáticamente en el formulario de turnos del cliente
  (cuando el cliente elige "Dermatología" solo ve las fechas disponibles cargadas acá)

---

## Integración con el formulario de turnos del cliente

El formulario público de turnos (`/turnos` o como esté) debe:

1. Mostrar un selector de tipo de consulta:
   - Clínica general (horario normal de la clínica)
   - Dermatología
   - Oftalmología  
   - Endocrinología

2. Si elige especialidad → mostrar solo las fechas cargadas en `especialistas_fechas`
3. Si elige clínica general → mostrar el calendario normal con horarios de la clínica

4. Al guardar el turno, incluir el campo `especialidad` en la tabla `turnos`

---

## Checklist de entrega

- [ ] `/admin/login` con autenticación simple
- [ ] Sidebar con navegación por especialidad
- [ ] Tabla de turnos con filtros para cada sección
- [ ] Botones confirmar/cancelar funcionando
- [ ] WhatsApp de cancelación implementado
- [ ] Lógica de recordatorio actualizada (2hs o inmediato)
- [ ] Tabla `especialistas_fechas` creada
- [ ] Página de gestión de fechas de especialistas
- [ ] Formulario público actualizado con selector de especialidad
- [ ] Campo `especialidad` en tabla `turnos`
