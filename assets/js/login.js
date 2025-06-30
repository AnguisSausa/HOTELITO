// Verificar si ya hay usuario logueado
const usuarioLogueado = JSON.parse(localStorage.getItem('usuario'));
if(usuarioLogueado){
    const tipoUsuario = usuarioLogueado.tipo?.toLowerCase();
    if (tipoUsuario === 'admin') {
        window.location.href = "home.html";
    } else {
        window.location.href = "paginaprincipal.html";
    }
}

const esEmailValido = email => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
};

const esPasswordValido = password => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

// Función de login
const loginUsuario = async () => {
    let email = document.querySelector("#email").value;
    let password = document.querySelector("#password").value;

    if (!esEmailValido(email)) {
        Swal.fire({ title: "Error!", text: "Email incorrecto", icon: "error" });
        return;
    }
    if (password.trim() === "") {
        Swal.fire({ title: "ERROR!", text: "Falta contraseña", icon: "error" });
        return;
    }

    let usuario = { email, password };

    try {
        const response = await fetch('php/usuario/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();

        if (data.success) {
            // Refuerzo: tomar id de usuario_id o id
            const id = data.usuario?.id || data.usuario_id || data.id;
            if (!id) {
                Swal.fire({ title: "Error!", text: "El usuario no tiene ID. Contacta al administrador.", icon: "error" });
                return;
            }
            // Guardar usuario en localStorage
            localStorage.setItem('usuario', JSON.stringify({
                id: id,
                nombre: data.usuario?.nombre || '',
                email: data.usuario?.email || '',
                fotoPerfil: data.usuario?.fotoPerfil || ''
            }));
            // Redirigir según el tipo de usuario
            const tipoUsuario = data.usuario?.tipo?.toLowerCase();
            if (tipoUsuario === 'admin') {
                window.location.href = 'home.html';
            } else {
                window.location.href = 'paginaprincipal.html';
            }
        } else {
            Swal.fire({ title: "Error!", text: data.message, icon: "error" });
        }
    } catch (error) {
        Swal.fire({ title: "Error!", text: "Error de conexión", icon: "error" });
    }
} 