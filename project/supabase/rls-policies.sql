-- Políticas RLS para Veterinaria
-- Ejecutar en Supabase SQL Editor.

-- =========================================
-- turnos
-- =========================================
alter table public.turnos enable row level security;

-- Lectura/edición solo para el dueño del registro autenticado (si user_id existe).
drop policy if exists turnos_select_owner on public.turnos;
create policy turnos_select_owner
on public.turnos
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists turnos_update_owner on public.turnos;
create policy turnos_update_owner
on public.turnos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Permitir alta pública de turnos desde la web (sin exponer update/delete públicos).
drop policy if exists turnos_insert_public on public.turnos;
create policy turnos_insert_public
on public.turnos
for insert
to anon, authenticated
with check (true);

-- =========================================
-- pedidos
-- =========================================
alter table public.pedidos enable row level security;

drop policy if exists pedidos_select_owner on public.pedidos;
create policy pedidos_select_owner
on public.pedidos
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists pedidos_update_owner on public.pedidos;
create policy pedidos_update_owner
on public.pedidos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Permitir creación de pedidos desde frontend/backend público.
drop policy if exists pedidos_insert_public on public.pedidos;
create policy pedidos_insert_public
on public.pedidos
for insert
to anon, authenticated
with check (true);

-- =========================================
-- productos
-- =========================================
alter table public.productos enable row level security;

drop policy if exists productos_select_public on public.productos;
create policy productos_select_public
on public.productos
for select
to anon, authenticated
using (activo = true);

-- No se habilitan INSERT/UPDATE/DELETE públicos.
-- Las operaciones administrativas deben ir por service role.
drop policy if exists productos_admin_insert on public.productos;
create policy productos_admin_insert
on public.productos
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists productos_admin_update on public.productos;
create policy productos_admin_update
on public.productos
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists productos_admin_delete on public.productos;
create policy productos_admin_delete
on public.productos
for delete
to authenticated
using (auth.uid() = user_id);

-- =========================================
-- especialistas_fechas
-- =========================================
alter table public.especialistas_fechas enable row level security;

drop policy if exists especialistas_fechas_select_public on public.especialistas_fechas;
create policy especialistas_fechas_select_public
on public.especialistas_fechas
for select
to anon, authenticated
using (true);

drop policy if exists especialistas_fechas_admin_write on public.especialistas_fechas;
create policy especialistas_fechas_admin_write
on public.especialistas_fechas
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================
-- horarios_bloqueados
-- =========================================
alter table public.horarios_bloqueados enable row level security;

drop policy if exists horarios_bloqueados_select_public on public.horarios_bloqueados;
create policy horarios_bloqueados_select_public
on public.horarios_bloqueados
for select
to anon, authenticated
using (true);

drop policy if exists horarios_bloqueados_admin_write on public.horarios_bloqueados;
create policy horarios_bloqueados_admin_write
on public.horarios_bloqueados
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- =========================================
-- Storage bucket productos-imagenes
-- =========================================
-- Políticas explícitas sobre storage.objects para bucket público de lectura.
drop policy if exists storage_productos_imagenes_read on storage.objects;
create policy storage_productos_imagenes_read
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'productos-imagenes');

drop policy if exists storage_productos_imagenes_write on storage.objects;
create policy storage_productos_imagenes_write
on storage.objects
for all
to authenticated
using (bucket_id = 'productos-imagenes' and auth.uid() = owner)
with check (bucket_id = 'productos-imagenes' and auth.uid() = owner);
