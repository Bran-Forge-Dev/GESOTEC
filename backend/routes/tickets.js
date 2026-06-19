const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { enviarEmailTicketAsignado, enviarEmailTicketActualizado } = require('../services/emailService');

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

// Obtener tickets de un técnico
router.get('/tecnico/:tecnico_id', async (req, res) => {
    try {
        const { tecnico_id } = req.params;

        const { data: tickets, error } = await supabase
            .from('tickets')
            .select(`
                *,
                usuarios!tickets_usuario_id_fkey (nombre, apellido),
                tecnico:usuarios!tickets_tecnico_id_fkey (nombre, apellido)
            `)
            .eq('tecnico_id', tecnico_id)
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
        const { asunto, descripcion, prioridad, estado, tecnico_id, calificacion } = req.body;

        console.log('Actualizando ticket ID:', id);
        console.log('Datos recibidos:', { asunto, descripcion, prioridad, estado, tecnico_id, calificacion });

        // Verificar que el ticket existe y obtener datos actuales
        const { data: existingTicket, error: checkError } = await supabase
            .from('tickets')
            .select('*')
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
        if (calificacion !== undefined) updateData.calificacion = calificacion;
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

        // Si se asignó un técnico nuevo, enviar email y crear notificación
        if (tecnico_id !== undefined && tecnico_id !== existingTicket.tecnico_id) {
            console.log('Asignando técnico nuevo. tecnico_id:', tecnico_id, 'tecnico anterior:', existingTicket.tecnico_id);
            try {
                // Obtener datos del técnico
                const { data: tecnico, error: tecnicoError } = await supabase
                    .from('usuarios')
                    .select('nombre, apellido, email')
                    .eq('id', tecnico_id)
                    .single();

                console.log('Datos del técnico:', tecnico, 'Error:', tecnicoError);

                if (!tecnicoError && tecnico) {
                    // Enviar email al técnico
                    const emailResult = await enviarEmailTicketAsignado(
                        tecnico.email,
                        `${tecnico.nombre} ${tecnico.apellido || ''}`,
                        updatedTicket
                    );

                    console.log('Resultado de envío de email:', emailResult);

                    // Crear notificación en la base de datos
                    const { error: notifError } = await supabase
                        .from('notificaciones')
                        .insert({
                            usuario_id: tecnico_id,
                            tipo: 'ticket_asignado',
                            titulo: `Nuevo Ticket Asignado #${updatedTicket.id}`,
                            mensaje: `Se te ha asignado el ticket: ${updatedTicket.asunto}`,
                            ticket_id: updatedTicket.id,
                            leida: false
                        });

                    if (notifError) {
                        console.error('Error al crear notificación:', notifError);
                    } else {
                        console.log('Notificación creada exitosamente para técnico:', tecnico_id);
                    }
                } else {
                    console.error('Error al obtener datos del técnico:', tecnicoError);
                }
            } catch (emailError) {
                console.error('Error al enviar email o crear notificación:', emailError);
                // No fallar la actualización si el email falla
            }
        } else {
            console.log('No se asignó técnico nuevo o el técnico es el mismo');
        }

        // Si el estado cambió, enviar email de actualización al usuario
        if (estado !== undefined && estado !== existingTicket.estado) {
            console.log('Estado cambió. Nuevo estado:', estado, 'Estado anterior:', existingTicket.estado);
            try {
                // Obtener datos del usuario
                const { data: usuario, error: usuarioError } = await supabase
                    .from('usuarios')
                    .select('nombre, apellido, email')
                    .eq('id', existingTicket.usuario_id)
                    .single();

                console.log('Datos del usuario:', usuario, 'Error:', usuarioError);

                if (!usuarioError && usuario) {
                    // Enviar email al usuario
                    const emailResult = await enviarEmailTicketActualizado(
                        usuario.email,
                        `${usuario.nombre} ${usuario.apellido || ''}`,
                        updatedTicket
                    );

                    console.log('Resultado de envío de email de actualización:', emailResult);

                    // Crear notificación en la base de datos
                    const { error: notifError } = await supabase
                        .from('notificaciones')
                        .insert({
                            usuario_id: existingTicket.usuario_id,
                            tipo: 'ticket_actualizado',
                            titulo: `Ticket #${updatedTicket.id} Actualizado`,
                            mensaje: `El estado de tu ticket ha cambiado a: ${estado}`,
                            ticket_id: updatedTicket.id,
                            leida: false
                        });

                    if (notifError) {
                        console.error('Error al crear notificación:', notifError);
                    } else {
                        console.log('Notificación creada exitosamente para usuario:', existingTicket.usuario_id);
                    }
                } else {
                    console.error('Error al obtener datos del usuario:', usuarioError);
                }
            } catch (emailError) {
                console.error('Error al enviar email de actualización:', emailError);
                // No fallar la actualización si el email falla
            }
        } else {
            console.log('No cambió el estado');
        }

        res.json({
            message: 'Ticket actualizado exitosamente',
            ticket: updatedTicket
        });

    } catch (error) {
        console.error('Error al actualizar ticket:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

// Obtener estadísticas de tickets de un usuario
router.get('/usuario/:usuario_id/estadisticas', async (req, res) => {
    try {
        const { usuario_id } = req.params;

        // Obtener todos los tickets del usuario
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('usuario_id', usuario_id);

        if (error) {
            console.error('Error al obtener tickets:', error);
            return res.status(500).json({ error: 'Error al obtener tickets' });
        }

        // Calcular estadísticas
        const ticketsTotales = tickets.length;
        const ticketsEnProceso = tickets.filter(t => t.estado === 'En Proceso').length;
        const ticketsCompletados = tickets.filter(t => t.estado === 'Cerrado' || t.estado === 'Resuelto').length;

        res.json({
            tickets_totales: ticketsTotales,
            tickets_en_proceso: ticketsEnProceso,
            tickets_completados: ticketsCompletados
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener actividades recientes de un técnico (tickets resueltos)
router.get('/tecnico/:tecnico_id/actividades-recientes', async (req, res) => {
    try {
        const { tecnico_id } = req.params;

        // Obtener tickets resueltos por el técnico
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('tecnico_id', tecnico_id)
            .in('estado', ['Cerrado', 'Resuelto'])
            .order('fecha_actualizacion', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Error al obtener actividades recientes:', error);
            return res.status(500).json({ error: 'Error al obtener actividades recientes' });
        }

        res.json(tickets);

    } catch (error) {
        console.error('Error al obtener actividades recientes:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
