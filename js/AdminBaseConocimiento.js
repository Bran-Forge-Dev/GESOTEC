document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario tiene sesión activa
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));

    if (!usuario) {
        window.location.href = "../index.html";
        return;
    }

    // 2. Verificar que el usuario sea admin
    if (usuario.rol !== 'admin') {
        window.location.href = "../index.html";
        return;
    }

    // 3. Referencias a elementos del DOM
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const issuesGrid = document.getElementById('issuesGrid');
    const searchResultsSection = document.getElementById('searchResultsSection');
    const resultsList = document.getElementById('resultsList');

    // 4. Cargar problemas frecuentes desde la base de datos
    async function cargarProblemasFrecuentes() {
        try {
            const response = await fetch('https://gesotec.onrender.com/api/base-conocimiento');
            const problemas = await response.json();

            if (response.ok) {
                issuesGrid.innerHTML = problemas.map(problema => `
                    <div class="issue-card" onclick="mostrarDetalleProblema(${problema.id})">
                        <div class="issue-icon">${problema.icono}</div>
                        <div class="issue-title">${problema.titulo}</div>
                        <div class="issue-description">${problema.descripcion}</div>
                        <div class="issue-category">${problema.categoria}</div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error al cargar problemas:', error);
            issuesGrid.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">Error al cargar problemas. Inténtalo más tarde.</p>';
        }
    }

    // 5. Cargar problemas al iniciar
    cargarProblemasFrecuentes();

    // 5.5. Event listener para botón agregar problema
    const agregarProblemaBtn = document.getElementById('agregarProblemaBtn');
    if (agregarProblemaBtn) {
        agregarProblemaBtn.addEventListener('click', () => mostrarModalAgregarProblema());
    }

    // 6. Event listener para búsqueda
    searchBtn.addEventListener('click', realizarBusqueda);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            realizarBusqueda();
        }
    });

    // 7. Función para realizar búsqueda
    async function realizarBusqueda() {
        const terminoBusqueda = searchInput.value.toLowerCase().trim();
        
        if (terminoBusqueda === '') {
            searchResultsSection.style.display = 'none';
            return;
        }

        try {
            const response = await fetch(`https://gesotec.onrender.com/api/base-conocimiento/buscar/${terminoBusqueda}`);
            const resultados = await response.json();

            if (response.ok) {
                mostrarResultados(resultados);
            }
        } catch (error) {
            console.error('Error al buscar problemas:', error);
        }
    }

    // 8. Función para mostrar resultados de búsqueda
    function mostrarResultados(resultados) {
        searchResultsSection.style.display = 'block';

        if (resultados.length === 0) {
            resultsList.innerHTML = `
                <div class="no-results">
                    <p>No se encontraron resultados para tu búsqueda. Intenta con otras palabras clave.</p>
                </div>
            `;
            return;
        }

        resultsList.innerHTML = resultados.map(problema => `
            <div class="result-item" onclick="mostrarDetalleProblema(${problema.id})">
                <div class="result-title">${problema.icono} ${problema.titulo}</div>
                <div class="result-description">${problema.descripcion}</div>
                <div class="result-solution">
                    <h4>Solución:</h4>
                    <p>${problema.solucion.substring(0, 150)}...</p>
                </div>
            </div>
        `).join('');
    }

    // 9. Función para mostrar detalle del problema en modal
    window.mostrarDetalleProblema = async function(id) {
        try {
            const response = await fetch(`https://gesotec.onrender.com/api/base-conocimiento/${id}`);
            const problema = await response.json();

            if (!response.ok) {
                console.error('Error al obtener problema:', problema);
                return;
            }

            const modalHTML = `
                <div class="modal-overlay" id="modalOverlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${problema.icono} ${problema.titulo}</h3>
                            <button class="modal-close" onclick="cerrarModal()">&times;</button>
                        </div>
                        <div class="modal-body">
                            <h4>Descripción:</h4>
                            <p>${problema.descripcion}</p>
                            
                            <h4>Categoría:</h4>
                            <p>${problema.categoria}</p>
                            
                            <h4>Palabras Clave:</h4>
                            <p>${Array.isArray(problema.palabras_clave) ? problema.palabras_clave.join(', ') : problema.palabras_clave}</p>
                            
                            <div class="modal-solution">
                                <h4>Solución:</h4>
                                <p>${problema.solucion.replace(/\n/g, '<br>')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);
            document.getElementById('modalOverlay').classList.add('show');
        } catch (error) {
            console.error('Error al obtener problema:', error);
        }
    };

    // 10. Función para cerrar modal
    window.cerrarModal = function() {
        const modal = document.getElementById('modalOverlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 200);
        }
    };

    // 11. Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('modalOverlay');
        if (modal && e.target === modal) {
            cerrarModal();
        }
    });

    console.log("Base de Conocimiento cargada correctamente para:", usuario.nombre);

    // 12. Función para mostrar modal de agregar problema
    window.mostrarModalAgregarProblema = function() {
        const modalHTML = `
            <div class="modal-overlay" id="modalOverlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>➕ Agregar Nuevo Problema</h3>
                        <button class="modal-close" onclick="cerrarModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="agregarProblemaForm">
                            <div class="form-group">
                                <label>Título del Problema:</label>
                                <input type="text" id="inputTitulo" required placeholder="Ej: No puedo conectarme al WiFi">
                            </div>
                            <div class="form-group">
                                <label>Descripción:</label>
                                <textarea id="inputDescripcion" required placeholder="Describe el problema brevemente"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Categoría:</label>
                                <select id="inputCategoria" required>
                                    <option value="">Selecciona una categoría</option>
                                    <option value="Red">Red</option>
                                    <option value="Hardware">Hardware</option>
                                    <option value="Software">Software</option>
                                    <option value="Seguridad">Seguridad</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Icono:</label>
                                <select id="inputIcono" required>
                                    <option value="">Selecciona un icono</option>
                                    <option value="📶">📶 WiFi</option>
                                    <option value="🖨️">🖨️ Impresora</option>
                                    <option value="🔐">🔐 Contraseña</option>
                                    <option value="💻">💻 Computadora</option>
                                    <option value="📄">📄 Archivo</option>
                                    <option value="📧">📧 Correo</option>
                                    <option value="🔵">🔵 Pantalla Azul</option>
                                    <option value="🔒">🔒 VPN</option>
                                    <option value="⌨️">⌨️ Periféricos</option>
                                    <option value="🚫">🚫 Acceso</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Palabras Clave (separadas por comas):</label>
                                <input type="text" id="inputPalabrasClave" required placeholder="Ej: wifi, red, internet, conexión">
                            </div>
                            <div class="form-group">
                                <label>Solución:</label>
                                <textarea id="inputSolucion" required placeholder="Describe los pasos para resolver el problema" rows="5"></textarea>
                            </div>
                            <button type="submit" class="btn-submit">Guardar Problema</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('modalOverlay').classList.add('show');

        // Agregar event listener al formulario
        document.getElementById('agregarProblemaForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const titulo = document.getElementById('inputTitulo').value;
            const descripcion = document.getElementById('inputDescripcion').value;
            const categoria = document.getElementById('inputCategoria').value;
            const icono = document.getElementById('inputIcono').value;
            const palabrasClave = document.getElementById('inputPalabrasClave').value.split(',').map(p => p.trim());
            const solucion = document.getElementById('inputSolucion').value;

            try {
                const response = await fetch('https://gesotec.onrender.com/api/base-conocimiento', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        titulo,
                        descripcion,
                        categoria,
                        icono,
                        palabras_clave: palabrasClave,
                        solucion,
                        creado_por: usuario.id
                    })
                });

                if (response.ok) {
                    alert('Problema agregado exitosamente');
                    cerrarModal();
                    cargarProblemasFrecuentes(); // Recargar problemas
                } else {
                    alert('Error al agregar problema');
                }
            } catch (error) {
                console.error('Error al agregar problema:', error);
                alert('Error al agregar problema');
            }
        });
    };
});
