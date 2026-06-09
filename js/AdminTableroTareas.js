document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://gesotec.onrender.com/api';
    const columns = document.querySelectorAll('.task-list');
    const modal = document.getElementById('tareaModal');
    const closeModal = document.getElementById('closeModal');
    const btnMarcarCompletada = document.getElementById('btnMarcarCompletada');
    const btnEliminarTarea = document.getElementById('btnEliminarTarea');

    let currentTareaId = null;

    // 1. Verificar sesión y rol
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));
    if (!usuario || usuario.rol !== 'admin') {
        alert('Acceso no autorizado');
        window.location.href = '../index.html';
        return;
    }

    // 2. Cargar tareas desde el backend
    async function cargarTareas() {
        try {
            const response = await fetch(`${API_URL}/tareas`);
            const tareas = await response.json();

            if (response.ok) {
                renderizarTareas(tareas);
            } else {
                console.error('Error al cargar tareas:', tareas);
            }
        } catch (error) {
            console.error('Error al cargar tareas:', error);
        }
    }

    // 3. Renderizar tareas en el tablero
    function renderizarTareas(tareas) {
        // Limpiar columnas
        document.querySelectorAll('.task-list').forEach(list => {
            list.innerHTML = '';
        });

        // Obtener columnas
        const columnPorHacer = document.querySelector('.column-todo .task-list');
        const columnEnProgreso = document.querySelector('.column-progress .task-list');
        const columnCompletadas = document.querySelector('.column-done .task-list');

        tareas.forEach(tarea => {
            const card = crearTarjetaTarea(tarea);

            // Colocar en la columna correspondiente según el estado
            if (tarea.estado === 'Por Hacer' && columnPorHacer) {
                columnPorHacer.appendChild(card);
            } else if (tarea.estado === 'En Progreso' && columnEnProgreso) {
                columnEnProgreso.appendChild(card);
            } else if (tarea.estado === 'Completada' && columnCompletadas) {
                columnCompletadas.appendChild(card);
            }
        });

        // Inicializar arrastre para todas las tarjetas
        document.querySelectorAll('.task-card').forEach(inicializarArrastre);
        actualizarContadores();
    }

    // 4. Crear tarjeta de tarea
    function crearTarjetaTarea(tarea) {
        const card = document.createElement('article');
        card.className = 'task-card';
        card.setAttribute('data-tarea-id', tarea.id);
        card.setAttribute('data-estado', tarea.estado);

        // Determinar clase de prioridad
        const prioridadClass = tarea.prioridad === 'Alta' ? 'tag-alta' :
                              tarea.prioridad === 'Media' ? 'tag-media' : 'tag-baja';

        // Formatear fecha
        const fechaLimite = tarea.fecha_limite ? new Date(tarea.fecha_limite).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '';

        card.innerHTML = `
            <span class="tag ${prioridadClass}">${tarea.prioridad}</span>
            <h4>${tarea.titulo}</h4>
            <p>${tarea.descripcion || 'Sin descripción'}</p>
            <footer class="card-footer">
                ${fechaLimite ? `<span class="icon">📅 ${fechaLimite}</span>` : ''}
            </footer>
        `;

        // Agregar evento de clic para ver detalles
        card.addEventListener('click', () => {
            mostrarDetallesTarea(tarea.id);
        });

        return card;
    }

    // 5. LÓGICA DE ARRASTRAR Y SOLTAR (DRAG & DROP)
    const inicializarArrastre = (card) => {
        card.setAttribute('draggable', true);

        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', async () => {
            card.classList.remove('dragging');
            actualizarContadores();

            // Obtener la nueva columna
            const nuevaColumna = card.closest('.kanban-column');
            const nuevoEstado = obtenerEstadoDeColumna(nuevaColumna);
            const tareaId = card.getAttribute('data-tarea-id');

            // Actualizar estado en el backend
            if (nuevoEstado && tareaId) {
                await actualizarEstadoTarea(tareaId, nuevoEstado);
            }
        });
    };

    // 6. Obtener estado de la columna
    function obtenerEstadoDeColumna(columna) {
        if (columna.classList.contains('column-todo')) return 'Por Hacer';
        if (columna.classList.contains('column-progress')) return 'En Progreso';
        if (columna.classList.contains('column-done')) return 'Completada';
        return null;
    }

    // 7. Actualizar estado de tarea en el backend
    async function actualizarEstadoTarea(tareaId, nuevoEstado) {
        try {
            const response = await fetch(`${API_URL}/tareas/${tareaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: nuevoEstado })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Error al actualizar estado:', data.error);
                // Recargar tareas si hay error
                cargarTareas();
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            cargarTareas();
        }
    }

    // 8. Configurar columnas para drag and drop
    columns.forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            const draggingCard = document.querySelector('.dragging');
            if (draggingCard) {
                column.appendChild(draggingCard);
            }
        });
    });

    // 9. FUNCIÓN PARA ACTUALIZAR LOS CONTADORES
    function actualizarContadores() {
        const columnas = document.querySelectorAll('.kanban-column');
        columnas.forEach(col => {
            const countBadge = col.querySelector('.task-count');
            const tasks = col.querySelectorAll('.task-card').length;
            if (countBadge) {
                countBadge.textContent = tasks;
            }
        });
    }

    // 10. BOTÓN "NUEVA TAREA"
    const btnNuevaTarea = document.getElementById('btnNuevaTarea');
    if (btnNuevaTarea) {
        btnNuevaTarea.addEventListener('click', () => {
            window.location.href = 'AdminNuevaTarea.html';
        });
    }

    // 11. Mostrar detalles de tarea
    async function mostrarDetallesTarea(tareaId) {
        try {
            const response = await fetch(`${API_URL}/tareas/${tareaId}`);
            const tarea = await response.json();

            if (response.ok) {
                currentTareaId = tareaId;

                // Llenar el modal con los datos de la tarea
                document.getElementById('modalTareaId').textContent = `#${tarea.id}`;
                document.getElementById('modalTitulo').textContent = tarea.titulo;
                document.getElementById('modalDescripcion').textContent = tarea.descripcion || 'Sin descripción';
                document.getElementById('modalCategoria').textContent = tarea.categoria || 'General';
                document.getElementById('modalPrioridad').textContent = tarea.prioridad;
                document.getElementById('modalEstado').textContent = tarea.estado;

                const fechaLimite = tarea.fecha_limite ? new Date(tarea.fecha_limite).toLocaleDateString('es-ES') : '-';
                const fechaCreacion = tarea.fecha_creacion ? new Date(tarea.fecha_creacion).toLocaleDateString('es-ES') : '-';

                document.getElementById('modalFechaLimite').textContent = fechaLimite;
                document.getElementById('modalFechaCreacion').textContent = fechaCreacion;

                // Mostrar/ocultar botón de marcar como completada
                const btnMarcarCompletada = document.getElementById('btnMarcarCompletada');
                if (tarea.estado === 'Completada') {
                    btnMarcarCompletada.style.display = 'none';
                } else {
                    btnMarcarCompletada.style.display = 'block';
                }

                // Mostrar el modal
                modal.style.display = 'block';
            } else {
                alert('Error al cargar detalles de la tarea');
            }
        } catch (error) {
            console.error('Error al cargar detalles de la tarea:', error);
            alert('Error de conexión con el servidor');
        }
    }

    // 12. Marcar tarea como completada
    btnMarcarCompletada.addEventListener('click', async () => {
        if (!currentTareaId) return;

        try {
            const response = await fetch(`${API_URL}/tareas/${currentTareaId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: 'Completada' })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Tarea marcada como completada');
                modal.style.display = 'none';
                cargarTareas(); // Recargar el tablero
            } else {
                alert(data.error || 'Error al marcar tarea como completada');
            }
        } catch (error) {
            console.error('Error al marcar tarea como completada:', error);
            alert('Error de conexión con el servidor');
        }
    });

    // 13. Eliminar tarea
    btnEliminarTarea.addEventListener('click', async () => {
        if (!currentTareaId) return;

        if (!confirm('¿Estás seguro de eliminar esta tarea?')) return;

        try {
            const response = await fetch(`${API_URL}/tareas/${currentTareaId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (response.ok) {
                alert('Tarea eliminada exitosamente');
                modal.style.display = 'none';
                cargarTareas(); // Recargar el tablero
            } else {
                alert(data.error || 'Error al eliminar tarea');
            }
        } catch (error) {
            console.error('Error al eliminar tarea:', error);
            alert('Error de conexión con el servidor');
        }
    });

    // 14. Cerrar modal
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Ejecución inicial
    cargarTareas();
});