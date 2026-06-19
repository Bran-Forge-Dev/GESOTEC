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
    const displayNombre = document.getElementById('displayNombre');
    const displayPosicion = document.getElementById('displayPosicion');
    const displayDepartamento = document.getElementById('displayDepartamento');
    const displayTurnoTop = document.getElementById('displayTurno');
    const displayCorreo = document.getElementById('displayCorreo');
    const displayTelefono = document.getElementById('displayTelefono');
    const displayTurnoInfo = document.getElementById('displayTurnoInfo');
    const displayIdEmpleado = document.getElementById('displayIdEmpleado');
    const displayFechaIngreso = document.getElementById('displayFechaIngreso');
    const inputNombre = document.getElementById('inputNombre');
    const inputTelefono = document.getElementById('inputTelefono');
    const inputTurno = document.getElementById('inputTurno');

    console.log('Datos del usuario:', usuario);

    if (displayNombre) {
        displayNombre.textContent = usuario.nombre + ' ' + (usuario.apellido || '');
    }

    if (displayPosicion) {
        displayPosicion.textContent = usuario.rol === 'tecnico' ? 'Técnico de Soporte' : usuario.rol === 'admin' ? 'Administrador' : 'Usuario';
    }

    if (displayDepartamento) {
        displayDepartamento.textContent = `💼 ${usuario.departamento || 'Departamento no especificado'}`;
    }

    if (displayTurnoTop) {
        displayTurnoTop.textContent = usuario.turno || '8:00 - 16:00';
    }

    if (displayCorreo) {
        displayCorreo.textContent = usuario.email;
    }

    if (displayTelefono) {
        displayTelefono.textContent = usuario.telefono || 'No especificado';
    }

    if (displayTurnoInfo) {
        displayTurnoInfo.textContent = usuario.turno ? usuario.turno : 'Mañana (8:00 - 16:00)';
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

    // 4. Cargar estadísticas de tickets del usuario
    async function cargarEstadisticasTickets() {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/tickets/usuario/${usuario.id}/estadisticas`);
            const data = await response.json();

            if (response.ok) {
                const displayTicketsTotales = document.getElementById('displayTicketsTotales');
                const displayTicketsEnProceso = document.getElementById('displayTicketsEnProceso');
                const displayTicketsCompletados = document.getElementById('displayTicketsCompletados');

                if (displayTicketsTotales) {
                    displayTicketsTotales.textContent = data.tickets_totales || 0;
                }

                if (displayTicketsEnProceso) {
                    displayTicketsEnProceso.textContent = data.tickets_en_proceso || 0;
                }

                if (displayTicketsCompletados) {
                    displayTicketsCompletados.textContent = data.tickets_completados || 0;
                }
            }
        } catch (error) {
            console.error('Error al cargar estadísticas de tickets:', error);
        }
    }

    // Cargar estadísticas al iniciar
    cargarEstadisticasTickets();

    // 5. Modal de edición
    const modal = document.getElementById('editModal');
    const openBtn = document.getElementById('openEditModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const editForm = document.getElementById('editForm');

    // Abrir modal
    openBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Cerrar modal
    const hide = () => {
        modal.style.display = 'none';
    };

    closeBtn.addEventListener('click', hide);
    cancelBtn.addEventListener('click', hide);
    
    // Guardar Cambios
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Obtener valores de los inputs
        const nuevoNombre = document.getElementById('inputNombre').value;
        const nuevoTelefono = document.getElementById('inputTelefono').value;
        const nuevoTurno = document.getElementById('inputTurno').value;

        // Actualizar vista dinámicamente
        displayNombre.textContent = nuevoNombre;
        displayTelefono.textContent = nuevoTelefono;
        displayTurnoTop.textContent = nuevoTurno;
        displayTurnoInfo.textContent = nuevoTurno;

        alert("Cambios guardados con éxito.");
        hide();
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) hide();
    });
});