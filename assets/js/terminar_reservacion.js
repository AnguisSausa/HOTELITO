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

// Cargar información de la reservación actual
async function cargarReservacionActual() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch(`php/reservaciones/obtener_reservacion_actual.php?user_id=${usuario.id}`);
        const data = await response.json();
        
        if (data.success) {
            reservacionActual = data.reservacion;
            costoHabitacion = parseFloat(data.reservacion.total_precio);
            await cargarCostoMinibar();
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

// Cargar costo del minibar
async function cargarCostoMinibar() {
    try {
        const response = await fetch(`php/minibar/obtener_costo_minibar.php?reservation_id=${reservacionActual.reservation_id}`);
        const data = await response.json();
        
        if (data.success) {
            costoMinibar = parseFloat(data.total_minibar);
        } else {
            costoMinibar = 0;
        }
    } catch (error) {
        console.error('Error al cargar costo del minibar:', error);
        costoMinibar = 0;
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
    
    const detallesContainer = document.getElementById('reservation-details');
    detallesContainer.innerHTML = `
        <div class="detail-item">
            <i class="fas fa-bed"></i>
            <span>Habitación: ${reservacionActual.room_number}</span>
        </div>
        <div class="detail-item">
            <i class="fas fa-calendar-alt"></i>
            <span>Fecha de entrada: ${formatearFecha(reservacionActual.fecha_entrada)}</span>
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
    
    // Configurar formato de tarjeta
    document.getElementById('card-number').addEventListener('input', formatearNumeroTarjeta);
    document.getElementById('card-expiry').addEventListener('input', formatearFechaVencimiento);
    document.getElementById('card-cvv').addEventListener('input', formatearCVV);
}

// Seleccionar método de pago
function seleccionarMetodoPago(metodo) {
    // Desmarcar todos los métodos
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Ocultar todos los formularios
    document.querySelectorAll('.payment-form').forEach(el => {
        el.classList.remove('active');
    });
    
    // Marcar el método seleccionado
    document.getElementById(metodo).checked = true;
    document.getElementById(metodo).parentElement.classList.add('selected');
    
    // Mostrar el formulario correspondiente
    document.getElementById(`${metodo}-form`).classList.add('active');
    
    // Habilitar botón de pago
    document.getElementById('pay-btn').disabled = false;
}

// Formatear número de tarjeta
function formatearNumeroTarjeta(e) {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    e.target.value = value;
}

// Formatear fecha de vencimiento
function formatearFechaVencimiento(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

// Formatear CVV
function formatearCVV(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
}

// Procesar pago
async function procesarPago() {
    const metodoPago = document.querySelector('input[name="payment-method"]:checked').value;
    
    // Validar formulario según el método
    if (metodoPago === 'tarjeta') {
        if (!validarFormularioTarjeta()) {
            return;
        }
    }
    
    // Mostrar loading
    const payBtn = document.getElementById('pay-btn');
    const originalText = payBtn.innerHTML;
    payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    payBtn.disabled = true;
    
    try {
        // Simular procesamiento de pago
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // En un sistema real, aquí se procesaría el pago con el proveedor
        const pagoExitoso = true; // Simular pago exitoso
        
        if (pagoExitoso) {
            pagoRealizado = true;
            
            // Actualizar estado de pago
            document.getElementById('payment-status').className = 'payment-status paid';
            document.getElementById('payment-status').innerHTML = `
                <i class="fas fa-check-circle"></i>
                <span>Pago realizado exitosamente</span>
            `;
            
            // Habilitar botón de terminar
            document.getElementById('terminate-btn').disabled = false;
            
            // Ocultar sección de pago
            document.querySelector('.payment-section').style.display = 'none';
            
            Swal.fire({
                title: '¡Pago Exitoso!',
                text: 'Tu pago ha sido procesado correctamente',
                icon: 'success',
                confirmButtonColor: '#28a745'
            });
            
            // Actualizar información de la reservación
            mostrarInformacionReservacion();
        }
    } catch (error) {
        console.error('Error al procesar pago:', error);
        mostrarError('Error al procesar el pago. Inténtalo de nuevo.');
    } finally {
        // Restaurar botón
        payBtn.innerHTML = originalText;
        payBtn.disabled = false;
    }
}

// Validar formulario de tarjeta
function validarFormularioTarjeta() {
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('card-expiry').value;
    const cardCvv = document.getElementById('card-cvv').value;
    const cardName = document.getElementById('card-name').value.trim();
    
    if (cardNumber.length < 13 || cardNumber.length > 19) {
        mostrarError('Número de tarjeta inválido');
        return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        mostrarError('Fecha de vencimiento inválida (formato: MM/AA)');
        return false;
    }
    
    if (cardCvv.length < 3 || cardCvv.length > 4) {
        mostrarError('CVV inválido');
        return false;
    }
    
    if (cardName.length < 3) {
        mostrarError('Nombre en la tarjeta es requerido');
        return false;
    }
    
    return true;
}

// Terminar reservación
async function terminarReservacion() {
    if (!pagoRealizado) {
        mostrarError('Debes realizar el pago antes de terminar la reservación');
        return;
    }
    
    const comentarios = document.getElementById('comentarios').value.trim();
    
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
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function mostrarError(mensaje) {
    Swal.fire({
        title: 'Error',
        text: mensaje,
        icon: 'error',
        confirmButtonColor: '#dc3545'
    });
} 