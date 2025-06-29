-- Agregar campos faltantes a la tabla reservations
ALTER TABLE reservations 
ADD COLUMN total_spent DECIMAL(10,2) DEFAULT 0.00 AFTER total_precio,
ADD COLUMN comentarios TEXT AFTER total_spent,
ADD COLUMN fecha_salida TIMESTAMP NULL AFTER fecha_entrada;

-- Crear índice para mejorar el rendimiento
CREATE INDEX idx_fecha_salida ON reservations(fecha_salida);
CREATE INDEX idx_total_spent ON reservations(total_spent); 