-- Crear tabla de tareas
CREATE TABLE IF NOT EXISTS tareas (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50) DEFAULT 'general',
    prioridad VARCHAR(50) DEFAULT 'Media',
    estado VARCHAR(50) DEFAULT 'Por Hacer',
    tecnico_id INTEGER,
    fecha_limite DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_completacion TIMESTAMP
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_tareas_tecnico_id ON tareas(tecnico_id);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON tareas(estado);
CREATE INDEX IF NOT EXISTS idx_tareas_prioridad ON tareas(prioridad);
CREATE INDEX IF NOT EXISTS idx_tareas_categoria ON tareas(categoria);
