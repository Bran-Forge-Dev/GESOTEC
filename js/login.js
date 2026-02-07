document.addEventListener('DOMContentLoaded', () => {

    // Definimos las credenciales que darán acceso
    const EMAIL_VALOR = "user_@gesotec.com";
    const PASS_VALOR = "1234";

    // Referencias a los inputs y al formulario
    const loginForm = document.getElementById('loginForm');
    const userEmail = document.getElementById('userEmail');
    const userPass = document.getElementById('userPass');
    const eyeBtn = document.getElementById('eyeBtn');

    // Auto-rellenamos para facilitar tus pruebas
    userEmail.value = EMAIL_VALOR;
    userPass.value = PASS_VALOR;

    // Lógica del ojo (mostrar/ocultar contraseña)
    eyeBtn.addEventListener('click', () => {
        const type = userPass.type === 'password' ? 'text' : 'password';
        userPass.type = type;
        eyeBtn.textContent = type === 'password' ? '👁' : '🔒';
    })

    // Lógica de validación y redirección
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Detiene el envío automático

        // Verificamos si los datos coinciden con las credenciales preestablecidas
        if (userEmail.value === EMAIL_VALOE && userPass.value === PASS_VALOR) {

            alert("Acceso correcto. Redirigiendo...");

            // Cambia a Perfil del usuario que inicie sesión
            window.location.href = "html/PerfilAdmin.html";
        } else {
            alert("Credenciales incorrectas. Inténtalo de nuevo.");
        }
    })
});