let usuariosGlobal = [];

// Cargar y mostrar usuarios
async function cargarUsuarios() {
    const response = await fetch('php/usuario/usuarios_api.php?action=listar');
    const data = await response.json();
    usuariosGlobal = data.success && Array.isArray(data.usuarios) ? data.usuarios : [];
    renderUsuarios(usuariosGlobal);
}

function renderUsuarios(usuarios) {
    const tbody = document.querySelector('#tabla-usuarios tbody');
    tbody.innerHTML = '';
    if (usuarios.length > 0) {
        usuarios.forEach(usuario => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.nombre_usuario}</td>
                <td>${usuario.email}</td>
                <td>${usuario.es_admin === 'admin' ? '<span class="badge-admin">Admin</span>' : 'Cliente'}</td>
                <td>
                    <button class="btn-eliminar" onclick="eliminarUsuario(${usuario.id})"><i class="fas fa-trash"></i> Eliminar</button>
                    ${usuario.es_admin !== 'admin' ? `<button class="btn-admin" onclick="hacerAdmin(${usuario.id})"><i class='fas fa-user-shield'></i> Hacer Admin</button>` : ''}
                </td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = '<tr><td colspan="5">No hay usuarios registrados</td></tr>';
    }
}

// Búsqueda en tiempo real
const inputBusqueda = document.getElementById('busqueda-usuario');
if (inputBusqueda) {
    inputBusqueda.addEventListener('input', function() {
        const valor = this.value.toLowerCase();
        const filtrados = usuariosGlobal.filter(u =>
            u.nombre_usuario.toLowerCase().includes(valor) ||
            u.email.toLowerCase().includes(valor)
        );
        renderUsuarios(filtrados);
    });
}

// Eliminar usuario
async function eliminarUsuario(id) {
    if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
    const response = await fetch('php/usuario/usuarios_api.php?action=eliminar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    const data = await response.json();
    if (data.success) {
        alert('Usuario eliminado correctamente');
        cargarUsuarios();
    } else {
        alert(data.error || 'Error al eliminar usuario');
    }
}

// Convertir usuario en admin
async function hacerAdmin(id) {
    if (!confirm('¿Seguro que deseas convertir este usuario en admin?')) return;
    const response = await fetch('php/usuario/usuarios_api.php?action=admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    });
    const data = await response.json();
    if (data.success) {
        alert('Usuario actualizado a admin');
        cargarUsuarios();
    } else {
        alert(data.error || 'Error al actualizar usuario');
    }
}

document.addEventListener('DOMContentLoaded', cargarUsuarios); 