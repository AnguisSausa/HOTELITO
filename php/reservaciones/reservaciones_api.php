<?php
header('Content-Type: application/json');
require_once '../conexion.php';

$action = $_GET['action'] ?? '';

if ($action === 'listar') {
    $result = $conexion->query("SELECT reservation_id, user_id, rooms_id, entrada, num_noches, total_precio FROM reservations");
    $reservaciones = [];
    while ($row = $result->fetch_assoc()) {
        $reservaciones[] = $row;
    }
    echo json_encode(['success' => true, 'reservaciones' => $reservaciones]);
    exit;
}

if ($action === 'count') {
    $result = $conexion->query("SELECT COUNT(*) as count FROM reservations");
    $row = $result->fetch_assoc();
    echo json_encode(['success' => true, 'count' => intval($row['count'])]);
    exit;
}

echo json_encode(['success' => false, 'error' => 'Acción no válida']);
$conexion->close(); 