const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Obtener todos los tickets (solo admin)
router.get('/', async (req, res) => {
    try {
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('*')
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error al obtener tickets:', error);
            return res.status(500).json({ error: 'Error al obtener tickets' });
        }

        res.json(tickets);

    } catch (error) {
        console.error('Error al obtener tickets:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nuevo ticket
router.post('/', async (req, res) => {
    try {
        const { asunto, descripcion, prioridad, archivo_adjunto, usuario_id } = req.body;

        // Validaciones
        if (!asunto || !descripcion || !usuario_id) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        // Insertar ticket
        const { data: newTicket, error } = await supabase
            .from('tickets')
            .insert({
                asunto,
                descripcion,
                prioridad: prioridad || 'Media',
                estado: 'Abierto',
                usuario_id
            })
            .select('id, asunto, descripcion, prioridad, estado, usuario_id, tecnico_id, fecha_creacion, fecha_actualizacion')
            .single();

        if (error) {
            console.error('Error al crear ticket:', error);
            return res.status(500).json({ error: 'Error al crear ticket' });
        }

        res.status(201).json({ 
            message: 'Ticket creado exitosamente',
            ticket: newTicket 
        });

    } catch (error) {
        console.error('Error al crear ticket:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener tickets de un usuario
router.get('/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('usuario_id', usuario_id)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error al obtener tickets:', error);
            return res.status(500).json({ error: 'Error al obtener tickets' });
        }

        res.json(tickets);

    } catch (error) {
        console.error('Error al obtener tickets:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener ticket por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: ticket, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !ticket) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        res.json(ticket);

    } catch (error) {
        console.error('Error al obtener ticket:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar ticket
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { asunto, descripcion, prioridad, estado, tecnico_id } = req.body;

        const { data: updatedTicket, error } = await supabase
            .from('tickets')
            .update({
                asunto,
                descripcion,
                prioridad,
                estado,
                tecnico_id,
                fecha_actualizacion: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar ticket:', error);
            return res.status(500).json({ error: 'Error al actualizar ticket' });
        }

        res.json({ 
            message: 'Ticket actualizado exitosamente',
            ticket: updatedTicket 
        });

    } catch (error) {
        console.error('Error al actualizar ticket:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
