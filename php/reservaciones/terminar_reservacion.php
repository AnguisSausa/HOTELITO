<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);

if (!$datos) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos no válidos']);
    exit;
}

$user_id = intval($datos['user_id'] ?? 0);
$reservation_id = intval($datos['reservation_id'] ?? 0);
$comentarios = trim($datos['comentarios'] ?? '');

// Validaciones
if ($user_id <= 0 || $reservation_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos de usuario o reservación no válidos']);
    exit;
}

try {
    // Verificar que la reservación existe y pertenece al usuario
    $stmt = $conexion->prepare("
        SELECT r.reservation_id, r.rooms_id, r.total_precio, r.num_noches
        FROM reservations r
        WHERE r.reservation_id = ? AND r.user_id = ?
    ");
    $stmt->bind_param("ii", $reservation_id, $user_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Reservación no encontrada o no válida']);
        exit;
    }
    
    $reservacion = $resultado->fetch_assoc();
    
    // Usar el total_spent que llega desde el frontend (el mostrado en la página)
    $total_spent = floatval($datos['total_spent'] ?? 0);
    
    // Cambiar el estado de la habitación a 'disponible'
    $stmt = $conexion->prepare("
        UPDATE habitaciones 
        SET status = 'disponible' 
        WHERE room_id = ?
    ");
    $stmt->bind_param("i", $reservacion['rooms_id']);
    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar el estado de la habitación');
    }

    // Iniciar transacción
    $conexion->begin_transaction();

    // Crear registro en la tabla historial con el total_spent recibido y comentarios
    $stmt = $conexion->prepare("
        INSERT INTO historial (user_id, reservation_id, nights_stayed, total_spent, comentarios) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("iiids", $user_id, $reservation_id, $reservacion['num_noches'], $total_spent, $comentarios);
    if (!$stmt->execute()) {
        throw new Exception('Error al crear el registro en historial');
    }

    // Confirmar transacción
    $conexion->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Reservación terminada exitosamente',
        'datos' => [
            'reservation_id' => $reservation_id,
            'total_spend' => $total_spent,
            'comentarios' => $comentarios
        ]
    ]);
    
} catch (Exception $e) {
    // Revertir transacción en caso de error
    $conexion->rollback();
    
    http_response_code(500);
    echo json_encode(['error' => 'Error al terminar la reservación: ' . $e->getMessage()]);
}

$stmt->close();
$conexion->close();
?> 