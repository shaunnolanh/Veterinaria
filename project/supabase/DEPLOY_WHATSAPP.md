# Deploy — Notificaciones WhatsApp via Twilio

## Paso 1 — Migración SQL

En **Supabase Dashboard → SQL Editor**, ejecutar:

```sql
-- supabase/migrations/001_add_recordatorio_enviado.sql
ALTER TABLE turnos
  ADD COLUMN IF NOT EXISTS recordatorio_enviado BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_turnos_recordatorio
  ON turnos (estado, recordatorio_enviado, fecha, hora)
  WHERE estado = 'confirmado' AND recordatorio_enviado = false;
```

---

## Paso 2 — Deploy de las Edge Functions

Desde la terminal, en la raíz del proyecto:

```bash
# Instalar Supabase CLI si no lo tenés
npm install -g supabase

# Login
supabase login

# Linkear al proyecto
supabase link --project-ref TU_PROJECT_REF

# Deploy de las dos funciones
supabase functions deploy notificar-turno-confirmado
supabase functions deploy recordatorio-turnos
```

> El `PROJECT_REF` lo encontrás en Supabase Dashboard → Settings → General.

---

## Paso 3 — Configurar secrets en Supabase

En **Supabase Dashboard → Edge Functions → Secrets** (o via CLI):

```bash
supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxx...
```

> Los secrets `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` también están
> disponibles automáticamente en las Edge Functions si los configurás en
> Project Settings → API.

---

## Paso 4 — Database Webhook para notificar-turno-confirmado

En **Supabase Dashboard → Database → Webhooks → Create new webhook**:

| Campo        | Valor                                                           |
|:-------------|:----------------------------------------------------------------|
| Name         | `on_turno_insert`                                               |
| Table        | `turnos`                                                        |
| Events       | `INSERT`                                                        |
| Type         | `Supabase Edge Functions`                                       |
| Function     | `notificar-turno-confirmado`                                    |

---

## Paso 5 — Cron job para recordatorio-turnos

En **Supabase Dashboard → Edge Functions → recordatorio-turnos → Schedules**:

| Campo    | Valor          |
|:---------|:---------------|
| Schedule | `0 * * * *`    |
| (cron)   | cada hora en punto |

> Esto corre la función a las XX:00 de cada hora. Como la ventana son ±30 min
> alrededor de las 24 hs, con frecuencia horaria es suficiente para no perder
> ningún turno.

---

## Cómo probar manualmente

### Probar notificar-turno-confirmado

```bash
curl -X POST \
  "https://TU_PROJECT_REF.supabase.co/functions/v1/notificar-turno-confirmado" \
  -H "Authorization: Bearer TU_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "record": {
      "id": "test-123",
      "nombre": "Juan",
      "telefono": "3548156327",
      "mascota": "Firulais",
      "especie": "perro",
      "motivo": "Vacunación",
      "fecha": "2026-03-15",
      "hora": "10:00"
    }
  }'
```

### Probar recordatorio-turnos

```bash
curl -X POST \
  "https://TU_PROJECT_REF.supabase.co/functions/v1/recordatorio-turnos" \
  -H "Authorization: Bearer TU_ANON_KEY"
```

---

## Logs

Los logs de cada función están en:
**Supabase Dashboard → Edge Functions → [nombre función] → Logs**

Los errores de Twilio aparecen con el prefijo `[Twilio]`.
