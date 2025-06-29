<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// Habilitar reporte de errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores en la salida JSON

require_once '../conexion.php';

// Usar la variable correcta de conexión
$conn = $conexion;

// Obtener el método de la petición
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'obtener_una') {
                obtenerHabitacion();
            } else {
                obtenerHabitaciones();
            }
            break;
            
        case 'POST':
            if ($action === 'eliminar') {
                eliminarHabitacion();
            } else {
                guardarHabitacion();
            }
            break;
            
        default:
            throw new Exception('Método no permitido');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

$conn->close();

// Función para obtener todas las habitaciones
function obtenerHabitaciones() {
    global $conn;
    
    // Verificar si la tabla habitaciones existe, si no, crearla
    $sql_check = "SHOW TABLES LIKE 'habitaciones'";
    $result_check = $conn->query($sql_check);
    
    if ($result_check->num_rows == 0) {
        // Crear la tabla habitaciones
        $sql_create = "CREATE TABLE habitaciones (
            room_id INT AUTO_INCREMENT PRIMARY KEY,
            room_number INT NOT NULL UNIQUE,
            room_type VARCHAR(50) NOT NULL,
            description TEXT,
            capacity INT NOT NULL,
            precio_noche DECIMAL(10,2) NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'Disponible',
            imagen LONGTEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )";
        
        if ($conn->query($sql_create) === TRUE) {
            // Insertar algunas habitaciones de ejemplo
            $habitaciones_ejemplo = [
                [101, 'Individual', 'Habitación individual con baño privado', 1, 50.00, 'Disponible'],
                [102, 'Doble', 'Habitación doble con vista al mar', 2, 80.00, 'Disponible'],
                [201, 'Suite', 'Suite de lujo con jacuzzi', 4, 150.00, 'Disponible'],
                [202, 'Familiar', 'Habitación familiar espaciosa', 6, 120.00, 'Disponible']
            ];
            
            $sql_insert = "INSERT INTO habitaciones (room_number, room_type, description, capacity, precio_noche, status) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql_insert);
            
            foreach ($habitaciones_ejemplo as $habitacion) {
                $stmt->bind_param("issids", $habitacion[0], $habitacion[1], $habitacion[2], $habitacion[3], $habitacion[4], $habitacion[5]);
                $stmt->execute();
            }
        }
    }
    
    // Obtener todas las habitaciones
    $sql = "SELECT room_id, room_number, room_type, description, capacity, precio_noche, status, imagen, created_at, updated_at FROM habitaciones ORDER BY room_number";
    $result = $conn->query($sql);
    
    $habitaciones = [];
    
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $habitaciones[] = [
                'room_id' => $row['room_id'],
                'room_number' => $row['room_number'],
                'room_type' => $row['room_type'],
                'description' => $row['description'],
                'capacity' => $row['capacity'],
                'precio_noche' => $row['precio_noche'],
                'status' => $row['status'],
                'imagen' => $row['imagen'],
                'created_at' => $row['created_at'],
                'updated_at' => $row['updated_at']
            ];
        }
    }
    
    echo json_encode([
        'success' => true,
        'data' => $habitaciones,
        'message' => 'Habitaciones obtenidas correctamente'
    ]);
}

// Función para obtener una habitación específica
function obtenerHabitacion() {
    global $conn;
    
    $room_id = $_GET['room_id'] ?? null;
    
    if (!$room_id) {
        throw new Exception('ID de habitación requerido');
    }
    
    // Obtener la habitación específica
    $sql = "SELECT room_id, room_number, room_type, description, capacity, precio_noche, status, imagen, created_at, updated_at FROM habitaciones WHERE room_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $room_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Habitación no encontrada');
    }
    
    $habitacion = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'room_id' => $habitacion['room_id'],
            'room_number' => $habitacion['room_number'],
            'room_type' => $habitacion['room_type'],
            'description' => $habitacion['description'],
            'capacity' => $habitacion['capacity'],
            'precio_noche' => $habitacion['precio_noche'],
            'status' => $habitacion['status'],
            'imagen' => $habitacion['imagen'],
            'created_at' => $habitacion['created_at'],
            'updated_at' => $habitacion['updated_at']
        ],
        'message' => 'Habitación obtenida correctamente'
    ]);
}

