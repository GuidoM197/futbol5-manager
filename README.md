# Futbol5 Manager

Sistema de gestión de reservas de canchas de fútbol 5, con creación de equipos, partidos públicos y torneos. Backend en Spring Boot (Java) y frontend en React + TypeScript, pensado para tres tipos de usuario: jugadores (`USER`), dueños de canchas (`OWNER`) y administradores (`ADMIN`).

Proyecto desarrollado como TP de la materia Ingeniería de Software 1 (FIUBA).

## Funcionalidades principales

| Módulo | Funcionalidad |
|---|---|
| **Usuarios y sesiones** | Registro con foto de perfil, login, refresh token JWT, perfil de usuario (ver/editar datos, obtener foto) |
| **Canchas (fields)** | Alta de canchas, búsqueda por ubicación del usuario, listado de canchas propias, edición y baja (dueño/admin) |
| **Reservas (reservations)** | Creación de reservas, consulta de horarios disponibles por cancha y día, listado de reservas propias |
| **Partidos (matches)** | Creación de partidos públicos, unirse a un partido, confirmar participación, abandonar un partido |
| **Equipos (teams)** | Creación de equipos, listado de equipos donde el usuario es miembro o líder, edición y baja |
| **Torneos (tournaments)** | Creación, edición, baja y búsqueda/filtrado de torneos (por nombre, formato, estado, fecha), cambio de estado e inscripción de equipos |

### Roles y autenticación

La autenticación es vía JWT (access + refresh token). Los endpoints protegidos requieren rol según `@PreAuthorize`:

- **USER**: reservar canchas, crear/unirse a partidos y equipos, crear/inscribirse a torneos.
- **OWNER**: dar de alta y administrar sus propias canchas.
- **ADMIN**: administrar canchas de cualquier dueño.

Los formatos de torneo disponibles son *Eliminación Directa*, *Fase de Grupos y luego Eliminación* y *Liga Todos contra Todos*; los estados van de *Abierto para Inscripción* a *Completado* o *Cancelado*.

## Stack tecnológico

**Backend**
- Java 21, Spring Boot 3.4.3 (Maven)
- Spring Data JPA, Spring Security + JWT (`io.jsonwebtoken` / jjwt 0.12.6)
- Bean Validation (`spring-boot-starter-validation`)
- Base de datos: PostgreSQL 17 (runtime) / H2 (tests)
- Documentación de API: springdoc-openapi (`springdoc-openapi-starter-webmvc-ui` 2.8.5)
- Testing: JUnit (vía `spring-boot-starter-test`), Mockito 5.12.0, Testcontainers (PostgreSQL)

**Frontend**
- React 19 + TypeScript 5.7, empaquetado con Vite 6
- Ruteo con `wouter`
- Data fetching/estado async con `@tanstack/react-query`, formularios con `@tanstack/react-form` y validación con `zod`
- Íconos con `lucide-react`
- Linting con ESLint 9 + `typescript-eslint`

## Arquitectura / estructura del proyecto

```
backend/src/main/java/ar/uba/fi/ingsoft1/todo_template/
├── common/exception/       # manejo de excepciones comunes
├── config/                 # configuración general (OpenAPI, error handling, CORS/web)
│   └── security/           # JWT (filtro, servicio, user details) y SecurityConfig
├── fields/                 # gestión de canchas
├── matches/                # partidos públicos
├── reservations/           # reservas de turnos
├── teams/                  # equipos
├── tournaments/            # torneos
└── user/                   # usuarios, sesiones, perfil
    ├── dtos/
    ├── refresh_token/
    └── pictureSaver/       # persistencia de fotos de perfil

frontend/src/
├── components/             # componentes de UI (auth, formularios, gestión de canchas, equipos, torneos, layout común)
├── screens/                # pantallas: login, signup, home, canchas, reservas, equipos, torneos, partidos públicos, perfil
├── services/                # clientes HTTP / contexto de token
├── models/                 # tipos/modelos de dominio en el frontend
└── config/                 # configuración de la app (URL base de API, etc.)
```

Cada módulo backend sigue el mismo patrón: entidad JPA, repositorio, servicio y `RestController`, con DTOs de entrada/salida separados.

## Requisitos previos

- Docker y Docker Compose (opción recomendada para levantar todo el stack)
- Java 21 y Maven (o el wrapper `mvnw` incluido) para correr el backend sin Docker
- Node.js reciente (compatible con Vite 6 / React 19) y npm para correr el frontend sin Docker

## Cómo levantar el proyecto

### Con Docker Compose (recomendado)

```bash
cp .env.example .env
docker compose up --build
```

Esto levanta cuatro servicios (puertos configurables por variables de entorno en `.env`):

- `db`: PostgreSQL 17
- `backend`: API Spring Boot (contenedor expone el puerto 8080, mapeado a `BACKEND_EXTERNAL_PORT`)
- `frontend`: build de producción servido en el puerto 80, mapeado a `FRONTEND_EXTERNAL_PORT`
- `adminer`: cliente web para administrar la base de datos, mapeado a `ADMINER_EXTERNAL_PORT`

### Backend y frontend por separado (desarrollo)

Backend:

```bash
cd backend
./mvnw spring-boot:run
```

Por defecto levanta en el puerto `8080`.

Frontend:

```bash
cd frontend
cp .env.example .env   # ajustar VITE_BASE_API_URL si el backend corre en otro puerto
npm install
npm run dev
```

Otros scripts disponibles en el frontend: `npm run build` (compila TypeScript y genera el build de Vite), `npm run preview` y `npm run lint`.

## Documentación de la API

El backend expone la documentación OpenAPI/Swagger de forma pública (sin autenticación):

- Swagger UI: `http://localhost:<puerto-backend>/swagger-ui/index.html`
- Spec OpenAPI: `http://localhost:<puerto-backend>/v3/api-docs`

Los endpoints protegidos requieren el header `Authorization: Bearer <token>`, obtenido vía `POST /sessions/login/user`.

## Cómo correr los tests

**Backend** (JUnit + Mockito + Testcontainers, requiere Docker disponible para los tests que usan Testcontainers):

```bash
cd backend
./mvnw test
```

**Frontend**: el proyecto no tiene actualmente un framework de testing configurado (no hay script `test` en `package.json`). Sí están disponibles `npm run lint` para linting y `npm run build` para verificar que el proyecto compila.

## Git hooks

El repositorio está configurado para ejecutar los tests antes de realizar
un commit, si se ejecuta este comando:

```bash
git config --local --add core.hookspath git-hooks
```
