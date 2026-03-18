document.addEventListener('DOMContentLoaded', () => {
    console.log("Tablero Kanban de GESOTEC listo.");

    const columns = document.querySelectorAll('.task-list');

    // 1. LÓGICA DE ARRASTRAR Y SOLTAR (DRAG & DROP)
    // Usamos delegación de eventos para que las tarjetas nuevas también se puedan arrastrar
    const inicializarArrastre = (card) => {
        card.setAttribute('draggable', true);
        
        card.addEventListener('dragstart', () => {
            card.classList.add('dragging');
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            actualizarContadores();
        });
    };

    // Inicializar las tarjetas que ya vienen en el HTML
    document.querySelectorAll('.task-card').forEach(inicializarArrastre);

    columns.forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault(); // Permitir el soltado
            const draggingCard = document.querySelector('.dragging');
            if (draggingCard) {
                column.appendChild(draggingCard);
            }
        });
    });

    // 2. FUNCIÓN PARA ACTUALIZAR LOS CONTADORES (BURBUJAS NEGRAS)
    function actualizarContadores() {
        const columnas = document.querySelectorAll('.kanban-column');
        columnas.forEach(col => {
            const countBadge = col.querySelector('.task-count');
            // Contamos solo las tarjetas reales, no los inputs de creación
            const tasks = col.querySelectorAll('.task-card').length;
            if (countBadge) {
                countBadge.textContent = tasks;
            }
        });
    }

    // 3. BOTÓN "NUEVA TAREA" (REDIRECCIÓN A FORMULARIO GLOBAL)
    const btnNuevaTarea = document.getElementById('btnNuevaTarea');
    if (btnNuevaTarea) {
        btnNuevaTarea.addEventListener('click', () => {
            // Redirige a la pantalla completa de creación
            window.location.href = 'adminNuevaTarea.html';
        });
    }

    // 4. BOTONES "AÑADIR TARJETA" (CREACIÓN RÁPIDA DENTRO DE LA COLUMNA)
    const btnAddCards = document.querySelectorAll('.btn-add-card');
    
    btnAddCards.forEach(btn => {
        btn.addEventListener('click', () => {
            const lista = btn.closest('.kanban-column').querySelector('.task-list');
            
            // Creamos un contenedor temporal para el input
            const inputContainer = document.createElement('article');
            inputContainer.className = 'task-card';
            inputContainer.style.border = "1px dashed #1976d2";
            
            inputContainer.innerHTML = `
                <input type="text" placeholder="Título de la tarea..." 
                       style="width:100%; border:none; outline:none; font-size:14px; font-family:inherit;">
                <p style="font-size:10px; color:#1976d2; margin-top:5px;">Presiona Enter para agregar</p>
            `;
            
            lista.appendChild(inputContainer);
            const input = inputContainer.querySelector('input');
            input.focus();

            // Lógica para guardar al presionar Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const titulo = input.value.trim();
                    if (titulo !== "") {
                        // Transformamos el input en una tarjeta real
                        inputContainer.style.border = "1px solid #ccc";
                        inputContainer.innerHTML = `
                            <h4>${titulo}</h4>
                            <p>Sin descripción detallada.</p>
                        `;
                        // Hacemos que esta nueva tarjeta también se pueda arrastrar
                        inicializarArrastre(inputContainer);
                        actualizarContadores();
                    } else {
                        // Si está vacío, eliminamos el intento
                        inputContainer.remove();
                    }
                }
            });

            // Si el usuario hace clic fuera sin escribir, eliminamos el input
            input.addEventListener('blur', () => {
                if (input.value.trim() === "") {
                    inputContainer.remove();
                }
            });
        });
    });

    // Ejecución inicial de contadores por si el HTML ya trae datos
    actualizarContadores();
});