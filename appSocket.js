/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
"use strict";
module.exports = {
    addSocket: function(io,MongoClient, mongodbUrl){
        var clients = [];
        var usersList = [];
        var ObjectID = require("mongodb").ObjectID;
        // var groups = [{
        //     groupName : "group1",
        //     members : ["pritesh","swapnil","gargik","anurag"],
        //     onlineMembers : []
        // },
        // {
        //     groupName : "group2",
        //     members : ["jonnathan"],
        //     onlineMembers : []
        // }];
        var findandUpdateDoc = function (db, collection, search, sort, update, isNew, callback) {
            db.collection(collection).findAndModify(search, sort, update, isNew, function (err, doc) {
                if (!err) {
                    console.log(doc);
                }
                callback(err, doc);
            });
        };
        var groups = [];
        var projectInfoCollection = "projectInfo";
        var storyCollection = "userStories";
        MongoClient.connect(mongodbUrl, function (err, db) {
            db.collection(projectInfoCollection).find().toArray(function (err, result) {
                if (err) {
                    //throw err;
                    console.log(err);
                } else {
                    console.log(result);
                    groups = result;
                    groups.forEach(function(group){
                        group.members.push(group.scrumMaster);
                        group.groupName = group._id;
                        group.onlineMembers = [];
                    });   
                }
            });
        });
        
        
        io.on("connection", function (socket) {
            console.log("a user connected");
            var req = socket.request;
            // check if session exists
            if (req.session.username) {
                usersList[req.session.username] = socket.id; // connected user with its socket.id
                clients[socket.id] = socket; // add the client data to the hash
                console.log(req.session.username + " connected with session id: " + req.session.id);
                clients[usersList[req.session.username]].emit("confirmSession", "Hello " + req.session.username + ", how've you been");
                
                // //you see that io was initially defined as the socket.io module, so we emit to all its sockets.
                // //one of the latest updates to socket.io now allows rooms/groups. for a client to join and leave a room:
                // socket.join('room1');
                // socket.leave('room1');
                // //to broadcast information to a certain room (excluding the client):
                // socket.broadcast.to('room1').emit('function', 'data1', 'data2');
                // //to broadcast information globally:
                // io.sockets.in('room1').emit('function', 'data1', 'data2');
                
                var startSocketListners = function(){
                    groups.forEach(function(group) {
                        group.members.forEach(function(member) {
                            if(member === req.session.username){
                                socket.join(group.groupName);
                                group.onlineMembers.push(req.session.username);
                                socket.broadcast.to(group.groupName).emit("online", req.session.username);
                                //io.sockets.in(group.groupName).emit("online", req.session.username);
                                socket.emit("groupOnline",group.onlineMembers);
                            }
                        });
                    });
                    
                    
                    socket.on("playCard",function (card) {
                        groups.forEach(function(group) {
                            group.members.forEach(function(member) {
                                if(member === req.session.username && new ObjectID(group._id).equals(new ObjectID(card.projectId))){
                                    io.sockets.in(group.groupName).emit("playedCard",{ "user" : req.session.username, "card": card.card, "projectId": card.projectId });
                                    //socket.emit("playedCard",group.onlineMembers);
                                }
                            });
                        });
                    });
                    
                    socket.on("showCards",function (card) {
                        groups.forEach(function(group) {
                            group.members.forEach(function(member) {
                                if(member === req.session.username && new ObjectID(group._id).equals(new ObjectID(card.projectId))){
                                    io.sockets.in(group.groupName).emit("showCard");
                                    //socket.emit("playedCard",group.onlineMembers);
                                }
                            });
                        });
                    });
                    
                    socket.on("selectStory",function (userStory) {
                        groups.forEach(function(group) {
                            group.members.forEach(function(member) {
                                if(member === req.session.username && new ObjectID(group._id).equals(new ObjectID(userStory.projectId))){
                                    io.sockets.in(group.groupName).emit("selectStory", userStory);
                                    //socket.emit("playedCard",group.onlineMembers);
                                }
                            });
                        });
                    });
                    
                    
                    socket.on("gameStart",function (project) {
                        groups.forEach(function(group) {
                            group.members.forEach(function(member) {
                                if(member === req.session.username && new ObjectID(group._id).equals(new ObjectID(project.projectId))){
                                    io.sockets.in(group.groupName).emit("gameStart", project);
                                    //socket.emit("playedCard",group.onlineMembers);
                                }
                            });
                        });
                    });
                    
                    socket.on("chatStart",function(message){
                        groups.forEach(function(group) {
                            group.members.forEach(function(member) {
                                if(member === req.session.username && new ObjectID(group._id).equals(new ObjectID(message.projectId))){
                                    io.sockets.in(group.groupName).emit("chatStart", message);
                                    //socket.emit("playedCard",group.onlineMembers);
                                }
                            });
                        });
                    });
                    
                    socket.on("chatMessage",function (message) {
                        groups.forEach(function(group) {
                            group.members.forEach(function(member) {
                                if(member === req.session.username && new ObjectID(group._id).equals(new ObjectID(message.projectId))){
                                    socket.broadcast.to(group.groupName).emit("chatMessage", message);
                                    //io.sockets.in(group.groupName).emit("chatMessage",message);
                                    //socket.emit("playedCard",group.onlineMembers);
                                }
                            });
                        });
                    });
                    
                    //{ storyId: selectedStory._id, "projectId" : $scope.selectedProject._id , "storyPoints" : item.storyPoints }
                    socket.on("saveStoryPoint", function(message){
                        MongoClient.connect(mongodbUrl, function (err, db) {
                            if (!err) {
                                findandUpdateDoc(db, storyCollection, { "_id": new ObjectID(message.storyId) },
                                    [], // represents a sort order if multiple matches
                                    { $set: { storyPoints : message.storyPoints } }, // update statement
                                    { new: true }, // options - new to return the modified document
                                    function (error, doc) {
                                        if(!error){
                                            console.log(doc.value);
                                            groups.forEach(function(group) {
                                                group.members.forEach(function(member) {
                                                    if(member === req.session.username && new ObjectID(group._id).equals(new ObjectID(message.projectId))){
                                                        socket.broadcast.to(group.groupName).emit("saveStoryPoint",message);
                                                        //io.sockets.in(group.groupName).emit("chatMessage",message);
                                                        //socket.emit("playedCard",group.onlineMembers);
                                                    }
                                                });
                                            });
                                            db.close();
                                            //res.send(doc);
                                        }else{
                                            console.log(error);
                                        }
                                    });
                            } else {
                                console.log(err);
                            }
                        });
                    });
                };

                MongoClient.connect(mongodbUrl, function (err, db) {
                    db.collection(projectInfoCollection).find().toArray(function (err, result) {
                        if (err) {
                            //throw err;
                            console.log(err);
                        } else {
                            console.log(result);
                            var i=0,j=0;
                            for(i=0;i<result.length;i++){
                                var isProjectAdded = false;
                                for(j=0;j<groups.length;j++){
                                    if(new ObjectID(result[i]._id).equals(new ObjectID(groups[j]._id))){
                                        groups[j].members = result[i].members;
                                        groups[j].members.push(result[i].scrumMaster);
                                        isProjectAdded = true;
                                    }
                                }
                                if(!isProjectAdded){
                                    result[i].members.push(result[i].scrumMaster);
                                    result[i].groupName = result[i]._id;
                                    result[i].onlineMembers = [];
                                    groups.push(result[i]);
                                }
                            }   
                            startSocketListners();
                        }
                    });
                });
    
                    //io.emit("broadcast" , "Hello Everyone.");
            } else {
                console.log("an unknown user started session");
            }

            socket.on("startSession", function (msg) {
                console.log("message: " + msg);
            });

            socket.on("disconnect", function() {
                var req = socket.request;
                
                if(req.session.username) {
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
                    console.log("unknowon user disconnected");
                }
            });
        });
    }
};
