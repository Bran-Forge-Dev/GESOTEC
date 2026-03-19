document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const ticketForm = document.getElementById('ticketForm');

    // Al hacer clic en la zona, abrir el selector de archivos
    dropZone.addEventListener('click', () => fileInput.click());

    // Cambiar estilo al arrastrar archivo encima
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.backgroundColor = "#e3f2fd";
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.backgroundColor = "#fcfcfc";
    });

    // Manejar envío del formulario
    ticketForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const ticketData = {
            asunto: document.getElementById('asunto').value,
            descripcion: document.getElementById('descripcion').value,
            prioridad: document.getElementById('prioridad').value
        };

        console.log("Datos del ticket listos para enviar:", ticketData);
        alert("¡Ticket creado con éxito! (Simulación)");
        
        // Redirigir al perfil para ver el nuevo ticket en la lista
        window.location.href = "PerfilUsuario.html";
    });
});