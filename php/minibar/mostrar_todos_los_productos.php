<?php
require_once '../conexion.php';

$result = $conexion->query('SELECT * FROM minibaritems');

if (!$result) {
    echo '<p>Error en la consulta: ' . $conexion->error . '</p>';
    exit;
}

// Estilos modernos para la tabla
?>
<style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f6fa; margin: 0; padding: 0; }
    h2 { color: #374151; text-align: center; margin-top: 32px; }
    table { margin: 32px auto; border-collapse: collapse; min-width: 900px; background: #fff; box-shadow: 0 4px 24px rgba(102,126,234,0.10); border-radius: 18px; overflow: hidden; }
    th { background: #667eea; color: #fff; padding: 14px 18px; font-size: 1.1em; }
    td { padding: 12px 16px; text-align: center; font-size: 1em; color: #374151; }
    tr:nth-child(even) { background: #f0f4ff; }
    tr:nth-child(odd) { background: #fff; }
    td img { max-width: 70px; max-height: 70px; border-radius: 10px; box-shadow: 0 2px 8px rgba(102,126,234,0.10); }
    td i { color: #aaa; }
</style>
<?php

echo '<h2>Productos del Minibar</h2>';
echo '<table>';
echo '<tr>';
for ($i = 0; $i < $result->field_count; $i++) {
    $field = $result->fetch_field_direct($i);
    echo '<th>' . htmlspecialchars($field->name) . '</th>';
}
echo '</tr>';
while ($row = $result->fetch_assoc()) {
    echo '<tr>';
    foreach ($row as $key => $value) {
        if (is_null($value)) {
            echo '<td><i>null</i></td>';
        } else if ($key === 'imagen' && $value) {
            echo '<td><img src="' . htmlspecialchars($value) . '" alt="img"></td>';
        } else if (strlen($value) > 100) {
            echo '<td>' . htmlspecialchars(substr($value,0,100)) . '...</td>';
        } else {
            echo '<td>' . htmlspecialchars($value) . '</td>';
        }
    }
    echo '</tr>';
}
echo '</table>';

$result->free();
$conexion->close(); 