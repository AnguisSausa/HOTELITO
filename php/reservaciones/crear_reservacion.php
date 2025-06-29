<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir conexión
require_once '../conexion.php';

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido']);
    exit;
}

// Obtener datos del formulario
$datos = json_decode(file_get_contents('php://input'), true);

if (!$datos) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos no válidos']);
    exit;
}

// Extraer datos
$user_id = intval($datos['user_id'] ?? 0);
$room_id = intval($datos['room_id'] ?? 0);
$fecha_entrada = trim($datos['fecha_entrada'] ?? '');
$num_noches = intval($datos['num_noches'] ?? 0);
$precio_noche = floatval($datos['precio_noche'] ?? 0);

// Validaciones
$errores = [];

// Validar user_id
if ($user_id <= 0) {
    $errores[] = 'ID de usuario no válido';
}

// Validar room_id
if ($room_id <= 0) {
    $errores[] = 'ID de habitación no válido';
}

// Validar fecha de entrada
if (empty($fecha_entrada)) {
    $errores[] = 'Fecha de entrada es requerida';
} else {
    $fecha_entrada_obj = DateTime::createFromFormat('Y-m-d', $fecha_entrada);
    if (!$fecha_entrada_obj) {
        $errores[] = 'Formato de fecha de entrada no válido';
    } else {
        $hoy = new DateTime();
        $hoy->setTime(0, 0, 0);
        if ($fecha_entrada_obj < $hoy) {
            $errores[] = 'La fecha de entrada no puede ser anterior a hoy';
        }
    }
}

// Validar número de noches
if ($num_noches < 1 || $num_noches > 30) {
    $errores[] = 'El número de noches debe estar entre 1 y 30';
}

// Validar precio por noche
if ($precio_noche <= 0) {
    $errores[] = 'Precio por noche no válido';
}

// Si hay errores, retornarlos
if (!empty($errores)) {
    http_response_code(400);
    echo json_encode(['error' => $errores]);
    exit;
}

try {
    // Verificar que el usuario existe
    $stmt = $conexion->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Usuario no encontrado']);
        exit;
    }
    
    // Verificar que la habitación existe y está disponible
    $stmt = $conexion->prepare("SELECT room_id, status, precio FROM habitaciones WHERE room_id = ?");
    $stmt->bind_param("i", $room_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'Habitación no encontrada']);
        exit;
    }
    
    $habitacion = $resultado->fetch_assoc();
    if (strtolower($habitacion['status']) !== 'disponible') {
        http_response_code(400);
        echo json_encode(['error' => 'La habitación no está disponible']);
        exit;
    }
    
    // Calcular total usando el precio de la habitación
    $total_precio = $num_noches * $habitacion['precio'];
    
    // Verificar si hay conflictos de reservación
    // Como no tenemos fecha_salida en la tabla, verificamos solo por fecha_entrada y num_noches
    $stmt = $conexion->prepare("
        SELECT reservation_id FROM reservations 
        WHERE room_id = ? 
        AND fecha_entrada = ?
    ");
    $stmt->bind_param("is", $room_id, $fecha_entrada);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows > 0) {
        http_response_code(400);
        echo json_encode(['error' => 'La habitación ya está reservada para esa fecha']);
        exit;
    }
    
    // Insertar la reservación con solo los campos que existen en la tabla
    $stmt = $conexion->prepare("
        INSERT INTO reservations (user_id, room_id, fecha_entrada, num_noches, total_precio) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->bind_param("iisid", $user_id, $room_id, $fecha_entrada, $num_noches, $total_precio);
    
    if ($stmt->execute()) {
        $reservation_id = $conexion->insert_id;
        
        // Actualizar estado de la habitación a 'reservada'
        $stmt_update = $conexion->prepare("UPDATE habitaciones SET status = 'reservada' WHERE room_id = ?");
        $stmt_update->bind_param("i", $room_id);
        $stmt_update->execute();
        
        echo json_encode([
            'success' => true,
            'message' => 'Reservación creada exitosamente',
            'reservation_id' => $reservation_id,
            'datos_reservacion' => [
                'fecha_entrada' => $fecha_entrada,
                'num_noches' => $num_noches,
                'total_precio' => $total_precio
            ]
        ]);
    } else {
        throw new Exception('Error al crear la reservación: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}

$stmt->close();
$conexion->close();
?> 