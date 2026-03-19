document.addEventListener('DOMContentLoaded', () => {
    const newUserForm = document.getElementById('newUserForm');

    if (!newUserForm) {
        console.error("No se encontró el formulario 'newUserForm'");
        return;
    }

    newUserForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Obtener valores de los campos
        const nombre = document.getElementById('userName').value;
        const correo = document.getElementById('userEmail').value;
        const pass = document.getElementById('userPass').value;
        const confirmPass = document.getElementById('userPassConfirm').value;
        
        // Obtenemos el texto del rol seleccionado (ej: "Administrador")
        const rolSelect = document.getElementById('userRole');
        const rolTexto = rolSelect.options[rolSelect.selectedIndex].text;

        // 2. Validación básica de contraseñas
        if (pass !== confirmPass) {
            alert("Las contraseñas no coinciden. Por favor, verifica.");
            return;
        }

        // 3. Crear el objeto del nuevo usuario
        // Agregamos la fecha actual automáticamente
        const nuevoUsuario = {
            nombre: nombre,
            email: correo,
            rol: rolTexto,
            fecha: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
        };

        // 4. Lógica de Persistencia Local (LocalStorage)
        // Intentamos obtener la lista existente, si no hay, creamos un arreglo vacío []
        const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios_gesotec')) || [];
        
        // Añadimos el nuevo usuario al arreglo
        usuariosGuardados.push(nuevoUsuario);
        
        // Guardamos el arreglo actualizado de vuelta en el LocalStorage (como texto JSON)
        localStorage.setItem('usuarios_gesotec', JSON.stringify(usuariosGuardados));

        // 5. Feedback y Redirección
        console.log("Usuario guardado en LocalStorage:", nuevoUsuario);
        alert(`Usuario ${nuevoUsuario.nombre} registrado con éxito.`);
        
        // Regresa a la lista de usuarios (asegúrate que el nombre del archivo sea exacto)
        window.location.href = "AdminGestionUsuarios.html";
    });
});