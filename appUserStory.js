/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
"use strict";
module.exports = {
    addRoutes: function (app, MongoClient, mongodbUrl) {
        var bodyParser = require("body-parser");
        app.use(bodyParser.json());
        var ObjectID = require("mongodb").ObjectID;
        var storyCollection = "userStories",
            projectInfoCollection = "projectInfo";

        var insertDoc = function (collection, db, data, callback) {
            db.collection(collection).insertOne(data, function (err, result) {
                if (!err) {
                    console.log("Inserted a document into the " + storyCollection + " collection.");
                    callback(err, result);
                } else {
                    callback(err, result);
                }
            });
        };

        /********** modify urls as required ****************** */
        //// all secured request must be inside session 
        // get userStories by Project
        app.get("/api/stories/:project", function (req, res) {
            if (req.session) {
                var projectId = req.params.project;
                MongoClient.connect(mongodbUrl, function (err, db) {
                    if (!err) {
                        /// return inserted user object
                        db.collection(projectInfoCollection).findOne({ _id: new ObjectID(projectId) },function (err, result) {
                            var userStoriesIdsArr;
                            if (err) {
                                //throw err;
                                console.log(err);
                            } else {
                                // console.log(result);
                                userStoriesIdsArr = result.userStories;
                            }
                            var uStoryObj = [];
                    	    userStoriesIdsArr.forEach(function (i,item){
                                uStoryObj.push(new ObjectID(item)); 
                            }); 
                            // userStoriesIdsArr.forEach(function (i) {
                            db.collection(storyCollection).find({ _id: { $in: userStoriesIdsArr } }).toArray(function (err, result) {
                                if (!err) {
                                    res.send(result);
                                }
                                else {
                                    console.log(err);
                                }
                            });
                        });
                    }
                });
                //res.send(JSON.stringify(userStories))
            } else {
                res.send({ "result": "invalid session" });
            }
        });

        // add new userStory
        app.post("/api/story", function (req, res) {
            if (req.session) {
                var story = req.body.userStory;
                story.game = [];
                story.storyPoints = -1;
                var projectId = req.body.projectId;
                MongoClient.connect(mongodbUrl, function (err, db) {
                    if (!err) {
                        insertDoc(storyCollection, db, story, function (err, result) {
                            /// return inserted user object
                            if (err) {
                                //throw err;
                                console.log(err);
                                res.send();
                            } else {
                                // console.log(result);
                                var story = result.ops[0];
                                db.collection(projectInfoCollection).update(
                                    { _id: new ObjectID(projectId) },
                                    { $push: { userStories: story._id } },
                                    function (err, object) {
                                        if (err) {
                                            console.warn(err.message);
                                        } else {
                                            console.log(object);
                                            res.send(story);
                                        }
                                });
                            }
                        });
                    }
                });
            } else {
                res.send({ "result": "invalid session" });
            }
        });

        // check if session exists
        // add new Project Name
        app.post("/api/project", function (req, res) {
            console.log(req.body);
            var project = req.body;
            if (req.session) {
                var sess = req.session;
                project.scrumMaster = sess.username;
                project.members = [];
                project.userStories = [];
                MongoClient.connect(mongodbUrl, function (err, db) {
                    if (!err) {
                        insertDoc(projectInfoCollection, db, project, function (err, result) {
                            /// return inserted user object
                            if (!err) {
                                // console.log(result);
                                res.send(JSON.stringify(result.ops[0]));
                            }

                        });
                    }
                });
            } else {
                res.send({ "result": "invalid session" });
            }
        });

        // get Projects by user/scrumMaster
        app.get("/api/projects", function (req, res) {
            if (req.session) {
                var sess = req.session,
                    userName = req.session.username,
                    role = req.session.user.role;
                if (role === "Scrum Master") {
                    MongoClient.connect(mongodbUrl, function (err, db) {
                        db.collection(projectInfoCollection).find({ scrumMaster: userName }).toArray(function (err, result) {
                            if (err) {
                                //throw err;
                                console.log(err);
                                res.send(err);
                            } else {
                                // console.log(result);
                                //if (sess.user) {
                                res.send(result);
                                // } else {
                                //     res.send({ "result": "Session Timed out" });
                                // }
                            }
                        });
                    });
                }
                else if (role === "Developer") {
                    MongoClient.connect(mongodbUrl, function (err, db) {
                        db.collection(projectInfoCollection).find({ members: { $elemMatch: { $eq : userName } } }).toArray(function (err, result) {
                            if (err) {
                                //throw err;
                                console.log(err);
                                res.send(err);
                            } else {
                                // console.log(result);
                                if (sess.user) {
                                    res.send(JSON.stringify(result));
                                } else {
                                    res.send({ "result": "Session Timed out" });
                                }
                            }
                        });
                    });
                }
            } else {
                res.send({ "result": "invalid session" });
            }
        });


        var findandUpdateDoc = function (db, collection, search, sort, update, isNew, callback) {
            db.collection(collection).findAndModify(search, sort, update, isNew, function (err, doc) {
                if (!err) {
                    // console.log(doc);
                }
                callback(err, doc);
            });
        };

        app.patch("/api/project", function (req,res) {
            console.log(req.body);
            var data = req.body;
            if (req.session) {
                MongoClient.connect(mongodbUrl, function (err, db) {
                    if (!err) {
                        findandUpdateDoc(db, projectInfoCollection, { "_id": new ObjectID(data._id) },
                            [], // represents a sort order if multiple matches
                            { $set: { members : data.members } }, // update statement
                            { new: true }, // options - new to return the modified document
                            function (error, doc) {
                                console.log(error);
                                res.send(doc.value);
                                // if(!error){
                                //     db.collection(projectInfoCollection).findOne( { _id : new ObjectID(data._id)},function (er, result) {
                                //         if (er) {
                                //             //throw err;
                                //             console.log(er);
                                //             res.send();
                                //         } else {
                                //             console.log(result);
                                //             res.send(result);
                                //         }
                                //     });
                                    
                                    
                                    
                                    
                                //     db.close();
                                //     //res.send(doc);
                                // }else{
                                //     console.log(error);
                                // }
                                
                            });
                    } else {

                    }
                });

            } else {
                res.send({ "result": "invalid session" });
            }
        });

    }
};
