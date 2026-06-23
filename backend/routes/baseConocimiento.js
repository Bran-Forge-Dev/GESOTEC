const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// Obtener todos los problemas de la base de conocimiento
router.get('/', async (req, res) => {
    try {
        const { data: problemas, error } = await supabase
            .from('ge_base_conocimiento')
            .select(`
                *,
                creador:ge_usuarios (nombre, apellido)
            `)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error al obtener problemas:', error);
            return res.status(500).json({ error: 'Error al obtener problemas' });
        }

        res.json(problemas);

    } catch (error) {
        console.error('Error al obtener problemas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener un problema por ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data: problema, error } = await supabase
            .from('ge_base_conocimiento')
            .select(`
                *,
                creador:ge_usuarios (nombre, apellido)
            `)
            .eq('id', id)
            .single();

        if (error || !problema) {
            return res.status(404).json({ error: 'Problema no encontrado' });
        }

        res.json(problema);

    } catch (error) {
        console.error('Error al obtener problema:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Buscar problemas por palabras clave
router.get('/buscar/:termino', async (req, res) => {
    try {
        const { termino } = req.params;

        const { data: problemas, error } = await supabase
            .from('ge_base_conocimiento')
            .select('*')
            .or(`titulo.ilike.%${termino}%,descripcion.ilike.%${termino}%,categoria.ilike.%${termino}%,solucion.ilike.%${termino}%`)
            .order('fecha_creacion', { ascending: false });

        if (error) {
            console.error('Error al buscar problemas:', error);
            return res.status(500).json({ error: 'Error al buscar problemas' });
        }

        res.json(problemas);

    } catch (error) {
        console.error('Error al buscar problemas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nuevo problema (solo técnicos y admin)
router.post('/', async (req, res) => {
    try {
        const { titulo, descripcion, categoria, icono, palabras_clave, solucion, creado_por } = req.body;

        // Validaciones
        if (!titulo || !descripcion || !categoria || !icono || !palabras_clave || !solucion) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        const { data: newProblema, error } = await supabase
            .from('ge_base_conocimiento')
            .insert({
                titulo,
                descripcion,
                categoria,
                icono,
                palabras_clave,
                solucion,
                creado_por
            })
            .select()
            .single();

        if (error) {
            console.error('Error al crear problema:', error);
            return res.status(500).json({ error: 'Error al crear problema' });
        }

        res.status(201).json({ 
            message: 'Problema creado exitosamente',
            problema: newProblema 
        });

    } catch (error) {
        console.error('Error al crear problema:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar problema (solo técnicos y admin)
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, descripcion, categoria, icono, palabras_clave, solucion } = req.body;

        // Verificar que el problema existe
        const { data: existingProblema, error: checkError } = await supabase
            .from('ge_base_conocimiento')
            .select('*')
            .eq('id', id)
            .single();

        if (checkError || !existingProblema) {
            return res.status(404).json({ error: 'Problema no encontrado' });
        }

        // Construir objeto de actualización solo con campos proporcionados
        const updateData = {};
        if (titulo !== undefined) updateData.titulo = titulo;
        if (descripcion !== undefined) updateData.descripcion = descripcion;
        if (categoria !== undefined) updateData.categoria = categoria;
        if (icono !== undefined) updateData.icono = icono;
        if (palabras_clave !== undefined) updateData.palabras_clave = palabras_clave;
        if (solucion !== undefined) updateData.solucion = solucion;
        updateData.fecha_actualizacion = new Date().toISOString();

        const { data: updatedProblema, error } = await supabase
            .from('ge_base_conocimiento')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error al actualizar problema:', error);
            return res.status(500).json({ error: 'Error al actualizar problema' });
        }

        res.json({
            message: 'Problema actualizado exitosamente',
            problema: updatedProblema
        });

    } catch (error) {
        console.error('Error al actualizar problema:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar problema (solo admin)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que el problema existe
        const { data: existingProblema, error: checkError } = await supabase
            .from('ge_base_conocimiento')
            .select('*')
            .eq('id', id)
            .single();

        if (checkError || !existingProblema) {
            return res.status(404).json({ error: 'Problema no encontrado' });
        }

        const { error } = await supabase
            .from('ge_base_conocimiento')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error al eliminar problema:', error);
            return res.status(500).json({ error: 'Error al eliminar problema' });
        }

        res.json({ message: 'Problema eliminado exitosamente' });

    } catch (error) {
        console.error('Error al eliminar problema:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
