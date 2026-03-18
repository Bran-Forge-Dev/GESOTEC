document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('editModal');
    const openBtn = document.getElementById('openEditModal');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const editForm = document.getElementById('editForm');

    // Referencias para actualizar vista
    const displayNombre = document.getElementById('displayNombre');
    const displayTelefono = document.getElementById('displayTelefono');
    const displayTurno = document.getElementById('displayTurno');

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