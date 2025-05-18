// Importa el módulo 'mysql2' que permite conectarse y trabajar con bases de datos MySQL desde Node.js
const mysql = require('mysql2');

// Configura los datos de conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: 'localhost',     // Dirección donde está la base de datos (en este caso, el mismo servidor)
  user: 'rrhhuser',      // Nombre de usuario para acceder a la base de datos
  password: 'rrhh1234',  // Contraseña del usuario
  database: 'sistema_rrhh' // Nombre de la base de datos a la que se va a conectar
});

// Intenta conectar a la base de datos con los datos proporcionados
connection.connect((err) => {
  if (err) {
    // Si ocurre un error al conectar, muestra el error por consola y termina la función
    console.error('Error al conectar a la BD:', err);
    return;
  }
  // Si la conexión es exitosa, muestra un mensaje por consola
  console.log('Conexion a la base de datos MySQL exitosa');
});

// Exporta el objeto de conexión para que pueda ser usado en otros archivos del proyecto
module.exports = connection;