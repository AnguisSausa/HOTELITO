<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$reservation_id = intval($_GET['reservation_id'] ?? 0);

if ($reservation_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de reservación no válido']);
    exit;
}

try {
    // Obtener el total gastado en minibar para esta reservación usando la tabla consumo
    $stmt = $conexion->prepare("
        SELECT COALESCE(SUM(total_precio), 0) as total_minibar
        FROM consumo 
        WHERE reservations_id = ?
    ");
    
    $stmt->bind_param("i", $reservation_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $data = $resultado->fetch_assoc();
    $total_minibar = floatval($data['total_minibar']);
    
    echo json_encode([
        'success' => true,
        'total_minibar' => $total_minibar
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}

$stmt->close();
$conexion->close();
?> 