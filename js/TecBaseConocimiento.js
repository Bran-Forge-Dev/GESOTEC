document.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar si el usuario tiene sesión activa
    const usuario = JSON.parse(localStorage.getItem('gesotec_user'));

    if (!usuario) {
        window.location.href = "../index.html";
        return;
    }

    // 2. Verificar que el usuario sea técnico
    if (usuario.rol !== 'tecnico') {
        window.location.href = "../index.html";
        return;
    }

    // 3. Base de datos de problemas frecuentes
    const problemasFrecuentes = [
        {
            id: 1,
            titulo: "No puedo conectarme al WiFi",
            descripcion: "Problemas de conexión a la red inalámbrica de la empresa",
            categoria: "Red",
            icono: "📶",
            palabrasClave: ["wifi", "red", "internet", "conexión", "inalámbrica"],
            solucion: "1. Reinicia tu dispositivo\n2. Verifica que el WiFi esté activado\n3. Intenta olvidar la red y volver a conectarte\n4. Si persiste, contacta al departamento de TI"
        },
        {
            id: 2,
            titulo: "Impresora no responde",
            descripcion: "La impresora no imprime o no se detecta",
            categoria: "Hardware",
            icono: "🖨️",
            palabrasClave: ["impresora", "print", "imprimir", "papel", "tinta"],
            solucion: "1. Verifica que la impresora esté encendida\n2. Revisa el nivel de papel y tinta\n3. Verifica que esté conectada al puerto USB o red\n4. Reinicia la impresora y tu computadora"
        },
        {
            id: 3,
            titulo: "Olvidé mi contraseña",
            descripcion: "No puedo acceder a mi cuenta por contraseña olvidada",
            categoria: "Seguridad",
            icono: "🔐",
            palabrasClave: ["contraseña", "password", "acceso", "login", "sesión"],
            solucion: "1. Haz clic en '¿Olvidaste tu contraseña?' en la pantalla de login\n2. Ingresa tu correo electrónico\n3. Sigue las instrucciones del correo de recuperación\n4. Si no recibes el correo, contacta al soporte"
        },
        {
            id: 4,
            titulo: "Computadora lenta",
            descripcion: "El sistema funciona lentamente o se congela",
            categoria: "Hardware",
            icono: "💻",
            palabrasClave: ["lento", "lentitud", "congelado", "freeze", "rendimiento"],
            solucion: "1. Cierra programas innecesarios\n2. Reinicia tu computadora\n3. Verifica el espacio en disco\n4. Ejecuta un análisis de antivirus\n5. Si el problema persiste, solicita mantenimiento"
        },
        {
            id: 5,
            titulo: "No puedo abrir un archivo",
            descripcion: "El archivo no se abre o muestra error",
            categoria: "Software",
            icono: "📄",
            palabrasClave: ["archivo", "documento", "abrir", "error", "corrupto"],
            solucion: "1. Verifica que tengas el programa necesario para abrir el archivo\n2. Intenta abrir el archivo en otra aplicación\n3. Verifica que el archivo no esté corrupto\n4. Si es un archivo compartido, solicita que lo reenvíen"
        },
        {
            id: 6,
            titulo: "Correo electrónico no llega",
            descripcion: "No recibo o no puedo enviar correos",
            categoria: "Software",
            icono: "📧",
            palabrasClave: ["correo", "email", "mail", "enviar", "recibir"],
            solucion: "1. Verifica tu conexión a internet\n2. Revisa la carpeta de spam\n3. Verifica que la dirección del destinatario sea correcta\n4. Limpia la caché del navegador de correo\n5. Contacta al administrador si el problema persiste"
        },
        {
            id: 7,
            titulo: "Pantalla azul de muerte",
            descripcion: "La computadora muestra pantalla azul y se reinicia",
            categoria: "Hardware",
            icono: "🔵",
            palabrasClave: ["pantalla azul", "blue screen", "bsod", "crash", "reinicia"],
            solucion: "1. Reinicia la computadora\n2. Anota el código de error que aparece\n3. Desconecta dispositivos externos\n4. Si el problema persiste, crea un ticket de soporte técnico"
        },
        {
            id: 8,
            titulo: "VPN no conecta",
            descripcion: "No puedo conectarme a la VPN de la empresa",
            categoria: "Red",
            icono: "🔒",
            palabrasClave: ["vpn", "red privada", "remoto", "trabajo desde casa"],
            solucion: "1. Verifica tu conexión a internet\n2. Reinicia el cliente VPN\n3. Verifica tus credenciales de VPN\n4. Desactiva temporalmente el firewall\n5. Contacta al departamento de TI si el problema persiste"
        },
        {
            id: 9,
            titulo: "Mouse o teclado no funciona",
            descripcion: "El mouse o teclado no responde",
            categoria: "Hardware",
            icono: "⌨️",
            palabrasClave: ["mouse", "teclado", "ratón", "periférico", "input"],
            solucion: "1. Verifica que estén conectados correctamente\n2. Si son inalámbricos, cambia las baterías\n3. Prueba en otro puerto USB\n4. Reinicia la computadora\n5. Si el problema persiste, solicita un reemplazo"
        },
        {
            id: 10,
            titulo: "No puedo acceder a un sistema",
            descripcion: "Error al intentar ingresar a un sistema específico",
            categoria: "Software",
            icono: "🚫",
            palabrasClave: ["sistema", "acceso", "denegado", "error", "permisos"],
            solucion: "1. Verifica que tus credenciales sean correctas\n2. Limpia la caché del navegador\n3. Intenta en otro navegador\n4. Verifica que tengas los permisos necesarios\n5. Contacta al administrador del sistema"
        }
    ];

    // 4. Referencias a elementos del DOM
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const issuesGrid = document.getElementById('issuesGrid');
    const searchResultsSection = document.getElementById('searchResultsSection');
    const resultsList = document.getElementById('resultsList');

    // 5. Cargar problemas frecuentes
    cargarProblemasFrecuentes();

    // 6. Event listener para búsqueda
    searchBtn.addEventListener('click', realizarBusqueda);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            realizarBusqueda();
        }
    });

    // 7. Función para cargar problemas frecuentes
    function cargarProblemasFrecuentes() {
        issuesGrid.innerHTML = problemasFrecuentes.map(problema => `
            <div class="issue-card" onclick="mostrarDetalleProblema(${problema.id})">
                <div class="issue-icon">${problema.icono}</div>
                <div class="issue-title">${problema.titulo}</div>
                <div class="issue-description">${problema.descripcion}</div>
                <div class="issue-category">${problema.categoria}</div>
            </div>
        `).join('');
    }

    // 8. Función para realizar búsqueda
    function realizarBusqueda() {
        const terminoBusqueda = searchInput.value.toLowerCase().trim();
        
        if (terminoBusqueda === '') {
            searchResultsSection.style.display = 'none';
            return;
        }

        const resultados = problemasFrecuentes.filter(problema => {
            const titulo = problema.titulo.toLowerCase();
            const descripcion = problema.descripcion.toLowerCase();
            const categoria = problema.categoria.toLowerCase();
            const solucion = problema.solucion.toLowerCase();
            const palabrasClave = problema.palabrasClave.join(' ').toLowerCase();

            return titulo.includes(terminoBusqueda) ||
                   descripcion.includes(terminoBusqueda) ||
                   categoria.includes(terminoBusqueda) ||
                   solucion.includes(terminoBusqueda) ||
                   palabrasClave.includes(terminoBusqueda);
        });

        mostrarResultados(resultados);
    }

    // 9. Función para mostrar resultados de búsqueda
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

    // 10. Función para mostrar detalle del problema en modal
    window.mostrarDetalleProblema = function(id) {
        const problema = problemasFrecuentes.find(p => p.id === id);
        if (!problema) return;

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
                        <p>${problema.palabrasClave.join(', ')}</p>
                        
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
    };

    // 11. Función para cerrar modal
    window.cerrarModal = function() {
        const modal = document.getElementById('modalOverlay');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.remove();
            }, 200);
        }
    };

    // 12. Cerrar modal al hacer clic fuera
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('modalOverlay');
        if (modal && e.target === modal) {
            cerrarModal();
        }
    });

    console.log("Base de Conocimiento cargada correctamente para:", usuario.nombre);
});
