document.addEventListener('DOMContentLoaded', () => {

    // Configuración de la API
    const API_URL = 'http://localhost:3000/api';

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
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const emailIngresado = userEmail.value.trim();
        const passIngresada = userPass.value.trim();

        // Verificar si los campos están vacíos
        if (emailIngresado === "" || passIngresada === "") {
            alert("Por favor, completa todos los campos.");
            return;
        }

        // Deshabilitar botón durante la petición
        const submitBtn = loginForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';

        try {
            // Llamada a la API del backend
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailIngresado,
                    password: passIngresada
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Guardar información del usuario en localStorage
                localStorage.setItem('gesotec_user', JSON.stringify(data.user));
                
                alert(`Bienvenido al sistema GESOTEC, ${data.user.nombre}.`);
                
                // Redirigir según el rol
                window.location.href = data.redirect;
            } else {
                alert(data.error || 'Error al iniciar sesión');
                userPass.value = ""; // Limpiar clave por seguridad
            }
        } catch (error) {
            console.error('Error en login:', error);
            alert('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
        } finally {
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar sesión';
        }
    });
});