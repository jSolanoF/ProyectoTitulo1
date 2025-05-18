const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los trabajadores
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM trabajadores';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al obtener trabajadores' });
    res.json(results);
  });
});

// Obtener trabajador por correo
router.get('/por-correo/:correo', (req, res) => {
  const correo = req.params.correo;
  const sql = 'SELECT * FROM trabajadores WHERE correo = ?';
  db.query(sql, [correo], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar trabajador' });
    if (results.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(results[0]);
  });
});

// Obtener trabajador por ID
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM trabajadores WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error al buscar trabajador' });
    if (results.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(results[0]);
  });
});

// Registrar nuevo trabajador, usuario y saldo inicial
router.post('/', (req, res) => {
  const { nombre, apellido, rut, correo, contraseña, fecha_ingreso } = req.body;

  if (!nombre || !apellido || !rut || !correo || !contraseña || !fecha_ingreso) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  //  Insertar en tabla usuarios
  const sqlUsuario = 'INSERT INTO usuarios (correo, contraseña, rol) VALUES (?, ?, "trabajador")';
  db.query(sqlUsuario, [correo, contraseña], (errUsuario, resultUsuario) => {
    if (errUsuario) {
      console.error('Error al insertar usuario:', errUsuario);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }

    const usuarioId = resultUsuario.insertId;

    //  Insertar en tabla trabajadores con usuario_id
    const sqlTrabajador = `
      INSERT INTO trabajadores (nombre, apellido, rut, correo, fecha_ingreso, usuario_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sqlTrabajador, [nombre, apellido, rut, correo, fecha_ingreso, usuarioId], (errTrabajador, resultTrabajador) => {
      if (errTrabajador) {
        console.error('Error al insertar trabajador:', errTrabajador);
        return res.status(500).json({ error: 'Usuario creado pero no se pudo registrar trabajador' });
      }

      const nuevoTrabajadorId = resultTrabajador.insertId;
      const anioActual = new Date().getFullYear();

      //  Insertar automáticamente el saldo inicial
      const sqlSaldo = `
        INSERT INTO saldos (trabajador_id, anio)
        VALUES (?, ?)
      `;
      db.query(sqlSaldo, [nuevoTrabajadorId, anioActual], (errSaldo) => {
        if (errSaldo) {
          console.error('Error al insertar saldo inicial:', errSaldo);
          return res.status(500).json({ error: 'Trabajador registrado, pero error al crear saldo' });
        }

        res.json({
          mensaje: 'Trabajador, usuario y saldo creados correctamente',
          trabajador_id: nuevoTrabajadorId
        });
      });
    });
  });
});

// Actualizar trabajador y correo en usuarios
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, rut, correo, fecha_ingreso } = req.body;

  const sqlTrabajador = `
    UPDATE trabajadores
    SET nombre = ?, apellido = ?, rut = ?, correo = ?, fecha_ingreso = ?
    WHERE id = ?
  `;

  db.query(sqlTrabajador, [nombre, apellido, rut, correo, fecha_ingreso, id], (err) => {
    if (err) return res.status(500).json({ error: 'Error al actualizar trabajador' });

    const sqlUsuario = `
      UPDATE usuarios
      SET correo = ?
      WHERE id = (SELECT usuario_id FROM trabajadores WHERE id = ?)
    `;
    db.query(sqlUsuario, [correo, id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Trabajador actualizado pero error al actualizar usuario' });

      res.json({ mensaje: 'Trabajador y usuario actualizados correctamente' });
    });
  });
});

// Eliminar trabajador y usuario asociado
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const getUserId = 'SELECT usuario_id FROM trabajadores WHERE id = ?';
  db.query(getUserId, [id], (err, result) => {
    if (err || result.length === 0) {
      console.error('Error al buscar trabajador o no encontrado:', err);
      return res.status(404).json({ error: 'No se encontró el trabajador' });
    }

    const usuario_id = result[0].usuario_id;

    const deleteTrabajador = 'DELETE FROM trabajadores WHERE id = ?';
    db.query(deleteTrabajador, [id], (err2) => {
      if (err2) {
        console.error('Error al eliminar trabajador:', err2);
        return res.status(500).json({ error: 'Error al eliminar trabajador' });
      }

      const deleteUsuario = 'DELETE FROM usuarios WHERE id = ?';
      db.query(deleteUsuario, [usuario_id], (err3) => {
        if (err3) {
          console.error('Error al eliminar usuario:', err3);
          return res.status(500).json({ error: 'Trabajador eliminado, pero no se pudo eliminar el usuario' });
        }

        res.json({ mensaje: 'Trabajador y usuario eliminados correctamente' });
      });
    });
  });
});

module.exports = router;