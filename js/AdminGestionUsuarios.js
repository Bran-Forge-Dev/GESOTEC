document.addEventListener("DOMContentLoaded", function () {
    const userTableBody = document.getElementById('userTableBody');
    const searchInput = document.getElementById('searchInput');

    // 1. FUNCIÓN PARA CARGAR USUARIOS (Desde LocalStorage + Fila Estática)
    function cargarUsuarios() {
        const usuariosLocal = JSON.parse(localStorage.getItem('usuarios_gesotec')) || [];
        
        // No limpiamos el body para mantener a "Ana López" (si es que la quieres dejar fija)
        // Pero si quieres que TODO sea dinámico, podrías usar: userTableBody.innerHTML = '';

        usuariosLocal.forEach((user, index) => {
            const row = document.createElement('tr');
            // Usamos el email como identificador único para el borrado
            row.setAttribute('data-email', user.email); 
            
            row.innerHTML = `
                <td>${user.nombre}</td>
                <td>${user.email}</td>
                <td>${user.rol}</td>
                <td>${user.fecha}</td>
                <td class="acciones">
                    <a href="AdminEditarUsuario.html" class="icon-btn edit">
                        <span class="material-icons">edit</span>
                    </a>
                    <button class="icon-btn delete">
                        <span class="material-icons">delete</span>
                    </button>
                </td>
            `;
            userTableBody.appendChild(row);
        });

        // Re-asignamos los eventos a los nuevos botones creados
        asignarEventosEliminar();
    }

    // 2. LÓGICA DE ELIMINACIÓN MEJORADA
    function asignarEventosEliminar() {
        const botonesEliminar = document.querySelectorAll(".delete");

        botonesEliminar.forEach(boton => {
            // Eliminamos listeners previos para no duplicar (limpieza)
            boton.replaceWith(boton.cloneNode(true));
        });

        // Volvemos a seleccionar y asignar
        document.querySelectorAll(".delete").forEach(boton => {
            boton.addEventListener("click", function () {
                const fila = boton.closest("tr");
                const emailAEliminar = fila.cells[1].innerText; // El email está en la segunda columna
                const nombre = fila.cells[0].innerText;

                if (confirm(`¿Estás seguro de que deseas eliminar a ${nombre}?`)) {
                    // --- A. Borrar del LocalStorage ---
                    let usuarios = JSON.parse(localStorage.getItem('usuarios_gesotec')) || [];
                    usuarios = usuarios.filter(u => u.email !== emailAEliminar);
                    localStorage.setItem('usuarios_gesotec', JSON.stringify(usuarios));

                    // --- B. Animación y Borrar del HTML ---
                    fila.style.transition = "0.3s";
                    fila.style.backgroundColor = "#f8d7da";
                    fila.style.transform = "translateX(10px)";
                    fila.style.opacity = "0";

                    setTimeout(() => {
                        fila.remove();
                    }, 300);
                }
            });
        });
    }

    // 3. LÓGICA DEL BUSCADOR
    if (searchInput) {
        searchInput.addEventListener('keyup', () => {
            const valor = searchInput.value.toLowerCase();
            const filas = userTableBody.querySelectorAll('tr');

            filas.forEach(fila => {
                const texto = fila.innerText.toLowerCase();
                fila.style.display = texto.includes(valor) ? "" : "none";
            });
        });
    }

    // Ejecución inicial
    cargarUsuarios();
});