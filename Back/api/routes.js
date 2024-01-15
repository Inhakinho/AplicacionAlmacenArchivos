const express = require('express'); // No olvides requerir express
const bcrypt = require('bcrypt'); // Asegúrate de tener bcrypt requerido para comparar contraseñas
const multer = require('multer');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');//jason web token
const fetch = require('node-fetch');//hacer llamadas a otras apis //version 2 para poder usar require

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
    destination: './subidas',
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 8 * 1024 * 1024 * 1024 } // 8 GB de peso de archivos
});

//funcion crear LLave secreta
function generateSecretKey(length) {
  let result = '';
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const tamañoCaracteres = caracteres.length;
  for (let i = 0; i < length; i++) {
    result += caracteres.charAt(Math.floor(Math.random() * tamañoCaracteres));
  }
  return result;
}

//generar la llave
const secret_key = generateSecretKey(20); // Genera una clave secreta de 20 caracteres

module.exports = function(app, db) {
  //middleware para parsear el cuerpo de las peticiones JSON
  app.use(express.json());
  //mostrar la primera pagina
  app.get('/', (req, res) => {
    const urlarchivos = '/archivos';
    const enlaceArchivos = `<a href="${urlarchivos}">Ver archivos</a>`;
    res.send(
    `<html>
    <head>
      <title>DEMO API</title>
    </head>
    <body>
      <h1>DEMO API /Almacenar archivos y registrarlos en su BBDD.</h1>
      <h3>Para cargar un archivo:</h3>
      <p>Envía una solicitud POST a /subir-archivo con la key "subir".</p>
      <h3>Para ver los archivos almacenados:</h3>
      <p>Envía una solicitud GET a /archivos o desde este enlace: ${enlaceArchivos}</p>
      <h3>Si quieres volver a descargar algún archivo que subiste:</h3>
      <p>Envía una solicitud GET a /descargar/"id del archivo a descargar"</p>
    </body>
    </html>`
    );
  });


  //crear middleware para verficar token
  function verifyToken(req, res, next) {
    //obtener token del encabezado de la solicitud
    const encabezadoAutorizacion = req.headers['authorization'] || req.headers['Authorization'];
  
    //verifica si el token esta presente
    if (typeof encabezadoAutorizacion !== 'undefined') {
      const token = encabezadoAutorizacion.split(' ')[1]; //dividir el encabezado para obtener el token
  
      //verifica el token
      jwt.verify(token, secret_key, (err, authData) => {
        if (err) {
          res.sendStatus(403); //token invalido o expirado
        } 
        else {
          req.user = authData; //guarda los datos autenticados del token en req.user
          next(); //continúa con la ruta siguiente
        }
      });
    } 
    else {
      res.sendStatus(403); //no hay token pone acceso prohibido
    }
  }

  //funcion para dar formato la fecha actual
  function formatearFecha() {
    const fechaActual = new Date();
    const ano = fechaActual.getFullYear();//año en formato yyyy.
    const mes = (fechaActual.getMonth() + 1).toString().padStart(2, '0'); //devuelve el mes del año (0-11),+1
    const dia = fechaActual.getDate().toString().padStart(2, '0');//devuelve el día del mes del 1-31
    const hora = fechaActual.getHours().toString().padStart(2, '0');//devuelve la hora del día de 0-23
    const minuto = fechaActual.getMinutes().toString().padStart(2, '0');//devuelve los minutos de 0-59

    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  }


  //subir cada archivo endpoint
  app.post('/subir-archivo', verifyToken, upload.array('subir', 10), async (req, res) => {
    const archivosCargados = req.files;
    const username = req.user.username; //obtiene el nombre del usuario del token decodificado
    const fechaActual = formatearFecha();//obtener la fecha actual formateada

    if (archivosCargados.length === 0) {
        return res.status(400).json({ error: 'No se han seleccionado archivos' });
    }

    archivosCargados.forEach(archivo => {
        const nombreArchivoOriginal = archivo.originalname;

        //si ya existe un archivo con el mismo nombre
        db.get('SELECT * FROM archivos WHERE nombre = ?', [nombreArchivoOriginal], (error, archivoExistente) => {
            if (error) {
                console.error('Error al buscar archivo:', error.message);
                return res.status(500).json({ error: 'Error al buscar archivo' });
            }

            if (archivoExistente) {
              //si existe actualiza updatedby y fecha y el tamaño 
              db.run('UPDATE archivos SET updatedby = ?, tamaño = ?, updatedfecha = ? WHERE nombre = ?', 
                  [username, archivo.size, fechaActual, nombreArchivoOriginal], error => {
                    if (error) {
                        console.error('Error al actualizar archivo:', error.message);
                        return res.status(500).json({ error: 'Error al actualizar archivo' });
                    }
              });

            } 
            else {
              //no existe inserta uno nuevo
              db.run('INSERT INTO archivos (uuid, nombre, tipo, tamaño, createdby, updatedby, createdfecha, updatedfecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                  [uuidv4(), nombreArchivoOriginal, archivo.mimetype, archivo.size, username, "Sin Actualizar", fechaActual, "-"],
                    error => {
                      if (error) {
                        console.error('Error al insertar archivo:', error.message);
                        return res.status(500).json({ error: 'Error al insertar archivo' });
                      }
                    }
              );
            }
        });
    });

    try {
      //chiste de Chuck Norris
      const responseChiste = await fetch('https://api.chucknorris.io/jokes/random');
      const dataChiste = await responseChiste.json();
      let chiste = dataChiste.value;

      //api de traducción
      const url = 'https://text-translator2.p.rapidapi.com/translate';
      const options = {
          method: 'POST',
          headers: {
              'content-type': 'application/x-www-form-urlencoded',
              'X-RapidAPI-Key': '26af48c205mshf96171568d80a4ep1697a3jsn5be9b4df38d4',
              'X-RapidAPI-Host': 'text-translator2.p.rapidapi.com'
          },
          body: new URLSearchParams({
              source_language: 'en',
              target_language: 'es',
              text: chiste
          })
      };

      //traducion
      const responseTraduccion = await fetch(url, options);
      const resultadoTraduccion = await responseTraduccion.json();
      console.log("Respuesta de la api:", resultadoTraduccion);

      let chisteTraducido = resultadoTraduccion.data.translatedText;

      //responder con el chiste traducido
      res.status(200).json({ mensaje: 'Archivos subidos con éxito', chiste: chisteTraducido});
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
    
  });

  //para ver todos los archivos
  app.get('/archivos', (req, res) => {
    //consulta a la base de datos para obtener todos los archivos
    db.all('SELECT * FROM archivos', (error, archivos) => {
      if(error) {
        console.error('Error al revisar archivos de la base de datos:', error.message);
        return res.status(500).json({ error: 'Error al revisar archivos de la base de datos' });
      }
      //si no hay archivos
      else if(archivos.length === 0) {
        //muestra JSON vacio en vez de mensaje de texto
        return res.status(200).json({ message: 'La carpeta de archivos está vacía', archivos: [] });
      }
  
      //muestra los archivos obtenidos
      res.status(200).json(archivos);
    });

  });

  //descargar por UUID
  app.get('/descargar/:uuid', (req, res) => {
    //obtener el id
    const archivoId = req.params.uuid;

    //base de datos para obtener información sobre el archivo
    db.get('SELECT * FROM archivos WHERE uuid = ?', [archivoId], (error, archivo) => {
      if (error) {
        console.error('Error al obtener información del archivo:', error.message);
        return res.status(500).json({ error: 'Error al obtener información del archivo' });
      }

      if (!archivo) {
        return res.status(404).json({ error: 'Archivo no encontrado con ese ID' });
      }

      //ruta del archivo en la carpeta de subidas
      const archivoRuta = `./subidas/${archivo.nombre}`;

      //configurar el encabezado Content-Disposition para forzar la descarga del archivo
      res.setHeader('Content-Disposition', `attachment; filename="${archivo.nombre}"`);

      //devulve el archhivo omo una descarga 
      res.sendFile(path.resolve(archivoRuta));

    });
  });

  //eliminar un archivo (Método DELETE)por UUID
  app.delete('/archivos/:uuid', (req, res) => {
    const idArchivo = req.params.uuid;

    //consulto la base de datos para identificar el uuid
    db.get('SELECT * FROM archivos WHERE uuid = ?', [idArchivo], (error, archivo) => {
      if (error) {
      console.error('Error al buscar el archivo en la base de datos: ', error.message);
      return res.status(500).json({ error: 'Error al buscar el archivo en la base de datos' });
      }

      if (!archivo) {
        return res.status(404).json({ error: 'Archivo no encontrado, no existe ningun archivo con esa ID' });
      }

      //buscar el nomrbe
      const nombreArchivo = archivo.nombre;

      //eliminar del local de subidas
      const rutaArchivo = `./subidas/${nombreArchivo}`;
      fs.unlink(rutaArchivo, (error) => {
        if (error) {
        console.error('Error al eliminar el archivo:', error.message);
        return res.status(500).json({ error: 'Error al eliminar el archivo' });
        }

        //despues eliminar el registro de la bd
        db.run('DELETE FROM archivos WHERE uuid = ?', [idArchivo], (error) => {
          if (error) {
            console.error('Error al eliminar el archivo de la base de datos:', error.message);
            return res.status(500).json({ error: 'Error al eliminar el archivo de la base de datos' });
          }

          //mensaje de exito
          res.json({ mensaje: 'Archivo eliminado' });
        });

      });

    });

  });

  //login endpoint
  app.post('/login', (req, res) => {
    const { usuario, contraseña } = req.body;//usuario y contraseña 

    //obtine el usuario de la BBDD
    db.get('SELECT * FROM usuarios WHERE nombre_usuario = ?', [usuario], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }
        if (!user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        //compara con el hash almacenado
        bcrypt.compare(contraseña, user.contraseña, (err, result) => {
            if (result) {
                //si la contraseña coincide
                //genera un token con una clave secreta y una duración
                const token = jwt.sign({ username: user.nombre_usuario, role: user.rol }, secret_key, { expiresIn: '2h' });
                res.json({ autenticado: true, token: token, rol: user.rol});
            } else {
                //si la contraseña no coincide
                res.status(401).json({ autenticado: false, error: 'Contraseña incorrecta' });
            }
        });
    });
  });





};


