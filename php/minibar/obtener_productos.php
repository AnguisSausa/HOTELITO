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

try {
    // Obtener todos los productos del minibar con stock disponible
    $sql = "SELECT item_id, name, description, price, stock, category, imagen FROM minibaritems WHERE stock > 0 ORDER BY category, name";
    $result = $conexion->query($sql);
    
    $productos = [];
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $productos[] = [
                'id' => $row['item_id'],
                'nombre' => $row['name'],
                'descripcion' => $row['description'],
                'precio' => floatval($row['price']),
                'stock' => intval($row['stock']),
                'categoria' => $row['category'],
                'imagen' => $row['imagen']
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'productos' => $productos
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error del servidor: ' . $e->getMessage()]);
}

$conexion->close();
?> 