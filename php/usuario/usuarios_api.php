<?php
header('Content-Type: application/json');
require_once '../conexion.php';

$action = $_GET['action'] ?? '';

if ($action === 'listar') {
    $result = $conexion->query("SELECT id, nombre_usuario, email, es_admin FROM usuarios");
    $usuarios = [];
    while ($row = $result->fetch_assoc()) {
        $usuarios[] = $row;
    }
    echo json_encode(['success' => true, 'usuarios' => $usuarios]);
    exit;
}

if ($action === 'eliminar') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['success' => false, 'error' => 'ID inválido']);
        exit;
    }
    $stmt = $conexion->prepare('DELETE FROM usuarios WHERE id = ?');
    $stmt->bind_param('i', $id);
    $ok = $stmt->execute();
    $stmt->close();
    echo json_encode(['success' => $ok]);
    exit;
}

if ($action === 'admin') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id = intval($data['id'] ?? 0);
    if ($id <= 0) {
        echo json_encode(['success' => false, 'error' => 'ID inválido']);
        exit;
    }
    $stmt = $conexion->prepare("UPDATE usuarios SET es_admin = 'admin' WHERE id = ?");
    $stmt->bind_param('i', $id);
    $ok = $stmt->execute();
    $stmt->close();
    echo json_encode(['success' => $ok]);
    exit;
}

if ($action === 'count') {
    $result = $conexion->query("SELECT COUNT(*) as count FROM usuarios");
    $row = $result->fetch_assoc();
    echo json_encode(['success' => true, 'count' => intval($row['count'])]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Acción no válida']);
$conexion->close(); 