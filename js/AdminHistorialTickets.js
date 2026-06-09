document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://gesotec.onrender.com/api';
    const tableBody = document.getElementById('tableBody');
    const filterInput = document.getElementById('filterInput');
    const modal = document.getElementById('ticketModal');
    const closeModal = document.getElementById('closeModal');

    // 1. Verificar sesión y rol
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));
    if (!usuario || usuario.rol !== 'admin') {
        alert('Acceso no autorizado');
        window.location.href = '../index.html';
        return;
    }

    // 2. Cargar tickets desde el backend
    async function cargarTickets() {
        try {
            const response = await fetch(`${API_URL}/tickets`);
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

    // 3. Renderizar tickets en la tabla
    function renderizarTickets(tickets) {
        tableBody.innerHTML = '';

        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${ticket.id}</td>
                <td class="txt-bold">${ticket.asunto}</td>
                <td>${ticket.usuario_nombre || 'Usuario'}</td>
                <td>${formatearFecha(ticket.fecha_creacion)}</td>
                <td><span class="prio-tag ${getPrioridadClass(ticket.prioridad)}">${ticket.prioridad}</span></td>
                <td><span class="status-badge ${getEstadoClass(ticket.estado)}">${ticket.estado}</span></td>
                <td><button class="btn-view" onclick="verDetallesTicket(${ticket.id})">👁 Ver</button></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // 4. Obtener clase de prioridad
    function getPrioridadClass(prioridad) {
        switch (prioridad.toLowerCase()) {
            case 'baja': return 'baja';
            case 'media': return 'media';
            case 'alta': return 'alta';
            case 'crítica': return 'critica';
            default: return 'media';
        }
    }

    // 5. Obtener clase de estado
    function getEstadoClass(estado) {
        switch (estado) {
            case 'Abierto': return 'open';
            case 'En Proceso': return 'process';
            case 'Resuelto': return 'resolved';
            case 'Cerrado': return 'closed';
            default: return 'open';
        }
    }

    // 6. Formatear fecha
    function formatearFecha(fecha) {
        if (!fecha) return '-';
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    // 7. Ver detalles del ticket
    window.verDetallesTicket = async (ticketId) => {
        try {
            const response = await fetch(`${API_URL}/tickets/${ticketId}`);
            const ticket = await response.json();

            if (response.ok) {
                // Llenar el modal con los datos del ticket
                document.getElementById('modalTicketId').textContent = `#${ticket.id}`;
                document.getElementById('modalAsunto').textContent = ticket.asunto;
                document.getElementById('modalDescripcion').textContent = ticket.descripcion || 'Sin descripción';
                document.getElementById('modalPrioridad').textContent = ticket.prioridad;
                document.getElementById('modalEstado').textContent = ticket.estado;
                document.getElementById('modalUsuario').textContent = ticket.usuario_nombre || 'Usuario';
                document.getElementById('modalTecnico').textContent = ticket.tecnico_nombre || 'Sin asignar';
                document.getElementById('modalFechaCreacion').textContent = formatearFecha(ticket.fecha_creacion);
                document.getElementById('modalFechaActualizacion').textContent = formatearFecha(ticket.fecha_actualizacion);

                // Mostrar el modal
                modal.style.display = 'flex';
            } else {
                alert('Error al cargar detalles del ticket');
            }
        } catch (error) {
            console.error('Error al cargar detalles del ticket:', error);
            alert('Error de conexión con el servidor');
        }
    };

    // 8. Filtrar tickets
    filterInput.addEventListener('input', (e) => {
        const filtro = e.target.value.toLowerCase();
        const rows = tableBody.querySelectorAll('tr');

        rows.forEach(row => {
            const asunto = row.cells[1].textContent.toLowerCase();
            const id = row.cells[0].textContent.toLowerCase();
            
            if (asunto.includes(filtro) || id.includes(filtro)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });

    // 9. Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Cargar tickets al iniciar
    cargarTickets();
});
