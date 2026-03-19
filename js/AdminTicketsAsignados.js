document.addEventListener('DOMContentLoaded', () => {
    const btnFiltrar = document.getElementById('btnFiltrar');
    const tableBody = document.getElementById('tableBody');
    const rows = tableBody.getElementsByTagName('tr');

    btnFiltrar.addEventListener('click', () => {
        const selEstado = document.getElementById('filterEstado').value;
        const selPrioridad = document.getElementById('filterPrioridad').value;
        const selAgente = document.getElementById('filterAgente').value;

        for (let row of rows) {
            const estado = row.getAttribute('data-estado');
            const prioridad = row.getAttribute('data-prioridad');
            const agente = row.getAttribute('data-agente');

            let matchEstado = (selEstado === "Todos" || selEstado === estado);
            let matchPrioridad = (selPrioridad === "Todos" || selPrioridad === prioridad);
            let matchAgente = (selAgente === "Cualquiera" || selAgente === agente);

            if (matchEstado && matchPrioridad && matchAgente) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    });
});