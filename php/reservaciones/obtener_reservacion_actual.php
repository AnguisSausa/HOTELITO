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

$user_id = intval($_GET['user_id'] ?? 0);

if ($user_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'ID de usuario no válido']);
    exit;
}

try {
    // Obtener la reservación más reciente del usuario
    $stmt = $conexion->prepare("
        SELECT r.reservation_id, r.user_id, r.rooms_id, r.entrada, r.num_noches, r.total_precio,
               h.room_number
        FROM reservations r
        JOIN habitaciones h ON r.rooms_id = h.room_id
        WHERE r.user_id = ?
        ORDER BY r.reservation_id DESC
        LIMIT 1
    ");
    
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        echo json_encode([
            'success' => false,
            'message' => 'No se encontró una reservación activa para este usuario'
        ]);
        exit;
    }
    
    $reservacion = $resultado->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'reservacion' => $reservacion
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}

$stmt->close();
$conexion->close();
?> 