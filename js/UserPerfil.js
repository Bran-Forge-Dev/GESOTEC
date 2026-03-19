document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario tiene permiso (Simulación de sesión)
    // Esto evita que entren a la URL directamente sin loguearse
    const sesionActiva = true; // Cambiar a lógica real después cuando conectes la DB

    if (!sesionActiva) {
        window.location.href = "../index.html";
        return;
    }

    // 2. Referencias a elementos de la interfaz
    // En el perfil de usuario, el cierre de sesión suele estar en el footer del sidebar o un botón específico
    const profileLink = document.querySelector('.profile-link'); 
    const usuarioNombre = document.querySelector('.user-data-box p:nth-child(1) strong');

    // 3. Manejo del cierre de sesión (Adaptado para enlaces/botones)
    // Si decides añadir un botón de "Salir" o usar el link de perfil para cerrar sesión
    const logoutAction = () => {
        const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");
        if (confirmar) {
            // Aquí borrarías tokens o cookies en el futuro
            window.location.href = "../index.html";
        }
    };

    // 4. Efecto visual en los contenedores y botones de acción (Similar a las tarjetas del técnico)
    const actionButtons = document.querySelectorAll('.action-btn');
    const ticketItems = document.querySelectorAll('.ticket-item');

    // Aplicar efectos a los botones de "Acciones Rápidas"
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

    // Aplicar efectos a las filas de tickets
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

    console.log("Panel de Control del Usuario Final cargado correctamente.");
});