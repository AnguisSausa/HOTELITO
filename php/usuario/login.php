<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir conexión
require_once '../conexion.php';

// Obtener datos del cuerpo de la petición
$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Validar campos vacíos
if (empty($email) || empty($password)) {
    echo json_encode([
        'success' => false,
        'message' => 'Email y contraseña son requeridos'
    ]);
    exit;
}

// Consulta para la tabla usuarios
$stmt = $conexion->prepare("SELECT id, nombre_usuario, email, password, es_admin, imagen FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Usuario no encontrado'
    ]);
    exit;
}

$usuario = $result->fetch_assoc();

// Verificar contraseña directamente (sin hash)
if ($password === $usuario['password']) {
    // Eliminar la contraseña del array antes de devolverlo
    unset($usuario['password']);
    
    // Validar que el tipo sea admin o cliente
    $tipo = strtolower($usuario['es_admin'] ?? '');
    if (!in_array($tipo, ['admin', 'cliente'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Tipo de usuario no válido'
        ]);
        exit;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Login exitoso',
        'usuario' => [
            'id' => $usuario['id'],
            'nombre' => $usuario['nombre_usuario'],
            'email' => $usuario['email'],
            'tipo' => $tipo,
            'fotoPerfil' => $usuario['imagen'] ?? ''
        ]
    ]);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Contraseña incorrecta'
    ]);
}

$stmt->close();
$conexion->close();
?> 