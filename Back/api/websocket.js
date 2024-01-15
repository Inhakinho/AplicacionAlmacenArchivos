module.exports = function(io) {
  io.on('connection', (socket) => {
      console.log('Un cliente se ha conectado');

      socket.on('message', (data) => {
          console.log('Mensaje recibido:', data);
      });

      socket.on('disconnect', () => {
          console.log('Un cliente se ha desconectado');
      });
  });
};
