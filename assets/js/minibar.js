// Variables globales
let carrito = [];
let productos = [];
let reservacionActual = null;
let precioHabitacion = 0;

// Inicializar la página
document.addEventListener('DOMContentLoaded', function() {
    verificarSesion();
    cargarReservacionActual();
    cargarProductos();
    configurarEventos();
});

// Verificar sesión del usuario
function verificarSesion() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        Swal.fire({
            title: 'Sesión no válida',
            text: 'Debes iniciar sesión para acceder al minibar',
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
            precioHabitacion = data.reservacion.total_precio;
            mostrarInformacionReservacion();
        } else {
            Swal.fire({
                title: 'Sin reservación activa',
                text: 'No tienes una reservación activa para acceder al minibar',
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
            <i class="fas fa-dollar-sign"></i>
            <span>Total habitación: $${reservacionActual.total_precio}</span>
        </div>
    `;
}

// Cargar productos del minibar
async function cargarProductos() {
    try {
        const response = await fetch('php/minibar/obtener_productos.php');
        const data = await response.json();
        
        if (data.success) {
            productos = data.productos;
            mostrarProductos();
        } else {
            console.error('Error al cargar productos:', data.message);
            mostrarError('Error al cargar los productos del minibar');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarError('Error de conexión al cargar productos');
    }
}

// Mostrar productos en el grid
function mostrarProductos() {
    const gridContainer = document.getElementById('products-grid');
    
    if (productos.length === 0) {
        gridContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <i class="fas fa-box-open" style="font-size: 3rem; color: #ccc; margin-bottom: 15px;"></i>
                <p>No hay productos disponibles en el minibar</p>
            </div>
        `;
        return;
    }
    
    const productosHTML = productos.map(producto => `
        <div class="product-card">
            <div class="product-image">
                ${producto.imagen ? 
                    `<img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; height: 100%; object-fit: cover;">` :
                    `<i class="fas fa-box"></i>`
                }
            </div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion || 'Sin descripción'}</p>
                <div class="product-category" style="margin-bottom: 10px;">
                    <span style="background: #667eea; color: white; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem;">
                        ${producto.categoria || 'Sin categoría'}
                    </span>
                </div>
                <div class="product-price">$${producto.precio}</div>
                <div class="product-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="cambiarCantidad(${producto.id}, -1)" disabled>-</button>
                        <span class="quantity-display" id="qty-${producto.id}">0</span>
                        <button class="quantity-btn" onclick="cambiarCantidad(${producto.id}, 1)">+</button>
                    </div>
                    <button class="add-to-cart-btn" onclick="agregarAlCarrito(${producto.id})" disabled>
                        <i class="fas fa-plus"></i> Agregar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    gridContainer.innerHTML = productosHTML;
}

// Cambiar cantidad de un producto
function cambiarCantidad(productoId, cambio) {
    const cantidadElement = document.getElementById(`qty-${productoId}`);
    const agregarBtn = cantidadElement.parentElement.nextElementSibling;
    let cantidad = parseInt(cantidadElement.textContent) + cambio;
    
    if (cantidad < 0) cantidad = 0;
    
    cantidadElement.textContent = cantidad;
    
    // Habilitar/deshabilitar botones
    const btnMenos = cantidadElement.previousElementSibling;
    const btnMas = cantidadElement.nextElementSibling;
    
    btnMenos.disabled = cantidad <= 0;
    agregarBtn.disabled = cantidad <= 0;
}

// Agregar producto al carrito
function agregarAlCarrito(productoId) {
    const cantidadElement = document.getElementById(`qty-${productoId}`);
    const cantidad = parseInt(cantidadElement.textContent);
    
    if (cantidad <= 0) return;
    
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.id === productoId);
    
    if (itemExistente) {
        itemExistente.cantidad += cantidad;
    } else {
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: cantidad
        });
    }
    
    // Resetear cantidad
    cantidadElement.textContent = '0';
    cantidadElement.previousElementSibling.disabled = true;
    cantidadElement.nextElementSibling.nextElementSibling.disabled = true;
    
    actualizarCarrito();
    
    Swal.fire({
        title: '¡Agregado al carrito!',
        text: `${cantidad} ${cantidad === 1 ? 'unidad' : 'unidades'} de ${producto.nombre}`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
    });
}

// Actualizar visualización del carrito
function actualizarCarrito() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (carrito.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        cartTotal.style.display = 'none';
        checkoutBtn.disabled = true;
        return;
    }
    
    // Mostrar items del carrito
    const itemsHTML = carrito.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.nombre}</div>
                <div class="cart-item-details">${item.cantidad} ${item.cantidad === 1 ? 'unidad' : 'unidades'}</div>
            </div>
            <div class="cart-item-price">$${(item.precio * item.cantidad).toFixed(2)}</div>
        </div>
    `).join('');
    
    cartItems.innerHTML = itemsHTML;
    
    // Calcular totales
    const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    const total = subtotal + precioHabitacion;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    cartTotal.style.display = 'block';
    checkoutBtn.disabled = false;
}

// Configurar eventos
function configurarEventos() {
    document.getElementById('checkout-btn').addEventListener('click', finalizarCompra);
}

// Finalizar compra
async function finalizarCompra() {
    if (carrito.length === 0) return;
    
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario'));
        const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        const total = subtotal + precioHabitacion;
        
        const datosCompra = {
            user_id: usuario.id,
            reservation_id: reservacionActual.reservation_id,
            productos: carrito,
            subtotal_minibar: subtotal,
            total_spend: total
        };
        
        const response = await fetch('php/minibar/finalizar_compra.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosCompra)
        });
        
        const data = await response.json();
        
        if (data.success) {
            Swal.fire({
                title: '¡Compra exitosa!',
                text: 'Tu pedido del minibar ha sido procesado correctamente',
                icon: 'success',
                confirmButtonColor: '#28a745'
            }).then(() => {
                // Limpiar carrito
                carrito = [];
                actualizarCarrito();
                
                // Redirigir a página principal
                window.location.href = 'paginaprincipal.html';
            });
        } else {
            mostrarError(data.message || 'Error al procesar la compra');
        }
    } catch (error) {
        console.error('Error al finalizar compra:', error);
        mostrarError('Error de conexión al procesar la compra');
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