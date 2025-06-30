// Variables globales
let carrito = [];
let productos = [];

// Inicializar la página
// Solo cargar productos del minibar

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProductos();
    renderCarrito();
    document.getElementById('btn-pagar').addEventListener('click', mostrarPago);
    document.getElementById('btn-calcular-cambio').addEventListener('click', calcularCambio);
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
            <div class="product-name">${producto.nombre}</div>
            <div class="product-description">${producto.descripcion || ''}</div>
            <div class="product-category"><span>${producto.categoria || ''}</span></div>
            <div class="product-price">$${parseFloat(producto.precio).toFixed(2)}</div>
            <div class="add-cart-row">
                <input type="number" min="1" max="${producto.stock}" value="1" id="qty-${producto.id || producto.item_id}">
                <button class="btn-agregar" onclick="agregarAlCarrito(${producto.id || producto.item_id})">Agregar</button>
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
    const producto = productos.find(p => p.id == productoId || p.item_id == productoId);
    if (!producto) return;
    const qtyInput = document.getElementById(`qty-${producto.id || producto.item_id}`);
    let cantidad = parseInt(qtyInput.value);
    if (isNaN(cantidad) || cantidad < 1) cantidad = 1;
    // Verificar stock
    if (cantidad > producto.stock) cantidad = producto.stock;
    // Si ya está en el carrito, suma cantidad
    const idx = carrito.findIndex(item => item.id == productoId);
    if (idx >= 0) {
        carrito[idx].cantidad += cantidad;
        if (carrito[idx].cantidad > producto.stock) carrito[idx].cantidad = producto.stock;
    } else {
        carrito.push({
            id: producto.id || producto.item_id,
            nombre: producto.nombre || producto.name,
            precio: producto.precio || producto.price,
            cantidad: cantidad
        });
    }
    renderCarrito();
}

function renderCarrito() {
    const lista = document.getElementById('carrito-lista');
    const totalDiv = document.getElementById('carrito-total');
    lista.innerHTML = '';
    let total = 0;
    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        lista.innerHTML += `<li>${item.nombre} x${item.cantidad} <span>$${subtotal.toFixed(2)}</span></li>`;
    });
    totalDiv.textContent = `Total: $${total.toFixed(2)}`;
}

function mostrarPago() {
    document.getElementById('pago-section').style.display = 'block';
    document.getElementById('btn-pagar').style.display = 'none';
}

function calcularCambio() {
    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    const pagado = parseFloat(document.getElementById('monto-pagado').value);
    const cambioDiv = document.getElementById('cambio');
    if (isNaN(pagado) || pagado < total) {
        cambioDiv.textContent = 'El monto pagado es insuficiente.';
        cambioDiv.style.color = '#e53e3e';
        return;
    }
    const cambio = pagado - total;
    cambioDiv.textContent = `Cambio: $${cambio.toFixed(2)}`;
    cambioDiv.style.color = '#059669';

    // Guardar en localStorage
    localStorage.setItem('minibar_total', total.toFixed(2));
    localStorage.setItem('minibar_pago', pagado.toFixed(2));
    localStorage.setItem('minibar_cambio', cambio.toFixed(2));

    // Guardar historial acumulativo de compras
    let historial = JSON.parse(localStorage.getItem('minibar_historial')) || [];
    historial.push(total);
    localStorage.setItem('minibar_historial', JSON.stringify(historial));

    // SweetAlert para preguntar si quiere comprar algo más
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            title: '¿Deseas comprar algo más?',
            text: `Total: $${total.toFixed(2)} | Pagado: $${pagado.toFixed(2)} | Cambio: $${cambio.toFixed(2)}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, seguir comprando',
            cancelButtonText: 'No, terminar',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#667eea'
        }).then((result) => {
            if (result.isConfirmed) {
                // Seguir en minibar
                document.getElementById('pago-section').style.display = 'none';
                document.getElementById('btn-pagar').style.display = 'block';
                document.getElementById('monto-pagado').value = '';
                document.getElementById('cambio').textContent = '';
                carrito = [];
                renderCarrito();
            } else {
                // Ir a miestancia.html
                window.location.href = 'miestancia.html';
            }
        });
    } else {
        if (confirm('¿Deseas comprar algo más?')) {
            document.getElementById('pago-section').style.display = 'none';
            document.getElementById('btn-pagar').style.display = 'block';
            document.getElementById('monto-pagado').value = '';
            document.getElementById('cambio').textContent = '';
            carrito = [];
            renderCarrito();
        } else {
            window.location.href = 'miestancia.html';
        }
    }
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
                renderCarrito();
                
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