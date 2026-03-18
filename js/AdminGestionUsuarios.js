document.addEventListener("DOMContentLoaded", function () {

    // Seleccionamos todos los botones eliminar
    const botonesEliminar = document.querySelectorAll(".delete");

    botonesEliminar.forEach(function (boton) {

        boton.addEventListener("click", function () {

            // Confirmación
            const confirmar = confirm("¿Estás seguro de que deseas eliminar este usuario?");

            if (confirmar) {

                // Buscar la fila (tr) más cercana
                const fila = boton.closest("tr");

                // Animación opcional
                fila.style.backgroundColor = "#f8d7da";

                setTimeout(() => {
                    fila.remove();
                }, 300);

            }

        });

    });

});