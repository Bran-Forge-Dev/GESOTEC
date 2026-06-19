document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://gesotec.onrender.com/api';
    const tableBody = document.getElementById('tableBody');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const filterEstado = document.getElementById('filterEstado');
    const filterPrioridad = document.getElementById('filterPrioridad');

    let tickets = [];

    // 1. Verificar sesión y rol
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));
    if (!usuario || usuario.rol !== 'tecnico') {
        alert('Acceso no autorizado');
        window.location.href = '../index.html';
        return;
    }

    // 2. Cargar tickets del técnico desde el backend
    async function cargarTickets() {
        try {
            const response = await fetch(`${API_URL}/tickets/tecnico/${usuario.id}`);
            tickets = await response.json();

            if (response.ok) {
                renderizarTickets(tickets);
            } else {
                console.error('Error al cargar tickets:', tickets);
            }
        } catch (error) {
            console.error('Error al cargar tickets:', error);
        }
    }

    // 3. Renderizar tickets en la tabla
    function renderizarTickets(tickets) {
        tableBody.innerHTML = '';

        if (tickets.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay tickets asignados</td></tr>';
            return;
        }

        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.setAttribute('data-ticket-id', ticket.id);
            row.setAttribute('data-estado', ticket.estado);
            row.setAttribute('data-prioridad', ticket.prioridad);

            const fechaCreacion = new Date(ticket.fecha_creacion).toLocaleDateString('es-ES');
            const usuarioNombre = ticket.usuario_nombre || 'Usuario';

            row.innerHTML = `
                <td>#${ticket.id}</td>
                <td>${ticket.asunto}</td>
                <td>${usuarioNombre}</td>
                <td>${ticket.prioridad}</td>
                <td>${ticket.estado}</td>
                <td>${fechaCreacion}</td>
                <td><a href="#" class="link-details" data-ticket-id="${ticket.id}">Ver Detalles</a></td>
            `;

            tableBody.appendChild(row);
        });
    }

    // 4. Filtrar tickets
    btnFiltrar.addEventListener('click', () => {
        const estadoSelected = filterEstado.value;
        const prioridadSelected = filterPrioridad.value;

        const tableRows = tableBody.querySelectorAll('tr');

        tableRows.forEach(row => {
            const rowEstado = row.getAttribute('data-estado');
            const rowPrioridad = row.getAttribute('data-prioridad');

            const matchEstado = (estadoSelected === "Todos" || estadoSelected === rowEstado);
            const matchPrioridad = (prioridadSelected === "Todas" || prioridadSelected === rowPrioridad);

            if (matchEstado && matchPrioridad) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    // 5. Modal de detalles del ticket
    const modal = document.getElementById('ticketModal');
    const closeModal = document.getElementById('closeModal');
    const modalNuevoEstado = document.getElementById('modalNuevoEstado');
    const guardarEstadoBtn = document.getElementById('guardarEstado');
    const cancelarCambioBtn = document.getElementById('cancelarCambio');
    let currentTicketId = null;

    // Función para mostrar detalles del ticket
    async function mostrarDetallesTicket(ticketId) {
        try {
            const response = await fetch(`${API_URL}/tickets/${ticketId}`);
            const ticket = await response.json();

            if (response.ok) {
                currentTicketId = ticketId;
                
                // Llenar el modal con los datos del ticket
                document.getElementById('modalTicketId').textContent = `#${ticket.id}`;
                document.getElementById('modalAsunto').textContent = ticket.asunto;
                document.getElementById('modalDescripcion').textContent = ticket.descripcion;
                document.getElementById('modalPrioridad').textContent = ticket.prioridad;
                document.getElementById('modalEstado').textContent = ticket.estado;

                // Resetear el dropdown de estado
                modalNuevoEstado.value = '';

                const fechaCreacion = new Date(ticket.fecha_creacion).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                document.getElementById('modalFechaCreacion').textContent = fechaCreacion;

                const fechaActualizacion = new Date(ticket.fecha_actualizacion).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                document.getElementById('modalFechaActualizacion').textContent = fechaActualizacion;

                // Mostrar el modal
                modal.style.display = 'flex';
            } else {
                alert('Error al cargar detalles del ticket');
            }
        } catch (error) {
            console.error('Error al cargar detalles del ticket:', error);
            alert('Error de conexión con el servidor');
        }
    }

    // Función para actualizar el estado del ticket
    async function actualizarEstadoTicket(ticketId, nuevoEstado) {
        try {
            const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (response.ok) {
                alert('Estado del ticket actualizado exitosamente');
                modal.style.display = 'none';
                cargarTickets(); // Recargar la tabla de tickets
            } else {
                const error = await response.json();
                alert('Error al actualizar el estado: ' + (error.error || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error al actualizar estado del ticket:', error);
            alert('Error de conexión con el servidor');
        }
    }

    // Event listener para guardar el cambio de estado
    guardarEstadoBtn.addEventListener('click', () => {
        const nuevoEstado = modalNuevoEstado.value;
        
        if (!nuevoEstado) {
            alert('Por favor, selecciona un nuevo estado');
            return;
        }

        if (!currentTicketId) {
            alert('Error: No hay ticket seleccionado');
            return;
        }

        const confirmar = confirm(`¿Estás seguro de cambiar el estado del ticket #${currentTicketId} a "${nuevoEstado}"?`);
        if (confirmar) {
            actualizarEstadoTicket(currentTicketId, nuevoEstado);
        }
    });

    // Event listener para cancelar el cambio
    cancelarCambioBtn.addEventListener('click', () => {
        modalNuevoEstado.value = '';
    });

    // Event listeners para los botones de "Ver Detalles"
    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('link-details') || e.target.closest('.link-details')) {
            e.preventDefault();
            const btn = e.target.classList.contains('link-details') ? e.target : e.target.closest('.link-details');
            const ticketId = btn.getAttribute('data-ticket-id');
            mostrarDetallesTicket(ticketId);
        }
    });

    // Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 6. Cargar tickets al iniciar
    cargarTickets();

    // 7. Sistema de notificaciones
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInitials = document.getElementById('userInitials');
    const userName = document.getElementById('userName');
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsList = document.getElementById('notificationsList');
    const markAllReadBtn = document.getElementById('markAllReadBtn');

    // Actualizar datos del usuario en el menú
    if (userInitials && usuario.nombre) {
        const initials = usuario.nombre.charAt(0).toUpperCase();
        userInitials.textContent = initials;
    }

    if (userName && usuario.nombre) {
        userName.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    // Toggle del dropdown del menú de usuario
    if (userAvatarBtn && userDropdown) {
        userAvatarBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
            userAvatarBtn.classList.toggle('active');
        });
    }

    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (userDropdown && !userDropdown.contains(e.target) && !userAvatarBtn.contains(e.target)) {
            userDropdown.classList.remove('show');
            userAvatarBtn.classList.remove('active');
        }
    });

    // Manejo del cierre de sesión
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

    // Cargar contador de notificaciones
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

    // Cargar notificaciones al iniciar
    cargarContadorNotificaciones();

    // Toggle del dropdown de notificaciones al hacer clic en el badge o avatar
    if (userAvatarBtn && notificationsDropdown) {
        userAvatarBtn.addEventListener('click', (e) => {
            // Si el clic fue en el badge, abrir notificaciones
            if (e.target === notificationBadge || notificationBadge.contains(e.target)) {
                e.stopPropagation();
                notificationsDropdown.classList.toggle('show');
                userDropdown.classList.remove('show');
                userAvatarBtn.classList.remove('active');
                
                // Cargar notificaciones cuando se abre el dropdown
                if (notificationsDropdown.classList.contains('show')) {
                    cargarNotificaciones();
                }
            } else {
                // Si el clic fue en el avatar pero no en el badge, abrir menú de usuario
                e.stopPropagation();
                userDropdown.classList.toggle('show');
                userAvatarBtn.classList.toggle('active');
                notificationsDropdown.classList.remove('show');
            }
        });
    }

    // Cargar notificaciones desde la API
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

    // Mostrar notificaciones en el dropdown
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

    // Formatear tiempo relativo
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

    // Formatear tipo de notificación
    function formatearTipo(tipo) {
        const tipos = {
            'ticket_asignado': 'Ticket Asignado',
            'ticket_actualizado': 'Actualización',
            'ticket_cerrado': 'Cerrado'
        };
        return tipos[tipo] || tipo;
    }

    // Marcar notificación como leída
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

    // Marcar todas las notificaciones como leídas
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

    // Cerrar dropdown de notificaciones al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (notificationsDropdown && !notificationsDropdown.contains(e.target) && !notificationBadge.contains(e.target)) {
            notificationsDropdown.classList.remove('show');
        }
    });

    console.log("Panel de Mis Tickets (Técnico) inicializado.");
});