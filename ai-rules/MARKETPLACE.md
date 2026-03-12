# Marketplace — Clínica Veterinaria Peón Pet's

## Objetivo

Agregar una sección de tienda online a la web existente (Next.js + Supabase) donde los clientes pueden ver productos, armar su carrito y hacer el pedido para retirar en el local. El pago se procesa con Mercado Pago.

---

## Flujo del cliente

1. Cliente entra a `/tienda`
2. Ve los productos por categoría
3. Agrega productos al carrito
4. Click en "Confirmar pedido"
5. Elige si paga online (Mercado Pago) o en efectivo al retirar
6. Si elige Mercado Pago → redirige al checkout de MP → vuelve con confirmación
7. Se genera el pedido en Supabase
8. Le llega WhatsApp confirmando el pedido con detalle y hora estimada de retiro
9. La clínica ve el pedido en el panel admin y lo prepara

---

## Categorías de productos

- 🥩 Alimentos y bolsas
- 💊 Medicamentos
- 🎾 Accesorios
- 🦟 Antiparasitarios
- 🛁 Shampoos y grooming
- 🛏️ Colchones y cuchas

---

## Base de datos — tablas nuevas

### Tabla `productos`
```sql
CREATE TABLE IF NOT EXISTS productos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  descripcion text,
  precio decimal(10,2) NOT NULL,
  categoria text NOT NULL,
  imagen_url text,
  stock int DEFAULT 0,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Tabla `pedidos`
```sql
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre text NOT NULL,
  apellido text NOT NULL,
  telefono text NOT NULL,
  items jsonb NOT NULL, -- [{producto_id, nombre, cantidad, precio_unitario}]
  total decimal(10,2) NOT NULL,
  metodo_pago text NOT NULL, -- 'mercadopago' | 'efectivo'
  estado text DEFAULT 'pendiente', -- pendiente | confirmado | listo | retirado | cancelado
  mp_payment_id text, -- ID del pago de Mercado Pago
  mp_status text, -- approved | pending | rejected
  notas text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## Carga de productos — dos métodos

### Método 1: Carga manual desde el panel admin

En `/admin/tienda` → formulario con:
- Nombre del producto
- Descripción
- Precio
- Categoría (dropdown)
- Stock
- Foto (upload a Supabase Storage)
- Activo/Inactivo

### Método 2: Subir PDF con lista de productos

En `/admin/tienda` → botón "Importar desde PDF"
- El admin sube un PDF con la lista de productos
- Se usa la API de Claude (`claude-sonnet-4-20250514`) para extraer los productos del PDF
- Claude devuelve JSON con: nombre, descripción, precio, categoría
- Se muestra preview de los productos extraídos
- Admin confirma y se insertan en la base de datos
- Las imágenes se cargan manualmente después

#### Prompt para Claude al procesar el PDF:
```
Analizá esta lista de productos de una clínica veterinaria y devolvé SOLO un JSON válido 
con este formato, sin texto adicional:
[
  {
    "nombre": "nombre del producto",
    "descripcion": "descripcion breve",
    "precio": 1234.56,
    "categoria": "una de: alimentos|medicamentos|accesorios|antiparasitarios|shampoos|colchones",
    "stock": 10
  }
]
Si el precio no está claro, poné 0. Categorizá lo mejor posible según el nombre del producto.
```

---

## Integración con Mercado Pago

Usar la API de Mercado Pago Checkout Pro (la más simple).

### Credenciales necesarias (agregar a `.env.local`)
```
MP_ACCESS_TOKEN=tu_access_token_de_mercadopago
MP_PUBLIC_KEY=tu_public_key_de_mercadopago
```

Se obtienen en: https://www.mercadopago.com.ar/developers/panel

