// Variables globales
let carrito = [];
let productos = [];

// Inicializar la página
// Solo cargar productos del minibar

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductos();
});

// Cargar productos del minibar
async function cargarProductos() {
    try {
        const response = await fetch('php/minibar/obtener_productos.php');
        const data = await response.json();
        if (data.success) {
            productos = data.productos;
            mostrarProductos();
        } else {
            mostrarError('Error al cargar los productos del minibar');
        }
    } catch (error) {
        mostrarError('Error de conexión al cargar productos');
    }
}

// Mostrar productos en el grid
function mostrarProductos() {
    const gridContainer = document.getElementById('productos-grid');
    if (!gridContainer) return;
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
    if (!cartItems || !cartTotal || !checkoutBtn) return;
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
    
    document.getElementById('subtotal') && (document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`);
    document.getElementById('total') && (document.getElementById('total').textContent = `$${subtotal.toFixed(2)}`);
    
    cartTotal.style.display = 'block';
    checkoutBtn.disabled = false;
}

// Configurar eventos
function configurarEventos() {
    const btnCarrito = document.querySelector('.btn-carrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', () => {
            // Lógica para mostrar el carrito
        });
    }
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', finalizarCompra);
    }
}

// Finalizar compra
async function finalizarCompra() {
    if (carrito.length === 0) return;
    
    try {
        const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        
        const datosCompra = {
            productos: carrito,
            subtotal_minibar: subtotal
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
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: 'Error',
            text: mensaje,
            icon: 'error',
            confirmButtonColor: '#667eea'
        });
    } else {
        alert(mensaje);
    }
} 