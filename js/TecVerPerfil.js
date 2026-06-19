document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario tiene sesión activa
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));

    if (!usuario) {
        window.location.href = "../index.html";
        return;
    }

    // 2. Verificar que el usuario sea técnico
    if (usuario.rol !== 'tecnico') {
        window.location.href = "../index.html";
        return;
    }

    // 3. Cargar datos del usuario en la interfaz
    const displayNombre = document.getElementById('displayNombre');
    const displayDepartamento = document.getElementById('displayDepartamento');
    const displayTurno = document.getElementById('displayTurno');
    const displayCorreo = document.getElementById('displayCorreo');
    const displayTelefono = document.getElementById('displayTelefono');
    const displayIdEmpleado = document.getElementById('displayIdEmpleado');
    const displayFechaIngreso = document.getElementById('displayFechaIngreso');
    const displayIdEmpleadoSkills = document.getElementById('displayIdEmpleadoSkills');
    const inputNombre = document.getElementById('inputNombre');
    const inputTelefono = document.getElementById('inputTelefono');
    const inputTurno = document.getElementById('inputTurno');

    console.log('Datos del técnico:', usuario);

    if (displayNombre) {
        displayNombre.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (displayDepartamento) {
        displayDepartamento.textContent = `Técnico de Soporte | 💼 ${usuario.departamento || 'Departamento de IT'}`;
    }

    if (displayTurno) {
        displayTurno.textContent = usuario.turno || '8:00 - 16:00';
    }

    if (displayCorreo) {
        displayCorreo.textContent = usuario.email;
    }

    if (displayTelefono) {
        displayTelefono.textContent = usuario.telefono || 'No especificado';
    }

    if (displayIdEmpleado) {
        displayIdEmpleado.textContent = usuario.id_empleado || 'No asignado';
    }

    if (displayFechaIngreso) {
        const fecha = usuario.fecha_ingreso ? new Date(usuario.fecha_ingreso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No especificada';
        displayFechaIngreso.textContent = fecha;
    }

    if (displayIdEmpleadoSkills) {
        displayIdEmpleadoSkills.textContent = usuario.id_empleado || 'No asignado';
    }

    if (inputNombre) {
        inputNombre.value = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (inputTelefono) {
        inputTelefono.value = usuario.telefono || '';
    }

    if (inputTurno) {
        inputTurno.value = usuario.turno || '8:00 - 16:00';
    }

    // 4. Cargar estadísticas del técnico (tickets resueltos y calificación promedio)
    async function cargarEstadisticasTecnico() {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/metricas/tecnico/${usuario.id}/estadisticas`);
            const data = await response.json();

            if (response.ok) {
                // Cargar tickets resueltos
                const displayTicketsResueltos = document.getElementById('displayTicketsResueltos');
                if (displayTicketsResueltos) {
                    displayTicketsResueltos.textContent = data.tickets_resueltos;
                }

                // Cargar calificación promedio
                const displayCalificacion = document.getElementById('displayCalificacion');
                if (displayCalificacion) {
                    if (data.calificacion_promedio) {
                        displayCalificacion.textContent = `${data.calificacion_promedio}/5`;
                    } else {
                        displayCalificacion.textContent = 'Sin calificaciones';
                    }
                }
            }
        } catch (error) {
            console.error('Error al cargar estadísticas del técnico:', error);
        }
    }

    cargarEstadisticasTecnico();

    // 4.5. Cargar actividades recientes del técnico
    async function cargarActividadesRecientes() {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/tickets/tecnico/${usuario.id}/actividades-recientes`);
            const tickets = await response.json();

            if (response.ok) {
                const actividadesRecientes = document.getElementById('actividadesRecientes');
                
                if (actividadesRecientes) {
                    if (tickets.length === 0) {
                        actividadesRecientes.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No tienes actividades recientes</p>';
                        return;
                    }

                    actividadesRecientes.innerHTML = tickets.map(ticket => {
                        // Calcular tiempo relativo
                        const fechaActualizacion = new Date(ticket.fecha_actualizacion);
                        const ahora = new Date();
                        const diffMinutos = Math.floor((ahora - fechaActualizacion) / 60000);
                        
                        let tiempoTexto = 'Hace un momento';
                        if (diffMinutos < 1) {
                            tiempoTexto = 'Hace un momento';
                        } else if (diffMinutos < 60) {
                            tiempoTexto = `Hace ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
                        } else {
                            const diffHoras = Math.floor(diffMinutos / 60);
                            if (diffHoras < 24) {
                                tiempoTexto = `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
                            } else {
                                const diffDias = Math.floor(diffHoras / 24);
                                tiempoTexto = `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
                            }
                        }

                        return `
                            <div class="activity-item">
                                <span class="check-icon">✔️</span>
                                <p>Resolvió exitosamente <strong>#TK-${ticket.id}: ${ticket.asunto}</strong> <br> <small>${tiempoTexto}</small></p>
                            </div>
                        `;
                    }).join('');
                }
            }
        } catch (error) {
            console.error('Error al cargar actividades recientes:', error);
        }
    }

    // Cargar actividades recientes al iniciar
    cargarActividadesRecientes();

    // 5. Sistema de notificaciones
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

    // 6. Modal de edición
    const modal = document.getElementById('editModal');
    const openBtn = document.getElementById('openEditModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const editForm = document.getElementById('editForm');

    openBtn.addEventListener('click', () => modal.style.display = 'flex');

    const hide = () => modal.style.display = 'none';
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        displayNombre.textContent = document.getElementById('inputNombre').value;
        displayTelefono.textContent = document.getElementById('inputTelefono').value;
        displayTurno.textContent = document.getElementById('inputTurno').value;
        
        alert("Perfil de técnico actualizado correctamente.");
        hide();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) hide();
    });
});