### Flujo de pago
```typescript
// Crear preferencia de pago
const preference = {
  items: pedido.items.map(item => ({
    title: item.nombre,
    quantity: item.cantidad,
    unit_price: item.precio_unitario,
    currency_id: "ARS"
  })),
  back_urls: {
    success: `${process.env.NEXT_PUBLIC_URL}/tienda/gracias?pedido=${pedidoId}`,
    failure: `${process.env.NEXT_PUBLIC_URL}/tienda/error`,
    pending: `${process.env.NEXT_PUBLIC_URL}/tienda/pendiente`
  },
  auto_return: "approved",
  external_reference: pedidoId,
  statement_descriptor: "PEON PETS"
}
```

### Webhook de Mercado Pago
Crear endpoint `/api/mp-webhook` que:
1. Recibe notificación de pago aprobado
2. Busca el pedido por `external_reference`
3. Actualiza `mp_payment_id`, `mp_status` y `estado = 'confirmado'`
4. Dispara WhatsApp de confirmación al cliente

---

## Notificaciones WhatsApp para pedidos

### Al confirmar el pedido (pago aprobado o efectivo elegido)
```
🛒 ¡Hola {nombre}! Recibimos tu pedido en Clínica Veterinaria Peón Pet's.

📦 Tu pedido:
{lista de items con cantidad y precio}

💰 Total: ${total}
💳 Pago: {método}
📍 Retiro en: Rivadavia 36, La Falda

Te avisamos cuando esté listo para retirar. 
Ante cualquier duda llamanos al 03548-495677. 🌿
```

### Cuando el pedido está listo para retirar
```
✅ ¡{nombre}, tu pedido está listo!

Podés pasar a retirarlo cuando quieras por:
📍 Rivadavia 36, La Falda
🕐 Horario: Lun-Vie 9-13 y 16-20

¡Te esperamos! 🐾
```

Crear nueva Edge Function `notificar-pedido` que maneje ambos mensajes según el tipo.

---

## Panel admin — sección Tienda (`/admin/tienda`)

### Vista de pedidos
Tabla con:
- Fecha y hora del pedido
- Nombre del cliente
- Productos (resumen)
- Total
- Método de pago
- Estado con badge de color
- Botones: "Listo para retirar" / "Cancelar"

### Filtros
- Por estado: pendiente / confirmado / listo / retirado / todos
- Por fecha: hoy / esta semana / todas

### Gestión de productos
- Lista de todos los productos con foto, precio y stock
- Botón editar / desactivar cada uno
- Botón "Agregar producto"
- Botón "Importar desde PDF"

---

## Página de tienda pública (`/tienda`)

### Diseño
- Misma estética elite que el resto de la web (fondo blanco, verde lima como acento)
- Grid de productos por categoría
- Cada card muestra: foto, nombre, precio, botón "Agregar al carrito"
- Carrito flotante en esquina inferior derecha con contador
- Filtro por categoría arriba

### Carrito
- Sidebar que se abre desde la derecha
- Lista de productos con cantidad editable
- Total calculado
- Botón "Confirmar pedido" → abre modal con formulario:
  - Nombre y apellido
  - Teléfono (para el WhatsApp)
  - Método de pago: Mercado Pago / Efectivo al retirar
- Si elige MP → redirige a Mercado Pago
- Si elige efectivo → confirma directo y manda WhatsApp

---

## Checklist de entrega

- [ ] Tablas `productos` y `pedidos` creadas en Supabase
- [ ] Bucket `productos-imagenes` creado en Supabase Storage
- [ ] Página `/tienda` con grid de productos y carrito
- [ ] Integración con Mercado Pago Checkout Pro
- [ ] Webhook `/api/mp-webhook` para confirmar pagos
- [ ] Edge Function `notificar-pedido` con los dos mensajes de WhatsApp
- [ ] Panel admin `/admin/tienda` con gestión de productos y pedidos
- [ ] Importación de productos desde PDF con Claude API
- [ ] Botón "Listo para retirar" que dispara WhatsApp al cliente
