const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

// Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { email, password, nombre, apellido, rol, telefono, departamento } = req.body;

        // Validaciones
        if (!email || !password || !nombre || !apellido || !rol) {
            return res.status(400).json({ error: 'Faltan campos requeridos' });
        }

        if (!['admin', 'tecnico', 'usuario'].includes(rol)) {
            return res.status(400).json({ error: 'Rol inválido' });
        }

        // Verificar si el email ya existe
        const { data: existingUser } = await supabase
            .from('ge_usuarios')
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
            .from('ge_usuarios')
            .insert({
                email,
                password_hash,
                nombre,
                apellido,
                rol,
                telefono: telefono || null,
                departamento: departamento || null
            })
            .select()
            .single();

        if (error) {
            console.error('Error al crear usuario:', error);
            return res.status(500).json({ error: 'Error al crear usuario' });
        }

        // No devolver el hash de contraseña
        const { password_hash: _, ...userWithoutPassword } = newUser;

        res.status(201).json({ 
            message: 'Usuario creado exitosamente',
            user: userWithoutPassword 
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validaciones
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña requeridos' });
        }

        // Buscar usuario por email (incluyendo nuevos campos)
        const { data: user, error } = await supabase
            .from('ge_usuarios')
            .select('id, email, nombre, apellido, rol, telefono, departamento, id_empleado, fecha_ingreso, turno, activo, fecha_creacion, ultima_sesion, password_hash')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(403).json({ error: 'Usuario desactivado' });
        }

        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Actualizar última sesión
        await supabase
            .from('ge_usuarios')
            .update({ ultima_sesion: new Date().toISOString() })
            .eq('id', user.id);

        // No devolver el hash de contraseña
        const { password_hash: _, ...userWithoutPassword } = user;

        // Determinar página de redirección según rol
        const redirectMap = {
            'admin': 'html/AdminPerfil.html',
            'tecnico': 'html/TecPerfil.html',
            'usuario': 'html/UserPerfil.html'
        };

        res.json({
            message: 'Login exitoso',
            user: userWithoutPassword,
            redirect: redirectMap[user.rol]
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
