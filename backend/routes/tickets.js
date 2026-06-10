const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Obtener todos los tickets (solo admin)
router.get('/', async (req, res) => {
    try {
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select(`
                *,
                usuarios!tickets_usuario_id_fkey (nombre, apellido),
                tecnico:usuarios!tickets_tecnico_id_fkey (nombre, apellido)
            `)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error al obtener tickets:', error);
            return res.status(500).json({ error: 'Error al obtener tickets' });
        }

        // Formatear los tickets para incluir nombres
        const formattedTickets = tickets.map(ticket => ({
            ...ticket,
            usuario_nombre: ticket.usuarios ? `${ticket.usuarios.nombre} ${ticket.usuarios.apellido || ''}` : 'Usuario',
            tecnico_nombre: ticket.tecnico ? `${ticket.tecnico.nombre} ${ticket.tecnico.apellido || ''}` : null
        }));

        res.json(formattedTickets);

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
            .select(`
                *,
                usuarios!tickets_usuario_id_fkey (nombre, apellido),
                tecnico:usuarios!tickets_tecnico_id_fkey (nombre, apellido)
            `)
            .eq('usuario_id', usuario_id)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error al obtener tickets:', error);
            return res.status(500).json({ error: 'Error al obtener tickets' });
        }

        // Formatear los tickets para incluir nombres
        const formattedTickets = tickets.map(ticket => ({
            ...ticket,
            usuario_nombre: ticket.usuarios ? `${ticket.usuarios.nombre} ${ticket.usuarios.apellido || ''}` : 'Usuario',
            tecnico_nombre: ticket.tecnico ? `${ticket.tecnico.nombre} ${ticket.tecnico.apellido || ''}` : null
        }));

        res.json(formattedTickets);

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
            .select(`
                *,
                usuarios!tickets_usuario_id_fkey (nombre, apellido),
                tecnico:usuarios!tickets_tecnico_id_fkey (nombre, apellido)
            `)
            .eq('id', id)
            .single();

        if (error || !ticket) {
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        // Formatear el ticket para incluir nombres
        const formattedTicket = {
            ...ticket,
            usuario_nombre: ticket.usuarios ? `${ticket.usuarios.nombre} ${ticket.usuarios.apellido || ''}` : 'Usuario',
            tecnico_nombre: ticket.tecnico ? `${ticket.tecnico.nombre} ${ticket.tecnico.apellido || ''}` : null
        };

        res.json(formattedTicket);

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

        console.log('Actualizando ticket ID:', id);
        console.log('Datos recibidos:', { asunto, descripcion, prioridad, estado, tecnico_id });

        // Verificar que el ticket existe
        const { data: existingTicket, error: checkError } = await supabase
            .from('tickets')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError || !existingTicket) {
            console.error('Ticket no encontrado:', checkError);
            return res.status(404).json({ error: 'Ticket no encontrado' });
        }

        // Construir objeto de actualización solo con campos proporcionados
        const updateData = {};
        if (asunto !== undefined) updateData.asunto = asunto;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (prioridad !== undefined) updateData.prioridad = prioridad;
        if (estado !== undefined) updateData.estado = estado;
        if (tecnico_id !== undefined) updateData.tecnico_id = tecnico_id;
        updateData.fecha_actualizacion = new Date().toISOString();

        console.log('Datos a actualizar:', updateData);

        const { data: updatedTicket, error } = await supabase
            .from('tickets')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar ticket:', error);
            return res.status(500).json({ error: 'Error al actualizar ticket', details: error.message });
        }

        console.log('Ticket actualizado exitosamente:', updatedTicket);

        res.json({
            message: 'Ticket actualizado exitosamente',
            ticket: updatedTicket
        });

    } catch (error) {
        console.error('Error al actualizar ticket:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

module.exports = router;
