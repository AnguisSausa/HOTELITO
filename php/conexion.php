<?php
// Conexión sencilla a la base de datos hotel
$conexion = mysqli_connect('localhost', 'root', '', 'hotel');
if (!$conexion) {
    die('Error de conexión: ' . mysqli_connect_error());
}
?> 