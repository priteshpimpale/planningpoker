/* jshint node: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
"use strict";
module.exports = {
    addRoutes: function(app,MongoClient,mongodbUrl){
        
        var userCollection = "users";
        var sess;
        var insertDoc = function(db, data, callback) {
            db.collection(userCollection).insertOne(data, function(err, result) {
                console.log("Inserted a document into the " + userCollection + " collection." + result);
                callback();
            });
        };
        
        /// Add new user 
        app.post("/api/user", function (req, res) {
            var user = req.body;
            user._id = req.body.username;
            // console.log(user);
            MongoClient.connect(mongodbUrl, function(err, db) {
                if(!err){
                    insertDoc(db, user, function() {
                        /// return inserted user object
                        db.collection(userCollection).find(user).toArray(function(err, result) {
                            db.close(); 
                            if (err) {
                                //throw err;
                                console.log(err);
                                res.send(err);
                            }else{
                                // console.log(result); 
                                sess = req.session;
                                sess.user = result; //set complete user object
                                sess.username = result.username; // set userName  
                                res.send(result[0]);
                            }
                        });
                    });
                }
            });
        });

        /// Update User 
        app.patch("/api/user", function (req, res) {
            res.send(req.body);
        });

        /// Login User 
        app.post("/api/userlogin", function (req, res) {
            // console.log(req.body);
            if (req.body.username) {
                MongoClient.connect(mongodbUrl, function(err, db) {
                    if (err) {
                        throw err;
                    }
                    db.collection(userCollection).findOne(req.body,function(err, result) {
                        if (err) {
                            console.log(err);
                            res.send(err);
                            //throw err;
                        }else{
                            // console.log(result); 
                            if(result !== null){
                                sess = req.session;
                                sess.user = result; // set userName ///body.rows[0].value;
                                sess.username = result.username;//set complete user object  ///body.rows[0].value.username;
                                res.send(result);
                            }
                            else{
                                res.send({ "result": "login failed" });
                            }
                        }
                    });
                });
            } else if (req.body.usernameCookie) {
                sess = req.session;
                // check if session exist
                if (sess.user && sess.user._id === req.body.usernameCookie) {
                    MongoClient.connect(mongodbUrl, function(err, db) {
                        if (err) {
                            throw err;
                        }else{
                            db.collection(userCollection).findOne( { _id : req.body.usernameCookie },function(err, result) {
                                    if (err) {
                                        throw err;
                                    }else{
                                        // console.log(result);
                                        db.close(); 
                                        if(result !== null){
                                            sess = req.session;
                                            sess.user = result; //set complete user object
                                            sess.username = result.username; // set userName  
                                            res.send(result);
                                        }
                                        else{
                                            res.send({ "result": "login failed" });
                                        }
                                    }
                                });
                        }
                    });
                } else {
                    res.send({ "result": "Session Timed out" });
                }
            }
        });
        
        app.get("/api/users",function(req,res){
            sess = req.session;
            // check if session exist
            if (sess.user) {
                MongoClient.connect(mongodbUrl, function(err, db) {
                    if (err) {
                        throw err;
                    }else{
                        
                        db.collection(userCollection).distinct("_id",function(err,result){
                             if (err) {
                                throw err;
                            }else{
                                // console.log(result);
                                db.close();
                                if(result !== null){  
                                    res.send(result);
                                }
                            }
                        });
                    }
                });
            } else {
                res.send({ "result": "Session Timed out" });
            }
        });
        
        
        /// logout user
        app.get("/api/logout", function (req, res) {
            req.session.destroy(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("/");
                }
            });
        });
    }
};
