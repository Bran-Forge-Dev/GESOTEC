-- Script para renombrar tablas de Supabase con prefijo ge_
-- Este script renombra todas las tablas de GESOTEC para diferenciarlas de otros proyectos

-- Renombrar tabla usuarios a ge_usuarios
ALTER TABLE usuarios RENAME TO ge_usuarios;

-- Renombrar tabla tickets a ge_tickets
ALTER TABLE tickets RENAME TO ge_tickets;

-- Renombrar tabla tareas a ge_tareas
ALTER TABLE tareas RENAME TO ge_tareas;

-- Renombrar tabla notificaciones a ge_notificaciones
ALTER TABLE notificaciones RENAME TO ge_notificaciones;

-- Renombrar tabla base_conocimiento a ge_base_conocimiento
ALTER TABLE base_conocimiento RENAME TO ge_base_conocimiento;

-- Nota: Es posible que también necesites actualizar las foreign keys y otras referencias
-- en la base de datos. Este script solo renombra las tablas principales.
