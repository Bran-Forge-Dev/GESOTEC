document.addEventListener("DOMContentLoaded", function () {
    const userTableBody = document.getElementById('userTableBody');
    const searchInput = document.getElementById('searchInput');
    const API_URL = 'https://gesotec.onrender.com/api';

    // 1. FUNCIÓN PARA CARGAR USUARIOS (Desde Backend)
    async function cargarUsuarios() {
        try {
            const response = await fetch(`${API_URL}/users`);
            const usuarios = await response.json();

            // Limpiar tabla
            userTableBody.innerHTML = '';

            usuarios.forEach(user => {
                const row = document.createElement('tr');
                row.setAttribute('data-id', user.id);
                row.setAttribute('data-email', user.email);
                
                const fecha = new Date(user.fecha_creacion).toLocaleDateString('es-ES');
                
                row.innerHTML = `
                    <td>${user.nombre} ${user.apellido || ''}</td>
                    <td>${user.email}</td>
                    <td>${user.rol}</td>
                    <td>${fecha}</td>
                    <td class="acciones">
                        <a href="AdminEditarUsuario.html?id=${user.id}" class="icon-btn edit">
                            <span class="material-icons">edit</span>
                        </a>
                        <button class="icon-btn delete" data-id="${user.id}" data-email="${user.email}">
                            <span class="material-icons">delete</span>
                        </button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });

            // Asignar eventos a los botones de eliminar
            asignarEventosEliminar();
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
            alert('Error al cargar usuarios desde el servidor');
        }
    }

    // 2. LÓGICA DE ELIMINACIÓN
    function asignarEventosEliminar() {
        const botonesEliminar = document.querySelectorAll(".delete");

        botonesEliminar.forEach(boton => {
            boton.addEventListener("click", async function () {
                const fila = boton.closest("tr");
                const userId = boton.getAttribute('data-id');
                const email = boton.getAttribute('data-email');
                const nombre = fila.cells[0].innerText;

                if (confirm(`¿Estás seguro de que deseas eliminar a ${nombre}?`)) {
                    try {
                        const response = await fetch(`${API_URL}/users/${userId}`, {
                            method: 'DELETE'
                        });

                        if (response.ok) {
                            // Animación y borrar del HTML
                            fila.style.transition = "0.3s";
                            fila.style.backgroundColor = "#f8d7da";
                            fila.style.transform = "translateX(10px)";
                            fila.style.opacity = "0";

                            setTimeout(() => {
                                fila.remove();
                            }, 300);
                        } else {
                            alert('Error al eliminar usuario');
                        }
                    } catch (error) {
                        console.error('Error al eliminar usuario:', error);
                        alert('Error de conexión con el servidor');
                    }
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