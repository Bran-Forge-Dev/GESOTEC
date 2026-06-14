-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'ticket_asignado', 'ticket_actualizado', 'ticket_cerrado'
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    ticket_id INTEGER,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

-- Crear índice para consultas eficientes
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_fecha ON notificaciones(fecha_creacion);

-- Función para contar notificaciones no leídas
CREATE OR REPLACE FUNCTION contar_notificaciones_no_leidas(usuario_id_param INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM notificaciones
        WHERE usuario_id = usuario_id_param
        AND leida = FALSE
    );
END;
$$ LANGUAGE plpgsql;
