<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once '../conexion.php';

try {
    // Verificar que se proporcionó un ID
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        throw new Exception('ID de usuario requerido');
    }

    $id = intval($_GET['id']);
    
    // Consulta para obtener solo nombre e imagen del usuario
    $query = "SELECT nombre_usuario, imagen FROM usuarios WHERE id = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        throw new Exception('Usuario no encontrado');
    }
    
    $usuario = $resultado->fetch_assoc();
    
    // Devolver solo nombre e imagen
    echo json_encode([
        'success' => true,
        'usuario' => [
            'nombre_usuario' => $usuario['nombre_usuario'],
            'imagen' => $usuario['imagen']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

$stmt->close();
$conexion->close();
?> 