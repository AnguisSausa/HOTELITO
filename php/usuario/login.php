<?php
session_start();
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
$email = trim($datos['email'] ?? '');
$password = $datos['password'] ?? '';

// Validaciones
$errores = [];

// Validar email
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores[] = 'El email no es válido';
}

// Validar password
if (empty($password)) {
    $errores[] = 'La contraseña es requerida';
}

// Si hay errores, retornarlos
if (!empty($errores)) {
    http_response_code(400);
    echo json_encode(['error' => $errores]);
    exit;
}

try {
    // Buscar usuario por email
    $stmt = $conexion->prepare("SELECT id, nombre_usuario, email, password, es_admin FROM usuarios WHERE email = ?");
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
    
    // Crear sesión
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['nombre_usuario'] = $usuario['nombre_usuario'];
    $_SESSION['email'] = $usuario['email'];
    $_SESSION['es_admin'] = $usuario['es_admin'];
    $_SESSION['logueado'] = true;
    
    // Determinar mensaje según el tipo de usuario
    $mensaje = $usuario['es_admin'] === 'admin' ? 
        'Bienvenido administrador ' . $usuario['nombre_usuario'] : 
        'Bienvenido ' . $usuario['nombre_usuario'];
    
    echo json_encode([
        'success' => true,
        'mensaje' => $mensaje,
        'usuario' => [
            'id' => $usuario['id'],
            'nombre_usuario' => $usuario['nombre_usuario'],
            'email' => $usuario['email'],
            'es_admin' => $usuario['es_admin']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error interno del servidor']);
}

$stmt->close();
$conexion->close();
?> 