// Variables globales
let reservacionActual = null;
let costoHabitacion = 0;
let costoMinibar = 0;
let totalFinal = 0;
let pagoRealizado = false;

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    cargarReservacionActual();
    configurarEventos();
});

// Verificar sesión del usuario
function verificarSesion() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        Swal.fire({
            title: 'Sesión no válida',
            text: 'Debes iniciar sesión para acceder a esta página',
            icon: 'warning',
            confirmButtonColor: '#667eea'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }
}

// Cargar costo del minibar desde localStorage (acumulativo)
function cargarCostoMinibarDesdeLocalStorage() {
    let minibarTotal = 0;
    let minibarHistorial = localStorage.getItem('minibar_historial');
    if (minibarHistorial) {
        try {
            const historial = JSON.parse(minibarHistorial);
            if (Array.isArray(historial)) {
                minibarTotal = historial.reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
            }
        } catch (e) {
            minibarTotal = 0;
        }
    } else {
        // Compatibilidad: si solo existe minibar_total, lo suma una vez
        const minibarSimple = localStorage.getItem('minibar_total');
        if (minibarSimple) minibarTotal = parseFloat(minibarSimple) || 0;
    }
    return minibarTotal;
}

// Modificar cargarReservacionActual para usar el costo del minibar del localStorage
async function cargarReservacionActual() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch(`php/reservaciones/obtener_reservacion_actual.php?user_id=${usuario.id}`);
        const data = await response.json();
        
        if (data.success) {
            reservacionActual = data.reservacion;
            costoHabitacion = parseFloat(data.reservacion.total_precio);
            // Usar el costo del minibar acumulado del localStorage
            costoMinibar = cargarCostoMinibarDesdeLocalStorage();
            calcularTotalFinal();
            mostrarInformacionReservacion();
        } else {
            Swal.fire({
                title: 'Sin reservación activa',
                text: 'No tienes una reservación activa para terminar',
                icon: 'info',
                confirmButtonColor: '#667eea'
            }).then(() => {
                window.location.href = 'paginaprincipal.html';
            });
        }
    } catch (error) {
        console.error('Error al cargar reservación:', error);
        mostrarError('Error al cargar la información de tu reservación');
    }
}

// Calcular total final
function calcularTotalFinal() {
    totalFinal = costoHabitacion + costoMinibar;
    
    // Actualizar la interfaz
    document.getElementById('costo-habitacion').textContent = `$${costoHabitacion.toFixed(2)}`;
    document.getElementById('costo-minibar').textContent = `$${costoMinibar.toFixed(2)}`;
    document.getElementById('total-final').textContent = `$${totalFinal.toFixed(2)}`;
}

// Mostrar información de la reservación
function mostrarInformacionReservacion() {
    if (!reservacionActual) return;
    // Obtener la fecha de entrada desde localStorage
    let reservacionLS = localStorage.getItem('reservacion_actual');
    let fechaEntrada = reservacionActual.fecha_entrada;
    if (reservacionLS) {
        try {
            const reservacionObj = JSON.parse(reservacionLS);
            if (reservacionObj && (reservacionObj.fecha_entrada || reservacionObj.entrada)) {
                fechaEntrada = reservacionObj.fecha_entrada || reservacionObj.entrada;
            }
        } catch (e) {}
    }
    const detallesContainer = document.getElementById('reservation-details');
    detallesContainer.innerHTML = `
        <div class="detail-item">
            <i class="fas fa-bed"></i>
            <span>Habitación: ${reservacionActual.room_number}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <span>Fecha de entrada: ${formatearFecha(fechaEntrada)}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-moon"></i>
            <span>Noches: ${reservacionActual.num_noches}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-clock"></i>
            <span>Estado: ${pagoRealizado ? 'Pagado' : 'Pendiente de pago'}</span>
        </div>
    `;
}

// Configurar eventos
function configurarEventos() {
    document.getElementById('pay-btn').addEventListener('click', procesarPago);
    document.getElementById('terminate-btn').addEventListener('click', terminarReservacion);
}

