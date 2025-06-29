// Verificar sesión al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    cargarInformacionUsuario();
    cargarHabitacionesDisponibles();
    verificarReservacionActiva();
});

// Función para verificar si el usuario está logueado
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

// Función para cargar y mostrar información del usuario
function cargarInformacionUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (usuario) {
        // Mostrar nombre del usuario
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = usuario.nombre || 'Usuario';
        }
        
        // Mostrar tipo de usuario (cliente o admin)
        const userTypeElement = document.getElementById('user-type');
        if (userTypeElement) {
            const tipo = usuario.tipo || 'cliente';
            userTypeElement.textContent = tipo === 'admin' ? 'Administrador' : 'Cliente';
            userTypeElement.className = tipo === 'admin' ? 'admin-badge' : 'client-badge';
        }
        
        // Configurar enlaces según el tipo de usuario
        configurarEnlacesUsuario(usuario);
        
        // Mostrar mensaje de bienvenida personalizado
        mostrarBienvenida();
    }
}

// Función para cargar habitaciones disponibles
async function cargarHabitacionesDisponibles() {
    try {
        const response = await fetch('php/admin/habitaciones.php');
        const data = await response.json();
        
        if (data.success) {
            // Filtrar solo habitaciones disponibles
            const habitacionesDisponibles = data.data.filter(habitacion => 
                habitacion.status.toLowerCase() === 'disponible'
            );
            
            mostrarHabitaciones(habitacionesDisponibles);
        } else {
            console.error('Error al cargar habitaciones:', data.message);
            mostrarErrorHabitaciones();
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarErrorHabitaciones();
    }
}

// Función para mostrar habitaciones en el contenedor
function mostrarHabitaciones(habitaciones) {
    const contenedor = document.getElementById('habitaciones-container');
    const loadingElement = document.getElementById('loading-habitaciones');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    if (!contenedor) {
        console.error('Contenedor de habitaciones no encontrado');
        return;
    }
    
    if (habitaciones.length === 0) {
        contenedor.innerHTML = `
            <div class="no-habitaciones">
                <i class="fas fa-bed"></i>
                <p>No hay habitaciones disponibles en este momento</p>
            </div>
        `;
        return;
    }
    
    const habitacionesHTML = habitaciones.map(habitacion => `
        <div class="habitacion-card">
            <div class="habitacion-imagen">
                ${habitacion.imagen ? 
                    `<img src="${habitacion.imagen}" alt="Habitación ${habitacion.room_number}" onerror="this.src='assets/img/default-room.jpg'">` :
                    `<div class="imagen-placeholder">
                        <i class="fas fa-bed"></i>
                        <span>Sin imagen</span>
                    </div>`
                }
                <div class="habitacion-status disponible">
                    <i class="fas fa-check-circle"></i> Disponible
                </div>
            </div>
            <div class="habitacion-info">
                <div class="habitacion-header">
                    <h3>Habitación ${habitacion.room_number}</h3>
                    <span class="habitacion-tipo">${habitacion.room_type}</span>
                </div>
                <p class="habitacion-descripcion">${habitacion.description || 'Sin descripción disponible'}</p>
                <div class="habitacion-detalles">
                    <div class="detalle">
                        <i class="fas fa-users"></i>
                        <span>${habitacion.capacity} persona${habitacion.capacity > 1 ? 's' : ''}</span>
                    </div>
                    <div class="detalle precio">
                        <i class="fas fa-dollar-sign"></i>
                        <span>$${habitacion.precio_noche}/noche</span>
                    </div>
                </div>
                <button class="btn-reservar" onclick="reservarHabitacion(${habitacion.room_id})">
                    <i class="fas fa-calendar-check"></i> Reservar
                </button>
            </div>
        </div>
    `).join('');
    
    contenedor.innerHTML = habitacionesHTML;
}

// Función para mostrar error al cargar habitaciones
function mostrarErrorHabitaciones() {
    const contenedor = document.getElementById('habitaciones-container');
    const loadingElement = document.getElementById('loading-habitaciones');
    
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    if (contenedor) {
        contenedor.innerHTML = `
            <div class="error-habitaciones">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Error al cargar las habitaciones</p>
                <button onclick="cargarHabitacionesDisponibles()" class="btn-reintentar">
                    <i class="fas fa-redo"></i> Reintentar
                </button>
            </div>
        `;
    }
}

// Función para reservar habitación
function reservarHabitacion(roomId) {
    // Redirigir a la página de reservación con el ID de la habitación
    window.location.href = `reservacion.html?room_id=${roomId}`;
}

// Función para configurar enlaces según el tipo de usuario
function configurarEnlacesUsuario(usuario) {
    const tipo = usuario.tipo || 'cliente';
    
    // Buscar enlaces y configurarlos
    const enlaces = document.querySelectorAll('.btn-principal');
    
    enlaces.forEach(enlace => {
        const texto = enlace.textContent.trim();
        
        if (texto.includes('Ver Habitaciones')) {
            enlace.href = 'habitaciones.html';
        } else if (texto.includes('Hacer Reserva')) {
            enlace.href = 'reservas.html';
        } else if (texto.includes('Gestionar Habitaciones') && tipo === 'admin') {
            enlace.href = 'admin/habitaciones.html';
        }
    });
}

// Función para cerrar sesión
function cerrarSesion() {
    Swal.fire({
        title: '¿Cerrar sesión?',
        text: '¿Estás seguro de que quieres cerrar sesión?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Limpiar datos de sesión
            localStorage.removeItem('usuario');
            
            // Mostrar mensaje de éxito
            Swal.fire({
                title: '¡Sesión cerrada!',
                text: 'Has cerrado sesión exitosamente',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            }).then(() => {
                // Redirigir al login
                window.location.href = 'index.html';
            });
        }
    });
}

