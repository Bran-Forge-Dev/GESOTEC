document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('editModal');
    const openBtn = document.getElementById('openEditModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const editForm = document.getElementById('editForm');

    // Elementos de la vista para actualizar
    const displayNombre = document.querySelector('.profile-titles h3');
    const displayTelefono = document.getElementById('displayTelefono');
    const displayTurnoTop = document.getElementById('displayTurno');
    const displayTurnoInfo = document.getElementById('displayTurnoInfo');

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