const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Helper para calcular rango de fechas
function getFechaRango(rango) {
    const ahora = new Date();
    let inicio;

    switch (rango) {
        case 'week':
            inicio = new Date(ahora);
            inicio.setDate(ahora.getDate() - 7);
            break;
        case 'month':
            inicio = new Date(ahora);
            inicio.setMonth(ahora.getMonth() - 1);
            break;
        case 'quarter':
            inicio = new Date(ahora);
            inicio.setMonth(ahora.getMonth() - 3);
            break;
        case 'year':
            inicio = new Date(ahora);
            inicio.setFullYear(ahora.getFullYear() - 1);
            break;
        default:
            inicio = new Date(ahora);
            inicio.setMonth(ahora.getMonth() - 1);
    }

    return { inicio, fin: ahora };
}

// Obtener KPIs principales
router.get('/kpis', async (req, res) => {
    try {
        const { rango = 'month' } = req.query;
        const { inicio, fin } = getFechaRango(rango);

        // Obtener total de tickets en el rango
        const { data: totalTickets, error: totalError } = await supabase
            .from('tickets')
            .select('id')
            .gte('fecha_creacion', inicio.toISOString())
            .lte('fecha_creacion', fin.toISOString());

        // Obtener tickets resueltos
        const { data: resueltos, error: resueltosError } = await supabase
            .from('tickets')
            .select('id')
            .gte('fecha_creacion', inicio.toISOString())
            .lte('fecha_creacion', fin.toISOString())
            .in('estado', ['Resuelto', 'Cerrado']);

        // Obtener tickets en proceso
        const { data: enProceso, error: enProcesoError } = await supabase
            .from('tickets')
            .select('id')
            .gte('fecha_creacion', inicio.toISOString())
            .lte('fecha_creacion', fin.toISOString())
            .eq('estado', 'En Progreso');

        // Obtener backlog (tickets abiertos)
        const { data: backlog, error: backlogError } = await supabase
            .from('tickets')
            .select('id')
            .in('estado', ['Abierto', 'En Progreso']);

        // Calcular tendencias (comparar con período anterior)
        const { inicio: inicioAnterior, fin: finAnterior } = getFechaRango(rango);
        const { data: totalAnterior } = await supabase
            .from('tickets')
            .select('id')
            .gte('fecha_creacion', inicioAnterior.toISOString())
            .lte('fecha_creacion', finAnterior.toISOString());

        const tendenciaTotal = calcularTendencia(totalTickets?.length || 0, totalAnterior?.length || 0);

        res.json({
            total_tickets: totalTickets?.length || 0,
            resueltos: resueltos?.length || 0,
            en_proceso: enProceso?.length || 0,
            backlog: backlog?.length || 0,
            tendencia_total: tendenciaTotal,
            tendencia_resueltos: { valor: 0, direccion: 'neutral' },
            tendencia_en_proceso: { valor: 0, direccion: 'neutral' },
            tendencia_backlog: { valor: 0, direccion: 'neutral' }
        });

    } catch (error) {
        console.error('Error al obtener KPIs:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener volumen de tickets por período
router.get('/volumen', async (req, res) => {
    try {
        const { rango = 'month' } = req.query;
        const { inicio, fin } = getFechaRango(rango);

        // Obtener tickets agrupados por día/semana
        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('fecha_creacion')
            .gte('fecha_creacion', inicio.toISOString())
            .lte('fecha_creacion', fin.toISOString())
            .order('fecha_creacion', { ascending: true });

        if (error) {
            console.error('Error al obtener volumen:', error);
            return res.status(500).json({ error: 'Error al obtener volumen de tickets' });
        }

        // Agrupar por período
        const datos = agruparPorPeriodo(tickets, rango);

        res.json({ datos });

    } catch (error) {
        console.error('Error al obtener volumen:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener clasificación de problemas
router.get('/clasificacion', async (req, res) => {
    try {
        const { rango = 'month' } = req.query;
        const { inicio, fin } = getFechaRango(rango);

        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('categoria')
            .gte('fecha_creacion', inicio.toISOString())
            .lte('fecha_creacion', fin.toISOString());

        if (error) {
            console.error('Error al obtener clasificación:', error);
            return res.status(500).json({ error: 'Error al obtener clasificación' });
        }

        // Agrupar por categoría
        const clasificacion = {};
        tickets.forEach(ticket => {
            const categoria = ticket.categoria || 'Sin categoría';
            clasificacion[categoria] = (clasificacion[categoria] || 0) + 1;
        });

        const datos = Object.entries(clasificacion).map(([tipo, cantidad]) => ({
            tipo,
            cantidad
        })).sort((a, b) => b.cantidad - a.cantidad);

        res.json({ datos });

    } catch (error) {
        console.error('Error al obtener clasificación:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener desempeño de técnicos
router.get('/tecnicos', async (req, res) => {
    try {
        const { rango = 'month' } = req.query;
        const { inicio, fin } = getFechaRango(rango);

        // Obtener técnicos
        const { data: tecnicos, error: tecnicosError } = await supabase
            .from('usuarios')
            .select('id, nombre, apellido')
            .eq('rol', 'tecnico');

        if (tecnicosError) {
            console.error('Error al obtener técnicos:', tecnicosError);
            return res.status(500).json({ error: 'Error al obtener técnicos' });
        }

        // Para cada técnico, obtener sus métricas
        const datos = await Promise.all(tecnicos.map(async (tecnico) => {
            console.log(`Buscando tickets para técnico ID: ${tecnico.id}, Nombre: ${tecnico.nombre}`);
            
            // Tickets asignados (sin filtro de fecha para contar todos)
            const { data: allTickets, error: ticketsError } = await supabase
                .from('tickets')
                .select('id, estado, fecha_creacion, tecnico_id, calificacion')
                .eq('tecnico_id', tecnico.id);

            if (ticketsError) {
                console.error(`Error al obtener tickets para técnico ${tecnico.nombre}:`, ticketsError);
            }

            console.log(`Técnico: ${tecnico.nombre}, Total tickets: ${allTickets?.length || 0}`);
            console.log('Estados de tickets:', allTickets?.map(t => t.estado));
            console.log('tecnico_id de tickets:', allTickets?.map(t => t.tecnico_id));

            const ticketsResueltos = allTickets?.filter(t => ['Resuelto', 'Cerrado'].includes(t.estado)).length || 0;
            const ticketsEnProceso = allTickets?.filter(t => t.estado === 'En Proceso').length || 0;
            
            console.log(`Tickets resueltos: ${ticketsResueltos}, Tickets en proceso: ${ticketsEnProceso}`);
            
            // Tickets en el rango de fechas para métricas de tiempo
            const { data: tickets } = await supabase
                .from('tickets')
                .select('id, estado, fecha_creacion')
                .eq('tecnico_id', tecnico.id)
                .gte('fecha_creacion', inicio.toISOString())
                .lte('fecha_creacion', fin.toISOString());

            const ticketsResueltosPeriodo = tickets?.filter(t => ['Resuelto', 'Cerrado'].includes(t.estado)).length || 0;
            
            // Calificación promedio
            const ticketsConCalificacion = allTickets?.filter(t => t.calificacion) || [];
            const calificacionPromedio = ticketsConCalificacion.length > 0
                ? ticketsConCalificacion.reduce((sum, t) => sum + t.calificacion, 0) / ticketsConCalificacion.length
                : null;

            // Tiempo promedio de resolución (no disponible sin fecha_resolucion)
            const tiempoPromedio = null;

            // Tasa de resolución
            const tasaResolucion = ticketsResueltos > 0 
                ? (ticketsResueltos / (ticketsResueltos + ticketsEnProceso)) * 100 
                : null;

            return {
                nombre: `${tecnico.nombre} ${tecnico.apellido || ''}`,
                tickets_atendidos: ticketsResueltos,
                tickets_en_proceso: ticketsEnProceso,
                calificacion_promedio: calificacionPromedio,
                tiempo_promedio: tiempoPromedio ? Math.round(tiempoPromedio) : null,
                tasa_resolucion: tasaResolucion
            };
        }));

        res.json({ datos });

    } catch (error) {
        console.error('Error al obtener desempeño de técnicos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener estado de tickets
router.get('/estado', async (req, res) => {
    try {
        const { rango = 'month' } = req.query;
        const { inicio, fin } = getFechaRango(rango);

        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('estado')
            .gte('fecha_creacion', inicio.toISOString())
            .lte('fecha_creacion', fin.toISOString());

        if (error) {
            console.error('Error al obtener estado:', error);
            return res.status(500).json({ error: 'Error al obtener estado de tickets' });
        }

        // Agrupar por estado
        const estados = {};
        tickets.forEach(ticket => {
            const estado = ticket.estado || 'Sin estado';
            estados[estado] = (estados[estado] || 0) + 1;
        });

        const datos = Object.entries(estados).map(([estado, cantidad]) => ({
            estado,
            cantidad
        })).sort((a, b) => b.cantidad - a.cantidad);

        res.json({ datos });

    } catch (error) {
        console.error('Error al obtener estado:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener distribución por departamento
router.get('/departamento', async (req, res) => {
    try {
        const { rango = 'month' } = req.query;
        const { inicio, fin } = getFechaRango(rango);

        const { data: tickets, error } = await supabase
            .from('tickets')
            .select('usuario_id')
            .gte('fecha_creacion', inicio.toISOString())
            .lte('fecha_creacion', fin.toISOString());

        if (error) {
            console.error('Error al obtener distribución por departamento:', error);
            return res.status(500).json({ error: 'Error al obtener distribución por departamento' });
        }

        // Obtener usuarios para obtener sus departamentos
        const userIds = [...new Set(tickets.map(t => t.usuario_id))];
        const { data: usuarios, error: usuariosError } = await supabase
            .from('usuarios')
            .select('id, departamento')
            .in('id', userIds);

        if (usuariosError) {
            console.error('Error al obtener usuarios:', usuariosError);
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }

        // Crear mapa de usuario a departamento
        const usuarioDepartamento = {};
        usuarios.forEach(u => {
            usuarioDepartamento[u.id] = u.departamento || 'Sin departamento';
        });

        // Agrupar por departamento
        const departamentos = {};
        tickets.forEach(ticket => {
            const depto = usuarioDepartamento[ticket.usuario_id] || 'Sin departamento';
            departamentos[depto] = (departamentos[depto] || 0) + 1;
        });

        const datos = Object.entries(departamentos).map(([departamento, cantidad]) => ({
            departamento,
            cantidad
        })).sort((a, b) => b.cantidad - a.cantidad);

        res.json({ datos });

    } catch (error) {
        console.error('Error al obtener distribución por departamento:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Helper para calcular tendencia
function calcularTendencia(actual, anterior) {
    if (anterior === 0) {
        return { valor: actual > 0 ? 100 : 0, direccion: actual > 0 ? 'up' : 'neutral' };
    }
    
    const variacion = ((actual - anterior) / anterior) * 100;
    return {
        valor: Math.round(variacion),
        direccion: variacion > 0 ? 'up' : variacion < 0 ? 'down' : 'neutral'
    };
}

// Helper para agrupar por período
function agruparPorPeriodo(tickets, rango) {
    const agrupado = {};

    tickets.forEach(ticket => {
        const fecha = new Date(ticket.fecha_creacion);
        let clave;

        switch (rango) {
            case 'week':
                clave = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
                break;
            case 'month':
                clave = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                break;
            case 'quarter':
                clave = fecha.toLocaleDateString('es-ES', { week: 'numeric', month: 'short' });
                break;
            case 'year':
                clave = fecha.toLocaleDateString('es-ES', { month: 'short' });
                break;
            default:
                clave = fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        }

        agrupado[clave] = (agrupado[clave] || 0) + 1;
    });

    return Object.entries(agrupado).map(([periodo, cantidad]) => ({
        periodo,
        cantidad,
        tendencia: 'neutral',
        variacion: 0
    }));
}

module.exports = router;
