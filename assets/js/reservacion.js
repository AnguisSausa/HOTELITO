// Variables globales
let habitacionSeleccionada = null;
let usuarioActual = null;

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    cargarDatosIniciales();
    configurarEventos();
});

// Verificar si el usuario está logueado
function verificarSesion() {
    usuarioActual = JSON.parse(localStorage.getItem('usuario'));
    
    // Imprimir datos del usuario en localStorage
    console.log('=== DATOS DEL USUARIO EN LOCALSTORAGE ===');
    console.log('Usuario completo:', usuarioActual);
    console.log('ID del usuario:', usuarioActual ? usuarioActual.id : 'No hay usuario');
    console.log('Tipo de ID:', usuarioActual ? typeof usuarioActual.id : 'No hay usuario');
    console.log('==========================================');
    
    if (!usuarioActual) {
        Swal.fire({
            title: 'Sesión no válida',
            text: 'Debes iniciar sesión para hacer una reservación',
            icon: 'warning',
            confirmButtonColor: '#667eea'
        }).then(() => {
            window.location.href = 'index.html';
        });
        return;
    }
}

// Cargar datos iniciales
async function cargarDatosIniciales() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room_id');
    
    if (!roomId) {
        Swal.fire({
            title: 'Error',
            text: 'No se especificó una habitación para reservar',
            icon: 'error',
            confirmButtonColor: '#667eea'
        }).then(() => {
            window.location.href = 'paginaprincipal.html';
        });
        return;
    }
    
    await cargarHabitacion(roomId);
    configurarFechaMinima();
}

// Cargar información de la habitación
async function cargarHabitacion(roomId) {
    try {
        const response = await fetch(`php/admin/habitaciones.php?action=obtener_una&room_id=${roomId}`);
        const data = await response.json();
        
        if (data.success) {
            habitacionSeleccionada = data.data;
            mostrarHabitacion(habitacionSeleccionada);
            configurarCamposOcultos();
        } else {
            throw new Error(data.message || 'Error al cargar la habitación');
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: 'No se pudo cargar la información de la habitación',
            icon: 'error',
            confirmButtonColor: '#667eea'
        }).then(() => {
            window.location.href = 'paginaprincipal.html';
        });
    }
}

// Mostrar información de la habitación
function mostrarHabitacion(habitacion) {
    // Mostrar número de habitación
    document.getElementById('habitacion-numero').textContent = `Habitación ${habitacion.room_number}`;
    
    // Mostrar tipo de habitación
    document.getElementById('habitacion-tipo').textContent = habitacion.room_type;
    
    // Mostrar descripción
    document.getElementById('habitacion-descripcion').textContent = habitacion.description || 'Sin descripción disponible';
    
    // Mostrar imagen
    const imagenContainer = document.getElementById('habitacion-imagen');
    if (habitacion.imagen) {
        imagenContainer.innerHTML = `<img src="${habitacion.imagen}" alt="Habitación ${habitacion.room_number}" onerror="this.parentElement.innerHTML='<i class=\\'fas fa-bed\\'></i>'">`;
    } else {
        imagenContainer.innerHTML = '<i class="fas fa-bed"></i>';
    }
    
    // Actualizar resumen de precio
    actualizarResumenPrecio();
}

// Configurar campos ocultos
function configurarCamposOcultos() {
    document.getElementById('room_id').value = habitacionSeleccionada.room_id;
    document.getElementById('user_id').value = usuarioActual.id;
    document.getElementById('precio_noche').value = habitacionSeleccionada.precio_noche;
}

// Configurar fecha mínima (hoy)
function configurarFechaMinima() {
    const hoy = new Date().toISOString().split('T')[0];
    document.getElementById('fecha_entrada').min = hoy;
    document.getElementById('fecha_entrada').value = hoy;
}

// Configurar eventos
function configurarEventos() {
    // Evento para calcular precio cuando cambie el número de noches
    document.getElementById('num_noches').addEventListener('input', function() {
        actualizarResumenPrecio();
    });
    
    // Evento para el formulario de reservación
    document.getElementById('reservacionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        procesarReservacion();
    });
}

// Actualizar resumen de precio
function actualizarResumenPrecio() {
    if (!habitacionSeleccionada) return;
    
    const numNoches = parseInt(document.getElementById('num_noches').value) || 0;
    const precioNoche = parseFloat(habitacionSeleccionada.precio_noche);
    const total = numNoches * precioNoche;
    
    // Actualizar elementos del resumen
    document.getElementById('precio-por-noche').textContent = `$${precioNoche.toFixed(2)}`;
    document.getElementById('noches-cantidad').textContent = numNoches;
    document.getElementById('precio-total').textContent = `$${total.toFixed(2)}`;
    
    // Habilitar/deshabilitar botón según validación
    const btnReservar = document.getElementById('btnReservar');
    btnReservar.disabled = numNoches < 1 || numNoches > 30;
}

