-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS db_xqore
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Seleccionar la base de datos
USE db_xqore;

-- ==========================================
-- CONFIGURACIÓN DE BASE DE DATOS
-- ==========================================
SET NAMES utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- ==========================================
-- 1. ROLES DEL SISTEMA
--    - Define el catálogo estático de roles.
--    - No se modifica en operaciones comunes.
--    - Ejemplos: superadmin, admin, cajero, mesero, cliente.
-- ==========================================
CREATE TABLE t_roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL,
    estado_rol ENUM('activo','inactivo') DEFAULT 'activo',
    descripcion_rol TEXT,
    INDEX idx_nombre_rol (nombre_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar roles básicos para el sistema xQore
INSERT INTO t_roles (nombre_rol, descripcion_rol, estado_rol) VALUES
('superadmin', 'Acceso total al sistema, incluyendo funciones críticas, auditoría y mantenimiento', 'activo'),
('admin', 'Gestión administrativa del sistema, sin acceso a configuraciones críticas', 'activo'),
('usuario', 'Persona registrada en el sistema, aún sin interacción comercial o compra', 'activo'),
('cliente', 'Usuario que ya realizó al menos una compra o interacción comercial con la empresa', 'activo');

-- ==========================================
-- 2. USUARIOS (Tabla principal de identidad)
-- ==========================================
CREATE TABLE t_usuarios (
    id_usuario BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Identidad
    nombre_user VARCHAR(200) NOT NULL,
    dni_user VARCHAR(20) UNIQUE DEFAULT NULL,
    email_user VARCHAR(255) UNIQUE NOT NULL,
    telefono_user VARCHAR(20) DEFAULT NULL,
    direccion_user TEXT DEFAULT NULL,
    foto_url_user VARCHAR(500) DEFAULT NULL,

    -- Seguridad
    password_user VARCHAR(255) NOT NULL,
    email_verificado BOOLEAN DEFAULT FALSE,
    intentos_login_fallidos INT DEFAULT 0,
    bloqueado_hasta TIMESTAMP DEFAULT NULL,
    ultimo_login TIMESTAMP DEFAULT NULL,

    -- Recuperación de cuenta
    token_recuperacion VARCHAR(100) DEFAULT NULL,
    token_expiracion TIMESTAMP DEFAULT NULL,

    -- OAuth
    proveedor_oauth ENUM('google', 'facebook', 'apple') DEFAULT NULL,
    sub_oauth VARCHAR(100) UNIQUE DEFAULT NULL,

    -- Estado global
    activo BOOLEAN DEFAULT TRUE,

    -- Auditoría
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Índices
    INDEX idx_email_user (email_user),
    INDEX idx_dni_user (dni_user),
    INDEX idx_ultimo_login (ultimo_login),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- 3. RELACIÓN USUARIO-ROL
-- ==========================================
CREATE TABLE t_usuario_roles (
    id_usuario_rol BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    id_rol INT NOT NULL,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_revocacion DATETIME DEFAULT NULL,

    -- Foreign Keys
    FOREIGN KEY (id_usuario) REFERENCES t_usuarios(id_usuario) ON DELETE CASCADE,
    FOREIGN KEY (id_rol) REFERENCES t_roles(id_rol) ON DELETE CASCADE,

    -- Índices
    UNIQUE KEY unique_usuario_rol (id_usuario, id_rol),
    INDEX idx_id_usuario (id_usuario),
    INDEX idx_id_rol (id_rol),
    INDEX idx_fecha_asignacion (fecha_asignacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
