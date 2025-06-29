<?php
header('Content-Type: application/json');

try {
    // Incluir conexión
    require_once 'conexion.php';
    
    // Verificar si la tabla usuarios existe
    $resultado = mysqli_query($conexion, "SHOW TABLES LIKE 'usuarios'");
    
    if (mysqli_num_rows($resultado) == 0) {
        // La tabla no existe, crearla
        $sql = "CREATE TABLE usuarios (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            telefono VARCHAR(10) NOT NULL,
            es_admin TINYINT(1) DEFAULT 0,
            imagen LONGTEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )";
        
        if (mysqli_query($conexion, $sql)) {
            echo json_encode([
                'success' => true,
                'mensaje' => 'Tabla usuarios creada exitosamente',
                'tabla_existia' => false
            ]);
        } else {
            throw new Exception('Error al crear tabla: ' . mysqli_error($conexion));
        }
    } else {
        echo json_encode([
            'success' => true,
            'mensaje' => 'Tabla usuarios ya existe',
            'tabla_existia' => true
        ]);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'mensaje' => 'Error: ' . $e->getMessage()
    ]);
}
?> 