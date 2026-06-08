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
    const logoutSelect = document.querySelector('.logout-select');

    // 5. Manejo del cierre de sesión
    if (logoutSelect) {
        logoutSelect.addEventListener('change', (e) => {
            if (e.target.value === 'exit') {
                const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
                if (confirmar) {
                    localStorage.removeItem('gesotec_user');
                    window.location.href = "../index.html";
                } else {
                    e.target.value = "";
                }
            }
        });
    }

    // 6. Efecto visual en las tarjetas
    const cards = document.querySelectorAll('.card-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = "0 8px 15px rgba(0,0,0,0.2)";
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = "none";
        });
    });

    console.log("Panel de Control del Técnico cargado correctamente para:", usuario.nombre);
});