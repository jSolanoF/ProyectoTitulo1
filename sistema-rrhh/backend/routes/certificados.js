
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Multer config para certificados
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../documentos/certificados')); // Carpeta destino donde se guardarán los certificados
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const nombre = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, nombre);
  }
});
const upload = multer({ storage });

// POST subir certificado
router.post('/', upload.single('archivo'), (req, res) => {
  const { tipo, trabajador_id } = req.body;
  const archivo_url = `/archivos/certificados/${req.file.filename}`;
  const fecha_emision = new Date().toISOString().split('T')[0];

  const sql = 'INSERT INTO certificados (tipo, archivo_url, fecha_emision, trabajador_id) VALUES (?, ?, ?, ?)';
  db.query(sql, [tipo, archivo_url, fecha_emision, trabajador_id], (err, result) => {
    if (err) {
      console.error('Error al registrar certificado:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json({ mensaje: 'Certificado registrado' });
  });
});

// GET certificados por trabajador específico
router.get('/:trabajador_id', (req, res) => {
  const { trabajador_id } = req.params;
  // Consulta  para traer todos los certificados de ese trabajador, ordenados por fecha (más recientes primero)
  const sql = `
    SELECT id, tipo, archivo_url, fecha_emision
    FROM certificados
    WHERE trabajador_id = ?
    ORDER BY fecha_emision DESC
  `;
  db.query(sql, [trabajador_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener certificados' });
    res.json(results);
  });
});
// Exporta el router para ser usado en el archivo principal de rutas
module.exports = router;
