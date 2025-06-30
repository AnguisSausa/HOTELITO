<?php
header('Content-Type: application/json');
require_once '../conexion.php';

$action = $_GET['action'] ?? '';

if ($action === 'listar') {
    $result = $conexion->query("SELECT history_id, reservation_id, comentarios FROM historial");
    $historial = [];
    while ($row = $result->fetch_assoc()) {
        $historial[] = $row;
    }
    echo json_encode(['success' => true, 'historial' => $historial]);
    exit;
}

if ($action === 'count') {
    $result = $conexion->query("SELECT COUNT(*) as count FROM historial");
    $row = $result->fetch_assoc();
    echo json_encode(['success' => true, 'count' => intval($row['count'])]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Acción no válida']);
$conexion->close(); 