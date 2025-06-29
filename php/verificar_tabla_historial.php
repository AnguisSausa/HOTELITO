<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'conexion.php';

try {
    // Verificar si la tabla historial existe
    $result = $conexion->query("SHOW TABLES LIKE 'historial'");
    
    if ($result->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'error' => 'La tabla historial no existe',
            'message' => 'Necesitas crear la tabla historial'
        ]);
        exit;
    }
    
    // Obtener estructura de la tabla historial
    $result = $conexion->query("DESCRIBE historial");
    $campos = [];
    
    while ($row = $result->fetch_assoc()) {
        $campos[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Tabla historial existe',
        'estructura' => $campos
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Error al verificar tabla: ' . $e->getMessage()
    ]);
}

$conexion->close();
?> 