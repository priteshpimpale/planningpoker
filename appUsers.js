module.exports = {
    addRoutes: function(app,MongoClient,mongodbUrl){
        /********* Add new user ******** */
        var userCollection = "users";
        
        var insertDoc = function(db, data, callback) {
            db.collection(userCollection).insertOne(data, function(err, result) {
                
                console.log("Inserted a document into the " + userCollection + " collection.");
                callback();
            });
        };
        
        app.post('/api/user', function (req, res) {
            var user = req.body;
            console.log(user);
            MongoClient.connect(mongodbUrl, function(err, db) {
                if(!err){
                    insertDoc(db, user, function() {
                        db.collection(userCollection).find(user).toArray(function(err, result) {
                        if (err) {
                        throw err;
                        }else{
                            console.log(result);
                            db.close();
                            res.send(result[0]);
                            //// inside callback of mongo 
                            // sess = req.session;
                            // sess.user =  // set userName ///body.rows[0].value;
                            // sess.username = //set complete user object  ///body.rows[0].value.username;
                            // res.send(/* complete user object */);
                
                        }
                    });
                        
                        
                        //db.close(); 
                        //res.send({"result" : "insert successfull" });
                    });
                }
            });
            
            //res.send(req.body);
        });

        /********** Update User ****************** */
        app.patch("/api/user", function (req, res) {
            var user = req.body;
            res.send(req.body);
        });

        /************* Login User ************************** */
        app.post('/api/userlogin', function (req, res) {
            console.log(req.body);
            if (req.body.username) {
                
                MongoClient.connect(mongodbUrl, function(err, db) {
                    if (err) {
                        throw err;
                    }
                    db.collection('users').findOne(req.body,function(err, result) {
                        if (err) {
                        throw err;
                        }else{
                            console.log(result);
                            //// inside callback of mongo 
                            sess = req.session;
                            sess.user = result; // set userName ///body.rows[0].value;
                            sess.username = result.username;//set complete user object  ///body.rows[0].value.username;
                            res.send(result);
                
                        }
                    });
                });
                
                ///////

            } else if (req.body.usernameCookie) {
                sess = req.session;
                // check if session exist
                if (sess.user && sess.user._id === req.body.usernameCookie) {
                    //// inside callback of mongo 
                    res.send(/* complete user object */);
                    ////
                } else {
                    res.send({ "result": "Session Timed out" });
                }
            }
        });

        app.get('/api/logout', function (req, res) {
            req.session.destroy(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/');
                }
            });
        });
    }
};