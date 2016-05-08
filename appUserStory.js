module.exports = {
    addRoutes: function (app, MongoClient, mongodbUrl) {
        var bodyParser = require("body-parser");
        app.use(bodyParser.json());
        var storyCollection = "userStories",
            projectInfoCollection = "projectInfo";

        var insertDoc = function (collection, db, data, callback) {
            db.collection(collection).insertOne(data, function (err, result) {
                if(!err){
                    console.log("Inserted a document into the " + storyCollection + " collection.");
                    callback(err,result);
                }else{
                    callback(err,result);
                }
            });
        };
        
        /********** modify urls as required ****************** */
        //// all secured request must be inside session 
        app.get("/api/stories/{project}", function (req, res) {
            if(req.session){
                var sess = req.session,
                    project = req.params.project,
                    userStories = [];
                MongoClient.connect(mongodbUrl, function (err, db) {
                    if (!err) {
                        /// return inserted user object
                        db.collection(projectInfoCollection).find({ project: project.project }).toArray(function (err, result) {
                            if (err) {
                                //throw err;
                                console.log(err);
                            } else {
                                console.log(result);
                                var userStoriesIdsArr = result.userStories;
                            };
                            userStoriesIdsArr.forEach(function (i) {
                                db.collection(storyCollection).find({ _id: userStoriesIdsArr[i] }, function (err, result) {
                                    if (!err) {
                                        userStories.push(result);
                                    }
                                    else {
                                        console.log(err);
                                    }
                                });
                                res.send(userStories);
                            });

                        });
                    }
                });
                //res.send(JSON.stringify(userStories))
            }else{
                res.send({"result" : "invalid session"});
            }
        });

        app.post("/api/story", function (req, res) {
            if(req.session){
                var sess = req.session;
                var story = req.body.story;
                story.game = [];
                story.storyPoints = 0;
                var project = req.body.project;
                MongoClient.connect(mongodbUrl, function (err, db) {
                    if (!err) {
                        insertDoc(storyCollection, db, story, function () {
                            /// return inserted user object
                            db.collection(storyCollection).find({ _id: story._id }).toArray(function (err, result) {
                                db.close();
                                if (err) {
                                    //throw err;
                                    console.log(err);
                                    res.send(err);
                                } else {
                                    console.log(result);
                                    //if (sess.user) {
                                        res.send(result);
                                    // } else {
                                    //     res.send({ "result": "Session Timed out" });
                                    // }
                                }
                            });

                        });

                        db.collection(projectInfoCollection).update(
                            { project: project.project },
                            { $push: { userStories: story._id } },
                            function (err, object) {
                                if (err) {
                                    console.warn(err.message);
                                } else {
                                    console.log("project updated!");
                                }
                            });


                    }
                });
            }else{
                res.send({"result" : "invalid session"});
            }    
        });

        // check if session exists
        app.post("/api/project", function (req, res) {
            console.log(req.body);
            var project = req.body;
            if(req.session){
                var sess = req.session;
                project.scrumMaster = sess.username;
                project.members = [];
                project.userStories = [];
                MongoClient.connect(mongodbUrl, function (err, db) {
                    if (!err) {
                        insertDoc(projectInfoCollection, db, project, function (err,result) {
                            /// return inserted user object
                            if(!err){
                                console.log(result);
                                res.send(JSON.stringify(result.ops[0]));
                                // db.collection(storyCollection).find({ project: project.project }).toArray(function (err, result) {
                                //     db.close();
                                //     if (err) {
                                //         //throw err;
                                //         console.log(err);
                                //         res.send(err);
                                //     } else {
                                //         console.log(result);
                                //         if (sess.user) {
                                //             res.send(JSON.stringify(result));
                                //         } else {
                                //             res.send({ "result": "Session Timed out" });
                                //         }
                                //     }
                                // });
                            }

                        });
                    }
                });
            }else{
                res.send({"result" : "invalid session"});
            }
        });
        
         app.get("/api/projects", function (req, res) {
            if(req.session){
            var sess = req.session,
                userName = req.session.username,
                role = req.session.user.role;
                if(role === "Scrum Master"){
                    MongoClient.connect(mongodbUrl, function (err, db) {
                    db.collection(projectInfoCollection).find({ scrumMaster: userName }).toArray(function (err, result) {
                            if (err) {
                                //throw err;
                                console.log(err);
                                res.send(err);
                            } else {
                                console.log(result);
                                //if (sess.user) {
                                    res.send(result);
                                // } else {
                                //     res.send({ "result": "Session Timed out" });
                                // }
                            }
                        });
                    });
                }
                else if(role==="developer"){
                    MongoClient.connect(mongodbUrl, function (err, db) {
                    db.collection(projectInfoCollection).find({ members: { $elemMatch: userName}}).toArray(function (err, result) {
                            if (err) {
                                //throw err;
                                console.log(err);
                                res.send(err);
                            } else {
                                console.log(result);
                                if (sess.user) {
                                    res.send(JSON.stringify(result));
                                } else {
                                    res.send({ "result": "Session Timed out" });
                                }
                            }
                        });
                    });
                    
                    
                }
            }else{
                res.send({"result" : "invalid session"});
            }
        });
    
    
    }
}