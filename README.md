# GESOTEC - Sistema de Gestión de Soporte Tecnológico

![GESOTEC Logo](https://img.shields.io/badge/GESOTEC-Help%20Desk-blue) ![Version](https://img.shields.io/badge/version-1.0.0-green) ![Status](https://img.shields.io/badge/status-Active-success)

**GESOTEC** es una plataforma web moderna de Help Desk diseñada para optimizar la gestión de soporte técnico dentro de organizaciones. Facilita la comunicación entre usuarios, técnicos y administradores, permitiendo un seguimiento eficiente de incidencias técnicas desde su creación hasta su resolución.

## 📋 Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Roles del Sistema](#-roles-del-sistema)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

## ✨ Características Principales

### Gestión de Tickets
- **Creación de Tickets:** Los usuarios pueden reportar incidencias técnicas con descripciones detalladas, prioridad y categorización.
- **Seguimiento en Tiempo Real:** Visualización del estado de tickets (Abierto, En Progreso, Cerrado, Resuelto, Cancelado).
- **Historial Completo:** Acceso al historial de tickets para auditoría y análisis.
- **Asignación Inteligente:** Los administradores pueden asignar técnicos específicos a cada ticket.

### Panel de Administración
- **Gestión de Usuarios:** Creación y administración de cuentas de usuarios y técnicos.
- **Tablero de Tareas:** Vista Kanban para visualizar y gestionar tareas en diferentes estados.
- **Reportes y Estadísticas:** Análisis de métricas de rendimiento y productividad.
- **Control de Accesos:** Gestión de roles y permisos del sistema.

### Panel de Técnico
- **Mis Tickets Asignados:** Vista personalizada de tickets asignados al técnico.
- **Gestión de Prioridades:** Organización de tickets según urgencia y complejidad.
- **Base de Conocimiento:** Acceso a guías y documentación para resolución de problemas.
- **Historial de Actividades:** Registro de tickets resueltos y tiempos de respuesta.

### Panel de Usuario
- **Creación de Tickets:** Formulario intuitivo para reportar incidencias.
- **Seguimiento de Tickets:** Consulta del estado de tickets creados.
- **Perfil de Usuario:** Gestión de información personal y preferencias.
- **Notificaciones:** Alertas sobre actualizaciones en tickets.

### Diseño y Experiencia de Usuario
- **Interfaz Moderna:** Diseño limpio y profesional optimizado para help desk.
- **Responsive Design:** Compatibilidad con dispositivos móviles y de escritorio.
- **Menú de Usuario Intuitivo:** Dropdown moderno con acceso rápido a perfil y cierre de sesión.
- **Modales Interactivos:** Visualización detallada de tickets en ventanas modales.
- **Filtrado Dinámico:** Búsqueda y filtrado de tickets por estado, prioridad y otros criterios.

## 👥 Roles del Sistema

### 🔧 Administrador
- Gestión completa de usuarios y técnicos
- Asignación de tickets a técnicos
- Supervisión de tablero de tareas (Kanban)
- Acceso a historial completo de tickets
- Gestión de inventarios y recursos
- Generación de reportes y estadísticas

### 👨‍💻 Técnico
- Recepción y asignación de tickets
- Seguimiento y resolución de casos técnicos
- Acceso a base de conocimiento
- Gestión de perfil profesional
- Historial de tickets resueltos
- Actualización de estado de tickets

### 👤 Usuario
- Creación de reportes de falla
- Consulta de estado de tickets
- Gestión de perfil personal
- Acceso a histórico de tickets
- Comunicación con técnicos asignados

## 🚀 Tecnologías

### Frontend
- **HTML5:** Estructura semántica y accesible
- **CSS3:** Estilos modernos con diseño responsive
- **JavaScript (ES6+):** Lógica de interactividad y manipulación del DOM
- **LocalStorage:** Persistencia de sesión del usuario

### Backend
- **Node.js:** Runtime de JavaScript para el servidor
- **Express.js:** Framework web para API REST
- **Supabase:** Base de datos en la nube (PostgreSQL)
- **API REST:** Arquitectura RESTful para comunicación cliente-servidor

### Base de Datos
- **Supabase (PostgreSQL):** Base de datos relacional en la nube
- **Tablas:** usuarios, tickets, tareas
- **Relaciones:** JOINs para obtener datos relacionados (nombres de usuarios y técnicos)

## 📦 Instalación

### Prerrequisitos
- Node.js (v14 o superior)
- npm o yarn
- Cuenta en Supabase (para base de datos)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Bran-Forge-Dev/GESOTEC.git
cd GESOTEC
```

2. **Instalar dependencias del backend**
```bash
cd backend
npm install
```

3. **Configurar variables de entorno**
```bash
# Crear archivo .env en el directorio backend
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_key
PORT=3000
```

4. **Ejecutar el servidor**
```bash
npm start
```

5. **Abrir la aplicación**
- Abre `html/index.html` en tu navegador
- O despliega el frontend en un servidor web (Apache, Nginx, etc.)

## 🎯 Uso

### Inicio de Sesión
1. Accede a la página de inicio (`index.html`)
2. Ingresa tus credenciales (correo y contraseña)
3. El sistema redirigirá según tu rol:
   - **Administrador:** Panel de control administrativo
   - **Técnico:** Panel de gestión de tickets
   - **Usuario:** Panel de creación de tickets

### Crear un Ticket (Usuario)
1. Navega a "Crear Nuevo Ticket"
2. Completa el formulario con:
   - Asunto descriptivo
   - Descripción detallada del problema
   - Prioridad (Urgente, Alta, Media, Baja)
   - Categoría (Hardware, Software, Red, etc.)
3. Envía el ticket
4. El sistema asignará automáticamente un técnico

### Gestionar Tickets (Administrador)
1. Accede al "Tablero de Tareas"
2. Visualiza tickets en columnas Kanban
3. Arrastra tickets entre columnas para cambiar estado
4. Asigna técnicos específicos a cada ticket
5. Revisa el historial completo en "Historial de Tickets"

### Resolver Tickets (Técnico)
1. Ve a "Mis Tickets Asignados"
2. Filtra por estado o prioridad
3. Haz clic en "Ver Detalles" para ver información completa
4. Actualiza el estado del ticket según progreso
5. Cierra el ticket cuando esté resuelto

## 📁 Estructura del Proyecto

```
GESOTEC/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Autenticación de usuarios
│   │   ├── tickets.js       # Gestión de tickets
│   │   └── usuarios.js      # Gestión de usuarios
│   ├── server.js            # Servidor principal
│   └── package.json
├── css/
│   ├── layout.css           # Estilos base
│   ├── user-menu.css        # Menú de usuario compartido
│   ├── AdminPerfil.css      # Estilos de admin
│   ├── UserPerfil.css       # Estilos de usuario
│   ├── TecPerfil.css        # Estilos de técnico
│   └── ...
├── html/
│   ├── index.html           # Página de inicio/login
│   ├── AdminPerfil.html     # Panel de administrador
│   ├── UserPerfil.html      # Panel de usuario
│   ├── TecPerfil.html       # Panel de técnico
│   ├── AdminHistorialTickets.html
│   ├── UserHistorialTickets.html
│   ├── TecHistorialTickets.html
│   └── ...
├── js/
│   ├── AdminPerfil.js       # Lógica de admin
│   ├── UserPerfil.js        # Lógica de usuario
│   ├── TecPerfil.js         # Lógica de técnico
│   └── ...
├── images/                  # Imágenes y assets
└── README.md
```

## 🔌 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Tickets
- `GET /api/tickets` - Obtener todos los tickets
- `GET /api/tickets/:id` - Obtener ticket por ID
- `GET /api/tickets/usuario/:usuario_id` - Obtener tickets de un usuario
- `GET /api/tickets/tecnico/:tecnico_id` - Obtener tickets asignados a un técnico
- `POST /api/tickets` - Crear nuevo ticket
- `PUT /api/tickets/:id` - Actualizar ticket

### Usuarios
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar usuario

### Tareas
- `GET /api/tareas` - Obtener todas las tareas
- `GET /api/tareas/:id` - Obtener tarea por ID
- `POST /api/tareas` - Crear nueva tarea
- `PUT /api/tareas/:id` - Actualizar tarea

## 🤝 Contribución

Las contribuciones son bienvenidas. Si deseas contribuir:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Desarrolladores

- **Brandon Salinas** - Desarrollador Principal
- **GESOTEC Team** - Equipo de Desarrollo

## 📞 Soporte

Para soporte técnico o preguntas:
- Email: soporte@gesotec.com
- Issues: [GitHub Issues](https://github.com/Bran-Forge-Dev/GESOTEC/issues)

---

**GESOTEC** - Optimizando la gestión de soporte técnico con tecnología moderna.
