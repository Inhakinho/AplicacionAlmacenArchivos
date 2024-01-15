const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');//requerir cors
const setupSwagger = require('./swagger.js');//swagger

const app = express();
app.use(cors({
  origin: '*'
}));//permite cors intercambio de recursos cruzados para servidor 3000 http://localhost:3000

const httpServer = http.createServer(app);
const io = new Server(httpServer);

const { iniciarDatabase } = require('./database.js');
const routes = require('./routes.js');
const websocket = require('./websocket.js');

const PUERTO = 3001;

//middleware para parsear JSON
app.use(express.json());

const db = iniciarDatabase();

//usar las rutas
routes(app, db);

//inicia el websocket
websocket(io);

//usar la configuración de Swagger
setupSwagger(app);


httpServer.listen(PUERTO, () => {
  console.log(`Escuchando en el puerto ${PUERTO}...`);
});
