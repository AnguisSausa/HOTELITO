let reservacionesGlobal = [];

// Cargar y mostrar reservaciones
async function cargarReservaciones() {
    const response = await fetch('php/reservaciones/reservaciones_api.php?action=listar');
    const data = await response.json();
    reservacionesGlobal = data.success && Array.isArray(data.reservaciones) ? data.reservaciones : [];
    renderReservaciones(reservacionesGlobal);
}

function renderReservaciones(reservaciones) {
    const tbody = document.querySelector('#tabla-reservaciones tbody');
    tbody.innerHTML = '';
    if (reservaciones.length > 0) {
        reservaciones.forEach(r => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${r.reservation_id}</td>
                <td>${r.user_id}</td>
                <td>${r.rooms_id}</td>
                <td>${r.entrada}</td>
                <td>${r.num_noches}</td>
                <td>$${parseFloat(r.total_precio).toFixed(2)}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="6">No hay reservaciones registradas</td></tr>';
    }
}

// Búsqueda en tiempo real
const inputBusqueda = document.getElementById('busqueda-reservacion');
if (inputBusqueda) {
    inputBusqueda.addEventListener('input', function() {
        const valor = this.value.toLowerCase();
        const filtradas = reservacionesGlobal.filter(r =>
            String(r.user_id).includes(valor) ||
            String(r.rooms_id).includes(valor) ||
            (r.entrada && r.entrada.toLowerCase().includes(valor))
        );
        renderReservaciones(filtradas);
    });
}

document.addEventListener('DOMContentLoaded', cargarReservaciones); 