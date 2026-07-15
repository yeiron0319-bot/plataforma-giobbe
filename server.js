// =========================================================================
// BACKEND PRINCIPAL DE PRODUCCIÓN - PLATAFORMA GIOBBE
// Autor: Yeiron Rivas López - Aprendiz SENA
// =========================================================================

const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// =========================================================================
// CONEXIÓN A MYSQL (EXTRAYENDO DIRECTAMENTE DE LAS VARIABLES GLOBALES)
// =========================================================================
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 18003 // Toma el puerto de Aiven por defecto
});

db.connect(err => {
    if (err) {
        console.error("❌ Error en la Base de Datos MySQL: ", err.message);
    } else {
        console.log("🚀 ¡Conectado exitosamente a la Base de Datos MySQL en la Nube!");
    }
});

// =========================================================================
// RUTAS DE LA API (ENDPOINTS)
// =========================================================================

app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: "Servidor conectado correctamente en internet" });
});

app.get('/api/vacantes', (req, res) => {
    const sql = `SELECT r.*, e.nombre AS empresa, e.telefono, e.correo, e.direccion, e.ubicacion_maps 
                 FROM requerimientos r 
                 JOIN empresas e ON r.empresa_id = e.id 
                 ORDER BY r.fecha_publicacion DESC`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.get('/api/empresas', (req, res) => {
    db.query('SELECT id, nombre FROM empresas ORDER BY nombre ASC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/empresas', (req, res) => {
    const { nombre, telefono, correo, direccion, ubicacion_maps } = req.body;
    const sql = 'INSERT INTO empresas (nombre, telefono, correo, direccion, ubicacion_maps) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nombre, telefono, correo, direccion, ubicacion_maps], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Empresa guardada exitosamente en el sistema' });
    });
});

app.delete('/api/empresas/:id', (req, res) => {
    const empresaId = req.params.id;
    const sql = 'DELETE FROM empresas WHERE id = ?';
    db.query(sql, [empresaId], (err, result) => {
        if (err) return res.status(500).json({ error: "No se pudo eliminar la empresa" });
        res.json({ message: 'Empresa eliminada correctamente de la base de datos' });
    });
});

app.post('/api/vacantes', (req, res) => {
    const { empresa_id, cargo, genero, experiencia, tipo_convocatoria, detalles_presentacion } = req.body;
    const sql = 'INSERT INTO requerimientos (empresa_id, cargo, genero, experiencia, tipo_convocatoria, detalles_presentacion) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [empresa_id, cargo, genero, experiencia, tipo_convocatoria, detalles_presentacion], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Requerimiento publicado con éxito en la plataforma' });
    });
});

app.post('/api/postular', (req, res) => {
    res.send("Petición de postulación capturada.");
});

// Configuración del puerto dinámico para hosting en internet
const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
    console.log(`💻 Servidor backend corriendo en el puerto: ${PUERTO}`);
});
