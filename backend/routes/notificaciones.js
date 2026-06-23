const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Función para obtener el cliente de Supabase
function getSupabaseClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridos');
    }
    
    return createClient(supabaseUrl, supabaseKey);
}

/**
 * GET /api/notificaciones/usuario/:usuario_id
 * Obtener todas las notificaciones de un usuario
 */
router.get('/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('ge_notificaciones')
            .select('*')
            .eq('usuario_id', usuario_id)
            .order('fecha_creacion', { ascending: false })
            .limit(50);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
});

/**
 * GET /api/notificaciones/usuario/:usuario_id/no-leidas
 * Obtener notificaciones no leídas de un usuario
 */
router.get('/usuario/:usuario_id/no-leidas', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const supabase = getSupabaseClient();
        
        const { data, error } = await supabase
            .from('ge_notificaciones')
            .select('*')
            .eq('usuario_id', usuario_id)
            .eq('leida', false)
            .order('fecha_creacion', { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Error al obtener notificaciones no leídas:', error);
        res.status(500).json({ error: 'Error al obtener notificaciones no leídas' });
    }
});

/**
 * GET /api/notificaciones/usuario/:usuario_id/contador
 * Obtener contador de notificaciones no leídas
 */
router.get('/usuario/:usuario_id/contador', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const supabase = getSupabaseClient();
        
        const { count, error } = await supabase
            .from('ge_notificaciones')
            .select('*', { count: 'exact', head: true })
            .eq('usuario_id', usuario_id)
            .eq('leida', false);

        if (error) throw error;

        res.json({ contador: count || 0 });
    } catch (error) {
        console.error('Error al obtener contador de notificaciones:', error);
        res.status(500).json({ error: 'Error al obtener contador de notificaciones' });
    }
});

/**
 * POST /api/notificaciones
 * Crear una nueva notificación
 */
router.post('/', async (req, res) => {
    try {
        const { usuario_id, tipo, titulo, mensaje, ticket_id } = req.body;
        const supabase = getSupabaseClient();

        if (!usuario_id || !tipo || !titulo || !mensaje) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const { data, error } = await supabase
            .from('ge_notificaciones')
            .insert([
                {
                    usuario_id,
                    tipo,
                    titulo,
                    mensaje,
                    ticket_id: ticket_id || null,
                    leida: false,
                    fecha_creacion: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;

        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Error al crear notificación:', error);
        res.status(500).json({ error: 'Error al crear notificación' });
    }
});

/**
 * PUT /api/notificaciones/:id/marcar-leida
 * Marcar una notificación como leída
 */
router.put('/:id/marcar-leida', async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('ge_notificaciones')
            .update({ leida: true })
            .eq('id', id)
            .select();

        if (error) throw error;

        if (data.length === 0) {
            return res.status(404).json({ error: 'Notificación no encontrada' });
        }

        res.json(data[0]);
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        res.status(500).json({ error: 'Error al marcar notificación como leída' });
    }
});

/**
 * PUT /api/notificaciones/usuario/:usuario_id/marcar-todas-leidas
 * Marcar todas las notificaciones de un usuario como leídas
 */
router.put('/usuario/:usuario_id/marcar-todas-leidas', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const supabase = getSupabaseClient();

        const { data, error } = await supabase
            .from('ge_notificaciones')
            .update({ leida: true })
            .eq('usuario_id', usuario_id)
            .eq('leida', false)
            .select();

        if (error) throw error;

        res.json({ mensaje: 'Notificaciones marcadas como leídas', cantidad: data.length });
    } catch (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        res.status(500).json({ error: 'Error al marcar todas las notificaciones como leídas' });
    }
});

/**
 * DELETE /api/notificaciones/:id
 * Eliminar una notificación
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const supabase = getSupabaseClient();

        const { error } = await supabase
            .from('ge_notificaciones')
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.json({ mensaje: 'Notificación eliminada' });
    } catch (error) {
        console.error('Error al eliminar notificación:', error);
        res.status(500).json({ error: 'Error al eliminar notificación' });
    }
});

module.exports = router;
