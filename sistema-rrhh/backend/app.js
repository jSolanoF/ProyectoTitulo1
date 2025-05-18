const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./config/db');
const path = require('path');

const app = express();
const PORT = 3001;

// Configura CORS para permitir solo solicitudes desde tu dominio (DDNS)
app.use(cors({
  origin: 'https://sackserver.ddns.net',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false
}));app.use(bodyParser.json());

/// Definición de Rutas (API) 
const usuariosRoutes = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRoutes);

const solicitudesRoutes = require('./routes/solicitudes');
app.use('/api/solicitudes', solicitudesRoutes);

const certificadosRoutes = require('./routes/certificados');
app.use('/api/certificados', certificadosRoutes);

const loginRoutes = require('./routes/login');
app.use('/api/login', loginRoutes);

const liquidacionesRoutes = require('./routes/liquidaciones');
app.use('/api/liquidaciones', liquidacionesRoutes);

const trabajadoresRoutes = require('./routes/trabajadores');
app.use('/api/trabajadores', trabajadoresRoutes);

const saldosRoutes = require('./routes/saldos');
app.use('/api/saldos', saldosRoutes); 

// app.use('/api/saldos', require('./routes/saldos'));

// Archivos públicos (certificados y liquidaciones)
app.use('/archivos/certificados', express.static(path.join(__dirname, 'documentos/certificados')));
app.use('/archivos/liquidaciones', express.static(path.join(__dirname, 'documentos/liquidaciones')));

// los archivos estáticos del frontend HTML, CSS, 
app.use(express.static(path.join(__dirname, '../frontend')));

// Cargar login.html al ingresar a la raiz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/login.html'));
});


// Inicia el servidor en el puerto definido y en todas las interfaces de red disponibles
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://0.0.0.0:${PORT}`);
});