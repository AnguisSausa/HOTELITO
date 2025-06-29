<?php
// Conexión a la base de datos hotel
$host = 'localhost';
$usuario = 'root';
$password = '';
$base_datos = 'hotel';

// Crear conexión con manejo de errores mejorado
try {
    $conexion = mysqli_connect($host, $usuario, $password, $base_datos);
    
    if (!$conexion) {
        throw new Exception('Error de conexión: ' . mysqli_connect_error());
    }
    
    // Configurar charset
    mysqli_set_charset($conexion, 'utf8');
    
} catch (Exception $e) {
    die('Error de conexión: ' . $e->getMessage());
}
?> 