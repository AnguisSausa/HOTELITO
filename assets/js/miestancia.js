// Script para poblar la página Mi Estancia

document.addEventListener('DOMContentLoaded', () => {
    // Obtener datos del usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // Obtener datos de la reservación desde localStorage
    const reservacion = JSON.parse(localStorage.getItem('reservacion_actual'));
    // Obtener total de la cuenta (puede actualizarse si hay minibar)
    let totalCuenta = localStorage.getItem('total_cuenta') || 0;

    // Mostrar datos del cliente
    if (usuario) {
        document.getElementById('cliente-nombre').textContent = usuario.nombre;
        // Si tienes imagen personalizada, cámbiala aquí
        // document.getElementById('img-cliente').src = usuario.imagen || 'assets/imgs/default-user.png';
    }

    // Mostrar total de la cuenta
    document.getElementById('monto-total').textContent = `$${parseFloat(totalCuenta).toFixed(2)}`;

    // Mostrar datos de la reservación
    if (reservacion) {
        document.getElementById('habitacion-numero').textContent = reservacion.room_number || reservacion.habitacion || '';
        document.getElementById('habitacion-tipo').textContent = reservacion.room_type || reservacion.tipo || '';
        document.getElementById('fecha-entrada').textContent = reservacion.fecha_entrada || '';
        document.getElementById('num-noches').textContent = reservacion.num_noches || '';
        document.getElementById('precio-noche').textContent = reservacion.precio_noche ? `$${parseFloat(reservacion.precio_noche).toFixed(2)}` : '';
    }
}); 