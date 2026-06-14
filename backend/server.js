const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');
const tareaRoutes = require('./routes/tareas');
const notificacionRoutes = require('./routes/notificaciones');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/notificaciones', notificacionRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GESOTEC Backend funcionando' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor GESOTEC corriendo en puerto ${PORT}`);
});
