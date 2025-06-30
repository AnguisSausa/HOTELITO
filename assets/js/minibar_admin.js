document.addEventListener('DOMContentLoaded', () => {
    cargarProductos();
    document.getElementById('btnAgregar').addEventListener('click', mostrarModalAgregar);
    document.getElementById('btnCancelar').addEventListener('click', cerrarModal);
    document.getElementById('imagen').addEventListener('change', previewImagen);
    document.getElementById('formProducto').addEventListener('submit', guardarProducto);
});

let productosCache = [];
let imagenBase64 = '';

function cargarProductos() {
    fetch('php/minibar/minibar_admin_api.php?action=list')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                productosCache = data.productos;
                renderTabla(data.productos);
            } else {
                document.getElementById('tabla-productos').innerHTML = '<p style="color:red">Error al cargar productos</p>';
            }
        })
        .catch(() => {
            document.getElementById('tabla-productos').innerHTML = '<p style="color:red">Error de conexión</p>';
        });
}

function renderTabla(productos) {
    let html = `<table><thead><tr>
        <th>ID</th><th>Nombre</th><th>Descripción</th><th>Precio</th><th>Stock</th><th>Categoría</th><th>Imagen</th><th>Acciones</th>
    </tr></thead><tbody>`;
    for (const p of productos) {
        html += `<tr>
            <td>${p.item_id}</td>
            <td>${p.name}</td>
            <td>${p.description}</td>
            <td>$${parseFloat(p.price).toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>${p.category || ''}</td>
            <td>${p.imagen ? `<img src="${p.imagen}" alt="img">` : ''}</td>
            <td class="crud-actions">
                <button title="Editar" onclick="editarProducto(${p.item_id})"><i class="fa fa-edit"></i></button>
                <button title="Eliminar" onclick="eliminarProducto(${p.item_id})"><i class="fa fa-trash"></i></button>
            </td>
        </tr>`;
    }
    html += '</tbody></table>';
    document.getElementById('tabla-productos').innerHTML = html;
}

function mostrarModalAgregar() {
    document.getElementById('formProducto').reset();
    document.getElementById('item_id').value = '';
    document.getElementById('modal-titulo').textContent = 'Agregar producto';
    imagenBase64 = '';
    document.getElementById('modal-bg').style.display = 'flex';
    mostrarPreviewImagen('');
}

function cerrarModal() {
    document.getElementById('modal-bg').style.display = 'none';
}

function editarProducto(id) {
    const prod = productosCache.find(p => p.item_id == id);
    if (!prod) return;
    document.getElementById('item_id').value = prod.item_id;
    document.getElementById('name').value = prod.name;
    document.getElementById('description').value = prod.description;
    document.getElementById('price').value = prod.price;
    document.getElementById('stock').value = prod.stock;
    document.getElementById('category').value = prod.category || '';
    imagenBase64 = prod.imagen || '';
    document.getElementById('modal-titulo').textContent = 'Editar producto';
    document.getElementById('modal-bg').style.display = 'flex';
    mostrarPreviewImagen(imagenBase64);
}

function previewImagen(e) {
    const file = e.target.files[0];
    if (!file) return mostrarPreviewImagen(imagenBase64);
    const reader = new FileReader();
    reader.onload = function(evt) {
        imagenBase64 = evt.target.result;
        mostrarPreviewImagen(imagenBase64);
    };
    reader.readAsDataURL(file);
}

function mostrarPreviewImagen(src) {
    let preview = document.getElementById('preview-img');
    if (!preview) {
        preview = document.createElement('img');
        preview.id = 'preview-img';
        preview.style.maxWidth = '80px';
        preview.style.maxHeight = '80px';
        preview.style.marginTop = '6px';
        document.getElementById('imagen').parentNode.appendChild(preview);
    }
    preview.src = src || '';
    preview.style.display = src ? 'block' : 'none';
}

function guardarProducto(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        action: form.item_id.value ? 'edit' : 'add',
        item_id: form.item_id.value,
        name: form.name.value,
        description: form.description.value,
        price: form.price.value,
        stock: form.stock.value,
        category: form.category.value,
        imagen: imagenBase64
    };
    fetch('php/minibar/minibar_admin_api.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(resp => {
        if (resp.success) {
            cerrarModal();
            cargarProductos();
        } else {
            alert('Error: ' + (resp.error || 'No se pudo guardar'));
        }
    })
    .catch(() => alert('Error de conexión al guardar producto'));
}

// eliminarProducto se implementará después 