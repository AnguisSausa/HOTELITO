// Variables globales
let habitaciones = [];
let habitacionEditando = null;
let habitacionAEliminar = null;

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando aplicación...');
    cargarHabitaciones();
    configurarFormulario();
    configurarBusqueda();
    configurarEventListeners();
});

// Configurar todos los event listeners
function configurarEventListeners() {
    console.log('Configurando event listeners...');
    
    // Botón nueva habitación
    const btnNueva = document.getElementById('btnNuevaHabitacion');
    if (btnNueva) {
        btnNueva.addEventListener('click', function() {
            console.log('Botón nueva habitación clickeado');
            mostrarFormulario();
        });
    } else {
        console.error('No se encontró el botón nueva habitación');
    }
    
    // Botones del formulario
    const btnCerrar = document.getElementById('btnCerrarFormulario');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', function() {
            console.log('Botón cerrar formulario clickeado');
            ocultarFormulario();
        });
    }
    
    const btnCancelar = document.getElementById('btnCancelarFormulario');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            console.log('Botón cancelar formulario clickeado');
            ocultarFormulario();
        });
    }
    
    // Botones del modal
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModal);
    }
    
    const btnCancelarEliminar = document.getElementById('btnCancelarEliminar');
    if (btnCancelarEliminar) {
        btnCancelarEliminar.addEventListener('click', cerrarModal);
    }
    
    const btnConfirmarEliminar = document.getElementById('btnConfirmarEliminar');
    if (btnConfirmarEliminar) {
        btnConfirmarEliminar.addEventListener('click', confirmarEliminar);
    }
    
    // Input de imagen
    const inputImagen = document.getElementById('imagen');
    if (inputImagen) {
        inputImagen.addEventListener('change', function() {
            console.log('Imagen seleccionada');
            previsualizarImagen(this);
        });
    }
}

