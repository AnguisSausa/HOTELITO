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
$productos = $datos['productos'] ?? [];
$subtotal_minibar = floatval($datos['subtotal_minibar'] ?? 0);
$total_spend = floatval($datos['total_spend'] ?? 0);

// Validaciones
if ($user_id <= 0 || $reservation_id <= 0) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos de usuario o reservación no válidos']);
    exit;
}

if (empty($productos)) {
    http_response_code(400);
    echo json_encode(['error' => 'No hay productos en el carrito']);
    exit;
}

try {
    // Iniciar transacción
    $conexion->begin_transaction();
    
    // Verificar que la reservación existe y pertenece al usuario
    $stmt = $conexion->prepare("SELECT reservation_id FROM reservations WHERE reservation_id = ? AND user_id = ?");
    $stmt->bind_param("ii", $reservation_id, $user_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        throw new Exception('Reservación no encontrada o no válida');
    }
    
    // Registrar cada producto comprado en la tabla consumo
    foreach ($productos as $producto) {
        $item_id = intval($producto['id']);
        $cantidad = intval($producto['cantidad']);
        $precio_unitario = floatval($producto['precio']);
        
        // Verificar stock disponible en minibaritems
        $stmt = $conexion->prepare("SELECT stock FROM minibaritems WHERE item_id = ?");
        $stmt->bind_param("i", $item_id);
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        if ($resultado->num_rows === 0) {
            throw new Exception('Producto no encontrado');
        }
        
        $stock_actual = $resultado->fetch_assoc()['stock'];
        
        if ($stock_actual < $cantidad) {
            throw new Exception('Stock insuficiente para el producto: ' . $producto['nombre']);
        }
        
        // Actualizar stock en minibaritems
        $stmt = $conexion->prepare("UPDATE minibaritems SET stock = stock - ? WHERE item_id = ?");
        $stmt->bind_param("ii", $cantidad, $item_id);
        $stmt->execute();
        
        // Registrar la compra en la tabla consumo
        $stmt = $conexion->prepare("
            INSERT INTO consumo (reservations_id, item_id, consumption_date, total_precio) 
            VALUES (?, ?, NOW(), ?)
        ");
        $total_producto = $cantidad * $precio_unitario;
        $stmt->bind_param("iid", $reservation_id, $item_id, $total_producto);
        $stmt->execute();
    }
    
    // Confirmar transacción
    $conexion->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Compra procesada exitosamente',
        'subtotal_minibar' => $subtotal_minibar
    ]);
    
} catch (Exception $e) {
    // Revertir transacción en caso de error
    $conexion->rollback();
    
    http_response_code(500);
    echo json_encode(['error' => 'Error al procesar la compra: ' . $e->getMessage()]);
}

$stmt->close();
$conexion->close();
?> 