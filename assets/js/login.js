document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const mensajeDiv = document.getElementById('mensaje');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener datos del formulario
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        // Validaciones
        const errores = [];
        
        if (empty(email)) {
            errores.push('El email es requerido');
        } else if (!isValidEmail(email)) {
            errores.push('El email no es válido');
        }
        
        if (empty(password)) {
            errores.push('La contraseña es requerida');
        } else if (password.length < 6) {
            errores.push('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Si hay errores, mostrarlos
        if (errores.length > 0) {
            mostrarMensaje(errores.join('<br>'), 'error');
            return;
        }
        
        // Mostrar mensaje de carga
        mostrarMensaje('Iniciando sesión...', 'info');
        
        // Deshabilitar botón
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando...';
        
        // Preparar datos para enviar
        const datos = {
            email: email,
            password: password
        };
        
        // Enviar datos al servidor
        fetch('php/usuario/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                mostrarMensaje(data.mensaje, 'success');
                // Redirigir después de un breve delay
                setTimeout(() => {
                    window.location.href = 'dashboard.html'; // O la página que desees
                }, 1500);
            } else {
                mostrarMensaje(data.error, 'error');
                // Habilitar botón nuevamente
                submitBtn.disabled = false;
                submitBtn.textContent = 'Iniciar Sesión';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            mostrarMensaje('Error de conexión. Intenta nuevamente.', 'error');
            // Habilitar botón nuevamente
            submitBtn.disabled = false;
            submitBtn.textContent = 'Iniciar Sesión';
        });
    });
    
    // Función para mostrar mensajes
    function mostrarMensaje(mensaje, tipo) {
        mensajeDiv.innerHTML = mensaje;
        mensajeDiv.className = `mensaje ${tipo}`;
        mensajeDiv.style.display = 'block';
        
        // Ocultar mensaje después de 5 segundos (excepto para éxito)
        if (tipo !== 'success') {
            setTimeout(() => {
                mensajeDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    // Función para validar email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Función para verificar si está vacío
    function empty(value) {
        return value === null || value === undefined || value.trim() === '';
    }
}); 