// Cargar todas las habitaciones
async function cargarHabitaciones() {
    try {
        console.log('Cargando habitaciones...');
        mostrarLoading(true);
        
        const response = await fetch('php/admin/habitaciones.php');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        if (data.success) {
            habitaciones = data.data;
            mostrarHabitaciones(habitaciones);
        } else {
            mostrarMensaje('Error al cargar habitaciones: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión al cargar habitaciones', 'error');
    } finally {
        mostrarLoading(false);
    }
}

// Mostrar habitaciones en la tabla
function mostrarHabitaciones(habitacionesAMostrar) {
    console.log('Mostrando habitaciones:', habitacionesAMostrar.length);
    const tbody = document.getElementById('habitacionesTableBody');
    const tabla = document.getElementById('habitacionesTable');
    const noData = document.getElementById('noDataMessage');
    
    if (habitacionesAMostrar.length === 0) {
        tabla.style.display = 'none';
        noData.style.display = 'block';
        return;
    }
    
    tabla.style.display = 'table';
    noData.style.display = 'none';
    
    tbody.innerHTML = '';
    
    habitacionesAMostrar.forEach(habitacion => {
        const row = document.createElement('tr');
        
        // Determinar clase de estado
        let statusClass = '';
        switch(habitacion.status.toLowerCase()) {
            case 'disponible':
                statusClass = 'status-disponible';
                break;
            case 'ocupada':
                statusClass = 'status-ocupada';
                break;
            case 'mantenimiento':
                statusClass = 'status-mantenimiento';
                break;
        }
        
        // Crear imagen o placeholder
        let imagenHTML = '';
        if (habitacion.imagen) {
            imagenHTML = `<img src="${habitacion.imagen}" alt="Habitación ${habitacion.room_number}" class="room-image">`;
        } else {
            imagenHTML = `<div class="no-image">Sin imagen</div>`;
        }
        
        row.innerHTML = `
            <td><strong>${habitacion.room_number}</strong></td>
            <td>${habitacion.room_type}</td>
            <td>${habitacion.description}</td>
            <td>${habitacion.capacity} personas</td>
            <td>$${parseFloat(habitacion.precio_noche).toFixed(2)}</td>
            <td><span class="status-badge ${statusClass}">${habitacion.status}</span></td>
            <td>${imagenHTML}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-room-id="${habitacion.room_id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" data-room-id="${habitacion.room_id}" data-room-number="${habitacion.room_number}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Agregar event listeners a los botones de acción
    agregarEventListenersAcciones();
}

// Agregar event listeners a los botones de acción
function agregarEventListenersAcciones() {
    console.log('Agregando event listeners a botones de acción...');
    
    // Botones editar
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const roomId = this.getAttribute('data-room-id');
            console.log('Editando habitación ID:', roomId);
            editarHabitacion(roomId);
        });
    });
    
    // Botones eliminar
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const roomId = this.getAttribute('data-room-id');
            const roomNumber = this.getAttribute('data-room-number');
            console.log('Eliminando habitación ID:', roomId, 'Número:', roomNumber);
            eliminarHabitacion(roomId, roomNumber);
        });
    });
}

// Mostrar/ocultar loading
function mostrarLoading(mostrar) {
    const loading = document.getElementById('loadingMessage');
    const tabla = document.getElementById('habitacionesTable');
    const noData = document.getElementById('noDataMessage');
    
    if (mostrar) {
        loading.style.display = 'block';
        tabla.style.display = 'none';
        noData.style.display = 'none';
    } else {
        loading.style.display = 'none';
    }
}

// Configurar formulario
function configurarFormulario() {
    console.log('Configurando formulario...');
    const form = document.getElementById('habitacionFormElement');
    
    if (!form) {
        console.error('No se encontró el formulario');
        return;
    }
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Formulario enviado');
        
        const formData = new FormData(form);
        
        // Asegurar que el room_id se envíe correctamente cuando se está editando
        if (habitacionEditando) {
            formData.set('room_id', habitacionEditando.room_id);
            console.log('Editando habitación ID:', habitacionEditando.room_id);
        } else {
            console.log('Creando nueva habitación');
        }
        
        // Log de los datos que se van a enviar
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }
        
        try {
            const response = await fetch('php/admin/habitaciones.php', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (data.success) {
                mostrarMensaje(data.message, 'success');
                ocultarFormulario();
                limpiarFormulario();
                await cargarHabitaciones();
            } else {
                mostrarMensaje(data.message, 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión al guardar habitación', 'error');
        }
    });
}

// Configurar búsqueda
function configurarBusqueda() {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const filterStatus = document.getElementById('filterStatus');
    
    // Agregar event listeners para búsqueda en tiempo real
    searchInput.addEventListener('input', filtrarHabitaciones);
    filterType.addEventListener('change', filtrarHabitaciones);
    filterStatus.addEventListener('change', filtrarHabitaciones);
}

// Mostrar formulario para nueva habitación
function mostrarFormulario() {
    console.log('Mostrando formulario para nueva habitación');
    habitacionEditando = null;
    document.getElementById('formTitle').textContent = 'Nueva Habitación';
    document.getElementById('habitacionForm').style.display = 'block';
    limpiarFormulario();
}

// Ocultar formulario
function ocultarFormulario() {
    console.log('Ocultando formulario');
    document.getElementById('habitacionForm').style.display = 'none';
    habitacionEditando = null;
}

// Limpiar formulario
function limpiarFormulario() {
    console.log('Limpiando formulario');
    document.getElementById('habitacionFormElement').reset();
    document.getElementById('room_id').value = '';
    document.getElementById('imagenPreview').innerHTML = '';
}

// Editar habitación
async function editarHabitacion(roomId) {
    try {
        console.log('Cargando datos de habitación ID:', roomId);
        const response = await fetch(`php/admin/habitaciones.php?action=obtener_una&room_id=${roomId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Datos de habitación:', data);
        
        if (data.success) {
            habitacionEditando = data.data;
            llenarFormulario(habitacionEditando);
            document.getElementById('formTitle').textContent = 'Editar Habitación';
            document.getElementById('habitacionForm').style.display = 'block';
        } else {
            mostrarMensaje(data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error al cargar datos de la habitación', 'error');
    }
}

// Llenar formulario con datos de habitación
function llenarFormulario(habitacion) {
    console.log('Llenando formulario con datos:', habitacion);
    document.getElementById('room_id').value = habitacion.room_id;
    document.getElementById('room_number').value = habitacion.room_number;
    document.getElementById('room_type').value = habitacion.room_type;
    document.getElementById('description').value = habitacion.description;
    document.getElementById('capacity').value = habitacion.capacity;
    document.getElementById('precio_noche').value = habitacion.precio_noche;
    document.getElementById('status').value = habitacion.status;
    
    // Mostrar imagen si existe
    const preview = document.getElementById('imagenPreview');
    if (habitacion.imagen) {
        preview.innerHTML = `<img src="${habitacion.imagen}" alt="Imagen actual">`;
    } else {
        preview.innerHTML = '';
    }
}

// Previsualizar imagen
function previsualizarImagen(input) {
    const preview = document.getElementById('imagenPreview');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
        };
        
        reader.readAsDataURL(input.files[0]);
    } else {
        preview.innerHTML = '';
    }
}

// Eliminar habitación
function eliminarHabitacion(roomId, roomNumber) {
    habitacionAEliminar = { id: roomId, number: roomNumber };
    document.getElementById('deleteRoomNumber').textContent = roomNumber;
    document.getElementById('deleteModal').style.display = 'flex';
}

// Confirmar eliminación
async function confirmarEliminar() {
    if (!habitacionAEliminar) return;
    
    try {
        const response = await fetch('php/admin/habitaciones.php?action=eliminar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                room_id: habitacionAEliminar.id
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            mostrarMensaje(data.message, 'success');
            cerrarModal();
            await cargarHabitaciones();
        } else {
            mostrarMensaje(data.message, 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarMensaje('Error de conexión al eliminar habitación', 'error');
    }
}

// Cerrar modal
function cerrarModal() {
    document.getElementById('deleteModal').style.display = 'none';
    habitacionAEliminar = null;
}

// Filtrar habitaciones
function filtrarHabitaciones() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const filterType = document.getElementById('filterType').value;
    const filterStatus = document.getElementById('filterStatus').value;
    
    const habitacionesFiltradas = habitaciones.filter(habitacion => {
        // Búsqueda por texto
        const matchesSearch = searchTerm === '' || 
            habitacion.room_number.toString().includes(searchTerm) ||
            habitacion.room_type.toLowerCase().includes(searchTerm) ||
            habitacion.description.toLowerCase().includes(searchTerm) ||
            habitacion.status.toLowerCase().includes(searchTerm);
        
        // Filtro por tipo
        const matchesType = filterType === '' || habitacion.room_type === filterType;
        
        // Filtro por estado
        const matchesStatus = filterStatus === '' || habitacion.status === filterStatus;
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    mostrarHabitaciones(habitacionesFiltradas);
}

// Mostrar mensajes
function mostrarMensaje(mensaje, tipo) {
    // Crear elemento de mensaje
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje mensaje-${tipo}`;
    mensajeDiv.innerHTML = `
        <div class="mensaje-contenido">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${mensaje}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="mensaje-cerrar">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Agregar estilos al mensaje
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#d4edda' : '#f8d7da'};
        color: ${tipo === 'success' ? '#155724' : '#721c24'};
        border: 1px solid ${tipo === 'success' ? '#c3e6cb' : '#f5c6cb'};
        border-radius: 8px;
        padding: 1rem;
        z-index: 1001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    // Agregar estilos para el contenido del mensaje
    const contenido = mensajeDiv.querySelector('.mensaje-contenido');
    contenido.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
    `;
    
    // Agregar estilos para el botón de cerrar
    const cerrarBtn = mensajeDiv.querySelector('.mensaje-cerrar');
    cerrarBtn.style.cssText = `
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        font-size: 1rem;
    `;
    
    // Agregar CSS para la animación
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Agregar al DOM
    document.body.appendChild(mensajeDiv);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (mensajeDiv.parentElement) {
            mensajeDiv.remove();
        }
    }, 5000);
} 