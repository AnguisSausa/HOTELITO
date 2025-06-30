<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once '../conexion.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $action = $_GET['action'] ?? '';
    switch ($action) {
        case 'list':
            listarProductos($conexion);
            break;
        case 'count':
            contarMinibar($conexion);
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Acción no válida']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $action = $data['action'] ?? '';
    switch ($action) {
        case 'add':
            agregarProducto($conexion, $data);
            break;
        case 'edit':
            editarProducto($conexion, $data);
            break;
        default:
            echo json_encode(['success' => false, 'error' => 'Acción no válida']);
    }
    exit;
}

echo json_encode(['success' => false, 'error' => 'Método no permitido']);

function listarProductos($conexion) {
    $result = $conexion->query('SELECT * FROM minibaritems ORDER BY item_id DESC');
    $productos = [];
    while ($row = $result->fetch_assoc()) {
        $productos[] = $row;
    }
    echo json_encode(['success' => true, 'productos' => $productos]);
}

function agregarProducto($conexion, $data) {
    $stmt = $conexion->prepare("INSERT INTO minibaritems (name, description, price, stock, category, imagen) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param(
        "sssdss",
        $data['name'],
        $data['description'],
        $data['price'],
        $data['stock'],
        $data['category'],
        $data['imagen']
    );
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    $stmt->close();
}

function editarProducto($conexion, $data) {
    $stmt = $conexion->prepare("UPDATE minibaritems SET name=?, description=?, price=?, stock=?, category=?, imagen=? WHERE item_id=?");
    $stmt->bind_param(
        "sssdssi",
        $data['name'],
        $data['description'],
        $data['price'],
        $data['stock'],
        $data['category'],
        $data['imagen'],
        $data['item_id']
    );
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => $stmt->error]);
    }
    $stmt->close();
}

function contarMinibar($conexion) {
    $result = $conexion->query("SELECT COUNT(*) as count FROM minibaritems");
    $row = $result->fetch_assoc();
    echo json_encode(['success' => true, 'count' => intval($row['count'])]);
} 