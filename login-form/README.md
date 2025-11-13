# Plataforma de Venta de Cursos Online

Una plataforma full-stack para que instructores creen, gestionen y vendan cursos online. Los clientes pueden registrarse, comprar cursos y acceder a su contenido.

## Características

- **Autenticación de usuarios**: Registro e inicio de sesión con contraseñas hasheadas (bcrypt)
- **Panel de Admin**: Crear, editar y eliminar cursos; gestionar clientes
- **Dashboard de Cliente**: Ver cursos disponibles, comprar y acceder a sus cursos
- **Gestión de Roles**: Admin y cliente con permisos diferenciados
- **Base de datos**: PostgreSQL con tablas de usuarios, cursos y compras
- **API REST**: Endpoints para todas las operaciones principales

## Stack Tecnológico

- **Backend**: Node.js + Express.js
- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Base de Datos**: PostgreSQL
- **Autenticación**: bcrypt para hash de contraseñas
- **CORS**: Habilitado para desarrollo

## Requisitos Previos

- Node.js (v14+)
- PostgreSQL (v12+)
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio-url>
cd login-form
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# PostgreSQL
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=tu_contraseña
PGDATABASE=login_db
PGPORT=5432

# Servidor
PORT=3000

# Seguridad
SALT_ROUNDS=10
```

### 4. Crear usuario administrador

```bash
node create-admin.js
```

**Credenciales por defecto:**
- Username: `admin`
- Password: `admin123`
- Email: `admin@example.com`

⚠️ **Importante**: Cambia estas credenciales en producción.

### 5. Iniciar el servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`.

## Estructura de Carpetas

```
login-form/
├── server/
│   └── index.js          # Servidor Express y APIs
├── src/
│   ├── index.html        # Página de login
│   ├── register.html     # Página de registro
│   ├── dashboard.html    # Dashboard para clientes
│   ├── admin-dashboard.html  # Panel de administración
│   ├── styles/
│   │   └── main.css      # Estilos globales
│   ├── scripts/
│   │   ├── app.js        # Lógica de login
│   │   └── register.js   # Lógica de registro
│   └── components/
│       └── LoginForm.js  # Componente de login
├── .env                  # Variables de entorno (no incluir en git)
├── .gitignore            # Archivos a ignorar en git
├── package.json          # Dependencias
├── create-admin.js       # Script para crear admin
└── README.md             # Este archivo
```

## Uso

### Para Administradores

1. Accede a `http://localhost:3000`
2. Inicia sesión con tus credenciales de admin
3. En el panel:
   - **Dashboard**: Visualiza estadísticas
   - **Gestionar Cursos**: Crea, edita o elimina cursos
   - **Gestionar Clientes**: Cambia roles de usuarios
   - **Compras**: Visualiza historial de compras

### Para Clientes

1. Accede a `http://localhost:3000`
2. Regístrate o inicia sesión
3. En tu dashboard:
   - Ve todos los cursos disponibles
   - Compra cursos
   - Accede a tus cursos comprados

## API Endpoints

### Autenticación

- `POST /api/register` - Registrar usuario
- `POST /api/login` - Iniciar sesión

### Cursos

- `GET /api/courses` - Obtener todos los cursos
- `POST /api/courses` - Crear curso (admin)
- `PUT /api/courses/:id` - Editar curso (admin)
- `DELETE /api/courses/:id` - Eliminar curso (admin)
- `GET /api/user-courses/:user_id` - Cursos comprados por usuario

### Usuarios

- `GET /api/users` - Obtener todos los usuarios (admin)
- `PUT /api/users/:id` - Actualizar rol (admin)
- `DELETE /api/users/:id` - Eliminar usuario (admin)

### Compras

- `POST /api/purchase` - Comprar curso
- `GET /api/all-purchases` - Historial de compras (admin)

## Scripts Disponibles

```bash
# Iniciar servidor (producción/desarrollo)
npm start

# Iniciar servidor con auto-reload (desarrollo)
npm run dev-server

# Iniciar servidor backend únicamente
npm run start-server

# Iniciar frontend con live-reload
npm run live

# Crear usuario administrador
node create-admin.js
```

## Base de Datos

### Tablas

**users**
- id (PK)
- username (UNIQUE)
- email (UNIQUE)
- password_hash
- role (admin | client)
- created_at

**courses**
- id (PK)
- title
- description
- price
- instructor_id (FK)
- created_at

**purchases**
- id (PK)
- user_id (FK)
- course_id (FK)
- purchased_at
- UNIQUE(user_id, course_id)

## Notas Importantes

### Seguridad (Desarrollo vs Producción)

En desarrollo:
- CORS está habilitado para todos los orígenes
- Las contraseñas se envían en texto plano en requests POST
- No hay validación JWT

Para producción, implementar:
- Autenticación JWT con tokens
- CORS restringido a dominio específico
- HTTPS obligatorio
- Rate limiting en endpoints de login/registro
- Validación de emails
- Requisitos de contraseña más fuertes

## Troubleshooting

### Error: "ECONNREFUSED" en localhost:3000

- Verifica que el servidor esté corriendo: `npm start`
- Comprueba que el puerto 3000 no esté en uso

### Error: "Database connection failed"

- Verifica que PostgreSQL esté corriendo
- Comprueba las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Error: "role" column does not exist

- Ejecuta `node create-admin.js` nuevamente para migrar la base de datos

## Contribuciones

Para trabajar en el proyecto:

1. Crea una rama para tu feature: `git checkout -b feature/mi-feature`
2. Realiza tus cambios
3. Haz commit: `git commit -m "Descripción del cambio"`
4. Push a la rama: `git push origin feature/mi-feature`
5. Abre un Pull Request

## Licencia

Este proyecto está bajo licencia MIT.
