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
$nombre_usuario = trim($datos['nombre_usuario'] ?? '');
$email = trim($datos['email'] ?? '');
$password = $datos['password'] ?? '';
$telefono = trim($datos['telefono'] ?? '');
$imagen = $datos['imagen'] ?? '';

// Validaciones
$errores = [];

// Validar nombre_usuario
if (empty($nombre_usuario) || strlen($nombre_usuario) < 2) {
    $errores[] = 'El nombre de usuario debe tener al menos 2 caracteres';
}

// Validar email
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores[] = 'El email no es válido';
}

// Validar password
if (empty($password) || strlen($password) < 6) {
    $errores[] = 'La contraseña debe tener al menos 6 caracteres';
}

// Validar teléfono
if (empty($telefono) || !preg_match('/^\d{10}$/', $telefono)) {
    $errores[] = 'El teléfono debe tener exactamente 10 dígitos';
}

// Si hay errores, retornarlos
if (!empty($errores)) {
    http_response_code(400);
    echo json_encode(['error' => $errores]);
    exit;
}

// Verificar si el email ya existe
$stmt = $conexion->prepare("SELECT id FROM usuarios WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    http_response_code(400);
    echo json_encode(['error' => 'El email ya está registrado']);
    exit;
}

// Hash de la contraseña
$password_hash = password_hash($password, PASSWORD_DEFAULT);

// Procesar imagen si existe
$imagen_base64 = '';
if (!empty($imagen)) {
    // Validar que sea una imagen válida en base64
    if (preg_match('/^data:image\/(jpeg|jpg|png|gif);base64,/', $imagen)) {
        $imagen_base64 = $imagen;
    } else {
        $errores[] = 'Formato de imagen no válido';
    }
}

// Verificar si la tabla usuarios existe, si no, crearla
$resultado = mysqli_query($conexion, "SHOW TABLES LIKE 'usuarios'");
if (mysqli_num_rows($resultado) == 0) {
    // Crear tabla usuarios
    $sql = "CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre_usuario VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        telefono VARCHAR(10) NOT NULL,
        es_admin VARCHAR(20) DEFAULT 'cliente',
        imagen LONGTEXT,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (!mysqli_query($conexion, $sql)) {
        http_response_code(500);
        echo json_encode(['error' => 'Error al crear tabla: ' . mysqli_error($conexion)]);
        exit;
    }
}

// Insertar usuario en la tabla usuarios
$es_admin = 'cliente'; // Todos los nuevos usuarios serán clientes
$stmt = $conexion->prepare("INSERT INTO usuarios (nombre_usuario, email, password, telefono, es_admin, imagen) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $nombre_usuario, $email, $password_hash, $telefono, $es_admin, $imagen_base64);

if ($stmt->execute()) {
    $usuario_id = $conexion->insert_id;
    echo json_encode([
        'success' => true,
        'mensaje' => 'Usuario registrado exitosamente',
        'usuario_id' => $usuario_id
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Error al registrar usuario: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
?> 