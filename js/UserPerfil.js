document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario tiene sesión activa
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));

    if (!usuario) {
        window.location.href = "../index.html";
        return;
    }

    // 2. Verificar que el usuario sea usuario normal
    if (usuario.rol !== 'usuario') {
        window.location.href = "../index.html";
        return;
    }

    // 3. Cargar datos del usuario en la interfaz
    const nombreElement = document.getElementById('displayNombre');
    const correoElement = document.getElementById('displayCorreo');
    const rolElement = document.querySelector('.role-name');

    if (nombreElement) {
        nombreElement.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (correoElement) {
        correoElement.textContent = usuario.email;
    }

    if (rolElement) {
        rolElement.textContent = 'Usuario';
    }

    // 4. Referencias a elementos de la interfaz
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInitials = document.getElementById('userInitials');
    const userName = document.getElementById('userName');
    const ticketsContainer = document.getElementById('ticketsContainer');
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationsDropdown = document.getElementById('notificationsDropdown');
    const notificationsList = document.getElementById('notificationsList');
    const markAllReadBtn = document.getElementById('markAllReadBtn');

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
                window.location.href = '../index.html';
            }
        });
    }

    // 9. Cargar tickets del usuario desde el backend
    async function cargarTickets() {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/tickets/usuario/${usuario.id}`);
            const tickets = await response.json();

            if (response.ok) {
                renderizarTickets(tickets);
            } else {
                console.error('Error al cargar tickets:', tickets);
            }
        } catch (error) {
            console.error('Error al cargar tickets:', error);
        }
    }

    // 10. Renderizar tickets en el contenedor
    function renderizarTickets(tickets) {
        if (!ticketsContainer) return;

        ticketsContainer.innerHTML = '';

        if (tickets.length === 0) {
            ticketsContainer.innerHTML = '<p style="text-align: center; color: #999;">No hay tickets activos</p>';
            return;
        }

        // Mostrar solo los primeros 5 tickets
        const ticketsMostrar = tickets.slice(0, 5);

        ticketsMostrar.forEach(ticket => {
            const ticketRow = document.createElement('div');
            ticketRow.className = 'ticket-row';

            // Determinar clase del badge según el estado
            const badgeClass = getBadgeClass(ticket.estado);

            ticketRow.innerHTML = `
                <p>#${ticket.id} - ${ticket.asunto}</p>
                <span class="badge ${badgeClass}">${ticket.estado}</span>
            `;

            ticketsContainer.appendChild(ticketRow);
        });
    }

    // 11. Obtener clase del badge según el estado
    function getBadgeClass(estado) {
        switch (estado) {
            case 'Abierto':
                return 'badge-green';
            case 'En Progreso':
            case 'En Proceso':
                return 'badge-yellow';
            case 'Cerrado':
            case 'Resuelto':
                return 'badge-gray';
            default:
                return 'badge-green';
        }
    }

    // 12. Efecto visual en los contenedores y botones de acción
    const actionButtons = document.querySelectorAll('.action-btn');
    const ticketItems = document.querySelectorAll('.ticket-item');

    actionButtons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = "scale(1.02)";
            btn.style.boxShadow = "0 5px 15px rgba(0,0,0,0.1)";
            btn.style.transition = "all 0.2s ease";
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = "scale(1)";
            btn.style.boxShadow = "none";
        });
    });

    ticketItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.backgroundColor = "#f9f9f9";
            item.style.border = "1px solid #1976d2";
        });
        item.addEventListener('mouseleave', () => {
            item.style.backgroundColor = "white";
            item.style.border = "1px solid #999";
        });
    });

    // 13. Cargar tickets al iniciar
    cargarTickets();

    // 14. Cargar contador de notificaciones
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

    // 15. Cargar notificaciones al iniciar
    cargarContadorNotificaciones();

    // 16. Toggle del dropdown de notificaciones al hacer clic en el badge
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

    // 17. Cargar notificaciones desde la API
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

    // 18. Mostrar notificaciones en el dropdown
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

    // 19. Formatear tiempo relativo
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

    // 20. Formatear tipo de notificación
    function formatearTipo(tipo) {
        const tipos = {
            'ticket_asignado': 'Ticket Asignado',
            'ticket_actualizado': 'Actualización',
            'ticket_cerrado': 'Cerrado'
        };
        return tipos[tipo] || tipo;
    }

    // 21. Marcar notificación como leída
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

    // 22. Marcar todas las notificaciones como leídas
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

    // 23. Cerrar dropdown de notificaciones al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (notificationsDropdown && !notificationsDropdown.contains(e.target) && !notificationBadge.contains(e.target)) {
            notificationsDropdown.classList.remove('show');
        }
    });

    console.log("Panel de Control del Usuario Final cargado correctamente para:", usuario.nombre);
});