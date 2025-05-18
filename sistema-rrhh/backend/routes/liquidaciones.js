const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Verifica si la carpeta existe, y si no, la crea
//const carpetaDestino = path.join(__dirname, '../documentos/liquidaciones');
//if (!fs.existsSync(carpetaDestino)) {
//  fs.mkdirSync(carpetaDestino, { recursive: true });
//}


// Configuración Multer para guardar archivos de liquidaciones
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../documentos/liquidaciones'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const nombre = Date.now() + '-' + Math.round(Math.random() * 1E9) + ext;
    cb(null, nombre);
  }
});
const upload = multer({ storage });

// POST subir liquidación
router.post('/', upload.single('archivo'), (req, res) => {
  const { trabajador_id, mes, anio } = req.body;
  const fecha_emision = new Date().toISOString().split('T')[0];
  const archivo_url = `/archivos/liquidaciones/${req.file.filename}`;

  const sql = 'INSERT INTO liquidaciones (trabajador_id, mes, anio, archivo_url, fecha_emision) VALUES (?, ?, ?, ?, ?)';
  db.query(sql, [trabajador_id, mes, anio, archivo_url, fecha_emision], (err, result) => {
    if (err) {
      console.error('Error al registrar liquidación:', err);
      return res.status(500).json({ error: 'Error en el servidor' });
    }
    res.json({ mensaje: 'Liquidación registrada' });
  });
});

// GET liquidaciones por trabajador
router.get('/:trabajador_id', (req, res) => {
  const { trabajador_id } = req.params;
   // Consulta para traer todas las liquidaciones de ese trabajador, ordenadas por fecha (más recientes primero)
  const sql = `
    SELECT id, mes, anio, archivo_url, fecha_emision
    FROM liquidaciones
    WHERE trabajador_id = ?
    ORDER BY fecha_emision DESC
  `;
  db.query(sql, [trabajador_id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener liquidaciones' });
    res.json(results); // Devuelve la lista de liquidaciones encontradas
  });
});

module.exports = router;