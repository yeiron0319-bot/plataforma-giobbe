-- 1. Crear la base de datos si no existe y seleccionarla
CREATE DATABASE IF NOT EXISTS giobbe_empleo;
USE giobbe_empleo;

-- 2. Tabla para guardar la información de las empresas contratantes
CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- Identificador único para cada empresa
    nombre VARCHAR(100) NOT NULL,            -- Nombre de la empresa de seguridad
    telefono VARCHAR(20) NOT NULL,           -- Teléfono con código de país para el redireccionamiento a WhatsApp
    correo VARCHAR(100) NOT NULL,            -- Correo donde llegará el PDF de la hoja de vida
    direccion VARCHAR(255),                  -- Dirección física (útil si es convocatoria masiva)
    ubicacion_maps TEXT                      -- Enlace de Google Maps de la empresa
);

-- 3. Tabla para guardar los requerimientos o vacantes de empleo
CREATE TABLE IF NOT EXISTS requerimientos (
    id INT AUTO_INCREMENT PRIMARY KEY,       -- Identificador único de la vacante
    empresa_id INT,                          -- Conecta la vacante con la empresa que la creó
    cargo ENUM('Vigilante', 'OMT', 'Supervisor', 'Escolta', 'Manejador Canino') NOT NULL, -- Roles específicos
    genero ENUM('Hombre', 'Mujer', 'Ambos') DEFAULT 'Ambos', -- Filtro de género
    experiencia ENUM('Con Experiencia', 'Sin Experiencia', 'Ambas') NOT NULL, -- Filtro de experiencia
    tipo_convocatoria ENUM('Individual', 'Masiva') DEFAULT 'Individual', -- Define el comportamiento del botón
    detalles_presentacion TEXT,              -- Indicaciones adicionales, horarios o referencias si es masiva
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha automática de creación
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE -- Si se borra la empresa, se borran sus vacantes
);
