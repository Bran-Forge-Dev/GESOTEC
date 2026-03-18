document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario tiene permiso (Simulación de sesión)
    // Esto evita que entren a la URL directamente sin loguearse
    const sesionActiva = true; // Cambiar a lógica real después

    if (!sesionActiva) {
        window.location.href = "../index.html";
        return;
    }

    // 2. Referencias a elementos de la interfaz
    const logoutSelect = document.querySelector('.logout-select');
    const tecnicoNombre = document.querySelector('.data-display-box p:nth-child(1) strong');

    // 3. Manejo del cierre de sesión
    if (logoutSelect) {
        logoutSelect.addEventListener('change', (e) => {
            if (e.target.value === 'exit') {
                const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
                if (confirmar) {
                    // Aquí borrarías tokens o cookies en el futuro
                    window.location.href = "../index.html";
                } else {
                    // Resetear el select si cancela
                    e.target.value = "";
                }
            }
        });
    }

    // 4. Efecto visual en las tarjetas (Opcional)
    const cards = document.querySelectorAll('.card-item');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.boxShadow = "0 8px 15px rgba(0,0,0,0.2)";
        });
        card.addEventListener('mouseleave', () => {
            card.style.boxShadow = "none";
        });
    });

    console.log("Panel de Control del Técnico cargado correctamente.");
});