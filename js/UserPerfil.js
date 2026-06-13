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
    const logoutSelect = document.querySelector('.logout-select');
    const ticketsContainer = document.getElementById('ticketsContainer');

    // 5. Manejo del cierre de sesión
    logoutSelect.addEventListener('change', (e) => {
        if (e.target.value === 'exit') {
            localStorage.removeItem('gesotec_user');
            window.location.href = '../index.html';
        }
    });

    // 6. Cargar tickets del usuario desde el backend
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

    // 7. Renderizar tickets en el contenedor
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

    // 8. Obtener clase del badge según el estado
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

    // 9. Efecto visual en los contenedores y botones de acción
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

    // 10. Cargar tickets al iniciar
    cargarTickets();

    console.log("Panel de Control del Usuario Final cargado correctamente para:", usuario.nombre);
});