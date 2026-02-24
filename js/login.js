document.addEventListener('DOMContentLoaded', () => {

    // Credenciales de prueba
    const EMAIL_VALOR = "user_@gesotec.com";
    const PASS_VALOR = "1234";

    // Referencias
    const loginForm = document.getElementById('loginForm');
    const userEmail = document.getElementById('userEmail');
    const userPass = document.getElementById('userPass');
    const eyeBtn = document.getElementById('eyeBtn');

    // Autorrellenar para pruebas
    userEmail.value = EMAIL_VALOR;
    userPass.value = PASS_VALOR;

    // Mostrar / ocultar contraseña
    eyeBtn.addEventListener('click', () => {
        const type = userPass.type === 'password' ? 'text' : 'password';
        userPass.type = type;
        eyeBtn.textContent = type === 'password' ? '👁' : '🔒';
    });

    // Validación y redirección
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (userEmail.value === EMAIL_VALOR && userPass.value === PASS_VALOR) {

            alert("Acceso correcto. Redirigiendo...");
            window.location.href = "../html/PerfilAdmin.html";

        } else {
            alert("Credenciales incorrectas. Inténtalo de nuevo.");
        }
    });

});