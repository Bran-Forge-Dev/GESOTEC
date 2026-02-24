document.addEventListener('DOMContentLoaded', () => {

    // Credenciales de prueba
    const EMAIL_VALOR = "user_@gesotec.com";
    const PASS_VALOR = "1234";

    // Referencias
    const loginForm = document.getElementById('loginForm');
    const userEmail = document.getElementById('userEmail');
    const userPass = document.getElementById('userPass');
    const eyeBtn = document.getElementById('eyeBtn');

    // Validación de seguridad (evita errores null)
    if (!loginForm || !userEmail || !userPass || !eyeBtn) {
        console.error("Algún elemento no fue encontrado en el DOM.");
        return;
    }

    // Autorrellenar para pruebas
    userEmail.value = EMAIL_VALOR;
    userPass.value = PASS_VALOR;

    // Mostrar / ocultar contraseña
    eyeBtn.addEventListener('click', () => {
        const isPassword = userPass.type === 'password';
        userPass.type = isPassword ? 'text' : 'password';
        eyeBtn.textContent = isPassword ? '🔒' : '👁';
    });

    // Validación y redirección
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (
            userEmail.value.trim() === EMAIL_VALOR &&
            userPass.value.trim() === PASS_VALOR
        ) {

            alert("Acceso correcto. Redirigiendo...");
            window.location.href = "html/PerfilAdmin.html";

        } else {
            alert("Credenciales incorrectas. Inténtalo de nuevo.");
        }
    });

});