// Procesar pago
async function procesarPago() {
    // Obtener el monto pagado
    const montoPagadoInput = document.getElementById('monto-pagado');
    const cambioDiv = document.getElementById('cambio');
    const montoPagado = parseFloat(montoPagadoInput.value);
    if (isNaN(montoPagado) || montoPagado < totalFinal) {
        cambioDiv.textContent = 'El monto pagado es insuficiente.';
        cambioDiv.style.color = '#e53e3e';
        pagoRealizado = false;
        document.getElementById('terminate-btn').disabled = true;
        return;
    }
    const cambio = montoPagado - totalFinal;
    cambioDiv.textContent = `Cambio: $${cambio.toFixed(2)}`;
    cambioDiv.style.color = '#059669';
    pagoRealizado = true;
    document.getElementById('terminate-btn').disabled = false;

    // Mostrar loading
    const payBtn = document.getElementById('pay-btn');
    const originalText = payBtn.innerHTML;
    payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    payBtn.disabled = true;
    await new Promise(resolve => setTimeout(resolve, 1000));
    document.getElementById('payment-status').className = 'payment-status paid';
    document.getElementById('payment-status').innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Pago realizado exitosamente</span>
    `;
    document.querySelector('.payment-section').style.display = 'none';
    Swal.fire({
        title: '¡Pago Exitoso!',
        text: 'Tu pago ha sido procesado correctamente',
        icon: 'success',
        confirmButtonColor: '#28a745'
    });
    mostrarInformacionReservacion();
    payBtn.innerHTML = originalText;
    payBtn.disabled = false;
}

// Terminar reservación
async function terminarReservacion() {
    if (!pagoRealizado) {
        mostrarError('Debes realizar el pago antes de terminar la reservación');
        return;
    }
    const comentarios = document.getElementById('comentarios').value.trim();
    if (!comentarios) {
        mostrarError('Por favor, escribe un comentario sobre tu experiencia. El campo de comentarios es obligatorio.');
        return;
    }
    // Confirmar terminación
    const result = await Swal.fire({
        title: '¿Terminar Reservación?',
        text: '¿Estás seguro de que quieres terminar tu reservación? Esta acción no se puede deshacer.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, terminar',
        cancelButtonText: 'Cancelar'
    });
    if (result.isConfirmed) {
        try {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            const datos = {
                user_id: usuario.id,
                reservation_id: reservacionActual.reservation_id,
                total_spent: totalFinal,
                comentarios: comentarios
            };
            const response = await fetch('php/reservaciones/terminar_reservacion.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            const data = await response.json();
            if (data.success) {
                Swal.fire({
                    title: '¡Reservación Terminada!',
                    text: 'Tu reservación ha sido finalizada exitosamente. ¡Gracias por tu estadía!',
                    icon: 'success',
                    confirmButtonColor: '#28a745'
                }).then(() => {
                    // Limpiar datos de sesión de reservación
                    localStorage.removeItem('reservacion_activa');
                    // Redirigir a página principal
                    window.location.href = 'paginaprincipal.html';
                });
            } else {
                mostrarError(data.message || 'Error al terminar la reservación');
            }
        } catch (error) {
            console.error('Error al terminar reservación:', error);
            mostrarError('Error de conexión al terminar la reservación');
        }
    }
}

// Funciones auxiliares
function formatearFecha(fecha) {
    if (!fecha) return '';
    // Si es formato YYYY-MM-DD o YYYY-MM-DD HH:MM:SS
    if (/^\d{4}-\d{2}-\d{2}/.test(fecha)) {
        let f = fecha.replace(' ', 'T');
        let d = new Date(f);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }
    // Si es formato DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
        const [dia, mes, anio] = fecha.split('/');
        const d = new Date(`${anio}-${mes}-${dia}`);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }
    // Si es formato MM/DD/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
        const [mes, dia, anio] = fecha.split('/');
        const d = new Date(`${anio}-${mes}-${dia}`);
        if (!isNaN(d.getTime())) {
            return d.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        }
    }
    // Si no se pudo parsear, regresa el string original
    return fecha;
}

function mostrarError(mensaje) {
    Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        confirmButtonColor: '#dc3545'
    });
} 