const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Crear nueva solicitud
router.post('/', (req, res) => {
  const { tipo, fecha_inicio, fecha_fin, trabajador_id } = req.body;

  if (!tipo || !fecha_inicio || !fecha_fin || !trabajador_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = `
    INSERT INTO solicitudes (tipo, fecha_inicio, fecha_fin, trabajador_id)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [tipo, fecha_inicio, fecha_fin, trabajador_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Error al registrar solicitud' });
    }
    res.status(201).json({ mensaje: 'Solicitud creada correctamente', id: result.insertId });
  });
});

// Obtener solicitudes por trabajador
router.get('/trabajador/:id', (req, res) => {
  const trabajadorId = req.params.id;
  db.query('SELECT * FROM solicitudes WHERE trabajador_id = ?', [trabajadorId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener solicitudes' });
    res.json(results);
  });
});

// Obtener todas las solicitudes
router.get('/', (req, res) => {
  const sql = `
    SELECT solicitudes.id, solicitudes.tipo, solicitudes.fecha_inicio, solicitudes.fecha_fin, solicitudes.estado,
           solicitudes.trabajador_id,trabajadores.nombre, trabajadores.apellido
    FROM solicitudes
    JOIN trabajadores ON solicitudes.trabajador_id = trabajadores.id
    ORDER BY solicitudes.fecha_solicitud DESC
  `;

  db.query(sql, (err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener solicitudes' });
    }
    res.json(resultados);
  });
});

// Cambiar estado de una solicitud (aprobada/rechazada)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  if (!['aprobada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  // Si es aprobada, descontar días del saldo
  if (estado === 'aprobada') {
    //Obtener la solicitud
    const sqlGet = 'SELECT * FROM solicitudes WHERE id = ?';
    db.query(sqlGet, [id], (errGet, resultGet) => {
      if (errGet || resultGet.length === 0) {
        return res.status(404).json({ error: 'Solicitud no encontrada' });
      }

      const solicitud = resultGet[0];
      const { trabajador_id, tipo, fecha_inicio, fecha_fin } = solicitud;
      // Calcula la cantidad de días de la solicitud
      const dias = Math.ceil((new Date(fecha_fin) - new Date(fecha_inicio)) / (1000 * 60 * 60 * 24)) + 1;
       // Determina qué campo descontar en la tabla 'saldos'
      const campo = tipo === 'vacaciones' ? 'dias_vacaciones_usados' : 'dias_admin_usados';
      const anio = new Date(fecha_inicio).getFullYear();

      // Actualizar estado de la solicitud
      const sqlUpdate = 'UPDATE solicitudes SET estado = ? WHERE id = ?';
      db.query(sqlUpdate, [estado, id], (errUpdate) => {
        if (errUpdate) {
          return res.status(500).json({ error: 'Error al aprobar solicitud' });
        }

        // Descontar del saldo
        const sqlSaldo = `
          UPDATE saldos
          SET ${campo} = ${campo} + ?
          WHERE trabajador_id = ? AND anio = ?
        `;
        db.query(sqlSaldo, [dias, trabajador_id, anio], (errSaldo) => {
          if (errSaldo) {
            console.error('Error al descontar saldo:', errSaldo);
            return res.status(500).json({ error: 'Solicitud aprobada, pero error al descontar días del saldo' });
          }

          res.json({ mensaje: ` Solicitud aprobada y ${dias} día(s) descontado(s) del saldo` });
        });
      });
    });
  } else {
    // Si la solicitud es rechazada, solo actualiza el estado
    const sql = `UPDATE solicitudes SET estado = ? WHERE id = ?`;
    db.query(sql, [estado, id], (err, resultado) => {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar solicitud' });
      }
      res.json({ mensaje: 'Solicitud actualizada correctamente' });
    });
  }
});

module.exports = router;