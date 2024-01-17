<div align="center">
    <h1>App CloudminE</h1>
    <h2>Back Api servidor + Front React appweb</h2>
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000&style=flat-square">
    <img src="https://img.shields.io/badge/Node.js-393?logo=nodedotjs&logoColor=fff&style=flat-square">
    <img src="https://img.shields.io/badge/Express-000?logo=express&logoColor=fff&style=plastic">
    <img src="https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=fff&style=plastic">
    <br>
    <p>Gestor de paquetes:</p>
    <img src="https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=fff&style=plastic">
    <h3>Documentación:</h3>
    <a href="enlace-a-tu-documentacion-swagger">
        <img src="https://img.shields.io/badge/Swagger-85EA2D?logo=swagger&logoColor=000&style=plastic">
    </a>
    <br><br>
    <img src="https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=000&style=flat-square">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000&style=flat-square">
    <img src="https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=fff&style=plastic">
    <img src="https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=fff&style=plastic">
</div>

## Resumen
Esta es una simple API que crea un servidor utilizando Node.js con Express.js. Cuenta con un Login o sistema de inicio de sesión y entre sus usos destaca por la gestión de archivos: 
Permite almacenar, subiendo archivos, listarlos, borrar o descargar estos y todo esto se registra en una BBDD en SQlite 3.0. Y los archivos son almacenados en una carpeta local.
## Instrucciones de Uso

### Configuración del Entorno
1. Asegúrate de tener [Node.js](https://nodejs.org/) y npm instalados.
2. Clona el repositorio:
`git clone https://github.com/Inhakinho/AplicacionAlmacenArchivos.git`
3. Instala las dependencias:
`cd ruta carpeta donde lo has clonado`
`npm install`

### Ejecución del Servidor
Para ejecutar el servidor, usa el siguiente comando:
`npm start`
o
`nodemon app.js`

El servidor se iniciará en [http://localhost:3001](http://localhost:3001).

### Ejecución del Frontend
La app se iniciará en [http://localhost:3000](http://localhost:3000).
Para iniciar la aplicación React, navega al directorio del frontend y ejecuta:
`npm start`

La aplicación se abrirá automáticamente en tu navegador.

## Usuarios Predefinidos
La aplicación viene con tres usuarios predefinidos que puedes usar para probar:
- Usuario 1: admin | Contraseña: 12345 | Rol: admin
- Usuario 2: David | Contraseña: admin | Rol: admin
- Usuario 3: Iñaki | Contraseña: 7777777 | Rol: user

## Carga de Archivos
Para subir archivos, sigue estos pasos:
1. Inicia sesión con uno de los usuarios predefinidos.
2. Navega a la sección de carga de archivos.
3. Selecciona los archivos que desees subir.
4. Confirma la carga y espera la respuesta del servidor.

## Contribuciones o Donaciones
Si deseas contribuir a este proyecto, por favor sigue las [guías de contribución](https://streamelements.com/inhakinho/tip).

## Autor
[Iñaki Baulde Acha](https://github.com/inhakinho)

