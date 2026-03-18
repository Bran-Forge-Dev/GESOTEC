document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formNuevaTarea');
    const dropzone = document.getElementById('dropzone');

    // Efecto visual simple para el dropzone
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '#1976d2';
        dropzone.style.background = '#e3f2fd';
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = '#ccc';
        dropzone.style.background = '#fcfcfc';
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Tarea guardada exitosamente en el tablero.");
        window.location.href = "adminTableroTareas.html";
    });
});