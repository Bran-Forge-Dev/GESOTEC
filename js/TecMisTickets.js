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

    // 5. Cargar tickets al iniciar
    cargarTickets();

    console.log("Panel de Mis Tickets (Técnico) inicializado.");
});