const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

//funcion para crear los usuarios administrador, David, Iñaki
const crearUsuarios = (db) => {
  const usuarios = [
    { usuario: "admin", contraseña: "12345", email: "admin@plexus.com", rol: "admin" },
    { usuario: "David", contraseña: "admin", email: "david@plexus.com", rol: "admin" },
    { usuario: "Iñaki", contraseña: "7777777", email: "inaki@plexus.com", rol: "user" }
  ];

  usuarios.forEach(user => {
    //genra un salt aletatorio y concatena el salt con contraseña, y aplicas funcion hash y se almacena el hash sitio de contraseña y el salt.
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        console.error('Error al generar el salt:', err);
        return;
      }
      bcrypt.hash(user.contraseña, salt, function(err, hash) {
        if (err) {
          console.error('Error al generar el hash:', err);
          return;
        }
        // Insertar el usuario en la base de datos
        db.run('INSERT OR IGNORE INTO usuarios (uuid, nombre_usuario, email, contraseña, salt, rol) VALUES (?, ?, ?, ?, ?, ?)',
          [uuidv4(), user.usuario, user.email, hash, salt, user.rol], function(error) {
            if (error) {
              console.error(`Error al insertar el usuario ${user.usuario}:`, error.message);
            } else {
              console.log(`Usuario ${user.usuario} creado con éxito`);
            }
          });
      });
    });
  });
};

//conexión a la base de datos SQLite y creación de tablas
const iniciarDatabase = () => {
  const db = new sqlite3.Database('./datos/basededatos.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
    if (error) {
      console.error('Error al conectar a la base de datos:', error.message);
    } else {
      console.log('Conectado a la base de datos SQLite');
      db.serialize(() => {
        //tabla de archivos
        db.run(`CREATE TABLE IF NOT EXISTS archivos(
          uuid TEXT PRIMARY KEY,
          nombre TEXT,
          tipo TEXT,
          tamaño INTEGER,
          createdby TEXT,
          updatedby TEXT,
          createdfecha TEXT,
          updatedfecha TEXT)`, (error) => {
          if (error) {
            console.error('Error al crear la tabla "archivos":', error.message);
          } else {
            console.log('Tabla "archivos" creada con éxito');
          }
        });

        //tabla de usuarios
        db.run(`CREATE TABLE IF NOT EXISTS usuarios(
          uuid TEXT PRIMARY KEY,
          nombre_usuario TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          contraseña TEXT NOT NULL,
          salt TEXT NOT NULL,
          rol TEXT NOT NULL
        )`, (error) => {
          if (error) {
            console.error('Error al crear la tabla "usuarios":', error.message);
          } else {
            console.log('Tabla "usuarios" creada con éxito');
            //crear usuarios una vez creada la tabla
            crearUsuarios(db);
          }
        });

      });

    }

  });

  return db;
};

module.exports = { iniciarDatabase };
