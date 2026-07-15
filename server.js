// =========================================================================
// BACKEND PRINCIPAL - PLATAFORMA GIOBBE & ACADEMIA CLAVE
// Autor: Yeiron Rivas López - Aprendiz SENA
// =========================================================================

require('dotenv').config(); // Carga las variables de entorno del archivo .env
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Middlewares para procesar datos JSON y de formularios HTML tradicionales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hace accesible la carpeta "public" para servir HTML, CSS, JavaScript e imágenes
app.use(express.static('public'));

// =========================================================================
// CONEXIÓN A LA BASE DE DATOS MYSQL
// =========================================================================
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error("❌ Error en la Base de Datos MySQL: ", err.message);
    } else {
        console.log("🚀 ¡Conectado exitosamente a la Base de Datos MySQL!");
    }
});

// =========================================================================
// RUTAS DE LA API (ENDPOINTS)
// =========================================================================

// 1. RUTA DE PRUEBA: Para verificar el estado base del servidor backend
app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: "Servidor conectado y escuchando peticiones" });
});

// 2. OBTENER TODAS LAS VACANTES (Para listar los empleos en el index.html)
app.get('/api/vacantes', (req, res) => {
    const sql = `SELECT r.*, e.nombre AS empresa, e.telefono, e.correo, e.direccion, e.ubicacion_maps 
                 FROM requerimientos r 
                 JOIN empresas e ON r.empresa_id = e.id 
                 ORDER BY r.fecha_publicacion DESC`;
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al consultar vacantes: ", err.message);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

// 3. OBTENER LISTA DE EMPRESAS (Para poblar los menús select en el admin.html)
app.get('/api/empresas', (req, res) => {
    db.query('SELECT id, nombre FROM empresas ORDER BY nombre ASC', (err, results) => {
        if (err) {
            console.error("Error al listar empresas: ", err.message);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

// 4. GUARDAR NUEVA EMPRESA (Panel Administrativo)
app.post('/api/empresas', (req, res) => {
    const { nombre, telefono, correo, direccion, ubicacion_maps } = req.body;
    const sql = 'INSERT INTO empresas (nombre, telefono, correo, direccion, ubicacion_maps) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nombre, telefono, correo, direccion, ubicacion_maps], (err, result) => {
        if (err) {
            console.error("Error al guardar empresa: ", err.message);
            return res.status(500).json(err);
        }
        res.json({ message: 'Empresa guardada exitosamente en el sistema' });
    });
});

// 5. NUEVA RUTA INTEGRADA: ELIMINAR UNA EMPRESA DE LA BASE DE DATOS
app.delete('/api/empresas/:id', (req, res) => {
    const empresaId = req.params.id;
    const sql = 'DELETE FROM empresas WHERE id = ?';
    
    db.query(sql, [empresaId], (err, result) => {
        if (err) {
            console.error("Error al borrar empresa en MySQL: ", err.message);
            return res.status(500).json({ error: "No se pudo eliminar la empresa" });
        }
        res.json({ message: 'Empresa eliminada correctamente de la base de datos' });
    });
});

// 6. GUARDAR NUEVA VACANTE / REQUERIMIENTO (Panel Administrativo)
app.post('/api/vacantes', (req, res) => {
    const { empresa_id, cargo, genero, experiencia, tipo_convocatoria, detalles_presentacion } = req.body;
    const sql = 'INSERT INTO requerimientos (empresa_id, cargo, genero, experiencia, tipo_convocatoria, detalles_presentacion) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [empresa_id, cargo, genero, experiencia, tipo_convocatoria, detalles_presentacion], (err, result) => {
        if (err) {
            console.error("Error al guardar vacante: ", err.message);
            return res.status(500).json(err);
        }
        res.json({ message: 'Requerimiento publicado con éxito en la plataforma' });
    });
});

// 7. SIMULACIÓN DE POSTULACIÓN (Procesador base para la subida de datos)
app.post('/api/postular', (req, res) => {
    res.send("Petición de postulación capturada con éxito en el servidor.");
});

// =========================================================================
// ENCENDIDO DEL SERVIDOR LOCAL
// =========================================================================
const PUERTO = 3000;
app.listen(PUERTO, () => {
    console.log(`💻 Servidor backend corriendo en: http://localhost:${PUERTO}`);
    console.log(`📡 Base de Datos lista para recibir peticiones POST, GET y DELETE`);
});
