<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Incluir conexión
require_once 'conexion.php';

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
$email = trim($datos['email'] ?? '');
$password = $datos['password'] ?? '';

// Validaciones
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email no válido']);
    exit;
}

if (empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Contraseña requerida']);
    exit;
}

// Buscar usuario por email
$stmt = $conexion->prepare("SELECT id, nombre, email, password, telefono, es_admin, imagen FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    http_response_code(401);
    echo json_encode(['error' => 'Email o contraseña incorrectos']);
    exit;
}

$usuario = $resultado->fetch_assoc();

// Verificar contraseña
if (!password_verify($password, $usuario['password'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Email o contraseña incorrectos']);
    exit;
}

// Iniciar sesión
session_start();
$_SESSION['usuario_id'] = $usuario['id'];
$_SESSION['usuario_nombre'] = $usuario['nombre'];
$_SESSION['usuario_email'] = $usuario['email'];
$_SESSION['es_admin'] = $usuario['es_admin'];

// Retornar datos del usuario (sin contraseña)
unset($usuario['password']);

echo json_encode([
    'success' => true,
    'mensaje' => 'Login exitoso',
    'usuario' => $usuario
]);

$stmt->close();
$conexion->close();
?> 