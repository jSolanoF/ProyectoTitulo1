const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Ruta de login
router.post('/', (req, res) => {
  const { correo, contraseña } = req.body;
 // Verifica que ambos campos estén presentes
  if (!correo || !contraseña) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }
 //Consulta para buscar el usuario con ese correo y contraseña
  const sql = 'SELECT id, rol FROM usuarios WHERE correo = ? AND contraseña = ?';
  db.query(sql, [correo, contraseña], (err, resultados) => {
    if (err) {
      return res.status(500).json({ error: 'Error al verificar credenciales' });
    }

    if (resultados.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Autenticación exitosa
    const usuario = resultados[0];
    res.json({ mensaje: 'Login exitoso', id: usuario.id, rol: usuario.rol });
  });
});

module.exports = router;