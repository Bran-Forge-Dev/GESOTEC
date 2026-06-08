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

    // 5. Manejo del cierre de sesión
    logoutSelect.addEventListener('change', (e) => {
        if (e.target.value === 'exit') {
            localStorage.removeItem('gesotec_user');
            window.location.href = '../index.html';
        }
    });

    // 6. Efecto visual en los contenedores y botones de acción
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

    console.log("Panel de Control del Usuario Final cargado correctamente para:", usuario.nombre);
});