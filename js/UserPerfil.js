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

    console.log("Panel de Control del Usuario Final cargado correctamente para:", usuario.nombre);
});