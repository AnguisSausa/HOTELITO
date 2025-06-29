<?php
session_start();
header('Content-Type: application/json');

// Cerrar sesión
session_unset();
session_destroy();

echo json_encode([
    'success' => true,
    'mensaje' => 'Sesión cerrada exitosamente'
]);
?> 