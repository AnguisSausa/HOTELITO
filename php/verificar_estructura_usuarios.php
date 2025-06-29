<?php
require_once 'conexion.php';

echo "<h2>Estructura de la tabla usuarios:</h2>";

$query = "DESCRIBE usuarios";
$resultado = mysqli_query($conexion, $query);

if ($resultado) {
    echo "<table border='1'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Nulo</th><th>Llave</th><th>Default</th><th>Extra</th></tr>";
    
    while ($row = mysqli_fetch_assoc($resultado)) {
        echo "<tr>";
        echo "<td>" . $row['Field'] . "</td>";
        echo "<td>" . $row['Type'] . "</td>";
        echo "<td>" . $row['Null'] . "</td>";
        echo "<td>" . $row['Key'] . "</td>";
        echo "<td>" . $row['Default'] . "</td>";
        echo "<td>" . $row['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "Error al obtener estructura: " . mysqli_error($conexion);
}

echo "<h2>Datos de ejemplo en la tabla usuarios:</h2>";
$query = "SELECT id, nombre_usuario, email, es_admin FROM usuarios LIMIT 5";
$resultado = mysqli_query($conexion, $query);

if ($resultado) {
    echo "<table border='1'>";
    echo "<tr><th>ID</th><th>Nombre</th><th>Email</th><th>Es Admin</th></tr>";
    
    while ($row = mysqli_fetch_assoc($resultado)) {
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['nombre_usuario'] . "</td>";
        echo "<td>" . $row['email'] . "</td>";
        echo "<td>" . $row['es_admin'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "Error al obtener datos: " . mysqli_error($conexion);
}

mysqli_close($conexion);
?> 