# Paddy Backend - Instrucciones de Instalación

## Requisitos Previos

1. **Node.js** (v18 o superior)
2. **MySQL** (v8.0 o superior)
3. **npm** o **yarn**

## Configuración de Base de Datos

### 1. Instalar MySQL
```bash
# macOS con Homebrew
brew install mysql
brew services start mysql

# O descarga desde: https://dev.mysql.com/downloads/mysql/
```

### 2. Crear la base de datos
```sql
# Conectarse a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE paddy_db;

# Crear usuario específico (opcional pero recomendado)
CREATE USER 'paddy_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON paddy_db.* TO 'paddy_user'@'localhost';
FLUSH PRIVILEGES;
```

## Instalación del Proyecto

### 1. Clonar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita el archivo .env con tus configuraciones
```

### 3. Variables de entorno requeridas
```env
GATEWAY_PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root  # o tu usuario de MySQL
DATABASE_PASSWORD=tu_password_aqui
DATABASE_NAME=paddy_db
```

## Ejecutar la Aplicación

### 1. Modo desarrollo
```bash
npm run dev
```

### 2. Modo producción
```bash
npm run build
npm run start:prod
```

### 3. Sembrar datos iniciales
```bash
npm run db:seed
```

### 4. Limpiar base de datos
```bash
npm run db:clear
```

### 5. Reiniciar base de datos (limpiar + sembrar)
```bash
npm run db:reset
```

## Scripts Disponibles

- `npm run dev` - Ejecuta en modo desarrollo con hot reload
- `npm run build` - Construye la aplicación para producción
- `npm run start:prod` - Ejecuta la aplicación en modo producción
- `npm run db:seed` - Siembra datos iniciales en la base de datos
- `npm run db:clear` - Limpia todos los datos de la base de datos
- `npm run db:reset` - Limpia y siembra nuevamente la base de datos

## Acceso

Una vez iniciada la aplicación:
- URL: http://localhost:3000
- Usuario admin por defecto: admin@ayg.cl
- Contraseña: admin

## Troubleshooting

### Error de conexión a MySQL
- Verifica que MySQL esté ejecutándose
- Revisa las credenciales en el archivo .env
- Asegúrate de que la base de datos exista

### Error de permisos
- Ejecuta: `sudo chown -R $(whoami) node_modules`
- O usa `sudo npm install` si es necesario

### Puerto ocupado
- Cambia el puerto en .env: `GATEWAY_PORT=3001`
- O mata el proceso que usa el puerto 3000
