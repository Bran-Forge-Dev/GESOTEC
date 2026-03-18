document.addEventListener('DOMContentLoaded', () => {
    const btnFiltrar = document.getElementById('btnFiltrar');
    const tableRows = document.querySelectorAll('#tableBody tr');

    btnFiltrar.addEventListener('click', () => {
        const estadoSelected = document.getElementById('filterEstado').value;
        const prioridadSelected = document.getElementById('filterPrioridad').value;

        tableRows.forEach(row => {
            const rowEstado = row.getAttribute('data-estado');
            const rowPrioridad = row.getAttribute('data-prioridad');

            const matchEstado = (estadoSelected === "Todos" || estadoSelected === rowEstado);
            const matchPrioridad = (prioridadSelected === "Todas" || prioridadSelected === rowPrioridad);

            if (matchEstado && matchPrioridad) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });
});