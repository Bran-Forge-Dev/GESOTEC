const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Obtener todos los usuarios (solo admin)
router.get('/', async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('usuarios')
            .select('id, email, nombre, apellido, rol, telefono, departamento, activo, fecha_creacion, ultima_sesion')
            .order('fecha_creacion', { ascending: false });

        if (error) {
            return res.status(500).json({ error: 'Error al obtener usuarios' });
        }

        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener técnicos (filtrar por rol = 'tecnico')
router.get('/tecnicos', async (req, res) => {
    try {
        const { data: tecnicos, error } = await supabase
            .from('usuarios')
            .select('id, nombre, apellido, email')
            .eq('rol', 'tecnico')
            .eq('activo', true)
            .order('nombre', { ascending: true });

        if (error) {
            return res.status(500).json({ error: 'Error al obtener técnicos' });
        }

        res.json(tecnicos);
    } catch (error) {
        console.error('Error al obtener técnicos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nuevo usuario (solo admin)
router.post('/', async (req, res) => {
    try {
        const { email, password, nombre, apellido, rol, telefono, departamento, id_empleado, fecha_ingreso, turno } = req.body;

        // Validaciones
        if (!email || !password || !nombre || !rol) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        if (!['admin', 'tecnico', 'usuario'].includes(rol)) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        // Verificar si el email ya existe
        const { data: existingUser } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }

        // Hashear contraseña
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insertar usuario
        const { data: newUser, error } = await supabase
            .from('usuarios')
            .insert({
                email,
                password_hash,
                nombre,
                apellido,
                rol,
                telefono: telefono || null,
                departamento: departamento || null,
                id_empleado: id_empleado || null,
                fecha_ingreso: fecha_ingreso || null,
                turno: turno || null
            })
            .select('id, email, nombre, apellido, rol, telefono, departamento, id_empleado, fecha_ingreso, turno, activo, fecha_creacion')
            .single();

        if (error) {
            console.error('Error al crear usuario:', error);
            return res.status(500).json({ error: 'Error al crear usuario' });
        }

        res.status(201).json({ 
            message: 'Usuario creado exitosamente',
            user: newUser 
        });

    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar usuario
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, telefono, departamento, rol, activo } = req.body;

        const { data: updatedUser, error } = await supabase
            .from('usuarios')
            .update({
                nombre,
                apellido,
                telefono,
                departamento,
                rol,
                activo
            })
            .eq('id', id)
            .select('id, email, nombre, apellido, rol, telefono, departamento, activo')
            .single();

        if (error) {
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }

        res.json({ 
            message: 'Usuario actualizado exitosamente',
            user: updatedUser 
        });

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar usuario
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(500).json({ error: 'Error al eliminar usuario' });
        }

        res.json({ message: 'Usuario eliminado exitosamente' });

    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
