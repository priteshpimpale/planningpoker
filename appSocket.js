module.exports = {
    addSocket: function(io,MongoClient, mongodbUrl){
        var clients = [];
        var usersList = [];
        var groups = [{
            groupName : "group1",
            members : ["pritesh","swapnil","gargik"],
            onlineMembers : []
        },
        {
            groupName : "group2",
            members : ["jonnathan"],
            onlineMembers : []
        }];
        io.on('connection', function (socket) {
            console.log('a user connected');
            var req = socket.request;
            if (req.session) {
                usersList[req.session.username] = socket.id; // connected user with its socket.id
                clients[socket.id] = socket; // add the client data to the hash
                console.log(req.session.username + ' connected with session id: ' + req.session.id);
                clients[usersList[req.session.username]].emit('confirmSession', "Hello " + req.session.username + ", how've you been");
                
                // //you see that io was initially defined as the socket.io module, so we emit to all its sockets.
                // //one of the latest updates to socket.io now allows rooms/groups. for a client to join and leave a room:
                // socket.join('room1');
                // socket.leave('room1');
                // //to broadcast information to a certain room (excluding the client):
                // socket.broadcast.to('room1').emit('function', 'data1', 'data2');
                // //to broadcast information globally:
                // io.sockets.in('room1').emit('function', 'data1', 'data2');
                
                groups.forEach(function(group) {
                    group.members.forEach(function(member) {
                        if(member === req.session.username){
                            socket.join(group.groupName);
                            group.onlineMembers.push(req.session.username);
                            //socket.broadcast.to(group.groupName).emit("online", req.session.username);
                            io.sockets.in(group.groupName).emit("online", req.session.username);
                            socket.emit("groupOnline",group.onlineMembers);
                        }
                    });
                });
                
                //io.emit("broadcast" , "Hello Everyone.");
            } else {
                console.log('an unknown user started session');
            }

            socket.on('startSession', function (msg) {
                console.log('message: ' + msg);
            });

            socket.on('disconnect', function() {
                var req = socket.request;
                
                if(req.session) {
                    delete clients[socket.id]; // remove the client from the array
                    delete usersList[req.session.username]; // remove connected user & socket.id
                    console.log(req.session.username + " disconnected");
                    var socUser = req.session.username;
                    groups.forEach(function(group) {
                        group.members.forEach(function(member) {
                            if(member === socUser){
                                io.sockets.in(group.groupName).emit("offline", socUser);
                                socket.leave(group.groupName);
                                group.onlineMembers.splice(group.onlineMembers.indexOf(socUser),1) ;
                                //socket.broadcast.to(group.groupName).emit("online", req.session.username);
                                socket.emit("groupOnline",group.onlineMembers);
                            }
                        });
                    });
                    
                } else {
                    console.log('unknowon user disconnected');
                }
                
                // remove user from onlineMembers

            });
        });
    }
};