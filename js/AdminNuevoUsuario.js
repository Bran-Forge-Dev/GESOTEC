document.addEventListener('DOMContentLoaded', () => {
    const newUserForm = document.getElementById('newUserForm');
    const API_URL = 'https://gesotec.onrender.com/api';

    if (!newUserForm) {
        console.error("No se encontró el formulario 'newUserForm'");
        return;
    }

    newUserForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 1. Obtener valores de los campos
        const nombre = document.getElementById('userName').value;
        const correo = document.getElementById('userEmail').value;
        const pass = document.getElementById('userPass').value;
        const confirmPass = document.getElementById('userPassConfirm').value;
        const telefono = document.getElementById('userTelefono').value;
        const departamento = document.getElementById('userDepartamento').value;
        const idEmpleado = document.getElementById('userIdEmpleado').value;
        const fechaIngreso = document.getElementById('userFechaIngreso').value;
        const turno = document.getElementById('userTurno').value;
        
        // Obtenemos el valor del rol seleccionado
        const rolSelect = document.getElementById('userRole');
        const rol = rolSelect.value;

        // 2. Validación básica de contraseñas
        if (pass !== confirmPass) {
            alert("Las contraseñas no coinciden. Por favor, verifica.");
            return;
        }

        // Validar que se haya seleccionado un rol
        if (!rol) {
            alert("Por favor, selecciona un rol para el usuario.");
            return;
        }

        // 3. Deshabilitar botón durante la petición
        const submitBtn = newUserForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creando usuario...';

        try {
            // 4. Llamada a la API del backend
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: correo,
                    password: pass,
                    nombre: nombre,
                    apellido: '',
                    rol: rol,
                    telefono: telefono || null,
                    departamento: departamento || null,
                    id_empleado: idEmpleado || null,
                    fecha_ingreso: fechaIngreso || null,
                    turno: turno || null
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Usuario ${nombre} registrado con éxito.`);
                window.location.href = "AdminGestionUsuarios.html";
            } else {
                alert(data.error || 'Error al crear usuario');
            }
        } catch (error) {
            console.error('Error al crear usuario:', error);
            alert('Error de conexión con el servidor. Verifica que el backend esté corriendo.');
        } finally {
            // Rehabilitar botón
            submitBtn.disabled = false;
            submitBtn.textContent = 'Guardar Usuario';
        }
    });
});