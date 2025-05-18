const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener saldo por ID de trabajador
router.get('/por-trabajador/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM saldos WHERE trabajador_id = ? ORDER BY anio DESC LIMIT 1';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error al consultar saldo:', err);
      return res.status(500).json({ error: 'Error al obtener saldo' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Saldo no encontrado para este trabajador' });
    }

    res.json(results[0]);
  });
});

module.exports = router;