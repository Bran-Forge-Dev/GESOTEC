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
    const nombreElement = document.getElementById('displayNombre');
    const correoElement = document.getElementById('displayCorreo');
    const rolElement = document.querySelector('.role-label');

    if (nombreElement) {
        nombreElement.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (correoElement) {
        correoElement.textContent = usuario.email;
    }

    if (rolElement) {
        rolElement.textContent = 'Técnico';
    }

    // 4. Referencias a elementos de la interfaz
    const userAvatarBtn = document.getElementById('userAvatarBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInitials = document.getElementById('userInitials');
    const userName = document.getElementById('userName');

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
                window.location.href = "../index.html";
            }
        });
    }

    // 9. Efecto visual en las tarjetas
    const cards = document.querySelectorAll('.card-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = "0 8px 15px rgba(0,0,0,0.2)";
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = "none";
        });
    });

    // 10. Cargar contador de notificaciones
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

    // 11. Cargar notificaciones al iniciar
    cargarContadorNotificaciones();

    console.log("Panel de Control del Técnico cargado correctamente para:", usuario.nombre);
});