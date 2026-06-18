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
    const displayNombre = document.getElementById('displayNombre');
    const displayDepartamento = document.getElementById('displayDepartamento');
    const displayTurno = document.getElementById('displayTurno');
    const displayCorreo = document.getElementById('displayCorreo');
    const displayTelefono = document.getElementById('displayTelefono');
    const displayIdEmpleado = document.getElementById('displayIdEmpleado');
    const displayFechaIngreso = document.getElementById('displayFechaIngreso');
    const inputNombre = document.getElementById('inputNombre');
    const inputTelefono = document.getElementById('inputTelefono');
    const inputTurno = document.getElementById('inputTurno');

    console.log('Datos del técnico:', usuario);

    if (displayNombre) {
        displayNombre.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (displayDepartamento) {
        displayDepartamento.textContent = `Técnico de Soporte | 💼 ${usuario.departamento || 'Departamento de IT'}`;
    }

    if (displayTurno) {
        displayTurno.textContent = usuario.turno || '8:00 - 16:00';
    }

    if (displayCorreo) {
        displayCorreo.textContent = usuario.email;
    }

    if (displayTelefono) {
        displayTelefono.textContent = usuario.telefono || 'No especificado';
    }

    if (displayIdEmpleado) {
        displayIdEmpleado.textContent = usuario.id_empleado || 'No asignado';
    }

    if (displayFechaIngreso) {
        const fecha = usuario.fecha_ingreso ? new Date(usuario.fecha_ingreso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : 'No especificada';
        displayFechaIngreso.textContent = fecha;
    }

    if (inputNombre) {
        inputNombre.value = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (inputTelefono) {
        inputTelefono.value = usuario.telefono || '';
    }

    if (inputTurno) {
        inputTurno.value = usuario.turno || '8:00 - 16:00';
    }

    // 4. Cargar estadísticas del técnico (tickets resueltos y calificación promedio)
    async function cargarEstadisticasTecnico() {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/metricas/tecnico/${usuario.id}/estadisticas`);
            const data = await response.json();

            if (response.ok) {
                // Cargar tickets resueltos
                const displayTicketsResueltos = document.getElementById('displayTicketsResueltos');
                if (displayTicketsResueltos) {
                    displayTicketsResueltos.textContent = data.tickets_resueltos;
                }

                // Cargar calificación promedio
                const displayCalificacion = document.getElementById('displayCalificacion');
                if (displayCalificacion) {
                    if (data.calificacion_promedio) {
                        displayCalificacion.textContent = `${data.calificacion_promedio}/5`;
                    } else {
                        displayCalificacion.textContent = 'Sin calificaciones';
                    }
                }
            }
        } catch (error) {
            console.error('Error al cargar estadísticas del técnico:', error);
        }
    }

    cargarEstadisticasTecnico();

    // 5. Modal de edición
    const modal = document.getElementById('editModal');
    const openBtn = document.getElementById('openEditModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const editForm = document.getElementById('editForm');

    openBtn.addEventListener('click', () => modal.style.display = 'flex');

    const hide = () => modal.style.display = 'none';
    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        displayNombre.textContent = document.getElementById('inputNombre').value;
        displayTelefono.textContent = document.getElementById('inputTelefono').value;
        displayTurno.textContent = document.getElementById('inputTurno').value;
        
        alert("Perfil de técnico actualizado correctamente.");
        hide();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) hide();
    });
});