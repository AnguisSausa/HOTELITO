// Script para poblar la página Mi Estancia

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener datos del usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.id) {
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = 'index.html';
        return;
    }

    // Verificar reservación activa
    let reservacion = null;
    try {
        const response = await fetch(`php/reservaciones/obtener_reservacion_actual.php?user_id=${usuario.id}`);
        const data = await response.json();
        if (!data.success || !data.reservacion) {
            alert('Debes tener una reservación activa para acceder a esta página.');
            window.location.href = 'paginaprincipal.html';
            return;
        }
        reservacion = data.reservacion;
        // Guardar en localStorage por compatibilidad con otros scripts
        localStorage.setItem('reservacion_actual', JSON.stringify(reservacion));
    } catch (error) {
        alert('Error al verificar tu reservación. Intenta de nuevo.');
        window.location.href = 'paginaprincipal.html';
        return;
    }

    // Mostrar el objeto usuario en el div de depuración (si existiera)
    const debugDiv = document.getElementById('debug-usuario');
    if (debugDiv && usuario) {
        debugDiv.textContent = JSON.stringify(usuario, null, 2);
    }

    // Obtener datos del usuario desde la base de datos
    if (usuario && usuario.id) {
        try {
            const response = await fetch(`php/usuario/obtener_usuario.php?id=${usuario.id}`);
            const data = await response.json();
            if (data.success) {
                document.getElementById('cliente-nombre').textContent = data.usuario.nombre_usuario;
                if (data.usuario.imagen && data.usuario.imagen.startsWith('data:image/')) {
                    document.getElementById('img-cliente').src = data.usuario.imagen;
                } else {
                    document.getElementById('img-cliente').src = 'assets/imgs/default-user.png';
                }
            } else {
                document.getElementById('cliente-nombre').textContent = usuario.nombre || 'Usuario';
                document.getElementById('img-cliente').src = 'assets/imgs/default-user.png';
            }
        } catch (error) {
            document.getElementById('cliente-nombre').textContent = usuario.nombre || 'Usuario';
            document.getElementById('img-cliente').src = 'assets/imgs/default-user.png';
        }
    }

    // Mostrar total de la cuenta (usando total_precio de la reservación)
    let total = 0;
    if (reservacion && reservacion.total_precio) {
        total = parseFloat(reservacion.total_precio);
    }
    document.getElementById('monto-total').textContent = `$${parseFloat(total).toFixed(2)}`;

    // Mostrar datos de la reservación
    if (reservacion) {
        document.getElementById('habitacion-numero').textContent = reservacion.room_number || reservacion.habitacion || '';
        document.getElementById('habitacion-tipo').textContent = reservacion.room_type || reservacion.tipo || '';
        document.getElementById('fecha-entrada').textContent = reservacion.fecha_entrada || '';
        document.getElementById('num-noches').textContent = reservacion.num_noches || '';
        document.getElementById('precio-noche').textContent = reservacion.precio_noche ? `$${parseFloat(reservacion.precio_noche).toFixed(2)}` : '';
    }

    // Mostrar detalles en reservation-info si existe
    const detallesContainer = document.getElementById('reservation-details');
    if (detallesContainer && reservacion) {
        detallesContainer.innerHTML = `
            <div class="detail-item"><span style='font-size:1.2em;'>&#128719;</span> <span>Habitación: ${reservacion.room_number || ''}</span></div>
            <div class="detail-item"><span style='font-size:1.2em;'>&#128197;</span> <span>Fecha de entrada: ${reservacion.fecha_entrada || ''}</span></div>
            <div class="detail-item"><span style='font-size:1.2em;'>&#127769;</span> <span>Noches: ${reservacion.num_noches || ''}</span></div>
            <div class="detail-item"><span style='font-size:1.2em;'>&#128181;</span> <span>Total habitación: $${reservacion.total_precio ? parseFloat(reservacion.total_precio).toFixed(2) : '0.00'}</span></div>
        `;
    }
}); 