// dashboard_counts.js

document.addEventListener('DOMContentLoaded', () => {
    // Definir endpoints para cada conteo
    const endpoints = {
        habitaciones: 'php/admin/habitaciones.php?action=count',
        minibar: 'php/minibar/minibar_admin_api.php?action=count',
        usuarios: 'php/usuario/usuarios_api.php?action=count',
        reservaciones: 'php/reservaciones/reservaciones_api.php?action=count',
        historial: 'php/historial/historial_api.php?action=count',
    };

    const ids = {
        habitaciones: 'count-habitaciones',
        minibar: 'count-minibar',
        usuarios: 'count-usuarios',
        reservaciones: 'count-reservaciones',
        historial: 'count-historial',
    };

    for (const key in endpoints) {
        fetch(endpoints[key])
            .then(res => res.json())
            .then(data => {
                if (data.success && typeof data.count !== 'undefined') {
                    document.getElementById(ids[key]).textContent = data.count;
                } else {
                    document.getElementById(ids[key]).textContent = '-';
                }
            })
            .catch(() => {
                document.getElementById(ids[key]).textContent = '-';
            });
    }
}); 