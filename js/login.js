document.addEventListener('DOMContentLoaded', () => {

    // Simulación de Base de Datos (Hardcode temporal)
    const usuariosDB = [
        {
            email: "admin@gesotec.com",
            pass: "admin123",
            redirect: "html/PerfilAdmin.html"
        },
        {
            email: "tecnico@gesotec.com",
            pass: "tec123",
            redirect: "html/TecPerfil.html"
        },
        {
            email: "cliente@gesotec.com",
            pass: "user123",
            redirect: "html/PerfilUsuario.html"
        }
    ];

    // Referencias al DOM
    const loginForm = document.getElementById('loginForm');
    const userEmail = document.getElementById('userEmail');
    const userPass = document.getElementById('userPass');
    const eyeBtn = document.getElementById('eyeBtn');

    // Validación de existencia de elementos
    if (!loginForm || !userEmail || !userPass || !eyeBtn) {
        console.error("Error: No se encontraron los elementos del formulario.");
        return;
    }

    // Lógica para mostrar/ocultar contraseña
    eyeBtn.addEventListener('click', () => {
        const isPassword = userPass.type === 'password';
        userPass.type = isPassword ? 'text' : 'password';
        eyeBtn.textContent = isPassword ? '🔒' : '👁';
    });

    // Manejo del Login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const emailIngresado = userEmail.value.trim();
        const passIngresada = userPass.value.trim();

        // Verificar si los campos están vacíos
        if (emailIngresado === "" || passIngresada === "") {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Buscar coincidencia en la "DB"
        const usuario = usuariosDB.find(u => u.email === emailIngresado && u.pass === passIngresada);

        if (usuario) {
            alert("Bienvenido al sistema GESOTEC.");
            window.location.href = usuario.redirect;
        } else {
            alert("Correo o contraseña incorrectos.");
            userPass.value = ""; // Limpiar clave por seguridad
        }
    });
});