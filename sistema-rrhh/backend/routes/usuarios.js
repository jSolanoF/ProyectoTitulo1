const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Obtener todos los usuarios
router.get('/', (req, res) => {
  db.query('SELECT * FROM usuarios', (err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener usuarios' });
    }
    res.json(resultados);
  });
});

// Crear nuevo usuario
router.post('/', (req, res) => {
  const { correo, contraseña, rol } = req.body;

  if (!correo || !contraseña || !rol) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const sql = 'INSERT INTO usuarios (correo, contraseña, rol) VALUES (?, ?, ?)';
  db.query(sql, [correo, contraseña, rol], (err, resultado) => {
    if (err) {
      return res.status(500).json({ error: 'Error al crear el usuario' });
    }
    res.status(201).json({ mensaje: 'Usuario creado con éxito', id: resultado.insertId });
  });
});

// Login de usuario
router.post('/login', (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  const sql = 'SELECT * FROM usuarios WHERE correo = ? AND contraseña = ?';
  db.query(sql, [correo, contraseña], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    if (results.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = results[0];
    res.json({ mensaje: 'Login exitoso', rol: usuario.rol, id: usuario.id });
  });
});

// registrar trabajador
router.post('/registrar-trabajador', (req, res) => {
  const { nombre, apellido, rut, correo, contraseña, fecha_ingreso } = req.body;

  if (!nombre || !apellido || !rut || !correo || !contraseña || !fecha_ingreso) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  //  Crear usuario
  const sqlUsuario = 'INSERT INTO usuarios (correo, contraseña, rol) VALUES (?, ?, ?)';
  db.query(sqlUsuario, [correo, contraseña, 'trabajador'], (err, resultadoUsuario) => {
    if (err) {
      console.error('Error al crear usuario:', err);
      return res.status(500).json({ error: 'Error al crear el usuario' });
    }

    const usuario_id = resultadoUsuario.insertId;

    // Crear trabajador asociado
    const sqlTrabajador = 'INSERT INTO trabajadores (nombre, apellido, rut, correo, fecha_ingreso, usuario_id) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sqlTrabajador, [nombre, apellido, rut, correo, fecha_ingreso, usuario_id], (err, resultadoTrabajador) => {
      if (err) {
        console.error('Error al crear trabajador:', err);
        return res.status(500).json({ error: 'Error al registrar el trabajador' });
      }

      res.json({ mensaje: ' Trabajador registrado exitosamente' });
    });
  });
});

module.exports = router;