document.addEventListener('DOMContentLoaded', () => {
    const newUserForm = document.getElementById('newUserForm');

    newUserForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const pass = document.getElementById('userPass').value;
        const confirmPass = document.getElementById('userPassConfirm').value;

        // Validación básica de contraseñas
        if (pass !== confirmPass) {
            alert("Las contraseñas no coinciden. Por favor, verifica.");
            return;
        }

        const nuevoUsuario = {
            nombre: document.getElementById('userName').value,
            correo: document.getElementById('userEmail').value,
            rol: document.getElementById('userRole').value
        };

        console.log("Datos listos para enviar a Supabase:", nuevoUsuario);
        alert(`Usuario ${nuevoUsuario.nombre} registrado con éxito.`);
        
        // Regresa a la lista de usuarios
        window.location.href = "adminGestionUsuarios.html";
    });
});