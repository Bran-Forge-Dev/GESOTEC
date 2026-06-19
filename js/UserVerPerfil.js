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
    const displayNombre = document.getElementById('displayNombre');
    const displayPosicion = document.getElementById('displayPosicion');
    const displayDepartamento = document.getElementById('displayDepartamento');
    const displayTurnoTop = document.getElementById('displayTurno');
    const displayCorreo = document.getElementById('displayCorreo');
    const displayTelefono = document.getElementById('displayTelefono');
    const displayTurnoInfo = document.getElementById('displayTurnoInfo');
    const displayIdEmpleado = document.getElementById('displayIdEmpleado');
    const displayFechaIngreso = document.getElementById('displayFechaIngreso');
    const inputNombre = document.getElementById('inputNombre');
    const inputTelefono = document.getElementById('inputTelefono');
    const inputTurno = document.getElementById('inputTurno');

    console.log('Datos del usuario:', usuario);

    if (displayNombre) {
        displayNombre.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (displayPosicion) {
        displayPosicion.textContent = usuario.rol === 'tecnico' ? 'Técnico de Soporte' : usuario.rol === 'admin' ? 'Administrador' : 'Usuario';
    }

    if (displayDepartamento) {
        displayDepartamento.textContent = `💼 ${usuario.departamento || 'Departamento no especificado'}`;
    }

    if (displayTurnoTop) {
        displayTurnoTop.textContent = usuario.turno || '8:00 - 16:00';
    }

    if (displayCorreo) {
        displayCorreo.textContent = usuario.email;
    }

    if (displayTelefono) {
        displayTelefono.textContent = usuario.telefono || 'No especificado';
    }

    if (displayTurnoInfo) {
        displayTurnoInfo.textContent = usuario.turno ? usuario.turno : 'Mañana (8:00 - 16:00)';
    }

    if (displayIdEmpleado) {
        displayIdEmpleado.textContent = usuario.id_empleado || 'No asignado';
    }

    if (displayFechaIngreso) {
        const fecha = usuario.fecha_ingreso ? new Date(usuario.fecha_ingreso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No especificada';
        displayFechaIngreso.textContent = fecha;
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

    // 4. Cargar estadísticas de tickets del usuario
    async function cargarEstadisticasTickets() {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/tickets/usuario/${usuario.id}/estadisticas`);
            const data = await response.json();

            if (response.ok) {
                const displayTicketsTotales = document.getElementById('displayTicketsTotales');
                const displayTicketsEnProceso = document.getElementById('displayTicketsEnProceso');
                const displayTicketsCompletados = document.getElementById('displayTicketsCompletados');

                if (displayTicketsTotales) {
                    displayTicketsTotales.textContent = data.tickets_totales || 0;
                }

                if (displayTicketsEnProceso) {
                    displayTicketsEnProceso.textContent = data.tickets_en_proceso || 0;
                }

                if (displayTicketsCompletados) {
                    displayTicketsCompletados.textContent = data.tickets_completados || 0;
                }
            }
        } catch (error) {
            console.error('Error al cargar estadísticas de tickets:', error);
        }
    }

    // Cargar estadísticas al iniciar
    cargarEstadisticasTickets();

    // 4.5. Cargar solicitudes recientes del usuario
    async function cargarSolicitudesRecientes() {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/tickets/usuario/${usuario.id}`);
            const tickets = await response.json();

            if (response.ok) {
                const solicitudesRecientes = document.getElementById('solicitudesRecientes');
                
                if (solicitudesRecientes) {
                    // Obtener los 3 tickets más recientes
                    const ticketsRecientes = tickets.slice(0, 3);
                    
                    if (ticketsRecientes.length === 0) {
                        solicitudesRecientes.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No tienes tickets recientes</p>';
                        return;
                    }

                    solicitudesRecientes.innerHTML = ticketsRecientes.map(ticket => {
                        // Determinar el icono según el estado
                        let icono = '📋';
                        let colorClase = 'red';
                        
                        if (ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado') {
                            icono = '✅';
                            colorClase = 'green';
                        } else if (ticket.estado === 'En Proceso') {
                            icono = '🔄';
                            colorClase = 'yellow';
                        }

                        // Determinar el badge según el estado
                        let badgeClase = 'badge-yellow';
                        if (ticket.estado === 'Resuelto' || ticket.estado === 'Cerrado') {
                            badgeClase = 'badge-green';
                        } else if (ticket.estado === 'Abierto') {
                            badgeClase = 'badge-yellow';
                        }

                        // Calcular tiempo relativo
                        const fechaCreacion = new Date(ticket.fecha_creacion);
                        const ahora = new Date();
                        const diffHoras = Math.floor((ahora - fechaCreacion) / (1000 * 60 * 60));
                        const diffDias = Math.floor(diffHoras / 24);
                        
                        let tiempoTexto = 'Hace un momento';
                        if (diffHoras < 1) {
                            tiempoTexto = 'Hace un momento';
                        } else if (diffHoras < 24) {
                            tiempoTexto = `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
                        } else {
                            tiempoTexto = `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
                        }

                        return `
                            <div class="request-item">
                                <div class="req-left">
                                    <span class="req-ico ${colorClase}">${icono}</span>
                                    <div class="req-texts">
                                        <p class="req-name">${ticket.asunto}</p>
                                        <p class="req-id">#TK-${ticket.id} <span class="badge ${badgeClase}">${ticket.estado}</span></p>
                                    </div>
                                </div>
                                <div class="req-time">${tiempoTexto}</div>
                            </div>
                        `;
                    }).join('');
                }
            }
        } catch (error) {
            console.error('Error al cargar solicitudes recientes:', error);
        }
    }

    // Cargar solicitudes recientes al iniciar
    cargarSolicitudesRecientes();

    // 5. Modal de edición
    const modal = document.getElementById('editModal');
    const openBtn = document.getElementById('openEditModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const editForm = document.getElementById('editForm');

    // Abrir modal
    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Cerrar modal
    const hide = () => {
        modal.style.display = 'none';
    };

    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);
    
    // Guardar Cambios
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener valores de los inputs
        const nuevoNombre = document.getElementById('inputNombre').value;
        const nuevoTelefono = document.getElementById('inputTelefono').value;
        const nuevoTurno = document.getElementById('inputTurno').value;

        // Actualizar vista dinámicamente
        displayNombre.textContent = nuevoNombre;
        displayTelefono.textContent = nuevoTelefono;
        displayTurnoTop.textContent = nuevoTurno;
        displayTurnoInfo.textContent = nuevoTurno;

        alert("Cambios guardados con éxito.");
        hide();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) hide();
    });
});