document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario tiene sesión activa
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));

    if (!usuario) {
        window.location.href = "../index.html";
        return;
    }

    // 2. Verificar que el usuario sea admin
    if (usuario.rol !== 'admin') {
        window.location.href = "../index.html";
        return;
    }

    // 3. Cargar datos del usuario en la interfaz
    const nombreElement = document.querySelector('.info-details-box p:nth-child(1) strong');
    const correoElement = document.querySelector('.info-details-box p:nth-child(2) strong');
    const rolElement = document.querySelector('.metrics-user-info h2');

    if (nombreElement) {
        nombreElement.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (correoElement) {
        correoElement.textContent = usuario.email;
    }

    if (rolElement) {
        rolElement.textContent = 'Administrador';
    }

    // 4. Referencias a elementos de la interfaz
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInitials = document.getElementById('userInitials');
    const userName = document.getElementById('userName');
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsList = document.getElementById('notificationsList');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    const timeRangeSelect = document.getElementById('timeRange');
    const refreshBtn = document.getElementById('refreshBtn');

    // 5. Actualizar datos del usuario en el menú
    if (userInitials && usuario.nombre) {
        const initials = usuario.nombre.charAt(0).toUpperCase();
        userInitials.textContent = initials;
    }

    if (userName && usuario.nombre) {
        userName.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    // 6. Toggle del dropdown del menú de usuario
    if (userAvatarBtn && userDropdown) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
            userAvatarBtn.classList.toggle('active');
        });
    }

    // 7. Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (userDropdown && !userDropdown.contains(e.target) && !userAvatarBtn.contains(e.target)) {
            userDropdown.classList.remove('show');
            userAvatarBtn.classList.remove('active');
        }
    });

    // 8. Manejo del cierre de sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
            if (confirmar) {
                localStorage.removeItem('gesotec_user');
                window.location.href = "../index.html";
            }
        });
    }

    // 9. Cargar contador de notificaciones
    async function cargarContadorNotificaciones() {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/notificaciones/usuario/${usuario.id}/contador`);
            const data = await response.json();

            if (response.ok && data.contador > 0) {
                const badge = document.getElementById('notificationBadge');
                if (badge) {
                    badge.textContent = data.contador;
                    badge.classList.remove('hidden');
                }
            }
        } catch (error) {
            console.error('Error al cargar contador de notificaciones:', error);
        }
    }

    // 10. Cargar notificaciones al iniciar
    cargarContadorNotificaciones();

    // 11. Toggle del dropdown de notificaciones al hacer clic en el badge
    if (notificationBadge && notificationsDropdown) {
        notificationBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            notificationsDropdown.classList.toggle('show');
            userDropdown.classList.remove('show');
            userAvatarBtn.classList.remove('active');
            
            // Cargar notificaciones cuando se abre el dropdown
            if (notificationsDropdown.classList.contains('show')) {
                cargarNotificaciones();
            }
        });
    }

    // 12. Cargar notificaciones desde la API
    async function cargarNotificaciones() {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/notificaciones/usuario/${usuario.id}/no-leidas`);
            const data = await response.json();

            if (response.ok) {
                mostrarNotificaciones(data);
            }
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    }

    // 13. Mostrar notificaciones en el dropdown
    function mostrarNotificaciones(notificaciones) {
        if (!notificationsList) return;

        if (notificaciones.length === 0) {
            notificationsList.innerHTML = `
                <div class="notifications-empty">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22ZM12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20ZM12 11C12.552 11 13 11.448 13 12C13 12.552 12.552 13 12 13C11.448 13 11 12.552 11 12C11 11.448 11.448 11 12 11ZM12 7C12.552 7 13 7.448 13 8V9C13 9.552 12.552 10 12 10C11.448 10 11 9.552 11 9V8C11 7.448 11.448 7 12 7Z" fill="#999"/>
                    </svg>
                    <p>No tienes notificaciones nuevas</p>
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = notificaciones.map(notif => `
            <div class="notification-item unread" data-id="${notif.id}">
                <div class="notification-content">
                    <div class="notification-title">${notif.titulo}</div>
                    <div class="notification-message">${notif.mensaje}</div>
                    <div class="notification-meta">
                        <span class="notification-time">${formatearTiempo(notif.fecha_creacion)}</span>
                        <span class="notification-type ${notif.tipo}">${formatearTipo(notif.tipo)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        // Agregar event listeners para marcar como leída
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', () => {
                const notifId = item.dataset.id;
                marcarComoLeida(notifId);
            });
        });
    }

    // 14. Formatear tiempo relativo
    function formatearTiempo(fecha) {
        const ahora = new Date();
        const fechaNotif = new Date(fecha);
        const diffMinutos = Math.floor((ahora - fechaNotif) / 60000);

        if (diffMinutos < 1) return 'Ahora mismo';
        if (diffMinutos < 60) return `Hace ${diffMinutos} min`;
        const diffHoras = Math.floor(diffMinutos / 60);
        if (diffHoras < 24) return `Hace ${diffHoras} h`;
        const diffDias = Math.floor(diffHoras / 24);
        return `Hace ${diffDias} días`;
    }

    // 15. Formatear tipo de notificación
    function formatearTipo(tipo) {
        const tipos = {
            'ticket_asignado': 'Ticket Asignado',
            'ticket_actualizado': 'Actualización',
            'ticket_cerrado': 'Cerrado'
        };
        return tipos[tipo] || tipo;
    }

    // 16. Marcar notificación como leída
    async function marcarComoLeida(notifId) {
        try {
            await fetch(`https://gesotec.onrender.com/api/notificaciones/${notifId}/marcar-leida`, {
                method: 'PUT'
            });
            
            // Recargar notificaciones y contador
            cargarNotificaciones();
            cargarContadorNotificaciones();
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
        }
    }

    // 17. Marcar todas las notificaciones como leídas
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', async () => {
            try {
                await fetch(`https://gesotec.onrender.com/api/notificaciones/usuario/${usuario.id}/marcar-todas-leidas`, {
                    method: 'PUT'
                });
                
                // Recargar notificaciones y contador
                cargarNotificaciones();
                cargarContadorNotificaciones();
            } catch (error) {
                console.error('Error al marcar todas como leídas:', error);
            }
        });
    }

    // 18. Cerrar dropdown de notificaciones al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (notificationsDropdown && !notificationsDropdown.contains(e.target) && !notificationBadge.contains(e.target)) {
            notificationsDropdown.classList.remove('show');
        }
    });

    // 19. Cargar métricas al iniciar
    cargarMetricas();

    // 20. Event listener para cambio de rango de tiempo
    if (timeRangeSelect) {
        timeRangeSelect.addEventListener('change', () => {
            cargarMetricas();
        });
    }

    // 21. Event listener para botón de refresh
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            cargarMetricas();
        });
    }

    // 22. Función principal para cargar métricas
    async function cargarMetricas() {
        const timeRange = timeRangeSelect ? timeRangeSelect.value : 'month';
        
        try {
            // Cargar todas las métricas en paralelo
            const [
                kpisResponse,
                volumeResponse,
                classificationResponse,
                techniciansResponse,
                statusResponse,
                departmentResponse
            ] = await Promise.all([
                fetch(`https://gesotec.onrender.com/api/metricas/kpis?rango=${timeRange}`),
                fetch(`https://gesotec.onrender.com/api/metricas/volumen?rango=${timeRange}`),
                fetch(`https://gesotec.onrender.com/api/metricas/clasificacion?rango=${timeRange}`),
                fetch(`https://gesotec.onrender.com/api/metricas/tecnicos?rango=${timeRange}`),
                fetch(`https://gesotec.onrender.com/api/metricas/estado?rango=${timeRange}`),
                fetch(`https://gesotec.onrender.com/api/metricas/departamento?rango=${timeRange}`)
            ]);

            // Procesar respuestas
            if (kpisResponse.ok) {
                const kpisData = await kpisResponse.json();
                mostrarKPIs(kpisData);
            }

            if (volumeResponse.ok) {
                const volumeData = await volumeResponse.json();
                mostrarVolumen(volumeData);
            }

            if (classificationResponse.ok) {
                const classificationData = await classificationResponse.json();
                mostrarClasificacion(classificationData);
            }

            if (techniciansResponse.ok) {
                const techniciansData = await techniciansResponse.json();
                mostrarTecnicos(techniciansData);
            }

            if (statusResponse.ok) {
                const statusData = await statusResponse.json();
                mostrarEstado(statusData);
            }

            if (departmentResponse.ok) {
                const departmentData = await departmentResponse.json();
                mostrarDepartamento(departmentData);
            }

        } catch (error) {
            console.error('Error al cargar métricas:', error);
            mostrarError('Error al cargar las métricas. Por favor, intenta nuevamente.');
        }
    }

    // 23. Mostrar KPIs
    function mostrarKPIs(data) {
        document.getElementById('totalTickets').textContent = data.total_tickets || 0;
        document.getElementById('resolvedTickets').textContent = data.resueltos || 0;
        document.getElementById('inProgressTickets').textContent = data.en_proceso || 0;
        document.getElementById('backlogTickets').textContent = data.backlog || 0;

        // Mostrar tendencias
        mostrarTendencia('ticketsTrend', data.tendencia_total);
        mostrarTendencia('resolvedTrend', data.tendencia_resueltos);
        mostrarTendencia('inProgressTrend', data.tendencia_en_proceso);
        mostrarTendencia('backlogTrend', data.tendencia_backlog);
    }

    // 24. Mostrar tendencia
    function mostrarTendencia(elementId, tendencia) {
        const element = document.getElementById(elementId);
        if (!element || !tendencia) return;

        const valor = tendencia.valor || 0;
        const direccion = tendencia.direccion || 'neutral';

        let icono = '➡️';
        let clase = 'trend-neutral';

        if (direccion === 'up') {
            icono = '📈';
            clase = 'trend-up';
        } else if (direccion === 'down') {
            icono = '📉';
            clase = 'trend-down';
        }

        element.textContent = `${icono} ${valor > 0 ? '+' : ''}${valor}%`;
        element.className = `kpi-trend ${clase}`;
    }

    // 25. Mostrar volumen de tickets
    function mostrarVolumen(data) {
        // Actualizar tabla
        const tbody = document.getElementById('volumeTableBody');
        if (tbody && data.datos) {
            tbody.innerHTML = data.datos.map(item => `
                <tr>
                    <td>${item.periodo}</td>
                    <td>${item.cantidad}</td>
                    <td class="${item.tendencia === 'up' ? 'trend-up' : item.tendencia === 'down' ? 'trend-down' : 'trend-neutral'}">
                        ${item.tendencia === 'up' ? '📈' : item.tendencia === 'down' ? '📉' : '➡️'} ${item.variacion || 0}%
                    </td>
                </tr>
            `).join('');
        }

        // Crear gráfico
        crearGraficoVolumen(data);
    }

    // 26. Crear gráfico de volumen
    function crearGraficoVolumen(data) {
        const ctx = document.getElementById('volumeChart');
        if (!ctx || !data.datos) return;

        // Destruir gráfico anterior si existe
        if (window.volumeChartInstance) {
            window.volumeChartInstance.destroy();
        }

        window.volumeChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.datos.map(d => d.periodo),
                datasets: [{
                    label: 'Tickets Creados',
                    data: data.datos.map(d => d.cantidad),
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // 27. Mostrar clasificación de problemas
    function mostrarClasificacion(data) {
        // Actualizar tabla
        const tbody = document.getElementById('classificationTableBody');
        if (tbody && data.datos) {
            const total = data.datos.reduce((sum, item) => sum + item.cantidad, 0);
            tbody.innerHTML = data.datos.map(item => `
                <tr>
                    <td>${item.tipo}</td>
                    <td>${item.cantidad}</td>
                    <td>${((item.cantidad / total) * 100).toFixed(1)}%</td>
                </tr>
            `).join('');
        }

        // Crear gráfico
        crearGraficoClasificacion(data);
    }

    // 28. Crear gráfico de clasificación
    function crearGraficoClasificacion(data) {
        const ctx = document.getElementById('classificationChart');
        if (!ctx || !data.datos) return;

        // Destruir gráfico anterior si existe
        if (window.classificationChartInstance) {
            window.classificationChartInstance.destroy();
        }

        const colores = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0097a7'];

        window.classificationChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: data.datos.map(d => d.tipo),
                datasets: [{
                    data: data.datos.map(d => d.cantidad),
                    backgroundColor: colores.slice(0, data.datos.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // 29. Mostrar desempeño de técnicos
    function mostrarTecnicos(data) {
        const tbody = document.getElementById('techniciansTableBody');
        if (tbody && data.datos) {
            tbody.innerHTML = data.datos.map(item => `
                <tr>
                    <td>${item.nombre}</td>
                    <td>${item.tickets_atendidos}</td>
                    <td>${item.calificacion_promedio ? item.calificacion_promedio.toFixed(1) + ' ⭐' : 'N/A'}</td>
                    <td>${item.tiempo_promedio ? formatearTiempoResolucion(item.tiempo_promedio) : 'N/A'}</td>
                    <td>${item.tasa_resolucion ? item.tasa_resolucion.toFixed(1) + '%' : 'N/A'}</td>
                </tr>
            `).join('');
        }
    }

    // 30. Formatear tiempo de resolución
    function formatearTiempoResolucion(minutos) {
        if (minutos < 60) return `${minutos} min`;
        const horas = Math.floor(minutos / 60);
        const mins = minutos % 60;
        return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
    }

    // 31. Mostrar estado de tickets
    function mostrarEstado(data) {
        // Actualizar tabla
        const tbody = document.getElementById('statusTableBody');
        if (tbody && data.datos) {
            const total = data.datos.reduce((sum, item) => sum + item.cantidad, 0);
            tbody.innerHTML = data.datos.map(item => `
                <tr>
                    <td>${item.estado}</td>
                    <td>${item.cantidad}</td>
                    <td>${((item.cantidad / total) * 100).toFixed(1)}%</td>
                </tr>
            `).join('');
        }

        // Crear gráfico
        crearGraficoEstado(data);
    }

    // 32. Crear gráfico de estado
    function crearGraficoEstado(data) {
        const ctx = document.getElementById('statusChart');
        if (!ctx || !data.datos) return;

        // Destruir gráfico anterior si existe
        if (window.statusChartInstance) {
            window.statusChartInstance.destroy();
        }

        const colores = {
            'Abierto': '#f44336',
            'En Progreso': '#ff9800',
            'Resuelto': '#4caf50',
            'Cerrado': '#2196f3',
            'Cancelado': '#9e9e9e'
        };

        window.statusChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.datos.map(d => d.estado),
                datasets: [{
                    data: data.datos.map(d => d.cantidad),
                    backgroundColor: data.datos.map(d => colores[d.estado] || '#999')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // 33. Mostrar distribución por departamento
    function mostrarDepartamento(data) {
        // Actualizar tabla
        const tbody = document.getElementById('departmentTableBody');
        if (tbody && data.datos) {
            const total = data.datos.reduce((sum, item) => sum + item.cantidad, 0);
            tbody.innerHTML = data.datos.map(item => `
                <tr>
                    <td>${item.departamento}</td>
                    <td>${item.cantidad}</td>
                    <td>${((item.cantidad / total) * 100).toFixed(1)}%</td>
                </tr>
            `).join('');
        }

        // Crear gráfico
        crearGraficoDepartamento(data);
    }

    // 34. Crear gráfico de departamento
    function crearGraficoDepartamento(data) {
        const ctx = document.getElementById('departmentChart');
        if (!ctx || !data.datos) return;

        // Destruir gráfico anterior si existe
        if (window.departmentChartInstance) {
            window.departmentChartInstance.destroy();
        }

        const colores = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0097a7', '#e91e63'];

        window.departmentChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.datos.map(d => d.departamento),
                datasets: [{
                    label: 'Tickets',
                    data: data.datos.map(d => d.cantidad),
                    backgroundColor: colores.slice(0, data.datos.length)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // 35. Mostrar error
    function mostrarError(mensaje) {
        console.error(mensaje);
        // Aquí podrías mostrar un mensaje de error en la UI
    }

    console.log("Panel de Métricas cargado correctamente para:", usuario.nombre);
});
