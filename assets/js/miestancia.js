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
                    document.getElementById('img-cliente').src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiM2NjdFRUEiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMTUiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMCA4NUMzMCA3MCA0MCA2NSA1MCA2NUM2MCA2NSA3MCA3MCA4MCA4NUg4MUM4MSA5MCA3NiA5NSA3MCA5NUgzMEMyNCA5NSAxOSA5MCAxOSA4NUgyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
                }
            } else {
                document.getElementById('cliente-nombre').textContent = usuario.nombre || 'Usuario';
                document.getElementById('img-cliente').src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiM2NjdFRUEiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMTUiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMCA4NUMzMCA3MCA0MCA2NSA1MCA2NUM2MCA2NSA3MCA3MCA4MCA4NUg4MUM4MSA5MCA3NiA5NSA3MCA5NUgzMEMyNCA5NSAxOSA5MCAxOSA4NUgyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
            }
        } catch (error) {
            document.getElementById('cliente-nombre').textContent = usuario.nombre || 'Usuario';
            document.getElementById('img-cliente').src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiM2NzdFRUEiLz4KPGNpcmNsZSBjeD0iNTAiIGN5PSIzNSIgcj0iMTUiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMCA4NUMzMCA3MCA0MCA2NSA1MCA2NUM2MCA2NSA3MCA3MCA4MCA4NUg4MUM4MSA5MCA3NiA5NSA3MCA5NUgzMEMyNCA5NSAxOSA5MCAxOSA4NUgyMFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
        }
    }

    // Mostrar total de la cuenta (usando total_precio de la reservación + minibar)
    let total = 0;
    if (reservacion && reservacion.total_precio) {
        total = parseFloat(reservacion.total_precio);
    }
    
    // Sumar todos los valores de minibar guardados (acumulativo)
    let minibarTotal = 0;
    let minibarHistorial = localStorage.getItem('minibar_historial');
    if (minibarHistorial) {
        try {
            const historial = JSON.parse(minibarHistorial);
            if (Array.isArray(historial)) {
                minibarTotal = historial.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
            }
        } catch (e) {
            // Si hay error, ignora y no suma
        }
    } else {
        // Compatibilidad: si solo existe minibar_total, lo suma una vez
        const minibarSimple = localStorage.getItem('minibar_total');
        if (minibarSimple) minibarTotal = parseFloat(minibarSimple) || 0;
    }
    total += minibarTotal;
    document.getElementById('monto-total').textContent = `$${parseFloat(total).toFixed(2)}`;

    // Mostrar datos de la reservación desde localStorage si existen
    let reservacionLS = localStorage.getItem('reservacion_actual');
    if (reservacionLS) {
        try {
            reservacion = JSON.parse(reservacionLS);
        } catch (e) { reservacion = null; }
    }

    // Mostrar solo los campos de la tabla reservations
    if (reservacion) {
        // Mostrar datos principales en la tarjeta de datos de reservación
        const datosReserva = `
            <div class="reserva-dato"><b>Habitación:</b> ${reservacion.rooms_id || ''}</div>
            <div class="reserva-dato"><b>Días:</b> ${reservacion.num_noches || ''}</div>
            <div class="reserva-dato"><b>Fecha de entrada:</b> ${reservacion.entrada || ''}</div>
            <div class="reserva-dato"><b>Precio por noche:</b> $${reservacion.total_precio && reservacion.num_noches ? (parseFloat(reservacion.total_precio) / parseInt(reservacion.num_noches)).toFixed(2) : ''}</div>
        `;
        const datosReservaContainer = document.getElementById('datos-reservacion');
        if (datosReservaContainer) {
            datosReservaContainer.innerHTML = `<h2>Datos de tu reservación</h2>${datosReserva}`;
        }
        // Mostrar el total grande
        const totalContainer = document.getElementById('monto-total');
        if (totalContainer) {
            totalContainer.textContent = `$${parseFloat(reservacion.total_precio).toFixed(2)}`;
            totalContainer.style.fontSize = '2.5em';
            totalContainer.style.color = '#10b981';
            totalContainer.style.fontWeight = 'bold';
        }
    }

    // Mostrar detalles en reservation-info si existe
    const detallesContainer = document.getElementById('reservation-details');
    if (detallesContainer && reservacion) {
        detallesContainer.innerHTML = `
            <div class="detail-item"><b>ID Reservación:</b> ${reservacion.reservation_id || ''}</div>
            <div class="detail-item"><b>ID Usuario:</b> ${reservacion.user_id || ''}</div>
            <div class="detail-item"><b>ID Habitación:</b> ${reservacion.rooms_id || ''}</div>
            <div class="detail-item"><b>Fecha de entrada:</b> ${reservacion.entrada || ''}</div>
            <div class="detail-item"><b>Noches:</b> ${reservacion.num_noches || ''}</div>
            <div class="detail-item"><b>Total habitación:</b> $${reservacion.total_precio ? parseFloat(reservacion.total_precio).toFixed(2) : '0.00'}</div>
        `;
    }
}); 