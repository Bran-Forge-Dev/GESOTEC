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
    ticketForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const ticketData = {
            asunto: document.getElementById('asunto').value,
            descripcion: document.getElementById('descripcion').value,
            prioridad: document.getElementById('prioridad').value,
            usuario_id: usuario.id
        };

        try {
            const response = await fetch('http://localhost:3000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('¡Ticket creado con éxito!');
                window.location.href = "UserPerfil.html";
            } else {
                alert(data.error || 'Error al crear ticket');
            }
        } catch (error) {
            console.error('Error al crear ticket:', error);
            alert('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
        }
    });
});