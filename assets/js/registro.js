const esEmailValido = email => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
};

const esPasswordValido = password => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

// Función para mostrar/ocultar contraseña
function togglePassword() {
    const passwordInput = document.getElementById('rpassword');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Función para preview de imagen
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('rimagen').addEventListener('change', function(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('previewImagen');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 10px;">`;
            };
            reader.readAsDataURL(file);
        } else {
            preview.innerHTML = '';
        }
    });
});

// Registro
const crearCuenta = async () => {
    let email = document.querySelector("#remail").value;
    let password = document.querySelector("#rpassword").value;
    let nombre = document.querySelector("#rnombre").value;
    let imagenInput = document.querySelector('#rimagen');

    if(!esEmailValido(email)){
        Swal.fire({ title: "Error!", text:"Email incorrecto", icon: "error"});
        return;
    }
    if (!esPasswordValido(password)) {
        Swal.fire({ title: "ERROR!", text: "Password incorrecto! Debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo", icon: "error" });
        return;
    }
    if (nombre.trim() === "") {
        Swal.fire({ title: "ERROR!", text: "Falta nombre", icon: "error" });
        return;
    }

    // Procesar imagen
    let imagenBase64 = null;
    if (imagenInput.files && imagenInput.files[0]) {
        imagenBase64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(imagenInput.files[0]);
        });
    } else {
        // Si no hay imagen, se envía la ruta por defecto
        imagenBase64 = 'assets/img/usuario.jpg';
    }

    let usuario = {email, password, nombre, imagen: imagenBase64};

    try {
        const response = await fetch('php/usuario/registrar_usuario.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();

        if (data.success) {
            // Guardar usuario en localStorage
            localStorage.setItem('usuario', JSON.stringify({
                nombre: nombre,
                email: email,
                fotoPerfil: imagenBase64
            }));
            Swal.fire({ title: "EXITO!", text: "SE CREO CORRECTAMENTE!!!", icon: "success"});
            setTimeout(function() {
                window.location.href = "index.html";
            }, 1000);
        } else {
            Swal.fire('Error', data.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Hubo un problema al conectar con el servidor', 'error');
        console.error('Error:', error);
    }
} 