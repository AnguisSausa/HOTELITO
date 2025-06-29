// Variables globales
let imagenBase64 = '';

// Funciones de utilidad
function mostrarMensaje(mensaje, tipo) {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = `mensaje ${tipo}`;
    mensajeDiv.style.display = 'block';
    
    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
        mensajeDiv.style.display = 'none';
    }, 5000);
}

function limpiarMensaje() {
    const mensajeDiv = document.getElementById('mensaje');
    mensajeDiv.style.display = 'none';
}

function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

function toggleRegPassword() {
    const passwordInput = document.getElementById('regPassword');
    const toggleBtn = document.querySelectorAll('.toggle-password i')[1];
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

function mostrarRegistro() {
    document.getElementById('registroContainer').style.display = 'flex';
    limpiarMensaje();
}

function ocultarRegistro() {
    document.getElementById('registroContainer').style.display = 'none';
    document.getElementById('registroForm').reset();
    document.getElementById('previewImagen').innerHTML = '';
    imagenBase64 = '';
    limpiarMensaje();
}

// Convertir imagen a base64
function convertirImagenABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            resolve(e.target.result);
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

// Preview de imagen
document.getElementById('regImagen').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    const previewDiv = document.getElementById('previewImagen');
    
    if (file) {
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            mostrarMensaje('Por favor selecciona un archivo de imagen válido', 'error');
            this.value = '';
            previewDiv.innerHTML = '';
            return;
        }
        
        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            mostrarMensaje('La imagen debe ser menor a 5MB', 'error');
            this.value = '';
            previewDiv.innerHTML = '';
            return;
        }
        
        try {
            imagenBase64 = await convertirImagenABase64(file);
            previewDiv.innerHTML = `<img src="${imagenBase64}" alt="Preview">`;
        } catch (error) {
            mostrarMensaje('Error al procesar la imagen', 'error');
        }
    } else {
        previewDiv.innerHTML = '';
        imagenBase64 = '';
    }
});

// Validaciones en tiempo real
document.getElementById('regTelefono').addEventListener('input', function(e) {
    // Solo permitir números
    this.value = this.value.replace(/\D/g, '');
    
    // Limitar a 10 dígitos
    if (this.value.length > 10) {
        this.value = this.value.slice(0, 10);
    }
});

// Formulario de login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    
    // Validaciones básicas
    if (!email || !password) {
        mostrarMensaje('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (!isValidEmail(email)) {
        mostrarMensaje('Por favor ingresa un email válido', 'error');
        return;
    }
    
    // Mostrar loading
    const submitBtn = this.querySelector('.btn-login');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('php/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarMensaje(data.mensaje, 'success');
            // Redirigir después de 2 segundos
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
        } else {
            mostrarMensaje(data.error, 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Formulario de registro
document.getElementById('registroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('regNombre').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const telefono = document.getElementById('regTelefono').value.trim();
    const esAdmin = document.getElementById('regEsAdmin').checked ? 1 : 0;
    
    // Validaciones
    const errores = [];
    
    if (!nombre || nombre.length < 2) {
        errores.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!isValidEmail(email)) {
        errores.push('El email no es válido');
    }
    
    if (!password || password.length < 6) {
        errores.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (!telefono || telefono.length !== 10) {
        errores.push('El teléfono debe tener exactamente 10 dígitos');
    }
    
    if (errores.length > 0) {
        mostrarMensaje(errores.join(', '), 'error');
        return;
    }
    
    // Mostrar loading
    const submitBtn = this.querySelector('.btn-registro');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('php/registrar_usuario.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: nombre,
                email: email,
                password: password,
                telefono: telefono,
                es_admin: esAdmin,
                imagen: imagenBase64
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarMensaje(data.mensaje, 'success');
            // Limpiar formulario y cerrar modal después de 2 segundos
            setTimeout(() => {
                this.reset();
                document.getElementById('previewImagen').innerHTML = '';
                imagenBase64 = '';
                ocultarRegistro();
            }, 2000);
        } else {
            if (Array.isArray(data.error)) {
                mostrarMensaje(data.error.join(', '), 'error');
            } else {
                mostrarMensaje(data.error, 'error');
            }
        }
    } catch (error) {
        mostrarMensaje('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Cerrar modal al hacer clic fuera de él
document.getElementById('registroContainer').addEventListener('click', function(e) {
    if (e.target === this) {
        ocultarRegistro();
    }
});

// Cerrar modal con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        ocultarRegistro();
    }
});

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema de login HOTELITO cargado');
    
    // Limpiar mensajes al cargar
    limpiarMensaje();
    
    // Enfocar en el primer campo
    document.getElementById('email').focus();
}); 