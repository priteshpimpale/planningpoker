module.exports = {
    addSocket: function(io,mongo){
        var clients = [];
        var usersList = [];
        io.on('connection', function (socket) {
            console.log('a user connected');

            socket.on('startSession', function (msg) {
                console.log('message: ' + msg);
                var req = socket.request;
                if (req.session) {
                    usersList[req.session.username] = socket.id; // connected user with its socket.id
                    clients[socket.id] = socket; // add the client data to the hash
                    console.log(req.session.username + ' connected with session id: ' + req.session.id);
                    clients[usersList[req.session.username]].emit('startSession', "Hello " + req.session.username + ", how've you been");
                } else {
                    console.log('an unknown user started session');
                }
            });

            socket.on('disconnect', function () {
                var req = socket.request;
                if (req.session) {
                    delete clients[socket.id]; // remove the client from the array
                    delete usersList[req.session.username]; // remove connected user & socket.id
                    console.log(req.session.username + " disconnected");
                } else {
                    console.log('unknowon user disconnected');
                }

            });
        });
    }
};