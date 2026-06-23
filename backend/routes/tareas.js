const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Obtener todas las tareas
router.get('/', async (req, res) => {
    try {
        const { data: tareas, error } = await supabase
            .from('ge_tareas')
            .select('*')
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error al obtener tareas:', error);
            return res.status(500).json({ error: 'Error al obtener tareas' });
        }

        res.json(tareas);

    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener tarea por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: tarea, error } = await supabase
            .from('ge_tareas')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !tarea) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        res.json(tarea);

    } catch (error) {
        console.error('Error al obtener tarea:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nueva tarea
router.post('/', async (req, res) => {
    try {
        const { titulo, descripcion, categoria, prioridad, tecnico_id, fecha_limite } = req.body;

        // Validaciones
        if (!titulo) {
            return res.status(400).json({ error: 'El título es requerido' });
        }

        // Insertar tarea
        const { data: newTarea, error } = await supabase
            .from('ge_tareas')
            .insert({
                titulo,
                descripcion: descripcion || null,
                categoria: categoria || 'general',
                prioridad: prioridad || 'Media',
                estado: 'Por Hacer',
                tecnico_id: tecnico_id || null,
                fecha_limite: fecha_limite || null
            })
            .select('id, titulo, descripcion, categoria, prioridad, estado, tecnico_id, fecha_limite, fecha_creacion, fecha_actualizacion')
            .single();

        if (error) {
            console.error('Error al crear tarea:', error);
            return res.status(500).json({ error: 'Error al crear tarea' });
        }

        res.status(201).json({ 
            message: 'Tarea creada exitosamente',
            tarea: newTarea 
        });

    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar tarea
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, categoria, prioridad, estado, tecnico_id, fecha_limite } = req.body;

        console.log('Actualizando tarea ID:', id);
        console.log('Datos recibidos:', { titulo, descripcion, categoria, prioridad, estado, tecnico_id, fecha_limite });

        // Verificar que la tarea existe
        const { data: existingTarea, error: checkError } = await supabase
            .from('ge_tareas')
            .select('id')
            .eq('id', id)
            .single();

        if (checkError || !existingTarea) {
            console.error('Tarea no encontrada:', checkError);
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }

        // Construir objeto de actualización solo con campos proporcionados
        const updateData = {};
        if (titulo !== undefined) updateData.titulo = titulo;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (categoria !== undefined) updateData.categoria = categoria;
        if (prioridad !== undefined) updateData.prioridad = prioridad;
        if (estado !== undefined) updateData.estado = estado;
        if (tecnico_id !== undefined) updateData.tecnico_id = tecnico_id;
        if (fecha_limite !== undefined) updateData.fecha_limite = fecha_limite;
        updateData.fecha_actualizacion = new Date().toISOString();

        // Si el estado es "Completada", establecer fecha de completación
        if (estado === 'Completada') {
            updateData.fecha_completacion = new Date().toISOString();
        }

        console.log('Datos a actualizar:', updateData);

        const { data: updatedTarea, error } = await supabase
            .from('ge_tareas')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar tarea:', error);
            return res.status(500).json({ error: 'Error al actualizar tarea', details: error.message });
        }

        console.log('Tarea actualizada exitosamente:', updatedTarea);

        res.json({
            message: 'Tarea actualizada exitosamente',
            tarea: updatedTarea
        });

    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
});

// Eliminar tarea
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('ge_tareas')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Error al eliminar tarea' });
        }

        res.json({ message: 'Tarea eliminada exitosamente' });

    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
