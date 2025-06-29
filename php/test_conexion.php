<?php
// Archivo de prueba para verificar la conexión
header('Content-Type: application/json');

try {
    // Incluir conexión
    require_once 'conexion.php';
    
    // Verificar si la conexión está activa
    if ($conexion) {
        // Probar una consulta simple
        $resultado = mysqli_query($conexion, "SHOW TABLES");
        
        if ($resultado) {
            $tablas = [];
            while ($row = mysqli_fetch_array($resultado)) {
                $tablas[] = $row[0];
            }
            
            echo json_encode([
                'success' => true,
                'mensaje' => 'Conexión exitosa',
                'tablas' => $tablas,
                'error_info' => null
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'mensaje' => 'Error al consultar tablas',
                'error_info' => mysqli_error($conexion)
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'mensaje' => 'No se pudo establecer la conexión',
            'error_info' => 'Variable $conexion es null'
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'mensaje' => 'Error de conexión',
        'error_info' => $e->getMessage()
    ]);
}
?> 