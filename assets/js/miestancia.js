// Script para poblar la página Mi Estancia

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener datos del usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    console.log('Usuario en localStorage:', usuario);
    
    // Mostrar el objeto usuario en el div de depuración
    const debugDiv = document.getElementById('debug-usuario');
    if (debugDiv && usuario) {
        debugDiv.textContent = JSON.stringify(usuario, null, 2);
    }
    
    // Obtener datos de la reservación desde localStorage
    const reservacion = JSON.parse(localStorage.getItem('reservacion_actual'));

    // Obtener datos del usuario desde la base de datos
    if (usuario && usuario.id) {
        try {
            const response = await fetch(`php/usuario/obtener_usuario.php?id=${usuario.id}`);
            const data = await response.json();
            
            if (data.success) {
                // Mostrar nombre del usuario
                document.getElementById('cliente-nombre').textContent = data.usuario.nombre_usuario;
                
                // Mostrar imagen del usuario
                if (data.usuario.imagen && data.usuario.imagen.startsWith('data:image/')) {
                    document.getElementById('img-cliente').src = data.usuario.imagen;
                } else {
                    document.getElementById('img-cliente').src = 'assets/imgs/default-user.png';
                }
            } else {
                console.error('Error al obtener datos del usuario:', data.error);
                // Mostrar datos del localStorage como fallback
                if (usuario.nombre) {
                    document.getElementById('cliente-nombre').textContent = usuario.nombre;
                }
                if (usuario.fotoPerfil && usuario.fotoPerfil.startsWith('data:image/')) {
                    document.getElementById('img-cliente').src = usuario.fotoPerfil;
                } else {
                    document.getElementById('img-cliente').src = 'assets/imgs/default-user.png';
                }
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            // Mostrar datos del localStorage como fallback
            if (usuario.nombre) {
                document.getElementById('cliente-nombre').textContent = usuario.nombre;
            }
            if (usuario.fotoPerfil && usuario.fotoPerfil.startsWith('data:image/')) {
                document.getElementById('img-cliente').src = usuario.fotoPerfil;
            } else {
                document.getElementById('img-cliente').src = 'assets/imgs/default-user.png';
            }
        }
    } else {
        console.error('No se encontró ID de usuario en localStorage');
        document.getElementById('cliente-nombre').textContent = 'Usuario no identificado';
        document.getElementById('img-cliente').src = 'assets/imgs/default-user.png';
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