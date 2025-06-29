# HOTELITO

Sistema de gestión hotelera con sistema de autenticación completo.

## 🏨 Características

- **Sistema de Login/Registro**: Autenticación segura de usuarios
- **Validaciones**: Email, contraseña, teléfono y campos requeridos
- **Gestión de Imágenes**: Almacenamiento en base64
- **Interfaz Moderna**: Diseño responsivo y atractivo
- **Seguridad**: Contraseñas hasheadas con bcrypt

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Base de Datos**: MySQL
- **Servidor**: XAMPP
- **Iconos**: Font Awesome 6.0

## 📋 Requisitos

- XAMPP (Apache + MySQL)
- PHP 7.4 o superior
- MySQL 5.7 o superior
- Navegador web moderno

## 🚀 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/AnguisSausa/HOTELITO.git
   cd HOTELITO
   ```

2. **Configurar XAMPP**
   - Iniciar Apache y MySQL en XAMPP
   - Crear la base de datos `hotel` en phpMyAdmin

3. **Importar la estructura de la base de datos**
   - Ejecutar el archivo `php/crear_tabla_usuarios.sql` en phpMyAdmin

4. **Configurar la conexión**
   - Verificar que el archivo `php/conexion.php` tenga los datos correctos de conexión

5. **Acceder al sistema**
   - Abrir `http://localhost/hotel/` en tu navegador

## 📁 Estructura del Proyecto

```
hotel/
├── index.html              # Página principal de login
├── home.html               # Página principal del sistema
├── registro.html           # Página de registro
├── php/
│   ├── conexion.php        # Configuración de base de datos
│   ├── login.php           # API de autenticación
│   ├── registrar_usuario.php # API de registro
│   └── crear_tabla_usuarios.sql # Estructura de BD
├── assets/
│   ├── css/
│   │   └── style.css       # Estilos del sistema
│   ├── js/
│   │   └── login.js        # Funcionalidades JavaScript
│   ├── imgs/               # Imágenes del sistema
│   └── fonts/              # Fuentes personalizadas
└── README.md
```

## 🔐 Base de Datos

### Tabla: usuarios

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT AUTO_INCREMENT | Identificador único |
| nombre | VARCHAR(100) | Nombre completo del usuario |
| email | VARCHAR(100) UNIQUE | Email único del usuario |
| password | VARCHAR(255) | Contraseña hasheada |
| telefono | VARCHAR(10) | Teléfono (10 dígitos) |
| es_admin | TINYINT(1) | 1=Admin, 0=Usuario normal |
| imagen | LONGTEXT | Imagen en formato base64 |
| fecha_registro | TIMESTAMP | Fecha de registro automática |

## 👤 Usuario por Defecto

- **Email**: admin@hotel.com
- **Contraseña**: password
- **Rol**: Administrador

## 🔧 Funcionalidades

### Login
- Validación de email y contraseña
- Mensajes de error descriptivos
- Redirección automática tras login exitoso

### Registro
- Validación de todos los campos
- Preview de imagen de perfil
- Conversión automática a base64
- Verificación de email único

### Validaciones
- **Email**: Formato válido y único
- **Contraseña**: Mínimo 6 caracteres
- **Teléfono**: Exactamente 10 dígitos
- **Nombre**: Mínimo 2 caracteres
- **Imagen**: Máximo 5MB, formatos: JPG, PNG, GIF

## 🎨 Características de la UI

- Diseño moderno con gradientes
- Animaciones suaves
- Responsive design
- Iconos Font Awesome
- Mensajes de estado claros
- Loading states
- Modal de registro

## 🔒 Seguridad

- Contraseñas hasheadas con `password_hash()`
- Validación de entrada en frontend y backend
- Prepared statements para prevenir SQL injection
- Validación de tipos de archivo
- Límites de tamaño de archivo

## 📱 Responsive

El sistema es completamente responsivo y funciona en:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🚀 Próximas Funcionalidades

- [ ] Dashboard de administrador
- [ ] Gestión de habitaciones
- [ ] Sistema de reservas
- [ ] Gestión de clientes
- [ ] Reportes y estadísticas
- [ ] Sistema de notificaciones

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**AnguisSausa**
- GitHub: [@AnguisSausa](https://github.com/AnguisSausa)

## 🙏 Agradecimientos

- Font Awesome por los iconos
- XAMPP por el entorno de desarrollo
- La comunidad de desarrolladores PHP

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub! 