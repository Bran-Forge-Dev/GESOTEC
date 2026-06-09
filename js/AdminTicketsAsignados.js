document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://gesotec.onrender.com/api';
    const tableBody = document.getElementById('tableBody');
    const btnFiltrar = document.getElementById('btnFiltrar');
    const modal = document.getElementById('ticketModal');
    const closeModal = document.getElementById('closeModal');
    const selectTecnico = document.getElementById('selectTecnico');
    const btnAsignarTecnico = document.getElementById('btnAsignarTecnico');

    let currentTicketId = null;
    let tecnicos = [];

    // 1. Verificar sesión y rol
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));
    if (!usuario || usuario.rol !== 'admin') {
        alert('Acceso no autorizado');
        window.location.href = '../index.html';
        return;
    }

    // 2. Cargar técnicos desde el backend
    async function cargarTecnicos() {
        try {
            const response = await fetch(`${API_URL}/users/tecnicos`);
            tecnicos = await response.json();

            // Llenar el select de técnicos
            selectTecnico.innerHTML = '<option value="">Seleccionar técnico...</option>';
            tecnicos.forEach(tecnico => {
                const option = document.createElement('option');
                option.value = tecnico.id;
                option.textContent = `${tecnico.nombre} ${tecnico.apellido || ''}`;
                selectTecnico.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar técnicos:', error);
        }
    }

    // 3. Cargar todos los tickets desde el backend
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

    // 4. Renderizar tickets en la tabla
    function renderizarTickets(tickets) {
        tableBody.innerHTML = '';

        tickets.forEach(ticket => {
            const row = document.createElement('tr');
            row.setAttribute('data-ticket-id', ticket.id);

            const tecnicoAsignado = ticket.tecnico_id ? obtenerNombreTecnico(ticket.tecnico_id) : '~ Sin asignar ~';
            const fechaCreacion = new Date(ticket.fecha_creacion).toLocaleDateString('es-ES');

            row.innerHTML = `
                <td>#${ticket.id}</td>
                <td class="txt-center">${ticket.asunto}</td>
                <td>General</td>
                <td>${ticket.prioridad}</td>
                <td>${ticket.estado}</td>
                <td>${tecnicoAsignado}</td>
                <td class="date-normal">${fechaCreacion}</td>
                <td><button class="link-details" data-ticket-id="${ticket.id}">👁 Ver Detalles</button></td>
            `;
            tableBody.appendChild(row);
        });

        // Asignar eventos a los botones de ver detalles
        asignarEventosVerDetalles();
    }

    // 5. Obtener nombre del técnico por ID
    function obtenerNombreTecnico(tecnicoId) {
        const tecnico = tecnicos.find(t => t.id === tecnicoId);
        return tecnico ? `${tecnico.nombre} ${tecnico.apellido || ''}` : '~ Sin asignar ~';
    }

    // 6. Asignar eventos a los botones de ver detalles
    function asignarEventosVerDetalles() {
        const botonesVer = document.querySelectorAll('.link-details');

        botonesVer.forEach(boton => {
            boton.addEventListener('click', async function () {
                const ticketId = this.getAttribute('data-ticket-id');
                await mostrarDetallesTicket(ticketId);
            });
        });
    }

    // 7. Mostrar detalles del ticket en el modal
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

                const fechaCreacion = new Date(ticket.fecha_creacion).toLocaleString('es-ES');
                const fechaActualizacion = ticket.fecha_actualizacion ? new Date(ticket.fecha_actualizacion).toLocaleString('es-ES') : '-';

                document.getElementById('modalFechaCreacion').textContent = fechaCreacion;
                document.getElementById('modalFechaActualizacion').textContent = fechaActualizacion;

                // Obtener nombre del usuario
                const usuarioNombre = await obtenerNombreUsuario(ticket.usuario_id);
                document.getElementById('modalUsuario').textContent = usuarioNombre;

                // Mostrar técnico asignado actual
                const tecnicoActual = ticket.tecnico_id ? obtenerNombreTecnico(ticket.tecnico_id) : '~ Sin asignar ~';
                document.getElementById('modalTecnicoActual').textContent = tecnicoActual;

                // Seleccionar el técnico actual en el select
                selectTecnico.value = ticket.tecnico_id || '';

                // Mostrar el modal
                modal.style.display = 'block';
            } else {
                alert('Error al cargar detalles del ticket');
            }
        } catch (error) {
            console.error('Error al cargar detalles del ticket:', error);
            alert('Error de conexión con el servidor');
        }
    }

    // 8. Obtener nombre del usuario por ID
    async function obtenerNombreUsuario(usuarioId) {
        try {
            const response = await fetch(`${API_URL}/users`);
            const usuarios = await response.json();
            const usuario = usuarios.find(u => u.id === usuarioId);
            return usuario ? `${usuario.nombre} ${usuario.apellido || ''}` : '-';
        } catch (error) {
            console.error('Error al obtener nombre del usuario:', error);
            return '-';
        }
    }

    // 9. Asignar técnico al ticket
    btnAsignarTecnico.addEventListener('click', async () => {
        const tecnicoId = selectTecnico.value;

        if (!tecnicoId) {
            alert('Por favor, selecciona un técnico');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/tickets/${currentTicketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tecnico_id: tecnicoId,
                    estado: 'En_Proceso'
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Técnico asignado exitosamente');
                modal.style.display = 'none';
                cargarTickets(); // Recargar la tabla
            } else {
                alert(data.error || 'Error al asignar técnico');
            }
        } catch (error) {
            console.error('Error al asignar técnico:', error);
            alert('Error de conexión con el servidor');
        }
    });

    // 10. Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // 11. Filtrado (funcionalidad existente)
    btnFiltrar.addEventListener('click', () => {
        const selEstado = document.getElementById('filterEstado').value;
        const selPrioridad = document.getElementById('filterPrioridad').value;
        const selAgente = document.getElementById('filterAgente').value;

        const rows = tableBody.getElementsByTagName('tr');

        for (let row of rows) {
            const estado = row.getAttribute('data-estado');
            const prioridad = row.getAttribute('data-prioridad');
            const agente = row.getAttribute('data-agente');

            let matchEstado = (selEstado === "Todos" || selEstado === estado);
            let matchPrioridad = (selPrioridad === "Todos" || selPrioridad === prioridad);
            let matchAgente = (selAgente === "Cualquiera" || selAgente === agente);

            if (matchEstado && matchPrioridad && matchAgente) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    });

    // Ejecución inicial
    cargarTecnicos();
    cargarTickets();
});