// Procesar reservación
async function procesarReservacion() {
    const formData = new FormData(document.getElementById('reservacionForm'));
    
    // Validaciones
    const fechaEntrada = formData.get('fecha_entrada');
    const numNoches = parseInt(formData.get('num_noches'));
    
    if (!fechaEntrada) {
        Swal.fire('Error', 'Debes seleccionar una fecha de entrada', 'error');
        return;
    }
    
    if (numNoches < 1 || numNoches > 30) {
        Swal.fire('Error', 'El número de noches debe estar entre 1 y 30', 'error');
        return;
    }
    
    // Mostrar confirmación
    const total = numNoches * parseFloat(habitacionSeleccionada.precio_noche);
    
    const result = await Swal.fire({
        title: 'Confirmar Reservación',
        html: `
            <div style="text-align: left;">
                <p><strong>Habitación:</strong> ${habitacionSeleccionada.room_number}</p>
                <p><strong>Fecha de entrada:</strong> ${fechaEntrada}</p>
                <p><strong>Número de noches:</strong> ${numNoches}</p>
                <p><strong>Total a pagar:</strong> $${total.toFixed(2)}</p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#28a745',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Confirmar Reservación',
        cancelButtonText: 'Cancelar'
    });
    
    if (result.isConfirmed) {
        await enviarReservacion(formData);
    }
}

// Enviar reservación al servidor
async function enviarReservacion(formData) {
    const btnReservar = document.getElementById('btnReservar');
    btnReservar.disabled = true;
    btnReservar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
    
    try {
        // Imprimir usuario de localStorage antes de enviar
        const usuarioDebug = JSON.parse(localStorage.getItem('usuario'));
        console.log('Usuario en localStorage antes de enviar reservación:', usuarioDebug);
        console.log('ID del usuario (localStorage):', usuarioDebug ? usuarioDebug.id : 'No hay usuario');
        // Preparar datos para enviar
        const datosReservacion = {
            user_id: formData.get('user_id'),
            room_id: formData.get('room_id'),
            fecha_entrada: formData.get('fecha_entrada'),
            num_noches: formData.get('num_noches'),
            precio_noche: formData.get('precio_noche')
        };
        
        // Imprimir datos que se van a enviar
        console.log('=== DATOS QUE SE VAN A ENVIAR ===');
        console.log('Datos completos:', datosReservacion);
        console.log('user_id:', datosReservacion.user_id, 'tipo:', typeof datosReservacion.user_id);
        console.log('room_id:', datosReservacion.room_id, 'tipo:', typeof datosReservacion.room_id);
        console.log('fecha_entrada:', datosReservacion.fecha_entrada);
        console.log('num_noches:', datosReservacion.num_noches, 'tipo:', typeof datosReservacion.num_noches);
        console.log('precio_noche:', datosReservacion.precio_noche, 'tipo:', typeof datosReservacion.precio_noche);
        console.log('Usuario actual:', usuarioActual);
        console.log('Habitación seleccionada:', habitacionSeleccionada);
        console.log('==================================');
        
        const response = await fetch('php/reservaciones/crear_reservacion.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datosReservacion)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar solo los campos que existen en la tabla reservations
            const reservacionGuardada = {
                reservation_id: data.reservation_id,
                user_id: usuarioActual.id,
                rooms_id: habitacionSeleccionada.room_id,
                entrada: data.datos_reservacion?.fecha_entrada || formData.get('fecha_entrada'),
                num_noches: data.datos_reservacion?.num_noches || formData.get('num_noches'),
                total_precio: data.datos_reservacion?.total_precio || (parseFloat(habitacionSeleccionada.precio_noche) * parseInt(formData.get('num_noches')))
            };
            localStorage.setItem('reservacion_actual', JSON.stringify(reservacionGuardada));
            Swal.fire({
                title: '¡Reservación exitosa!',
                text: 'Tu reservación ha sido creada correctamente.',
                icon: 'success',
                confirmButtonColor: '#28a745'
            }).then(() => {
                window.location.href = 'miestancia.html';
            });
        } else if (data.error) {
            // Si el backend manda un array de errores, únelos en un solo string
            let mensaje = Array.isArray(data.error) ? data.error.join('\n') : data.error;
            Swal.fire({
                title: 'Error',
                text: mensaje,
                icon: 'error',
                confirmButtonColor: '#667eea'
            });
        } else {
            Swal.fire({
                title: 'Error',
                text: 'Error al crear la reservación',
                icon: 'error',
                confirmButtonColor: '#667eea'
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error',
            text: error.message || 'Hubo un problema al procesar tu reservación',
            icon: 'error',
            confirmButtonColor: '#667eea'
        });
    } finally {
        btnReservar.disabled = false;
        btnReservar.innerHTML = '<i class="fas fa-calendar-check"></i> Confirmar Reservación';
    }
}

// Función para formatear fecha
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para formatear precio
function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
    }).format(precio);
} 