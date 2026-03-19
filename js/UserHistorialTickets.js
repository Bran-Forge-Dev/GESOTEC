document.addEventListener('DOMContentLoaded', () => {
    const filterInput = document.getElementById('filterInput');
    const tableRows = document.querySelectorAll('#tableBody tr');

    // Función de búsqueda en tiempo real
    filterInput.addEventListener('keyup', (e) => {
        const term = e.target.value.toLowerCase();

        tableRows.forEach(row => {
            const text = row.innerText.toLowerCase();
            if (text.includes(term)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    });

    console.log("Historial de tickets cargado.");
});