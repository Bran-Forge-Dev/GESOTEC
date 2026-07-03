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
    const asuntoInput = document.getElementById('asunto');
    const descripcionInput = document.getElementById('descripcion');
    const aiSuggestions = document.getElementById('aiSuggestions');
    const aiSuggestionsContent = document.getElementById('aiSuggestionsContent');

    // Variables para debounce de búsqueda
    let searchTimeout = null;
    const SEARCH_DELAY = 800; // ms

    // Función para buscar sugerencias de IA
    async function buscarSugerenciasIA(consulta) {
        if (!consulta || consulta.length < 10) {
            ocultarSugerencias();
            return;
        }

        mostrarCargandoSugerencias();

        try {
            const response = await fetch('https://gesotec.onrender.com/api/ai-search/buscar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    consulta: consulta,
                    limite: 3
                })
            });

            const data = await response.json();

            if (response.ok && data.resultados && data.resultados.length > 0) {
                mostrarSugerencias(data.resultados);
            } else {
                ocultarSugerencias();
            }
        } catch (error) {
            console.error('Error al buscar sugerencias:', error);
            ocultarSugerencias();
        }
    }

    // Función para mostrar estado de carga
    function mostrarCargandoSugerencias() {
        aiSuggestions.classList.remove('hidden');
        aiSuggestionsContent.innerHTML = `
            <div class="ai-loading">
                <div class="ai-loading-spinner"></div>
                <p>Buscando soluciones...</p>
            </div>
        `;
    }

    // Función para mostrar sugerencias
    function mostrarSugerencias(resultados) {
        aiSuggestions.classList.remove('hidden');
        
        const html = resultados.map(resultado => `
            <div class="ai-suggestion-card" data-id="${resultado.id}">
                <div class="ai-suggestion-header">
                    <span class="ai-suggestion-icon">${resultado.icono}</span>
                    <span class="ai-suggestion-title">${resultado.titulo}</span>
                </div>
                <div class="ai-suggestion-meta">
                    <span>⏱️ ${resultado.tiempo_estimado}</span>
                    <span>📊 ${resultado.dificultad}</span>
                    <span>🎯 ${Math.round(resultado.similitud * 100)}% coincidencia</span>
                </div>
                <div class="ai-suggestion-steps">
                    <h4>Pasos para resolver:</h4>
                    <ol>
                        ${resultado.pasos.map(paso => `<li>${paso}</li>`).join('')}
                    </ol>
                </div>
                <div class="ai-suggestion-actions">
                    <button class="btn-resolved" onclick="marcarResuelto('${resultado.titulo}')">
                        ✅ Esto resolvió mi problema
                    </button>
                    <button class="btn-not-resolved" onclick="ocultarSugerencias()">
                        ❌ No funcionó, continuar con ticket
                    </button>
                </div>
            </div>
        `).join('');

        aiSuggestionsContent.innerHTML = html;
    }

    // Función para ocultar sugerencias
    function ocultarSugerencias() {
        aiSuggestions.classList.add('hidden');
    }

    // Función para cerrar sugerencias (global)
    window.cerrarSugerencias = function() {
        ocultarSugerencias();
    };

    // Función para seleccionar una sugerencia
    window.marcarResuelto = function(tituloSolucion) {
        if (confirm(`¿La solución "${tituloSolucion}" resolvió tu problema?`)) {
            alert('¡Excelente! No es necesario crear el ticket. Redirigiendo al panel de control...');
            window.location.href = "UserPerfil.html";
        }
    };

    // Evento de input en asunto con debounce
    asuntoInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const valor = e.target.value;
        
        searchTimeout = setTimeout(() => {
            buscarSugerenciasIA(valor);
        }, SEARCH_DELAY);
    });

    // Evento de input en descripción con debounce
    descripcionInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const valor = e.target.value;
        
        searchTimeout = setTimeout(() => {
            // Combinar asunto y descripción para mejor búsqueda
            const consultaCompleta = `${asuntoInput.value} ${valor}`;
            buscarSugerenciasIA(consultaCompleta);
        }, SEARCH_DELAY);
    });

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
            const response = await fetch('https://gesotec.onrender.com/api/tickets', {
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