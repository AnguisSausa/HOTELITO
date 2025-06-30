// Cargar y mostrar historial en tarjetas
async function cargarHistorial() {
    const response = await fetch('php/historial/historial_api.php?action=listar');
    const data = await response.json();
    const contenedor = document.getElementById('tarjetas-historial');
    contenedor.innerHTML = '';
    if (data.success && Array.isArray(data.historial)) {
        data.historial.forEach(item => {
            const div = document.createElement('div');
            div.className = 'tarjeta-historial';
            div.innerHTML = `
                <div class="res-id">Reservación #${item.reservation_id}</div>
                <div class="comentario"><b>Comentario:</b> ${item.comentarios || '(Sin comentario)'}</div>
            `;
            contenedor.appendChild(div);
        });
    } else {
        contenedor.innerHTML = '<div>No hay historial disponible.</div>';
    }
}

document.addEventListener('DOMContentLoaded', cargarHistorial); 