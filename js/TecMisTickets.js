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
    const btnCancelar = document.getElementById('btnCancelar');
    const btnGuardarEstado = document.getElementById('btnGuardarEstado');
    const nuevoEstadoSelect = document.getElementById('nuevoEstado');
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
                
                // Establecer el estado actual en el selector
                nuevoEstadoSelect.value = ticket.estado;

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
                alert('Estado del ticket actualizado correctamente');
                modal.style.display = 'none';
                cargarTickets(); // Recargar la tabla
            } else {
                alert('Error al actualizar el estado del ticket');
            }
        } catch (error) {
            console.error('Error al actualizar estado del ticket:', error);
            alert('Error de conexión con el servidor');
        }
    }

    // Event listener para el botón de guardar
    if (btnGuardarEstado) {
        btnGuardarEstado.addEventListener('click', () => {
            const nuevoEstado = nuevoEstadoSelect.value;
            if (currentTicketId && nuevoEstado) {
                actualizarEstadoTicket(currentTicketId, nuevoEstado);
            }
        });
    }

    // Event listener para el botón de cancelar
    if (btnCancelar) {
        btnCancelar.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

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

    console.log("Panel de Mis Tickets (Técnico) inicializado.");
});