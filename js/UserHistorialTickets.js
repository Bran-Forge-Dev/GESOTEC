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

    const filterInput = document.getElementById('filterInput');
    const tableBody = document.getElementById('tableBody');

    // 3. Cargar tickets del usuario desde el backend
    async function cargarTickets() {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/usuario/${usuario.id}`);
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

    // 4. Renderizar tickets en la tabla
    function renderizarTickets(tickets) {
        tableBody.innerHTML = '';

        if (tickets.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay tickets registrados</td></tr>';
            return;
        }

        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            
            // Formatear fecha
            const fecha = new Date(ticket.fecha_creacion).toLocaleDateString('es-ES');
            
            // Determinar clase de prioridad
            const prioridadClass = ticket.prioridad.toLowerCase();
            
            // Determinar clase de estado
            const estadoClass = ticket.estado.toLowerCase().replace(' ', '');
            
            row.innerHTML = `
                <td>#${ticket.id}</td>
                <td class="txt-bold">${ticket.asunto}</td>
                <td>${fecha}</td>
                <td><span class="prio-tag ${prioridadClass}">${ticket.prioridad}</span></td>
                <td><span class="status-badge ${estadoClass}">${ticket.estado}</span></td>
                <td><a href="#" class="btn-view" data-ticket-id="${ticket.id}">👁 Ver</a></td>
            `;
            
            tableBody.appendChild(row);
        });
    }

    // 5. Función de búsqueda en tiempo real
    filterInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();
        const tableRows = tableBody.querySelectorAll('tr');

        tableRows.forEach(row => {
            const text = row.innerText.toLowerCase();
            if (text.includes(term)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    // 6. Modal de detalles del ticket
    const modal = document.getElementById('ticketModal');
    const closeModal = document.getElementById('closeModal');

    // Función para mostrar detalles del ticket
    async function mostrarDetallesTicket(ticketId) {
        try {
            const response = await fetch(`http://localhost:3000/api/tickets/${ticketId}`);
            const ticket = await response.json();

            if (response.ok) {
                // Llenar el modal con los datos del ticket
                document.getElementById('modalTicketId').textContent = `#${ticket.id}`;
                document.getElementById('modalAsunto').textContent = ticket.asunto;
                document.getElementById('modalDescripcion').textContent = ticket.descripcion;
                document.getElementById('modalPrioridad').textContent = ticket.prioridad;
                document.getElementById('modalEstado').textContent = ticket.estado;
                
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

    // Event listeners para los botones de "Ver"
    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-view') || e.target.closest('.btn-view')) {
            e.preventDefault();
            const btn = e.target.classList.contains('btn-view') ? e.target : e.target.closest('.btn-view');
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

    // 7. Cargar tickets al iniciar
    cargarTickets();
});