// Función para obtener información del usuario actual
function obtenerUsuarioActual() {
    return JSON.parse(localStorage.getItem('usuario'));
}

// Función para verificar si el usuario es administrador
function esAdministrador() {
    const usuario = obtenerUsuarioActual();
    return usuario && usuario.tipo === 'admin';
}

// Función para mostrar mensaje de bienvenida personalizado
function mostrarBienvenida() {
    const usuario = obtenerUsuarioActual();
    if (usuario) {
        const hora = new Date().getHours();
        let saludo = '';
        
        if (hora < 12) {
            saludo = 'Buenos días';
        } else if (hora < 18) {
            saludo = 'Buenas tardes';
        } else {
            saludo = 'Buenas noches';
        }
        
        // Actualizar el mensaje de bienvenida si existe el elemento
        const welcomeElement = document.getElementById('welcome-message');
        if (welcomeElement) {
            welcomeElement.textContent = `${saludo}, ${usuario.nombre}!`;
        }
    }
}

// Función para manejar errores de sesión
function manejarErrorSesion() {
    Swal.fire({
        title: 'Error de sesión',
        text: 'Tu sesión ha expirado o no es válida',
        icon: 'error',
        confirmButtonColor: '#667eea'
    }).then(() => {
        localStorage.removeItem('usuario');
        window.location.href = 'index.html';
    });
}

// Función para verificar si el usuario tiene una reservación activa
async function verificarReservacionActiva() {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const response = await fetch(`php/reservaciones/obtener_reservacion_actual.php?user_id=${usuario.id}`);
        const data = await response.json();
        
        if (data.success) {
            mostrarEnlaceMinibar();
        }
    } catch (error) {
        console.error('Error al verificar reservación activa:', error);
    }
}

// Función para mostrar el enlace al minibar
function mostrarEnlaceMinibar() {
    // Buscar el contenedor de enlaces o crear uno si no existe
    let enlacesContainer = document.querySelector('.enlaces-usuario');
    
    if (!enlacesContainer) {
        // Crear contenedor de enlaces si no existe
        const mainContent = document.querySelector('.main-content') || document.querySelector('.container');
        if (mainContent) {
            enlacesContainer = document.createElement('div');
            enlacesContainer.className = 'enlaces-usuario';
            enlacesContainer.style.cssText = `
                background: white;
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 30px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                text-align: center;
            `;
            mainContent.insertBefore(enlacesContainer, mainContent.firstChild);
        }
    }
    
    if (enlacesContainer) {
        enlacesContainer.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #333;">
                <i class="fas fa-glass-martini-alt"></i> ¡Tienes una reservación activa!
            </h3>
            <p style="margin: 0 0 20px 0; color: #666;">
                Accede a nuestro minibar y gestiona tu reservación
            </p>
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <a href="minibar.html" class="btn-principal" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: transform 0.3s ease;
                ">
                    <i class="fas fa-shopping-cart"></i>
                    Ir al Minibar
                </a>
                <a href="terminar_reservacion.html" class="btn-principal" style="
                    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
                    color: white;
                    text-decoration: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-weight: 600;
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    transition: transform 0.3s ease;
                ">
                    <i class="fas fa-check-circle"></i>
                    Terminar Reservación
                </a>
            </div>
        `;
        
        // Agregar efecto hover a los botones
        const botones = enlacesContainer.querySelectorAll('.btn-principal');
        botones.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
            });
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
    }
}

// Exportar funciones para uso global
window.paginaprincipal = {
    verificarSesion,
    cargarInformacionUsuario,
    cargarHabitacionesDisponibles,
    cerrarSesion,
    obtenerUsuarioActual,
    esAdministrador,
    mostrarBienvenida,
    manejarErrorSesion,
    reservarHabitacion
}; 