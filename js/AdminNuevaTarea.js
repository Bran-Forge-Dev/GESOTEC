document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://gesotec.onrender.com/api';
    const form = document.getElementById('formNuevaTarea');
    const dropzone = document.getElementById('dropzone');
    const selectTecnico = document.getElementById('selectTecnico');

    // 1. Verificar sesión y rol
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));
    if (!usuario || usuario.rol !== 'admin') {
        alert('Acceso no autorizado');
        window.location.href = '../index.html';
        return;
    }

    // 2. Cargar técnicos desde el backend
    async function cargarTecnicos() {
        try {
            const response = await fetch(`${API_URL}/users/tecnicos`);
            const tecnicos = await response.json();

            if (response.ok) {
                // Limpiar el select
                selectTecnico.innerHTML = '<option value="">Sin asignar</option>';

                // Llenar el select con los técnicos
                tecnicos.forEach(tecnico => {
                    const option = document.createElement('option');
                    option.value = tecnico.id;
                    option.textContent = `${tecnico.nombre} ${tecnico.apellido || ''}`;
                    selectTecnico.appendChild(option);
                });
            } else {
                console.error('Error al cargar técnicos:', tecnicos);
            }
        } catch (error) {
            console.error('Error al cargar técnicos:', error);
        }
    }

    // 3. Efecto visual simple para el dropzone
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#1976d2';
        dropzone.style.background = '#e3f2fd';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '#ccc';
        dropzone.style.background = '#fcfcfc';
    });

    // 4. Manejar envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Obtener valores del formulario
        const titulo = form.querySelector('input[type="text"]').value;
        const categoria = form.querySelector('select').value;
        const prioridad = form.querySelector('input[name="prio"]:checked').value;
        const descripcion = form.querySelector('textarea').value;
        const tecnicoId = selectTecnico.value;

        // Construir datos de la tarea
        const tareaData = {
            titulo,
            descripcion,
            categoria,
            prioridad: prioridad.charAt(0).toUpperCase() + prioridad.slice(1),
            tecnico_id: tecnicoId || null
        };

        try {
            const response = await fetch(`${API_URL}/tareas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tareaData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Tarea creada exitosamente');
                window.location.href = 'AdminTableroTareas.html';
            } else {
                alert(data.error || 'Error al crear tarea');
            }
        } catch (error) {
            console.error('Error al crear tarea:', error);
            alert('Error de conexión con el servidor');
        }
    });

    // Cargar técnicos al iniciar
    cargarTecnicos();
});