// Función para guardar o actualizar habitación
function guardarHabitacion() {
    global $conn;
    
    // Obtener datos del formulario
    $room_id = isset($_POST['room_id']) && !empty($_POST['room_id']) ? $_POST['room_id'] : null;
    $room_number = $_POST['room_number'];
    $room_type = $_POST['room_type'];
    $description = $_POST['description'];
    $capacity = $_POST['capacity'];
    $precio_noche = $_POST['precio_noche'];
    $status = $_POST['status'];
    
    // Validaciones
    if (empty($room_number) || empty($room_type) || empty($capacity) || empty($precio_noche) || empty($status)) {
        throw new Exception('Todos los campos obligatorios deben estar completos');
    }
    
    if ($capacity < 1 || $capacity > 10) {
        throw new Exception('La capacidad debe estar entre 1 y 10 personas');
    }
    
    if ($precio_noche < 0) {
        throw new Exception('El precio por noche no puede ser negativo');
    }
    
    // Procesar imagen si se subió
    $imagen_base64 = null;
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $file = $_FILES['imagen'];
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        
        if (!in_array($file['type'], $allowed_types)) {
            throw new Exception('Solo se permiten imágenes en formato JPEG, PNG, GIF o WebP');
        }
        
        if ($file['size'] > 5 * 1024 * 1024) { // 5MB máximo
            throw new Exception('La imagen no puede ser mayor a 5MB');
        }
        
        // Convertir imagen a base64
        $imagen_data = file_get_contents($file['tmp_name']);
        $imagen_base64 = 'data:' . $file['type'] . ';base64,' . base64_encode($imagen_data);
    }
    
    if ($room_id) {
        // ACTUALIZAR habitación existente
        if ($imagen_base64) {
            // Si hay nueva imagen, actualizar con imagen
            $sql = "UPDATE habitaciones SET room_number = ?, room_type = ?, description = ?, capacity = ?, precio_noche = ?, status = ?, imagen = ? WHERE room_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("issidssi", $room_number, $room_type, $description, $capacity, $precio_noche, $status, $imagen_base64, $room_id);
        } else {
            // Si no hay nueva imagen, mantener la imagen existente
            $sql = "UPDATE habitaciones SET room_number = ?, room_type = ?, description = ?, capacity = ?, precio_noche = ?, status = ? WHERE room_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("issidsi", $room_number, $room_type, $description, $capacity, $precio_noche, $status, $room_id);
        }
        
        $action = 'actualizada';
    } else {
        // CREAR nueva habitación (NO incluir room_id ya que es autoincrement)
        if ($imagen_base64) {
            $sql = "INSERT INTO habitaciones (room_number, room_type, description, capacity, precio_noche, status, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("issidss", $room_number, $room_type, $description, $capacity, $precio_noche, $status, $imagen_base64);
        } else {
            $sql = "INSERT INTO habitaciones (room_number, room_type, description, capacity, precio_noche, status) VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("issids", $room_number, $room_type, $description, $capacity, $precio_noche, $status);
        }
        
        $action = 'creada';
    }
    
    if ($stmt->execute()) {
        $new_room_id = $room_id ?: $conn->insert_id;
        
        echo json_encode([
            'success' => true,
            'message' => "Habitación $action correctamente",
            'room_id' => $new_room_id
        ]);
    } else {
        throw new Exception('Error al guardar la habitación: ' . $stmt->error);
    }
}

// Función para eliminar habitación
function eliminarHabitacion() {
    global $conn;
    
    // Obtener el ID de la habitación a eliminar
    $data = json_decode(file_get_contents('php://input'), true);
    $room_id = $data['room_id'] ?? null;
    
    if (!$room_id) {
        throw new Exception('ID de habitación requerido');
    }
    
    // Verificar que la habitación existe
    $sql_check = "SELECT room_number FROM habitaciones WHERE room_id = ?";
    $stmt_check = $conn->prepare($sql_check);
    $stmt_check->bind_param("i", $room_id);
    $stmt_check->execute();
    $result = $stmt_check->get_result();
    
    if ($result->num_rows === 0) {
        throw new Exception('Habitación no encontrada');
    }
    
    $room_data = $result->fetch_assoc();
    $room_number = $room_data['room_number'];
    
    // Eliminar la habitación
    $sql = "DELETE FROM habitaciones WHERE room_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $room_id);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => "Habitación $room_number eliminada correctamente"
        ]);
    } else {
        throw new Exception('Error al eliminar la habitación: ' . $stmt->error);
    }
}
?> 