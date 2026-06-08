document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario tiene sesión activa
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));

    if (!usuario) {
        window.location.href = "../index.html";
        return;
    }

    // 2. Verificar que el usuario sea admin
    if (usuario.rol !== 'admin') {
        window.location.href = "../index.html";
        return;
    }

    // 3. Cargar datos del usuario en la interfaz
    const nombreElement = document.querySelector('.info-details-box p:nth-child(1) strong');
    const correoElement = document.querySelector('.info-details-box p:nth-child(2) strong');
    const rolElement = document.querySelector('.admin-user-info h2');

    if (nombreElement) {
        nombreElement.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (correoElement) {
        correoElement.textContent = usuario.email;
    }

    if (rolElement) {
        rolElement.textContent = 'Administrador';
    }

    // 4. Referencias a elementos de la interfaz
    const logoutSelect = document.getElementById('btnLogoutSelect');

    // 5. Manejo del cierre de sesión
    if (logoutSelect) {
        logoutSelect.addEventListener('change', (e) => {
            if (e.target.value === 'logout') {
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

    console.log("Panel Administrador cargado correctamente para:", usuario.nombre);
});