// Script para poblar la página Mi Estancia

document.addEventListener('DOMContentLoaded', () => {
    // Obtener datos del usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    // Imprimir en consola para depuración
    console.log('Usuario en localStorage:', usuario);
    if (usuario && usuario.fotoPerfil) {
        console.log('Imagen base64:', usuario.fotoPerfil.substring(0, 100) + '...'); // Solo los primeros 100 caracteres
    }
    // Mostrar el objeto usuario en el div de depuración
    const debugDiv = document.getElementById('debug-usuario');
    if (debugDiv && usuario) {
        debugDiv.textContent = JSON.stringify(usuario, null, 2);
    }
    // Obtener datos de la reservación desde localStorage
    const reservacion = JSON.parse(localStorage.getItem('reservacion_actual'));

    // Mostrar datos del cliente
    if (usuario) {
        document.getElementById('cliente-nombre').textContent = usuario.nombre;
        // Mostrar imagen en base64 si existe y es válida
        if (usuario.fotoPerfil && usuario.fotoPerfil.startsWith('data:image/')) {
            document.getElementById('img-cliente').src = usuario.fotoPerfil;
        } else {
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
}); 