const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');
const tareaRoutes = require('./routes/tareas');
const notificacionRoutes = require('./routes/notificaciones');
const metricasRoutes = require('./routes/metricas');
const baseConocimientoRoutes = require('./routes/baseConocimiento');
const aiSearchRoutes = require('./routes/aiSearch');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '..')));
app.use('/html', express.static(path.join(__dirname, '../html')));
app.use('/css', express.static(path.join(__dirname, '../css')));
app.use('/js', express.static(path.join(__dirname, '../js')));
app.use('/images', express.static(path.join(__dirname, '../images')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/metricas', metricasRoutes);
app.use('/api/base-conocimiento', baseConocimientoRoutes);
app.use('/api/ai-search', aiSearchRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'GESOTEC Backend funcionando' });
});

// Ruta raíz simple
app.get('/', (req, res) => {
    res.json({ message: 'GESOTEC API Server', version: '1.0.0' });
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor GESOTEC corriendo en puerto ${PORT}`);
});
