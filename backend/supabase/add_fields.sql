-- Agregar campos adicionales a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS id_empleado VARCHAR(20),
ADD COLUMN IF NOT EXISTS fecha_ingreso DATE,
ADD COLUMN IF NOT EXISTS turno VARCHAR(50);

-- Crear índice para id_empleado
CREATE INDEX IF NOT EXISTS idx_usuarios_id_empleado ON usuarios(id_empleado);
