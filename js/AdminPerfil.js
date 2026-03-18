document.addEventListener('DOMContentLoaded', () => {
    const logoutSelect = document.getElementById('btnLogoutSelect');

    if (logoutSelect) {
        logoutSelect.addEventListener('change', (e) => {
            if (e.target.value === 'logout') {
                const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
                if (confirmar) {
                    // Redirección al index.html
                    window.location.href = "../index.html";
                } else {
                    // Resetear el select si cancela
                    e.target.value = "";
                }
            }
        });
    }
    console.log("Panel Administrador inicializado con icono personalizado.");
});